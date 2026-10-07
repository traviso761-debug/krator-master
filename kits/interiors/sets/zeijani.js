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
    /* ---------------- the carved galleries of the poor (Cappadocian apartments going deep) */
    { key: 'zj_gallery_a', name: 'Gallery of cells: the spine', carved: true, wealth: 0.18, types: MULTI, units: 12, lot: [30, 56],
      rooms: GA.rooms, voids: GA.voids,
      note: 'a corridor descending in three levels (0, -3, -6 m) with twelve one-room cells (carved bed shelf and hearth niche); ' +
        'a hearth hall, a kiva sunk a metre with its great incense burner, a cistern at the bottom under an air shaft' },
    { key: 'zj_gallery_b', name: 'Gallery of cells: the well', carved: true, wealth: 0.18, types: MULTI, units: GB.units, lot: [32, 36],
      rooms: GB.rooms, voids: GB.voids, well: GB.well,
      note: 'a round shaft open to the sky, a spiral stair down its wall (1.5 turns, 9 m), ten cells off five landings and two off ' +
        'the entrance tunnel; a hearth hall and a cistern at the bottom' },
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
