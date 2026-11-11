// ================================================================= CORE — anomaly: where physics fails (KANOM)  [G data]
// biomes/ancientsvalley/PLAN-ANOMALIES.md sections 4 and 14 (the owner, 2026-11-02 and 2026-11-10): a zone where gravity
// grows or reverses, time slows or races, the land bends, space is larger inside, or a door leads elsewhere. Each is a
// RECORD first (registered in core/tags before anything is drawn); these are plain functions on the records: no THREE, no
// DOM, so Godot takes the same records and the same arithmetic. Bounded (an edge), graded (0 at the edge, its strength at
// the core, a smoothstep over the rim), free when absent (no record in reach: KANOM.at returns KANOM.NORMAL, untouched).
//
// The record (every field optional but kind and shape):
//   id        'anom_00001' in add order (or the caller's own)          kind   gravity | time | bend | space | portal
//   shape     {type: 'circle', at: [x, z], r} | {type: 'poly', pts: [[x, z]...]} in world metres
//   y         the ground at the centre (the hazard's base; default 0)   y0, y1  a height band (default: every height)
//   rim       metres from the edge inward over which the strength ramps 0 -> 1 (default a third of the radius; a poly: 50)
//   strength  0..1 at the core (1)
//   g         gravity at the core, times the world's (gravity: 3 the Press; below 0 reversed, the Lake That Falls)
//   time      time's rate at the core (time: 1e-4 the Stilled Ground; above 1 fast, the Fast Water)
//   bend      the Bend's amount at the core (KWARP's k; bend)           to     a portal's or a House's destination (free)
//   tell      {colour, fx, sound, signs: [...]}: the readable warning at the rim (the kind's TELLS fill it)
//   seed      KRAND.hash(registry seed, index, salt): what a draw keyed to this record hashes from
//
//   KANOM.create({seed}) -> R        a registry (KANOM itself is the page's: KANOM.add, KANOM.at... on KANOM.page)
//   R.add(o) -> rec                  checked and filled (throws on an unknown kind or a bad shape); the hazard rows go in
//   R.list() / R.get(id)             the records, in id order
//   KANOM.strength(rec, x, z, y)     0..1 here: 0 outside the shape (and outside its band), strength at rim depth and in
//   R.at(x, y, z) -> {g, time, bend, k, ids}   every record holding the point, combined in id order: gravity and time
//                                    multiply in log scale (g = product of g_i ^ s_i, so 3 g at half strength is 1.73 g; a
//                                    reversed record flips the sign at s > .5), bend adds, k the strongest s; NORMAL if none
//   R.near(x, z, r)                  the records whose shape comes within r of the point (the host's tick, the uniforms)
//   KANOM.walk(at) -> {speed, eye, step, bob}   the walker's factors (1 = normal): heavy gravity slows the walk, lowers
//                                    the eye, shortens the step and the bob; slow time slows the walk too. The speed never
//                                    falls below PRESETS.walk.min, so a walker can always walk out (PLAN-ANOMALIES 2, rule 4)
//   KANOM.squash(at | g) -> {sy, sxz, sink, floors}   the Press's placement: a thing grown or standing under g is shorter
//                                    (sy), spreads (sxz), sinks into its own crater (sink, a fraction of its height) and a
//                                    ruin keeps fewer storeys (floors, the fraction kept); IDENTITY at 1 g and below
//   KANOM.owed(S, rate, dt) -> S     the world's time while a walker spends dt (s, its own) at rate: S.owed (s the world
//                                    moved on, capped at PRESETS.owedCap: a day, the owner 2026-11-04) and S.aged (s the
//                                    walker aged past the world in fast time). Pure; S = {owed: 0, aged: 0}
//   KANOM.hazardOf(rec) -> h | null  the core/hazard record a hurting anomaly carries (tags.hazard): time below 1 the
//                                    `time` kind (stasis), above 1 `aging`; gravity above 1 `crushing` (fatal at the core,
//                                    the owner 2026-11-04), below 0 `lift`; bend, space and portal none
//   R.register(T) -> [tags records]  each record into a core/tags registry before it is drawn ({class: 'feature', kind:
//                                    'anomaly', key: 'anomaly.<kind>', tags: {anomaly, hazard}}); R.T then holds T
//   R.zones()                        navigation zones of the hurting ones: [{id, kind, shape, avoid}]
//   R.export()                       {format: 'krator-anomaly', version: 1, records}
//   KANOM.HAZARD_KINDS               the rows crushing, aging and lift: put into KTAGS.VOCAB.hazardKinds when this file
//                                    loads (or at the first add), only where a row of that name is missing, so a page
//                                    without core/anomaly is byte-identical (PLAN-ANOMALIES 14); tags.anomaly likewise
// Needs core/rand (08-core-rand.js) for the seeds; core/tags and core/hazard only when present.
var KANOM = (function(root){
  'use strict';
  var KINDS = ['gravity', 'time', 'bend', 'space', 'portal'];
  var PRESETS = {
    walk: { min: .12, gSpeed: .75, gEye: .35, tSpeed: .25 },   /* speed = g^-gSpeed x rate^tSpeed, eye = 1 - gEye (1 - 1/g) */
    squash: { sy: .5, sxz: .25, sink: .08 },                   /* sy = g^-sy, sxz = g^sxz, sink = sink (g - 1), floors = 1/g */
    owedCap: 86400,                                            /* a day (the owner, 2026-11-04) */
    salt: 0x414e4f4d                                           /* 'ANOM' */
  };
  var TELLS = {
    time:    { colour: '#b080ff', fx: 'stillness', sound: 'silence', signs: ['dust hanging', 'birds still in the air', 'a fall stopped'] },
    fast:    { colour: '#d0c070', fx: 'ageband', sound: 'pitch-up', signs: ['forest in age bands', 'seasons racing'] },
    gravity: { colour: '#8a7a66', fx: 'pall', sound: 'pressure-hum', signs: ['dust lying flat', 'trees stunted and spread', 'ruins pancaked'] },
    lift:    { colour: '#80c0ff', fx: 'rising', sound: 'roar-up', signs: ['debris rising in columns', 'water peeling upward'] },
    bend:    { colour: '#c0a0ff', fx: 'horizon', sound: null, signs: ['the horizon climbing'] },
    space:   { colour: '#606060', fx: null, sound: 'growl-far', signs: ['a door too small for its hall'] },
    portal:  { colour: '#a0ffe0', fx: 'seam', sound: 'pressure', signs: ['air folding at a door'] }
  };
  // the hazard rows core/anomaly brings (KTAGS.VOCAB.hazardKinds' shape: core/tags/52-core-tags-vocab.js)
  var HAZARD_KINDS = {
    crushing: { effect: 'damage', danger: 1,  dose: 6,  falloff: 'smooth', nav: { travel: 6, enter: 20, avoid: true },  tell: { colour: '#8a7a66', fx: 'pall', sound: 'pressure-hum' } },
    aging:    { effect: 'damage', danger: .5, dose: .2, falloff: 'smooth', nav: { travel: 2, enter: 5, avoid: false },  tell: { colour: '#d0c070', fx: 'ageband', sound: 'pitch-up' }, time: { scale: 50 } },
    lift:     { effect: null,     danger: .8, dose: 0,  falloff: 'smooth', nav: { travel: 1, enter: 0, avoid: true },   tell: { colour: '#80c0ff', fx: 'rising', sound: 'roar-up' } }
  };
  var NORMAL = Object.freeze({ g: 1, time: 1, bend: 0, k: 0, ids: Object.freeze([]) });
  var IDENTITY = Object.freeze({ sy: 1, sxz: 1, sink: 0, floors: 1 });
  var WALK0 = Object.freeze({ speed: 1, eye: 1, step: 1, bob: 1 });

  function d(v, x){ return v == null ? x : v; }
  function fin(v, what){ if (typeof v !== 'number' || !isFinite(v)) throw new Error('KANOM.add: ' + what + ' must be a finite number'); return v; }
  function krand(){ var K = root.KRAND; if (!K) throw new Error('core/anomaly: load core/rand/08-core-rand.js first'); return K; }
  function ss(a, b, x){ var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function pad5(n){ return ('0000' + n).slice(-5); }

  // the vocabulary rows, where missing (never overwriting a page's own)
  function install(){
    var KT = root.KTAGS; if (!KT || !KT.VOCAB) return false;
    var V = KT.VOCAB, done = false;
    if (V.hazardKinds) for (var k in HAZARD_KINDS) if (!V.hazardKinds[k]) { V.hazardKinds[k] = JSON.parse(JSON.stringify(HAZARD_KINDS[k])); done = true; }
    if (V.keys && !V.keys.anomaly) { V.keys.anomaly = 'object'; done = true; }
    return done;
  }

  // ---- the shape: depth inside (m, < 0 outside), and a bounding circle
  function inPoly(P, x, z){ var c = false; for (var i = 0, j = P.length - 1; i < P.length; j = i++) {
    var a = P[i], b = P[j]; if (((a[1] > z) !== (b[1] > z)) && (x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0])) c = !c; } return c; }
  function segD(x, z, a, b){ var ex = b[0] - a[0], ez = b[1] - a[1], L = ex * ex + ez * ez, t = L > 0 ? ((x - a[0]) * ex + (z - a[1]) * ez) / L : 0;
    t = Math.max(0, Math.min(1, t)); var px = a[0] + ex * t - x, pz = a[1] + ez * t - z; return Math.sqrt(px * px + pz * pz); }
  function depth(sh, x, z){
    if (sh.type === 'circle') { var dx = x - sh.at[0], dz = z - sh.at[1]; return sh.r - Math.sqrt(dx * dx + dz * dz); }
    var P = sh.pts, m = Infinity; for (var i = 0; i < P.length; i++) m = Math.min(m, segD(x, z, P[i], P[(i + 1) % P.length]));
    return inPoly(P, x, z) ? m : -m;
  }
  function bound(sh){
    if (sh.type === 'circle') return { x: sh.at[0], z: sh.at[1], r: sh.r };
    var x = 0, z = 0, P = sh.pts, r = 0, i; for (i = 0; i < P.length; i++) { x += P[i][0]; z += P[i][1]; } x /= P.length; z /= P.length;
    for (i = 0; i < P.length; i++) r = Math.max(r, Math.hypot(P[i][0] - x, P[i][1] - z)); return { x: x, z: z, r: r };
  }
  function strength(rec, x, z, y){
    if (y != null && ((rec.y0 != null && y < rec.y0) || (rec.y1 != null && y > rec.y1))) return 0;
    var dp = depth(rec.shape, x, z); if (!(dp > 0)) return 0;
    return rec.strength * ss(0, rec.rim, dp);
  }

  function make(o, idx, seed){
    if (!o || typeof o !== 'object') throw new Error('KANOM.add: a record is an object');
    if (KINDS.indexOf(o.kind) < 0) throw new Error('KANOM.add: unknown kind ' + o.kind);
    var s = o.shape; if (!s) throw new Error('KANOM.add: a record needs a shape');
    var sh;
    if (s.type === 'circle') { if (!s.at || s.at.length < 2) throw new Error('KANOM.add: a circle needs at [x, z]');
      sh = { type: 'circle', at: [fin(s.at[0], 'at x'), fin(s.at[1], 'at z')], r: fin(s.r, 'r') }; if (!(sh.r > 0)) throw new Error('KANOM.add: r must be above 0'); }
    else if (s.type === 'poly') { if (!s.pts || s.pts.length < 3) throw new Error('KANOM.add: a poly needs 3 or more pts');
      sh = { type: 'poly', pts: s.pts.map(function(p){ return [fin(p[0], 'pt x'), fin(p[1], 'pt z')]; }) }; }
    else throw new Error('KANOM.add: unknown shape ' + s.type);
    var b = bound(sh), st = fin(d(o.strength, 1), 'strength'); if (st < 0 || st > 1) throw new Error('KANOM.add: strength is 0..1');
    var rec = { id: o.id || 'anom_' + pad5(idx), kind: o.kind, shape: sh, y: fin(d(o.y, 0), 'y'), y0: o.y0 == null ? null : fin(o.y0, 'y0'), y1: o.y1 == null ? null : fin(o.y1, 'y1'),
      rim: fin(d(o.rim, sh.type === 'circle' ? sh.r / 3 : 50), 'rim'), strength: st,
      g: fin(d(o.g, 1), 'g'), time: fin(d(o.time, 1), 'time'), bend: fin(d(o.bend, 0), 'bend'), to: d(o.to, null),
      seed: o.seed == null ? krand().hash(seed, idx, PRESETS.salt) : (o.seed >>> 0), bound: b };
    if (!(rec.rim > 0)) throw new Error('KANOM.add: rim must be above 0');
    if (!(rec.time > 0)) throw new Error('KANOM.add: time is a rate above 0');
    if (rec.kind === 'gravity' && rec.g === 0) throw new Error('KANOM.add: g 0 has no log scale: use a small number');
    var tk = rec.kind === 'time' ? (rec.time > 1 ? 'fast' : 'time') : rec.kind === 'gravity' ? (rec.g < 0 ? 'lift' : 'gravity') : rec.kind;
    var T0 = TELLS[tk], tl = o.tell || {};
    rec.tell = { colour: d(tl.colour, T0.colour), fx: tl.fx === undefined ? T0.fx : tl.fx, sound: tl.sound === undefined ? T0.sound : tl.sound, signs: (tl.signs || T0.signs).slice() };
    return rec;
  }

  function hazardOf(rec){
    var sh = rec.shape, b = rec.bound, shape = sh.type === 'circle' ? { type: 'cyl', r: sh.r, y0: -500, y1: 2000 }
      : { type: 'poly', pts: sh.pts.map(function(p){ return [p[0] - b.x, p[1] - b.z]; }), edge: rec.rim, y0: -500, y1: 2000 };
    var tell = { colour: rec.tell.colour, fx: rec.tell.fx, sound: rec.tell.sound };
    if (rec.kind === 'time' && rec.time < 1) return { kind: 'time', time: { scale: rec.time }, shape: shape, falloff: 'smooth', tell: tell, seed: rec.seed };
    if (rec.kind === 'time' && rec.time > 1) return { kind: 'aging', time: { scale: rec.time }, shape: shape, falloff: 'smooth', tell: tell, seed: rec.seed };
    if (rec.kind === 'gravity' && rec.g > 1) return { kind: 'crushing', dose: HAZARD_KINDS.crushing.dose * (rec.g - 1) * rec.strength, shape: shape, falloff: 'smooth', tell: tell, seed: rec.seed };
    if (rec.kind === 'gravity' && rec.g < 0) return { kind: 'lift', shape: shape, falloff: 'smooth', tell: tell, seed: rec.seed };
    return null;
  }

  function combine(list, x, y, z){
    var lg = 0, sign = 1, lt = 0, bend = 0, k = 0, ids = [];
    for (var i = 0; i < list.length; i++) { var r = list[i], s = strength(r, x, z, y); if (!(s > 0)) continue;
      ids.push(r.id); if (s > k) k = s;
      if (r.kind === 'gravity') { lg += s * Math.log(Math.abs(r.g)); if (r.g < 0 && s > .5) sign = -sign; }
      else if (r.kind === 'time') lt += s * Math.log(r.time);
      else if (r.kind === 'bend') bend += s * r.bend; }
    if (!ids.length) return NORMAL;
    return { g: sign * Math.exp(lg), time: Math.exp(lt), bend: bend, k: k, ids: ids };
  }

  function walk(at){
    if (!at || at === NORMAL) return WALK0;
    var P = PRESETS.walk, g = Math.abs(at.g), r = at.time;
    if (g <= 1 && r >= 1) return WALK0;
    var gs = g > 1 ? Math.pow(g, -P.gSpeed) : 1, ts = r < 1 ? Math.pow(r, P.tSpeed) : 1, inv = g > 1 ? 1 / g : 1;
    return { speed: Math.max(P.min, gs * ts), eye: 1 - P.gEye * (1 - inv), step: inv, bob: Math.pow(inv, 1.5) };
  }
  function squash(a){
    var g = typeof a === 'number' ? a : (a ? a.g : 1); if (!(g > 1)) return IDENTITY; var P = PRESETS.squash;
    return { sy: Math.pow(g, -P.sy), sxz: Math.pow(g, P.sxz), sink: Math.min(.5, P.sink * (g - 1)), floors: 1 / g };
  }
  function owed(S, rate, dt){
    S.owed = S.owed == null ? 0 : S.owed; S.aged = S.aged == null ? 0 : S.aged; if (!(dt > 0) || !(rate > 0)) return S;
    if (rate < 1) S.owed = Math.min(d(S.cap, PRESETS.owedCap), S.owed + dt * (1 / rate - 1)); else if (rate > 1) S.aged += dt * (rate - 1);
    return S;
  }

  function create(o){
    o = o || {}; var seed = d(o.seed, 1) >>> 0, recs = [], byId = {};
    var R = { seed: seed, T: null };
    R.add = function(a){ install(); var rec = make(a, recs.length + 1, seed); if (byId[rec.id]) throw new Error('KANOM.add: duplicate id ' + rec.id);
      recs.push(rec); recs.sort(function(p, q){ return p.id < q.id ? -1 : p.id > q.id ? 1 : 0; }); byId[rec.id] = rec;
      if (R.T) reg(R.T, rec); return rec; };
    R.list = function(){ return recs.slice(); };
    R.get = function(id){ return byId[id] || null; };
    R.at = function(x, y, z){ return recs.length ? combine(recs, x, y, z) : NORMAL; };
    R.near = function(x, z, r){ return recs.filter(function(q){ var b = q.bound; return Math.hypot(b.x - x, b.z - z) <= b.r + (r == null ? 0 : r); }); };
    function reg(T, rec){ var h = hazardOf(rec), b = rec.bound, tags = { anomaly: { kind: rec.kind, g: rec.g, time: rec.time, bend: rec.bend, strength: rec.strength, rim: rec.rim, tell: rec.tell, to: rec.to } };
      if (h) { if (root.KHAZ && root.KHAZ.make) try { h = root.KHAZ.make(h); } catch (e) { throw new Error('KANOM.register: ' + e.message); } tags.hazard = h; }
      return T.add({ class: 'feature', kind: 'anomaly', key: 'anomaly.' + rec.kind, name: rec.id, at: [b.x, rec.y, b.z], r: b.r, h: 2500, tags: tags }); }
    R.register = function(T){ install(); R.T = T; return recs.map(function(rec){ return reg(T, rec); }); };
    R.zones = function(){ var out = []; recs.forEach(function(rec){ var h = hazardOf(rec); if (!h) return; var row = HAZARD_KINDS[h.kind] || (root.KTAGS && root.KTAGS.VOCAB.hazardKinds[h.kind]) || { nav: { avoid: true } };
      out.push({ id: rec.id, kind: h.kind, shape: rec.shape, avoid: !!row.nav.avoid }); }); return out; };
    R.export = function(){ return { format: 'krator-anomaly', version: 1, seed: seed, records: JSON.parse(JSON.stringify(recs)) }; };
    return R;
  }

  var K = { KINDS: KINDS, PRESETS: PRESETS, TELLS: TELLS, HAZARD_KINDS: HAZARD_KINDS, NORMAL: NORMAL, IDENTITY: IDENTITY, WALK0: WALK0,
    create: create, strength: strength, depth: function(rec, x, z){ return depth(rec.shape, x, z); }, walk: walk, squash: squash, owed: owed, hazardOf: hazardOf, install: install };
  K.page = create({ seed: 1 });
  ['add', 'list', 'get', 'at', 'near', 'register', 'zones', 'export'].forEach(function(n){ K[n] = function(){ return K.page[n].apply(K.page, arguments); }; });
  K.reset = function(o){ K.page = create(o); return K.page; };
  install();
  root.KANOM = K;
  return K;
})(typeof globalThis !== 'undefined' ? globalThis : this);
if (typeof module !== 'undefined' && module.exports) module.exports = KANOM;
