/* ============================== 6f. HOST: WHAT THINGS HOLD (Voth's side) ============================== */
/* [web] The owner's 2026-10-14 brief (ROADMAP.md section 10, "what things hold, and the settlement's stocks"), so the
   economy's tuning can be seen. Since 2026-10-16 (ROADMAP.md section 10, step 6b) the contents in the inspector and the
   stocks panel (O) are core/host's (93-host-stocks.js, which was ported from this file and is the standard: the same
   words, colours and columns), over core/simulation (KHOST.simHolds(SIM): SIM.contents, SIM.stocks, SIM.holders,
   SIM.placeAt, SIM.whereIs). What stays here is what only Voth knows, handed to the host in 97-vc-host-take.js:
   - which simulation places a lot is (its buildings' units, VC.IX: 'ix.<unit>'), the host's idOf;
   - which furniture holds things (a chest, a barrel, a rack, a stall, a counter: the simulation keeps stock by place, not
     by piece, so a container shows its place's store), the host's containerOf;
   - VC.fmt, the numbers' format (56d's card). */
VC.STK = { byLot: null };
/* furniture that holds things (the catalog's types, and by name) */
VC.CONTAINER = { storage: 1, rack: 1, vessel: 1, stack: 1, shelf: 1, counter: 1, stall: 1, supply: 1, food: 1, drink: 1 };
VC.isContainer = function (key) {
  var F = (typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[key]) || {};
  return !!VC.CONTAINER[F.type] || /chest|barrel|crate|bin|sack|jar|amphora|cask|trunk|basket|cabinet|wardrobe|granary|silo|coffer|keg/.test(key) && F.type !== 'shrine';
};
VC.fmt = function (v) {
  if (v == null || !isFinite(v)) return '-';
  var a = Math.abs(v); return a >= 100 || v === Math.round(v) ? Math.round(v).toLocaleString('en-GB') : v.toFixed(1);
};
/* a lot's simulation places: its buildings' units (VC.IX), mapped once */
VC.lotPlaces = function (L) {
  var S = VC.STK;
  if (!S.byLot) { S.byLot = new Map(); (VC.IX && VC.IX.units || []).forEach(function (u) { if (u.lot == null || u.lot < 0 || !SIM.R.place['ix.' + u.i]) return; var Lr = PLAN.lots[u.lot]; if (!Lr) return; var a = S.byLot.get(Lr) || []; a.push('ix.' + u.i); S.byLot.set(Lr, a); }); }
  return S.byLot.get(L) || [];
};
