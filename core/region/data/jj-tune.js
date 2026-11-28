// ================================================================= CORE/REGION DATA — Kingdom of Jimjam & Northeast Rim Coupled Tune (JJ1-JJ4 + FC1-FC4 + Dilihan + Serai/Silkhead + Foreign)
// [G data] core/simulation/PROPOSAL-ARDENT-JIMJAM.md; core/region/FREE-CLANS-SCOPE.md; settlements/jimjam/PLAN.md;
// settlements/jimjam/SITE-BLUEPRINT.md; LORE.md sections 6.2-6.5, 6.14, 6.19. Plain data and pure functions for
// core/region's valley host (core/region/50-region-valley.js, H.simValley), in Scale Model 5.1's frame (metres from
// px 1191,1569 at 2 km/px).
//
// Directly mounts the 14 Free-Clans settlements & internal roads from FC_TUNE (`core/region/data/fc-tune.js`, 27,200
// single-counted souls across FC1-FC4) and replaces its 4 simplified `nb.*` stubs with the full 13-settlement
// Kingdom of Jimjam, Dilihan Province, Soda-Lake (Serai & Silkhead), Imperial Highway (Korona K10 / Shell) & Foreign
// West-Lake / Trans-Pass network (27 active settlements total):
//   JJ1-JJ4 Kingdom of Jimjam (103,500 single-counted souls across 6 settlements):
//     jj.jimjam         (58,500 = 50,000 Voth-scale urban + 8,500 slice handu; kilns, glassworks, almanac press, astrolabe guild)
//     jj.tamarai_kuppam (19,600 SSW Cut-gate irrigated rice paddies & clay=255 brickfields; Crown handu `share` tithe)
//     jj.vellai_kal     (   900 lake-shore gypsum/alabaster quarry; #1 Kingdom export)
//     jj2.barada_periya (12,500 Periya-karai floodzone drawdown granary & Barada-Quay silica:150 glass-sand wharf)
//     jj3.mekam_uppu    ( 7,000 Mekam-aru bench tea gardens, saltpeter leaching & Uppu-metu halite salt pans)
//     jj4.skywatch      ( 5,000 +3,745 m Royal Observatory, Cempu-malai skarn bronze & Sasquatch/Boatmurder salvage fairs)
//   Dilihan Province (D1-D4 = 21,000 souls, Iziz-by-Letter; strictly zero closed Port Visas sea trade):
//     dl.dilihan        (17,500 D1/D2 white marble quarries, Cut Salt-Lake lbl=98 salt/potash, rag paper_cloth, wine_butts, Tethis spices)
//     dl.kotgeta_visas  ( 3,500 D3 Kotgeta Cut-Gate & D4 Visas Coalfield coal:182..211 smithing coal + Cut timber)
//   Soda-Lake lbl=54 & Tentative Shell -> Silkhead Imperial Highway Axis:
//     sr.serai          ( 3,500 -27 m Soda-Delta Caravanserai & lbl=54 barge entrepot: alkali_salt, salt; transships Jimjam grain <-> Silkhead silk/magnets)
//     sh.silkhead       ( 4,500 dry-shore Korona & Spider-Lake gateway; depends on Jimjam grain via Serai lbl=54 barges!)
//     kr.korona_shell   (18,500 Korona K10 & Shell/Port Goto Imperial Highway terminus; pays MC-06 retainers to Ardent)
//   Foreign West-Lake & Trans-Rim Corridors:
//     pw.palewharf      ( 4,200 Eternal State & Iron Republic 425 km treaty barge portage on Great Trough Lake lbl=77)
//     wp.whitelake      ( 3,800 5,400 m White-Pass Khaayken Yeti & Yonni/Rian yak caravan corridor; hostile/closed vs eternian)
//
// Pure [G data]: zero THREE, zero DOM, zero Math.random; numeric defaults use x == null ? d : x.
var JJ_TUNE = (function () {
  'use strict';
  var T = {}, D = 1 / 365;
  function D0(x, d) { return x == null ? d : x; }

  function getFC() {
    if (typeof FC_TUNE !== 'undefined' && FC_TUNE) return FC_TUNE;
    if (typeof require === 'function') {
      var path = require('path');
      return require(path.join(__dirname, 'fc-tune.js'));
    }
    throw new Error('JJ_TUNE: load core/region/data/fc-tune.js before core/region/data/jj-tune.js');
  }

  T.px = function (px, py) { return { x: (px - 1191) * 2000, z: (py - 1569) * 2000 }; };
  T.yearDay0 = 259;

  /* Union of FC_TUNE's 28 goods + Jimjam's industrial, masonry, optical & trans-pass goods (40 canonical goods) */
  T.extraGoods = {
    alabaster:       { unit: 'kg' },
    clay_gypsum:     { unit: 'kg' },
    silica:          { unit: 'kg' },
    alkali_salt:     { unit: 'kg' },
    glass:           { unit: 'kg' },
    paper_cloth:     { unit: 'kg' },
    almanacs:        { unit: 'kg' },
    instruments:     { unit: 'kg' },
    cotton_cloth:    { unit: 'kg' },
    marble:          { unit: 'kg' },
    potash:          { unit: 'kg' },
    magnets:         { unit: 'kg' },
    qiviut:          { unit: 'kg' },
    goldroot:        { unit: 'kg' },
    ancient_salvage: { unit: 'kg' },
    machine_parts:   { unit: 'kg' }
  };

  T.jimjamIds = [
    'jj.jimjam', 'jj.tamarai_kuppam', 'jj.vellai_kal',
    'jj2.barada_periya', 'jj3.mekam_uppu', 'jj4.skywatch'
  ];

  T.dilihanIds = ['dl.dilihan', 'dl.kotgeta_visas'];
  T.sodaAxisIds = ['sr.serai', 'sh.silkhead', 'kr.korona_shell'];
  T.foreignIds = ['pw.palewharf', 'wp.whitelake'];

  /* Per-capita daily consumption (kg/person/day) across Jimjam, Dilihan, Soda-Lake & Foreign hubs */
  T.diet = {
    jjCapital: {
      grain: 155 * D, meat: 24 * D, dairy: 18 * D,
      salt: 7.5 * D, ceramics: 1.4 * D, cotton_cloth: 1.8 * D, glass: 1.1 * D, almanacs: 0.55 * D, tools: 0.55 * D,
      /* Foreign & provincial off-take (exhausts in autarky when external corridors close!) */
      marble: 1.6 * D, coal: 0.85 * D, potash: 0.55 * D, timber: 3.2 * D,
      tea: 1.4 * D, spices: 0.65 * D, silk: 0.55 * D, magnets: 0.28 * D,
      scotch: 1.8 * D, tartan: 0.35 * D, bronze: 2.8 * D,
      qiviut: 0.35 * D, goldroot: 0.22 * D, ancient_salvage: 0.35 * D, machine_parts: 0.35 * D
    },
    jjTown: {
      grain: 150 * D, meat: 20 * D, dairy: 16 * D,
      salt: 7.2 * D, ceramics: 0.90 * D, cotton_cloth: 1.2 * D, glass: 0.45 * D, almanacs: 0.25 * D, tools: 0.45 * D, tea: 0.80 * D, alabaster: 0.45 * D
    },
    jjObservatory: {
      grain: 145 * D, meat: 24 * D, dairy: 20 * D,
      salt: 7.5 * D, ceramics: 0.85 * D, cotton_cloth: 1.4 * D, glass: 0.95 * D, instruments: 0.75 * D, almanacs: 0.65 * D, tea: 1.4 * D, tools: 0.50 * D
    },
    dilihan: {
      grain: 152 * D, meat: 22 * D, salt: 7.5 * D, tea: 1.1 * D, tools: 0.48 * D,
      alabaster: 5.5 * D, ceramics: 1.4 * D, glass: 1.2 * D, almanacs: 0.45 * D, cotton_cloth: 1.1 * D,
      scotch: 4.8 * D, bronze: 1.8 * D, tin: 1.1 * D, weapons: 0.85 * D, powder: 0.80 * D
    },
    serai: {
      grain: 155 * D, meat: 22 * D, salt: 7.5 * D, tea: 1.4 * D, tools: 0.45 * D,
      alabaster: 4.5 * D, ceramics: 1.4 * D, glass: 1.0 * D, almanacs: 0.45 * D, scotch: 8.5 * D, timber: 10.0 * D, copper: 3.5 * D
    },
    silkhead: {
      /* Dry-shore gateway (934,424): structural grain deficit covered by Jimjam rice barges across lbl=54! */
      grain: 162 * D, meat: 22 * D, salt: 7.5 * D, tea: 1.5 * D, tools: 0.48 * D,
      alabaster: 8.5 * D, saltpeter: 2.4 * D, ceramics: 1.6 * D, glass: 1.4 * D, almanacs: 0.55 * D, scotch: 4.5 * D, bronze: 1.2 * D
    },
    koronaShell: {
      grain: 155 * D, meat: 22 * D, salt: 7.5 * D, tea: 1.2 * D, tools: 0.48 * D,
      alabaster: 4.2 * D, saltpeter: 3.8 * D, powder: 1.8 * D, scotch: 2.6 * D, bronze: 0.90 * D, silk: 0.45 * D, magnets: 0.25 * D
    },
    palewharf: {
      grain: 152 * D, meat: 22 * D, salt: 7.5 * D, tea: 1.1 * D, tools: 0.50 * D,
      alabaster: 14.0 * D, ceramics: 3.2 * D, glass: 2.8 * D, cotton_cloth: 2.5 * D, almanacs: 1.1 * D, saltpeter: 2.8 * D
    },
    whitelake: {
      grain: 148 * D, meat: 28 * D, salt: 7.5 * D, tea: 2.2 * D, tools: 0.45 * D,
      alabaster: 3.5 * D, cotton_cloth: 2.4 * D, glass: 1.8 * D, bronze: 1.6 * D, ceramics: 1.4 * D
    }
  };

  function makeVeins(n, firstAmt, restAmt, grade) {
    var out = [], i;
    for (i = 0; i < n; i++) out.push({ amount: i === 0 ? firstAmt : restAmt, grade: grade });
    return out;
  }

  T.valley = function (o) {
    o = o || {};
    var FC = getFC();
    var autarky = !!o.autarky;
    var embargo = !!o.embargo;

    /* Pull FC_TUNE's real 14 Free-Clans settlements & internal polygon roads directly! */
    var fcBase = FC.valley({ autarky: autarky, embargo: embargo, seed: o.seed });
    var fcSet = {};
    FC.freeClansIds.forEach(function (id) { fcSet[id] = true; });

    var goods = Object.assign({}, FC.goods, T.extraGoods);
    var food = Object.assign({}, FC.food);
    var calendar = {
      year: { yearD: 365, startDay: 259, solsticeDay: 350 },
      latitude: -34.34,
      windows: Object.assign({}, FC.calendar.windows, {
        'jj.drawdown': [25, 165],
        'jj.solstice': [348, 352]
      }),
      cycles: {
        'double-dark':       { periodD: 91, phase0: 0,  spanD: 1 },
        'double-dark-flood': { periodD: 91, phase0: 89, spanD: 4 }
      }
    };

    var factions = [
      { id: 'jimjam',    name: 'Kingdom of Jimjam (Three Wheels, JJ1-JJ4)' },
      { id: 'freeclans', name: 'Free Clans of Ardent (Nine Clans across FC1-FC4)' },
      { id: 'brokenkin', name: 'Broken-Kin Reivers (unpaid Free-Clan companies, BF-04)' },
      { id: 'dilihan',   name: 'Dilihan Province (Iziz-by-Letter Cut Exclave, D1-D4)' },
      { id: 'serai',     name: 'Serai Autonomous Soda-Delta Caravanserai (lbl=54)' },
      { id: 'silkhead',  name: 'Silkhead Dry-Shore Korona & Spider-Lake Gateway (lbl=54)' },
      { id: 'korona',    name: 'Korona K10 & Shell / Port Goto Imperial Highway (S1-S3)' },
      { id: 'eternian',  name: 'Eternal State & Republican Portage at Palewharf (lbl=77)' },
      { id: 'khaayken',  name: 'Khaayken Yeti & Yonni/Rian of Whitelake (5,400 m White Pass)' }
    ];

    var openPairs = [
      ['jimjam', 'freeclans'], ['jimjam', 'dilihan'], ['jimjam', 'serai'],
      ['jimjam', 'silkhead'], ['jimjam', 'korona'], ['jimjam', 'eternian'], ['jimjam', 'khaayken'],
      ['freeclans', 'dilihan'], ['freeclans', 'serai'], ['freeclans', 'silkhead'], ['freeclans', 'korona'],
      ['serai', 'silkhead'], ['serai', 'korona'], ['silkhead', 'korona'], ['dilihan', 'korona']
    ];
    var relations = [];
    openPairs.forEach(function (p) {
      var a = p[0], b = p[1];
      var w = embargo && ((a === 'freeclans' && b === 'korona') || (a === 'korona' && b === 'freeclans'));
      relations.push({ a: a, b: b, stance: w ? 'wary' : 'friendly', trade: autarky ? 'closed' : true });
      relations.push({ a: b, b: a, stance: w ? 'wary' : 'friendly', trade: autarky ? 'closed' : true });
    });
    /* Canonical LORE diplomatic lock: zero direct Khaayken Yeti <-> Eternian trade in ANY mode! */
    relations.push({ a: 'khaayken', b: 'eternian', stance: 'hostile', trade: 'closed' });
    relations.push({ a: 'eternian', b: 'khaayken', stance: 'hostile', trade: 'closed' });

    var S = fcBase.settlements.filter(function (sd) { return !!fcSet[sd.id]; });
    var R = fcBase.roads.filter(function (rd) {
      var stops = rd.stops || [rd.from, rd.to];
      for (var i = 0; i < stops.length; i++) if (!fcSet[stops[i]]) return false;
      return true;
    });
    var Xf = [];

    var Kjj = D0(o.jjCapitalScale, 250), Kjt = D0(o.jjTownScale, 100), Knb = D0(o.extScale, 125);
    var yr = 365, impDays = D0(o.importBufferDays, 65);
    var rate = function (kgYr, crew, sc, days) { return kgYr / (Math.max(1, Math.round(crew / sc)) * sc * D0(days, yr) * 12); };
    var batchHrs = function (batchesYr, crew, sc) { return (Math.max(1, Math.round(crew / sc)) * sc * yr * 12) / batchesYr; };
    var at = T.px;
    var mins = function (km, kpd) { return Math.max(150, Math.round(km / D0(kpd, 32) * 1440)); };

    var FOREIGN_TO_JJ = {
      marble: 1, coal: 1, potash: 1, timber: 1, spices: 1, silk: 1, magnets: 1,
      scotch: 1, tartan: 1, goldroot: 1, machine_parts: 1
    };
    function jjStockFor(diet, pop, nativeDays, foreignDays, extra) {
      var st = {}, g;
      for (g in diet) st[g] = Math.ceil(pop * diet[g] * (FOREIGN_TO_JJ[g] ? foreignDays : nativeDays));
      return Object.assign(st, extra || {});
    }

    function extDiet(baseKey, fcExportsOnlyWhenOpen) {
      var base = Object.assign({}, T.diet[baseKey]);
      if (autarky && fcExportsOnlyWhenOpen) {
        fcExportsOnlyWhenOpen.forEach(function (g) { delete base[g]; });
      }
      return base;
    }

    /* ==================== 1. KINGDOM OF JIMJAM (JJ1-JJ4 = 103,500 SINGLE-COUNTED SOULS) ==================== */
    {
      /* JJ1 Capital: Jimjam (745,546) — 50,000 urban + 8,500 slice handu = 58,500 */
      var pjj = at(745, 546), njj = 58500;
      S.push({
        id: 'jj.jimjam',
        name: 'Jimjam Capital (JJ1, 50,000 Voth-scale metropolis + 8,500 inner handu)',
        faction: 'jimjam', people: njj, x: pjj.x, z: pjj.z, scale: Kjj,
        eats: Object.assign({}, T.diet.jjCapital), keepDays: 14,
        start: jjStockFor(T.diet.jjCapital, njj, 140, impDays, {
          grain: 1400000, meat: 560000, dairy: 420000, salt: 260000,
          clay_gypsum: 95000, silica: 24000, alkali_salt: 18000,
          /* ~65 days of rag paper_cloth so autarky exhausts paper_cloth & stalls jj.almanac_press cleanly! */
          paper_cloth: 16000,
          alabaster: 24000, ceramics: 95000, glass: 42000, almanacs: 32000,
          cotton_cloth: 110000, bronze: 18000, instruments: 14000, tools: 42000,
          saltpeter: 12000, tea: 45000
        }),
        works: [
          { id: 'jj.harbour_wh', kind: 'market', name: 'Lotus Harbour Customs, Cut Caravanserai & Serai-Gate Bonded Stores', crew: 1000, out: [], rate: 0 },
          { id: 'jj.inner_paddy', kind: 'farmstead', name: 'Inner Handu Two-Crop Irrigated Rice & Emmer Paddies (8,500 slice)', crew: 6000, out: ['grain'], rate: rate(4200000, 6000, Kjj) },
          { id: 'jj.fishery', kind: 'folds', name: 'Great Trough Lake lbl=77 Fishery & Water-Buffalo Folds', crew: 2000, out: ['meat'], rate: rate(1480000, 2000, Kjj) },
          { id: 'jj.dairy', kind: 'byre', name: 'Handu Canal Buffalo Dairy Garths', crew: 1250, out: ['dairy'], rate: rate(1100000, 1250, Kjj) },
          { id: 'jj.cotton_dyer', kind: 'weaver', name: 'Four-Day Indigo, Saffron & Cotton Loom-Vats', crew: 1250, out: ['cotton_cloth'], rate: rate(245000, 1250, Kjj) },
          { id: 'jj.clay_pits', kind: 'quarry', name: 'Outer Slackwater Rhythmite Clay Pits (clay:255)', crew: 500, out: ['clay_gypsum'], rate: rate(180000, 500, Kjj) },
          { id: 'jj.day_kilns', kind: 'kiln', name: 'Day-Ward 1.51-atm Slackwater Fine-Ceramic & Glaze Kilns', crew: 1000,
            batch: { in: { clay_gypsum: 40 }, out: { ceramics: 40 }, hours: batchHrs(6200, 1000, Kjj) } },
          { id: 'jj.glassworks', kind: 'kiln', name: 'Barada-Silica & Serai-Alkali Soda-Lime Glassworks', crew: 750,
            batch: { in: { silica: 35, alkali_salt: 22 }, out: { glass: 50 }, hours: batchHrs(4800, 750, Kjj) } },
          { id: 'jj.almanac_press', kind: 'press', name: 'Royal Kauntavan Block-Press & Ephemeris Bindery (requires imported paper_cloth)', crew: 500,
            batch: { in: { paper_cloth: 20 }, out: { almanacs: 20 }, hours: batchHrs(3800, 500, Kjj) } },
          { id: 'jj.brass_guild', kind: 'smithy', name: 'Sun-Ward Brass Astrolabe, Lens & Tool Guild', crew: 750,
            batch: { in: { bronze: 22, glass: 10 }, out: { instruments: 14, tools: 22 }, hours: batchHrs(2800, 750, Kjj) } }
        ]
      });

      /* JJ1 SSW Hinterland: Tamarai-kuppam (745,578) — 19,600 */
      var ptk = at(745, 578), ntk = 19600;
      S.push({
        id: 'jj.tamarai_kuppam',
        name: 'Tamarai-kuppam & SSW Cut-Approach Paddy/Clay Villages (JJ1)',
        faction: 'jimjam', parent: 'jj.jimjam', people: ntk, x: ptk.x, z: ptk.z, scale: Kjt,
        eats: Object.assign({}, T.diet.jjTown), keepDays: 16,
        start: jjStockFor(T.diet.jjTown, ntk, 160, impDays, {
          grain: 2400000, clay_gypsum: 220000, ceramics: 45000, salt: 95000
        }),
        works: [
          { id: 'tk.granary', kind: 'store', name: 'Tamarai-aru Canal Tithe Granary', crew: 300, out: [], rate: 0 },
          { id: 'tk.paddy', kind: 'farmstead', name: 'Tamarai-aru Perennial Alluvial Rice Paddies', crew: 5200, out: ['grain'], rate: rate(5800000, 5200, Kjt) },
          { id: 'tk.stock', kind: 'folds', name: 'Canal Duck, Fish & Buffalo Garths', crew: 900, out: ['meat'], rate: rate(440000, 900, Kjt) },
          { id: 'tk.dairy', kind: 'byre', name: 'Village Buffalo Byres', crew: 600, out: ['dairy'], rate: rate(340000, 600, Kjt) },
          { id: 'tk.clay', kind: 'quarry', name: 'Tamarai Slackwater Clay=255 Banks', crew: 600, out: ['clay_gypsum'], rate: rate(260000, 600, Kjt) },
          { id: 'tk.tools', kind: 'smithy', name: 'Village Plough & Spade Smiths', crew: 200, out: ['tools'], rate: rate(12000, 200, Kjt) }
        ]
      });

      /* JJ1 Quarry Town: Vellai-kal (724,548) — 900 */
      var pvk = at(724, 548), nvk = 900;
      S.push({
        id: 'jj.vellai_kal',
        name: 'Vellai-kal Lake-Shore Alabaster & Gypsum Quarry (JJ1, #1 Kingdom Export)',
        faction: 'jimjam', parent: 'jj.jimjam', people: nvk, x: pvk.x, z: pvk.z, scale: 25,
        eats: Object.assign({}, T.diet.jjTown), keepDays: 14,
        start: jjStockFor(T.diet.jjTown, nvk, 180, impDays, { alabaster: 140000, clay_gypsum: 85000 }),
        works: [
          { id: 'vk.wharf', kind: 'market', name: 'Vellai-kal Stone-Lighter Quay', crew: 50, out: [], rate: 0 },
          { id: 'vk.alabaster', kind: 'quarry', name: 'Great Evaporite Alabaster Benches (gypsum:255)', crew: 300, out: ['alabaster'],
            rate: rate(460000, 300, 25), site: { kind: 'gypsum_ore', grade: 255, veins: makeVeins(8, 950000, 1100000, 255) } },
          { id: 'vk.gypsum', kind: 'quarry', name: 'Plaster & Slip Gypsum Pits', crew: 125, out: ['clay_gypsum'], rate: rate(165000, 125, 25) }
        ]
      });

      /* JJ2 Floodzone Shore: Periya-karai & Barada-Quay (708,535) — 12,500 */
      var pjj2 = at(708, 535), njj2 = 12500;
      S.push({
        id: 'jj2.barada_periya',
        name: 'Periya-karai Drawdown Granary & Barada-Quay Silica Shore (JJ2)',
        faction: 'jimjam', parent: 'jj.jimjam', people: njj2, x: pjj2.x, z: pjj2.z, scale: Kjt,
        eats: Object.assign({}, T.diet.jjTown), keepDays: 16,
        start: jjStockFor(T.diet.jjTown, njj2, 165, impDays, {
          grain: 1950000, silica: 135000, cotton_cloth: 65000, salt: 68000
        }),
        works: [
          { id: 'jj2.wharf', kind: 'market', name: 'Barada-Quay Barge Granary & Silica Dock', crew: 300, out: [], rate: 0 },
          { id: 'jj2.grain', kind: 'farmstead', name: 'Periya-aru Floodzone Drawdown Rice & Millet Flats', crew: 3400, out: ['grain'], rate: rate(3950000, 3400, Kjt) },
          { id: 'jj2.stock', kind: 'folds', name: 'Scabland Shore Fisheries & Herds', crew: 600, out: ['meat'], rate: rate(290000, 600, Kjt) },
          { id: 'jj2.dairy', kind: 'byre', name: 'Drawdown Meadow Cattle', crew: 400, out: ['dairy'], rate: rate(225000, 400, Kjt) },
          { id: 'jj2.silica', kind: 'quarry', name: 'Barada-Quay Pure Quartz Glass-Sand Shoals (silica:150)', crew: 400, out: ['silica'],
            rate: rate(260000, 400, Kjt), site: { kind: 'silica_sand', grade: 150, amount: 4500000, regen: 200 } },
          { id: 'jj2.cotton', kind: 'weaver', name: 'Periya-karai Shore Cotton Gins & Looms', crew: 400, out: ['cotton_cloth'], rate: rate(75000, 400, Kjt) },
          { id: 'jj2.tools', kind: 'smithy', name: 'Wharf & Canal Smiths', crew: 100, out: ['tools'], rate: rate(7500, 100, Kjt) }
        ]
      });

      /* JJ3 Mekam-aru & Uppu-metu Bench (795,515) — 7,000 */
      var pjj3 = at(795, 515), njj3 = 7000;
      S.push({
        id: 'jj3.mekam_uppu',
        name: 'Mekam-turai Tea Terraces & Uppu-metu Salt/Saltpeter Works (JJ3)',
        faction: 'jimjam', parent: 'jj.jimjam', people: njj3, x: pjj3.x, z: pjj3.z, scale: Kjt,
        eats: Object.assign({}, T.diet.jjTown), keepDays: 15,
        start: jjStockFor(T.diet.jjTown, njj3, 165, impDays, {
          salt: 340000, alkali_salt: 110000, saltpeter: 120000, tea: 85000, grain: 820000
        }),
        works: [
          { id: 'jj3.depot', kind: 'market', name: 'Mekam-turai River Stage & Salt Weigh-House', crew: 200, out: [], rate: 0 },
          { id: 'jj3.grain', kind: 'farmstead', name: 'Mekam-aru Irrigated Terrace Paddies', crew: 1400, out: ['grain'], rate: rate(1220000, 1400, Kjt) },
          { id: 'jj3.stock', kind: 'folds', name: 'Bench Goat & Fishery Folds', crew: 400, out: ['meat'], rate: rate(165000, 400, Kjt) },
          { id: 'jj3.dairy', kind: 'byre', name: 'Terrace Dairy Byres', crew: 300, out: ['dairy'], rate: rate(130000, 300, Kjt) },
          { id: 'jj3.salt', kind: 'pans', name: 'Uppu-metu Evaporite Halite Pans (salt:255)', crew: 700, out: ['salt'], rate: rate(860000, 700, Kjt) },
          { id: 'jj3.alkali', kind: 'pans', name: 'Dam-Bench Natron & Trona Crusts', crew: 300, out: ['alkali_salt'], rate: rate(55000, 300, Kjt) },
          { id: 'jj3.nitre', kind: 'pans', name: 'Mekam-aru Nitre Leaching Beds', crew: 300, out: ['saltpeter'], rate: rate(175000, 300, Kjt) },
          { id: 'jj3.tea', kind: 'tea-garden', name: 'Kulir-kuppam Misty Scarp Tea Gardens', crew: 500, out: ['tea'], rate: rate(145000, 500, Kjt) }
        ]
      });

      /* JJ4 Skywatch Observatory & Cempu-malai Skarn (776,470) — 5,000 */
      var pjj4 = at(776, 470), njj4 = 5000;
      S.push({
        id: 'jj4.skywatch',
        name: 'Skywatch +3,745 m Royal Observatory & Cempu-malai Skarn Works (JJ4)',
        faction: 'jimjam', parent: 'jj.jimjam', people: njj4, x: pjj4.x, z: pjj4.z, scale: 50,
        eats: Object.assign({}, T.diet.jjObservatory), keepDays: 14,
        start: jjStockFor(T.diet.jjObservatory, njj4, 175, impDays, {
          grain: 85000, bronze: 28000, copper: 35000, ancient_salvage: 35000, qiviut: 18000, instruments: 4500, glass: 6000, almanacs: 4500
        }),
        works: [
          { id: 'jj4.store', kind: 'market', name: 'Skywatch Border-Fair & Observatory Store', crew: 150, out: [], rate: 0 },
          { id: 'jj4.grain', kind: 'farmstead', name: 'Sheltered Bench Barley & Millet Strips (+3,745 m alpine deficit)', crew: 450, out: ['grain'], rate: rate(240000, 450, 50) },
          { id: 'jj4.stock', kind: 'folds', name: 'Highland Yak & Sheep Folds', crew: 350, out: ['meat'], rate: rate(165000, 350, 50) },
          { id: 'jj4.dairy', kind: 'byre', name: 'High-Bench Yak Dairy', crew: 250, out: ['dairy'], rate: rate(135000, 250, 50) },
          { id: 'jj4.skarn', kind: 'foundry', name: 'Cempu-malai Copper-Tin Skarn Bronze Smelters', crew: 400, out: ['bronze'],
            rate: rate(105000, 400, 50), site: { kind: 'copper_ore', grade: 145, veins: makeVeins(6, 320000, 360000, 145) } },
          { id: 'jj4.salvage', kind: 'quarry', name: 'Boatmurder & Sasquatch Rim-Fair Salvage Relay', crew: 200, out: ['ancient_salvage'], rate: rate(42000, 200, 50) },
          { id: 'jj4.qiviut', kind: 'shearing', name: 'Hoar-Wind Sasquatch Border-Fair Qiviut Barter', crew: 150, out: ['qiviut'], rate: rate(18000, 150, 50) }
        ]
      });
    }

    /* ==================== 2. DILIHAN PROVINCE (D1-D4 = 21,000 SOULS; ZERO PORT VISAS SEA TRADE) ==================== */
    {
      var pdl = at(744, 663), ndl = 17500;
      S.push({
        id: 'dl.dilihan',
        name: 'Dilihan City, Cut Salt-Lake Works & Wine-Butt Cellars (D1-D2)',
        faction: 'dilihan', people: ndl, x: pdl.x, z: pdl.z, scale: Knb,
        eats: extDiet('dilihan', ['alabaster', 'almanacs', 'scotch', 'bronze', 'tin', 'weapons', 'powder']), keepDays: 14,
        start: jjStockFor(T.diet.dilihan, ndl, 150, 80, {
          grain: 2800000, marble: 240000, salt: 340000, potash: 140000, paper_cloth: 140000,
          wine_butts: 210000, spices: 95000, alabaster: 8000, scotch: 18000
        }),
        works: [
          { id: 'dl.bourse', kind: 'market', name: 'Dilihan Governor Customs & Cut Caravanserai', crew: 375, out: [], rate: 0 },
          { id: 'dl.grain', kind: 'farmstead', name: 'Lower Cut & Ring-Bench Irrigated Terraces', crew: 3750, out: ['grain'], rate: rate(2950000, 3750, Knb) },
          { id: 'dl.meat', kind: 'folds', name: 'Dilihan Valley Stock', crew: 750, out: ['meat'], rate: rate(430000, 750, Knb) },
          { id: 'dl.marble', kind: 'quarry', name: 'Dilihan White-Marble Cliff Quarries (stone:255)', crew: 500, out: ['marble'], rate: rate(240000, 500, Knb) },
          { id: 'dl.salt', kind: 'pans', name: 'Cut Salt-Lake lbl=98 Brine Works', crew: 375, out: ['salt'], rate: rate(290000, 375, Knb) },
          { id: 'dl.potash', kind: 'pans', name: 'Cut Salt-Lake lbl=98 Potash Pans', crew: 250, out: ['potash'], rate: rate(115000, 250, Knb) },
          { id: 'dl.paper', kind: 'mill', name: 'Dilihan Rag-Paper & Izani Ledger Mills', crew: 375, out: ['paper_cloth'], rate: rate(115000, 375, Knb) },
          { id: 'dl.wine', kind: 'vineyard', name: 'Dilihan Seasoned Oak Wine-Butt Cellars (for Klippeport & Osterbank Scotch)', crew: 375, out: ['wine_butts'], rate: rate(125000, 375, Knb) },
          { id: 'dl.spices', kind: 'spice-house', name: 'Tethis Treaty-Road Ring-Sea Spice Entrepot (Port Visas closed)', crew: 250, out: ['spices'], rate: rate(72000, 250, Knb) },
          { id: 'dl.ceramics', kind: 'kiln', name: 'Dilihan Terracotta Works', crew: 250, out: ['ceramics'], rate: rate(45000, 250, Knb) },
          { id: 'dl.tea', kind: 'tea-garden', name: 'Cut Slope Tea Plots', crew: 250, out: ['tea'], rate: rate(32000, 250, Knb) },
          { id: 'dl.tools', kind: 'smithy', name: 'Dilihan Smiths', crew: 125, out: ['tools'], rate: rate(14000, 125, Knb) }
        ]
      });

      var pkv = at(737, 604), nkv = 3500;
      S.push({
        id: 'dl.kotgeta_visas',
        name: 'Kotgeta Cut-Gate Caravanserai & Visas D4 Coalfield (D3-D4)',
        faction: 'dilihan', parent: 'dl.dilihan', people: nkv, x: pkv.x, z: pkv.z, scale: 50,
        eats: extDiet('dilihan', ['alabaster', 'almanacs', 'scotch', 'bronze', 'tin', 'weapons', 'powder']), keepDays: 12,
        start: jjStockFor(T.diet.dilihan, nkv, 155, 120, {
          coal: 240000, timber: 140000, marble: 75000, wine_butts: 45000, salt: 55000, grain: 580000
        }),
        works: [
          { id: 'kv.gate', kind: 'market', name: 'Kotgeta Cut-Sill Weigh-House & Coal Staith', crew: 150, out: [], rate: 0 },
          { id: 'kv.grain', kind: 'farmstead', name: 'Kotgeta Gorge Farms', crew: 650, out: ['grain'], rate: rate(580000, 650, 50) },
          { id: 'kv.meat', kind: 'folds', name: 'Cut Gorge Stock', crew: 150, out: ['meat'], rate: rate(90000, 150, 50) },
          { id: 'kv.coal', kind: 'mine', name: 'Visas D4 High-Grade Smithing Coal Colliery (coal:211)', crew: 450, out: ['coal'],
            rate: rate(215000, 450, 50), site: { kind: 'coal_seam', grade: 211, veins: makeVeins(8, 550000, 650000, 211) } },
          { id: 'kv.timber', kind: 'lumber', name: 'Visas Bench Hardwood & Pit-Prop Sawmills', crew: 250, out: ['timber'], rate: rate(165000, 250, 50) },
          { id: 'kv.salt', kind: 'pans', name: 'Cut Brine Cisterns', crew: 100, out: ['salt'], rate: rate(45000, 100, 50) },
          { id: 'kv.tools', kind: 'smithy', name: 'Colliery Smiths', crew: 50, out: ['tools'], rate: rate(4500, 50, 50) }
        ]
      });
    }

    /* ==================== 3. SODA-LAKE lbl=54 (SERAI & SILKHEAD) & IMPERIAL HIGHWAY (KORONA K10 / SHELL) ==================== */
    {
      /* Serai (826,478) — Autonomous Soda-Delta Caravanserai & Barge Entrepot on lbl=54 (3,500) */
      var psr = at(826, 478), nsr = 3500;
      S.push({
        id: 'sr.serai',
        name: 'Serai Soda-Delta Caravanserai & lbl=54 Barge Free-Port',
        faction: 'serai', people: nsr, x: psr.x, z: psr.z, scale: 50,
        eats: extDiet('serai', ['alabaster', 'glass', 'almanacs', 'scotch', 'timber', 'copper']), keepDays: 8,
        start: jjStockFor(T.diet.serai, nsr, 110, 80, {
          /* Hyper-saline soda delta: modest local grain buffer so Serai imports Jimjam grain and barges it across lbl=54 to Silkhead! */
          grain: 68000, meat: 32000, salt: 380000, alkali_salt: 260000, potash: 95000,
          wine_butts: 12000, silk: 8000, magnets: 4500, tea: 14000, spices: 10000,
          alabaster: 8000, saltpeter: 6000, almanacs: 3000, scotch: 14000
        }),
        works: [
          { id: 'sr.wharf', kind: 'market', name: 'Serai 25t Soda-Barge Wharves & Bonded Caravanserai', crew: 250, out: [], rate: 0 },
          { id: 'sr.grain', kind: 'farmstead', name: 'Mekam-aru Sweet-Water Delta Garden Plots (autarky self-feed, zero barge surplus)', crew: 500, out: ['grain'], rate: rate(510000, 500, 50) },
          { id: 'sr.meat', kind: 'folds', name: 'Delta Waterfowl & Goats', crew: 200, out: ['meat'], rate: rate(90000, 200, 50) },
          { id: 'sr.salt', kind: 'pans', name: 'East Dam Soda-Lake lbl=54 Halite Pans', crew: 350, out: ['salt'], rate: rate(320000, 350, 50) },
          { id: 'sr.alkali', kind: 'pans', name: 'Soda-Lake lbl=54 Trona & Natron Glass-Alkali Crusts', crew: 350, out: ['alkali_salt'], rate: rate(265000, 350, 50) },
          { id: 'sr.potash', kind: 'pans', name: 'Bitter-Brine Potash Pans', crew: 150, out: ['potash'], rate: rate(75000, 150, 50) },
          { id: 'sr.tools', kind: 'smithy', name: 'Careening & Wharf Smiths', crew: 50, out: ['tools'], rate: rate(4000, 50, 50) }
        ]
      });

      /* Silkhead (934,424) — Dry-Shore Korona & Spider-Lake Gateway (4,500; structurally grain-deficit without Jimjam rice barges!) */
      var psh = at(934, 424), nsh = 4500;
      S.push({
        id: 'sh.silkhead',
        name: 'Silkhead Dry-Shore Korona & Spider-Lake Silk Gateway (lbl=54)',
        faction: 'silkhead', people: psh ? nsh : 4500, x: psh.x, z: psh.z, scale: 50,
        eats: extDiet('silkhead', ['alabaster', 'saltpeter', 'almanacs', 'scotch', 'bronze']), keepDays: 12,
        start: jjStockFor(T.diet.silkhead, nsh, 75, 75, {
          /* ~75 days of dry-shore grain buffer -> runs out & goes hungry in autarky when cut off from Jimjam->Serai lbl=54 grain barges! */
          grain: 145000, meat: 32000,
          silk: 140000, magnets: 85000, wine_butts: 110000, tea: 75000, spices: 55000, salt: 65000
        }),
        works: [
          { id: 'sh.wharf', kind: 'market', name: 'Silkhead Soda-Lake Quay & Spider-Lake Silk Bourse', crew: 250, out: [], rate: 0 },
          { id: 'sh.grain', kind: 'farmstead', name: 'Dry-Shore Oasis Strips (covers only ~32% of gateway demand!)', crew: 400, out: ['grain'], rate: rate(235000, 400, 50) },
          { id: 'sh.meat', kind: 'folds', name: 'Steppe Caravan Herds', crew: 250, out: ['meat'], rate: rate(110000, 250, 50) },
          { id: 'sh.silk', kind: 'weaver', name: 'Spider-Lake & Ham-Tsek Raw Spider-Silk Filatures', crew: 500, out: ['silk'], rate: rate(115000, 500, 50) },
          { id: 'sh.magnets', kind: 'mine', name: 'Outland Lodestone & Ancient Magnet Relay', crew: 250, out: ['magnets'], rate: rate(58000, 250, 50) },
          { id: 'sh.wine', kind: 'vineyard', name: 'Mulberry & Oasis Wine-Butt Cooperage', crew: 250, out: ['wine_butts'], rate: rate(95000, 250, 50) },
          { id: 'sh.tea', kind: 'tea-garden', name: 'Northern Caravan Brick-Tea Chests', crew: 200, out: ['tea'], rate: rate(68000, 200, 50) },
          { id: 'sh.spices', kind: 'spice-house', name: 'Outland & Korona Spice Factors', crew: 150, out: ['spices'], rate: rate(48000, 150, 50) },
          { id: 'sh.salt', kind: 'pans', name: 'East Soda-Shore Salt Pans', crew: 150, out: ['salt'], rate: rate(65000, 150, 50) },
          { id: 'sh.tools', kind: 'smithy', name: 'Caravan Farriers', crew: 50, out: ['tools'], rate: rate(4500, 50, 50) }
        ]
      });

      /* Korona K10 & Shell / Port Goto Imperial Highway Terminus (912,556) — 18,500 */
      var pkr = at(912, 556), nkr = 18500;
      S.push({
        id: 'kr.korona_shell',
        name: 'Shell Arcology, Port Goto & Korona K10 Imperial Highway (S1-S3)',
        faction: 'korona', people: nkr, x: pkr.x, z: pkr.z, scale: Knb,
        eats: extDiet('koronaShell', ['alabaster', 'saltpeter', 'powder', 'scotch', 'bronze', 'silk', 'magnets']), keepDays: 14,
        start: jjStockFor(T.diet.koronaShell, nkr, 150, 110, {
          grain: 3400000, salt: 380000, ancient_salvage: 140000, spices: 110000, silk: 85000, tea: 95000, ceramics: 95000
        }),
        works: [
          { id: 'kr.stage', kind: 'market', name: 'Korona K10 & Shell Imperial Highway Caravanserai', crew: 375, out: [], rate: 0 },
          { id: 'kr.grain', kind: 'farmstead', name: 'Shell & Korona Terrace Farms', crew: 4250, out: ['grain'], rate: rate(3450000, 4250, Knb) },
          { id: 'kr.meat', kind: 'folds', name: 'Goto Coastal & Tepui Stock', crew: 875, out: ['meat'], rate: rate(450000, 875, Knb) },
          { id: 'kr.salt', kind: 'pans', name: 'Port Goto Marine Salt Pans', crew: 375, out: ['salt'], rate: rate(260000, 375, Knb) },
          { id: 'kr.salvage', kind: 'quarry', name: 'Shell Ancient Arcology Vault Extraction', crew: 500, out: ['ancient_salvage'], rate: rate(95000, 500, Knb) },
          { id: 'kr.spices', kind: 'spice-house', name: 'Port Goto Eastern Sea Spice Wharves', crew: 375, out: ['spices'], rate: rate(85000, 375, Knb) },
          { id: 'kr.silk', kind: 'weaver', name: 'Korona Silk-Trail Warehouses', crew: 375, out: ['silk'], rate: rate(55000, 375, Knb) },
          { id: 'kr.tea', kind: 'tea-garden', name: 'Korona Slope Tea Chests', crew: 250, out: ['tea'], rate: rate(48000, 250, Knb) },
          { id: 'kr.ceramics', kind: 'kiln', name: 'Shell Kilnware', crew: 250, out: ['ceramics'], rate: rate(42000, 250, Knb) },
          { id: 'kr.tools', kind: 'smithy', name: 'Shell & Goto Smiths', crew: 250, out: ['tools'], rate: rate(16000, 250, Knb) }
        ]
      });
    }

    /* ==================== 4. FOREIGN WEST-LAKE (PALEWHARF) & TRANS-RIM (WHITELAKE) CORRIDORS ==================== */
    {
      /* Palewharf (565,604) — Eternal State & Iron Republic 425 km Barge Portage on Great Trough Lake lbl=77 (4,200) */
      var ppw = at(565, 604), npw = 4200;
      S.push({
        id: 'pw.palewharf',
        name: 'Palewharf Eternian & Republican Treaty Portage (lbl=77 West Tip)',
        faction: 'eternian', people: npw, x: ppw.x, z: ppw.z, scale: 50,
        eats: extDiet('palewharf', ['alabaster', 'ceramics', 'glass', 'cotton_cloth', 'almanacs', 'saltpeter']), keepDays: 14,
        start: jjStockFor(T.diet.palewharf, npw, 155, 110, {
          grain: 720000, marble: 165000, timber: 195000, paper_cloth: 135000, machine_parts: 85000, salt: 75000
        }),
        works: [
          { id: 'pw.quay', kind: 'market', name: 'Palewharf Censorate & Republican Barge Basin', crew: 200, out: [], rate: 0 },
          { id: 'pw.grain', kind: 'farmstead', name: 'NW Lowlands Shore Estates', crew: 850, out: ['grain'], rate: rate(720000, 850, 50) },
          { id: 'pw.meat', kind: 'folds', name: 'West-Lake Fisheries', crew: 200, out: ['meat'], rate: rate(105000, 200, 50) },
          { id: 'pw.salt', kind: 'pans', name: 'Portage Salt Stores', crew: 100, out: ['salt'], rate: rate(45000, 100, 50) },
          { id: 'pw.marble', kind: 'quarry', name: 'Eternian Pale-Marble Portage Quarries', crew: 300, out: ['marble'], rate: rate(145000, 300, 50) },
          { id: 'pw.timber', kind: 'lumber', name: 'NW Lowlands Cedar & Pine Rafts', crew: 300, out: ['timber'], rate: rate(165000, 300, 50) },
          { id: 'pw.paper', kind: 'mill', name: 'Republican & Eternian Rag-Paper Mills', crew: 250, out: ['paper_cloth'], rate: rate(95000, 250, 50) },
          { id: 'pw.machinery', kind: 'smithy', name: 'Republican Clockwork, Screw-Gear & Optics Relay', crew: 250, out: ['machine_parts'], rate: rate(58000, 250, 50) },
          { id: 'pw.tea', kind: 'tea-garden', name: 'Portage Tea Factors', crew: 50, out: ['tea'], rate: rate(8000, 50, 50) },
          { id: 'pw.tools', kind: 'smithy', name: 'Portage Toolworks', crew: 50, out: ['tools'], rate: rate(4500, 50, 50) }
        ]
      });

      /* Whitelake (712,472) — 5,400 m White-Pass Khaayken Yeti & Yonni/Rian Trans-Rim Corridor (3,800) */
      var pwp = at(712, 472), nwp = 3800;
      S.push({
        id: 'wp.whitelake',
        name: 'Whitelake 5,400 m White-Pass Khaayken Yeti & Veladiga Relay',
        faction: 'khaayken', people: nwp, x: pwp.x, z: pwp.z, scale: 50,
        eats: extDiet('whitelake', ['alabaster', 'cotton_cloth', 'glass', 'bronze', 'ceramics']), keepDays: 14,
        start: jjStockFor(T.diet.whitelake, nwp, 140, 110, {
          grain: 85000, meat: 160000, qiviut: 95000, goldroot: 75000, ancient_salvage: 85000, salt: 65000, tea: 15000
        }),
        works: [
          { id: 'wp.camp', kind: 'market', name: 'Whitelake Trans-Pass Yak Staging & Yonni/Rian Hostel', crew: 150, out: [], rate: 0 },
          { id: 'wp.grain', kind: 'farmstead', name: 'Outer-Slope Cold Barley Strips (needs Jimjam caravan rice)', crew: 500, out: ['grain'], rate: rate(340000, 500, 50) },
          { id: 'wp.meat', kind: 'folds', name: 'Alpine Yak & Musk-Ox Herds', crew: 450, out: ['meat'], rate: rate(265000, 450, 50) },
          { id: 'wp.salt', kind: 'pans', name: 'High-Basin Salar Crusts', crew: 100, out: ['salt'], rate: rate(42000, 100, 50) },
          { id: 'wp.qiviut', kind: 'shearing', name: 'Khaayken Qiviut Underwool Combing', crew: 350, out: ['qiviut'], rate: rate(68000, 350, 50) },
          { id: 'wp.goldroot', kind: 'forager', name: '5,000 m Glacial Goldroot Diggings', crew: 250, out: ['goldroot'], rate: rate(48000, 250, 50) },
          { id: 'wp.salvage', kind: 'quarry', name: 'Veladiga & Tilted-Tower Dam-Foot Salvage', crew: 250, out: ['ancient_salvage'], rate: rate(55000, 250, 50) },
          { id: 'wp.tea', kind: 'tea-garden', name: 'Rian Sound Brick-Tea Relay', crew: 100, out: ['tea'], rate: rate(14000, 100, 50) },
          { id: 'wp.tools', kind: 'smithy', name: 'Pass Yak-Gear Smiths', crew: 50, out: ['tools'], rate: rate(3500, 50, 50) }
        ]
      });
    }

    /* ==================== 5. INTRA-POLITY HINTERLAND CORRIDORS (ACTIVE IN BOTH AUTARKY & OPEN TRADE) ==================== */
    R.push(
      /* JJ1 Tamarai-kuppam Canal (Crown 32% grain & 45% clay_gypsum handu tithe + return manufactures; held on Double Dark!) */
      {
        id: 'jj.canal.tamarai', from: 'jj.tamarai_kuppam', to: 'jj.jimjam',
        minutes: mins(64, 48), cap: 65000, carriers: 6, stagger: 180, want: 45,
        share: { 'jj.tamarai_kuppam': { grain: 0.32, clay_gypsum: 0.45 } },
        goods: {
          'jj.tamarai_kuppam': ['grain', 'clay_gypsum'],
          'jj.jimjam': ['salt', 'ceramics', 'cotton_cloth', 'glass', 'almanacs', 'tea', 'tools']
        },
        expect: {
          'jj.tamarai_kuppam': { salt: 150, ceramics: 22, cotton_cloth: 26, glass: 8, almanacs: 6, tea: 18, tools: 8 }
        },
        closed: [{ legs: [0, 1], window: 'double-dark' }]
      },
      /* JJ1 Vellai-kal Lake-Shore Quarry Lighters (#1 alabaster export + gypsum; held on Double Dark!) */
      {
        id: 'jj.barge.vellai', from: 'jj.vellai_kal', to: 'jj.jimjam',
        minutes: mins(44, 55), cap: 60000, carriers: 6, stagger: 180, keep: 8, want: 55,
        goods: {
          'jj.vellai_kal': ['alabaster', 'clay_gypsum'],
          'jj.jimjam': ['grain', 'meat', 'dairy', 'salt', 'ceramics', 'cotton_cloth', 'glass', 'almanacs', 'tea', 'tools']
        },
        expect: {
          'jj.jimjam': { alabaster: 1650, clay_gypsum: 520 },
          'jj.vellai_kal': { grain: 145, meat: 20, dairy: 16, salt: 8, cotton_cloth: 2, tools: 1 }
        },
        closed: [{ legs: [0, 1], window: 'double-dark' }]
      },
      /* JJ2 Periya-karai Drawdown Granary & Barada-Quay Silica Sand Barges across lbl=77 */
      {
        id: 'jj.barge.barada', from: 'jj2.barada_periya', to: 'jj.jimjam',
        minutes: mins(82, 55), cap: 70000, carriers: 7, stagger: 180, keep: 12, want: 52,
        goods: {
          'jj2.barada_periya': ['grain', 'silica', 'cotton_cloth'],
          'jj.jimjam': ['salt', 'alabaster', 'ceramics', 'glass', 'almanacs', 'tea', 'tools']
        },
        expect: {
          'jj.jimjam': { grain: 3800, silica: 820, cotton_cloth: 80 },
          'jj2.barada_periya': { salt: 95, alabaster: 18, ceramics: 14, glass: 6, almanacs: 4, tea: 12 }
        },
        closed: [{ legs: [0, 1], window: 'double-dark' }]
      },
      /* JJ3 Mekam-turai Tea/Saltpeter & Uppu-metu Halite Salt Road */
      {
        id: 'jj.road.mekam', from: 'jj3.mekam_uppu', to: 'jj.jimjam',
        minutes: mins(112, 32), cap: 58000, carriers: 6, stagger: 240, keep: 10, want: 56,
        goods: {
          'jj3.mekam_uppu': ['salt', 'alkali_salt', 'saltpeter', 'tea'],
          'jj.jimjam': ['grain', 'alabaster', 'ceramics', 'cotton_cloth', 'glass', 'almanacs', 'tools']
        },
        expect: {
          'jj.jimjam': { salt: 1950, alkali_salt: 160, saltpeter: 520, tea: 360 },
          'jj3.mekam_uppu': { alabaster: 10, ceramics: 8, cotton_cloth: 10, glass: 4, almanacs: 2, tools: 4 }
        }
      },
      /* JJ4 Skywatch +3,745 m Observatory & Cempu-malai Skarn Crown Road */
      {
        id: 'jj.road.skywatch', from: 'jj4.skywatch', to: 'jj.jimjam',
        minutes: mins(164, 30), cap: 52000, carriers: 6, stagger: 240, keep: 8, want: 54,
        goods: {
          'jj4.skywatch': ['bronze', 'ancient_salvage', 'qiviut'],
          'jj.jimjam': ['grain', 'salt', 'ceramics', 'cotton_cloth', 'glass', 'instruments', 'almanacs', 'tea', 'tools']
        },
        expect: {
          'jj.jimjam': { bronze: 480, ancient_salvage: 120, qiviut: 55 },
          'jj4.skywatch': { grain: 1850, salt: 40, ceramics: 6, cotton_cloth: 8, glass: 6, instruments: 5, almanacs: 4, tea: 8, tools: 3 }
        }
      },
      /* Dilihan D1/D2 <-> Kotgeta & Visas Coal D3/D4 internal Cut link */
      {
        id: 'dl.lane.kotgeta', from: 'dl.dilihan', to: 'dl.kotgeta_visas',
        minutes: mins(55, 32), cap: 45000, carriers: 5, stagger: 240, keep: 12, want: 45,
        goods: {
          'dl.dilihan': ['grain', 'meat', 'salt', 'marble', 'potash', 'paper_cloth', 'wine_butts', 'spices', 'ceramics', 'tea'],
          'dl.kotgeta_visas': ['coal', 'timber', 'scotch', 'bronze', 'tin', 'weapons', 'powder', 'alabaster', 'almanacs']
        },
        expect: {
          'dl.kotgeta_visas': { wine_butts: 110, salt: 95, spices: 20, ceramics: 6, tea: 6 },
          'dl.dilihan': { coal: 120, timber: 140 }
        }
      }
    );

    /* ==================== 6. INTER-POLITY PROVINCIAL, SODA-LAKE & FOREIGN CORRIDORS (OPEN WHEN !autarky) ==================== */
    if (!autarky) {
      /* C1: The Cut Trunk Highway — Dilihan (D1/D2) & Kotgeta/Visas Coalfield (D3/D4) <-> Jimjam */
      R.push(
        {
          id: 'cut.trunk.dilihan_jimjam', from: 'dl.dilihan', to: 'jj.jimjam',
          minutes: mins(188, 30), cap: 62000, carriers: 7, stagger: 300, keep: 10, want: 55,
          goods: {
            'dl.dilihan': ['marble', 'potash', 'paper_cloth', 'spices'],
            'jj.jimjam': ['alabaster', 'ceramics', 'glass', 'cotton_cloth', 'almanacs']
          },
          expect: {
            'jj.jimjam': { marble: 320, potash: 160, paper_cloth: 190, spices: 110 },
            'dl.dilihan': { alabaster: 280, ceramics: 65, glass: 55, cotton_cloth: 55, almanacs: 25 }
          }
        },
        {
          id: 'cut.trunk.visas_jimjam', from: 'dl.kotgeta_visas', to: 'jj.jimjam',
          minutes: mins(122, 30), cap: 52000, carriers: 5, stagger: 300, keep: 10, want: 52,
          goods: {
            'dl.kotgeta_visas': ['coal', 'timber'],
            'jj.jimjam': ['alabaster', 'ceramics', 'cotton_cloth', 'almanacs', 'glass']
          },
          expect: {
            'jj.jimjam': { coal: 185, timber: 240 },
            'dl.kotgeta_visas': { alabaster: 20, ceramics: 10, cotton_cloth: 12, almanacs: 5 }
          }
        }
      );

      /* C2: Free Clans R1 — Klippeport (FC3) <-> Kotgeta/Visas & Dilihan Cut Sill Pass (delivers Visas coal & wine_butts into Free Clans!) */
      R.push(
        {
          id: 'fc.trade.dilihan', from: 'fc.klippeport', to: 'dl.dilihan',
          minutes: mins(68, 30), cap: 52000, carriers: 6, stagger: 240, keep: 14, want: 55,
          goods: {
            'fc.klippeport': ['scotch', 'tin', 'bronze', 'weapons', 'powder'],
            'dl.dilihan': ['wine_butts', 'salt', 'grain', 'spices']
          },
          expect: {
            'fc.klippeport': { wine_butts: 110, salt: 95, grain: 220 },
            'dl.dilihan': { scotch: 260, tin: 65, bronze: 85, weapons: 38, powder: 36 }
          }
        },
        {
          id: 'fc.trade.visas_coal', from: 'dl.kotgeta_visas', to: 'fc.klippeport',
          minutes: mins(34, 30), cap: 42000, carriers: 4, stagger: 240, keep: 10, want: 52,
          goods: {
            'dl.kotgeta_visas': ['coal', 'salt'],
            'fc.klippeport': ['scotch', 'bronze', 'tin', 'weapons', 'powder']
          },
          expect: {
            'fc.klippeport': { coal: 135, salt: 45 },
            'dl.kotgeta_visas': { scotch: 50, bronze: 20, tin: 15, weapons: 8, powder: 8 }
          }
        }
      );

      /* C3: Free Clans R2 — Ardent (FC1) <-> Jimjam Scarp Road (171 km) */
      R.push({
        id: 'fc.trade.jimjam', from: 'fc.ardent', to: 'jj.jimjam',
        minutes: mins(171, 30), cap: 68000, carriers: 8, stagger: 240, offset: 90, keep: 12, want: 56,
        goods: {
          'fc.ardent': ['bronze', 'scotch', 'mounts', 'tartan', 'wool', 'timber'],
          'jj.jimjam': ['grain', 'salt', 'ceramics', 'tea', 'alabaster', 'glass', 'almanacs']
        },
        expect: {
          'fc.ardent': { grain: 1200, salt: 390, ceramics: 58, tea: 48 },
          'jj.jimjam': { bronze: 580, scotch: 340, mounts: 0.35, tartan: 65, timber: 260 }
        }
      });

      /* C4: Free Clans R3 — Osterbank (FC2) <-> Serai Soda-Lake Descent (158 km: Gold Whiskey & timber down, wine_butts/salt/silk/tea/spices up!) */
      R.push({
        id: 'fc.trade.serai', from: 'fc.osterbank', to: 'sr.serai',
        minutes: mins(158, 32), cap: 54000, carriers: 6, stagger: 300, keep: 10, want: 55,
        goods: {
          'fc.osterbank': ['scotch', 'timber', 'copper', 'botanicals', 'tartan'],
          'sr.serai': ['wine_butts', 'salt', 'silk', 'tea', 'spices']
        },
        expect: {
          'fc.osterbank': { wine_butts: 105, salt: 170, silk: 20, tea: 48, spices: 20 },
          'sr.serai': { scotch: 260, timber: 240, copper: 95, botanicals: 25 }
        }
      });

      /* C5: Jimjam <-> Serai Soda-Delta Corridor & Serai <-> Silkhead 262 km Soda-Lake (lbl=54) Barge Transshipment! */
      R.push(
        {
          id: 'jj.road.serai', from: 'jj.jimjam', to: 'sr.serai',
          minutes: mins(192, 34), cap: 75000, carriers: 9, stagger: 210, keep: 8, want: 58,
          goods: {
            'jj.jimjam': ['grain', 'alabaster', 'saltpeter', 'ceramics', 'glass', 'almanacs', 'cotton_cloth'],
            'sr.serai': ['alkali_salt', 'salt', 'potash', 'silk', 'magnets', 'spices']
          },
          expect: {
            /* Serai builds entrepot buffer of Jimjam grain, alabaster, saltpeter & almanacs to barge across lbl=54 to Silkhead! */
            'sr.serai': { grain: 2600, alabaster: 240, saltpeter: 140, ceramics: 85, glass: 55, almanacs: 40 },
            'jj.jimjam': { alkali_salt: 580, potash: 95, silk: 125, magnets: 70, spices: 55 }
          }
        },
        {
          id: 'sr.barge.silkhead', from: 'sr.serai', to: 'sh.silkhead',
          minutes: mins(262, 60), cap: 75000, carriers: 8, stagger: 210, offset: 60, keep: 8, want: 55,
          goods: {
            'sr.serai': ['grain', 'alabaster', 'saltpeter', 'ceramics', 'glass', 'almanacs', 'scotch'],
            'sh.silkhead': ['silk', 'magnets', 'wine_butts', 'tea', 'spices']
          },
          expect: {
            'sh.silkhead': { grain: 1650, alabaster: 180, saltpeter: 95, ceramics: 65, glass: 45, almanacs: 30, scotch: 65 },
            'sr.serai': { silk: 240, magnets: 110, wine_butts: 180, tea: 110, spices: 85 }
          }
        }
      );

      /* C6: Tentative Shell -> Korona K10 -> Silkhead Imperial Highway + Free Clans R4 Spur S-A (with BF-04 Broken-Kin raid flip in embargo!) */
      R.push({
        id: 'kr.hwy.silkhead', from: 'kr.korona_shell', to: 'sh.silkhead',
        minutes: mins(280, 34), cap: 55000, carriers: 6, stagger: 300, keep: 12, want: 52,
        goods: {
          'kr.korona_shell': ['grain', 'ancient_salvage', 'spices', 'salt'],
          'sh.silkhead': ['silk', 'magnets', 'alabaster', 'wine_butts']
        },
        expect: {
          'sh.silkhead': { grain: 350, spices: 35 },
          'kr.korona_shell': { silk: 85, magnets: 48, alabaster: 45 }
        }
      });

      var spurSpec = {
        id: 'fc.trade.korona', from: 'fc.jarnhold', to: 'kr.korona_shell',
        minutes: mins(164, 32), cap: 48000, carriers: 5, stagger: 300, keep: 14, want: 55,
        goods: {
          'fc.jarnhold': ['mounts', 'saltpeter', 'powder', 'scotch', 'weapons', 'bronze'],
          'kr.korona_shell': ['grain', 'salt', 'silk', 'tea', 'ceramics', 'spices', 'ancient_salvage']
        },
        expect: {
          'fc.jarnhold': { grain: 340, salt: 90, silk: 12, tea: 20, ceramics: 14 },
          'kr.korona_shell': { mounts: 0.35, saltpeter: 185, powder: 85, scotch: 145, weapons: 25, bronze: 45 }
        }
      };
      if (embargo) {
        spurSpec.raids = [{
          at: 'fc.jarnhold', from: 'kr.korona_shell', to: 'fc.salpetervik',
          every: 2, spare: 0, share: 0.35, goods: ['grain', 'salt', 'silk', 'tea'],
          why: 'BF-04 Broken-Kin Free-Clan highwaymen (inverted bronze discs after >14d unpaid Silk-Trail retainers)'
        }];
      }
      R.push(spurSpec);

      /* C7: Palewharf <-> Jimjam 425 km Treaty Barge Line across Great Trough Lake lbl=77 (held on Double Dark!) */
      R.push({
        id: 'jj.barge.palewharf', from: 'pw.palewharf', to: 'jj.jimjam',
        minutes: mins(425, 62), cap: 70000, carriers: 6, stagger: 300, keep: 12, want: 55,
        goods: {
          'pw.palewharf': ['marble', 'timber', 'paper_cloth', 'machine_parts'],
          'jj.jimjam': ['alabaster', 'ceramics', 'glass', 'cotton_cloth', 'almanacs', 'saltpeter']
        },
        expect: {
          'jj.jimjam': { marble: 260, timber: 260, paper_cloth: 165, machine_parts: 85 },
          'pw.palewharf': { alabaster: 125, ceramics: 75, glass: 48, cotton_cloth: 70, almanacs: 30, saltpeter: 85 }
        },
        closed: [{ legs: [0, 1], window: 'double-dark' }]
      });

      /* C8: Whitelake <-> Jimjam 5,400 m White-Pass Yak Caravan (with C2 beast fodder & C4 winter blizzard losses!) */
      R.push({
        id: 'jj.pass.whitelake', from: 'wp.whitelake', to: 'jj.jimjam',
        minutes: mins(185, 24), cap: 48000, carriers: 5, stagger: 300, keep: 12, want: 55,
        provision: { beasts: 24, eat: { grain: 1.5 }, home: 0, maxDays: 6 },
        losses: [{ legs: [0, 1], every: 6, spare: 4, share: 0.08, window: 'fc.winter', why: '5,400 m White-Pass winter blizzard' }],
        goods: {
          'wp.whitelake': ['qiviut', 'goldroot', 'ancient_salvage'],
          'jj.jimjam': ['grain', 'salt', 'cotton_cloth', 'tea', 'glass', 'bronze', 'ceramics']
        },
        expect: {
          'jj.jimjam': { qiviut: 110, goldroot: 85, ancient_salvage: 95 },
          'wp.whitelake': { grain: 280, salt: 35, cotton_cloth: 75, tea: 55, glass: 32, bronze: 48, ceramics: 35 }
        }
      });

      /* Quarterly MC-06 Silk-Trail Escort Retainers & Dilihan Treaty Shipments */
      if (!embargo) {
        Xf.push({
          id: 'fc.retainer.silk_trail',
          from: 'kr.korona_shell',
          to: 'fc.ardent',
          every: 90,
          first: 15,
          hour: 8,
          goods: { grain: 22000, salt: 6500, silk: 1200, tea: 1800, ceramics: 1500 }
        });
        Xf.push({
          id: 'fc.treaty.dilihan_envoy',
          from: 'dl.dilihan',
          to: 'fc.ardent',
          every: 180,
          first: 30,
          hour: 9,
          goods: { wine_butts: 2500, spices: 800 }
        });
      }
    }

    return {
      seed: D0(o.seed, 745546),
      scale: Kjt,
      start: D0(o.start, 0),
      calendar: calendar,
      factions: factions,
      relations: relations,
      goods: goods,
      food: food,
      settlements: S,
      roads: R,
      transfers: Xf,
      meta: {
        autarky: autarky,
        embargo: embargo,
        bandState: FC.evaluateBandState({
          unpaidDays: embargo ? 30 : 0,
          silkCaravanIndex: autarky ? 0.0 : (embargo ? 0.22 : 0.90),
          harvestIndex: 0.88
        })
      }
    };
  };

  T.summarizePolity = function (ids, goodsMap, B0, B, firstDryDay, blockedBySettlement) {
    var gks = Object.keys(goodsMap || {});
    var pop = 0, totals = {};
    gks.forEach(function (g) {
      totals[g] = {
        open: 0, close: 0, made: 0, used: 0, eaten: 0, hungry: 0, short: 0,
        imported: 0, exported: 0,
        firstDryDay: firstDryDay && firstDryDay[g] != null ? firstDryDay[g] : null
      };
    });
    ids.forEach(function (id) {
      var t0 = B0.towns[id] || { stock: {} }, t1 = B.towns[id];
      if (!t1) return;
      pop += t1.people;
      gks.forEach(function (g) {
        var r = totals[g];
        r.open += t0.stock[g] || 0;
        r.close += t1.stock[g] || 0;
        r.made += t1.made[g] || 0;
        r.used += t1.used[g] || 0;
        r.eaten += t1.eaten[g] || 0;
        r.hungry += t1.hungry[g] || 0;
        r.short += t1.short[g] || 0;
        r.imported += t1.imported[g] || 0;
        r.exported += t1.exported[g] || 0;
      });
    });
    var stalled = [];
    if (blockedBySettlement) {
      ids.forEach(function (id) {
        var b = blockedBySettlement[id] || {};
        Object.keys(b).forEach(function (wk) {
          if (b[wk] && b[wk].reason === 'missing') stalled.push({ settlement: id, work: wk, missing: b[wk].goods });
        });
      });
    }
    return { people: pop, goods: totals, stalledWorks: stalled };
  };

  /* Class assignment by workplace kind across Jimjam, Free Clans & regional neighbours:
     - 'poor'    : handu paddy farmers, fishers, buffalo herders, salt-panners, clay/stone quarrymen, miners (~70% of Jimjam)
     - 'artisan' : ceramic/glass kilnmen, Royal Almanac printers, brass/optics smiths, dyers, distillers, coopers (~22% of Jimjam)
     - 'elite'   : Lotus Harbour & Cut-Gate merchant factors, spice/tea/silk factors, court & observatory stewards (~8% of Jimjam) */
  var WORK_CLASS = {
    market: 'elite', 'spice-house': 'elite', 'tea-garden': 'elite', stables: 'elite',
    kiln: 'artisan', weaver: 'artisan', press: 'artisan', smithy: 'artisan',
    foundry: 'artisan', cooperage: 'artisan', distillery: 'artisan', mill: 'artisan',
    apothecary: 'artisan', vineyard: 'artisan'
  };

  var STAPLE_GOODS = { salt: 1, ceramics: 1, cotton_cloth: 1, peat: 1, tartan: 1, tools: 1 };
  var GUILD_INPUTS = { coal: 1, paper_cloth: 1, machine_parts: 1, timber: 1, potash: 1, wine_butts: 1, bronze: 1, tin: 1, saltpeter: 1 };
  var LUXURY_GOODS = { marble: 1, silk: 1, magnets: 1, spices: 1, scotch: 1, goldroot: 1, qiviut: 1, tea: 1, weapons: 1, powder: 1 };

  /* Opt-in class-stratified unrest wiring (77-sim-6-needs.js + 77-sim-6-unrest.js) on top of H.simValley(V).
     Models how Jimjam weathers a trade blockade (0 famine, 'poor' stays calm on domestic rice/salt/cloth, collective city
     never hits treason) while still suffering real difficulty ('elite' & 'artisan' fall into grumble -> demand -> refused
     Crown petitions -> intermittent 1-day guild strikes & 0.7x watch arrest penalty, whereas grain-starved Silkhead hits treason). */
  T.attachUnrest = function (H, V) {
    if (typeof SIM === 'undefined' || !SIM.needs || !SIM.unrest) return null;
    var kindByPlace = {};
    (V.settlements || []).forEach(function (sd) {
      (sd.works || []).forEach(function (wk) { kindByPlace[wk.id] = wk.kind || 'store'; });
    });
    function classOf(a) {
      if (!a) return 'poor';
      if (a.cls) return a.cls;
      var k = a.work ? kindByPlace[a.work] : null;
      return (k && WORK_CLASS[k]) ? WORK_CLASS[k] : 'poor';
    }
    SIM.all('actor').forEach(function (a) {
      if (!a.driven && !a.animal) a.cls = classOf(a);
    });

    SIM.needs({
      list: ['sleep', 'rest'],
      rate: { sleep: 2.8, rest: 2.0 },
      fill: { SLEEP: { sleep: 9.0, rest: 3.0 }, REST: { rest: 8.5, sleep: 1.5 } },
      weight: { sleep: 1.0, rest: 1.0 },
      init: 18,
      pain: 1.5
    });
    /* Hourly schedule boundaries allow 60-min abstract steps (4x faster over 27 towns x 365 days with identical hourly results) */
    SIM.ABSTRACT_STEP = 60;

    SIM.unrest({
      classOf: classOf,
      smooth: 4,
      hyst: 5,
      stages: { grumble: 50, demand: 40, strike: 30, treason: 20 },
      grumble: { arrest: 0.7 },
      demand: { goods: 2, days: 5, keep: 3, every: 7, grant: 0.4, granted: { n: -8, days: 7 }, refused: { n: 3, days: 6 } },
      strike: { after: 6, share: 0.30, days: 1 }
    });

    var S = H.VALLEY;
    var prevHungry = {};
    var actorsByTownClass = {};
    SIM.all('actor').forEach(function (a) {
      if (a.driven || a.animal || a.transient) return;
      var s = SIM.settlementOf(a);
      if (!s) return;
      var c = classOf(a);
      var bucket = actorsByTownClass[s] || (actorsByTownClass[s] = { poor: [], artisan: [], elite: [] });
      (bucket[c] || (bucket[c] = [])).push(a);
    });

    var lastShockDay = -1;
    SIM.stepHooks.push(function (minute) {
      /* Evaluate daily shortage & workshop-stall shocks at 23:00 (1 hour before SIM.unrestStep at midnight!) */
      if (minute < 1380 || (minute % 1440) !== 1380) return;
      var d = Math.floor(minute / 1440);
      if (d <= lastShockDay) return;
      lastShockDay = d;

      S.order.forEach(function (s) {
        var bucket = actorsByTownClass[s];
        if (!bucket) return;
        var sd = S.towns[s].spec, E = SIM.econ(s);
        if (!sd || !E) return;
        var pop = Math.max(1, D0(sd.people, 1));

        /* 1. Daily caloric hunger shock (vital: hits poor, artisan & elite alike!) */
        var hMap = S.hungry[s] || {}, pMap = prevHungry[s] || (prevHungry[s] = {});
        var dayHungryEq = 0;
        ['grain', 'potato', 'dairy', 'meat'].forEach(function (fg) {
          var cur = D0(hMap[fg], 0), dlt = Math.max(0, cur - D0(pMap[fg], 0));
          pMap[fg] = cur;
          var fw = (V.food && V.food[fg] != null) ? V.food[fg] : 1;
          dayHungryEq += dlt * fw;
        });
        var dailyFoodNeed = pop * 0.45; /* ~165 kg/person/yr = 0.45 kg/person/day */
        var hungerRatio = Math.min(1.5, dayHungryEq / Math.max(1, dailyFoodNeed));

        /* 2. Daily non-food shortages from E.day[d].short */
        var sh = (E.day[d] && E.day[d].short) || {};
        var nStaple = 0, nGuild = 0, nLux = 0;
        Object.keys(sh).forEach(function (g) {
          if (!(sh[g] > 0)) return;
          if (STAPLE_GOODS[g]) nStaple++;
          else if (GUILD_INPUTS[g]) nGuild++;
          else if (LUXURY_GOODS[g]) nLux++;
        });

        /* 3. Missing-input workshop stalls (ignore temporary strike holds so strikes don't self-spiral into treason!) */
        var blk = SIM.blockedReport ? SIM.blockedReport(s) : {};
        var nStalled = 0;
        Object.keys(blk).forEach(function (wk) {
          if (blk[wk] && blk[wk].reason === 'missing') nStalled++;
        });

        /* 4. Unsold export glut on the quays (e.g. >450 t of unshipped Vellai-kal alabaster piling up in Jimjam/Vellai-kal!) */
        var glutShock = 0;
        if (s === 'jj.jimjam' || s === 'jj.vellai_kal') {
          var kAlab = (SIM.stockOf('alabaster', 'jj.jimjam') || 0) + (SIM.stockOf('alabaster', 'jj.vellai_kal') || 0);
          if (kAlab > 460000) glutShock = Math.min(4.0, (kAlab - 460000) / 55000);
        }

        /* Apply 1-day happiness modifiers (fading over 2 days; 1.0 daily pulse ~= 1.5 steady-state points off ~95 baseline):
           - Poor    : cushioned by domestic rice, dairy, salt & cloth (~61-65 'calm' in Jimjam!), feeling only dock/timber pinch
           - Elite   : hit by missing marble, silk, spices, scotch, tartan & goldroot -> ~33-37 ('demand', formal Court petitions)
           - Artisan : hit by stalled Almanac Press (paper_cloth) + missing Visas coal/timber/machine_parts + alabaster quay glut
                       -> ~24-28 ('strike', periodic 1-day guild walkouts), yet cushioned above 20 so treason = 0!
           - City 'all' settles around ~47-49 ('grumble'): Jimjam weathers the blockade without revolt, but with real difficulty! */
        var poorDrop    = hungerRatio * 58 + nStaple * 11 + Math.min(3, nGuild) * 3.0 + glutShock * 1.5;
        var artisanDrop = hungerRatio * 58 + nStaple * 8  + Math.min(3, nGuild) * 5.2 + Math.min(2, nStalled) * 5.5 + glutShock * 1.8;
        var eliteDrop   = hungerRatio * 55 + nStaple * 5  + Math.min(5, nLux) * 5.4   + Math.min(2, nGuild) * 1.5 + glutShock * 1.2;

        if (poorDrop > 0.2)    bucket.poor.forEach(function (a)    { SIM.happinessAdd(a, poorDrop,    2, 'shortage:staple'); });
        if (artisanDrop > 0.2) bucket.artisan.forEach(function (a) { SIM.happinessAdd(a, artisanDrop, 2, 'shortage:guild'); });
        if (eliteDrop > 0.2)   bucket.elite.forEach(function (a)   { SIM.happinessAdd(a, eliteDrop,   2, 'shortage:luxury'); });
      });
    });

    return SIM.UNREST;
  };

  return T;
})();
if (typeof module !== 'undefined') module.exports = JJ_TUNE;
