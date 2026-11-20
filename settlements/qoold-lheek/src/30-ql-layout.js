/* ================================================================= QOOLD LHEEK: the Yeti capital's layout  [G data]
   Capital of Khaay Qantir (the Yeti Kingdom, culture `khaayken`), scale-model 5.1 pin `s427qb1kma` (px 410, py 506).
   No THREE, no DOM, no random draws: Node tests, qoold_blueprint.py, the sim and Godot read the same plain data.

   Why the town stands where it does on the 5.1 map:
     - Cold Lake (`basins.json` [410.2, 510.3]) lies at 5,680.41 m, 448 km2 (60 x 15 km NE-SW), 159 m deep, frozen
       7-8 months a year. Along most of its NW shore an unbroken ~350 m impactite bluff drops from the 6,020-6,060 m
       bench to the water.
     - Right past the pin (410, 506), `Musiq Quli` (`r466`, 25 km, 0.4 m3/s, joined by `Litl Paayar Quli` `r855`,
       0.2 m3/s) carves a SE-trending coulee notch (410.2, 508.3 — carrying baked high-grade gold and tin placers and
       saltpeter on `impact` province ground) and builds a coarse impactite-gravel fan and lateral-moraine terrace
       staircase down to Cold Lake at (411.4, 508.1).
     - At 27.8 deg S, the midday sun is in the NORTH (0 deg bearing). Where Musiq Quli cuts NW -> SE:
         * its SW right-bank moraine amphitheatre tilts NNE (015-035 deg) into the northern sun, sheltered from the
           300 deg WNW katabatic Outer Wall gales by the West Watch Brow: here stand the rock-walled snow-potato
           (`isnoo-pa'a`) heat pockets, gravity-leat sweetroot (`isiit`) terraces, and the thaw-stable gravel benches
           of the State Heart and Six Clan Wards (`kilenler`);
         * its NE left-bank wall faces SSW (215 deg) into deep winter shade: holding snowpack, the coppiced `furlarch`
           timber/sawdust stand, and the -10 C permafrost ice cellars;
         * at the creek's mouth, winter river-icing (`aufeis`) meets 1.4 m black lake ice beside larch sawdust from the
           shaded bank, powering the capital's Lake Ice Quarries and Pycrete Works.

   Frame:
     origin  the Quunsul Crown terrace at px 411.4, py 508.1 (3.5 km SE of the 2-km-grid pin [410, 506] down Musiq Quli)
     u       metres EAST (+x, right on every sheet)
     v       metres NORTH (-z, UP on every sheet -> TRUE NORTH = THE MIDDAY SUN at 27.8 deg S)
     y       metres above Cold Lake's 5,680.41 m surface (y = 0 is lake ice; Crown stands at y = +22.0 m = 5,702.4 m ASL) */
const QOOLD_LAYOUT = (function () {
  'use strict';

  /* Exact footprints (w, d, h) and covered-tunnel mouths from kits/yeti/src/50..66 */
  const KIT = {
    yt_dome:            { w: 8.81,  d: 12.46, h: 5.25,  mouth: 4.98,  heated: true,  role: 'dwelling' },
    yt_travel_dome:     { w: 7.43,  d: 9.88,  h: 4.45,  mouth: 3.69,  heated: true,  role: 'dwelling' },
    yt_stone_dome:      { w: 9.82,  d: 13.67, h: 6.58,  mouth: 5.58,  heated: true,  role: 'dwelling' },
    yt_family_cluster:  { w: 20.26, d: 12.46, h: 5.25,  mouth: 4.98,  heated: true,  role: 'dwelling' },
    yt_composite_house: { w: 21.32, d: 14.85, h: 6.58,  mouth: 5.58,  heated: true,  role: 'dwelling' },
    yt_clan_compound:   { w: 23.34, d: 15.74, h: 7.88,  mouth: 6.60,  heated: true,  role: 'clan' },
    yt_balagan:         { w: 10.11, d: 10.68, h: 4.94,  mouth: null,  heated: true,  role: 'dwelling' },
    yt_winter_street:   { w: 70.20, d: 40.95, h: 7.00,  mouth: 20.48, heated: true,  role: 'street' },
    yt_quunsul_hall:    { w: 16.70, d: 21.15, h: 11.26, mouth: 9.32,  heated: true,  role: 'council' },
    yt_chief_hall:      { w: 26.00, d: 18.75, h: 10.22, mouth: 8.13,  heated: true,  role: 'chief' },
    yt_song_house:      { w: 14.72, d: 18.57, h: 8.10,  mouth: 8.03,  heated: true,  role: 'song_house' },
    yt_shrine:          { w: 9.50,  d: 12.95, h: 6.58,  mouth: 5.23,  heated: false, role: 'shrine' },
    yt_clan_tomb:       { w: 9.00,  d: 9.50,  h: 3.40,  mouth: null,  heated: false, role: 'tomb' },
    yt_bathhouse:       { w: 11.50, d: 15.35, h: 7.36,  mouth: 6.43,  heated: true,  role: 'bath' },
    yt_smithy:          { w: 10.70, d: 14.55, h: 7.10,  mouth: 6.03,  heated: true,  role: 'smithy' },
    yt_kitchen_house:   { w: 10.30, d: 13.95, h: 6.84,  mouth: 5.72,  heated: true,  role: 'kitchen' },
    yt_tannery:         { w: 9.52,  d: 12.97, h: 5.50,  mouth: 5.24,  heated: true,  role: 'tannery' },
    yt_weaving_house:   { w: 9.92,  d: 13.37, h: 5.60,  mouth: 5.44,  heated: true,  role: 'weaving' },
    yt_carvers_house:   { w: 9.52,  d: 12.97, h: 5.50,  mouth: 5.24,  heated: true,  role: 'carvers' },
    yt_tea_house:       { w: 9.92,  d: 13.37, h: 5.60,  mouth: 5.44,  heated: true,  role: 'tea_house' },
    yt_goldroot_house:  { w: 8.00,  d: 6.00,  h: 3.20,  mouth: null,  heated: false, role: 'drying' },
    yt_ice_cellar:      { w: 8.72,  d: 11.97, h: 4.80,  mouth: 4.74,  heated: false, role: 'cellar' },
    yt_frostroot_house: { w: 9.52,  d: 12.97, h: 5.10,  mouth: 5.24,  heated: false, role: 'frostroot' },
    yt_raised_cache:    { w: 4.40,  d: 4.40,  h: 5.40,  mouth: null,  heated: false, role: 'cache' },
    yt_ice_quarry:      { w: 15.00, d: 11.00, h: 2.40,  mouth: null,  heated: false, role: 'quarry' },
    yt_pycrete_works:   { w: 16.00, d: 12.00, h: 3.20,  mouth: null,  heated: false, role: 'pycrete_works' },
    yt_muskox_byre:     { w: 9.00,  d: 15.00, h: 3.60,  mouth: null,  heated: false, role: 'byre' },
    yt_caribou_corral:  { w: 14.00, d: 14.00, h: 3.40,  mouth: null,  heated: false, role: 'corral' },
    yt_winter_fort:     { w: 30.00, d: 30.00, h: 7.50,  mouth: null,  heated: false, role: 'fort' },
    yt_watch_tower:     { w: 6.00,  d: 6.00,  h: 9.60,  mouth: null,  heated: false, role: 'tower' },
    yt_signal_cairn:    { w: 4.40,  d: 3.60,  h: 2.60,  mouth: null,  heated: false, role: 'cairn' },
    yt_khoton:          { w: 20.28, d: 14.52, h: 4.59,  mouth: null,  heated: false, role: 'byre' }
  };

  /* Place a kit building at centre (cu, cv), turned by `turn` ('S'=0, 'E'=90, 'N'=180, 'W'=270: the side its entry faces
     on the sheet, where +v is North and +u is East). `doorYaw` is compass bearing (0=N, 90=E, 180=S, 270=W). */
  function kitPart(n, id, key, zone, cu, cv, turn, o) {
    o = o || {};
    const K = KIT[key];
    const ew = turn === 'E' || turn === 'W';
    const w = ew ? K.d : K.w, d = ew ? K.w : K.d;
    const box = [+(cu - w / 2).toFixed(2), +(cu + w / 2).toFixed(2), +(cv - d / 2).toFixed(2), +(cv + d / 2).toFixed(2)];
    const yawMap = { N: 12, E: 105, S: 168, W: 245 }; /* angled 12-18 deg leeward off cold-trap axis, never 270-330 WNW */
    const doorYaw = o.doorYaw == null ? yawMap[turn] : o.doorYaw;
    let door = null;
    if (o.winterNet) {
      const gap = 0.8;
      door = turn === 'N' ? [cu, +(box[3] + gap).toFixed(2)]
           : turn === 'S' ? [cu, +(box[2] - gap).toFixed(2)]
           : turn === 'E' ? [+(box[1] + gap).toFixed(2), cv]
           : [+(box[0] - gap).toFixed(2), cv];
    }
    return {
      n: n, id: id, name: o.name || id, kind: o.kind || K.role, kit: key, turn: turn,
      zone: zone, level: 0, y: o.y == null ? 22 : o.y,
      box: box, circ: !!o.circ,
      heated: o.heated == null ? K.heated : o.heated,
      plinth: o.plinth == null ? (K.heated ? 'ventilated_gravel' : 'natural') : o.plinth,
      windowAspect: o.windowAspect || 'N',
      doorYaw: doorYaw,
      winterNet: !!o.winterNet,
      door: door,
      decor: o.decor == null ? 1 : o.decor,
      sheets: o.sheets || ['Q1'],
      sleeps: o.sleeps || null,
      clan: o.clan || null,
      note: o.note || ''
    };
  }

  function sitePart(n, id, name, kind, zone, u0, u1, v0, v1, o) {
    o = o || {};
    return {
      n: n, id: id, name: name, kind: kind, kit: null, turn: 'S',
      zone: zone, level: 0, y: o.y == null ? 28 : o.y,
      box: [u0, u1, v0, v1], circ: !!o.circ,
      heated: !!o.heated,
      plinth: o.plinth || 'natural',
      windowAspect: o.windowAspect || null,
      doorYaw: o.doorYaw == null ? null : o.doorYaw,
      winterNet: false, door: null,
      decor: o.decor == null ? 0 : o.decor,
      sheets: o.sheets || ['Q0'],
      sleeps: o.sleeps || null,
      note: o.note || ''
    };
  }

  /* Terrain zones in [u, v] (metres). Every zone has explicit permafrost & solar-aspect metadata. */
  const ZONES = {
    lake: {
      name: 'Cold Lake (Qoold Lheek, 5,680.4 m)',
      substrate: 'water_ice', thawStable: false, flood: true, aspect: 'flat', yRange: [0, 0],
      poly: [[-260, -610], [60, -340], [210, -145], [252, 20], [440, 220], [730, 500], [730, -610]]
    },
    coulee: {
      name: 'Musiq Quli coulee & winter aufeis channel',
      substrate: 'braided_alluvium_aufeis', thawStable: false, flood: true, aspect: 'SE', yRange: [1, 44],
      poly: [[-720, 610], [-450, 385], [-200, 205], [15, 96], [136, 22], [248, -8], [262, 52], [176, 98], [48, 170], [-148, 282], [-382, 458], [-640, 670]]
    },
    apron: {
      name: 'Lakefront coarse-gravel fan apron (Pycrete Works)',
      substrate: 'impactite_fan_gravel', thawStable: true, flood: false, aspect: 'E', yRange: [3, 10],
      poly: [[90, -195], [206, -144], [244, -10], [134, 20], [90, -8]]
    },
    northbank: {
      name: 'Shaded SSW-facing left bank (furlarch stand & permafrost cellars)',
      substrate: 'impactite_talus_permafrost', thawStable: true, flood: false, aspect: 'S', yRange: [14, 46],
      poly: [[-375, 464], [-142, 288], [54, 174], [184, 104], [412, 226], [200, 420], [-120, 560]]
    },
    tombridge: {
      name: "Ancestors' Ridge (dry impactite spur of the Seven Clan Tombs)",
      substrate: 'bare_impactite_bedrock', thawStable: true, flood: false, aspect: 'SE', yRange: [46, 62],
      poly: [[208, 426], [420, 232], [650, 450], [520, 620], [240, 560]]
    },
    watchbrow: {
      name: 'West Watch Brow & katabatic windbreak ridge',
      substrate: 'bare_impactite_moraine', thawStable: true, flood: false, aspect: 'E', yRange: [45, 62],
      poly: [[-720, -330], [-468, -330], [-468, 360], [-720, 360]]
    },
    sunbench: {
      name: 'North-tilted irrigated Three-Gifts amphitheatre',
      substrate: 'warm_boulder_loam_over_gravel', thawStable: true, flood: false, aspect: 'N', yRange: [25, 42],
      poly: [[-464, -95], [-198, -95], [-198, 198], [-440, 376], [-464, 355]]
    },
    town: {
      name: 'Sheltered moraine town benches (Six Kilen Clan Wards)',
      substrate: 'dry_impactite_moraine_gravel', thawStable: true, flood: false, aspect: 'N', yRange: [11, 24],
      poly: [[-194, -246], [86, -246], [86, 90], [12, 94], [-68, 138], [-194, 198]]
    },
    state: {
      name: 'Quunsul Crown terrace (the State Heart)',
      substrate: 'impactite_bedrock_and_cobble_pad', thawStable: true, flood: false, aspect: 'N', yRange: [21, 26],
      poly: [[-68, -48], [58, -48], [58, 56], [-68, 56]]
    },
    pasture: {
      name: 'South-west shore silt meadow, labaz caches & Leng muster ground',
      substrate: 'wet_permafrost_silt', thawStable: false, flood: false, aspect: 'N', yRange: [2, 11],
      poly: [[-540, -600], [-268, -600], [52, -346], [84, -250], [-196, -250], [-466, -334]]
    }
  };

  /* Snow-harvesting windbreak fences along the West Watch Brow (perpendicular to the 300 deg WNW katabatic wind).
     Each fence casts a 4..26 m leeward snow-drift quarry band (`driftBox`) where no building may stand. */
  const SNOW_FENCES = [
    { id: 'fence.1', name: 'North Snow Fence', a: [-472, 230], b: [-472, 310], h: 3.2, windFrom: 300, driftBox: [-468, -442, 230, 310] },
    { id: 'fence.2', name: 'Upper Sun-Bench Snow Fence', a: [-472, 125], b: [-472, 205], h: 3.2, windFrom: 300, driftBox: [-468, -442, 125, 205] },
    { id: 'fence.3', name: 'Lower Sun-Bench Snow Fence', a: [-472, 20], b: [-472, 100], h: 3.2, windFrom: 300, driftBox: [-468, -442, 20, 100] },
    { id: 'fence.4', name: 'South Town-Lee Snow Fence', a: [-472, -85], b: [-472, -5], h: 3.2, windFrom: 300, driftBox: [-468, -442, -85, -5] }
  ];

  /* Gravity meltwater leats & sawdust chute */
  const LEATS = [
    { id: 'leat.sun', name: 'Sun-Bench Gravity Irrigation Leat (off Musiq Quli weir, +38 m)', kind: 'leat',
      pts: [[-415, 415], [-428, 350], [-425, 250], [-360, 160], [-290, 60], [-245, -35]] },
    { id: 'leat.tail', name: 'Tailwater Return Ditch (drains frost-free back to Musiq Quli)', kind: 'drain',
      pts: [[-245, -35], [-210, 80], [-202, 185], [-175, 222]] },
    { id: 'chute.sawdust', name: 'Furlarch Sawdust Timber Chute (northbank rasp mill across coulee to Pycrete Works)', kind: 'chute',
      pts: [[55, 229], [118, 130], [156, 42], [168, -10]] }
  ];

  /* Overland roads, sledways & frozen-lake winter highways */
  const WAYS = [
    { id: 'road.leng', name: 'Leng & Jimjam Dirt/Sled Road (supp.jimjam_qoold_lheek_dirt, 186 km SE to Leng)',
      pts: [[-520, -585], [-380, -470], [-210, -340], [-95, -246], [-74, -150], [-74, 0]] },
    { id: 'iceway.sw', name: 'South-West Lake-Ice Sled Highway (7-8 mo/yr to Qaribuu Quli & Leng Portage)',
      pts: [[212, -138], [80, -310], [-140, -560]] },
    { id: 'iceway.ne', name: 'North-East Lake-Ice Sled Highway (7-8 mo/yr to Isnoo Quli outlet, 24 km)',
      pts: [[254, -15], [420, 150], [680, 410]] },
    { id: 'way.tombs', name: "Ancestors' Processional Way (across Musiq Quli footbridge to the Seven Clan Tombs)",
      pts: [[14, 58], [45, 132], [115, 220], [240, 390], [340, 470]] },
    { id: 'way.apron', name: 'Quarry & Pycrete Haul Ramp (lake ice up to Lower East Spine)',
      pts: [[268, -54], [205, -60], [114, -56], [64, -56]] },
    { id: 'way.watch', name: 'West Watch & Snow-Quarry Trail',
      pts: [[-194, 48], [-320, 48], [-440, 10], [-545, -180]] }
  ];

  /* Watch sightlines from the capital's towers and cairns */
  const SIGHTS = [
    { id: 'sight.leng', from: 'tower.south', name: 'SW Lake & Leng Road approach (Qaribuu Quli)', bearing: 222, km: 28, clear: 24, must: true },
    { id: 'sight.outlet', from: 'cairn.ne', name: 'NE Cold Lake outlet (Isnoo Quli head)', bearing: 44, km: 24, clear: 38, must: true },
    { id: 'sight.sewall', from: 'tower.south', name: 'SE Outer Wall glaciers across Cold Lake (7,020 m peaks)', bearing: 135, km: 14, clear: 65, must: true },
    { id: 'sight.coulee', from: 'tower.west', name: 'Upper Musiq Quli & pin bench (px 410, 506)', bearing: 318, km: 4, clear: 19, must: true }
  ];

  /* Clear orthogonal street lanes keep KCITY.covered 100% unblocked:
       Crown Spine:      v = +4  (u = -74 .. +64)
       West Avenue:      u = -74 (v = -220 .. +115)
       East Avenue:      u = +64 (v = -170 .. +64)
       North Lane:       v = +62 (u = -130 .. +64)
       South Lane:       v = -56 (u = -130 .. +114, continuing onto the lakefront apron to `tea.lake`)
       Lower South Lane: v = -132 (u = -130 .. +64) */
  const PARTS = [
    /* ==================== 1. THE STATE HEART (`state`, y = +22..+24 m; sheets Q1, Q2) ==================== */
    kitPart(1, 'chief.hall', 'yt_chief_hall', 'state', -30, 32, 'S', {
      name: "Khaay Chiip's Hall (High Chief's ribbed stone compound)", kind: 'throne', y: 23.5, decor: 4,
      sheets: ['Q1', 'Q2'], winterNet: true, sleeps: { chief_court: 28 }, clan: 'Khaay',
      note: '10-ribbed corbelled impactite dome over ventilated plinth; high seat over flue platform, Eternian war masks & alabaster lamps, guard & treasury satellites; royal serge posts'
    }),
    kitPart(2, 'quunsul.hall', 'yt_quunsul_hall', 'state', 14, 32, 'S', {
      name: 'Quunsul Hall (Council of the Seven Kilenler)', kind: 'council', y: 23.0, decor: 4,
      sheets: ['Q1', 'Q2'], winterNet: true, sleeps: { elders_shamans: 14 }, clan: 'Khaay',
      note: '10-ribbed stone council dome: double bench ring of the 7 clans round a 3.5-t central mass stove; clan applique hangings, treaty chest & war trophies'
    }),
    kitPart(3, 'shrine.lake', 'yt_shrine', 'state', 44, 30, 'S', {
      name: 'Shrine of Cold Lake (Spirit House of the Nine Masks)', kind: 'oratory', y: 22.8, decor: 3,
      sheets: ['Q1', 'Q2'], winterNet: true, sleeps: { elders_shamans: 6 }, clan: 'Khaay',
      note: 'corbelled stone dome on the east brow overlooking Cold Lake: two tiers of soapstone transformation masks, shaman drum, fat lamps under crown vent'
    }),
    kitPart(4, 'song.house', 'yt_song_house', 'state', -28, -24, 'N', {
      name: 'Great Qaggiq Song House', kind: 'music', y: 21.8, decor: 3,
      sheets: ['Q1', 'Q2'], winterNet: true, clan: 'Khaay',
      note: '14.7 m catenary pycrete festival dome, hide-lined on an air gap: warmed solely by 6 fat lamps and 200 dancers; mosaic fur rug & frame drums'
    }),
    kitPart(5, 'envoy.dome', 'yt_stone_dome', 'state', -54, -24, 'N', {
      name: "Envoys' & Interpreters' Stone House", kind: 'guest_hall', y: 22.0, decor: 3,
      sheets: ['Q1', 'Q2'], winterNet: true, sleeps: { chief_court: 16 }, clan: 'Khaay',
      note: 'heated stone house outside the Chief hearth for Leng factors, steppe messengers & ransom parleys'
    }),
    kitPart(6, 'guard.dome', 'yt_stone_dome', 'state', -56, 32, 'S', {
      name: "Hearth-Guards' & Runners' Stone Dome", kind: 'barracks', y: 23.5, decor: 2,
      sheets: ['Q1', 'Q2'], winterNet: true, sleeps: { chief_court: 16 }, clan: 'Khaay',
      note: 'keeps the west gate of the Crown gallery and the High Chief sled-caribou lines'
    }),
    /* Civic Shared-Mass-Wall Hearth Triad: bathhouse + smithy + feast kitchen on one ventilated cobble pad! */
    kitPart(7, 'bath.state', 'yt_bathhouse', 'state', 8, -24, 'N', {
      name: 'Great Crown Banya & Sweat Lodge', kind: 'hammam', y: 21.6, decor: 3,
      sheets: ['Q1', 'Q2'], winterNet: true,
      note: 'shares a 1.4 m dry-slab thermal wall with the Royal Smithy on a ventilated cobble pad: steam-stone stove, tiered larch benches, snow-rubbing vestibule'
    }),
    kitPart(8, 'smithy.state', 'yt_smithy', 'state', 22, -24, 'N', {
      name: 'Royal Meteoritic-Iron & Bronze Smithy', kind: 'workshop', y: 21.6, decor: 2,
      sheets: ['Q1', 'Q2'], winterNet: true, sleeps: { smiths_masons: 10 },
      note: 'forges Outer Wall impact-iron & Musiq Quli placer tin/gold; waste flue heat warms the Crown Banya next door'
    }),
    kitPart(9, 'kitchen.state', 'yt_kitchen_house', 'state', 36, -24, 'N', {
      name: 'Feast Kitchen of the Quunsul', kind: 'kitchen', y: 21.6, decor: 2,
      sheets: ['Q1', 'Q2'], winterNet: true, sleeps: { cultivators_curers: 10 },
      note: 'cauldron & broth dome sharing the civic heat-mass plinth; feeds council sessions and winter-feast dancers in the Qaggiq'
    }),

    /* ==================== 2. SIX CLAN WARDS (`town`, y = +12..+23 m; sheet Q1) ==================== */
    /* ---- Ward I: Quraa Kilen (Iron-Hearth Clan, NW terrace, opening E onto West Avenue u = -74) ---- */
    kitPart(10, 'clan.quraa.seat', 'yt_clan_compound', 'town', -126, 148, 'E', {
      name: 'Quraa Kilen Seat (Iron-Hearth Clan Compound)', kind: 'kin_hall', y: 22.5, decor: 3,
      winterNet: true, sleeps: { smiths_masons: 32, clan_households: 20 }, clan: 'Quraa',
      note: 'stone heart + sleeping & cold-store satellites of the Iron-Hearth speaker'
    }),
    /* Open cross-lane at v = +116 lets Quraa Winter Street walk straight East to West Avenue (u = -74)! */
    kitPart(11, 'clan.quraa.street', 'yt_winter_street', 'town', -164, 114, 'E', {
      name: 'Quraa Winter Street (8 iron-smith & founder households)', kind: 'lodging', y: 21.5, decor: 2,
      winterNet: true, sleeps: { smiths_masons: 80, clan_households: 64 }, clan: 'Quraa',
      note: 'two rows of composite, stone & pycrete domes across an internal covered tunnel street'
    }),
    kitPart(12, 'bath.quraa', 'yt_bathhouse', 'town', -100, 92, 'E', {
      name: 'Quraa Ward Banya', kind: 'bath', y: 21.2, decor: 2, winterNet: true, clan: 'Quraa',
      note: 'paired on a ventilated gravel pad with Quraa Smithy'
    }),
    kitPart(13, 'smithy.quraa', 'yt_smithy', 'town', -100, 78, 'E', {
      name: 'Quraa Impact-Iron & Sled-Runner Forge', kind: 'workshop', y: 21.2, decor: 2,
      winterNet: true, sleeps: { smiths_masons: 16 }, clan: 'Quraa',
      note: 'shares stone mass wall with Quraa Banya'
    }),
    kitPart(14, 'carvers.quraa', 'yt_carvers_house', 'town', -100, 134, 'E', {
      name: 'Soapstone Lamp & Antler Carvers', kind: 'workshop', y: 21.8, decor: 2,
      winterNet: true, sleeps: { smiths_masons: 14 }, clan: 'Quraa',
      note: 'carves seal/fat soapstone lamps, antler-and-gold Chief inlays, and shrine masks'
    }),

    /* ---- Ward II: Qiviut Kilen (Musk-Ox Loom Clan, W terrace, opening E onto West Avenue u = -74) ---- */
    kitPart(15, 'clan.qiviut.seat', 'yt_clan_compound', 'town', -100, 42, 'E', {
      name: 'Qiviut Kilen Seat (Musk-Ox Loom Clan Compound)', kind: 'kin_hall', y: 21.0, decor: 3,
      winterNet: true, sleeps: { weavers_tanners: 36, clan_households: 20 }, clan: 'Qiviut',
      note: 'clan seat of the qiviut-cloth and applique-hanging masters'
    }),
    /* Open cross-lane at v = -6 lets Qiviut Winter Street walk straight East to West Avenue! */
    kitPart(16, 'clan.qiviut.street', 'yt_winter_street', 'town', -164, -6, 'E', {
      name: 'Qiviut Winter Street (8 weaver, beadworker & furrier households)', kind: 'lodging', y: 20.0, decor: 2,
      winterNet: true, sleeps: { weavers_tanners: 96, clan_households: 66 }, clan: 'Qiviut',
      note: 'north-lit ice lenses over qiviut frame looms along a covered tunnel lane'
    }),
    kitPart(17, 'weaving.north', 'yt_weaving_house', 'town', -100, 16, 'E', {
      name: 'North Qiviut Spinning & Applique House', kind: 'workshop', y: 20.2, decor: 2,
      winterNet: true, sleeps: { weavers_tanners: 22 }, clan: 'Qiviut',
      note: 'combs & spins musk-ox underwool finer than cashmere'
    }),
    kitPart(18, 'weaving.south', 'yt_weaving_house', 'town', -100, -26, 'E', {
      name: 'South Qiviut Loom & Dyework House', kind: 'workshop', y: 19.8, decor: 2,
      winterNet: true, sleeps: { weavers_tanners: 22 }, clan: 'Qiviut',
      note: 'lichen, goldroot & berry dyes on qiviut hangings'
    }),
    kitPart(19, 'composite.qiviut', 'yt_composite_house', 'town', -102, -48, 'E', {
      name: 'Furriers & Harness-Makers Composite House', kind: 'lodging', y: 20.6, decor: 2,
      winterNet: true, sleeps: { weavers_tanners: 28, clan_households: 14 }, clan: 'Qiviut'
    }),

    /* ---- Ward III: Qaribuu Kilen (Caribou-Spear & Leng-Road Clan, SW terrace, opening E onto West Avenue u = -74) ---- */
    kitPart(20, 'clan.qaribuu.seat', 'yt_clan_compound', 'town', -102, -92, 'E', {
      name: 'Qaribuu Kilen Seat (Caribou-Spear Clan Compound)', kind: 'kin_hall', y: 18.0, decor: 3,
      winterNet: true, sleeps: { raiders_watch: 38, clan_households: 20 }, clan: 'Qaribuu',
      note: 'clan seat of the winter raid-captains and Leng caravan escorts'
    }),
    /* Open cross-lane at v = -152 between smithy (-134) and kitchen (-174) lets Qaribuu Winter Street reach West Avenue! */
    kitPart(21, 'clan.qaribuu.street', 'yt_winter_street', 'town', -164, -152, 'E', {
      name: 'Qaribuu Winter Street (8 rider, scout & sled-driver households)', kind: 'lodging', y: 16.5, decor: 2,
      winterNet: true, sleeps: { raiders_watch: 92, clan_households: 68 }, clan: 'Qaribuu'
    }),
    kitPart(22, 'bath.qaribuu', 'yt_bathhouse', 'town', -100, -120, 'E', {
      name: 'South-Gate Banya (Leng Road Riders Bath)', kind: 'bath', y: 16.8, decor: 2,
      winterNet: true, clan: 'Qaribuu',
      note: 'steams returning sled patrols; shares thermal wall with Qaribuu Smithy'
    }),
    kitPart(23, 'smithy.qaribuu', 'yt_smithy', 'town', -100, -134, 'E', {
      name: 'Harness, Crampon & Spear-Head Smithy', kind: 'workshop', y: 16.6, decor: 2,
      winterNet: true, sleeps: { smiths_masons: 16 }, clan: 'Qaribuu'
    }),
    kitPart(24, 'kitchen.qaribuu', 'yt_kitchen_house', 'town', -100, -174, 'E', {
      name: 'Trail Pemmican & Broth Kitchen', kind: 'kitchen', y: 15.6, decor: 1,
      winterNet: true, sleeps: { cultivators_curers: 16 }, clan: 'Qaribuu',
      note: 'renders tallow-berry pemmican cakes for winter raiding sleds'
    }),
    kitPart(25, 'tea.leng', 'yt_tea_house', 'town', -100, -196, 'E', {
      name: 'Leng-Portal Ivan-Chai Tea & Toll House', kind: 'buttery', y: 15.2, decor: 2,
      winterNet: true, sleeps: { cultivators_curers: 24 }, clan: 'Qaribuu',
      note: 'southern airlock portal of the covered town network where the Leng road enters off the pasture'
    }),

    /* ---- Ward IV: Isnoo Kilen (Pycrete-Mason & Lake-Fisher Clan, SE lower terrace, opening N onto Lower South Lane v = -132) ---- */
    kitPart(26, 'clan.isnoo.seat', 'yt_clan_compound', 'town', -48, -156, 'N', {
      name: 'Isnoo Kilen Seat (Drift-Snow & Pycrete-Mason Clan Compound)', kind: 'kin_hall', y: 15.8, decor: 3,
      winterNet: true, sleeps: { smiths_masons: 36, clan_households: 20 }, clan: 'Isnoo',
      note: 'master dome-builders, pycrete arch-casters and winter ice-net captains'
    }),
    /* Open N-S cross-gap at u = -22 between clan.isnoo.seat (-48) and bath.isnoo (+4) lets Isnoo Winter Street join v = -132! */
    kitPart(27, 'clan.isnoo.street', 'yt_winter_street', 'town', -22, -206, 'N', {
      name: 'Isnoo Winter Street (8 mason, quarryman & lake-fisher households)', kind: 'lodging', y: 14.0, decor: 2,
      winterNet: true, sleeps: { smiths_masons: 56, herders_fishers: 64, clan_households: 52 }, clan: 'Isnoo'
    }),
    kitPart(28, 'bath.isnoo', 'yt_bathhouse', 'town', 4, -154, 'N', {
      name: 'Quarrymen & Fishers Banya', kind: 'bath', y: 14.2, decor: 2,
      winterNet: true, clan: 'Isnoo',
      note: 'warms ice-saw crews coming up from Cold Lake; shares stone mass wall with Isnoo Smithy'
    }),
    kitPart(29, 'smithy.isnoo', 'yt_smithy', 'town', 18, -154, 'N', {
      name: 'Ice-Saw & Auger Smithy', kind: 'workshop', y: 14.0, decor: 2,
      winterNet: true, sleeps: { smiths_masons: 12 }, clan: 'Isnoo'
    }),
    kitPart(30, 'carvers.isnoo', 'yt_carvers_house', 'town', 34, -154, 'N', {
      name: 'Sled-Runner & Bone-Toggle Workshop', kind: 'workshop', y: 14.8, decor: 2,
      winterNet: true, sleeps: { weavers_tanners: 16 }, clan: 'Isnoo'
    }),
    /* Downwind SE leeward edge: tanneries placed strictly E/SE of all wards so 300 deg WNW wind carries fumes over the lake! */
    kitPart(31, 'tannery.e1', 'yt_tannery', 'town', 54, -154, 'N', {
      name: 'Leeward Musk-Ox & Caribou Tannery I', kind: 'laundry', y: 12.6, decor: 1,
      winterNet: true, sleeps: { weavers_tanners: 20 }, clan: 'Isnoo',
      note: 'placed on the far SE downwind corner: 300 deg WNW wind blows urine-and-brain tanning fumes out over Cold Lake'
    }),
    kitPart(32, 'tannery.e2', 'yt_tannery', 'town', 68, -154, 'N', {
      name: 'Leeward Hide-Smoking & Boot Tannery II', kind: 'laundry', y: 12.4, decor: 1,
      winterNet: true, sleeps: { weavers_tanners: 20 }, clan: 'Isnoo',
      note: 'waterproofed sealskin-style lake-trout & caribou kamik boots'
    }),

    /* ---- Ward V: Isiit Kilen (Sweetroot, Placer & Leat Clan, N terrace, opening S onto North Lane v = +62) ---- */
    kitPart(33, 'clan.isiit.seat', 'yt_clan_compound', 'town', -50, 80, 'S', {
      name: 'Isiit Kilen Seat (Sweetroot & Leat-Keepers Clan Compound)', kind: 'kin_hall', y: 23.2, decor: 3,
      winterNet: true, sleeps: { cultivators_curers: 58, clan_households: 20 }, clan: 'Isiit',
      note: 'stewards of the Musiq Quli irrigation leat, snow-potato pockets & summer gold/tin sluices'
    }),
    /* Opens W onto West Avenue (u = -76) so it never crosses clan.isiit.seat! */
    kitPart(34, 'cluster.isiit.w', 'yt_family_cluster', 'town', -58, 108, 'W', {
      name: 'Terrace-Gardeners Family Cluster West', kind: 'lodging', y: 23.6, decor: 2,
      winterNet: true, sleeps: { cultivators_curers: 64, clan_households: 20 }, clan: 'Isiit'
    }),
    kitPart(35, 'cluster.isiit.e', 'yt_family_cluster', 'town', -22, 80, 'S', {
      name: 'Placer-Washers & Leat-Masons Family Cluster', kind: 'lodging', y: 23.4, decor: 2,
      winterNet: true, sleeps: { cultivators_curers: 62, smiths_masons: 8, clan_households: 18 }, clan: 'Isiit'
    }),
    kitPart(36, 'composite.isiit', 'yt_composite_house', 'town', 4, 80, 'S', {
      name: 'Seed-Tuber & Goldroot Stewards House', kind: 'lodging', y: 23.0, decor: 2,
      winterNet: true, sleeps: { cultivators_curers: 56, clan_households: 18 }, clan: 'Isiit',
      note: 'frost-proof inner stone vault keeps next spring seed tubers alive above 0 C'
    }),
    kitPart(37, 'tea.coulee', 'yt_tea_house', 'town', 24, 80, 'S', {
      name: 'Coulee-Bridge Ivan-Chai Tea House', kind: 'buttery', y: 22.4, decor: 2,
      winterNet: true, sleeps: { elders_shamans: 10, cultivators_curers: 14 }, clan: 'Isiit',
      note: 'north portal of the covered way where processions cross to the cold cellars and Clan Tombs'
    }),
    /* Corner portal houses on East & West Avenues so KCITY.covered turns cleanly round the State Heart and Musiq Row! */
    kitPart(38, 'portal.ne', 'yt_stone_dome', 'town', 68, 44, 'W', {
      name: 'East Crown Portal & Masons Watch House', kind: 'guard', y: 21.8, decor: 2,
      winterNet: true, sleeps: { cultivators_curers: 12 }, clan: 'Isiit',
      note: 'northeast corner portal linking North Lane and East Avenue round the Shrine of Cold Lake'
    }),
    kitPart(39, 'portal.se', 'yt_stone_dome', 'town', 74, -4, 'W', {
      name: 'Quarry-Spine Gatehouse & Tally Dome', kind: 'weighing', y: 19.6, decor: 2,
      winterNet: true, sleeps: { cultivators_curers: 10 }, clan: 'Isnoo',
      note: 'tallies pycrete blocks, ice loads and lake char entering the Crown Spine'
    }),

    /* ---- Ward VI: Musiq Kilen (Musk-Ox & Steppe-Herd Clan, S-Central terrace) ---- */
    kitPart(40, 'clan.musiq.seat', 'yt_clan_compound', 'town', -48, -76, 'N', {
      name: 'Musiq Kilen Seat (Musk-Ox Herd-Masters Clan Compound)', kind: 'kin_hall', y: 18.8, decor: 3,
      winterNet: true, sleeps: { herders_fishers: 48, clan_households: 20 }, clan: 'Musiq',
      note: 'masters of the royal musk-ox and riding-caribou herds wintering on the SW shore meadow'
    }),
    kitPart(41, 'composite.musiq.e', 'yt_composite_house', 'town', -18, -76, 'N', {
      name: 'Herd-Captains Composite House', kind: 'lodging', y: 18.4, decor: 2,
      winterNet: true, sleeps: { herders_fishers: 58, clan_households: 20 }, clan: 'Musiq'
    }),
    kitPart(42, 'cluster.musiq.1', 'yt_family_cluster', 'town', 10, -76, 'N', {
      name: 'Lake-Net & Sled-Team Cluster Central', kind: 'lodging', y: 17.6, decor: 2,
      winterNet: true, sleeps: { herders_fishers: 68, clan_households: 18 }, clan: 'Musiq'
    }),
    kitPart(43, 'cluster.musiq.2', 'yt_family_cluster', 'town', 38, -76, 'N', {
      name: 'East Ramp Drovers Cluster', kind: 'lodging', y: 16.4, decor: 2,
      winterNet: true, sleeps: { herders_fishers: 66, clan_households: 18 }, clan: 'Musiq'
    }),
    /* Opens S onto Lower South Lane (v = -132), linked via West Avenue (u = -76) round clan.musiq.seat! */
    kitPart(44, 'dome.musiq.1', 'yt_dome', 'town', -52, -108, 'S', {
      name: 'Winter Herders Pycrete Dome West', kind: 'dormitory', y: 17.8, decor: 1,
      winterNet: true, sleeps: { herders_fishers: 38 }, clan: 'Musiq'
    }),
    kitPart(45, 'dome.musiq.2', 'yt_dome', 'town', -36, -108, 'S', {
      name: 'Winter Herders Pycrete Dome Central', kind: 'dormitory', y: 17.6, decor: 1,
      winterNet: true, sleeps: { herders_fishers: 38 }, clan: 'Musiq'
    }),
    kitPart(46, 'dome.musiq.3', 'yt_travel_dome', 'town', -20, -108, 'S', {
      name: 'Outriders Travel Dome', kind: 'dormitory', y: 17.4, decor: 1,
      winterNet: true, sleeps: { raiders_watch: 30 }, clan: 'Musiq'
    }),
    kitPart(47, 'balagan.steppe.1', 'yt_balagan', 'town', -172, -228, 'E', {
      name: 'Forest-Steppe Kin Balagan I (larch-and-sod winter house)', kind: 'lodging', y: 14.8, decor: 1,
      sheets: ['Q0', 'Q1'], sleeps: { herders_fishers: 50, clan_households: 2 }, clan: 'Musiq',
      note: 'battered larch-post sod house of Leng-valley kin wintering at the capital'
    }),
    kitPart(48, 'balagan.steppe.2', 'yt_balagan', 'town', -154, -228, 'E', {
      name: 'Forest-Steppe Kin Balagan II', kind: 'lodging', y: 14.8, decor: 1,
      sheets: ['Q0', 'Q1'], sleeps: { herders_fishers: 50, clan_households: 2 }, clan: 'Musiq'
    }),
    kitPart(49, 'tower.south', 'yt_watch_tower', 'town', -64, -236, 'E', {
      name: 'South Headland Watch Tower (Leng Road & Lake Ice Watch)', kind: 'beacon', y: 18.5, decor: 1,
      sheets: ['Q0', 'Q1'], sleeps: { raiders_watch: 20 },
      note: '9.6 m dry-stone watch tower on a gravel beach-ridge knoll commanding 28 km down Cold Lake'
    }),

    /* ==================== 3. LAKEFRONT ICE QUARRIES & PYCRETE WORKS (`lake` & `apron`; sheets Q0, Q1, Q3) ==================== */
    kitPart(50, 'quarry.n', 'yt_ice_quarry', 'lake', 274, -36, 'W', {
      name: 'North Lake-Ice Quarry (1.4 m clear black ice)', kind: 'quarry', y: 0.0, decor: 0,
      sheets: ['Q0', 'Q3'],
      note: 'sawn crystal blocks drawn up the gravel slipway by caribou sleds 7-8 months a year'
    }),
    kitPart(51, 'quarry.s', 'yt_ice_quarry', 'lake', 262, -78, 'W', {
      name: 'South Lake-Ice Quarry (lens & structural ice)', kind: 'quarry', y: 0.0, decor: 0,
      sheets: ['Q0', 'Q3'],
      note: 'cuts bubble-free north-window ice panes and structural pycrete aggregate'
    }),
    kitPart(52, 'pycrete.n', 'yt_pycrete_works', 'apron', 168, -20, 'E', {
      name: 'North Pycrete Moulding Yard (Sawdust-Chute Head)', kind: 'workshop', y: 6.2, decor: 1,
      sheets: ['Q0', 'Q1', 'Q3'],
      note: 'mixes 14% furlarch sawdust + sphagnum fibre with 86% water/slush at the foot of the northbank timber chute'
    }),
    kitPart(53, 'pycrete.c', 'yt_pycrete_works', 'apron', 164, -58, 'E', {
      name: 'Central Pycrete Arch & Spiral-Block Works', kind: 'workshop', y: 5.8, decor: 1,
      sheets: ['Q0', 'Q1', 'Q3'],
      note: 'casts standard spiral dome blocks and removable tunnel roof slabs'
    }),
    kitPart(54, 'pycrete.s', 'yt_pycrete_works', 'apron', 156, -98, 'E', {
      name: 'South Pycrete Slurry & Autumn Reskinning Yard', kind: 'workshop', y: 5.4, decor: 1,
      sheets: ['Q0', 'Q1', 'Q3'],
      note: 'prepares autumn fiber-slush coats to heal summer sun-ablation across the capital'
    }),
    kitPart(55, 'tea.lake', 'yt_tea_house', 'apron', 114, -72, 'N', {
      name: 'Quarry-Gate Ivan-Chai Tea & Warming House', kind: 'buttery', y: 7.8, decor: 2,
      sheets: ['Q0', 'Q1', 'Q3'], winterNet: true, sleeps: { cultivators_curers: 14 }, clan: 'Isnoo',
      note: 'eastern lowest portal of the KCITY.covered tunnel spine: quarrymen shed crampons and drink hot fireweed tea'
    }),
    sitePart(56, 'saltpeter.vat', 'Impactite Saltpeter Leaching Sheds', 'workshop', 'apron', 124, 144, -148, -132, {
      y: 5.2, decor: 0, sheets: ['Q0', 'Q1', 'Q3'],
      note: 'leaches Outer Wall nitrate efflorescence (geology.json saltpeter: 200) for hide-curing & trade'
    }),

    /* ==================== 4. COULEE WEIR, PLACER SLUICES & AUFEIS (`coulee`, unheated; sheet Q0) ==================== */
    sitePart(57, 'weir.upper', 'Upper Musiq Quli Stone Intake Weir (+38 m)', 'cistern', 'coulee', -422, -406, 408, 422, {
      y: 38.0, decor: 0, sheets: ['Q0'],
      note: 'low dry-impactite boulder weir diverting summer meltwater into the Sun-Bench Gravity Leat'
    }),
    sitePart(58, 'placer.gold', 'Musiq Quli Gold & Tin Placer Sluices', 'workshop', 'coulee', -178, -146, 232, 250, {
      y: 22.0, decor: 1, sheets: ['Q0'],
      note: 'summer riffle sluices working the baked high-grade gold & tin placers of r466 [px 410.2, 508.3]'
    }),
    sitePart(59, 'aufeis.yard', 'Lower Coulee Winter Aufeis (River-Icing) Bed', 'quarry', 'coulee', 76, 118, 60, 84, {
      y: 4.5, decor: 0, sheets: ['Q0', 'Q3'],
      note: 'shallow braided gravel reach that freezes solid and floods in laminated ice sheets quarried for pycrete'
    }),

    /* ==================== 5. SHADED NORTH-EAST BANK: FURLARCH & PERMAFROST CELLARS (`northbank`; sheets Q0, Q1) ==================== */
    sitePart(60, 'larch.coppice', 'Shaded SSW-Slope Furlarch Coppice (35-yr rotation)', 'garden', 'northbank', -205, 10, 360, 465, {
      y: 34.0, decor: 0, sheets: ['Q0'], windowAspect: 'S',
      note: 'south-facing shaded slope holds winter snowpack & soil moisture: coppiced for hearth wood & pycrete sawdust'
    }),
    sitePart(61, 'sawdust.mill', 'Wind-Driven Furlarch Rasp & Sawdust Shed', 'workshop', 'northbank', 46, 64, 224, 238, {
      y: 24.0, decor: 1, sheets: ['Q0'], windowAspect: 'S',
      note: 'rasps seasoned larch billets into fine pycrete fibre and sends it down the timber chute to the apron'
    }),
    kitPart(62, 'cellar.state', 'yt_ice_cellar', 'northbank', 82, 186, 'S', {
      name: 'Royal Permafrost Meat & Char Ice Cellar', kind: 'larder', y: 19.0, decor: 0,
      sheets: ['Q0', 'Q1'], windowAspect: 'S',
      note: 'dug into -10 C shaded south-aspect permafrost: holds two winters of frozen lake char & caribou'
    }),
    kitPart(63, 'cellar.clans.w', 'yt_ice_cellar', 'northbank', 102, 176, 'S', {
      name: 'West Clans Permafrost Ice Cellar', kind: 'larder', y: 18.6, decor: 0,
      sheets: ['Q0', 'Q1'], windowAspect: 'S'
    }),
    kitPart(64, 'cellar.clans.e', 'yt_ice_cellar', 'northbank', 122, 166, 'S', {
      name: 'East Clans Permafrost Ice Cellar', kind: 'larder', y: 18.2, decor: 0,
      sheets: ['Q0', 'Q1'], windowAspect: 'S'
    }),
    kitPart(65, 'cellar.tallow', 'yt_ice_cellar', 'northbank', 142, 156, 'S', {
      name: 'Lamp-Fat & Berry Permafrost Vault', kind: 'larder', y: 17.8, decor: 0,
      sheets: ['Q0', 'Q1'], windowAspect: 'S'
    }),
    kitPart(66, 'frostroot.nb1', 'yt_frostroot_house', 'northbank', 166, 174, 'S', {
      name: 'Northbank Freeze-Drying Tuber House I', kind: 'store', y: 19.5, decor: 0,
      sheets: ['Q0', 'Q1'], windowAspect: 'S',
      note: 'cycles frozen snow-potatoes in dry sub-zero shade into lightweight chuno-like winter stores'
    }),
    kitPart(67, 'frostroot.nb2', 'yt_frostroot_house', 'northbank', 186, 164, 'S', {
      name: 'Northbank Freeze-Drying Tuber House II', kind: 'store', y: 19.0, decor: 0,
      sheets: ['Q0', 'Q1'], windowAspect: 'S'
    }),

    /* ==================== 6. SUNNY NORTH-ASPECT THREE-GIFTS TERRACES (`sunbench`; sheet Q0) ==================== */
    sitePart(68, 'crop.potato.1', "Isnoo-Pa'a (Snow-Potato) Dark-Boulder Pocket I", 'garden', 'sunbench', -434, -330, 210, 295, {
      y: 36.0, decor: 0, sheets: ['Q0'], windowAspect: 'N',
      note: 'tilted NNE toward the 0 deg midday sun; black impactite boulder walls raise soil +4 C and shed frost'
    }),
    sitePart(69, 'crop.potato.2', "Isnoo-Pa'a (Snow-Potato) Dark-Boulder Pocket II", 'garden', 'sunbench', -322, -238, 166, 214, {
      y: 33.5, decor: 0, sheets: ['Q0'], windowAspect: 'N'
    }),
    sitePart(70, 'crop.isiit.1', 'Irrigated Isiit (Sweetroot) Leat Terrace Upper', 'garden', 'sunbench', -434, -325, 95, 195, {
      y: 34.0, decor: 0, sheets: ['Q0'], windowAspect: 'N',
      note: 'fed by the Sun-Bench Gravity Leat off Musiq Quli; deep parsnip-sweet taproots dug in autumn'
    }),
    sitePart(71, 'crop.isiit.2', 'Irrigated Isiit (Sweetroot) Leat Terrace Lower', 'garden', 'sunbench', -318, -238, 86, 156, {
      y: 30.5, decor: 0, sheets: ['Q0'], windowAspect: 'N'
    }),
    sitePart(72, 'crop.goldroot', 'Gooldruut & Ivan-Chai Sunny Cushion Bank', 'garden', 'sunbench', -434, -255, -20, 76, {
      y: 31.0, decor: 0, sheets: ['Q0'], windowAspect: 'N',
      note: 'adaptogenic rhodiola (gooldruut) cushions & fireweed tea strips on warm drained gravel'
    }),
    kitPart(73, 'goldroot.shed.n', 'yt_goldroot_house', 'sunbench', -212, 128, 'E', {
      name: 'North Goldroot & Tea-Fermenting Shed', kind: 'store', y: 27.5, decor: 1,
      sheets: ['Q0'], windowAspect: 'N',
      note: 'slatted dry-stone wind shed curing sliced goldroot rhizomes and rolled Ivan-chai leaves'
    }),
    kitPart(74, 'goldroot.shed.s', 'yt_goldroot_house', 'sunbench', -212, 42, 'E', {
      name: 'South Goldroot & Seed-Drying Shed', kind: 'store', y: 26.8, decor: 1,
      sheets: ['Q0'], windowAspect: 'N'
    }),
    kitPart(75, 'frostroot.sun', 'yt_frostroot_house', 'sunbench', -218, -42, 'E', {
      name: 'Terrace Harvest Sorting & Root Store', kind: 'store', y: 26.0, decor: 1,
      sheets: ['Q0'], windowAspect: 'N'
    }),

    /* ==================== 7. SW SILT PASTURE, LABAZ CACHES & MUSTER FORT (`pasture`, unheated; sheet Q0) ==================== */
    kitPart(76, 'fort.muster', 'yt_winter_fort', 'pasture', -235, -355, 'E', {
      name: 'Leng-Gate Seasonal Pycrete Muster Fort', kind: 'drill', y: 8.5, decor: 1,
      sheets: ['Q0'],
      note: '30 x 30 m seasonal pycrete ring rebuilt each autumn where clan sled-hosts muster for winter raids toward Leng'
    }),
    kitPart(77, 'khoton.w', 'yt_khoton', 'pasture', -335, -395, 'E', {
      name: 'West Royal Musk-Ox Khoton & Hay Yard', kind: 'boathouse', y: 7.5, decor: 0, sheets: ['Q0']
    }),
    kitPart(78, 'khoton.e', 'yt_khoton', 'pasture', -295, -435, 'E', {
      name: 'East Riding-Caribou Khoton & Lichen Yard', kind: 'boathouse', y: 6.8, decor: 0, sheets: ['Q0']
    }),
    kitPart(79, 'byre.1', 'yt_muskox_byre', 'pasture', -155, -310, 'E', {
      name: 'Qiviut Herd Byre I', kind: 'store', y: 8.2, decor: 0, sheets: ['Q0']
    }),
    kitPart(80, 'byre.2', 'yt_muskox_byre', 'pasture', -135, -310, 'E', {
      name: 'Qiviut Herd Byre II', kind: 'store', y: 8.0, decor: 0, sheets: ['Q0']
    }),
    kitPart(81, 'corral.1', 'yt_caribou_corral', 'pasture', -160, -355, 'E', {
      name: 'Sled & Raid-Caribou Corral West', kind: 'court', y: 7.4, decor: 0, sheets: ['Q0']
    }),
    kitPart(82, 'corral.2', 'yt_caribou_corral', 'pasture', -132, -355, 'E', {
      name: 'Sled & Raid-Caribou Corral East', kind: 'court', y: 7.2, decor: 0, sheets: ['Q0']
    }),
    kitPart(83, 'cache.1', 'yt_raised_cache', 'pasture', -65, -285, 'E', {
      name: 'Post-Mounted Labaz Fish Cache I', kind: 'larder', y: 9.0, decor: 0, sheets: ['Q0'],
      note: 'raised on smooth larch posts over wet silt: keeps dried char safe from wolverines without thawing permafrost'
    }),
    kitPart(84, 'cache.2', 'yt_raised_cache', 'pasture', -52, -285, 'E', {
      name: 'Post-Mounted Labaz Fish Cache II', kind: 'larder', y: 8.8, decor: 0, sheets: ['Q0']
    }),
    kitPart(85, 'cache.3', 'yt_raised_cache', 'pasture', -39, -285, 'E', {
      name: 'Post-Mounted Labaz Meat Cache III', kind: 'larder', y: 8.6, decor: 0, sheets: ['Q0']
    }),
    kitPart(86, 'cache.4', 'yt_raised_cache', 'pasture', -26, -285, 'E', {
      name: 'Post-Mounted Labaz Gear Cache IV', kind: 'larder', y: 8.4, decor: 0, sheets: ['Q0']
    }),

    /* ==================== 8. HIGH IMPACTITE WATCH BROW & SEVEN CLAN TOMBS (`watchbrow` & `tombridge`; sheet Q0) ==================== */
    kitPart(87, 'tower.west', 'yt_watch_tower', 'watchbrow', -545, -180, 'E', {
      name: 'West Rim Watch Tower (Coulee & Plateau Watch)', kind: 'beacon', y: 58.0, decor: 1,
      sheets: ['Q0'], sleeps: { raiders_watch: 20 },
      note: 'commands the upper Musiq Quli gorge and signals the South Headland Tower and Crown'
    }),
    kitPart(88, 'cairn.west', 'yt_signal_cairn', 'watchbrow', -560, 140, 'E', {
      name: 'West Brow Inuksuk & Signal Cairn', kind: 'beacon', y: 56.5, decor: 0,
      sheets: ['Q0'], sleeps: { raiders_watch: 4 }
    }),
    /* The Seven Corbelled Clan Tombs on the dry bare impactite Ancestors' Ridge (+49..+58 m) */
    kitPart(89, 'tomb.khaay', 'yt_clan_tomb', 'tombridge', 265, 455, 'S', {
      name: 'Tomb of the Khaay High Chiefs', kind: 'ancestors_hall', y: 52.0, decor: 2, sheets: ['Q0'], clan: 'Khaay',
      note: 'corbelled dry-impactite mound on bare frost-free bedrock above all meltwater; guarded by an inuksuk'
    }),
    kitPart(90, 'tomb.quraa', 'yt_clan_tomb', 'tombridge', 292, 438, 'S', {
      name: 'Tomb of Quraa Kilen (Iron-Hearth Dead)', kind: 'ancestors_hall', y: 51.5, decor: 1, sheets: ['Q0'], clan: 'Quraa'
    }),
    kitPart(91, 'tomb.qiviut', 'yt_clan_tomb', 'tombridge', 319, 421, 'S', {
      name: 'Tomb of Qiviut Kilen (Loom-Masters Dead)', kind: 'ancestors_hall', y: 51.0, decor: 1, sheets: ['Q0'], clan: 'Qiviut'
    }),
    kitPart(92, 'tomb.qaribuu', 'yt_clan_tomb', 'tombridge', 346, 404, 'S', {
      name: 'Tomb of Qaribuu Kilen (Spear-Riders Dead)', kind: 'ancestors_hall', y: 50.5, decor: 1, sheets: ['Q0'], clan: 'Qaribuu'
    }),
    kitPart(93, 'tomb.isnoo', 'yt_clan_tomb', 'tombridge', 373, 387, 'S', {
      name: 'Tomb of Isnoo Kilen (Pycrete-Masons Dead)', kind: 'ancestors_hall', y: 50.0, decor: 1, sheets: ['Q0'], clan: 'Isnoo'
    }),
    kitPart(94, 'tomb.isiit', 'yt_clan_tomb', 'tombridge', 400, 370, 'S', {
      name: 'Tomb of Isiit Kilen (Leat-Keepers Dead)', kind: 'ancestors_hall', y: 49.5, decor: 1, sheets: ['Q0'], clan: 'Isiit'
    }),
    kitPart(95, 'tomb.musiq', 'yt_clan_tomb', 'tombridge', 427, 353, 'S', {
      name: 'Tomb of Musiq Kilen (Herd-Masters Dead)', kind: 'ancestors_hall', y: 49.0, decor: 1, sheets: ['Q0'], clan: 'Musiq'
    }),
    kitPart(96, 'cairn.ne', 'yt_signal_cairn', 'tombridge', 485, 455, 'E', {
      name: 'Outlet-Watch Inuksuk & Signal Cairn', kind: 'beacon', y: 60.0, decor: 0,
      sheets: ['Q0'], sleeps: { elders_shamans: 10, raiders_watch: 36 },
      note: 'tomb-keepers & watchmen sighting 24 km NE down Cold Lake to the Isnoo Quli outlet'
    })
  ];

  /* Permanent urban census: 2,200 (matching openworld/populations-gemini.json `cur_pop: 2200`; swells to ~2,750-3,100
     during the autumn/spring muster when rural herding bands camp round `fort.muster`). */
  const CENSUS = {
    chief_court: 60,
    elders_shamans: 40,
    smiths_masons: 280,
    weavers_tanners: 260,
    cultivators_curers: 340,
    herders_fishers: 480,
    raiders_watch: 240,
    clan_households: 500
  };

  return {
    id: 's427qb1kma',
    name: 'Qoold Lheek',
    polity: 'Yeti Kingdom',
    indigenousPolity: 'Khaay Qantir',
    culture: 'khaayken',
    scale: 1.15,
    frame: {
      pinPx: [410, 506],
      px: [411.4, 508.1],
      kmPerPx: 2,
      lakeEl: 5680.41,
      crownEl: 5702.41,
      latitudeDegS: 27.8,
      sunBearingDeg: 0,
      katabaticFromDeg: 300,
      meanTempC: -4.2,
      warmestMonthC: 10.8,
      coldestMonthC: -19.4,
      rainMm: 94,
      atm: 0.79,
      axes: 'u east (+x), v north (-z, toward the midday sun), y up from Cold Lake (5,680.41 m)'
    },
    clans: ['Khaay', 'Quraa', 'Qiviut', 'Qaribuu', 'Isnoo', 'Isiit', 'Musiq'],
    kit: KIT,
    zones: ZONES,
    snowFences: SNOW_FENCES,
    leats: LEATS,
    ways: WAYS,
    sights: SIGHTS,
    parts: PARTS,
    census: CENSUS,
    urbanPop: 2200,
    musterPop: 2750
  };
})();
if (typeof module !== 'undefined') module.exports = QOOLD_LAYOUT;
