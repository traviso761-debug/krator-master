/* ======================== Ancients interiors: the core ========================
   The Ancients' ship interiors as a kit (backported from Noah's Regret, 2026-10): engine-neutral, no THREE,
   no DOM, no catalog. It sits on kits/interiors (KratorInteriors) and reaches the catalog only through the
   adapter a host hands it (kits/interiors adapters: dims, anchorY, list).

     KratorAncientsInteriors.install(IX)        the ship's room kinds as kits/interiors programmes (once per IX)
     .SHIP_ROOMS                                the rooms a large Ancient vessel carries: {id, kind, name, deck, culture, wealth, len}
     .shipRoom(R, o) -> ROOM spec               one of them as a trapezoid room (radial frames), door to the corridor
     .CABIN_CULTURE, .CABIN_CLASSES             what furnishes a cabin of each kind; the cabin widths
     .cabin(kind, w, d, o) -> ROOM spec         a cabin: door to the corridor (+z), window on the glass wall (-z)
     .DRESS, .dress(name)                       role -> catalog key tables: 'ancient' (as built), 'occupied' (as the pirates hold it)
     .RECIPES, .recipe(name, o, cat)            the halls: a room's size -> placements (30-ai-recipes.js)
     .audit(result, cat)                        inside the room, no two pieces in one place, the door kept clear

   A ROOM spec is kits/interiors' (normRoom): { kind, culture, wealth, y, h, poly, doors, windows }.
   ====================================================================== */
var KratorAncientsInteriors = (function () {
  'use strict';
  const AI = { version: '2026-10-07' };

  /* ---------- the ship's room kinds (were Noah's Regret's nrShipKinds) ----------
     Each is a kits/interiors programme (what a room of the kind needs, what it may take) and a KIND_ALIAS (which
     catalog room kinds' pieces it borrows). The brig's cells are placed by hand (the host's cages): its programme
     gives the guard's bench and lamp. */
  AI.SHIP_KINDS = ['sickbay', 'chartroom', 'strongroom', 'armoury', 'brig', 'sailloft', 'laundry'];
  AI.install = function (IX) {
    if (IX.PROGRAMS.sickbay) return IX;
    const SURF = IX.SURFACE_GROUP, ITEM = IX.ITEM_ROLES;
    IX.PROGRAMS.sickbay = { require: [{ need: 'cots', types: ['bed'], n: 3 }, { need: 'medicine chest', types: ['storage', 'shelf'], n: 1 }],
      optional: [{ types: ['bed'], max: 2 }, { types: ['desk', 'table'], max: 1 }, { types: ['chair', 'bench'], max: 1 }, { types: ['shelf', 'storage'], max: 2 }, { types: ['lamp'], max: 1 }, SURF], extra: 4 };
    IX.KIND_ALIAS.sickbay = ['bedroom', 'barracks', 'study', 'store'];
    IX.PROGRAMS.chartroom = { require: [{ need: 'chart table', types: ['table', 'desk'], n: 1 }, { need: 'chart shelves', types: ['shelf'], n: 1 }],
      optional: [{ types: ['chair'], max: 2 }, { types: ['shelf', 'storage'], max: 2 }, { types: ['board'], max: 1 }, { types: ['lamp'], max: 1 }, SURF], extra: 5 };
    IX.KIND_ALIAS.chartroom = ['study', 'library'];
    IX.PROGRAMS.strongroom = { require: [{ need: 'strongboxes', types: ['storage'], roles: ITEM, n: 3 }],
      optional: [{ types: ['storage', 'shelf', 'stack'], max: 4 }, { types: ['desk'], max: 1 }, { types: ['chair'], max: 1 }, SURF], extra: 3 };
    IX.KIND_ALIAS.strongroom = ['store', 'study', 'court'];
    IX.PROGRAMS.armoury = { require: [{ need: 'racks', types: ['weapon', 'rack'], n: 3 }],
      optional: [{ types: ['weapon', 'rack'], max: 3 }, { types: ['storage', 'stack'], max: 2 }, { types: ['workstation'], max: 1 }, SURF], extra: 4 };
    IX.KIND_ALIAS.armoury = ['barracks', 'smithy', 'shop'];
    IX.PROGRAMS.brig = { require: [{ need: 'guard bench', types: ['bench', 'chair'], n: 1 }], optional: [{ types: ['lamp'], max: 1 }, { types: ['rack', 'weapon'], max: 1 }], extra: 8 };
    IX.KIND_ALIAS.brig = ['barracks', 'yard', 'plaza'];
    IX.PROGRAMS.sailloft = { require: [{ need: 'cutting tables', types: ['table', 'loom'], n: 2 }],
      optional: [{ types: ['stack', 'storage'], max: 3 }, { types: ['rack', 'shelf'], max: 2 }, { types: ['bench', 'chair'], max: 2 }, SURF], extra: 5 };
    IX.KIND_ALIAS.sailloft = ['workshop', 'store', 'market', 'dock'];
    IX.PROGRAMS.laundry = { require: [{ need: 'tubs', types: ['vessel'], n: 2 }, { need: 'drying racks', types: ['rack'], n: 1 }],
      optional: [{ types: ['stove'], max: 1 }, { types: ['storage', 'stack'], max: 2 }, { types: ['bench', 'table'], max: 1 }, SURF], extra: 4 };
    IX.KIND_ALIAS.laundry = ['workshop', 'kitchen', 'store', 'yard', 'stable'];
    for (const k of AI.SHIP_KINDS) IX.KIND_WEIGHT[k] = 1.2;
    return IX;
  };

  /* ---------- the rooms of a large Ancient vessel (Noah's Regret's NR.ROOMS, without its hull coordinates) ----------
     deck 2 is the working deck (D3), 3 the officers' (D4); len is the room's length along the hull in metres.
     Their furnishers: the culture's pieces, poor to court by wealth. */
  AI.SHIP_ROOMS = [
    { id: 'chartroom', kind: 'chartroom', name: 'The chart room', deck: 3, culture: 'post-apoc', wealth: 0.55, len: 12 },
    { id: 'wardroom', kind: 'mess', name: "The officers' wardroom", deck: 3, culture: 'post-apoc', wealth: 0.6, len: 20 },
    { id: 'strongroom', kind: 'strongroom', name: "The purser's strongroom", deck: 3, culture: 'post-apoc', wealth: 0.7, len: 12 },
    { id: 'chapel', kind: 'shrine', name: 'The chapel', deck: 3, culture: 'post-apoc', wealth: 0.5, len: 14 },
    { id: 'sailloft', kind: 'sailloft', name: 'The sail loft', deck: 3, culture: 'scrap', wealth: 0.3, len: 32 },
    { id: 'sickbay', kind: 'sickbay', name: 'The sick bay', deck: 3, culture: 'post-apoc', wealth: 0.4, len: 20 },
    { id: 'galley', kind: 'kitchen', name: 'The galley', deck: 2, culture: 'scrap', wealth: 0.3, len: 14 },
    { id: 'armoury', kind: 'armoury', name: 'The armoury', deck: 2, culture: 'scrap', wealth: 0.35, len: 16 },
    { id: 'carpenter', kind: 'workshop', name: "The carpenter's shop", deck: 2, culture: 'scrap', wealth: 0.3, len: 24 },
    { id: 'brig', kind: 'brig', name: 'The brig', deck: 2, culture: 'scrap', wealth: 0.2, len: 12 },
    { id: 'bosun', kind: 'store', name: "The bosun's store", deck: 2, culture: 'scrap', wealth: 0.3, len: 16 },
    { id: 'laundry', kind: 'laundry', name: 'The laundry', deck: 2, culture: 'scrap', wealth: 0.25, len: 16 },
    { id: 'cooper', kind: 'workshop', name: "The cooper's shop", deck: 2, culture: 'scrap', wealth: 0.3, len: 16 }
  ];
  AI.shipRoom = function (R, o) {
    o = o || {};
    /* the cabin band: depth across the hull, the narrow (corridor) end and the wide (glass) end; frames are radial,
       so the room flares by `flare` per metre of depth */
    const d = o.depth || 6.4, wf = R.len, wb = R.len * (1 + (o.flare == null ? 0.03 : o.flare) * d), h = o.h || 3.0;
    const poly = [[-wb / 2, -d / 2], [wb / 2, -d / 2], [wf / 2, d / 2], [-wf / 2, d / 2]];
    const dx = -wf / 2 + Math.min(2.4, wf / 2);
    return { id: R.id, name: R.name, kind: R.kind, culture: R.culture, wealth: R.wealth, y: o.y || 0, h, poly,
      doors: [{ at: [dx, d / 2], w: 1.1, swing: 'in', hinge: 'left' }],
      windows: [{ at: [0, -d / 2], w: Math.max(0.8, wb - 1.4), sill: 0.55, h: 2.3 }] };
  };

  /* ---------- cabins ----------
     The cabin band is cut into frames; a cabin is a class width (CABIN_CLASSES) and is a bedroom, a bunkroom or a store.
     Who lives there decides the furnishing: the pirates' salvage in a bedroom, scrap in the bunkrooms, the goods in a store. */
  AI.CABIN_CULTURE = { bedroom: 'ancients-salvage', bunkroom: 'scrap', store: 'post-apoc' };
  AI.CABIN_CLASSES = [3.6, 4.8, 6.0];
  AI.cabin = function (kind, w, d, o) {
    o = o || {};
    const h = o.h || 3.0, poly = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];
    return { id: o.id || ('cabin-' + kind + '-' + w), kind, culture: o.culture || AI.CABIN_CULTURE[kind] || 'ancients-salvage',
      wealth: o.wealth == null ? 0.35 : o.wealth, y: o.y || 0, h, poly,
      doors: [{ at: [-w / 2 + Math.min(1.0, w / 3), d / 2], w: 0.9, swing: 'in', hinge: 'left' }],
      windows: [{ at: [0, -d / 2], w: Math.max(0.8, w - 1.0), sill: 0.55, h: 2.2 }] };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = AI;
  return AI;
})();
