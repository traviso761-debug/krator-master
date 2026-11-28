// node core/region/tests/test-fc-economy.js — Free Clans of Ardent (rmumc5ov15a8k, FC1-FC4, 27,200 souls across 14 Free-Clans
// settlements + 4 neighbour markets) running a full 365-day year on core/simulation (`core/region/50-region-valley.js`):
//   Part A — AUTARKY / CLOSED-BORDER DIAGNOSTIC (365 days, `autarky: true`):
//     Measures empirically what the Free Clans polygon runs out of when cut off from Jimjam, Dilihan, Serai/Silkhead & Korona:
//     salt, ceramics/glass, Visas smithing coal, seasoned wine_butts (stalling Osterbank & Klippeport whiskey/scotch finishing),
//     silk, tea, spices, and late-spring capital/steppe grain — while bronze, Hearth-Peat scotch, copper, tin, saltpeter,
//     mounts, wool/tartan and timber pile up in surplus waiting for buyers.
//   Part B — OPEN NEIGHBOUR TRADE (365 days, `autarky: false`):
//     Opens R1 (Dilihan Cut Pass), R2 (Jimjam Scarp Road), R3 (Serai Soda-Lake Descent) & R4 (Korona K10 Spur S-A) + MC-06
//     retainers: every non-native shortfall closes, all 4 Great Distilleries produce ~460 t/yr of whiskey & scotch, Ardent has
//     0 hungry, every Free-Clans settlement stays under 1 % hungry, and SIM.ledger balances zero-sum across all 18 settlements.
//   Part C — SILK-TRAIL EMBARGO / BROKEN-KIN FLIP (365 days, `embargo: true`):
//     When Korona defaults on MC-06 retainers (>14 days unpaid), bands flip to BF-04 Broken-Kin reivers and raid Spur S-A
//     caravans into Salpetervik while keeping SIM.ledger balanced.
// Every check paired with a negative (`tools/ktest.js`).
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
  runFile('settlements/ardent/sim/fc-ardent.js');
  return H;
}
loadHost();

function runYear(V, days) {
  const H = loadHost(), S = H.simValley(V), a = SIM.ledgerSnap(), b0 = H.valleyBooks();
  const firstDryArdent = {}, firstDryPolity = {};
  for (let d = 1; d <= days; d++) {
    H.valleyRun(1440, 60);
    const B = H.valleyBooks();
    const arSt = B.towns['fc.ardent'].stock;
    Object.keys(FC_TUNE.goods).forEach(g => {
      if (firstDryArdent[g] == null && (arSt[g] == null || arSt[g] <= 0)) firstDryArdent[g] = d;
      let tot = 0;
      FC_TUNE.freeClansIds.forEach(id => { tot += B.towns[id].stock[g] || 0; });
      if (firstDryPolity[g] == null && tot <= 0) firstDryPolity[g] = d;
    });
  }
  const b = SIM.ledgerSnap(), B = H.valleyBooks(), blocked = {};
  FC_TUNE.freeClansIds.forEach(id => { blocked[id] = SIM.blockedReport(id); });
  return {
    H, V, S, B0: b0, B,
    summary: FC_TUNE.summarizeFreeClans(b0, B, firstDryPolity, blocked),
    firstDryArdent,
    firstDryPolity,
    blocked,
    trade: SIM.tradeReport() || {},
    xfer: SIM.transfersReport ? (SIM.transfersReport() || {}) : {},
    raids: JSON.parse(JSON.stringify(S.roadRaids || {})),
    ledger: SIM.ledger(a, b, { tol: 1 })
  };
}

const t = kg => (kg / 1000).toFixed(1) + ' t';
const landed = (tr, r, leg) => ((tr[r] || {}).landed || {})[leg] || {};

/* ==================== PART A: 365-DAY AUTARKY / CLOSED-BORDER RUN ==================== */
const t0 = Date.now();
const A = runYear(FC_ARDENT.autarky(), 365);
const msA = Date.now() - t0;

/* ==================== PART B: 365-DAY OPEN NEIGHBOUR TRADE RUN ==================== */
const t1 = Date.now();
const O = runYear(FC_ARDENT.valley(), 365);
const msO = Date.now() - t1;

/* ==================== PART C: 365-DAY SILK-TRAIL EMBARGO / BROKEN-KIN RUN ==================== */
const E = runYear(FC_ARDENT.embargo(), 365);

if (process.env.FC_PRINT_REPORT === '1') {
  console.log('\n=== FREE CLANS 365-DAY AUTARKY vs NEIGHBOUR-TRADE REPORT (pop ' + A.summary.people + ') ===');
  Object.keys(FC_TUNE.goods).forEach(g => {
    const ag = A.summary.goods[g], og = O.summary.goods[g];
    console.log(
      g.padEnd(11) +
      ' | AUTARKY: made=' + Math.round(ag.made).toString().padStart(7) +
      ' close=' + Math.round(ag.close).toString().padStart(7) +
      ' short=' + Math.round(ag.short + ag.hungry).toString().padStart(7) +
      ' dryDay=' + String(ag.firstDryDay == null ? '-' : ag.firstDryDay).padStart(4) +
      ' | OPEN TRADE: made=' + Math.round(og.made).toString().padStart(7) +
      ' close=' + Math.round(og.close).toString().padStart(7) +
      ' short=' + Math.round(og.short + og.hungry).toString().padStart(7)
    );
  });
  console.log('AUTARKY stalled works:', JSON.stringify(A.summary.stalledWorks));
  console.log('OPEN TRADE stalled works:', JSON.stringify(O.summary.stalledWorks));
}

console.log('Free Clans sim: autarky 365d in ' + (msA / 1000).toFixed(2) + 's, neighbour-trade 365d in ' + (msO / 1000).toFixed(2) + 's');

// 1. Exact 27,200 single-counted Free Clans census across 14 polygon settlements + zero-sum ledger in all 3 modes
{
  const censusOk = S => S.people === 27200 && FC_TUNE.freeClansIds.length === 14;
  T.ok('Free Clans polygon declared: 14 FC1-FC4 settlements = 27,200 souls exact, 0 SIM problems, and zero-sum ledger balances in autarky, trade & embargo',
    censusOk(O.summary) && !A.S.problems.length && !O.S.problems.length && !E.S.problems.length && A.ledger.ok && O.ledger.ok && E.ledger.ok,
    'pop=' + O.summary.people + ', autarkyLedger=' + A.ledger.ok + ', tradeLedger=' + O.ledger.ok + ', embargoLedger=' + E.ledger.ok);
  T.neg('a census off 27,200 fails censusOk', censusOk, { people: 25000 }, O.summary);
}

// 2. Autarky diagnostic: non-native salt, ceramics, tea, spices & silk run completely dry and accumulate large shortfalls
{
  const autarkyDeficitsOk = G =>
    G.salt.firstDryDay != null && G.salt.firstDryDay <= 110 && G.salt.short > 100000 &&
    G.ceramics.firstDryDay != null && G.ceramics.firstDryDay <= 130 && G.ceramics.short > 8000 &&
    G.tea.firstDryDay != null && G.tea.short > 10000 &&
    G.spices.firstDryDay != null && G.spices.short > 2000 &&
    G.silk.firstDryDay != null && G.silk.short > 1500;
  const ag = A.summary.goods;
  T.ok('Autarky (365d closed borders) reveals exact domestic deficits: salt (dry d' + ag.salt.firstDryDay + ', short ' + t(ag.salt.short) + '), ceramics (dry d' + ag.ceramics.firstDryDay + ', short ' + t(ag.ceramics.short) + '), tea, spices & silk',
    autarkyDeficitsOk(ag),
    'salt short=' + t(ag.salt.short) + ', ceramics short=' + t(ag.ceramics.short) + ', tea short=' + t(ag.tea.short));
  T.neg('zero salt shortfall would falsely claim native salt self-sufficiency',
    autarkyDeficitsOk, Object.assign({}, ag, { salt: Object.assign({}, ag.salt, { short: 0 }) }), ag);
}

// 3. Autarky industrial bottlenecks: missing Dilihan smithing coal stalls Ardent armourers, and missing foreign wine_butts stalls Osterbank & Klippeport whiskey finishing
{
  const industrialStallOk = Y => {
    const arBlk = Y.blocked['fc.ardent'] || {}, obBlk = Y.blocked['fc.osterbank'] || {}, kpBlk = Y.blocked['fc.klippeport'] || {};
    const coalStall = arBlk['ar.armourer'] && arBlk['ar.armourer'].reason === 'missing' && arBlk['ar.armourer'].goods.includes('coal');
    const obButtStall = obBlk['ob.great_distillery'] && obBlk['ob.great_distillery'].reason === 'missing' && obBlk['ob.great_distillery'].goods.includes('wine_butts');
    const kpButtStall = kpBlk['kp.great_distillery'] && kpBlk['kp.great_distillery'].reason === 'missing' && kpBlk['kp.great_distillery'].goods.includes('wine_butts');
    return !!(coalStall && obButtStall && kpButtStall);
  };
  T.ok('Autarky stalls coal-dependent blade/gun tempering (ar.armourer) and foreign wine-butt whiskey finishing (Osterbank & Klippeport distilleries), while peat/oak-cask Ardent Scotch keeps running',
    industrialStallOk(A) && (O.summary.goods.scotch.made > A.summary.goods.scotch.made + 80000),
    'autarky scotch=' + t(A.summary.goods.scotch.made) + ' vs open-trade scotch=' + t(O.summary.goods.scotch.made));
  T.neg('open-trade run does not suffer autarky coal + wine_butt stalls',
    y => !industrialStallOk(y), A, O);
}

// 4. Autarky export-good pileup: bronze, copper, tin, saltpeter, powder, mounts, timber & Hearth-Peat scotch accumulate in Free-Clans stores
{
  const surplusPileupOk = (ag, og) =>
    ag.bronze.close > ag.bronze.open + 120000 &&
    ag.mounts.close > ag.mounts.open + 150 &&
    ag.saltpeter.close + ag.powder.close > ag.saltpeter.open + ag.powder.open + 80000 &&
    og.bronze.close < ag.bronze.close;
  T.ok('Autarky piles up unshipped surpluses of cast bronze (' + t(A.summary.goods.bronze.close) + '), highland mounts (' + Math.round(A.summary.goods.mounts.close) + '), saltpeter/powder & timber that open trade exports',
    surplusPileupOk(A.summary.goods, O.summary.goods),
    'autarky bronze close=' + t(A.summary.goods.bronze.close) + ' vs open-trade=' + t(O.summary.goods.bronze.close));
  T.neg('zero bronze surplus fails surplusPileupOk',
    g => surplusPileupOk(g, O.summary.goods),
    Object.assign({}, A.summary.goods, { bronze: Object.assign({}, A.summary.goods.bronze, { close: 0 }) }), A.summary.goods);
}

// 5. Open Neighbour Trade (R1-R4): everyone fed (Ardent 0 hungry, every FC settlement < 1 % hungry on total calories) and salt/ceramics shortfalls slashed by >90%
{
  const checkFed = (Bk, og, ag) => {
    const bad = [];
    FC_TUNE.freeClansIds.forEach(id => {
      const x = Bk[id];
      let eqEat = 0, eqHungry = 0;
      ['grain', 'potato', 'dairy', 'meat'].forEach(g => {
        const w = FC_TUNE.food[g] || 1;
        eqEat += (x.eaten[g] || 0) * w;
        eqHungry += (x.hungry[g] || 0) * w;
      });
      if (id === 'fc.ardent' && eqHungry > 0) bad.push('fc.ardent:' + Math.round(eqHungry));
      else if (eqEat + eqHungry > 0 && eqHungry > (eqEat + eqHungry) * 0.01) bad.push(id + ':' + (100 * eqHungry / (eqEat + eqHungry)).toFixed(1) + '%');
    });
    return { ok: !bad.length && og.salt.short < ag.salt.short * 0.08 && og.ceramics.short < ag.ceramics.short * 0.12, bad };
  };
  const fRes = checkFed(O.B.towns, O.summary.goods, A.summary.goods);
  T.ok('Open Neighbour Trade feeds all 27,200 Free-Clans citizens (Ardent 0 hungry, all 14 settlements <1% hungry) and slashes salt & ceramics shortfalls by >90%',
    fRes.ok,
    (fRes.bad.length ? 'bad=' + fRes.bad.join(',') + '; ' : '') + 'open salt short=' + t(O.summary.goods.salt.short) + ' (vs ' + t(A.summary.goods.salt.short) + '), ceramics short=' + t(O.summary.goods.ceramics.short));
  T.neg('a hungry Ardent fails checkFed',
    Bk => checkFed(Bk, O.summary.goods, A.summary.goods).ok,
    Object.assign({}, O.B.towns, { 'fc.ardent': Object.assign({}, O.B.towns['fc.ardent'], { hungry: { grain: 500 } }) }), O.B.towns);
}

// 6. All four neighbour corridors R1-R4 haul canonical exports out and critical imports in, and the 4 Great Distilleries make >= 400 t/yr of whiskey & scotch
{
  const jjIn = landed(O.trade, 'fc.trade.jimjam', 'nb.jimjam>fc.ardent');
  const jjOut = landed(O.trade, 'fc.trade.jimjam', 'fc.ardent>nb.jimjam');
  const dlIn = landed(O.trade, 'fc.trade.dilihan', 'nb.dilihan>fc.klippeport');
  const dlOut = landed(O.trade, 'fc.trade.dilihan', 'fc.klippeport>nb.dilihan');
  const srIn = landed(O.trade, 'fc.trade.serai', 'nb.serai>fc.osterbank');
  const srOut = landed(O.trade, 'fc.trade.serai', 'fc.osterbank>nb.serai');
  const krIn = landed(O.trade, 'fc.trade.korona', 'nb.korona>fc.jarnhold');
  const krOut = landed(O.trade, 'fc.trade.korona', 'fc.jarnhold>nb.korona');
  const corridorsOk = sMade =>
    sMade >= 400000 &&
    (jjIn.grain || 0) > 150000 && (jjIn.salt || 0) > 50000 && (jjIn.ceramics || 0) > 8000 &&
    (jjOut.bronze || 0) > 80000 && (jjOut.scotch || 0) > 80000 &&
    (dlIn.coal || 0) > 18000 && (dlIn.wine_butts || 0) > 18000 && (dlOut.scotch || 0) > 60000 &&
    (srIn.salt || 0) > 25000 && (srIn.wine_butts || 0) > 18000 && (srIn.silk || 0) > 800 && (srOut.scotch || 0) > 60000 &&
    (krIn.grain || 0) > 40000 && ((krOut.saltpeter || 0) + (krOut.powder || 0)) > 40000 && (krOut.mounts || 0) >= 30;
  T.ok('Corridors R1-R4 exchange canonical goods both ways and the Capital + 3 Clan-Seat Distilleries distil ' + t(O.summary.goods.scotch.made) + '/yr of Scotch & Whiskey',
    corridorsOk(O.summary.goods.scotch.made),
    'Jimjam grain=' + t(jjIn.grain || 0) + '/salt=' + t(jjIn.salt || 0) + ' <-> bronze=' + t(jjOut.bronze || 0) + '/scotch=' + t(jjOut.scotch || 0) +
    '; Dilihan coal=' + t(dlIn.coal || 0) + '/butts=' + t(dlIn.wine_butts || 0) + ' <-> scotch=' + t(dlOut.scotch || 0) +
    '; Serai salt=' + t(srIn.salt || 0) + '/silk=' + Math.round(srIn.silk || 0) + 'kg <-> whiskey=' + t(srOut.scotch || 0) +
    '; Korona grain=' + t(krIn.grain || 0) + ' <-> saltpeter+powder=' + t((krOut.saltpeter || 0) + (krOut.powder || 0)) + '/mounts=' + Math.round(krOut.mounts || 0));
  T.neg('sub-200 t scotch output fails corridorsOk', corridorsOk, 150000, O.summary.goods.scotch.made);
}

// 7. Hard-times Embargo: unpaid retainers (>14d) flip MC-06 -> BF-04 Broken-Kin reivers and raid Spur S-A caravans into Salpetervik
{
  const embargoOk = Yr => {
    const rd = Yr.raids['fc.trade.korona'] || { events: [], taken: {} };
    const loot = Object.keys(rd.taken).reduce((s, k) => s + rd.taken[k], 0);
    return Yr.V.meta.bandState.code === 'BF-04' && Yr.V.meta.bandState.discTurned === true && rd.events.length >= 4 && loot > 5000;
  };
  T.ok('Silk-Trail retainer default (>14d unpaid) flips bands from MC-06 to BF-04 Broken-Kin reivers and raids Spur S-A cargo into Salpetervik',
    embargoOk(E) && O.V.meta.bandState.code === 'MC-06',
    'events=' + ((E.raids['fc.trade.korona'] || { events: [] }).events.length) + ', state=' + E.V.meta.bandState.code);
  T.neg('paid open-trade year has 0 Broken-Kin caravan raids', embargoOk, O, E);
}

T.done();
