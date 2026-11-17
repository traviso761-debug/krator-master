/* ======================== Interior set: Erewhon's citadel (kits/xanadu, 78n-xa-citadel.js) ========================
   The citadel's buildings room by room on their blueprint (settlements/xanadu/citadel/BLUEPRINT.md, the sheets E1, E2a,
   E2b, E5a, E5b, E6 and citadel_blueprint.py; owner, 2026-11-09): everything inside the citadel wall but the two Pleasure
   Domes. A separate set from xanadu.js (the town's), so the citadel's data has one home: the kit's builder draws the walls,
   floors, vaults, stairs, the Ramp of the Sultan and the doors FROM these items (78n xcPlan), the furnisher plans the same
   rooms (core/furnish), and core/walk takes their floors (IX.walk) and the flights (the builder's strips).
   Frame: the builder's, origin at the plot centre on the ground, +x east, +z the front (south: every citadel building faces
   the courts to its south), metres. The blueprint's world (u east, v north) maps to local x = u - u0, z = v0 - v.
   Rooms are explicit (sets/README.md "rooms"): poly the inner outline, y the floor, h the clear height. The extra fields the
   builder reads (the furnisher ignores them):
     room.style   'mughal' (red sandstone and white marble, pietra dura, cusped arches: the state), 'moorish' (zellige dado,
                  yeseria, horseshoe arches, paired columns: the courts and houses), 'iwan' (a great portal), 'arcade'
                  (tiled vaults, haft-rangi), 'banded' (painted rainbow vaults: the private halls), 'gold' (the Golden Way's
                  black, white and gold), 'plain' (whitewash: the guard, the kitchens)
     room.ceil    'star' (a star-polygon ceiling), 'banded' (a painted pointed barrel and its ribs), 'tiled' (a tiled pointed
                  barrel, transverse arches), 'muq' (a muqarnas cornice under a gilt flat ceiling), 'flat', 'open' (a court)
     room.water   [{kind: 'pool' | 'fountain' | 'rill', x, z, w, d}] in the court
     room.arcade  edges of a court ringed with a portico of paired columns ('x0', 'x1', 'z0', 'z1')
     stairs       [{id, a: [x, z, y], b: [x, z, y], w, ramp}] a flight or a ramp run (the builder draws it and its strip)
     cit          {roofY, parapet, ...} the massing hints the builder takes
   ====================================================================== */
(function (IX) {
  'use strict';
  const r3 = function (v) { return Math.round(v * 1000) / 1000; };
  /* the room kinds the citadel adds (a kind already registered by another set is kept) */
  const SEATS = IX.SEAT_TYPES, SURFACE = IX.SURFACE_GROUP;
  const kind = function (k, spec, alias, weight) { if (IX.PROGRAMS[k]) return; IX.PROGRAMS[k] = spec; IX.KIND_ALIAS[k] = alias; IX.KIND_WEIGHT[k] = weight; };
  /* the citadel's own audience hall and gallery, fuller than the Republic's kinds of the same name that src/30-programs.js
     registers since 2026-11-10: these two replace them on a page that loads this set (lobby, guard and armoury are the same) */
  const own = function (k, spec, alias, weight) { IX.PROGRAMS[k] = spec; IX.KIND_ALIAS[k] = alias; IX.KIND_WEIGHT[k] = weight; };
  own('audience', { require: [{ need: 'seat of state', types: ['seating', 'chair'], n: 1 }],
    optional: [{ types: ['seating', 'bench', 'chair'], max: 8 }, { types: ['rug', 'banner', 'art', 'statue', 'screen'], max: 6 }, { types: ['lamp'], max: 4 }, { types: ['table'], max: 2 }], extra: 6 },
    ['hall', 'antechamber'], 1.6);
  kind('lobby', { require: [], optional: [{ types: ['bench', 'seating'], max: 3 }, { types: ['lamp', 'banner', 'art', 'statue'], max: 3 }, { types: ['rack'], max: 1 }], extra: 8 },
    ['antechamber', 'hall'], 0.8);
  kind('court', { require: [], optional: [{ types: ['planter', 'plant', 'bench', 'seating'], max: 6 }, { types: ['lamp'], max: 2 }], extra: 12 }, ['antechamber'], 1);
  kind('guard', { require: [{ need: 'rack', types: ['rack', 'weapon'], n: 1 }, { need: 'seats', types: SEATS, n: 1 }],
    optional: [{ types: ['table'], max: 1 }, { types: ['storage', 'bed'], max: 2 }, { types: ['lamp'], max: 1 }], extra: 6 }, ['barracks', 'antechamber', 'hall'], 1);
  kind('armoury', { require: [{ need: 'racks', types: ['rack', 'weapon'], n: 2 }], optional: [{ types: ['rack', 'weapon', 'storage'], max: 6 }], extra: 3 },
    ['barracks', 'store', 'workshop'], 1);
  own('gallery', { require: [], optional: [{ types: ['bench', 'seating', 'chair'], max: 6 }, { types: ['lamp', 'planter', 'plant'], max: 3 }], extra: 6 },
    ['hall', 'antechamber'], 1.2);
  kind('ramp', { require: [], optional: [], extra: 100 }, ['antechamber'], 0.5);
  kind('bath', { require: [], optional: [{ types: ['seating', 'bench'], max: 3 }, { types: ['lamp', 'screen'], max: 3 }], extra: 6 }, ['antechamber', 'bedroom'], 1);
  kind('divan', { require: [{ need: 'seats', types: SEATS, n: 4 }], optional: [{ types: ['table', 'desk'], max: 3 }, { types: ['rug', 'banner', 'screen', 'lamp'], max: 4 }, SURFACE], extra: 5 },
    ['hall', 'study'], 1.6);
  kind('office', { require: [{ need: 'desk', types: ['desk', 'table'], n: 1 }], optional: [{ types: ['shelf', 'storage', 'chair'], max: 5 }, SURFACE], extra: 5 }, ['study', 'library'], 1);
  kind('treasury', { require: [{ need: 'chests', types: ['storage'], n: 2 }], optional: [{ types: ['storage', 'shelf'], max: 6 }], extra: 3 }, ['store'], 1);
  /* THE SULTAN'S COURT FURNISHED (2026-11-16; settlements/xanadu/citadel/FURNISHING.md, the plan room by room). The citadel's
     rich rooms take kinds of their own, xc_*, with NO aliases: a room of one takes only the catalog pieces whose rooms list it
     (kits/catalog/krator-master-furniture-xanadu.js, its citadel section and the table at its end), so the curation is the
     catalog's, and no top-hung cloth a tall room would drop toward the floor reaches them (the owner, 2026-11-16: "make sure
     wall hangings dont wind up near ground"). The signature pieces are required by role; the rest fills while the room's
     area allows (extra m2 per piece, scaled by wealth). The Garden Pleasure Dome's rooms (sets/xanadu.js) take these kinds too;
     both sets load together wherever the Dome is furnished (settlements/xanadu, the interiors sets sheet). Checked headlessly by
     settlements/xanadu/citadel/furnish_census.js. */
  const ITEM = IX.ITEM_ROLES, FOOD = IX.FOOD_ROLES;
  const xc = function (k, spec, alias) { IX.PROGRAMS[k] = spec; IX.KIND_ALIAS[k] = alias || []; IX.KIND_WEIGHT[k] = 1; };
  const surf = function (n) { return { anchor: 'surface', max: n }; };
  const hang = function (n) { return { types: ['banner'], max: n }; };
  const ceil = function (n) { return { types: ['lamp'], anchor: 'ceiling', max: n }; };
  const lamps = function (n) { return { types: ['lamp'], anchor: 'floor', max: n }; };
  const SEAT = ['masnad', 'divan'];   /* the Great Divan is one of a kind (type monument): asked for by name where the Sultan sits */
  xc('xc_audience', { require: [{ need: 'the Peacock Throne', roles: ['state_throne'], n: 1, types: ['monument'] }, { need: 'courtiers\' seats', types: ['seating'], roles: SEAT, n: 4 }],
    optional: [{ types: ['seating'], max: 8 }, { types: ['table'], max: 4 }, hang(8), { types: ['brazier'], max: 6 }, ceil(4), lamps(6), { types: ['statue'], max: 6 },
      { types: ['fountain'], max: 2 }, { types: ['rug'], max: 5 }, { types: ['art'], max: 4 }, surf(8)], extra: 6 });
  xc('xc_reception', { require: [{ need: 'seats', types: ['seating'], roles: SEAT, n: 3 }, { need: 'tray table', types: ['table'], roles: ['low_table'], n: 1 }],
    optional: [{ types: ['seating'], max: 6 }, { types: ['table'], max: 3 }, hang(6), { types: ['brazier'], max: 4 }, ceil(2), lamps(4), { types: ['statue'], max: 2 },
      { types: ['fountain'], max: 1 }, { types: ['rug'], max: 4 }, { types: ['art'], max: 3 }, surf(6)], extra: 6 });
  xc('xc_feast', { require: [{ need: 'the Great Divan', types: ['monument'], roles: ['great_divan'], n: 1 }, { need: 'the musicians', types: ['seating'], roles: ['musicians_dais'], n: 1 },
      { need: 'the caves of ice', types: ['table'], roles: ['sorbet_table'], n: 1 }, { need: 'dining couches', types: ['seating'], roles: ['dining_couch'], n: 6 },
      { need: 'tray tables', types: ['table'], roles: ['low_table'], n: 4 }],
    optional: [{ types: ['seating'], max: 8 }, { types: ['table'], max: 2 }, { types: ['brazier'], max: 6 }, hang(8), ceil(3), lamps(6), { types: ['fountain'], max: 3 },
      { types: ['statue'], max: 4 }, { types: ['workstation'], max: 1 }, { types: ['rug'], max: 4 }, { types: ['planter'], max: 4 }, surf(12)], extra: 5 });
  xc('xc_dining', { require: [{ need: 'couches', types: ['seating'], roles: ['dining_couch', 'masnad'], n: 4 }, { need: 'tray tables', types: ['table'], roles: ['low_table'], n: 3 },
      { need: 'the caves of ice', types: ['table'], roles: ['sorbet_table'], n: 1 }],
    optional: [{ types: ['seating'], max: 6 }, { types: ['table'], max: 2 }, { types: ['brazier'], max: 4 }, hang(6), ceil(2), lamps(4), { types: ['fountain'], max: 1 },
      { types: ['statue'], max: 2 }, { types: ['rug'], max: 3 }, { types: ['planter'], max: 2 }, surf(10)], extra: 5 }, ['xc_feast']);
  xc('xc_music', { require: [{ need: 'the musicians\' dais', types: ['seating'], roles: ['musicians_dais'], n: 1 }, { need: 'the dulcimer', types: ['workstation'], roles: ['dulcimer'], n: 1 }],
    optional: [{ types: ['rack'], max: 2 }, { types: ['seating'], max: 6 }, hang(4), lamps(3), ceil(1), { types: ['brazier'], max: 2 }, { types: ['rug'], max: 2 },
      { types: ['table'], max: 2 }, { types: ['storage'], max: 2 }, surf(4)], extra: 5 });
  xc('xc_musicbox', { require: [{ need: 'the Sultan\'s lattice box', types: ['seating'], roles: ['lattice_box'], n: 1 }, { need: 'the musicians\' dais', types: ['seating'], roles: ['musicians_dais'], n: 1 }],
    optional: [{ types: ['seating'], max: 3 }, { types: ['rack'], max: 1 }, hang(3), lamps(2), { types: ['rug'], max: 2 }, surf(3)], extra: 5 }, ['xc_music']);
  xc('xc_dayroom', { require: [{ need: 'seats', types: ['seating'], roles: SEAT, n: 3 }, { need: 'tray table', types: ['table'], roles: ['low_table'], n: 1 }],
    optional: [{ types: ['seating'], max: 6 }, { types: ['table'], max: 3 }, { types: ['fountain'], max: 2 }, hang(5), lamps(4), ceil(2), { types: ['brazier'], max: 3 },
      { types: ['statue'], max: 3 }, { types: ['shelf'], max: 2 }, { types: ['stove'], max: 1 }, { types: ['screen'], max: 2 }, { types: ['workstation'], max: 1 },
      { types: ['rug'], max: 3 }, { types: ['art'], max: 3 }, { types: ['planter'], max: 3 }, surf(8)], extra: 5 });
  /* the Sultan's own day rooms (the day room behind the jharokhas, the Kiosk of the Domes): a day room with the Great Divan */
  xc('xc_sultan_day', Object.assign({}, IX.PROGRAMS.xc_dayroom, { require: [{ need: 'the Great Divan', types: ['monument'], roles: ['great_divan'], n: 1 }].concat(IX.PROGRAMS.xc_dayroom.require) }), ['xc_dayroom']);
  xc('xc_family', { require: [{ need: 'seats', types: ['seating'], roles: SEAT.concat(['cushions']), n: 2 }, { need: 'table', types: ['table'], n: 1 },
      { need: 'food', types: ['storage', 'vessel', 'stack'], roles: FOOD, anchors: ['floor', 'wall'], n: 1 }],
    optional: [{ types: ['seating'], max: 4 }, { types: ['table'], max: 2 }, { types: ['storage'], max: 2 }, hang(4), lamps(3), ceil(1), { types: ['stove'], max: 1 },
      { types: ['screen'], max: 1 }, { types: ['fountain'], max: 1 }, { types: ['statue'], max: 1 }, { types: ['rug'], max: 2 }, { types: ['art'], max: 2 }, surf(6)], extra: 6 });
  xc('xc_bedchamber', { require: [{ need: 'the state bed', types: ['bed'], roles: ['state_bed'], n: 1 }, { need: 'chest', types: ['storage'], roles: ITEM, n: 1 },
      { need: 'the Great Divan', types: ['monument'], roles: ['great_divan'], n: 1 }, { need: 'the hoist', types: ['monument'], roles: ['hoist'], n: 1 }],
    optional: [{ types: ['seating'], max: 4 }, { types: ['table'], max: 2 }, hang(6), lamps(4), ceil(2), { types: ['brazier'], max: 3 }, { types: ['screen'], max: 3 },
      { types: ['stove'], max: 1 }, { types: ['storage'], max: 3 }, { types: ['fountain'], max: 1 }, { types: ['statue'], max: 2 }, { types: ['workstation'], max: 1 },
      { types: ['rug'], max: 4 }, { types: ['art'], max: 3 }, surf(8)], extra: 5 });
  xc('xc_harem', { require: [{ need: 'beds', types: ['bed'], roles: ['harem_bed'], n: 2 }, { need: 'chest', types: ['storage'], roles: ITEM, n: 1 },
      { need: 'seats', types: ['seating'], roles: SEAT, n: 2 }],
    optional: [{ types: ['bed'], max: 4 }, { types: ['seating'], max: 6 }, { types: ['table'], max: 4 }, { types: ['screen'], max: 4 }, hang(6), lamps(4), ceil(2),
      { types: ['brazier'], max: 3 }, { types: ['fountain'], max: 2 }, { types: ['storage'], max: 4 }, { types: ['stove'], max: 1 }, { types: ['statue'], max: 2 },
      { types: ['workstation'], max: 1 }, { types: ['rug'], max: 4 }, { types: ['art'], max: 3 }, { types: ['planter'], max: 2 }, surf(8)], extra: 5 });
  xc('xc_cage', { require: [{ need: 'beds', types: ['bed'], roles: ['harem_bed'], n: 2 }, { need: 'chest', types: ['storage'], roles: ITEM, n: 1 },
      { need: 'seats', types: ['seating'], roles: SEAT, n: 2 }, { need: 'books', types: ['shelf'], n: 1 }, { need: 'the princes\' game', types: ['table'], roles: ['nard_table'], n: 1 }],
    optional: [{ types: ['bed'], max: 3 }, { types: ['desk'], max: 2 }, { types: ['seating'], max: 4 }, { types: ['table'], max: 3 }, { types: ['shelf'], max: 2 },
      { types: ['screen'], max: 3 }, hang(5), lamps(3), ceil(2), { types: ['brazier'], max: 2 }, { types: ['statue'], max: 2 }, { types: ['fountain'], max: 1 },
      { types: ['storage'], max: 3 }, { types: ['rug'], max: 3 }, { types: ['art'], max: 3 }, surf(8)], extra: 5 });
  xc('xc_guest', { require: [{ need: 'bed', types: ['bed'], roles: ['harem_bed'], n: 1 }, { need: 'chest', types: ['storage'], roles: ITEM, n: 1 }, { need: 'seat', types: ['seating'], roles: SEAT, n: 1 }],
    optional: [{ types: ['seating'], max: 3 }, { types: ['table'], max: 2 }, { types: ['screen'], max: 2 }, hang(3), lamps(2), ceil(1), { types: ['storage'], max: 2 },
      { types: ['stove'], max: 1 }, { types: ['brazier'], max: 1 }, { types: ['statue'], max: 1 }, { types: ['rug'], max: 2 }, { types: ['art'], max: 2 }, surf(4)], extra: 5 });
  xc('xc_dorm', { require: [{ need: 'pallets', types: ['bed'], roles: ['pallet'], n: 6 }, { need: 'chests', types: ['storage'], roles: ITEM, n: 2 }],
    optional: [{ types: ['bed'], max: 20 }, { types: ['storage'], max: 6 }, { types: ['screen'], max: 4 }, hang(4), { types: ['lamp'], max: 3 }, { types: ['rug'], max: 3 }], extra: 3 });
  xc('xc_bath', { require: [{ need: 'the hot stone', types: ['fountain'], roles: ['hammam_slab'], n: 1 }, { need: 'basins', types: ['fountain'], roles: ['kurna'], n: 2 }],
    optional: [{ types: ['fountain'], max: 4 }, { types: ['seating'], max: 4 }, { types: ['rack'], max: 2 }, { types: ['screen'], max: 2 }, lamps(3), ceil(2),
      { types: ['brazier'], max: 2 }, hang(3), { types: ['monument'], max: 1 }, { types: ['bed'], max: 1 }, { types: ['planter'], max: 2 }, surf(3)], extra: 5 });
  xc('xc_study', { require: [{ need: 'desk', types: ['desk'], roles: ['desk'], n: 1 }, { need: 'books', types: ['shelf'], n: 2 }, { need: 'ledgers', types: ['storage'], n: 1 }],
    optional: [{ types: ['desk'], max: 2 }, { types: ['shelf'], max: 3 }, { types: ['storage'], max: 3 }, { types: ['table'], max: 1 }, { types: ['statue'], max: 2 },
      { types: ['seating'], max: 3 }, hang(4), lamps(3), ceil(1), { types: ['brazier'], max: 2 }, { types: ['stove'], max: 1 }, { types: ['rug'], max: 3 }, { types: ['art'], max: 2 }, surf(8)], extra: 5 });
  xc('xc_chancery', { require: [{ need: 'desks', types: ['desk'], n: 4 }, { need: 'shelves', types: ['shelf'], n: 2 }],
    optional: [{ types: ['desk'], max: 8 }, { types: ['shelf'], max: 4 }, { types: ['storage'], max: 4 }, hang(3), lamps(4), ceil(2), { types: ['rug'], max: 3 },
      { types: ['art'], max: 2 }, surf(6)], extra: 4 });
  xc('xc_divan', { require: [{ need: 'the Vizier\'s seat', types: ['chair'], roles: ['throne'], n: 1 }, { need: 'the council\'s seats', types: ['seating'], roles: SEAT, n: 6 },
      { need: 'tray tables', types: ['table'], roles: ['low_table'], n: 2 }],
    optional: [{ types: ['seating'], max: 6 }, { types: ['table'], max: 2 }, { types: ['desk'], max: 2 }, { types: ['storage'], max: 2 }, hang(6), { types: ['brazier'], max: 4 },
      ceil(2), lamps(4), { types: ['statue'], max: 2 }, { types: ['rug'], max: 4 }, { types: ['art'], max: 2 }, surf(6)], extra: 6 });
  xc('xc_treasury', { require: [{ need: 'chests', types: ['storage'], n: 4 }],
    optional: [{ types: ['storage'], max: 10 }, { types: ['stack'], max: 4 }, { types: ['shelf'], max: 2 }, lamps(2), ceil(1), hang(2), { types: ['rug'], max: 2 },
      { types: ['art'], max: 2 }, surf(4)], extra: 3 });
  xc('xc_gifts', { require: [{ need: 'the gifts', types: ['stack'], n: 2 }],
    optional: [{ types: ['stack'], max: 4 }, { types: ['rack'], max: 4 }, { types: ['statue'], max: 4 }, { types: ['storage'], max: 3 }, { types: ['seating'], max: 4 }, hang(6),
      { types: ['brazier'], max: 3 }, lamps(4), ceil(2), { types: ['rug'], max: 3 }, { types: ['art'], max: 3 }, { types: ['planter'], max: 3 }, surf(4)], extra: 5 });
  xc('xc_wardrobe', { require: [{ need: 'presses', types: ['storage'], n: 3 }],
    optional: [{ types: ['storage'], max: 6 }, { types: ['rack'], max: 4 }, { types: ['screen'], max: 2 }, { types: ['table'], max: 1 }, { types: ['lamp'], max: 2 }, hang(2), { types: ['rug'], max: 1 }], extra: 3 });
  xc('xc_hall', { require: [],
    optional: [{ types: ['seating', 'bench'], max: 6 }, hang(6), { types: ['brazier'], max: 4 }, lamps(4), ceil(2), { types: ['statue'], max: 4 }, { types: ['planter'], max: 4 },
      { types: ['fountain'], max: 1 }, { types: ['stack'], max: 2 }, { types: ['art'], max: 3 }, { types: ['rug'], max: 2 }], extra: 7 });
  xc('xc_loggia', { require: [{ need: 'the Great Divan (the Sultan shown to the court)', types: ['monument'], roles: ['great_divan'], n: 1 }],
    optional: [{ types: ['seating'], max: 4 }, { types: ['brazier'], max: 4 }, hang(6), lamps(4), ceil(2), { types: ['statue'], max: 4 }, { types: ['planter'], max: 4 },
      { types: ['fountain'], max: 1 }, { types: ['table'], max: 2 }, { types: ['rug'], max: 2 }, surf(3)], extra: 5 });
  xc('xc_court', { require: [],
    optional: [{ types: ['planter'], max: 10 }, { types: ['seating', 'bench'], max: 6 }, { types: ['fountain'], max: 2 }, { types: ['lamp'], max: 3 }, { types: ['brazier'], max: 3 },
      { types: ['statue'], max: 3 }], extra: 12 });
  /* the rest of the citadel's furnished rooms on kinds of their own, so no top-hung cloth reaches them either: the vestibules,
     stairs and landings of the palaces and houses, the guard's mess, the court temple's prayer hall, its priests' cells and its
     drum circuit (the guard's dormitories, the kitchens, stores and stables hang nothing and keep the shared kinds) */
  xc('xc_lobby', { require: [], optional: [{ types: ['seating', 'bench'], max: 3 }, { types: ['lamp'], anchor: 'floor', max: 2 }, ceil(1), hang(2), { types: ['statue'], max: 1 },
    { types: ['planter'], max: 2 }, { types: ['brazier'], max: 1 }], extra: 8 });
  xc('xc_mess', { require: [{ need: 'tables', types: ['table'], n: 2 }, { need: 'benches', types: ['bench'], n: 4 }],
    optional: [{ types: ['table'], max: 6 }, { types: ['bench'], max: 12 }, { types: ['lamp'], max: 3 }, { types: ['rack', 'weapon'], max: 2 }, { types: ['storage'], max: 2 },
      { types: ['stove'], max: 1 }, surf(6)], extra: 5 });
  xc('xc_temple', { require: [{ need: 'the altar', types: ['altar'], n: 1 }, { need: 'the rows', types: ['seating'], n: 8 }, { need: 'the skylight columns', types: ['monument'], n: 2 }],
    optional: [{ types: ['seating'], max: 16 }, { types: ['lamp'], anchor: 'wall', max: 4 }, { types: ['shrine'], max: 2 }, hang(6), { types: ['brazier'], max: 4 }, lamps(4), ceil(2),
      { types: ['statue', 'tomb'], max: 2 }, { types: ['rug'], max: 3 }, { types: ['planter'], max: 2 }, surf(6)], extra: 8 });
  xc('xc_cell', { require: [{ need: 'bed', types: ['bed'], n: 1 }, { need: 'chest', types: ['storage'], roles: ITEM, n: 1 }],
    optional: [{ types: ['desk'], max: 2 }, { types: ['shelf'], max: 1 }, { types: ['rack'], max: 1 }, { types: ['lamp'], max: 2 }, hang(2), { types: ['rug'], max: 2 },
      { types: ['bed'], max: 3 }, { types: ['storage'], max: 2 }, surf(4)], extra: 6 });
  xc('xc_kora', { require: [{ need: 'the prayer wheels', types: ['shrine'], n: 4 }],
    optional: [{ types: ['shrine'], max: 10 }, { types: ['lamp'], max: 6 }, hang(3), { types: ['brazier'], max: 2 }, { types: ['bench'], max: 2 }, { types: ['rug'], max: 2 }, { types: ['planter'], max: 2 }], extra: 4 });
  xc('xc_litter', { require: [{ need: 'the palanquins', types: ['monument'], roles: ['palanquin'], n: 2 }],
    optional: [{ types: ['bench'], max: 4 }, { types: ['storage'], max: 3 }, { types: ['rack'], max: 3 }, { types: ['lamp'], max: 4 }], extra: 6 });

  const room = function (id, k, x0, x1, z0, z1, y, h, o) {
    return Object.assign({ id: id, kind: k, poly: [[r3(x0), r3(z0)], [r3(x1), r3(z0)], [r3(x1), r3(z1)], [r3(x0), r3(z1)]], y: r3(y), h: r3(h), doors: [] }, o || {});
  };
  const polyRoom = function (id, k, poly, y, h, o) { return Object.assign({ id: id, kind: k, poly: poly, y: r3(y), h: r3(h), doors: [] }, o || {}); };
  /* a door between two rooms (listed in both, one id) or to the street. o: {h, drawn (the builder draws a leaf of its own:
     the gate's pair), open (an arch with no leaf), head (a flight's or the Ramp's head: an opening with a rail, no wall)} */
  const link = function (R, a, b, at, w, o) {
    const A = R.find(function (r) { return r.id === a; }), B = b === 'street' ? null : R.find(function (r) { return r.id === b; });
    if (!A || (b !== 'street' && !B)) throw new Error('xanadu-citadel set: link ' + a + ' / ' + b);
    const id = 'd.' + a + '.' + b + '.' + A.doors.length, base = Object.assign({ id: id, at: at, w: w }, o || {});
    A.doors.push(Object.assign({}, base, { to: B ? '.' + b : 'street' }));
    if (B) B.doors.push(Object.assign({}, base, { to: '.' + a, leaf: false, swing: 'out' }));
  };
  const stair = function (id, a, b, w, o) { return Object.assign({ id: id, a: a, b: b, w: w }, o || {}); };
  const fx = function (id, x, z, w, d) { return { id: id, kind: 'stair', x: x, z: z, w: w, d: d, reach: false }; };
  const L = [];
  const add = function (it) { L.push(Object.assign({ culture: 'xanadu' }, it)); return it; };

  /* ================================================================ the Sultan's Palace (E1, E2a, E2b)
     Blueprint rect u -390..-280, v 215..305 (the curtain 110 x 90): x = u + 335, z = 260 - v. The curtain stands on the
     outline x +-55, z +-45, 4 m thick; the gate iwan cuts its front. In Erewhon the palace is pinned on the Pleasure Dome's
     axis (87-er-layout CIT_SITES at) with its back on the citadel wall, which stands for the curtain walk at z -45. Inside: the forecourt with the long pool, the guard
     rooms either side of the gate, the west range (the harem postern, its stair, the kitchens, the servants, the litter
     house at the Ramp's foot) and the east range (the armoury, its stair, the guard hall, the chancery of letters, the
     treasury of gifts) in two storeys of 4.2 m; the palace block on the axis, its ground storey 7.2 m (the Hall of
     Audience under a star ceiling), the Sultan's floor at 8.0, the roof terrace and the ochre block under the twin domes at
     13.6. The Sultan is carried: the Ramp of the Sultan, two laps round a 16 m square, from the Hall of Gifts to his bath and
     on to the roof (1 in 7). */
  (function () {
    const FL = 0.45, RG = 4.2, RU = r3(FL + RG + 0.35), RH = 4.2, PG = 7.2, PU = r3(FL + PG + 0.35), PH = 5.2, TY = r3(PU + PH + 0.4), OH = 5.0;
    const R = [];
    /* the gate, the forecourt, the guard */
    R.push(room('gate', 'xc_hall', -6, 6, 41, 44, FL, 10, { style: 'iwan', ceil: 'muq' }));   /* the passage behind the gate iwan's recess (z 44..49, outside) */
    R.push(polyRoom('forecourt', 'xc_court', [[-31, 2], [31, 2], [31, 28], [11, 28], [11, 41], [-11, 41], [-11, 28], [-31, 28]], FL, 12,
      { style: 'moorish', ceil: 'open', water: [{ kind: 'pool', x: 0, z: 17, w: 7, d: 22 }, { kind: 'fountain', x: 0, z: 31, w: 3, d: 3 }, { kind: 'rill', x: 0, z: 36.5, w: 1, d: 7 }],
        fixtures: [{ id: 'pool', kind: 'pool', x: 0, z: 18, w: 8, d: 26, reach: false }] }));
    R.push(room('guard_w', 'guard', -31, -11, 28, 41, FL, RG, { style: 'plain', ceil: 'flat' }), room('guard_e', 'guard', 11, 31, 28, 41, FL, RG, { style: 'plain', ceil: 'flat' }));
    /* the ranges, west then east (mirrored): front room, stair, then three rooms down to the curtain walk */
    const range = function (s, names) {
      const xa = s < 0 ? -47 : 31, xb = s < 0 ? -31 : 47, xo = s * 44, id = function (n) { return n + (s < 0 ? '_w' : '_e'); };
      R.push(room(id('front'), names[0][1], xa, xb, 34, 41, FL, RG, { style: names[0][2] }));
      R.push(room(id('stair'), 'xc_lobby', xa, xb, 22, 34, FL, RG, { style: 'plain', ceil: 'flat', fixtures: [fx('flight', xo, 28, 1.8, 10)] }));
      R.push(room(id('r1'), names[1][1], xa, xb, 8, 22, FL, RG, { style: names[1][2], ceil: names[1][3] || 'flat' }));
      R.push(room(id('r2'), names[2][1], xa, xb, -14, 8, FL, RG, { style: names[2][2], ceil: names[2][3] || 'flat' }));
      R.push(room(id('r3'), names[3][1], xa, xb, -38, -14, FL, RG, { style: names[3][2], ceil: names[3][3] || 'flat' }));
      /* upstairs: the stair's head landing, the room over the front, then the three */
      R.push(room(id('land'), 'xc_lobby', s < 0 ? -47 : 41, s < 0 ? -41 : 47, 22, 26, RU, RH, { style: 'plain', ceil: 'flat' }));
      R.push(room(id('u0'), names[4][1], s < 0 ? -41 : 31, s < 0 ? -31 : 41, 22, 41, RU, RH, { style: names[4][2], ceil: 'flat' }));
      R.push(room(id('u1'), names[5][1], xa, xb, 8, 22, RU, RH, { style: names[5][2], ceil: names[5][3] || 'flat' }));
      R.push(room(id('u2'), names[6][1], xa, xb, -14, 8, RU, RH, { style: names[6][2], ceil: names[6][3] || 'flat' }));
      R.push(room(id('u3'), names[7][1], xa, xb, -38, -14, RU, RH, { style: names[7][2], ceil: names[7][3] || 'flat' }));
      link(R, id('front'), id('stair'), [s * 39, 34], 1.4); link(R, id('stair'), id('r1'), [s * 36, 22], 1.4);
      link(R, id('r1'), id('r2'), [s * 39, 8], 1.4); link(R, id('r2'), id('r3'), [s * 39, -14], 1.4);
      link(R, id('r1'), 'forecourt', [s * 31, 15], 1.6); link(R, id('r2'), 'forecourt', [s * 31, 5], 1.6);
      link(R, id('stair'), s < 0 ? 'guard_w' : 'guard_e', [s * 31, 31], 1.2);
      link(R, id('land'), id('u1'), [s * 44, 22], 1.2); link(R, id('land'), id('u0'), [s * 41, 24], 1.2);
      link(R, id('land'), 'street', [s * 44, 26], 1.6, { open: true, head: true });   /* the flight's head */
      link(R, id('u1'), id('u2'), [s * 39, 8], 1.2); link(R, id('u2'), id('u3'), [s * 39, -14], 1.2);
      return stair('range' + (s < 0 ? '_w' : '_e'), [xo, 32.5, FL], [xo, 23.5, RU], 1.4);
    };
    const SW = range(-1, [['front', 'xc_hall', 'gold'], ['kitchen', 'kitchen', 'plain'], ['servants', 'dormitory', 'plain'], ['litter', 'xc_litter', 'moorish', 'tiled'],
      ['store', 'store', 'plain'], ['cooks', 'dormitory', 'plain'], ['bearers', 'dormitory', 'plain'], ['servants_u', 'dormitory', 'plain']]);
    const SE = range(1, [['armoury', 'armoury', 'plain'], ['guardhall', 'guard', 'plain'], ['chancery', 'xc_chancery', 'mughal', 'star'], ['gifts', 'xc_treasury', 'mughal', 'muq'],
      ['guest_b', 'xc_guest', 'banded', 'banded'], ['guest_a', 'xc_guest', 'mughal', 'star'], ['guest_a2', 'xc_dayroom', 'moorish', 'muq'], ['gifts_u', 'xc_treasury', 'mughal', 'muq']]);
    link(R, 'front_w', 'street', [-39, 41], 1.8);   /* the Harem Postern: the Golden Way's door, black, white and gold */
    link(R, 'gate', 'street', [0, 44], 4.4, { h: 4.6 }); link(R, 'gate', 'forecourt', [0, 41], 5, { open: true, h: 6 });
    link(R, 'guard_w', 'forecourt', [-21, 28], 1.4); link(R, 'guard_e', 'forecourt', [21, 28], 1.4);
    link(R, 'front_e', 'guard_e', [31, 37.5], 1.2);
    /* the palace block: ground */
    R.push(room('gifts', 'xc_gifts', -31, -15, -22, 2, FL, PG, { style: 'mughal', ceil: 'muq', wealth: 0.9 }));
    R.push(room('audience', 'xc_audience', -15, 15, -22, 2, FL, PG, { style: 'mughal', ceil: 'star', wealth: 0.95 }));
    R.push(room('vizier', 'xc_study', 15, 31, -22, 2, FL, PG, { style: 'mughal', ceil: 'star', wealth: 0.85 }));
    R.push(room('ramp', 'ramp', -31, -15, -38, -22, FL, PG, { style: 'arcade', ceil: 'flat', fixtures: [fx('core', -23, -30, 6, 6)] }));
    R.push(room('dining', 'xc_dining', -15, 15, -38, -22, FL, PG, { style: 'banded', ceil: 'banded', wealth: 0.9 }));
    R.push(room('steward', 'office', 15, 25, -38, -22, FL, PG, { style: 'moorish', ceil: 'flat' }));
    R.push(room('sstair', 'xc_lobby', 25, 31, -38, -22, FL, PG, { style: 'plain', ceil: 'flat', fixtures: [fx('flight', 29.5, -31, 1.6, 14)] }));
    link(R, 'gifts', 'forecourt', [-23, 2], 2.4); link(R, 'audience', 'forecourt', [0, 2], 4.2, { h: 5 }); link(R, 'vizier', 'forecourt', [23, 2], 2.4);
    link(R, 'audience', 'gifts', [-15, -10], 2.6, { h: 4 }); link(R, 'audience', 'vizier', [15, -10], 2.2, { h: 4 });
    link(R, 'audience', 'dining', [0, -22], 3, { h: 4 }); link(R, 'gifts', 'ramp', [-23, -22], 3.2, { h: 4 });
    link(R, 'dining', 'steward', [15, -30], 1.4); link(R, 'steward', 'sstair', [25, -26], 1.2); link(R, 'vizier', 'r2_e', [31, -6], 1.4);
    link(R, 'ramp', 'r3_w', [-31, -30], 3.2, { h: 3.6 });   /* the litter house at the Ramp's foot */
    /* the Sultan's floor (E2a) */
    R.push(room('dayroom', 'xc_sultan_day', -15, 15, -10, 2, PU, PH, { style: 'mughal', ceil: 'star', wealth: 0.95 }));
    R.push(room('bedchamber', 'xc_bedchamber', -15, 15, -38, -10, PU, PH, { style: 'banded', ceil: 'banded', wealth: 0.95 }));
    R.push(room('bath', 'xc_bath', -31, -15, -22, 2, PU, PH, { style: 'moorish', ceil: 'muq', wealth: 0.9, water: [{ kind: 'pool', x: -23, z: -10, w: 6, d: 8 }],
      fixtures: [{ id: 'pool', kind: 'pool', x: -23, z: -10, w: 7, d: 9, reach: false }] }));
    R.push(room('sdining', 'xc_dining', 15, 31, -22, 2, PU, PH, { style: 'banded', ceil: 'banded', wealth: 0.9 }));
    R.push(room('wardrobe', 'xc_wardrobe', 15, 25, -38, -22, PU, PH, { style: 'moorish', ceil: 'flat' }));
    R.push(room('sland', 'xc_lobby', 25, 31, -27, -22, PU, PH, { style: 'plain', ceil: 'flat' }));
    R.push(room('ramp_u', 'xc_lobby', -25, -21, -25, -22, PU, PH, { style: 'arcade', ceil: 'flat', rail: ['z0'] }));
    link(R, 'dayroom', 'bedchamber', [0, -10], 2.4); link(R, 'bath', 'dayroom', [-15, -4], 1.6); link(R, 'sdining', 'dayroom', [15, -4], 1.6);
    link(R, 'bath', 'ramp_u', [-23, -22], 3.2, { h: 3.8 }); link(R, 'wardrobe', 'bedchamber', [15, -30], 1.4);
    link(R, 'sland', 'street', [29.5, -27], 1.5, { open: true, head: true }); link(R, 'ramp_u', 'street', [-25, -23.5], 2.8, { open: true, head: true });
    link(R, 'ramp_u', 'street', [-21, -23.5], 2.8, { open: true, head: true });
    link(R, 'wardrobe', 'sland', [25, -24.5], 1.2); link(R, 'sdining', 'sland', [28, -22], 1.2);
    /* the roof of the white base and the ochre block (E2b) */
    R.push(room('terrace_s', 'xc_court', -31, 31, -4, 2, TY, 6, { style: 'moorish', ceil: 'open', rail: ['z1'] }));
    R.push(room('terrace_w', 'xc_court', -31, -20, -22, -4, TY, 6, { style: 'moorish', ceil: 'open', rail: ['x0'] }));
    R.push(room('terrace_e', 'xc_court', 20, 31, -38, -4, TY, 6, { style: 'moorish', ceil: 'open', rail: ['x1', 'z0'] }));
    R.push(room('terrace_n', 'xc_court', -15, 20, -38, -20, TY, 6, { style: 'moorish', ceil: 'open', rail: ['z0'] }));
    R.push(room('loggia', 'xc_loggia', -20, 20, -12, -4, TY, OH, { style: 'mughal', ceil: 'star', wealth: 0.95 }));
    R.push(room('gallery', 'xc_gifts', -20, 0, -20, -12, TY, OH, { style: 'banded', ceil: 'banded', wealth: 0.95 }));
    R.push(room('kiosk', 'xc_sultan_day', 0, 20, -20, -12, TY, OH, { style: 'banded', ceil: 'star', wealth: 0.95, water: [{ kind: 'fountain', x: 10, z: -16, w: 2, d: 2 }],
      fixtures: [{ id: 'fountain', kind: 'pool', x: 10, z: -16, w: 2.4, d: 2.4, reach: false }] }));
    R.push(room('ramp_t', 'xc_lobby', -25, -21, -25, -22, TY, 3.4, { style: 'arcade', ceil: 'flat', rail: ['z0'] }));
    link(R, 'terrace_s', 'terrace_w', [-25.5, -4], 6, { open: true }); link(R, 'terrace_s', 'terrace_e', [25.5, -4], 6, { open: true });
    link(R, 'terrace_e', 'terrace_n', [20, -29], 6, { open: true }); link(R, 'loggia', 'terrace_s', [0, -4], 8, { open: true, h: 4 });
    link(R, 'gallery', 'loggia', [-10, -12], 1.6); link(R, 'kiosk', 'loggia', [10, -12], 1.6); link(R, 'ramp_t', 'terrace_w', [-23, -22], 3.2, { h: 3 }); link(R, 'ramp_t', 'street', [-25, -23.5], 2.8, { open: true, head: true });
    link(R, 'gallery', 'terrace_w', [-20, -16], 1.6); link(R, 'kiosk', 'terrace_e', [20, -16], 1.6);
    /* the Ramp of the Sultan: two laps round its square (the path inset 1.5 m), a lap from the Hall of Gifts' door to the
       bath's, a second to the roof; each run a strip, the corners shared */
    const ramp = []; const P = [[-23, -23.5], [-16.5, -23.5], [-16.5, -36.5], [-29.5, -36.5], [-29.5, -23.5], [-23, -23.5]];
    for (const lap of [[FL, PU], [PU, TY]]) {
      let tot = 0; for (let i = 0; i + 1 < P.length; i++) tot += Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]);
      let s = 0; for (let i = 0; i + 1 < P.length; i++) { const l = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]);
        ramp.push(stair('ramp' + ramp.length, [P[i][0], P[i][1], r3(lap[0] + (lap[1] - lap[0]) * s / tot)], [P[i + 1][0], P[i + 1][1], r3(lap[0] + (lap[1] - lap[0]) * (s + l) / tot)], 2.8, { ramp: true })); s += l; }
    }
    add({ key: 'xa_cit_palace', name: "Sultan's Palace (the citadel)", wealth: 0.9, types: ['civic', 'military', 'single-family dwelling'], lot: [112, 100],
      rooms: R, stairs: [SW, SE, stair('service', [29.5, -37.2, FL], [29.5, -24.6, PU], 1.3)].concat(ramp),
      cit: { kind: 'palace', curtain: [110, 90], FL: FL, RU: RU, PU: PU, TY: TY, rangeTop: r3(RU + RH + 0.4), blockTop: TY, ochreTop: r3(TY + OH + 0.4) },
      note: 'E1, E2a, E2b room by room: the forecourt, the ranges in two storeys, the palace block (Audience, Gifts, the Vizier\'s room, the state dining hall), the Sultan\'s floor, the roof terrace and the ochre block; the Ramp of the Sultan as two laps of strips. The curtain walk, the corner towers and the roof guard are left solid' });
  })();

  /* ================================================================ the Grand Vizier's palace (E5a, E5b)
     Blueprint rect u -438..-394, v 160..252: x = u + 416, z = 206 - v. The pool garden in front (z 10..46), the loggia of
     the garden (z 2..10), the house behind in two storeys (5.4 and 4.4 m) */
  (function () {
    const FL = 0.45, G = 5.4, U = r3(FL + G + 0.35), H = 4.4, R = [];
    R.push(room('garden', 'xc_court', -22, 22, 10, 46, 0.05, 12, { style: 'moorish', ceil: 'open', arcade: [],
      water: [{ kind: 'pool', x: 0, z: 27, w: 5, d: 28 }, { kind: 'fountain', x: 0, z: 13.5, w: 3, d: 3 }],
      fixtures: [{ id: 'pool', kind: 'pool', x: 0, z: 27, w: 6, d: 29, reach: false }, { id: 'bed_w', kind: 'bed', x: -12, z: 28, w: 12, d: 26, reach: false },
        { id: 'bed_e', kind: 'bed', x: 12, z: 28, w: 12, d: 26, reach: false }] }));
    R.push(room('loggia', 'xc_hall', -22, 22, 2, 10, FL, G, { style: 'arcade', ceil: 'tiled', wealth: 0.85 }));
    R.push(room('petitions', 'xc_hall', -22, 6, -14, 2, FL, G, { style: 'moorish', ceil: 'muq' }));
    R.push(room('divan', 'xc_divan', -22, 6, -40, -14, FL, G, { style: 'mughal', ceil: 'star', wealth: 0.9 }));
    R.push(room('archive', 'library', -22, 6, -46, -40, FL, G, { style: 'plain', ceil: 'flat' }));
    R.push(room('chancery', 'xc_chancery', 6, 22, -38, 2, FL, G, { style: 'arcade', ceil: 'tiled' }));
    R.push(room('vstair', 'xc_lobby', 6, 22, -46, -38, FL, G, { style: 'plain', ceil: 'flat', fixtures: [fx('flight', 14.5, -42.5, 13, 1.8)] }));
    link(R, 'garden', 'street', [0, 46], 2.4); link(R, 'loggia', 'garden', [-15, 10], 5, { open: true, h: 4.4 }); link(R, 'loggia', 'garden', [0, 10], 6, { open: true, h: 4.8 });
    link(R, 'loggia', 'garden', [15, 10], 5, { open: true, h: 4.4 });
    link(R, 'loggia', 'petitions', [-8, 2], 1.8); link(R, 'loggia', 'chancery', [14, 2], 1.6); link(R, 'petitions', 'divan', [-8, -14], 2.6, { h: 3.6 });
    link(R, 'divan', 'archive', [-8, -40], 1.4); link(R, 'chancery', 'divan', [6, -26], 1.6); link(R, 'chancery', 'vstair', [14, -38], 1.4);
    R.push(room('uloggia', 'xc_hall', -22, 22, 2, 10, U, H, { style: 'arcade', ceil: 'tiled', rail: ['z1'] }));
    R.push(room('family', 'xc_family', -22, 6, -14, 2, U, H, { style: 'banded', ceil: 'banded' }));
    R.push(room('study', 'xc_study', -22, -2, -46, -14, U, H, { style: 'banded', ceil: 'banded', wealth: 0.85 }));
    R.push(room('reception', 'xc_reception', -2, 22, -38, -14, U, H, { style: 'mughal', ceil: 'star', wealth: 0.85 }));
    R.push(room('clerks', 'bedroom', 6, 22, -14, 2, U, H, { style: 'moorish', ceil: 'flat' }));
    R.push(room('uland', 'xc_lobby', 17, 22, -46, -38, U, H, { style: 'plain', ceil: 'flat' }));
    link(R, 'uland', 'reception', [20, -38], 1.2); link(R, 'uland', 'street', [17, -42.5], 1.6, { open: true, head: true }); link(R, 'reception', 'study', [-2, -26], 1.6); link(R, 'family', 'study', [-12, -14], 1.4);
    link(R, 'family', 'uloggia', [-8, 2], 1.6); link(R, 'clerks', 'uloggia', [14, 2], 1.4); link(R, 'clerks', 'reception', [14, -14], 1.4);
    link(R, 'family', 'clerks', [6, -6], 1.2);
    add({ key: 'xa_cit_vizier', name: "Grand Vizier's palace (the citadel)", wealth: 0.85, types: ['civic', 'single-family dwelling'], lot: [46, 92],
      rooms: R, stairs: [stair('vizier', [7.6, -42.5, FL], [17.6, -42.5, U], 1.4)],
      cit: { kind: 'vizier', FL: FL, U: U, top: r3(U + H + 0.4), house: [-22, 22, -46, 10] },
      note: 'E5a and E5b: the Divan under a star ceiling, the Hall of Petitions, the chancery\'s clerks\' hall in a tiled vault, the archive; above, the Vizier\'s study and reception, his family\'s rooms and the clerks\' chambers; the pool garden in front.' });
  })();

  /* ================================================================ the great officers' houses, the envoys', the guard (E6)
     A dar: four ranges in two storeys round a court with a fountain and its rills, the bureau below and the family above.
     W x D the outer size; o: names and kinds of the ground's and the upper storey's rooms */
  function dar(key, name, W, D, o) {
    const FL = 0.45, G = o.G || 4.6, U = r3(FL + G + 0.35), H = 4.0, hx = W / 2, hz = D / 2, cx = r3(hx - Math.min(10, W * 0.28)), R = [], st = o.style || 'moorish';
    const F = hz - 10, B = -hz + 12;   /* the front range's back line, the back range's front line */
    R.push(room('court', 'court', -cx, cx, B, F, 0.05, 10, { style: st, ceil: 'open', arcade: o.plain ? [] : ['x0', 'x1'],
      water: o.plain ? [] : [{ kind: 'fountain', x: 0, z: (B + F) / 2, w: 3, d: 3 }, { kind: 'rill', x: 0, z: (F + (B + F) / 2) / 2 + 0.75, w: 0.8, d: F - (B + F) / 2 - 3 }],
      fixtures: o.plain ? [] : [{ id: 'fountain', kind: 'pool', x: 0, z: (B + F) / 2, w: 4, d: 4, reach: false }] }));
    R.push(room('vest', o.plain ? 'lobby' : 'xc_lobby', -4, 4, F, hz, FL, G, { style: st, ceil: 'muq' }));
    R.push(room('front_l', o.g[0][0], -hx, -4, F, hz, FL, G, { style: o.g[0][1] || st, ceil: 'flat' }));
    R.push(room('front_r', o.g[1][0], 4, hx, F, hz, FL, G, { style: o.g[1][1] || st, ceil: 'flat' }));
    R.push(room('side_l', o.g[2][0], -hx, -cx, B, F, FL, G, { style: o.g[2][1] || st, ceil: o.g[2][2] || 'flat' }));
    R.push(room('side_r', o.g[3][0], cx, hx, B, F, FL, G, { style: o.g[3][1] || st, ceil: o.g[3][2] || 'flat' }));
    R.push(room('hall', o.g[4][0], -hx, hx - 8, -hz, B, FL, G, { style: o.g[4][1] || 'mughal', ceil: o.g[4][2] || 'star', wealth: o.hallWealth }));
    R.push(room('stair', o.plain ? 'lobby' : 'xc_lobby', hx - 8, hx, -hz, B, FL, G, { style: 'plain', ceil: 'flat', fixtures: [fx('flight', hx - 1.5, (B - hz) / 2, 1.6, 12 - 1)] }));
    link(R, 'vest', 'street', [0, hz], 2, { h: 3 }); link(R, 'vest', 'court', [0, F], 2.4, { open: true, h: 3.2 });
    link(R, 'front_l', 'vest', [-4, (F + hz) / 2], 1.2); link(R, 'front_r', 'vest', [4, (F + hz) / 2], 1.2);
    link(R, 'side_l', 'court', [-cx, (B + F) / 2], 1.6); link(R, 'side_r', 'court', [cx, (B + F) / 2], 1.6);
    link(R, 'hall', 'court', [0, B], 2.6, { h: 3.4 }); link(R, 'hall', 'stair', [hx - 8, (B - hz) / 2], 1.2);
    R.push(room('land', o.plain ? 'lobby' : 'xc_lobby', hx - 4, hx, -hz, -hz + 3, U, H, { style: 'plain', ceil: 'flat' }));
    R.push(room('back_u', o.u[0][0], -hx, hx - 4, -hz, B, U, H, { style: o.u[0][1] || 'banded', ceil: o.u[0][2] || 'banded' }));
    R.push(room('side_l_u', o.u[1][0], -hx, -cx, B, F, U, H, { style: o.u[1][1] || st, ceil: 'flat' }));
    R.push(room('side_r_u', o.u[2][0], cx, hx, B, F, U, H, { style: o.u[2][1] || st, ceil: 'flat' }));
    R.push(room('front_u', o.u[3][0], -hx, hx, F, hz, U, H, { style: o.u[3][1] || st, ceil: o.u[3][2] || 'muq' }));
    link(R, 'land', 'back_u', [hx - 4, -hz + 1.5], 1.2); link(R, 'land', 'street', [hx - 1.5, -hz + 3], 1.6, { open: true, head: true }); link(R, 'back_u', 'side_l_u', [-(hx + cx) / 2, B], 1.2); link(R, 'back_u', 'side_r_u', [(hx + cx) / 2 - 1, B], 1.2);
    link(R, 'side_l_u', 'front_u', [-(hx + cx) / 2, F], 1.2); link(R, 'side_r_u', 'front_u', [(hx + cx) / 2, F], 1.2);
    add({ key: key, name: name, wealth: o.wealth, types: o.types, units: o.units, lot: [W + 4, D + 4], rooms: R,
      stairs: [stair('house', [hx - 1.5, B - 1, FL], [hx - 1.5, -hz + 1.6, U], 1.3)],
      cit: { kind: 'dar', W: W, D: D, FL: FL, U: U, top: r3(U + H + 0.4), plain: !!o.plain, court: [-cx, cx, B, F], dress: o.dress || 0 }, note: o.note });
  }
  dar('xa_cit_treasurer', 'House of the Treasurer', 36, 40, { wealth: 0.8, types: ['civic', 'single-family dwelling'], dress: 0,
    g: [['guard', 'plain'], ['kitchen', 'plain'], ['xc_treasury', 'mughal', 'muq'], ['xc_chancery'], ['xc_chancery', 'mughal', 'star']],
    u: [['xc_guest'], ['xc_guest'], ['xc_family'], ['xc_study', 'mughal', 'star']],
    note: 'E6: the Hall of Ledgers at the back, the strongroom and the tax farmers\' room on the court, the guard and the kitchen at the door; the family upstairs' });
  dar('xa_cit_chancellor', 'House of the Chancellor of Seals and Provinces', 30, 40, { wealth: 0.8, types: ['civic', 'single-family dwelling'], dress: 1,
    g: [['guard', 'plain'], ['kitchen', 'plain'], ['xc_chancery'], ['library', 'mughal', 'muq'], ['xc_reception', 'mughal', 'star']],
    u: [['xc_guest'], ['xc_guest'], ['xc_family'], ['xc_study', 'banded', 'banded']],
    note: 'E6: the Hall of Seals (the Chancellor\'s audience) at the back, the provincial clerks and the archive on the court; the family upstairs' });
  dar('xa_cit_mines', 'House of the Master of Mines and Mints', 38, 38, { wealth: 0.8, types: ['civic', 'single-family dwelling'], dress: 2,
    g: [['guard', 'plain'], ['kitchen', 'plain'], ['xc_chancery', 'moorish', 'muq'], ['xc_treasury', 'mughal'], ['workshop', 'plain', 'tiled']],
    u: [['xc_guest'], ['xc_guest'], ['xc_family'], ['xc_study', 'mughal', 'star']],
    note: 'E6: the assay room at the back (its furnace the catalog\'s forge until the assay furnace is made), the bureau and the mint\'s counting room on the court; the family upstairs' });
  dar('xa_cit_envoys', "Envoys' House", 26, 38, { wealth: 0.8, types: ['multi-family dwelling'], units: 3, dress: 1,
    g: [['guard', 'plain'], ['kitchen', 'plain'], ['xc_guest', 'banded', 'banded'], ['xc_guest', 'banded', 'banded'], ['xc_reception', 'mughal', 'star']],
    u: [['xc_guest'], ['xc_family'], ['xc_family'], ['xc_guest', 'mughal', 'muq']],
    note: 'E6: a walled house with its own kitchen and guard; three suites (the Izizian, the Yuni and the Historian envoy) round the court' });
  dar('xa_cit_barracks', 'Barracks of the Citadel Guard', 40, 38, { wealth: 0.35, types: ['military'], style: 'plain', plain: true, G: 4.2,
    g: [['guard', 'plain'], ['kitchen', 'plain'], ['armoury', 'plain'], ['store', 'plain'], ['xc_mess', 'plain', 'flat']],
    u: [['dormitory', 'plain', 'flat'], ['dormitory', 'plain'], ['dormitory', 'plain'], ['dormitory', 'plain', 'flat']],
    note: 'E6: the gate company\'s house round its parade court: the mess, the armoury, the stores, the dormitories above; plain, as the blueprint has the guard' });

  /* ================================================================ the court temple and the citadel kitchens (E6) */
  (function () {
    const FL = 0.6, R = [];
    R.push(room('hall', 'xc_temple', -20, 20, -16, 14, FL, 11, { style: 'mughal', ceil: 'star', wealth: 0.85 }));
    R.push(room('porch', 'xc_lobby', -30, 30, 14, 22, FL, 6, { style: 'arcade', ceil: 'tiled' }));
    R.push(room('priests', 'xc_cell', -30, -20, -22, 14, FL, 5, { style: 'moorish', ceil: 'flat' }));
    R.push(room('vestry', 'store', 20, 30, -22, 14, FL, 5, { style: 'moorish', ceil: 'flat' }));
    R.push(room('kora', 'xc_kora', -20, 20, -22, -16, FL, 5, { style: 'banded', ceil: 'banded' }));
    link(R, 'porch', 'street', [0, 22], 3.2, { h: 4.4 }); link(R, 'porch', 'hall', [0, 14], 3.4, { h: 5 });
    link(R, 'porch', 'priests', [-25, 14], 1.4); link(R, 'porch', 'vestry', [25, 14], 1.4);
    link(R, 'kora', 'priests', [-20, -19], 1.6); link(R, 'kora', 'vestry', [20, -19], 1.6); link(R, 'hall', 'kora', [0, -16], 2, { h: 3 });
    add({ key: 'xa_cit_temple', name: 'Court Temple (the citadel)', wealth: 0.75, types: ['religious'], lot: [62, 54], rooms: R, stairs: [],
      cit: { kind: 'temple', FL: FL }, note: 'E6: the prayer hall under its star ceiling and lantern, the tiled porch behind the great iwan, the drum circuit behind, the priests\' rooms and the vestry' });
  })();
  (function () {
    const FL = 0.3, R = [];
    R.push(room('kitchen', 'kitchen', -12.5, 12.5, -1, 19, FL, 5, { style: 'plain', ceil: 'flat' }));
    R.push(room('ice', 'store', -12.5, 1, -19, -1, FL, 3.6, { style: 'plain', ceil: 'flat' }));
    R.push(room('stable', 'stable', 1, 12.5, -19, -1, FL, 4, { style: 'plain', ceil: 'flat' }));
    link(R, 'kitchen', 'street', [0, 19], 2.2); link(R, 'kitchen', 'ice', [-6, -1], 1.4); link(R, 'kitchen', 'stable', [7, -1], 1.6); link(R, 'stable', 'street', [12.5, -10], 2.6);
    add({ key: 'xa_cit_kitchens', name: 'Citadel Kitchens, Ice House and Stables', wealth: 0.3, types: ['industry'], lot: [27, 40], rooms: R, stairs: [],
      cit: { kind: 'kitchens', FL: FL }, note: 'E6: the kitchens that feed the guard and the houses, the ice house, the stables' });
  })();

  IX.sets.add({ set: 'xanadu-citadel', title: "Xanadu: Erewhon's citadel (Moorish and Mughal)", culture: 'xanadu', items: L });
})(KratorInteriors);
