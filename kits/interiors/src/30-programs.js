/* ======================== Room programs: what each room kind needs ========================
   The data the placer reads. Swap or extend any table here without touching the placer.

   PROGRAMS[kind] = {
     require: [{ need, types:[...], n }]   placed FIRST, in this order (SPEC "Placement" 2).
                                           need names the slot in reports; types are catalog
                                           FURN types (kits/catalog krator-asset-engine.js FURN_TYPES)
     optional:[{ types:[...], max }]       filled after, while there is room, from the room's
                                           culture and its family only (never 'any')
     extra:    m2 per optional piece       wealth scales it: a rich room fills more
   }
   A candidate for either list must pass SPEC "Placement" 1: setting in {indoor, both}, rooms
   contains the kind, and it fits under the ceiling. Culture is tried in FALLBACK order.

   ROLES says where a piece of a type goes (Yuni's LAYOUT anchors, generalised):
     back    against a wall, preferring the wall farthest from the doors (Yuni 'back')
     wall    against any wall, side walls and corners first (Yuni 'left' 'right' 'corner' 'run-*')
     centre  free-standing, near the middle (Yuni 'centre'), repeated pieces on a grid ('grid')
     seat    beside a placed table, desk or counter, facing it; else against a wall
     ceiling hung from the ceiling;  surface  on a placed table, counter, shelf or desk top
   A piece's anchor overrides its type: anchor 'wall' always backs onto a wall.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SEATS = ['seating', 'bench', 'chair'];
  IX.SEAT_TYPES = SEATS;
  IX.TABLE_TYPES = ['table', 'desk', 'counter'];           /* a seat may stand in these pieces' clearance */
  IX.SURFACE_HOSTS = ['table', 'counter', 'shelf', 'desk', 'storage'];
  /* types that need no walk-up access (decor, light, partitions); everything else must be reachable */
  IX.NO_ACCESS_TYPES = ['rug', 'screen', 'lamp', 'banner', 'debris', 'planter', 'monument'];

  IX.PROGRAMS = {
    hall:     { require: [{ need: 'table', types: ['table'], n: 1 }, { need: 'seats', types: SEATS, n: 2 }],
                optional: [{ types: ['lamp', 'brazier'], max: 2 }, { types: ['storage', 'shelf', 'rack'], max: 2 }, { types: ['screen', 'statue', 'banner'], max: 1 }],
                extra: 7 },
    bedroom:  { require: [{ need: 'bed', types: ['bed'], n: 1 }],
                optional: [{ types: ['storage'], max: 2 }, { types: ['lamp'], max: 1 }, { types: ['screen'], max: 1 }, { types: ['chair', 'desk'], max: 1 }],
                extra: 5 },
    kitchen:  { require: [{ need: 'hearth', types: ['stove'], n: 1 }, { need: 'storage', types: ['storage', 'shelf', 'vessel'], n: 1 }],
                optional: [{ types: ['storage', 'shelf', 'rack', 'stack'], max: 2 }, { types: ['table'], max: 1 }],
                extra: 5 },
    tavern:   { require: [{ need: 'counter', types: ['counter'], n: 1 }, { need: 'table', types: ['table'], n: 1 }, { need: 'seats', types: SEATS, n: 2 }],
                optional: [{ types: ['table'], max: 2 }, { types: SEATS, max: 4 }, { types: ['storage', 'stack', 'rack'], max: 1 }, { types: ['lamp', 'brazier'], max: 2 }],
                extra: 6 },
    workshop: { require: [{ need: 'workstation', types: ['workstation', 'loom'], n: 1 }],
                optional: [{ types: ['workstation', 'loom'], max: 2 }, { types: ['rack', 'shelf', 'storage'], max: 2 }, { types: ['chair', 'bench'], max: 1 }],
                extra: 8 },
    store:    { require: [{ need: 'storage', types: ['storage', 'shelf', 'stack'], n: 2 }],
                optional: [{ types: ['storage', 'shelf', 'stack', 'rack'], max: 3 }],
                extra: 4 },
    shrine:   { require: [{ need: 'altar', types: ['altar', 'shrine'], n: 1 }],
                optional: [{ types: ['desk'], max: 1 }, { types: ['lamp', 'brazier'], max: 2 }, { types: ['statue', 'banner'], max: 1 }],
                extra: 8 },
    study:    { require: [{ need: 'desk', types: ['desk'], n: 1 }, { need: 'seat', types: ['chair'], n: 1 }],
                optional: [{ types: ['shelf', 'statue', 'table'], max: 2 }, { types: ['lamp'], max: 1 }],
                extra: 6 },
    library:  { require: [{ need: 'shelves', types: ['shelf'], n: 2 }, { need: 'reading', types: ['table', 'desk'], n: 1 }],
                optional: [{ types: ['shelf'], max: 3 }, { types: ['desk', 'statue', 'ladder'], max: 2 }],
                extra: 6 },
    school:   { require: [{ need: 'desks', types: ['desk'], n: 2 }, { need: 'board', types: ['board'], n: 1 }],
                optional: [{ types: ['desk'], max: 4 }, { types: ['chair', 'rack'], max: 2 }],
                extra: 4 },
    barracks: { require: [{ need: 'beds', types: ['bed'], n: 2 }, { need: 'rack', types: ['rack', 'weapon'], n: 1 }],
                optional: [{ types: ['bed'], max: 4 }, { types: ['storage', 'rack', 'banner'], max: 2 }],
                extra: 4 },
    antechamber: { require: [], optional: [{ types: ['lamp', 'bench', 'screen'], max: 3 }], extra: 6 }
  };
  IX.DEFAULT_PROGRAM = { require: [], optional: [{ types: ['table', 'storage', 'lamp'], max: 3 }], extra: 6 };

  IX.ROLES = {
    bed: 'back', stove: 'back', altar: 'back', shrine: 'back', counter: 'back', board: 'back',
    storage: 'wall', shelf: 'wall', rack: 'wall', stack: 'wall', loom: 'wall', workstation: 'wall', desk: 'wall',
    screen: 'wall', banner: 'wall', ladder: 'wall', vessel: 'wall', weapon: 'wall',
    table: 'centre', statue: 'centre', rug: 'centre', fountain: 'centre', well: 'centre',
    lamp: 'corner', brazier: 'corner',
    seating: 'seat', bench: 'seat', chair: 'seat'
  };

  /* culture fallback chains: own culture first, then its family, then any culture (opts.fallback) */
  IX.CULTURE_FAMILY = {
    'yuni-common': ['yuni-court', 'yuni-poor', 'sahelian', 'nomad', 'order'],
    'yuni-court': ['yuni-common', 'order', 'sahelian'],
    'yuni-poor': ['yuni-common', 'sahelian', 'nomad'],
    'sahelian': ['yuni-common', 'nomad', 'yuni-poor'],
    'nomad': ['sahelian', 'yuni-common', 'yuni-poor'],
    'order': ['yuni-court', 'yuni-common'],
    'ancient': ['ancients-salvage'],
    'ancients-salvage': ['ancient'],
    'voth': ['iziz'],
    'iziz': ['voth'],
    'beast-rider': []
  };
})(KratorInteriors);
