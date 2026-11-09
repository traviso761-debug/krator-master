// ================================================================= OPEN WORLD — the outpost registry (KOUTPOST)
// [G data] openworld/outposts/PLAN.md. The world's list of outposts (the player's and everyone's): plain records keyed by
// stable ids, edited only through an operation log by id (ADD, SET, MOVE, REMOVE), with the rules as plain functions on
// records. No three.js, no DOM, no simulation calls: it links to core/simulation, core/camp, core/hamlet and core/city
// by id. Reads core/rand (KRAND) and core/space (KSPACE) in place.
//
//   KOUTPOST.KINDS, OWNERS, STATES, LIVE, MOVES, MAPS, M_PER_PX      the vocabulary and the tables
//   KOUTPOST.at(px, py, ver)              -> {x, z} world metres on that map version
//   KOUTPOST.place(px, py, ver, r)        -> a place record {map, px, py, x, z, y:null, r}
//   KOUTPOST.toMap(place, ver)            -> the same place on another map version
//   KOUTPOST.toRegion(place, frame)       -> {x, z} in an open-world region's frame (region.json `frame`)
//   KOUTPOST.fromRegion(x, z, frame, ver) -> a place from a region's local metres
//   KOUTPOST.check(rec)                   -> [errors] (empty: a valid record)
//   KOUTPOST.create(opt)                  -> an empty registry {format, world, seed, map, recs, order, gone, log}
//   KOUTPOST.seed(list, ver)              -> records from the scale model's outpost-typed settlements
//   KOUTPOST.apply(reg, op)               -> {ok, why}; a refused op leaves reg as it was
//   KOUTPOST.fold(file)                   -> {reg, errors}: the base file (seed + ops) folded, stopping at the first refusal
//   KOUTPOST.save(reg)                    -> the base file {format, world, map, seedId, seed, ops}
//   KOUTPOST.newId(reg, spec)             -> 'op-' + base36 of KRAND.hash(seed, day, x, z, n): stable, never reused
//   KOUTPOST.canFound(reg, spec, opt)     -> {ok, why}: the founding rule (claims apart by opt.gap; opt.ground)
//   KOUTPOST.found(reg, spec, opt)        -> {ok, why, op, id}: founds an outpost (on a candidate, if spec.candidate)
//   KOUTPOST.abandon(reg, id, day, cause) -> {ok, why, op}
//   KOUTPOST.get / list / live / ofOwner / near(reg, x, z, r) / inRegion(reg, frame, box)
//   KOUTPOST.simSpec(rec)                 -> the spec SIM.settlement takes ({id, faction, name})
//   KOUTPOST.offer(kit, list)             -> {kept, errors}: a biome kit's candidate sites (hints; nothing drawn)
//   KOUTPOST.candidates(), checkCandidate(c), candidatesNear(reg, x, z, r, opt), clearCandidates()
var KOUTPOST = (function () {
  'use strict';
  var KINDS = ['post', 'trade', 'hunt', 'mine', 'works', 'farm', 'waystation', 'fort'];
  var OWNERS = ['player', 'people', 'faction', 'org', 'none', 'unknown'];
  var STATES = ['claimed', 'active', 'abandoned', 'ruined', 'destroyed'];
  var LIVE = { claimed: true, active: true };
  /* the moves a state may make (PLAN.md section 3); destroyed is final */
  var MOVES = {
    claimed: ['active', 'abandoned'],
    active: ['abandoned', 'destroyed'],
    abandoned: ['active', 'ruined'],
    ruined: ['active'],
    destroyed: []
  };
  /* each map version's offset from the old canvas the open worlds' region.json use (5.1: +272, +330) */
  var MAPS = { '4': { dx: 0, dy: 0 }, '5.1': { dx: 272, dy: 330 } };
  var M_PER_PX = 2000;
  var R_DEFAULT = 100, GAP_DEFAULT = 200, SEED_DEFAULT = 20261109;
  var FIELDS = ['name', 'kind', 'owner', 'state', 'founded', 'abandoned', 'links', 'tags', '_note'];
  var LINKS = ['scale', 'settlement', 'camp', 'hamlet', 'city', 'candidate'];
  var HAS = ['water', 'warmth', 'ground', 'resource', 'shelter'];

  var fin = function (v) { return typeof v === 'number' && isFinite(v); };
  var isDay = function (v) { return v === null || (fin(v) && Math.floor(v) === v); };
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
    var px = p.px - a.dx + b.dx, py = p.py - a.dy + b.dy;
    var w = at(px, py, ver);
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
  function checkOwner(o, state, out) {
    if (!o || typeof o !== 'object' || OWNERS.indexOf(o.kind) < 0) { out.push('owner: kind not one of ' + OWNERS.join(' ')); return; }
    var named = o.kind !== 'none' && o.kind !== 'unknown';
    if (named && !(typeof o.id === 'string' && o.id)) out.push('owner: a ' + o.kind + ' needs an id');
    if (state && LIVE[state] && o.kind === 'none') out.push('owner: a live outpost (' + state + ') has an owner');
    if (state && !LIVE[state] && o.kind !== 'none') out.push('owner: a dead outpost (' + state + ') has owner none');
  }
  function checkPlace(p, out) {
    if (!p || typeof p !== 'object') { out.push('place: missing'); return; }
    if (!MAPS[p.map]) { out.push('place: unknown map version ' + p.map); return; }
    if (!fin(p.px) || !fin(p.py) || !fin(p.x) || !fin(p.z)) { out.push('place: px, py, x, z must be finite numbers'); return; }
    var w = at(p.px, p.py, p.map);
    if (Math.abs(w.x - p.x) > 1e-6 || Math.abs(w.z - p.z) > 1e-6) out.push('place: x, z do not match px, py on map ' + p.map);
    if (!(fin(p.r) && p.r > 0)) out.push('place: r must be a positive number');
    if (p.y != null && !fin(p.y)) out.push('place: y must be a number or null');
  }
  function check(rec) {
    var out = [];
    if (!rec || typeof rec !== 'object') return ['not a record'];
    if (!(typeof rec.id === 'string' && /^op-[a-z0-9-]+$/.test(rec.id))) out.push('id: must be op-<lowercase letters, digits, ->');
    if (!(typeof rec.name === 'string' && rec.name)) out.push('name: missing');
    if (KINDS.indexOf(rec.kind) < 0) out.push('kind: not one of ' + KINDS.join(' '));
    if (STATES.indexOf(rec.state) < 0) out.push('state: not one of ' + STATES.join(' '));
    checkOwner(rec.owner, STATES.indexOf(rec.state) >= 0 ? rec.state : null, out);
    checkPlace(rec.place, out);
    if (!isDay(rec.founded)) out.push('founded: a whole world day or null');
    if (!isDay(rec.abandoned)) out.push('abandoned: a whole world day or null');
    if (LIVE[rec.state] && rec.abandoned != null) out.push('abandoned: set on a live outpost');
    if (fin(rec.founded) && fin(rec.abandoned) && rec.abandoned < rec.founded) out.push('abandoned: before founded');
    if (!rec.links || typeof rec.links !== 'object') out.push('links: missing');
    else for (var k in rec.links) {
      if (LINKS.indexOf(k) < 0) out.push('links: unknown link ' + k);
      else if (rec.links[k] != null && typeof rec.links[k] !== 'string') out.push('links.' + k + ': an id string or null');
    }
    if (!Array.isArray(rec.tags)) out.push('tags: a list');
    return out;
  }
  function blankLinks() { var l = {}; for (var i = 0; i < LINKS.length; i++) l[LINKS[i]] = null; return l; }
  function record(spec) {
    var links = blankLinks();
    if (spec.links) for (var k in spec.links) links[k] = spec.links[k];
    var r = {
      id: spec.id, name: spec.name, kind: spec.kind == null ? 'post' : spec.kind,
      owner: copy(spec.owner), place: copy(spec.place),
      state: spec.state == null ? 'active' : spec.state,
      founded: spec.founded === undefined ? null : spec.founded,
      abandoned: spec.abandoned === undefined ? null : spec.abandoned,
      links: links, tags: spec.tags ? spec.tags.slice() : []
    };
    if (spec._note != null) r._note = spec._note;
    return r;
  }

  /* ---------------------------------------------------------------- the registry */
  function create(opt) {
    opt = opt || {};
    return {
      format: 'krator-outposts/1', world: opt.world == null ? 'krator' : opt.world,
      map: opt.map == null ? '5.1' : opt.map, seedId: opt.seed == null ? SEED_DEFAULT : opt.seed,
      seed: [], recs: {}, order: [], gone: {}, log: [], index: null
    };
  }
  function get(reg, id) { return has(reg.recs, id) ? reg.recs[id] : null; }
  function list(reg) { return reg.order.map(function (id) { return reg.recs[id]; }); }
  function live(reg) { return list(reg).filter(function (r) { return LIVE[r.state]; }); }
  function ofOwner(reg, kind, id) {
    return list(reg).filter(function (r) { return r.owner.kind === kind && (id == null || r.owner.id === id); });
  }
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

  /* ---------------------------------------------------------------- seeding from the scale model */
  /* what the names and notes say; everything else is 'post' until the owner types it (PLAN.md section 12) */
  var SEED_HINTS = {
    sthegate: { kind: 'waystation', owner: { kind: 'people', id: 'tierhounds' },
      _note: 'the scale model notes: the Tierhounds\' toll fort on the one way into the Outlands' },
    se4hiep1n7: { kind: 'fort', _note: 'a fort by its name; owner to confirm' },
    sjqk469u0k: { kind: 'fort', _note: 'a fort by its name; owner to confirm' },
    sxan7r1sln: { kind: 'fort', _note: 'a fort by its name; owner to confirm' }
  };
  function seed(L, ver) {
    var out = [];
    for (var i = 0; i < L.length; i++) {
      var s = L[i];
      if (s.type !== 'outpost') continue;
      var h = SEED_HINTS[s.id] || {};
      out.push(record({
        id: 'op-' + String(s.id).toLowerCase(), name: s.name, kind: h.kind == null ? 'post' : h.kind,
        owner: h.owner ? h.owner : { kind: 'unknown' }, place: place(s.px, s.py, ver), state: 'active',
        founded: null, links: { scale: s.id },
        _note: h._note == null ? 'seeded from the scale model; kind and owner not yet given' : h._note
      }));
    }
    out.sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
    return out;
  }

  /* ---------------------------------------------------------------- operations */
  var OPS = ['ADD', 'SET', 'MOVE', 'REMOVE'];
  function refuse(why) { return { ok: false, why: why }; }
  function trial(reg, id, fn) {
    var cur = get(reg, id);
    if (!cur) return refuse('no outpost ' + id);
    var next = copy(cur), why = fn(next, cur);
    if (why) return refuse(why);
    var errs = check(next);
    if (errs.length) return refuse(id + ': ' + errs.join('; '));
    return { ok: true, rec: next };
  }
  /* a SET of state: a move of the table, with its dates and owner */
  function setState(next, cur, op) {
    var to = op.set.state;
    if (MOVES[cur.state].indexOf(to) < 0) return 'state: ' + cur.state + ' cannot become ' + to;
    if (LIVE[cur.state] && !LIVE[to]) {
      next.abandoned = op.set.abandoned === undefined ? op.day : op.set.abandoned;
      if (!has(op.set, 'owner')) next.owner = { kind: 'none' };
    } else if (!LIVE[cur.state] && LIVE[to]) {
      next.abandoned = null;
      if (!has(op.set, 'owner')) return 'state: retaking ' + cur.id + ' names its new owner in the same op';
    }
    return null;
  }
  function apply(reg, op) {
    if (!op || OPS.indexOf(op.op) < 0) return refuse('op: not one of ' + OPS.join(' '));
    if (!(typeof op.id === 'string' && op.id)) return refuse('op: no id');
    if (op.day !== undefined && !isDay(op.day)) return refuse('op: day must be a whole world day');
    var t;
    if (op.op === 'ADD') {
      if (get(reg, op.id)) return refuse('ADD: ' + op.id + ' exists');
      if (reg.gone[op.id]) return refuse('ADD: ' + op.id + ' was removed; ids are never reused');
      if (!op.rec || op.rec.id !== op.id) return refuse('ADD: rec.id must be the op id');
      var rec = record(op.rec), errs = check(rec);
      if (errs.length) return refuse('ADD ' + op.id + ': ' + errs.join('; '));
      put(reg, rec);
    } else if (op.op === 'SET') {
      if (!op.set || typeof op.set !== 'object') return refuse('SET: no set');
      for (var k in op.set) if (FIELDS.indexOf(k) < 0) return refuse('SET: ' + k + ' is not settable (MOVE moves, ids never change)');
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
      if (!get(reg, op.id)) return refuse('REMOVE: no outpost ' + op.id);
      delete reg.recs[op.id]; reg.order.splice(reg.order.indexOf(op.id), 1);
      reg.gone[op.id] = true; reg.index = null;
    }
    reg.log.push(copy(op));
    return { ok: true };
  }
  function fold(file) {
    var reg = create({ world: file.world, map: file.map, seed: file.seedId }), errors = [];
    var S = file.seed || [];
    for (var i = 0; i < S.length; i++) {
      var e = check(S[i]);
      if (e.length) { errors.push('seed ' + (S[i] && S[i].id) + ': ' + e.join('; ')); return { reg: reg, errors: errors }; }
      if (get(reg, S[i].id)) { errors.push('seed: ' + S[i].id + ' twice'); return { reg: reg, errors: errors }; }
      reg.seed.push(copy(S[i])); put(reg, copy(S[i]));
    }
    var O = file.ops || [];
    for (var j = 0; j < O.length; j++) {
      var r = apply(reg, O[j]);
      if (!r.ok) { errors.push('op ' + j + ': ' + r.why); break; }
    }
    return { reg: reg, errors: errors };
  }
  function save(reg) {
    return { format: reg.format, world: reg.world, map: reg.map, seedId: reg.seedId, seed: copy(reg.seed), ops: copy(reg.log) };
  }

  /* ---------------------------------------------------------------- founding */
  function newId(reg, spec) {
    var p = spec.place;
    for (var n = 0; n < 1000; n++) {
      var id = 'op-' + KRAND.hash(reg.seedId, spec.day == null ? 0 : spec.day, Math.floor(p.x), Math.floor(p.z), n).toString(36);
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
    var e = []; checkOwner(spec.owner, 'claimed', e);
    if (e.length) return refuse(e.join('; '));
    var hit = near(reg, p.x, p.z, r + gap).filter(function (o) {
      return LIVE[o.state] && Math.hypot(o.place.x - p.x, o.place.z - p.z) < o.place.r + r + gap;
    });
    if (hit.length) return refuse('too close to ' + hit[0].id + ' (' + hit[0].name + ')');
    if (opt.ground && !opt.ground(p.x, p.z)) return refuse('ground: the page says no');
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
      rec: { id: id, name: spec.name, kind: spec.kind, owner: spec.owner, place: spec.place,
        state: spec.state == null ? 'claimed' : spec.state, founded: spec.day == null ? null : spec.day, links: links,
        tags: spec.tags, _note: spec._note } };
    var r = apply(reg, op);
    return r.ok ? { ok: true, op: op, id: id } : r;
  }
  function abandon(reg, id, day, cause) {
    var op = { op: 'SET', id: id, day: day, cause: cause == null ? 'abandoned' : cause, set: { state: 'abandoned' } };
    var r = apply(reg, op);
    return r.ok ? { ok: true, op: op } : r;
  }

  /* ---------------------------------------------------------------- the simulation */
  function simSpec(rec) {
    var o = rec.owner, f = o.kind === 'faction' || o.kind === 'player' ? (o.id == null ? 'player' : o.id) : null;
    return { id: rec.links.settlement == null ? rec.id : rec.links.settlement, faction: f, name: rec.name, kind: 'outpost', outpost: rec.id };
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
    KINDS: KINDS, OWNERS: OWNERS, STATES: STATES, LIVE: LIVE, MOVES: MOVES, MAPS: MAPS, M_PER_PX: M_PER_PX,
    R_DEFAULT: R_DEFAULT, GAP_DEFAULT: GAP_DEFAULT, SEED_HINTS: SEED_HINTS,
    at: at, place: place, toMap: toMap, toRegion: toRegion, fromRegion: fromRegion,
    check: check, create: create, seed: seed, apply: apply, fold: fold, save: save,
    get: get, list: list, live: live, ofOwner: ofOwner, near: near, inRegion: inRegion,
    newId: newId, canFound: canFound, found: found, abandon: abandon, simSpec: simSpec,
    offer: offer, candidates: candidates, clearCandidates: clearCandidates, checkCandidate: checkCandidate,
    candidatesNear: candidatesNear
  };
})();
if (typeof window !== 'undefined') window.KOUTPOST = KOUTPOST;
