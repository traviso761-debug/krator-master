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
  return IX;
};

/* ---------------------------------------------------------------- residents and jobs, as the census counts them (36) */
VC.ixResidents = function (L) {
  var K = TUNE.census;
  if (L.cls === 'clan') return K.live.clan;
  if (L.cls === 'farm') return L.w * L.d > 6000 ? K.live.bigFarm : K.live.farm;
  if (L.role === 'garrison') return K.live.garrison;
  if (L.role === 'muster' || L.power) return 0;
  if (L.cls === 'civic') return /barracks/.test(L.key) ? K.live.barracks : 0;
  return K.live[L.cls] || 0;
};
/* [kind of work, workplaces] of a lot (the census's labels), or null */
VC.ixJob = function (L) {
  var K = TUNE.census;
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
  var B = VC.IX.boxes[k]; if (!B) return null;
  return VC.ixShellFrom(B.boxes, B.dims);
};

/* ---------------------------------------------------------------- a type: planned and furnished once, in the model's frame */
VC.ixType = function (L) {
  var pg = VC.ixProgram(L); if (!pg) return null;
  var k = VC.ixKey(L), tk = k + '|' + pg.id;
  if (VC.IX.types[tk]) return VC.IX.types[tk];
  var T = TUNE.ix, IX = VC.ixPrograms(), sh = VC.ixShell(k);
  var ty = VC.IX.types[tk] = { id: tk, key: L.key, v: L.v | 0, slot: L.slot | 0, prog: pg.id, cls: VC.ixClass(L), shell: sh, units: 0, dwelling: false };
  if (!sh || !IX || typeof furnishRoom === 'undefined') { ty.fail = sh ? 'no interiors kit' : 'no shell'; return ty; }
  var n = Math.max(1, Math.min(T.maxStoreys, Math.floor((sh.h + 0.2) / T.storeyH))), lh = sh.h / n - T.slab;
  var xs = sh.poly.map(function (p) { return p[0]; }), zs = sh.poly.map(function (p) { return p[1]; });
  var front = Math.max.apply(null, zs), mid = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
  var wealth = T.wealth[ty.cls] == null ? 0.5 : T.wealth[ty.cls];
  var shell = { id: 'ix.' + tk, poly: sh.poly, y: sh.y, levels: [], doors: [{ at: [mid, front], w: 1.2 }], culture: 'voth', wealth: wealth,
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
  ty.B = B; ty.storeys = n; ty.dropped = dropped;
  var home = T.home, kinds = B.rooms.map(function (R) { return R.kind; });
  ty.dwelling = VC.ixResidents(L) > 0 && kinds.some(function (q) { return home.indexOf(q) >= 0; });
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
    if (T.work.indexOf(p.kind) >= 0 && p.anchor !== 'surface' && (T.posts.indexOf(p.type) >= 0 || ((p.kind === 'store' || p.kind === 'warehouse') && T.postsStore.indexOf(p.type) >= 0))) {
      o.work[p.type] = (o.work[p.type] || 0) + 1; o.posts++;
    }
  });
  o.dining = Object.keys(dine).length;
  o.score = Math.min(o.beds, 1) + Math.min(o.items, 1) + Math.min(o.food, 1) + o.beds * 0.01;
  return o;
};

/* ---------------------------------------------------------------- the units: every standing lot with a programme */
VC.ixPlanAll = function () {
  var t0 = Date.now(), T = TUNE.ix;
  VC.IX.units = []; VC.IX.types = {};
  PLAN.lots.forEach(function (L) {
    if (L.died != null) return;
    var ty = VC.ixType(L); if (!ty) return;
    ty.units++;
    var res = VC.ixResidents(L), need = Math.ceil(res / T.per), C = ty.count || { beds: 0, items: 0, food: 0, dining: 0, posts: 0 }, job = VC.ixJob(L);
    var u = { i: VC.IX.units.length, lot: L.id, type: ty.id, cls: ty.cls, key: L.key, x: L.x, y: L.y, z: L.z, ry: L.ry, district: VC.ixDistrict(L),
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
    L.ix = u.i;
    VC.IX.units.push(u);
  });
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
    byClass: {}, byDistrict: {}, shells: {}, jobs: {}, failed: [], dropped: 0 };
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
    if (u.fail && R.failed.indexOf(u.type + ': ' + u.fail) < 0) R.failed.push(u.type + ': ' + u.fail);
    /* the job table: a row per kind of work, a column per furniture kind (its count and where) */
    if (u.job) {
      var J = R.jobs[u.job] || (R.jobs[u.job] = { jobs: 0, units: 0, posts: 0, kinds: {}, where: {} });
      J.jobs += u.jobs; J.units++; J.posts += u.posts; J.where[u.district] = (J.where[u.district] || 0) + 1;
      var w = (ty.count && ty.count.work) || {};
      Object.keys(w).forEach(function (f) { var c = J.kinds[f] || (J.kinds[f] = { n: 0, rooms: {} }); c.n += w[f]; });
      (ty.pieces || []).forEach(function (p) { var c = J.kinds[p.type]; if (c && TUNE.ix.work.indexOf(p.kind) >= 0) c.rooms[p.kind] = 1; });
    }
  });
  Object.keys(VC.IX.types).forEach(function (k) {
    var ty = VC.IX.types[k], s = ty.shell ? ty.shell.src : 'none';
    R.shells[s] = (R.shells[s] || 0) + 1; R.dropped += ty.dropped || 0;
  });
  Object.keys(R.jobs).forEach(function (k) { var J = R.jobs[k]; J.jobs = Math.round(J.jobs); J.target = Math.ceil(J.jobs * 0.9); J.gap = J.posts - J.target; });
  /* the shell list: what each type was read as, so the owner can name the overrides (TUNE.ix.shells) */
  R.typeList = Object.keys(VC.IX.types).sort().map(function (k) {
    var ty = VC.IX.types[k], sh = ty.shell || {};
    return { type: k, units: ty.units, shell: sh.src || 'none', storeys: ty.storeys || 0, rooms: (ty.rooms || []).join(' '), beds: ty.count ? ty.count.beds : 0,
             items: ty.count ? ty.count.items : 0, food: ty.count ? ty.count.food : 0, posts: ty.count ? ty.count.posts : 0, dropped: ty.dropped || 0, fail: ty.fail || null };
  });
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
