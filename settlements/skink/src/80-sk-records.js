/* ==================== Skink 80: the salt village's records for the sim (plain data, [G data]) ==================== */
/* settlements/skink/PLAN.md sections 3 and 5; core/region/data/lz-tune.js (LZ_TUNE.byKey('skink') and LZ_TUNE.checkTown).
   Plain data: no three.js, no DOM, keyed by stable ids so core/region's LZ_TUNE and Godot read the same records.
     SK_REC.key        'skink' (matches LZ_TUNE.places)
     SK_REC.site       proposed pin 5.1 px 691,1521 (-1,633 m, halite grade 254 basin floor above the -1,706 m salt lake)
     SK_REC.castes     the six castes summing to 1,500 (shares 22/26/26/14/2/10 %, summing to 1.0)
     SK_REC.crops      Skink's three savanna basin crops in kits/crops (ashmillet, sandpan-fonio, frillpod)
     SK_REC.works      the four goods LZ_TUNE's Skink makes a year (salt 300 t, grain 300 t, produce 125 t, meat_hide 75 t) */
var SK_REC = (function () {
  var SEASONS = ['wet1', 'wet2', 'dry1', 'dry2'];

  var site = {
    id: 'skink', pinId: null, px: [691, 1521],
    groundM: -1633, lakeM: -1706, lakeAreaKm2: 32, haliteGrade: 254,
    atm: 1.96, koppen: 'XV', meanC: 29, rainMm: 1051,
    water: 'brick wells, gl-tank, and the 32 km2 southern salt lake (-1,706 m, 7.5 km SSE)',
    reliquary: { id: 'reliquary-west', px: [651.9, 1486.7], distM: 104025, bearingDeg: 311.3 },
    coilBetween: ['iguana', 'gila'],
    outwork: { id: 'skink.pans', focus: 'salt', culture: 'lizardmen', at: [2520, 7250] }
  };

  var castes = [
    { caste: 1, id: 'tenders', name: 'Tenders', heightM: 1.22, share: 0.22, people: 330, dwelling: 'lz-warren', holds: 28 },
    { caste: 2, id: 'makers', name: 'Makers', heightM: 1.53, share: 0.26, people: 390, dwelling: 'lz-makers', holds: 10, hallHolds: 12 },
    { caste: 3, id: 'drovers', name: 'Drovers', heightM: 1.92, share: 0.26, people: 390, dwelling: 'lz-longhouse', holds: 33 },
    { caste: 4, id: 'warriors', name: 'Line warriors', heightM: 2.41, share: 0.14, people: 210, dwelling: 'lz-lodge', holds: 30, sharedWith: 6 },
    { caste: 5, id: 'interpreters', name: 'Interpreters', heightM: 3.03, share: 0.02, people: 30, dwelling: 'lz-tower', holds: 7 },
    { caste: 6, id: 'bulwarks', name: 'Bulwarks', heightM: 3.80, share: 0.10, people: 150, dwelling: 'lz-lodge', holds: 30, sharedWith: 4 }
  ];

  var crops = [
    { id: 'ashmillet', role: 'grain', zone: 'north-basin-fields' },
    { id: 'sandpan-fonio', role: 'grain', zone: 'north-basin-fields' },
    { id: 'frillpod', role: 'vegetable', zone: 'north-basin-fields' }
  ];

  /* Exact annual makes held by LZ_TUNE.checkTown: salt 300 t (~150 t rock salt + ~150 t pan salt), grain 300 t, produce 125 t, meat_hide 75 t */
  var works = [
    { id: 'sk.works.salt', kind: 'salt', keys: ['lz-mine', 'gl-pans', 'gl-saltstore'], caste: 2, workers: 180, good: 'salt', yearT: 300 },
    { id: 'sk.works.grain', kind: 'farming', keys: ['lz-farm', 'lz-windmill', 'lz-granary', 'lz-bakehouse'], caste: 3, workers: 130, good: 'grain', yearT: 300 },
    { id: 'sk.works.produce', kind: 'farming', keys: ['lz-farm', 'lz-orchard', 'lz-fermentery'], caste: 3, workers: 55, good: 'produce', yearT: 125 },
    { id: 'sk.works.herds', kind: 'herding', keys: ['lz-farm', 'lz-hall-bone'], caste: 3, workers: 42, good: 'meat_hide', yearT: 75 }
  ];

  var crafts = [
    { id: 'sk.craft.smiths', kind: 'smithing', keys: ['lz-hall-bronze'], caste: 2, workers: 20, batch: 'rework', bronzeWareT: 3 },
    { id: 'sk.craft.bone', kind: 'bone', keys: ['lz-hall-bone'], caste: 2, workers: 20, note: 'butchery, hides, salt-rake frames and haul sledges' },
    { id: 'sk.craft.saltstore', kind: 'store', keys: ['gl-saltstore'], caste: 3, workers: 24, note: 'quarried halite blocks and raked lake salt kept dry for the west Coil loop' }
  ];

  var goods = {
    salt: { unit: 't', yearMadeT: 300, yearNeedT: 12.5, allotOutT: 287.5, to: ['iguana', 'warrens-west', 'tubes', 'basilisk'] },
    grain: { unit: 't', yearMadeT: 300, yearNeedT: 350, allotInT: 50, from: ['iguana'] },
    produce: { unit: 't', yearMadeT: 125, yearNeedT: 125, allotOutT: 0 },
    meat_hide: { unit: 't', yearMadeT: 75, yearNeedT: 75, allotOutT: 0 },
    bronze: { unit: 't', yearMadeT: 0, yearNeedT: 3, allotInT: 3, from: ['basilisk'] }
  };

  return {
    key: 'skink', name: 'Skink', seasons: SEASONS, coilLoop: 'west',
    site: site, castes: castes, crops: crops, works: works, crafts: crafts, goods: goods
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = SK_REC;
