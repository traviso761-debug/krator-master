// ================================================================= OPEN WORLD — the player's settlements (KOUTPOST)
// [G data] openworld/outposts/PLAN.md. "Outpost" is the owner's shorthand for ANY settlement the player founds, from a
// camp to a town (owner, 2026-11-09). NPC outposts and settlements are NOT here: they stay in the scale model's
// settlements, core/hamlet, core/camp, core/city and core/simulation. This registry never holds, seeds from or edits
// them; a player settlement points at them only through `refs` (read-only references across the boundary).
// Plain records keyed by stable ids ('ps-...'), edited only through an operation log by id (ADD, SET, MOVE, REMOVE),
// rules as plain functions. No three.js, no DOM, no simulation calls. Reads core/rand (KRAND), core/space (KSPACE).
//
//   KOUTPOST.KINDS, SIZES, STATES, LIVE, MOVES, REF_KINDS, RELS, MAPS, M_PER_PX   the vocabulary and the tables
//   KOUTPOST.at(px, py, ver) / place(px, py, ver, r) / toMap(place, ver)          map pixels and world metres
//   KOUTPOST.toRegion(place, frame) / fromRegion(x, z, frame, ver, r)             an open-world region's frame
//   KOUTPOST.check(rec)                   -> [errors] (empty: a valid record)
//   KOUTPOST.create(opt)                  -> an empty registry {format, world, player, map, seedId, recs, order, gone, log}
//   KOUTPOST.apply(reg, op)               -> {ok, why}; a refused op leaves reg as it was
//   KOUTPOST.fold(save)                   -> {reg, errors}: the player's save (its ops) folded, stopping at the first refusal
//   KOUTPOST.save(reg)                    -> the player's save {format, world, player, map, seedId, ops}
//   KOUTPOST.newId(reg, spec)             -> 'ps-' + base36 of KRAND.hash(seed, day, x, z, n): stable, never reused
//   KOUTPOST.canFound(reg, spec, opt)     -> {ok, why}: apart from the player's own; opt.ground; opt.clear (the world's
//                                            NPC keep-clears, answered by the page)
//   KOUTPOST.found(reg, spec, opt)        -> {ok, why, op, id}   (on a candidate, if spec.candidate)
//   KOUTPOST.abandon(reg, id, day, cause) -> {ok, why, op}
//   KOUTPOST.get / list / live / near(reg, x, z, r) / inRegion(reg, frame, box)
//   KOUTPOST.layout(rec)                  -> {module, id}: which core module draws it at its size
//   KOUTPOST.simSpec(rec)                 -> the spec SIM.settlement takes; tradeWith(rec) -> NPC settlement ids
//   KOUTPOST.nearWorld(place, settlements, r) -> refs to the NPC places (scale model list) within r, nearest first
//   KOUTPOST.keepClear(reg)               -> [{id, x, z, r}]: the discs the world's own placement keeps off
//   KOUTPOST.offer(kit, list)             -> {kept, errors}: a biome kit's candidate sites (hints; nothing drawn)
//   KOUTPOST.candidates(), checkCandidate(c), candidatesNear(reg, x, z, r, opt), clearCandidates()
var KOUTPOST = (function () {
  'use strict';
  /* what it is for */
  var KINDS = ['home', 'post', 'trade', 'hunt', 'mine', 'works', 'farm', 'waystation', 'fort'];
  /* how big it is: each size is laid out by one core module (layout()) */
  var SIZES = ['camp', 'hamlet', 'village', 'town'];
  var LAYOUT = { camp: 'core/camp', hamlet: 'core/hamlet', village: 'core/hamlet', town: 'core/city' };
  var LAYOUT_LINK = { 'core/camp': 'camp', 'core/hamlet': 'hamlet', 'core/city': 'city' };
  var STATES = ['claimed', 'active', 'abandoned', 'ruined', 'lost', 'destroyed'];
  var LIVE = { claimed: true, active: true };
  /* the moves a state may make (PLAN.md section 4); destroyed is final */
  var MOVES = {
    claimed: ['active', 'abandoned'],
    active: ['abandoned', 'lost', 'destroyed'],
    abandoned: ['active', 'ruined', 'lost'],
    ruined: ['active'],
    lost: ['active', 'destroyed'],
    destroyed: []
  };
  /* references across the boundary: what a player settlement may point at in the NPC world */
  var REF_KINDS = ['scale', 'sim', 'camp', 'hamlet', 'city', 'faction', 'people', 'region'];
  var RELS = ['near', 'trade', 'ally', 'rival', 'supply', 'took'];
  var TAKER_KINDS = ['faction', 'org', 'people'];
  var MAPS = { '4': { dx: 0, dy: 0 }, '5.1': { dx: 272, dy: 330 } };
  var M_PER_PX = 2000;
  var R_DEFAULT = 100, GAP_DEFAULT = 200, SEED_DEFAULT = 20261109;
  var FIELDS = ['name', 'kind', 'size', 'state', 'left', 'lostTo', 'links', 'refs', 'tags', '_note'];
  var LINKS = ['settlement', 'camp', 'hamlet', 'city', 'candidate'];
  var HAS = ['water', 'warmth', 'ground', 'resource', 'shelter'];
  var ID = /^ps-[a-z0-9-]+$/;

  var fin = function (v) { return typeof v === 'number' && isFinite(v); };
  var isDay = function (v) { return fin(v) && Math.floor(v) === v; };
  var copy = function (o) { return o == null ? o : JSON.parse(JSON.stringify(o)); };
  var has = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
  function mapOf(ver) { var m = MAPS[ver]; if (!m) throw new Error('KOUTPOST: unknown map version ' + ver); return m; }

  /* ---------------------------------------------------------------- places */
  function at(px, py, ver) { mapOf(ver); return { x: px * M_PER_PX, z: py * M_PER_PX }; }
  function place(px, py, ver, r) {
    var w = at(px, py, ver);
    return { map: ver, px: px, py: py, x: w.x, z: w.z, y: null, r: r == null ? R_DEFAULT : r };
  }
  function toMap(p, ver) {
    var a = mapOf(p.map), b = mapOf(ver);
    var px = p.px - a.dx + b.dx, py = p.py - a.dy + b.dy, w = at(px, py, ver);
    return { map: ver, px: px, py: py, x: w.x, z: w.z, y: p.y == null ? null : p.y, r: p.r };
  }
  /* a region's frame is on the old canvas: origin_px is its (0, 0) */
  function toRegion(p, frame) {
    var m = mapOf(p.map), mpp = frame.m_per_px == null ? M_PER_PX : frame.m_per_px;
    return { x: (p.px - m.dx - frame.origin_px[0]) * mpp, z: (p.py - m.dy - frame.origin_px[1]) * mpp };
  }
  function fromRegion(x, z, frame, ver, r) {
    var m = mapOf(ver), mpp = frame.m_per_px == null ? M_PER_PX : frame.m_per_px;
    return place(x / mpp + frame.origin_px[0] + m.dx, z / mpp + frame.origin_px[1] + m.dy, ver, r);
  }

  /* ---------------------------------------------------------------- the record */
  function checkPlace(p, out) {
    if (!p || typeof p !== 'object') { out.push('place: missing'); return; }
    if (!MAPS[p.map]) { out.push('place: unknown map version ' + p.map); return; }
    if (!fin(p.px) || !fin(p.py) || !fin(p.x) || !fin(p.z)) { out.push('place: px, py, x, z must be finite numbers'); return; }
    var w = at(p.px, p.py, p.map);
    if (Math.abs(w.x - p.x) > 1e-6 || Math.abs(w.z - p.z) > 1e-6) out.push('place: x, z do not match px, py on map ' + p.map);
    if (!(fin(p.r) && p.r > 0)) out.push('place: r must be a positive number');
    if (p.y != null && !fin(p.y)) out.push('place: y must be a number or null');
  }
  function checkRef(f, out) {
    if (!f || typeof f !== 'object') { out.push('refs: an entry is not an object'); return; }
    if (REF_KINDS.indexOf(f.kind) < 0) out.push('refs: kind ' + f.kind + ' not one of ' + REF_KINDS.join(' '));
    if (!(typeof f.id === 'string' && f.id)) out.push('refs: no id');
    else if (/^ps-/.test(f.id)) out.push('refs: ' + f.id + ' is a player settlement; refs only cross to the NPC world');
    if (RELS.indexOf(f.rel) < 0) out.push('refs: rel ' + f.rel + ' not one of ' + RELS.join(' '));
  }
  function check(rec) {
    var out = [];
    if (!rec || typeof rec !== 'object') return ['not a record'];
    if (!(typeof rec.id === 'string' && ID.test(rec.id))) out.push('id: must be ps-<lowercase letters, digits, ->');
    if (!(typeof rec.player === 'string' && rec.player)) out.push('player: the player\'s faction id');
    if (!(typeof rec.name === 'string' && rec.name)) out.push('name: missing');
    if (KINDS.indexOf(rec.kind) < 0) out.push('kind: not one of ' + KINDS.join(' '));
    if (SIZES.indexOf(rec.size) < 0) out.push('size: not one of ' + SIZES.join(' '));
    if (STATES.indexOf(rec.state) < 0) out.push('state: not one of ' + STATES.join(' '));
    checkPlace(rec.place, out);
    if (!isDay(rec.founded)) out.push('founded: a whole world day (a player settlement is always founded in play)');
    if (rec.left != null && !isDay(rec.left)) out.push('left: a whole world day or null');
    if (LIVE[rec.state] && rec.left != null) out.push('left: set on a live settlement');
    if (!LIVE[rec.state] && STATES.indexOf(rec.state) >= 0 && rec.left == null) out.push('left: a ' + rec.state + ' settlement says when it left the player');
    if (isDay(rec.founded) && isDay(rec.left) && rec.left < rec.founded) out.push('left: before founded');
    if (rec.state === 'lost') {
      var t = rec.lostTo;
      if (!t || TAKER_KINDS.indexOf(t.kind) < 0 || !(typeof t.id === 'string' && t.id)) out.push('lostTo: {kind: faction | org | people, id} for a lost settlement');
    } else if (rec.lostTo != null) out.push('lostTo: only on a lost settlement');
    if (!rec.links || typeof rec.links !== 'object') out.push('links: missing');
    else for (var k in rec.links) {
      if (LINKS.indexOf(k) < 0) out.push('links: unknown link ' + k);
      else if (rec.links[k] != null && typeof rec.links[k] !== 'string') out.push('links.' + k + ': an id string or null');
    }
    if (!Array.isArray(rec.refs)) out.push('refs: a list');
    else for (var i = 0; i < rec.refs.length; i++) checkRef(rec.refs[i], out);
    if (!Array.isArray(rec.tags)) out.push('tags: a list');
    return out;
  }
  function record(spec) {
    var links = {};
    for (var i = 0; i < LINKS.length; i++) links[LINKS[i]] = null;
    if (spec.links) for (var k in spec.links) links[k] = spec.links[k];
    var r = {
      id: spec.id, player: spec.player, name: spec.name,
      kind: spec.kind == null ? 'post' : spec.kind, size: spec.size == null ? 'camp' : spec.size,
      place: copy(spec.place), state: spec.state == null ? 'claimed' : spec.state,
      founded: spec.founded, left: spec.left == null ? null : spec.left, lostTo: spec.lostTo == null ? null : copy(spec.lostTo),
      links: links, refs: spec.refs ? copy(spec.refs) : [], tags: spec.tags ? spec.tags.slice() : []
    };
    if (spec._note != null) r._note = spec._note;
    return r;
  }

  /* ---------------------------------------------------------------- the registry */
  function create(opt) {
    opt = opt || {};
    return {
      format: 'krator-player-settlements/1', world: opt.world == null ? 'krator' : opt.world,
      player: opt.player == null ? 'player' : opt.player, map: opt.map == null ? '5.1' : opt.map,
      seedId: opt.seed == null ? SEED_DEFAULT : opt.seed, recs: {}, order: [], gone: {}, log: [], index: null
    };
  }
  function get(reg, id) { return has(reg.recs, id) ? reg.recs[id] : null; }
  function list(reg) { return reg.order.map(function (id) { return reg.recs[id]; }); }
  function live(reg) { return list(reg).filter(function (r) { return LIVE[r.state]; }); }
  function put(reg, rec) {
    if (!has(reg.recs, rec.id)) reg.order.push(rec.id);
    reg.recs[rec.id] = rec; reg.index = null;
  }
  /* the nearness index (KSPACE), rebuilt lazily after any edit; items in registry order */
  function index(reg) {
    if (reg.index) return reg.index;
    var S = KSPACE.create({ cell: 4000 });
    for (var i = 0; i < reg.order.length; i++) { var r = reg.recs[reg.order[i]]; S.insert(r, r.place.x, r.place.z, r.place.r); }
    reg.index = S; return S;
  }
  function near(reg, x, z, r) {
    return index(reg).query(x, z, r).filter(function (o) { return Math.hypot(o.place.x - x, o.place.z - z) <= o.place.r + r; });
  }
  function inRegion(reg, frame, box) {
    return list(reg).filter(function (o) {
      var p = toRegion(o.place, frame);
      return p.x >= box[0] && p.z >= box[1] && p.x <= box[2] && p.z <= box[3];
    });
  }

  /* ---------------------------------------------------------------- operations */
  var OPS = ['ADD', 'SET', 'MOVE', 'REMOVE'];
  function refuse(why) { return { ok: false, why: why }; }
  function trial(reg, id, fn) {
    var cur = get(reg, id);
    if (!cur) return refuse('no player settlement ' + id);
    var next = copy(cur), why = fn(next, cur);
    if (why) return refuse(why);
    var errs = check(next);
    if (errs.length) return refuse(id + ': ' + errs.join('; '));
    return { ok: true, rec: next };
  }
  /* a SET of state: a move of the table, with its date and its taker */
  function setState(next, cur, op) {
    var to = op.set.state;
    if (MOVES[cur.state].indexOf(to) < 0) return 'state: ' + cur.state + ' cannot become ' + to;
    if (LIVE[cur.state] && !LIVE[to]) next.left = has(op.set, 'left') ? op.set.left : op.day;
    if (!LIVE[cur.state] && LIVE[to]) next.left = null;
    if (cur.state === 'lost' && to !== 'lost' && !has(op.set, 'lostTo')) next.lostTo = null;
    return null;
  }
  function apply(reg, op) {
    if (!op || OPS.indexOf(op.op) < 0) return refuse('op: not one of ' + OPS.join(' '));
    if (!(typeof op.id === 'string' && op.id)) return refuse('op: no id');
    if (op.day != null && !isDay(op.day)) return refuse('op: day must be a whole world day');
    var t;
    if (op.op === 'ADD') {
      if (!ID.test(op.id)) return refuse('ADD: ' + op.id + ' is not a player settlement id (ps-...); NPC places are not registered here');
      if (get(reg, op.id)) return refuse('ADD: ' + op.id + ' exists');
      if (reg.gone[op.id]) return refuse('ADD: ' + op.id + ' was removed; ids are never reused');
      if (!op.rec || op.rec.id !== op.id) return refuse('ADD: rec.id must be the op id');
      if (op.rec.player !== reg.player) return refuse('ADD: ' + op.id + ' belongs to ' + op.rec.player + ', not this registry\'s player ' + reg.player);
      var rec = record(op.rec), errs = check(rec);
      if (errs.length) return refuse('ADD ' + op.id + ': ' + errs.join('; '));
      put(reg, rec);
    } else if (op.op === 'SET') {
      if (!op.set || typeof op.set !== 'object') return refuse('SET: no set');
      for (var k in op.set) if (FIELDS.indexOf(k) < 0) return refuse('SET: ' + k + ' is not settable (MOVE moves; ids, player and founded never change)');
      t = trial(reg, op.id, function (next, cur) {
        for (var f in op.set) {
          if (f === 'links') { for (var l in op.set.links) next.links[l] = op.set.links[l]; }
          else if (f !== 'state') next[f] = copy(op.set[f]);
        }
        if (has(op.set, 'state') && op.set.state !== cur.state) { next.state = op.set.state; return setState(next, cur, op); }
        return null;
      });
      if (!t.ok) return t;
      put(reg, t.rec);
    } else if (op.op === 'MOVE') {
      t = trial(reg, op.id, function (next) { next.place = copy(op.place); return null; });
      if (!t.ok) return t;
      put(reg, t.rec);
    } else {
      if (!get(reg, op.id)) return refuse('REMOVE: no player settlement ' + op.id);
      delete reg.recs[op.id]; reg.order.splice(reg.order.indexOf(op.id), 1);
      reg.gone[op.id] = true; reg.index = null;
    }
    reg.log.push(copy(op));
    return { ok: true };
  }
  function fold(sv) {
    var reg = create({ world: sv.world, player: sv.player, map: sv.map, seed: sv.seedId }), errors = [];
    if (sv.seed != null) { errors.push('save: a player save has no seed (NPC places are not registered here)'); return { reg: reg, errors: errors }; }
    var O = sv.ops || [];
    for (var j = 0; j < O.length; j++) {
      var r = apply(reg, O[j]);
      if (!r.ok) { errors.push('op ' + j + ': ' + r.why); break; }
    }
    return { reg: reg, errors: errors };
  }
  function save(reg) {
    return { format: reg.format, world: reg.world, player: reg.player, map: reg.map, seedId: reg.seedId, ops: copy(reg.log) };
  }

  /* ---------------------------------------------------------------- founding */
  function newId(reg, spec) {
    var p = spec.place;
    for (var n = 0; n < 1000; n++) {
      var id = 'ps-' + KRAND.hash(reg.seedId, spec.day == null ? 0 : spec.day, Math.floor(p.x), Math.floor(p.z), n).toString(36);
      if (!get(reg, id) && !reg.gone[id]) return id;
    }
    throw new Error('KOUTPOST.newId: no free id');
  }
  function canFound(reg, spec, opt) {
    opt = opt || {};
    var gap = opt.gap == null ? GAP_DEFAULT : opt.gap, p = spec.place;
    if (!p || !fin(p.x) || !fin(p.z)) return refuse('place: not a finite point');
    var r = p.r == null ? R_DEFAULT : p.r;
    if (!(fin(r) && r > 0)) return refuse('place: r must be a positive number');
    if (KINDS.indexOf(spec.kind) < 0) return refuse('kind: not one of ' + KINDS.join(' '));
    if (spec.size != null && SIZES.indexOf(spec.size) < 0) return refuse('size: not one of ' + SIZES.join(' '));
    if (!isDay(spec.day)) return refuse('day: the world day it is founded on');
    var hit = near(reg, p.x, p.z, r + gap).filter(function (o) {
      return LIVE[o.state] && Math.hypot(o.place.x - p.x, o.place.z - p.z) < o.place.r + r + gap;
    });
    if (hit.length) return refuse('too close to the player\'s ' + hit[0].id + ' (' + hit[0].name + ')');
    if (opt.ground && !opt.ground(p.x, p.z)) return refuse('ground: the page says no');
    var c = opt.clear ? opt.clear(p.x, p.z, r) : null;
    if (c) return refuse('the world keeps this clear: ' + c);
    return { ok: true };
  }
  function found(reg, spec, opt) {
    spec = copy(spec);
    if (spec.candidate != null) {
      var c = CAND.byId[spec.candidate];
      if (!c) return refuse('candidate: no candidate ' + spec.candidate);
      if (!spec.place) spec.place = copy(c.place);
      if (spec.name == null) spec.name = c.name;
    }
    if (spec.place && spec.place.r == null) spec.place.r = R_DEFAULT;
    var can = canFound(reg, spec, opt);
    if (!can.ok) return can;
    var id = spec.id == null ? newId(reg, spec) : spec.id, links = spec.links ? copy(spec.links) : {};
    if (spec.candidate != null) links.candidate = spec.candidate;
    var op = { op: 'ADD', id: id, day: spec.day, cause: spec.cause == null ? 'founded' : spec.cause,
      rec: { id: id, player: reg.player, name: spec.name, kind: spec.kind, size: spec.size, place: spec.place,
        state: 'claimed', founded: spec.day, links: links, refs: spec.refs, tags: spec.tags, _note: spec._note } };
    var r = apply(reg, op);
    return r.ok ? { ok: true, op: op, id: id } : r;
  }
  function abandon(reg, id, day, cause) {
    var op = { op: 'SET', id: id, day: day, cause: cause == null ? 'abandoned' : cause, set: { state: 'abandoned' } };
    var r = apply(reg, op);
    return r.ok ? { ok: true, op: op } : r;
  }

  /* ---------------------------------------------------------------- where it touches the rest of the world */
  function layout(rec) { var m = LAYOUT[rec.size]; return { module: m, id: rec.links[LAYOUT_LINK[m]] }; }
  function simSpec(rec) {
    return { id: rec.links.settlement == null ? rec.id : rec.links.settlement, faction: rec.player, name: rec.name,
      kind: 'player', size: rec.size, outpost: rec.id };
  }
  function tradeWith(rec) {
    return rec.refs.filter(function (f) { return f.rel === 'trade' && f.kind === 'sim'; }).map(function (f) { return f.id; });
  }
  /* the NPC places (a scale model settlement list, read, never kept) within r of a place: refs, nearest first */
  function nearWorld(p, L, r) {
    var out = [];
    for (var i = 0; i < L.length; i++) {
      var s = L[i], ver = s.map == null ? p.map : s.map;
      var q = toMap({ map: ver, px: s.px, py: s.py, r: 1 }, p.map), d = Math.hypot(q.x - p.x, q.z - p.z);
      if (d <= r) out.push({ kind: 'scale', id: s.id, rel: 'near', name: s.name, type: s.type, d: d });
    }
    out.sort(function (a, b) { return a.d - b.d || (a.id < b.id ? -1 : 1); });
    return out;
  }
  /* what the world's own placement (flora, NPC camps and villages) keeps off: everything still standing */
  function keepClear(reg) {
    return list(reg).filter(function (o) { return o.state !== 'destroyed'; })
      .map(function (o) { return { id: o.id, x: o.place.x, z: o.place.z, r: o.place.r }; });
  }

  /* ---------------------------------------------------------------- candidate sites (hints from the kits) */
  var CAND = { list: [], byId: {} };
  function checkCandidate(c) {
    var out = [];
    if (!c || typeof c !== 'object') return ['not a candidate'];
    if (!(typeof c.kit === 'string' && /^[a-z0-9-]+$/.test(c.kit))) out.push('kit: lowercase name');
    if (!(typeof c.id === 'string' && c.id.indexOf(c.kit + ':') === 0 && /^[a-z0-9-]+:[a-z0-9-]+$/.test(c.id))) out.push('id: <kit>:<key>');
    if (!(typeof c.name === 'string' && c.name)) out.push('name: missing');
    if (!c.place || !MAPS[c.place.map] || !fin(c.place.px) || !fin(c.place.py)) out.push('place: {map, px, py} on a known map');
    else if (!(fin(c.place.r) && c.place.r > 0)) out.push('place: r must be a positive number');
    if (!Array.isArray(c.suits) || !c.suits.length || c.suits.some(function (k) { return KINDS.indexOf(k) < 0; })) out.push('suits: kinds from KINDS');
    if (!c.has || typeof c.has !== 'object') out.push('has: missing');
    else for (var k in c.has) {
      if (HAS.indexOf(k) < 0) out.push('has: unknown ' + k);
      else if (!(fin(c.has[k]) && c.has[k] >= 0 && c.has[k] <= 1)) out.push('has.' + k + ': 0..1');
    }
    if (c.risks != null && !Array.isArray(c.risks)) out.push('risks: a list');
    return out;
  }
  function offer(kit, L) {
    var kept = [], errors = [];
    for (var i = 0; i < L.length; i++) {
      var c = copy(L[i]), e = checkCandidate(c);
      if (!e.length && c.kit !== kit) e.push('kit: offered by ' + kit + ' but names ' + c.kit);
      if (!e.length && CAND.byId[c.id]) e.push('id: ' + c.id + ' offered twice');
      if (e.length) { errors.push((c && c.id) + ': ' + e.join('; ')); continue; }
      var w = at(c.place.px, c.place.py, c.place.map);
      c.place.x = w.x; c.place.z = w.z; if (c.place.y === undefined) c.place.y = null;
      if (!c.risks) c.risks = [];
      CAND.list.push(c); CAND.byId[c.id] = c; kept.push(c.id);
    }
    return { kept: kept, errors: errors };
  }
  function candidates() { return CAND.list.slice(); }
  function clearCandidates() { CAND.list = []; CAND.byId = {}; }
  /* best first: those that suit opt.kind before those that do not (dropped when opt.only), then by the sum of `has`; ties by id */
  function candidatesNear(reg, x, z, r, opt) {
    opt = opt || {};
    var out = [];
    for (var i = 0; i < CAND.list.length; i++) {
      var c = CAND.list[i], d = Math.hypot(c.place.x - x, c.place.z - z);
      if (d > r) continue;
      var suits = opt.kind == null || c.suits.indexOf(opt.kind) >= 0;
      if (opt.only && !suits) continue;
      var score = 0; for (var k in c.has) score += c.has[k];
      var held = reg ? near(reg, c.place.x, c.place.z, c.place.r).filter(function (o) { return LIVE[o.state]; }).map(function (o) { return o.id; }) : [];
      out.push({ cand: c, d: d, score: score, suits: suits, held: held });
    }
    out.sort(function (a, b) { return (b.suits ? 1 : 0) - (a.suits ? 1 : 0) || b.score - a.score || (a.cand.id < b.cand.id ? -1 : 1); });
    return out;
  }

  return {
    KINDS: KINDS, SIZES: SIZES, STATES: STATES, LIVE: LIVE, MOVES: MOVES, REF_KINDS: REF_KINDS, RELS: RELS,
    MAPS: MAPS, M_PER_PX: M_PER_PX, R_DEFAULT: R_DEFAULT, GAP_DEFAULT: GAP_DEFAULT,
    at: at, place: place, toMap: toMap, toRegion: toRegion, fromRegion: fromRegion,
    check: check, create: create, apply: apply, fold: fold, save: save,
    get: get, list: list, live: live, near: near, inRegion: inRegion,
    newId: newId, canFound: canFound, found: found, abandon: abandon,
    layout: layout, simSpec: simSpec, tradeWith: tradeWith, nearWorld: nearWorld, keepClear: keepClear,
    offer: offer, candidates: candidates, clearCandidates: clearCandidates, checkCandidate: checkCandidate,
    candidatesNear: candidatesNear
  };
})();
if (typeof window !== 'undefined') window.KOUTPOST = KOUTPOST;
