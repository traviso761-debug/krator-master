// ================================================================= CORE TAGS — the registry ([G data])
// One registry of WHAT a placed thing is, for every build (GODOT-PLAN.md Phase 2 item 3, rule 4; PROPOSAL.md and
// README.md here). It holds no geometry, collision, draw or live state: only the record. No THREE, no DOM: it runs
// in node (test-tags.js), and its export is what crosses to Godot as node metadata.
//
//   const T = KTAGS.create({ build: 'yuni' })
//   T.add(rec)               -> the stored record, with its id and uid (defaults filled, tags normalised)
//   T.child(parentId, rec)   -> a record whose id is a path under its parent: 'bld_00098.room.4'
//   T.get(id)                -> the record (a removed one too), or null
//   T.remove(id)             -> the record, marked removed: true. It keeps its id; no id is ever reused
//   T.query(q)               -> the live records matching q = { class, kind, key, parent, tags: { culture: 'voth',
//                               types: 'shop' }, box: [x0, z0, x1, z1], removed: true (to include removed ones) }
//   T.at(x, z, y)            -> the smallest live record whose footprint (and height, when y is given) holds the
//                               point: the inspector's rule, once
//   T.audit()                -> { records, removed, byClass, unknownKeys, unknownValues, unknown, missingCulture,
//                               missingTypes }: unknown vocabulary is counted here, never thrown
//   T.export()               -> { format: 'krator-tags', version: 1, build, convention, vocab, records }
//   KTAGS.uid(cls, key, at)  -> the position hash, 8 hex digits (README.md, "The uid": Godot reproduces it)
//   KTAGS.instanceId(id, i)  -> 'flora_00012#37': an instance of an item's record (an instance has no record)
//   KTAGS.norm(tags)         -> { tags, problems }: the input mapping (aliases, wealth names) and the checks
//
// The record: { id, uid, class, kind, key, name, parent, at: [x,y,z], ry, size: [w,d,h] | r (+ h), tags, note, src }
//   at   the base centre in world metres (+Y up, x east, z south): y is where it stands. x, y, z on input work too
//   ry   radians about +Y, three's rotation.y (the front, +z, turns to (sin ry, cos ry)); yaw is an alias on input
//   size full extents in its own frame; a round thing gives r (and h) instead
// The vocabulary (KTAGS.VOCAB) is 52-core-tags-vocab.js; the label the inspector shows is 53-core-tags-host.js.
(function(){
'use strict';
var root = typeof globalThis !== 'undefined' ? globalThis : this;
var K = { version: 1 };

function krand(){
  if (typeof KRAND !== 'undefined') return KRAND;
  if (root.KRAND) return root.KRAND;
  throw new Error('core/tags needs core/rand (08-core-rand.js) loaded first: the uid is a KRAND.hash');
}
function vocab(){
  if (!K.VOCAB) throw new Error('core/tags: load 52-core-tags-vocab.js before the first add');
  return K.VOCAB;
}
function pad5(n){ return ('0000' + n).slice(-5); }
function r4(v){ return +(+v).toFixed(4); }

// ---- the uid: KRAND.hash(0, str(class), str(key), cm10(x), cm10(y), cm10(z)) as 8 lowercase hex digits.
// str(s) is FNV-1a over the UTF-16 code units of s ('' for a null key), as int32; cm10(v) = floor(v * 10 + 0.5),
// the position in 10 cm steps (KRAND.hash floors its arguments, so it is passed v * 10 + 0.5). README.md, "The uid".
function str32(s){
  var h = 0x811C9DC5; s = s == null ? '' : String(s);
  for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return h | 0;
}
K.str32 = str32;
K.uid = function(cls, key, at){
  var u = krand().hash(0, str32(cls), str32(key), at[0] * 10 + 0.5, at[1] * 10 + 0.5, at[2] * 10 + 0.5);
  return ('0000000' + u.toString(16)).slice(-8);
};
K.instanceId = function(id, i){ return id + '#' + i; };

// ---- tags: the input mapping and the checks. Known keys take values from the vocabulary; an unknown key or
// value stays on the record as given and is reported as a problem, which audit() counts.
K.norm = function(tags){
  var V = vocab(), out = {}, problems = [], k;
  tags = tags || {};
  for (k in tags) if (tags[k] !== undefined) out[k] = tags[k];
  // culture first: an old spelling may set wealth, style, state or set (PROPOSAL.md, "The culture list, cleaned")
  if (typeof out.culture === 'string' && V.cultureAlias[out.culture]) {
    var al = V.cultureAlias[out.culture];
    out.culture = al.culture;
    for (k in al) if (k !== 'culture' && !(k in out)) out[k] = al[k];   // a given value, null too, wins
  }
  if (typeof out.wealth === 'number') out.wealth = V.wealthOf(out.wealth);
  else if (typeof out.wealth === 'string' && V.wealthAlias.hasOwnProperty(out.wealth)) out.wealth = V.wealthAlias[out.wealth];
  if (typeof out.types === 'string') out.types = [out.types];
  for (k in out) {
    var rule = V.keys[k], v = out[k];
    if (!rule) { problems.push({ key: k }); continue; }
    if (v === null || rule === 'free') continue;
    if (rule === 'bool') { if (typeof v !== 'boolean') problems.push({ key: k, value: v }); continue; }
    if (rule === 'object') { if (typeof v !== 'object' || Array.isArray(v)) problems.push({ key: k, value: v }); continue; }
    var list = V[rule];
    if (Array.isArray(v)) { for (var i = 0; i < v.length; i++) if (list.indexOf(v[i]) < 0) problems.push({ key: k, value: v[i] }); }
    else if (list.indexOf(v) < 0) problems.push({ key: k, value: v });
  }
  return { tags: out, problems: problems };
};

K.create = function(cfg){
  cfg = cfg || {};
  var V = null, recs = [], byId = {}, counters = {}, childCount = {};
  var T = { build: cfg.build || null, records: recs };

  function prefixOf(rec){
    if (rec.prefix) return rec.prefix;
    if (rec['class'] === 'fixture' && V.fixturePrefix[rec.kind]) return V.fixturePrefix[rec.kind];
    return V.prefix[rec['class']];
  }
  // a passed-through order id moves its prefix's counter past it, so a later made id never collides
  function claim(id){
    var m = /^([a-z]+)_(\d+)$/.exec(id);
    if (m) counters[m[1]] = Math.max(counters[m[1]] || 0, parseInt(m[2], 10) + 1);
  }
  function make(rec, parent){
    V = V || vocab();
    var cls = rec['class'] != null ? rec['class'] : rec.cls;
    if (cls === 'fauna') throw new Error('core/tags: fauna is not a class; a placed animal is class "life" with its species as kind');
    if (V.classes.indexOf(cls) < 0) throw new Error('core/tags: unknown class ' + cls);
    var at = rec.at ? rec.at : [rec.x || 0, rec.y || 0, rec.z || 0];
    var o = { id: null, uid: null, 'class': cls, kind: rec.kind != null ? rec.kind : null, key: rec.key != null ? rec.key : null,
      name: rec.name != null ? rec.name : null, parent: parent || (rec.parent != null ? rec.parent : null),
      at: [r4(at[0]), r4(at[1]), r4(at[2])], ry: r4(rec.ry != null ? rec.ry : (rec.yaw || 0)) };
    if (rec.size) o.size = rec.size.map(r4);
    else if (rec.r != null) { o.r = r4(rec.r); if (rec.h != null) o.h = r4(rec.h); }
    o.tags = K.norm(rec.tags).tags;
    if (rec.note != null) o.note = String(rec.note);
    o.src = { build: T.build, frag: rec.frag || (rec.src && rec.src.frag) || null };
    if (rec.id != null) {
      if (byId[rec.id]) throw new Error('core/tags: duplicate id ' + rec.id);
      o.id = String(rec.id); claim(o.id);
    } else if (parent) {
      var seg = rec.kind || cls, ck = parent + '.' + seg;
      o.id = ck + '.' + (childCount[ck] = (childCount[ck] || 0) + 1, childCount[ck] - 1);
    } else {
      var p = prefixOf(o);
      if (!p) throw new Error('core/tags: no id prefix for class ' + cls);
      counters[p] = counters[p] || 0;
      o.id = p + '_' + pad5(counters[p]++);
    }
    o.uid = K.uid(cls, o.key, o.at);
    recs.push(o); byId[o.id] = o;
    return o;
  }

  T.add = function(rec){ return make(rec, null); };
  T.child = function(parentId, rec){
    if (!byId[parentId]) throw new Error('core/tags: child of an unknown parent ' + parentId);
    return make(rec, parentId);
  };
  T.get = function(id){ return byId[id] || null; };
  T.remove = function(id){ var r = byId[id]; if (r) r.removed = true; return r || null; };

  function tagMatch(r, want){
    for (var k in want) {
      var have = r.tags[k], w = want[k];
      if (Array.isArray(have) ? have.indexOf(w) < 0 : have !== w) return false;
    }
    return true;
  }
  T.query = function(q){
    q = q || {};
    var out = [];
    for (var i = 0; i < recs.length; i++) {
      var r = recs[i];
      if (r.removed && !q.removed) continue;
      if (q['class'] != null && r['class'] !== q['class']) continue;
      if (q.kind != null && r.kind !== q.kind) continue;
      if (q.key != null && r.key !== q.key) continue;
      if (q.parent !== undefined && r.parent !== q.parent) continue;
      if (q.tags && !tagMatch(r, q.tags)) continue;
      if (q.box && (r.at[0] < q.box[0] || r.at[0] > q.box[2] || r.at[2] < q.box[1] || r.at[2] > q.box[3])) continue;
      out.push(r);
    }
    return out;
  };

  // the footprint test in the record's own frame: its +z front at (sin ry, cos ry), its +x right at (cos ry, -sin ry)
  function holds(r, x, z, y){
    var dx = x - r.at[0], dz = z - r.at[2], h;
    if (r.size) {
      var c = Math.cos(r.ry), s = Math.sin(r.ry);
      var lx = dx * c - dz * s, lz = dx * s + dz * c;
      if (Math.abs(lx) > r.size[0] / 2 || Math.abs(lz) > r.size[1] / 2) return 0;
      h = r.size[2];
      if (y != null && h != null && (y < r.at[1] || y > r.at[1] + h)) return 0;
      return r.size[0] * r.size[1];
    }
    if (r.r != null) {
      if (dx * dx + dz * dz > r.r * r.r) return 0;
      if (y != null && r.h != null && (y < r.at[1] || y > r.at[1] + r.h)) return 0;
      return Math.PI * r.r * r.r;
    }
    return 0;
  }
  T.at = function(x, z, y){
    var best = null, ba = Infinity;
    for (var i = 0; i < recs.length; i++) {
      if (recs[i].removed) continue;
      var a = holds(recs[i], x, z, y);
      if (a > 0 && a < ba) { ba = a; best = recs[i]; }
    }
    return best;
  };

  T.audit = function(){
    var a = { records: 0, removed: 0, byClass: {}, unknownKeys: {}, unknownValues: {}, unknown: 0, missingCulture: 0, missingTypes: 0 };
    for (var i = 0; i < recs.length; i++) {
      var r = recs[i];
      if (r.removed) { a.removed++; continue; }
      a.records++;
      a.byClass[r['class']] = (a.byClass[r['class']] || 0) + 1;
      var ps = K.norm(r.tags).problems;
      for (var j = 0; j < ps.length; j++) {
        a.unknown++;
        if (!('value' in ps[j])) a.unknownKeys[ps[j].key] = (a.unknownKeys[ps[j].key] || 0) + 1;
        else { var kv = ps[j].key + ':' + ps[j].value; a.unknownValues[kv] = (a.unknownValues[kv] || 0) + 1; }
      }
      if (r['class'] === 'building') {
        if (!r.tags.culture) a.missingCulture++;
        if (!r.tags.types || !r.tags.types.length) a.missingTypes++;
      }
    }
    return a;
  };

  T.export = function(){
    return { format: 'krator-tags', version: 1, build: T.build,
      convention: 'metres, +Y up, x east, z south; at is the base centre; ry radians about +Y (the front, +z, turns to (sin ry, cos ry)); size [w, d, h] in the record\'s own frame; uid: core/tags/README.md',
      vocab: K.VOCAB, records: recs };
  };
  return T;
};

if (typeof module !== 'undefined' && module.exports) module.exports = K;
root.KTAGS = K;   // a global, so the fragment is one IIFE that leaks nothing into a build's shared scope
})();
