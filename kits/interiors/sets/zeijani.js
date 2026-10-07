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
     court      an estate's court under its light shaft: seats, jars and pots, a statue or shrine; its basin is a fixture
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
    IX.PROGRAMS.cell = { require: [{ need: 'chest', types: ['storage'], roles: ITEM, n: 1 }, { need: 'food', types: ['storage', 'vessel', 'stack'], roles: FOOD, anchors: ['floor', 'wall'], n: 1 }],
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
    IX.PROGRAMS.court = { require: [{ need: 'seats', types: SEATS, n: 1 }],
      optional: [{ types: ['planter', 'vessel', 'storage'], max: 4 }, { types: ['statue', 'shrine', 'art'], max: 1 }, { types: ['lamp', 'brazier'], max: 2 },
                 { types: SEATS, max: 3 }, { types: ['table'], max: 1 }, { types: ['rug'], max: 1 }],
      extra: 8 };
    IX.KIND_ALIAS.court = ['yard', 'hall', 'living'];
    IX.KIND_ALIAS.kiva = ['shrine'];
    IX.KIND_ALIAS.brewery = ['workshop', 'store', 'kitchen', 'tavern'];
    IX.KIND_ALIAS.lab = ['workshop', 'study', 'store'];
    IX.KIND_ALIAS.cell = ['cottage', 'hall', 'bedroom', 'kitchen'];
    IX.KIND_ALIAS.ossuary = ['shrine'];
    IX.KIND_ALIAS.cistern = ['store', 'yard'];
    IX.KIND_ALIAS.guardroom = ['barracks', 'hall'];
    Object.assign(IX.KIND_WEIGHT, { court: 1.4, kiva: 1.6, brewery: 2.0, lab: 1.6, cell: 1.2, ossuary: 1.4, cistern: 2.0, guardroom: 1.2 });
  }
  if (!IX.CULTURE_FAMILY.zeijani) IX.CULTURE_FAMILY.zeijani = ['nomad', 'generic', 'scrap'];

  /* ---------------- SHOPS (PLAN.md 6.4): twelve trades, each with one interior and one sign shared by its two fronts
     (zj_shop_<trade>_carved, _built). The front room sells: its kind `zjshop_<trade>` requires the trade's goods (the carved
     front's counter is a fixture; a built front's counter is a piece). The back room makes: `zjwork_<trade>` requires the
     trade's workstation by role, or a shared kind (the smiths' smithy, the alchemist's lab, a store, a kitchen). `sign` is the
     core/sockets pictograph. */
  const TRADES = [
    { t: 'weapons', name: 'Weaponsmith', sign: 'WEAPONS', goods: { types: ['weapon'], roles: ['weapon_rack'], n: 1 }, back: 'smithy', smoke: true },
    { t: 'armour', name: 'Armourer', sign: 'ARMOR', goods: { types: ['rack'], roles: ['armour_stand'], n: 1 }, back: 'smithy', smoke: true },
    { t: 'general', name: 'General goods', sign: 'GENERAL', goods: { types: ['shelf', 'rack', 'storage', 'stack'], n: 2 }, back: 'store' },
    { t: 'food', name: 'Provisioner', sign: 'FOOD', goods: { types: ['storage', 'stack', 'vessel'], roles: FOOD, n: 2 }, back: 'kitchen' },
    { t: 'alchemist', name: 'Alchemist', sign: 'ALCHEMIST', goods: { types: ['shelf', 'vessel', 'lamp'], roles: ['shelf', 'mortar', 'glow_jar'], n: 2 }, back: 'lab' },
    { t: 'lampwright', name: 'Lampwright', sign: 'LAMP', goods: { types: ['lamp'], n: 2 }, work: { types: ['workstation'], roles: ['lampwright'], n: 1 } },
    { t: 'stonecutter', name: 'Stonecutter', sign: 'STONE', goods: { types: ['statue', 'stack', 'art'], n: 1 }, work: { types: ['workstation'], roles: ['banker'], n: 1 } },
    { t: 'dyer', name: 'Dyer', sign: 'DYE', goods: { types: ['rack', 'loom'], roles: ['yarn_rack', 'loom'], n: 1 }, work: { types: ['storage'], roles: ['vat'], n: 1 } },
    { t: 'potter', name: 'Potter', sign: 'POTTER', goods: { types: ['stack'], roles: ['pots', 'display'], n: 1 }, work: { types: ['workstation'], roles: ['wheel'], n: 1 } },
    { t: 'leather', name: 'Leatherworker', sign: 'LEATHER', goods: { types: ['rack', 'stack'], roles: ['armour_stand', 'display'], n: 1 }, work: { types: ['workstation'], roles: ['leather'], n: 1 } },
    { t: 'knapper', name: 'Knapper and mirror-maker', sign: 'KNAPPER', goods: { types: ['art'], roles: ['mirror'], n: 1 }, work: { types: ['workstation'], roles: ['knapping'], n: 1 } },
    { t: 'rope', name: 'Rope and caving outfitter', sign: 'ROPE', goods: { types: ['rack', 'stack'], roles: ['rope_rack', 'coils'], n: 1 }, back: 'store' }
  ];
  if (!IX.PROGRAMS.zjshop_weapons) {
    TRADES.forEach(function (T) {
      IX.PROGRAMS['zjshop_' + T.t] = { require: [Object.assign({ need: 'goods' }, T.goods)],
        optional: [{ types: ['counter'], max: 1 }, { types: ['shelf', 'rack', 'storage', 'stack', 'vessel'], max: 3 }, { types: SEATS, max: 1 }, { types: ['lamp'], max: 2 }, SURFACE],
        extra: 5 };
      IX.KIND_ALIAS['zjshop_' + T.t] = ['shop', 'store'];
      IX.KIND_WEIGHT['zjshop_' + T.t] = 1.6;
      if (T.work) {
        IX.PROGRAMS['zjwork_' + T.t] = { require: [Object.assign({ need: 'work' }, T.work)],
          optional: [{ types: ['workstation'], max: 1 }, { types: ['rack', 'shelf', 'storage', 'stack'], max: 3 }, { types: SEATS, max: 1 }, { types: ['table'], max: 1 }, { types: ['lamp'], max: 1 }, SURFACE],
          extra: 5 };
        IX.KIND_ALIAS['zjwork_' + T.t] = ['workshop', 'store'];
        IX.KIND_WEIGHT['zjwork_' + T.t] = 1.6;
      }
    });
  }
  const backKind = function (T) { return T.work ? 'zjwork_' + T.t : T.back; };
  /* the carved shopfront: a cut 4.6 m wide through the face, a counter across it (a fixture) but for a gap at the east, the
     selling room behind, a passage to the workroom; a smithy's smoke shaft to the top of the rock */
  function shopCarved(T) {
    const voids = [
      { kind: 'mass', id: 'rock', poly: rrect(-6.5, 6.5, -15, 0), y0: -0.5, y1: 7, cap: 1.0, rock: 'tuff', finish: 'raw' },
      { kind: 'door', id: 'front', c: [0, 0], y: 0, r: 2.6, h: 2.9 },
      { kind: 'stair', id: 'front-cut', joins: ['shop'], a: [0, 0, 1.0], b: [0, 0, -1.6], w: 4.6, h: 2.6 },
      { kind: 'stair', id: 'back', joins: ['shop', 'work'], a: [0, 0, -5.8], b: [0, 0, -7.8], w: 1.0, h: 2.1 }];
    if (T.smoke) voids.push({ kind: 'shaft', id: 'smoke', joins: ['work'], c: [2.0, -11.0], y0: 1.8, y1: 8.6, r0: 0.35, r1: 0.4 },
      { kind: 'door', id: 'smoke-head', c: [2.0, -11.0], y: 6.4, r: 0.9, h: 2.6 });
    return { key: 'zj_shop_' + T.t + '_carved', name: T.name + ' (carved front)', carved: true, wealth: 0.45, types: ['shop'], residence: false, lot: [13, 15], sign: T.sign,
      rooms: [
        { id: 'shop', kind: 'zjshop_' + T.t, carved: true, poly: rrect(-3.4, 3.4, -6.2, -1.0), round: 0.5, y: 0, h: 2.9, ceil: 'vault', rise: 0.5, finish: 'hewn',
          doors: [{ at: [1.6, -1.0], w: 1.0, swing: 'none' }, { at: [0, -6.2], w: 1.0, swing: 'none' }],
          fixtures: [fx('counter', 'counter', -0.6, -1.3, 3.2, 0.5, { h: 0.95 })] },
        { id: 'work', kind: backKind(T), carved: true, poly: rrect(-3.0, 3.0, -12.0, -7.4), round: 0.5, y: 0, h: 2.6, ceil: 'vault', rise: 0.4, finish: 'hewn',
          doors: [{ at: [0, -7.4], w: 1.0, swing: 'none' }] }],
      voids: voids,
      note: 'the selling room behind a counter in the shopfront, the ' + (T.work ? 'workroom' : T.back) + ' behind it' + (T.smoke ? ', its smoke shaft to the top of the rock' : '') };
  }
  /* the constructed front: a flat-roofed tuff block, the selling room at the street door, the workroom beside it */
  function shopBuilt(T) {
    return { key: 'zj_shop_' + T.t + '_built', name: T.name + ' (constructed)', wealth: 0.45, types: ['shop'], residence: false, lot: [11, 10], sign: T.sign,
      bodies: [{ id: 'shop', poly: rect(7.6, 6.4), y: 0.2, levels: [{ h: 3.0 }], wall: 0.4, roof: 'flat',
        doors: [{ at: [1.4, 3.2], w: 1.0 }], program: [['zjshop_' + T.t, backKind(T)]] }],
      note: 'tuff block under a flat roof, an awning over the front; the selling room at the street door, the ' + (T.work ? 'workroom' : T.back) + ' beside it' };
  }

  const HOME = ['dwelling-single'], MULTI = ['dwelling-multi'];
  /* carved fixtures: structure the placer keeps off; reach false unless it is a way in */
  const fx = function (id, kind, x, z, w, d, o) { return Object.assign({ id: id, kind: kind, x: x, z: z, ry: 0, w: w, d: d, reach: false }, o || {}); };

  /* ---------------- CARVED PLANS (kits/zeijani carves them: the void plan is this data). A carved def's frame: the front's foot at
     the origin, the rock behind it (-z). Rooms carry the cavern's fields (carved, round: the corner radius, ceil, rise, finish);
     `voids` are its passages, stairs, shafts and doorways, and its block of rock on the kit sheet (mass). */
  const rrect = function (x0, x1, z0, z1) { return [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]; };
  /* a cell off a corridor: a rounded room, its doorway on the corridor's side (side +1 east, -1 west; c the corridor's half
     width; 0.9 m of rock between), a carved bed shelf along its far wall and a hearth niche on its back wall */
  function cell(id, side, cz, y, c, w, d) {
    const g = 0.9, x0 = side > 0 ? c + g : -c - g - w, x1 = x0 + w, z0 = cz - d / 2, z1 = cz + d / 2, dx = side > 0 ? x0 : x1;
    return { room: { id: id, kind: 'cell', carved: true, poly: rrect(x0, x1, z0, z1), round: 0.4, y: y, h: 2.3, ceil: 'vault', rise: 0.45, finish: 'hewn',
        doors: [{ at: [dx, cz], w: 1.0, swing: 'none' }],
        fixtures: [fx('bed', 'bedshelf', side > 0 ? x1 - 0.45 : x0 + 0.45, cz - 0.3, 0.8, 1.9, { bed: 1, h: 0.45 }),
                   fx('hearth', 'hearth', (x0 + x1) / 2 - side * 0.3, z0 + 0.3, 0.7, 0.5, { h: 0.9 })] },
      pass: { kind: 'stair', id: id + '-door', joins: [id], a: [side * (c - 0.6), y, cz], b: [dx + side * 0.7, y, cz], w: 1.0, h: 2.05 } };
  }
  /* GALLERY A, the spine (refs 2da8, b719, 75f7): a corridor descending into the rock in three levels, cells either side,
     a hearth hall, a kiva sunk a metre on the second level (its great burner where Ranj is burned), a cistern at the
     bottom with an air shaft to the top of the rock. Twelve households. */
  function galleryA() {
    const rooms = [], voids = [], C = 1.1, W = 3.4, D = 3.6;
    voids.push({ kind: 'mass', id: 'rock', poly: rrect(-14, 14, -54, 0), y0: -0.5, y1: 10, cap: 1.5, rock: 'tuff', finish: 'raw' });
    voids.push({ kind: 'door', id: 'portal', c: [0, 0], y: 0, r: 1.7, h: 3.0 });
    voids.push({ kind: 'stair', id: 'way-in', a: [0, 0, 1.3], b: [0, 0, -2.6], w: 2.0, h: 2.8 });
    const level = function (n, y, z0, z1, east, west) {
      voids.push({ kind: 'stair', id: 'corr' + n, a: [0, y, z0], b: [0, y, z1], w: 2 * C, h: 2.8 });
      east.forEach(function (cz, i) { const c = cell('c' + n + 'e' + i, 1, cz, y, C, W, D); rooms.push(c.room); voids.push(c.pass); });
      west.forEach(function (cz, i) { const c = cell('c' + n + 'w' + i, -1, cz, y, C, W, D); rooms.push(c.room); voids.push(c.pass); });
    };
    level(0, 0, -2.4, -16.0, [-5, -9.4, -13.8], [-5, -9.4]);
    rooms.push({ id: 'hearth', kind: 'hall', carved: true, poly: rrect(-10.2, -2.2, -18.9, -13.0), round: 0.6, y: 0, h: 3.0, ceil: 'vault', rise: 0.8, finish: 'hewn',
      doors: [{ at: [-2.2, -14.6], w: 1.2, swing: 'none' }],
      fixtures: [fx('hearth', 'hearth', -6.2, -18.55, 1.6, 0.7, { h: 1.0 }), fx('bench', 'bench', -9.75, -16.0, 0.6, 4.5, { h: 0.45 })] });
    voids.push({ kind: 'stair', id: 'hearth-door', joins: ['hearth'], a: [-0.5, 0, -14.6], b: [-2.9, 0, -14.6], w: 1.2, h: 2.4 });
    voids.push({ kind: 'stair', id: 'down1', a: [0, 0, -15.8], b: [0, -3, -20.4], w: 2.0, h: 2.7 });
    level(1, -3, -20.2, -33.0, [-22.6, -27.0, -31.4], []);
    rooms.push({ id: 'kiva', kind: 'kiva', carved: true, poly: dee(3.4, 2.6, 14, -6.4, -27.4), y: -4, h: 2.6, ceil: 'dome', rise: 0.7, finish: 'plaster',
      doors: [{ at: [-3.0, -27.4], w: 1.1, swing: 'none' }],
      fixtures: [fx('hearth', 'hearth', -6.4, -26.8, 0.9, 0.9, { h: 0.3 }), fx('deflector', 'deflector', -6.4, -25.7, 1.2, 0.25, { h: 1.1 }),
                 fx('ventilator', 'ventilator', -6.4, -24.35, 0.7, 0.45, { h: 1.4 }), fx('burner', 'incense-burner', -8.4, -27.0, 1.1, 1.1, { h: 1.3 }),
                 fx('sipapu', 'sipapu', -5.4, -28.6, 0.3, 0.3, { h: 0.02 })] });
    voids.push({ kind: 'stair', id: 'kiva-door', joins: ['kiva'], a: [-0.5, -3, -27.4], b: [-3.8, -4, -27.4], w: 1.1, h: 2.2 });
    voids.push({ kind: 'stair', id: 'down2', a: [0, -3, -32.8], b: [0, -6, -37.4], w: 2.0, h: 2.7 });
    level(2, -6, -37.2, -46.0, [-39.6, -44.0], [-39.6, -44.0]);
    rooms.push({ id: 'cistern', kind: 'cistern', carved: true, poly: rrect(-3.4, 3.4, -51.6, -47.6), round: 0.6, y: -6, h: 3.2, ceil: 'vault', rise: 1.0, finish: 'plaster',
      doors: [{ at: [0, -47.6], w: 1.4, swing: 'none' }], fixtures: [fx('pool', 'pool', 0, -50.6, 4.8, 1.4, { h: 0.5 })] });
    voids.push({ kind: 'stair', id: 'cistern-door', joins: ['cistern'], a: [0, -6, -45.4], b: [0, -6, -48.3], w: 1.4, h: 2.4 });
    voids.push({ kind: 'shaft', id: 'air', joins: ['cistern'], c: [0, -49.8], y0: -3.2, y1: 12.2, r0: 0.45, r1: 0.55 });
    voids.push({ kind: 'door', id: 'air-head', c: [0, -49.8], y: 9.8, r: 1.4, h: 3.0 });
    return { rooms: rooms, voids: voids };
  }
  const GA = galleryA();
  /* GALLERY B, the well (refs 2da8, 75f7): a round shaft open to the sky through the top of the rock, a spiral stair down its
     wall (1.5 turns, 9 m: drawn structure; its walk strips are `walk` entries), and wherever the stair meets a quarter, a short
     side passage with a cell either side; two cells off the entrance tunnel; at the bottom a hearth hall and a cistern. Twelve
     households. The quarters are the axes, so every room is square to the frame. */
  function galleryB() {
    const rooms = [], voids = [], W = [0, -15], R = 4.5, RS = 3.8, Y0 = 0, DROP = 3, TURNS = 1.5;
    voids.push({ kind: 'mass', id: 'rock', poly: rrect(-15, 15, -34, 0), y0: -0.5, y1: 10, cap: 1.2, rock: 'tuff', finish: 'raw' });
    voids.push({ kind: 'door', id: 'portal', c: [0, 0], y: 0, r: 1.6, h: 2.9 });
    voids.push({ kind: 'stair', id: 'way-in', a: [0, 0, 1.3], b: [0, 0, W[1] + RS - 0.4], w: 1.8, h: 2.7 });
    voids.push({ kind: 'shaft', id: 'well', c: W, y0: Y0 - DROP * TURNS * 2, y1: 12.5, r0: R, r1: R + 0.4, floor: true });
    voids.push({ kind: 'door', id: 'sky', c: W, y: 9.4, r: R + 1.2, h: 4 });
    /* the entrance tunnel's two cells */
    [-1, 1].forEach(function (s, i) { const c = cell('t' + i, s, -6.2, 0, 0.9, 3.4, 3.4); rooms.push(c.room); voids.push(c.pass); });
    /* the spiral: angle a from PI/2 (+z, under the tunnel) growing, y falling DROP per half turn */
    const yAt = function (a) { return Y0 - DROP * (a - Math.PI / 2) / Math.PI; }, N = 24, A1 = Math.PI / 2 + TURNS * 2 * Math.PI;
    for (let i = 0; i < N; i++) {
      const a0 = Math.PI / 2 + (A1 - Math.PI / 2) * i / N, a1 = Math.PI / 2 + (A1 - Math.PI / 2) * (i + 1) / N;
      /* each chord runs a little past its neighbours' ends (the outside of every bend would otherwise leave a wedge) */
      const e = 0.06, c0 = a0 - e, c1 = a1 + e;
      voids.push({ kind: 'walk', id: 'spiral' + i, a: [W[0] + Math.cos(c0) * RS, yAt(c0), W[1] + Math.sin(c0) * RS], b: [W[0] + Math.cos(c1) * RS, yAt(c1), W[1] + Math.sin(c1) * RS], w: 1.2 });
    }
    /* the landings: each quarter the stair passes (but the last, the bottom) leads to a side passage and two cells */
    let n = 0;
    for (let q = 1; q < TURNS * 4; q++) {
      const a = Math.PI / 2 + q * Math.PI / 2, y = yAt(a), u = [Math.round(Math.cos(a)), Math.round(Math.sin(a))], t = [-u[1], u[0]];
      voids.push({ kind: 'stair', id: 'side' + q, a: [W[0] + u[0] * 4.3, y, W[1] + u[1] * 4.3], b: [W[0] + u[0] * 7.5, y, W[1] + u[1] * 7.5], w: 1.6, h: 2.5 });
      [-1, 1].forEach(function (s) {
        const id = 'w' + q + (s < 0 ? 'a' : 'b'), cx = W[0] + u[0] * 7.4 + t[0] * s * 3.3, cz = W[1] + u[1] * 7.4 + t[1] * s * 3.3;
        const hx = u[0] ? 1.7 : 1.6, hz = u[1] ? 1.7 : 1.6, poly = rrect(cx - hx, cx + hx, cz - hz, cz + hz);
        const dx = cx - t[0] * s * hx, dz = cz - t[1] * s * hz;   /* the cell's wall toward the side passage */
        const far = [cx + t[0] * s * (hx - 0.45), cz + t[1] * s * (hz - 0.45)];
        rooms.push({ id: id, kind: 'cell', carved: true, poly: poly, round: 0.4, y: y, h: 2.3, ceil: 'vault', rise: 0.45, finish: 'hewn',
          doors: [{ at: [dx, dz], w: 1.0, swing: 'none' }],
          fixtures: [fx('bed', 'bedshelf', far[0], far[1], t[0] ? 0.8 : 1.9, t[0] ? 1.9 : 0.8, { bed: 1, h: 0.45 }),
                     fx('hearth', 'hearth', cx + u[0] * (hx - 0.3), cz + u[1] * (hz - 0.3), u[0] ? 0.5 : 0.7, u[0] ? 0.7 : 0.5, { h: 0.9 })] });
        voids.push({ kind: 'stair', id: id + '-door', joins: [id], a: [cx - t[0] * s * (hx + 1.75), y, cz - t[1] * s * (hz + 1.75)], b: [cx - t[0] * s * (hx - 0.7), y, cz - t[1] * s * (hz - 0.7)], w: 1.0, h: 2.05 });
        n++;
      });
    }
    /* the bottom: the well's floor, a hearth hall east of it and a cistern south of it, where the stair comes down */
    const yb = yAt(A1);
    rooms.push({ id: 'hearth', kind: 'hall', carved: true, poly: rrect(W[0] + 5.6, W[0] + 11.4, W[1] - 3, W[1] + 3), round: 0.6, y: yb, h: 2.8, ceil: 'vault', rise: 0.5, finish: 'hewn',
      doors: [{ at: [W[0] + 5.6, W[1]], w: 1.3, swing: 'none' }],
      fixtures: [fx('hearth', 'hearth', W[0] + 11.05, W[1], 0.7, 1.6, { h: 1.0 }), fx('bench', 'bench', W[0] + 8.5, W[1] - 2.65, 4.5, 0.6, { h: 0.45 })] });
    voids.push({ kind: 'stair', id: 'hearth-door', joins: ['hearth'], a: [W[0] + 3.6, yb, W[1]], b: [W[0] + 6.3, yb, W[1]], w: 1.3, h: 2.4 });
    rooms.push({ id: 'cistern', kind: 'cistern', carved: true, poly: rrect(W[0] - 2.6, W[0] + 2.6, W[1] - 10.6, W[1] - 5.6), round: 0.6, y: yb, h: 3.0, ceil: 'vault', rise: 0.8, finish: 'plaster',
      doors: [{ at: [W[0], W[1] - 5.6], w: 1.3, swing: 'none' }], fixtures: [fx('pool', 'pool', W[0], W[1] - 9.7, 4.2, 1.4, { h: 0.5 })] });
    voids.push({ kind: 'stair', id: 'cistern-door', joins: ['cistern'], a: [W[0], yb, W[1] - 3.6], b: [W[0], yb, W[1] - 6.3], w: 1.3, h: 2.4 });
    return { rooms: rooms, voids: voids, units: n + 2, well: { c: W, r: R, rs: RS, y0: Y0, drop: DROP, turns: TURNS, w: 1.2 } };
  }
  const GB = galleryB();
  /* a room off a corridor running along z at x = xc (its walk 0.8 m wide: a 1.4 m passage), on side +1 (east) or -1 (west),
     0.9 m of rock between; w across x, d along z, centred on cz. A servant's cell (kind 'cell') gets a carved bed shelf and hearth */
  function sroom(id, kind, xc, side, cz, y, w, d, o) {
    o = o || {};
    const x0 = side > 0 ? xc + 1.6 : xc - 1.6 - w, x1 = x0 + w, z0 = cz - d / 2, z1 = cz + d / 2, dx = side > 0 ? x0 : x1, fin = o.finish || 'polished';
    const fixtures = kind === 'cell' ? [fx('bed', 'bedshelf', side > 0 ? x1 - 0.45 : x0 + 0.45, cz - 0.2, 0.8, 1.9, { bed: 1, h: 0.45 }),
      fx('hearth', 'hearth', (x0 + x1) / 2, z0 + 0.3, 0.7, 0.5, { h: 0.9 })] : (o.fixtures || []);
    return { room: { id: id, kind: kind, carved: true, poly: rrect(x0, x1, z0, z1), round: 0.5, y: y, h: o.h || 2.7, ceil: o.ceil || 'vault', rise: o.rise || 0.5,
        finish: kind === 'cell' || kind === 'store' ? 'hewn' : fin, doors: [{ at: [dx, cz], w: 1.0, swing: 'none' }], fixtures: fixtures },
      pass: { kind: 'stair', id: id + '-door', joins: [id], a: [xc + side * 0.1, y, cz], b: [dx + side * 0.7, y, cz], w: 1.0, h: 2.2 } };
  }
  const put = function (rooms, voids, s) { rooms.push(s.room); voids.push(s.pass); };
  /* a window cut through the face into a room (no walk floor: its sill is a wall), x on the face, y its sill, `to` how deep */
  const win = function (voids, id, x, y, to, w, h) {
    voids.push({ kind: 'stair', id: id, a: [x, y, 0.5], b: [x, y, to], w: w, h: h, floor: false });
    voids.push({ kind: 'door', id: id + '-face', c: [x, 0], y: y - 0.4, r: w / 2 + 0.3, h: h + 0.5 });   /* the sill and head with it */
  };
  /* ESTATE A, the columned hall (refs 6159, d117, Petra): a relief front of engaged columns; a pillared reception hall; behind
     it a court under its own light shaft (a basin in its floor); west of the hall the family's corridor (a living room at the
     front, three bedrooms, the household shrine at its end); east the service corridor (the kitchen at the front, two stores,
     two servants' cells, the cistern at its end). Two windows in the face light the living room and the kitchen. 13 rooms. */
  function estateA() {
    const rooms = [], voids = [], P = 'polished';
    voids.push({ kind: 'mass', id: 'rock', poly: rrect(-18, 18, -40, 0), y0: -0.5, y1: 11, cap: 1.5, rock: 'tuff', finish: 'raw' });
    voids.push({ kind: 'door', id: 'portal', c: [0, 0], y: 0, r: 2.2, h: 3.8 });
    voids.push({ kind: 'stair', id: 'way-in', a: [0, 0, 1.3], b: [0, 0, -2.4], w: 2.6, h: 3.4 });
    const pil = [];
    [-3, 3].forEach(function (x) { [-5.6, -9.4].forEach(function (z, i) { pil.push(fx('pillar' + pil.length, 'pillar', x, z, 0.8, 0.8, { h: 3.9 })); }); });
    rooms.push({ id: 'hall', kind: 'hall', carved: true, poly: rrect(-6, 6, -13, -2), round: 0.6, y: 0, h: 3.8, ceil: 'flat', finish: P,
      doors: [{ at: [0, -2], w: 2.4, swing: 'none' }, { at: [0, -13], w: 1.8, swing: 'none' }, { at: [-6, -10.5], w: 1.2, swing: 'none' }, { at: [6, -10.5], w: 1.2, swing: 'none' }],
      fixtures: pil });
    voids.push({ kind: 'stair', id: 'court-door', joins: ['hall', 'court'], a: [0, 0, -12.6], b: [0, 0, -15.4], w: 1.8, h: 3.0 });
    rooms.push({ id: 'court', kind: 'court', carved: true, poly: rrect(-4.6, 4.6, -24, -15), round: 0.8, y: 0, h: 3.2, ceil: 'vault', rise: 0.4, finish: 'plaster',
      doors: [{ at: [0, -15], w: 1.8, swing: 'none' }], fixtures: [fx('basin', 'pool', 0, -19.5, 2.2, 2.2, { h: 0.45 })] });
    voids.push({ kind: 'shaft', id: 'light', joins: ['court'], c: [0, -19.5], y0: 0, y1: 13.5, r0: 3.4, r1: 3.9 });
    voids.push({ kind: 'door', id: 'sky', c: [0, -19.5], y: 10.4, r: 5.0, h: 4 });
    /* the family's corridor (west) and the service corridor (east), each entered from the hall's side door */
    [-1, 1].forEach(function (s) {
      const xc = s * 9.6;
      voids.push({ kind: 'stair', id: (s < 0 ? 'w' : 'e') + 'door', joins: ['hall'], a: [s * 5.5, 0, -10.5], b: [s * 9.8, 0, -10.5], w: 1.2, h: 2.5 });
      voids.push({ kind: 'stair', id: (s < 0 ? 'w' : 'e') + 'corr', a: [xc, 0, -4.4], b: [xc, 0, s < 0 ? -26.4 : -31.0], w: 1.4, h: 2.7 });
    });
    rooms.push({ id: 'living', kind: 'living', carved: true, poly: rrect(-14.6, -7.4, -5.6, -1.6), round: 0.5, y: 0, h: 3.0, ceil: 'vault', rise: 0.5, finish: P,
      doors: [{ at: [-9.6, -5.6], w: 1.4, swing: 'none' }] });
    put(rooms, voids, sroom('bed1', 'bedroom', -9.6, -1, -9.3, 0, 4.0, 3.8));
    put(rooms, voids, sroom('bed2', 'bedroom', -9.6, -1, -14.5, 0, 4.0, 3.8));
    put(rooms, voids, sroom('bed3', 'bedroom', -9.6, -1, -19.7, 0, 4.0, 3.8));
    rooms.push({ id: 'shrine', kind: 'shrine', carved: true, poly: rrect(-12.8, -6.8, -31.0, -26.0), round: 0.6, y: 0, h: 2.8, ceil: 'dome', rise: 0.8, finish: 'plaster',
      doors: [{ at: [-9.6, -26.0], w: 1.4, swing: 'none' }] });
    rooms.push({ id: 'kitchen', kind: 'kitchen', carved: true, poly: rrect(7.4, 14.6, -5.6, -1.6), round: 0.5, y: 0, h: 3.0, ceil: 'vault', rise: 0.5, finish: 'hewn',
      doors: [{ at: [9.6, -5.6], w: 1.4, swing: 'none' }], fixtures: [fx('hearth', 'hearth', 14.15, -3.6, 0.6, 1.6, { h: 1.0 })] });
    put(rooms, voids, sroom('store1', 'store', 9.6, 1, -9.3, 0, 4.0, 3.8));
    put(rooms, voids, sroom('store2', 'store', 9.6, 1, -14.5, 0, 4.0, 3.8));
    put(rooms, voids, sroom('serv1', 'cell', 9.6, 1, -19.7, 0, 4.0, 3.8));
    put(rooms, voids, sroom('serv2', 'cell', 9.6, 1, -24.9, 0, 4.0, 3.8));
    rooms.push({ id: 'cistern', kind: 'cistern', carved: true, poly: rrect(6.6, 12.6, -35.4, -30.6), round: 0.6, y: 0, h: 3.0, ceil: 'vault', rise: 0.8, finish: 'plaster',
      doors: [{ at: [9.6, -30.6], w: 1.4, swing: 'none' }], fixtures: [fx('pool', 'pool', 9.6, -34.4, 4.2, 1.4, { h: 0.5 })] });
    win(voids, 'win-w', -11, 1.3, -2.2, 0.9, 1.2);
    win(voids, 'win-e', 11, 1.3, -2.2, 0.9, 1.2);
    return { rooms: rooms, voids: voids };
  }
  const EA = estateA();
  /* ESTATE B, the loggia (refs cliff.jpg, d117): two storeys. A round domed hall with a basin under the dome; a stair up from
     its west door to the family's floor (4.6 m): a loggia along the face behind five arched windows, a living room and a
     bedroom at each end, a bedroom behind each. From the hall's back a flight down to a court under a light shaft (-2.4 m):
     the kitchen and a store west of it; east, a corridor from the household shrine past two servants' cells to the cistern. 12 rooms. */
  function estateB() {
    const rooms = [], voids = [], P = 'polished', U = 4.6, D = -2.4;
    voids.push({ kind: 'mass', id: 'rock', poly: rrect(-17, 17, -36, 0), y0: -0.5, y1: 12, cap: 1.4, rock: 'tuff', finish: 'raw' });
    voids.push({ kind: 'door', id: 'portal', c: [0, 0], y: 0, r: 1.9, h: 3.3 });
    voids.push({ kind: 'stair', id: 'way-in', a: [0, 0, 1.3], b: [0, 0, -4.8], w: 2.2, h: 3.1 });
    rooms.push({ id: 'hall', kind: 'hall', carved: true, poly: circle(5.2, 20, 0, -9.6), y: 0, h: 3.4, ceil: 'dome', rise: 1.6, finish: P,
      doors: [{ at: [0, -4.4], w: 2.0, swing: 'none' }, { at: [0, -14.8], w: 1.8, swing: 'none' }, { at: [-5.2, -9.6], w: 1.4, swing: 'none' }],
      fixtures: [fx('basin', 'pool', 0, -9.6, 1.8, 1.8, { h: 0.4 })] });
    /* up: the stair from the hall's west door, a landing across its head (the family room north, a bedroom south) */
    voids.push({ kind: 'stair', id: 'up', joins: ['hall'], a: [-4.7, 0, -9.6], b: [-12.2, U, -9.6], w: 1.4, h: 2.6 });
    voids.push({ kind: 'stair', id: 'landing', a: [-12.2, U, -12.0], b: [-12.2, U, -7.4], w: 1.2, h: 2.4 });
    rooms.push({ id: 'living', kind: 'living', carved: true, poly: rrect(-15.4, -9.0, -8.0, -1.6), round: 0.5, y: U, h: 2.9, ceil: 'vault', rise: 0.5, finish: P,
      doors: [{ at: [-12.2, -8.0], w: 1.2, swing: 'none' }, { at: [-9.0, -2.6], w: 2.0, swing: 'none' }] });
    rooms.push({ id: 'bed1', kind: 'bedroom', carved: true, poly: rrect(-15.6, -10.0, -16.4, -11.6), round: 0.5, y: U, h: 2.7, ceil: 'vault', rise: 0.5, finish: P,
      doors: [{ at: [-12.2, -11.6], w: 1.2, swing: 'none' }] });
    voids.push({ kind: 'stair', id: 'loggia', a: [-9.6, U, -2.6], b: [9.6, U, -2.6], w: 2.2, h: 2.7 });
    [-7, -3.5, 0, 3.5, 7].forEach(function (x, i) { win(voids, 'arch' + i, x, U + 0.6, -1.9, 1.2, 2.0); });
    rooms.push({ id: 'master', kind: 'bedroom', carved: true, poly: rrect(9.0, 15.4, -8.0, -1.6), round: 0.5, y: U, h: 2.9, ceil: 'vault', rise: 0.5, finish: P,
      doors: [{ at: [9.0, -2.6], w: 2.0, swing: 'none' }, { at: [12.2, -8.0], w: 1.0, swing: 'none' }] });
    voids.push({ kind: 'stair', id: 'master-pass', a: [12.2, U, -7.6], b: [12.2, U, -12.0], w: 1.0, h: 2.2 });
    rooms.push({ id: 'bed2', kind: 'bedroom', carved: true, poly: rrect(10.0, 15.6, -16.4, -11.6), round: 0.5, y: U, h: 2.7, ceil: 'vault', rise: 0.5, finish: P,
      doors: [{ at: [12.2, -11.6], w: 1.0, swing: 'none' }] });
    /* down: the court under its shaft, the kitchen and store west, the servants' corridor east */
    voids.push({ kind: 'stair', id: 'down', joins: ['hall', 'court'], a: [0, 0, -14.4], b: [0, D, -18.6], w: 1.8, h: 2.8 });
    rooms.push({ id: 'court', kind: 'court', carved: true, poly: rrect(-5, 5, -28, -18.2), round: 0.8, y: D, h: 3.2, ceil: 'vault', rise: 0.4, finish: 'plaster',
      doors: [{ at: [0, -18.2], w: 1.8, swing: 'none' }, { at: [-5, -23], w: 1.2, swing: 'none' }, { at: [5, -23], w: 1.2, swing: 'none' }] });
    voids.push({ kind: 'shaft', id: 'light', joins: ['court'], c: [0, -23.1], y0: D, y1: 14.5, r0: 3.6, r1: 4.0 });
    voids.push({ kind: 'door', id: 'sky', c: [0, -23.1], y: 11.4, r: 5.2, h: 4 });
    voids.push({ kind: 'stair', id: 'kitchen-door', joins: ['court', 'kitchen'], a: [-4.5, D, -23], b: [-9.4, D, -23], w: 1.2, h: 2.4 });
    rooms.push({ id: 'kitchen', kind: 'kitchen', carved: true, poly: rrect(-14.6, -8.8, -26.0, -20.0), round: 0.5, y: D, h: 2.8, ceil: 'vault', rise: 0.5, finish: 'hewn',
      doors: [{ at: [-8.8, -23], w: 1.2, swing: 'none' }, { at: [-11.7, -26.0], w: 1.0, swing: 'none' }], fixtures: [fx('hearth', 'hearth', -14.15, -23, 0.6, 1.6, { h: 1.0 })] });
    voids.push({ kind: 'stair', id: 'store-door', joins: ['kitchen', 'store'], a: [-11.7, D, -25.6], b: [-11.7, D, -29.0], w: 1.0, h: 2.2 });
    rooms.push({ id: 'store', kind: 'store', carved: true, poly: rrect(-14.6, -8.8, -33.0, -28.4), round: 0.5, y: D, h: 2.6, ceil: 'vault', rise: 0.4, finish: 'hewn',
      doors: [{ at: [-11.7, -28.4], w: 1.0, swing: 'none' }] });
    voids.push({ kind: 'stair', id: 'east-door', joins: ['court'], a: [4.5, D, -23], b: [10.6, D, -23], w: 1.2, h: 2.4 });
    voids.push({ kind: 'stair', id: 'ecorr', a: [10.2, D, -16.0], b: [10.2, D, -32.4], w: 1.4, h: 2.6 });
    rooms.push({ id: 'shrine', kind: 'shrine', carved: true, poly: rrect(7.4, 13.4, -18.0, -14.0), round: 0.5, y: D, h: 2.7, ceil: 'dome', rise: 0.7, finish: 'plaster',
      doors: [{ at: [10.2, -18.0], w: 1.4, swing: 'none' }] });
    put(rooms, voids, sroom('serv1', 'cell', 10.2, 1, -21.2, D, 3.6, 3.6));
    put(rooms, voids, sroom('serv2', 'cell', 10.2, 1, -26.2, D, 3.6, 3.6));
    rooms.push({ id: 'cistern', kind: 'cistern', carved: true, poly: rrect(7.0, 13.4, -34.6, -31.4), round: 0.6, y: D, h: 2.8, ceil: 'vault', rise: 0.7, finish: 'plaster',
      doors: [{ at: [10.2, -31.4], w: 1.4, swing: 'none' }], fixtures: [fx('pool', 'pool', 10.2, -33.8, 4.4, 1.0, { h: 0.5 })] });
    return { rooms: rooms, voids: voids };
  }
  const EB = estateB();
  /* THE KIVA, sunk below a floor (the sheet's ground, or a temple's pit): a round room with a flat back wall (the altar's), a bench
     terrace carved round it at bench height (a void room off the walk map), the roof hatch over the hearth with the ladder leaning
     out of it (its walk strip from 5 cm outside the hatch's rim, where the floor stops, 3.6 m down in 1.55 m: as steep as a walker
     climbs; a walker keeps to the higher floor across the overlap, so on a ladder it stays this small), the deflector and the
     ventilator (a low tunnel to a shaft up to the floor above), the sipapu, and the great incense burner where Ranj is burned.
     0.9 m of earth or rock over its dome. (cx, cz): the hatch; y0: the floor it is sunk in; wells: its hatch and vent open through
     the sheet's ground (a kiva in a pit opens into the pit's air: no wells) */
  function kivaPlan(cx, cz, y0, wells) {
    const P = function (x, z) { return [cx + x, cz + z]; }, Y = y0 - 3.6;
    const room = { id: 'kiva', kind: 'kiva', carved: true, poly: dee(2.9, 2.4, 16, cx, cz), y: Y, h: 2.2, ceil: 'dome', rise: 0.5, finish: 'plaster', doors: [],
      fixtures: [
        fx('ladder', 'ladder', cx, cz + 0.3, 0.8, 0.5, { reach: true, clearance: { front: 0.8, back: 0.8 } }),
        fx('hearth', 'hearth', cx, cz + 1.5, 0.9, 0.9, { h: 0.3 }),
        fx('deflector', 'deflector', cx, cz + 2.15, 1.2, 0.25, { h: 1.1 }),
        fx('ventilator', 'ventilator', cx, cz + 2.6, 0.7, 0.45, { h: 1.4 }),
        fx('burner', 'incense-burner', cx - 1.9, cz + 0.6, 1.1, 1.1, { h: 1.3 }),
        fx('sipapu', 'sipapu', cx + 1.0, cz - 0.9, 0.3, 0.3, { h: 0.02 })] };
    const voids = [
      { kind: 'room', id: 'bench', poly: dee(3.4, 4.28, 18, cx, cz), y: y0 - 3.15, h: 1.7, ceil: 'dome', rise: 0.4, r: 0, finish: 'plaster', floor: false },
      { kind: 'shaft', id: 'hatch', joins: ['kiva'], c: P(0, 0), y0: y0 - 1.6, y1: y0 + 0.6, r0: 0.9, r1: 0.9 },
      { kind: 'stair', id: 'vent-tunnel', joins: ['kiva'], a: [cx, Y + 0.2, cz + 2.6], b: [cx, Y + 0.2, cz + 3.9], w: 0.5, h: 0.6, floor: false },
      { kind: 'shaft', id: 'vent', joins: ['kiva'], c: P(0, 3.9), y0: Y + 0.2, y1: y0 + 0.6, r0: 0.28, r1: 0.3 },
      { kind: 'walk', id: 'ladder', a: [cx, y0, cz - 0.95], b: [cx, Y, cz + 0.6], w: 0.8 }];
    if (wells) voids.push({ kind: 'well', id: 'hatch-top', c: P(0, 0), r: 0.9, rim: 0.3 }, { kind: 'well', id: 'vent-top', c: P(0, 3.9), r: 0.3, rim: 0.2 });
    return { rooms: [room], voids: voids };
  }
  const KIVA = kivaPlan(0, 0, 0, true);
  /* THE TEMPLE, cut from one rock (Ellora's Kailasa; the board's temple_massing and temple-body): a gateway tunnel through the
     face into a pit cut down from the top of the rock; in the pit the rock left standing: a podium (its stair cut into its
     front), on it the sanctum's drum and four corner shrines, and two lamp pillars before it; the pit's side walls cut into
     cloisters behind rows of pillars left standing. The sanctum is open to the sky: the def draws a pierced lattice dome over
     it, lit from inside. The pit's floor and the podium's terrace are walk floors less the rock that stands on them; blocks
     keep a walker off the podium's sides at the pit's floor (it is no walk block itself: its stair is cut into it) */
  function temple() {
    const rooms = [], voids = [];
    voids.push({ kind: 'mass', id: 'rock', poly: rrect(-24, 24, -52, 0), y0: -0.5, y1: 15, cap: 1.5, rock: 'tuff', finish: 'raw' });
    voids.push({ kind: 'trench', id: 'pit', poly: rrect(-18, 18, -48, -8), y0: 0, y1: 18, finish: 'hewn', floor: false });
    voids.push({ kind: 'door', id: 'sky', c: [0, -28], y: 13, r: 30, h: 8 });
    voids.push({ kind: 'door', id: 'gate', c: [0, 0], y: 0, r: 2.4, h: 5.2 });
    voids.push({ kind: 'stair', id: 'gate-way', a: [0, 0, 1.4], b: [0, 0, -8.6], w: 3.6, h: 5.0 });
    voids.push({ kind: 'monolith', id: 'podium', poly: rrect(-9, 9, -40, -16), y0: 0, y1: 6, block: false, finish: 'polished' });
    voids.push({ kind: 'monolith', id: 'drum', poly: circle(6.2, 28, 0, -30), y0: 6, y1: 11, block: false, finish: 'polished' });
    [[-6.6, -19], [6.6, -19], [-6.6, -37], [6.6, -37]].forEach(function (p, i) { voids.push({ kind: 'monolith', id: 'shrine' + i, poly: circle(1.6, 16, p[0], p[1]), y0: 6, y1: 9, finish: 'polished' }); });
    [-11, 11].forEach(function (x, i) { voids.push({ kind: 'monolith', id: 'stambha' + i, poly: circle(0.6, 12, x, -12), y0: 0, y1: 12, finish: 'polished' }); });
    voids.push({ kind: 'stair', id: 'steps', a: [0, 0, -15.4], b: [0, 6, -22.0], w: 3.0, h: 6.5 });
    rooms.push({ id: 'sanctum', kind: 'shrine', carved: true, poly: circle(5.0, 24, 0, -30), y: 6, h: 6.5, ceil: 'flat', finish: 'polished',
      doors: [{ at: [0, -25], w: 1.8, swing: 'none' }] });
    voids.push({ kind: 'stair', id: 'sanctum-door', joins: ['sanctum'], a: [0, 6, -23.0], b: [0, 6, -25.8], w: 1.8, h: 3.4 });
    /* a kiva sunk in the pit's floor on its east side, between the podium and the cloister */
    const K = kivaPlan(13.2, -28, 0, false);
    K.rooms.forEach(function (r) { rooms.push(r); });
    K.voids.forEach(function (v) { voids.push(v); });
    /* the cloisters, west and east: halls cut into the pit's side walls, open to the pit behind their pillars (left standing after) */
    [-1, 1].forEach(function (s) {
      const R = { id: s < 0 ? 'cloisterW' : 'cloisterE', kind: 'hall', carved: true, poly: s < 0 ? rrect(-22.5, -17, -44, -12) : rrect(17, 22.5, -44, -12), round: 0.3, y: 0, h: 4.2, ceil: 'flat', finish: 'hewn', doors: [], fixtures: [] };
      for (let z = -14; z >= -42; z -= 4) {
        voids.push({ kind: 'monolith', id: 'pillar' + (s < 0 ? 'W' : 'E') + (-z), poly: circle(0.45, 10, s * 17.9, z), y0: 0, y1: 4.4, phase: 3, finish: 'hewn' });
        R.fixtures.push(fx('pillar' + (-z), 'pillar', s * 17.9, z, 0.9, 0.9, { h: 4.2 }));
      }
      rooms.push(R);
    });
    /* the walk: the pit's floor less the podium and the lamp pillars; the terrace less the stair's slot and the drum; the podium's sides */
    voids.push({ kind: 'floor', id: 'pit-floor', poly: rrect(-17.7, 17.7, -47.7, -8.3), y: 0, holes: [rrect(-9.3, 9.3, -40.3, -15.7), circle(1.0, 12, -11, -12), circle(1.0, 12, 11, -12), rrect(12.3, 14.1, -28.9, -27.1), circle(0.45, 10, 13.2, -24.1)], tag: 'cavern:floor' });   /* the holes a margin wider: the mesh rounds a pillar fatter at its foot */
    voids.push({ kind: 'floor', id: 'terrace', poly: rrect(-8.7, 8.7, -39.7, -16.3), y: 6, holes: [rrect(-1.5, 1.5, -16.3, -22.0), circle(6.25, 28, 0, -30)] });
    [[-9, -1.5, -16.3, -16], [1.5, 9, -16.3, -16], [-9, 9, -40, -39.7], [-9, -8.7, -40, -16], [8.7, 9, -40, -16]].forEach(function (b, i) { voids.push({ kind: 'block', id: 'podium-side' + i, box: [b[0], b[1], b[2], b[3], 0, 5.9] }); });
    return { rooms: rooms, voids: voids };
  }
  const TEMPLE = temple();
  /* THE COUNCIL, after Ellora's Kailasa, cut down into the ground (the board's 066f9f for its carving): a pit 36 x 58 m and
     12 m deep, reached down a sunken lane and a tunnel through its front wall (the gatehouse). In the pit the rock left standing:
     the council hall's monolith (a podium 6 m high, the council chamber carved in it above, entered by two stairs cut into the
     podium's flanks; a tiered tower drawn on its roof, which is the ground's level), the pavilion before it (the Serpent's
     shrine), two bridges of rock joining the chamber to the pavilion and the pavilion to a gallery carved in the gatehouse,
     two lamp pillars; the pit's side walls cut into cloisters behind pillars. SUNK (no rock block). The pit's floor and the
     bridges are walk floors (less the rock standing on them) */
  function council() {
    const Z = function (v) { return v - 12; }, R = function (x0, x1, z0, z1) { return rrect(x0, x1, Z(z0), Z(z1)); }, Y = -12, U = -5.5;
    const rooms = [], voids = [
      { kind: 'trench', id: 'pit', poly: R(-18, 18, -32, 26), y0: Y, y1: 1, finish: 'hewn', floor: false },
      /* the pit opens through the ground: four overlapping wells along it (one circle round it all would hole the ground far past its corners) */
      { kind: 'well', id: 'pit0', c: [0, Z(-22.5)], r: 21, rim: 1.0 }, { kind: 'well', id: 'pit1', c: [0, Z(-7.5)], r: 21, rim: 1.0 },
      { kind: 'well', id: 'pit2', c: [0, Z(7.5)], r: 21, rim: 1.0 }, { kind: 'well', id: 'pit3', c: [0, Z(22.5)], r: 21, rim: 1.0 },
      /* the lane: a sunken cutting (three wells) to the tunnel's head; the tunnel down through the front wall */
      { kind: 'well', id: 'lane0', c: [0, Z(50)], r: 3, rim: 0.5 }, { kind: 'well', id: 'lane1', c: [0, Z(45)], r: 3, rim: 0.5 }, { kind: 'well', id: 'lane2', c: [0, Z(40)], r: 3, rim: 0.5 },
      { kind: 'stair', id: 'approach', a: [0, 0, Z(52.5)], b: [0, Y, Z(25.4)], w: 2.4, h: 3.2, floor: false },
      { kind: 'walk', id: 'approach-walk', a: [0, 0.02, Z(53.15)], b: [0, Y, Z(25.4)], w: 1.8 },
      /* the rock left standing */
      { kind: 'monolith', id: 'hall', poly: R(-11, 11, -26, 2), y0: Y, y1: 0, block: false, finish: 'polished' },
      { kind: 'monolith', id: 'pavilion-rock', poly: R(-4, 4, 8, 15), y0: Y, y1: -1.5, block: false, finish: 'polished' },
      { kind: 'monolith', id: 'bridge-front', poly: R(-2, 2, 15, 26.2), y0: -7, y1: U, block: false, finish: 'polished' },
      { kind: 'monolith', id: 'bridge-hall', poly: R(-2, 2, 2, 8), y0: -7, y1: U, block: false, finish: 'polished' }];
    [-8, 8].forEach(function (x, i) { voids.push({ kind: 'monolith', id: 'stambha' + i, poly: circle(0.8, 12, x, Z(19)), y0: Y, y1: 4, finish: 'polished' }); });
    /* the chamber in the hall's monolith: a pillared hall, the dais at its back */
    const pil = [];
    [-6, -2, 2, 6].forEach(function (x) { [-16, -8].forEach(function (z) { pil.push(fx('pillar' + pil.length, 'pillar', x, Z(z), 0.9, 0.9, { h: 4.0 })); }); });
    rooms.push({ id: 'chamber', kind: 'hall', carved: true, poly: R(-8, 8, -22, -1), round: 0.4, y: U, h: 4.0, ceil: 'flat', finish: 'polished',
      doors: [{ at: [0, Z(-1)], w: 1.8, swing: 'none' }, { at: [-8, Z(-12)], w: 1.4, swing: 'none' }, { at: [8, Z(-12)], w: 1.4, swing: 'none' }],
      fixtures: pil.concat([fx('dais', 'dais', 0, Z(-20.5), 6, 2, { h: 0.4 })]) });
    rooms.push({ id: 'pavilion', kind: 'shrine', carved: true, poly: R(-2.8, 2.8, 9, 14), round: 0.4, y: U, h: 2.6, ceil: 'vault', rise: 0.3, finish: 'polished',
      doors: [{ at: [0, Z(9)], w: 1.4, swing: 'none' }, { at: [0, Z(14)], w: 1.4, swing: 'none' }] });
    rooms.push({ id: 'gallery', kind: 'antechamber', carved: true, poly: R(-5, 5, 26.3, 30), round: 0.4, y: U, h: 3.2, ceil: 'vault', rise: 0.4, finish: 'polished',
      doors: [{ at: [0, Z(26.3)], w: 1.4, swing: 'none' }] });
    /* the ways up: a stair cut into each flank of the podium, from the pit's floor into the chamber; doorways through the rock
       between the chamber, the bridges, the pavilion and the gallery */
    [-1, 1].forEach(function (s) { voids.push({ kind: 'stair', id: s < 0 ? 'stairW' : 'stairE', joins: ['chamber'], a: [s * 11.45, Y, Z(-6)], b: [s * 7.6, U, Z(-11.6)], w: 1.6, h: 2.8 }); });   /* its top 0.1 m inside the chamber's walk edge: a long overlap on so steep a stair leaves a step down too deep */
    voids.push({ kind: 'stair', id: 'hall-door', joins: ['chamber'], a: [0, U, Z(-1.6)], b: [0, U, Z(2.4)], w: 1.8, h: 2.8 });
    voids.push({ kind: 'stair', id: 'pavilion-back', joins: ['pavilion'], a: [0, U, Z(7.6)], b: [0, U, Z(9.6)], w: 1.4, h: 2.4 });
    voids.push({ kind: 'stair', id: 'pavilion-front', joins: ['pavilion'], a: [0, U, Z(13.4)], b: [0, U, Z(15.4)], w: 1.4, h: 2.4 });
    voids.push({ kind: 'stair', id: 'gallery-door', joins: ['gallery'], a: [0, U, Z(25.6)], b: [0, U, Z(26.9)], w: 1.4, h: 2.6 });
    /* the cloisters, west and east, behind pillars left standing */
    [-1, 1].forEach(function (s) {
      const C = { id: s < 0 ? 'cloisterW' : 'cloisterE', kind: 'hall', carved: true, poly: s < 0 ? R(-22.5, -17, -28, 22) : R(17, 22.5, -28, 22), round: 0.3, y: Y, h: 4.2, ceil: 'flat', finish: 'hewn', doors: [], fixtures: [] };
      for (let z = -26; z <= 20; z += 4) {
        voids.push({ kind: 'monolith', id: 'pillar' + (s < 0 ? 'W' : 'E') + (z + 30), poly: circle(0.45, 10, s * 17.9, Z(z)), y0: Y, y1: Y + 4.4, phase: 3, finish: 'hewn' });
        C.fixtures.push(fx('pillar' + (z + 30), 'pillar', s * 17.9, Z(z), 0.9, 0.9, { h: 4.2 }));
      }
      rooms.push(C);
    });
    /* the walk: the pit's floor less the rock standing on it; the bridges' tops */
    voids.push({ kind: 'floor', id: 'pit-floor', poly: R(-17.7, 17.7, -31.7, 25.7), y: Y, tag: 'cavern:floor',
      holes: [R(-11.3, 11.3, -26.3, 2.3), R(-4.3, 4.3, 7.7, 15.3), circle(1.2, 12, -8, Z(19)), circle(1.2, 12, 8, Z(19))] });
    voids.push({ kind: 'floor', id: 'bridge-hall-top', poly: R(-1.7, 1.7, 2.1, 7.9), y: U });
    voids.push({ kind: 'floor', id: 'bridge-front-top', poly: R(-1.7, 1.7, 15.1, 26.1), y: U });
    return { rooms: rooms, voids: voids };
  }
  const COUNCIL = council();
  /* THE CISTERN HALL (Chand Baori; Varanasi's ghats underground): a vaulted hall carved in the rock, its floor the basin 9 m
     below the way in; terraces of rock left standing step down to the still water on three sides (a stepwell); pillars rise from
     the water to the vault; a causeway of rock runs out to a platform where water is drawn. The landing inside the portal is
     the interiors room (its program wants a way to draw water); the hall itself is a void room off the walk map (its floor is
     under the water). The walk: the landing, the causeway and the platform */
  function cisternHall() {
    const rooms = [], voids = [], Y = -9;
    voids.push({ kind: 'mass', id: 'rock', poly: rrect(-16, 16, -34, 0), y0: -0.5, y1: 8, cap: 1.2, rock: 'tuff', finish: 'raw' });
    voids.push({ kind: 'door', id: 'portal', c: [0, 0], y: 0, r: 2.0, h: 3.4 });
    voids.push({ kind: 'stair', id: 'way-in', joins: ['landing'], a: [0, 0, 1.3], b: [0, 0, -2.2], w: 2.6, h: 3.2 });
    rooms.push({ id: 'landing', kind: 'cistern', carved: true, poly: rrect(-4, 4, -5.6, -1.6), round: 0.4, y: 0, h: 3.4, ceil: 'vault', rise: 0.4, finish: 'plaster',
      doors: [{ at: [0, -1.6], w: 2.4, swing: 'none' }, { at: [0, -5.6], w: 2.4, swing: 'none' }] });
    voids.push({ kind: 'room', id: 'hall', poly: rrect(-12, 12, -30, -5), y: Y, h: 13, ceil: 'vault', rise: 1.5, r: 0.8, finish: 'plaster', floor: false });
    /* the terraces: four steps of rock down to the water, each a U of three strips (west, east, back), 2 m wider than the one above */
    for (let k = 1; k <= 4; k++) {
      const top = -1.6 * k, w = 2 * k;
      voids.push({ kind: 'monolith', id: 'tierW' + k, poly: rrect(-12.2, -12 + w, -30.2, -5), y0: Y, y1: top, phase: 3, finish: 'hewn' });
      voids.push({ kind: 'monolith', id: 'tierE' + k, poly: rrect(12 - w, 12.2, -30.2, -5), y0: Y, y1: top, phase: 3, finish: 'hewn' });
      voids.push({ kind: 'monolith', id: 'tierB' + k, poly: rrect(-12.2, 12.2, -30.2, -30 + w), y0: Y, y1: top, phase: 3, finish: 'hewn' });
    }
    /* the causeway and the platform, rock left standing to the way in's level; the pillars from the water to the vault */
    voids.push({ kind: 'monolith', id: 'causeway', poly: rrect(-1.4, 1.4, -18.2, -5.2), y0: Y, y1: 0, phase: 3, finish: 'polished', block: false });
    voids.push({ kind: 'monolith', id: 'platform', poly: rrect(-3.5, 3.5, -22.5, -17.8), y0: Y, y1: 0, phase: 3, finish: 'polished', block: false });
    [-2.9, 2.9].forEach(function (x) { [-8, -12, -16].forEach(function (z) { voids.push({ kind: 'monolith', id: 'pillar' + (x < 0 ? 'W' : 'E') + (-z), poly: circle(0.55, 12, x, z), y0: Y, y1: 5.6, phase: 3, finish: 'polished' }); }); });
    voids.push({ kind: 'floor', id: 'causeway-top', poly: rrect(-1.1, 1.1, -18.2, -5.0), y: 0, tag: 'cavern:floor' });
    voids.push({ kind: 'floor', id: 'platform-top', poly: rrect(-3.2, 3.2, -22.2, -18.1), y: 0, tag: 'cavern:floor' });
    return { rooms: rooms, voids: voids };
  }
  const CISTERN = cisternHall();
  /* THE PORTAL (the board's 065e907; the capital's gate, at the outpost): a giant arched tunnel 10 m wide and 12 m high through a
     block of tuff, its ornate rim drawn by the def; inside, a rolling stone door 11 m across, rolled open into a channel cut in
     the tunnel's east side; beside the portal, terraced dwellings: three levels of cells cut in the face either side, their
     doorways on ledges (drawn, with ladders: the ledges are no walk). The walk: the tunnel's floor, end to end */
  function portal() {
    const rooms = [], voids = [];
    voids.push({ kind: 'mass', id: 'rock', poly: rrect(-24, 24, -36, 0), y0: -0.5, y1: 22, cap: 2.0, rock: 'tuff', finish: 'raw' });
    voids.push({ kind: 'door', id: 'front', c: [0, 0], y: 0, r: 6.2, h: 13 }, { kind: 'door', id: 'back', c: [0, -36], y: 0, r: 6.2, h: 13 });
    voids.push({ kind: 'tube', id: 'tunnel', pts: [[0, 0, 1.5], [0, 0, -37.5]], w: 10, h: 12, spring: 0.45, rock: 'tuff', finish: 'hewn', walkW: 8.6 });
    voids.push({ kind: 'room', id: 'door-channel', poly: rrect(4.4, 16.6, -12.6, -11.0), y: 0, h: 11.6, ceil: 'flat', r: 0.2, finish: 'hewn', floor: false });
    /* the terraced dwellings: cells at 2, 6 and 10 m either side, staggered, each with a doorway through the face */
    const lv = [[2, 12, 17.4], [6, 13.4, 18.8], [10, 11.6, 17.0]];
    [-1, 1].forEach(function (s) {
      lv.forEach(function (L, i) {
        const y = L[0], x0 = s < 0 ? -L[2] : L[1], x1 = s < 0 ? -L[1] : L[2], cx = (x0 + x1) / 2, id = 'cell' + (s < 0 ? 'W' : 'E') + i;
        rooms.push({ id: id, kind: 'cell', carved: true, poly: rrect(x0, x1, -5.6, -1.6), round: 0.4, y: y, h: 2.3, ceil: 'vault', rise: 0.4, finish: 'hewn',
          doors: [{ at: [cx, -1.6], w: 1.0, swing: 'none' }],
          fixtures: [fx('bed', 'bedshelf', cx, -5.15, 1.9, 0.8, { bed: 1, h: 0.45 }), fx('hearth', 'hearth', s < 0 ? x0 + 0.3 : x1 - 0.3, -3.6, 0.5, 0.7, { h: 0.9 })] });
        voids.push({ kind: 'stair', id: id + '-door', joins: [id], a: [cx, y, 0.5], b: [cx, y, -2.0], w: 1.0, h: 2.0, floor: false });
        voids.push({ kind: 'door', id: id + '-face', c: [cx, 0], y: y - 0.2, r: 0.8, h: 2.4 });
      });
    });
    return { rooms: rooms, voids: voids };
  }
  const PORTAL = portal();

  /* the shops' items (their helpers above: rrect, fx) */
  const SHOPS = [];
  TRADES.forEach(function (T) { SHOPS.push(shopCarved(T)); });
  TRADES.forEach(function (T) { SHOPS.push(shopBuilt(T)); });

  IX.sets.add({ set: 'zeijani', title: 'The Zeijani: carved, constructed and wooden (kits/zeijani)', culture: 'zeijani', wealth: 0.3, items: [
    /* ---------------- the wooden dwellings (the outpost, the hamlets, the villages) */
    { key: 'zj_hut_a', name: 'Round wattle hut on stilts', wealth: 0.2, types: HOME, lot: [8, 8],
      rooms: [{ id: 'hut', kind: 'cottage', poly: circle(2.55, 12), y: 0.6, h: 2.3, doors: [{ at: [0, 2.55], w: 0.85, swing: 'none' }] }],
      note: 'one round room on low stilts under a conical thatch; the cone\'s upper half is smoke space, not planned' },
    { key: 'zj_hut_b', name: 'Oval plank hut with a porch', wealth: 0.2, types: HOME, lot: [9, 10],
      rooms: [{ id: 'hut', kind: 'cottage', poly: oval(2.4, 3.1, 14, 0, -0.4), y: 0.4, h: 2.4, doors: [{ at: [0, 2.7], w: 0.9 }] }],
      note: 'the porch (z 2.7 to 4.2) is open: not planned' },
    { key: 'zj_hut_c', name: 'Lean-to with a carved back room', wealth: 0.15, types: HOME, lot: [10, 12],
      rooms: [
        { id: 'front', kind: 'kitchen', poly: rect(4.2, 3.0, 0, 0.9), y: 0.1, h: 2.2,
          doors: [{ at: [0, 2.4], w: 0.9 }, { id: 'back', at: [0, -0.6], w: 0.8, to: '.back', swing: 'out', leaf: false }] },
        { id: 'back', kind: 'cell', carved: true, poly: circle(1.8, 12, 0, -2.9), y: 0.1, h: 2.0, ceil: 'dome', rise: 0.5, finish: 'hewn',
          doors: [{ id: 'back', at: [0, -0.6], w: 0.8, to: '.front', swing: 'in' }],
          fixtures: [fx('bedshelf', 'bedshelf', -1.0, -3.0, 0.7, 1.6, { bed: 1, h: 0.45 })] }],
      /* the void plan (kits/zeijani carves it): the rock face the lean-to stands against, the doorway through it */
      voids: [
        { kind: 'mass', id: 'rock', poly: [[-4.5, -6.2], [4.5, -6.2], [4.5, -0.6], [-4.5, -0.6]], y0: -0.5, y1: 4.6, cap: 1.0, rock: 'tuff', finish: 'raw' },
        { kind: 'stair', id: 'pass', joins: ['back'], a: [0, 0.1, -1.7], b: [0, 0.1, 0.1], w: 0.9, h: 2.0, finish: 'hewn' },
        { kind: 'door', id: 'backdoor', c: [0, -0.6], y: 0.1, r: 1.1, h: 2.2 }],
      note: 'a timber lean-to against a rock face; behind it one round room cut in the rock, its bed shelf carved (a fixture)' },
    { key: 'zj_house_wood', name: 'Round timber house with a ribbed door', wealth: 0.5, types: HOME, lot: [11, 11],
      bodies: [{ id: 'house', poly: circle(4.4, 14), y: 0.5, levels: [{ h: 2.7 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [0, 4.4], w: 1.0 }], program: ['living', 'bedroom'] }],
      note: 'two rooms under a domed thatch; the loft in the dome is storage, not planned' },
    /* ---------------- the constructed houses (tuff block): the villages', the satellites' */
    { key: 'zj_house_built_poor', name: 'Domed tuff hut', wealth: 0.2, types: HOME, lot: [8, 8],
      rooms: [{ id: 'home', kind: 'cottage', poly: circle(2.45, 14), y: 0.15, h: 2.3, doors: [{ at: [0, 2.45], w: 0.9, swing: 'none' }] }],
      note: 'one round room under a corbelled dome of tuff blocks with a smoke hole' },
    { key: 'zj_house_built_mid', name: 'Three domes round a yard', wealth: 0.5, types: HOME, lot: [16, 11],
      rooms: [
        { id: 'yard', kind: 'court', poly: rrect(-2.8, 2.8, -0.3, 5.3), y: 0.02, h: 1.8,
          doors: [{ at: [0, 5.3], w: 1.2 }, { id: 'b', at: [0, -0.3], w: 0.9, to: '.back', swing: 'none' },
                  { id: 'w', at: [-2.8, 2.5], w: 0.9, to: '.west', swing: 'none' }, { id: 'e', at: [2.8, 2.5], w: 0.9, to: '.east', swing: 'none' }] },
        { id: 'back', kind: 'living', poly: circle(2.35, 14, 0, -2.9), y: 0.15, h: 2.4, doors: [{ id: 'b', at: [0, -0.55], w: 0.9, to: '.yard', swing: 'none' }] },
        { id: 'west', kind: 'bedroom', poly: circle(2.35, 14, -5.4, 2.5), y: 0.15, h: 2.4, doors: [{ id: 'w', at: [-3.05, 2.5], w: 0.9, to: '.yard', swing: 'none' }] },
        { id: 'east', kind: 'kitchen', poly: circle(2.35, 14, 5.4, 2.5), y: 0.15, h: 2.4, doors: [{ id: 'e', at: [3.05, 2.5], w: 0.9, to: '.yard', swing: 'none' }] }],
      note: 'three domed rooms (living, sleeping, cooking) opening on a walled yard; the yard\'s gate on the street' },
    { key: 'zj_house_built_rich', name: 'Two-storey house with a roof terrace', wealth: 0.8, types: HOME, lot: [12, 10],
      bodies: [{ id: 'house', poly: rect(10, 8), y: 0.3, levels: [{ h: 3.0 }, { h: 2.8 }], wall: 0.45, roof: 'flat',
        doors: [{ at: [0, 4], w: 1.2 }], program: [['hall', 'kitchen', 'store'], ['living', 'bedroom', 'bedroom']] }],
      note: 'tuff ashlar, two storeys planned by the interiors kit; the flat roof is a terrace with a domed pavilion (drawn, not planned)' },
    /* ---------------- the carved galleries of the poor (Cappadocian apartments going deep) */
    { key: 'zj_gallery_a', name: 'Gallery of cells: the spine', carved: true, wealth: 0.18, types: MULTI, units: 12, lot: [30, 56],
      rooms: GA.rooms, voids: GA.voids,
      note: 'a corridor descending in three levels (0, -3, -6 m) with twelve one-room cells (carved bed shelf and hearth niche); ' +
        'a hearth hall, a kiva sunk a metre with its great incense burner, a cistern at the bottom under an air shaft' },
    { key: 'zj_gallery_b', name: 'Gallery of cells: the well', carved: true, wealth: 0.18, types: MULTI, units: GB.units, lot: [32, 36],
      rooms: GB.rooms, voids: GB.voids, well: GB.well,
      note: 'a round shaft open to the sky, a spiral stair down its wall (1.5 turns, 9 m), ten cells off five landings and two off ' +
        'the entrance tunnel; a hearth hall and a cistern at the bottom' },
    /* ---------------- the wealthy estates carved in the hall's walls */
    { key: 'zj_estate_a', name: 'Carved estate: the columned hall', carved: true, wealth: 0.85, types: HOME, lot: [36, 40],
      rooms: EA.rooms, voids: EA.voids,
      note: 'a pillared reception hall behind a front of engaged columns; a court under its own light shaft; the family\'s corridor ' +
        '(living room, three bedrooms, the household shrine) and the service corridor (kitchen, two stores, two servants\' cells, the cistern)' },
    { key: 'zj_estate_b', name: 'Carved estate: the loggia', carved: true, wealth: 0.9, types: HOME, lot: [34, 36],
      rooms: EB.rooms, voids: EB.voids,
      note: 'two storeys: a round domed hall; upstairs a loggia behind five arched windows between the family\'s rooms; down a flight ' +
        'a court under a light shaft, the kitchen and store, the shrine, two servants\' cells and the cistern' },
    /* ---------------- the twelve shops, each in a carved and a constructed front */
  ].concat(SHOPS).concat([
    /* ---------------- civic */
    { key: 'zj_portal', name: 'The portal: the great gate in the cliff', carved: true, wealth: 0.5, types: ['civic', 'infrastructure'], residence: false, lot: [50, 40],
      rooms: PORTAL.rooms, voids: PORTAL.voids,
      note: 'a giant arched tunnel 10 m wide through the rock; a rolling stone door rolled into its side channel; three levels of cells either side, their doorways on ledges reached by ladders (no walk)' },
    { key: 'zj_council', name: 'The council: a hall cut from the rock in its pit', carved: true, wealth: 0.85, types: ['civic'], residence: false, lot: [46, 92],
      rooms: COUNCIL.rooms, voids: COUNCIL.voids,
      note: 'after Kailasa, cut down into the ground: a pit 12 m deep down a sunken lane and a tunnel through the gatehouse; the council hall left standing in it ' +
        '(the pillared chamber above, stairs in its flanks, a tiered tower on its roof), the pavilion, two bridges of rock to a gallery in the gatehouse, two lamp pillars, cloisters' },
    /* ---------------- sacred */
    { key: 'zj_temple', name: 'The temple: cut from one rock', carved: true, wealth: 0.8, types: ['religious'], residence: false, lot: [48, 52],
      rooms: TEMPLE.rooms, voids: TEMPLE.voids,
      note: 'a gateway into a pit cut from the top of the rock; the podium left standing in it with its stair, the sanctum\'s drum ' +
        '(open to the sky under a drawn lattice dome) and four corner shrines on it; two lamp pillars; cloisters behind pillars in the pit\'s side walls' },
    /* the kiva, sunk in the ground (no rock block: the cavern carves under the sheet's ground): a round room with a flat back
       wall (the altar's), a bench terrace carved round it at bench height (a void room off the walk map), the roof hatch over the
       hearth with the ladder leaning out of it (its walk strip from 5 cm outside the hatch's rim, where the ground stops, 3.6 m down in 1.55 m: as steep as a walker climbs; a walker keeps to the ground, the higher floor, across the overlap, so on a ladder it stays this small), the
       deflector and the ventilator (a low tunnel to a shaft up to the ground), the sipapu, and the great incense burner where
       Ranj is burned. The roof is 0.9 m of earth over the dome */
    { key: 'zj_kiva', name: 'Kiva', carved: true, wealth: 0.4, types: ['religious'], residence: false, lot: [10, 10],
      rooms: KIVA.rooms, voids: KIVA.voids,
      note: 'sunk 3.6 m in the ground under an earth roof; down the ladder through the hatch over the hearth; the bench terrace ' +
        'round the round wall, the altar against the flat back wall under the murals; the deflector, the ventilator, the sipapu, ' +
        'the great incense burner on the west side, where Ranj is burned' },
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
    /* the funeral catacombs (the Guanches laid their dead in lava-tube caves): a portal, a stair 4.5 m down to the mortuary
       chapel (a round room with a flat back wall: the altar under a frieze of the dead), loculi corridors east and west lined
       with bones, an ossuary chamber at each end (boxes, mummy bundles, stacked bones), the Keeper's cell off the west corridor */
    { key: 'zj_catacomb', name: 'Funeral catacombs', carved: true, wealth: 0.3, types: ['funerary', 'religious'], residence: false, lot: [32, 26],
      rooms: [
        { id: 'chapel', kind: 'shrine', carved: true, poly: dee(3.0, 2.6, 16, 0, -12), y: -4.5, h: 2.8, ceil: 'dome', rise: 0.9, finish: 'plaster',
          doors: [{ at: [0, -9.0], w: 1.6, swing: 'none' }, { at: [-3.0, -12], w: 1.4, swing: 'none' }, { at: [3.0, -12], w: 1.4, swing: 'none' }] },
        { id: 'ossW', kind: 'ossuary', carved: true, poly: rrect(-14.6, -10.2, -14.6, -9.4), round: 0.5, y: -4.5, h: 2.5, ceil: 'vault', rise: 0.5, finish: 'hewn',
          doors: [{ at: [-10.2, -12], w: 1.4, swing: 'none' }] },
        { id: 'ossE', kind: 'ossuary', carved: true, poly: rrect(10.2, 14.6, -14.6, -9.4), round: 0.5, y: -4.5, h: 2.5, ceil: 'vault', rise: 0.5, finish: 'hewn',
          doors: [{ at: [10.2, -12], w: 1.4, swing: 'none' }] },
        { id: 'keeper', kind: 'cell', carved: true, poly: rrect(-8.4, -4.4, -19.0, -15.4), round: 0.4, y: -4.5, h: 2.3, ceil: 'vault', rise: 0.45, finish: 'hewn',
          doors: [{ at: [-6.4, -15.4], w: 1.0, swing: 'none' }],
          fixtures: [fx('bed', 'bedshelf', -7.95, -17.4, 0.8, 1.9, { bed: 1, h: 0.45 }), fx('hearth', 'hearth', -5.4, -18.7, 0.7, 0.5, { h: 0.9 })] }],
      voids: [
        { kind: 'mass', id: 'rock', poly: rrect(-16, 16, -24, 0), y0: -0.5, y1: 6, cap: 1.0, rock: 'tuff', finish: 'raw' },
        { kind: 'door', id: 'portal', c: [0, 0], y: 0, r: 1.4, h: 2.7 },
        { kind: 'stair', id: 'way-in', a: [0, 0, 1.2], b: [0, 0, -2.0], w: 1.6, h: 2.6 },
        { kind: 'stair', id: 'descent', joins: ['chapel'], a: [0, 0, -1.8], b: [0, -4.5, -9.6], w: 1.6, h: 2.5 },
        { kind: 'stair', id: 'west', joins: ['chapel', 'ossW'], a: [-2.5, -4.5, -12], b: [-11.0, -4.5, -12], w: 1.4, h: 2.3 },
        { kind: 'stair', id: 'east', joins: ['chapel', 'ossE'], a: [2.5, -4.5, -12], b: [11.0, -4.5, -12], w: 1.4, h: 2.3 },
        { kind: 'stair', id: 'keeper-door', joins: ['keeper'], a: [-6.4, -4.5, -12.2], b: [-6.4, -4.5, -15.9], w: 1.0, h: 2.1 }],
      note: 'down 4.5 m to the mortuary chapel; the loculi corridors lined with bones; an ossuary chamber at each end; the Keeper\'s cell' },
    { key: 'zj_cistern', name: 'The cistern hall: a stepwell under the rock', carved: true, wealth: 0.5, types: ['infrastructure'], residence: false, lot: [32, 34],
      rooms: CISTERN.rooms, voids: CISTERN.voids,
      note: 'a vaulted hall 9 m deep: terraces of rock step down on three sides to the still water, pillars rise from the water, a causeway to a platform; the landing inside the portal is where water is drawn' }
  ]) });
})(KratorInteriors);
