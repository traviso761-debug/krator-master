/* ==================== Iguana 80: the granary town's records for the sim (plain data, [G data]) ==================== */
/* settlements/iguana/PLAN.md sections 3 and 5; core/region/data/lz-tune.js (LZ_TUNE.byKey('iguana') and LZ_TUNE.checkTown).
   Plain data: no three.js, no DOM, keyed by stable ids so core/region's LZ_TUNE and Godot read the same records.
     IG_REC.key        'iguana' (matches LZ_TUNE.places)
     IG_REC.site       proposed pin 5.1 px 713,1569 (-373 m, 0.3 % slope), 14.6 km west of the Pile (Loj Nahn)
     IG_REC.castes     the six castes summing to 3,000 (Drovers 40 %, shares summing to 1.0)
     IG_REC.crops      Iguana's four plateau crops in kits/crops (rice, helix-bean, sweet-potato, ashroot)
     IG_REC.works      the five goods LZ_TUNE's Iguana makes a year (grain 2,600 t, produce 250 t, meat_hide 210 t, tin 8 t, relics 1.5 t) */
var IG_REC = (function () {
  var SEASONS = ['wet1', 'wet2', 'dry1', 'dry2'];

  var site = {
    id: 'iguana', pinId: null, px: [713, 1569],
    groundM: -373, slopePct: 0.3, atm: 1.68, koppen: 'Af', meanC: 23, rainMm: 1992,
    water: 'brick wells, gl-tank, and Muckle Weyt Beck (r202, perennial, 22.0 m3/s) 5.4 km NW',
    pileWatch: { target: 'Loj Nahn (the Pile)', distKm: 14.6, bearingDeg: 74, lookouts: 3 },
    reliquary: { id: 'reliquary-east', px: [790, 1578], distM: 155048, bearingDeg: 96.7 },
    greatGranary: { halls: 27, at: [-1250, 0], capacityT: 2700 },
    outwork: { id: 'iguana.farm', focus: 'farming', culture: 'lizardmen', at: [-3000, 1400] },
    tinPlacer: { id: 'iguana.placer', focus: 'mine', culture: 'lizardmen', river: 'r202', riverName: 'Muckle Weyt Beck', geoNode: 'res:placer-tin:r202:5', geoPx: [700.6, 1563.8], at: [-4460, -2320], sluicesAt: [-4786, -2422] }
  };

  var castes = [
    { caste: 1, id: 'tenders', name: 'Tenders', heightM: 1.22, share: 0.22, people: 660, dwelling: 'lz-warren', holds: 28 },
    { caste: 2, id: 'makers', name: 'Makers', heightM: 1.53, share: 0.15, people: 450, dwelling: 'lz-makers', holds: 10, hallHolds: 12 },
    { caste: 3, id: 'drovers', name: 'Drovers', heightM: 1.92, share: 0.40, people: 1200, dwelling: 'lz-longhouse', holds: 33 },
    { caste: 4, id: 'warriors', name: 'Line warriors', heightM: 2.41, share: 0.10, people: 300, dwelling: 'lz-lodge', holds: 30, sharedWith: 6 },
    { caste: 5, id: 'interpreters', name: 'Interpreters', heightM: 3.03, share: 0.03, people: 90, dwelling: 'lz-tower', holds: 7 },
    { caste: 6, id: 'bulwarks', name: 'Bulwarks', heightM: 3.80, share: 0.10, people: 300, dwelling: 'lz-lodge', holds: 30, sharedWith: 4 }
  ];

  var crops = [
    { id: 'rice', role: 'grain', zone: 'west-plateau-paddies' },
    { id: 'helix-bean', role: 'pulse', zone: 'west-plateau-fields' },
    { id: 'sweet-potato', role: 'tuber', zone: 'west-plateau-fields' },
    { id: 'ashroot', role: 'tuber', zone: 'west-plateau-fields' }
  ];

  /* Exact annual makes held by LZ_TUNE.checkTown: grain 2,600 t, produce 250 t, meat_hide 210 t, tin 8 t, relics 1.5 t */
  var works = [
    { id: 'ig.works.grain', kind: 'farming', keys: ['lz-granary', 'lz-farm', 'lz-windmill', 'lz-bakehouse'], caste: 3, workers: 640, good: 'grain', yearT: 2600 },
    { id: 'ig.works.produce', kind: 'farming', keys: ['lz-farm', 'lz-orchard', 'lz-fermentery'], caste: 3, workers: 110, good: 'produce', yearT: 250 },
    { id: 'ig.works.herds', kind: 'herding', keys: ['lz-farm', 'lz-hall-bone'], caste: 3, workers: 110, good: 'meat_hide', yearT: 210 },
    { id: 'ig.works.tin', kind: 'placer', keys: ['lz-placer', 'lz-mine'], caste: 2, workers: 56, good: 'tin', yearT: 8 },
    { id: 'ig.works.relics', kind: 'gleaning', keys: ['lz-warehouse', 'lz-lookout'], caste: 4, workers: 36, good: 'relics', yearT: 1.5 }
  ];

  var crafts = [
    { id: 'ig.craft.smiths', kind: 'smithing', keys: ['lz-hall-bronze'], caste: 2, workers: 36, batch: 'rework', bronzeWareT: 6 },
    { id: 'ig.craft.reed', kind: 'weaving', keys: ['lz-hall-reed'], caste: 2, workers: 36, note: 'mats, grain sacks, baskets and lacquerware' },
    { id: 'ig.craft.bone', kind: 'bone', keys: ['lz-hall-bone'], caste: 2, workers: 36, note: 'butchery, hides and sorted bone stock' },
    { id: 'ig.craft.relicstore', kind: 'warehouse', keys: ['lz-warehouse'], caste: 1, workers: 14, note: 'relics gleaned at night from the Pile\'s lower levels, sorted along a spiral before riding to the east reliquary' }
  ];

  var goods = {
    grain: { unit: 't', yearMadeT: 2600, yearNeedT: 700, allotOutT: 1900, to: ['basilisk', 'gila'] },
    produce: { unit: 't', yearMadeT: 250, yearNeedT: 250, allotOutT: 0 },
    meat_hide: { unit: 't', yearMadeT: 210, yearNeedT: 210, allotOutT: 0 },
    tin: { unit: 't', yearMadeT: 8, yearNeedT: 0, allotOutT: 8, to: ['basilisk'] },
    relics: { unit: 't', yearMadeT: 1.5, yearNeedT: 0, allotOutT: 1.5, sink: 'reliquary-east' },
    salt: { unit: 't', yearMadeT: 0, yearNeedT: 25, allotInT: 25, from: ['skink', 'gila'] },
    bronze: { unit: 't', yearMadeT: 0, yearNeedT: 6, allotInT: 6, from: ['basilisk'] }
  };

  return {
    key: 'iguana', name: 'Iguana', seasons: SEASONS, coilLoop: 'west',
    site: site, castes: castes, crops: crops, works: works, crafts: crafts, goods: goods
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = IG_REC;
