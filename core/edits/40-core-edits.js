/* ============================== core/edits: the edit log ==============================
   [G data] One shape for every change made to a world after it is generated: the owner's edits in the preview's
   editor, later the player's builds, and the simulation's off-screen operations (core/simulation/PLAN.md 8.9).
   ROADMAP.md section 10. No THREE, no DOM: Godot reads and writes the same log.

   A log:   { format: 'krator-edits', version: 1, build, ops: [op, ...] }
   An op:   { op: 'ADD' | 'MOVE' | 'SET' | 'REMOVE', id, target, rec?, at?, ry?, path?, value?, from?, old?, cause?, thread? }
     id      'e<n>', unique in its log, in the order ops were recorded
     target  what it acts on: { uid?, class, key?, at: [x, y, z] }. uid is core/tags' (KTAGS.uid of class, key and the
             position in 10 cm steps); `at` is the fallback while a builder has no stable ids (core/city's lots)
     rec     ADD: the record to create, in core/tags' shape ({class, key, at, ry, size?, tags?, ...})
     at, ry  MOVE: the new position and turn; `from: {at, ry}` keeps the old ones, for the inverse
     path, value   SET: a dotted field path on the record and its new value; `old` keeps the previous value, and
             `created: true` says the field did not exist (its undo carries `unset: true`: the world removes the field)
     cause   who or what made it: 'owner', 'player', 'sim:<event>', 'import:streetlab'
     thread  the simulation's thread status (open | resolved | transformed), else absent
   Rules, from the furniture rule in README.md ("edits as an overlay"): an op whose target is not found is SKIPPED and
   reported, never applied to something else; ops apply in log order; the inverse of each op is an op (undo).

   KEDITS.log(build)                        a new empty log
   KEDITS.add(log, rec, opt)                record an ADD; returns the op
   KEDITS.move(log, target, at, ry, from, opt) / set(log, target, path, value, old, opt) / remove(log, target, rec, opt)
   KEDITS.inverse(op)                       the op that undoes it (needs `from`, `old`, `rec` as recorded)
   KEDITS.apply(log, world, opt)            world = { find(target, tol) -> handle|null, add(rec, op) -> handle,
                                            move(handle, at, ry, op), set(handle, path, value, op), remove(handle, op) };
                                            returns { applied, skipped: [{id, op, reason}] }
   KEDITS.match(target, cands, tol)         the candidate a target means: same uid, else same class (and key when the
                                            target has one) nearest to `at` within tol metres (default 1.5); else null
   KEDITS.fromStreetlab(json, build)        Streetlab's city-edits file ({buildings, streets, del, flora?}) as a log
   KEDITS.stable(log)                       the log with keys in a fixed order (for diffs and hashes)
*/
var KEDITS = (function () {
  var OPS = { ADD: 1, MOVE: 1, SET: 1, REMOVE: 1 };
  function log(build) { return { format: 'krator-edits', version: 1, build: build || null, ops: [] }; }
  function nextId(L) { return 'e' + (L.ops.length + 1); }
  function tgt(t) {
    if (!t || !t['class']) throw new Error('core/edits: a target needs a class');
    var o = { 'class': t['class'] };
    if (t.uid != null) o.uid = t.uid;
    if (t.key != null) o.key = t.key;
    if (t.at) o.at = [+t.at[0], +(t.at[1] || 0), +t.at[2]];
    if (o.uid == null && !o.at) throw new Error('core/edits: a target needs a uid or a position');
    return o;
  }
  function push(L, o, opt) {
    opt = opt || {};
    o.id = nextId(L);
    if (opt.cause != null) o.cause = opt.cause;
    if (opt.thread != null) o.thread = opt.thread;
    L.ops.push(o);
    return o;
  }
  function add(L, rec, opt) {
    if (!rec || !rec['class'] || !rec.at) throw new Error('core/edits: ADD needs a record with a class and a position');
    var r = JSON.parse(JSON.stringify(rec));
    return push(L, { op: 'ADD', target: tgt({ uid: r.uid, 'class': r['class'], key: r.key, at: r.at }), rec: r }, opt);
  }
  function move(L, target, at, ry, from, opt) {
    var o = { op: 'MOVE', target: tgt(target), at: [+at[0], +(at[1] || 0), +at[2]] };
    if (ry != null) o.ry = +ry;
    if (from) o.from = { at: from.at ? [+from.at[0], +(from.at[1] || 0), +from.at[2]] : o.target.at, ry: from.ry == null ? null : +from.ry };
    return push(L, o, opt);
  }
  function set(L, target, path, value, old, opt) {
    if (typeof path !== 'string' || !path) throw new Error('core/edits: SET needs a field path');
    var o = { op: 'SET', target: tgt(target), path: path, value: value };
    if (old === undefined) { o.old = null; o.created = true; }   /* the field did not exist: undo removes it */
    else o.old = old;
    return push(L, o, opt);
  }
  function remove(L, target, rec, opt) {
    var o = { op: 'REMOVE', target: tgt(target) };
    if (rec) o.rec = JSON.parse(JSON.stringify(rec));
    return push(L, o, opt);
  }
  /* the undo of an op, as an op (no id: the caller records it in a log, or applies it directly) */
  function inverse(o) {
    if (!o || !OPS[o.op]) throw new Error('core/edits: not an op');
    if (o.op === 'ADD') return { op: 'REMOVE', target: o.target, rec: o.rec };
    if (o.op === 'REMOVE') {
      if (!o.rec) throw new Error('core/edits: a REMOVE recorded without its record cannot be undone');
      return { op: 'ADD', target: o.target, rec: o.rec };
    }
    if (o.op === 'MOVE') {
      if (!o.from) throw new Error('core/edits: a MOVE recorded without `from` cannot be undone');
      var t = { 'class': o.target['class'], key: o.target.key, at: o.at };   /* it now stands at the new place */
      var m = { op: 'MOVE', target: t, at: o.from.at };
      if (o.from.ry != null) m.ry = o.from.ry;
      if (o.ry != null) m.from = { at: o.at, ry: o.ry }; else m.from = { at: o.at, ry: null };
      return m;
    }
    if (!('old' in o)) throw new Error('core/edits: a SET recorded without `old` cannot be undone');
    if (o.created) return { op: 'SET', target: o.target, path: o.path, value: null, unset: true, old: o.value };
    return { op: 'SET', target: o.target, path: o.path, value: o.old, old: o.value };
  }
  function match(t, cands, tol) {
    tol = tol == null ? 1.5 : tol;
    if (t.uid != null) for (var i = 0; i < cands.length; i++) if (cands[i] && cands[i].uid === t.uid) return cands[i];
    if (!t.at) return null;
    var best = null, bd = Infinity;
    for (var j = 0; j < cands.length; j++) {
      var c = cands[j];
      if (!c || c['class'] !== t['class'] || (t.key != null && c.key != null && c.key !== t.key) || !c.at) continue;
      var d = Math.hypot(c.at[0] - t.at[0], c.at[2] - t.at[2]);
      if (d <= tol && d < bd) { bd = d; best = c; }
    }
    return best;
  }
  function apply(L, world, opt) {
    opt = opt || {};
    var tol = opt.tol == null ? 1.5 : opt.tol, out = { applied: 0, skipped: [] };
    (L.ops || []).forEach(function (o) {
      if (!OPS[o.op]) { out.skipped.push({ id: o.id, op: o.op, reason: 'unknown op' }); return; }
      if (o.op === 'ADD') { if (world.add(o.rec, o) == null) out.skipped.push({ id: o.id, op: o.op, reason: 'the world refused it' }); else out.applied++; return; }
      var h = world.find(o.target, tol);
      if (h == null) { out.skipped.push({ id: o.id, op: o.op, reason: 'target not found' }); return; }
      if (o.op === 'MOVE') world.move(h, o.at, o.ry, o);
      else if (o.op === 'SET') world.set(h, o.path, o.value, o);
      else world.remove(h, o);
      out.applied++;
    });
    return out;
  }
  /* Streetlab's city edits (settlements/streetlab/site/voth-city-edits.json, 35-vc-steps.js applyEdits/applyDeletes):
     buildings [{key, v, x, z, ry}] -> ADD building; streets [{cls, pts}] -> ADD infrastructure (kind way);
     del [{x, z}] -> REMOVE building at that point (Streetlab matches the lot within 1.5 m); flora [{key|kind, x, z, del?}]
     -> ADD or REMOVE flora. Read-only: Streetlab's own file and code are not changed. */
  function fromStreetlab(E, build) {
    var L = log(build || (E && E.site) || null), opt = { cause: 'import:streetlab' };
    if (!E) return L;
    (E.streets || []).forEach(function (s) {
      if (!s.pts || s.pts.length < 2) return;
      var p0 = s.pts[0];
      add(L, { 'class': 'infrastructure', kind: 'way', key: s.cls, at: [p0[0], 0, p0[1]], pts: s.pts.map(function (p) { return [p[0], p[1]]; }) }, opt);
    });
    (E.buildings || []).forEach(function (b) {
      add(L, { 'class': 'building', key: b.key, variant: b.v || 0, at: [b.x, 0, b.z], ry: b.ry || 0 }, opt);
    });
    (E.del || []).forEach(function (q) { remove(L, { 'class': 'building', at: [q.x, 0, q.z] }, null, opt); });
    (E.flora || []).forEach(function (f) {
      var key = f.key != null ? f.key : f.kind;
      if (f.del) remove(L, { 'class': 'flora', key: key, at: [f.x, 0, f.z] }, null, opt);
      else add(L, { 'class': 'flora', key: key, at: [f.x, f.y || 0, f.z], ry: f.ry || 0 }, opt);
    });
    return L;
  }
  function stable(L) {
    var ORDER = ['id', 'op', 'target', 'rec', 'at', 'ry', 'from', 'path', 'value', 'old', 'created', 'unset', 'cause', 'thread'];
    function sortObj(v) {
      if (Array.isArray(v)) return v.map(sortObj);
      if (v && typeof v === 'object') { var o = {}; Object.keys(v).sort().forEach(function (k) { o[k] = sortObj(v[k]); }); return o; }
      return v;
    }
    return { format: L.format, version: L.version, build: L.build, ops: L.ops.map(function (o) {
      var r = {}; ORDER.forEach(function (k) { if (k in o) r[k] = sortObj(o[k]); });
      Object.keys(o).sort().forEach(function (k) { if (!(k in r)) r[k] = sortObj(o[k]); });
      return r; }) };
  }
  return { log: log, add: add, move: move, set: set, remove: remove, inverse: inverse, apply: apply, match: match,
           fromStreetlab: fromStreetlab, stable: stable };
})();
if (typeof module !== 'undefined') module.exports = KEDITS;
