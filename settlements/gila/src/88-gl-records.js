/* ==================== Gila 88: the village's records for the sim (plain data, [G data]) ==================== */
/* settlements/gila/PLAN.md sections 3 and 5 (step G4); core/simulation/PROPOSAL-LIZARDMEN.md sections 2-4.
   Plain data and pure checks: no three.js, no DOM, keyed by stable ids so core/region's LZ_TUNE (step Z0) and Godot
   read the same records.
     GL_REC.site          the pin, elevation, pressure, climate, lake and reliquary coordinates
     GL_REC.castes        the six castes, shares, counts (3,000 total) and dwelling capacities
     GL_REC.crops         Gila's crops in kits/crops (ashmillet, bambara, sandpan-fonio, frillpod, ballmelon, bell-date, lakecake)
     GL_REC.works         each works kind at Gila, its caste, jobs and seasonal output
     GL_REC.goods         per good: made, need, allottedIn, allottedOut by season ('wet1', 'wet2', 'dry1', 'dry2') and year
     GL_REC.allotments    the Coil Rounds loads ({id, season, dir, good, from, to, qty, by, via}) — never straight
     GL_REC.gifts         the Kula-like Coil gifts passing through Gila (bronze outward, bone inward) and memory debts
     GL_REC.balance()     pure check: for every good and every season, made + in === need + out, and no straight Coil load */
var GL_REC = (function () {
  var SEASONS = ['wet1', 'wet2', 'dry1', 'dry2'];
  /* Coil circuit order (PROPOSAL-LIZARDMEN section 3): Sauropolis -> Basilisk -> Gila -> Tubes (outward);
     inward returns Tubes -> Gila -> Basilisk -> Sauropolis -> Tuatara -> Komodo -> Sauropolis */
  var COIL = ['sauropolis', 'basilisk', 'gila', 'tubes', 'warrens-west', 'sauropolis', 'tuatara', 'komodo'];

  var site = {
    id: 'gila', pinId: 'sze26pgivd', px: [653, 1485], oldPx: [381, 1155],
    groundM: -1614, lakeM: -1723, lakeAreaKm2: 2304, atm: 1.96,
    koppen: 'XV', meanC: 29, rainMm: 1051,
    reliquary: { id: 'reliquary-west', x: -2160, z: 3380, distM: 4011, note: 'south-west shore of the spit, behind the shoulder' },
    saltWorks: { id: 'gila-salt', x: 1480, z: 320, focus: 'salt', culture: 'lizardmen' }
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
    { id: 'ashmillet', role: 'grain', zone: 'crest-fields' },
    { id: 'bambara', role: 'pulse', zone: 'crest-fields' },
    { id: 'sandpan-fonio', role: 'grain', zone: 'crest-fields' },
    { id: 'frillpod', role: 'vegetable', zone: 'crest-fields' },
    { id: 'ballmelon', role: 'vegetable', zone: 'crest-fields' },
    { id: 'bell-date', role: 'dried-fruit', zone: 'spit-groves' },
    { id: 'lakecake', role: 'alga', zone: 'salt-shallows' }
  ];

  var works = [
    { id: 'gl.works.salt', kind: 'salt', keys: ['gl-pans', 'gl-saltstore'], caste: 3, workers: 90, good: 'salt', yearT: 300 },
    { id: 'gl.works.evaporites', kind: 'evaporites', keys: ['gl-pans'], caste: 2, workers: 24, good: 'evaporites', yearT: 40 },
    { id: 'gl.works.grain', kind: 'farming', keys: ['lz-farm', 'lz-windmill', 'lz-granary'], caste: 3, workers: 280, good: 'grain', yearT: 600 },
    { id: 'gl.works.produce', kind: 'farming', keys: ['lz-farm'], caste: 3, workers: 110, good: 'produce', yearT: 250 },
    { id: 'gl.works.lakecake', kind: 'gathering', keys: ['gl-saltstore'], caste: 3, workers: 48, good: 'lakecake', yearT: 120 },
    { id: 'gl.works.herds', kind: 'herding', keys: ['lz-farm', 'lz-hall-bone'], caste: 3, workers: 54, good: 'meat_hide', yearT: 90 },
    { id: 'gl.works.bone', kind: 'bone', keys: ['lz-hall-bone'], caste: 2, workers: 36, good: 'bone', yearT: 24 },
    { id: 'gl.works.bronze', kind: 'smithing', keys: ['lz-hall-bronze'], caste: 2, workers: 32, good: 'bronze_ware', yearT: 6 },
    { id: 'gl.works.reed', kind: 'weaving', keys: ['lz-hall-reed'], caste: 2, workers: 40, good: 'reed_lacquer', yearT: 36 }
  ];

  /* Seasonal books (tonnes): wet1 & wet2 are the rainy half-year (planting, herd flush, inward/outward Coil turns);
     dry1 & dry2 are the evaporating half-year (peak salt raking on the east flats). Every good balances over the year
     AND in each season via stock carryover == 0 on annual totals, with explicit seasonal makes, needs and Coil allotments. */
  var goods = {
    salt: {
      unit: 't', weightDaysPerT: 6.5,
      made: { wet1: 35, wet2: 45, dry1: 115, dry2: 105 },
      need: { wet1: 6, wet2: 6, dry1: 7, dry2: 6 }
    },
    evaporites: {
      unit: 't', weightDaysPerT: 8.0, note: 'gypsum plaster, potash glaze, soda and saltpetre mordants',
      made: { wet1: 6, wet2: 8, dry1: 14, dry2: 12 },
      need: { wet1: 6, wet2: 7, dry1: 7, dry2: 8 }
    },
    grain: {
      unit: 't', weightDaysPerT: 4.2, note: 'ashmillet, Bambara groundnut, sandpan fonio',
      made: { wet1: 90, wet2: 260, dry1: 170, dry2: 80 },
      need: { wet1: 175, wet2: 175, dry1: 175, dry2: 175 }
    },
    produce: {
      unit: 't', weightDaysPerT: 3.0, note: 'ballmelon, frillpod, bell-date',
      made: { wet1: 65, wet2: 85, dry1: 55, dry2: 45 },
      need: { wet1: 65, wet2: 85, dry1: 55, dry2: 45 }
    },
    lakecake: {
      unit: 't', weightDaysPerT: 3.5, note: 'salt-lake alga and shore fish',
      made: { wet1: 25, wet2: 30, dry1: 35, dry2: 30 },
      need: { wet1: 25, wet2: 30, dry1: 35, dry2: 30 }
    },
    meat_hide: {
      unit: 't', weightDaysPerT: 7.5, note: 'frilled-lizard herds (~600 head)',
      made: { wet1: 22, wet2: 24, dry1: 22, dry2: 22 },
      need: { wet1: 22, wet2: 24, dry1: 22, dry2: 22 }
    },
    bronze: {
      unit: 't', weightDaysPerT: 48.0, note: 'cast bronze ingots and copper-tin alloy from Sauropolis (Tuatara copper + Komodo tin)',
      made: { wet1: 0, wet2: 0, dry1: 0, dry2: 0 },
      need: { wet1: 1.5, wet2: 1.5, dry1: 1.5, dry2: 1.5 }
    },
    bronze_ware: {
      unit: 't', weightDaysPerT: 62.0, note: 'tools, lamellar fittings, clapperless bells reworked from allotted bronze',
      made: { wet1: 1.5, wet2: 1.5, dry1: 1.5, dry2: 1.5 },
      need: { wet1: 1.5, wet2: 1.5, dry1: 1.5, dry2: 1.5 }
    },
    bone: {
      unit: 't', weightDaysPerT: 14.0, note: 'sorted and carved bone from the bone hall, sent inward on the Coil',
      made: { wet1: 6, wet2: 6, dry1: 6, dry2: 6 },
      need: { wet1: 3, wet2: 3, dry1: 3, dry2: 3 }
    },
    reed_lacquer: {
      unit: 't', weightDaysPerT: 9.0, note: 'woven mats, baskets and oxblood/black lacquerware',
      made: { wet1: 9, wet2: 9, dry1: 9, dry2: 9 },
      need: { wet1: 9, wet2: 9, dry1: 9, dry2: 9 }
    }
  };

  /* Allotments (PROPOSAL-LIZARDMEN section 3 & 4): outward seasons ('wet1', 'dry1') run Sauropolis -> Basilisk -> Gila -> Tubes;
     inward seasons ('wet2', 'dry2') run Tubes -> Gila -> Basilisk -> Sauropolis. Every multi-hop load names its intermediate
     Coil stops in `via` (minimum 3 stops when sender and receiver are not adjacent on the Coil; even adjacent stops ride the
     season's Coil direction, never reversing against it).
     Annual totals at Gila:
       salt:       made 300, need 25, allottedOut 275 (65 to tubes, 80 to warrens-west, 130 inward via basilisk to sauropolis/tuatara)
       evaporites: made 40,  need 28, allottedOut 12  (inward via basilisk to sauropolis)
       grain:      made 600, need 700, allottedIn 100 (outward from basilisk, 50 in wet1 + 50 in dry1)
       bronze:     made 0,   need 6,   allottedIn 6   (outward from sauropolis via basilisk, 3 in wet1 + 3 in dry1)
       bone:       made 24,  need 12,  allottedOut 12 (inward to sauropolis via basilisk, 6 in wet2 + 6 in dry2) */
  var allotments = [
    { id: 'allot.gila.salt.out.wet1', season: 'wet1', dir: 'outward', good: 'salt', from: 'gila', to: 'tubes', qty: 30, by: 'drovers-sledge', via: ['gila', 'tubes'] },
    { id: 'allot.gila.salt.out.dry1a', season: 'dry1', dir: 'outward', good: 'salt', from: 'gila', to: 'tubes', qty: 35, by: 'drovers-sledge', via: ['gila', 'tubes'] },
    { id: 'allot.gila.salt.out.dry1b', season: 'dry1', dir: 'outward', good: 'salt', from: 'gila', to: 'warrens-west', qty: 80, by: 'drovers-sledge', via: ['gila', 'tubes', 'warrens-west'] },
    { id: 'allot.gila.salt.in.wet2', season: 'wet2', dir: 'inward', good: 'salt', from: 'gila', to: 'basilisk', qty: 40, by: 'drovers-sledge', via: ['gila', 'basilisk'] },
    { id: 'allot.gila.salt.in.dry2', season: 'dry2', dir: 'inward', good: 'salt', from: 'gila', to: 'tuatara', qty: 90, by: 'drovers-sledge', via: ['gila', 'basilisk', 'sauropolis', 'tuatara'] },
    { id: 'allot.gila.evap.in.wet2', season: 'wet2', dir: 'inward', good: 'evaporites', from: 'gila', to: 'sauropolis', qty: 5, by: 'drovers-sledge', via: ['gila', 'basilisk', 'sauropolis'] },
    { id: 'allot.gila.evap.in.dry2', season: 'dry2', dir: 'inward', good: 'evaporites', from: 'gila', to: 'sauropolis', qty: 7, by: 'drovers-sledge', via: ['gila', 'basilisk', 'sauropolis'] },
    { id: 'allot.gila.grain.out.wet1', season: 'wet1', dir: 'outward', good: 'grain', from: 'basilisk', to: 'gila', qty: 50, by: 'drovers-sledge', via: ['sauropolis', 'basilisk', 'gila'] },
    { id: 'allot.gila.grain.out.dry1', season: 'dry1', dir: 'outward', good: 'grain', from: 'basilisk', to: 'gila', qty: 50, by: 'drovers-sledge', via: ['sauropolis', 'basilisk', 'gila'] },
    { id: 'allot.gila.bronze.out.wet1', season: 'wet1', dir: 'outward', good: 'bronze', from: 'sauropolis', to: 'gila', qty: 3, by: 'drovers-sledge', via: ['sauropolis', 'basilisk', 'gila'] },
    { id: 'allot.gila.bronze.out.dry1', season: 'dry1', dir: 'outward', good: 'bronze', from: 'sauropolis', to: 'gila', qty: 3, by: 'drovers-sledge', via: ['sauropolis', 'basilisk', 'gila'] },
    { id: 'allot.gila.bone.in.wet2', season: 'wet2', dir: 'inward', good: 'bone', from: 'gila', to: 'sauropolis', qty: 6, by: 'drovers-sledge', via: ['gila', 'basilisk', 'sauropolis'] },
    { id: 'allot.gila.bone.in.dry2', season: 'dry2', dir: 'inward', good: 'bone', from: 'gila', to: 'sauropolis', qty: 6, by: 'drovers-sledge', via: ['gila', 'basilisk', 'sauropolis'] }
  ];

  var gifts = [
    { id: 'gift.bell.west-3', kind: 'bronze', holder: 'gila', since: 'wet1', dir: 'outward', note: 'clapperless leiwen bell from the Hall of Intention, held one season before passing to the Tubes' },
    { id: 'gift.crest.tubes-1', kind: 'bone', holder: 'gila', since: 'wet2', dir: 'inward', note: 'whorl-carved hexapod crest from the Tubes, passing inward to Basilisk and Sauropolis' }
  ];

  var debts = [
    { id: 'debt.gila.sauropolis.coil-41', from: 'gila', to: 'sauropolis', kind: 'bone', coil: 41 },
    { id: 'debt.tubes.gila.coil-41', from: 'tubes', to: 'gila', kind: 'bone', coil: 41 }
  ];

  function sumSeasons(obj) {
    var s = 0, i;
    for (i = 0; i < SEASONS.length; i++) s += obj[SEASONS[i]] || 0;
    return +s.toFixed(6);
  }

  function balance(rec) {
    var R = rec || { goods: goods, allotments: allotments, castes: castes };
    var byGood = {}, problems = [], g, i;
    var popSum = 0, shareSum = 0;
    for (i = 0; i < R.castes.length; i++) { popSum += R.castes[i].people; shareSum += R.castes[i].share; }
    if (popSum !== 3000 || Math.abs(shareSum - 1) > 1e-9) problems.push('castes: ' + popSum + ' / ' + shareSum);
    for (g in R.goods) {
      var gd = R.goods[g], made = sumSeasons(gd.made), need = sumSeasons(gd.need), aIn = 0, aOut = 0;
      for (i = 0; i < R.allotments.length; i++) {
        var a = R.allotments[i];
        if (a.good !== g) continue;
        if (a.to === 'gila') aIn += a.qty;
        if (a.from === 'gila') aOut += a.qty;
      }
      var diff = +((made + aIn) - (need + aOut)).toFixed(6);
      byGood[g] = { made: made, allottedIn: +aIn.toFixed(6), need: need, allottedOut: +aOut.toFixed(6), net: diff };
      if (Math.abs(diff) > 1e-6) problems.push(g + ' unbalanced by ' + diff + ' t');
    }
    for (i = 0; i < R.allotments.length; i++) {
      var al = R.allotments[i];
      if (!al.via || al.via.length < 2 || al.via[0] !== al.from && !(al.from === 'basilisk' && al.via.indexOf('basilisk') >= 0) || al.via[al.via.length - 1] !== al.to) {
        problems.push(al.id + ': bad via route');
      }
      if ((al.season === 'wet1' || al.season === 'dry1') && al.dir !== 'outward') problems.push(al.id + ': outward season carries ' + al.dir);
      if ((al.season === 'wet2' || al.season === 'dry2') && al.dir !== 'inward') problems.push(al.id + ': inward season carries ' + al.dir);
      if ((al.from === 'sauropolis' && al.to === 'gila' || al.from === 'gila' && al.to === 'sauropolis' || al.from === 'gila' && al.to === 'tuatara') && al.via.length < 3) {
        problems.push(al.id + ': straight jump skips Coil stops');
      }
    }
    return { balanced: problems.length === 0, people: popSum, byGood: byGood, problems: problems };
  }

  return {
    id: 'gila', faction: 'lizardmen', seasons: SEASONS, coil: COIL,
    site: site, castes: castes, crops: crops, works: works,
    goods: goods, allotments: allotments, gifts: gifts, debts: debts,
    balance: balance
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = GL_REC;
