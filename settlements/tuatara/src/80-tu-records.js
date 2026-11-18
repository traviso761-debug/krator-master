/* ==================== Tuatara 80: the copper town's records for the sim (plain data, [G data]) ==================== */
/* settlements/tuatara/PLAN.md sections 3 and 5; core/region/data/lz-tune.js (LZ_TUNE.byKey('tuatara') and LZ_TUNE.checkTown).
   Plain data: no three.js, no DOM, keyed by stable ids so core/region's LZ_TUNE and Godot read the same records.
     TU_REC.key        'tuatara' (matches LZ_TUNE.places)
     TU_REC.site       the pin (5.1 px 818,1554, -1,704 m), climate, east reliquary bearing and copper diggings outwork
     TU_REC.castes     the six castes summing to 3,000 (shares summing to 1.0)
     TU_REC.crops      Tuatara's four savanna crops in kits/crops (ashmillet, sandpan-fonio, bambara, frillpod)
     TU_REC.works      the four goods LZ_TUNE's Tuatara makes a year (grain 1,000 t, produce 250 t, meat_hide 210 t, copper 70 t)
     TU_REC.crafts     local village crafts, allotted bronze rework, plunder store and raiding war band */
var TU_REC = (function () {
  var SEASONS = ['wet1', 'wet2', 'dry1', 'dry2'];

  var site = {
    id: 'tuatara', pinId: 'szv27b2reu', px: [818, 1554],
    groundM: -1704, atm: 1.98, koppen: 'XV', meanC: 29, rainMm: 1020,
    water: 'wells, gl-tank and seven sunken lz-cisterns (no perennial surface water within 40 km; Neet Gill wadi 10 km)',
    reliquary: { id: 'reliquary-east', px: [790, 1578], distM: 73756, bearingDeg: 229.4 },
    diggings: { id: 'tuatara.diggings', focus: 'mine', culture: 'lizardmen', nodesWithin6km: 5 }
  };

  var castes = [
    { caste: 1, id: 'tenders', name: 'Tenders', heightM: 1.22, share: 0.22, people: 660, dwelling: 'lz-warren', holds: 28 },
    { caste: 2, id: 'makers', name: 'Makers', heightM: 1.53, share: 0.20, people: 600, dwelling: 'lz-makers', holds: 10, hallHolds: 12 },
    { caste: 3, id: 'drovers', name: 'Drovers', heightM: 1.92, share: 0.28, people: 840, dwelling: 'lz-longhouse', holds: 33 },
    { caste: 4, id: 'warriors', name: 'Line warriors', heightM: 2.41, share: 0.17, people: 510, dwelling: 'lz-lodge', holds: 30, sharedWith: 6 },
    { caste: 5, id: 'interpreters', name: 'Interpreters', heightM: 3.03, share: 0.03, people: 90, dwelling: 'lz-tower', holds: 7 },
    { caste: 6, id: 'bulwarks', name: 'Bulwarks', heightM: 3.80, share: 0.10, people: 300, dwelling: 'lz-lodge', holds: 30, sharedWith: 4 }
  ];

  var crops = [
    { id: 'ashmillet', role: 'grain', zone: 'south-savanna-fields' },
    { id: 'sandpan-fonio', role: 'grain', zone: 'south-savanna-fields' },
    { id: 'bambara', role: 'pulse', zone: 'south-savanna-fields' },
    { id: 'frillpod', role: 'vegetable', zone: 'south-savanna-fields' }
  ];

  /* Exact annual makes held by LZ_TUNE.checkTown: grain 1,000 t, produce 250 t, meat_hide 210 t, copper 98 t */
  var works = [
    { id: 'tu.works.grain', kind: 'farming', keys: ['lz-farm', 'lz-windmill', 'lz-granary', 'lz-bakehouse'], caste: 3, workers: 420, good: 'grain', yearT: 1000 },
    { id: 'tu.works.produce', kind: 'farming', keys: ['lz-farm', 'lz-orchard', 'lz-fermentery'], caste: 3, workers: 110, good: 'produce', yearT: 250 },
    { id: 'tu.works.herds', kind: 'herding', keys: ['lz-farm', 'lz-hall-bone'], caste: 3, workers: 110, good: 'meat_hide', yearT: 210 },
    { id: 'tu.works.copper', kind: 'mining', keys: ['lz-mine'], caste: 2, workers: 165, good: 'copper', yearT: 98 }
  ];

  var crafts = [
    { id: 'tu.craft.smiths', kind: 'smithing', keys: ['lz-hall-bronze'], caste: 2, workers: 36, batch: 'rework', bronzeWareT: 6 },
    { id: 'tu.craft.reed', kind: 'weaving', keys: ['lz-hall-reed'], caste: 2, workers: 36, note: 'mats, screens, baskets and lacquerware' },
    { id: 'tu.craft.bone', kind: 'bone', keys: ['lz-hall-bone'], caste: 2, workers: 36, note: 'butchery, hides and sorted bone stock (raid dead included)' },
    { id: 'tu.craft.plunder', kind: 'warehouse', keys: ['lz-warehouse'], caste: 4, workers: 10, note: 'steel tools and arms raided from the Marches, kept unused' }
  ];

  var warband = {
    id: 'tuatara.warband', caste: [4, 6], warriors: 150, arms: 3, mounts: 1,
    musterKey: 'lz-muster', campKeys: ['lc-seer', 'lc-sail', 'lc-hide', 'lc-shield'],
    targets: ['march.w', 'march.s', 'march.e', 'prov.p8']
  };

  var goods = {
    grain: { unit: 't', yearMadeT: 1000, yearNeedT: 700, allotOutT: 300, to: ['basilisk', 'warrens-east'] },
    produce: { unit: 't', yearMadeT: 250, yearNeedT: 250, allotOutT: 0 },
    meat_hide: { unit: 't', yearMadeT: 210, yearNeedT: 210, allotOutT: 0 },
    copper: { unit: 't', yearMadeT: 98, yearNeedT: 0, allotOutT: 98, to: ['basilisk'] },
    salt: { unit: 't', yearMadeT: 0, yearNeedT: 25, allotInT: 25, from: ['basilisk', 'gila'] },
    bronze: { unit: 't', yearMadeT: 0, yearNeedT: 6, allotInT: 6, from: ['basilisk'] }
  };

  return {
    key: 'tuatara', name: 'Tuatara', seasons: SEASONS, coilLoop: 'east',
    site: site, castes: castes, crops: crops, works: works, crafts: crafts, warband: warband, goods: goods
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = TU_REC;
