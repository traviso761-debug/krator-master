/* ======================== Interior set: Noah's Regret (settlements/noahs-regret) ========================
   The Ancient mid-rises on the top deck of Noah's Regret, the grounded floating arcology of the Ring Sea, as Bloody
   Ruephus's pirates use them: the apartments and offices are BARRACKS, one office is the crew's MESS HALL, and the
   small laboratory (a reduced Reliquary) is RUEPHUS'S HEADQUARTERS. One item per def key of the build's deck buildings
   (settlements/noahs-regret/src/56-nr-anc-apt.js, 58-nr-anc-office.js, 60-nr-anc-lab.js); the mess hall is its own item
   (`nr-anc-office-lens-mess`, like the barracks office).
   Local frame = the builders': origin at the plot centre on the top deck, +z the front (the door side), metres. Each body
   is the GLAZING LINE of the building (the white ribbons, balconies and bookend towers outside it are not planned); the
   ground floor stands on a 0.3 m plinth and every storey is h + 0.25 (the slab) apart, the floors the builders draw.
   Furniture: the pirates live in what the Ancients left and what they took: the post-apoc salvage set (its court tier
   for Ruephus), the scrap set for the crews; the chain ends in generic. The cabins INSIDE the hull are not here: they are
   ring-shaped rooms the build registers itself (its 70-nr-interiors.js), with the room kinds this file adds.

   ROOM KINDS this set adds (data for IX.PROGRAMS; a page that never loads this file never sees them):
     crew      a barracks room: three bunks or more, a locker, a weapon rack; benches and a table if there is room
     bunkroom  a crowded cabin: two bunks and a locker
     mess      the mess hall's room: a servery, tables and benches for a crew, food stores
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const SEATS = IX.SEAT_TYPES, ITEM = IX.ITEM_ROLES, FOOD = IX.FOOD_ROLES, SURFACE = IX.SURFACE_GROUP;
  if (!IX.PROGRAMS.crew) {
    IX.PROGRAMS.crew = { require: [{ need: 'bunks', types: ['bed'], n: 3 }, { need: 'locker', types: ['storage'], roles: ITEM, n: 1 },
                                   { need: 'rack', types: ['rack', 'weapon'], n: 1 }],
      optional: [{ types: ['bed'], max: 5 }, { types: ['storage'], max: 3 }, { types: ['table'], max: 1 }, { types: SEATS, max: 2 },
                 { types: ['lamp'], max: 1 }, { types: ['banner', 'art'], max: 1 }, SURFACE],
      extra: 3.5 };
    IX.PROGRAMS.bunkroom = { require: [{ need: 'bunks', types: ['bed'], n: 2 }, { need: 'locker', types: ['storage'], roles: ITEM, n: 1 }],
      optional: [{ types: ['storage'], max: 1 }, { types: ['rack', 'weapon'], max: 1 }, { types: ['lamp'], max: 1 }, SURFACE],
      extra: 4 };
    IX.PROGRAMS.mess = { require: [{ need: 'servery', types: ['counter'], n: 1 }, { need: 'tables', types: ['table'], n: 2 },
                                   { need: 'seats', types: SEATS, n: 4 }, { need: 'food', types: ['storage', 'vessel', 'stack'], roles: FOOD, n: 1 }],
      optional: [{ types: ['table'], max: 4 }, { types: SEATS, max: 10 }, { types: ['lamp', 'brazier'], max: 2 }, { types: ['storage', 'stack', 'rack'], max: 3 },
                 { types: ['banner', 'art'], max: 2 }, SURFACE],
      extra: 3 };
    IX.KIND_ALIAS.crew = ['barracks', 'dormitory', 'bedroom'];
    IX.KIND_ALIAS.bunkroom = ['barracks', 'dormitory', 'bedroom'];
    IX.KIND_ALIAS.mess = ['tavern', 'hall', 'kitchen', 'barracks'];
    IX.KIND_WEIGHT.crew = 1.6; IX.KIND_WEIGHT.bunkroom = 1.0; IX.KIND_WEIGHT.mess = 2.6;
  }
  const BARRACKS = ['dwelling-multi', 'military'], CIVIC = ['civic', 'military'];
  const PL = 0.3;   /* the plinth: the ground floor's top above the deck */
  IX.sets.add({ set: 'noahs-regret', title: "Noah's Regret: the Ancient mid-rises of the top deck, as Ruephus's pirates use them",
    culture: 'post-apoc', wealth: 0.3, items: [
    { key: 'nr-anc-apt-ribbon', name: 'Ribbon terrace (apartments; barracks)', culture: 'scrap', wealth: 0.25, types: BARRACKS, lot: [36, 16],
      bodies: [{ id: 'block', poly: rect(24, 12.4), y: PL, levels: 6, h: 3.1, wall: 0.25, roof: 'flat',
        doors: [{ at: [0, 6.2], w: 1.6 }, { at: [-7, -6.2], w: 1.2 }],
        program: [['crew', 'store', 'crew'], ['crew', 'crew', 'crew'], ['crew', 'crew', 'crew'], ['crew', 'crew', 'crew'], ['crew', 'crew', 'crew'], ['crew', 'crew']] }],
      note: 'six storeys of apartments between two solid bookend towers (the Ancients\' stairs and lifts, dead; not planned); ' +
        'the ribbon balconies outside the glass are open. The pirates sleep a crew to a room; the ground floor holds their stores' },
    { key: 'nr-anc-apt-drum', name: 'Drum tower (apartments; barracks)', culture: 'scrap', wealth: 0.25, types: BARRACKS, lot: [21, 21],
      bodies: [{ id: 'drum', poly: SH.circle(8.6, 8), y: PL, levels: 8, h: 3.1, wall: 0.25, roof: 'flat',
        doors: [{ at: [0, 7.95], w: 1.4 }],
        program: [['crew', 'store']].concat([1, 2, 3, 4, 5, 6, 7].map(function () { return ['crew', 'crew']; })) }],
      note: 'eight storeys inside a glass drum; the plan is the octagon inscribed in it (the slivers between the octagon\'s ' +
        'flats and the round glass are open floor); the circular ribbon balconies are outside' },
    { key: 'nr-anc-office-lens', name: 'Lens office (offices; barracks)', culture: 'scrap', wealth: 0.25, types: BARRACKS, lot: [30, 19],
      bodies: [{ id: 'office', poly: rect(24, 15), y: PL, levels: 5, h: 3.4, wall: 0.25, roof: 'flat',
        doors: [{ at: [0, 7.5], w: 2.0 }, { at: [6, -7.5], w: 1.2 }],
        program: [['crew', 'store', 'crew'], ['crew', 'crew', 'crew'], ['crew', 'crew', 'crew'], ['crew', 'crew', 'crew'], ['crew', 'crew']] }],
      note: 'five office floors behind the bowed glass and the fins (the bows are outside the plan: open floor); a crew to a room' },
    { key: 'nr-anc-office-lens-mess', name: 'Lens office (the mess hall)', like: 'nr-anc-office-lens', culture: 'post-apoc', wealth: 0.4, types: ['civic', 'tavern', 'military'],
      bodies: [{ id: 'office', poly: rect(24, 15), y: PL, levels: 5, h: 3.4, wall: 0.25, roof: 'flat',
        doors: [{ at: [0, 7.5], w: 2.0 }, { at: [6, -7.5], w: 1.2 }],
        program: [['mess', 'kitchen'], ['mess', 'store'], ['crew', 'crew', 'crew'], ['crew', 'crew', 'crew'], ['crew', 'store']] }],
      residence: true, units: 1,
      note: 'the crew\'s mess: the two lower floors are the mess (the servery, the long tables, the galley and its stores); the cooks ' +
        'and the mess hands sleep above' },
    { key: 'nr-anc-reliquary', name: "The small Reliquary (laboratory; Ruephus's headquarters)", culture: 'post-apoc', wealth: 0.85, types: CIVIC, lot: [44, 30],
      residence: true, units: 1,
      bodies: [{ id: 'reliquary', poly: SH.circle(12, 12), y: 0.5, levels: 3, h: 3.4, wall: 0.3, roof: 'flat',
        stair: { w: 1.0, riser: 0.21, tread: 0.23 },
        doors: [{ at: [0, 11.59], w: 2.0 }],
        program: [['hall', 'store', 'crew'], ['study', 'bedroom', 'store'], ['hall', 'bedroom', 'bedroom']] }],
      note: 'the Ancients\' laboratory, a smaller sister of the Reliquary: three round storeys under a lattice dome and a needle ' +
        'spire (a steep ship\'s stair between its storeys: the 12-gon\'s walls are short). Ruephus holds court in the ground-floor hall (his throne, the loot), his guard beside it, the armoury behind; his ' +
        'chart room, his cabin and the treasure room above; his officers on the top floor. The plan is the 12-gon inside the ' +
        'undulating shell; the dome, the spire and the colonnade are not planned' }
  ] });
})(KratorInteriors);
