/* ==================== Basilisk 80: the stone capital's records for the sim (plain data, [G data]) ==================== */
/* settlements/basilisk/PLAN.md sections 3, 4 and 5; core/region/data/lz-tune.js (LZ_TUNE.byKey('basilisk') and LZ_TUNE.checkTown).
   Plain data: no three.js, no DOM, keyed by stable ids so core/region's LZ_TUNE and Godot read the same records.
     BS_REC.key        'basilisk' (matches LZ_TUNE.places)
     BS_REC.site       agreed sabkha pin 5.1 px 766.6,1597.25 (-2,600 m sabkha peninsula between the eastern sea and Tlahn Gill's bay)
     BS_REC.castes     the six castes summing to 15,000 (25/25/20/15/5/10 %, summing to 1.0)
     BS_REC.crops      Basilisk's four hypertropic shore crops in kits/crops (bamboo-rice, rice, taro, shade-manioc)
     BS_REC.works      the six goods LZ_TUNE's Basilisk makes a year (grain 1,500 t, produce 1,300 t, fish 600 t, meat_hide 450 t, salt 55 t, bone 48 t) */
var BS_REC = (function () {
  var SEASONS = ['wet1', 'wet2', 'dry1', 'dry2'];

  var site = {
    id: 'basilisk', pinId: 'slrodrkrls', px: [766.6, 1597.25], oldPx: [765, 1596],
    groundM: -2600, seaM: -2600.5, platformM: 5, moundM: 12, slopePct: 0.2, atm: 2.21, koppen: 'XA', meanC: 36, rainMm: 1970,
    water: 'the eastern terminal sea (9,272 km2, salt, no tide, -2,600.5 m), Tlahn Gill (r762, 7.6 m3/s wadi) dammed into a 2.1 km leat and seven Dholavira reservoirs, the Great Tank of the First Turn, district cisterns and 231 brick wells',
    reliquary: { id: 'reliquary-east', px: [790, 1578], distM: 60590, bearingDeg: 50.6 },
    outworks: [
      { id: 'basilisk.salt', focus: 'salt', culture: 'lizardmen', note: 'scaled-back NW strand salt works (3 gl-pans, 2 lk-boil, gl-saltstore: 55 t/yr)' },
      { id: 'basilisk.bay', focus: 'fishing', culture: 'lizardmen', note: 'Lothal dock basin, lk-dockstore, lk-bronzehall, 3 lz-weir and 6 lz-barge reed vessels' }
    ]
  };

  var castes = [
    { caste: 1, id: 'tenders', name: 'Tenders', heightM: 1.22, share: 0.25, people: 3750, dwelling: 'lk-warren', holds: 28 },
    { caste: 2, id: 'makers', name: 'Makers', heightM: 1.53, share: 0.25, people: 3750, dwelling: 'lk-makers', holds: 10, hallHolds: 12 },
    { caste: 3, id: 'drovers', name: 'Drovers', heightM: 1.92, share: 0.20, people: 3000, dwelling: 'lk-longhouse', holds: 33 },
    { caste: 4, id: 'warriors', name: 'Line warriors', heightM: 2.41, share: 0.15, people: 2250, dwelling: 'lk-lodge', holds: 30, sharedWith: 6 },
    { caste: 5, id: 'interpreters', name: 'Interpreters', heightM: 3.03, share: 0.05, people: 750, dwelling: 'lk-tower', holds: 7, collegeHolds: 39 },
    { caste: 6, id: 'bulwarks', name: 'Bulwarks', heightM: 3.80, share: 0.10, people: 1500, dwelling: 'lk-lodge', holds: 30, sharedWith: 4 }
  ];

  var crops = [
    { id: 'bamboo-rice', role: 'grain', zone: 'south-apron-paddies' },
    { id: 'rice', role: 'grain', zone: 'west-apron-paddies' },
    { id: 'taro', role: 'tuber', zone: 'leat-bund-gardens' },
    { id: 'shade-manioc', role: 'tuber', zone: 'sabkha-margin-mounds' }
  ];

  /* Exact annual makes held by LZ_TUNE.checkTown: grain 1,500 t, produce 1,300 t, fish 600 t, meat_hide 450 t, salt 55 t, bone 48 t */
  var works = [
    { id: 'bs.works.grain', kind: 'farming', keys: ['lk-granary', 'lz-bakehouse'], caste: 3, workers: 920, good: 'grain', yearT: 1500 },
    { id: 'bs.works.produce', kind: 'farming', keys: ['lz-fermentery', 'lz-bakehouse'], caste: 3, workers: 580, good: 'produce', yearT: 1300 },
    { id: 'bs.works.fish', kind: 'fishing', keys: ['lz-weir', 'lz-barge', 'lk-dockstore'], caste: 3, workers: 280, good: 'fish', yearT: 600 },
    { id: 'bs.works.herds', kind: 'herding', keys: ['lz-hall-bone', 'lz-wayhalt'], caste: 3, workers: 240, good: 'meat_hide', yearT: 450 },
    { id: 'bs.works.salt', kind: 'salt', keys: ['gl-pans', 'lk-boil', 'gl-saltstore'], caste: 2, workers: 64, good: 'salt', yearT: 55 },
    { id: 'bs.works.bone', kind: 'bone', keys: ['lz-hall-bone'], caste: 2, workers: 76, good: 'bone', yearT: 48 }
  ];

  var crafts = [
    { id: 'bs.craft.bronzehall', kind: 'smelting', keys: ['lk-bronzehall'], caste: 2, workers: 60, batch: 'cast', copperInT: 70, tinInT: 7.8, bronzeOutT: 77.8, note: 'seven reverberatory furnaces on the bay shore casting Tuatara copper with Komodo and Iguana tin nine to one' },
    { id: 'bs.craft.smiths', kind: 'smithing', keys: ['lz-hall-bronze'], caste: 2, workers: 180, batch: 'rework', bronzeWareT: 30, note: 'clapperless bells, nested bronze portal frames, tools and lamellae' },
    { id: 'bs.craft.lacquer', kind: 'weaving', keys: ['lz-hall-reed'], caste: 2, workers: 210, note: 'battery-strand oxblood and black lacquer, waterproofed reed cordage, eleven-rib reed barges' },
    { id: 'bs.craft.dock', kind: 'warehousing', keys: ['lk-dockstore', 'lz-warehouse'], caste: 3, workers: 90, note: 'Lothal dock podium store and Gate Quarter Allotment reserve' }
  ];

  var goods = {
    grain: { unit: 't', yearMadeT: 1500, yearNeedT: 3500, allotInT: 2000, from: ['iguana', 'warrens-e1', 'warrens-w1'] },
    produce: { unit: 't', yearMadeT: 1300, yearNeedT: 1250, allotOutT: 50, to: ['warrens-e4', 'warrens-e1'] },
    fish: { unit: 't', yearMadeT: 600, yearNeedT: 600, allotOutT: 0 },
    meat_hide: { unit: 't', yearMadeT: 450, yearNeedT: 450, allotOutT: 0 },
    salt: { unit: 't', yearMadeT: 55, yearNeedT: 125, allotInT: 70, from: ['skink', 'gila'] },
    bone: { unit: 't', yearMadeT: 48, yearNeedT: 60, allotInT: 12, from: ['gila', 'tuatara', 'komodo'] },
    evaporites: { unit: 't', yearMadeT: 0, yearNeedT: 12, allotInT: 12, from: ['gila'] },
    copper: { unit: 't', yearMadeT: 0, yearNeedT: 70, allotInT: 70, from: ['tuatara'] },
    tin: { unit: 't', yearMadeT: 0, yearNeedT: 7.8, allotInT: 7.8, from: ['komodo', 'iguana'] },
    bronze: { unit: 't', yearMadeT: 77.8, yearNeedT: 30, allotOutT: 47.8, to: ['iguana', 'skink', 'gila', 'tubes', 'tuatara', 'komodo', 'warrens-e1', 'warrens-w1'] }
  };

  return {
    key: 'basilisk', name: 'Basilisk', seasons: SEASONS, coilLoop: 'hub',
    site: site, castes: castes, crops: crops, works: works, crafts: crafts, goods: goods
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = BS_REC;
