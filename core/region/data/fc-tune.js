// ================================================================= CORE/REGION DATA — Free Clans of Ardent tune (FC1-FC4)
// [G data] core/region/FREE-CLANS-SCOPE.md; core/simulation/PROPOSAL-ARDENT-JIMJAM.md; settlements/ardent/PLAN.md;
// LORE.md section 6.4. Plain data and pure functions for core/region's valley host (core/region/50-region-valley.js,
// H.simValley), in Scale Model 5.1's frame (metres from px 1191,1569 at 2 km/px).
//
// Single-counted Free Clans census (27,200 across 42,668 km2, 9 Clans in 4 provinces FC1-FC4):
//   FC1 Hearth-Bowl (12,500): fc.ardent (8,000 walled capital), fc.malmdal (650), fc1.glens (3,850 rural crofts)
//   FC2 North-Bench  (4,700): fc.osterbank (850), fc.koppardal (600), fc2.benches (3,250 rural crofts)
//   FC3 West-Lode    (6,700): fc.kopparberg (900), fc.klippeport (700), fc.stannvik (550), fc.vaktberg (350), fc3.steadings (4,200)
//   FC4 East-Rim     (3,300): fc.jarnhold (600), fc.salpetervik (450), fc4.steppe (2,250 horse-glens)
// External trading neighbours (counted in their own regional tunes; 0 double-count in T.freeClansIds):
//   nb.jimjam  (745,546 — R2 Scarp Road: rice/grain, salt, ceramics <-> bronze, Hearth-Peat scotch, mounts, tartan, timber)
//   nb.dilihan (737,604 — R1 Cut Sill Pass: wine_butts, Visas smithing coal, salt <-> bronze, tin, Cut scotch, weapons, powder)
//   nb.serai   (826,478 — R3 Mekam-aru Descent to Soda Lake lbl=54 & Silkhead: salt, silk, tea, spices, wine_butts <-> Caravan-Cask whiskey, timber, copper, botanicals, tartan)
//   nb.korona  (912,556 — R4 Spur S-A to Shell-Silkhead Imperial Highway: MC-06 escort retainers + grain/salt/silk <-> saltpeter, powder, mounts, weapons, scotch)
//
// Modes on FC_TUNE.valley(o):
//   o.autarky === true  -> closes all external neighbour trade & retainers so a 365-day run measures exact day-of-exhaustion,
//                          shortfalls, stalled batch works (SIM.blockedReport), and unshipped domestic surpluses;
//   o.autarky === false -> (default) opens R1-R4 neighbour trade + quarterly MC-06 Silk-Trail retainers;
//   o.embargo === true  -> defaults on MC-06 retainers (>14 days unpaid), flipping bands to BF-04 Broken-Kin reivers (W5 roadRaids).
var FC_TUNE = (function () {
  'use strict';
  var T = {}, D = 1 / 365;
  function D0(x, d) { return x == null ? d : x; }
  T.px = function (px, py) { return { x: (px - 1191) * 2000, z: (py - 1569) * 2000 }; };
  T.yearDay0 = 259;

  T.goods = {
    grain: { unit: 'kg', crops: ['frostoat', 'redstem', 'barley', 'rice'] },
    potato: { unit: 'kg', crops: ['frostroot', 'snowpotato', 'sweetroot'] },
    dairy: { unit: 'kg' },
    meat: { unit: 'kg' },
    salt: { unit: 'kg' },
    ceramics: { unit: 'kg' },
    tea: { unit: 'kg' },
    spices: { unit: 'kg' },
    silk: { unit: 'kg' },
    peat: { unit: 'kg' },
    timber: { unit: 'kg' },
    charcoal: { unit: 'kg' },
    coal: { unit: 'kg' },
    copper: { unit: 'kg' },
    tin: { unit: 'kg' },
    iron: { unit: 'kg' },
    bronze: { unit: 'kg' },
    saltpeter: { unit: 'kg' },
    powder: { unit: 'kg' },
    wool: { unit: 'kg' },
    botanicals: { unit: 'kg', crops: ['juniper', 'sky-poppy', 'ivanchai'] },
    casks: { unit: 'kg' },
    wine_butts: { unit: 'kg' },
    tartan: { unit: 'kg' },
    tools: { unit: 'kg' },
    weapons: { unit: 'kg' },
    scotch: { unit: 'kg' },
    mounts: { unit: 'head' }
  };

  /* S7 grain-equivalent substitution table for staple calories (salt, ceramics, tea, spices, silk, peat & tools never substitute) */
  T.food = { grain: 1.0, potato: 0.45, dairy: 0.70, meat: 1.15 };

  /* Per-capita daily consumption (kg/person/day) */
  T.diet = {
    capital: {
      grain: 135 * D, potato: 42 * D, dairy: 38 * D, meat: 26 * D,
      salt: 7.5 * D, ceramics: 0.85 * D, tea: 1.6 * D, spices: 0.45 * D, silk: 0.45 * D,
      peat: 18 * D, tartan: 0.9 * D, tools: 0.55 * D
    },
    seat: {
      grain: 125 * D, potato: 45 * D, dairy: 40 * D, meat: 26 * D,
      salt: 7.5 * D, ceramics: 0.70 * D, tea: 1.1 * D, spices: 0.30 * D,
      peat: 16 * D, tartan: 0.75 * D, tools: 0.50 * D
    },
    fort: {
      grain: 130 * D, potato: 40 * D, dairy: 35 * D, meat: 34 * D,
      salt: 8.0 * D, ceramics: 0.60 * D, tea: 1.2 * D,
      peat: 28 * D, tartan: 0.80 * D, tools: 0.60 * D
    },
    glen: {
      grain: 112 * D, potato: 52 * D, dairy: 45 * D, meat: 26 * D,
      salt: 7.5 * D, ceramics: 0.45 * D, tea: 0.40 * D,
      peat: 15 * D, tools: 0.38 * D
    },
    steppe: {
      grain: 108 * D, potato: 36 * D, dairy: 54 * D, meat: 36 * D,
      salt: 7.5 * D, ceramics: 0.45 * D, tea: 0.55 * D,
      tools: 0.40 * D
    },
    neighbour: {
      grain: 165 * D, meat: 22 * D, salt: 7.5 * D, tea: 1.2 * D, tools: 0.45 * D
    }
  };

  /* Highland seasonal calendar (clock day 0 = early autumn day 259, right after the frostoat harvest) */
  T.calendar = {
    windows: {
      'fc.harvest': [195, 245],
      'fc.shielings': [115, 235],
      'fc.peat': [105, 230],
      'fc.winter': [315, 75],
      'fc.campaign': [95, 255]
    }
  };

  T.factions = [
    { id: 'freeclans', name: 'The Free Clans of Ardent (the Nine Clans of the Clanthing across FC1-FC4)' },
    { id: 'brokenkin', name: 'Broken-Kin Reivers (unpaid Free-Clan companies with inverted bronze discs, BF-04)' },
    { id: 'jimjam', name: 'The Kingdom of Jimjam (Solstice Arch, Great Trough Lake & slackwater brick plain)' },
    { id: 'dilihan', name: 'Dilihan Province (Iziz Cut exclave & ally of the Clanthing)' },
    { id: 'serai', name: 'Serai & Silkhead Merchants (East Dam Soda Lake lbl=54 & northern Silk Trail)' },
    { id: 'korona', name: 'Korona & Imperial Highway Caravans (Shell-Silkhead trunk road)' }
  ];

  T.freeClansIds = [
    'fc.ardent', 'fc.malmdal', 'fc1.glens',
    'fc.osterbank', 'fc.koppardal', 'fc2.benches',
    'fc.kopparberg', 'fc.klippeport', 'fc.stannvik', 'fc.vaktberg', 'fc3.steadings',
    'fc.jarnhold', 'fc.salpetervik', 'fc4.steppe'
  ];

  T.neighbourIds = ['nb.jimjam', 'nb.dilihan', 'nb.serai', 'nb.korona'];

  function makeVeins(n, firstAmt, restAmt, grade) {
    var out = [], i;
    for (i = 0; i < n; i++) out.push({ amount: i === 0 ? firstAmt : restAmt, grade: grade });
    return out;
  }

  /* Pure escort-vs-bandit state rule shared with settlements/ardent/src/34-ar-rules.js */
  T.evaluateBandState = function (c) {
    c = c || {};
    var unpaid = D0(c.unpaidDays, 0);
    var silk = D0(c.silkCaravanIndex, 1.0);
    var harv = D0(c.harvestIndex, 1.0);
    if (unpaid > 14 || (silk < 0.30 && harv < 0.40)) {
      return { state: 'broken_kin_reiver', code: 'BF-04', discTurned: true, unpaidDays: unpaid };
    }
    return { state: 'silk_guard', code: 'MC-06', discTurned: false, unpaidDays: unpaid };
  };

  T.valley = function (o) {
    o = o || {};
    var autarky = !!o.autarky;
    var embargo = !!o.embargo;
    var K = D0(o.capitalScale, 100), Kv = D0(o.seatScale, 25), Kb = D0(o.glenScale, 150), Kn = D0(o.neighbourScale, 250);
    var yr = 365, importBufferDays = D0(o.importBufferDays, 70);
    var win = function (w) { var W = T.calendar.windows[w]; return (W[1] - W[0] + yr) % yr; };
    var rate = function (kgYr, crew, sc, days) { return kgYr / (Math.max(1, Math.round(crew / sc)) * sc * D0(days, yr) * 12); };
    var batchHrs = function (batchesYr, crew, sc) { return (Math.max(1, Math.round(crew / sc)) * sc * yr * 12) / batchesYr; };
    var eats = function (k) { return Object.assign({}, T.diet[k]); };
    var stockFor = function (diet, n, nativeDays, impDays, extra) {
      var s = {}, g, imp = { salt: 1, ceramics: 1, tea: 1, spices: 1, silk: 1 };
      for (g in diet) s[g] = Math.ceil(n * diet[g] * (imp[g] ? impDays : nativeDays));
      return Object.assign(s, extra || {});
    };
    var at = T.px, S = [], R = [], Xf = [];

    var relations = [
      { a: 'freeclans', b: 'dilihan', stance: 'allied', trade: autarky ? 'closed' : true },
      { a: 'dilihan', b: 'freeclans', stance: 'allied', trade: autarky ? 'closed' : true },
      { a: 'freeclans', b: 'jimjam', stance: 'friendly', trade: autarky ? 'closed' : true },
      { a: 'jimjam', b: 'freeclans', stance: 'friendly', trade: autarky ? 'closed' : true },
      { a: 'freeclans', b: 'serai', stance: 'friendly', trade: autarky ? 'closed' : true },
      { a: 'serai', b: 'freeclans', stance: 'friendly', trade: autarky ? 'closed' : true },
      { a: 'freeclans', b: 'korona', stance: embargo ? 'wary' : 'friendly', trade: autarky ? 'closed' : true },
      { a: 'korona', b: 'freeclans', stance: embargo ? 'wary' : 'friendly', trade: autarky ? 'closed' : true }
    ];

    /* ==================== FC1: ARDENT HEARTH-BOWL (12,500 = 8,000 + 650 + 3,850) ==================== */
    {
      var par = at(830, 553), nar = 8000;
      S.push({
        id: 'fc.ardent',
        name: 'Ardent (walled narrow-cobbled capital of the Nine Clans, Clanthing & Capital Maltings)',
        faction: 'freeclans', people: nar, x: par.x, z: par.z, scale: K, eats: eats('capital'), keepDays: 18,
        start: stockFor(T.diet.capital, nar, 185, importBufferDays, {
          grain: Math.ceil(nar * T.diet.capital.grain * 185) + 95000,
          potato: Math.ceil(nar * T.diet.capital.potato * 375),
          peat: 220000, timber: 90000, charcoal: 65000,
          copper: 36000, tin: 14000, iron: 24000, bronze: 28000,
          coal: 6500, casks: 18000, botanicals: 12000, wool: 14000,
          saltpeter: 15000, powder: 6000, weapons: 8000, tartan: 6000, scotch: 32000, tools: 7000
        }),
        works: [
          { id: 'ar.market', kind: 'market', name: 'Tolbooth Bourse, Silk-Factors Square & Burgh Warehouses', crew: 350, out: [], rate: 0 },
          { id: 'ar.copper_mine', kind: 'mine', name: 'North-Hill Malachite Copper Adits (copper:120)', crew: 250, out: ['copper'],
            rate: rate(125000, 250, K), site: { kind: 'copper_ore', grade: 120, veins: makeVeins(6, 260000, 300000, 120) } },
          { id: 'ar.tin_mine', kind: 'mine', name: 'North-Hill Cassiterite Tin Adits (tin:200)', crew: 150, out: ['tin'],
            rate: rate(38000, 150, K), site: { kind: 'tin_ore', grade: 200, veins: makeVeins(6, 90000, 110000, 200) } },
          { id: 'ar.bronze_foundry', kind: 'foundry', name: 'Three Reverberatory Bronze Bell, Pot-Still & Field-Gun Foundries', crew: 450,
            batch: { in: { copper: 40, tin: 10, charcoal: 20 }, out: { bronze: 50 }, hours: batchHrs(4800, 450, K) } },
          { id: 'ar.cooperage', kind: 'cooperage', name: 'Bronze-Hoop Highland Oak & Larch Whisky Cooperage (hl_rus_cooperage)', crew: 200,
            batch: { in: { timber: 20, bronze: 4 }, out: { casks: 20 }, hours: batchHrs(2600, 200, K) } },
          { id: 'ar.capital_distillery', kind: 'distillery', name: 'Ardent Stor-Branneriet: Capital Quadruple-Pagoda Scotch Distillery', crew: 250,
            batch: { in: { grain: 60, peat: 30, casks: 10, botanicals: 5 }, out: { scotch: 50 }, hours: batchHrs(1800, 250, K) } },
          { id: 'ar.hjart_distillery', kind: 'distillery', name: 'Hjart-Branneriet: 1st Clan-Seat Chartered Hearth-Peat Single-Malt Distillery', crew: 300,
            batch: { in: { grain: 60, peat: 30, casks: 10 }, out: { scotch: 50 }, hours: batchHrs(2700, 300, K) } },
          { id: 'ar.armourer', kind: 'smithy', name: 'Bell-Smiths & Kindzhal Armourers Guild (requires smithing coal)', crew: 250,
            batch: { in: { bronze: 16, iron: 16, coal: 10 }, out: { weapons: 32 }, hours: batchHrs(2600, 250, K) } },
          { id: 'ar.powder_mill', kind: 'mill', name: 'Non-Sparking Bronze-Mortar Powder Mill (hl_rus_saltpeter_mill)', crew: 150,
            batch: { in: { saltpeter: 30, charcoal: 10, bronze: 2 }, out: { powder: 40 }, hours: batchHrs(1400, 150, K) } },
          { id: 'ar.plaid_dyer', kind: 'weaver', name: 'Clan Tartan Loom-House & Woad/Falu Bronze-Cauldron Dyeworks', crew: 200,
            batch: { in: { wool: 20, botanicals: 6 }, out: { tartan: 20 }, hours: batchHrs(1400, 200, K) } },
          { id: 'ar.tool_smiths', kind: 'smithy', name: 'Burgh Charcoal Tool-Smiths', crew: 150,
            batch: { in: { iron: 10, charcoal: 8 }, out: { tools: 10 }, hours: batchHrs(1600, 150, K) } },
          { id: 'ar.apothecary', kind: 'apothecary', name: 'Juniper, Sky-Poppy & Ivan-Chai Botanical Still-Shops', crew: 100,
            out: ['botanicals'], rate: rate(18000, 100, K) }
        ]
      });

      var pmm = at(825, 561), nmm = 650;
      S.push({
        id: 'fc.malmdal',
        name: 'Malmdal (Cin Torgo-Vulf seat: upper hearth-glen frostoat, cooperage & tartan)',
        faction: 'freeclans', parent: 'fc.ardent', people: nmm, x: pmm.x, z: pmm.z, scale: Kv, eats: eats('seat'), keepDays: 20,
        start: stockFor(T.diet.seat, nmm, 240, importBufferDays, { timber: 28000, bronze: 6000, wool: 8000, botanicals: 5000, casks: 9000, tartan: 3000 }),
        works: [
          { id: 'mm.store', kind: 'market', name: 'Torgo-Vulf Silk & Cask Garth', crew: 30, out: [], rate: 0 },
          { id: 'mm.grain', kind: 'farmstead', name: 'Malmdal frostoat & barley terraces', crew: 160, out: ['grain'],
            rate: rate(145000, 160, Kv, win('fc.harvest')), season: 'fc.harvest' },
          { id: 'mm.cooperage', kind: 'cooperage', name: 'Malmdal Larch & Oak Stave Cooperage', crew: 90,
            batch: { in: { timber: 20, bronze: 4 }, out: { casks: 20 }, hours: batchHrs(1500, 90, Kv) } },
          { id: 'mm.tartan', kind: 'weaver', name: 'Torgo-Vulf Clan Plaid Looms', crew: 70,
            batch: { in: { wool: 20, botanicals: 6 }, out: { tartan: 20 }, hours: batchHrs(800, 70, Kv) } }
        ]
      });

      var pg1 = at(826, 557), ng1 = 3850;
      S.push({
        id: 'fc1.glens',
        name: 'FC1 Ardent Hearth-Bowl Glens (~12 frostoat, shieling, peat & charcoal crofts)',
        faction: 'freeclans', parent: 'fc.ardent', people: ng1, x: pg1.x, z: pg1.z, scale: Kb, eats: eats('glen'), keepDays: 22,
        start: stockFor(T.diet.glen, ng1, 310, importBufferDays, { grain: 520000, potato: 260000, peat: 180000, timber: 110000, charcoal: 75000, wool: 22000, botanicals: 16000 }),
        works: [
          { id: 'g1.store', kind: 'store', name: 'Hearth-Bowl glen granaries', crew: 100, out: [], rate: 0 },
          { id: 'g1.grain', kind: 'farmstead', name: 'Hearth-Bowl rain-fed frostoat & 6-row barley fields', crew: 1100, out: ['grain'],
            rate: rate(960000, 1100, Kb, win('fc.harvest')), season: 'fc.harvest' },
          { id: 'g1.potato', kind: 'farmstead', name: 'Frostroot & snow-potato garths', crew: 400, out: ['potato'],
            rate: rate(470000, 400, Kb, win('fc.harvest')), season: 'fc.harvest' },
          { id: 'g1.herds', kind: 'byre', name: 'Hearth-Bowl cattle & sheep shielings', crew: 500,
            herd: { out: ['dairy'], rate: 390000 / (Math.max(1, Math.round(2200 / Kb)) * Kb * yr * 24), animals: 2200, seasonRate: { summer: 1.25, winter: 0.75 } },
            pasture: { id: 'g1.shielings', window: 'fc.shielings' } },
          { id: 'g1.meat', kind: 'folds', name: 'Upland mutton & beef folds', crew: 300, out: ['meat'], rate: rate(245000, 300, Kb) },
          { id: 'g1.wool', kind: 'shearing', name: 'Glen shearing pens', crew: 100, out: ['wool'], rate: rate(36000, 100, Kb) },
          { id: 'g1.peat', kind: 'peat-bank', name: 'Heather-peat cuttings (malt & hearth fuel)', crew: 300, out: ['peat'],
            rate: rate(440000, 300, Kb, win('fc.peat')), season: 'fc.peat' },
          { id: 'g1.woods', kind: 'lumber', name: 'Subalpine fir, oak & birch woods', crew: 200, out: ['timber'], rate: rate(220000, 200, Kb) },
          { id: 'g1.charcoal', kind: 'charcoal', name: 'Birch & pine charcoal clamps', crew: 200, out: ['charcoal'], rate: rate(165000, 200, Kb) },
          { id: 'g1.botanicals', kind: 'forager', name: 'Juniper (#1 on map) & sky-poppy slopes', crew: 100, out: ['botanicals'], rate: rate(32000, 100, Kb) }
        ]
      });
    }

    /* ==================== FC2: NORTH-BENCH & MEKAM-ARU MARCH (4,700 = 850 + 600 + 3,250) ==================== */
    {
      var pob = at(858, 497), nob = 850;
      S.push({
        id: 'fc.osterbank',
        name: 'Osterbank (Cin Sjelk-Vac seat: 2nd Chartered Great Distillery — Caravan-Cask Gold Whiskey)',
        faction: 'freeclans', people: nob, x: pob.x, z: pob.z, scale: Kv, eats: eats('seat'), keepDays: 20,
        start: stockFor(T.diet.seat, nob, 260, importBufferDays, {
          grain: 195000, charcoal: 42000, wine_butts: 9500, scotch: 18000, peat: 25000
        }),
        works: [
          { id: 'ob.market', kind: 'market', name: 'Sjelk-Vac Caravan & Bonded Whiskey Garth', crew: 40, out: [], rate: 0 },
          { id: 'ob.grain', kind: 'farmstead', name: 'Osterbank Cfa shelf barley & frostoat fields', crew: 220, out: ['grain'],
            rate: rate(260000, 220, Kv, win('fc.harvest')), season: 'fc.harvest' },
          { id: 'ob.great_distillery', kind: 'distillery', name: 'Oster-Branneriet: 2nd Chartered Silk-Trail Wine-Cask Whiskey Distillery', crew: 180,
            batch: { in: { grain: 60, charcoal: 20, wine_butts: 10 }, out: { scotch: 50 }, hours: batchHrs(2500, 180, Kv) } }
        ]
      });

      var pkd = at(870, 476), nkd = 600;
      S.push({
        id: 'fc.koppardal',
        name: 'Koppardal (Cin Kopardal seat: north-scarp malachite copper & fir timber above Serai)',
        faction: 'freeclans', people: nkd, x: pkd.x, z: pkd.z, scale: Kv, eats: eats('seat'), keepDays: 20,
        start: stockFor(T.diet.seat, nkd, 220, importBufferDays, { copper: 28000, timber: 65000, charcoal: 32000, peat: 18000 }),
        works: [
          { id: 'kd.market', kind: 'market', name: 'Koppardal Ore & Timber Landing', crew: 30, out: [], rate: 0 },
          { id: 'kd.copper', kind: 'mine', name: 'North-Scarp Copper Skarn (copper:120)', crew: 150, out: ['copper'],
            rate: rate(95000, 150, Kv), site: { kind: 'copper_ore', grade: 120, veins: makeVeins(5, 220000, 260000, 120) } },
          { id: 'kd.timber', kind: 'lumber', name: 'Mekam-aru Fir & Larch Sawmills (wood:255)', crew: 140, out: ['timber'], rate: rate(240000, 140, Kv) },
          { id: 'kd.charcoal', kind: 'charcoal', name: 'Sweet Birch-Heart Charcoal Kilns', crew: 60, out: ['charcoal'], rate: rate(75000, 60, Kv) }
        ]
      });

      var pg2 = at(855, 510), ng2 = 3250;
      S.push({
        id: 'fc2.benches',
        name: 'FC2 North-Bench Crofts (~10 warm Cfa grain, orchard, dairy & timber benches)',
        faction: 'freeclans', parent: 'fc.osterbank', people: ng2, x: pg2.x, z: pg2.z, scale: Kb, eats: eats('glen'), keepDays: 22,
        start: stockFor(T.diet.glen, ng2, 310, importBufferDays, { grain: 560000, potato: 240000, timber: 95000, peat: 120000, botanicals: 14000 }),
        works: [
          { id: 'g2.store', kind: 'store', name: 'North-Bench tithe barns', crew: 100, out: [], rate: 0 },
          { id: 'g2.grain', kind: 'farmstead', name: 'Warm Cfa shelf grain terraces (farm=0.89)', crew: 1000, out: ['grain'],
            rate: rate(980000, 1000, Kb, win('fc.harvest')), season: 'fc.harvest' },
          { id: 'g2.potato', kind: 'farmstead', name: 'Bench root & rowan-apricot garths', crew: 300, out: ['potato'],
            rate: rate(360000, 300, Kb, win('fc.harvest')), season: 'fc.harvest' },
          { id: 'g2.herds', kind: 'byre', name: 'Bench dairy & meadow cattle', crew: 400,
            herd: { out: ['dairy'], rate: 310000 / (Math.max(1, Math.round(1800 / Kb)) * Kb * yr * 24), animals: 1800, seasonRate: { summer: 1.25, winter: 0.75 } },
            pasture: { id: 'g2.shielings', window: 'fc.shielings' } },
          { id: 'g2.meat', kind: 'folds', name: 'Bench livestock folds', crew: 200, out: ['meat'], rate: rate(185000, 200, Kb) },
          { id: 'g2.peat', kind: 'peat-bank', name: 'Upper bench turf cuttings', crew: 150, out: ['peat'],
            rate: rate(140000, 150, Kb, win('fc.peat')), season: 'fc.peat' },
          { id: 'g2.timber', kind: 'lumber', name: 'Bench fir & birch stands', crew: 200, out: ['timber'], rate: rate(190000, 200, Kb) },
          { id: 'g2.botanicals', kind: 'forager', name: 'Juniper & camphor-herb benches', crew: 100, out: ['botanicals'], rate: rate(26000, 100, Kb) }
        ]
      });
    }

    /* ==================== FC3: UPPER CUT, WEST-LODE & SCREAMER-RIM (6,700 = 900+700+550+350+4,200) ==================== */
    {
      var pkb = at(798, 554), nkb = 900;
      S.push({
        id: 'fc.kopparberg',
        name: 'Kopparberg (Cin Klip-Cip west-lode smelter: copper:130 + tin:200 + iron:255)',
        faction: 'freeclans', people: nkb, x: pkb.x, z: pkb.z, scale: Kv, eats: eats('seat'), keepDays: 20,
        start: stockFor(T.diet.seat, nkb, 195, importBufferDays, {
          copper: 45000, tin: 22000, iron: 42000, charcoal: 55000, bronze: 22000, tools: 6000, peat: 25000
        }),
        works: [
          { id: 'kb.market', kind: 'market', name: 'West-Lode Ingot & Mule Weigh-House', crew: 40, out: [], rate: 0 },
          { id: 'kb.copper', kind: 'mine', name: 'Kopparberg Deep Copper Lode (copper:130)', crew: 160, out: ['copper'],
            rate: rate(155000, 160, Kv), site: { kind: 'copper_ore', grade: 130, veins: makeVeins(6, 320000, 360000, 130) } },
          { id: 'kb.iron', kind: 'mine', name: 'Kopparberg Magnetite & Bloomery Works (iron:255)', crew: 150, out: ['iron'],
            rate: rate(125000, 150, Kv), site: { kind: 'iron_ore', grade: 255, veins: makeVeins(8, 350000, 400000, 255) } },
          { id: 'kb.bronze', kind: 'foundry', name: 'West-Lode Charcoal Bronze Smelter', crew: 110,
            batch: { in: { copper: 40, tin: 10, charcoal: 20 }, out: { bronze: 50 }, hours: batchHrs(2200, 110, Kv) } },
          { id: 'kb.tools', kind: 'smithy', name: 'Kopparberg Pick & Ploughshare Smiths', crew: 60,
            batch: { in: { iron: 10, charcoal: 8 }, out: { tools: 10 }, hours: batchHrs(950, 60, Kv) } }
        ]
      });

      var psv = at(804, 558), nsv = 550;
      S.push({
        id: 'fc.stannvik',
        name: 'Stannvik (Cin Klip-Cip cassiterite tin:200 mine works)',
        faction: 'freeclans', parent: 'fc.kopparberg', people: nsv, x: psv.x, z: psv.z, scale: Kv, eats: eats('seat'), keepDays: 20,
        start: stockFor(T.diet.seat, nsv, 195, importBufferDays, { tin: 34000, peat: 16000 }),
        works: [
          { id: 'sv.store', kind: 'market', name: 'Cassiterite Tin Stamp-Mill Store', crew: 30, out: [], rate: 0 },
          { id: 'sv.tin', kind: 'mine', name: 'Stannvik Cassiterite Tin Lode (tin:200)', crew: 240, out: ['tin'],
            rate: rate(92000, 240, Kv), site: { kind: 'tin_ore', grade: 200, veins: makeVeins(6, 220000, 250000, 200) } }
        ]
      });

      var pkp = at(744, 596), nkp = 700;
      S.push({
        id: 'fc.klippeport',
        name: 'Klippeport (Cin Klip-Cip North Cut Sill gate +818 m & 3rd Chartered Great Scotch Distillery)',
        faction: 'freeclans', people: nkp, x: pkp.x, z: pkp.z, scale: Kv, eats: eats('seat'), keepDays: 20,
        start: stockFor(T.diet.seat, nkp, 225, importBufferDays, {
          grain: 155000, charcoal: 38000, wine_butts: 9000, botanicals: 6000, tin: 15000, scotch: 16000, peat: 20000
        }),
        works: [
          { id: 'kp.market', kind: 'market', name: 'Upper Cut Sill Toll-Gate & Bonded Marani Vaults', crew: 40, out: [], rate: 0 },
          { id: 'kp.grain', kind: 'farmstead', name: 'Warm Cut-Gorge barley & frostoat terraces (+818 m)', crew: 120, out: ['grain'],
            rate: rate(145000, 120, Kv, win('fc.harvest')), season: 'fc.harvest' },
          { id: 'kp.tin', kind: 'mine', name: 'Cut-Sill Cassiterite Stream-Tin Works (tin:200)', crew: 80, out: ['tin'],
            rate: rate(28000, 80, Kv), site: { kind: 'tin_ore', grade: 200, veins: makeVeins(5, 80000, 95000, 200) } },
          { id: 'kp.great_distillery', kind: 'distillery', name: 'Klippe-Branneriet: 3rd Chartered Cut-Glen Smoked-Oak Scotch Distillery', crew: 160,
            batch: { in: { grain: 60, charcoal: 20, wine_butts: 10, botanicals: 4 }, out: { scotch: 50 }, hours: batchHrs(2300, 160, Kv) } }
        ]
      });

      var pvb = at(816, 616), nvb = 350;
      S.push({
        id: 'fc.vaktberg',
        name: 'Vaktberg (+4,250 m Cin Fajr-Vakt alpine Screamer-rim watch fort & cresset line)',
        faction: 'freeclans', parent: 'fc.ardent', people: nvb, x: pvb.x, z: pvb.z, scale: Kv, eats: eats('fort'), keepDays: 28,
        start: stockFor(T.diet.fort, nvb, 210, importBufferDays, { peat: 24000, weapons: 2000 }),
        works: [
          { id: 'vb.beacons', kind: 'garrison', name: 'Screamer-Rim Peat Cressets & Watch Koshki', crew: 180, out: [], rate: 0 }
        ]
      });

      var pg3 = at(788, 568), ng3 = 4200;
      S.push({
        id: 'fc3.steadings',
        name: 'FC3 West-Lode & Cut Steadings (~14 upland herding, peat, charcoal, saltpeter & gorge crofts)',
        faction: 'freeclans', parent: 'fc.kopparberg', people: ng3, x: pg3.x, z: pg3.z, scale: Kb, eats: eats('glen'), keepDays: 22,
        start: stockFor(T.diet.glen, ng3, 290, importBufferDays, {
          grain: 430000, potato: 280000, peat: 190000, charcoal: 90000, timber: 95000, wool: 28000, saltpeter: 25000
        }),
        works: [
          { id: 'g3.store', kind: 'store', name: 'West-Lode steading stores', crew: 100, out: [], rate: 0 },
          { id: 'g3.grain', kind: 'farmstead', name: 'Sheltered Cut & West-Lode frostoat pockets', crew: 800, out: ['grain'],
            rate: rate(620000, 800, Kb, win('fc.harvest')), season: 'fc.harvest' },
          { id: 'g3.potato', kind: 'farmstead', name: 'High-glen frostroot & snow-potato beds', crew: 400, out: ['potato'],
            rate: rate(460000, 400, Kb, win('fc.harvest')), season: 'fc.harvest' },
          { id: 'g3.herds', kind: 'byre', name: 'Highland sheep & yak-cattle shielings (5,037 km2 past-eq)', crew: 600,
            herd: { out: ['dairy'], rate: 430000 / (Math.max(1, Math.round(2800 / Kb)) * Kb * yr * 24), animals: 2800, seasonRate: { summer: 1.3, winter: 0.7 } },
            pasture: { id: 'g3.shielings', window: 'fc.shielings' } },
          { id: 'g3.meat', kind: 'folds', name: 'West-Lode drover folds', crew: 300, out: ['meat'], rate: rate(270000, 300, Kb) },
          { id: 'g3.wool', kind: 'shearing', name: 'Upland fleece folds', crew: 100, out: ['wool'], rate: rate(44000, 100, Kb) },
          { id: 'g3.peat', kind: 'peat-bank', name: 'High-moor peat mosses', crew: 300, out: ['peat'],
            rate: rate(380000, 300, Kb, win('fc.peat')), season: 'fc.peat' },
          { id: 'g3.charcoal', kind: 'charcoal', name: 'Alder & birch smelter-charcoal clamps', crew: 200, out: ['charcoal'], rate: rate(185000, 200, Kb) },
          { id: 'g3.timber', kind: 'lumber', name: 'Cut-rim timber camps', crew: 200, out: ['timber'], rate: rate(180000, 200, Kb) },
          { id: 'g3.saltpeter', kind: 'pans', name: 'Rock-shelter saltpeter scrapings (GoodY 506)', crew: 100, out: ['saltpeter'], rate: rate(55000, 100, Kb) }
        ]
      });
    }

    /* ==================== FC4: EAST-RIM SALTPETER & SILK-TRAIL MARCH (3,300 = 600 + 450 + 2,250) ==================== */
    {
      var pjh = at(860, 562), njh = 600;
      S.push({
        id: 'fc.jarnhold',
        name: 'Jarnhold (Cin Jern-Hors steppe-bench: #3 planetary highland mounts, iron:180 & gun-limbers)',
        faction: 'freeclans', people: njh, x: pjh.x, z: pjh.z, scale: Kv, eats: eats('seat'), keepDays: 20,
        start: stockFor(T.diet.seat, njh, 185, importBufferDays, { iron: 24000, charcoal: 18000, mounts: 90, peat: 18000, tools: 4000 }),
        works: [
          { id: 'jh.stables', kind: 'stables', name: 'Jarnhold Caravanserai & Highland Mount Studs (hl_rus_caravan_stables)', crew: 40, out: [], rate: 0 },
          { id: 'jh.mounts', kind: 'stud', name: 'East-Bench Hardy Charger & Pack-Mule Studs (#3 on map)', crew: 140, out: ['mounts'], rate: rate(180, 140, Kv) },
          { id: 'jh.iron', kind: 'mine', name: 'Jarnhold Steppe Ironstone Mine (iron:180)', crew: 110, out: ['iron'],
            rate: rate(65000, 110, Kv), site: { kind: 'iron_ore', grade: 180, veins: makeVeins(6, 180000, 210000, 180) } },
          { id: 'jh.smiths', kind: 'smithy', name: 'Farrier & Gun-Limber Smiths', crew: 50,
            batch: { in: { iron: 10, charcoal: 8 }, out: { tools: 10 }, hours: batchHrs(750, 50, Kv) } }
        ]
      });

      var psp = at(866, 526), nsp = 450;
      S.push({
        id: 'fc.salpetervik',
        name: 'Salpetervik (Cin Rjet-Kling saltpeter:190 powder works & MC-06 / BF-04 Silk-Trail staging)',
        faction: embargo ? 'brokenkin' : 'freeclans', people: nsp, x: psp.x, z: psp.z, scale: Kv, eats: eats('seat'), keepDays: 18,
        start: stockFor(T.diet.seat, nsp, 175, importBufferDays, { saltpeter: 38000, charcoal: 16000, bronze: 4000, powder: 10000, peat: 14000 }),
        works: [
          { id: 'sp.muster', kind: 'market', name: 'Silk-Trail Escort Muster & Saltpeter Store', crew: 40, out: [], rate: 0 },
          { id: 'sp.saltpeter', kind: 'pans', name: 'East-Scarp Saltpeter Leaching Vats (#4 on map, max 190)', crew: 140, out: ['saltpeter'],
            rate: rate(95000, 140, Kv), site: { kind: 'evaporite', grade: 190, amount: 1800000, regen: 120 } },
          { id: 'sp.powder', kind: 'mill', name: 'Rjet-Kling Bronze-Mortar Powder Mill', crew: 70,
            batch: { in: { saltpeter: 30, charcoal: 10, bronze: 2 }, out: { powder: 40 }, hours: batchHrs(1100, 70, Kv) } }
        ]
      });

      var pg4 = at(865, 552), ng4 = 2250;
      S.push({
        id: 'fc4.steppe',
        name: 'FC4 East-Rim Horse-Glens (~8 semi-arid BSk horse, sheep & saltpeter steadings)',
        faction: 'freeclans', parent: 'fc.jarnhold', people: ng4, x: pg4.x, z: pg4.z, scale: Kb, eats: eats('steppe'), keepDays: 20,
        start: stockFor(T.diet.steppe, ng4, 210, importBufferDays, {
          grain: 165000, potato: 95000, dairy: 110000, meat: 95000, wool: 18000, mounts: 60, saltpeter: 22000
        }),
        works: [
          { id: 'g4.store', kind: 'store', name: 'East-Rim horse-glen folds', crew: 100, out: [], rate: 0 },
          { id: 'g4.grain', kind: 'farmstead', name: 'Dryland dustmillet & frostoat strips (BSk grain-deficit)', crew: 300, out: ['grain'],
            rate: rate(190000, 300, Kb, win('fc.harvest')), season: 'fc.harvest' },
          { id: 'g4.potato', kind: 'farmstead', name: 'Steppe sweetroot plots', crew: 200, out: ['potato'],
            rate: rate(115000, 200, Kb, win('fc.harvest')), season: 'fc.harvest' },
          { id: 'g4.herds', kind: 'byre', name: 'Steppe mare & sheep herds (2,580 km2 past-eq)', crew: 500,
            herd: { out: ['dairy'], rate: 285000 / (Math.max(1, Math.round(2100 / Kb)) * Kb * yr * 24), animals: 2100, seasonRate: { summer: 1.25, winter: 0.75 } },
            pasture: { id: 'g4.shielings', window: 'fc.shielings' } },
          { id: 'g4.meat', kind: 'folds', name: 'Steppe livestock droves', crew: 300, out: ['meat'], rate: rate(195000, 300, Kb) },
          { id: 'g4.wool', kind: 'shearing', name: 'Steppe fleece pens', crew: 100, out: ['wool'], rate: rate(26000, 100, Kb) },
          { id: 'g4.mounts', kind: 'stud', name: 'Out-glen horse herds', crew: 100, out: ['mounts'], rate: rate(95, 100, Kb) },
          { id: 'g4.saltpeter', kind: 'pans', name: 'Dry-bench nitre crusts', crew: 100, out: ['saltpeter'], rate: rate(48000, 100, Kb) }
        ]
      });
    }

    /* ==================== INTERNAL POLYGON ROADS (ALWAYS ACTIVE IN BOTH AUTARKY & TRADE) ==================== */
    var mins = function (km) { return Math.max(180, Math.round(km / 28 * 1440)); };
    R.push(
      /* FC1 internal lanes */
      { id: 'fc.lane.fc1-glens', from: 'fc1.glens', to: 'fc.ardent', minutes: mins(14), cap: 45000, carriers: 6, stagger: 120, keep: 18, want: 45,
        goods: { 'fc1.glens': ['grain', 'potato', 'dairy', 'meat', 'wool', 'peat', 'timber', 'charcoal', 'botanicals'],
                 'fc.ardent': ['salt', 'ceramics', 'tea', 'tools', 'tartan'] },
        expect: { 'fc.ardent': { grain: 1450, potato: 620, dairy: 560, meat: 380, peat: 950, timber: 320, charcoal: 380, wool: 85, botanicals: 70 } } },
      { id: 'fc.lane.malmdal', from: 'fc.malmdal', to: 'fc.ardent', minutes: mins(18), cap: 24000, carriers: 3, stagger: 180, keep: 16, want: 40,
        goods: { 'fc.malmdal': ['grain', 'casks', 'tartan'],
                 'fc.ardent': ['timber', 'bronze', 'wool', 'botanicals', 'salt', 'ceramics', 'tea', 'spices', 'silk', 'peat', 'tools', 'meat', 'dairy', 'potato'] },
        expect: { 'fc.ardent': { casks: 80, tartan: 35 }, 'fc.malmdal': { timber: 90, bronze: 18, wool: 40, botanicals: 14 } } },

      /* FC2 internal & Ardent bench trail */
      { id: 'fc.lane.fc2-benches', from: 'fc2.benches', to: 'fc.osterbank', minutes: mins(26), cap: 38000, carriers: 5, stagger: 180, keep: 18, want: 45,
        goods: { 'fc2.benches': ['grain', 'potato', 'dairy', 'meat', 'peat', 'timber', 'botanicals'],
                 'fc.osterbank': ['salt', 'ceramics', 'tea', 'spices', 'tools', 'tartan'] },
        expect: { 'fc.osterbank': { grain: 950, potato: 140, dairy: 130, meat: 90, peat: 80, timber: 220, botanicals: 45 } } },
      { id: 'fc.lane.koppardal-ob', from: 'fc.koppardal', to: 'fc.osterbank', minutes: mins(48), cap: 28000, carriers: 3, stagger: 240, keep: 15, want: 42,
        goods: { 'fc.koppardal': ['copper', 'timber', 'charcoal'],
                 'fc.osterbank': ['grain', 'potato', 'dairy', 'meat', 'salt', 'ceramics', 'tea', 'spices', 'tools', 'tartan', 'peat'] },
        expect: { 'fc.osterbank': { charcoal: 150, copper: 200, timber: 350 } } },
      { id: 'fc.road.north-bench', from: 'fc.osterbank', to: 'fc.ardent', minutes: mins(128), cap: 42000, carriers: 6, stagger: 360, keep: 18, want: 48,
        goods: { 'fc.osterbank': ['grain', 'copper', 'timber', 'scotch', 'salt', 'silk', 'tea', 'spices'],
                 'fc.ardent': ['tools', 'tartan', 'ceramics', 'bronze', 'weapons'] },
        expect: { 'fc.ardent': { grain: 650, copper: 180, silk: 12, tea: 35, spices: 10 }, 'fc.osterbank': { tools: 8, tartan: 6, ceramics: 6 } } },

      /* FC3 West-Lode Ore Road & Screamer-Rim supply */
      { id: 'fc.lane.stannvik', from: 'fc.stannvik', to: 'fc.kopparberg', minutes: mins(16), cap: 22000, carriers: 3, stagger: 180, keep: 16, want: 42,
        goods: { 'fc.stannvik': ['tin'],
                 'fc.kopparberg': ['grain', 'potato', 'dairy', 'meat', 'salt', 'ceramics', 'tea', 'spices', 'peat', 'tartan', 'tools'] },
        expect: { 'fc.kopparberg': { tin: 240 } } },
      { id: 'fc.lane.fc3-steadings', from: 'fc3.steadings', to: 'fc.kopparberg', minutes: mins(28), cap: 40000, carriers: 5, stagger: 180, keep: 18, want: 45,
        goods: { 'fc3.steadings': ['grain', 'potato', 'dairy', 'meat', 'wool', 'peat', 'charcoal', 'timber', 'saltpeter'],
                 'fc.kopparberg': ['salt', 'ceramics', 'tea', 'tools', 'tartan'] },
        expect: { 'fc.kopparberg': { grain: 350, potato: 220, dairy: 220, meat: 160, peat: 180, charcoal: 380, wool: 95, saltpeter: 110 } } },
      { id: 'fc.road.west-lode', from: 'fc.kopparberg', to: 'fc.ardent', minutes: mins(68), cap: 48000, carriers: 6, stagger: 240, keep: 16, want: 48,
        goods: { 'fc.kopparberg': ['copper', 'tin', 'iron', 'bronze', 'charcoal', 'wool', 'saltpeter', 'tools'],
                 'fc.ardent': ['grain', 'salt', 'ceramics', 'tea', 'spices', 'tartan', 'casks', 'botanicals', 'weapons', 'powder', 'scotch'] },
        expect: { 'fc.ardent': { copper: 260, tin: 160, iron: 260, bronze: 180, wool: 75, saltpeter: 90 } } },
      { id: 'fc.road.cut-sill', from: 'fc.klippeport', to: 'fc.kopparberg', minutes: mins(138), cap: 36000, carriers: 5, stagger: 360, keep: 16, want: 48,
        goods: { 'fc.klippeport': ['tin', 'coal', 'wine_butts', 'salt', 'scotch'],
                 'fc.kopparberg': ['charcoal', 'bronze', 'iron', 'tools', 'tartan', 'meat', 'dairy', 'potato', 'peat', 'powder', 'weapons'] },
        expect: { 'fc.kopparberg': { coal: 95, salt: 65 }, 'fc.klippeport': { charcoal: 140, bronze: 90, tools: 4, tartan: 3, powder: 25, weapons: 20 } } },
      { id: 'fc.lane.klippe-botanicals', from: 'fc.ardent', to: 'fc.klippeport', minutes: mins(195), cap: 26000, carriers: 4, stagger: 480, keep: 16, want: 50,
        goods: { 'fc.ardent': ['botanicals', 'bronze', 'weapons', 'powder', 'tartan', 'ceramics'],
                 'fc.klippeport': ['coal', 'salt', 'scotch'] },
        expect: { 'fc.klippeport': { botanicals: 30, bronze: 80, weapons: 25, powder: 25 }, 'fc.ardent': { coal: 85 } } },
      { id: 'fc.lane.vaktberg', from: 'fc.ardent', to: 'fc.vaktberg', minutes: mins(132), cap: 18000, carriers: 3, stagger: 360, keep: 16, want: 50,
        goods: { 'fc.ardent': ['grain', 'potato', 'dairy', 'meat', 'salt', 'ceramics', 'tea', 'peat', 'tartan', 'tools', 'weapons'],
                 'fc.vaktberg': [] } },

      /* FC4 East-Rim & Spur S-A internal links */
      { id: 'fc.lane.fc4-steppe', from: 'fc4.steppe', to: 'fc.jarnhold', minutes: mins(22), cap: 34000, carriers: 4, stagger: 180, keep: 16, want: 45,
        goods: { 'fc4.steppe': ['dairy', 'meat', 'wool', 'mounts', 'saltpeter'],
                 'fc.jarnhold': ['grain', 'potato', 'salt', 'ceramics', 'tea', 'tools'] },
        expect: { 'fc.jarnhold': { dairy: 180, meat: 140, wool: 55, mounts: 0.25, saltpeter: 110 },
                  'fc4.steppe': { grain: 260, potato: 140, salt: 48, tools: 3 } } },
      { id: 'fc.lane.salpetervik', from: 'fc.jarnhold', to: 'fc.salpetervik', minutes: mins(76), cap: 28000, carriers: 4, stagger: 240, keep: 15, want: 45,
        goods: { 'fc.jarnhold': ['grain', 'potato', 'dairy', 'meat', 'peat', 'charcoal', 'bronze', 'tools', 'tartan', 'ceramics'],
                 'fc.salpetervik': ['saltpeter', 'powder', 'salt', 'silk', 'tea', 'spices'] },
        expect: { 'fc.salpetervik': { grain: 160, potato: 60, dairy: 55, meat: 35, charcoal: 35, bronze: 8, peat: 22 },
                  'fc.jarnhold': { saltpeter: 140, powder: 60 } } },
      { id: 'fc.road.east-spur', from: 'fc.jarnhold', to: 'fc.ardent', minutes: mins(64), cap: 44000, carriers: 6, stagger: 240, keep: 15, want: 48,
        goods: { 'fc.jarnhold': ['mounts', 'iron', 'wool', 'saltpeter', 'powder', 'meat', 'dairy', 'salt', 'silk'],
                 'fc.ardent': ['grain', 'potato', 'peat', 'charcoal', 'bronze', 'tartan', 'ceramics', 'tea', 'spices', 'scotch', 'weapons'] },
        expect: { 'fc.ardent': { mounts: 0.45, saltpeter: 130, iron: 95 },
                  'fc.jarnhold': { charcoal: 60, bronze: 15, peat: 55, grain: 80, potato: 180, scotch: 140, weapons: 35 } } }
    );

    /* ==================== FOUR NEIGHBOUR TRADING ENDPOINTS & CORRIDORS R1-R4 ==================== */
    /* Neighbours consume their own staples plus continental off-take of Free-Clans signature exports (scotch, bronze,
       mounts, powder, saltpeter, weapons, tartan, timber, copper & tin) when open trade is active; in autarky they keep
       zero Free-Clans import appetite so closed borders leave neighbour ledgers self-contained too. */
    {
      /* 1. KINGDOM OF JIMJAM (745,546) — R2 Scarp Road (171 km): rice/grain, salt, ceramics <-> bronze, Hearth-Peat scotch, mounts, tartan, timber */
      var pjj = at(745, 546), njj = 22000;
      var jjEats = Object.assign({}, T.diet.neighbour, autarky ? {} : {
        bronze: 7.5 * D, scotch: 7.2 * D, tartan: 1.0 * D, timber: 5.5 * D, mounts: 0.0045 * D
      });
      S.push({
        id: 'nb.jimjam',
        name: 'Jimjam (Raja\'s Solstice-Arch metropolis: rice/grain, Uppu-metu salt & slackwater kiln ceramics)',
        faction: 'jimjam', people: njj, x: pjj.x, z: pjj.z, scale: Kn, eats: jjEats, keepDays: 15,
        start: stockFor(T.diet.neighbour, njj, 120, 120, {
          grain: 4800000, salt: 650000, ceramics: 180000, meat: 450000, tea: 90000, spices: 45000, tools: 45000,
          bronze: 30000, scotch: 28000, tartan: 4500, timber: 25000, mounts: 25
        }),
        works: [
          { id: 'jj.market', kind: 'market', name: 'Jimjam Canal Bourse & Almanac Customs', crew: 400, out: [], rate: 0 },
          { id: 'jj.grain', kind: 'farmstead', name: 'Tamarai-aru & Floodzone irrigated rice/emmer paddies', crew: 5200, out: ['grain'], rate: rate(4900000, 5200, Kn) },
          { id: 'jj.meat', kind: 'folds', name: 'Lake-trough water-buffalo & fishery', crew: 900, out: ['meat'], rate: rate(540000, 900, Kn) },
          { id: 'jj.salt', kind: 'pans', name: 'Uppu-metu & Dam-bench halite pans', crew: 400, out: ['salt'], rate: rate(380000, 400, Kn) },
          { id: 'jj.ceramics', kind: 'kiln', name: 'Slackwater clay=255 pottery & Barada silica-glass kilns', crew: 300, out: ['ceramics'], rate: rate(95000, 300, Kn) },
          { id: 'jj.tea', kind: 'tea-garden', name: 'Kulir-kuppam bench tea gardens', crew: 200, out: ['tea'], rate: rate(48000, 200, Kn) },
          { id: 'jj.tools', kind: 'smithy', name: 'Jimjam bronze & iron workshops', crew: 200, out: ['tools'], rate: rate(18000, 200, Kn) }
        ]
      });

      /* 2. DILIHAN & KOTGETA (737,604) — R1 Cut Sill Pass: wine_butts, Visas smithing coal, salt <-> bronze, tin, Cut-Glen scotch, weapons, powder */
      var pdl = at(737, 604), ndl = 12000;
      var dlEats = Object.assign({}, T.diet.neighbour, autarky ? {} : {
        scotch: 8.5 * D, bronze: 3.2 * D, tin: 2.2 * D, weapons: 1.6 * D, powder: 1.5 * D
      });
      S.push({
        id: 'nb.dilihan',
        name: 'Dilihan & Kotgeta (Iziz Cut exclave & Clanthing ally: wine butts, Visas smithing coal & salt)',
        faction: 'dilihan', people: ndl, x: pdl.x, z: pdl.z, scale: Kn, eats: dlEats, keepDays: 15,
        start: stockFor(T.diet.neighbour, ndl, 120, 120, {
          grain: 2600000, wine_butts: 190000, coal: 180000, salt: 320000, ceramics: 65000, tea: 45000, spices: 28000,
          scotch: 20000, bronze: 10000, tin: 8000, weapons: 6000, powder: 6000
        }),
        works: [
          { id: 'dl.market', kind: 'market', name: 'Kotgeta Cut-Gate Caravanserai', crew: 300, out: [], rate: 0 },
          { id: 'dl.grain', kind: 'farmstead', name: 'Cut terrace farms', crew: 2800, out: ['grain'], rate: rate(2350000, 2800, Kn) },
          { id: 'dl.meat', kind: 'folds', name: 'Cut valley stock', crew: 500, out: ['meat'], rate: rate(300000, 500, Kn) },
          { id: 'dl.wine', kind: 'vineyard', name: 'Dilihan & Eternian seasoned wine-butt cellars', crew: 300, out: ['wine_butts'], rate: rate(95000, 300, Kn) },
          { id: 'dl.coal', kind: 'mine', name: 'Visas D4 high-grade smithing coal colliery (coal:182)', crew: 300, out: ['coal'], rate: rate(110000, 300, Kn) },
          { id: 'dl.salt', kind: 'pans', name: 'Cut Salt Lake lbl=98 brine works', crew: 200, out: ['salt'], rate: rate(165000, 200, Kn) },
          { id: 'dl.tools', kind: 'smithy', name: 'Dilihan tool works', crew: 100, out: ['tools'], rate: rate(10000, 100, Kn) }
        ]
      });

      /* 3. SERAI & SILKHEAD (826,478) — R3 Mekam-aru Descent: Soda-Lake salt, Silk-Trail silk, tea, spices, wine_butts <-> Gold Whiskey, timber, copper, botanicals */
      var psr = at(826, 478), nsr = 7500;
      var srEats = Object.assign({}, T.diet.neighbour, autarky ? {} : {
        scotch: 14.0 * D, timber: 22.0 * D, copper: 7.5 * D, botanicals: 2.0 * D
      });
      S.push({
        id: 'nb.serai',
        name: 'Serai & Silkhead Barge Wharves (East Dam Soda Lake lbl=54 & Silk-Trail terminus)',
        faction: 'serai', people: nsr, x: psr.x, z: psr.z, scale: Kn, eats: srEats, keepDays: 15,
        start: stockFor(T.diet.neighbour, nsr, 120, 120, {
          grain: 1700000, salt: 480000, silk: 75000, tea: 95000, spices: 55000, wine_butts: 110000, ceramics: 60000,
          scotch: 22000, timber: 35000, copper: 15000, botanicals: 5000
        }),
        works: [
          { id: 'sr.market', kind: 'market', name: 'Serai Soda-Lake Barge Quay & Caravanserai', crew: 200, out: [], rate: 0 },
          { id: 'sr.grain', kind: 'farmstead', name: 'Mekam-aru delta & Silkhead shore farms', crew: 1800, out: ['grain'], rate: rate(1500000, 1800, Kn) },
          { id: 'sr.meat', kind: 'folds', name: 'Shore fisheries & stock', crew: 300, out: ['meat'], rate: rate(190000, 300, Kn) },
          { id: 'sr.salt', kind: 'pans', name: 'Soda Lake lbl=54 halite & trona pans', crew: 300, out: ['salt'], rate: rate(240000, 300, Kn) },
          { id: 'sr.silk', kind: 'weaver', name: 'Silkhead & Spider-Lake raw silk & brocade bales', crew: 200, out: ['silk'], rate: rate(32000, 200, Kn) },
          { id: 'sr.tea', kind: 'tea-garden', name: 'Silk-Trail brick-tea & spice warehouses', crew: 200, out: ['tea'], rate: rate(45000, 200, Kn) },
          { id: 'sr.spices', kind: 'spice-house', name: 'Silk-Trail caravan spices', crew: 100, out: ['spices'], rate: rate(22000, 100, Kn) },
          { id: 'sr.wine', kind: 'vineyard', name: 'Silkhead mulberry & wine casks', crew: 150, out: ['wine_butts'], rate: rate(55000, 150, Kn) },
          { id: 'sr.tools', kind: 'smithy', name: 'Wharf smiths', crew: 100, out: ['tools'], rate: rate(6000, 100, Kn) }
        ]
      });

      /* 4. KORONA K10 & IMPERIAL HIGHWAY (912,556) — R4 Spur S-A: MC-06 retainers + grain/salt/silk <-> saltpeter, powder, mounts, weapons, scotch */
      var pkr = at(912, 556), nkr = 9000;
      var krEats = Object.assign({}, T.diet.neighbour, autarky ? {} : {
        saltpeter: 7.0 * D, powder: 3.5 * D, scotch: 5.0 * D, mounts: 0.0085 * D, weapons: 1.5 * D
      });
      S.push({
        id: 'nb.korona',
        name: 'Korona K10 & Shell-Silkhead Imperial Highway Caravanserai',
        faction: 'korona', people: nkr, x: pkr.x, z: pkr.z, scale: Kn, eats: krEats, keepDays: 15,
        start: stockFor(T.diet.neighbour, nkr, 120, 120, {
          grain: 2200000, salt: 280000, silk: 55000, tea: 65000, ceramics: 65000, spices: 30000,
          saltpeter: 15000, powder: 8000, scotch: 14000, mounts: 25, weapons: 5000
        }),
        works: [
          { id: 'kr.market', kind: 'market', name: 'K10 Imperial Highway Staging Post', crew: 200, out: [], rate: 0 },
          { id: 'kr.grain', kind: 'farmstead', name: 'Korona bench farms', crew: 2200, out: ['grain'], rate: rate(1950000, 2200, Kn) },
          { id: 'kr.meat', kind: 'folds', name: 'Tepui stock', crew: 400, out: ['meat'], rate: rate(230000, 400, Kn) },
          { id: 'kr.salt', kind: 'pans', name: 'Eastern highway salt stores', crew: 200, out: ['salt'], rate: rate(140000, 200, Kn) },
          { id: 'kr.silk', kind: 'weaver', name: 'Ham-Tsek & Korona Silk-Trail bales', crew: 150, out: ['silk'], rate: rate(24000, 150, Kn) },
          { id: 'kr.tea', kind: 'tea-garden', name: 'Highway tea & porcelain chests', crew: 150, out: ['tea'], rate: rate(30000, 150, Kn) },
          { id: 'kr.ceramics', kind: 'kiln', name: 'Highway kilnware', crew: 100, out: ['ceramics'], rate: rate(25000, 100, Kn) },
          { id: 'kr.tools', kind: 'smithy', name: 'Highway smiths', crew: 100, out: ['tools'], rate: rate(8000, 100, Kn) }
        ]
      });

      if (!autarky) {
        /* R2: Ardent <-> Jimjam Scarp Road (171 km) */
        R.push({
          id: 'fc.trade.jimjam', from: 'fc.ardent', to: 'nb.jimjam', minutes: mins(171), cap: 65000, carriers: 8, stagger: 360, keep: 15, want: 55,
          goods: {
            'fc.ardent': ['bronze', 'scotch', 'mounts', 'tartan', 'wool', 'timber'],
            'nb.jimjam': ['grain', 'salt', 'ceramics', 'tea']
          },
          expect: {
            'fc.ardent': { grain: 1150, salt: 380, ceramics: 52, tea: 45 },
            'nb.jimjam': { bronze: 320, scotch: 450, mounts: 0.35, tartan: 65, timber: 260 }
          }
        });

        /* R1: Klippeport <-> Dilihan Cut Sill Pass (34 km) */
        R.push({
          id: 'fc.trade.dilihan', from: 'fc.klippeport', to: 'nb.dilihan', minutes: mins(34), cap: 48000, carriers: 5, stagger: 240, keep: 15, want: 55,
          goods: {
            'fc.klippeport': ['scotch', 'tin', 'bronze', 'weapons', 'powder'],
            'nb.dilihan': ['wine_butts', 'coal', 'salt', 'grain']
          },
          expect: {
            'fc.klippeport': { wine_butts: 95, coal: 115, salt: 95, grain: 220 },
            'nb.dilihan': { scotch: 290, tin: 75, bronze: 85, weapons: 25, powder: 25 }
          }
        });

        /* R3: Osterbank & Koppardal <-> Serai / Silkhead Soda-Lake Descent (158 km) */
        R.push({
          id: 'fc.trade.serai', from: 'fc.osterbank', to: 'nb.serai', minutes: mins(110), cap: 52000, carriers: 6, stagger: 360, keep: 15, want: 55,
          goods: {
            'fc.osterbank': ['scotch', 'timber', 'copper', 'botanicals', 'tartan'],
            'nb.serai': ['wine_butts', 'salt', 'silk', 'tea', 'spices']
          },
          expect: {
            'fc.osterbank': { wine_butts: 95, salt: 165, silk: 18, tea: 45, spices: 18 },
            'nb.serai': { scotch: 310, timber: 480, copper: 160, botanicals: 35 }
          }
        });

        /* R4: Jarnhold & Salpetervik <-> Korona K10 Spur S-A (164 km) — subject to BF-04 Broken-Kin raids in embargo mode! */
        var spurSpec = {
          id: 'fc.trade.korona', from: 'fc.jarnhold', to: 'nb.korona', minutes: mins(120), cap: 46000, carriers: 5, stagger: 360, keep: 15, want: 55,
          goods: {
            'fc.jarnhold': ['mounts', 'saltpeter', 'powder', 'scotch', 'weapons'],
            'nb.korona': ['grain', 'salt', 'silk', 'tea', 'ceramics']
          },
          expect: {
            'fc.jarnhold': { grain: 320, salt: 85, silk: 10, tea: 18, ceramics: 12 },
            'nb.korona': { mounts: 0.35, saltpeter: 180, powder: 75, scotch: 140 }
          }
        };
        if (embargo) {
          spurSpec.raids = [{
            at: 'fc.jarnhold', from: 'nb.korona', to: 'fc.salpetervik',
            every: 2, spare: 0, share: 0.35, goods: ['grain', 'salt', 'silk', 'tea'],
            why: 'BF-04 Broken-Kin Free-Clan highwaymen (inverted bronze discs after >14d unpaid Silk-Trail retainers)'
          }];
        }
        R.push(spurSpec);

        /* Quarterly MC-06 Silk-Trail Free-Company Escort Retainers (paid when !embargo) */
        if (!embargo) {
          Xf.push({
            id: 'fc.retainer.silk_trail',
            from: 'nb.korona',
            to: 'fc.ardent',
            every: 90,
            first: 15,
            hour: 8,
            goods: { grain: 22000, salt: 6500, silk: 1200, tea: 1800, ceramics: 1500 }
          });
          Xf.push({
            id: 'fc.treaty.dilihan_envoy',
            from: 'nb.dilihan',
            to: 'fc.ardent',
            every: 180,
            first: 30,
            hour: 9,
            goods: { coal: 6000, wine_butts: 2500, spices: 800 }
          });
        }
      }
    }

    return {
      seed: D0(o.seed, 830553),
      scale: K,
      start: D0(o.start, 0),
      calendar: T.calendar,
      factions: T.factions,
      relations: relations,
      goods: T.goods,
      food: T.food,
      settlements: S,
      roads: R,
      transfers: Xf,
      meta: {
        autarky: autarky,
        embargo: embargo,
        bandState: T.evaluateBandState({
          unpaidDays: embargo ? 30 : 0,
          silkCaravanIndex: autarky ? 0.0 : (embargo ? 0.22 : 0.88),
          harvestIndex: 0.85
        })
      }
    };
  };

  /* Summarize Free-Clans-only annual flows, day-of-exhaustion, shortfalls & export surpluses */
  T.summarizeFreeClans = function (B0, B, firstDryDay, blockedBySettlement) {
    var ids = T.freeClansIds, goods = Object.keys(T.goods);
    var pop = 0, totals = {};
    goods.forEach(function (g) {
      totals[g] = { open: 0, close: 0, made: 0, used: 0, eaten: 0, hungry: 0, short: 0, imported: 0, exported: 0, firstDryDay: firstDryDay && firstDryDay[g] != null ? firstDryDay[g] : null };
    });
    ids.forEach(function (id) {
      var t0 = B0.towns[id] || { stock: {} }, t1 = B.towns[id];
      if (!t1) return;
      pop += t1.people;
      goods.forEach(function (g) {
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

  return T;
})();
if (typeof module !== 'undefined') module.exports = FC_TUNE;
