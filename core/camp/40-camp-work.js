/* ==================== core/camp 40: work camps that migrate (plain data, [G data]) ==================== */
/* core/camp/PLAN.md section 6.5 (owner, 2026-11-02: "some resources, like timber, might be better implemented as a work
   camp that migrates"). A WORK CAMP is a crew sent out from a fixed yard (a lumber village's sawpit and kiln) to work a
   resource that is spread over a range, not held at one point: it pitches at one STAND, works it down, strikes and
   marches to the next, and the stands it left grow back. The first is the timber camp; a charcoal burners' or a
   rubber tappers' camp is the same machine.

   The camp's whole history is its OP LOG (PLAN.md section 7): pitch, strike, march. Between ops everything is a pure
   function of the day and of what the sim took from the stand being worked (its SIM.site's `taken`): where the camp is,
   what each stand holds, which trees are stumps. Nothing else is stored, so a save is the log and Godot replays it.

     KCAMP.WORK                       the defaults (a host overrides any in the camp's cfg):
                                        cell (m) the stands' grid; regrowDays a stand felled bare takes to grow back;
                                        stumpDays a felled tree shows as a stump before its sapling; ready (the share of
                                        its capacity a stand must hold again before the camp comes back); strikeAt (the
                                        share left standing when the camp moves on: the seed trees); strikeHours,
                                        pitchHours, marchKmh, detour (the march); haulScale, moveScale (m: how much the
                                        haul to the yard and the march from here weigh against a stand's timber)
     KCAMP.stands({id, range, yard: [x, z], capacity(x, z, cell) -> lots, cell?, minCap?})
                                      -> [{id, i, j, x, z, cap, dYard}]: the range cut on a WORLD grid (cell i, j is
                                        floor(x / cell), floor(z / cell)), so a stand's id `<camp>:stand:<i>:<j>` is the
                                        same whatever the yard or the range; every cell whose centre is within `range` of
                                        the yard and holds at least minCap lots (the host's capacity: its trees' timber)
     KCAMP.workCamp({id, world, yard, stands, cfg?}) -> W: the camp's state {id, world, yard, stands, by, cfg, log, cur,
                                        last}; `last[stand]` and `cur` are a cache of the log (KCAMP.workReplay rebuilds it)
     KCAMP.workStart(W, day)          the first pitch, at the best stand from the yard -> the pitch op
     KCAMP.workLeft(W, s, day, taken?) what stand s holds on a day: its capacity, less what its last visit took, plus its
                                        regrowth since (cap / regrowDays a day, up to cap); the stand being worked holds
                                        its pitch's amount less `taken` (the sim's site)
     KCAMP.workDue(W, left)           whether the stand being worked is down to its seed trees (left <= strikeAt x cap)
     KCAMP.workNext(W, day, from, not?)  the stand to go to (never `not`, the one just struck): of those holding `ready` of
                                        their capacity again (else of all),
                                        the best by its timber over (1 + its haul to the yard / haulScale)(1 + its march
                                        from here / moveScale); a hash of (world, camp, visit, cell) breaks ties
     KCAMP.workMove(W, day, taken)    strike the stand being worked (it gave `taken`), march, pitch at the next ->
                                        {strike, march, pitch}; the crew works neither on the march nor while striking or
                                        pitching (the host pauses its recipe until pitch.day)
     KCAMP.workAt(W, day)             -> {state: 'pitched' | 'striking' | 'marching' | 'pitching', stand, x, z} | null
     KCAMP.workTree(W, s, k, n, day, taken?)  tree k of a stand's n (in the host's felling order: nearest the camp's spot
                                        first) on a day: 'gone' (a stump), 'young' (a sapling) or null (standing). Its last
                                        visit felled the first floor(n x taken / cap), in order through the visit; a tree
                                        felled is a stump for stumpDays, a sapling until regrowDays
     KCAMP.workYield(W)               lots a day the range gives back for ever (each stand's cut share over regrowDays):
                                        a camp drawing no more than this never runs its range out
     KCAMP.workReplay(W)              rebuild `cur` and `last` from the log (a loaded save) */
(function () {
  'use strict';
  KCAMP.WORK = {cell: 400, minCap: 1, regrowDays: 365, stumpDays: 20, ready: 1, strikeAt: 0.1,
    strikeHours: 8, pitchHours: 8, marchKmh: 3, detour: 1.3, haulScale: 2500, moveScale: 1500};
  var cfgOf = function (W) { return W.cfg; };
  var hyp = function (a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); };

  KCAMP.stands = function (o) {
    var cell = o.cell == null ? KCAMP.WORK.cell : o.cell, minCap = o.minCap == null ? KCAMP.WORK.minCap : o.minCap, out = [];
    var y = o.yard, r = o.range, i0 = Math.floor((y[0] - r) / cell), i1 = Math.floor((y[0] + r) / cell), j0 = Math.floor((y[1] - r) / cell), j1 = Math.floor((y[1] + r) / cell);
    for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) {
      var x = (i + 0.5) * cell, z = (j + 0.5) * cell, d = Math.hypot(x - y[0], z - y[1]); if (d > r) continue;
      var cap = Math.floor(o.capacity(x, z, cell) || 0); if (cap < minCap) continue;
      out.push({id: o.id + ':stand:' + i + ':' + j, i: i, j: j, x: x, z: z, cap: cap, dYard: d});
    }
    return out;
  };

  KCAMP.workCamp = function (o) {
    var W = {id: o.id, world: o.world == null ? 0 : o.world, yard: o.yard.slice(), stands: o.stands.slice(), by: {}, cfg: Object.assign({}, KCAMP.WORK, o.cfg || {}),
      log: [], cur: null, last: {}};
    W.stands.forEach(function (s) { W.by[s.id] = s; });
    return W;
  };

  KCAMP.workReplay = function (W) {
    W.cur = null; W.last = {};
    W.log.forEach(function (op) {
      if (op.op === 'pitch') W.cur = {stand: op.stand, start: op.day, left0: op.left, visit: op.visit};
      else if (op.op === 'strike' && W.cur) { W.last[op.stand] = {start: W.cur.start, end: op.day, left0: W.cur.left0, taken: op.taken}; W.cur = null; }
    });
    return W;
  };

  KCAMP.workLeft = function (W, s, day, taken) {
    var S = W.by[s]; if (!S) return 0;
    if (W.cur && W.cur.stand === s) return Math.max(0, W.cur.left0 - (taken || 0));
    var L = W.last[s]; if (!L) return S.cap;
    var back = S.cap * Math.max(0, day - L.end) / cfgOf(W).regrowDays;
    return Math.min(S.cap, Math.max(0, L.left0 - L.taken) + back);
  };

  KCAMP.workDue = function (W, left) {
    var S = W.cur && W.by[W.cur.stand]; return !!S && left <= cfgOf(W).strikeAt * S.cap;
  };

  KCAMP.workNext = function (W, day, from, not) {
    var C = cfgOf(W), here = W.cur ? W.cur.stand : not == null ? null : not, visit = W.log.filter(function (op) { return op.op === 'pitch'; }).length;
    var rows = W.stands.filter(function (S) { return S.id !== here; }).map(function (S) {
      var left = KCAMP.workLeft(W, S.id, day);
      return {S: S, left: left, ready: left >= C.ready * S.cap - 1e-9, score: left / (1 + S.dYard / C.haulScale) / (1 + hyp([S.x, S.z], from) / C.moveScale),
        tie: KRAND.hash(W.world, 4019, visit, S.i, S.j)};
    }).filter(function (q) { return q.left > C.strikeAt * q.S.cap; });
    if (!rows.length) return null;
    var pool = rows.filter(function (q) { return q.ready; }); if (!pool.length) pool = rows;   /* nothing grown back: the most regrown */
    pool.sort(function (a, b) { return b.score - a.score || a.tie - b.tie; });
    return pool[0];
  };

  KCAMP.workStart = function (W, day) {
    var q = KCAMP.workNext(W, day, W.yard); if (!q) return null;
    var op = {op: 'pitch', day: day, stand: q.S.id, left: q.left, x: q.S.x, z: q.S.z, visit: 0};
    W.log.push(op); W.cur = {stand: op.stand, start: day, left0: op.left, visit: 0};
    return op;
  };

  KCAMP.workMove = function (W, day, taken) {
    if (!W.cur) return null;
    var C = cfgOf(W), S0 = W.by[W.cur.stand], visit = W.cur.visit + 1;
    var strike = {op: 'strike', day: day, stand: S0.id, taken: Math.max(0, taken || 0)};
    W.log.push(strike); W.last[S0.id] = {start: W.cur.start, end: day, left0: W.cur.left0, taken: strike.taken}; W.cur = null;
    var q = KCAMP.workNext(W, day, [S0.x, S0.z], S0.id);   /* never back where it just struck, even having taken nothing */
    if (!q) return {strike: strike, march: null, pitch: null};   /* the range is worked out: the crew goes home */
    var d0 = day + C.strikeHours / 24, d1 = d0 + hyp([S0.x, S0.z], [q.S.x, q.S.z]) * C.detour / (C.marchKmh * 1000) / 24, d2 = d1 + C.pitchHours / 24;
    var march = {op: 'march', day: d0, until: d1, from: S0.id, to: q.S.id, x0: S0.x, z0: S0.z, x1: q.S.x, z1: q.S.z};
    var left = KCAMP.workLeft(W, q.S.id, d2);
    var pitch = {op: 'pitch', day: d2, stand: q.S.id, left: left, x: q.S.x, z: q.S.z, visit: visit};
    W.log.push(march, pitch); W.cur = {stand: q.S.id, start: d2, left0: left, visit: visit};
    return {strike: strike, march: march, pitch: pitch};
  };

  KCAMP.workAt = function (W, day) {
    var L = W.log, k = -1;
    for (var i = 0; i < L.length; i++) if (L[i].day <= day) k = i; else break;
    if (k < 0) return null;
    var op = L[k], S;
    if (op.op === 'pitch') { S = W.by[op.stand]; return {state: 'pitched', stand: op.stand, x: S.x, z: S.z}; }
    if (op.op === 'strike') { S = W.by[op.stand]; return {state: 'striking', stand: op.stand, x: S.x, z: S.z}; }
    if (op.op === 'march') {
      if (day >= op.until) return {state: 'pitching', stand: op.to, x: op.x1, z: op.z1};
      var f = op.until > op.day ? (day - op.day) / (op.until - op.day) : 1;
      return {state: 'marching', stand: null, from: op.from, to: op.to, x: op.x0 + (op.x1 - op.x0) * f, z: op.z0 + (op.z1 - op.z0) * f};
    }
    return null;
  };

  KCAMP.workTree = function (W, s, k, n, day, taken) {
    var S = W.by[s], C = cfgOf(W); if (!S || !(k >= 0 && k < n)) return null;
    var V = null;
    if (W.cur && W.cur.stand === s && day >= W.cur.start) V = {start: W.cur.start, end: day, taken: taken || 0};
    else if (W.last[s]) V = W.last[s];
    if (!V || !(V.taken > 0)) return null;
    var kv = Math.min(n, Math.floor(n * V.taken / S.cap)); if (k >= kv) return null;
    var at = V.start + (V.end - V.start) * (k + 0.5) / kv, ph = day - at;   /* felled in order through the visit */
    if (ph < 0) return null;
    if (ph < C.stumpDays) return 'gone';
    if (ph < C.regrowDays) return 'young';
    return null;
  };

  KCAMP.workYield = function (W) {
    var C = cfgOf(W), n = 0; W.stands.forEach(function (S) { n += S.cap * (1 - C.strikeAt); }); return n / C.regrowDays;
  };
})();
