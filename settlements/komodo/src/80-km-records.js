/* ==================== Komodo 80: the tin and fishing town's records for the sim (plain data, [G data]) ==================== */
/* settlements/komodo/PLAN.md sections 3 and 5; core/region/data/lz-tune.js (LZ_TUNE.byKey('komodo') and LZ_TUNE.checkTown).
   Plain data: no three.js, no DOM, keyed by stable ids so core/region's LZ_TUNE and Godot read the same records.
     KM_REC.key        'komodo' (matches LZ_TUNE.places)
     KM_REC.site       pin 5.1 px 865,1617 (spnqhezhiw, -2,452 m, 11 % bluff over the eastern terminal sea)
     KM_REC.castes     the six castes summing to 3,000 (Gila's shares: 25/22/25/15/3/10 %, summing to 1.0)
     KM_REC.crops      Komodo's three hypertropic shore crops in kits/crops (bamboo-rice, taro, shade-manioc)
     KM_REC.works      the five goods LZ_TUNE's Komodo makes a year (grain 600 t, produce 250 t, fish 240 t, meat_hide 90 t, tin 8 t) */
var KM_REC = (function () {
  var SEASONS = ['wet1', 'wet2', 'wet3', 'wet4'];

  var site = {
    id: 'komodo', pinId: 'spnqhezhiw', px: [865, 1617],
    groundM: -2452, slopePct: 11.0, atm: 2.17, koppen: 'XA', meanC: 35, rainMm: 4000,
    water: 'the eastern terminal sea (9,272 km2, salt, no tide), brick wells, gl-tank, and Kruk Warra (r088, perennial, 51.3 m3/s) 11.9 km east',
    reliquary: { id: 'reliquary-east', px: [790, 1578], distM: 169068, bearingDeg: 297.5 },
    raids: { warriors: 120, target: 'exp.rift-gold', targetName: 'Golden Tears camp', targetPx: [850, 1628], distKm: 37 },
    outwork: { id: 'komodo.placers', focus: 'mine', culture: 'lizardmen', at: [11360, -2180], river: 'Kruk Warra (r088)' }
  };

  var castes = [
    { caste: 1, id: 'tenders', name: 'Tenders', heightM: 1.22, share: 0.25, people: 750, dwelling: 'lz-warren', holds: 28 },
    { caste: 2, id: 'makers', name: 'Makers', heightM: 1.53, share: 0.22, people: 660, dwelling: 'lz-makers', holds: 10, hallHolds: 12 },
    { caste: 3, id: 'drovers', name: 'Drovers', heightM: 1.92, share: 0.25, people: 750, dwelling: 'lz-longhouse', holds: 33 },
    { caste: 4, id: 'warriors', name: 'Line warriors', heightM: 2.41, share: 0.15, people: 450, dwelling: 'lz-lodge', holds: 30, sharedWith: 6 },
    { caste: 5, id: 'interpreters', name: 'Interpreters', heightM: 3.03, share: 0.03, people: 90, dwelling: 'lz-tower', holds: 7 },
    { caste: 6, id: 'bulwarks', name: 'Bulwarks', heightM: 3.80, share: 0.10, people: 300, dwelling: 'lz-lodge', holds: 30, sharedWith: 4 }
  ];

  var crops = [
    { id: 'bamboo-rice', role: 'grain', zone: 'east-shore-bench' },
    { id: 'taro', role: 'tuber', zone: 'east-shore-bench' },
    { id: 'shade-manioc', role: 'tuber', zone: 'east-shore-bench' }
  ];

  /* Exact annual makes held by LZ_TUNE.checkTown: grain 600 t, produce 250 t, fish 240 t, meat_hide 90 t, tin 8 t */
  var works = [
    { id: 'km.works.grain', kind: 'farming', keys: ['lz-farm', 'lz-windmill', 'lz-granary'], caste: 3, workers: 210, good: 'grain', yearT: 600 },
    { id: 'km.works.produce', kind: 'farming', keys: ['lz-farm'], caste: 3, workers: 95, good: 'produce', yearT: 250 },
    { id: 'km.works.fish', kind: 'fishing', keys: ['lz-weir'], caste: 3, workers: 90, good: 'fish', yearT: 240 },
    { id: 'km.works.herds', kind: 'herding', keys: ['lz-farm', 'lz-hall-bone'], caste: 3, workers: 48, good: 'meat_hide', yearT: 90 },
    { id: 'km.works.tin', kind: 'placer', keys: ['lz-placer'], caste: 2, workers: 90, good: 'tin', yearT: 8 }
  ];

  var crafts = [
    { id: 'km.craft.smiths', kind: 'smithing', keys: ['lz-hall-bronze'], caste: 2, workers: 42, batch: 'rework', bronzeWareT: 6 },
    { id: 'km.craft.reed', kind: 'weaving', keys: ['lz-hall-reed'], caste: 2, workers: 44, note: 'weir screens, fish traps, sluice mats and lacquerware' },
    { id: 'km.craft.bone', kind: 'bone', keys: ['lz-hall-bone'], caste: 2, workers: 38, note: 'fish-splitting racks, sluice riffles, hides and raid bone stock' },
    { id: 'km.craft.plunder', kind: 'warehouse', keys: ['lz-warehouse'], caste: 1, workers: 14, note: 'tin concentrate bound for Basilisk and raided Golden Tears steel kept unused' }
  ];

  var goods = {
    grain: { unit: 't', yearMadeT: 600, yearNeedT: 700, allotInT: 100, from: ['tuatara', 'warrens-east'] },
    produce: { unit: 't', yearMadeT: 250, yearNeedT: 250, allotOutT: 0 },
    fish: { unit: 't', yearMadeT: 240, yearNeedT: 120, allotOutT: 120, to: ['tuatara', 'basilisk'] },
    meat_hide: { unit: 't', yearMadeT: 90, yearNeedT: 90, allotOutT: 0 },
    tin: { unit: 't', yearMadeT: 8, yearNeedT: 0, allotOutT: 8, to: ['basilisk'] },
    salt: { unit: 't', yearMadeT: 0, yearNeedT: 25, allotInT: 25, from: ['basilisk'] },
    bronze: { unit: 't', yearMadeT: 0, yearNeedT: 6, allotInT: 6, from: ['basilisk'] }
  };

  return {
    key: 'komodo', name: 'Komodo', seasons: SEASONS, coilLoop: 'east',
    site: site, castes: castes, crops: crops, works: works, crafts: crafts, goods: goods
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = KM_REC;
