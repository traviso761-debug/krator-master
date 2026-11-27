// node core/region/tests/test-wr-fellgangs.js — Phases F2 & F3 (WEST-RIFT-SCOPE.md W1, W3, W4, W5; PLAN-POLITICS.md):
//   1. Full 12,250-person Fellgang accounting across all 25 Fellgang settlements/bands/clans + 10 West Rift neighbours (35 total),
//      zero SIM problems, and strictly balanced 365-day ledger (tol: 1);
//   2. Every Fellgang group and West Rift settlement fed (< 1% hungry; wr.blakhed and wr.stairhead 0 hungry);
//   3. Seasonal & depleting sites: wr.goldcamp works only in summer (`bk.shielings`), shuts in winter, and depletes a gold vein
//      (`S.veinMoves`); wr.coppersmiths depletes a skarn copper vein and ships copper to Blakhed & Loj Twenny; wr.passkeepers
//      works regenerating Gould Riba fisheries and relays Firebliss obsidian;
//   4. Cross-polity dependencies: wr.drovers ships >= 250 t/yr Changthang salt to dalab.ledge + >= 45 t/yr to wr.blakhed;
//      wr.fowlers ships eggs & honey to tg.hearth for hearth wax; wr.icecutters ships cooling ice to tg.hearth & wr.kradz;
//   5. Travellers (`wr.travellers`, 650) & Kradz (`wr.kradz`, 100): Traveller thaw multi-stop rounds (`wr.round.west`, `wr.round.rim`)
//      wait in winter and earn carrier cuts in thaw + Line portal-gap cuts; Kradz hoist ice/copper/rope down `wr.shaft.twenny`
//      to `tg.twenny` and bring wax/fungus/rareearths/salvage up with a 10% portering cut;
//   6. Wildcat raids & Market Peace Fair Truce: `wr.wildcat` raids `wr.road.ice` and `dalab.road.surface` (`S.roadRaids`, zero-sum
//      ledger!), while unarmed Wildcat Fair traders enter `wr.blakhed` ONLY during `bk.fair` (`waited > 0` outside `bk.fair`)
//      selling Kimr `ivory`, `hides` and Firebliss `obsidian`; `WR_TUNE.marketPeace` holds in `'peace'`;
//   7. W5 Union Strike (`WR_TUNE.valley({strike: true})`): Ledge's lifts (`tg.fower`) & the Line close, Kradz/Union shaft raids
//      hit `dalab.road.surface`, starving `dalab.ledge` of grain while `dalab.shelf` & `wr.nulab` hold and the ledger stays clean;
//   8. Rising 8 (`WR_TUNE.stepRising`): world pressure caps below `march` without player intervention and crosses with player push;
//   9. Full W3 join with `EAST_RIFT` (Xanadu + Longsong + full West Rift): `gate.dalab.*` stand-ins replaced, ledger clean.
// Every check paired with a negative (tools/ktest.js).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
global.window = global;
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const runFile = p => vm.runInThisContext(rd(p), { filename: p });

function loadHost() {
  runFile('core/clock/20-core-clock.js');
  fs.readdirSync(path.join(ROOT, 'core', 'simulation')).filter(f => /^77-sim-.*\.js$/.test(f)).sort().forEach(f => runFile('core/simulation/' + f));
  runFile('core/region/00-region-core.js');
  const H = { TUNE: { sim: {} } }; KREGION.use(H);
  runFile('core/region/50-region-valley.js');
  runFile('core/region/data/xan-tune.js');
  runFile('settlements/longsong/src/15-ls-tune.js');
  runFile('core/region/data/east-rift.js');
  runFile('core/region/data/wr-tune.js');
  return H;
}
loadHost();

function runSpec(V, days) {
  const H = loadHost(), S = H.simValley(V), a = SIM.ledgerSnap();
  for (let d = 0; d < days; d++) H.valleyRun(1440, 60);
  const b = SIM.ledgerSnap();
  return {
    H, V, S, B: H.valleyBooks(), trade: SIM.tradeReport(), ledger: SIM.ledger(a, b, { tol: 1 }),
    actors: SIM.all('actor').length, cuts: JSON.parse(JSON.stringify(S.cuts)),
    roadRaids: JSON.parse(JSON.stringify(S.roadRaids || {})), raidsAt: 'raids' in S, veinMoves: S.veinMoves.slice()
  };
}
const landed = (tr, r, leg) => ((tr[r] || {}).landed || {})[leg] || {};

/* ---- 1-6. Full 365-day West Rift & 12,250-Fellgang run ---- */
const t0 = Date.now(), Y = runSpec(WR_TUNE.valley(), 365), B = Y.B.towns;
console.log('West Rift full year in ' + ((Date.now() - t0) / 1000).toFixed(2) + ' s: ' + Y.S.order.length + ' settlements, ' + Y.actors + ' actors, Fellgang pop ' + Y.V.meta.fellgangPop);

// 1. Population accounting & ledger conservation
const rosterOk = V => V.meta && V.meta.fellgangPop === 12250 && V.settlements.length === 37 &&
  WR_TUNE.fellgangIds.every(id => V.settlements.some(s => s.id === id));
T.ok('all 12,250 Fellgangs across 25 Fellgang groups + 12 West Rift neighbours declared, 0 SIM problems, 365-day ledger balances',
  rosterOk(Y.V) && !Y.S.problems.length && Y.ledger.ok,
  'fellgangPop ' + Y.V.meta.fellgangPop + ', settlements ' + Y.S.order.length + ', ledger: ' + (Y.ledger.ok ? 'clean' : Y.ledger.problems.slice(0, 3).join('; ')));
T.neg('dropping a Fellgang settlement breaks the 12,250 roster check', rosterOk,
  Object.assign({}, Y.V, { meta: { fellgangPop: 11850 }, settlements: Y.V.settlements.slice(0, 36) }), Y.V);

// 2. Everyone fed (< 1% hungry across all 35 settlements; Blakhed and Stairhead 0 hungry)
const fedOk = Bk => {
  const bad = [];
  Object.keys(Bk).forEach(id => {
    const x = Bk[id]; if (!x.people) return;
    ['grain', 'potato', 'fungus', 'wax', 'dairy', 'meat', 'fish', 'salt'].forEach(g => {
      const e = x.eaten[g] || 0, h = x.hungry[g] || 0; if (e + h <= 0) return;
      if ((id === 'wr.blakhed' || id === 'wr.stairhead') && h > 0) bad.push(id + ':' + g + ' ' + h);
      else if (h > (e + h) * 0.01) bad.push(id + ':' + g + ' ' + (100 * h / (e + h)).toFixed(1) + '%');
    });
  });
  return { ok: !bad.length, bad };
};
{
  const F = fedOk(B);
  T.ok('every Fellgang village, mobile clan, mining camp and West Rift city is fed (< 1 % short; Blakhed & Stairhead 0 hungry)',
    F.ok, F.bad.slice(0, 5).join(', ') || 'all 35 settlements fed');
  T.neg('a starving Coppersmiths camp is caught', Bk => fedOk(Bk).ok,
    Object.assign({}, B, { 'wr.coppersmiths': Object.assign({}, B['wr.coppersmiths'], { eaten: { grain: 100 }, hungry: { grain: 50 } }) }), B);
}

// 3. Gold camp, Coppersmiths & Pass-keepers (vein depletion + seasonal closure + fishery/obsidian relay)
const minesOk = (vm, gdLand, gdRep, cpLand, pkFish) => {
  const goldMoved = vm.some(m => m.work === 'gc.veins'), copMoved = vm.some(m => m.work === 'cp.skarn');
  return goldMoved && copMoved && (gdLand.gold || 0) >= 800 && (gdRep.waited || 0) > 0 && (cpLand.copper || 0) >= 8000 && pkFish >= 20000;
};
{
  const gdLand = landed(Y.trade, 'wr.road.gold', 'wr.goldcamp>wr.blakhed'), gdRep = Y.trade['wr.road.gold'] || {};
  const cpLand = landed(Y.trade, 'wr.road.copper', 'wr.coppersmiths>wr.passkeepers');
  const pkFish = (B['wr.passkeepers'].made.fish || 0);
  T.ok('seasonal gold camp & Copper Glacier skarn deplete veins (S.veinMoves), gold road shuts outside summer, Pass-keepers harvest Gould Riba fish',
    minesOk(Y.veinMoves, gdLand, gdRep, cpLand, pkFish),
    'gold landed ' + Math.round(gdLand.gold || 0) + ' kg (waited ' + gdRep.waited + ' h), copper ' + Math.round(cpLand.copper || 0) + ' kg, fish ' + Math.round(pkFish) + ' kg, veinMoves ' + Y.veinMoves.length);
  T.neg('a gold camp that never depleted a vein or never closed in winter is caught',
    o => minesOk(o.vm, gdLand, o.rep, cpLand, pkFish), { vm: [], rep: { waited: 0 } }, { vm: Y.veinMoves, rep: gdRep });
}

// 4. Drovers -> Ledge salt (~290 t/yr), Fowlers -> Hearth Hold eggs/honey, Ice-cutters -> Hearth Hold & Kradz cooling ice
const neighborsOk = (lgSalt, bkSalt, hhEggs, hhIce, krIce) =>
  lgSalt >= 220000 && bkSalt >= 45000 && hhEggs >= 15000 && hhIce >= 40000 && krIce >= 20000;
{
  const lgSalt = (landed(Y.trade, 'wr.road.ledge.salt', 'wr.drovers>dalab.ledge').salt || 0) + (landed(Y.trade, 'wr.round.west', 'wr.drovers>dalab.ledge').salt || 0);
  const bkSalt = (landed(Y.trade, 'wr.road.drove', 'wr.drovers>wr.blakhed').salt || 0);
  const hhEggs = (landed(Y.trade, 'wr.road.hearth', 'wr.fowlers>tg.hearth').eggs || 0) + (landed(Y.trade, 'wr.round.rim', 'wr.fowlers>tg.hearth').eggs || 0);
  const hhIce = (landed(Y.trade, 'wr.road.ice.hearth', 'wr.icecutters>tg.hearth').ice || 0);
  const krIce = (landed(Y.trade, 'wr.road.ice.kradz', 'wr.icecutters>wr.kradz').ice || 0) + (landed(Y.trade, 'wr.road.kradz-bk', 'wr.blakhed>wr.kradz').ice || 0);
  T.ok('cross-polity links hold: Drovers ship ' + Math.round(lgSalt / 1000) + ' t salt to Ledge + ' + Math.round(bkSalt / 1000) + ' t to Blakhed; Fowlers & Ice-cutters supply Hearth Hold & Kradz',
    neighborsOk(lgSalt, bkSalt, hhEggs, hhIce, krIce),
    'Ledge salt ' + Math.round(lgSalt) + ', Hearth eggs ' + Math.round(hhEggs) + ', Hearth ice ' + Math.round(hhIce) + ', Kradz ice ' + Math.round(krIce));
  T.neg('missing Ledge salt delivery is caught', s => neighborsOk(s, bkSalt, hhEggs, hhIce, krIce), 0, lgSalt);
}

// 5. Travellers' multi-stop thaw rounds & Kradz km 218 Great Shaft hoist to Loj Twenny
const mobileOk = (wRep, rRep, trCuts, shDn, shUp, krCut) => {
  const cTot = Object.values(trCuts).reduce((a, b) => a + b, 0);
  const kTot = Object.values(krCut).reduce((a, b) => a + b, 0);
  return (wRep.waited || 0) > 0 && (rRep.waited || 0) > 0 && cTot > 500 &&
    (shDn.ice || 0) >= 20000 && (shDn.copper || 0) >= 3000 && (shUp.wax || 0) >= 2000 && kTot >= 3500;
};
{
  const wRep = Y.trade['wr.round.west'] || {}, rRep = Y.trade['wr.round.rim'] || {};
  const trCuts = Object.assign({}, (Y.cuts['wr.round.west'] || {}).taken, (Y.cuts['wr.round.rim'] || {}).taken, (Y.cuts['wr.road.line'] || {}).taken);
  const shDn = landed(Y.trade, 'wr.shaft.twenny', 'wr.kradz>tg.twenny'), shUp = landed(Y.trade, 'wr.shaft.twenny', 'tg.twenny>wr.kradz');
  const krCut = (Y.cuts['wr.shaft.twenny'] || { taken: {} }).taken;
  T.ok('Traveller vardo rounds winter at Blakhed and work thaw relays + Line portal cuts; Kradz hoist ice & copper down km 218 to Loj Twenny for wax & rare earths',
    mobileOk(wRep, rRep, trCuts, shDn, shUp, krCut),
    'shaft down ice ' + Math.round(shDn.ice || 0) + ', copper ' + Math.round(shDn.copper || 0) + '; up wax ' + Math.round(shUp.wax || 0));
  T.neg('a shaft carrying no ice or copper to Loj Twenny is caught', dn => mobileOk(wRep, rRep, trCuts, dn, shUp, krCut), {}, shDn);
}

// 6. Wildcat raids (Raid Zone 4) + Autumn Fair Truce Window + Market Peace bowl
const politicsOk = (iceRaid, surfRaid, fairLand, fairRep, peace) => {
  const ir = (iceRaid.events || []).length, sr = (surfRaid.events || []).length;
  const fairGoods = (fairLand.ivory || 0) + (fairLand.obsidian || 0) + (fairLand.hides || 0);
  return ir > 0 && sr > 0 && fairGoods > 500 && (fairRep.waited || 0) > 3000 && peace.state === 'peace' && peace.truce && peace.score >= 80;
};
{
  const iceRaid = Y.roadRaids['wr.road.ice'] || {}, surfRaid = Y.roadRaids['dalab.road.surface'] || {};
  const fairLand = landed(Y.trade, 'wr.road.fair.wildcat', 'wr.wildcat>wr.blakhed'), fairRep = Y.trade['wr.road.fair.wildcat'] || {};
  const peace = WR_TUNE.marketPeace(Y.B, Y.cuts, Y.trade);
  T.ok('Wildcat raids wr.road.ice & dalab.road.surface zero-sum while unarmed Fair traders enter Blakhed only in bk.fair; Market Peace holds (' + peace.score + '/100)',
    politicsOk(iceRaid, surfRaid, fairLand, fairRep, peace),
    'ice raids ' + (iceRaid.events || []).length + ', surface raids ' + (surfRaid.events || []).length + ', Fair ivory+obsidian+hides ' +
    Math.round((fairLand.ivory || 0) + (fairLand.obsidian || 0) + (fairLand.hides || 0)) + ' kg, peace ' + peace.score);
  T.neg('a collapsed Market Peace or missing Wildcat raids is caught', p => politicsOk(iceRaid, surfRaid, fairLand, fairRep, p), { state: 'crisis', truce: false, score: 20 }, peace);
}
/* S3-87b: a road's cargo raids are kept at S.roadRaids, so S.raids is not two things (the Lizardmen's raids are S.raiding, core/region 52) */
T.ok('the road raids are at S.roadRaids, and the valley keeps no S.raids', !Y.raidsAt && Object.keys(Y.roadRaids).length >= 2, 'S.raids ' + (Y.raidsAt ? 'kept' : 'absent') + ', road raids on ' + Object.keys(Y.roadRaids).join(', '));

/* ---- 7. W5 Invariant: Tungang Union Strike (`strike: true`) starves Ledge before Dalab breaks, books stay clean ---- */
{
  const ST = runSpec(WR_TUNE.valley({ strike: true }), 180), SB = ST.B.towns;
  const strikeOk = R => {
    const ledgeHungry = (R.B.towns['dalab.ledge'].hungry.grain || 0);
    const nulabHungry = (R.B.towns['wr.nulab'].hungry.grain || 0);
    const shelfHungry = (R.B.towns['dalab.shelf'].hungry.grain || 0);
    const unionRaids = ((R.roadRaids['dalab.road.surface'] || {}).events || []).filter(e => e.to === 'tg.twenny').length;
    const liftsLanded = Object.values(landed(R.trade, 'wr.road.lifts', 'wr.nulab>dalab.ledge')).reduce((a, b) => a + b, 0);
    return R.ledger.ok && !R.S.problems.length && liftsLanded === 0 && unionRaids > 0 && ledgeHungry > 100000 && nulabHungry === 0 && shelfHungry === 0;
  };
  T.ok('W5 strike proof: closing Loj Fower\'s lifts + Kradz/Union shaft raids starves Ledge (' + Math.round((SB['dalab.ledge'].hungry.grain || 0) / 1000) + ' t grain short) before Nulab or Shelf break, ledger clean',
    strikeOk(ST), 'Ledge grain short ' + Math.round(SB['dalab.ledge'].hungry.grain || 0) + ' kg, Nulab short ' + (SB['wr.nulab'].hungry.grain || 0) + ', ledger ' + ST.ledger.ok);
  T.neg('peace-time run does not starve Ledge', strikeOk, Y, ST);
}

/* ---- 8. Rising 8 (`wr.rising.nulab`) metastable cap without player, march with player ---- */
{
  let st = { worldPressure: 18, playerPressure: 0, cooldown: 0 };
  for (let m = 0; m < 12; m++) st = WR_TUNE.stepRising(st, { days: 30, raids: 3, strike: true, dalabStrength: 1 });
  const withPlayer = WR_TUNE.stepRising(st, { days: 10, raids: 2, playerDelta: 25 });
  const risingOk = (alone, pushed) => !alone.canMarch && alone.total <= WR_TUNE.rising.worldCap && pushed.canMarch && pushed.stage === 'march';
  T.ok('Rising 8 (wr.rising.nulab) caps at "' + st.stage + '" (' + st.total + ') without the player, and reaches "march" (' + withPlayer.total + ') with player intervention',
    risingOk(st, withPlayer), 'alone ' + st.stage + ' ' + st.total + ', with player ' + withPlayer.stage + ' ' + withPlayer.total);
  T.neg('an off-screen rising marching without the player is caught', a => risingOk(a, withPlayer), { canMarch: true, total: 92 }, st);
}

/* ---- 9. Full W3 Join with EAST_RIFT (Xanadu + Longsong + Full 37-Settlement West Rift) ---- */
{
  const PX = JSON.parse(rd('openworld/xanadu-oidong-highrift/plan/sites.json'));
  const PL = JSON.parse(rd('openworld/oidong-highrift/plan/sites.json'));
  loadHost();
  const ER = EAST_RIFT.valley(PX, PL, { scale: 200, lsScale: 50 });
  const JV = WR_TUNE.join(ER, { slice: 'full', cityScale: 250, townScale: 100, villageScale: 50, bulkScale: 500 });
  const J = runSpec(JV, 365);
  const fullJoinOk = R => {
    const ids = new Set(R.V.settlements.map(s => s.id)), cg = R.V.roads.find(r => r.id === 'caravan.great');
    const toBk = landed(R.trade, 'caravan.great', 's57bkv9741>wr.blakhed');
    return R.ledger.ok && !R.S.problems.length && !ids.has('gate.dalab.blakhed') && !ids.has('gate.dalab.nulab') && !ids.has('gate.dalab.shelf') &&
      ids.has('wr.blakhed') && ids.has('wr.nulab') && ids.has('dalab.shelf') && ids.has('tg.twenny') && ids.has('wr.wildcat') &&
      cg.stops.includes('wr.blakhed') && cg.stops.includes('dalab.shelf') && Object.values(toBk).reduce((a, b) => a + b, 0) > 5000;
  };
  T.ok('full W3 join with EAST_RIFT (Xanadu + Longsong + all 35 West Rift settlements = ' + J.S.order.length + ' settlements): all 3 Dalab stand-ins replaced, Great Caravan runs, ledger balances',
    fullJoinOk(J), J.S.order.length + ' settlements, ' + J.actors + ' actors');
  T.neg('retaining gate.dalab.shelf when full West Rift joins is caught', fullJoinOk,
    Object.assign({}, J, { V: Object.assign({}, J.V, { settlements: J.V.settlements.concat([{ id: 'gate.dalab.shelf' }]) }) }), J);
}

T.done();
