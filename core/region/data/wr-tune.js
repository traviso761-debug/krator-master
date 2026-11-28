// ================================================================= CORE/REGION DATA — the West Rift & Fellgangs tune (W1, W3, W4, W5)
// [G data] core/region/WEST-RIFT-SCOPE.md sections 3-6; kits/tungang/PLAN.md; settlements/blakhed/PLAN.md; core/simulation/PLAN-POLITICS.md.
// Plain data and pure functions for core/region's valley host (core/region/50-region-valley.js, H.simValley), in XAN_TUNE's map
// frame (metres from px 1191,1569 at 2 km/px). Accounts for all 12,250 Fellgangs alongside their Dalab, Tungang Union, Golden Tears
// and Kimr neighbours:
//   Fellgangs (12,250): wr.blakhed (4,850), wr.stairhead (150), 12 bench hamlets bk.h.* (1,800), wr.fells bulk countryside (3,050),
//                       wr.fowlers (150), wr.icecutters (150), wr.drovers (300), wr.passkeepers (150), wr.coppersmiths (200),
//                       wr.goldcamp (150 summer), wr.wildcat (400) + wr.barricade (150), wr.travellers (650), wr.kradz (100)
//   Neighbours:         wr.nulab (10,000) + wr.basin (50,000 rural), dalab.ledge (10,000), dalab.skarn (400), dalab.blakhed (160),
//                       dalab.shelf (2,500 north gate), tg.fower (1,500 lifts), tg.twenny (2,000 km 218), tg.hearth (2,000),
//                       tg.saltpeter (150), tears.blakhed (150), gate.kimr (1,000 Hall of Heroes)
//   WR_TUNE.valley(o)             o.slice === 'blakhed' builds the 20-settlement Blakhed district (WR_BLAKHED); default builds the
//                                 full 35-settlement West Rift economy; o.strike === true triggers the Tungang Union strike (W5)
//   WR_TUNE.join(XV, o)           step W3: replaces `gate.dalab.blakhed` and `gate.dalab.nulab` on `caravan.great` (XAN_TUNE or EAST_RIFT)
//   WR_TUNE.marketPeace(B, C, R)  evaluates Blakhed's Market Peace bowl (0..100, Double Meeting balance, Dalab toll strain, Fair truce)
//   WR_TUNE.rising / stepRising   PLAN-POLITICS Rising 8 data spec & pure stepper (`wr.rising.nulab`, capped short of march without player)
var WR_TUNE = (function () {
  'use strict';
  var T = {}, D = 1 / 365;
  function D0(x, d) { return x == null ? d : x; }
  T.px = function (px, py) { return { x: (px - 1191) * 2000, z: (py - 1569) * 2000 }; };
  T.yearDay0 = 259;

  /* Unified goods table across East Rift (XAN_TUNE), Loj Twenny (LTS) and West Rift */
  T.goods = {
    grain: { unit: 'kg', crops: ['frostoat', 'redstem-buckwheat', 'helix-bean'] },
    potato: { unit: 'kg', crops: ['snow-potato', 'frostroot'] },
    fungus: { unit: 'kg' },
    wax: { unit: 'kg' },
    dairy: { unit: 'kg' },
    meat: { unit: 'kg' },
    fish: { unit: 'kg' },
    eggs: { unit: 'kg' },
    honey: { unit: 'kg' },
    herbs: { unit: 'kg' },
    salt: { unit: 'kg' },
    ice: { unit: 'kg' },
    peat: { unit: 'kg' },
    rope: { unit: 'kg' },
    wool: { unit: 'kg' },
    hides: { unit: 'kg' },
    felt: { unit: 'kg' },
    slate: { unit: 'kg' },
    timber: { unit: 'kg' },
    cloth: { unit: 'kg' },
    iron: { unit: 'kg' },
    copper: { unit: 'kg' },
    tin: { unit: 'kg' },
    bronze: { unit: 'kg' },
    rareearths: { unit: 'kg' },
    gold: { unit: 'kg' },
    ivory: { unit: 'kg' },
    obsidian: { unit: 'kg' },
    saltpeter: { unit: 'kg' },
    salvage: { unit: 'kg' },
    cells: { unit: 'piece' },
    tools: { unit: 'kg' },
    tea: { unit: 'kg' }
  };

  /* Diets per person per day (~235 kg grain-eq/yr on the high rim, 7.5 kg/yr salt: WEST-RIFT-SCOPE 4.4) */
  T.diet = {
    fell: { grain: 115 * D, potato: 45 * D, dairy: 40 * D, meat: 22 * D, eggs: 5 * D, honey: 1.5 * D, salt: 7.5 * D, tools: 0.4 * D },
    fellsBulk: { grain: 95 * D, potato: 55 * D, dairy: 48 * D, meat: 28 * D, salt: 7.5 * D, peat: 18 * D, tools: 0.35 * D },
    town: { grain: 115 * D, potato: 45 * D, dairy: 40 * D, meat: 22 * D, eggs: 5 * D, honey: 1.5 * D, salt: 7.5 * D, timber: 8 * D, cloth: 1.2 * D, tools: 0.4 * D },
    stair: { grain: 120 * D, potato: 45 * D, dairy: 35 * D, meat: 24 * D, salt: 7.5 * D, rope: 8 * D, tools: 0.5 * D },
    pass: { grain: 100 * D, potato: 40 * D, fish: 48 * D, meat: 20 * D, salt: 7.5 * D, tools: 0.4 * D },
    camp: { grain: 125 * D, potato: 45 * D, meat: 30 * D, salt: 7.5 * D, peat: 15 * D, tools: 0.8 * D },
    traveller: { grain: 115 * D, potato: 40 * D, dairy: 32 * D, meat: 26 * D, salt: 7.5 * D, rope: 2 * D, tools: 0.5 * D },
    kradz: { grain: 95 * D, fungus: 35 * D, meat: 24 * D, wax: 8 * D, salt: 7.5 * D, rope: 6 * D, tools: 0.6 * D },
    wildcat: { grain: 85 * D, meat: 65 * D, potato: 30 * D, salt: 7 * D, tools: 0.5 * D },
    kimr: { grain: 80 * D, meat: 75 * D, salt: 6.5 * D, tools: 0.4 * D },
    tungang: { fungus: 105 * D, grain: 65 * D, wax: 18 * D, eggs: 4 * D, salt: 7.5 * D, ice: 32 * D, timber: 10 * D, tools: 0.6 * D },
    hearth: { fungus: 110 * D, grain: 55 * D, wax: 22 * D, eggs: 8 * D, honey: 2 * D, salt: 7.5 * D, ice: 48 * D, tools: 0.5 * D },
    dalab: { grain: 175 * D, meat: 20 * D, salt: 7.5 * D, cloth: 0.6 * D, tools: 0.4 * D },
    basin: { grain: 170 * D, meat: 16 * D, salt: 7 * D, cloth: 0.5 * D, tools: 0.35 * D },
    ledge: { grain: 155 * D, fish: 28 * D, meat: 14 * D, salt: 7.5 * D, cloth: 0.8 * D, timber: 6 * D, tools: 0.45 * D },
    nulab: { grain: 175 * D, meat: 20 * D, salt: 7.5 * D, cloth: 0.6 * D, tools: 0.4 * D, ice: 85 * D, rope: 4.5 * D, eggs: 1.5 * D, honey: 0.5 * D, felt: 0.8 * D },
    xanadu: { grain: 165 * D, dairy: 20 * D, meat: 18 * D, salt: 6 * D, tea: 2 * D, tools: 0.4 * D }
  };

  /* Year windows on core/clock (startDay 259 = early autumn, during the 10-day Autumn Fair) */
  T.calendar = {
    windows: {
      'bk.harvest': [185, 235],
      'bk.shielings': [120, 235],
      'bk.not-shielings': [235, 120],
      'bk.winter': [315, 75],
      'bk.thaw': [85, 305],
      'bk.fowling': [90, 220],
      'bk.salt': [110, 240],
      'bk.fair': [255, 265],
      'bk.not-fair': [265, 255],
      'wr.always': [0, 365]
    }
  };

  /* The twelve Fellgang bench hamlets of settlements/blakhed/PLAN.md 3.2a (matching src/69bo-bk-ring.js HAMLETS) */
  T.hamlets = [
    ['bk.h.highgarth', 'Highgarth', 439, 1392, 'farming', 150],
    ['bk.h.beckfoot', 'Beckfoot', 443, 1393, 'farming', 150],
    ['bk.h.pondhead', 'Pondhead', 451, 1397, 'ice', 150],
    ['bk.h.fallsfield', 'Fallsfield', 450, 1398, 'farming', 150],
    ['bk.h.cragfold', 'Cragfold', 449, 1404, 'ranch', 150],
    ['bk.h.hayfell', 'Hayfell', 445, 1411, 'ranch', 150],
    ['bk.h.slatebank', 'Slatebank', 443, 1409, 'quarry', 150],
    ['bk.h.highbyre', 'Highbyre', 438, 1406, 'ranch', 150],
    ['bk.h.peatmoss', 'Peatmoss', 434, 1403, 'farming', 150],
    ['bk.h.coldwater', 'Coldwater', 430, 1398, 'ice', 150],
    ['bk.h.drovers-rest', 'Drovers\' Rest', 432, 1392, 'ranch', 150],
    ['bk.h.tarnside', 'Tarnside', 434, 1391, 'farming', 150]
  ];

  T.toll = { share: 0.1, goods: ['ice', 'eggs', 'rope'] };
  T.tearsCut = 0.02;
  T.travellerCut = 0.05;
  T.kradzCut = 0.1;
  T.liftCut = 0.03;

  T.factions = [
    { id: 'fellgang', name: 'The Fellgangs of the Rift Rim (Blakhed\'s Market Peace, the fells, drovers, Fowlers, Ice-cutters, Coppersmiths, Pass-keepers and Travellers)' },
    { id: 'wildcat', name: 'Wildcat and the Barricade (the Fellgang-Kimr raiding band on the south-west rim)' },
    { id: 'tungang', name: 'The Tungang Union (Loj Twenny, the Hearth Hold, Loj Fower at Ledge\'s lifts and the Line)' },
    { id: 'dalab', name: 'The Realm of Dalab (Nulab, Ledge, the basin, Skarn and the Stairhead toll post)' },
    { id: 'kimr', name: 'The Kimr of the Labyrinth and the Hall of Heroes' },
    { id: 'tears', name: 'The Golden Tears (the Xanadu merchant house escorting the Annual Great Caravan)' },
    { id: 'xanadu', name: 'The Sultanate of Xanadu' }
  ];

  /* Fellgang population roster helper: verifies all 12,250 Fellgangs are accounted for */
  T.fellgangIds = [
    'wr.blakhed', 'wr.stairhead',
    'bk.h.highgarth', 'bk.h.beckfoot', 'bk.h.pondhead', 'bk.h.fallsfield', 'bk.h.cragfold', 'bk.h.hayfell',
    'bk.h.slatebank', 'bk.h.highbyre', 'bk.h.peatmoss', 'bk.h.coldwater', 'bk.h.drovers-rest', 'bk.h.tarnside',
    'wr.fells', 'wr.fowlers', 'wr.icecutters', 'wr.drovers', 'wr.passkeepers', 'wr.coppersmiths', 'wr.goldcamp',
    'wr.wildcat', 'wr.barricade', 'wr.travellers', 'wr.kradz'
  ];

  function makeVeins(n, firstAmt, restAmt, grade) {
    var out = [], i;
    for (i = 0; i < n; i++) out.push({ amount: i === 0 ? firstAmt : restAmt, grade: grade });
    return out;
  }

  T.valley = function (o) {
    o = o || {};
    var slice = o.slice == null ? 'full' : o.slice;
    var blakhedOnly = slice === 'blakhed';
    var strike = !!o.strike;
    var K = D0(o.townScale, 50), Kv = D0(o.villageScale, 10), Kb = D0(o.bulkScale, 200), Kc = D0(o.cityScale, 100);
    var yr = 365, startDays = D0(o.startDays, 355);
    var win = function (w) { var W = T.calendar.windows[w]; return (W[1] - W[0] + yr) % yr; };
    var rate = function (kgYr, crew, sc, days) { return kgYr / (Math.max(1, Math.round(crew / sc)) * sc * D0(days, yr) * 12); };
    var eats = function (k) { return Object.assign({}, T.diet[k]); };
    var stockFor = function (diet, n, days, extra) {
      var s = {}, g;
      for (g in diet) s[g] = Math.ceil(n * diet[g] * days);
      return Object.assign(s, extra || {});
    };
    var S = [], R = [], at = T.px;

    /* 1. BLAKHED (4,250 town + 600 on four steadings = 4,850, scale K; + 150 Stairhead = 5,000) */
    {
      var pbk = at(441, 1400), nbk = 4850;
      S.push({
        id: 'wr.blakhed', name: 'Blakhed (the rim\'s market town at the Blak Riba head, with its four river steadings)',
        faction: 'fellgang', people: nbk, x: pbk.x, z: pbk.z, scale: K, eats: eats('town'), keepDays: 20,
        start: Object.assign(stockFor(T.diet.town, nbk, 85), {
          grain: Math.ceil(nbk * T.diet.town.grain * 175), potato: Math.ceil(nbk * T.diet.town.potato * (blakhedOnly ? startDays : 395)),
          dairy: Math.ceil(nbk * T.diet.town.dairy * 130), meat: Math.ceil(nbk * T.diet.town.meat * 130),
          ice: 360000, rope: 32000, wool: 12000, iron: 5000, copper: 2500, tea: 1400, felt: 5000, tools: 4000
        }),
        works: [
          { id: 'bk.market', kind: 'market', name: 'the Market Truce ring and the Icegarth\'s stores', crew: 250, out: [], rate: 0 },
          { id: 'bk.grain', kind: 'fields', name: 'the irrigated in-field (frostoat and buckwheat)', crew: 700, out: ['grain'], rate: rate(270000, 700, K, win('bk.harvest')), season: 'bk.harvest' },
          { id: 'bk.potato', kind: 'fields', name: 'the snow-potato and frostroot garths', crew: 350, out: ['potato'], rate: rate(blakhedOnly ? 290000 : 350000, 350, K, win('bk.harvest')), season: 'bk.harvest' },
          { id: 'bk.herds', kind: 'byre', name: 'the town\'s herds and summer shielings', crew: 400,
            herd: { out: ['dairy'], rate: 240000 / (Math.max(1, Math.round(1500 / K)) * K * yr * 24), animals: 1500, seasonRate: { summer: 1.25, winter: 0.75 } },
            pasture: { id: 'bk.shielings', window: 'bk.shielings' } },
          { id: 'bk.folds', kind: 'folds', name: 'the Folds (meat, wool and hides)', crew: 200, out: ['meat'], rate: rate(125000, 200, K) },
          { id: 'bk.fleece', kind: 'shearing', name: 'the shearing pens', crew: 100, out: ['wool'], rate: rate(20000, 100, K) },
          { id: 'bk.ponds', kind: 'icecut', name: 'the Icegarth\'s six winter ice ponds and dugout vaults', crew: 300, out: ['ice'], rate: rate(1300000, 300, K, win('bk.winter')), season: 'bk.winter' },
          { id: 'bk.ropewalk', kind: 'ropewalk', name: 'the 240 m rope walk (lobe-larch cord and Ancient cable)', crew: 200, out: ['rope'], rate: rate(105000, 200, K) },
          { id: 'bk.felters', kind: 'felt-house', name: 'the felters and tanners', crew: 50, batch: { in: { wool: 1.2 }, out: { felt: 1 }, hours: 18 } },
          { id: 'bk.smiths', kind: 'salvage-smith', name: 'the settled Traveller salvage-smiths', crew: 50, batch: { in: { iron: 1 }, out: { tools: 1 }, hours: 32 } }
        ]
      });
    }

    /* 2. THE STAIRHEAD (150) & DALAB'S MISSION + TOLL POST (160) & GOLDEN TEARS MISSION (150) */
    {
      var ps = at(449, 1393), pt = at(449.2, 1392.8), pgt = at(441.56, 1400.18);
      S.push({
        id: 'wr.stairhead', name: 'The Stairhead (the Stairmen\'s ward and gin-wheel hoists at the falls\' lip)',
        faction: 'fellgang', parent: 'wr.blakhed', people: 150, x: ps.x, z: ps.z, scale: Kv, eats: eats('stair'), keepDays: 25,
        start: stockFor(T.diet.stair, 150, 150, { potato: Math.ceil(150 * T.diet.stair.potato * 220) }),
        works: [{ id: 'sh.hoists', kind: 'stair-hoist', name: 'the gin wheels and rope stores', crew: 80, out: [], rate: 0 }]
      });
      R.push({
        id: 'wr.road.stairhead', from: 'wr.blakhed', to: 'wr.stairhead', minutes: Math.round(24 / 25 * 1440), cap: 12000, carriers: 2, stagger: 720, want: 35,
        goods: { 'wr.blakhed': ['grain', 'potato', 'dairy', 'meat', 'eggs', 'honey', 'salt', 'rope', 'tools'], 'wr.stairhead': [] }
      });

      S.push({
        id: 'dalab.blakhed', name: 'Dalab\'s mission at Blakhed and toll post at the Stairhead',
        faction: 'dalab', parent: 'wr.nulab', people: 160, x: pt.x, z: pt.z, scale: Kv, eats: eats('dalab'), keepDays: 30,
        start: stockFor(T.diet.dalab, 160, 150),
        works: [
          { id: 'db.mission', kind: 'counting-house', name: 'the Dalab factors\' hall and temple by Blakhed\'s Market', crew: 45, out: [], rate: 0 },
          { id: 'db.tollhouse', kind: 'toll-house', name: 'the Stairhead toll store and genepriest\'s ice check', crew: 20, out: [], rate: 0 }
        ]
      });
      R.push({
        id: 'dalab.supply.blakhed', from: 'wr.blakhed', to: 'dalab.blakhed', minutes: 60, cap: 10000, carriers: 2, want: 30, keep: 10,
        goods: { 'wr.blakhed': ['grain', 'meat', 'salt', 'cloth', 'tools'], 'dalab.blakhed': [] }
      });

      S.push({
        id: 'tears.blakhed', name: 'The Golden Tears\' mission at Blakhed (the Great Caravan escort\'s western compound)',
        faction: 'tears', parent: 'wr.blakhed', people: 150, x: pgt.x, z: pgt.z, scale: Kv, eats: eats('xanadu'), keepDays: 15,
        start: stockFor(T.diet.xanadu, 150, 150),
        works: [{ id: 'tb.compound', kind: 'counting-house', name: 'the factor\'s counting house and caravanserai', crew: 40, out: [], rate: 0 }]
      });
      R.push({
        id: 'tears.supply.blakhed', from: 'wr.blakhed', to: 'tears.blakhed', minutes: 60, cap: 10000, carriers: 2, want: 30, keep: 10,
        goods: { 'wr.blakhed': ['grain', 'dairy', 'meat', 'salt', 'tea', 'tools'], 'tears.blakhed': [] }
      });
      R.push({
        id: 'tears.sell.blakhed', from: 'tears.blakhed', to: 'wr.blakhed', minutes: 60, cap: 20000, carriers: 1, want: 20, keep: 10,
        goods: { 'tears.blakhed': ['cacao', 'cacaocake', 'saffron', 'opium', 'tea', 'brocade', 'silk', 'sulfur', 'wax', 'rarities', 'hearthseed'], 'wr.blakhed': [] }
      });
    }

    /* 3. THE TWELVE FELLGANG BENCH HAMLETS (1,800 people) */
    T.hamlets.forEach(function (row) {
      var id = row[0], name = row[1], px = row[2], py = row[3], focus = row[4], pop = row[5];
      var p = at(px, py), bp = at(441, 1400), km = Math.hypot(p.x - bp.x, p.z - bp.z) / 1000 * 1.2;
      var mins = Math.max(240, Math.round(km / 25 * 1440)), works = [{ id: id + '.store', kind: 'store', name: 'the hamlet\'s store', crew: 10, out: [], rate: 0 }];
      var sh = {}, back = ['salt', 'tools', 'rope'];
      if (focus === 'farming') {
        var gYr = 46000, pYr = 22000, gOwn = pop * T.diet.fell.grain * yr, pOwn = pop * T.diet.fell.potato * yr;
        works.push(
          { id: id + '.grain', kind: 'farmstead', name: 'the bench fields', crew: 50, out: ['grain'], rate: rate(gYr, 50, Kv, win('bk.harvest')), season: 'bk.harvest' },
          { id: id + '.potato', kind: 'farmstead', name: 'the potato garths', crew: 20, out: ['potato'], rate: rate(pYr, 20, Kv, win('bk.harvest')), season: 'bk.harvest' }
        );
        sh = { grain: Math.min(0.62, (gYr - gOwn) * 0.9 / gYr), potato: Math.min(0.62, (pYr - pOwn) * 0.9 / pYr) };
        back = ['dairy', 'meat', 'eggs', 'honey', 'salt', 'tools', 'rope'];
      } else if (focus === 'ranch') {
        works.push(
          { id: id + '.byre', kind: 'byre', name: 'the herds and summer fell', crew: 45,
            herd: { out: ['dairy'], rate: 26000 / (Math.max(1, Math.round(180 / Kv)) * Kv * yr * 24), animals: 180, seasonRate: { summer: 1.3, winter: 0.7 } },
            pasture: { id: id + '.pasture', window: 'bk.shielings' } },
          { id: id + '.meat', kind: 'folds', name: 'the folds', crew: 20, out: ['meat'], rate: rate(14000, 20, Kv) },
          { id: id + '.wool', kind: 'shearing', name: 'the shearing', crew: 10, out: ['wool'], rate: rate(3500, 10, Kv) }
        );
        sh = { dairy: 0.68, meat: 0.65, wool: 0.85 };
        back = ['grain', 'potato', 'eggs', 'honey', 'salt', 'tools', 'rope'];
      } else if (focus === 'ice') {
        works.push({ id: id + '.ponds', kind: 'icecut', name: 'the winter ice ponds and dugout cellars', crew: 65, out: ['ice'], rate: rate(180000, 65, Kv, win('bk.winter')), season: 'bk.winter' });
        sh = { ice: 0.92 };
        back = ['grain', 'potato', 'dairy', 'meat', 'eggs', 'honey', 'salt', 'tools', 'rope'];
      } else {
        works.push({ id: id + '.quarry', kind: 'quarry', name: 'the roof-slate and drystone bank', crew: 65, out: ['slate'], rate: rate(120000, 65, Kv) });
        sh = { slate: 0.9 };
        back = ['grain', 'potato', 'dairy', 'meat', 'eggs', 'honey', 'salt', 'tools', 'rope'];
      }
      S.push({
        id: id, name: name + ' (Fellgang ' + focus + ' hamlet)', faction: 'fellgang', parent: 'wr.blakhed',
        people: pop, x: p.x, z: p.z, scale: Kv, eats: eats('fell'), keepDays: 20,
        start: stockFor(T.diet.fell, pop, focus === 'farming' ? startDays : 155), works: works
      });
      R.push({
        id: 'wr.hamlet.' + id.split('.').pop(), from: id, to: 'wr.blakhed', minutes: mins, cap: 16000, carriers: 2,
        stagger: Math.round(mins / 2), want: 35, share: (function () { var o2 = {}; o2[id] = sh; return o2; })(),
        goods: { 'wr.blakhed': back }
      });
    });

    /* 4. CORE PARTNER ENDPOINTS (shared by both 'blakhed' slice and 'full' West Rift) */
    /* 4a. NULAB (10,000 city; in full mode backed by wr.basin 50,000 rural + dalab.skarn 400) */
    {
      var pnu = at(443, 1359), stairMin = Math.round(4.5 * 1440), scNu = blakhedOnly ? 50 : Kc;
      S.push({
        id: 'wr.nulab', name: 'Nulab (Dalab\'s lake city at the gorge stair\'s foot)',
        faction: 'dalab', people: 10000, x: pnu.x, z: pnu.z, scale: scNu, eats: eats('nulab'), keepDays: 18,
        start: Object.assign(stockFor(T.diet.nulab, 10000, 80), {
          grain: 3200000, meat: 280000, salt: 110000, timber: 320000, cloth: 80000, iron: 110000, tea: 28000, tools: 12000, bronze: 20000
        }),
        works: [
          { id: 'nu.market', kind: 'market', name: 'Nulab\'s lake market and gene-store cellars', crew: 300, out: [], rate: 0 },
          { id: 'nu.basin', kind: 'farmstead', name: 'Nulab\'s home shore farms', crew: 3200, out: ['grain'], rate: rate(blakhedOnly ? 2600000 : 2900000, 3200, scNu, win('bk.shielings')), season: 'bk.shielings' },
          { id: 'nu.herds', kind: 'folds', name: 'the shore stock and fisheries', crew: 600, out: ['meat'], rate: rate(260000, 600, scNu) },
          { id: 'nu.woods', kind: 'lumber', name: 'the lower slope\'s bell-fir timber', crew: 350, out: ['timber'], rate: rate(blakhedOnly ? 140000 : 380000, 350, scNu) },
          { id: 'nu.looms', kind: 'weaver', name: 'lotus-silk and sea-linen looms', crew: 250, out: ['cloth'], rate: rate(36000, 250, scNu) },
          { id: 'nu.skarn', kind: 'smelter', name: 'bar, plate and bronze works', crew: 250, out: ['iron'], rate: rate(65000, 250, scNu) },
          { id: 'nu.tea', kind: 'tea-garden', name: 'the shore\'s mist tea', crew: 150, out: ['tea'], rate: rate(16000, 150, scNu) },
          { id: 'nu.smiths', kind: 'smithy', name: 'Nulab\'s tool-smiths', crew: 150, batch: { in: { iron: 1 }, out: { tools: 1 }, hours: 20 } }
        ]
      });
      R.push({
        id: 'wr.road.stair', from: 'wr.blakhed', to: 'wr.nulab', minutes: stairMin, cap: 55000, carriers: 10, stagger: Math.round(stairMin / 5),
        keep: 15, want: 50,
        goods: { 'wr.blakhed': ['ice', 'rope', 'eggs', 'honey', 'felt', 'salt', 'gold'], 'wr.nulab': ['grain', 'timber', 'cloth', 'iron', 'tea', 'tools'] },
        expect: { 'wr.nulab': { ice: 2400, rope: 130, eggs: 42, honey: 14, felt: 22, salt: 210 }, 'wr.blakhed': { grain: 1350, iron: 30, timber: 130, cloth: 22, tea: 8 } },
        cut: [{ at: 'wr.nulab', to: 'dalab.blakhed', share: T.toll.share, goods: T.toll.goods, why: 'Dalab\'s tenth in kind at the Stairhead toll post' }]
      });
      R.push({
        id: 'wr.road.toll-supply', from: 'wr.nulab', to: 'dalab.blakhed', minutes: stairMin, cap: 6000, carriers: 1, want: 45,
        goods: { 'wr.nulab': ['grain', 'meat', 'salt', 'cloth', 'tools'], 'dalab.blakhed': [] }
      });
    }

    /* 4b. THE DROVERS (300 at px 393,1338: Changthang high salt basins covering Blakhed and Ledge's ~290 t/yr salt) */
    {
      var pdr = at(393, 1338), drMin = Math.round(7 * 1440), saltYr = blakhedOnly ? 200000 : 540000;
      S.push({
        id: 'wr.drovers', name: 'The western Fellgang drovers and the high salt basins',
        faction: 'fellgang', people: 300, x: pdr.x, z: pdr.z, scale: Kv, eats: eats('fell'), keepDays: 18,
        start: Object.assign(stockFor(T.diet.fell, 300, 180), {
          potato: Math.ceil(300 * T.diet.fell.potato * startDays), salt: blakhedOnly ? 110000 : 280000, meat: 24000, wool: 10000, hides: 8000
        }),
        works: [
          { id: 'dr.folds', kind: 'market', name: 'the drovers\' winter folds and salt store', crew: 30, out: [], rate: 0 },
          { id: 'dr.salt', kind: 'salt-pans', name: 'the high salt basins (327-355,1335-1359)', crew: 120, out: ['salt'], rate: rate(saltYr, 120, Kv, win('bk.salt')), season: 'bk.salt' },
          { id: 'dr.herds', kind: 'byre', name: 'the western herds', crew: 65,
            herd: { out: ['dairy'], rate: 20000 / (Math.max(1, Math.round(220 / Kv)) * Kv * yr * 24), animals: 220 },
            pasture: { id: 'dr.shielings', window: 'bk.shielings' } },
          { id: 'dr.meat', kind: 'folds', name: 'drove stock', crew: 40, out: ['meat'], rate: rate(42000, 40, Kv) },
          { id: 'dr.hides', kind: 'tannery', name: 'hides and wool', crew: 25, out: ['hides', 'wool'], rate: rate(14000, 25, Kv) },
          { id: 'dr.potato', kind: 'farmstead', name: 'sheltered potato garths', crew: 20, out: ['potato'], rate: rate(18000, 20, Kv, win('bk.harvest')), season: 'bk.harvest' }
        ]
      });
      R.push({
        id: 'wr.road.drove', from: 'wr.drovers', to: 'wr.blakhed', minutes: drMin, cap: 34000, carriers: 5, stagger: Math.round(drMin / 3),
        keep: 15, want: 55,
        goods: { 'wr.drovers': ['salt', 'meat', 'hides', 'wool', 'copper', 'obsidian'], 'wr.blakhed': ['grain', 'potato', 'eggs', 'honey', 'rope', 'tools'] },
        expect: { 'wr.blakhed': { salt: 380, hides: 20, wool: 20, copper: blakhedOnly ? 0 : 18 } }
      });
    }

    /* 4c. THE ICE-CUTTERS (150 at px 470,1521: winter lake ice to Blakhed + night south-wall carry to Hearth Hold & Kradz) */
    {
      var pic = at(470, 1521), icMin = Math.round(12 * 1440), iceYr = blakhedOnly ? 280000 : 480000;
      var icRoad = {
        id: 'wr.road.ice', from: 'wr.icecutters', to: 'wr.blakhed', minutes: icMin, cap: 38000, carriers: 4, stagger: Math.round(icMin / 4),
        want: 265, share: { 'wr.icecutters': { ice: blakhedOnly ? 0.85 : 0.62 } },
        goods: { 'wr.blakhed': ['grain', 'potato', 'eggs', 'honey', 'salt', 'cloth', 'rope', 'tools'] },
        closed: o.openIceRoad ? undefined : [{ legs: [0, 1], window: 'bk.thaw' }]
      };
      if (!blakhedOnly && o.raids !== false) {
        icRoad.raids = [{
          at: 'wr.blakhed', from: 'wr.icecutters', to: 'wr.wildcat', every: 3, spare: 2, share: 0.14, goods: ['ice'],
          window: 'bk.winter', why: 'Wildcat winter sledge raid on the south-rim ice road'
        }];
      }
      S.push({
        id: 'wr.icecutters', name: 'The Ice-cutters on the frozen south-rim lake',
        faction: 'fellgang', people: 150, x: pic.x, z: pic.z, scale: Kv, eats: eats('fell'), keepDays: 25,
        start: stockFor(T.diet.fell, 150, 275, { ice: 180000 }),
        works: [
          { id: 'ic.store', kind: 'icehouse', name: 'the lake-ice barrows', crew: 20, out: [], rate: 0 },
          { id: 'ic.cut', kind: 'icecut', name: 'the eight-week winter lake cut', crew: 80, out: ['ice'], rate: rate(iceYr, 80, Kv, win('bk.winter')), season: 'bk.winter' },
          { id: 'ic.herds', kind: 'byre', name: 'the lake herds', crew: 30,
            herd: { out: ['dairy'], rate: 9500 / (Math.max(1, Math.round(90 / Kv)) * Kv * yr * 24), animals: 90 } },
          { id: 'ic.meat', kind: 'folds', name: 'winter meat', crew: 20, out: ['meat'], rate: rate(6500, 20, Kv) }
        ]
      });
      R.push(icRoad);
    }

    /* 4d. THE FOWLERS (150 at px 571,1397: cliff eggs in ash, wall honey and herbs to Blakhed and Hearth Hold) */
    {
      var pfw = at(571, 1397), fwMin = Math.round(14 * 1440), eggYr = blakhedOnly ? 65000 : 135000, honYr = blakhedOnly ? 18000 : 34000;
      S.push({
        id: 'wr.fowlers', name: 'The Fowlers on the north rim\'s cliffs',
        faction: 'fellgang', people: 150, x: pfw.x, z: pfw.z, scale: Kv, eats: eats('fell'), keepDays: 16,
        start: stockFor(T.diet.fell, 150, 240, { eggs: blakhedOnly ? 42000 : 72000, honey: 18000, herbs: 5500 }),
        works: [
          { id: 'fw.eggstore', kind: 'eggstore', name: 'the cool round egg and honey store', crew: 20, out: [], rate: 0 },
          { id: 'fw.cliffs', kind: 'fowling', name: 'the cliff ropes (eggs in ash)', crew: 70, out: ['eggs'], rate: rate(eggYr, 70, Kv, win('bk.fowling')), season: 'bk.fowling' },
          { id: 'fw.hives', kind: 'fowling', name: 'the wall-bee ledges (honey and herbs)', crew: 35, out: ['honey', 'herbs'], rate: rate(honYr, 35, Kv, win('bk.fowling')), season: 'bk.fowling' },
          { id: 'fw.herds', kind: 'byre', name: 'the cliff-top goats', crew: 25,
            herd: { out: ['dairy'], rate: 8500 / (Math.max(1, Math.round(80 / Kv)) * Kv * yr * 24), animals: 80 } },
          { id: 'fw.meat', kind: 'folds', name: 'fowler meat', crew: 15, out: ['meat'], rate: rate(5500, 15, Kv) }
        ]
      });
      R.push({
        id: 'wr.road.north', from: 'wr.fowlers', to: 'wr.blakhed', minutes: fwMin, cap: 24000, carriers: 5, stagger: Math.round(fwMin / 3),
        keep: 15, want: 80,
        goods: { 'wr.fowlers': ['eggs', 'honey', 'herbs', 'wax'], 'wr.blakhed': ['grain', 'potato', 'salt', 'rope', 'tools'] },
        expect: { 'wr.blakhed': { eggs: 135, honey: 36, herbs: 8 } }
      });
    }

    if (blakhedOnly) {
      var Fb = ['fellgang', 'dalab', 'tears', 'xanadu'];
      return {
        seed: 441400, scale: Kv, start: 0, calendar: T.calendar, goods: T.goods,
        factions: T.factions.filter(function (f) { return Fb.indexOf(f.id) >= 0; }),
        relations: [].concat.apply([], Fb.map(function (a) { return Fb.filter(function (b) { return b !== a; }).map(function (b) { return { a: a, b: b, stance: 'friendly' }; }); })),
        settlements: S, roads: R, transfers: []
      };
    }

    /* ==================== FULL WEST RIFT & ALL REMAINING FELLGANG GROUPS (W1, W4, W5) ==================== */

    /* 5. THE FELLGANG FELLS BULK COUNTRYSIDE (3,050 across scattered shielings, moor-sponge peat banks and bell-seed garths) */
    {
      var pf = at(418, 1418), nf = 3050;
      S.push({
        id: 'wr.fells', name: 'The Fellgang fells (scattered shielings, moor-sponge peat banks and upland steadings)',
        faction: 'fellgang', people: nf, x: pf.x, z: pf.z, scale: Kb, eats: eats('fellsBulk'), keepDays: 20,
        start: stockFor(T.diet.fellsBulk, nf, 180, { grain: Math.ceil(nf * T.diet.fellsBulk.grain * startDays), potato: Math.ceil(nf * T.diet.fellsBulk.potato * startDays), peat: 90000, wool: 15000, hides: 10000 }),
        works: [
          { id: 'fl.store', kind: 'store', name: 'the fell moot cairns and shieling stores', crew: 100, out: [], rate: 0 },
          { id: 'fl.grain', kind: 'fields', name: 'bell-seed and frostoat patches', crew: 750, out: ['grain'], rate: rate(380000, 750, Kb, win('bk.harvest')), season: 'bk.harvest' },
          { id: 'fl.potato', kind: 'fields', name: 'upland frostroot garths', crew: 400, out: ['potato'], rate: rate(240000, 400, Kb, win('bk.harvest')), season: 'bk.harvest' },
          { id: 'fl.herds', kind: 'byre', name: 'the upland shieling herds', crew: 600,
            herd: { out: ['dairy'], rate: 220000 / (Math.max(1, Math.round(2400 / Kb)) * Kb * yr * 24), animals: 2400, seasonRate: { summer: 1.35, winter: 0.7 } },
            pasture: { id: 'fl.shielings', window: 'bk.shielings' } },
          { id: 'fl.meat', kind: 'folds', name: 'fell stock and winter cull', crew: 350, out: ['meat'], rate: rate(145000, 350, Kb) },
          { id: 'fl.fleece', kind: 'shearing', name: 'fell wool and hides', crew: 200, out: ['wool', 'hides'], rate: rate(32000, 200, Kb) },
          { id: 'fl.peat', kind: 'peat-bank', name: 'moor-sponge peat cuttings', crew: 250, out: ['peat'], rate: rate(180000, 250, Kb) }
        ]
      });
      R.push({
        id: 'wr.road.fells', from: 'wr.fells', to: 'wr.blakhed', minutes: Math.round(3.5 * 1440), cap: 32000, carriers: 4, stagger: 1200,
        keep: 18, want: 45,
        goods: { 'wr.fells': ['grain', 'dairy', 'meat', 'wool', 'hides', 'peat'], 'wr.blakhed': ['salt', 'rope', 'tools'] },
        expect: { 'wr.blakhed': { peat: 90, wool: 35, hides: 25 } }
      });
    }

    /* 6. THE PASS-KEEPERS (150 at px 352,1262: Gould Riba fishery + Copper Pass guiding & relay) */
    {
      var ppk = at(352, 1262);
      S.push({
        id: 'wr.passkeepers', name: 'The Pass-keepers at the Gould Riba ford and Copper Pass',
        faction: 'fellgang', people: 150, x: ppk.x, z: ppk.z, scale: Kv, eats: eats('pass'), keepDays: 20,
        start: stockFor(T.diet.pass, 150, 210, { fish: 12000, copper: 2500 }),
        works: [
          { id: 'pk.halt', kind: 'halting-house', name: 'the Copper Pass halting house and rope store', crew: 25, out: [], rate: 0 },
          { id: 'pk.fish', kind: 'fishery', name: 'the Gould Riba weirs and smokehouses', crew: 60, out: ['fish'],
            rate: rate(34000, 60, Kv), site: { id: 'pk.riba', kind: 'fishery', goods: ['fish'], amount: 14000, capacity: 14000, regen: 130 } },
          { id: 'pk.herds', kind: 'folds', name: 'pass pack-stock and meat', crew: 35, out: ['meat'], rate: rate(9000, 35, Kv) },
          { id: 'pk.potato', kind: 'farmstead', name: 'sheltered riverroot garths', crew: 30, out: ['potato'], rate: rate(12000, 30, Kv, win('bk.harvest')), season: 'bk.harvest' }
        ]
      });
      R.push({
        id: 'wr.road.pass-drove', from: 'wr.passkeepers', to: 'wr.drovers', minutes: Math.round(6 * 1440), cap: 18000, carriers: 3, stagger: 2880,
        keep: 15, want: 55,
        goods: { 'wr.passkeepers': ['fish', 'copper', 'obsidian'], 'wr.drovers': ['grain', 'potato', 'salt', 'rope', 'tools'] },
        expect: { 'wr.drovers': { copper: 45, fish: 18, obsidian: 6 } }
      });
    }

    /* 7. THE COPPERSMITHS (200 at px 326,1240: Copper Glacier skarn veins + cold-worked wire/sheet/fittings for the Union) */
    {
      var pcp = at(326, 1240);
      S.push({
        id: 'wr.coppersmiths', name: 'The Coppersmiths by the Copper Glacier skarn',
        faction: 'fellgang', people: 200, x: pcp.x, z: pcp.z, scale: Kv, eats: eats('camp'), keepDays: 20,
        start: stockFor(T.diet.camp, 200, 220, { copper: 9000, tools: 1200, peat: 18000 }),
        works: [
          { id: 'cp.store', kind: 'store', name: 'the wire and sheet tally store', crew: 20, out: [], rate: 0 },
          { id: 'cp.skarn', kind: 'mine', name: 'the Copper Glacier skarn drifts', crew: 95, out: ['copper'], rate: rate(32000, 95, Kv),
            site: { kind: 'copper', goods: ['copper'], grade: 180, veins: makeVeins(60, 14000, 48000, 180) } },
          { id: 'cp.smiths', kind: 'smithy', name: 'the cold-worked copper wire and tool benches', crew: 45, batch: { in: { copper: 1.2 }, out: { tools: 1 }, hours: 22 } },
          { id: 'cp.meat', kind: 'folds', name: 'glacier-edge stock', crew: 25, out: ['meat'], rate: rate(9000, 25, Kv) },
          { id: 'cp.peat', kind: 'peat-bank', name: 'turf and moor-sponge fuel', crew: 15, out: ['peat'], rate: rate(14000, 15, Kv) }
        ]
      });
      R.push({
        id: 'wr.road.copper', from: 'wr.coppersmiths', to: 'wr.passkeepers', minutes: Math.round(2.5 * 1440), cap: 16000, carriers: 3, stagger: 1200,
        keep: 12, want: 55,
        goods: { 'wr.coppersmiths': ['copper', 'tools'], 'wr.passkeepers': ['grain', 'potato', 'meat', 'salt', 'fish'] },
        expect: { 'wr.passkeepers': { copper: 55, tools: 4 } }
      });
    }

    /* 8. FELLGANG GOLD CAMP (150 at px 438,1448: node s08nld4zx3, summer mining in bk.shielings, road shut in winter) */
    {
      var pgc = at(438, 1448);
      S.push({
        id: 'wr.goldcamp', name: 'The Fellgang gold camp on the south-west rim (s08nld4zx3, worked in summer)',
        faction: 'fellgang', parent: 'wr.blakhed', people: 150, x: pgc.x, z: pgc.z, scale: Kv, eats: eats('camp'), keepDays: 20,
        start: stockFor(T.diet.camp, 150, 260, { gold: 120 }),
        works: [
          { id: 'gc.store', kind: 'store', name: 'the gold weigh-hut and summer bunk-store', crew: 20, out: [], rate: 0 },
          { id: 'gc.veins', kind: 'mine', name: 'the summer quartz-gold reefs', crew: 90, out: ['gold'],
            rate: rate(1600, 90, Kv, win('bk.shielings')), season: 'bk.shielings',
            site: { kind: 'gold', goods: ['gold'], grade: 140, veins: makeVeins(45, 900, 3600, 140) } },
          { id: 'gc.meat', kind: 'folds', name: 'camp mutton and pack stock', crew: 25, out: ['meat'], rate: rate(6500, 25, Kv) },
          { id: 'gc.peat', kind: 'peat-bank', name: 'high-fell peat', crew: 15, out: ['peat'], rate: rate(10000, 15, Kv) }
        ]
      });
      R.push({
        id: 'wr.road.gold', from: 'wr.goldcamp', to: 'wr.blakhed', minutes: Math.round(4 * 1440), cap: 14000, carriers: 2, stagger: 1440,
        want: 240, share: { 'wr.goldcamp': { gold: 0.9 } },
        goods: { 'wr.blakhed': ['grain', 'potato', 'meat', 'salt', 'peat', 'tools'] },
        closed: [{ legs: [0, 1], window: 'bk.not-shielings' }],
        cut: [{ at: 'wr.blakhed', to: 'tears.blakhed', share: 0.15, goods: ['gold'], why: 'Golden Tears bullion factor purchases at Blakhed' }]
      });
    }

    /* 9. WILDCAT (400 at px 427,1453), BARRICADE (150 at Firebliss pass) & KIMR HALL OF HEROES GATEWAY (1,000 at px 365,1474) */
    {
      var pwc = at(427, 1453), pbr = at(362, 1296), pkm = at(365, 1474);
      S.push({
        id: 'wr.wildcat', name: 'Wildcat (the Fellgang-Kimr raiding band\'s scrap pueblo, syz1ps04fa)',
        faction: 'wildcat', people: 400, x: pwc.x, z: pwc.z, scale: Kv, eats: eats('wildcat'), keepDays: 18,
        start: stockFor(T.diet.wildcat, 400, 320, {
          grain: Math.ceil(400 * T.diet.wildcat.grain * startDays),
          potato: Math.ceil(400 * T.diet.wildcat.potato * startDays),
          salt: Math.ceil(400 * T.diet.wildcat.salt * startDays),
          hides: 8000, ivory: 1400, obsidian: 1800, salvage: 5000
        }),
        works: [
          { id: 'wc.court', kind: 'store', name: 'the sunken round-room cache and trophy court', crew: 40, out: [], rate: 0 },
          { id: 'wc.hunt', kind: 'hunting', name: 'Labyrinth-edge megafauna hunts', crew: 160, out: ['meat', 'hides'], rate: rate(48000, 160, Kv) },
          { id: 'wc.grain', kind: 'fields', name: 'canyon-floor frostoat plots', crew: 70, out: ['grain'], rate: rate(38000, 70, Kv, win('bk.harvest')), season: 'bk.harvest' },
          { id: 'wc.potato', kind: 'fields', name: 'canyon root garths', crew: 40, out: ['potato'], rate: rate(16000, 40, Kv, win('bk.harvest')), season: 'bk.harvest' },
          { id: 'wc.scrap', kind: 'salvage', name: 'ruin-stripping and bone/scrap smithing', crew: 50, out: ['salvage'], rate: rate(9000, 50, Kv) },
          { id: 'wc.smith', kind: 'smithy', name: 'scrap-plate forge', crew: 30, batch: { in: { salvage: 1.5 }, out: { tools: 1 }, hours: 28 } }
        ]
      });

      S.push({
        id: 'wr.barricade', name: 'Barricade (the Fellgang-Kimr pass fort watching the Firebliss approach)',
        faction: 'wildcat', parent: 'wr.wildcat', people: 150, x: pbr.x, z: pbr.z, scale: Kv, eats: eats('wildcat'), keepDays: 18,
        start: stockFor(T.diet.wildcat, 150, 210, { obsidian: 4500, hides: 2500 }),
        works: [
          { id: 'br.gate', kind: 'store', name: 'the pipe-and-stone pass barricade', crew: 25, out: [], rate: 0 },
          { id: 'br.obs', kind: 'quarry', name: 'Firebliss volcanic glass knapping', crew: 55, out: ['obsidian'],
            rate: rate(12000, 55, Kv), site: { id: 'br.glass', kind: 'obsidian', goods: ['obsidian'], amount: 25000, capacity: 25000, regen: 60 } },
          { id: 'br.hunt', kind: 'hunting', name: 'pass game and hides', crew: 45, out: ['meat', 'hides'], rate: rate(15000, 45, Kv) },
          { id: 'br.roots', kind: 'fields', name: 'hot-spring root terraces', crew: 25, out: ['grain', 'potato'], rate: rate(15000, 25, Kv) }
        ]
      });

      S.push({
        id: 'gate.kimr', name: 'The Hall of Heroes and the Kimr pueblos of the Labyrinth',
        faction: 'kimr', people: 1000, x: pkm.x, z: pkm.z, scale: Kc, eats: eats('kimr'), keepDays: 18,
        start: stockFor(T.diet.kimr, 1000, 180, { ivory: 9000, hides: 18000, salt: 12000 }),
        works: [
          { id: 'km.hall', kind: 'market', name: 'the Hall of Heroes', crew: 100, out: [], rate: 0 },
          { id: 'km.hunt', kind: 'hunting', name: 'mammoth and aurochs hunting grounds', crew: 450, out: ['meat', 'hides'], rate: rate(110000, 450, Kc) },
          { id: 'km.ivory', kind: 'ivory-camp', name: 'tusk-carvers and ivory caches', crew: 120, out: ['ivory'], rate: rate(8500, 120, Kc) },
          { id: 'km.grain', kind: 'fields', name: 'canyon maize and bean plots', crew: 250, out: ['grain'], rate: rate(92000, 250, Kc) },
          { id: 'km.salt', kind: 'salt-pans', name: 'Labyrinth salt licks', crew: 80, out: ['salt'], rate: rate(12000, 80, Kc) }
        ]
      });

      R.push({
        id: 'wr.road.kimr', from: 'gate.kimr', to: 'wr.wildcat', minutes: Math.round(5.5 * 1440), cap: 16000, carriers: 2, stagger: 2160,
        keep: 15, want: 60,
        goods: { 'gate.kimr': ['ivory', 'hides', 'meat', 'salt'], 'wr.wildcat': ['salvage', 'tools', 'obsidian'] },
        expect: { 'wr.wildcat': { ivory: 12, hides: 18, salt: 10 }, 'gate.kimr': { salvage: 14, tools: 2 } }
      });
      R.push({
        id: 'wr.road.barricade', from: 'wr.barricade', to: 'wr.wildcat', minutes: Math.round(6.5 * 1440), cap: 12000, carriers: 2, stagger: 2160,
        keep: 15, want: 55,
        goods: { 'wr.barricade': ['obsidian', 'hides', 'salt'], 'wr.wildcat': ['grain', 'ivory', 'salvage', 'tools'] },
        expect: { 'wr.wildcat': { obsidian: 14 } }
      });
      R.push({
        id: 'wr.road.firebliss', from: 'wr.barricade', to: 'wr.passkeepers', minutes: Math.round(3.5 * 1440), cap: 10000, carriers: 2, stagger: 1440,
        keep: 15, want: 55,
        goods: { 'wr.barricade': ['obsidian', 'hides'], 'wr.passkeepers': ['fish', 'grain', 'potato', 'salt', 'tools'] },
        expect: { 'wr.passkeepers': { obsidian: 10 }, 'wr.barricade': { salt: 8 } }
      });
      /* Unarmed Wildcat Fair traders admitted inside Blakhed's 16 Truce Stones ONLY during the 10-day Autumn Fair (`bk.fair`) */
      R.push({
        id: 'wr.road.fair.wildcat', from: 'wr.wildcat', to: 'wr.blakhed', minutes: 1440, cap: 14000, carriers: 3, stagger: 360,
        keep: 12, want: 180,
        goods: { 'wr.wildcat': ['ivory', 'hides', 'obsidian'], 'wr.blakhed': ['grain', 'potato', 'salt', 'rope', 'tools'] },
        expect: { 'wr.blakhed': { ivory: 8, obsidian: 8, hides: 16 } },
        closed: [{ legs: [0, 1], window: 'bk.not-fair' }]
      });
    }

    /* 10. MOBILE ROAD TRAVELLERS (650 at Winterings, scale 25) & THE KRADZ DARK CLAN (100 at W Hearth vent caves px 430,1388) */
    {
      var ptr = at(440.9, 1400.2), pkr = at(430, 1388);
      S.push({
        id: 'wr.travellers', name: 'The Travellers (the Fellgang road clans wintering at Blakhed\'s Winterings)',
        faction: 'fellgang', parent: 'wr.blakhed', people: 650, x: ptr.x, z: ptr.z, scale: 25, eats: eats('traveller'), keepDays: 18,
        start: stockFor(T.diet.traveller, 650, 220, { potato: Math.ceil(650 * T.diet.traveller.potato * startDays), iron: 2400, copper: 1800, tools: 1800, rope: 4000 }),
        works: [
          { id: 'tr.camp', kind: 'vardo-ring', name: 'the seven Winterings family circles and pony paddocks', crew: 150, out: [], rate: 0 },
          { id: 'tr.tinsmith', kind: 'salvage-smith', name: 'the Travellers\' tinsmith and salvage-mending fires', crew: 125,
            batch: { in: { iron: 0.6, copper: 0.4 }, out: { tools: 1 }, hours: 18 } },
          { id: 'tr.herds', kind: 'byre', name: 'the road ponies and pack beasts', crew: 200,
            herd: { out: ['dairy'], rate: 26000 / (Math.max(1, Math.round(550 / 25)) * 25 * yr * 24), animals: 550 } },
          { id: 'tr.meat', kind: 'folds', name: 'drove and fair stock', crew: 100, out: ['meat'], rate: rate(22000, 100, 25) }
        ]
      });
      R.push({
        id: 'wr.road.winterings', from: 'wr.blakhed', to: 'wr.travellers', minutes: 60, cap: 18000, carriers: 3, stagger: 120,
        keep: 12, want: 35,
        goods: { 'wr.blakhed': ['grain', 'potato', 'dairy', 'meat', 'salt', 'rope', 'iron', 'copper'], 'wr.travellers': ['tools'] },
        expect: { 'wr.travellers': { iron: 4, copper: 3 } }
      });

      S.push({
        id: 'wr.kradz', name: 'The Kradz (the underground-margin Traveller clan at the western Hearth vent caves)',
        faction: 'fellgang', people: 100, x: pkr.x, z: pkr.z, scale: Kv, eats: eats('kradz'), keepDays: 14,
        start: stockFor(T.diet.kradz, 100, 190, { ice: 45000, rope: 5000, wax: 90, fungus: 420 }),
        works: [
          { id: 'kr.vent', kind: 'vent-camp', name: 'the warm vent-cave winter hold and shaft-rigging loft', crew: 40, out: [], rate: 0 },
          { id: 'kr.rigs', kind: 'ropewalk', name: 'the shaft-cable splicers', crew: 40, out: ['rope'], rate: rate(12000, 40, Kv) },
          { id: 'kr.meat', kind: 'folds', name: 'cave-mouth goats', crew: 20, out: ['meat'], rate: rate(4000, 20, Kv) }
        ]
      });
      R.push({
        id: 'wr.road.kradz-bk', from: 'wr.blakhed', to: 'wr.kradz', minutes: Math.round(1.5 * 1440), cap: 18000, carriers: 3, stagger: 720,
        keep: 14, want: 45,
        goods: {
          'wr.blakhed': ['grain', 'ice', 'eggs', 'salt', 'copper', 'tools'],
          'wr.kradz': ['wax', 'fungus', 'rareearths', 'salvage', 'cells']
        },
        expect: { 'wr.kradz': { ice: 220, copper: 24, eggs: 12 }, 'wr.blakhed': { wax: 30, rareearths: 2, salvage: 8 } }
      });
      /* Ice-cutters' south-wall / adit carry to Kradz shaft-heads (approved Q2) */
      R.push({
        id: 'wr.road.ice.kradz', from: 'wr.icecutters', to: 'wr.kradz', minutes: Math.round(9 * 1440), cap: 18000, carriers: 2, stagger: 2880,
        want: 160, share: { 'wr.icecutters': { ice: 0.14 } },
        goods: { 'wr.kradz': ['wax', 'rope', 'tools'] },
        closed: o.openIceRoad ? undefined : [{ legs: [0, 1], window: 'bk.thaw' }]
      });
    }

    /* 11. TUNGANG UNION HOLDS: LOJ TWENNY (2,000), HEARTH HOLD (2,000), LOJ FOWER AT LEDGE LIFTS (1,500), SALTPETER WORKS (150) */
    {
      var plt = at(445, 1266), phh = at(525, 1400), plf = at(437.5, 1330.5), psp = at(492, 1255);
      S.push({
        id: 'tg.twenny', name: 'Loj Twenny (the km 218 junction hold and Great Shaft foot, spbzmhdqqd)',
        faction: 'tungang', people: 2000, x: plt.x, z: plt.z, scale: K, eats: eats('tungang'), keepDays: 16,
        start: stockFor(T.diet.tungang, 2000, 150, { fungus: 140000, wax: 52000, ice: 65000, copper: 12000, rareearths: 3500, salvage: 22000, cells: 240 }),
        works: [
          { id: 'lt.junction', kind: 'station', name: 'the km 218 rail hall and Great Shaft hoist foot', crew: 250, out: [], rate: 0 },
          { id: 'lt.beds', kind: 'fungus-beds', name: 'the dark-bed fungus vats (mash)', crew: 650, out: ['fungus'], rate: rate(350000, 650, K) },
          { id: 'lt.wax', kind: 'wax-still', name: 'the vent-wax condensers', crew: 250, out: ['wax'], rate: rate(58000, 250, K) },
          { id: 'lt.re', kind: 'bore-mine', name: 'the 5 km bore rare-earth and copper drifts', crew: 350, out: ['copper', 'rareearths'], rate: rate(26000, 350, K) },
          { id: 'lt.salvage', kind: 'salvage', name: 'the Line cable and plate crews', crew: 250, out: ['salvage'], rate: rate(28000, 250, K) },
          { id: 'lt.fixers', kind: 'fixer-shop', name: 'the Fixers\' hot-door cell chargers and winding benches', crew: 150,
            batch: { in: { copper: 4, rareearths: 1 }, out: { cells: 1, tools: 3 }, hours: 24 } }
        ]
      });

      S.push({
        id: 'tg.hearth', name: 'The Hearth Hold (the hypogene cavern hold under the Hearth field)',
        faction: 'tungang', people: 2000, x: phh.x, z: phh.z, scale: K, eats: eats('hearth'), keepDays: 18,
        start: stockFor(T.diet.hearth, 2000, 150, { wax: 55000, fungus: 130000, ice: 95000 }),
        works: [
          { id: 'hh.hall', kind: 'station', name: 'the Hearth cisterns and cooling-suit dock', crew: 200, out: [], rate: 0 },
          { id: 'hh.wax', kind: 'hearth-well', name: 'the Hearth wax skimmers (staple and lamp fuel)', crew: 600, out: ['wax'], rate: rate(95000, 600, K) },
          { id: 'hh.beds', kind: 'fungus-beds', name: 'warm-cavern dark crops and leaper pens', crew: 750, out: ['fungus'], rate: rate(320000, 750, K) },
          { id: 'hh.smith', kind: 'fixer-shop', name: 'cooling-suit and lamp shop', crew: 150, out: ['tools'], rate: rate(6000, 150, K) }
        ]
      });

      S.push({
        id: 'tg.fower', name: 'Loj Fower (the Tungang lift-hold operating Ledge\'s 1.3 km cliff lifts)',
        faction: 'tungang', people: 1500, x: plf.x, z: plf.z, scale: K, eats: eats('tungang'), keepDays: 18,
        start: stockFor(T.diet.tungang, 1500, 150, { fungus: 80000, wax: 20000, ice: 45000 }),
        works: [
          { id: 'lf.lifts', kind: 'lift-head', name: 'Ledge\'s 1.3 km counterweight lifts and cable drums', crew: 450, out: [], rate: 0 },
          { id: 'lf.beds', kind: 'fungus-beds', name: 'the cliff-gallery mash beds', crew: 550, out: ['fungus'], rate: rate(210000, 550, K) },
          { id: 'lf.wax', kind: 'wax-still', name: 'fissure wax traps', crew: 250, out: ['wax'], rate: rate(22000, 250, K) }
        ]
      });

      S.push({
        id: 'tg.saltpeter', name: 'The Tungang cave saltpeter works (s4i2tk5zvf)',
        faction: 'tungang', parent: 'tg.twenny', people: 150, x: psp.x, z: psp.z, scale: 15, eats: eats('tungang'), keepDays: 20,
        start: stockFor(T.diet.tungang, 150, 180, { saltpeter: 18000 }),
        works: [
          { id: 'sp.store', kind: 'store', name: 'the nitre cave store', crew: 15, out: [], rate: 0 },
          { id: 'sp.caves', kind: 'mine', name: 'the rich nitre caverns (grade 200)', crew: 95, out: ['saltpeter'], rate: rate(45000, 95, 15) },
          { id: 'sp.beds', kind: 'fungus-beds', name: 'cave mash trays', crew: 40, out: ['fungus'], rate: rate(22000, 40, 15) }
        ]
      });

      /* Kradz 2.2 km Great Shaft hoist at km 218 (`wr.kradz <-> tg.twenny`) */
      R.push({
        id: 'wr.shaft.twenny', from: 'wr.kradz', to: 'tg.twenny', minutes: 720, cap: 18000, carriers: 4, stagger: 180,
        keep: 10, want: 55,
        goods: { 'wr.kradz': ['ice', 'rope', 'eggs', 'copper', 'salt'], 'tg.twenny': ['wax', 'fungus', 'rareearths', 'salvage', 'cells', 'tools'] },
        expect: { 'tg.twenny': { ice: 190, copper: 20, rope: 12, eggs: 8 }, 'wr.kradz': { wax: 22, fungus: 25, rareearths: 3, salvage: 10 } },
        cut: [{ at: 'tg.twenny', to: 'wr.kradz', share: T.kradzCut, goods: ['ice', 'copper', 'rope'], why: 'the Kradz shaft-riggers\' tenth on the km 218 hoist' }]
      });

      /* Fowlers <-> Hearth Hold (~80 km pack road: eggs, honey, herbs for hearth wax & mash) */
      R.push({
        id: 'wr.road.hearth', from: 'wr.fowlers', to: 'tg.hearth', minutes: Math.round(3.5 * 1440), cap: 24000, carriers: 5, stagger: 960,
        keep: 12, want: 75,
        goods: { 'wr.fowlers': ['eggs', 'honey', 'herbs'], 'tg.hearth': ['wax', 'fungus', 'tools'] },
        expect: { 'tg.hearth': { eggs: 85, honey: 16, herbs: 6 }, 'wr.fowlers': { wax: 18 } }
      });

      /* Ice-cutters <-> Hearth Hold (night south-wall / hot-floor cooling-suit ice carry) */
      R.push({
        id: 'wr.road.ice.hearth', from: 'wr.icecutters', to: 'tg.hearth', minutes: Math.round(6 * 1440), cap: 28000, carriers: 3, stagger: 2160,
        want: 180, share: { 'wr.icecutters': { ice: 0.22 } },
        goods: { 'tg.hearth': ['wax', 'tools'] },
        closed: o.openIceRoad ? undefined : [{ legs: [0, 1], window: 'bk.thaw' }]
      });

      /* Saltpeter cave works <-> Loj Twenny (75 km cavern haul) */
      R.push({
        id: 'wr.road.saltpeter', from: 'tg.saltpeter', to: 'tg.twenny', minutes: Math.round(3 * 1440), cap: 14000, carriers: 2, stagger: 1440,
        want: 60, share: { 'tg.saltpeter': { saltpeter: 0.85 } },
        goods: { 'tg.twenny': ['grain', 'wax', 'salt', 'ice', 'timber', 'tools'] }
      });

      /* Union internal bore link (`tg.twenny <-> tg.fower` & `tg.twenny <-> tg.hearth`) */
      R.push({
        id: 'wr.bore.fower', from: 'tg.twenny', to: 'tg.fower', minutes: 1440, cap: 24000, carriers: 3, stagger: 480,
        keep: 14, want: 45,
        goods: { 'tg.twenny': ['ice', 'wax', 'tools', 'salvage'], 'tg.fower': ['grain', 'salt', 'timber'] },
        expect: { 'tg.fower': { ice: 130, wax: 15 }, 'tg.twenny': { grain: 220, timber: 45, salt: 35 } }
      });
      R.push({
        id: 'wr.bore.hearth', from: 'tg.hearth', to: 'tg.twenny', minutes: Math.round(3.5 * 1440), cap: 22000, carriers: 3, stagger: 1200,
        keep: 14, want: 45,
        goods: { 'tg.hearth': ['wax', 'eggs', 'honey'], 'tg.twenny': ['grain', 'salt', 'timber', 'tools'] },
        expect: { 'tg.twenny': { wax: 35 }, 'tg.hearth': { grain: 310, salt: 42 } }
      });
    }

    /* 12. DALAB IN THE WEST RIFT: GREAT LAKE BASIN (50,000 rural), SKARN (400), LEDGE (10,000), SHELF GATEWAY (2,500) */
    {
      var pba = at(445, 1348), psk = at(416, 1377), plg = at(437, 1330), psh = at(488, 1205);
      S.push({
        id: 'wr.basin', name: 'The Great Lake Basin (50,000 rural shore farms, fisheries and gene estates)',
        faction: 'dalab', parent: 'wr.nulab', people: 50000, x: pba.x, z: pba.z, scale: 250, eats: eats('basin'), keepDays: 18,
        start: stockFor(T.diet.basin, 50000, 120, { grain: Math.ceil(50000 * T.diet.basin.grain * 290), salt: 190000, timber: 220000 }),
        works: [
          { id: 'ba.estates', kind: 'store', name: 'the basin granaries and shore landings', crew: 1000, out: [], rate: 0 },
          { id: 'ba.grain', kind: 'farmstead', name: 'the 1,654 km2-eq helix-bean and rice plain', crew: 18000, out: ['grain'],
            rate: rate(12500000, 18000, 250, win('bk.shielings')), season: 'bk.shielings' },
          { id: 'ba.meat', kind: 'folds', name: 'basin livestock and water-meadows', crew: 3500, out: ['meat'], rate: rate(950000, 3500, 250) },
          { id: 'ba.cloth', kind: 'weaver', name: 'lotus-silk and flax villages', crew: 1500, out: ['cloth'], rate: rate(45000, 1500, 250) },
          { id: 'ba.timber', kind: 'lumber', name: 'slope forestry', crew: 1500, out: ['timber'], rate: rate(320000, 1500, 250) }
        ]
      });
      R.push({
        id: 'wr.road.basin', from: 'wr.basin', to: 'wr.nulab', minutes: 720, cap: 95000, carriers: 12, stagger: 60,
        want: 55, share: { 'wr.basin': { grain: 0.24, meat: 0.14, cloth: 0.35, timber: 0.5 } },
        goods: { 'wr.nulab': ['salt', 'tools', 'ice'] }
      });

      S.push({
        id: 'dalab.skarn', name: 'Dalab\'s skarn mining hamlet (65 km WSW of Nulab, copper 240 and iron 210)',
        faction: 'dalab', parent: 'wr.nulab', people: 400, x: psk.x, z: psk.z, scale: 20, eats: eats('dalab'), keepDays: 20,
        start: stockFor(T.diet.dalab, 400, 160, { copper: 18000, iron: 22000 }),
        works: [
          { id: 'sk.store', kind: 'store', name: 'the skarn ore yard', crew: 40, out: [], rate: 0 },
          { id: 'sk.copper', kind: 'mine', name: 'the rich copper skarn (grade 240)', crew: 180, out: ['copper'], rate: rate(65000, 180, 20) },
          { id: 'sk.iron', kind: 'mine', name: 'the magnetite iron drift (grade 210)', crew: 140, out: ['iron'], rate: rate(55000, 140, 20) }
        ]
      });
      R.push({
        id: 'wr.road.skarn', from: 'dalab.skarn', to: 'wr.nulab', minutes: Math.round(2.6 * 1440), cap: 24000, carriers: 3, stagger: 1200,
        want: 50, share: { 'dalab.skarn': { copper: 0.9, iron: 0.85 } },
        goods: { 'wr.nulab': ['grain', 'meat', 'salt', 'cloth', 'tools'] }
      });

      /* LEDGE (10,000 arcology: starved of grain quickly if Loj Fower closes the lifts during a Union strike!) */
      S.push({
        id: 'dalab.ledge', name: 'Ledge (Dalab\'s cliff-edge arcology and gene bank above the lake, sxyznayzgc)',
        faction: 'dalab', people: 10000, x: plg.x, z: plg.z, scale: Kc, eats: eats('ledge'), keepDays: 16,
        start: Object.assign(stockFor(T.diet.ledge, 10000, strike ? 28 : 75), {
          fish: 95000, salt: 65000, bronze: 18000, copper: 14000, tin: 6000, cloth: 20000, timber: 75000, tools: 8000
        }),
        works: [
          { id: 'lg.arcology', kind: 'market', name: 'Ledge\'s arcology stores and rim gene bank', crew: 400, out: [], rate: 0 },
          { id: 'lg.fish', kind: 'fishery', name: 'the lake cliff-foot fisheries and lotus beds', crew: 1400, out: ['fish'], rate: rate(320000, 1400, Kc) },
          { id: 'lg.meat', kind: 'folds', name: 'garrison pens', crew: 500, out: ['meat'], rate: rate(145000, 500, Kc) },
          { id: 'lg.bronze', kind: 'foundry', name: 'Ledge\'s bronze foundries (27 t/yr)', crew: 300,
            batch: { in: { copper: 0.88, tin: 0.12 }, out: { bronze: 1, tools: 0.35 }, hours: 16 } },
          { id: 'lg.looms', kind: 'weaver', name: 'lotus-silk workshops', crew: 300, out: ['cloth'], rate: rate(16000, 300, Kc) }
        ]
      });

      S.push({
        id: 'dalab.shelf', name: 'Shelf and Dalab\'s northern heartland gateway',
        faction: 'dalab', people: 2500, x: psh.x, z: psh.z, scale: Kc, eats: eats('dalab'), keepDays: 15,
        start: stockFor(T.diet.dalab, 2500, 180, { grain: 1400000, iron: 90000, tin: 35000, cloth: 45000, salt: 85000, tools: 18000 }),
        works: [
          { id: 'sf.gate', kind: 'market', name: 'Shelf\'s Linehead and road-tunnel depot', crew: 200, out: [], rate: 0 },
          { id: 'sf.grain', kind: 'farmstead', name: 'heartland grain pool', crew: 900, out: ['grain'], rate: rate(950000, 900, Kc) },
          { id: 'sf.metals', kind: 'smelter', name: 'northern valley iron and granite tin', crew: 400, out: ['iron', 'tin'], rate: rate(65000, 400, Kc) },
          { id: 'sf.meat', kind: 'folds', name: 'heartland stock', crew: 300, out: ['meat'], rate: rate(70000, 300, Kc) },
          { id: 'sf.salt', kind: 'salt-pans', name: 'northern salt pool', crew: 200, out: ['salt'], rate: rate(45000, 200, Kc) }
        ]
      });

      /* Drovers <-> Ledge salt road (89 km: solves Ledge's ~290 t/yr salt shortfall + feeds basin salt) */
      R.push({
        id: 'wr.road.ledge.salt', from: 'wr.drovers', to: 'dalab.ledge', minutes: Math.round(3.6 * 1440), cap: 34000, carriers: 5, stagger: 1080,
        keep: 14, want: 55,
        goods: { 'wr.drovers': ['salt', 'meat', 'hides'], 'dalab.ledge': ['grain', 'bronze', 'cloth', 'tools'] },
        expect: { 'dalab.ledge': { salt: 820 }, 'wr.drovers': { grain: 110, tools: 2 } }
      });

      /* Ledge's lifts + lake boats (`wr.nulab <-> dalab.ledge` via `tg.fower`, shut when `strike: true`!) */
      R.push({
        id: 'wr.road.lifts', from: 'wr.nulab', to: 'dalab.ledge', minutes: Math.round(1.5 * 1440), cap: 75000, carriers: 12, stagger: 180,
        keep: 14, want: 45,
        goods: { 'wr.nulab': ['grain', 'timber', 'copper', 'iron', 'tea', 'ice'], 'dalab.ledge': ['salt', 'fish', 'bronze'] },
        expect: { 'dalab.ledge': { grain: 4600, timber: 190, copper: 75 }, 'wr.nulab': { salt: 480 } },
        closed: strike ? [{ legs: [0, 1], window: 'wr.always' }] : undefined,
        cut: [{ at: 'dalab.ledge', to: 'tg.fower', share: T.liftCut, goods: ['grain', 'timber'], why: 'Loj Fower\'s lift-passage share at Ledge' }]
      });

      /* Loj Fower local bargain with Ledge (shut on strike) */
      R.push({
        id: 'wr.road.fower-ledge', from: 'dalab.ledge', to: 'tg.fower', minutes: 180, cap: 18000, carriers: 3, stagger: 60,
        keep: 12, want: 40,
        goods: { 'dalab.ledge': ['grain', 'salt', 'timber', 'tools'], 'tg.fower': ['fungus', 'wax'] },
        closed: strike ? [{ legs: [0, 1], window: 'wr.always' }] : undefined
      });

      /* The Line (`dalab.shelf <-> tg.twenny <-> dalab.ledge`: 2 days rail + Traveller G1/G3 portal-gap portering; shut on strike) */
      R.push({
        id: 'wr.road.line', stops: ['dalab.shelf', 'tg.twenny', 'dalab.ledge'], minutes: 1440, cap: 48000, carriers: 6, stagger: 360,
        keep: 14, want: 45,
        goods: {
          'dalab.shelf': ['grain', 'timber', 'iron', 'tin', 'cloth'],
          'tg.twenny': ['saltpeter', 'rareearths', 'copper', 'salvage', 'cells', 'grain', 'tin'],
          'dalab.ledge': ['bronze', 'salt']
        },
        expect: {
          'tg.twenny': { grain: 650, timber: 90, tin: 25 },
          'dalab.ledge': { tin: 20, iron: 25 },
          'dalab.shelf': { saltpeter: 75, rareearths: 6, salvage: 25 }
        },
        closed: strike ? [{ legs: [0, 1, 2], window: 'wr.always' }] : undefined,
        cut: [{ at: 'tg.twenny', to: 'wr.travellers', share: 0.03, goods: ['grain', 'iron'], why: 'Travellers\' G1/G3 surface portal-gap portering fee' }]
      });

      /* Dalab's 528 km surface road (`dalab.shelf <-> dalab.ledge`: slow 21-day haul; Wildcat raids in peace, plus Kradz/Union shaft raids in strike!) */
      var surfRaids = [];
      if (o.raids !== false) {
        surfRaids.push({
          at: 'dalab.ledge', from: 'dalab.shelf', to: 'wr.wildcat', every: 4, spare: 3, share: 0.15,
          goods: ['grain', 'iron', 'cloth', 'tools'], why: 'Wildcat surface raid on Dalab\'s cliff-top supply train'
        });
      }
      if (strike) {
        surfRaids.push({
          at: 'dalab.ledge', from: 'dalab.shelf', to: 'tg.twenny', every: 2, spare: 1, share: 0.45,
          goods: ['grain', 'iron', 'tools'], why: 'Striking Tungang and Kradz shaft-head ambush (km 4-24 & km 290-304)'
        });
      }
      R.push({
        id: 'dalab.road.surface', from: 'dalab.shelf', to: 'dalab.ledge', minutes: Math.round(21 * 1440), cap: 26000, carriers: 3, stagger: Math.round(7 * 1440),
        keep: 15, want: 50,
        provision: { beasts: 40, eat: { grain: 1.5 }, loss: 0.4, home: 0, maxDays: 10 },
        losses: o.raids === false ? undefined : [{ legs: [0], every: 5, spare: 4, share: 0.1, why: 'Wildcat surface raiders on the Ledge approach' }],
        raids: surfRaids.length ? surfRaids : undefined,
        goods: { 'dalab.shelf': ['grain', 'iron', 'tin', 'cloth', 'tools'], 'dalab.ledge': ['bronze', 'fish'] },
        expect: { 'dalab.ledge': { grain: 420, tin: 15, iron: 20 } }
      });
    }

    /* 13. TRAVELLERS' MULTI-STOP THAW ROUNDS (wr.round.west & wr.round.rim: shut in bk.winter while vardos camp at Winterings) */
    R.push({
      id: 'wr.round.west',
      stops: ['wr.blakhed', 'wr.drovers', 'dalab.ledge', 'wr.passkeepers', 'wr.coppersmiths', 'wr.drovers'],
      legs: [Math.round(6.5 * 1440), Math.round(3.5 * 1440), Math.round(4.5 * 1440), Math.round(2.5 * 1440), Math.round(2.5 * 1440), Math.round(6.5 * 1440)],
      cap: 18000, carriers: 3, stagger: 2880, keep: 15, want: 45,
      goods: {
        'wr.blakhed': ['rope', 'eggs', 'honey', 'felt', 'grain'],
        'wr.drovers': ['salt', 'meat', 'hides', 'copper'],
        'dalab.ledge': ['bronze', 'cloth', 'grain'],
        'wr.passkeepers': ['fish', 'obsidian'],
        'wr.coppersmiths': ['copper', 'tools']
      },
      expect: {
        'dalab.ledge': { salt: 90, rope: 10 },
        'wr.passkeepers': { grain: 35, cloth: 2 },
        'wr.coppersmiths': { grain: 45, fish: 10 },
        'wr.drovers': { copper: 30, tools: 3 },
        'wr.blakhed': { copper: 25, salt: 80 }
      },
      closed: [{ legs: [0, 1, 2, 3, 4, 5], window: 'bk.winter' }],
      cut: [{ at: 'wr.blakhed', to: 'wr.travellers', share: T.travellerCut, why: 'Traveller vardo-clan carrier margin on the western round' }]
    });

    R.push({
      id: 'wr.round.rim',
      stops: ['wr.blakhed', 'wr.fowlers', 'tg.hearth'],
      legs: [Math.round(12 * 1440), Math.round(3.5 * 1440), Math.round(10 * 1440)],
      cap: 16000, carriers: 2, stagger: 4320, keep: 15, want: 50,
      goods: {
        'wr.blakhed': ['grain', 'salt', 'rope', 'peat'],
        'wr.fowlers': ['eggs', 'honey', 'herbs'],
        'tg.hearth': ['wax', 'fungus', 'tools']
      },
      expect: {
        'wr.fowlers': { grain: 35, salt: 8, rope: 6 },
        'tg.hearth': { eggs: 25, honey: 8 },
        'wr.blakhed': { wax: 20 }
      },
      closed: [{ legs: [0, 1, 2], window: 'bk.winter' }],
      cut: [{ at: 'wr.blakhed', to: 'wr.travellers', share: T.travellerCut, why: 'Traveller vardo-clan carrier margin on the north-rim round' }]
    });

    /* 14. RELATIONS: Market Peace (`fellgang` <-> `wildcat` wary so Fair truce road runs), Wildcat hostile to Dalab, Strike flips Union <-> Dalab */
    var F = T.factions.map(function (f) { return f.id; }), rel = [];
    F.forEach(function (a) {
      F.forEach(function (b) {
        if (a === b) return;
        var st = 'friendly', pair = a < b ? a + ':' + b : b + ':' + a;
        if (pair === 'dalab:wildcat' || pair === 'tears:wildcat' || pair === 'wildcat:xanadu') st = 'hostile';
        else if (pair === 'dalab:kimr') st = 'hostile';
        else if (pair === 'fellgang:wildcat' || pair === 'tungang:wildcat') st = 'wary';
        else if (pair === 'dalab:tungang') st = strike ? 'hostile' : 'wary';
        else if (pair === 'dalab:fellgang') st = 'wary';
        rel.push({ a: a, b: b, stance: st });
      });
    });

    return {
      seed: 441400, scale: Kv, start: 0, calendar: T.calendar, goods: T.goods,
      factions: T.factions.slice(), relations: rel, settlements: S, roads: R, transfers: [],
      meta: { slice: slice, strike: strike, fellgangPop: S.filter(function (s) { return T.fellgangIds.indexOf(s.id) >= 0; }).reduce(function (n, s) { return n + s.people; }, 0) }
    };
  };

  /* ---- STEP W3: JOIN XAN_TUNE OR EAST_RIFT ON THE ANNUAL GREAT CARAVAN ---- */
  T.join = function (XV, o) {
    o = Object.assign({ slice: 'blakhed', villageScale: 25 }, o || {});
    var W = T.valley(o), V = Object.assign({}, XV);
    var hasShelf = W.settlements.some(function (s) { return s.id === 'dalab.shelf'; });
    var gone = hasShelf ? ['gate.dalab.blakhed', 'gate.dalab.nulab', 'gate.dalab.shelf'] : ['gate.dalab.blakhed', 'gate.dalab.nulab'];
    V.settlements = XV.settlements.filter(function (s) { return gone.indexOf(s.id) < 0; }).concat(W.settlements);
    V.goods = Object.assign({}, W.goods, XV.goods);
    V.factions = XV.factions.concat(W.factions.filter(function (f) { return !XV.factions.some(function (g) { return g.id === f.id; }); }));
    var rel = XV.relations.slice(), has = function (a, b) { return rel.some(function (r) { return r.a === a && r.b === b; }); };
    W.relations.forEach(function (r) { if (!has(r.a, r.b)) rel.push(r); });
    V.factions.forEach(function (f) {
      V.factions.forEach(function (g) {
        if (f.id === g.id || has(f.id, g.id)) return;
        var bad = (f.id === 'wildcat' && g.id !== 'fellgang' && g.id !== 'kimr' && g.id !== 'tungang') ||
                  (g.id === 'wildcat' && f.id !== 'fellgang' && f.id !== 'kimr' && f.id !== 'tungang');
        rel.push({ a: f.id, b: g.id, stance: bad ? 'hostile' : 'friendly' });
      });
    });
    V.relations = rel;
    V.calendar = Object.assign({}, XV.calendar, { windows: Object.assign({}, (XV.calendar || {}).windows || {}, W.calendar.windows) });
    var swap = function (id) {
      if (id === 'gate.dalab.blakhed') return 'wr.blakhed';
      if (id === 'gate.dalab.nulab') return 'wr.nulab';
      if (hasShelf && id === 'gate.dalab.shelf') return 'dalab.shelf';
      return id;
    };
    var wRoads = W.roads.map(function (r) { return JSON.parse(JSON.stringify(r)); });
    var xOut = [], xExp = {};
    V.roads = XV.roads.map(function (r) {
      if (r.id !== 'caravan.great') return r;
      var c = JSON.parse(JSON.stringify(r)), g = {}, ex = {};
      xExp = Object.assign({}, (c.expect || {})['gate.dalab.blakhed'] || {});
      xOut = Object.keys(xExp);
      c.stops = c.stops.map(swap);
      Object.keys(c.goods || {}).forEach(function (k) { g[swap(k)] = c.goods[k]; });
      Object.keys(c.expect || {}).forEach(function (k) { ex[swap(k)] = c.expect[k]; });
      c.goods = g; c.expect = ex;
      c.cut = (c.cut || []).concat([{ at: 'wr.blakhed', to: 'tears.blakhed', share: T.tearsCut, goods: xOut, why: 'the Golden Tears\' western house at Blakhed' }]);
      return c;
    }).concat(wRoads);
    var st = V.roads.find(function (r) { return r.id === 'wr.road.stair'; });
    if (st && xOut.length) {
      xOut.forEach(function (g2) { if (st.goods['wr.blakhed'].indexOf(g2) < 0) st.goods['wr.blakhed'].push(g2); });
      st.expect['wr.nulab'] = Object.assign({}, st.expect['wr.nulab'] || {}, xExp);
    }
    V.transfers = (XV.transfers || []).concat(W.transfers || []);
    return V;
  };

  /* ---- PHASE F3: BLAKHED'S MARKET PEACE BOWL & FELLGANG RISING 8 (PLAN-POLITICS.md) ---- */
  T.marketPeace = function (books, cuts, trade) {
    var bk = books && books.towns && books.towns['wr.blakhed'];
    if (!bk) return { score: 0, state: 'missing', truce: false, factors: {} };
    var eatenG = D0(bk.eaten && bk.eaten.grain, 0), hunG = D0(bk.hungry && bk.hungry.grain, 0);
    var foodRatio = eatenG + hunG > 0 ? eatenG / (eatenG + hunG) : 1;
    var ropeMade = D0(bk.made && bk.made.rope, 0), iceMade = D0(bk.made && bk.made.ice, 0);
    /* Double Meeting balance: both Fowlers' rope-wall craft and Ice-cutters' ice-pond craft active */
    var doubleHall = (ropeMade > 40000 ? 0.5 : ropeMade / 80000) + (iceMade > 500000 ? 0.5 : iceMade / 1000000);
    var stairCut = cuts && cuts['wr.road.stair'] && cuts['wr.road.stair'].taken || {};
    var tollIce = D0(stairCut['dalab.blakhed:ice'], 0);
    var dnIce = trade && trade['wr.road.stair'] && trade['wr.road.stair'].landed &&
      trade['wr.road.stair'].landed['wr.blakhed>wr.nulab'] && trade['wr.road.stair'].landed['wr.blakhed>wr.nulab'].ice || 0;
    var tollShare = dnIce > 0 ? tollIce / dnIce : 0.1;
    var tollPenalty = Math.max(0, (tollShare - 0.12) * 220);
    var fairLanded = trade && trade['wr.road.fair.wildcat'] && trade['wr.road.fair.wildcat'].landed &&
      trade['wr.road.fair.wildcat'].landed['wr.wildcat>wr.blakhed'] || {};
    var fairActive = (D0(fairLanded.ivory, 0) + D0(fairLanded.hides, 0) + D0(fairLanded.obsidian, 0)) > 0;
    var raw = 55 * foodRatio + 30 * Math.min(1, doubleHall) + (fairActive ? 15 : 8) - tollPenalty;
    var score = Math.max(0, Math.min(100, Math.round(raw)));
    var state = score >= 75 ? 'peace' : score >= 45 ? 'strained' : 'crisis';
    return {
      score: score, state: state, truce: score >= 45,
      factors: { foodRatio: +foodRatio.toFixed(4), doubleHall: +Math.min(1, doubleHall).toFixed(3), tollShare: +tollShare.toFixed(3), fairActive: fairActive }
    };
  };

  /* PLAN-POLITICS.md §0.8 & §2: Rising 8 — Fellgangs/Wildcat uniting under a charismatic Boast leader against Nulab */
  T.rising = {
    id: 'wr.rising.nulab',
    kind: 'rising',
    attacker: 'wildcat',
    allies: ['fellgang'],
    target: 'wr.nulab',
    leaderTitle: 'Speaker of the Great Boast',
    buildUpDays: 180,
    cooldownDays: 730,
    maxWorldRisings: 2,
    worldCap: 68,          /* PLAN-POLITICS §1: without player pressure, stops at `gathering` (standing crisis) and eases back */
    marchThreshold: 85,
    stages: [
      { id: 'calm', min: 0, what: 'scattered Winter raids on wr.road.ice and Dalab\'s surface trains' },
      { id: 'rumour', min: 25, what: 'a Wildcat hero claims the Aurochs-horn helm on the sunken round-room roof' },
      { id: 'boast', min: 50, what: 'bands gather at Wildcat and the fells; Stairhead garrison doubled' },
      { id: 'gathering', min: 65, what: 'standing crisis on the gorge rim; Dalab sends basin grain relief to split the fells' },
      { id: 'march', min: 85, what: 'full descent on Nulab (reachable only with player intervention)' }
    ]
  };

  T.stepRising = function (state, ctx) {
    var spec = T.rising, st = Object.assign({ worldPressure: 18, playerPressure: 0, cooldown: 0 }, state || {});
    ctx = ctx || {};
    if (st.cooldown > 0) {
      st.cooldown = Math.max(0, st.cooldown - D0(ctx.days, 1));
      st.worldPressure = Math.max(10, st.worldPressure - 0.4 * D0(ctx.days, 1));
    } else {
      var days = D0(ctx.days, 1), raidPush = D0(ctx.raids, 0) * 0.6, strikePush = ctx.strike ? 0.35 : 0;
      var reliefPull = D0(ctx.dalabStrength, 1) * 0.28 * (st.worldPressure / 50);
      st.worldPressure = Math.max(0, Math.min(spec.worldCap, st.worldPressure + (raidPush + strikePush - reliefPull) * days));
    }
    st.playerPressure = Math.max(-50, Math.min(60, st.playerPressure + D0(ctx.playerDelta, 0)));
    var total = Math.max(0, Math.min(100, st.worldPressure + st.playerPressure));
    var stage = spec.stages[0].id, i;
    for (i = 0; i < spec.stages.length; i++) if (total >= spec.stages[i].min) stage = spec.stages[i].id;
    return {
      id: spec.id, target: spec.target, worldPressure: +st.worldPressure.toFixed(2), playerPressure: +st.playerPressure.toFixed(2),
      total: +total.toFixed(2), stage: stage, canMarch: total >= spec.marchThreshold && st.playerPressure > 0, cooldown: st.cooldown
    };
  };

  return T;
})();
if (typeof module !== 'undefined') module.exports = WR_TUNE;
