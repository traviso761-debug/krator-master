// node core/region/tests/test-jj-economy.js — Coupled 365-day regional economy & foreign trade test run across:
//   - Kingdom of Jimjam (JJ1-JJ4: 6 settlements = 103,500 single-counted souls)
//   - Free Clans of Ardent (FC1-FC4: 14 settlements = 27,200 single-counted souls, mounted directly from FC_TUNE)
//   - Dilihan Province (D1-D4: Dilihan & Kotgeta/Visas Coalfield = 21,000 souls; strictly zero closed Port Visas sea trade)
//   - Soda-Lake lbl=54 & Imperial Highway Axis (Serai entrepot, Silkhead dry-shore gateway, Korona K10 / Shell & Port Goto)
//   - Foreign West-Lake & Trans-Rim Corridors (Palewharf lbl=77 Eternian/Republican portage & Whitelake 5,400 m White Pass)
// Runs three full 365-day years on core/region/50-region-valley.js:
//   Part A — AUTARKY / CLOSED POLITY BORDERS (`autarky: true`): empirically measures non-native exhaustion days, Royal Almanac
//            Press paper_cloth stall, unshipped Vellai-kal alabaster pileup, and dry-shore Silkhead grain hunger.
//   Part B — COUPLED OPEN CONTINENTAL-CORNER TRADE (`autarky: false`): verifies all hinterland, Cut, Free-Clans, Serai<->Silkhead
//            lbl=54 barge transshipment, Imperial Highway, Palewharf & White-Pass corridors, Double-Dark barge holds, White-Pass
//            winter col losses, diplomatic Khaayken<->Eternian lock, 0 hungry in Jimjam/Ardent/Silkhead, and zero-sum SIM.ledger.
//   Part C — SILK-TRAIL EMBARGO (`embargo: true`): verifies MC-06 -> BF-04 Broken-Kin highwaymen raids on Spur S-A.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
global.window = global;
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const runFile = p => vm.runInThisContext(rd(p), { filename: p });

function loadHost() {
  runFile('core/clock/20-core-clock.js');
  fs.readdirSync(path.join(ROOT, 'core', 'simulation'))
    .filter(f => /^77-sim-.*\.js$/.test(f)).sort()
    .forEach(f => runFile('core/simulation/' + f));
  runFile('core/region/00-region-core.js');
  const H = { TUNE: { sim: {} } };
  KREGION.use(H);
  runFile('core/region/50-region-valley.js');
  runFile('core/region/data/fc-tune.js');
  runFile('core/region/data/jj-tune.js');
  runFile('settlements/jimjam/sim/jj-kingdom.js');
  return H;
}
loadHost();

function runYear(V, days) {
  const H = loadHost(), S = H.simValley(V);
  JJ_KINGDOM.attachUnrest(H, V);
  const a = SIM.ledgerSnap(), b0 = H.valleyBooks();
  const firstDryJimjam = {}, firstDryKingdom = {};
  const unrestTimeline = [];
  for (let d = 1; d <= days; d++) {
    H.valleyRun(1440, 60);
    const B = H.valleyBooks();
    const jjSt = B.towns['jj.jimjam'].stock;
    Object.keys(V.goods).forEach(g => {
      if (firstDryJimjam[g] == null && (jjSt[g] == null || jjSt[g] <= 0)) firstDryJimjam[g] = d;
      let tot = 0;
      JJ_TUNE.jimjamIds.forEach(id => { tot += B.towns[id].stock[g] || 0; });
      if (firstDryKingdom[g] == null && tot <= 0) firstDryKingdom[g] = d;
    });
    if (d === 30 || d === 65 || d === 90 || d === 150 || d === 240 || d === 365) {
      const uJj = SIM.unrestReport('jj.jimjam').towns['jj.jimjam'] || { level: {}, stage: {}, demands: [], strikes: [], treason: [] };
      const uSh = SIM.unrestReport('sh.silkhead').towns['sh.silkhead'] || { level: {}, stage: {}, demands: [], strikes: [], treason: [] };
      unrestTimeline.push({
        day: d,
        jjLevel: Object.assign({}, uJj.level),
        jjStage: Object.assign({}, uJj.stage),
        jjDemands: uJj.demands.length,
        jjStrikes: uJj.strikes.length,
        jjTreason: uJj.treason.length,
        shLevelAll: uSh.level.all,
        shStageAll: uSh.stage.all,
        shTreason: uSh.treason.length
      });
    }
  }
  const b = SIM.ledgerSnap(), B = H.valleyBooks(), blocked = {};
  Object.keys(B.towns).forEach(id => { blocked[id] = SIM.blockedReport(id); });
  const waitedByRoute = {};
  Object.keys(SIM.TRADE.routes).forEach(rid => { waitedByRoute[rid] = SIM.TRADE.routes[rid].waited || 0; });
  return {
    H, V, S, B0: b0, B,
    jjSummary: JJ_TUNE.summarizePolity(JJ_TUNE.jimjamIds, V.goods, b0, B, firstDryKingdom, blocked),
    fcSummary: JJ_TUNE.summarizePolity(FC_TUNE.freeClansIds, V.goods, b0, B, null, blocked),
    firstDryJimjam,
    firstDryKingdom,
    blocked,
    waitedByRoute,
    losses: JSON.parse(JSON.stringify(S.losses || {})),
    trade: SIM.tradeReport() || {},
    raids: JSON.parse(JSON.stringify(S.roadRaids || {})),
    unrest: SIM.unrestReport(),
    unrestTimeline,
    jjArrestMult: SIM.unrestArrest('jj.jimjam'),
    khaaykenTradesEternian: SIM.trades('wp.whitelake', 'pw.palewharf'),
    ledger: SIM.ledger(a, b, { tol: 1 })
  };
}

const t = kg => (kg / 1000).toFixed(1) + ' t';
const landed = (tr, r, leg) => ((tr[r] || {}).landed || {})[leg] || {};
const tithed = (tr, r, leg) => ((tr[r] || {}).tithed || {})[leg] || {};

const t0 = Date.now();
const A = runYear(JJ_KINGDOM.autarky(), 365);
const msA = Date.now() - t0;

const t1 = Date.now();
const O = runYear(JJ_KINGDOM.valley(), 365);
const msO = Date.now() - t1;

const t2 = Date.now();
const E = runYear(JJ_KINGDOM.embargo(), 365);
const msE = Date.now() - t2;

console.log('Jimjam + Ardent + Dilihan + Serai/Silkhead + Foreign 365d coupled sim: autarky ' +
  (msA / 1000).toFixed(2) + 's, open-trade ' + (msO / 1000).toFixed(2) + 's, embargo ' + (msE / 1000).toFixed(2) + 's');

if (process.env.JJ_PRINT_REPORT === '1') {
  console.log('\n=== KINGDOM OF JIMJAM (JJ1-JJ4, pop ' + A.jjSummary.people + ') 365-DAY AUTARKY vs COUPLED OPEN TRADE ===');
  ['grain', 'alabaster', 'clay_gypsum', 'silica', 'alkali_salt', 'ceramics', 'glass', 'paper_cloth', 'almanacs',
   'cotton_cloth', 'bronze', 'instruments', 'marble', 'coal', 'potash', 'timber', 'salt', 'saltpeter', 'tea',
   'silk', 'magnets', 'spices', 'scotch', 'tartan', 'mounts', 'qiviut', 'goldroot', 'ancient_salvage', 'machine_parts'].forEach(g => {
    const ag = A.jjSummary.goods[g], og = O.jjSummary.goods[g];
    if (!ag || !og) return;
    console.log(
      g.padEnd(15) +
      ' | AUTARKY: made=' + Math.round(ag.made).toString().padStart(8) +
      ' close=' + Math.round(ag.close).toString().padStart(8) +
      ' short=' + Math.round(ag.short + ag.hungry).toString().padStart(7) +
      ' dryD=' + String(ag.firstDryDay == null ? '-' : ag.firstDryDay).padStart(4) +
      ' | OPEN: made=' + Math.round(og.made).toString().padStart(8) +
      ' imp=' + Math.round(og.imported).toString().padStart(8) +
      ' exp=' + Math.round(og.exported).toString().padStart(8) +
      ' close=' + Math.round(og.close).toString().padStart(8) +
      ' short=' + Math.round(og.short + og.hungry).toString().padStart(6)
    );
  });
}

// 1. Exact 27-settlement regional census (103,500 Jimjam + 27,200 Free Clans = 130,700 single-counted) & zero-sum SIM.ledger in all 3 modes
{
  const censusAndLedgerOk = (jjPop, fcPop, nTowns, probs, lA, lO, lE) =>
    jjPop === 103500 && fcPop === 27200 && nTowns === 27 && probs === 0 && lA && lO && lE;
  T.ok('27-settlement regional network declared: 103,500 Jimjam (JJ1-JJ4) + 27,200 Free Clans (FC1-FC4) = 130,700 single-counted, 0 SIM problems & zero-sum ledger across all 365d runs',
    censusAndLedgerOk(O.jjSummary.people, O.fcSummary.people, Object.keys(O.B.towns).length, O.S.problems.length, A.ledger.ok, O.ledger.ok, E.ledger.ok),
    'JJ=' + O.jjSummary.people + ', FC=' + O.fcSummary.people + ', towns=' + Object.keys(O.B.towns).length +
    ', ledgerProblems=' + (A.ledger.problems.length + O.ledger.problems.length + E.ledger.problems.length));
  T.neg('an off-by-one Kingdom of Jimjam census fails censusAndLedgerOk',
    p => censusAndLedgerOk(p, O.fcSummary.people, 27, 0, true, true, true), 99500, O.jjSummary.people);
}

// 2. Autarky (365d closed external borders): reveals non-native deficits, stalls Royal Almanac Press (`paper_cloth`), piles up Vellai-kal alabaster, and starves dry-shore Silkhead
{
  const shAutarkyHungry = (A.B.towns['sh.silkhead'].hungry.grain || 0);
  const autarkyDeficitsOk = (ag, blkJj, shHungry, og) => {
    const pressBlk = blkJj['jj.almanac_press'];
    return ag.marble.short > 30000 && ag.coal.short > 15000 && ag.silk.short > 10000 &&
      ag.scotch.short > 30000 && ag.machine_parts.short > 5000 && ag.goldroot.short > 3000 &&
      !!(pressBlk && pressBlk.reason === 'missing' && (pressBlk.goods || []).indexOf('paper_cloth') >= 0) &&
      ag.alabaster.close > og.alabaster.close + 120000 &&
      shHungry > 150000;
  };
  T.ok('Autarky (365d) exposes Jimjam foreign deficits (marble, Visas coal, Spider-Lake silk, Ardent scotch, Palewharf machine_parts, White-Pass goldroot), stalls Almanac Press on missing paper_cloth, piles up alabaster (' +
    t(A.jjSummary.goods.alabaster.close) + '), and leaves dry-shore Silkhead short ' + t(shAutarkyHungry) + ' of grain',
    autarkyDeficitsOk(A.jjSummary.goods, A.blocked['jj.jimjam'], shAutarkyHungry, O.jjSummary.goods),
    'marbleShort=' + t(A.jjSummary.goods.marble.short) + ', coalShort=' + t(A.jjSummary.goods.coal.short) +
    ', silkShort=' + t(A.jjSummary.goods.silk.short) + ', pressBlocked=' + JSON.stringify(A.blocked['jj.jimjam']['jj.almanac_press']));
  T.neg('open-trade run does not stall Almanac Press or starve Silkhead',
    y => autarkyDeficitsOk(y.jjSummary.goods, y.blocked['jj.jimjam'], y.B.towns['sh.silkhead'].hungry.grain || 0, O.jjSummary.goods), O, A);
}

const notStalled = b => !(b && b.reason === 'missing');

// 3. Hinterlands (JJ1-JJ4): Tamarai Crown tithes, Vellai-kal alabaster, Barada-Quay silica, Mekam/Uppu salt/tea/saltpeter & Skywatch bronze feed Jimjam's 4 industrial chains
{
  const tamTithe = tithed(O.trade, 'jj.canal.tamarai', 'jj.tamarai_kuppam>jj.jimjam');
  const vkIn     = landed(O.trade, 'jj.barge.vellai',  'jj.vellai_kal>jj.jimjam');
  const jj2In    = landed(O.trade, 'jj.barge.barada',  'jj2.barada_periya>jj.jimjam');
  const jj3In    = landed(O.trade, 'jj.road.mekam',    'jj3.mekam_uppu>jj.jimjam');
  const jj4In    = landed(O.trade, 'jj.road.skywatch',  'jj4.skywatch>jj.jimjam');
  const jj4Out   = landed(O.trade, 'jj.road.skywatch',  'jj.jimjam>jj4.skywatch');
  const og = O.jjSummary.goods;
  const hinterlandsAndWorksOk = gMade =>
    (tamTithe.grain || 0) > 1000000 && (tamTithe.clay_gypsum || 0) > 80000 &&
    (vkIn.alabaster || 0) > 250000 &&
    (jj2In.grain || 0) > 600000 && (jj2In.silica || 0) > 150000 &&
    (jj3In.salt || 0) > 400000 && (jj3In.tea || 0) > 50000 && (jj3In.saltpeter || 0) > 25000 &&
    ((jj4In.bronze || 0) + (jj4In.ancient_salvage || 0) + (jj4In.qiviut || 0)) > 60000 && (jj4Out.grain || 0) > 150000 &&
    gMade >= 180000 && og.ceramics.made >= 180000 && og.almanacs.made >= 55000 && og.instruments.made >= 25000 &&
    notStalled(O.blocked['jj.jimjam']['jj.almanac_press']) && notStalled(O.blocked['jj.jimjam']['jj.glassworks']);
  T.ok('JJ1-JJ4 hinterlands deliver Tamarai Crown tithes (' + t(tamTithe.grain || 0) + ' grain), Vellai-kal alabaster (' + t(vkIn.alabaster || 0) +
    '), Barada silica (' + t(jj2In.silica || 0) + '), Uppu salt (' + t(jj3In.salt || 0) + ') & Skywatch skarn/salvage, powering unblocked glass (' + t(og.glass.made) +
    '), ceramics (' + t(og.ceramics.made) + '), almanacs (' + t(og.almanacs.made) + ') & brass instruments (' + t(og.instruments.made) + ')',
    hinterlandsAndWorksOk(og.glass.made),
    'jj2Grain=' + t(jj2In.grain || 0) + ', jj3Saltpeter=' + t(jj3In.saltpeter || 0) + ', jj4Bronze=' + t(jj4In.bronze || 0) + ', jj4OutGrain=' + t(jj4Out.grain || 0));
  T.neg('zero glass output fails hinterlandsAndWorksOk', hinterlandsAndWorksOk, 0, og.glass.made);
}

// 4. Dilihan Province (D1-D4) & Free Clans of Ardent (FC1-FC4): Cut marble/coal/paper_cloth/wine_butts + Ardent bronze & 4 Great Scotch Distilleries
{
  const dlToJj    = landed(O.trade, 'cut.trunk.dilihan_jimjam', 'dl.dilihan>jj.jimjam');
  const jjToDl    = landed(O.trade, 'cut.trunk.dilihan_jimjam', 'jj.jimjam>dl.dilihan');
  const kvToJj    = landed(O.trade, 'cut.trunk.visas_jimjam',   'dl.kotgeta_visas>jj.jimjam');
  const dlToKlip  = landed(O.trade, 'fc.trade.dilihan',         'dl.dilihan>fc.klippeport');
  const kvToKlip  = landed(O.trade, 'fc.trade.visas_coal',      'dl.kotgeta_visas>fc.klippeport');
  const klipToDl  = landed(O.trade, 'fc.trade.dilihan',         'fc.klippeport>dl.dilihan');
  const arToJj    = landed(O.trade, 'fc.trade.jimjam',          'fc.ardent>jj.jimjam');
  const jjToAr    = landed(O.trade, 'fc.trade.jimjam',          'jj.jimjam>fc.ardent');
  const cutAndClansOk = fcScotch =>
    fcScotch >= 380000 &&
    (dlToJj.marble || 0) > 60000 && (dlToJj.paper_cloth || 0) > 40000 && (dlToJj.spices || 0) > 10000 && (dlToJj.potash || 0) > 10000 &&
    (kvToJj.coal || 0) > 35000 && ((jjToDl.alabaster || 0) + (jjToDl.ceramics || 0) + (jjToDl.glass || 0)) > 30000 &&
    (dlToKlip.wine_butts || 0) > 15000 && (kvToKlip.coal || 0) > 15000 && (klipToDl.scotch || 0) > 50000 &&
    (arToJj.bronze || 0) > 70000 && (arToJj.scotch || 0) > 70000 &&
    (jjToAr.grain || 0) > 150000 && (jjToAr.salt || 0) > 50000 &&
    notStalled(O.blocked['fc.ardent']['ar.armourer']) && notStalled(O.blocked['fc.klippeport']['kp.great_distillery']);
  T.ok('Dilihan & Visas Coalfield supply marble, paper_cloth, coal & wine_butts to both Jimjam and Klippeport/Ardent while Free Clans distil ' +
    t(O.fcSummary.goods.scotch.made) + '/yr of Scotch & ship bronze/scotch down the Scarp Road',
    cutAndClansOk(O.fcSummary.goods.scotch.made),
    'dl->jj marble=' + t(dlToJj.marble || 0) + '/paper=' + t(dlToJj.paper_cloth || 0) +
    ', jj->dl alab=' + t(jjToDl.alabaster || 0) + ', dl->klip butts=' + t(dlToKlip.wine_butts || 0) + ', kv->klip coal=' + t(kvToKlip.coal || 0) +
    ', ar->jj bronze=' + t(arToJj.bronze || 0) + '/scotch=' + t(arToJj.scotch || 0));
  T.neg('sub-150 t Free-Clans scotch output fails cutAndClansOk', cutAndClansOk, 120000, O.fcSummary.goods.scotch.made);
}

// 5. Serai <-> Silkhead Soda-Lake (lbl=54) Barge Transshipment + Osterbank Gold Whiskey + Shell/Korona K10 Imperial Highway
{
  const jjToSr = landed(O.trade, 'jj.road.serai',     'jj.jimjam>sr.serai');
  const srToJj = landed(O.trade, 'jj.road.serai',     'sr.serai>jj.jimjam');
  const srToSh = landed(O.trade, 'sr.barge.silkhead', 'sr.serai>sh.silkhead');
  const shToSr = landed(O.trade, 'sr.barge.silkhead', 'sh.silkhead>sr.serai');
  const obToSr = landed(O.trade, 'fc.trade.serai',    'fc.osterbank>sr.serai');
  const srToOb = landed(O.trade, 'fc.trade.serai',    'sr.serai>fc.osterbank');
  const krToJh = landed(O.trade, 'fc.trade.korona',   'kr.korona_shell>fc.jarnhold');
  const jhToKr = landed(O.trade, 'fc.trade.korona',   'fc.jarnhold>kr.korona_shell');
  const sodaAndHwyOk = shGrainIn =>
    (jjToSr.grain || 0) > 350000 && shGrainIn > 300000 && (srToSh.alabaster || 0) > 15000 &&
    (shToSr.silk || 0) > 30000 && (shToSr.magnets || 0) > 15000 &&
    (srToJj.alkali_salt || 0) > 90000 && (srToJj.silk || 0) > 20000 && (srToJj.magnets || 0) > 10000 &&
    (obToSr.scotch || 0) > 40000 && (srToOb.wine_butts || 0) > 15000 &&
    (krToJh.grain || 0) > 35000 && ((jhToKr.saltpeter || 0) + (jhToKr.powder || 0)) > 35000;
  T.ok('Serai Soda-Lake entrepot transships Jimjam grain (' + t(srToSh.grain || 0) + ') & Osterbank Whiskey across lbl=54 to Silkhead and forwards Spider-Silk (' +
    t(srToJj.silk || 0) + '), Magnets & Glass-Alkali (' + t(srToJj.alkali_salt || 0) + ') back to Jimjam',
    sodaAndHwyOk(srToSh.grain || 0),
    'jj->sr grain=' + t(jjToSr.grain || 0) + ' -> sh grain=' + t(srToSh.grain || 0) + '/alab=' + t(srToSh.alabaster || 0) +
    '; ob->sr scotch=' + t(obToSr.scotch || 0) + ', sr->ob butts=' + t(srToOb.wine_butts || 0) + ', kr->jh grain=' + t(krToJh.grain || 0));
  T.neg('zero grain barged to Silkhead fails sodaAndHwyOk', sodaAndHwyOk, 0, srToSh.grain || 0);
}

// 6. Foreign West-Lake (Palewharf lbl=77), 5,400 m White-Pass (Khaayken Yeti), Double-Dark Barge Holds & Diplomatic Block
{
  const pwToJj = landed(O.trade, 'jj.barge.palewharf', 'pw.palewharf>jj.jimjam');
  const jjToPw = landed(O.trade, 'jj.barge.palewharf', 'jj.jimjam>pw.palewharf');
  const wpToJj = landed(O.trade, 'jj.pass.whitelake',  'wp.whitelake>jj.jimjam');
  const jjToWp = landed(O.trade, 'jj.pass.whitelake',  'jj.jimjam>wp.whitelake');
  const ddWaited = (O.waitedByRoute['jj.canal.tamarai'] || 0) + (O.waitedByRoute['jj.barge.vellai'] || 0) +
                   (O.waitedByRoute['jj.barge.barada'] || 0) + (O.waitedByRoute['jj.barge.palewharf'] || 0);
  const wpLosses = (O.losses['jj.pass.whitelake'] || []).length;
  const foreignAndRulesOk = illegalTrade =>
    !illegalTrade &&
    (pwToJj.machine_parts || 0) > 15000 && (pwToJj.paper_cloth || 0) > 12000 && ((pwToJj.marble || 0) + (pwToJj.timber || 0)) > 30000 &&
    (jjToPw.alabaster || 0) > 25000 && ((jjToPw.ceramics || 0) + (jjToPw.glass || 0) + (jjToPw.cotton_cloth || 0)) > 15000 &&
    (wpToJj.qiviut || 0) > 14000 && (wpToJj.goldroot || 0) > 12000 &&
    (jjToWp.grain || 0) > 40000 && ((jjToWp.tea || 0) + (jjToWp.cotton_cloth || 0) + (jjToWp.bronze || 0) + (jjToWp.glass || 0)) > 15000 &&
    ddWaited > 0 && wpLosses > 0;
  T.ok('Palewharf 425 km lbl=77 barges & 5,400 m White-Pass yak caravans deliver machine_parts, qiviut & goldroot, hold barges on 4 Double Darks (waited=' +
    ddWaited + '), log winter pass losses (' + wpLosses + '), and refuse Khaayken<->Eternian direct trade',
    foreignAndRulesOk(O.khaaykenTradesEternian),
    'pw->jj parts=' + t(pwToJj.machine_parts || 0) + '/paper=' + t(pwToJj.paper_cloth || 0) + '/marble+timb=' + t((pwToJj.marble || 0) + (pwToJj.timber || 0)) +
    ', jj->pw alab=' + t(jjToPw.alabaster || 0) + ', wp->jj qiviut=' + t(wpToJj.qiviut || 0) + '/goldroot=' + t(wpToJj.goldroot || 0) + ', jj->wp grain=' + t(jjToWp.grain || 0));
  T.neg('opening direct Khaayken<->Eternian trade fails foreignAndRulesOk', foreignAndRulesOk, true, O.khaaykenTradesEternian);
}

// 7. Full Population Nutrition & Shortfall Closure: Jimjam, Ardent & Silkhead all finish 365d with 0 hungry, and foreign shortfalls drop >90%
{
  const checkRegionalFed = Bk => {
    const zeroMust = ['jj.jimjam', 'fc.ardent', 'sh.silkhead', 'sr.serai', 'dl.dilihan'];
    for (let i = 0; i < zeroMust.length; i++) {
      const x = Bk[zeroMust[i]];
      const h = (x.hungry.grain || 0) + (x.hungry.potato || 0) + (x.hungry.dairy || 0) + (x.hungry.meat || 0);
      if (h > 0) return { ok: false, why: zeroMust[i] + ' hungry=' + Math.round(h) };
    }
    const allPolity = JJ_TUNE.jimjamIds.concat(FC_TUNE.freeClansIds);
    for (let i = 0; i < allPolity.length; i++) {
      const id = allPolity[i], x = Bk[id];
      let eqEat = 0, eqHungry = 0;
      ['grain', 'potato', 'dairy', 'meat'].forEach(g => {
        const w = O.V.food[g] || 1;
        eqEat += (x.eaten[g] || 0) * w;
        eqHungry += (x.hungry[g] || 0) * w;
      });
      if (eqEat + eqHungry > 0 && eqHungry > (eqEat + eqHungry) * 0.01) {
        return { ok: false, why: id + ':' + (100 * eqHungry / (eqEat + eqHungry)).toFixed(1) + '%' };
      }
    }
    const ag = A.jjSummary.goods, og = O.jjSummary.goods;
    const closedImports = og.marble.short < ag.marble.short * 0.05 &&
                          og.coal.short < ag.coal.short * 0.05 &&
                          og.silk.short < ag.silk.short * 0.05 &&
                          og.scotch.short < ag.scotch.short * 0.05 &&
                          og.machine_parts.short < ag.machine_parts.short * 0.05;
    return { ok: closedImports, why: closedImports ? 'ok' : 'foreign shorts remained' };
  };
  const fedRes = checkRegionalFed(O.B.towns);
  T.ok('Coupled Open Trade feeds all 130,700 Jimjam + Free-Clans citizens + Silkhead/Serai/Dilihan (0 hungry in Jimjam, Ardent & Silkhead) and cuts foreign shortfalls by >95%',
    fedRes.ok,
    fedRes.why + '; Silkhead hungry: ' + t(A.B.towns['sh.silkhead'].hungry.grain || 0) + ' -> ' + t(O.B.towns['sh.silkhead'].hungry.grain || 0));
  T.neg('starving Silkhead fails checkRegionalFed',
    Bk => checkRegionalFed(Bk).ok,
    Object.assign({}, O.B.towns, { 'sh.silkhead': Object.assign({}, O.B.towns['sh.silkhead'], { hungry: { grain: 5000 } }) }), O.B.towns);
}

// 8. Embargo Mode: Korona/Shell retainer default (>14d) flips FC4 bands to BF-04 Broken-Kin highwaymen raiding Spur S-A while keeping ledger zero-sum
{
  const embargoOk = Yr => {
    const rd = Yr.raids['fc.trade.korona'] || { events: [], taken: {} };
    const loot = Object.keys(rd.taken).reduce((s, k) => s + rd.taken[k], 0);
    return Yr.V.meta.bandState.code === 'BF-04' && rd.events.length >= 4 && loot > 5000 && Yr.ledger.ok;
  };
  T.ok('Silk-Trail retainer arrears (>14d) flip Free-Clan escorts from MC-06 to BF-04 Broken-Kin highwaymen raiding Spur S-A into Salpetervik',
    embargoOk(E) && O.V.meta.bandState.code === 'MC-06',
    'raidEvents=' + ((E.raids['fc.trade.korona'] || { events: [] }).events.length) + ', state=' + E.V.meta.bandState.code);
  T.neg('paid open-trade year has 0 Broken-Kin raids', embargoOk, O, E);
}

// 9. Class-Stratified Unrest (`SIM.unrest`): Jimjam weathers a 365d blockade without famine or treason (`poor` calm, `all` > 40, treason = 0),
//    yet suffers real guild & elite friction (`artisan` & `elite` drop into grumble/demand/strike, refused petitions & 0.7x watch arrest),
//    whereas grain-starved Silkhead collapses into treason — and Open Trade keeps every Jimjam class calm!
{
  if (process.env.JJ_PRINT_UNREST === '1') {
    console.log('\n=== UNREST TRAJECTORY: 365d BLOCKADE (AUTARKY) vs OPEN TRADE vs SILK-TRAIL EMBARGO ===');
    A.unrestTimeline.forEach(row => {
      console.log('  [BLOCKADE d' + String(row.day).padStart(3) + '] Jimjam all=' + (row.jjLevel.all || 0).toFixed(1) + '(' + row.jjStage.all + ')' +
        ' | poor=' + (row.jjLevel.poor || 0).toFixed(1) + '(' + row.jjStage.poor + ')' +
        ' | artisan=' + (row.jjLevel.artisan || 0).toFixed(1) + '(' + row.jjStage.artisan + ')' +
        ' | elite=' + (row.jjLevel.elite || 0).toFixed(1) + '(' + row.jjStage.elite + ')' +
        ' | demands=' + row.jjDemands + ' strikes=' + row.jjStrikes + ' treason=' + row.jjTreason +
        ' || Silkhead all=' + (row.shLevelAll || 0).toFixed(1) + '(' + row.shStageAll + ', treason=' + row.shTreason + ')');
    });
    const oEnd = O.unrestTimeline[O.unrestTimeline.length - 1];
    const eEnd = E.unrestTimeline[E.unrestTimeline.length - 1];
    console.log('  [OPEN     d365] Jimjam all=' + (oEnd.jjLevel.all || 0).toFixed(1) + '(' + oEnd.jjStage.all + ')' +
      ' | poor=' + (oEnd.jjLevel.poor || 0).toFixed(1) + '(' + oEnd.jjStage.poor + ')' +
      ' | artisan=' + (oEnd.jjLevel.artisan || 0).toFixed(1) + '(' + oEnd.jjStage.artisan + ')' +
      ' | elite=' + (oEnd.jjLevel.elite || 0).toFixed(1) + '(' + oEnd.jjStage.elite + ')' +
      ' | demands=' + oEnd.jjDemands + ' strikes=' + oEnd.jjStrikes + ' || Silkhead all=' + (oEnd.shLevelAll || 0).toFixed(1) + '(' + oEnd.shStageAll + ')');
    console.log('  [EMBARGO  d365] Jimjam all=' + (eEnd.jjLevel.all || 0).toFixed(1) + '(' + eEnd.jjStage.all + ')' +
      ' | artisan=' + (eEnd.jjLevel.artisan || 0).toFixed(1) + '(' + eEnd.jjStage.artisan + ')' +
      ' | elite=' + (eEnd.jjLevel.elite || 0).toFixed(1) + '(' + eEnd.jjStage.elite + ')');
  }
  const uJjA = A.unrest.towns['jj.jimjam'];
  const uShA = A.unrest.towns['sh.silkhead'];
  const uJjO = O.unrest.towns['jj.jimjam'];
  const weathersWithDifficultyOk = u =>
    u.treason.length === 0 &&
    u.stage.poor === 'calm' &&
    u.level.all >= 40 &&
    (u.stage.artisan === 'demand' || u.stage.artisan === 'strike' || u.stage.elite === 'demand' || u.stage.elite === 'grumble') &&
    u.demands.length >= 3 &&
    A.jjArrestMult < 1 &&
    uShA.treason.length >= 1 &&
    uJjO.stage.all === 'calm' && uJjO.stage.artisan === 'calm' && uJjO.stage.elite === 'calm' && uJjO.strikes.length === 0;
  T.ok('Jimjam weathers a 365d trade blockade without treason or peasant revolt (poor=' + Math.round(uJjA.level.poor) + ' ' + uJjA.stage.poor +
    ', all=' + Math.round(uJjA.level.all) + ' ' + uJjA.stage.all + ', treason=0) while suffering real artisan/elite unrest (artisan=' +
    Math.round(uJjA.level.artisan) + ' ' + uJjA.stage.artisan + ', elite=' + Math.round(uJjA.level.elite) + ' ' + uJjA.stage.elite +
    ', demands=' + uJjA.demands.length + ', strikes=' + uJjA.strikes.length + ', arrest=' + A.jjArrestMult + 'x; vs Silkhead treason=' + uShA.treason.length + ')',
    weathersWithDifficultyOk(uJjA),
    'open-trade Jimjam: all=' + Math.round(uJjO.level.all) + ' ' + uJjO.stage.all + ', strikes=' + uJjO.strikes.length);
  T.neg('open-trade Jimjam has zero shortage unrest and fails blockade-difficulty predicate', weathersWithDifficultyOk, uJjO, uJjA);
}

T.done();
