/* ==================== core/camp 66: raids and their balance caps (C7; S6) [G data] ==================== */
/* core/camp/PLAN.md section 6.1; core/simulation/PROPOSAL-LONGSONG-PINNACLE.md phase S6 (the owner, 2026-11-11: the bands
   raid Iziz's nearby port Goto, or go south to Nusidi). A raiding venture marches to its target, strikes it and comes back
   to its range with the spoils. Without the player, raids do not change who holds a region: the BALANCE RULES:
     1. standing: each target's strength over its baseline (1 whole), recovering `recover` a week toward 1;
     2. caps per raid: at most `stock` (15 %) of each movable good, never a staple below `floorDays` (14) of the target's
        own food; at most `people` (2 %) of its people killed; no building destroyed at this level;
     3. only a broken target (standing under `broken`, 0.4) can be sacked (half its movables); raids alone keep a target
        above ~0.7;
     4. budgets and fatigue: a faction's raids a season (`budget`), a cooldown per target (`cooldown` days); a repulse
        costs the faction morale (`fatigue`), which recovers by the week;
     5. retaliation: a target hit `retaliate` times in `window` days logs a punitive expedition (an op: C8's, not run here).
   THE RESOLUTION, a pure function of the two sides and a hash: strength = warriors x (1 + mountK x mounts a warrior) x
   morale; defence = the target's people x its militia share x (1 + walls) + its garrison, times its standing. Their ratio
   picks a band of outcomes: repulsed (the raiders lose 10-30 % of the warriors and mounts that went), skirmish (a little
   loot, a few dead), success (loot to the caps), sack (only a broken target). The spoils ride home in the band's stock
   (imported at the world level); the target's books export them through the host (`raid(target, goods)`), so the sim's
   ledger sees a raided load leave as it sees a sale.
     KCAMP.raids(spec) -> a venture kind for KCAMP.world's `ventures`, and spec.state the faction's books. spec {targets:
        {id: {militia, walls, garrison, food: {good: kg a person a day} (its staples), loot: [goods]}}, caps: {stock,
        people, floorDays, broken, budget, cooldown, recover, fatigue, mountK, retaliate, window}, warShare (of a band's
        adults who ride to a raid)}
     KCAMP.resolve(W, b, target, d, spec) -> {outcome, ratio, loot, killed, lost: {people, mounts}, standing}
   Deterministic: no draws but KCAMP.u(world, target, day, band, salt) (60: a hash with the strings named). */
KCAMP.RAID_CAPS = { stock: 0.15, people: 0.02, floorDays: 14, broken: 0.4, budget: 6, cooldown: 30, recover: 0.05, fatigue: 0.1, mountK: 1.5, retaliate: 4, window: 120, skirmish: 0.04 };
KCAMP.resolve = function (W, party, id, d, spec) {
  var C = Object.assign({}, KCAMP.RAID_CAPS, spec.caps || {}), Tg = spec.targets[id], St = spec.state, H = W.host, lead = party[0];
  var u = function (s) { return KCAMP.u(W.world, id, d, lead.id, s); };
  var rows = party.map(function (b) { var war = Math.max(1, Math.round(b.warriors == null ? b.people * ((spec.warShare==null?0.4:spec.warShare)) : b.warriors)), mk = b.mountKind;
    return { b: b, war: war, mk: mk, mounts: mk ? b.beasts[mk] || 0 : 0, room: KCAMP.packCap(W.beasts, b.beasts) }; });
  var war = 0, mounts = 0, room = 0; rows.forEach(function (r) { war += r.war; mounts += Math.min(r.mounts, r.war); room += r.room; });
  var morale = St.morale == null ? 1 : St.morale, strength = war * (1 + C.mountK * Math.min(1, mounts / war)) * morale;
  var people = H.people(id), standing = St.standing[id] == null ? 1 : St.standing[id];
  var defence = Math.max(1, (people * Tg.militia * (1 + (Tg.walls || 0)) + (Tg.garrison || 0)) * standing), r = strength / defence, h = u('roll');
  var outcome = r < 0.6 ? 'repulsed' : r < 1.2 ? (h < 0.5 ? 'repulsed' : 'skirmish') : r < 2 ? (h < 0.3 ? 'skirmish' : 'success') : 'success';
  if (outcome === 'success' && standing < C.broken && r >= 2) outcome = 'sack';
  var share = { repulsed: 0, skirmish: C.skirmish, success: C.stock, sack: 0.5 }[outcome], loot = {}, before = {};
  (Tg.loot || []).forEach(function (g) {
    var have = H.stock(id, g), n = have * share; before[g] = have;
    if (Tg.food && Tg.food[g] != null) n = Math.min(n, have - C.floorDays * people * Tg.food[g]);   /* never a staple below its floor */
    n = Math.floor(Math.min(n, room)); if (n > 0) { loot[g] = n; room -= n; } });
  var killed = Math.floor(people * ({ repulsed: 0.002, skirmish: 0.005, success: C.people, sack: 0.1 }[outcome]) * (0.5 + 0.5 * u('dead')));
  var lossK = { repulsed: 0.1 + 0.2 * u('loss'), skirmish: 0.02 + 0.03 * u('loss'), success: 0.01 + 0.02 * u('loss'), sack: 0.02 }[outcome];
  /* the books: the target's movables out through the host, the spoils shared by warriors; each band's dead and mounts lost */
  var got = Object.keys(loot).length ? H.raid(id, loot) : {}, lost = {};
  Object.keys(got).forEach(function (g) { St.raided[g] = (St.raided[g] || 0) + got[g]; });
  rows.forEach(function (R, i) { var b = R.b, mine = {};
    Object.keys(got).forEach(function (g) { mine[g] = i === rows.length - 1 ? got[g] - rows.slice(0, i).reduce(function (s, q) { return s + Math.floor(got[g] * q.war / war); }, 0) : Math.floor(got[g] * R.war / war); });
    KCAMP.bookIn(b, 'imported', mine);
    var lp = Math.round(R.war * lossK), lm = Math.round(R.mounts * lossK);
    b.people -= lp; if (b.warriors != null) b.warriors -= lp; if (R.mk) b.beasts[R.mk] = Math.max(0, R.mounts - lm);
    b.losses = b.losses || { people: 0, mounts: 0 }; b.losses.people += lp; b.losses.mounts += lm; lost[b.id] = { people: lp, mounts: lm, loot: mine }; });
  if (killed > 0 && H.kill) H.kill(id, killed);
  /* standing, morale, the cooldown, the budget, retaliation */
  var lootShare = 0; Object.keys(got).forEach(function (g) { if (before[g] > 0) lootShare = Math.max(lootShare, got[g] / before[g]); });
  St.standing[id] = Math.max(0, standing - 0.5 * lootShare - 5 * (people > 0 ? killed / people : 0));
  if (outcome === 'repulsed') St.morale = Math.max(0.5, morale - C.fatigue);
  (St.hits[id] = St.hits[id] || []).push(d); St.last[id] = d;
  var R0 = { day: d, bands: party.map(function (b) { return b.id; }), target: id, outcome: outcome, ratio: r, warriors: war, loot: got, before: before, killed: killed, people: people, lost: lost, standing: St.standing[id] };
  St.log.push(R0); KCAMP.op(W, d, lead.id, 'resolve', { target: id, bands: R0.bands, outcome: outcome, loot: got, killed: killed });
  var recent = St.hits[id].filter(function (x) { return x > d - C.window; }).length;
  if (recent >= C.retaliate) KCAMP.op(W, d, id, 'retaliate', { against: lead.id, hits: recent });
  return R0;
};KCAMP.raidSeason = function (W, d) { return Math.floor((d - (W.cal.home ? W.cal.home[1] : 0)) / W.cal.yearD); };
KCAMP.raids = function (spec) {
  var C = Object.assign({}, KCAMP.RAID_CAPS, spec.caps || {}), wait = spec.wait == null ? 6 : spec.wait;
  var St = spec.state = spec.state || { standing: {}, morale: 1, hits: {}, last: {}, used: {}, raided: {}, log: [], parties: {} };
  /* a party: the bands the culture's `assign` sends against one target together (A.party); each marches to the target
     and waits for the rest (the muster), and the party strikes when the last is in, or `wait` days after the first */
  function strike(W, P, d) { var bands = P.here.map(function (id) { return W.bands[id]; }); P.done = true;
    KCAMP.resolve(W, bands, P.target, d, spec);
    bands.forEach(function (b) { b.venture.waiting = false; KCAMP.march(W, b, KCAMP.returnTo(W, b), d, 'return'); }); }
  return {
    state: St,
    plan: function (W, b, d, A) { var Tg = spec.targets[A.to]; if (!Tg) return null;
      var pid = A.party || (A.to + ':' + d + ':' + b.id), P = St.parties[pid];
      if (!P) { if ((St.used[KCAMP.raidSeason(W, d)] || 0) >= C.budget) return null;
        var last = St.last[A.to]; if (last != null && d - last < C.cooldown) return null;
        P = St.parties[pid] = { id: pid, target: A.to, members: [], here: [], first: null, done: false };
        St.used[KCAMP.raidSeason(W, d)] = (St.used[KCAMP.raidSeason(W, d)] || 0) + 1; }
      if (P.done) return null;
      var F = KCAMP.fits(W, b, d, A.to, wait + 1); if (!F) return null;
      P.members.push(b.id);
      return { kind: 'raid', to: A.to, party: pid, busy: true, planned: F.there.planned }; },
    arrive: function (W, b, d, to) { var P = St.parties[b.venture.party]; if (!P || P.done) { KCAMP.march(W, b, KCAMP.returnTo(W, b), d, 'return'); return; }
      P.here.push(b.id); if (P.first == null) P.first = d; b.venture.waiting = true;
      if (P.here.length >= P.members.length) strike(W, P, d); },
    day: function (W, b, d) { var V = b.venture; if (!V || V.kind !== 'raid' || !V.waiting) return; var P = St.parties[V.party];
      if (P && !P.done && d - P.first >= wait) strike(W, P, d); },
    /* the week's recovery of every target's standing and of the raiders' morale */
    hook: function (W, d) { if (d % 7) return; Object.keys(spec.targets).forEach(function (id) { var s = St.standing[id] == null ? 1 : St.standing[id]; St.standing[id] = Math.min(1, s + C.recover); });
      St.morale = Math.min(1, (St.morale == null ? 1 : St.morale) + C.fatigue / 4); }
  };
};