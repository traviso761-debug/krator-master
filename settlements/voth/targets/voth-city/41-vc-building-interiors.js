/* ============================== 5i. EVERY BUILDING'S INTERIOR (VC.IX) ============================== */
/* [G data] Phase A of the citizen simulation (SIM-ROADMAP.md 2.2; the owner's brief of 2026-10-12, 1.1): every lot
   building gets an interior, each holds pieces for its purpose, and a home holds, per TUNE.ix.per (2) residents, a bed,
   an item store and a food store, with a dining or entertaining room where the plan allows. A home too small for its
   residents is REPORTED, never forced (the owner's Q3: the census stands; the shortfall is shown first).

   THE TYPES. A lot draws a Voth kit model (key, variant, slot: 52-city-host-buildings.js builds each once), so every lot
   with the same model and the same programme has the same building: it is planned and furnished ONCE, in the model's own
   frame (origin at the footprint's middle on the ground, +z the front: the catalog's frame), and placed on each lot by
   the lot's pose. 8,000 lots are about 110 types; the whole city's interiors are computed at load, no bake needed.

   THE SHELL of a type is read off its kit model (VC.ixShellFrom: the model's main block, the biggest volume that spans
   head height, stands on the ground and is not a thin wall; a round one as the square inside it), from the boxes the host hands
   in (56b-vc-building-interiors-host.js VC.ixProbe builds the model once and lists its meshes' boxes). The storeys are its
   height cut at TUNE.ix.storeyH; the street door is the middle of its front face. A model with no such block takes
   TUNE.ix.fallback of its footprint, and TUNE.ix.shells overrides any key|v|slot. Godot reads the same records: the
   host's box lists are the only browser step, and VC.IX.export() writes the shells out with everything else.

   THE PLAN AND THE PIECES: kits/interiors (API.md 7) planBuilding cuts the shell into the programme's rooms
   (TUNE.ix.programmes by lot class, TUNE.ix.byKey by kit key; a storey that cannot hold its rooms loses its last one,
   a second try), furnishRoom furnishes each room from the catalog (Voth, then Iziz and generic). A home that fails the
   residence rule is furnished again with another seed (three tries), as Mav's Refuge does.

   THE UNITS: each standing lot with a programme, its type, its pose, its residents (TUNE.census.live by class, as the
   census counts them: VC.ixResidents), what it needs and what it holds, and its shortfall. VC.ixReport() sums them by
   class and by district, and the job table of the brief's 1.2: a row per kind of work, a column per furniture kind.
   Nothing here draws from Math.random: the planner and the placer are seeded. */
VC.IX = { units: [], types: {}, boxes: {}, report: null, ms: 0, done: false };

VC.ixKey = function (L) { return L.key + '|' + (L.v | 0) + '|' + (L.slot | 0); };
/* the lot's class as the programmes name it, and its programme (null: no interior) */
VC.ixClass = function (L) { return L.role === 'garrison' ? 'landmark' : L.role === 'muster' ? null : L.cls; };
VC.ixProgram = function (L) {
  var T = TUNE.ix, c = VC.ixClass(L); if (!c) return null;
  if (Object.prototype.hasOwnProperty.call(T.byKey, L.key)) return T.byKey[L.key] ? { id: L.key, p: T.byKey[L.key], one: T.single[L.key] || T.single[c] || null } : null;
  return T.programmes[c] ? { id: c, p: T.programmes[c], one: T.single[c] || null } : null;
};
/* the room kinds the lot buildings add to kits/interiors (beside the cantons', 56-vc-interiors-host.js VC.intPrograms):
   a `chamber`, a home's bedroom that takes as many beds and stores as it holds (TUNE.ix.chamber), from the pieces that
   furnish a bedroom or a dormitory */
VC.ixPrograms = function () {
  var IX = (VC.intPrograms && VC.intPrograms()) || (typeof KratorInteriors !== "undefined" ? KratorInteriors : null);
  if (!IX || IX.PROGRAMS.chamber) return IX;
  var C = TUNE.ix.chamber;
  IX.PROGRAMS.chamber = { require: [{ need: 'bed', types: ['bed'], n: 1 }, { need: 'chest', types: ['storage'], roles: IX.ITEM_ROLES, n: 1 }],
    optional: [{ types: ['bed'], max: C.beds - 1 }, { types: ['storage'], roles: IX.ITEM_ROLES, max: C.stores }, { types: ['storage', 'vessel', 'stack'], roles: IX.FOOD_ROLES, max: C.stores },
               { types: ['lamp'], max: 1 }, { types: ['chair', 'stool'], max: 1 }], extra: 3 };
  IX.KIND_ALIAS.chamber = ['bedroom', 'dormitory'];
  IX.KIND_WEIGHT.chamber = 1.3;
  /* the trades the production chains need (the new kit models' work rooms), each requiring its trade's pieces by their
     catalog role: the brewer's still, barrels and vat; the weaver's looms and dye vat; the tanner's vats; the butcher's
     block and meat */
  var P = IX.PROGRAMS, A = IX.KIND_ALIAS, LAMP = { types: ['lamp'], max: 1 };
  P.brewhouse = { require: [{ need: 'still', types: ['workstation'], roles: ['still'], n: 1 }, { need: 'barrels', types: ['storage'], roles: ['barrel'], n: 2 }, { need: 'vat', types: ['storage'], roles: ['vat'], n: 1 }],
    optional: [{ types: ['storage'], roles: ['barrel'], max: 4 }, { types: ['storage'], roles: ['vat'], max: 2 }, { types: ['table', 'workstation'], max: 1 }, LAMP], extra: 4 };
  P.weaving = { require: [{ need: 'looms', types: ['loom'], n: 2 }, { need: 'dye vat', types: ['storage'], roles: ['vat'], n: 1 }],
    optional: [{ types: ['loom'], max: 2 }, { types: ['storage', 'shelf'], max: 2 }, { types: ['chair', 'stool'], max: 2 }, LAMP], extra: 4 };
  P.tanyard = { require: [{ need: 'vats', types: ['storage'], roles: ['vat'], n: 2 }, { need: 'bench', types: ['table'], n: 1 }],
    optional: [{ types: ['storage'], roles: ['vat'], max: 4 }, { types: ['rack'], max: 2 }, { types: ['storage', 'stack'], max: 2 }, LAMP], extra: 4 };
  P.butchery = { require: [{ need: 'block', types: ['table', 'counter'], n: 1 }, { need: 'meat', types: ['food'], n: 2 }],
    optional: [{ types: ['storage', 'vessel'], roles: IX.FOOD_ROLES, max: 3 }, { types: ['rack'], max: 1 }, { types: ['food'], max: 4 }, LAMP], extra: 4 };
  A.brewhouse = ['workshop', 'store', 'tavern', 'kitchen']; A.weaving = ['workshop', 'hall']; A.tanyard = ['workshop', 'store']; A.butchery = ['kitchen', 'store', 'shop'];
  /* the work rooms of the kinds of work the 90% rule found short (owner, 2026-10-12: "add more work furniture"): dense
     floors of their work pieces, a piece every `extra` m2 (the kit's budget), used only by those buildings' programmes
     (TUNE.ix.programmes, byKey), so the homes, the shops and the cantons' rooms keep theirs */
  var SEATS = IX.SEAT_TYPES || ['chair', 'stool', 'bench', 'seating'];
  P.factory = { require: [{ need: 'benches', types: ['workstation', 'loom'], n: 4 }], optional: [{ types: ['workstation'], max: 10 }, { types: ['loom'], max: 3 }, { types: ['rack', 'storage', 'stack'], max: 4 }, { types: ['bench', 'stool'], max: 2 }, LAMP], extra: 3 };
  P.enginehall = { require: [{ need: 'works', types: ['workstation', 'stove'], n: 4 }], optional: [{ types: ['workstation'], max: 20 }, { types: ['stove'], max: 3 }, { types: ['rack', 'storage', 'stack'], max: 4 }, LAMP], extra: 3 };
  P.drillhall = { require: [{ need: 'dummies', types: ['tool'], n: 3 }, { need: 'racks', types: ['rack', 'weapon'], n: 2 }], optional: [{ types: ['tool'], max: 10 }, { types: ['rack', 'weapon'], max: 6 }, { types: ['bench'], max: 2 }], extra: 4 };
  P.guardroom = { require: [{ need: 'desk', types: ['desk'], n: 1 }, { need: 'racks', types: ['rack', 'weapon'], n: 2 }, { need: 'table', types: ['table'], n: 1 }],
    optional: [{ types: ['rack', 'weapon'], max: 6 }, { types: ['desk'], max: 2 }, { types: ['table'], max: 1 }, { types: SEATS, max: 6 }, LAMP], extra: 4 };
  P.alehouse = { require: [{ need: 'bar', types: ['counter'], n: 1 }, { need: 'tables', types: ['table'], n: 2 }, { need: 'seats', types: SEATS, n: 4 }],
    optional: [{ types: ['counter'], max: 2 }, { types: ['table'], max: 8 }, { types: SEATS, max: 16 }, { types: ['stove'], max: 1 }, { types: ['storage'], roles: ['barrel'], max: 3 }, { types: ['lamp', 'brazier'], max: 2 }], extra: 4 };
  P.counting = { require: [{ need: 'desks', types: ['desk'], n: 3 }], optional: [{ types: ['desk'], max: 8 }, { types: ['shelf', 'storage'], max: 3 }, { types: ['chair', 'stool'], max: 8 }, LAMP], extra: 3 };
  A.factory = ['workshop', 'smithy']; A.enginehall = ['workshop', 'smithy']; A.drillhall = ['training', 'barracks', 'yard', 'court']; A.guardroom = ['barracks', 'office', 'study'];
  A.alehouse = ['tavern', 'hall']; A.counting = ['office', 'study', 'library'];
  /* a temple's or a chapel's nave (owner, 2026-10-12): the altar at its head, shrines along it, a few benches; the floor
     is the congregation's, standing (its room is counted by area: TUNE.sim.worship) */
  P.nave = { require: [{ need: 'altar', types: ['altar', 'shrine'], n: 1 }], optional: [{ types: ['altar', 'shrine'], max: 6 }, { types: ['bench', 'seating'], max: 12 }, { types: ['lamp', 'brazier'], max: 4 }, LAMP], extra: 30 };
  A.nave = ['shrine', 'hall', 'temple'];
  /* a clan compound's own shrine (owner, 2026-10-12: "Clan compounds can also take this furniture shrine"): one of the
     small yard shrines (kits/catalog voth_shrine_*, role 'yard shrine') and a bench */
  P.clanshrine = { require: [{ need: 'shrine', types: ['shrine'], roles: ['yard shrine'], n: 1 }], optional: [{ types: ['shrine'], roles: ['yard shrine'], max: 1 }, { types: ['table'], max: 1 }, { types: SEATS, max: 6 }, { types: ['bench'], max: 1 }, LAMP], extra: 6 };
  A.clanshrine = ['shrine', 'yard', 'court', 'hall'];   /* in a small compound it is the hall too: a table and seats */
  ['brewhouse', 'weaving', 'tanyard', 'butchery', 'factory', 'enginehall', 'drillhall', 'guardroom', 'alehouse', 'counting', 'nave', 'clanshrine'].forEach(function (k) { if (IX.KIND_WEIGHT[k] == null) IX.KIND_WEIGHT[k] = 1.5; });
  return IX;
};

/* ---------------------------------------------------------------- residents and jobs, as the census counts them (36) */
VC.ixResidents = function (L) {
  var K = TUNE.census, BK = K.byKey && K.byKey[L.key];
  if (BK) return BK.live || 0;
  if (L.cls === 'clan') return K.live.clan;
  if (L.cls === 'farm') return L.w * L.d > 6000 ? K.live.bigFarm : K.live.farm;
  if (L.role === 'garrison') return K.live.garrison;
  if (L.role === 'muster' || L.power) return 0;
  if (L.cls === 'civic') return /barracks/.test(L.key) ? K.live.barracks : 0;
  return K.live[L.cls] || 0;
};
/* [kind of work, workplaces] of a lot (the census's labels), or null */
VC.ixJob = function (L) {
  var K = TUNE.census, BK = K.byKey && K.byKey[L.key];
  if (BK) return BK.jobs ? [BK.job, BK.jobs] : null;
  if (L.cls === 'clan') return ['household service', K.jobs.clanService];
  if (L.cls === 'farm') return null;
  if (L.role === 'garrison') return ['soldiers', K.jobs.garrison];
  if (L.role === 'muster') return null;
  if (L.power) return ['power-house stokers and engineers', K.jobs.power];
  if (L.cls === 'civic') {
    if (/barracks/.test(L.key)) return ['soldiers', K.jobs.barracks];
    if (/school/.test(L.key)) return ['teachers and scholars', K.jobs.school];
    if (/guild/.test(L.key)) return ['guild officers and clerks', K.jobs.guild];
    if (/customs/.test(L.key)) return ['customs officers and clerks', K.jobs.customs];
    if (/tavern/.test(L.key)) return ['innkeepers and servers', K.jobs.tavern];
    return null;
  }
  var j = K.jobs[L.cls]; if (!j) return null;
  return [{ shop: 'shopkeepers and assistants', craft: 'smiths and craftsmen', tavern: 'innkeepers and servers', warehouse: L.role === 'armoury' ? 'armourers and quartermasters' : 'porters and warehousemen',
            industrial: 'industrial workers', rich: 'household service', manor: 'household service' }[L.cls] || L.cls, j];
};
/* where a lot stands, for the report: its country place, its canton deck, the named site district round it, or the
   city's sector from the Palace (N, NE, ...) */
VC.ixDistrict = function (L) {
  if (L.country) return L.country;
  if (L.deck) return L.deck + ' deck';
  var p = [L.x, L.z], best = null, ba = Infinity;
  PLAN.site.forEach(function (d) {
    if (!d.name || d.role === 'zone' || d.role === 'wall' || d.role === 'misc' || d.role === 'nochin') return;
    if (inPoly(p, d.poly)) { var a = Math.abs(polyArea(d.poly)); if (a < ba) { ba = a; best = d.name; } }
  });
  if (best) return best;
  var c = VOTH.CIDX.Palace || { x: 0, z: 0 }, a8 = Math.round((Math.atan2(L.x - c.x, -(L.z - c.z)) / (Math.PI / 4) + 8)) % 8;
  return 'city ' + ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][a8];
};

/* ---------------------------------------------------------------- the shell, from a model's boxes */
/* boxes: [{ x, z, w, d, y0, h, round }] in the model's frame (ry 0); dims: the catalog's { w, d, h }. Returns
   { poly, y, h, src: 'block' | 'round' | 'fallback' } with poly in the model's frame */
VC.ixShellFrom = function (boxes, dims) {
  var T = TUNE.ix, R3 = function (v) { return Math.round(v * 1000) / 1000; };
  var cand = (boxes || []).filter(function (b) {
    return b.y0 < T.base && b.y0 + b.h >= T.head && b.w * b.d >= T.minArea && Math.min(b.w, b.d) >= T.minSide &&
      b.w <= dims.w + 0.5 && b.d <= dims.d + 0.5;
  }).sort(function (a, b) { return b.w * b.d * b.h - a.w * a.d * a.h || a.x - b.x || a.z - b.z; });
  var M = cand[0];
  if (!M) {
    var fw = dims.w * T.fallback, fd = dims.d * T.fallback;
    return { poly: [[-fw / 2, -fd / 2], [fw / 2, -fd / 2], [fw / 2, fd / 2], [-fw / 2, fd / 2]].map(function (p) { return [R3(p[0]), R3(p[1])]; }),
             y: 0, h: Math.max(T.storeyH, dims.h * 0.5), src: 'fallback' };
  }
  /* the floor: the top of a plinth under the block (a low box at least the block's footprint), else the block's foot */
  var y = M.y0;
  (boxes || []).forEach(function (b) {
    if (b.y0 < 0.3 && b.h < 1.4 && b.y0 + b.h > y && b.w >= M.w - 0.2 && b.d >= M.d - 0.2 && Math.abs(b.x - M.x) < 0.6 && Math.abs(b.z - M.z) < 0.6) y = b.y0 + b.h;
  });
  /* a round block (a drum, a tower) is shelled as the square inside it: the planner cuts a circle into slivers the
     placer cannot furnish (a 270 m2 drum came out as 30 m2 of rooms); the square keeps 64% of the floor */
  var hw = M.w / 2, hd = M.d / 2;
  if (M.round) hw = hd = Math.min(M.w, M.d) / 2 * Math.SQRT1_2;
  var poly = [[M.x - hw, M.z - hd], [M.x + hw, M.z - hd], [M.x + hw, M.z + hd], [M.x - hw, M.z + hd]].map(function (p) { return [R3(p[0]), R3(p[1])]; });
  return { poly: poly, y: R3(y), h: R3(M.y0 + M.h - y), src: M.round ? 'round' : 'block' };
};
VC.ixShell = function (k) {
  var o = TUNE.ix.shells[k]; if (o) return o.skip ? null : Object.assign({ src: 'override' }, o);
  /* a kit model that carries its own shell (`ix: { block: [x, z, w, d], y, h, storeys }`, the citizen simulation's buildings) */
  var A = typeof ASSET_BY_KEY !== 'undefined' && ASSET_BY_KEY[k.split('|')[0]];
  if (A && A.ix && A.ix.block) {
    var b = A.ix.block, hw = b[2] / 2, hd = b[3] / 2;
    return { poly: [[b[0] - hw, b[1] - hd], [b[0] + hw, b[1] - hd], [b[0] + hw, b[1] + hd], [b[0] - hw, b[1] + hd]], y: A.ix.y || 0, h: A.ix.h, storeys: A.ix.storeys || null, src: 'kit' };
  }
  var B = VC.IX.boxes[k]; if (!B) return null;
  return VC.ixShellFrom(B.boxes, B.dims);
};

/* ---------------------------------------------------------------- a type: planned and furnished once, in its own frame */
/* spec: { tk, key, v, slot, prog: { id, p, one }, cls, shell: { poly, y, h, src }, storeys?, door?: [x, z], live } (the
   frame's origin is the building's foot; a lot's door is mid-front, +z; a Voth builder's is mid +x) */
VC.ixTypeBuild = function (spec) {
  var tk = spec.tk; if (VC.IX.types[tk]) return VC.IX.types[tk];
  var T = TUNE.ix, IX = VC.ixPrograms(), sh = spec.shell, pg = spec.prog;
  var ty = VC.IX.types[tk] = { id: tk, key: spec.key, v: spec.v | 0, slot: spec.slot | 0, prog: pg.id, cls: spec.cls, shell: sh, units: 0, dwelling: false, site: !!spec.site };
  if (!sh || !IX || typeof furnishRoom === 'undefined') { ty.fail = sh ? 'no interiors kit' : 'no shell'; return ty; }
  var n = spec.storeys || Math.max(1, Math.min(T.maxStoreys, Math.floor((sh.h + 0.2) / T.storeyH))), lh = sh.h / n - T.slab;
  var xs = sh.poly.map(function (p) { return p[0]; }), zs = sh.poly.map(function (p) { return p[1]; });
  var door = spec.door || [(Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, Math.max.apply(null, zs)];
  var wealth = T.wealth[ty.cls] == null ? 0.5 : T.wealth[ty.cls];
  var shell = { id: 'ix.' + tk, poly: sh.poly, y: sh.y, levels: [], doors: [{ at: door, w: 1.2 }], culture: 'voth', wealth: wealth,
                wall: T.wall, partition: 0.12, slab: T.slab, roof: 'flat' };
  for (var l = 0; l < n; l++) shell.levels.push({ h: Math.max(2.4, lh) });
  var per = function (prog, trim) { return function (lv) { var e = prog[Math.min(lv, prog.length - 1)].slice(); return e.slice(0, Math.max(1, e.length - (trim || 0))); }; };
  var opts = { seed: 0, register: false, door: 0.9, minWidth: 2.0 }, B = null, dropped = null;
  for (var t = 0; t < 3; t++) {
    var Bt; try { Bt = IX.planBuilding(shell, n === 1 && pg.one ? per([pg.one], t) : per(pg.p, t), opts); } catch (e) { ty.fail = 'plan: ' + e.message; break; }
    var dr = (Bt.report.dropped || []).length;
    if (!B || dr < dropped) { B = Bt; dropped = dr; ty.trim = t; }
    if (!dr) break;
  }
  if (!B) return ty;
  VC.ixAtrium(B, spec.cls, n);
  ty.B = B; ty.storeys = n; ty.dropped = dropped;
  var home = T.home, kinds = B.rooms.map(function (R) { return R.kind; });
  ty.dwelling = !!spec.live && kinds.some(function (q) { return home.indexOf(q) >= 0; });
  var cat = VC.IX.cat || (VC.IX.cat = (VC.INTD && VC.INTD.catalog) || IX.catalogAdapter()), best = null;   /* the cantons' adapter when it is made (its cache) */
  for (var att = 0; att < 3; att++) {
    var pieces = [], missing = [];
    B.rooms.forEach(function (R, ri) {
      var plan; try { plan = furnishRoom(R, cat, { seed: att * 101, cell: T.cell, backtrack: 6, passes: 2 }); } catch (e) { missing.push(R.kind + ': ' + e.message); return; }
      (plan.report && plan.report.missing || []).forEach(function (m) { missing.push(R.kind + ':' + m.need); });
      plan.placements.forEach(function (p) {
        pieces.push({ key: p.key, v: p.variant | 0, seed: p.seed, x: p.x, y: p.y, z: p.z, ry: p.ry || 0, type: p.type, catRole: p.catRole || null, anchor: p.anchor, room: ri, level: R.level | 0, kind: R.kind });
      });
    });
    var c = VC.ixCount(pieces);
    if (!best || c.score > best.c.score) best = { pieces: pieces, missing: missing, c: c, seed: att * 101 };
    if (!ty.dwelling || (c.beds && c.items && c.food)) break;
  }
  ty.pieces = best.pieces; ty.missing = best.missing; ty.count = best.c; ty.seed = best.seed;
  ty.rooms = kinds; ty.floorArea = B.levels.reduce(function (s, Lv) { return s + Math.abs(polyArea(Lv.inner || Lv.outer || sh.poly)); }, 0);
  return ty;
};
/* the clan compounds' banquet hall (owner, 2026-10-15: "atria again are seen but only in the clan banquet room"): the
   hall on the ground floor of a clan compound (its `hall`, else its `clanshrine`) is open to the floor above, which keeps
   a railed gallery TUNE.ix.atrium.gallery m wide round the void; the rooms that stood over it go (their furniture with
   them: a compound loses a few beds for its atrium, as the report says). B.rails holds the railing for the host. */
VC.ixAtrium = function (B, cls, n) {
  var A = TUNE.ix.atrium; if (!A || !A.classes || A.classes.indexOf(cls) < 0 || n < 2) return;
  var hall = B.rooms.filter(function (R) { return (R.level | 0) === 0 && R.kind === 'hall'; })[0] || B.rooms.filter(function (R) { return (R.level | 0) === 0 && R.kind === 'clanshrine'; })[0];
  if (!hall || hall.area < A.minArea) return;
  var bb = hall.bbox, g = A.gallery, x0 = Math.min(bb[0][0], bb[1][0]) + g, x1 = Math.max(bb[0][0], bb[1][0]) - g, z0 = Math.min(bb[0][1], bb[1][1]) + g, z1 = Math.max(bb[0][1], bb[1][1]) - g;
  if (x1 - x0 < 3 || z1 - z0 < 3) return;
  var hole = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  var F1 = (B.floors || []).filter(function (F) { return F.level === 1; })[0]; if (!F1) return;
  F1.holes = (F1.holes || []).concat([hole]);
  var inside = function (p) { return p[0] > x0 && p[0] < x1 && p[1] > z0 && p[1] < z1; };
  B.rooms = B.rooms.filter(function (R) { return (R.level | 0) !== 1 || !inside(R.centroid); });
  B.rails = (B.rails || []).concat([{ level: 1, y: F1.y, poly: hole }]);
  B.atrium = { hall: hall.id, hole: hole };
};
/* a lot's type: its kit model's shell, its class's (or its key's) programme */
VC.ixType = function (L) {
  var pg = VC.ixProgram(L); if (!pg) return null;
  var k = VC.ixKey(L);
  var sh = VC.ixShell(k);
  return VC.ixTypeBuild({ tk: k + '|' + pg.id, key: L.key, v: L.v, slot: L.slot, prog: pg, cls: VC.ixClass(L), shell: sh, storeys: sh && sh.storeys, live: VC.ixResidents(L) > 0 });
};
/* the kit models no lot draws yet (TUNE.ix.kitCheck: the citizen simulation's new buildings, placed in phase B), planned and
   furnished as a lot of their class would be, so the report shows what each holds before it stands anywhere */
VC.ixKitCheck = function () {
  return (TUNE.ix.kitCheck || []).map(function (e) {
    var key = e[0], cls = e[1], A = typeof ASSET_BY_KEY !== 'undefined' && ASSET_BY_KEY[key];
    if (!A) return { key: key, fail: 'no kit model' };
    var ty = VC.ixType({ key: key, v: 0, slot: 0, cls: cls, role: null, w: A.w, d: A.d });
    if (!ty) return { key: key, fail: 'no programme' };
    var C = ty.count || {};
    return { key: key, name: A.name, cls: cls, type: ty.id, shell: ty.shell ? ty.shell.src : 'none', storeys: ty.storeys || 0, rooms: (ty.rooms || []).join(' '), pieces: (ty.pieces || []).length,
             beds: C.beds || 0, items: C.items || 0, food: C.food || 0, posts: C.posts || 0, work: C.work || {}, fail: ty.fail || null };
  });
};

/* ---------------------------------------------------------------- the buildings off the lots
   Voth's own builders the city calls (logged by build.py into VOTH.BUILT with their arguments: the monastery's dormitories,
   chapel and assembly hall, the funerary temple, the House of Healing), the city's own shrine and lighthouse models
   (VC.ixSite, 31-vc-voth.js) and the chinampas' stilt huts (VC.chin.hutList). Each is a rectangle w x d at its floor,
   its door mid +x (Voth's builders face +x), as TUNE.ix.sites says: programme, storeys, class, residents, kind of work.
   The House of Healing's wards are furnished by the city already (31-vc-voth.js VC.healingModel: cots, dispensaries):
   it is counted from those pieces, not planned again. */
VC.ixSite = function (rec) { (VC.IX_SITES = VC.IX_SITES || []).push(rec); };
VC.ixSites = function () {
  var out = [], K = TUNE.census;
  var add = function (kind, x, y, z, ry, w, d, h, o) { out.push(Object.assign({ kind: kind, x: x, y: y, z: z, ry: ry, w: w, d: d, h: h }, o || {})); };
  (VOTH.BUILT || []).forEach(function (b) {
    var a = b.a;
    if (b.fn === 'monasteryDorm') add('dorm', a[0], a[1], a[2], a[6], a[3], a[4], a[5] * 0.92);
    else if (b.fn === 'monasteryChapel') add('chapel', a[0], a[1], a[2], a[6], a[3], a[4], a[5]);
    else if (b.fn === 'monasteryAssemblyHall') add('hall', a[0], a[2], a[1], a[6], a[3], a[4], a[5] * 0.92);
    else if (b.fn === 'funeraryTemple') { var o = a[5] || {}, fw = o.w || 46, fd = o.d || 64, fh = o.h || 34; add('funerary', a[0], a[1] + fh * 0.185, a[2], a[3], fw * 0.62, fd * 0.72, fh * 0.5); }
  });
  (VC.IX_SITES || []).forEach(function (r) { add(r.kind, r.x, r.y, r.z, r.ry, r.w, r.d, r.h, r.storeys ? { storeys: r.storeys } : null); });
  ((VC.chin && VC.chin.hutList) || []).forEach(function (q) { if (q[3]) add('hut', q[0], 4.7, q[1], q[2], q[3] * 0.68, q[4] * 0.62, 4.5); });
  return out;
};
VC.ixSiteUnits = function () {
  var T = TUNE.ix, K = TUNE.census, R3 = function (v) { return Math.round(v * 1000) / 1000; }, n = 0;
  VC.ixSites().forEach(function (st, i) {
    var S = T.sites[st.kind]; if (!S) return;
    var hw = st.w / 2, hd = st.d / 2, dims = [st.w, st.d, st.h].map(function (v) { return Math.round(v * 2) / 2; }).join('x');
    var spec = { tk: 'site:' + st.kind + '|' + dims, key: st.kind, prog: { id: st.kind, p: S.prog, one: S.prog[0] }, cls: S.cls, site: true, storeys: st.storeys || S.storeys || null,
                 shell: { poly: [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(function (p) { return [R3(p[0]), R3(p[1])]; }), y: 0, h: st.h, src: 'site' }, door: [R3(hw), 0], live: !!S.live };
    var ty = VC.ixTypeBuild(spec);
    var res = S.live ? (K.live[S.live] || 0) : 0, job = S.job ? [S.job[0], K.jobs[S.job[1]] != null ? K.jobs[S.job[1]] : K.live[S.job[1]] || 0] : null;
    VC.ixAddUnit(ty, { x: st.x, y: st.y, z: st.z, ry: st.ry, key: st.kind, lot: -1, site: st.kind, district: VC.ixDistrict({ x: st.x, z: st.z }) }, res, job);
    n++;
  });
  /* the House of Healing: its wards as the city furnished them */
  var hq = (PLAN.voth || []).filter(function (q) { return q.role === 'healing'; })[0], D = (PLAN.districts || []).filter(function (d) { return d.name === 'House of Healing furnishings'; })[0];
  if (hq && D) {
    var c = Math.cos(hq.ry), s = Math.sin(hq.ry), y0 = Math.min.apply(null, D.art.map(function (a) { return a.y; }));
    var pieces = D.art.map(function (a, k) {
      var dx = a.x - hq.x, dz = a.z - hq.z, A = (typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[a.key]) || {};
      return { key: a.key, v: a.v | 0, x: dx * c - dz * s, y: a.y - y0, z: dx * s + dz * c, ry: (a.ry || 0) - hq.ry, type: A.type, catRole: A.role || null, anchor: A.anchor || 'floor', room: 0, level: 0, kind: 'ward' };
    });
    var ty = VC.IX.types['site:healing'] = { id: 'site:healing', key: 'healing', prog: 'healing', cls: 'healing', shell: { src: 'builder' }, units: 0, site: true, prebuilt: true,
      pieces: pieces, rooms: ['ward'], count: VC.ixCount(pieces), storeys: 1, dropped: 0 };
    VC.ixAddUnit(ty, { x: hq.x, y: y0, z: hq.z, ry: hq.ry, key: 'healing', lot: -1, site: 'healing', district: VC.ixDistrict({ x: hq.x, z: hq.z }) }, 0, ['healers and nurses', K.jobs.healing]);
    n++;
  }
  return n;
};

/* a type's beds (a bunk is two), item and food stores (kits/interiors' roles, as its residence rule counts them), dining
   rooms, and work pieces by furniture kind in its work rooms */
VC.ixCount = function (pieces) {
  var IX = (typeof KratorInteriors !== "undefined" ? KratorInteriors : null) || {}, FOOD = IX.FOOD_ROLES || [], ITEM = IX.ITEM_ROLES || [], T = TUNE.ix;
  var o = { beds: 0, items: 0, food: 0, dining: 0, work: {}, posts: 0 }, dine = {};
  pieces.forEach(function (p) {
    if (p.type === 'bed') o.beds += p.catRole === 'bunk' ? 2 : 1;
    if (p.catRole && FOOD.indexOf(p.catRole) >= 0 && (p.type === 'storage' || p.type === 'vessel' || p.type === 'stack') && p.anchor !== 'surface') o.food++;
    if (p.catRole && ITEM.indexOf(p.catRole) >= 0 && p.type === 'storage') o.items++;
    if (p.type === 'table' && T.dining.indexOf(p.kind) >= 0) dine[p.room] = 1;
    if (T.work.indexOf(p.kind) >= 0 && p.anchor !== 'surface' && (T.posts.indexOf(p.type) >= 0 || (T.postsIn[p.kind] || []).indexOf(p.type) >= 0)) {
      o.work[p.type] = (o.work[p.type] || 0) + 1; o.posts++;
    }
  });
  o.dining = Object.keys(dine).length;
  o.score = Math.min(o.beds, 1) + Math.min(o.items, 1) + Math.min(o.food, 1) + o.beds * 0.01;
  return o;
};

/* ---------------------------------------------------------------- the units: every standing lot with a programme, every site */
/* a unit: a type at a pose (p: { x, y, z, ry, key, lot, site?, district }), its residents and [kind of work, workplaces] */
VC.ixAddUnit = function (ty, p, res, job) {
  var T = TUNE.ix, need = Math.ceil(res / T.per), C = ty.count || { beds: 0, items: 0, food: 0, dining: 0, posts: 0 };
  ty.units++;
  var u = { i: VC.IX.units.length, lot: p.lot, site: p.site || null, type: ty.id, cls: ty.cls, key: p.key, x: p.x, y: p.y, z: p.z, ry: p.ry, district: p.district,
            residents: res, need: need, beds: C.beds, items: C.items, food: C.food, dining: C.dining, job: job ? job[0] : null, jobs: job ? job[1] : 0, posts: C.posts };
  if (res > 0) {
    var s = {};
    if (C.beds < need) s.beds = need - C.beds;
    if (C.items < need) s.items = need - C.items;
    if (C.food < need) s.food = need - C.food;
    if (!C.dining) s.dining = 1;
    if (Object.keys(s).length) u.short = s;
  }
  if (ty.fail) u.fail = ty.fail;
  VC.IX.units.push(u);
  return u;
};
VC.ixPlanAll = function () {
  var t0 = Date.now();
  VC.IX.units = []; VC.IX.types = {};
  PLAN.lots.forEach(function (L) {
    if (L.died != null) return;
    var ty = VC.ixType(L); if (!ty) return;
    var u = VC.ixAddUnit(ty, { x: L.x, y: L.y, z: L.z, ry: L.ry, key: L.key, lot: L.id, district: VC.ixDistrict(L) }, VC.ixResidents(L), VC.ixJob(L));
    L.ix = u.i;
  });
  VC.IX.lotUnits = VC.IX.units.length;
  VC.ixSiteUnits();
  VC.IX.ms = Math.round(Date.now() - t0);
  VC.IX.done = true;
  return VC.IX.units.length;
};
/* a unit's piece in world space: the type's local piece by the lot's pose (the catalog's frame: +z front, turned by ry) */
VC.ixWorld = function (u, p) {
  var c = Math.cos(u.ry), s = Math.sin(u.ry);
  return { x: u.x + p.x * c + p.z * s, y: u.y + p.y, z: u.z - p.x * s + p.z * c, ry: u.ry + (p.ry || 0) };
};
VC.ixWorldXZ = function (u, q) { var c = Math.cos(u.ry), s = Math.sin(u.ry); return [u.x + q[0] * c + q[1] * s, u.z - q[0] * s + q[1] * c]; };
/* what the simulation reads of a unit (phase B makes these SIM places): its rooms and pieces in world space, its activities */
VC.ixSlots = function (i) {
  var u = VC.IX.units[i], ty = u && VC.IX.types[u.type]; if (!ty || !ty.B) return null;
  var ps = ty.pieces.map(function (p, n) { var w = VC.ixWorld(u, p); return { id: 'ix.' + i + '/' + n, key: p.key, type: p.type, job: (typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[p.key] || {}).job || null, role: p.catRole, x: w.x, y: w.y, z: w.z, ry: w.ry, level: p.level, room: p.room, roomKind: p.kind }; });
  return { unit: u, door: VC.ixWorldXZ(u, ty.B.doors[0] ? ty.B.doors[0].at : [0, 0]), pieces: ps, acts: SIM.slotsFromFurniture ? SIM.slotsFromFurniture(ps) : {} };
};

/* ---------------------------------------------------------------- the report (SIM-ROADMAP 2.2 item 7) */
VC.ixReport = function () {
  var U = VC.IX.units, R = { units: U.length, types: Object.keys(VC.IX.types).length, rooms: 0, pieces: 0, residents: 0, homes: 0, ms: VC.IX.ms,
    need: { beds: 0, items: 0, food: 0 }, have: { beds: 0, items: 0, food: 0 }, short: { units: 0, bedUnits: 0, beds: 0, items: 0, food: 0, dining: 0, residents: 0 },
    byClass: {}, byDistrict: {}, shells: {}, jobs: {}, failed: [], dropped: 0, sites: {}, spare: {} };
  var add = function (o, k, u) {
    var e = o[k] || (o[k] = { units: 0, homes: 0, residents: 0, beds: 0, need: 0, short: 0, shortResidents: 0, missingBeds: 0 });
    e.units++; if (u.residents) { e.homes++; e.residents += u.residents; e.beds += Math.min(u.beds, u.need); e.need += u.need; }
    if (u.short) { e.short++; e.missingBeds += u.short.beds || 0; if (u.short.beds) e.shortResidents += Math.min(u.residents, (u.short.beds || 0) * TUNE.ix.per); }
  };
  U.forEach(function (u) {
    var ty = VC.IX.types[u.type];
    R.rooms += ty.rooms ? ty.rooms.length : 0; R.pieces += ty.pieces ? ty.pieces.length : 0;
    if (u.residents) {
      R.homes++; R.residents += u.residents;
      ['beds', 'items', 'food'].forEach(function (k) { R.need[k] += u.need; R.have[k] += Math.min(u[k], u.need); });
    }
    if (u.short) {
      R.short.units++; ['beds', 'items', 'food', 'dining'].forEach(function (k) { R.short[k] += u.short[k] || 0; });
      if (u.short.beds) { R.short.bedUnits++; R.short.residents += Math.min(u.residents, u.short.beds * TUNE.ix.per); }
    }
    add(R.byClass, u.cls, u); add(R.byDistrict, u.district, u);
    if (u.site) { var Sx = R.sites[u.site] || (R.sites[u.site] = { units: 0, rooms: 0, pieces: 0, beds: 0, residents: 0, jobs: 0, posts: 0 });
      Sx.units++; Sx.rooms += ty.rooms ? ty.rooms.length : 0; Sx.pieces += ty.pieces ? ty.pieces.length : 0; Sx.beds += u.beds; Sx.residents += u.residents; Sx.jobs += u.jobs; Sx.posts += u.posts; }
    if (!u.residents && u.beds && TUNE.ix.sites[u.site] && !TUNE.ix.sites[u.site].job) { var Sp = R.spare[u.cls] || (R.spare[u.cls] = { units: 0, beds: 0 }); Sp.units++; Sp.beds += u.beds; }
    if (u.fail && R.failed.indexOf(u.type + ': ' + u.fail) < 0) R.failed.push(u.type + ': ' + u.fail);
    /* the job table: a row per kind of work, a column per furniture kind (its count and where) */
    if (u.job) {
      var J = R.jobs[u.job] || (R.jobs[u.job] = { jobs: 0, units: 0, posts: 0, kinds: {}, where: {} });
      /* the posts as phase B counts them (42-vc-sim-places.js VC.simPosts: by piece kind and size), else one a piece */
      var SP = VC.simPosts && ty.pieces ? VC.simPosts(ty.pieces) : null;
      J.jobs += u.jobs; J.units++; J.posts += SP ? SP.n : u.posts; J.where[u.district] = (J.where[u.district] || 0) + 1;
      var w = SP ? SP.by : (ty.count && ty.count.work) || {};
      Object.keys(w).forEach(function (f) { var c = J.kinds[f] || (J.kinds[f] = { n: 0, rooms: {} }); c.n += w[f]; });
      (ty.pieces || []).forEach(function (p) { var c = J.kinds[p.type]; if (c && TUNE.ix.work.indexOf(p.kind) >= 0) c.rooms[p.kind] = 1; });
    }
  });
  Object.keys(VC.IX.types).forEach(function (k) {
    var ty = VC.IX.types[k], s = ty.shell ? ty.shell.src : 'none';
    R.shells[s] = (R.shells[s] || 0) + 1; R.dropped += ty.dropped || 0;
  });
  Object.keys(R.jobs).forEach(function (k) { var J = R.jobs[k]; J.jobs = Math.round(J.jobs); J.posts = Math.round(J.posts); Object.keys(J.kinds).forEach(function (f) { J.kinds[f].n = Math.round(J.kinds[f].n * 10) / 10; }); J.target = Math.ceil(J.jobs * 0.9); J.gap = J.posts - J.target; });
  /* the shell list: what each type was read as, so the owner can name the overrides (TUNE.ix.shells) */
  R.typeList = Object.keys(VC.IX.types).sort().map(function (k) {
    var ty = VC.IX.types[k], sh = ty.shell || {};
    return { type: k, units: ty.units, shell: sh.src || 'none', storeys: ty.storeys || 0, rooms: (ty.rooms || []).join(' '), beds: ty.count ? ty.count.beds : 0,
             items: ty.count ? ty.count.items : 0, food: ty.count ? ty.count.food : 0, posts: ty.count ? ty.count.posts : 0, dropped: ty.dropped || 0, fail: ty.fail || null };
  });
  R.kit = VC.ixKitCheck();
  VC.IX.report = R;
  return R;
};
/* everything as plain JSON (types in the model's frame, units with their poses): the export Godot reads */
VC.IX.export = function () {
  var types = {};
  Object.keys(VC.IX.types).forEach(function (k) {
    var ty = VC.IX.types[k];
    types[k] = { key: ty.key, v: ty.v, slot: ty.slot, prog: ty.prog, cls: ty.cls, shell: ty.shell, storeys: ty.storeys, rooms: ty.rooms, count: ty.count, fail: ty.fail || null,
                 plan: ty.B && (typeof KratorInteriors !== "undefined" ? KratorInteriors : null) && KratorInteriors.exportBuilding ? KratorInteriors.exportBuilding(ty.B) : null,
                 pieces: (ty.pieces || []).map(function (p) { return [p.key, p.v, p.seed, Math.round(p.x * 100) / 100, Math.round(p.y * 100) / 100, Math.round(p.z * 100) / 100, Math.round(p.ry * 1000) / 1000, p.room]; }) };
  });
  return { what: 'Voth city: every lot building\'s interior (41-vc-building-interiors.js)', types: types, units: VC.IX.units };
};
