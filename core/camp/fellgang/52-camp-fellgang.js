/* ==================== core/camp 52 (opt-in): Traveller, Kradz and Fellgang band rows (plain data, [G data]) ==================== */
/* WEST-RIFT-SCOPE.md section 3b & 3d; kits/tungang/PLAN.md section 3.3. OPT-IN: sits in core/camp/fellgang/ so no unrelated
   openworld or biome page changes bytes unless its build lists this file after 10-camp-cultures.js (and 50-camp-outlaw.js
   when using fellgang-band with KCAMP.outlawCamp). Registers at load:
     KCAMP.CULTURES.traveller         surface road Travellers (~650 across the West Rift; wintering in family vardo circles
                                      such as Blakhed's Winterings, halting places on the lantern road, and Line portal gaps)
     KCAMP.CULTURES['traveller-kradz'] the Kradz dark-clan (~100; wintering at the western Hearth vent caves and rigging the
                                      hidden shafts to Loj Twenny and the Line)
     KCAMP.CULTURES['fellgang-band']  war-camp and summer hunting / Wildcat raiding band row (band [25, 60], compatible with
                                      50-camp-outlaw.js KCAMP.outlawCamp and KCAMP.lookout over wr.road.ice and dalab.road) */
(function () {
  'use strict';
  if (typeof KCAMP === 'undefined' || !KCAMP.CULTURES) throw new Error('core/camp/fellgang: load core/camp 10 first');

  var PENDING = {
    'fg-wagon': {w: 2.6, d: 6, h: 3.3, what: 'a painted Traveller bow-top or Reading vardo'},
    'fg-bender': {w: 4.4, d: 3.6, h: 2.2, what: 'a hazel-rod and tarpaulin bender tent'},
    'fg-halt': {w: 4.2, d: 3.2, h: 2.3, what: 'a low hide-and-plate road shelter on bell-fir poles'},
    'fg-tinsmith': {w: 6.2, d: 4.6, h: 2.9, what: 'a tinsmith and salvage-mending work pitch'},
    'fg-ropehouse': {w: 20, d: 5, h: 4, what: 'a shaft-rope walk and splicing shed'},
    'fg-store': {w: 8, d: 6, h: 4.5, what: 'a stone-and-plate tally or loot cache store'},
    'fg-smithy': {w: 11, d: 8, h: 5, what: 'a salvage-smithy'},
    'fg-headhouse': {w: 13, d: 8, h: 5.8, what: 'a band leader\'s turf house or pavilion'},
    'fg-pens': {w: 14, d: 12, h: 1.4, what: 'hurdle and drystone beast pens'}
  };

  KCAMP.CULTURES.traveller = {
    kind: function (k) {
      if (k === 'fg-wagon-chief') return 'chief';
      if (k === 'fg-wagon') return 'dwelling';
      if (k === 'fg-bender' || k === 'fg-halt') return 'sleep';
      if (k === 'fg-tinsmith') return 'trade';
      if (k === 'fg-pens') return 'pen';
      return null;
    },
    households: {'fg-wagon-chief': 1, 'fg-wagon': 1},
    household: [5, 7], chiefHousehold: [6, 8], sleepers: [3, 5],
    work: {'fg-tinsmith': {role: 'smith', n: 2}, 'fg-pens': {role: 'herder', n: 2}},
    elderShare: 0.4, mountsPer: 0.9, wind: [0.65, 0.76], formation: 'horseshoe',
    pending: Object.assign({'fg-wagon-chief': PENDING['fg-wagon']}, PENDING)
  };

  KCAMP.CULTURES['traveller-kradz'] = {
    kind: function (k) {
      if (k === 'fg-wagon-chief') return 'chief';
      if (k === 'fg-wagon') return 'dwelling';
      if (k === 'fg-halt' || k === 'fg-bender') return 'sleep';
      if (k === 'fg-store') return 'council';
      if (k === 'fg-ropehouse' || k === 'fg-tinsmith') return 'trade';
      if (k === 'fg-pens') return 'pen';
      return null;
    },
    households: {'fg-wagon-chief': 1, 'fg-wagon': 1},
    household: [4, 6], chiefHousehold: [5, 7], sleepers: [3, 5],
    work: {
      'fg-ropehouse': {role: 'rigger', n: 3},
      'fg-tinsmith': {role: 'smith', n: 2},
      'fg-store': {role: 'factor', n: 2},
      'fg-pens': {role: 'herder', n: 2}
    },
    elderShare: 0.35, mountsPer: 0.7, wind: [0.65, 0.76], formation: 'horseshoe',
    pending: Object.assign({'fg-wagon-chief': PENDING['fg-wagon']}, PENDING)
  };

  KCAMP.CULTURES['fellgang-band'] = {
    kind: function (k) {
      if (k === 'fg-halt-chief' || k === 'fg-headhouse') return 'chief';
      if (k === 'fg-wagon') return 'dwelling';
      if (k === 'fg-bender' || k === 'fg-halt') return 'sleep';
      if (k === 'fg-store') return 'council';
      if (k === 'fg-tinsmith' || k === 'fg-smithy') return 'trade';
      if (k === 'fg-pens') return 'pen';
      return null;
    },
    households: {'fg-halt-chief': 1, 'fg-headhouse': 1, 'fg-wagon': 1},
    household: [4, 6], chiefHousehold: [5, 8], sleepers: [3, 5],
    work: {
      'fg-store': {role: 'quartermaster', n: 1},
      'fg-tinsmith': {role: 'smith', n: 1},
      'fg-smithy': {role: 'smith', n: 2},
      'fg-pens': {role: 'herder', n: 2}
    },
    elderShare: 0.12, mountsPer: 0.75, wind: [0.65, 0.76], formation: 'ring',
    band: [25, 60], idle: [['raider', 0.65], ['hunter', 0.35]],
    program: {
      tents: [
        {key: 'fg-halt-chief', n: 1},
        {key: 'fg-wagon', n: 4},
        {key: 'fg-bender', n: 5},
        {key: 'fg-halt', n: 4},
        {key: 'fg-store', n: 1},
        {key: 'fg-tinsmith', n: 1}
      ],
      pens: [{key: 'fg-pens', n: 1}]
    },
    pending: Object.assign({'fg-halt-chief': {w: 5.4, d: 4.2, h: 2.8, what: 'the band leader\'s hide-and-plate shelter'}}, PENDING)
  };
})();
