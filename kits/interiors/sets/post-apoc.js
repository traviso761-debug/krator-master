/* ======================== Interior set: Post-Apoc (kits/post-apoc) ========================
   The reclaimed-and-recycled kit's interiors: one item per defBuilding key (kits/post-apoc src/40-58).
   Local frame = the builder's: origin at the plot centre on the ground, +z the front, metres.
   Cores (32-cores.js): a container is CT.L20 6.06 / CT.L40 12.19 long (x) by CT.W 2.44 wide, floor on
   its 0.16 rail, 2.59 high; a stacked box sits CT.H 2.59 higher. Furniture cultures: scrap (the poor
   salvage set) and post-apoc (the high-value salvage). sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect, circle = SH.circle;
  const CL20 = 6.06, CL40 = 12.19, CW = 2.44, CF = 0.16, CH = 2.59, CIN = 2.35;   // container sizes, floor, inner clear height
  /* a rectangle from its x and z extents */
  const span = function (x0, x1, z0, z1) { return rect(x1 - x0, z1 - z0, (x0 + x1) / 2, (z0 + z1) / 2); };
  /* the point of a polygon's boundary nearest (x, z): an explicit room's door on its (round) wall */
  const edge = function (P, x, z) {
    let best = null, bd = Infinity;
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2)), q = [a[0] + dx * t, a[1] + dz * t];
      const d = Math.hypot(q[0] - x, q[1] - z); if (d < bd) { bd = d; best = q; }
    }
    return [Math.round(best[0] * 1000) / 1000, Math.round(best[1] * 1000) / 1000];
  };
  /* a container body (long axis x unless along z) with its floor at y = stack base + 0.16 */
  const box = function (id, len, cx, cz, base, doors, program, o) {
    o = o || {};
    return Object.assign({ id: id, poly: o.alongZ ? rect(CW, len, cx, cz) : rect(len, CW, cx, cz), y: base + CF, levels: [{ h: CIN }],
      wall: 0.08, roof: 'flat', doors: doors, program: program }, o.extra || {});
  };

  /* round rooms used below */
  const siloDrum = circle(2.6, 12);                         // dw-silo: r 2.7 drum
  const tyreRing = circle(3.15, 12);                        // dw-tire: tyre ring R 3.5, plastered inner face
  const shamanDome = circle(2.1, 12);                       // shaman: earth dome R 2.5, 2.3 high
  const twinL = circle(4.05, 12, -8.7, -1.2), twinR = circle(4.05, 12, 8.7, -1.2);   // lg-twinsilo: r 4.2 silos
  const fhSilo = circle(2.85, 12, -6.6, -1.6);              // farmhouse: r 3.0 silo
  const grSilo = circle(2.35, 12, -8.5, 3.4);               // granary: the small r 2.5 silo with a ground door

  /* lg-tanktower: the plank block's storeys (42-lg-dwell.js lgTankTower): floor U(s), east face X1(s), back Z0(s), front Z1(s) */
  const ttU = function (s) { return 0.5 + 3.1 * s; }, ttX1 = function (s) { return 6.6 + 0.14 * s; },
    ttZ0 = function (s) { return -4.4 - 0.14 * s; }, ttZ1 = function (s) { return 4.8 + 0.168 * s; };
  const ttStorey = function (s) {
    return { id: 'storey' + s, poly: span(-0.2, ttX1(s), ttZ0(s), ttZ1(s)), y: ttU(s), levels: [{ h: 2.7 }], wall: 0.1, roof: s === 4 ? 'gable' : 'flat',
      doors: [s === 0 ? { at: [2.7, ttZ1(0)], w: 1.0 } : { at: [ttX1(s), s % 2 ? -1.1 : 3.9], w: 1.0 }], program: ['cottage', 'cottage'] };
  };

  IX.sets.add({ set: 'post-apoc', title: 'Post-Apoc: reclaimed and recycled', culture: 'scrap', items: [
    /* ---------- small dwellings (40-dw-small.js) */
    { key: 'dw-box', name: 'Box house', culture: 'scrap', wealth: 0.25, types: ['single-family dwelling'], lot: [14, 8],
      bodies: [box('box', CL20, 1.3, -0.9, 0, [{ at: [0, 0.32], w: 1.0 }], ['cottage']),
        { id: 'room', poly: rect(3.0, CW, -3.23, -0.9), y: CF, levels: [{ h: 2.15 }], wall: 0.12, roof: 'flat',
          doors: [{ at: [-3.23, 0.32], w: 0.9 }], program: ['store'] }],
      note: 'the 20 ft container is the one-room home; the board-and-batten room on its left end has its own street door and no opening into the box, so it is planned as a separate store (3.0 x 2.4 is too small for a hearth beside its door)' },
    { key: 'dw-silo', name: 'Silo house', culture: 'scrap', wealth: 0.25, types: ['single-family dwelling'], lot: [11, 10],
      rooms: [{ id: 'drum', kind: 'cottage', poly: siloDrum, y: 0.45, h: 2.7, doors: [{ at: edge(siloDrum, 0, 2.6), w: 1.0 }] }],
      note: 'one round room on the silo floor (0.45). The drum is 6.2 m high with a second window row at 3.4: a loft, but the builder draws no stair or floor for it (only an outside ladder to the roof), so it is not planned' },
    { key: 'dw-tire', name: 'Tyre hut', culture: 'scrap', wealth: 0.2, types: ['single-family dwelling'], lot: [11, 11],
      rooms: [{ id: 'hut', kind: 'cottage', poly: tyreRing, y: 0.1, h: 2.4, doors: [{ at: edge(tyreRing, 0, 3.15), w: 1.0 }] }],
      note: 'one round earthship room inside the tyre ring (wall top 2.55); the bottle-glass window wall is not a fixture' },
    { key: 'dw-bus', name: 'Bus house', culture: 'scrap', wealth: 0.2, types: ['single-family dwelling'], lot: [14, 9],
      rooms: [{ id: 'bus', kind: 'cottage', poly: rect(8.2, 2.25, 1.8, -1.7), y: 0.8, h: 1.55, doors: [{ at: [4.55, -0.575], w: 0.9 }] }],
      bodies: [{ id: 'kitchen', poly: rect(3.4, 3.0, -4.1, -1.7), y: CF, levels: [{ h: 2.0 }], wall: 0.1, roof: 'flat',
        doors: [{ at: [-5.0, -0.2], w: 0.85 }], program: ['kitchen'] }],
      note: 'the bus body (x -2.4..6.0) is 2.4 wide with its floor at 0.8 and its roof at 2.35: 1.55 m clear inside, as the bus() core draws it. The rear lean-to kitchen has its own door on the yard' },
    { key: 'dw-tank', name: 'Tank pod', culture: 'scrap', wealth: 0.2, types: ['single-family dwelling'], lot: [11, 9],
      rooms: [{ id: 'pod', kind: 'cottage', poly: rect(6.4, 2.6), y: 1.3, h: 2.2, doors: [{ at: [-1.4, 1.3], w: 0.95 }] }],
      note: 'variant 0: the r 1.7 tank lying along x (centre 2.05 up). The door vestibule puts the sill at 1.3; a floor there is a 3.06 m chord, 2.45 m under the crown and 1.85 at the plan\'s long walls. The builder draws no floor inside (only the porch deck): the kit should add collFloor at 1.3. The rear lean-to has no door and is not planned. Variant 1 (standing tank) differs' },
    { key: 'dw-bottle', name: 'Bottle cottage', culture: 'scrap', wealth: 0.3, types: ['single-family dwelling'], lot: [12, 10],
      bodies: [{ id: 'cottage', poly: rect(7.6, 5.0), y: 0.5, levels: [{ h: 2.55 }], wall: 0.3, roof: 'gable', pitch: 0.8,
        doors: [{ at: [-1.1, 2.5], w: 1.0 }], program: ['living', 'bedroom'] }],
      note: 'timber frame with bottle-glass panels on a tyre-and-earth course; floor at 0.5' },
    { key: 'dw-stilt', name: 'Stilt perch', culture: 'scrap', wealth: 0.2, types: ['single-family dwelling'], lot: [9, 11],
      bodies: [{ id: 'perch', poly: rect(4.8, 4.0), y: 4.6, levels: [{ h: 2.15 }], wall: 0.1, roof: 'flat',
        doors: [{ at: [1.05, 2.0], w: 1.0 }], program: ['cottage'] }],
      note: 'the room on the poles (floor 4.6, reached by stair, deck and ladder). The 3.4 x 3.0 loft cabin on its roof has no door and no ladder to it: not planned' },

    /* ---------- large dwellings (42-lg-dwell.js) */
    { key: 'lg-stack', name: 'Container stack', culture: 'scrap', wealth: 0.25, types: ['multi-family dwelling'], lot: [22, 18], units: 4,
      bodies: [
        box('workshop', CL40, -3, -2, 0, [{ at: [-7.5, -0.78], w: 1.0 }], ['workshop', 'store']),
        box('shopbay', CL20, 6.5, -2, 0, [{ at: [9.53, -2], w: 1.0 }], ['store']),
        box('flat2a', CL40, -1.5, -2, CH, [{ at: [-4.5, -0.78], w: 1.0 }], ['cottage']),
        box('flat2b', CL40, 7, 1, CH, [{ at: [8.22, 3], w: 1.0 }], ['cottage'], { alongZ: true }),
        box('flat3', CL40, -2, -2, CH * 2, [{ at: [-3.5, -0.78], w: 0.95 }], ['cottage']),
        box('penthouse', CL20, -4, -2, CH * 3, [{ at: [-4.5, -0.78], w: 0.95 }], ['cottage'])],
      note: 'served by OUTSIDE steel stairs and a ladder, so every box is its own body with its door on its landing: four flats (level 2 front and turned box, level 3, the penthouse), the ground workshop box and the 20 ft shop-bay box (its end doors; its counter stands outside). The 20 ft box turned on level 3 (x 7) has only a window and its end doors over the back drop: not planned' },
    { key: 'lg-twinsilo', name: 'Twin silo hall', culture: 'scrap', wealth: 0.3, types: ['multi-family dwelling'], lot: [31, 18], units: 2,
      bodies: [{ id: 'hall', poly: rect(9.0, 7.2, 0, -1.2), y: 0.75, levels: [{ h: 3.2 }], wall: 0.12, roof: 'gable', pitch: 0.9,
        doors: [{ at: [0, 2.4], w: 1.4 }], program: ['hall', 'kitchen'] }],
      rooms: [
        { id: 'siloW', kind: 'cottage', poly: twinL, y: 0.75, h: 3.0, doors: [{ at: edge(twinL, -8.7, 3.0), w: 1.1 }] },
        { id: 'siloE', kind: 'cottage', poly: twinR, y: 0.75, h: 3.0, doors: [{ at: edge(twinR, 8.7, 3.0), w: 1.1 }] },
        { id: 'siloW-up', kind: 'bedroom', level: 1, poly: twinL, y: 4.0, h: 2.9, doors: [{ at: edge(twinL, -8.7 - 4.2 * Math.sin(0.55), -1.2 + 4.2 * Math.cos(0.55)), w: 1.0 }] },
        { id: 'siloE-up', kind: 'bedroom', level: 1, poly: twinR, y: 4.0, h: 2.9, doors: [{ at: edge(twinR, 8.7 + 4.2 * Math.sin(0.55), -1.2 + 4.2 * Math.cos(0.55)), w: 1.0 }] }],
      note: 'two silo homes (a ground room off the porch and an upper room off its balcony door at 4.0) and the common hall between them, cut to the free stretch between the drums (|x| < 4.5). The builder draws no stair between a silo\'s two floors nor up to the balconies' },
    { key: 'lg-bulkhead', name: 'Bulkhead manor', culture: 'scrap', wealth: 0.3, types: ['multi-family dwelling'], lot: [26, 28], units: 7,
      bodies: [
        { id: 'ground', poly: rect(14.2, 8.2, 0, -10.55), y: 0.3, levels: [{ h: 2.95 }], wall: 0.12, roof: 'flat',
          doors: [{ at: [0, -6.45], w: 2.0 }, { at: [-7.1, -10.5], w: 1.0 }, { at: [7.1, -10.5], w: 1.0 }, { at: [0, -14.65], w: 1.1 }], program: ['hall', 'kitchen'] },
        { id: 'first', poly: rect(14.2, 8.2, 0, -10.55), y: 3.6, levels: [{ h: 2.95 }], wall: 0.12, roof: 'flat',
          doors: [{ at: [-7.1, -10.5], w: 1.0 }, { at: [7.1, -10.5], w: 1.0 }, { at: [0, -14.65], w: 1.1 }], program: ['cottage', 'cottage'] },
        { id: 'second', poly: rect(14.2, 8.2, 0, -10.55), y: 6.9, levels: [{ h: 2.95 }], wall: 0.12, roof: 'flat',
          doors: [{ at: [-7.1, -10.5], w: 1.0 }, { at: [7.1, -10.5], w: 1.0 }], program: ['cottage', 'cottage'] },
        box('wingW', CL40, -8.6, 1.6, 0, [{ at: [-7.38, 1.6], w: 1.0 }], ['cottage'], { alongZ: true }),
        box('wingE', CL40, 8.6, 1.6, 0, [{ at: [7.38, 1.6], w: 1.0 }], ['cottage'], { alongZ: true }),
        box('terraceW', CL20, -8.6, 4.6, CH * 2, [{ at: [-8.6, 1.57], w: 0.95 }], ['cottage'], { alongZ: true })],
      note: 'the three-storey block behind the bulkhead is served by OUTSIDE steel stairs and ladders to side landings, so each storey is its own body (ground: the common hall through the great doorway; upper storeys: two flats each, one per side door). Wings: the ground 40 ft boxes and the 20 ft box on the west terrace. The upper 40 ft wing boxes, the east top box and the attic have no door: not planned' },
    { key: 'lg-tanktower', name: 'Tank-tower tenement', culture: 'scrap', wealth: 0.25, types: ['multi-family dwelling'], lot: [18, 16], units: 10,
      bodies: [ttStorey(0), ttStorey(1), ttStorey(2), ttStorey(3), ttStorey(4)],
      note: 'the jettied plank block, one body per storey (an OUTSIDE steel switchback serves each upper door), two flats a storey; its west edge is held at x -0.2, clear of the tank drum. The tank has a floor at every storey but no door from the block, and the plank wrap round it is 0.9 m deep: neither is planned' },

    /* ---------- civic and religious (44-civic.js) */
    { key: 'longhouse', name: 'Village longhouse', culture: 'scrap', wealth: 0.5, types: ['civic', 'multi-family dwelling'], lot: [40, 18], units: 3,
      bodies: [{ id: 'hall', poly: rect(30, 10), y: 0.6, levels: [{ h: 3.0 }], wall: 0.14, roof: 'gable', pitch: 0.6,
        doors: [{ at: [0, 5], w: 1.5 }, { at: [-12, 5], w: 1.4 }, { at: [12, 5], w: 1.4 }, { at: [12.5, -5], w: 1.3 }, { at: [2.5, -5], w: 1.3 }, { at: [-7.5, -5], w: 1.3 }],
        program: ['hall', 'cottage', 'cottage', 'cottage'] }],
      note: 'variant 0 (closed front): the feast hall at the street door and three family bays, each a cottage; the builder draws the hall open from end to end (its tables and hearths are not fixtures here)' },
    { key: 'mess', name: 'Mess hall', culture: 'post-apoc', wealth: 0.45, types: ['tavern/inn', 'civic'], lot: [23, 16],
      rooms: [{ id: 'hall', kind: 'tavern', poly: rect(12.0, 11.5), y: 0.1, h: 2.4,
        doors: [{ at: [5, 5.75], w: 1.0 }, { at: [-4.6, -5.75], w: 1.0 }, { at: [6.0, 0], w: 3.6, swing: 'none' }, { at: [-6.0, 0], w: 3.6, swing: 'none' }] }],
      bodies: [{ id: 'kitchen', poly: rect(3.5, 4.6, -9.45, 0), y: 0.14, levels: [{ h: 2.3 }], wall: 0.12, roof: 'flat',
        doors: [{ at: [-7.7, 0], w: 1.3 }], program: ['kitchen'] }],
      note: 'two open-fronted 40 ft boxes face each other under one gable: one tavern room from back wall to back wall (each box has a door in its back), open at both ends; the kitchen shed at the west end opens toward it' },
    { key: 'chief', name: "Big man's house", culture: 'post-apoc', wealth: 0.7, types: ['civic', 'single-family dwelling'], lot: [25, 34],
      bodies: [
        { id: 'hall', poly: rect(10.2, 8.2, 0, -9.5), y: 0.3, levels: [{ h: 2.95 }, { h: 2.95 }], wall: 0.12, roof: 'gable', pitch: 0.45,
          doors: [{ at: [0, -5.4], w: 2.0 }, { at: [0, -13.6], w: 1.1 }], program: [['hall', 'kitchen'], ['bedroom', 'study']] },
        box('tower', CL20, 3.6, -15.3, 0, [{ at: [3.6, -14.08], w: 0.95 }], ['store']),
        box('wingWR', CL40, -8.4, -6.1, 0, [{ at: [-7.18, -6.1], w: 1.0 }], ['dormitory'], { alongZ: true }),
        box('wingWF', CL40, -8.4, 6.1, 0, [{ at: [-7.18, 6.1], w: 1.0 }], ['store'], { alongZ: true }),
        box('wingER', CL40, 8.4, -6.1, 0, [{ at: [7.18, -6.1], w: 1.0 }], ['dormitory'], { alongZ: true }),
        box('wingEF', CL40, 8.4, 6.1, 0, [{ at: [7.18, 6.1], w: 1.0 }], ['workshop'], { alongZ: true })],
      rooms: [{ id: 'throne', kind: 'hall', poly: rect(8.0, 4.6, 0, -1.95), y: 4.3, h: 3.8, doors: [{ at: [0, 0.35], w: 4.0, swing: 'none' }] }],
      note: 'the two-storey rear hall behind the bulkhead (the great doorway and the back door; a planned inside stair, the builder draws none; its upper side doors open on stairless decks), the open-fronted throne bay on its deck (the throne is not a fixture), the ground boxes of both wings (retainers, stores, a workshop) and the rear tower\'s ground box. Upper wing and tower boxes and the annexes have no door: not planned' },
    { key: 'shaman', name: 'Shaman hut', culture: 'scrap', wealth: 0.3, types: ['religious'], lot: [13, 13],
      rooms: [{ id: 'dome', kind: 'shrine', poly: shamanDome, y: 0, h: 2.0, doors: [{ at: edge(shamanDome, 0, 2.1), w: 1.0, swing: 'none' }] }],
      note: 'the earth dome is 2.3 high at the centre and about 1.7 at r 1.5; the plan keeps a flat 2.0 ceiling. The doorway is curtained (1.4 high)' },

    /* ---------- shops (46-shops.js) */
    { key: 'shop-food', name: 'Food shop', culture: 'post-apoc', wealth: 0.45, types: ['market/shop'], lot: [15, 8],
      bodies: [box('shop', CL20, -1, -2.6, 0, [{ at: [1.2, -1.38], w: 1.0 }], ['shop'])],
      note: 'an open-fronted 20 ft box: the plan walls its front and enters by the gap beside the builder\'s counter (x 0.3..2.0); the counter and goods the builder draws are not fixtures, the plan places its own. One shop room: halved (shop + store) its 3 m shop end cannot take a counter. The side stall and the oven are open-air' },
    { key: 'shop-armor', name: 'Armour shop', culture: 'post-apoc', wealth: 0.45, types: ['market/shop'], lot: [16, 8],
      bodies: [box('shop', CL40, -1.4, -3.3, 0, [{ at: [-4.5, -2.08], w: 1.2 }], [['shop', 'store']])],
      note: 'an open-fronted 40 ft box with a counter across its right half: the plan walls the front and enters by the open left half (the mannequin bay); the builder\'s counter is not a fixture. The forge lean-to at its end is open-air' },
    { key: 'shop-weapon', name: 'Weapon shop', culture: 'post-apoc', wealth: 0.45, types: ['market/shop'], lot: [14, 9],
      rooms: [{ id: 'bus', kind: 'store', poly: rect(8.2, 2.25, -1.0, -2.9), y: 0.8, h: 1.55, doors: [{ at: [-5.1, -2.9], w: 0.9 }] }],
      note: 'the shop is the fenced yard (its gate gap is the front door) with racks in the open; the bus is the strong room, entered by the bus core\'s rear emergency door (1.4 high), 1.55 m clear inside' },
    { key: 'shop-tinker', name: "Tinker's shop", culture: 'post-apoc', wealth: 0.4, types: ['market/shop'], lot: [16, 8],
      bodies: [box('shop', CL20, 0.9, -3.0, 0, [{ at: [0.9, -1.78], w: 1.2 }], ['shop'])],
      note: 'an open-fronted 20 ft box whose counter spans the whole front (the street entry): the plan walls the front with a door at its middle and places its own counter. One shop room: a workshop behind it does not fit (a cut may not land on the middle door, and an end door leaves no wall for the counter); the tinkering bench under the mast and the side stall are open-air' },
    { key: 'shop-general', name: 'General store', culture: 'post-apoc', wealth: 0.4, types: ['market/shop'], lot: [15, 8],
      bodies: [{ id: 'store', poly: rect(2 * CL20, CW, 0, -3.2), y: CF, levels: [{ h: CIN }], wall: 0.08, roof: 'flat',
        doors: [{ at: [-0.9, -1.98], w: 1.1 }], program: [['shop', 'store']] }],
      note: 'two 20 ft boxes end to end, read as one store (the builder leaves no end doors between them)' },

    /* ---------- industry (48-industry.js) */
    { key: 'smithy', name: 'Scrap smithy', culture: 'scrap', wealth: 0.35, types: ['industry'], lot: [14, 12],
      rooms: [{ id: 'shed', kind: 'smithy', poly: rect(9.8, 8.0, 0, -0.45), y: 0.06, h: 3.3, doors: [{ at: [0, 3.55], w: 3.4, swing: 'none' }] }],
      note: 'a roofed shed with sheet walls at the back and left only: the front bay and the right side are open. The builder\'s own hearth, anvil, bellows and quench tank are not fixtures here, so the plan places its own' },
    { key: 'gen-wind', name: 'Wind generator', culture: 'scrap', wealth: 0.35, types: ['infrastructure'], lot: [14, 14],
      bodies: [box('shed', CL20, 0, 3.9, 0, [{ at: [-1.2, 5.12], w: 1.0 }], ['workshop'])],
      note: 'only the control shed at the foot of the lattice tower is enclosed' },
    { key: 'gen-fuel', name: 'Fuel generator', culture: 'scrap', wealth: 0.35, types: ['infrastructure'], lot: [14, 12],
      bodies: [box('shed', CL20, -2.8, -2.6, 0, [{ at: [-1.4, -1.38], w: 1.0 }], ['workshop'])],
      note: 'the generator box; the fuel tank, drums and fence are open-air' },
    { key: 'warehouse', name: 'Warehouse', culture: 'scrap', wealth: 0.35, types: ['industry'], lot: [26, 18],
      bodies: [{ id: 'hangar', poly: span(-11.5, 10.5, -8.5, 2.6), y: 1.15, levels: [{ h: 4.2 }], wall: 0.1, roof: 'gable', pitch: 0.5,
        doors: [{ at: [-7, 2.6], w: 3.6 }, { at: [-1.5, 2.6], w: 3.6 }, { at: [4, 2.6], w: 3.6 }], program: ['store', 'workshop', 'store'] }],
      note: 'the hangar on its raised dock floor (1.15), three roll-up openings on the dock; the yard stacks and gantry are open-air' },

    /* ---------- farm (50-farm.js) */
    { key: 'farm', name: 'Farm plot', culture: 'scrap', wealth: 0.25, types: ['farm'], lot: [28, 22],
      bodies: [{ id: 'shed', poly: rect(3.6, 2.8, -10.4, 7.4), y: 0.12, levels: [{ h: 2.3 }], wall: 0.08, roof: 'flat',
        doors: [{ at: [-9.8, 8.8], w: 0.9 }], program: ['store'] }],
      note: 'beds, pens, the coop and the cold frames are open; only the tool shed is enclosed (variant 0 layout)' },
    { key: 'farmhouse', name: 'Farmhouse', culture: 'scrap', wealth: 0.3, types: ['farm', 'single-family dwelling'], lot: [21, 14],
      bodies: [
        { id: 'ground', poly: span(-3.6, 7.8, -5, 2), y: 0.5, levels: [{ h: 2.2 }], wall: 0.12, roof: 'flat',
          doors: [{ at: [1.0, 2.0], w: 1.1 }], program: ['living', 'kitchen'] },
        { id: 'upper', poly: span(-3.6, 7.8, -5, 2), y: 2.9, levels: [{ h: 2.3 }], wall: 0.12, roof: 'gable', pitch: 0.55,
          doors: [{ at: [1.0, 2.0], w: 1.0 }], program: ['bedroom', 'bedroom'] }],
      rooms: [
        { id: 'silo', kind: 'store', poly: fhSilo, y: 0.5, h: 2.2, doors: [{ at: edge(fhSilo, -6.6, 1.4), w: 1.0 }] },
        { id: 'silo-up', kind: 'store', level: 1, poly: fhSilo, y: 2.9, h: 2.3, doors: [{ at: edge(fhSilo, -6.6, 1.4), w: 1.0 }] }],
      note: 'the house is served by an OUTSIDE stair to its balcony, so each storey is its own body; its west end is held at x -3.6, clear of the silo it overlaps. The silo\'s two floors open on the veranda and the balcony; its top door at 5.5 off the spiral stair is not planned' },
    { key: 'granary', name: 'Granary', culture: 'scrap', wealth: 0.3, types: ['farm'], lot: [24, 18],
      rooms: [{ id: 'silo', kind: 'store', poly: grSilo, y: 0.44, h: 3.0, doors: [{ at: edge(grSilo, -9.4, 5.9), w: 1.0 }] }],
      bodies: [box('bay', CL20, 6.6, 5.6, 0.14, [{ at: [6.6, 6.82], w: 2.0 }], ['store'])],
      note: 'the small silo with a ground door and the open-fronted loading-bay box. The three tall silos are grain bins opened only at the catwalk (7.4): not rooms' },

    /* ---------- defence (52-defence.js) */
    { key: 'watchtower', name: 'Watchtower', culture: 'scrap', wealth: 0.3, types: ['infrastructure', 'civic'], lot: [10, 10],
      bodies: [{ id: 'cab', poly: rect(3.4, 3.2, 0, -0.35), y: 14, levels: [{ h: 2.4 }], wall: 0.08, roof: 'flat',
        doors: [{ at: [1.05, 1.25], w: 0.8 }], program: ['barracks'] }],
      note: 'the cab on the 14 m platform; the lattice, its stair flights and landings are open' },
    { key: 'cages', name: 'Prisoner cages', culture: 'scrap', wealth: 0.2, types: ['civic'], lot: [24, 18],
      bodies: [box('cells', CL40, -3.6, -6.5, 0, [{ at: [-8.1, -5.28], w: 0.9 }], ['barracks']),
        { id: 'guard', poly: rect(3.0, 2.4, 7.2, 5.6), y: 0.14, levels: [{ h: 2.1 }], wall: 0.1, roof: 'flat',
          doors: [{ at: [7.35, 6.8], w: 0.9 }], program: ['antechamber'] }],
      note: 'the 40 ft cell block (planned as one barracks room: the builder draws no cell partitions) and the guard shack. The rebar and chain-link cages, the stilt cage and the lookout are open' },

    /* ---------- the big sites */
    { key: 'compound', name: 'Walled compound', types: ['infrastructure', 'civic'], lot: [64, 54],
      skip: 'a walled yard: its slots take other buildings (placed with their own interiors). The guard cabin over the gate has windows on all four walls and no doorway (the ladders end on the open walkway); the wall boxes and corner towers change with the compound size' },
    { key: 'arena', name: 'Thunderdome arena', culture: 'scrap', wealth: 0.35, types: ['civic'], lot: [56, 56],
      bodies: [box('booth', CL20, 9.6, 25.4, 0, [{ at: [11.4, 26.62], w: 0.9 }], ['shop'])],
      note: 'only the ticket booth (a 20 ft box by the tunnel) is enclosed. The stands, the pit, the cage and the entry tunnel are open; the VIP bus on the loge deck has no door' },
    { key: 'dock', name: 'Dock', culture: 'scrap', wealth: 0.3, types: ['infrastructure'], lot: [52, 46],
      bodies: [box('office', CL20, 1.5, -9.4, 0, [{ at: [3.3, -8.18], w: 0.9 }], ['store'])],
      note: 'only the land-side harbour office box is planned. The quay, pier and crane are open; the tug, the raft house and the barge float (their cabins move with the water and belong to a vessel set)' }
  ] });
})(KratorInteriors);
