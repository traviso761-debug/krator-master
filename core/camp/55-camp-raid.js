/* ==================== core/camp 55: raids at the record and abstract levels (plain data, [G data]) ==================== */
/* core/camp/PLAN.md section 6.1 (the owner's rules, 2026-10-26), first built for the Lizardmen's raids on the Marches
   (core/simulation/PROPOSAL-LIZARDMEN.md step Z4; the owner, 2026-11-17: "next step, implement raiding"). Pure functions of
   the two sides' numbers and a hash (KRAND.hash): no draws, no three.js, no DOM. A host (core/region/52-region-raid.js on the
   valley host) keeps the records and calls these:
     KCAMP.RAID                      the defaults: the caps, the outcome bands, the losses, the standing's floor and recovery
     KCAMP.raidStrength(r)           warriors x arms x mounts x morale (r: {warriors, arms (1), mounts (1), morale (1)})
     KCAMP.raidDefence(t)            the target's militia (a share of its people), its garrison, its walls and its allies:
                                     (people x militia + garrison x 3) x walls x (1 + allies) (t: {people, militia (0.08),
                                     garrison (0), walls (1: none; 1.6 a palisade; 2.5 a fort), allies (0), aid (0: a grant's
                                     extra garrison)})
     KCAMP.raidOutcome(r, t, h)      {band: 'repulsed'|'skirmish'|'success'|'sack', ratio, roll, raidLoss, targetLoss, take}:
                                     the ratio of strength to defence, times a roll in [0.7, 1.3) from the hash h, picks the band;
                                     'sack' only when the target's standing is under the broken threshold (rule 3)
     KCAMP.raidTake(stock, o)        what a raid carries off: {good: n}, each good at most `take` x cap (rule 2: default 15 % of
                                     the movable stock), never a staple below its floor (o.floor: {good: n} held back: 14 days
                                     of food), only the goods the raiders want (o.want); o.cap false is the negative (no cap)
     KCAMP.raidDead(people, band, o) the target's dead, at most popCap (2 %) of its people (rule 2)
     KCAMP.raidStanding(t)           the target's strength over its baseline (rule 1): its people's and garrison's share left
                                     and its stock's, weighted; KCAMP.raidRecover(t, days) recovers it by `recover` a week
     KCAMP.raidChoose(o)             the best target for a raiding party: hostile, within the column's supply (days of food), not
                                     in its cooldown, by wealth x weakness / distance; null when none (o: {from {x, z}, targets
                                     [{id, x, z, wealth, standing, last}], now (minutes), cooldown (days), kmDay, supplyDays})
   The balance (rules 1-3): caps per raid and a recovering standing keep a raided town above about 0.7; only something else
   (the player, a war, a famine) brings it to the broken threshold 0.4, and only then can it be sacked. */
(function () {
  'use strict';
  var K = (typeof KCAMP !== 'undefined') ? KCAMP : (typeof window !== 'undefined' ? (window.KCAMP = window.KCAMP || {}) : (globalThis.KCAMP = globalThis.KCAMP || {}));
  var D = function (x, d) { return x == null ? d : x; };
  K.RAID = {
    cap: 0.15, popCap: 0.02, floorDays: 14, broken: 0.4, recover: 0.05, cooldown: 60,
    bands: [[0.8, 'repulsed'], [1.4, 'skirmish'], [Infinity, 'success']],   /* the jittered ratio under each bound */
    raidLoss: { repulsed: [0.1, 0.3], skirmish: [0.03, 0.08], success: [0.01, 0.04], sack: [0.0, 0.02] },
    targetLoss: { repulsed: 0.1, skirmish: 0.35, success: 1, sack: 1 },     /* a share of popCap */
    take: { repulsed: 0, skirmish: 0.25, success: 1, sack: 2 },             /* a share of cap; a sack doubles it */
    standingW: { people: 0.6, stock: 0.4 }
  };
  var R = K.RAID;
  var unit = function (h) { return ((h >>> 0) % 100000) / 100000; };
  K.raidStrength = function (r) { return Math.max(0, D(r.warriors, 0)) * D(r.arms, 1) * D(r.mounts, 1) * D(r.morale, 1); };
  K.raidDefence = function (t) {
    return Math.max(1, (D(t.people, 0) * D(t.militia, 0.08) + (D(t.garrison, 0) + D(t.aid, 0)) * 3) * D(t.walls, 1) * (1 + D(t.allies, 0)));
  };
  K.raidOutcome = function (r, t, h, o) {
    o = o || {};
    var T = Object.assign({}, R, o), roll = 0.7 + 0.6 * unit(h), ratio = K.raidStrength(r) / K.raidDefence(t), q = ratio * roll, band = 'success', i;
    for (i = 0; i < T.bands.length; i++) if (q < T.bands[i][0]) { band = T.bands[i][1]; break; }
    if (band === 'success' && D(t.standing, 1) < T.broken && q >= 2) band = 'sack';   /* rule 3: only a broken town is sacked */
    var lr = T.raidLoss[band], h2 = unit(Math.imul(h ^ 0x5bd1e995, 2654435761) >>> 0);
    return { band: band, ratio: +ratio.toFixed(3), roll: +roll.toFixed(3), raidLoss: lr[0] + (lr[1] - lr[0]) * h2, targetLoss: T.targetLoss[band], take: T.take[band] };
  };
  K.raidTake = function (stock, o) {
    o = o || {};
    var cap = o.cap === false ? 1 : D(o.capShare, R.cap) * D(o.take, 1), out = {}, want = o.want || Object.keys(stock);
    want.forEach(function (g) {
      var have = stock[g] || 0, floor = (o.floor || {})[g] || 0, n = Math.floor(Math.min(have * Math.min(1, cap), o.cap === false ? have : Math.max(0, have - floor)));
      if (n > 0) out[g] = n;
    });
    return out;
  };
  K.raidDead = function (people, band, o) {
    o = o || {};
    var share = o.cap === false ? 0.2 : D(o.popCap, R.popCap);
    return Math.floor(D(people, 0) * share * D(R.targetLoss[band], 0));
  };
  K.raidStanding = function (t) {
    var w = R.standingW, bp = t.base && t.base.people, bs = t.base && t.base.stock,
      p = bp ? D(t.people, 0) / bp : 1, s = bs ? Math.min(1.2, D(t.stock, 0) / bs) : 1;
    return Math.max(0, Math.min(1.2, w.people * p + w.stock * s));
  };
  K.raidRecover = function (t, days) {
    var k = D(t.recover, R.recover) * days / 7;
    if (t.base) { t.people = Math.min(t.base.people, D(t.people, 0) + (t.base.people - D(t.people, 0)) * Math.min(1, k)); }
    t.standing = K.raidStanding(t);
    return t.standing;
  };
  K.raidChoose = function (o) {
    var best = null, now = D(o.now, 0), cd = D(o.cooldown, R.cooldown) * 1440, reach = D(o.kmDay, 25) * D(o.supplyDays, 20) / 2;
    (o.targets || []).forEach(function (t) {
      if (t.stance && t.stance !== 'hostile' && t.stance !== 'wary') return;
      if (t.last != null && now - t.last < cd) return;
      var km = Math.hypot(t.x - o.from.x, t.z - o.from.z) / 1000; if (km > reach) return;
      var score = D(t.wealth, 1) * (1.4 - Math.min(1.2, D(t.standing, 1))) / (10 + km);
      if (!best || score > best.score || (score === best.score && t.id < best.t.id)) best = { t: t, km: km, score: score };
    });
    return best ? { id: best.t.id, km: +best.km.toFixed(1), score: best.score } : null;
  };
})();
