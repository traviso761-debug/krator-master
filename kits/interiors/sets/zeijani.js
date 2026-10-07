/* ======================== Interior set: the Zeijani (kits/zeijani; Dhelv) ========================
   The Zeijani kit's buildings (kits/zeijani/PLAN.md section 6.4), one item per registry key (`zj_*`), in the building's
   own frame: origin at the plot centre on the ground (for a carved def: the foot of its front, the rock behind it at -z),
   +z the front, metres. Furniture: the `zeijani` culture (kits/catalog/krator-master-furniture-zeijani.js), its chain
   ending in the nomads' pueblo pieces and the generic set.
   CARVED ROOMS are explicit rooms whose walls are rock: rounded outlines (SH.circle, oval) and their carved furniture
   as FIXTURES (bed shelves, benches, hearths, niches, the kiva's incense burner): structure, which the placer keeps off.
   The carved defs' void plans (kits/zeijani, P3) are the one source of these rooms; until a def's plan exists, its item
   here is PROVISIONAL (its note says so) and the plan replaces it.

   ROOM KINDS this set adds (data for IX.PROGRAMS; a page that never loads this file never sees them):
     kiva       the sunken shrine: a spirit altar; drums, prayer sticks, masks, lamps. Its hearth, deflector, ventilator,
                sipapu, bench ring and great incense burner (Ranj is burned in it) are fixtures
     brewery    the brewers' hall: a mash tun (or a vat) and fermenting crocks (or a barrel cradle)
     lab        the fungal alchemist's room: a still or a retort, and shelves of specimens
     cell       a carved room of a home (a gallery apartment, a lean-to's back room): its bed shelf and hearth are carved
                fixtures (a bed shelf says `bed: 1`, which the residence rule counts), so the placer brings a water jar and a chest
     ossuary    a catacomb chamber: the dead (ossuary boxes, mummy bundles, stacked bones), funerary lamps
     cistern    a cistern hall's landing: a way to draw water (a dipping sweep, jars)
     guardroom  a guard post's room: a weapon rack and seats; a watch bunk if there is room
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect, circle = SH.circle;
  const SEATS = IX.SEAT_TYPES, ITEM = IX.ITEM_ROLES, FOOD = IX.FOOD_ROLES, SURFACE = IX.SURFACE_GROUP;
  /* an oval outline (rx across x, rz across z), n sides, centred at (cx, cz) */
  const oval = function (rx, rz, n, cx, cz) {
    const out = [];
    for (let i = 0; i < n; i++) { const a = i * Math.PI * 2 / n; out.push([(cx || 0) + Math.cos(a) * rx, (cz || 0) + Math.sin(a) * rz]); }
    return out;
  };
  /* a round room with a flat back (-z): its chord is one straight wall, so a back piece (an altar, a bed) has an edge to
     stand on; a round room's own edges are about a metre and a third, too short for most of them */
  const dee = function (r, chord, n, cx, cz) {
    const zc = -Math.sqrt(Math.max(0, r * r - chord * chord / 4)), a0 = Math.atan2(zc, chord / 2), a1 = Math.atan2(zc, -chord / 2) + Math.PI * 2, out = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([(cx || 0) + Math.cos(a) * r, (cz || 0) + Math.sin(a) * r]); }
    return out;
  };
  if (!IX.PROGRAMS.kiva) {
    IX.PROGRAMS.kiva = { require: [{ need: 'altar', types: ['altar'], n: 1 }],
      optional: [{ types: ['shrine'], max: 2 }, { types: ['lamp', 'brazier'], max: 2 }, { types: ['statue', 'art', 'banner'], max: 2 }, SURFACE],
      extra: 7 };
    IX.PROGRAMS.brewery = { require: [{ need: 'mash', types: ['storage'], roles: ['mash_tun', 'vat'], n: 1 },
                                      { need: 'crocks', types: ['storage'], roles: ['crock', 'barrel'], n: 1 }],
      optional: [{ types: ['storage', 'vessel', 'stack'], max: 3 }, { types: ['workstation', 'rack'], max: 2 }, { types: ['table'], max: 1 },
                 { types: SEATS, max: 2 }, { types: ['lamp'], max: 2 }, SURFACE],
      extra: 6 };
    IX.PROGRAMS.lab = { require: [{ need: 'still', types: ['workstation'], roles: ['retort', 'still'], n: 1 }, { need: 'shelves', types: ['shelf'], n: 1 }],
      optional: [{ types: ['workstation'], max: 2 }, { types: ['rack'], max: 2 }, { types: ['table', 'desk'], max: 1 }, { types: ['storage', 'shelf'], max: 2 },
                 { types: ['chair'], max: 1 }, { types: ['lamp'], max: 2 }, SURFACE],
      extra: 6 };
    IX.PROGRAMS.cell = { require: [{ need: 'chest', types: ['storage'], roles: ITEM, n: 1 }, { need: 'food', types: ['storage', 'vessel', 'stack'], roles: FOOD, n: 1 }],
      optional: [{ types: ['bed'], max: 1 }, { types: SEATS, max: 2 }, { types: ['workstation'], max: 1 }, { types: ['shelf', 'rack'], max: 1 }, { types: ['lamp'], max: 1 },
                 { types: ['rug'], max: 1 }, { types: ['art', 'shrine'], max: 1 }, SURFACE],
      extra: 5 };
    IX.PROGRAMS.ossuary = { require: [{ need: 'dead', types: ['tomb'], n: 2 }],
      optional: [{ types: ['tomb'], max: 8 }, { types: ['lamp'], max: 2 }, { types: ['statue', 'shrine'], max: 1 }, { types: ['art'], max: 1 }],
      extra: 3 };
    IX.PROGRAMS.cistern = { require: [{ need: 'water', types: ['well', 'storage', 'vessel'], roles: ['well', 'store'], n: 1 }],
      optional: [{ types: ['storage', 'vessel', 'well'], max: 3 }, { types: ['bench'], max: 1 }, { types: ['lamp'], max: 2 }],
      extra: 10 };
    IX.PROGRAMS.guardroom = { require: [{ need: 'rack', types: ['rack', 'weapon'], n: 1 }, { need: 'seats', types: SEATS, n: 2 }],
      optional: [{ types: ['table'], max: 1 }, { types: ['bed'], max: 2 }, { types: ['storage'], roles: ITEM, max: 1 }, { types: ['lamp'], max: 1 },
                 { types: ['banner', 'art'], max: 1 }, SURFACE],
      extra: 5 };
    IX.KIND_ALIAS.kiva = ['shrine'];
    IX.KIND_ALIAS.brewery = ['workshop', 'store', 'kitchen', 'tavern'];
    IX.KIND_ALIAS.lab = ['workshop', 'study', 'store'];
    IX.KIND_ALIAS.cell = ['cottage', 'hall', 'bedroom', 'kitchen'];
    IX.KIND_ALIAS.ossuary = ['shrine'];
    IX.KIND_ALIAS.cistern = ['store', 'yard'];
    IX.KIND_ALIAS.guardroom = ['barracks', 'hall'];
    Object.assign(IX.KIND_WEIGHT, { kiva: 1.6, brewery: 2.0, lab: 1.6, cell: 1.2, ossuary: 1.4, cistern: 2.0, guardroom: 1.2 });
  }
  if (!IX.CULTURE_FAMILY.zeijani) IX.CULTURE_FAMILY.zeijani = ['nomad', 'generic', 'scrap'];

  const HOME = ['dwelling-single'], MULTI = ['dwelling-multi'];
  /* carved fixtures: structure the placer keeps off; reach false unless it is a way in */
  const fx = function (id, kind, x, z, w, d, o) { return Object.assign({ id: id, kind: kind, x: x, z: z, ry: 0, w: w, d: d, reach: false }, o || {}); };

  IX.sets.add({ set: 'zeijani', title: 'The Zeijani: carved, constructed and wooden (kits/zeijani)', culture: 'zeijani', wealth: 0.3, items: [
    /* ---------------- the wooden dwellings (the outpost, the hamlets, the villages) */
    { key: 'zj_hut_a', name: 'Round wattle hut on stilts', wealth: 0.2, types: HOME, lot: [8, 8],
      rooms: [{ id: 'hut', kind: 'cottage', poly: circle(2.55, 12), y: 0.6, h: 2.3, doors: [{ at: [0, 2.55], w: 0.85, swing: 'none' }] }],
      note: 'one round room on low stilts under a conical thatch; the cone\'s upper half is smoke space, not planned' },
    { key: 'zj_hut_b', name: 'Oval plank hut with a porch', wealth: 0.2, types: HOME, lot: [9, 10],
      rooms: [{ id: 'hut', kind: 'cottage', poly: oval(2.4, 3.1, 14, 0, -0.4), y: 0.4, h: 2.4, doors: [{ at: [0, 2.7], w: 0.9 }] }],
      note: 'the porch (z 2.7 to 4.2) is open: not planned' },
    { key: 'zj_hut_c', name: 'Lean-to with a carved back room', wealth: 0.15, types: HOME, lot: [8, 9],
      rooms: [
        { id: 'front', kind: 'kitchen', poly: rect(4.2, 3.0, 0, 0.9), y: 0.1, h: 2.2,
          doors: [{ at: [0, 2.4], w: 0.9 }, { id: 'back', at: [0, -0.6], w: 0.8, to: '.back', swing: 'out', leaf: false }] },
        { id: 'back', kind: 'cell', poly: circle(1.8, 12, 0, -2.4), y: 0.1, h: 2.1,
          doors: [{ id: 'back', at: [0, -0.6], w: 0.8, to: '.front', swing: 'in' }],
          fixtures: [fx('bedshelf', 'bedshelf', -1.05, -2.5, 0.7, 1.6, { bed: 1 })] }],
      note: 'a timber lean-to against a rock face; behind it one round room cut in the rock, its bed shelf carved (a fixture)' },
    { key: 'zj_house_wood', name: 'Round timber house with a ribbed door', wealth: 0.5, types: HOME, lot: [11, 11],
      bodies: [{ id: 'house', poly: circle(4.4, 14), y: 0.5, levels: [{ h: 2.7 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [0, 4.4], w: 1.0 }], program: ['living', 'bedroom'] }],
      note: 'two rooms under a domed thatch; the loft in the dome is storage, not planned' },
    /* ---------------- sacred */
    { key: 'zj_kiva', name: 'Kiva', wealth: 0.4, types: ['religious'], residence: false, lot: [10, 10],
      rooms: [{ id: 'kiva', kind: 'kiva', poly: dee(3.4, 2.6, 14), y: -2.4, h: 2.6, doors: [],
        fixtures: [
          fx('ladder', 'ladder', 0, -0.2, 0.9, 0.5, { reach: true, clearance: { front: 0.8, back: 0.8 } }),
          fx('hearth', 'hearth', 0, 0.6, 0.9, 0.9),
          fx('deflector', 'deflector', 0, 1.65, 1.2, 0.25),
          fx('ventilator', 'ventilator', 0, 3.1, 0.7, 0.45),
          fx('burner', 'incense-burner', -2.0, 0.4, 1.1, 1.1),
          fx('sipapu', 'sipapu', 1.0, -1.1, 0.3, 0.3)] }],
      note: 'PROVISIONAL (until the void plan, P3). A sunken round room: the floor is inside the bench ring (r 3.4; the ring is ' +
        'the room\'s wall). Entered down the ladder through the roof hatch (the way in). The hearth, deflector and ventilator ' +
        'on the front axis, the sipapu beside the ladder, the great incense burner on the west side, where Ranj is burned; ' +
        'the altar against the back of the ring' },
    /* ---------------- works and the carved interiors (provisional plans) */
    { key: 'zj_brewery', name: 'Brewery (carved)', wealth: 0.45, types: ['industry', 'tavern'], lot: [20, 22],
      rooms: [
        { id: 'tap', kind: 'tavern', poly: rect(9, 6, 0, 2.6), y: 0, h: 3.2,
          doors: [{ at: [0, 5.6], w: 1.4 }, { id: 'hall', at: [0, -0.4], w: 1.2, to: '.hall', swing: 'out', leaf: false }] },
        { id: 'hall', kind: 'brewery', poly: oval(5.5, 4.2, 16, 0, -4.6), y: 0, h: 4.0,
          doors: [{ id: 'hall', at: [0, -0.4], w: 1.2, to: '.tap', swing: 'in' }, { id: 'cellar', at: [0, -8.8], w: 1.0, to: '.cellar', swing: 'out', leaf: false }] },
        { id: 'cellar', kind: 'store', poly: oval(3.5, 2.6, 12, 0, -11.4), y: 0, h: 2.6,
          doors: [{ id: 'cellar', at: [0, -8.8], w: 1.0, to: '.hall', swing: 'in' }] }],
      note: 'PROVISIONAL (until the void plan, P3): a taproom front on the square, the brewing hall cut behind it, the cool cellar deepest' },
    { key: 'zj_lab', name: 'Fungal alchemist (carved)', wealth: 0.55, types: ['industry', 'shop'], lot: [16, 18],
      rooms: [
        { id: 'shop', kind: 'shop', poly: rect(6, 4.4, 0, 2.0), y: 0, h: 3.0,
          doors: [{ at: [0, 4.2], w: 1.1 }, { id: 'lab', at: [0, -0.2], w: 1.0, to: '.lab', swing: 'out', leaf: false }] },
        { id: 'lab', kind: 'lab', poly: circle(3.6, 14, 0, -3.8), y: 0, h: 3.2,
          doors: [{ id: 'lab', at: [0, -0.2], w: 1.0, to: '.shop', swing: 'in' }, { id: 'spawn', at: [0, -7.4], w: 0.9, to: '.spawn', swing: 'out', leaf: false }] },
        { id: 'spawn', kind: 'store', poly: circle(2.6, 12, 0, -10.0), y: 0, h: 2.4,
          doors: [{ id: 'spawn', at: [0, -7.4], w: 0.9, to: '.lab', swing: 'in' }] }],
      note: 'PROVISIONAL (until the void plan, P3): the selling room at the front, the still room behind, the dark spawn room deepest' },
    { key: 'zj_guardpost', name: 'Village guard post', wealth: 0.35, types: ['civic', 'military'], residence: false, lot: [10, 9],
      bodies: [{ id: 'post', poly: rect(8, 6.5), y: 0.2, levels: [{ h: 2.8 }], wall: 0.45, roof: 'flat',
        doors: [{ at: [0, 3.25], w: 1.1 }], program: ['guardroom', 'dormitory'] }],
      note: 'PROVISIONAL (until the def, P3): tuff blocks, a guardroom at the door, the watch\'s bunks behind' },
    { key: 'zj_catacomb', name: 'Funeral catacombs: an ossuary chamber', wealth: 0.3, types: ['funerary', 'religious'], residence: false, lot: [14, 14],
      rooms: [
        { id: 'chapel', kind: 'shrine', poly: circle(3.2, 14, 0, 2.0), y: 0, h: 3.0,
          doors: [{ at: [0, 5.2], w: 1.1 }, { id: 'oss', at: [0, -1.2], w: 1.0, to: '.oss', swing: 'out', leaf: false }] },
        { id: 'oss', kind: 'ossuary', poly: oval(4.4, 3.0, 14, 0, -4.2), y: 0, h: 2.6,
          doors: [{ id: 'oss', at: [0, -1.2], w: 1.0, to: '.chapel', swing: 'in' }] }],
      note: 'PROVISIONAL (until the void plan, P3): the mortuary chapel at the head of the stair, one ossuary chamber behind; ' +
        'the loculi corridors are fixtures of the plan' },
    { key: 'zj_cistern', name: 'Cistern hall: a landing', wealth: 0.4, types: ['infrastructure'], residence: false, lot: [12, 8],
      rooms: [{ id: 'landing', kind: 'cistern', poly: rect(10, 5, 0, 0), y: 0, h: 4.5, doors: [{ at: [0, 2.5], w: 2.0, swing: 'none' }, { at: [0, -2.5], w: 2.0, swing: 'none' }] }],
      note: 'PROVISIONAL (until the void plan, P3): one landing of the stepwell flights, where the water is drawn' }
  ] });
})(KratorInteriors);
