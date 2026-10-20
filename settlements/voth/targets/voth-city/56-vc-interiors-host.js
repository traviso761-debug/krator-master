/* ============================== 6b. HOST: THE CANTONS' INTERIORS AND THE CUTAWAY ============================== */
/* [draw] The interiors (40-vc-interiors.js VC.INT) are drawn on demand: the first time a canton is cut away or walked
   into, its shell (floors, walls, ceilings, the core's steps) is drawn as one InstancedMesh of boxes, and its rooms are
   furnished by kits/interiors (furnishRoom over the catalog: IX.catalogAdapter) and drawn instanced, one InstancedMesh
   per piece and part. The room kinds the cantons need and kits/interiors does not have are added to its programs here.

   THE CUTAWAY (owner: "Add cutaway mode to city viewer"): X (or the cutaway button) cuts the canton nearest the view's
   middle open: a section through it at a storey (PageUp/PageDown, or [ and ], step the storey), so its rooms show from
   above. Five clipping planes, intersected, on every material in the scene clip what is above the cut inside the
   canton's square only; the planes are set once and moved, so nothing recompiles as the storey changes. The lot
   buildings in view round it are cut too, by a height grid (56b-vc-building-interiors-host.js VC.CUTALL). The keys, the
   bar and the planes are core/host's (99-host-cutaway.js, since 2026-10-16); what a cut shows is still this file's. */
VC.INTD = { built: {}, groups: {}, furnished: {}, cut: { on: false, canton: null, storey: 0 }, planes: null, programs: false };

/* ---------------------------------------------------------------- the room kinds the cantons add to kits/interiors */
VC.intPrograms = function () {
  var IX = window.KratorInteriors; if (!IX || VC.INTD.programs) return IX; VC.INTD.programs = true;
  var SEATS = IX.SEAT_TYPES, SURF = IX.SURFACE_GROUP;
  var P = IX.PROGRAMS;
  P.armoury = { require: [{ need: 'racks', types: ['weapon', 'rack'], n: 2 }], optional: [{ types: ['weapon', 'rack'], max: 4 }, { types: ['storage'], max: 2 }, { types: ['workstation'], max: 1 }, { types: ['lamp'], max: 1 }], extra: 5 };
  P.mess = { require: [{ need: 'tables', types: ['table'], n: 2 }, { need: 'seats', types: SEATS, n: 4 }], optional: [{ types: ['table'], max: 2 }, { types: SEATS, max: 6 }, { types: ['storage', 'stack'], max: 2 }, { types: ['lamp', 'brazier'], max: 2 }, SURF], extra: 5 };
  P.office = { require: [{ need: 'desk', types: ['desk'], n: 1 }, { need: 'seat', types: ['chair'], n: 1 }], optional: [{ types: ['shelf', 'storage'], max: 2 }, { types: ['desk', 'table'], max: 1 }, { types: SEATS, max: 2 }, { types: ['lamp'], max: 1 }, { types: ['art', 'banner'], max: 1 }, SURF], extra: 6 };
  P.guildhall = { require: [{ need: 'table', types: ['table'], n: 1 }, { need: 'seats', types: SEATS, n: 4 }], optional: [{ types: ['banner', 'art', 'statue'], max: 3 }, { types: ['shelf', 'storage'], max: 2 }, { types: ['lamp', 'brazier'], max: 2 }, SURF], extra: 6 };
  P.reception = { require: [{ need: 'seats', types: SEATS, n: 3 }, { need: 'table', types: ['table'], n: 1 }], optional: [{ types: ['art', 'banner', 'statue', 'screen'], max: 4 }, { types: ['rug'], max: 1 }, { types: ['lamp'], max: 2 }, SURF], extra: 6 };
  P.bakery = { require: [{ need: 'oven', types: ['stove'], n: 1 }, { need: 'table', types: ['table', 'workstation', 'counter'], n: 1 }, { need: 'food', types: ['storage', 'vessel', 'stack'], roles: IX.FOOD_ROLES, n: 1 }],
               optional: [{ types: ['stove'], max: 1 }, { types: ['storage', 'stack', 'shelf'], max: 3 }, SURF], extra: 5 };
  P.granary = { require: [{ need: 'bins', types: ['storage', 'stack'], n: 3 }], optional: [{ types: ['storage', 'stack'], max: 8 }, { types: ['rack'], max: 1 }], extra: 4 };
  P.warehouse = { require: [{ need: 'goods', types: ['storage', 'stack'], n: 3 }], optional: [{ types: ['storage', 'stack', 'rack', 'shelf'], max: 10 }, { types: ['desk'], max: 1 }], extra: 4 };
  P.training = { require: [{ need: 'dummies', types: ['tool'], n: 2 }, { need: 'racks', types: ['weapon', 'rack'], n: 1 }], optional: [{ types: ['tool'], max: 3 }, { types: ['weapon', 'rack'], max: 2 }, { types: ['bench'], max: 2 }], extra: 8 };
  P.cell = { require: [{ need: 'grate', types: ['screen'], n: 1 }, { need: 'cot', types: ['bed'], n: 1 }], optional: [{ types: ['vessel'], max: 1 }], extra: 30 };
  P.catacomb = { require: [{ need: 'niches', types: ['shelf'], n: 4 }], optional: [{ types: ['shelf'], max: 40 }, { types: ['shrine', 'lamp'], max: 6 }], extra: 6 };
  P.tomb = { require: [{ need: 'sarcophagus', types: ['tomb'], n: 1 }], optional: [{ types: ['tomb'], max: 2 }, { types: ['shelf', 'shrine'], max: 3 }, { types: ['lamp'], max: 1 }], extra: 9 };
  /* the Palace's and the Temple's state rooms (40b-vc-suites.js; owner, 2026-10-15: "barely any seating or wall art ...
     make it ornate"): each with its seating required, and art, hangings, plants, statues and lamps to spare */
  var ART = { types: ['art', 'banner'], max: 6 }, LAMPS = { types: ['lamp', 'brazier'], max: 6 }, FOODR = IX.FOOD_ROLES;
  P.foyer = { require: [{ need: 'seats', types: SEATS, n: 6 }, { need: 'plants', types: ['planter'], n: 4 }], optional: [{ types: ['statue'], max: 4 }, { types: ['table'], max: 2 }, LAMPS, { types: ['rug'], max: 3 }, ART], extra: 12 };
  P.banquet = { require: [], optional: [ART, LAMPS, { types: ['statue'], max: 4 }, { types: ['planter'], max: 6 }, { types: ['storage', 'shelf'], max: 2 }], extra: 14 };
  P.throne = { require: [{ need: 'benches', types: ['bench', 'seating'], n: 6 }], optional: [{ types: ['statue'], max: 4 }, { types: ['planter'], max: 4 }, LAMPS, ART], extra: 14 };
  P.judgment = { require: [{ need: 'benches', types: ['bench', 'seating'], n: 10 }, { need: 'desks', types: ['desk', 'table'], n: 2 }], optional: [{ types: SEATS, max: 10 }, LAMPS, ART, { types: ['shelf'], max: 2 }], extra: 8 };
  P.apartment = { require: [{ need: 'divans', types: ['seating'], n: 2 }, { need: 'table', types: ['table'], n: 1 }, { need: 'seats', types: ['chair'], n: 2 }],
                  optional: [{ types: ['storage', 'shelf'], max: 4 }, { types: ['screen'], max: 2 }, { types: ['planter'], max: 3 }, { types: ['statue'], max: 2 }, LAMPS, { types: ['rug'], max: 3 }, ART, { types: ['desk'], max: 1 }, { types: ['stove'], max: 1 }], extra: 6 };
  P.guest = { require: [{ need: 'bed', types: ['bed'], n: 1 }, { need: 'chest', types: ['storage'], roles: IX.ITEM_ROLES, n: 1 }], optional: [{ types: SEATS, max: 3 }, { types: ['table'], max: 1 }, { types: ['screen'], max: 1 }, { types: ['rug'], max: 2 }, ART, LAMPS], extra: 5 };
  P.scriptorium = { require: [{ need: 'desks', types: ['desk'], n: 4 }], optional: [{ types: ['desk'], max: 4 }, { types: ['shelf'], max: 6 }, { types: ['chair'], max: 8 }, LAMPS, ART], extra: 4 };
  P.highpriest = { require: [{ need: 'desk', types: ['desk'], n: 1 }, { need: 'seats', types: SEATS, n: 3 }, { need: 'screens', types: ['screen'], n: 2 }],
                   optional: [{ types: ['shelf', 'storage'], max: 3 }, { types: ['shrine'], max: 1 }, { types: ['statue'], max: 1 }, { types: ['rug'], max: 2 }, ART, LAMPS, { types: ['screen'], max: 3 }], extra: 5 };
  P.vestry = { require: [{ need: 'stores', types: ['storage'], n: 4 }], optional: [{ types: ['rack'], max: 3 }, { types: ['shelf'], max: 3 }, ART], extra: 6 };
  P.sanctuary = { require: [{ need: 'pews', types: ['bench', 'seating'], n: 12 }, { need: 'shrines', types: ['shrine', 'altar'], n: 2 }], optional: [LAMPS, { types: ['statue'], max: 2 }, ART], extra: 10 };
  P.atrium = { require: [{ need: 'benches', types: ['bench', 'seating'], n: 6 }, { need: 'plants', types: ['planter'], n: 4 }], optional: [{ types: ['statue'], max: 2 }, ART, LAMPS], extra: 12 };
  P.greatkitchen = { require: [{ need: 'hearths', types: ['stove'], n: 4 }, { need: 'tables', types: ['table', 'workstation', 'counter'], n: 3 }, { need: 'food', types: ['storage', 'vessel', 'stack'], roles: FOODR, n: 4 }],
                     optional: [{ types: ['storage', 'stack'], max: 8 }, { types: ['shelf'], max: 4 }, { types: ['rack'], max: 3 }, { types: ['vessel'], anchor: 'surface', max: 8 }, { types: ['stove'], max: 2 }], extra: 4 };
  /* the blueprint's courts and baths (40d-vc-blueprint.js) */
  P.court = { require: [{ need: 'plants', types: ['planter'], n: 2 }], optional: [{ types: ['bench', 'seating'], max: 4 }, { types: ['statue'], max: 1 }, { types: ['planter'], max: 6 }], extra: 20 };
  P.bath = { require: [], optional: [{ types: ['storage'], max: 2 }, { types: ['planter'], max: 2 }, { types: ['lamp', 'brazier'], max: 3 }, { types: ['bench', 'seating'], max: 2 }], extra: 12 };
  var A = IX.KIND_ALIAS;
  A.court = ['yard', 'garden', 'court', 'hall']; A.bath = ['bedroom', 'hall', 'shrine'];
  A.foyer = ['hall', 'court', 'antechamber']; A.banquet = ['hall', 'tavern', 'court']; A.throne = ['court', 'hall', 'antechamber']; A.judgment = ['court', 'hall', 'study', 'school'];
  A.apartment = ['bedroom', 'hall', 'court', 'study']; A.guest = ['bedroom', 'hall']; A.scriptorium = ['study', 'library', 'school']; A.highpriest = ['study', 'court', 'hall', 'shrine', 'library'];
  A.vestry = ['store', 'shrine', 'study']; A.sanctuary = ['shrine', 'hall', 'temple']; A.atrium = ['court', 'hall', 'shrine', 'yard']; A.greatkitchen = ['kitchen', 'store', 'bakery'];
  A.armoury = ['barracks', 'smithy', 'shop', 'store']; A.mess = ['hall', 'tavern', 'barracks', 'kitchen']; A.office = ['study']; A.guildhall = ['hall', 'court'];
  A.reception = ['hall', 'antechamber', 'court']; A.bakery = ['kitchen']; A.granary = ['store', 'kitchen']; A.warehouse = ['store', 'shop', 'market'];
  A.training = ['barracks', 'yard', 'court']; A.cell = ['jail', 'barracks', 'dormitory', 'bedroom']; A.catacomb = ['tomb', 'shrine']; A.tomb = ['catacomb', 'shrine'];
  Object.keys(P).forEach(function (k) { if (IX.KIND_WEIGHT[k] == null) IX.KIND_WEIGHT[k] = 1.4; });
  return IX;
};

/* ---------------------------------------------------------------- furnishing a canton's rooms (kits/interiors)
   (owner, 2026-10-15: "we need waaaaaaay more furniture and decorative clutter ... barely any seating or wall art of any
   kind throughout the palace or temple ... make it ornate. the banquet hall needs actual tables and chairs fit for a
   feast"). Three passes a room:
   1. a set piece where the room has one (the banquet hall's feast: VC.suiteFeast), placed first and kept clear;
   2. the room's programme (kits/interiors furnishRoom; the state rooms' own below), the suites' fixtures (pillars,
      daises, the basin, braziers, statues, grand stairs) kept clear; not in a suite's big rooms, which the dressing lays out;
   3. the dressing (VC.intDress: hangings and art on the walls, seats, cabinets, plants and statues along them, groups of
      seats, rows of benches, desks or work tables in the middle, by TUNE.interiors.dress.kinds), clear of everything before.
   A large room is planned on a coarser grid (TUNE.interiors.cellBig) so the placer stays quick.
   STOREY BY STOREY (the Palace's 2,100 rooms and 115,000 pieces took 10-20 s on its first view): VC.intFurnish(cn, si)
   furnishes one storey's rooms (cached), VC.intFurnishStep a few of them within a time budget (the lazy queue's, below
   VC.drawInterior), VC.intFurnish(cn) every storey, its placements in the rooms' order. A room's pieces depend on the room
   alone (its seed is its corner and storey; the catalog's and the dressing's caches are keyed by piece), so a storey
   furnished alone, in any order, gives what one pass over all the rooms gave. */
VC.intFurnishNone = function () { return { placements: [], rooms: 0, missing: 0, ms: 0, dressed: 0, feast: 0 }; };
VC.intStoreysOf = function (P) { var s = {}; P.rooms.forEach(function (r) { s[r.storey || 0] = 1; }); return Object.keys(s).map(Number).sort(function (a, b) { return a - b; }); };
VC.intFurnish = function (cn, si) {
  var IX = VC.intPrograms(), P = VC.INT.cantons[cn];
  if (!IX || !P || typeof ROOM === 'undefined') return VC.intFurnishNone();
  var C = VC.INTD.furnished[cn] || (VC.INTD.furnished[cn] = { st: {}, all: null });
  if (si != null) { VC.intFurnishStep(cn, si, Infinity); return C.st[si].out; }
  if (C.all) return C.all;
  var by = {}, all = VC.intFurnishNone();
  VC.intStoreysOf(P).forEach(function (s) {
    var o = VC.intFurnish(cn, s);
    ['rooms', 'missing', 'ms', 'dressed', 'feast'].forEach(function (k) { all[k] += o[k]; });
    if (o.errors) { all.errors = (all.errors || 0) + o.errors; if (!all.firstError) all.firstError = o.firstError; }
    o.placements.forEach(function (p) { (by[p.room] = by[p.room] || []).push(p); });
  });
  P.rooms.forEach(function (r) { (by[r.id] || []).forEach(function (p) { all.placements.push(p); }); });
  return (C.all = all);
};
/* furnish storey si's rooms until `budget` ms are spent; true when the storey is done */
VC.intFurnishStep = function (cn, si, budget) {
  var C = VC.INTD.furnished[cn] || (VC.INTD.furnished[cn] = { st: {}, all: null }), P = VC.INT.cantons[cn];
  var S = C.st[si] || (C.st[si] = { rooms: P.rooms.filter(function (r) { return (r.storey || 0) === +si; }), k: 0, out: VC.intFurnishNone(), done: false });
  if (S.done) return true;
  var X = C.ctx || (C.ctx = VC.intFurnishCtx(cn, P)), t0 = performance.now();
  while (S.k < S.rooms.length) { VC.intFurnishRoom(X, S.rooms[S.k++], S.out); if (performance.now() - t0 > budget) break; }
  S.out.ms += performance.now() - t0;
  if (S.k >= S.rooms.length) { S.done = true; S.out.ms = Math.round(S.out.ms); }
  return S.done;
};
/* what every room of a canton shares: the catalog, the canton's wealth, the suite's decor by room */
VC.intFurnishCtx = function (cn, P) {
  var IX = VC.intPrograms(), cat = VC.INTD.catalog || (VC.INTD.catalog = IX.catalogAdapter()), T = TUNE.interiors;
  var SU = P.suite, decorBy = {};
  if (SU) SU.decor.forEach(function (d) { (decorBy[d.room] = decorBy[d.room] || []).push(d); });
  var fx = function (id, x, z, ry, w, d) { return { id: id, kind: 'fixture', x: x, z: z, ry: ry || 0, w: Math.max(0.3, w), d: Math.max(0.3, d) }; };
  return { cn: cn, P: P, cat: cat, T: T, wealth: T.wealth[cn] == null ? 0.5 : T.wealth[cn], SU: SU, decorBy: decorBy, fx: fx,
           pieceFx: function (p, i) { var D = cat.dims(p.key, p.variant || 0) || { w: 1, d: 1 }; return fx('placed.' + i, p.x, p.z, p.ry || 0, D.w + 0.1, D.d + 0.1); } };
};
VC.intFurnishRoom = function (X, r, out) {
  var cn = X.cn, P = X.P, cat = X.cat, T = X.T, wealth = X.wealth, SU = X.SU, decorBy = X.decorBy, fx = X.fx, pieceFx = X.pieceFx;
  var q = TUNE.interiors.wallT / 2 + 0.02;   /* 2 cm off the wall's face: a piece's back flush with it would fight it */
  var poly = [[r.x0 + q, r.z0 + q], [r.x1 - q, r.z0 + q], [r.x1 - q, r.z1 - q], [r.x0 + q, r.z1 - q]];
  var doors = r.door ? [{ at: [CANT.cl(r.door.x, r.x0 + q, r.x1 - q), CANT.cl(r.door.z, r.z0 + q, r.z1 - q)], w: r.door.w, to: 'hall' }] : [];
  /* a suite's room: its doors are the suite's doors on its walls; its fixtures the suite's decor in it */
  var fixtures = [], specId = r.great && SU ? String(r.id).slice(cn.length + 1) : null;
  /* a blueprint room (40d-vc-blueprint.js): its doors are the blueprint's on its walls, its wealth its decor level */
  if (r.bp) (P.bpDoors || []).forEach(function (d) {
    if (d.storey !== r.storey || (r.door && Math.abs(d.x - r.door.x) < 0.05 && Math.abs(d.z - r.door.z) < 0.05)) return;
    var onX = (Math.abs(d.x - r.x0) < 0.8 || Math.abs(d.x - r.x1) < 0.8) && d.z > r.z0 - 0.5 && d.z < r.z1 + 0.5, onZ = (Math.abs(d.z - r.z0) < 0.8 || Math.abs(d.z - r.z1) < 0.8) && d.x > r.x0 - 0.5 && d.x < r.x1 + 0.5;
    if (onX || onZ) doors.push({ at: [CANT.cl(d.x, r.x0 + q, r.x1 - q), CANT.cl(d.z, r.z0 + q, r.z1 - q)], w: d.w, to: 'hall' });
  });
  var rw = r.decor != null ? T.blueprintWealth[r.decor] : wealth;
  if (specId != null) {
    (SU.doors || []).forEach(function (d) {
      if (d.storey !== r.storey) return;
      var onX = (Math.abs(d.x - r.x0) < 0.8 || Math.abs(d.x - r.x1) < 0.8) && d.z > r.z0 - 0.5 && d.z < r.z1 + 0.5, onZ = (Math.abs(d.z - r.z0) < 0.8 || Math.abs(d.z - r.z1) < 0.8) && d.x > r.x0 - 0.5 && d.x < r.x1 + 0.5;
      if (onX || onZ) doors.push({ at: [CANT.cl(d.x, r.x0 + q, r.x1 - q), CANT.cl(d.z, r.z0 + q, r.z1 - q)], w: d.w, to: 'hall' });
    });
    (decorBy[specId] || []).forEach(function (d, k) {
      var id = 'decor.' + k;
      if (d.kind === 'pillar') fixtures.push(fx(id, d.x, d.z, 0, d.w + 1.4, d.w + 1.4));
      else if (d.kind === 'statue' || d.kind === 'brazier') fixtures.push(fx(id, d.x, d.z, 0, 2.2, 2.2));
      else if (d.kind === 'dais') fixtures.push(fx(id, d.x, d.z, d.ry || 0, (d.r ? d.r * 2 : d.w) + 2, (d.r ? d.r * 2 : d.d) + 2));
      else if (d.kind === 'basin') fixtures.push(fx(id, d.x, d.z, 0, d.r * 2 + 2, d.r * 2 + 2));
      else if (d.kind === 'carpet') fixtures.push(fx(id, d.x, d.z, Math.atan2(-d.d[1], d.d[0]), d.len * 0.6, d.w * 0.6));   /* the runner's middle kept as an aisle */
    });
    P.flights.forEach(function (f, k) {
      if ((f.kind !== 'grand' && f.kind !== 'inner') || f.storey !== r.storey) return;
      var mx = (f.a[0] + f.b[0]) / 2, mz = (f.a[1] + f.b[1]) / 2, L = Math.hypot(f.b[0] - f.a[0], f.b[1] - f.a[1]);
      if (mx > r.x0 && mx < r.x1 && mz > r.z0 && mz < r.z1) fixtures.push(fx('stair.' + k, mx, mz, Math.atan2(-(f.b[1] - f.a[1]), f.b[0] - f.a[0]), L + 2, f.w + 1));
    });
  }
  var area = (r.x1 - r.x0) * (r.z1 - r.z0), cell = area > (T.bigRoom || 400) ? (T.cellBig || 0.4) : T.cell, seed = KRAND.hash(7401, Math.round(r.x0 * 10), Math.round(r.z0 * 10), r.storey);
  try {
    /* 1. the set piece */
    var placed = [];
    if (r.kind === 'banquet') { var Fe = VC.suiteFeast(P, r, cat); Fe.forEach(function (p) { p.room = r.id; placed.push(p); }); out.feast += Fe.length; }
    /* 2. the programme (not in a suite's state room: the placer's search takes seconds there and the dressing lays it out) */
    var R = ROOM({ building: 'voth_canton_' + cn.toLowerCase(), kind: r.kind, poly: poly, y: r.y, h: r.h, doors: doors, culture: 'voth', wealth: rw, id: r.id, seed: seed, fixtures: fixtures.concat(placed.map(pieceFx)) });
    if (!r.great && !(r.bp && r.decor < T.blueprintPlacer)) {   /* a blueprint's bare and plain rooms: the dressing alone (the placer's search is the cost) */
      var plan = furnishRoom(R, cat, { seed: 0, cell: cell, backtrack: 6, passes: 2 });
      plan.placements.forEach(function (p) { p.room = r.id; placed.push(p); });
      out.missing += (plan.report && plan.report.missing ? plan.report.missing.length : 0);
    }
    /* 3. the dressing */
    VC.intDress(R, r, placed, fixtures, cat, cn, rw, seed + 17).forEach(function (p) { p.room = r.id; placed.push(p); out.dressed++; });
    placed.forEach(function (p) { out.placements.push(p); });
    out.rooms++;
  } catch (e) { out.errors = (out.errors || 0) + 1; if (!out.firstError) out.firstError = r.id + ': ' + e.message; }
};
/* the dressing of a room (owner, 2026-10-15: "waaaaaaay more furniture and decorative clutter ... make it ornate"): a fast
   pass of its own, not the placer (the placer's grid search takes seconds in a state room and finds little room in it).
   TUNE.interiors.dress.kinds names, for each class of room, the catalog roles (voth_<tier>_<role>, then voth_<role>) it
   hangs on its walls (`wall`, every `wallEvery` m), stands along them (`along`, `alongGap` m apart), puts in its corners
   (`corner`) and lays out in its middle (`centre`: groups of seats round a low table, rows of benches facing the dais,
   desks, work tables, stacks of stores, rugs), and what stands on the tables it laid (`surface`). The court tier in a
   canton at or over `court` wealth. Nothing within `doorClear` m of a door; every piece tested against what is there
   (the placer's pieces, the suite's fixtures, the feast) by its footprint, the hung pieces among themselves. */
VC.intDress = function (R, r, placed, fixtures, cat, cn, wealth, seed) {
  var D = TUNE.interiors.dress, cls = D.by[r.kind] || D.byDefault, K = Object.assign({}, D.kinds['*'], D.kinds[cls] || {}), out = [];
  /* the beds (owner, 2026-10-15: "make sure all canton homes have at least 1 bed"): a room the census sleeps people in
     (TUNE.census.rooms[kind][1]) has at least one, up to `dress.bedsMax` by its sleepers, each against a wall with a screen
     standing out from the wall beside it (a room divider) */
  var cen = TUNE.census && TUNE.census.rooms && TUNE.census.rooms[r.kind], sleep = cen ? cen[1] || 0 : 0;
  var isBed = function (p) { var F = typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[p.key]; return (p.type || (F && F.type)) === 'bed'; };
  var bedsWant = sleep > 0 ? Math.max(0, Math.min(r.decor >= 3 ? 1 : sleep, D.bedsMax || 4) - placed.filter(isBed).length) : 0;   /* a rich room: the one bed */
  if (!K || (K.skip && !bedsWant)) return out;
  var s0 = seed >>> 0, rnd = function () { s0 = (s0 + 0x6D2B79F5) >>> 0; var t = s0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  var tiers = wealth >= D.court ? ['court', 'common'] : ['common', 'court'];
  var keyOf = VC.INTD.dressKeys || (VC.INTD.dressKeys = {});
  var key = function (role) {
    var ck = tiers[0] + '|' + role; if (ck in keyOf) return keyOf[ck];
    var k = null, ks = tiers.map(function (t) { return 'voth_' + t + '_' + role; }).concat(['voth_' + role, role]);
    for (var i = 0; i < ks.length && !k; i++) if (typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[ks[i]]) k = ks[i];
    return (keyOf[ck] = k);
  };
  var dimsOf = function (k, v) { var d = cat.dims(k, v || 0); return d || { w: 0.8, d: 0.8, h: 1 }; };
  var foot = function (x, z, ry, w, d, m) { var c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), hw = c * w / 2 + s * d / 2 + m, hd = s * w / 2 + c * d / 2 + m; return [x - hw, x + hw, z - hd, z + hd]; };
  var floorB = [], wallB = [], rugB = [], hit = function (L, b) { for (var i = 0; i < L.length; i++) { var o = L[i]; if (b[0] < o[1] && b[1] > o[0] && b[2] < o[3] && b[3] > o[2]) return true; } return false; };
  var x0 = r.x0, x1 = r.x1, z0 = r.z0, z1 = r.z1, inRoom = function (b) { return b[0] >= x0 && b[1] <= x1 && b[2] >= z0 && b[3] <= z1; };
  /* what is there already */
  fixtures.forEach(function (f) { floorB.push(foot(f.x, f.z, f.ry || 0, f.w, f.d, 0)); });
  placed.forEach(function (p) {
    if (p.anchor === 'surface' || p.anchor === 'ceiling') return;
    var dm = p.w ? p : dimsOf(p.key, p.variant), b = foot(p.x, p.z, p.ry || 0, dm.w, dm.d, 0.1);
    (p.y - r.y > 0.3 ? wallB : floorB).push(b);
  });
  R.doors.forEach(function (d) {
    var n = d.n, t = [-n[1], n[0]], c = d.at, hw = d.w / 2 + 0.4, dp = D.doorClear;
    var xs = [c[0] + t[0] * hw + n[0] * dp, c[0] - t[0] * hw + n[0] * dp, c[0] + t[0] * hw - n[0] * dp, c[0] - t[0] * hw - n[0] * dp];
    var zs = [c[1] + t[1] * hw + n[1] * dp, c[1] - t[1] * hw + n[1] * dp, c[1] + t[1] * hw - n[1] * dp, c[1] - t[1] * hw - n[1] * dp];
    var b = [Math.min.apply(null, xs) - 0.2, Math.max.apply(null, xs) + 0.2, Math.min.apply(null, zs) - 0.2, Math.max.apply(null, zs) + 0.2];
    floorB.push(b); wallB.push(b);
  });
  var put = function (k, v, x, z, ry, layer, y) {
    var dm = dimsOf(k, v);
    if (!inRoom(foot(x, z, ry, dm.w, dm.d, -0.01))) return null;
    if (out.length >= (K.max || D.max)) return null;
    var yy = y != null ? y : cat.anchorY ? cat.anchorY(k, v, { floorY: r.y, surfaceY: null, ceilingY: r.y + r.h }) : r.y;
    if (layer === 'wall' && yy - r.y < 0.3) layer = 'floor';   /* a piece the wall list names that stands on the floor (shelves) */
    var b = foot(x, z, ry, dm.w, dm.d, layer === 'wall' ? 0.15 : layer === 'rug' ? 0.3 : 0.12);
    var L = layer === 'wall' ? wallB : layer === 'rug' ? rugB : floorB; if (hit(L, b)) return null;
    if (layer === 'rug' && hit(floorB, foot(x, z, ry, dm.w * 0.5, dm.d * 0.5, 0))) return null;
    /* a hung piece clears the floor pieces' tops? no: it hangs over them, as in a room (art over a chest); a floor piece is kept
       off the hung ones only when it is tall (a cabinet under a tapestry's foot) */
    if (layer !== 'wall' && dm.h > 1.6 && hit(wallB, b)) return null;
    L.push(b);
    var p = { key: k, variant: v, seed: 1 + ((seed + out.length * 7919) % 99991), x: x, y: yy, z: z, ry: ry, anchor: layer === 'wall' ? 'wall' : 'floor', w: dm.w, d: dm.d, h: dm.h, dress: true };
    out.push(p); return p;
  };
  var walls = R.walls.filter(function (W) { return !W.open && W.len > 1.2; });
  var pick = function (list, i) { return list && list.length ? list[(i + Math.floor(rnd() * 2)) % list.length] : null; };
  var tables = [];
  if (bedsWant) {
    var bk = key('bed'), sk2 = key('screen'), wsB = walls.slice().sort(function (a, b) { return b.len - a.len; }), nb = 0;
    if (bk) for (var wb = 0; wb < wsB.length && nb < bedsWant; wb++) {
      var W = wsB[wb], bd = dimsOf(bk, 0), sd = sk2 ? dimsOf(sk2, 0) : null;
      for (var ub = 0.4 + bd.w / 2; ub + bd.w / 2 < W.len - 0.4 && nb < bedsWant; ub += bd.w + 1.4) {
        var ob = bd.d / 2 + 0.05, bx = W.a[0] + W.t[0] * ub + W.n[0] * ob, bz = W.a[1] + W.t[1] * ub + W.n[1] * ob;
        if (!put(bk, nb & 1, bx, bz, W.ry, 'floor')) continue;
        nb++;
        /* the screen: beside the bed's open side, running out from the wall as far as the bed's foot */
        if (sd) { var us = ub + bd.w / 2 + sd.d / 2 + 0.2, os = Math.min(bd.d, sd.w) / 2 + 0.05; put(sk2, 0, W.a[0] + W.t[0] * us + W.n[0] * os, W.a[1] + W.t[1] * us + W.n[1] * os, W.ry + Math.PI / 2, 'floor'); }
      }
    }
    /* no wall clear (the programme's desks and shelves took them): the first bed stands free, on a 0.5 m search */
    if (bk && !nb) for (var gx = x0 + 1.2; gx < x1 - 1.2 && !nb; gx += 0.5) for (var gz = z0 + 1.2; gz < z1 - 1.2 && !nb; gz += 0.5)
      for (var gr = 0; gr < 2 && !nb; gr++) if (put(bk, 0, gx, gz, gr * Math.PI / 2, 'floor')) nb++;
    if (!nb) VC.INTD.bedless = (VC.INTD.bedless || 0) + 1;
  }
  /* a home's stores (owner, 2026-10-15: "make sure each home has at least one food and item storage furniture"): in the kinds
     `dress.homes` names, a food container (kits/interiors IX.FOOD_ROLES: jars, a larder) and an item container (IX.ITEM_ROLES:
     a chest, a cabinet) when the programme laid none, against the walls */
  if ((D.homes || []).indexOf(r.kind) >= 0 && typeof KratorInteriors !== 'undefined') {
    var IXr = KratorInteriors, roleOf = VC.INTD.roleOf || (VC.INTD.roleOf = cat.list().reduce(function (m, d) { m[d.key] = d.role; return m; }, {}));
    var all = placed.concat(out), has = function (roles) { return all.some(function (p) { return roles.indexOf(p.catRole || roleOf[p.key]) >= 0; }); };
    [[IXr.FOOD_ROLES, 'store'], [IXr.ITEM_ROLES, 'chest']].forEach(function (S2) {
      if (has(S2[0])) return;
      var k4 = key(S2[1]); if (!k4) return;
      var dm4 = dimsOf(k4, 0), ws4 = walls.slice().sort(function (a, b) { return b.len - a.len; }), done = false;
      for (var w4 = 0; w4 < ws4.length && !done; w4++) for (var u4 = 0.3 + dm4.w / 2; u4 + dm4.w / 2 < ws4[w4].len - 0.3 && !done; u4 += 0.5) {
        var W4 = ws4[w4], o4 = dm4.d / 2 + 0.05;
        if (put(k4, 0, W4.a[0] + W4.t[0] * u4 + W4.n[0] * o4, W4.a[1] + W4.t[1] * u4 + W4.n[1] * o4, W4.ry, 'floor')) done = true;
      }
      if (!done) VC.INTD.storeless = (VC.INTD.storeless || 0) + 1;
    });
  }
  if (K.skip) return out;
  /* the first pieces against the longest wall (a bed in a bedchamber) */
  (K.first || []).forEach(function (role, i) {
    var k = key(role); if (!k) return;
    var ws = walls.slice().sort(function (a, b) { return b.len - a.len; }), dm = dimsOf(k, 0);
    for (var j = 0; j < ws.length; j++) {
      var W = ws[j], u = W.len * (0.5 + (i ? 0.25 : 0)), off = dm.d / 2 + 0.05;
      if (put(k, 0, W.a[0] + W.t[0] * u + W.n[0] * off, W.a[1] + W.t[1] * u + W.n[1] * off, W.ry, 'floor')) break;
    }
  });
  /* the corners */
  walls.forEach(function (W, wi) {
    var role = pick(K.corner, wi), k = role && key(role); if (!k) return;
    var dm = dimsOf(k, 0), u = Math.max(dm.w, dm.d) / 2 + 0.15, off = Math.max(dm.w, dm.d) / 2 + 0.15;
    put(k, 0, W.a[0] + W.t[0] * u + W.n[0] * off, W.a[1] + W.t[1] * u + W.n[1] * off, W.ry + Math.PI / 4, 'floor');
  });
  /* the walls: hung pieces, then the pieces along them */
  var wallN = 0, alongN = 0;
  walls.forEach(function (W) {
    if (K.wall && K.wall.length) for (var u = D.wallEvery * 0.6; u < W.len - 0.6; u += D.wallEvery) {
      var k = key(pick(K.wall, wallN++)); if (!k) continue;
      var v = rnd() < 0.5 ? 0 : 1, dm = dimsOf(k, v), off = dm.d / 2 + 0.03;
      if (u - dm.w / 2 < 0.3 || u + dm.w / 2 > W.len - 0.3) continue;
      put(k, v, W.a[0] + W.t[0] * u + W.n[0] * off, W.a[1] + W.t[1] * u + W.n[1] * off, W.ry, 'wall');
    }
    if (K.along && K.along.length) {
      var ua = 0.5;
      while (ua < W.len - 0.5) {
        var role = pick(K.along, alongN++), k2 = role && key(role); if (!k2) { ua += 1; continue; }
        var dm2 = dimsOf(k2, 0), uc = ua + dm2.w / 2, off2 = dm2.d / 2 + 0.05;
        if (uc + dm2.w / 2 > W.len - 0.4) break;
        var p = put(k2, 0, W.a[0] + W.t[0] * uc + W.n[0] * off2, W.a[1] + W.t[1] * uc + W.n[1] * off2, W.ry, 'floor');
        if (p && (role === 'table' || role === 'low_table' || role === 'counter' || role === 'desk' || role === 'workbench')) tables.push(p);
        ua += p ? dm2.w + D.alongGap * (0.6 + rnd() * 0.8) : 0.6;
      }
    }
  });
  /* the middle */
  var m = D.centreMargin, cx0 = x0 + m, cx1 = x1 - m, cz0 = z0 + m, cz1 = z1 - m, C = K.centre;
  if (C && C !== 'none' && cx1 > cx0 && cz1 > cz0) {
    /* the grid's points nearest the room's middle first, at most `dress.centreMax[pattern]` of them taking a piece (a
       1,500 m2 room is not a classroom of a hundred desks) */
    var grid = function (step, f) {
      var nx = Math.max(1, Math.floor((cx1 - cx0) / step)), nz = Math.max(1, Math.floor((cz1 - cz0) / step));
      var sx = (cx1 - cx0) / nx, sz = (cz1 - cz0) / nz, mx = (cx0 + cx1) / 2, mz = (cz0 + cz1) / 2, pts = [], n = 0;
      var cap = Math.ceil(((D.centreMax || {})[C] || 1e9) * Math.max(1, (x1 - x0) * (z1 - z0) / (D.centreArea || 300)));   /* more in a bigger room */
      for (var i = 0; i < nx; i++) for (var j = 0; j < nz; j++) pts.push([cx0 + (i + 0.5) * sx, cz0 + (j + 0.5) * sz, i, j]);
      pts.sort(function (a, b) { return Math.hypot(a[0] - mx, a[1] - mz) - Math.hypot(b[0] - mx, b[1] - mz) || a[2] - b[2] || a[3] - b[3]; });
      for (var k = 0; k < pts.length && n < cap; k++) if (f(pts[k][0], pts[k][1], pts[k][2], pts[k][3])) n++;
    };
    var alongX = x1 - x0 >= z1 - z0, ryL = alongX ? Math.PI / 2 : 0;
    if (C === 'groups' || C === 'rug') {
      grid(C === 'rug' ? D.rugEvery : D.groupEvery, function (x, z, i, j) {
        var rug = key(K.rug || 'rug'), rp = rug && put(rug, (i + j) & 1, x, z, ryL, 'rug', r.y + 0.01);
        if (C !== 'groups') return !!rp;
        var tk = key(K.groupTable || 'low_table'), sk = key(pick(K.groupSeat || ['divan'], i + j)); if (!tk || !sk) return false;
        var t = put(tk, 0, x, z, ryL, 'floor'); if (!t) return false; tables.push(t);
        var sd = dimsOf(sk, 0), td = dimsOf(tk, 0), off = td.d / 2 + sd.d / 2 + 0.35;
        [-1, 1].forEach(function (sg) {
          var nx2 = alongX ? 0 : sg, nz2 = alongX ? sg : 0;
          put(sk, 0, x + nx2 * off, z + nz2 * off, Math.atan2(-nx2, -nz2), 'floor');
        });
        return true;
      });
    } else if (C === 'rows') {
      /* benches across the room facing its focus: the dais in it, else the far end from its first door */
      var dais = (fixtures.filter(function (f) { return /^decor/.test(f.id) && f.w > 3; })[0]);
      var fx = dais ? dais.x : (alongX ? x1 : (x0 + x1) / 2), fz = dais ? dais.z : (alongX ? (z0 + z1) / 2 : z1);
      var bk = key(K.rowSeat || 'bench'); if (bk) {
        var bd = dimsOf(bk, 0), along = alongX ? [Math.sign(fx - (x0 + x1) / 2) || 1, 0] : [0, Math.sign(fz - (z0 + z1) / 2) || 1];
        var face = Math.atan2(along[0], along[1]), Lc = alongX ? (x0 + x1) / 2 : (z0 + z1) / 2, half = (alongX ? x1 - x0 : z1 - z0) / 2;
        var acr0 = alongX ? cz0 : cx0, acr1 = alongX ? cz1 : cx1, mid = (acr0 + acr1) / 2;
        for (var l = half - D.rowFocusGap; l > -half + m + 1; l -= D.rowEvery) {   /* from the focus back: the front rows first */
          for (var a = acr0 + bd.w / 2; a + bd.w / 2 <= acr1; a += bd.w + 0.25) {
            if (Math.abs(a - mid) < D.rowAisle / 2 + bd.w / 2) continue;
            var lx = Lc + (alongX ? l * along[0] : 0), lz = Lc + (alongX ? 0 : l * along[1]);
            put(bk, 0, alongX ? lx : a, alongX ? a : lz, face, 'floor');
          }
        }
      }
    } else if (C === 'desks' || C === 'work' || C === 'stacks') {
      var role2 = C === 'desks' ? 'desk' : C === 'work' ? 'table' : 'store', step = K.centreEvery || (C === 'desks' ? D.deskEvery : C === 'work' ? D.workEvery : D.stackEvery);
      var k3 = key(K.centreRole || role2); if (k3) grid(step, function (x, z, i, j) {
        var p = put(k3, 0, x, z, ryL, 'floor'); if (!p) return false;
        if (C !== 'stacks') tables.push(p);
        var ch = C === 'desks' ? key('chair') || key('throne') : C === 'work' ? key('stool') : null;
        if (ch) { var dd = dimsOf(k3, 0), cd = dimsOf(ch, 0), o = dd.d / 2 + cd.d / 2 + 0.15, nx3 = alongX ? 0 : -1, nz3 = alongX ? -1 : 0; put(ch, 0, x + nx3 * o, z + nz3 * o, Math.atan2(-nx3, -nz3), 'floor'); }
        return true;
      });
    }
  }
  /* what stands on the tables laid here */
  var surf = (K.surface || []).map(key).filter(Boolean);
  if (surf.length) tables.forEach(function (t, i) {
    var top = cat.top ? cat.top(t.key, t.variant || 0) : t.h; if (top == null || top < 0.3) return;
    var sk = surf[i % surf.length], c = Math.cos(t.ry), s = Math.sin(t.ry), o = (rnd() - 0.5) * t.w * 0.5;
    out.push({ key: sk, variant: 0, seed: 1 + i, x: t.x + c * o, y: t.y + top, z: t.z - s * o, ry: t.ry, anchor: 'surface', dress: true });
  });
  return out;
};
/* the banquet hall's feast (owner, 2026-10-15: "actual tables and chairs fit for a feast"): long tables end to end down the
   hall in rows (between the pillar lines and in the aisles outside them), a chair every TUNE.interiors.feast.chairEvery m on
   both sides facing in, candelabra, ewers and bowls along the tables; the high table across the far end, its chairs on the
   far side facing down the hall. Placements in the placer's shape, clear of the suite's pillars */
VC.suiteFeast = function (P, r, cat) {
  var F = TUNE.interiors.feast, out = [], have = function (k) { return typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[k] ? k : null; };
  var tk = have(F.table[0]) || have(F.table[1]), ck = have(F.chair[0]) || have(F.chair[1]); if (!tk || !ck) return out;
  var TD = cat.dims(tk, 0), CD = cat.dims(ck, 0), top = cat.top ? (cat.top(tk, 0) || TD.h) : TD.h;
  var alongX = r.x1 - r.x0 >= r.z1 - r.z0, L0 = alongX ? r.x0 : r.z0, L1 = alongX ? r.x1 : r.z1, M0 = alongX ? r.z0 : r.x0, M1 = alongX ? r.z1 : r.x1, mid = (M0 + M1) / 2, half = (M1 - M0) / 2;
  var pt = function (l, m) { return alongX ? [l, m] : [m, l]; }, ryLong = alongX ? 0 : Math.PI / 2;
  var cn = P.n, pillars = (P.suite ? P.suite.decor : []).filter(function (d) { return d.kind === 'pillar' && d.x > r.x0 && d.x < r.x1 && d.z > r.z0 && d.z < r.z1; });
  var clear = function (l, m, hl, hm) { var c = pt(l, m); return pillars.every(function (p) { return Math.abs(p.x - c[0]) > (alongX ? hl : hm) + p.w / 2 + 0.4 || Math.abs(p.z - c[1]) > (alongX ? hm : hl) + p.w / 2 + 0.4; }); };
  var put = function (key, l, m, ry, y, anchor) { var c = pt(l, m); out.push({ key: key, variant: 0, x: c[0], y: y, z: c[1], ry: ry, anchor: anchor || 'floor', type: anchor === 'surface' ? 'vessel' : 'table', seed: out.length + 1 }); };
  var rows = F.rows.filter(function (o) { return Math.abs(o) + TD.d / 2 + CD.d + 0.6 < half; });
  var lStart = L0 + F.endGap, lEnd = L1 - F.endGap - F.highGap;
  rows.forEach(function (o) {
    var m = mid + o;
    for (var l = lStart + TD.w / 2; l + TD.w / 2 <= lEnd; l += TD.w + 0.02) {
      if (!clear(l, m, TD.w / 2 + CD.d, TD.d / 2 + CD.d + 0.3)) continue;
      put(tk, l, m, ryLong, r.y);
      /* the chairs: both long sides, facing the table */
      var n = Math.max(1, Math.floor(TD.w / F.chairEvery));
      for (var i = 0; i < n; i++) {
        var cl = l - TD.w / 2 + (i + 0.5) * TD.w / n, off = TD.d / 2 + CD.d / 2 + 0.12;
        [-1, 1].forEach(function (sd) { var face = alongX ? (sd > 0 ? Math.PI : 0) : (sd > 0 ? -Math.PI / 2 : Math.PI / 2); put(ck, cl, m + sd * off, face, r.y); });
      }
      /* along the table: a candelabrum or a ewer and a bowl, by turns */
      var sk = [F.surface[(Math.round(l) & 1) ? 0 : 1], F.surface[2]];
      sk.forEach(function (s, j) { if (have(s)) put(s, l + (j ? 0.6 : -0.6), m, ryLong, r.y + top, 'surface'); });
    }
  });
  /* the high table across the far end, chairs behind it facing the hall */
  var lh = L1 - F.highGap / 2 - 1, n2 = Math.max(1, Math.floor(F.highSpan / (TD.w + 0.02)));
  for (var k = 0; k < n2; k++) {
    var mm = mid + (k - (n2 - 1) / 2) * (TD.w + 0.02);
    if (!clear(lh, mm, TD.d / 2 + CD.d, TD.w / 2)) continue;
    put(tk, lh, mm, ryLong + Math.PI / 2, r.y);
    var faceHall = alongX ? -Math.PI / 2 : Math.PI;   /* front toward -long */
    for (var i2 = 0; i2 < Math.max(1, Math.floor(TD.w / F.chairEvery)); i2++) put(ck, lh + TD.d / 2 + CD.d / 2 + 0.12, mm - TD.w / 2 + (i2 + 0.5) * TD.w / Math.max(1, Math.floor(TD.w / F.chairEvery)), faceHall, r.y);
    if (have(F.surface[0])) put(F.surface[0], lh, mm, ryLong, r.y + top, 'surface');
  }
  return out;
};

/* ---------------------------------------------------------------- drawing one canton's interior */
VC.intMat = function () {
  if (VC.INTD.mat) return VC.INTD.mat;
  /* a faint warm glow of its own: lamplight, so the rooms read inside the canton's shadow */
  return (VC.INTD.mat = new THREE.MeshStandardMaterial({ roughness: 0.92, emissive: new THREE.Color(0x1c160e), emissiveIntensity: 1 }));
};
/* ---------------------------------------------------------------- the materials: the library on the shell
   (owner, 2026-10-15: "canton interiors need work, they are textureless"). Two kinds (materials.json, tex/, SL_TEX):
   - a SET material: a library set (int_wall, int_floor, int_stone, int_beam, int_carved, int_gilt, int_relief) sampled
     by world position on three planes and blended by the face normal (the site scene's VIEW.hook idea: no UVs, nothing
     stretches), a grey detail under the instance colour (each canton's look, TUNE.interiors.look);
   - a SHEET material: a full-colour pattern sheet (tap_*, inlay_*, medallion_sun, lantern_paper, int_rug) UV-mapped on a
     unit box turned to face the room: the whole sheet on each face, or repeated along the box's length every `tile` m
     (a dado band): the vertex shader reads the instance's scale off instanceMatrix. */
VC.intTex = function (fam) {
  VC.INTD.tex = VC.INTD.tex || {};
  if (VC.INTD.tex[fam] !== undefined) return VC.INTD.tex[fam];
  var T = (typeof SL_TEX !== 'undefined') && SL_TEX[fam], t = null;
  if (T && T.map) { t = new THREE.TextureLoader().load(T.map); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); t.encoding = THREE.sRGBEncoding; }
  return (VC.INTD.tex[fam] = t ? { tex: t, scale: T.scale[0] } : null);
};
VC.intSetMat = function (set, o) {
  o = o || {}; var colour = !!(o.colour || VC.INT_COLOUR[set]), key = 'set|' + set + '|' + (o.metal || 0) + '|' + (o.rough || 0.9) + '|' + (o.emissive || 0) + '|' + colour, M = VC.INTD.mats = VC.INTD.mats || {};
  if (M[key]) return M[key];
  var m = new THREE.MeshStandardMaterial({ roughness: o.rough == null ? 0.9 : o.rough, metalness: o.metal || 0, emissive: new THREE.Color(o.emissive == null ? 0x1c160e : o.emissive), emissiveIntensity: 1 }), D = VC.intTex(set);
  if (D) {
    m.customProgramCacheKey = function () { return 'int-set-' + set + (colour ? '-c' : ''); };
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uD = { value: D.tex };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvec4 _wp = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\n_wp = instanceMatrix * _wp;\n#endif\nvWP = (modelMatrix * _wp).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;\nuniform sampler2D uD;\n' +
          'vec3 tri3(sampler2D t, float s, vec3 w) { return texture2D(t, vWP.zy / s).rgb * w.x + texture2D(t, vWP.xz / s).rgb * w.y + texture2D(t, vWP.xy / s).rgb * w.z; }\n')
        .replace('#include <map_fragment>', '#include <map_fragment>\n' +
          'vec3 _n = normalize(cross(dFdx(vWP), dFdy(vWP))); vec3 _w = pow(abs(_n), vec3(4.0)); _w /= (_w.x + _w.y + _w.z);\n' +
          (colour ? 'vec3 _d = tri3(uD, ' + D.scale.toFixed(2) + ', _w);\ndiffuseColor.rgb *= pow(_d, vec3(2.2));\n'   /* the set as authored (sampled raw: its sRGB values made linear), the instance colour a tint */
                  : 'vec3 _d = mix(tri3(uD, ' + D.scale.toFixed(2) + ', _w), tri3(uD, ' + (D.scale * 7).toFixed(2) + ', _w), 0.3);\n' +
                    'diffuseColor.rgb *= clamp(_d / 0.5, vec3(0.3), vec3(1.8));\n'))
        .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\nreflectedLight.indirectDiffuse *= ' + VC.INT_INDOOR.toFixed(2) + ';');   /* indoors: the sky's light is what leaks in at the doors */
    };
  }
  m.userData.set = set;
  return (M[key] = m);
};
/* the sets drawn in their own colour (the owner's delivery of 2026-10-15), not as a grey detail under the look's colour */
VC.INT_COLOUR = { pal_stucco: 1, pal_tile: 1, pal_inlay: 1, column_inlaid: 1, filigree_crimson: 1, filigree_purple: 1, damask_purple: 1,
  int_ashlar: 1, int_wood: 1, int_tuff: 1, int_basalt: 1, int_oldwall: 1, int_flag: 1, int_mosaic: 1 };
/* how much of the sky's light (the hemisphere's) reaches a room: the rest is the lamps' (VC.intLightPool) */
VC.INT_INDOOR = 0.42;
VC.intSheetMat = function (set, o) {
  o = o || {}; var key = 'sheet|' + set + '|' + (o.tile || 0) + '|' + (o.emissive || 0) + '|' + (o.rough || 0.85), M = VC.INTD.mats = VC.INTD.mats || {};
  if (M[key]) return M[key];
  var D = VC.intTex(set), m = new THREE.MeshStandardMaterial({ roughness: o.rough == null ? 0.85 : o.rough, metalness: 0, map: D ? D.tex : null, emissive: new THREE.Color(o.emissive || 0x120d08), emissiveIntensity: 1 });
  if (o.emissive && D) { m.emissiveMap = D.tex; }
  var tile = o.tile || 0;
  m.customProgramCacheKey = function () { return 'int-sheet-' + set + '-' + tile; };
  m.onBeforeCompile = function (sh) {
    /* the sheet repeats along the box's length (its local x, scaled by the instance) every `tile` m; once across */
    if (tile) sh.vertexShader = sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_INSTANCING\nvUv.x *= length(instanceMatrix[0].xyz) / ' + tile.toFixed(3) + ';\n#endif');
    sh.fragmentShader = sh.fragmentShader.replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\nreflectedLight.indirectDiffuse *= ' + VC.INT_INDOOR.toFixed(2) + ';');
  };
  m.userData.set = set;
  return (M[key] = m);
};
/* the plain, unlit material of a flame or a lit candle, by colour */
VC.intGlowMat = function (col) { var M = VC.INTD.mats = VC.INTD.mats || {}, k = 'glow|' + col; return M[k] || (M[k] = new THREE.MeshBasicMaterial({ color: new THREE.Color(col) })); };
VC.intLook = function (cn) { var L = TUNE.interiors.look; return Object.assign({}, L.default, L[cn] || {}); };
/* the geometries: a unit box with its corner at the origin (axis-aligned shells), a unit box about its centre (turned
   panels), an eight-sided drum, a cone, a ring (a chandelier's hoop) */
VC.intGeo = function () {
  if (VC.INTD.geo) return VC.INTD.geo;
  return (VC.INTD.geo = { box: new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5), panel: new THREE.BoxGeometry(1, 1, 1), drum: new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
                          cone: new THREE.ConeGeometry(0.5, 1, 6), ring: new THREE.TorusGeometry(0.5, 0.045, 6, 16).rotateX(Math.PI / 2), ball: new THREE.SphereGeometry(0.5, 8, 6) });
};

/* ---------------------------------------------------------------- a piece's prototype: built once, its parts merged
   A catalog piece is 20 to 60 primitives, each its own mesh and material; drawn as one InstancedMesh per part and
   storey, a canton was 30,000 meshes (2026-10-15). The prototype is built once at the origin (its lights stripped: the
   pool lights the rooms), and its opaque parts are merged by class (lit, metal, glow) into one vertex-coloured
   geometry each, the material's colour baked into the vertices; painted panels, glass and double-sided sheets keep
   their own material. Shared by the cantons (here) and the lot buildings (56b VC.ixFurnProto). */
VC.intProto = function (key, v, wealth) {
  var pk = key + '|' + (v || 0) + '|' + (wealth == null ? 0.5 : wealth).toFixed(2), C = VC.INTD.protos = VC.INTD.protos || {};
  if (C[pk]) return C[pk];
  var fg = buildFurn(key, 0, 0, 0, { variant: v || 0, seed: 11, y: 0, wealth: wealth == null ? 0.5 : wealth });
  var drop = function (g) { if (!g) return; scene.remove(g); var i = INSTANCES.indexOf(g); if (i >= 0) INSTANCES.splice(i, 1); };
  if (!fg || fg.userData.error) { drop(fg); return (C[pk] = { bad: true, parts: [] }); }
  fg.updateMatrixWorld(true);
  var lights = []; fg.traverse(function (o) { if (o.isPointLight) lights.push(o); }); lights.forEach(function (l) { if (l.parent) l.parent.remove(l); });
  var classes = {}, parts = [];
  fg.traverse(function (o) {
    if (!o.isMesh) return;
    var m = o.material, g = o.geometry.clone().applyMatrix4(o.matrixWorld);
    if (Array.isArray(m) || m.map || m.transparent || m.side === THREE.DoubleSide || !m.color) { parts.push({ geo: g, mat: m }); return; }
    var cls = m.isMeshBasicMaterial ? 'glow' : (m.metalness || 0) >= 0.4 ? 'metal' : 'std';
    if (g.index) g = g.toNonIndexed();
    if (!g.attributes.normal) g.computeVertexNormals();
    var n = g.attributes.position.count, col = new Float32Array(n * 3), c = m.color;
    for (var i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var e = classes[cls] = classes[cls] || { geos: [], rough: 0, metal: 0, n: 0 };
    e.geos.push(g); e.rough += m.roughness == null ? 0.85 : m.roughness; e.metal += m.metalness || 0; e.n++;
  });
  Object.keys(classes).forEach(function (cls) {
    var e = classes[cls], mats = VC.INTD.protoMats = VC.INTD.protoMats || {}, rough = +(e.rough / e.n).toFixed(1), metal = +(e.metal / e.n).toFixed(1);
    var mk = cls === 'glow' ? 'glow' : cls + '|' + rough + '|' + metal;
    if (!mats[mk]) mats[mk] = cls === 'glow' ? new THREE.MeshBasicMaterial({ vertexColors: true }) : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rough, metalness: metal });
    parts.push({ geo: VC.intMergeGeo(e.geos), mat: mats[mk] });
  });
  drop(fg);
  return (C[pk] = { parts: parts });
};
VC.intMergeGeo = function (geos) {
  var n = 0; geos.forEach(function (g) { n += g.attributes.position.count; });
  var pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3), uv = new Float32Array(n * 2), k = 0;
  geos.forEach(function (g) {
    var c = g.attributes.position.count;
    pos.set(g.attributes.position.array, k * 3); nor.set(g.attributes.normal.array, k * 3); col.set(g.attributes.color.array, k * 3);
    if (g.attributes.uv && g.attributes.uv.itemSize === 2) uv.set(g.attributes.uv.array, k * 2);
    k += c;
  });
  var out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setAttribute('color', new THREE.BufferAttribute(col, 3)); out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.computeBoundingSphere();
  return out;
};

/* ---------------------------------------------------------------- the decoration and the light fittings
   Everything is an instanced box, drum, cone or ring: [geometry, material] x storey -> matrices and colours.
   VC.intDecor(P, look) lays, for a canton's plan:
   - tapestries down the halls (the look's sheet), every TUNE.interiors.decor.tapEvery m, clear of the doors; the great
     hall's gallery hung with banners; a medallion on the core's floor where the look has one; a dado band round every
     room and hall where the look has a dado sheet; candle nooks down the halls where the look has nooks;
   - the railings as a rail on posts; a light well's mouth on the deck;
   - the fittings (owner, 2026-10-15: "sufficient interior light sources, be they candles, lanterns, chandeliers"): a
     paper lantern under every room's ceiling (a candle sconce in a cell, a store, a dormitory), lanterns every
     TUNE.interiors.lamps.hallEvery m down the halls and tunnels, torch brackets between them, a chandelier in a great
     hall and over an atrium; every fitting is drawn lit and listed for the light pool (VC.intLightPool). */
VC.intDecor = function (P, look, add, lamps) {
  var T = TUNE.interiors, DC = T.decor, LT = T.lamps, cn = P.n, G = VC.intGeo(), col = function (h) { return new THREE.Color(h); };
  var taps = [].concat(look.tapestry).map(function (s) { return VC.intSheetMat(s); }), tap = taps[0], tapAt = function (x, z) { return taps[Math.floor(VC.intU(cn, Math.round(x), Math.round(z), 9) * taps.length) % taps.length]; }, paper = VC.intSheetMat('lantern_paper', { emissive: 0xffb060 }), trim = VC.intSetMat(look.trimSet, look.trimSet === 'int_gilt' ? { metal: 0.85, rough: 0.32 } : {}), iron = VC.intSetMat('int_wall', { rough: 0.6, metal: 0.4 });
  var flame = VC.intGlowMat(0xffc46a), ember = VC.intGlowMat(0xff8a2c), wax = VC.intSetMat('int_wall', { emissive: 0x6a5030 });
  var cIron = col(0x2a2622), cTrim = col(look.trim), cTimber = col(look.timber), cWhite = col(0xffffff), cWax = col(0xe8dcc0), cDark = col(0x1c1814);
  var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), pos = new THREE.Vector3(), sc = new THREE.Vector3();
  /* a turned panel: centre (x, y, z), local x along d (an axis or any direction), size w (along d) x h x t */
  var panel = function (geo, mat, si, x, y, z, d, w, h, t, c) { q.setFromAxisAngle(Y, Math.atan2(-d[1], d[0])); pos.set(x, y, z); sc.set(w, h, t); m4.compose(pos, q, sc); add(si, geo, mat, m4.clone(), c || cWhite); };
  var aabb = function (mat, si, b, c) { m4.makeScale(Math.max(0.01, b[1] - b[0]), Math.max(0.01, b[5] - b[4]), Math.max(0.01, b[3] - b[2])); m4.setPosition(b[0], b[4], b[2]); add(si, G.box, mat, m4.clone(), c); };
  var storeyH = function (si) { var S = P.storeys[si] || P.storeys[0]; return S.h; };
  var hang = function (si, x, y, z, kind, h) {   /* a lantern on a cord from the ceiling at y (its top) */
    aabb(iron, si, [x - 0.015, x + 0.015, z - 0.015, z + 0.015, y - 0.5, y], cIron);
    panel(G.panel, paper, si, x, y - 0.5 - 0.32, z, [1, 0], 0.5, 0.64, 0.5, cWhite);
    aabb(iron, si, [x - 0.14, x + 0.14, z - 0.14, z + 0.14, y - 0.5 - 0.02, y - 0.5 + 0.04], cIron);
    lamps.push({ x: x, z: z, y: y - 0.85, s: si, kind: kind || 'lantern' });
  };
  var sconce = function (si, x, y, z, n) {   /* a candle in an iron bracket on the wall at (x, z), the wall's inward normal n */
    var ox = x + n[0] * 0.14, oz = z + n[1] * 0.14;
    aabb(iron, si, [ox - 0.12, ox + 0.12, oz - 0.12, oz + 0.12, y - 0.04, y], cIron);
    aabb(wax, si, [ox - 0.04, ox + 0.04, oz - 0.04, oz + 0.04, y, y + 0.26], cWax);
    aabb(flame, si, [ox - 0.03, ox + 0.03, oz - 0.03, oz + 0.03, y + 0.26, y + 0.36], cWhite);
    lamps.push({ x: ox, z: oz, y: y + 0.4, s: si, kind: 'candle' });
  };
  var torch = function (si, x, y, z, n) {
    var ox = x + n[0] * 0.2, oz = z + n[1] * 0.2;
    aabb(iron, si, [x + n[0] * 0.02 - 0.05, x + n[0] * 0.02 + 0.05, z + n[1] * 0.02 - 0.05, z + n[1] * 0.02 + 0.05, y - 0.1, y + 0.1], cIron);
    aabb(iron, si, [Math.min(x, ox) - 0.03, Math.max(x, ox) + 0.03, Math.min(z, oz) - 0.03, Math.max(z, oz) + 0.03, y - 0.02, y + 0.04], cIron);
    aabb(iron, si, [ox - 0.06, ox + 0.06, oz - 0.06, oz + 0.06, y, y + 0.34], cTimber);
    m4.makeScale(0.26, 0.5, 0.26); m4.setPosition(ox, y + 0.56, oz); add(si, G.cone, ember, m4.clone(), cWhite);
    lamps.push({ x: ox, z: oz, y: y + 0.6, s: si, kind: 'torch' });
  };
  var chandelier = function (si, x, y, z, r) {   /* a hoop on chains with candles round it, under the ceiling at y */
    aabb(iron, si, [x - 0.02, x + 0.02, z - 0.02, z + 0.02, y - 1.6, y], cIron);
    m4.makeScale(r * 2, 1, r * 2); m4.setPosition(x, y - 1.6, z); add(si, G.ring, trim, m4.clone(), cTrim);
    if (look.drum) { m4.makeScale(r * 2.15, 1.3, r * 2.15); m4.setPosition(x, y - 1.6 + 0.3, z); add(si, G.drum, VC.intSheetMat(look.drum, { emissive: 0xffb060 }), m4.clone(), cWhite); }
    for (var k = 0; k < 8; k++) { var a = k / 8 * Math.PI * 2, cx = x + Math.cos(a) * r, cz = z + Math.sin(a) * r; aabb(wax, si, [cx - 0.035, cx + 0.035, cz - 0.035, cz + 0.035, y - 1.58, y - 1.3], cWax); aabb(flame, si, [cx - 0.03, cx + 0.03, cz - 0.03, cz + 0.03, y - 1.3, y - 1.2], cWhite); }
    for (var c = 0; c < 3; c++) { var ca = c / 3 * Math.PI * 2 + 0.5, ex = x + Math.cos(ca) * r * 0.8, ez = z + Math.sin(ca) * r * 0.8; aabb(iron, si, [Math.min(x, ex), Math.max(x, ex) + 0.02, Math.min(z, ez), Math.max(z, ez) + 0.02, y - 1.6, y - 0.9], cIron); }
    lamps.push({ x: x, z: z, y: y - 1.5, s: si, kind: 'chandelier' });
  };
  /* the halls: tapestries, torches, lanterns or chandeliers, nooks */
  P.halls.forEach(function (o) {
    if (o.nowalls || o.kind === 'gallery') return;
    var si = o.storey == null ? 0 : o.storey, d = o.d || (o.x1 - o.x0 >= o.z1 - o.z0 ? [1, 0] : [0, 1]), alongX = Math.abs(d[0]) > 0.5, L = alongX ? o.x1 - o.x0 : o.z1 - o.z0, W = alongX ? o.z1 - o.z0 : o.x1 - o.x0;
    var top = o.y + o.h, cx = (o.x0 + o.x1) / 2, cz = (o.z0 + o.z1) / 2, a0 = alongX ? o.x0 : o.z0;
    var atrium = o.atrium, great = o.great;
    /* the hall's own doors (the rooms' onto it): tapestries keep clear of them */
    var doors = P.rooms.filter(function (r) { return r.door && r.storey === si && (alongX ? Math.abs(r.door.z - o.z0) < 0.6 || Math.abs(r.door.z - o.z1) < 0.6 : Math.abs(r.door.x - o.x0) < 0.6 || Math.abs(r.door.x - o.x1) < 0.6); }).map(function (r) { return alongX ? r.door.x : r.door.z; });
    var clear = function (a) { return doors.every(function (m) { return Math.abs(m - a) > DC.tap[0] / 2 + 1.2; }); };
    if (great && o.suite) return;   /* a state room: the suite's decor (below) */
    if (great) {
      /* the great hall: banners on every wall, torches between, a chandelier (two when tall), the training posts */
      var wallsOf = [[o.x0, o.z0, o.x1, o.z0, [0, 1]], [o.x0, o.z1, o.x1, o.z1, [0, -1]], [o.x0, o.z0, o.x0, o.z1, [1, 0]], [o.x1, o.z0, o.x1, o.z1, [-1, 0]]];
      wallsOf.forEach(function (w) {
        var wx = Math.abs(w[1] - w[3]) < 1e-6, len = wx ? w[2] - w[0] : w[3] - w[1], n = w[4], k = Math.max(1, Math.floor(len / DC.bannerEvery)), dd = wx ? [1, 0] : [0, 1];
        for (var i = 0; i < k; i++) {
          var t = (i + 0.5) / k, bx = wx ? w[0] + len * t : w[0], bz = wx ? w[1] : w[1] + len * t, m = P.great && P.great.door, nearDoor = m && Math.hypot(m.x - bx, m.z - bz) < 4;
          if (nearDoor) continue;
          var by = o.tall ? o.y + o.h * 0.62 : top - DC.tapDrop - DC.banner[1] / 2;
          panel(G.panel, tapAt(bx, bz), si, bx + n[0] * 0.08, by, bz + n[1] * 0.08, dd, DC.banner[0], DC.banner[1], 0.05, cWhite);
          aabb(iron, si, [bx + n[0] * 0.08 - (wx ? DC.banner[0] / 2 + 0.1 : 0.04), bx + n[0] * 0.08 + (wx ? DC.banner[0] / 2 + 0.1 : 0.04), bz + n[1] * 0.08 - (wx ? 0.04 : DC.banner[0] / 2 + 0.1), bz + n[1] * 0.08 + (wx ? 0.04 : DC.banner[0] / 2 + 0.1), by + DC.banner[1] / 2, by + DC.banner[1] / 2 + 0.06], cIron);
          if (i % 2 === 0) torch(si, bx + (wx ? DC.bannerEvery * 0.5 : 0), o.y + 2.4, bz + (wx ? 0 : DC.bannerEvery * 0.5), n);
        }
      });
      chandelier(si, cx, top - 0.2, cz, Math.min(2.4, W * 0.12));
      if (o.tall) chandelier(si, cx, o.y + o.h * 0.5, cz, Math.min(1.8, W * 0.09));
      var GH = T.greatHall && T.greatHall[cn];
      if (GH && GH.posts && P.great && P.great.kind === 'traininghall') {
        /* training posts: a stout post with a crossbar, a rope between neighbours; a sand square under them */
        var n = GH.posts, pts = [];
        for (var i = 0; i < n; i++) { var u = VC.intU(cn, 77, i, 1), v = VC.intU(cn, 77, i, 2); pts.push([o.x0 + W * (0.25 + 0.5 * u), o.z0 + L * (0.25 + 0.5 * v)]); }
        aabb(VC.intSetMat('int_stone'), si, [cx - W * 0.34, cx + W * 0.34, cz - L * 0.34, cz + L * 0.34, o.y + 0.02, o.y + 0.06], col(0xa89470));
        pts.forEach(function (p, i) {
          aabb(VC.intSetMat('int_carved'), si, [p[0] - 0.16, p[0] + 0.16, p[1] - 0.16, p[1] + 0.16, o.y, o.y + 3.6 + (i % 2) * 0.6], cTimber);
          aabb(VC.intSetMat('int_carved'), si, [p[0] - 0.7, p[0] + 0.7, p[1] - 0.06, p[1] + 0.06, o.y + 1.6 + (i % 3) * 0.4, o.y + 1.72 + (i % 3) * 0.4], cTimber);
          aabb(iron, si, [p[0] - 0.2, p[0] + 0.2, p[1] - 0.2, p[1] + 0.2, o.y + 3.2, o.y + 3.3], cIron);
          if (i) { var r = pts[i - 1]; aabb(iron, si, [Math.min(p[0], r[0]), Math.max(p[0], r[0]) + 0.03, Math.min(p[1], r[1]), Math.max(p[1], r[1]) + 0.03, o.y + 3.0, o.y + 3.04], col(0x8a7a5a)); }
        });
      }
      return;
    }
    /* lanterns down the hall (a chandelier over an atrium's void), torches between them, tapestries on both sides */
    var k = Math.max(1, Math.round(L / LT.hallEvery));
    for (var i = 0; i < k; i++) {
      var t = (i + 0.5) / k, lx = alongX ? o.x0 + L * t : cx, lz = alongX ? cz : o.z0 + L * t, a = a0 + L * t;
      if (atrium && a > atrium.a0 && a < atrium.a1) { if (i % 2 === 0) chandelier(si, lx, top + storeyH(si + 1) + T.slab - 0.2, lz, 1.6); continue; }
      hang(si, lx, top - 0.05, lz);
    }
    if (o.kind === 'hall' || o.kind === 'tunnel' || o.kind === 'passage') {
      var kt = Math.max(1, Math.round(L / LT.torchEvery));
      for (var j = 0; j < kt; j++) { var tt = (j + 0.25) / kt, ax = alongX ? o.x0 + L * tt : o.x0 + (j % 2 ? W : 0), az = alongX ? o.z0 + (j % 2 ? W : 0) : o.z0 + L * tt, nn = alongX ? [0, j % 2 ? -1 : 1] : [j % 2 ? -1 : 1, 0]; torch(si, ax, o.y + 2.3, az, nn); }
    }
    if (o.kind !== 'hall' || L < DC.tapEvery) return;
    var nt = Math.max(1, Math.floor((L - 4) / DC.tapEvery)), ty = top - DC.tapDrop - DC.tap[1] / 2;
    if (atrium) ty = o.y + Math.min(o.h, storeyH(si)) - DC.tapDrop - DC.tap[1] / 2;
    for (var s = -1; s <= 1; s += 2) for (var i2 = 0; i2 < nt; i2++) {
      var ta = a0 + 2 + (i2 + 0.5) * (L - 4) / nt; if (!clear(ta)) continue;
      var tx = alongX ? ta : (s < 0 ? o.x0 : o.x1) - s * 0.08, tz = alongX ? (s < 0 ? o.z0 : o.z1) - s * 0.08 : ta, nk = alongX ? [0, -s] : [-s, 0];
      panel(G.panel, tapAt(tx, tz), si, tx, ty, tz, d, DC.tap[0], DC.tap[1], 0.05, cWhite);
      aabb(trim, si, [tx - (alongX ? DC.tap[0] / 2 + 0.12 : 0.05), tx + (alongX ? DC.tap[0] / 2 + 0.12 : 0.05), tz - (alongX ? 0.05 : DC.tap[0] / 2 + 0.12), tz + (alongX ? 0.05 : DC.tap[0] / 2 + 0.12), ty + DC.tap[1] / 2, ty + DC.tap[1] / 2 + 0.07], cTrim);
      /* a candle nook between the tapestries where the look has them */
      if (look.nooks && i2 < nt - 1) { var na = ta + (L - 4) / nt / 2, nx = alongX ? na : tx, nz = alongX ? tz : na; if (clear(na)) { aabb(VC.intSetMat('int_wall'), si, [nx - (alongX ? DC.nook[0] / 2 : 0.1), nx + (alongX ? DC.nook[0] / 2 : 0.1), nz - (alongX ? 0.1 : DC.nook[0] / 2), nz + (alongX ? 0.1 : DC.nook[0] / 2), o.y + 1.1, o.y + 1.1 + DC.nook[1]], col(0x2a2420)); sconce(si, nx + nk[0] * 0.1, o.y + 1.3, nz + nk[1] * 0.1, nk); } }
    }
  });
  /* the rooms: a lantern under the ceiling, or a candle sconce beside the door in a cell, a store, a dormitory */
  P.rooms.forEach(function (r) {
    if (r.open) return;
    var cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2, top = r.y + (r.h || 4);
    if (LT.candleKinds.indexOf(r.kind) >= 0 && r.door) { var n = r.door.n; sconce(r.storey, r.door.x - n[0] * 0.3 + n[1] * 1.3, r.y + 1.7, r.door.z - n[1] * 0.3 - n[0] * 1.3, [-n[0], -n[1]]); return; }
    hang(r.storey, cx, top - 0.05, cz);
    if ((r.x1 - r.x0) * (r.z1 - r.z0) > 150) hang(r.storey, cx + (r.x1 - r.x0) * 0.3, top - 0.05, cz);
  });
  /* the dado band round every room and hall where the look has a dado sheet */
  if (look.dado) {
    var dado = VC.intSheetMat(look.dado, { tile: 2 });
    P.rooms.concat(P.halls).forEach(function (r) {
      if (r.nowalls || r.nofloor) return;
      var si = r.storey == null ? 0 : r.storey, y = r.y + DC.dado;
      [[r.x0 + 0.1, r.z0 + 0.1, r.x1 - 0.1, r.z0 + 0.1, [1, 0]], [r.x0 + 0.1, r.z1 - 0.1, r.x1 - 0.1, r.z1 - 0.1, [1, 0]], [r.x0 + 0.1, r.z0 + 0.1, r.x0 + 0.1, r.z1 - 0.1, [0, 1]], [r.x1 - 0.1, r.z0 + 0.1, r.x1 - 0.1, r.z1 - 0.1, [0, 1]]].forEach(function (w) {
        var len = Math.hypot(w[2] - w[0], w[3] - w[1]); if (len < 1) return;
        panel(G.panel, dado, si, (w[0] + w[2]) / 2, look.dadoH ? r.y + 0.25 + look.dadoH / 2 : y - 0.22, (w[1] + w[3]) / 2, w[4], len, look.dadoH || 0.44, 0.04, cWhite);
      });
    });
  }
  /* the medallion on the core's floor */
  if (look.medallion && P.storeys.length) { var S0 = P.storeys[P.ground || 0]; panel(G.panel, VC.intSheetMat(look.medallion), S0.i, P.core.x, S0.y + 0.012, P.core.z, [1, 0], T.core * 1.4, 0.02, T.core * 1.4, cWhite); }
  /* the railings: a rail on posts */
  P.boxes.forEach(function (b) {
    if (b.kind !== 'rail') return;
    var alongX = b.x1 - b.x0 > b.z1 - b.z0, len = alongX ? b.x1 - b.x0 : b.z1 - b.z0, n = Math.max(2, Math.round(len / DC.railPosts) + 1);
    aabb(trim, b.storey, [b.x0 - 0.04, b.x1 + 0.04, b.z0 - 0.04, b.z1 + 0.04, b.y1 - 0.08, b.y1 + 0.04], cTrim);
    for (var i = 0; i < n; i++) { var t = n > 1 ? i / (n - 1) : 0.5, px = alongX ? b.x0 + len * t : (b.x0 + b.x1) / 2, pz = alongX ? (b.z0 + b.z1) / 2 : b.z0 + len * t; aabb(trim, b.storey, [px - 0.07, px + 0.07, pz - 0.07, pz + 0.07, b.y0, b.y1], cTimber); }
  });
  /* a light well's mouth on the deck: the dark slot */
  (P.wells || []).forEach(function (w) { aabb(VC.intSetMat('int_wall'), w.storey, [w.x0, w.x1, w.z0, w.z1, w.y1 - 0.08, w.y1], cDark); });
  /* the suites' decor (40b-vc-suites.js VC.suiteFinish): the pillars' bases and capitals, the ancestors' statues, the
     octagon's diagonal walls and its corbelled dome, the sun chandelier (the sun, the giant and Krator on a jewelled
     hoop), daises with the throne or the altar, the atrium's basin, braziers, tapestries hung flat or at 45 degrees
     from the ceiling (the banquet hall), ornamental screens, candle nooks; torches round every state room */
  var SU = P.suite;
  if (SU && VC.SUITES[cn]) {
    var statueM = VC.intSetMat(look.statueSet === 'int_gilt' ? 'int_scale' : look.statueSet || 'int_stone', look.statueSet === 'int_gilt' ? { metal: 0.85, rough: 0.32 } : {}), cStatue = col(look.statue || 0xcfc3ad), stoneM = VC.intSetMat('int_stone'), cStone = col(0xa89a84), gilt = VC.intSetMat('int_gilt', { metal: 0.85, rough: 0.3 }), cGilt = col(look.gilt || 0xc9a227);
    var wallM2 = VC.intSetMat(look.wallSet), cWall = col(look.wall), ceilM2 = VC.intSetMat(look.ceilSet, { emissive: 0x3a2e20 }), cCeil = col(look.ceil), floorM2 = VC.intSetMat(look.floorSet), cStep = col(look.step), silk = VC.intSheetMat(look.screen || 'screen_lattice'), cSilk = col(0xf2e8d2), rugM = VC.intSheetMat('int_rug'), cRug = col(look.rug);
    var X = new THREE.Vector3(1, 0, 0), qy = new THREE.Quaternion(), qx = new THREE.Quaternion();
    var doorsNear = function (x, z, r) { return (SU.doors || []).some(function (d) { return Math.hypot(d.x - x, d.z - z) < r; }) || (SU.exits || []).some(function (d) { return Math.hypot(d.x - x, d.z - z) < r + 5; }) || P.rooms.some(function (q) { return q.door && Math.hypot(q.door.x - x, q.door.z - z) < r; }); };
    var ax = VC.SUITES[cn].axis, pv = [-ax[1], ax[0]], pt = function (u, v) { return [P.M.x + ax[0] * u + pv[0] * v, P.M.z + ax[1] * u + pv[1] * v]; };
    /* the four walls of a suite rectangle: [x0, z0, x1, z1, inward normal, direction along] */
    var wallsOfUV = function (u, v) { var a = pt(u[0], v[0]), b = pt(u[1], v[1]), x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]); return [[x0, z0, x1, z0, [0, 1], [1, 0]], [x0, z1, x1, z1, [0, -1], [1, 0]], [x0, z0, x0, z1, [1, 0], [0, 1]], [x1, z0, x1, z1, [-1, 0], [0, 1]]]; };
    var dirOf = function (ry) { return [Math.cos(ry), -Math.sin(ry)]; }, faceOf = function (ry) { return [Math.sin(ry), Math.cos(ry)]; };
    var drum = function (si, mat, x, y, z, r, h, c) { var m = new THREE.Matrix4(); m.makeScale(r * 2, h, r * 2); m.setPosition(x, y + h / 2, z); add(si, G.drum, mat, m, c); };
    var ball = function (si, mat, x, y, z, r, c) { var m = new THREE.Matrix4(); m.makeScale(r * 2, r * 2, r * 2); m.setPosition(x, y, z); add(si, G.ball, mat, m, c); };
    var chain = function (si, x0, y0, z0, x1, y1, z1) { var dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz) || 0.01, m = new THREE.Matrix4(); qy.setFromAxisAngle(Y, Math.atan2(-dz, dx)); qx.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.atan2(y1 - y0, L)); q.copy(qy).multiply(qx); pos.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); sc.set(Math.hypot(L, y1 - y0), 0.04, 0.04); m.compose(pos, q, sc); add(si, G.panel, iron, m, cIron); };
    var candle = function (si, x, y, z, s) { s = s || 1; aabb(wax, si, [x - 0.05 * s, x + 0.05 * s, z - 0.05 * s, z + 0.05 * s, y, y + 0.32 * s], cWax); aabb(flame, si, [x - 0.035 * s, x + 0.035 * s, z - 0.035 * s, z + 0.035 * s, y + 0.32 * s, y + 0.44 * s], cWhite); };
    SU.decor.forEach(function (it) {
      var si = it.storey, y = it.y;
      switch (it.kind) {
        case 'pillar':
          aabb(look.column ? VC.intSetMat(look.column) : wallM2, si, [it.x - it.w / 2, it.x + it.w / 2, it.z - it.w / 2, it.z + it.w / 2, y + 0.7, y + it.h - 1.1], look.column ? cWhite : cWall);
          aabb(trim, si, [it.x - it.w / 2 - 0.25, it.x + it.w / 2 + 0.25, it.z - it.w / 2 - 0.25, it.z + it.w / 2 + 0.25, y, y + 0.7], cTrim);
          aabb(trim, si, [it.x - it.w / 2 - 0.3, it.x + it.w / 2 + 0.3, it.z - it.w / 2 - 0.3, it.z + it.w / 2 + 0.3, y + it.h - 1.1, y + it.h - 0.02], cTrim);
          break;
        case 'statue': {
          var s = 1 + (it.i % 3) * 0.08, m = new THREE.Matrix4();
          aabb(stoneM, si, [it.x - 0.8, it.x + 0.8, it.z - 0.8, it.z + 0.8, y, y + 0.9], cStone);
          q.setFromAxisAngle(Y, it.ry);
          pos.set(it.x, y + 0.9 + 1.5 * s, it.z); sc.set(1.2 * s, 3.0 * s, 0.9 * s); m.compose(pos, q, sc); add(si, G.drum, statueM, m, cStatue);                                    /* the robed body */
          m = new THREE.Matrix4(); pos.set(it.x, y + 0.9 + 2.9 * s, it.z); sc.set(1.5 * s, 0.7 * s, 1.1 * s); m.compose(pos, q, sc); add(si, G.drum, statueM, m, cStatue);           /* the shoulders */
          m = new THREE.Matrix4(); pos.set(it.x, y + 0.9 + 3.55 * s, it.z); sc.set(0.6 * s, 0.7 * s, 0.6 * s); m.compose(pos, q, sc); add(si, G.ball, statueM, m, cStatue);          /* the head */
          m = new THREE.Matrix4(); pos.set(it.x, y + 0.9 + 4.05 * s, it.z); sc.set(0.5 * s, 0.6 * s, 0.5 * s); m.compose(pos, q, sc); add(si, G.cone, statueM, m, cStatue);          /* the crest */
          break; }
        case 'diag': panel(G.panel, look.inlay ? VC.intSetMat(look.inlay) : wallM2, si, it.x, y + it.h / 2, it.z, it.d, it.len, it.h, it.t, look.inlay ? cWhite : cWall); break;
        case 'dome': {
          var N = 7;
          for (var k = 0; k < N; k++) { var tk = k / N, rk = it.r * (1 - Math.pow(tk, 1.5) * 0.9), dh = it.h / N; drum(si, ceilM2, it.x, y + k * dh, it.z, rk, dh, cCeil); drum(si, gilt, it.x, y + k * dh, it.z, rk + 0.15, 0.18, cGilt); }
          if (look.domeMosaic) panel(G.panel, VC.intSheetMat(look.domeMosaic), si, it.x, y - 0.04, it.z, [1, 0], it.r * 1.42, 0.03, it.r * 1.42, cWhite);   /* the sky over the sun: the ringed giant */
          break; }
        case 'sun': {
          var r = it.r, cy = y - 2.2;
          aabb(iron, si, [it.x - 0.03, it.x + 0.03, it.z - 0.03, it.z + 0.03, cy, y + 0.9], cIron);
          var mh = new THREE.Matrix4(); mh.makeScale(r * 2, 1.6, r * 2); mh.setPosition(it.x, cy, it.z); add(si, G.ring, gilt, mh, cGilt);                 /* the hoop */
          mh = new THREE.Matrix4(); mh.makeScale(r * 1.1, 1.2, r * 1.1); mh.setPosition(it.x, cy - 0.4, it.z); add(si, G.ring, gilt, mh, cGilt);
          ball(si, VC.intGlowMat(0xffd27a), it.x, cy - 0.2, it.z, 0.95, cWhite);                                                                            /* the sun */
          var gx = it.x + r * 0.78, gz = it.z; ball(si, VC.intGlowMat(0xc8a060), gx, cy - 0.1, gz, 0.45, cWhite);                                            /* the giant */
          ball(si, VC.intGlowMat(0x7ab8c8), gx + 0.95, cy + 0.15, gz + 0.5, 0.21, cWhite);                                                                    /* Krator */
          for (var k2 = 0; k2 < 8; k2++) { var a2 = k2 / 8 * Math.PI * 2, cx2 = it.x + Math.cos(a2) * r, cz2 = it.z + Math.sin(a2) * r; candle(si, cx2, cy + 0.02, cz2, 1.3);
            var jx = it.x + Math.cos(a2 + 0.39) * r, jz = it.z + Math.sin(a2 + 0.39) * r; aabb(VC.intGlowMat(k2 % 2 ? 0x3f6b56 : 0x5e1e2d), si, [jx - 0.12, jx + 0.12, jz - 0.12, jz + 0.12, cy - 0.15, cy + 0.15], cWhite); }   /* the jewels: jade and porphyry */
          for (var c3 = 0; c3 < 4; c3++) { var ca3 = c3 / 4 * Math.PI * 2 + 0.4; chain(si, it.x, y + 0.8, it.z, it.x + Math.cos(ca3) * r, cy, it.z + Math.sin(ca3) * r); }
          lamps.push({ x: it.x, z: it.z, y: cy - 0.2, s: si, kind: 'sun' }); lamps.push({ x: gx, z: gz, y: cy, s: si, kind: 'sun' });
          break; }
        case 'dais': {
          var fd = faceOf(it.ry), dd = dirOf(it.ry);
          if (it.octagon) { drum(si, floorM2, it.x, y, it.z, it.r, 0.5, cStep); drum(si, floorM2, it.x, y + 0.5, it.z, it.r * 0.7, 0.5, cStep); drum(si, gilt, it.x, y + 1.0, it.z, it.r * 0.72, 0.06, cGilt); y += 1.0; }
          else if (it.r) { drum(si, floorM2, it.x, y, it.z, it.r, 0.6, cStep); y += 0.6; }
          else { panel(G.panel, floorM2, si, it.x, y + 0.35, it.z, dd, it.w, 0.7, it.d, cStep); y += 0.7; }
          if (it.throne) {
            /* the throne: on a step of its own, a high gilt back, a cushioned seat, armrests, the sun disc over it */
            var tx = it.x - fd[0] * 1.2, tz = it.z - fd[1] * 1.2;
            panel(G.panel, trim, si, tx, y + 0.2, tz, dd, 3.2, 0.4, 2.6, cTrim);
            panel(G.panel, gilt, si, tx - fd[0] * 0.5, y + 0.4 + 2.2, tz - fd[1] * 0.5, dd, 2.0, 4.4, 0.35, cGilt);
            panel(G.panel, rugM, si, tx, y + 0.4 + 0.45, tz, dd, 1.7, 0.9, 1.3, cRug);
            [-1, 1].forEach(function (s4) { panel(G.panel, gilt, si, tx + dd[0] * s4 * 0.95, y + 0.4 + 0.9, tz + dd[1] * s4 * 0.95, dd, 0.2, 1.1, 1.3, cGilt); });
            ball(si, VC.intGlowMat(0xffd27a), tx - fd[0] * 0.5, y + 0.4 + 4.6, tz - fd[1] * 0.5, 0.55, cWhite);
          }
          if (it.altar) {
            panel(G.panel, stoneM, si, it.x, y + 0.7, it.z, dd, 3.2, 1.4, 1.3, cStone);
            panel(G.panel, trim, si, it.x, y + 1.42, it.z, dd, 3.4, 0.08, 1.5, cTrim);
            for (var c5 = 0; c5 < 5; c5++) candle(si, it.x + (c5 - 2) * 0.6 * dd[0], y + 1.46, it.z + (c5 - 2) * 0.6 * dd[1], 1);
            lamps.push({ x: it.x, z: it.z, y: y + 2.0, s: si, kind: 'candle' });
            /* the ancestors' relief behind it: a tall panel of the dado sheet in a gilt frame */
            var bx = it.x - fd[0] * 5.5, bz = it.z - fd[1] * 5.5;
            panel(G.panel, VC.intSheetMat(look.icon || look.dado || [].concat(look.tapestry)[0]), si, bx, it.y + 4.5, bz, dd, 8, 7, 0.2, cWhite); panel(G.panel, gilt, si, bx, it.y + 8.1, bz, dd, 8.6, 0.3, 0.3, cGilt);
          }
          if (!it.throne && !it.altar && it.w) panel(G.panel, trim, si, it.x, y + 0.5, it.z, dd, it.w * 0.7, 1.0, 0.8, cTrim);   /* the plaintiffs' bench */
          break; }
        case 'basin': {
          drum(si, stoneM, it.x, y, it.z, it.r, 0.9, cStone); drum(si, VC.intGlowMat(0x3b5f66), it.x, y + 0.82, it.z, it.r * 0.86, 0.1, cWhite);
          drum(si, stoneM, it.x, y + 0.9, it.z, 0.45, 2.6, cStone); ball(si, stoneM, it.x, y + 3.75, it.z, 0.28, cStone);   /* the idol in the middle */
          for (var c6 = 0; c6 < 6; c6++) { var a6 = c6 / 6 * Math.PI * 2; candle(si, it.x + Math.cos(a6) * it.r * 0.9, y + 0.9, it.z + Math.sin(a6) * it.r * 0.9, 1); }
          lamps.push({ x: it.x, z: it.z, y: y + 1.6, s: si, kind: 'candle' });
          break; }
        case 'brazier':
          aabb(iron, si, [it.x - 0.5, it.x + 0.5, it.z - 0.5, it.z + 0.5, y, y + 0.12], cIron); aabb(iron, si, [it.x - 0.08, it.x + 0.08, it.z - 0.08, it.z + 0.08, y, y + 1.0], cIron);
          drum(si, trim, it.x, y + 0.95, it.z, 0.65, 0.5, cTrim);
          var mz = new THREE.Matrix4(); mz.makeScale(0.9, 1.3, 0.9); mz.setPosition(it.x, y + 2.0, it.z); add(si, G.cone, ember, mz, cWhite);
          lamps.push({ x: it.x, z: it.z, y: y + 2.0, s: si, kind: 'torch' });
          break;
        case 'chandelier': chandelier(si, it.x, it.y, it.z, it.r); break;
        case 'carpet': if (look.carpet) panel(G.panel, VC.intSheetMat(look.carpet), si, it.x, y + 0.012, it.z, it.d, it.len, 0.02, it.w, cWhite); break;
        case 'fresco': {
          /* a fresco over a door on an end wall, framed: the three brothers (the Chichani, the Zeijani and the Andaru) */
          panel(G.panel, VC.intSheetMat(it.sheet), si, it.x, it.y, it.z, it.d, it.s, it.s, 0.08, cWhite);
          panel(G.panel, trim, si, it.x + it.n[0] * 0.02, it.y + it.s / 2 + 0.15, it.z + it.n[1] * 0.02, it.d, it.s + 0.6, 0.3, 0.16, cTrim);
          panel(G.panel, trim, si, it.x + it.n[0] * 0.02, it.y - it.s / 2 - 0.15, it.z + it.n[1] * 0.02, it.d, it.s + 0.6, 0.3, 0.16, cTrim);
          [-1, 1].forEach(function (sd) { panel(G.panel, trim, si, it.x + it.d[0] * sd * (it.s / 2 + 0.15) + it.n[0] * 0.02, it.y, it.z + it.d[1] * sd * (it.s / 2 + 0.15) + it.n[1] * 0.02, it.d, 0.3, it.s, 0.16, cTrim); });
          lamps.push({ x: it.x + it.n[0] * 2, z: it.z + it.n[1] * 2, y: it.y - it.s / 2, s: si, kind: 'candle' });
          break; }
        case 'tilted': {
          /* the tapestries hung at 45 degrees: the top edge at the ceiling, the bottom against the long wall */
          var ws = wallsOfUV(it.u, it.v), n6 = Math.max(1, Math.floor((it.u[1] - it.u[0]) / it.every)), w6 = Math.min(7, it.every - 3), h6 = 5.2;
          ws.slice(0, 2).forEach(function (w) {
            var n = w[4], dir = w[5], ry = Math.atan2(-dir[1], dir[0]), sgn = (-dir[1] * n[0] + dir[0] * n[1]) > 0 ? 1 : -1, tilt = sgn * Math.PI / 4, inset = h6 * Math.SQRT1_2 / 2;
            for (var i6 = 0; i6 < n6; i6++) {
              var t6 = (i6 + 0.5) / n6, bx6 = w[0] + (w[2] - w[0]) * t6, bz6 = w[1] + (w[3] - w[1]) * t6;
              var mq = new THREE.Matrix4(); qy.setFromAxisAngle(Y, ry); qx.setFromAxisAngle(X, tilt); q.copy(qy).multiply(qx); pos.set(bx6 + n[0] * inset, it.y + it.h - 0.3 - inset, bz6 + n[1] * inset); sc.set(w6, h6, 0.06); mq.compose(pos, q, sc); add(si, G.panel, tapAt(bx6, bz6), mq, cWhite);
              aabb(trim, si, [bx6 + n[0] * inset * 2 - (dir[0] ? w6 / 2 + 0.1 : 0.06), bx6 + n[0] * inset * 2 + (dir[0] ? w6 / 2 + 0.1 : 0.06), bz6 + n[1] * inset * 2 - (dir[0] ? 0.06 : w6 / 2 + 0.1), bz6 + n[1] * inset * 2 + (dir[0] ? 0.06 : w6 / 2 + 0.1), it.y + it.h - 0.42, it.y + it.h - 0.3], cTrim);   /* the rod at the top */
            }
          });
          break; }
        case 'tapestries': {
          var ws2 = wallsOfUV(it.u, it.v), ty2 = it.y + it.h - DC.tapDrop - DC.tap[1] / 2;
          ws2.forEach(function (w) {
            var n = w[4], dir = w[5], len = Math.hypot(w[2] - w[0], w[3] - w[1]), k7 = Math.max(1, Math.floor(len / it.every));
            for (var i7 = 0; i7 < k7; i7++) { var t7 = (i7 + 0.5) / k7, bx7 = w[0] + (w[2] - w[0]) * t7, bz7 = w[1] + (w[3] - w[1]) * t7; if (doorsNear(bx7, bz7, DC.tap[0] / 2 + 1.5)) continue;
              panel(G.panel, tapAt(bx7, bz7), si, bx7 + n[0] * 0.08, ty2, bz7 + n[1] * 0.08, dir, DC.tap[0], DC.tap[1], 0.05, cWhite);
              panel(G.panel, trim, si, bx7 + n[0] * 0.1, ty2 + DC.tap[1] / 2 + 0.04, bz7 + n[1] * 0.1, dir, DC.tap[0] + 0.24, 0.07, 0.1, cTrim); }
          });
          break; }
        case 'screens': {
          /* ornamental screens: three carved frames with silk panels in a zigzag across the room's far third */
          var cu = it.u[0] + (it.u[1] - it.u[0]) * 0.62, n8 = 3, span = (it.v[1] - it.v[0]) * 0.6, v8 = it.v[0] + (it.v[1] - it.v[0]) * 0.2;
          for (var i8 = 0; i8 < n8; i8++) { var vv = v8 + span * (i8 + 0.5) / n8, p8 = pt(cu + (i8 % 2 ? 0.6 : -0.6), vv), sa = i8 % 2 ? 0.5 : -0.5, d8 = [pv[0] * Math.cos(sa) + ax[0] * Math.sin(sa), pv[1] * Math.cos(sa) + ax[1] * Math.sin(sa)];
            panel(G.panel, trim, si, p8[0], it.y + 1.2, p8[1], d8, span / n8 - 0.3, 2.4, 0.09, cTrim); panel(G.panel, silk, si, p8[0], it.y + 1.25, p8[1], d8, span / n8 - 0.6, 1.9, 0.1, cSilk); }
          break; }
        case 'nooks': {
          wallsOfUV(it.u, it.v).forEach(function (w) { var n = w[4], dir = w[5], len = Math.hypot(w[2] - w[0], w[3] - w[1]), k9 = Math.max(1, Math.floor(len / it.every));
            for (var i9 = 0; i9 < k9; i9++) { var t9 = (i9 + 0.5) / k9, bx9 = w[0] + (w[2] - w[0]) * t9, bz9 = w[1] + (w[3] - w[1]) * t9; if (doorsNear(bx9, bz9, 2.2)) continue;
              panel(G.panel, wallM2, si, bx9 + n[0] * 0.12, it.y + 1.1 + DC.nook[1] / 2, bz9 + n[1] * 0.12, dir, DC.nook[0], DC.nook[1], 0.2, col(0x2a2420)); sconce(si, bx9 + n[0] * 0.2, it.y + 1.3, bz9 + n[1] * 0.2, n); } });
          break; }
      }
    });
    /* torches round every state room's walls; lanterns in the two-floor rooms' upper floors */
    P.halls.forEach(function (o) {
      if (!o.suite || !o.great || o.nowalls) return;
      var si2 = o.storey, cx = (o.x0 + o.x1) / 2, cz = (o.z0 + o.z1) / 2;
      if (o.upper) { hang(si2, cx, o.y + o.h - 0.05, cz); hang(si2, cx + (o.x1 - o.x0) * 0.3, o.y + o.h - 0.05, cz); hang(si2, cx - (o.x1 - o.x0) * 0.3, o.y + o.h - 0.05, cz); }
      [[o.x0, o.z0, o.x1, o.z0, [0, 1]], [o.x0, o.z1, o.x1, o.z1, [0, -1]], [o.x0, o.z0, o.x0, o.z1, [1, 0]], [o.x1, o.z0, o.x1, o.z1, [-1, 0]]].forEach(function (w) {
        var len = Math.hypot(w[2] - w[0], w[3] - w[1]), k = Math.max(1, Math.round(len / 14));
        for (var i = 0; i < k; i++) { var t = (i + 0.5) / k, bx = w[0] + (w[2] - w[0]) * t, bz = w[1] + (w[3] - w[1]) * t; if (doorsNear(bx, bz, 2.5)) continue; torch(si2, bx, o.y + 2.6, bz, w[4]); }
      });
    });
  }
};
VC.drawInterior = function (cn) {
  if (VC.INTD.groups[cn]) return VC.INTD.groups[cn];
  var P = VC.INT.cantons[cn]; if (!P) return null;
  var g = new THREE.Group(); g.userData = { kind: 'interior', canton: cn }; g.visible = false; scene.add(g);
  /* the whole interior a few cm up (owner, 2026-10-09: "lots of z fighting inside the cantons"): each tier's lowest storey
     stands exactly on the captured tier's top face, and the keep's floor on the Fortress's deck; lifted, those faces lie
     inside the floor slabs. The walker still stands on the plan's heights (KWALK); the lift is far under a step. */
  g.position.y = TUNE.interiors.lift;
  /* the shell in the canton's look (TUNE.interiors.look; VC.intMats): walls, floors, ceilings and steps as library sets
     under the look's colours, everything an instance of a unit box, drum, cone or ring, grouped by storey (so the cutaway
     can hide the storeys above its cut), geometry and material */
  var look = VC.intLook(cn), G = VC.intGeo(), col = function (h) { return new THREE.Color(h); };
  var dark = function (c, si) { var S = P.storeys[si]; return S && S.dungeon ? c.clone().multiplyScalar(TUNE.interiors.dungeonDark) : c; };   /* the dungeon in darker stone */
  var wallM = VC.intSetMat(look.wallSet), floorM = VC.intSetMat(look.floorSet), ceilM = VC.intSetMat(look.ceilSet, { emissive: 0x3a2e20 }), trimM = VC.intSetMat(look.trimSet, look.trimSet === 'int_gilt' ? { metal: 0.85, rough: 0.32 } : {});
  var wall = col(look.wall), floor = col(look.floor), ceil = col(look.ceil), step = col(look.step), hallF = floor.clone().multiplyScalar(1.12), galF = floor.clone().multiplyScalar(1.06), trimC = col(look.trim);
  var groups = {};
  var add = function (si, geo, mat, m, c) { var k = si + '|' + geo.uuid + '|' + mat.uuid, e = groups[k] || (groups[k] = { si: si, geo: geo, mat: mat, L: [] }); e.L.push([m, dark(c, si)]); };
  var aabb = function (si, mat, b, c) { var m = new THREE.Matrix4(); m.makeScale(Math.max(0.01, b[1] - b[0]), Math.max(0.01, b[5] - b[4]), Math.max(0.01, b[3] - b[2])); m.setPosition(b[0], b[4], b[2]); add(si, G.box, mat, m, c); };
  P.boxes.forEach(function (b) { if (b.kind === 'rail' || b.kind === 'diagblock' || b.kind === 'pillar') return; aabb(b.storey, wallM, [b.x0, b.x1, b.z0, b.z1, b.y0, b.y1], b.kind === 'well' ? wall.clone().multiplyScalar(0.85) : wall); });   /* the railings are the decoration's (VC.intDecor); the octagons' stepped blocks are the walker's only */
  var GW = TUNE.interiors.gateway && TUNE.interiors.gateway[cn], wingOf = function (f) { var h = P.halls.filter(function (q) { return q.wing && q.storey === f.storey && q.x0 === f.x0 && q.z0 === f.z0 && q.x1 === f.x1 && q.z1 === f.z1; })[0]; return h && h.wing; };
  /* a room's floor by its use (look.roomFloors: {set: [kinds]}; the rest the look's floorSet), the halls' by look.hallFloorSet */
  var kindOf = {}; P.rooms.forEach(function (r) { kindOf[r.id] = r.kind; });
  var roomSet = {}; Object.keys(look.roomFloors || {}).forEach(function (s) { look.roomFloors[s].forEach(function (k) { roomSet[k] = s; }); });
  var hallM = look.hallFloorSet ? VC.intSetMat(look.hallFloorSet) : floorM;
  P.floors.forEach(function (f) {
    var wg = f.kind === 'hall' && GW && wingOf(f), isHall = f.kind === 'hall' || f.kind === 'tunnel' || f.kind === 'passage' || f.kind === 'core' || f.kind === 'greathall' || f.kind === 'gallery' || f.kind === 'landing';
    var rs = f.room && roomSet[kindOf[f.room]], fm = rs ? VC.intSetMat(rs) : isHall ? hallM : floorM;
    var c = wg ? col(GW.colours[wg]) : rs ? col(look.roomFloorTint || 0xe8e8e8) : f.kind === 'gallery' ? galF : isHall ? (look.hallFloorSet ? col(look.hallFloor || look.floor) : hallF) : floor;
    aabb(f.storey, floorM === fm ? floorM : fm, [f.x0, f.x1, f.z0, f.z1, f.y - 0.3, f.y], c);
  });
  /* each wing's portal at its hall's mouth, in its colour: pillars either side, a lintel and a sign board over it */
  P.halls.forEach(function (h) {
    if (!h.wing || !GW) return;
    var c = [P.core.x + h.d[0] * (TUNE.interiors.core + 0.6), P.core.z + h.d[1] * (TUNE.interiors.core + 0.6)], n = [-h.d[1], h.d[0]], hw = TUNE.interiors.hall / 2, wc = col(GW.colours[h.wing]), y = h.y;
    var box = function (p, along, across, y0, y1, cl) { var ax = Math.abs(h.d[0]) > 0.5; aabb(h.storey, trimM, ax ? [p[0] - along, p[0] + along, p[1] - across, p[1] + across, y0, y1] : [p[0] - across, p[0] + across, p[1] - along, p[1] + along, y0, y1], cl); };
    [-1, 1].forEach(function (s) { box([c[0] + n[0] * s * (hw - 0.5), c[1] + n[1] * s * (hw - 0.5)], 0.5, 0.5, y, y + h.h - 0.4, wc.clone().multiplyScalar(0.7)); });
    box(c, 0.5, hw, y + h.h - 1.2, y + h.h - 0.4, wc.clone().multiplyScalar(0.7));
    box([c[0] + h.d[0] * 0.55, c[1] + h.d[1] * 0.55], 0.06, hw * 0.55, y + h.h - 2.0, y + h.h - 1.25, wc);
  });
  (P.ceilings || []).forEach(function (c) { aabb(c.storey, ceilM, [c.x0, c.x1, c.z0, c.z1, c.y, c.y + 0.3], ceil); });
  P.flights.forEach(function (f) {
    var n = Math.max(2, Math.round((f.y1 - f.y0) / 0.3)), L = Math.hypot(f.b[0] - f.a[0], f.b[1] - f.a[1]), u = [(f.b[0] - f.a[0]) / L, (f.b[1] - f.a[1]) / L], alongX = Math.abs(u[0]) > 0.5;
    for (var s = 0; s < n; s++) { var t = (s + 0.5) / n, x = f.a[0] + u[0] * L * t, z = f.a[1] + u[1] * L * t, top = f.y0 + (f.y1 - f.y0) * (s + 1) / n - (s === n - 1 ? 0.012 : 0),   /* the last tread a shade under the floor it meets */ d = L / n / 2 * 1.02, w = f.w / 2;
      aabb(f.storey, floorM, alongX ? [x - d, x + d, z - w, z + w, f.base, top] : [x - w, x + w, z - d, z + d, f.base, top], step); }
  });
  /* the decoration and the light fittings (above): tapestries, dado bands, nooks, railings, lanterns, candles, torches,
     chandeliers; `lamps` is what the light pool reads */
  var lamps = [];
  VC.intDecor(P, look, add, lamps);
  g.userData.storeys = {};
  var nBox = 0;
  Object.keys(groups).forEach(function (k) {
    var e = groups[k], IM = new THREE.InstancedMesh(e.geo, e.mat, e.L.length);
    e.L.forEach(function (it, i) { IM.setMatrixAt(i, it[0]); IM.setColorAt(i, it[1]); });
    IM.castShadow = !!(e.mat.userData && e.mat.userData.set) && !e.mat.map; IM.receiveShadow = true; IM.frustumCulled = false;   /* never culled: three r128 tests an InstancedMesh's geometry (a unit box at the world's origin), not its instances, so a canton far from the origin lost its interior */
    IM.userData = { kind: 'interior', canton: cn, storey: e.si, probeSkip: true };
    g.add(IM); (g.userData.storeys[e.si] = g.userData.storeys[e.si] || []).push(IM); nBox += e.L.length;
  });
  g.userData.lamps = lamps;
  /* the furniture: storey by storey, as the cutaway or the walker shows them (VC.intDrawStorey, VC.intWant) */
  g.userData.furn = {}; g.userData.upTo = null;
  /* the beasts in the stables (owner, 2026-10-09: "populate it with tigers, beetles, and lizards"): kits/fauna's Voth
     animals (build.py fauna_fragment), one or two to a stable room, a KRAND hash of the room choosing which and where,
     each fitted to the room and facing its door, idling while the interior shows (VC.INTD.beasts) */
  var BT = TUNE.interiors.beasts, nBeast = 0;
  if (typeof KratorFauna !== 'undefined' && BT) {
    var protoB = VC.INTD.beastProto || (VC.INTD.beastProto = {});
    P.rooms.forEach(function (r) {
      if (BT.rooms.indexOf(r.kind) < 0) return;
      var u = function (s) { return KRAND.unit(KRAND.hash(7901, Math.round(r.x0 * 4), Math.round(r.z0 * 4), s)); };
      var n = u(1) < BT.pair ? 2 : 1, rw = r.x1 - r.x0, rd = r.z1 - r.z0;
      for (var k = 0; k < n; k++) {
        var key = BT.keys[Math.floor(u(2 + k) * BT.keys.length) % BT.keys.length];
        if (!protoB[key]) { try { protoB[key] = KratorFauna.build(key, { seed: 3 }); } catch (e) { protoB[key] = { bad: String(e) }; } }
        var Pb = protoB[key]; if (!Pb || Pb.bad) continue;
        var ud = Pb.userData, len = Math.max(ud.d || 1, ud.w || 1), room = Math.min(rw, rd) * (n > 1 ? 0.45 : 0.7), s = Math.min(1, room / len);
        var a = Pb.clone(); a.scale.setScalar(s);
        var along = rw >= rd, off = n > 1 ? (k ? 1 : -1) * (along ? rw : rd) * 0.22 : 0;
        a.position.set((r.x0 + r.x1) / 2 + (along ? off : 0), r.y, (r.z0 + r.z1) / 2 + (along ? 0 : off));
        if (r.door) a.rotation.y = Math.atan2(r.door.x - a.position.x, r.door.z - a.position.z) + (u(5 + k) - 0.5) * 0.8;   /* +z its snout, toward the door */
        a.userData = Object.assign({}, ud, { kind: 'beast', canton: cn, storey: r.storey, phase: u(7 + k) * 10 });
        g.add(a); (g.userData.storeys[r.storey] = g.userData.storeys[r.storey] || []).push(a);
        (VC.INTD.beasts = VC.INTD.beasts || []).push(a); nBeast++;
      }
    });
    if (nBeast && !VC.INTD.beastTick) {
      VC.INTD.beastTick = true;
      (window._frameHooks = window._frameHooks || []).push(function (now) {
        var t = now / 1000;
        VC.INTD.beasts.forEach(function (a) { if (a.visible && a.parent && a.parent.visible) KratorFauna.animate(a, t + a.userData.phase, 'idle'); });
      });
    }
  }
  g.userData.stats = { beasts: nBeast, boxes: nBox, lamps: lamps.length, furniture: 0, storeysFurnished: 0, rooms: P.rooms.length, furnishMs: 0, missing: 0, errors: 0, firstError: null };
  VC.INTD.groups[cn] = g;
  return g;
};
/* a storey's furniture, once: kits/interiors' placements (VC.intFurnish), one InstancedMesh per piece (key and variant) and
   part, so the storey hides as a whole; shown as the group's cut shows it, clipped by the cutaway's planes */
VC.intDrawStorey = function (cn, si) {
  var g = VC.INTD.groups[cn], P = VC.INT.cantons[cn]; if (!g || !P || g.userData.furn[si]) return;
  g.userData.furn[si] = true;
  var F = VC.intFurnish(cn, si), protos = {}, wealth = TUNE.interiors.wealth[cn] == null ? 0.5 : TUNE.interiors.wealth[cn];
  F.placements.forEach(function (p) {
    var pk = p.key + '|' + (p.variant || 0), Pr = protos[pk] || (protos[pk] = Object.assign({ items: [] }, VC.intProto(p.key, p.variant || 0, wealth)));
    if (!Pr.bad) Pr.items.push(p);
  });
  var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1), pos = new THREE.Vector3();
  var list = g.userData.storeys[si] = g.userData.storeys[si] || [], vis = g.userData.upTo == null || +si <= g.userData.upTo, planes = VC.INTD.planes, n = 0;
  Object.keys(protos).forEach(function (pk) {
    var Pr = protos[pk], items = Pr.items; if (Pr.bad || !items.length) return;
    Pr.parts.forEach(function (part) {
      var IM = new THREE.InstancedMesh(part.geo, part.mat, items.length);
      items.forEach(function (p, i) { q.setFromAxisAngle(Y, p.ry || 0); pos.set(p.x, p.y, p.z); m4.compose(pos, q, one); IM.setMatrixAt(i, m4); });
      IM.castShadow = false; IM.receiveShadow = true; IM.frustumCulled = false; IM.userData = { kind: 'furniture', canton: cn, storey: +si, probeSkip: true, items: items };   /* (the walls' reason, VC.drawInterior) */   /* items[instanceId]: the inspector's piece */
      IM.visible = vis;
      if (planes) [].concat(IM.material).forEach(function (m) { if (m.clippingPlanes !== planes) { m.clippingPlanes = planes; m.clipIntersection = true; m.clipShadows = true; m.needsUpdate = true; } });
      g.add(IM); list.push(IM);
    });
    n += items.length;
  });
  var st = g.userData.stats; st.furniture += n; st.furnishMs += F.ms; st.missing += F.missing; st.errors += F.errors || 0; st.storeysFurnished++;
  if (!st.firstError && F.firstError) st.firstError = F.firstError;
};
/* what a view of storey si wants furnished: si and every storey with a room standing up into it (a tall room, a court),
   now; then, TUNE.interiors.lazyMs a frame, the storeys round it: in the cutaway those under it (seen down the voids and
   galleries), for the walker the one above and the one below */
VC.intWant = function (cn, si, cut) {
  var g = VC.INTD.groups[cn], P = VC.INT.cantons[cn]; if (!g || !P) return;
  var key = si + (cut ? 'c' : 'w'); if (g.userData.want === key) return; g.userData.want = key;
  var S = P.storeys[si], y = S ? S.y : -Infinity, now = [si];
  P.rooms.forEach(function (r) { var k = r.storey || 0; if (k < si && now.indexOf(k) < 0 && r.y + r.h > y + 0.5) now.push(k); });
  now.forEach(function (k) { VC.intDrawStorey(cn, k); });
  var later = [], k;
  if (cut) for (k = si - 1; k >= 0; k--) later.push(k); else later.push(si + 1, si - 1);
  VC.INTD.lazy = { cn: cn, list: later.filter(function (k) { return k >= 0 && k < P.storeys.length && !g.userData.furn[k]; }) };
  if (!VC.INTD.lazyHook) {
    VC.INTD.lazyHook = true;
    (window._frameHooks = window._frameHooks || []).push(function () {
      var L = VC.INTD.lazy; if (!L || !L.list.length) return;
      var g2 = VC.INTD.groups[L.cn]; if (!g2 || !g2.visible) { L.list = []; return; }
      var k2 = L.list[0];
      if (g2.userData.furn[k2] || VC.intFurnishStep(L.cn, k2, TUNE.interiors.lazyMs)) { VC.intDrawStorey(L.cn, k2); L.list.shift(); }
    });
  }
};
/* the walker's storey in a canton: the highest whose floor is under its feet */
VC.intStoreyAt = function (P, y) { var k = 0; P.storeys.forEach(function (S, i) { if (S.y - 0.6 <= y) k = i; }); return k; };
/* show a canton's interior up to (and including) a storey (null: all of it), or hide it */
VC.showInterior = function (cn, on, upTo) {
  var g = on ? VC.drawInterior(cn) : VC.INTD.groups[cn]; if (!g) return;
  g.visible = !!on;
  if (!on) { g.userData.want = null; return; }
  g.userData.upTo = upTo == null ? null : upTo;
  Object.keys(g.userData.storeys).forEach(function (si) { g.userData.storeys[si].forEach(function (m) { m.visible = upTo == null || +si <= upTo; }); });
  if (upTo != null) VC.intWant(cn, upTo, true);
};

/* the interiors' light pool: TUNE.interiors.lamps.pool point lights, made once at the start (so every material compiles
   with them once), moved each few frames onto the lamps nearest the camera among the interiors and storeys showing;
   dark when no interior shows */
VC.intLightPool = function () {
  var LT = TUNE.interiors.lamps, pool = [];
  for (var i = 0; i < LT.pool; i++) { var L = new THREE.PointLight(new THREE.Color(LT.color), 0, LT.range, 2); L.castShadow = false; scene.add(L); pool.push(L); }
  VC.INTD.pool = pool;
  var tick = 0, cam = new THREE.Vector3();
  (window._frameHooks = window._frameHooks || []).push(function () {
    if (tick++ % 3) return;
    var cand = [];
    camera.getWorldPosition(cam);
    Object.keys(VC.INTD.groups).forEach(function (cn) {
      var g = VC.INTD.groups[cn]; if (!g.visible || !g.userData.lamps) return;
      var showing = {}; Object.keys(g.userData.storeys).forEach(function (si) { showing[si] = g.userData.storeys[si][0].visible; });
      g.userData.lamps.forEach(function (l) { if (!showing[l.s]) return; var d = (l.x - cam.x) * (l.x - cam.x) + (l.y - cam.y) * (l.y - cam.y) + (l.z - cam.z) * (l.z - cam.z); if (d < LT.reach * LT.reach) cand.push([d, l, g.position.y]); });
    });
    /* the lot buildings showing (56b: the cutaway's, the one walked into), their lamps in their own frames */
    var wp = new THREE.Vector3();
    Object.keys((VC.IXD && VC.IXD.groups) || {}).forEach(function (i) {
      var g = VC.IXD.groups[i]; if (!g || !g.visible || !g.userData.lamps) return;
      if (Math.hypot(g.position.x - cam.x, g.position.z - cam.z) > LT.reach + 40) return;
      g.userData.lamps.forEach(function (l) { wp.set(l.x, l.y, l.z); g.localToWorld(wp); var d = wp.distanceToSquared(cam); if (d < LT.reach * LT.reach) cand.push([d, { x: wp.x, y: wp.y, z: wp.z }, 0]); });
    });
    cand.sort(function (a, b) { return a[0] - b[0]; });
    pool.forEach(function (L, i) { var c = cand[i]; if (!c) { L.intensity = 0; return; } L.position.set(c[1].x, c[1].y + c[2] - 0.4, c[1].z); L.intensity = LT.intensity; });
  });
};

/* ---------------------------------------------------------------- the cutaway: core/host's (99-host-cutaway.js)
   X (or the cutaway button), the bar at the top of the view (the unit, the storey of how many, down, up, close), ] [
   PageUp PageDown and Shift + the wheel are the host's since ROADMAP.md section 10, step 6b; 97-vc-host-take.js hands it
   the cantons with their storeys and the lot buildings in view (56b VC.CUTB). The planes are the host's: five,
   intersected (clipped only where it is above the cut AND inside the canton's square, grown 20 m), set on every material
   in the scene at the first cut and moved after, so nothing recompiles as the storey changes; VC.INTD.planes is them
   (58-vc-tools.js VC.pickInterior and the storeys drawn later, VC.intDrawStorey, read it). What a cut shows is Voth's:
   the canton's interior drawn and shown up to the storey (VC.cutCanton, through 56b's VC.cutShow). */
VC.cutPlanes = function () { var P = KHOST.cut.ensure(); VC.INTD.planes = P; return P; };
/* the box the cut opens: [x0, x1, z0, z1, y] (null: nowhere) */
VC.cutBox = function (b) { if (KHOST.cut && KHOST.cut.box) KHOST.cut.box(b); };
/* a canton cut open at a storey (the host sets the box after) */
VC.cutCanton = function (cn, storey) {
  var C = VC.INTD.cut, P = VC.INT.cantons[cn]; if (!P) return;
  if (C.canton && C.canton !== cn) VC.showInterior(C.canton, false);
  var S = P.storeys[Math.max(0, Math.min(P.storeys.length - 1, storey))];
  C.canton = cn; C.storey = S.i; C.on = true;
  var g = VC.drawInterior(cn); VC.cutPlanes();
  VC.showInterior(cn, true, S.i);
  var e = $('cut-status'); if (e) e.textContent = cn + ' canton, storey ' + (S.i + 1) + ' of ' + P.storeys.length + (S.dungeon ? ', the dungeon' : '') + ' (floor ' + S.y.toFixed(1) + ' m)' + (g.userData.stats ? ', ' + g.userData.stats.rooms + ' rooms, ' + g.userData.stats.furniture + ' pieces' : '');
};
VC.cutCantonOff = function () {
  var C = VC.INTD.cut; if (C.canton && !VC.INTD.walkIn) VC.showInterior(C.canton, false);
  C.on = false; C.canton = null;
  var e = $('cut-status'); if (e) e.textContent = '';
};
/* the bar's words for a canton's storey (owner, 2026-10-09: "make it more clear how to advance the floor up/down") */
VC.cutCantonBar = function (cn, si) {
  var P = VC.INT.cantons[cn], S = P.storeys[si];
  return ' storey <b>' + (si + 1) + '</b> of ' + P.storeys.length + (S.dungeon ? ' <b>(dungeon)</b>' : '') + ' <span class="k" style="display:inline">(floor ' + S.y.toFixed(1) + ' m)</span> ';
};
/* what the rest of the page calls: a canton by its name, a lot building by its index (56b VC.cutUnitOf) */
VC.cutTo = function (cn, storey) { var u = VC.cutUnitOf(cn); if (u != null && KHOST.cut && KHOST.cut.to) KHOST.cut.to(u, storey); };
VC.cutOff = function () { if (KHOST.cut && KHOST.cut.off) KHOST.cut.off(); };
VC.cutBar = function () { if (KHOST.cut && KHOST.cut.paint) KHOST.cut.paint(); };
/* the canton nearest the middle of the view (the orbit's target) */
VC.cutPick = function () {
  var t = ctl.target, best = null, bd = Infinity;
  Object.keys(VC.INT.cantons).forEach(function (cn) { var M = VC.INT.cantons[cn].M, d = Math.hypot(M.x - t.x, M.z - t.z); if (d < bd) { bd = d; best = cn; } });
  return best;
};
VC.cutUI = function () {
  VC.intLightPool();
  /* walking into a canton shows its interior (and walking out hides it) */
  (window._frameHooks = window._frameHooks || []).push(function () {
    var A = ctl.walk && VC.walkAt, inside = null;
    if (A) Object.keys(VC.INT.cantons).some(function (cn) {
      var P = VC.INT.cantons[cn], M = P.M; if (CANT.sq(M, A[0], A[1]) > (M.apron ? M.apron.ro : M.r)) return false;
      var lo = P.storeys[0].y - 0.5, hi = P.storeys[P.storeys.length - 1].y + P.storeys[P.storeys.length - 1].h + 1;
      if (A[2] >= lo && A[2] <= hi && P.floors.some(function (f) { return A[0] >= f.x0 && A[0] <= f.x1 && A[1] >= f.z0 && A[1] <= f.z1 && Math.abs(A[2] - f.y) < 3; })) { inside = cn; return true; }
      return false;
    });
    if (inside !== VC.INTD.walkIn) {
      if (VC.INTD.walkIn && VC.INTD.walkIn !== VC.INTD.cut.canton) VC.showInterior(VC.INTD.walkIn, false);
      VC.INTD.walkIn = inside; if (inside) VC.showInterior(inside, true, null);
    }
    /* the walker's storey furnished, and the ones above and below it after (VC.intWant) */
    if (inside) VC.intWant(inside, VC.intStoreyAt(VC.INT.cantons[inside], A[2]), false);
  });
};
