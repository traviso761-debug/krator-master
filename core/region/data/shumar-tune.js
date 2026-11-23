// ================================================================= CORE/REGION DATA — the Kingdom of Shumar's tune (SM-Sim-2 / SM-Sim-3)
// [G data] core/simulation/PROPOSAL-SHUMAR.md, settlements/shumar/BUILD-OUT.md & settlements/shumar/PLAN.md (the owner,
// 2026-11-17 & 2026-11-18: Amaro at triple-confluence promontory px 731,1192 above the 2,848 m Bētun-Nārun gorge, Pāyaru-Gisr
// folded in as Amaro's 3rd sub-district `amaro.gisr`, paired upper rim fort Ṭāru-Bētun at 689,1185 above Vrivolci Tallhouse,
// global `tequila` key glossed as `Ṣūnu-šikaru`, cold-truce grain-for-mounts barter with strict military/metal/book embargo at
// `gate.voth-march`, six regimental Šubaru provinces S1..S6, ~109,630 people including ~2,400 Gēdu-šu Free Giants at 2.6x
// caloric intake and -ko Ordeal probationers under zero-spirits/zero-sugar discipline).
//
// Pure data & functions for core/region's valley host (core/region/50-region-valley.js, H.simValley). Read in place by
// open-world regions, settlement pages and core/region/tests/test-shumar-economy.js.
//   SHUMAR_TUNE.ORIGIN         {px: 731, py: 1192} (Amaro's triple-confluence cliff-lip pin on 5.1)
//   SHUMAR_TUNE.px(px, py)     metres from Amaro (2,000 m per 5.1 pixel)
//   SHUMAR_TUNE.provinces      S1..S6 regimental Šubaru provinces (regiment, seat, census & giantShare)
//   SHUMAR_TUNE.places         all 36 named settlement records (38,700 people; Greater Amaro = 10,600 + 1,100 + 300 + 850 = 12,850)
//   SHUMAR_TUNE.districts      Amaro's three sub-settlements (`amaro.citadel`, `amaro.necropolis`, `amaro.gisr`)
//   SHUMAR_TUNE.rings          all 22 core/hamlet town-ring records across the 6 seats (4,630 people)
//   SHUMAR_TUNE.countrysides   the 6 bulk provincial countrysides `prov.s1`..`prov.s6` (66,300 people; grand total 109,630)
//   SHUMAR_TUNE.goods          every good carried on the plateau (zero domestic coal, scrap or silica glass; `tequila` = Ṣūnu-šikaru)
//   SHUMAR_TUNE.diet           caste & settlement-kind daily per-capita diets (`giant` 2.6x caloric intake; `cadet` 0 tequila/sugar)
//   SHUMAR_TUNE.calendar       3,160 m Dsb highland year (`snowmelt`, `yayla`, `apricot`, `harvest`, `distilling`, `muster`, `ordeal_winter`, `graduation`)
//   SHUMAR_TUNE.gateways       all 5 external gateways (`gate.west-trunk`, `gate.greenstep`, `gate.talovolci`, `gate.east-foothills`, `gate.voth-march`)
//   SHUMAR_TUNE.field(...)     deterministic golden-ratio multi-vein lode field (>200 yr collective life, 2-4 yr per active vein)
//   SHUMAR_TUNE.census()       pure audit summary verifying exact headcounts across places, rings, countrysides, provinces and Giants
//   SHUMAR_TUNE.valley(o)      builds the H.simValley(V) spec
var SHUMAR_TUNE = (function () {
  'use strict';
  var T = {}, D = 1 / 365;

  /* ---- 1. FRAME & CLOCK ---- */
  T.ORIGIN = { px: 731, py: 1192 };
  T.px = function (px, py) {
    return { x: (px - T.ORIGIN.px) * 2000, z: (py - T.ORIGIN.py) * 2000 };
  };
  T.yearDay0 = 259;
  T.clockDay = function (yd) { return (yd - T.yearDay0 + 365) % 365; };

  /* ---- 2. GOODS TABLE (PROPOSAL-SHUMAR.md section 4) ---- */
  T.goods = {
    grain: { unit: 'kg', crops: ['emmer', 'dustmillet', 'frostoat', 'redstem', 'bistort'] },
    fruit: { unit: 'kg', crops: ['apricot', 'canyon-grape', 'spiralaloe'] },
    driedfruit: { unit: 'kg', gloss: 'sun-dried twist-apricot' },
    dairy: { unit: 'kg' },
    cheese: { unit: 'kg', gloss: 'aged highland sheep & tulum cheese' },
    fish: { unit: 'kg', gloss: 'Šīru-Yāmu highland trout & char' },
    wool: { unit: 'kg' },
    kilims: { unit: 'kg', gloss: 'crimson-dyed Shumari wool kilims' },
    hides: { unit: 'kg' },
    mounts: { unit: 'head', gloss: 'Shumari cavalry mounts & mountain mules' },
    timber: { unit: 'kg' },
    charcoal: { unit: 'kg', gloss: 'West-Gorge ropepine & helixpoplar beehive charcoal' },
    coal: { unit: 'kg', note: 'imported only; zero domestic coal in Shumar' },
    scrap: { unit: 'kg', note: 'imported only; zero Ancient ruin cells in Shumar' },
    iron: { unit: 'kg' },
    nickel: { unit: 'kg', gloss: 'NE impact-margin nickel master-alloy bloom' },
    copper: { unit: 'kg' },
    tin: { unit: 'kg' },
    zinc: { unit: 'kg' },
    brass: { unit: 'kg', gloss: 'Mamluk brass & bronze hardware and dome finials' },
    silver: { unit: 'kg' },
    gold: { unit: 'kg' },
    steel: { unit: 'kg', gloss: 'Shumari watered crucible steel' },
    blades: { unit: 'piece', gloss: 'watered-steel Shumari blades (weapons)' },
    armour: { unit: 'piece', gloss: 'Mamluk mirror-plate & crimson-laced lamellar (armor)' },
    tools: { unit: 'kg' },
    salt: { unit: 'kg' },
    saltpeter: { unit: 'kg' },
    sulfur: { unit: 'kg' },
    powder: { unit: 'kg' },
    tequila: { unit: 'kg', gloss: 'Ṣūnu-šikaru', note: 'sunny-canyon spiralaloe & whorlapricot arak distilled in copper-dome alembics' },
    glass: { unit: 'kg', note: 'imported only; zero domestic silica glass-sand' },
    stoneware: { unit: 'kg', gloss: 'Suṭōn-Fakhkhār glazed stoneware spirit flasks & crocks' },
    stone: { unit: 'kg', gloss: 'basalt, black impactite & travertine ablaq ashlar' },
    marble: { unit: 'kg', gloss: 'pale NE skarn contact marble' },
    crimson: { unit: 'kg', gloss: 'cave-madder crimson dye & birch-tar scabbard lacquer' },
    firearms: { unit: 'piece' },
    mechparts: { unit: 'piece' },
    medicine: { unit: 'kg' },
    sugar: { unit: 'kg' },
    books: { unit: 'book', gloss: 'curated Longsong histories' }
  };

  /* ---- 3. CASTE & PLACE DIETS (PROPOSAL-SHUMAR.md section 5, kg/person/day) ---- */
  /* giant (`Gēdu-šu`) draws 2.6x human caloric intake (360 kg grain & 45 kg cheese/yr);
     cadet (`-ko`) enforces strict probationer discipline: zero `tequila` and zero `sugar`. */
  T.diet = {
    sword: {
      grain: 145 * D, cheese: 18 * D, fruit: 16 * D, driedfruit: 8 * D, salt: 6.5 * D,
      tequila: 3.5 * D, wool: 1.8 * D, tools: 0.5 * D, blades: 0.04 * D, armour: 0.02 * D,
      crimson: 0.15 * D, sugar: 1.2 * D
    },
    giant: {
      grain: 360 * D, cheese: 45 * D, driedfruit: 18 * D, salt: 14 * D,
      tequila: 6.0 * D, wool: 3.5 * D, tools: 1.0 * D, blades: 0.06 * D, armour: 0.04 * D
    },
    town: {
      grain: 155 * D, cheese: 12 * D, fruit: 12 * D, driedfruit: 5 * D, salt: 6.0 * D,
      tequila: 1.2 * D, tools: 0.4 * D, stoneware: 1.5 * D
    },
    lake: {
      grain: 125 * D, fish: 42 * D, cheese: 10 * D, fruit: 14 * D, salt: 6.0 * D,
      tools: 0.35 * D, stoneware: 1.2 * D
    },
    rural: {
      grain: 165 * D, cheese: 14 * D, driedfruit: 4 * D, salt: 5.5 * D, tools: 0.3 * D
    },
    cadet: {
      grain: 185 * D, cheese: 10 * D, driedfruit: 6 * D, salt: 6.0 * D, tools: 0.8 * D
    },
    fort: {
      grain: 180 * D, cheese: 16 * D, driedfruit: 10 * D, salt: 7.0 * D, tools: 0.7 * D,
      blades: 0.05 * D, powder: 1.8 * D
    }
  };
  T.giantCaloricRatio = T.diet.giant.grain / ((T.diet.sword.grain + T.diet.town.grain) * 0.5);

  /* ---- 4. HIGHLAND CALENDAR (PROPOSAL-SHUMAR.md section 5) ---- */
  T.calendar = {
    windows: {
      snowmelt: [65, 125],
      yayla: [125, 245],
      apricot: [165, 215],
      harvest: [185, 235],
      distilling: [210, 280],
      muster: [255, 270],
      ordeal_winter: [300, 45],
      graduation: [50, 60]
    }
  };
  /* Clock day 0 is yearDay 259 (autumn, just after harvest [185,235] closed); seat & countryside granaries hold
     last autumn's harvest through winter, spring and summer until the next harvest ends at clockDay(235) = 341. */
  T.startDays = T.clockDay(T.calendar.windows.harvest[1]) + 35;

  /* ---- 5. SIX REGIMENTAL ŠUBARU PROVINCES (PROPOSAL-SHUMAR.md section 3) ---- */
  T.provinces = [
    {
      id: 'S1', code: 's1', regiment: 1, regimentName: 'Blades of Amaro',
      name: 'Qappu-Šubaru', gloss: 'The High Keep & Central Canyons',
      seat: 'ssgsv5zbd2', px: [726, 1196],
      seatPop: 12850, namedPop: 2800, ringPop: 1310, rural: 22100, total: 39060,
      giants: 860, giantShare: 860 / 39060, grainYield: 1.55
    },
    {
      id: 'S2', code: 's2', regiment: 2, regimentName: 'Spears of the Gate',
      name: 'Bētun-Gēdu', gloss: 'The West Gorge & Giant March',
      seat: 'sm.betun-babu', px: [706, 1182],
      seatPop: 3200, namedPop: 2850, ringPop: 830, rural: 11400, total: 18280,
      giants: 750, giantShare: 750 / 18280, grainYield: 1.50
    },
    {
      id: 'S3', code: 's3', regiment: 3, regimentName: 'Keepers of the Mirror',
      name: 'Dōriyan-Māru', gloss: 'The Northern Scarp & Lost-Doriyan March',
      seat: 'sm.suton-qappu', px: [734, 1163],
      seatPop: 2500, namedPop: 1750, ringPop: 670, rural: 10310, total: 15230,
      giants: 210, giantShare: 210 / 15230, grainYield: 1.42
    },
    {
      id: 'S4', code: 's4', regiment: 4, regimentName: 'Horsemen of the Steppe',
      name: 'Ṣōrun-Dubnu', gloss: 'The Eastern Flock-Bench & Brine Brooks',
      seat: 'srbp1bvh1r', px: [766, 1162],
      seatPop: 3500, namedPop: 1950, ringPop: 990, rural: 12635, total: 19075,
      giants: 280, giantShare: 280 / 19075, grainYield: 1.48
    },
    {
      id: 'S5', code: 's5', regiment: 5, regimentName: 'Wardens of the Silver Water',
      name: 'Šīru-Yāmu', gloss: 'The North-East Lakes & Skarn March',
      seat: 'sm.yamu-qappu', px: [792, 1128],
      seatPop: 2800, namedPop: 1950, ringPop: 670, rural: 7810, total: 13230,
      giants: 170, giantShare: 170 / 13230, grainYield: 1.52
    },
    {
      id: 'S6', code: 's6', regiment: 6, regimentName: 'Masters of the Trial',
      name: 'Urudīru-Ḫāru', gloss: 'The Ordeal Ramp & Godthrone Contact',
      seat: 'sm.urudiru-qappu', px: [776, 1197],
      seatPop: 1400, namedPop: 1150, ringPop: 160, rural: 2045, total: 4755,
      giants: 130, giantShare: 130 / 4755, grainYield: 0.95
    }
  ];

  /* ---- 6. AMARO SUB-DISTRICTS & ALL 36 NAMED PLACES (BUILD-OUT.md section 1a-1e = 38,700 people) ---- */
  T.districts = [
    {
      id: 'amaro.citadel', name: 'Qappu al-Šubaru (The High Citadel & Grand Dīwān)',
      px: 730, py: 1193, elev: 3104, climate: 'Dsb', people: 1100, province: 'S1',
      parent: 'ssgsv5zbd2', group: 'district', kind: 'citadel',
      giants: 200, sword: 560, cadets: 340
    },
    {
      id: 'amaro.necropolis', name: 'Madīnat al-Qubab (The Avenue of Domes & Hall of Blades)',
      px: 732, py: 1192, elev: 3086, climate: 'Dsb', people: 300, province: 'S1',
      parent: 'ssgsv5zbd2', group: 'district', kind: 'sacred',
      giants: 40, sword: 120, cadets: 40
    },
    {
      id: 'amaro.gisr', name: 'Pāyaru-Gisr (The Gorge Foot, Fortified Bridge & Mill-Race)',
      px: 731, py: 1191, elev: 2848, climate: 'Dsb', people: 850, province: 'S1',
      parent: 'ssgsv5zbd2', group: 'district', kind: 'village',
      giants: 15, trade: 'watermills'
    }
  ];

  T.places = [
    /* 1a. Six regimental seats and towns (26,250 people) */
    {
      id: 'ssgsv5zbd2', name: 'Amaro (ʾAmāru, capital of Shumar)',
      px: 731, py: 1192, elev: 3089, climate: 'Dsb',
      people: 12850, cityPeople: 10600, districts: T.districts,
      province: 'S1', group: 'seat', kind: 'seat', pinned: true,
      giants: 735, cityGiants: 480, sword: 1850, cadets: 1100, outlanders: 420
    },
    {
      id: 'sm.betun-babu', name: 'Bētun-Bābu (Gate of the House-River)',
      px: 701, py: 1171, elev: 2719, climate: 'Cfa',
      people: 3200, province: 'S2', group: 'seat', kind: 'seat',
      giants: 360, sword: 480, cadets: 360, outlanders: 220
    },
    {
      id: 'sm.suton-qappu', name: 'Suṭōn-Qappu (Stone-Keep of the Scarp)',
      px: 727, py: 1158, elev: 2954, climate: 'Cfa',
      people: 2500, province: 'S3', group: 'seat', kind: 'seat',
      giants: 115, sword: 420, cadets: 450, outlanders: 80
    },
    {
      id: 'srbp1bvh1r', name: 'Urundashi (Urundaši)',
      px: 779, py: 1153, elev: 3220, climate: 'Dfb',
      people: 3500, province: 'S4', group: 'seat', kind: 'seat', pinned: true,
      giants: 185, sword: 560, cadets: 380, outlanders: 200
    },
    {
      id: 'sm.yamu-qappu', name: 'Yāmu-Qappu (Keep of the Lake)',
      px: 785, py: 1130, elev: 2935, climate: 'Csb',
      people: 2800, province: 'S5', group: 'seat', kind: 'lake-seat',
      giants: 105, sword: 410, cadets: 280, outlanders: 90
    },
    {
      id: 'sm.urudiru-qappu', name: 'Urudīru-Qappu (Keep of the Ordeal)',
      px: 774, py: 1199, elev: 4313, climate: 'Dfc',
      people: 1400, province: 'S6', group: 'seat', kind: 'ordeal-seat',
      giants: 70, sword: 260, cadets: 750, outlanders: 0
    },

    /* 1b. Eight regimental qubba sanctuaries and frontier watch-forts (2,000 people) */
    {
      id: 'sm.qappu-qubba', name: 'Qubbat al-Qappu (The Gorge Waqf of Qappu-Nārun)',
      px: 737, py: 1201, elev: 3308, climate: 'Dsb',
      people: 250, province: 'S1', group: 'sanctuary-fort', kind: 'sacred',
      giants: 20, sword: 80, cadets: 40
    },
    {
      id: 'sm.doriyan-inu', name: 'Dōriyan-Īnu (The Mirror Sanctuary)',
      px: 740, py: 1168, elev: 2889, climate: 'Cfb',
      people: 250, province: 'S3', group: 'sanctuary-fort', kind: 'sacred',
      giants: 15, sword: 70, cadets: 65
    },
    {
      id: 'sm.siru-qubba', name: 'Šīru-Qubba (The Lake Promontory Shrine)',
      px: 790, py: 1133, elev: 3012, climate: 'Csb',
      people: 150, province: 'S5', group: 'sanctuary-fort', kind: 'sacred',
      giants: 10, sword: 55, cadets: 25
    },
    {
      id: 'sm.ordeal-gate', name: 'Bābu al-Urudīru (The Outer Ordeal Gate & Trial Cells)',
      px: 782, py: 1194, elev: 4426, climate: 'ET',
      people: 250, province: 'S6', group: 'sanctuary-fort', kind: 'ordeal',
      giants: 25, sword: 0, cadets: 225
    },
    {
      id: 'sm.taru-betun', name: 'Ṭāru-Bētun (Upper Tallhouse Gate-Fort)',
      px: 689, py: 1185, elev: 2740, climate: 'Cfb',
      people: 350, province: 'S2', group: 'sanctuary-fort', kind: 'fort',
      giants: 85, sword: 150, cadets: 95
    },
    {
      id: 'sm.gedu-saddle', name: 'Gēdu-Sāru (Greenstep Saddle Watch-Fort)',
      px: 701, py: 1214, elev: 3216, climate: 'Dsb',
      people: 250, province: 'S2', group: 'sanctuary-fort', kind: 'fort',
      giants: 45, sword: 110, cadets: 75
    },
    {
      id: 'sm.dervu-cicu', name: 'Dervu-Čiču (NW Scarp Beacon-Fort)',
      px: 711, py: 1165, elev: 2886, climate: 'Cfa',
      people: 250, province: 'S2', group: 'sanctuary-fort', kind: 'fort',
      giants: 40, sword: 110, cadets: 80
    },
    {
      id: 'sm.kattu-cicu', name: 'Kattu-Čiču (East Scarp Beacon-Fort)',
      px: 744, py: 1152, elev: 2985, climate: 'Dsc',
      people: 250, province: 'S3', group: 'sanctuary-fort', kind: 'fort',
      giants: 30, sword: 105, cadets: 95
    },

    /* 1c. Eleven specialist canyon and highway villages (6,950 people; Pāyaru-Gisr is Amaro's 3rd sub-district amaro.gisr) */
    {
      id: 'sm.misu-bustan', name: 'Mīṣu-Bustān',
      px: 723, py: 1194, elev: 3081, climate: 'Dsc',
      people: 800, province: 'S1', group: 'canyon-village', kind: 'village',
      giants: 10, trade: 'apricot-orchard'
    },
    {
      id: 'sm.nazaru-kura', name: 'Nazāru-Kūra',
      px: 713, py: 1188, elev: 2977, climate: 'Cfa',
      people: 750, province: 'S1', group: 'canyon-village', kind: 'village',
      giants: 10, trade: 'spirits-still'
    },
    {
      id: 'sm.nazaru-head', name: 'Nazāru-Rēšu',
      px: 716, py: 1210, elev: 2986, climate: 'Csb',
      people: 700, province: 'S1', group: 'canyon-village', kind: 'village',
      giants: 10, trade: 'irrigated-terraces'
    },
    {
      id: 'sm.betun-kura', name: 'Bētun-Kūra',
      px: 705, py: 1175, elev: 2768, climate: 'Cfa',
      people: 650, province: 'S2', group: 'canyon-village', kind: 'village',
      giants: 35, trade: 'charcoal-timber'
    },
    {
      id: 'sm.babul-wikala', name: 'Bābu-Wikāla',
      px: 699, py: 1171, elev: 2715, climate: 'Cfb',
      people: 600, province: 'S2', group: 'canyon-village', kind: 'village',
      giants: 35, outlanders: 90, trade: 'caravan-wikala'
    },
    {
      id: 'sm.gedu-wash', name: 'Gēdu-Šaṭṭu (Giant\'s Gravel-Bar)',
      px: 699, py: 1173, elev: 2738, climate: 'Cfa',
      people: 400, province: 'S2', group: 'canyon-village', kind: 'village',
      giants: 45, trade: 'placer-sluice'
    },
    {
      id: 'sm.madder-glen', name: 'Qirmiz-Wādī',
      px: 737, py: 1171, elev: 2966, climate: 'Csa',
      people: 650, province: 'S3', group: 'canyon-village', kind: 'village',
      giants: 10, trade: 'crimson-kilims'
    },
    {
      id: 'sm.suton-kilns', name: 'Suṭōn-Fakhkhār',
      px: 732, py: 1159, elev: 3016, climate: 'BSk',
      people: 600, province: 'S3', group: 'canyon-village', kind: 'village',
      giants: 10, trade: 'stoneware-iron'
    },
    {
      id: 'sm.sorun-melh', name: 'Ṣōrun-Milḥ (Salt-Brook)',
      px: 753, py: 1152, elev: 3000, climate: 'Dsc',
      people: 650, province: 'S4', group: 'canyon-village', kind: 'village',
      giants: 15, trade: 'brine-salt'
    },
    {
      id: 'sm.sorun-wikala', name: 'Ṣōrun-Manzil',
      px: 755, py: 1164, elev: 3092, climate: 'Dsb',
      people: 600, province: 'S4', group: 'canyon-village', kind: 'village',
      giants: 20, trade: 'post-wool'
    },
    {
      id: 'sm.dubnu-stud', name: 'Dubnu-Rikāb',
      px: 768, py: 1158, elev: 3137, climate: 'Dsb',
      people: 550, province: 'S4', group: 'canyon-village', kind: 'village',
      giants: 20, trade: 'mounts-cheese'
    },

    /* 1d. Three North-East Lake shore villages on Šīru-Yāmu (1,550 people) */
    {
      id: 'sm.siru-maru', name: 'Šīru-Māru',
      px: 799, py: 1128, elev: 3160, climate: 'Dsb',
      people: 600, province: 'S5', group: 'lake-village', kind: 'lake',
      giants: 10, trade: 'lake-fishery-spirits'
    },
    {
      id: 'sm.nemetu-gisr', name: 'Nemetu-Gisr',
      px: 783, py: 1127, elev: 2886, climate: 'Dsb',
      people: 500, province: 'S5', group: 'lake-village', kind: 'lake',
      giants: 10, trade: 'weir-fishery-mills'
    },
    {
      id: 'sm.sutaru-betu', name: 'Suṭāru-Bētu',
      px: 809, py: 1117, elev: 2956, climate: 'Csa',
      people: 450, province: 'S5', group: 'lake-village', kind: 'lake',
      giants: 10, trade: 'nickel-bloomery'
    },

    /* 1e. Eight mines, quarries, ordnance works, watch-post and seasonal yayla camps (1,950 people) */
    {
      id: 'sm.ablaq-quarry', name: 'ʾAblaq-Maqṭaʿ (Royal Basalt & Travertine Quarry)',
      px: 740, py: 1185, elev: 3274, climate: 'Dsb',
      people: 300, province: 'S1', group: 'works-camp', kind: 'mine',
      giants: 15, cadets: 140, trade: 'ablaq-quarry'
    },
    {
      id: 'sm.west-iron-tin', name: 'Bētun-Maʿdan (West Gorge Iron & Tin Lodes)',
      px: 704, py: 1172, elev: 2765, climate: 'Cfb',
      people: 350, province: 'S2', group: 'works-camp', kind: 'mine',
      giants: 45, cadets: 190, trade: 'iron-tin-lode'
    },
    {
      id: 'sm.skarn-mine', name: 'Suṭāru-Maʿdan (NE Skarn & Marble Works)',
      px: 820, py: 1118, elev: 3388, climate: 'Dsc',
      people: 250, province: 'S5', group: 'works-camp', kind: 'mine',
      giants: 15, cadets: 135, trade: 'skarn-polymetallic'
    },
    {
      id: 'sm.urudiru-lode', name: 'Urudīru-Maʿdan (Godthrone Contact Polymetallic Mines)',
      px: 776, py: 1200, elev: 4343, climate: 'Dfc',
      people: 400, province: 'S6', group: 'works-camp', kind: 'mine',
      giants: 20, cadets: 260, trade: 'ordeal-polymetallic'
    },
    {
      id: 'sm.nitre-vats', name: 'Šūru-Bāru (Ordeal Saltpeter & Fumarole Works)',
      px: 784, py: 1194, elev: 4560, climate: 'Dfc',
      people: 250, province: 'S6', group: 'works-camp', kind: 'mine',
      giants: 10, cadets: 170, trade: 'nitre-sulfur'
    },
    {
      id: 'sm.haru-cicu', name: 'Ḫāru-Čiču (Godthrone Rim Watch-Post)',
      px: 772, py: 1203, elev: 4372, climate: 'Dfc',
      people: 100, province: 'S6', group: 'works-camp', kind: 'fort',
      giants: 5, sword: 45, cadets: 50, trade: 'watch-post'
    },
    {
      id: 'sm.dubnu-yayla', name: 'Dubnu-Yayla (Eastern Summer Flock Camp)',
      px: 768, py: 1184, elev: 3640, climate: 'Dsb',
      people: 150, province: 'S4', group: 'works-camp', kind: 'camp',
      giants: 5, cadets: 60, trade: 'yayla-flocks'
    },
    {
      id: 'sm.warun-yayla', name: 'Wārun-Yayla (Southern Crest Summer Flock Camp)',
      px: 748, py: 1204, elev: 3705, climate: 'Dsb',
      people: 150, province: 'S6', group: 'works-camp', kind: 'camp',
      giants: 0, cadets: 75, trade: 'yayla-flocks'
    }
  ];

  /* ---- 7. TWENTY-TWO TOWN-RING HAMLETS (BUILD-OUT.md section 1f = 4,630 people) ---- */
  T.rings = [
    /* Amaro's ring around 731,1192 (6 hamlets = 1,310; dry <0.02 slope plateau benches) */
    { id: 'amaro.ring.farm-1', seat: 'ssgsv5zbd2', province: 'S1', focus: 'farming', px: 735, py: 1188, people: 240 },
    { id: 'amaro.ring.farm-2', seat: 'ssgsv5zbd2', province: 'S1', focus: 'farming', px: 728, py: 1189, people: 240 },
    { id: 'amaro.ring.farm-3', seat: 'ssgsv5zbd2', province: 'S1', focus: 'farming', px: 734, py: 1194, people: 240 },
    { id: 'amaro.ring.orchard-1', seat: 'ssgsv5zbd2', province: 'S1', focus: 'orchard', px: 729, py: 1195, people: 240 },
    { id: 'amaro.ring.quarry-1', seat: 'ssgsv5zbd2', province: 'S1', focus: 'quarry', px: 737, py: 1195, people: 190 },
    { id: 'amaro.ring.ranch-1', seat: 'ssgsv5zbd2', province: 'S1', focus: 'ranch', px: 726, py: 1191, people: 160 },
    /* Bētun-Bābu's ring (4 hamlets = 830) */
    { id: 'betun.ring.farm-1', seat: 'sm.betun-babu', province: 'S2', focus: 'farming', px: 703, py: 1169, people: 240 },
    { id: 'betun.ring.farm-2', seat: 'sm.betun-babu', province: 'S2', focus: 'farming', px: 702, py: 1174, people: 240 },
    { id: 'betun.ring.lumber-1', seat: 'sm.betun-babu', province: 'S2', focus: 'lumber', px: 706, py: 1172, people: 190 },
    { id: 'betun.ring.ranch-1', seat: 'sm.betun-babu', province: 'S2', focus: 'ranch', px: 698, py: 1175, people: 160 },
    /* Suṭōn-Qappu's ring (3 hamlets = 670) */
    { id: 'suton.ring.farm-1', seat: 'sm.suton-qappu', province: 'S3', focus: 'farming', px: 724, py: 1160, people: 240 },
    { id: 'suton.ring.farm-2', seat: 'sm.suton-qappu', province: 'S3', focus: 'farming', px: 730, py: 1161, people: 240 },
    { id: 'suton.ring.clay-1', seat: 'sm.suton-qappu', province: 'S3', focus: 'clay', px: 729, py: 1157, people: 190 },
    /* Urundashi's ring (5 hamlets = 990) */
    { id: 'urundashi.ring.farm-1', seat: 'srbp1bvh1r', province: 'S4', focus: 'farming', px: 776, py: 1151, people: 240 },
    { id: 'urundashi.ring.farm-2', seat: 'srbp1bvh1r', province: 'S4', focus: 'farming', px: 782, py: 1155, people: 240 },
    { id: 'urundashi.ring.salt-1', seat: 'srbp1bvh1r', province: 'S4', focus: 'salt', px: 774, py: 1156, people: 190 },
    { id: 'urundashi.ring.ranch-1', seat: 'srbp1bvh1r', province: 'S4', focus: 'ranch', px: 781, py: 1150, people: 160 },
    { id: 'urundashi.ring.ranch-2', seat: 'srbp1bvh1r', province: 'S4', focus: 'ranch', px: 777, py: 1158, people: 160 },
    /* Yāmu-Qappu's ring (3 hamlets = 670) */
    { id: 'yamu.ring.orchard-1', seat: 'sm.yamu-qappu', province: 'S5', focus: 'orchard', px: 784, py: 1133, people: 240 },
    { id: 'yamu.ring.orchard-2', seat: 'sm.yamu-qappu', province: 'S5', focus: 'orchard', px: 787, py: 1127, people: 240 },
    { id: 'yamu.ring.fish-1', seat: 'sm.yamu-qappu', province: 'S5', focus: 'fishing', px: 788, py: 1131, people: 190 },
    /* Urudīru-Qappu's ring (1 hamlet = 160) */
    { id: 'urudiru.ring.ranch-1', seat: 'sm.urudiru-qappu', province: 'S6', focus: 'ranch', px: 771, py: 1197, people: 160 }
  ];

  /* ---- 8. SIX BULK PROVINCIAL COUNTRYSIDES (BUILD-OUT.md section 1f = 66,300 people) ---- */
  T.countrysides = [
    {
      id: 'prov.s1', province: 'S1', seat: 'ssgsv5zbd2', name: 'Qappu-Šubaru countryside',
      px: 726, py: 1196, people: 22100, ringPeople: 1310, giants: 60,
      grain: 6350000, extra: { cheese: 430000, wool: 95000, fruit: 260000, driedfruit: 155000 }
    },
    {
      id: 'prov.s2', province: 'S2', seat: 'sm.betun-babu', name: 'Bētun-Gēdu countryside',
      px: 706, py: 1182, people: 11400, ringPeople: 830, giants: 60,
      grain: 3150000, extra: { cheese: 215000, wool: 55000, driedfruit: 75000, timber: 280000, charcoal: 310000 }
    },
    {
      id: 'prov.s3', province: 'S3', seat: 'sm.suton-qappu', name: 'Dōriyan-Māru countryside',
      px: 734, py: 1163, people: 10310, ringPeople: 670, giants: 30,
      grain: 2650000, extra: { cheese: 195000, wool: 52000, driedfruit: 65000, charcoal: 140000, stoneware: 18000 }
    },
    {
      id: 'prov.s4', province: 'S4', seat: 'srbp1bvh1r', name: 'Ṣōrun-Dubnu countryside',
      px: 766, py: 1162, people: 12635, ringPeople: 990, giants: 35,
      grain: 3500000, extra: { cheese: 440000, wool: 185000, driedfruit: 75000, mounts: 260, salt: 10000 }
    },
    {
      id: 'prov.s5', province: 'S5', seat: 'sm.yamu-qappu', name: 'Šīru-Yāmu countryside',
      px: 792, py: 1128, people: 7810, ringPeople: 670, giants: 10,
      grain: 2180000, extra: { cheese: 155000, wool: 42000, fruit: 240000, driedfruit: 65000, fish: 95000 }
    },
    {
      id: 'prov.s6', province: 'S6', seat: 'sm.urudiru-qappu', name: 'Urudīru-Ḫāru countryside',
      px: 776, py: 1197, people: 2045, ringPeople: 160, giants: 0,
      grain: 380000, extra: { cheese: 55000, wool: 28000, driedfruit: 15000 }
    }
  ];

  /* ---- 9. EXTERNAL GATEWAYS & VOTH COLD-TRUCE EMBARGO (PROPOSAL-SHUMAR.md section 6b) ---- */
  T.vothEmbargo = [
    'blades', 'armour', 'powder', 'steel', 'brass', 'iron', 'copper',
    'tin', 'zinc', 'nickel', 'saltpeter', 'books', 'firearms', 'mechparts', 'silver', 'gold'
  ];

  T.gateways = [
    {
      id: 'gate.west-trunk',
      name: 'The Western Highway Gate (Dalab, Fulcrum, Jimjam, Roketstad, Port Mira via dirt.amaro)',
      entry: 'sm.betun-babu', days: 9, carriers: 8, cap: 55000, toll: 0.04,
      in: ['salt', 'coal', 'scrap', 'glass', 'sugar', 'firearms', 'mechparts'],
      out: ['blades', 'armour', 'tequila', 'wool', 'kilims', 'mounts', 'cheese', 'saltpeter', 'driedfruit', 'silver', 'gold'],
      targetOutYr: {
        blades: 620, armour: 260, tequila: 92000, wool: 95000, kilims: 12000,
        mounts: 340, cheese: 32000, saltpeter: 95000, driedfruit: 32000, silver: 95, gold: 22
      }
    },
    {
      id: 'gate.greenstep',
      name: 'The Free Giant Brotherhood Pass (Vrivolci Tallhouse & Tallwalls)',
      entry: 'sm.taru-betun', days: 5, carriers: 4, cap: 24000, toll: 0,
      in: ['salt', 'timber', 'grain'],
      out: ['blades', 'armour', 'brass', 'tequila', 'cheese'],
      targetOutYr: { blades: 95, armour: 45, brass: 4500, tequila: 14000, cheese: 6500 }
    },
    {
      id: 'gate.talovolci',
      name: 'The Cloud-Scarp Trail (Talovolci Spirladunon, snowed-in during ordeal_winter)',
      entry: 'sm.yamu-qappu', days: 11, carriers: 3, cap: 20000, toll: 0,
      closedWinter: 'ordeal_winter',
      in: ['timber', 'iron', 'nickel', 'medicine'],
      out: ['wool', 'cheese', 'saltpeter', 'driedfruit', 'tequila'],
      targetOutYr: { wool: 18000, cheese: 11000, saltpeter: 26000, driedfruit: 13600, tequila: 9200 }
    },
    {
      id: 'gate.east-foothills',
      name: 'The Izani & Historian Caravan (Iziz, Pylon & Longsong, snowed-in during ordeal_winter)',
      entry: 'srbp1bvh1r', days: 12, carriers: 5, cap: 30000, toll: 0.04,
      closedWinter: 'ordeal_winter',
      in: ['mechparts', 'medicine', 'books', 'salt'],
      out: ['blades', 'armour', 'tequila', 'wool', 'silver'],
      targetOutYr: { blades: 240, armour: 110, tequila: 26000, wool: 35500, silver: 45 }
    },
    {
      id: 'gate.voth-march',
      name: 'The Cold-Truce Dōriyan Scarp (Vothic Driyan, Sethas & Shim — strict military/metal/book embargo)',
      entry: 'sm.suton-qappu', days: 7, carriers: 4, cap: 18000, toll: 0,
      coldTruce: true, embargo: T.vothEmbargo,
      in: ['grain'],
      out: ['mounts'],
      targetInYr: { grain: 260000 },
      targetOutYr: { mounts: 104 }
    }
  ];

  T.gatePool = {
    salt: 1e7, coal: 5e6, scrap: 2e6, glass: 2e6, sugar: 1e6,
    timber: 2e6, grain: 5e6, iron: 5e5, nickel: 1e5,
    firearms: 5e3, mechparts: 5e3, medicine: 2e5, books: 2e3
  };

  /* ---- 10. INDUSTRIAL BATCH CHAINS & MULTI-VEIN LODE FIELDS ---- */
  /* Batch `hours` are sized (as in XAN_TUNE.chain) so workshop crews forge realistic annual outputs while leaving
     surplus raw `saltpeter`, `wool`, `cheese`, `driedfruit`, `silver` and `gold` for external gateway exports
     and the Grand Dīwān's yearly *iqta'* assessments. */
  T.chain = {
    crucibleSteel: { in: { iron: 10, charcoal: 8, nickel: 0.4 }, out: { steel: 9 }, hours: 18 },
    coalSteel: { in: { iron: 8, scrap: 3, coal: 8 }, out: { steel: 10 }, hours: 16 },
    bladesmith: { in: { steel: 2.5, charcoal: 1.0, brass: 0.2 }, out: { blades: 1 }, hours: 210 },
    armourer: { in: { steel: 5.0, charcoal: 1.5, crimson: 0.2 }, out: { armour: 1 }, hours: 420 },
    toolsmith: { in: { iron: 1.2, charcoal: 0.8 }, out: { tools: 1 }, hours: 6 },
    brassSmelt: { in: { copper: 7, zinc: 3, charcoal: 3 }, out: { brass: 10 }, hours: 24 },
    bronzeSmelt: { in: { copper: 8, tin: 2, charcoal: 3 }, out: { brass: 10 }, hours: 24 },
    powderMill: { in: { saltpeter: 7.5, charcoal: 1.5, sulfur: 1.0 }, out: { powder: 10 }, hours: 140 },
    alembicGlass: { in: { fruit: 10, charcoal: 1.2, glass: 0.8 }, out: { tequila: 5 }, hours: 8 },
    alembicJug: { in: { fruit: 10, charcoal: 1.2, stoneware: 0.8 }, out: { tequila: 5 }, hours: 10 },
    kilimLoom: { in: { wool: 3, crimson: 0.25 }, out: { kilims: 2.8 }, hours: 24 }
  };

  /* Multi-vein lode field (>200 yr collective field life, 2-4 yr per active adit vein, golden-ratio spread) */
  T.fieldYears = 220;
  T.field = function (kind, kgYr, years) {
    var yrs = years == null ? T.fieldYears : years, veins = [], tot = 0;
    for (var i = 0; tot < kgYr * yrs; i++) {
      var span = 2 + 2 * ((i * 0.6180339887) % 1);
      var a = Math.max(1, Math.round(kgYr * span));
      veins.push({ amount: a });
      tot += a;
    }
    return { kind: kind, grade: 'rich', veins: veins };
  };

  /* ---- 11. PURE AUDIT & COMPOSITE DIET HELPERS ---- */
  T.census = function () {
    var namedPop = T.places.reduce(function (n, p) { return n + p.people; }, 0);
    var seatPop = T.places.filter(function (p) { return p.group === 'seat'; }).reduce(function (n, p) { return n + p.people; }, 0);
    var ringPop = T.rings.reduce(function (n, r) { return n + r.people; }, 0);
    var ruralPop = T.countrysides.reduce(function (n, c) { return n + c.people; }, 0);
    var placeGiants = T.places.reduce(function (n, p) { return n + (p.giants == null ? 0 : p.giants); }, 0);
    var ruralGiants = T.countrysides.reduce(function (n, c) { return n + (c.giants == null ? 0 : c.giants); }, 0);
    var byProvince = {};
    T.provinces.forEach(function (pv) {
      var pSeat = T.places.filter(function (x) { return x.province === pv.id && x.group === 'seat'; }).reduce(function (n, x) { return n + x.people; }, 0);
      var pNamed = T.places.filter(function (x) { return x.province === pv.id && x.group !== 'seat'; }).reduce(function (n, x) { return n + x.people; }, 0);
      var pRing = T.rings.filter(function (x) { return x.province === pv.id; }).reduce(function (n, x) { return n + x.people; }, 0);
      var pRural = T.countrysides.filter(function (x) { return x.province === pv.id; }).reduce(function (n, x) { return n + x.people; }, 0);
      var pGiants = T.places.filter(function (x) { return x.province === pv.id; }).reduce(function (n, x) { return n + (x.giants == null ? 0 : x.giants); }, 0) +
        T.countrysides.filter(function (x) { return x.province === pv.id; }).reduce(function (n, x) { return n + (x.giants == null ? 0 : x.giants); }, 0);
      byProvince[pv.id] = {
        seat: pSeat, named: pNamed, ring: pRing, rural: pRural,
        total: pSeat + pNamed + pRing + pRural, giants: pGiants
      };
    });
    return {
      placesCount: T.places.length,
      seatsCount: T.places.filter(function (p) { return p.group === 'seat'; }).length,
      ringsCount: T.rings.length,
      countrysidesCount: T.countrysides.length,
      seatPop: seatPop,
      namedNonSeatPop: namedPop - seatPop,
      namedPop: namedPop,
      ringPop: ringPop,
      ruralPop: ruralPop,
      totalPop: namedPop + ringPop + ruralPop,
      giants: placeGiants + ruralGiants,
      byProvince: byProvince
    };
  };

  /* Builds per-capita daily `eats` blending human caste shares with `Gēdu-šu` Free Giants (2.6x caloric intake)
     and enforcing strict zero-tequila / zero-sugar discipline on `-ko` Ordeal probationer sites. */
  T.eatsFor = function (rec) {
    var n = rec.people == null ? 0 : rec.people;
    if (n <= 0) return {};
    var gN = rec.giants == null ? 0 : rec.giants;
    var kind = rec.kind || 'rural';
    var add = function (acc, row, count) {
      if (count <= 0) return;
      Object.keys(row).forEach(function (g) { acc[g] = (acc[g] || 0) + row[g] * count; });
    };
    var tot = {};
    if (kind === 'ordeal') {
      /* Bābu al-Urudīru (`urudiru.camp`): 100% -ko human & Gēdu-ko Giant initiates — 2.6x Giant calories, 0 tequila & 0 sugar */
      var giantCadet = { grain: 360 * D, cheese: 26 * D, driedfruit: 15 * D, salt: 14 * D, tools: 1.0 * D };
      add(tot, giantCadet, gN);
      add(tot, T.diet.cadet, n - gN);
    } else if (kind === 'citadel') {
      var swC = rec.sword == null ? Math.round((n - gN) * 0.6) : rec.sword;
      var cdC = Math.max(0, n - gN - swC);
      add(tot, T.diet.giant, gN);
      add(tot, Object.assign({}, T.diet.sword, { powder: 2.2 * D }), swC);
      add(tot, T.diet.cadet, cdC);
    } else if (kind === 'seat' || kind === 'lake-seat' || kind === 'ordeal-seat') {
      var sw = rec.sword == null ? Math.round((n - gN) * 0.16) : rec.sword;
      var cd = rec.cadets == null ? Math.round((n - gN) * 0.12) : rec.cadets;
      var baseRow = kind === 'lake-seat' ? T.diet.lake : (kind === 'ordeal-seat' ? T.diet.fort : T.diet.town);
      var rest = Math.max(0, n - gN - sw - cd);
      add(tot, T.diet.giant, gN);
      add(tot, T.diet.sword, sw);
      add(tot, T.diet.cadet, cd);
      add(tot, baseRow, rest);
    } else if (kind === 'fort') {
      var giantFort = {
        grain: 360 * D, cheese: 45 * D, driedfruit: 18 * D, salt: 14 * D,
        tools: 1.0 * D, blades: 0.06 * D, powder: 1.8 * D
      };
      add(tot, giantFort, gN);
      add(tot, T.diet.fort, n - gN);
    } else if (kind === 'sacred') {
      var giantSacred = { grain: 360 * D, cheese: 45 * D, driedfruit: 18 * D, salt: 14 * D, wool: 3.5 * D, tools: 0.8 * D };
      var humSacred = { grain: 155 * D, cheese: 16 * D, fruit: 12 * D, driedfruit: 8 * D, salt: 6.2 * D, wool: 1.5 * D, tools: 0.4 * D };
      add(tot, giantSacred, gN);
      add(tot, humSacred, n - gN);
    } else if (kind === 'mine') {
      var cdM = rec.cadets == null ? Math.round((n - gN) * 0.6) : rec.cadets;
      var giantMine = { grain: 360 * D, cheese: 35 * D, driedfruit: 16 * D, salt: 14 * D, tools: 1.2 * D };
      add(tot, giantMine, gN);
      add(tot, T.diet.cadet, cdM);
      add(tot, T.diet.rural, Math.max(0, n - gN - cdM));
    } else if (kind === 'lake') {
      var giantLake = { grain: 310 * D, fish: 65 * D, cheese: 30 * D, fruit: 18 * D, salt: 14 * D, tools: 0.9 * D, stoneware: 1.2 * D };
      add(tot, giantLake, gN);
      add(tot, T.diet.lake, n - gN);
    } else {
      /* village, camp, rural: Giant dietary staples at 360*D grain & 45*D cheese + Hearth-Commons rural basket */
      var giantRural = { grain: 360 * D, cheese: 45 * D, driedfruit: 18 * D, salt: 14 * D, tools: 1.0 * D };
      add(tot, giantRural, gN);
      add(tot, T.diet.rural, n - gN);
    }
    var out = {};
    Object.keys(tot).forEach(function (g) { out[g] = tot[g] / n; });
    return out;
  };

  /* ---- 12. VALLEY SPEC BUILDER (`SHUMAR_TUNE.valley(o)`) ---- */
  T.scaleBulk = 400;
  T.scaleSeat = 120;
  T.scaleVillage = 80;
  T.scaleFort = 40;

  T.valley = function (o) {
    o = o || {};
    var KSeat = o.scaleSeat == null ? T.scaleSeat : o.scaleSeat;
    var KVil = o.scaleVillage == null ? T.scaleVillage : o.scaleVillage;
    var KFort = o.scaleFort == null ? T.scaleFort : o.scaleFort;
    var KBulk = o.scaleBulk == null ? T.scaleBulk : o.scaleBulk;
    var splitRings = !!o.rings;
    var yr = 365;
    var winDays = function (w) {
      var W = T.calendar.windows[w];
      return (W[1] - W[0] + yr) % yr;
    };
    var rate = function (kgYr, crew, days, k) {
      var kk = k == null ? KFort : k;
      var eff = Math.max(1, Math.round(crew / kk)) * kk;
      return kgYr / (eff * (days == null ? yr : days) * 12);
    };
    var fishery = function (kgYr) {
      return { kind: 'fishery', amount: Math.round(kgYr * 0.6), regen: Math.round(kgYr / yr * 1.05) };
    };

    var S = [], R = [], byId = {};
    var addS = function (s) { S.push(s); byId[s.id] = s; return s; };
    var seatOfProv = {};
    T.provinces.forEach(function (pv) { seatOfProv[pv.id] = pv.seat; });

    /* Helper: stock `days` of a settlement's own daily `eats` */
    var stockFor = function (eats, people, daysMap, defDays) {
      var st = {};
      Object.keys(eats).forEach(function (g) {
        var d = daysMap && daysMap[g] != null ? daysMap[g] : defDays;
        st[g] = Math.ceil(people * eats[g] * d);
      });
      return st;
    };

    /* ---- A. DECLARE ALL 37 NAMED PLACES (+ AMARO'S 2 SUB-DISTRICTS = 39 NAMED SETTLEMENTS) ---- */
    T.places.forEach(function (P) {
      var isAmaro = P.id === 'ssgsv5zbd2';
      var pop = isAmaro ? P.cityPeople : P.people;
      var gPop = isAmaro ? P.cityGiants : (P.giants == null ? 0 : P.giants);
      var recForDiet = isAmaro ? Object.assign({}, P, { people: pop, giants: gPop, sword: 1170, cadets: 720 }) : P;
      var eats = T.eatsFor(recForDiet);
      var scale = P.group === 'seat' ? KSeat : (P.people >= 400 ? KVil : KFort);
      var pos = T.px(P.px, P.py);
      var works = [{ id: P.id + '.market', kind: 'market', name: P.name + ': market & stores', crew: 0, out: [], rate: 0 }];
      var extraStart = {}, seasonalOwn = {};

      /* 1. Six regimental seats */
      if (P.id === 'ssgsv5zbd2') {
        works.push(
          { id: 'amaro.crucible', kind: 'crucible-hearth', name: 'watered-steel crucible furnaces (charcoal & S5 nickel)', crew: 80, batch: T.chain.crucibleSteel },
          { id: 'amaro.coal-hearth', kind: 'coal-hearth', name: 'blast & scrap refining hearths (imported coal & scrap)', crew: 80, batch: T.chain.coalSteel },
          { id: 'amaro.bladesmiths', kind: 'bladesmith', name: 'the Master Bladesmiths of Amaro', crew: 240, batch: T.chain.bladesmith },
          { id: 'amaro.armourers', kind: 'armourer', name: 'Mamluk mirror-plate & lamellar armourers', crew: 240, batch: T.chain.armourer },
          { id: 'amaro.toolsmiths', kind: 'smithy', name: 'canyon-lip tool & hardware smiths', crew: 160, batch: T.chain.toolsmith },
          { id: 'amaro.inlay', kind: 'brass-shop', name: 'damascene brass & bronze hardware guild', crew: 80, batch: T.chain.bronzeSmelt },
          { id: 'amaro.stills-glass', kind: 'spirits-still', name: 'Ṣūnu-šikaru copper-dome alembics (glass-bottled)', crew: 160, batch: T.chain.alembicGlass, seasonRate: { distilling: 1.8 } },
          { id: 'amaro.stills-jug', kind: 'spirits-still', name: 'Ṣūnu-šikaru copper-dome alembics (stoneware jugs)', crew: 80, batch: T.chain.alembicJug, seasonRate: { distilling: 1.8 } },
          { id: 'amaro.looms', kind: 'kilim-loom', name: 'crimson kilim & scabbard-felt looms', crew: 80, batch: T.chain.kilimLoom }
        );
        extraStart = {
          iron: 28000, charcoal: 36000, coal: 24000, scrap: 9000, nickel: 1800,
          copper: 8000, tin: 2500, brass: 5000, steel: 9000, crimson: 1500,
          fruit: 145000, driedfruit: 120000, glass: 8000, stoneware: 9000, wool: 18000,
          blades: 420, armour: 190, tequila: 28000, tools: 9000, sugar: 4500
        };
      } else if (P.id === 'sm.betun-babu') {
        works.push(
          { id: 'betun.smelter', kind: 'bronze-smelter', name: 'West-Gorge tin-bronze & brass foundry', crew: 80, batch: T.chain.bronzeSmelt },
          { id: 'betun.smithy', kind: 'smithy', name: 'customs-gate farriers & toolsmiths', crew: 80, batch: T.chain.toolsmith },
          { id: 'betun.kilns', kind: 'charcoal-kiln', name: 'gorge-head charcoal clamps', crew: 80, out: ['charcoal'], rate: rate(120000, 80, yr, scale) }
        );
        extraStart = { iron: 16000, charcoal: 28000, copper: 6000, tin: 3500, brass: 3500, salt: 40000, tools: 3500 };
      } else if (P.id === 'sm.suton-qappu') {
        works.push(
          { id: 'suton.bloomery', kind: 'iron-mine', name: 'northern scarp iron adits & bloomery', crew: 80, out: ['iron'], rate: rate(38000, 80, yr, scale), site: T.field('lode', 38000) },
          { id: 'suton.smithy', kind: 'smithy', name: '3rd-Regiment garrison smithy', crew: 80, batch: T.chain.toolsmith },
          { id: 'suton.stud', kind: 'stud-corral', name: 'Dōriyan scarp mountain-mule & remount pens', crew: 80, out: ['mounts'], rate: rate(70, 80, yr, scale) }
        );
        extraStart = { iron: 12000, charcoal: 14000, mounts: 50, stoneware: 5000, tools: 3000 };
      } else if (P.id === 'srbp1bvh1r') {
        works.push(
          { id: 'urundashi.crucible', kind: 'crucible-hearth', name: '4th-Regiment watered-steel hearths', crew: 80, batch: T.chain.crucibleSteel },
          { id: 'urundashi.coal-hearth', kind: 'coal-hearth', name: 'steppe refining hearths (coal & scrap)', crew: 80, batch: T.chain.coalSteel },
          { id: 'urundashi.bladesmiths', kind: 'bladesmith', name: 'Urundashi bladesmiths', crew: 160, batch: T.chain.bladesmith },
          { id: 'urundashi.armourers', kind: 'armourer', name: 'Urundashi cavalry armourers', crew: 160, batch: T.chain.armourer },
          { id: 'urundashi.smithy', kind: 'smithy', name: 'steppe toolsmiths', crew: 80, batch: T.chain.toolsmith },
          { id: 'urundashi.powder', kind: 'powder-mill', name: 'eastern ordnance & saltpeter mill', crew: 80, batch: T.chain.powderMill },
          { id: 'urundashi.nitre', kind: 'saltpeter-vats', name: 'steppe limestone nitre vats', crew: 80, out: ['saltpeter'], rate: rate(26000, 80, yr, scale) },
          { id: 'urundashi.stills', kind: 'spirits-still', name: 'Urundashi Ṣūnu-šikaru copper stills', crew: 80, batch: T.chain.alembicGlass, seasonRate: { distilling: 1.8 } },
          { id: 'urundashi.stud', kind: 'stud-corral', name: '4th-Regiment steppe cavalry remounts', crew: 80, out: ['mounts'], rate: rate(190, 80, yr, scale) }
        );
        extraStart = {
          iron: 18000, charcoal: 20000, coal: 14000, scrap: 6000, nickel: 1200,
          brass: 3500, steel: 6000, crimson: 900, saltpeter: 16000, sulfur: 2500,
          fruit: 65000, glass: 5000, wool: 28000, cheese: 22000, mounts: 130,
          blades: 220, armour: 110, tequila: 18000, tools: 4500
        };
      } else if (P.id === 'sm.yamu-qappu') {
        works.push(
          { id: 'yamu.fishery', kind: 'lake-jetty', name: 'Šīru-Yāmu west-shore trout & char fleet', crew: 80, out: ['fish'], rate: rate(115000, 80, yr, scale), site: fishery(115000) },
          { id: 'yamu.brass', kind: 'brass-smelter', name: 'lake-quay skarn copper & zinc assay house', crew: 80, batch: T.chain.brassSmelt },
          { id: 'yamu.smithy', kind: 'smithy', name: 'harbour & boatyard smiths', crew: 80, batch: T.chain.toolsmith },
          { id: 'yamu.orchards', kind: 'apricot-orchard', name: 'lakeshore whorlapricot & canyon-grape terraces', crew: 80, out: ['fruit'], rate: rate(95000, 80, winDays('apricot'), scale), season: 'apricot' }
        );
        extraStart = { copper: 9000, zinc: 4000, iron: 9000, charcoal: 12000, fish: 20000, fruit: 24000, tools: 3000 };
      } else if (P.id === 'sm.urudiru-qappu') {
        works.push(
          { id: 'urudiru.brass', kind: 'brass-smelter', name: 'Ordeal-foot polymetallic brass smelter', crew: 80, batch: T.chain.brassSmelt }
        );
        extraStart = { copper: 8000, zinc: 4000, saltpeter: 12000, charcoal: 9000, powder: 3000, blades: 70 };
      }

      /* 2. Sanctuaries, canyon villages, lake villages, mines & yayla camps */
      else if (P.id === 'sm.qappu-qubba') {
        works.push({ id: P.id + '.orchard', kind: 'apricot-orchard', name: 'waqf twist-apricot terrace', crew: 25, out: ['driedfruit'], rate: rate(12000, 25, winDays('apricot'), scale), season: 'apricot' });
        seasonalOwn.driedfruit = T.startDays;
      } else if (P.id === 'sm.misu-bustan') {
        works.push(
          { id: P.id + '.apricot', kind: 'apricot-orchard', name: 'walled canyon whorlapricot orchards', crew: 100, out: ['fruit'], rate: rate(190000, 100, winDays('apricot'), scale), season: 'apricot' },
          { id: P.id + '.drying', kind: 'drying-roofs', name: 'flat-roof twist-apricot drying lofts', crew: 50, out: ['driedfruit'], rate: rate(95000, 50, winDays('apricot'), scale), season: 'apricot' }
        );
        seasonalOwn.driedfruit = T.startDays;
      } else if (P.id === 'sm.nazaru-kura') {
        works.push(
          { id: P.id + '.aloe', kind: 'apricot-orchard', name: 'south-facing spiralaloe & apricot ledges', crew: 100, out: ['fruit'], rate: rate(170000, 100, winDays('apricot'), scale), season: 'apricot' },
          { id: P.id + '.stills', kind: 'spirits-still', name: 'Nazāru-Kūra copper alembic still-houses', crew: 100, batch: T.chain.alembicJug, seasonRate: { distilling: 2.0 } }
        );
        extraStart = { fruit: 55000, charcoal: 9000, stoneware: 5000 };
      } else if (P.id === 'sm.nazaru-head') {
        works.push(
          { id: P.id + '.fields', kind: 'terrace-farm', name: 'upper Nazāru irrigated emmer terraces', crew: 100, out: ['grain'], rate: rate(240000, 100, winDays('harvest'), scale), season: 'harvest' },
          { id: P.id + '.orchard', kind: 'apricot-orchard', name: 'apricot & almond shelves', crew: 50, out: ['fruit'], rate: rate(70000, 50, winDays('apricot'), scale), season: 'apricot' }
        );
        seasonalOwn.grain = T.startDays;
      } else if (P.id === 'sm.betun-kura') {
        works.push(
          { id: P.id + '.charcoal', kind: 'charcoal-kiln', name: 'stone beehive charcoal clamps (Amaro fuel lifeline)', crew: 100, out: ['charcoal'], rate: rate(620000, 100, yr, scale) },
          { id: P.id + '.sawpits', kind: 'sawpit', name: 'ropepine & helixpoplar sawpits', crew: 50, out: ['timber'], rate: rate(180000, 50, yr, scale) }
        );
      } else if (P.id === 'sm.babul-wikala') {
        works.push({ id: P.id + '.coopers', kind: 'cooperage', name: 'gallery-portal wheelwrights & pack-yards', crew: 50, out: ['timber'], rate: rate(45000, 50, yr, scale) });
      } else if (P.id === 'sm.gedu-wash') {
        works.push(
          { id: P.id + '.tin-sluice', kind: 'placer-sluice', name: 'stepped canyon cassiterite tin sluices (load 12.46)', crew: 50, out: ['tin'], rate: rate(14000, 50, yr, scale), seasonRate: { snowmelt: 2.0 } },
          { id: P.id + '.gold-sluice', kind: 'placer-sluice', name: 'Dōriyan-Nārun alluvial gold riffles (load 4.57)', crew: 50, out: ['gold'], rate: rate(18, 50, yr, scale), seasonRate: { snowmelt: 2.0 } }
        );
      } else if (P.id === 'sm.madder-glen') {
        works.push(
          { id: P.id + '.fields', kind: 'terrace-farm', name: 'limestone pocket grain terraces', crew: 50, out: ['grain'], rate: rate(140000, 50, winDays('harvest'), scale), season: 'harvest' },
          { id: P.id + '.madder', kind: 'dye-vats', name: 'cave-madder crimson dye & lacquer vats', crew: 50, out: ['crimson'], rate: rate(14000, 50, yr, scale) },
          { id: P.id + '.looms', kind: 'kilim-loom', name: 'regimental crimson kilim looms', crew: 50, batch: T.chain.kilimLoom }
        );
        seasonalOwn.grain = T.startDays;
        extraStart = { wool: 7000, crimson: 1800 };
      } else if (P.id === 'sm.suton-kilns') {
        works.push(
          { id: P.id + '.pottery', kind: 'pottery-kiln', name: 'clay-230 glazed stoneware spirit-flask kilns', crew: 100, out: ['stoneware'], rate: rate(68000, 100, yr, scale) },
          { id: P.id + '.bloomery', kind: 'iron-mine', name: 'scarp ironstone bloomery', crew: 50, out: ['iron'], rate: rate(38000, 50, yr, scale), site: T.field('lode', 38000) }
        );
      } else if (P.id === 'sm.sorun-melh') {
        works.push(
          { id: P.id + '.brine', kind: 'salt-evaporator', name: 'Ṣōrun-Nārun halite-22 brine boiling pans', crew: 100, out: ['salt'], rate: rate(35000, 100, yr, scale) },
          { id: P.id + '.dairy', kind: 'cheese-cellar', name: 'brined sheep-cheese cellars', crew: 50, out: ['cheese'], rate: rate(45000, 50, yr, scale) }
        );
      } else if (P.id === 'sm.sorun-wikala') {
        works.push({ id: P.id + '.shearing', kind: 'shearing-pens', name: 'highway midpoint wool-shearing pens', crew: 100, out: ['wool'], rate: rate(55000, 100, yr, scale) });
      } else if (P.id === 'sm.dubnu-stud') {
        works.push(
          { id: P.id + '.stud', kind: 'stud-corral', name: '4th-Regiment Dubnosriba cavalry & mule stud', crew: 100, out: ['mounts'], rate: rate(260, 100, yr, scale) },
          { id: P.id + '.cheese', kind: 'cheese-loft', name: 'aged kashkaval & tulum cheese lofts', crew: 50, out: ['cheese'], rate: rate(48000, 50, yr, scale) }
        );
      } else if (P.id === 'sm.siru-maru') {
        works.push(
          { id: P.id + '.jetty', kind: 'lake-jetty', name: 'east-shore smoked trout racks & ore slip', crew: 50, out: ['fish'], rate: rate(85000, 50, yr, scale), site: fishery(85000) },
          { id: P.id + '.terraces', kind: 'apricot-orchard', name: 'Csa lakeshore grape & spiralaloe terraces', crew: 50, out: ['fruit'], rate: rate(95000, 50, winDays('apricot'), scale), season: 'apricot' },
          { id: P.id + '.stills', kind: 'spirits-still', name: 'lakeshore copper alembic still', crew: 50, batch: T.chain.alembicJug, seasonRate: { distilling: 2.0 } }
        );
        seasonalOwn.fruit = T.startDays;
        extraStart = { fruit: 32000, charcoal: 5000, stoneware: 3000 };
      } else if (P.id === 'sm.nemetu-gisr') {
        works.push({ id: P.id + '.weir', kind: 'lake-jetty', name: 'Uarosriba outlet fish-weirs & skiff yard', crew: 50, out: ['fish'], rate: rate(75000, 50, yr, scale), site: fishery(75000) });
      } else if (P.id === 'sm.sutaru-betu') {
        works.push(
          { id: P.id + '.nickel', kind: 'nickel-bloomery', name: 'impact-margin nickel-220 master-alloy bloomery', crew: 50, out: ['nickel'], rate: rate(14000, 50, yr, scale), site: T.field('nickel-lode', 14000) },
          { id: P.id + '.fish', kind: 'lake-jetty', name: 'Suṭāru-Yāmu south-shore fishery', crew: 50, out: ['fish'], rate: rate(35000, 50, yr, scale), site: fishery(35000) }
        );
      } else if (P.id === 'sm.ablaq-quarry') {
        works.push({ id: P.id + '.quarry', kind: 'quarry', name: 'royal basalt, impactite & travertine ablaq yard', crew: 50, out: ['stone'], rate: rate(280000, 50, yr, scale) });
      } else if (P.id === 'sm.west-iron-tin') {
        works.push(
          { id: P.id + '.iron', kind: 'mine', name: 'West-Gorge iron-255 adits', crew: 50, out: ['iron'], rate: rate(165000, 50, yr, scale), site: T.field('iron-lode', 165000) },
          { id: P.id + '.tin', kind: 'mine', name: 'granite pluton tin-200 adits', crew: 25, out: ['tin'], rate: rate(22000, 25, yr, scale), site: T.field('tin-lode', 22000) }
        );
      } else if (P.id === 'sm.skarn-mine') {
        works.push(
          { id: P.id + '.iron', kind: 'mine', name: 'NE skarn iron-255 adits', crew: 25, out: ['iron'], rate: rate(75000, 25, yr, scale), site: T.field('iron-lode', 75000) },
          { id: P.id + '.copper', kind: 'mine', name: 'NE skarn copper-210 adits', crew: 25, out: ['copper'], rate: rate(42000, 25, yr, scale), site: T.field('copper-lode', 42000) },
          { id: P.id + '.zinc', kind: 'mine', name: 'NE skarn zinc-168 adits', crew: 25, out: ['zinc'], rate: rate(16000, 25, yr, scale), site: T.field('zinc-lode', 16000) },
          { id: P.id + '.silver', kind: 'mine', name: 'NE argentiferous sulfide vein', crew: 25, out: ['silver'], rate: rate(85, 25, yr, scale), site: T.field('silver-lode', 85) },
          { id: P.id + '.gold', kind: 'mine', name: 'NE contact gold vein', crew: 25, out: ['gold'], rate: rate(14, 25, yr, scale), site: T.field('gold-lode', 14) },
          { id: P.id + '.marble', kind: 'quarry', name: 'pale contact marble-43 quarry', crew: 25, out: ['marble'], rate: rate(45000, 25, yr, scale) }
        );
      } else if (P.id === 'sm.urudiru-lode') {
        var hiSeason = { yayla: 1.35, ordeal_winter: 0.55 };
        works.push(
          { id: P.id + '.iron', kind: 'mine', name: 'Godthrone contact iron-255 adits', crew: 50, out: ['iron'], rate: rate(95000, 50, yr, scale), seasonRate: hiSeason, site: T.field('iron-lode', 95000) },
          { id: P.id + '.copper', kind: 'mine', name: 'Godthrone contact copper-210 adits', crew: 50, out: ['copper'], rate: rate(55000, 50, yr, scale), seasonRate: hiSeason, site: T.field('copper-lode', 55000) },
          { id: P.id + '.zinc', kind: 'mine', name: 'Godthrone contact zinc-168 adits', crew: 50, out: ['zinc'], rate: rate(26000, 50, yr, scale), seasonRate: hiSeason, site: T.field('zinc-lode', 26000) },
          { id: P.id + '.silver', kind: 'mine', name: 'Ordeal argentiferous galena adits', crew: 50, out: ['silver'], rate: rate(125, 50, yr, scale), seasonRate: hiSeason, site: T.field('silver-lode', 125) },
          { id: P.id + '.gold', kind: 'mine', name: 'Ordeal contact gold-140 vein', crew: 50, out: ['gold'], rate: rate(18, 50, yr, scale), seasonRate: hiSeason, site: T.field('gold-lode', 18) }
        );
      } else if (P.id === 'sm.nitre-vats') {
        var vatSeason = { yayla: 1.4, ordeal_winter: 0.45 };
        works.push(
          { id: P.id + '.nitre', kind: 'saltpeter-vats', name: 'Šūru-Bāru saltpeter-184 leaching vats', crew: 50, out: ['saltpeter'], rate: rate(165000, 50, yr, scale), seasonRate: vatSeason, site: T.field('nitre-crust', 165000) },
          { id: P.id + '.sulfur', kind: 'sulfur-crusts', name: 'Godthrone fumarolic sulfur-60 scrapings', crew: 25, out: ['sulfur'], rate: rate(16000, 25, yr, scale), seasonRate: vatSeason, site: T.field('fumarole-sulfur', 16000) }
        );
      } else if (P.id === 'sm.dubnu-yayla' || P.id === 'sm.warun-yayla') {
        works.push(
          { id: P.id + '.wool', kind: 'yayla-fold', name: 'high summer pasture sheep & goat folds', crew: 25, out: ['wool'], rate: rate(28000, 25, winDays('yayla'), scale), season: 'yayla' },
          { id: P.id + '.cheese', kind: 'yayla-dairy', name: 'summer yayla milking & cheese tents', crew: 25, out: ['cheese'], rate: rate(24000, 25, winDays('yayla'), scale), season: 'yayla' }
        );
        seasonalOwn.cheese = T.startDays;
      }

      /* Seats hold last autumn's harvest buffer for themselves & dependent forts/camps; forts/mines/shrines hold 70 days so they rely on live roads */
      var baseDays = P.group === 'seat' ? T.startDays : 70;
      var dMap = Object.assign({ salt: 85, powder: 120, blades: 180, armour: 180 }, seasonalOwn);
      var st = Object.assign(stockFor(eats, pop, dMap, baseDays), extraStart);
      if (P.id === 'sm.suton-qappu') {
        /* Suṭōn-Qappu draws ~260 t/yr of cold-truce grain from gate.voth-march across winter/spring before S3's harvest */
        st.grain = Math.round(pop * eats.grain * 95);
      }
      addS({
        id: P.id, name: P.name, faction: 'shumar',
        parent: P.group === 'seat' ? undefined : seatOfProv[P.province],
        province: P.province, giants: gPop,
        people: pop, x: pos.x, z: pos.z, scale: scale,
        eats: eats, keepDays: P.group === 'seat' ? 25 : 20,
        start: st, works: works
      });
    });

    /* Amaro's three sub-settlements (`amaro.citadel` = 1,100; `amaro.necropolis` = 300; `amaro.gisr` = 850) */
    T.districts.forEach(function (Drec) {
      var eats = T.eatsFor(Drec);
      var pos = T.px(Drec.px, Drec.py);
      var scale = Drec.id === 'amaro.citadel' ? KSeat : (Drec.people >= 400 ? KVil : KFort);
      var works = [];
      var extra = {}, saltDays = 75, defDays = 60;
      if (Drec.id === 'amaro.citadel') {
        works.push(
          { id: Drec.id + '.hall', kind: 'diwan', name: Drec.name, crew: 0, out: [], rate: 0 },
          { id: 'citadel.powder', kind: 'powder-mill', name: 'Grand Dīwān ordnance & powder magazine', crew: 80, batch: T.chain.powderMill }
        );
        extra = { saltpeter: 12000, charcoal: 4000, sulfur: 2500, powder: 5000, blades: 220, armour: 90 };
      } else if (Drec.id === 'amaro.necropolis') {
        works.push({ id: Drec.id + '.hall', kind: 'hall-of-blades', name: Drec.name, crew: 0, out: [], rate: 0 });
        extra = { blades: 140 };
      } else if (Drec.id === 'amaro.gisr') {
        works.push(
          { id: Drec.id + '.market', kind: 'market', name: Drec.name + ': bridge toll & mill-race stores', crew: 0, out: [], rate: 0 },
          { id: Drec.id + '.mills', kind: 'watermill', name: 'triple-confluence overshot flour mills', crew: 100, out: ['grain'], rate: rate(260000, 100, yr, scale), seasonRate: { snowmelt: 1.5 } },
          { id: Drec.id + '.hammers', kind: 'smithy', name: 'waterwheel trip-hammer tool works', crew: 50, batch: T.chain.toolsmith, seasonRate: { snowmelt: 1.5 } }
        );
        extra = { iron: 6000, charcoal: 6000 };
        saltDays = 85;
        defDays = 70;
      }
      var st = Object.assign(stockFor(eats, Drec.people, { salt: saltDays }, defDays), extra);
      addS({
        id: Drec.id, name: Drec.name, faction: 'shumar', parent: 'ssgsv5zbd2',
        province: 'S1', giants: Drec.giants,
        people: Drec.people, x: pos.x, z: pos.z, scale: scale,
        eats: eats, keepDays: 20, start: st, works: works
      });
    });

    /* ---- B. DECLARE BULK PROVINCIAL COUNTRYSIDES (+ OPTIONAL UNBUNDLED RING HAMLETS) ---- */
    T.countrysides.forEach(function (C) {
      var pop = splitRings ? C.people : (C.people + C.ringPeople);
      var scaleFactor = pop / C.people;
      var eats = T.eatsFor({ people: pop, giants: C.giants, kind: 'rural' });
      var pos = T.px(C.px, C.py);
      var grainYr = Math.round(C.grain * scaleFactor);
      var crew = KBulk * 2;
      var works = [{
        id: C.id + '.fields', kind: 'farmstead', name: C.name + ': rainfed & gorge grain terraces',
        crew: crew, out: ['grain'], rate: rate(grainYr, crew, winDays('harvest'), KBulk), season: 'harvest'
      }];
      var sh = { grain: C.province === 'S6' ? 0.12 : 0.42 };
      Object.keys(C.extra).forEach(function (g) {
        var amt = Math.round(C.extra[g] * scaleFactor);
        var w = (g === 'fruit' || g === 'driedfruit') ? 'apricot' : null;
        works.push({
          id: C.id + '.' + g, kind: g + '-works', name: C.name + ': ' + g,
          crew: KBulk, out: [g], rate: rate(amt, KBulk, w ? winDays(w) : yr, KBulk), season: w || undefined
        });
        sh[g] = g === 'cheese' ? 0.45 : (g === 'driedfruit' ? 0.48 : 0.78);
      });
      var st = stockFor(eats, pop, { grain: T.startDays, cheese: 160, driedfruit: T.startDays, salt: 90, tools: 120 }, 120);
      addS({
        id: C.id, name: C.name, faction: 'shumar', parent: C.seat,
        province: C.province, giants: C.giants,
        people: pop, x: pos.x, z: pos.z, scale: KBulk,
        eats: eats, keepDays: 30, start: st, works: works, _iqtaShare: sh
      });
    });

    if (splitRings) {
      T.rings.forEach(function (Rg) {
        var isLake = Rg.focus === 'fishing';
        var eats = T.eatsFor({ people: Rg.people, giants: 0, kind: isLake ? 'lake' : 'rural' });
        var pos = T.px(Rg.px, Rg.py);
        var fMap = {
          farming: ['grain', 95000, 'harvest'], orchard: ['fruit', 65000, 'apricot'],
          quarry: ['stone', 75000, null], ranch: ['wool', 18000, null],
          lumber: ['charcoal', 55000, null], clay: ['stoneware', 18000, null],
          salt: ['salt', 10000, null], fishing: ['fish', 32000, null]
        };
        var fm = fMap[Rg.focus], w = fm[2];
        var works = [{
          id: Rg.id + '.work', kind: Rg.focus, name: Rg.id + ' ' + Rg.focus,
          crew: KVil, out: [fm[0]], rate: rate(fm[1], KVil, w ? winDays(w) : yr, KVil), season: w || undefined
        }];
        var st = stockFor(eats, Rg.people, { grain: Rg.focus === 'farming' ? T.startDays : 85, fruit: Rg.focus === 'orchard' ? T.startDays : 85, salt: 85 }, 85);
        addS({
          id: Rg.id, name: Rg.id, faction: 'shumar', parent: Rg.seat,
          province: Rg.province, giants: 0,
          people: Rg.people, x: pos.x, z: pos.z, scale: KVil,
          eats: eats, keepDays: 25, start: st, works: works,
          _ringShare: { [fm[0]]: fm[0] === 'grain' ? 0.45 : 0.75 }
        });
      });
    }

    /* Bump seat start grain/cheese/driedfruit so seats cover dependent forts, mines, shrines & districts until harvest */
    S.forEach(function (s) {
      if (!s.parent || /^prov\./.test(s.id) || /^gate\./.test(s.id)) return;
      var feeder = byId[s.parent];
      if (!feeder) return;
      ['grain', 'cheese', 'driedfruit'].forEach(function (g) {
        if ((s.eats[g] || 0) > 0) {
          var addKg = Math.ceil(s.people * s.eats[g] * (T.startDays - 55));
          feeder.start[g] = (feeder.start[g] || 0) + addKg;
        }
      });
    });

    /* ---- C. INTERNAL ROADS, ŠĪRU-YĀMU LAKE BARGES, IQTA' & WAQF ---- */
    var distKm = function (a, b) {
      var A = byId[a], B = byId[b];
      return Math.max(4, Math.hypot(A.x - B.x, A.z - B.z) / 1000 * 1.28);
    };
    var minsKm = function (km, speedKmDay) {
      var sp = speedKmDay == null ? 24 : speedKmDay;
      return Math.max(120, Math.round(km / sp * 1440));
    };
    var dailyNeed = function (id, gs) {
      var s = byId[id], o2 = {};
      (gs || Object.keys(s.eats)).forEach(function (g) {
        if ((s.eats[g] || 0) > 0) o2[g] = s.people * s.eats[g] * 1.2;
      });
      return o2;
    };

    /* 1. Provincial countryside *iqta'* tithe roads into their regimental seats */
    T.countrysides.forEach(function (C) {
      var cSett = byId[C.id], seat = C.seat, km = distKm(C.id, seat), m = minsKm(km, 24);
      var seatSends = ['salt', 'tools'];
      if (C.province === 'S6') seatSends.push('grain', 'cheese', 'driedfruit');
      R.push({
        id: 'iqta.' + C.id, from: C.id, to: seat,
        minutes: m, cap: 120000, carriers: 4, stagger: Math.round(m / 4), want: 45,
        share: { [C.id]: cSett._iqtaShare },
        goods: { [seat]: seatSends },
        expect: { [C.id]: dailyNeed(C.id, seatSends) }
      });
    });

    if (splitRings) {
      S.filter(function (s) { return s._ringShare; }).forEach(function (rg) {
        var seat = rg.parent, m = minsKm(distKm(rg.id, seat), 24);
        var back = ['grain', 'cheese', 'driedfruit', 'salt', 'tools', 'stoneware', 'fruit', 'fish'].filter(function (g) { return (rg.eats[g] || 0) > 0 && !rg._ringShare[g]; });
        R.push({
          id: 'ring.' + rg.id, from: rg.id, to: seat,
          minutes: m, cap: 25000, carriers: 2, stagger: Math.round(m / 2), want: 45,
          share: { [rg.id]: rg._ringShare },
          goods: { [seat]: back },
          expect: { [rg.id]: dailyNeed(rg.id, back) }
        });
      });
    }

    /* 2. Amaro <-> Citadel (*Dīwān* & Arsenal) and Amaro <-> Necropolis (Hall of Blades) */
    R.push({
      id: 'road.amaro-citadel', from: 'ssgsv5zbd2', to: 'amaro.citadel',
      minutes: 90, cap: 30000, carriers: 4, stagger: 30, want: 35, keep: 10,
      goods: {
        ssgsv5zbd2: ['grain', 'cheese', 'fruit', 'driedfruit', 'salt', 'tequila', 'wool', 'tools', 'blades', 'armour', 'crimson', 'sugar', 'saltpeter', 'charcoal', 'sulfur'],
        'amaro.citadel': ['powder']
      },
      expect: {
        'amaro.citadel': Object.assign(dailyNeed('amaro.citadel'), { saltpeter: 22, charcoal: 6, sulfur: 3 }),
        ssgsv5zbd2: { powder: 25 }
      }
    });
    R.push({
      id: 'road.amaro-necropolis', from: 'ssgsv5zbd2', to: 'amaro.necropolis',
      minutes: 90, cap: 15000, carriers: 2, stagger: 45, want: 40, keep: 10,
      goods: {
        ssgsv5zbd2: ['grain', 'cheese', 'fruit', 'driedfruit', 'salt', 'wool', 'tools', 'blades'],
        'amaro.necropolis': []
      },
      expect: { 'amaro.necropolis': Object.assign(dailyNeed('amaro.necropolis'), { blades: 0.2 }) }
    });

    /* 3. Regimental *Waqf* endowment roads (`share`) feeding `amaro.necropolis` & the three provincial *qubba* shrines */
    var waqfDefs = [
      ['waqf.necropolis.payaru', 'amaro.gisr', 'amaro.necropolis', { grain: 0.22 }],
      ['waqf.necropolis.bustan', 'sm.misu-bustan', 'amaro.necropolis', { driedfruit: 0.18, fruit: 0.12 }],
      ['waqf.qappu-qubba', 'sm.nazaru-head', 'sm.qappu-qubba', { grain: 0.18, fruit: 0.15 }],
      ['waqf.doriyan-inu', 'sm.madder-glen', 'sm.doriyan-inu', { grain: 0.20, crimson: 0.12, kilims: 0.12 }],
      ['waqf.siru-qubba', 'sm.siru-maru', 'sm.siru-qubba', { fish: 0.12, fruit: 0.12 }]
    ];
    waqfDefs.forEach(function (w) {
      var m = minsKm(distKm(w[1], w[2]), 22);
      R.push({
        id: w[0], from: w[1], to: w[2],
        minutes: m, cap: 15000, carriers: 2, stagger: Math.round(m / 2), want: 35,
        share: { [w[1]]: w[3] },
        goods: { [w[2]]: [] }
      });
    });

    /* 4. Specialist village, fort, mine, sanctuary & yayla branch roads to their provincial seat */
    var branchSupply = function (childId, seatId, childOut, extraSeatToChild, extraExpectAtSeat) {
      var child = byId[childId];
      var baseToChild = Object.keys(child.eats).concat(extraSeatToChild || []);
      var seen = {};
      var toChild = baseToChild.filter(function (g) {
        if (seen[g] || childOut.indexOf(g) >= 0) return false;
        seen[g] = true;
        return true;
      });
      var m = minsKm(distKm(childId, seatId), 22);
      var expChild = dailyNeed(childId, toChild);
      (extraSeatToChild || []).forEach(function (g) {
        if (!expChild[g]) expChild[g] = g === 'charcoal' ? 25 : (g === 'wool' ? 20 : 15);
      });
      R.push({
        id: 'branch.' + childId, from: childId, to: seatId,
        minutes: m, cap: 30000, carriers: 3, stagger: Math.round(m / 3), want: 45, keep: 12,
        goods: { [childId]: childOut, [seatId]: toChild },
        expect: { [childId]: expChild, [seatId]: extraExpectAtSeat || {} }
      });
    };

    /* S1 branches -> Amaro (incl. amaro.gisr gorge-foot switchback road) */
    branchSupply('sm.qappu-qubba', 'ssgsv5zbd2', ['driedfruit'], [], { driedfruit: 20 });
    branchSupply('amaro.gisr', 'ssgsv5zbd2', ['grain', 'tools'], ['iron', 'charcoal'], { grain: 500, tools: 20 });
    branchSupply('sm.misu-bustan', 'ssgsv5zbd2', ['fruit', 'driedfruit'], [], { fruit: 400, driedfruit: 160 });
    branchSupply('sm.nazaru-kura', 'ssgsv5zbd2', ['tequila', 'fruit'], ['charcoal', 'stoneware'], { tequila: 160, fruit: 180 });
    branchSupply('sm.nazaru-head', 'ssgsv5zbd2', ['grain', 'fruit'], [], { grain: 350, fruit: 120 });
    branchSupply('sm.ablaq-quarry', 'ssgsv5zbd2', ['stone'], [], { stone: 650 });

    /* S2 branches -> Bētun-Bābu */
    branchSupply('sm.taru-betun', 'sm.betun-babu', ['salt', 'timber', 'grain'], ['blades', 'armour', 'brass', 'tequila', 'cheese', 'powder'], { salt: 160, timber: 140, grain: 55 });
    branchSupply('sm.gedu-saddle', 'sm.betun-babu', [], [], {});
    branchSupply('sm.dervu-cicu', 'sm.betun-babu', [], [], {});
    branchSupply('sm.betun-kura', 'sm.betun-babu', ['charcoal', 'timber'], [], { charcoal: 1650, timber: 450 });
    branchSupply('sm.babul-wikala', 'sm.betun-babu', ['timber'], [], { timber: 110 });
    branchSupply('sm.gedu-wash', 'sm.betun-babu', ['tin', 'gold'], [], { tin: 38, gold: 0.05 });
    branchSupply('sm.west-iron-tin', 'sm.betun-babu', ['iron', 'tin'], [], { iron: 420, tin: 58 });

    /* S3 branches -> Suṭōn-Qappu */
    branchSupply('sm.doriyan-inu', 'sm.suton-qappu', [], [], {});
    branchSupply('sm.kattu-cicu', 'sm.suton-qappu', [], [], {});
    branchSupply('sm.madder-glen', 'sm.suton-qappu', ['crimson', 'kilims', 'grain'], ['wool'], { crimson: 35, kilims: 25 });
    branchSupply('sm.suton-kilns', 'sm.suton-qappu', ['stoneware', 'iron'], [], { stoneware: 175, iron: 95 });

    /* S4 branches -> Urundashi */
    branchSupply('sm.sorun-melh', 'srbp1bvh1r', ['salt', 'cheese'], [], { salt: 85, cheese: 110 });
    branchSupply('sm.sorun-wikala', 'srbp1bvh1r', ['wool'], [], { wool: 145 });
    branchSupply('sm.dubnu-stud', 'srbp1bvh1r', ['mounts', 'cheese'], [], { mounts: 0.70, cheese: 120 });
    branchSupply('sm.dubnu-yayla', 'srbp1bvh1r', ['wool', 'cheese'], [], { wool: 75, cheese: 45 });

    /* S5 NE Skarn & East Tarn -> Šīru-Māru + Šīru-Yāmu Lake Barges & Outlet Shore Road -> Yāmu-Qappu */
    branchSupply('sm.nemetu-gisr', 'sm.yamu-qappu', ['fish'], [], { fish: 160 });
    branchSupply('sm.skarn-mine', 'sm.sutaru-betu', ['iron', 'copper', 'zinc', 'silver', 'gold', 'marble'], [], { iron: 200, copper: 110, zinc: 42, silver: 0.22, gold: 0.04, marble: 110 });
    branchSupply('sm.sutaru-betu', 'sm.siru-maru', ['nickel', 'iron', 'copper', 'zinc', 'silver', 'gold', 'marble'], ['driedfruit'], { nickel: 38, iron: 200, copper: 110, zinc: 42, silver: 0.22, gold: 0.04, marble: 110 });
    {
      var rSutaru = R.find(function (r) { return r.id === 'branch.sm.sutaru-betu'; });
      var needSkarn = dailyNeed('sm.skarn-mine');
      Object.keys(needSkarn).forEach(function (g) {
        rSutaru.expect['sm.sutaru-betu'][g] = (rSutaru.expect['sm.sutaru-betu'][g] || 0) + needSkarn[g];
      });
    }
    /* Šīru-Yāmu lake-barge round (`barge.siru-yamu`) & ore-barge shuttle (`barge.siru-ore`) */
    R.push({
      id: 'barge.siru-yamu',
      stops: ['sm.yamu-qappu', 'sm.siru-qubba', 'sm.siru-maru', 'sm.nemetu-gisr'],
      minutes: 360, cap: 18000, carriers: 4, stagger: 90, want: 40, keep: 8,
      goods: null,
      expect: {
        'sm.siru-qubba': dailyNeed('sm.siru-qubba'),
        'sm.siru-maru': { grain: 520, cheese: 42, driedfruit: 16, salt: 32, tools: 4, stoneware: 6 },
        'sm.nemetu-gisr': dailyNeed('sm.nemetu-gisr'),
        'sm.yamu-qappu': { fish: 320, fruit: 180, tequila: 35 }
      }
    });
    R.push({
      id: 'barge.siru-ore', from: 'sm.siru-maru', to: 'sm.yamu-qappu',
      minutes: 420, cap: 24000, carriers: 3, stagger: 140, want: 45, keep: 5,
      goods: {
        'sm.siru-maru': ['nickel', 'copper', 'iron', 'zinc', 'silver', 'gold', 'marble', 'fish', 'tequila'],
        'sm.yamu-qappu': ['grain', 'salt', 'cheese', 'driedfruit', 'tools', 'charcoal', 'stoneware']
      },
      expect: {
        'sm.yamu-qappu': { nickel: 38, copper: 110, iron: 200, zinc: 42, silver: 0.22, gold: 0.04, marble: 110, fish: 220, tequila: 35 },
        'sm.siru-maru': { grain: 550, salt: 34, cheese: 42, driedfruit: 18, tools: 4, charcoal: 16, stoneware: 8 }
      }
    });

    /* S6 Ordeal Gate (`sm.ordeal-gate`), Polymetallic Mines, Nitre Vats, Watch-Post & Yayla -> Urudīru-Qappu */
    /* Ordeal supply road (`ordeal.supply`): strictly zero `tequila` and zero `sugar` sent to Bābu al-Urudīru */
    R.push({
      id: 'ordeal.supply', from: 'sm.urudiru-qappu', to: 'sm.ordeal-gate',
      minutes: minsKm(distKm('sm.urudiru-qappu', 'sm.ordeal-gate'), 18),
      cap: 15000, carriers: 3, stagger: 120, want: 50, keep: 10,
      goods: { 'sm.urudiru-qappu': ['grain', 'cheese', 'driedfruit', 'salt', 'tools'], 'sm.ordeal-gate': [] },
      expect: { 'sm.ordeal-gate': dailyNeed('sm.ordeal-gate') }
    });
    branchSupply('sm.urudiru-lode', 'sm.urudiru-qappu', ['iron', 'copper', 'zinc', 'silver', 'gold'], [], { iron: 250, copper: 145, zinc: 68, silver: 0.32, gold: 0.05 });
    branchSupply('sm.nitre-vats', 'sm.urudiru-qappu', ['saltpeter', 'sulfur'], [], { saltpeter: 430, sulfur: 42 });
    branchSupply('sm.haru-cicu', 'sm.urudiru-qappu', [], [], {});
    branchSupply('sm.warun-yayla', 'sm.urudiru-qappu', ['wool', 'cheese'], [], { wool: 70, cheese: 45 });

    /* ---- D. FOUR REGIMENTAL TRUNK HIGHWAYS RADIATING FROM AMARO & URUNDASHI ---- */
    /* 1. Amaro <-> Bētun-Bābu (`dirt.amaro`, 102 km western canyon highway) */
    var mWest = minsKm(102, 26);
    R.push({
      id: 'road.amaro-betun', from: 'sm.betun-babu', to: 'ssgsv5zbd2',
      minutes: mWest, cap: 65000, carriers: 8, stagger: Math.round(mWest / 8), want: 45, keep: 18,
      goods: {
        'sm.betun-babu': ['salt', 'coal', 'scrap', 'glass', 'sugar', 'firearms', 'mechparts', 'charcoal', 'timber', 'iron', 'tin', 'gold', 'brass'],
        ssgsv5zbd2: ['blades', 'armour', 'tequila', 'wool', 'kilims', 'mounts', 'cheese', 'saltpeter', 'driedfruit', 'silver', 'gold', 'powder']
      },
      expect: {
        ssgsv5zbd2: {
          salt: 1550, coal: 950, scrap: 260, glass: 220, sugar: 95,
          firearms: 0.08, mechparts: 0.15, charcoal: 1500, timber: 400,
          iron: 320, tin: 65, gold: 0.05, brass: 20
        },
        'sm.betun-babu': {
          blades: 2.2, armour: 1.0, tequila: 310, wool: 280, kilims: 36,
          mounts: 1.0, cheese: 120, saltpeter: 310, driedfruit: 100, silver: 0.3, gold: 0.07, powder: 4
        }
      }
    });

    /* 2. Amaro <-> Suṭōn-Qappu (54 km Dōriyan Watch-Road) */
    var mNorth = minsKm(54, 24);
    R.push({
      id: 'road.amaro-suton', from: 'sm.suton-qappu', to: 'ssgsv5zbd2',
      minutes: mNorth, cap: 40000, carriers: 5, stagger: Math.round(mNorth / 5), want: 42, keep: 16,
      goods: {
        'sm.suton-qappu': ['stoneware', 'crimson', 'kilims', 'iron', 'charcoal', 'grain'],
        ssgsv5zbd2: ['salt', 'cheese', 'driedfruit', 'fruit', 'tequila', 'blades', 'armour', 'powder', 'sugar', 'mounts', 'wool']
      },
      expect: {
        ssgsv5zbd2: { stoneware: 145, crimson: 32, kilims: 22, iron: 95, charcoal: 220, grain: 350 },
        'sm.suton-qappu': { salt: 340, cheese: 40, driedfruit: 25, fruit: 25, tequila: 18, blades: 0.4, armour: 0.15, powder: 2, sugar: 4, mounts: 0.35, wool: 35 }
      }
    });

    /* 3. Amaro <-> Urudīru-Qappu (88 km Way of Blades: Ordeal rations up, polymetallic ores & nitre down) */
    var mOrdeal = minsKm(88, 20);
    R.push({
      id: 'road.way-of-blades', from: 'ssgsv5zbd2', to: 'sm.urudiru-qappu',
      minutes: mOrdeal, cap: 45000, carriers: 6, stagger: Math.round(mOrdeal / 6), want: 50, keep: 16,
      goods: {
        ssgsv5zbd2: ['grain', 'cheese', 'driedfruit', 'fruit', 'salt', 'charcoal', 'tools', 'blades', 'armour', 'powder', 'tequila', 'sugar', 'crimson'],
        'sm.urudiru-qappu': ['copper', 'zinc', 'brass', 'iron', 'silver', 'gold', 'saltpeter', 'sulfur', 'wool']
      },
      expect: {
        'sm.urudiru-qappu': {
          grain: 1650, cheese: 150, driedfruit: 95, fruit: 12, salt: 110,
          charcoal: 45, tools: 12, blades: 0.35, armour: 0.1, powder: 9, tequila: 4, sugar: 1, crimson: 0.5
        },
        ssgsv5zbd2: {
          copper: 95, zinc: 42, brass: 30, iron: 220, silver: 0.32, gold: 0.05, saltpeter: 380, sulfur: 38, wool: 85
        }
      }
    });

    /* 4. Amaro <-> Urundashi (92 km paved/graded plateau highway `supp.ssgsv5zbd2`) */
    var mSpine = minsKm(92, 26);
    R.push({
      id: 'road.amaro-urundashi', from: 'ssgsv5zbd2', to: 'srbp1bvh1r',
      minutes: mSpine, cap: 55000, carriers: 6, stagger: Math.round(mSpine / 6), want: 45, keep: 18,
      goods: {
        ssgsv5zbd2: ['salt', 'coal', 'scrap', 'glass', 'sugar', 'charcoal', 'tin', 'brass', 'crimson', 'stoneware', 'saltpeter', 'sulfur', 'driedfruit', 'fruit'],
        srbp1bvh1r: ['wool', 'cheese', 'mounts', 'nickel', 'copper', 'iron', 'silver', 'gold', 'fish', 'books', 'medicine', 'mechparts', 'timber']
      },
      expect: {
        srbp1bvh1r: {
          salt: 560, coal: 280, scrap: 80, glass: 75, sugar: 18, charcoal: 260,
          tin: 15, brass: 20, crimson: 12, stoneware: 45, saltpeter: 95, sulfur: 8, driedfruit: 75, fruit: 120
        },
        ssgsv5zbd2: {
          wool: 360, cheese: 260, mounts: 1.4, nickel: 26, copper: 55, iron: 110,
          silver: 0.25, gold: 0.04, fish: 180, books: 0.14, medicine: 12, mechparts: 0.12, timber: 90
        }
      }
    });

    /* 5. Urundashi <-> Yāmu-Qappu (52 km NE Lake & Skarn March road) */
    var mLake = minsKm(52, 24);
    R.push({
      id: 'road.urundashi-yamu', from: 'srbp1bvh1r', to: 'sm.yamu-qappu',
      minutes: mLake, cap: 40000, carriers: 5, stagger: Math.round(mLake / 5), want: 42, keep: 16,
      goods: {
        srbp1bvh1r: ['salt', 'charcoal', 'stoneware', 'sugar', 'crimson', 'wool', 'cheese', 'saltpeter', 'driedfruit', 'tequila', 'blades', 'armour'],
        'sm.yamu-qappu': ['nickel', 'copper', 'brass', 'iron', 'silver', 'gold', 'marble', 'fish', 'timber', 'medicine']
      },
      expect: {
        'sm.yamu-qappu': {
          salt: 290, charcoal: 90, stoneware: 35, sugar: 4, crimson: 2,
          wool: 60, cheese: 40, saltpeter: 85, driedfruit: 45, tequila: 35, blades: 0.3, armour: 0.12
        },
        srbp1bvh1r: {
          nickel: 36, copper: 65, brass: 20, iron: 160, silver: 0.2, gold: 0.04, marble: 90, fish: 260, timber: 95, medicine: 15
        }
      }
    });

    /* Extra staging expectation on sm.betun-babu -> sm.taru-betun for gate.greenstep exports */
    {
      var rTaru = R.find(function (r) { return r.id === 'branch.sm.taru-betun'; });
      rTaru.expect['sm.taru-betun'] = Object.assign(rTaru.expect['sm.taru-betun'], {
        blades: 0.35, armour: 0.18, brass: 16, tequila: 45, cheese: 25
      });
    }

    /* ---- E. FIVE EXTERNAL GATEWAYS (PROPOSAL-SHUMAR.md section 6b) ---- */
    /* Each gateway is an off-map pool (`people: 0`) holding only `G.in`. For exports (`entry -> gate`), `gate` has
       zero consumption, so `R.want * expect[gate][g]` sets the exact annual export target absorbed by `gate`. */
    var gateWantDays = 90;
    T.gateways.forEach(function (G) {
      var pool = {};
      G.in.forEach(function (g) { if (T.gatePool[g] != null) pool[g] = T.gatePool[g]; });
      var entryS = byId[G.entry];
      addS({
        id: G.id, name: G.name, faction: G.coldTruce ? 'voth' : 'gate',
        people: 0, x: entryS.x, z: entryS.z - 800000, scale: KSeat,
        eats: {}, keepDays: 0, start: pool,
        works: [{ id: G.id + '.bazaar', kind: 'bazaar', name: G.name + ': off-map caravan pool', crew: 0, out: [], rate: 0 }]
      });

      var expGate = {};
      Object.keys(G.targetOutYr || {}).forEach(function (g) {
        expGate[g] = G.targetOutYr[g] / gateWantDays;
      });
      var expEntry = {};
      if (G.id === 'gate.west-trunk') {
        expEntry = { salt: 1650, coal: 1050, scrap: 280, glass: 230, sugar: 95, firearms: 0.08, mechparts: 0.15 };
      } else if (G.id === 'gate.greenstep') {
        expEntry = { salt: 160, timber: 150, grain: 60 };
      } else if (G.id === 'gate.talovolci') {
        expEntry = { timber: 110, iron: 45, nickel: 8, medicine: 16 };
      } else if (G.id === 'gate.east-foothills') {
        expEntry = { salt: 160, mechparts: 0.16, medicine: 18, books: 0.16 };
      } else if (G.id === 'gate.voth-march') {
        expEntry = { grain: 1850 };
      }

      var m = G.days * 1440;
      var rd = {
        id: 'trade.' + G.id, from: G.id, to: G.entry,
        minutes: m, carriers: G.carriers, stagger: Math.round(m / G.carriers),
        cap: G.cap, most: Math.round(G.cap * 0.65), keep: G.coldTruce ? 8 : 16, want: gateWantDays,
        goods: { [G.id]: G.in.slice(), [G.entry]: G.out.slice() },
        expect: { [G.id]: expGate, [G.entry]: expEntry }
      };
      if (G.closedWinter) {
        rd.closed = [{ legs: [0, 1], window: G.closedWinter }];
      }
      if (G.toll > 0) {
        var tollGoods = G.in.filter(function (g) { return g !== 'books' && g !== 'firearms' && g !== 'mechparts'; });
        rd.cut = [{ at: G.entry, to: 'amaro.citadel', share: G.toll, goods: tollGoods, why: 'the Bābu 4% outlander caravan toll to the Grand Dīwān' }];
      }
      R.push(rd);
    });

    /* ---- F. SCHEDULED STATE TRANSFERS (`SIM.transfer`: IQTA' ASSESSMENTS & ORDEAL GRADUATION) ---- */
    var iqtaDay = T.clockDay(245);
    var transfers = [
      { id: 'diwan.iqta.s1', from: 'ssgsv5zbd2', to: 'amaro.citadel', goods: { grain: 45000, cheese: 6000, wool: 4000, blades: 40, armour: 20 }, first: iqtaDay, every: 365 },
      { id: 'diwan.iqta.s2', from: 'sm.betun-babu', to: 'amaro.citadel', goods: { grain: 18000, charcoal: 10000, brass: 1200, tin: 1000 }, first: iqtaDay, every: 365 },
      { id: 'diwan.iqta.s3', from: 'sm.suton-qappu', to: 'amaro.citadel', goods: { grain: 14000, tools: 800, stoneware: 2000 }, first: iqtaDay, every: 365 },
      { id: 'diwan.iqta.s4', from: 'srbp1bvh1r', to: 'amaro.citadel', goods: { grain: 22000, cheese: 8000, wool: 8000, mounts: 24 }, first: iqtaDay, every: 365 },
      { id: 'diwan.iqta.s5', from: 'sm.yamu-qappu', to: 'amaro.citadel', goods: { fish: 6000, brass: 1200 }, first: iqtaDay, every: 365 },
      { id: 'diwan.iqta.s6', from: 'sm.urudiru-qappu', to: 'amaro.citadel', goods: { brass: 1500 }, first: iqtaDay, every: 365 },
      /* Spring Ordeal graduation (`window: 'graduation'` [50,60]): notched blades from the Hall of Blades to surviving -ko -> -šu initiates */
      { id: 'ordeal.graduation.blades', from: 'amaro.necropolis', to: 'sm.urudiru-qappu', goods: { blades: 48 }, season: 'graduation' }
    ];

    var factions = [
      { id: 'shumar', name: 'The Kingdom of Shumar (the Six Regiments of the Šubaru-šu)' },
      { id: 'gate', name: 'Outlander Caravans (-no factors: Dalab, Free Giants, Talovolci, Iziz & Longsong)' },
      { id: 'voth', name: 'The Vothic Kingdom (cold-truce border market at Suṭōn-Qappu)' }
    ];
    var relations = [
      { a: 'shumar', b: 'gate', stance: 'friendly' },
      { a: 'gate', b: 'shumar', stance: 'friendly' },
      { a: 'shumar', b: 'voth', stance: 'wary' },
      { a: 'voth', b: 'shumar', stance: 'wary' },
      { a: 'gate', b: 'voth', stance: 'wary' },
      { a: 'voth', b: 'gate', stance: 'wary' }
    ];

    return {
      seed: 20261118,
      scale: KSeat,
      start: 0,
      calendar: T.calendar,
      goods: T.goods,
      factions: factions,
      relations: relations,
      settlements: S,
      roads: R,
      transfers: transfers
    };
  };

  return T;
})();

if (typeof module !== 'undefined') module.exports = SHUMAR_TUNE;
