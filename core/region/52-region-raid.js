/* ==================== core/region 52: raids on the valley host (Z4) [G data] ==================== */
/* core/simulation/PROPOSAL-LIZARDMEN.md step Z4 (the owner, 2026-11-17: "next step, implement raiding"); the rules are
   core/camp's (core/camp/PLAN.md section 6.1; core/camp/55-camp-raid.js KCAMP.raid*). OPT-IN: inert unless the valley spec
   has `raids`; every other tune runs exactly as before.
     V.raids = {faction, season (days between the raiding seasons' turns: 91.25), budget (raids a season, the faction's),
       kmDay (a war band's day: 25), supplyDays (the food it carries: 20), cooldown (days before a target is raided again: 60),
       fatigue (days a beaten party waits beyond its cooldown: 45), want: [goods the raiders carry off], floorDays (14: the
       staples a target keeps), dead: {good: kg a body} (the dead of both sides go to the raiders' bone hall: LORE 6.20),
       caps (false: the negative, no caps), aid: {after, garrison, days} (a target raided `after` times in a year gets a
       garrison grant from its polity), punitive: {after, window} (a polity raided `after` times in `window` days mounts a
       punitive expedition: recorded),
       parties: [{id, from (a settlement), warriors, arms, mounts, morale, store (the work its plunder lands in)}],
       targets: [{id, name, faction, people, garrison, militia, walls, x?, z?, stock? {good: kg} (an off-map target's movable
         stock, restocked toward it each day by `restock` of the gap), restock}]}
     A target that is a settlement of the valley (its id in V.settlements: the joint run, Z5) is raided in its own books:
     the take comes out of its warehouses (booked exported), its stock is what it holds. An off-map target (the Lizardmen's run
     alone) is a record: its take is booked imported where it lands, from abroad (the ledger's abroadIn).
   THE LIFE OF A RAID (core/camp/PLAN.md section 6): at each raiding turn the faction spends its budget; a party whose cooldown
   and fatigue are past chooses its target (KCAMP.raidChoose: a target another party has set out for counts as raided; wealth
   weighs by its logarithm, so a granary does not draw every raid), takes its provisions from home (booked used), marches
   (`km / kmDay` days), resolves the assault (KCAMP.raidOutcome on its strength and the target's defence, a hash of the raid's
   id: no draws), takes within the caps (KCAMP.raidTake, KCAMP.raidDead), marches home and lands the plunder and the dead in its
   store. A target's standing falls with its losses and recovers each day (KCAMP.raidRecover); a fort's `state` goes damaged on a
   success and ruined on a sack, and is repaired after a season. RECORDS by id (in S.raiding: S.raids is a road's cargo raids, 50's W5): S.raiding.expeditions [{id, faction, from, target, warriors, km, leave, arrive, back, band, before, take, dead, lost,
   bands {party: {morale, next}}}], S.raiding.raids [{id, party, from, target, turn,
   leave, arrive, back, warriors, band, ratio, before {stock, people, floor}, take, dead, lost, landed}], S.raiding.events [{minute, kind, raid, target, faction,
   ...}], S.raiding.targets {id: {standing, people, base, state, last, hits, aid}}; H.raidReport(). */
KREGION.part('52-region-raid', function (H) {
var base = H.simValley;
H.simValley = function (V) {
  var S = base(V);
  if (V.raids) H.raidInit(V, S);
  return S;
};
var hash = function (s) { var h = 2166136261, i; for (i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0; return h; };
H.raidInit = function (V, S) {
  var RV = V.raids, D = function (x, d) { return x == null ? d : x; }, m0 = S.clock.m;
  var RS = S.raiding = { raids: [], events: [], targets: {}, parties: {}, turns: 0 };
  var spec = {}; V.settlements.forEach(function (Sd) { spec[Sd.id] = Sd; });
  var want = RV.want || ['tools', 'arms', 'goldwork', 'grain'];
  var stockOf = function (t) { var n = {}; if (spec[t.id]) SIM.withEcon(t.id, function () { want.forEach(function (g) { var k = SIM.stockOf(g); if (k > 0) n[g] = k; }); });
    else Object.keys(t.stock).forEach(function (g) { if (want.indexOf(g) >= 0 && t.stock[g] > 0) n[g] = t.stock[g]; }); return n; };
  var sum = function (o) { var n = 0; Object.keys(o).forEach(function (g) { n += o[g]; }); return n; };
  (RV.targets || []).forEach(function (T0) {
    var Sd = spec[T0.id], p = Sd ? { x: Sd.x, z: Sd.z } : { x: T0.x, z: T0.z };
    var t = RS.targets[T0.id] = { id: T0.id, name: T0.name || (Sd && Sd.name), faction: T0.faction || (Sd && Sd.faction), x: p.x, z: p.z, inValley: !!Sd,
      people: D(T0.people, Sd ? Sd.people : 0), garrison: D(T0.garrison, 0), militia: T0.militia, walls: T0.walls, state: D(T0.state, Sd ? Sd.state : null),
      stock: Sd ? null : Object.assign({}, T0.stock || {}), restock: D(T0.restock, 0.02), hits: [], aid: 0, aidUntil: 0, last: null, stance: 'hostile' };
    t.base = { people: t.people, stock: sum(stockOf(t)) || 1, stocks: t.stock ? Object.assign({}, t.stock) : null };
    t.standing = KCAMP.raidStanding({ people: t.people, base: t.base, stock: t.base.stock });
  });
  (RV.parties || []).forEach(function (Pt) { RS.parties[Pt.id] = Object.assign({ next: m0, raids: 0, lost: 0 }, Pt); });
  var event = function (kind, o) { var e = Object.assign({ minute: S.clock.m, kind: kind }, o); RS.events.push(e); if (SIM.logEvent) SIM.logEvent('raid ' + kind, o); return e; };
  var floorOf = function (t) { var f = {}, Sd = spec[t.id]; if (!Sd) return f; Object.keys(Sd.eats || {}).forEach(function (g) { f[g] = Sd.people * Sd.eats[g] * D(RV.floorDays, 14); }); return f; };
  var take = function (sett, g, n, book) { var got = 0; SIM.withEcon(sett, function () { got = SIM.economyTake(g, Math.floor(n)); if (got > 0) SIM.economyBook(book, g, got); }); return got; };
  var land = function (sett, g, n, store) { if (n <= 0) return; SIM.withEcon(sett, function () { var w = store && spec[sett].works.some(function (x) { return x.id === store; }) ? store : spec[sett].works[0].id;
    SIM.economyLand(g, n, w); SIM.economyBook('imported', g, n); }); };
  /* a punitive expedition (core/camp/PLAN.md section 6.3, the natural brake): the polity's force marches on the raiding town
     that set it off, under the same rules and caps (KCAMP.raidOutcome, raidTake, raidDead); without a force for that polity in
     RV.punitive.forces it is only recorded, as before */
  var PN0 = RV.punitive || {}; RS.expeditions = [];
  var muster = function (faction, town, from, hits, minute) {   /* called when the polity has had enough; it marches when the war band is out */
    var F = (PN0.forces || {})[faction];
    if (!F || !spec[town]) { event('punitive', { faction: faction, against: RV.faction, from: from, raids: hits, marched: false }); return; }
    var at = spec[F.from] ? { x: spec[F.from].x, z: spec[F.from].z } : { x: F.x, z: F.z }, km = Math.hypot(spec[town].x - at.x, spec[town].z - at.z) / 1000, days = km / D(F.kmDay, 20);
    if (spec[F.from]) take(F.from, 'grain', F.warriors * 0.6 * days * 2, 'used');   /* its provisions, from home: 0.6 kg of grain a man a day */
    var E = { id: 'punitive.' + RS.expeditions.length, faction: faction, from: F.from, target: town, warriors: F.warriors, arms: D(F.arms, 1), mounts: D(F.mounts, 1), morale: D(F.morale, 1),
      km: +km.toFixed(1), days: days, called: minute, leave: null, arrive: Infinity, back: Infinity, band: null, take: {}, dead: 0, lost: 0, landed: false, raids: hits };
    RS.expeditions.push(E);
    event('punitive', { faction: faction, against: RV.faction, from: from, raids: hits, marched: true, expedition: E.id, target: town, warriors: E.warriors, km: E.km });
  };
  Object.keys(RS.parties).forEach(function (pid) { RS.parties[pid].morale0 = D(RS.parties[pid].morale, 1); });
  var every = D(RV.season, 91.25) * 1440, next = m0 + 60, ri = 0;
  var dayNext = m0 + 1440;
  SIM.stepHooks.push(function (minute) {
    /* a day: the targets recover (people, an off-map stock), a damaged fort is repaired after a season, a grant runs out */
    while (minute >= dayNext) { dayNext += 1440;
      Object.keys(RS.targets).forEach(function (id) { var t = RS.targets[id];
        if (t.stock && t.base.stocks) Object.keys(t.base.stocks).forEach(function (g) { t.stock[g] = (t.stock[g] || 0) + (t.base.stocks[g] - (t.stock[g] || 0)) * t.restock; });
        var st = { people: t.people, base: t.base, stock: sum(stockOf(t)), recover: t.recover }; KCAMP.raidRecover(st, 1); t.people = st.people; t.standing = st.standing;
        if (t.state && t.state !== 'kept' && t.last != null && minute - t.last > D(RV.season, 91.25) * 1440) { t.state = t.state === 'ruined' ? 'damaged' : 'kept'; if (spec[id]) spec[id].state = t.state; event('repaired', { target: id, state: t.state }); }
        if (t.aid && minute > t.aidUntil) { t.aid = 0; event('aid ends', { target: id }); } });
      /* a beaten band's morale comes back by a share a day */
      Object.keys(RS.parties).forEach(function (pid) { var Pt = RS.parties[pid]; if (Pt.morale < Pt.morale0) Pt.morale = Math.min(Pt.morale0, Pt.morale + (Pt.morale0 - Pt.morale) * D(PN0.moraleBack, 0.02)); }); }
    /* the raiding turn: the faction spends its budget */
    if (minute >= next) { next += every; RS.turns++; var spent = 0;
      Object.keys(RS.parties).sort().forEach(function (pid) { var Pt = RS.parties[pid];
        if (spent >= D(RV.budget, 2) || minute < Pt.next) return;
        var home = spec[Pt.from], cand = Object.keys(RS.targets).sort().map(function (id) { var t = RS.targets[id]; return { id: id, x: t.x, z: t.z, wealth: Math.log(2 + sum(stockOf(t)) / 1000), standing: t.standing, last: Math.max(t.last == null ? -1e12 : t.last, t.claimed == null ? -1e12 : t.claimed), stance: t.stance }; });
        var ch = KCAMP.raidChoose({ from: { x: home.x, z: home.z }, targets: cand, now: minute, cooldown: D(RV.cooldown, 60), kmDay: D(RV.kmDay, 25), supplyDays: D(RV.supplyDays, 20) });
        if (!ch) return;
        var days = ch.km / D(RV.kmDay, 25), prov = {};
        Object.keys(home.eats || {}).forEach(function (g) { if (g === 'grain' || g === 'meat_hide' || g === 'fish' || g === 'produce') prov[g] = take(Pt.from, g, Pt.warriors * home.eats[g] * days * 2, 'used'); });
        var r = { id: 'raid.' + (ri++), party: pid, from: Pt.from, target: ch.id, turn: RS.turns, leave: minute, arrive: minute + Math.ceil(days * 1440), back: minute + Math.ceil(2 * days * 1440),
          warriors: Pt.warriors, km: ch.km, provisions: prov, band: null, take: {}, dead: 0, lost: 0, landed: false };
        RS.targets[ch.id].claimed = minute; RS.raids.push(r); Pt.raids++; Pt.next = r.back + D(RV.cooldown, 60) * 1440 / 2; spent++;
        event('muster', { raid: r.id, from: Pt.from, target: ch.id, warriors: Pt.warriors, km: ch.km }); });
    }
    /* an assault: the raid reaches its target */
    RS.raids.forEach(function (r) { if (r.band || minute < r.arrive) return;
      var t = RS.targets[r.target], Pt = RS.parties[r.party];
      var out = KCAMP.raidOutcome({ warriors: r.warriors, arms: Pt.arms, mounts: Pt.mounts, morale: Pt.morale }, { people: t.people, garrison: t.garrison, aid: t.aid, militia: t.militia, walls: t.walls, standing: t.standing }, hash(r.id + '|' + r.target));
      var st = stockOf(t); r.before = { stock: Object.assign({}, st), people: t.people, floor: floorOf(t) }; var loot = KCAMP.raidTake(st, { take: out.take, want: want, floor: floorOf(t), cap: RV.caps === false ? false : undefined });
      Object.keys(loot).forEach(function (g) { var n = loot[g]; if (t.inValley) n = take(t.id, g, n, 'exported'); else { n = Math.min(n, t.stock[g] || 0); t.stock[g] -= n; } r.take[g] = n; });
      r.band = out.band; r.ratio = out.ratio; r.dead = KCAMP.raidDead(t.people, out.band, { cap: RV.caps === false ? false : undefined }); r.lost = Math.round(r.warriors * out.raidLoss);
      t.people = Math.max(0, t.people - r.dead); t.last = minute; t.hits.push(minute);
      if (out.band === 'success' && t.state === 'kept') t.state = 'damaged'; if (out.band === 'sack' && t.state) t.state = 'ruined';
      if (t.inValley && t.state) spec[t.id].state = t.state;
      t.standing = KCAMP.raidStanding({ people: t.people, base: t.base, stock: sum(stockOf(t)) }); t.minStanding = Math.min(t.minStanding == null ? 1 : t.minStanding, t.standing);
      if (out.band === 'repulsed') Pt.next = Math.max(Pt.next, r.back + D(RV.fatigue, 45) * 1440);
      Pt.lost += r.lost;
      event('assault', { raid: r.id, from: r.from, target: t.id, faction: t.faction, band: out.band, ratio: out.ratio, take: Object.assign({}, r.take), dead: r.dead, lost: r.lost, state: t.state, standing: +t.standing.toFixed(3) });
      /* the polity's answer: a garrison grant for a town hit often; a punitive expedition for a polity hit too often (recorded) */
      var A = RV.aid; if (A) { var recent = t.hits.filter(function (m) { return minute - m < 365 * 1440; }).length;
        if (recent >= A.after && !t.aid) { t.aid = A.garrison; t.aidUntil = minute + A.days * 1440; event('aid', { target: t.id, faction: t.faction, garrison: A.garrison, days: A.days }); } }
      var PN = RV.punitive; if (PN) { var hit = RS.events.filter(function (e) { return e.kind === 'assault' && e.faction === t.faction && minute - e.minute < PN.window * 1440; }).length;
        if (hit >= PN.after && !RS.events.some(function (e) { return e.kind === 'punitive' && e.faction === t.faction && minute - e.minute < D(PN.cooldown, PN.window) * 1440; })) muster(t.faction, r.from, t.id, hit, minute); }
    });
    /* an expedition waits at its muster for the town's war band to be out (its scouts watch for it; RV.punitive.wait days at
       most, 0 by default: it marches at once) */
    RS.expeditions.forEach(function (E) { if (E.leave != null) return;
      var out = Object.keys(RS.parties).some(function (pid) { return RS.parties[pid].from === E.target && RS.raids.some(function (r) { return r.party === pid && !r.landed && minute >= r.leave; }); });
      if (!out && minute - E.called < D(PN0.wait, 0) * 1440) return;
      E.leave = minute; E.arrive = minute + Math.ceil(E.days * 1440); E.back = minute + Math.ceil(2 * E.days * 1440); E.bandOut = out;
      event('punitive march', { expedition: E.id, faction: E.faction, target: E.target, bandOut: out, waited: Math.round((minute - E.called) / 1440) }); });
    /* a punitive expedition reaches the raiders' town: the town's garrison and any war band at home stand against it */
    RS.expeditions.forEach(function (E) { if (E.band || minute < E.arrive) return;
      var Sd = spec[E.target], H0 = (PN0.home || {})[E.target] || {}, home = Object.keys(RS.parties).filter(function (pid) { var Pt = RS.parties[pid];
        return Pt.from === E.target && !RS.raids.some(function (r) { return r.party === pid && !r.landed && minute >= r.leave; }); });
      var gar = D(H0.garrison, 0) + home.reduce(function (n, pid) { var Pt = RS.parties[pid]; return n + Pt.warriors * D(Pt.arms, 1) / 3; }, 0);
      var def = { people: Sd.people, militia: D(H0.militia, 0.05), garrison: gar, walls: D(H0.walls, 1), standing: 1 };
      var out = KCAMP.raidOutcome({ warriors: E.warriors, arms: E.arms, mounts: E.mounts, morale: E.morale }, def, hash(E.id + '|' + E.target));
      var st = {}; SIM.withEcon(E.target, function () { (PN0.want || want).forEach(function (g) { var k = SIM.stockOf(g); if (k > 0) st[g] = k; }); });
      var fl = {}; Object.keys(Sd.eats || {}).forEach(function (g) { fl[g] = Sd.people * Sd.eats[g] * D(RV.floorDays, 14); });
      E.before = { stock: Object.assign({}, st), people: Sd.people, floor: fl, defenders: home.slice(), garrison: Math.round(gar) };
      var loot = KCAMP.raidTake(st, { take: out.take, want: PN0.want || want, floor: fl, cap: RV.caps === false ? false : undefined });
      Object.keys(loot).forEach(function (g) { E.take[g] = take(E.target, g, loot[g], 'exported'); });
      E.band = out.band; E.ratio = out.ratio; E.dead = KCAMP.raidDead(Sd.people, out.band, { cap: RV.caps === false ? false : undefined }); E.lost = Math.round(E.warriors * out.raidLoss);
      /* the raiders pay: their bands' morale falls and they stay home to guard (a repulsed expedition costs them nothing) */
      Object.keys(RS.parties).forEach(function (pid) { var Pt = RS.parties[pid]; if (Pt.from !== E.target || out.band === 'repulsed') return;
        Pt.morale = Math.max(D(PN0.moraleFloor, 0.7) * Pt.morale0, Pt.morale * (out.band === 'skirmish' ? 0.93 : 0.82)); Pt.next = Math.max(Pt.next, minute + D(RV.fatigue, 45) * 1440);
        (E.bands || (E.bands = {}))[pid] = { morale: +Pt.morale.toFixed(3), next: Pt.next }; });
      /* the dead of both sides are the town's (the bone hall: LORE 6.20) */
      Object.keys(RV.dead || {}).forEach(function (g) { land(E.target, g, (E.dead + E.lost) * RV.dead[g], null); });
      event('punitive assault', { expedition: E.id, faction: E.faction, target: E.target, band: out.band, ratio: out.ratio, take: Object.assign({}, E.take), dead: E.dead, lost: E.lost, garrison: Math.round(gar), bandsHome: home.length }); });
    /* the expedition home: what it took back lands in its own settlement (off the map, it was booked out at the town and is gone) */
    RS.expeditions.forEach(function (E) { if (E.landed || !E.band || minute < E.back) return; E.landed = true;
      if (spec[E.from]) Object.keys(E.take).forEach(function (g) { land(E.from, g, E.take[g], null); });
      event('punitive home', { expedition: E.id, faction: E.faction, from: E.from, take: Object.assign({}, E.take), lost: E.lost }); });
    /* home: the plunder and the dead land in the party's store */
    RS.raids.forEach(function (r) { if (r.landed || !r.band || minute < r.back) return; r.landed = true; var Pt = RS.parties[r.party];
      Object.keys(r.take).forEach(function (g) { land(r.from, g, r.take[g], Pt.store); });
      Object.keys(RV.dead || {}).forEach(function (g) { land(r.from, g, (r.dead + r.lost) * RV.dead[g], Pt.store); });
      event('home', { raid: r.id, from: r.from, take: Object.assign({}, r.take), bodies: r.dead + r.lost }); });
  });
};
H.raidReport = function () {
  var RS = H.SIM && H.SIM.raiding; if (!RS) return null;
  var by = {}; RS.raids.forEach(function (r) { if (r.band) by[r.band] = (by[r.band] || 0) + 1; });
  return { raids: RS.raids.length, bands: by, events: RS.events.length, targets: Object.keys(RS.targets).map(function (id) { var t = RS.targets[id]; return { id: id, standing: +t.standing.toFixed(3), minStanding: +(t.minStanding == null ? 1 : t.minStanding).toFixed(3), people: Math.round(t.people), state: t.state, hits: t.hits.length }; }) };
};
});
