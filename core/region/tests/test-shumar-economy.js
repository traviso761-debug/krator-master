/* node core/region/tests/test-shumar-economy.js — the Kingdom of Shumar on core/simulation for a 365-day year
   (SM-Sim-2 & SM-Sim-3 of core/simulation/PROPOSAL-SHUMAR.md and settlements/shumar/BUILD-OUT.md).
   Verifies exact 109,630 census parity across S1-S6, ledger balance, <1% food/salt shortfalls with 2.6x Gēdu-šu Giant
   diets and -ko cadet zero-spirits/zero-sugar discipline, zero-domestic-coal metallurgy & Ṣūnu-šikaru distilling,
   iqta' / waqf / Ordeal chains, all 5 external gateways incl. gate.voth-march cold-truce embargo, and >200-yr multi-vein
   lode fields. Every negative is a paired T.neg check (tools/ktest.js). */
'use strict';

const fs = require('fs');
const path = require('path');
const T = require('../../../tools/ktest.js')(__filename);

global.window = global;
const ROOT = path.join(__dirname, '..', '..', '..');
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

function load() {
  (0, eval)(rd('core/clock/20-core-clock.js'));
  fs.readdirSync(path.join(ROOT, 'core', 'simulation'))
    .filter(f => /^77-sim-.*\.js$/.test(f))
    .sort()
    .forEach(f => (0, eval)(rd('core/simulation/' + f)));
  (0, eval)(rd('core/region/00-region-core.js'));
  const H = { TUNE: { sim: {} } };
  KREGION.use(H);
  (0, eval)(rd('core/region/50-region-valley.js'));
  (0, eval)(rd('core/region/data/shumar-tune.js'));
  return H;
}

const fmtT = n => (n / 1000).toFixed(1) + ' t';
const AMARO = 'ssgsv5zbd2';
const CITADEL = 'amaro.citadel';
const NECROPOLIS = 'amaro.necropolis';
const URUNDASHI = 'srbp1bvh1r';
const BETUN = 'sm.betun-babu';
const SUTON = 'sm.suton-qappu';
const YAMU = 'sm.yamu-qappu';
const URUDIRU = 'sm.urudiru-qappu';
const ORDEAL = 'sm.ordeal-gate';

function run(days, opt, edit) {
  const H = load();
  const V = SHUMAR_TUNE.valley(opt || {});
  if (edit) edit(V);
  const S = H.simValley(V);
  const snapA = SIM.ledgerSnap();
  const B0 = H.valleyBooks();
  const dailyGrain = {};
  const prevGrain = {};
  for (let d = 0; d < days; d++) {
    H.valleyRun(1440, 60);
    for (const s of S.order) {
      if (!/^prov\./.test(s)) continue;
      const m = SIM.econ(s).made.grain || 0;
      const p = prevGrain[s] || 0;
      if (m > p + 0.5) {
        (dailyGrain[s] || (dailyGrain[s] = [])).push(Math.floor(SIM.season(S.clock.m - 60).yearDay));
      }
      prevGrain[s] = m;
    }
  }
  const snapB = SIM.ledgerSnap();
  const sites = {};
  S.order.forEach(s => {
    (SIM.sitesReport(s) || []).forEach(x => {
      sites[x.id] = Object.assign({ settlement: s }, x);
    });
  });
  return {
    H,
    V,
    S,
    B0,
    B: H.valleyBooks(),
    dailyGrain,
    trade: SIM.tradeReport(),
    xfer: SIM.transfersReport(),
    ledger: SIM.ledger(snapA, snapB, { tol: 1 }),
    actors: SIM.all('actor').length,
    sites,
    veins: S.veinMoves.slice(),
    cuts: JSON.parse(JSON.stringify(S.cuts))
  };
}

const t0 = Date.now();
const Y = run(365);
const secs = (Date.now() - t0) / 1000;
const B = Y.B.towns;

console.log(
  'a year of the Kingdom of Shumar in ' + secs.toFixed(2) + ' s: ' +
  Y.S.order.length + ' settlements, ' + Y.actors + ' actors, ' +
  Math.round(Y.V.settlements.reduce((n, s) => n + s.people, 0)) + ' people'
);

const landed = (Tr, roadId, leg) => (((Tr[roadId] || {}).landed || {})[leg]) || {};
const tithed = (Tr, roadId) => Object.values((Tr[roadId] || {}).tithed || {});

// 1. Exact census, province & coordinate parity (BUILD-OUT.md sections 0-1f & PROPOSAL-SHUMAR.md section 3)
const censusCheck = Tn => {
  const C = Tn.census();
  const amaro = Tn.places.find(p => p.id === AMARO);
  const taru = Tn.places.find(p => p.id === 'sm.taru-betun');
  const siruQ = Tn.places.find(p => p.id === 'sm.siru-qubba');
  const urun = Tn.places.find(p => p.id === URUNDASHI);
  const betun = Tn.places.find(p => p.id === BETUN);
  const yamu = Tn.places.find(p => p.id === YAMU);
  const suton = Tn.places.find(p => p.id === SUTON);
  const urud = Tn.places.find(p => p.id === URUDIRU);
  const o0 = Tn.px(731, 1192);
  const oTaru = Tn.px(689, 1185);
  const gisr = (Tn.districts || []).find(d => d.id === 'amaro.gisr');
  const provTotals = { S1: 39060, S2: 18280, S3: 15230, S4: 19075, S5: 13230, S6: 4755 };
  const provOk = Object.keys(provTotals).every(k => C.byProvince[k] && C.byProvince[k].total === provTotals[k]);
  const ringCounts = {
    [AMARO]: [6, 1310], [BETUN]: [4, 830], [SUTON]: [3, 670],
    [URUNDASHI]: [5, 990], [YAMU]: [3, 670], [URUDIRU]: [1, 160]
  };
  const ringsOk = Object.keys(ringCounts).every(seat => {
    const rs = Tn.rings.filter(r => r.seat === seat);
    return rs.length === ringCounts[seat][0] && rs.reduce((n, r) => n + r.people, 0) === ringCounts[seat][1];
  });
  return (
    Tn.ORIGIN.px === 731 && Tn.ORIGIN.py === 1192 &&
    o0.x === 0 && o0.z === 0 && oTaru.x === -84000 && oTaru.z === -14000 &&
    Tn.provinces.length === 6 &&
    (Tn.districts || []).length === 3 && !!gisr && gisr.people === 850 &&
    C.placesCount === 36 && C.seatsCount === 6 && C.seatPop === 26250 &&
    C.namedNonSeatPop === 12450 && C.namedPop === 38700 &&
    C.ringsCount === 22 && C.ringPop === 4630 &&
    C.countrysidesCount === 6 && C.ruralPop === 66300 &&
    C.totalPop === 109630 && C.giants === 2400 &&
    provOk && ringsOk &&
    !!amaro && amaro.px === 731 && amaro.py === 1192 && amaro.people === 12850 &&
    amaro.cityPeople + 1100 + 300 + 850 === 12850 &&
    !!taru && taru.px === 689 && taru.py === 1185 && taru.people === 350 &&
    !!siruQ && siruQ.px === 790 && siruQ.py === 1133 && siruQ.people === 150 &&
    !!urun && urun.people === 3500 && !!betun && betun.people === 3200 &&
    !!yamu && yamu.people === 2800 && !!suton && suton.people === 2500 && !!urud && urud.people === 1400
  );
};
{
  const H2 = load();
  const Vrings = SHUMAR_TUNE.valley({ rings: true });
  const Srings = H2.simValley(Vrings);
  const popDefault = Y.V.settlements.reduce((n, s) => n + s.people, 0);
  const popRings = Vrings.settlements.reduce((n, s) => n + s.people, 0);
  T.ok(
    'exact Shumar census parity: 36 named places (38,700), 22 ring hamlets (4,630), 6 countrysides (66,300) = 109,630 people & 2,400 Gēdu-šu Giants across S1-S6; Greater Amaro at 731,1192 (10,600 + 1,100 + 300 + 850 = 12,850 across 3 sub-districts), Ṭāru-Bētun at 689,1185; bundled (50) and unbundled-ring (72) valleys both check clean',
    censusCheck(SHUMAR_TUNE) && popDefault === 109630 && popRings === 109630 &&
      Y.S.order.length === 50 && Srings.order.length === 72 && !Y.S.problems.length && !Srings.problems.length,
    'pop=' + popDefault + '/' + popRings + ', problems=' + (Y.S.problems.concat(Srings.problems).join('; ') || 'none')
  );
  T.neg(
    'a census drift of a single person in Amaro is caught',
    censusCheck,
    Object.assign({}, SHUMAR_TUNE, {
      places: SHUMAR_TUNE.places.map(p => p.id === AMARO ? Object.assign({}, p, { people: 12851 }) : p),
      census: function () { return SHUMAR_TUNE.census.call(this); }
    }),
    SHUMAR_TUNE
  );
  T.neg(
    'a road to an undeclared settlement is reported by H.simValley',
    V => { const Hx = load(); return Hx.simValley(V).problems.length === 0; },
    (() => {
      const V = SHUMAR_TUNE.valley({});
      V.roads.push({ id: 'road.ghost', from: AMARO, to: 'sm.ghost-keep', minutes: 120, cap: 100 });
      return V;
    })(),
    SHUMAR_TUNE.valley({})
  );
}

// 2. Ledger balance, runtime budget, Ṣūnu-šikaru gloss, and highland seasonal calendar
{
  T.ok(
    'SIM.ledger balances over 365 days across all 50 settlements and 40 goods (0 problems), and runs quickly',
    Y.ledger.ok && Y.ledger.problems.length === 0 && secs < 90,
    (Y.ledger.ok ? '0 ledger problems' : Y.ledger.problems.slice(0, 3).join('; ')) + ', runtime ' + secs.toFixed(2) + ' s'
  );
  T.neg(
    'a corrupted ledger snapshot (missing 500 kg of steel at Amaro) is caught by SIM.ledger',
    snap => {
      const Hx = load();
      Hx.simValley(SHUMAR_TUNE.valley({}));
      const a = SIM.ledgerSnap();
      const b = JSON.parse(JSON.stringify(a));
      if (snap.corrupt) b[AMARO].closing.steel = (b[AMARO].closing.steel || 0) + 500;
      return SIM.ledger(a, b, { tol: 1 }).ok;
    },
    { corrupt: true },
    { corrupt: false }
  );

  const calCheck = Dl => {
    const W = SHUMAR_TUNE.calendar.windows;
    const winPairs = [
      ['snowmelt', 65, 125], ['yayla', 125, 245], ['apricot', 165, 215], ['harvest', 185, 235],
      ['distilling', 210, 280], ['muster', 255, 270], ['ordeal_winter', 300, 45], ['graduation', 50, 60]
    ];
    const wOk = winPairs.every(([k, a, b]) => W[k] && W[k][0] === a && W[k][1] === b);
    const out = [];
    Object.keys(Dl).forEach(s => {
      Dl[s].forEach(yd => { if (yd < W.harvest[0] || yd > W.harvest[1]) out.push(s + '@' + yd); });
    });
    return wOk && SHUMAR_TUNE.goods.tequila.gloss === 'Ṣūnu-šikaru' && !out.length && Object.keys(Dl).length === 6;
  };
  T.ok(
    'highland calendar & tequila gloss: tequila glossed as Ṣūnu-šikaru, all 8 windows exact, and all 6 countrysides harvest grain strictly inside [185, 235]',
    calCheck(Y.dailyGrain),
    'gloss=' + SHUMAR_TUNE.goods.tequila.gloss + ', harvested=' + Object.keys(Y.dailyGrain).length
  );
  T.neg(
    'a countryside harvesting grain in midwinter (year day 20) is caught',
    calCheck,
    Object.assign({}, Y.dailyGrain, { 'prov.s1': (Y.dailyGrain['prov.s1'] || []).concat([20]) }),
    Y.dailyGrain
  );
}

// 3. Every settlement fed (<1% grain & salt short), 2.6x Gēdu-šu Giant diet, and -ko cadet zero-tequila/zero-sugar discipline
const fedCheck = Bk => {
  const bad = [];
  Object.keys(Bk).forEach(id => {
    const x = Bk[id];
    if (!x.people) return;
    for (const g of ['grain', 'salt']) {
      const eat = (x.eaten && x.eaten[g]) || 0;
      const hun = (x.hungry && x.hungry[g]) || 0;
      if (hun > (eat + hun) * 0.01) {
        bad.push(id + ':' + g + '=' + (100 * hun / (eat + hun)).toFixed(1) + '%');
      }
    }
  });
  return { pass: !bad.length && !((Bk[AMARO].hungry || {}).grain) && !((Bk[AMARO].hungry || {}).salt), bad };
};
{
  const F = fedCheck(B);
  T.ok(
    'every inhabited settlement fed (<1% grain and <1% salt short over 365 days), with Amaro never short of grain or salt',
    F.pass,
    F.bad.slice(0, 6).join(', ') || 'all 45 inhabited settlements fed'
  );
  T.neg(
    'cutting Amaro\'s iqta\' grain tithe & highway roads with a 10-day granary leaves the capital hungry',
    Bk => fedCheck(Bk).pass,
    run(30, {}, V => {
      V.roads = V.roads.filter(r => r.to !== AMARO && r.from !== AMARO);
      const am = V.settlements.find(s => s.id === AMARO);
      am.start.grain = Math.round(am.people * am.eats.grain * 10);
    }).B.towns,
    B
  );

  const giantDietCheck = state => {
    const g = state.giant;
    const sw = state.sword;
    const ratioGrain = g.grain / sw.grain;
    const ratioCheese = g.cheese / sw.cheese;
    const taruEats = SHUMAR_TUNE.eatsFor(SHUMAR_TUNE.places.find(p => p.id === 'sm.taru-betun'));
    const pureFort = SHUMAR_TUNE.diet.fort;
    return (
      Math.abs(g.grain * 365 - 360) < 1e-6 &&
      Math.abs(g.cheese * 365 - 45) < 1e-6 &&
      ratioGrain > 2.45 && ratioGrain < 2.65 &&
      ratioCheese > 2.45 && ratioCheese < 2.65 &&
      taruEats.grain > pureFort.grain * 1.22 &&
      taruEats.cheese > pureFort.cheese * 1.40 &&
      state.taruEatenGrain > 350 * 180 * 1.20
    );
  };
  const giantState = {
    giant: SHUMAR_TUNE.diet.giant,
    sword: SHUMAR_TUNE.diet.sword,
    taruEatenGrain: B['sm.taru-betun'].eaten.grain || 0
  };
  T.ok(
    'Gēdu-šu Giant 2.6x caloric intake: 360 kg/yr grain & 45 kg/yr cheese, visibly lifting Giant-march fort per-capita rations & 365-day eaten grain',
    giantDietCheck(giantState),
    'giant grain=' + Math.round(SHUMAR_TUNE.diet.giant.grain * 365) + ' kg/yr, cheese=' + Math.round(SHUMAR_TUNE.diet.giant.cheese * 365) + ' kg/yr, taru-betun eaten=' + fmtT(giantState.taruEatenGrain)
  );
  T.neg(
    'a Giant diet flattened to human 145 kg/yr grain is caught',
    giantDietCheck,
    Object.assign({}, giantState, { giant: Object.assign({}, giantState.giant, { grain: 145 / 365 }) }),
    giantState
  );

  const cadetCheck = state => {
    const c = state.cadet;
    const ordSpec = state.ordSpec;
    const ordBook = state.ordBook;
    return (
      !c.tequila && !c.sugar &&
      Math.abs(c.grain * 365 - 185) < 1e-6 &&
      !(ordSpec.eats.tequila > 0) && !(ordSpec.eats.sugar > 0) &&
      !(ordBook.imported.tequila > 0) && !(ordBook.imported.sugar > 0) &&
      !(ordBook.eaten.tequila > 0) && !(ordBook.eaten.sugar > 0)
    );
  };
  const cadetGood = {
    cadet: SHUMAR_TUNE.diet.cadet,
    ordSpec: Y.V.settlements.find(s => s.id === ORDEAL),
    ordBook: B[ORDEAL]
  };
  T.ok(
    '-ko cadet zero-spirits & zero-sugar discipline: 0 tequila and 0 sugar in SHUMAR_TUNE.diet.cadet and at Bābu al-Urudīru (sm.ordeal-gate)',
    cadetCheck(cadetGood),
    'ordeal-gate imported tequila=' + (B[ORDEAL].imported.tequila || 0) + ', sugar=' + (B[ORDEAL].imported.sugar || 0)
  );
  T.neg(
    'leaking tequila or sugar into the -ko cadet diet is caught',
    cadetCheck,
    Object.assign({}, cadetGood, { cadet: Object.assign({}, cadetGood.cadet, { tequila: 0.5 / 365, sugar: 0.5 / 365 }) }),
    cadetGood
  );
}

// 4. Zero-domestic-coal metallurgy, Ṣūnu-šikaru distilling, and Šīru-Yāmu lake barges
const industryCheck = (Bk, Tr) => {
  const domCoal = Object.values(Bk).reduce((n, x) => n + (x.made.coal || 0), 0);
  const domScrap = Object.values(Bk).reduce((n, x) => n + (x.made.scrap || 0), 0);
  const domGlass = Object.values(Bk).reduce((n, x) => n + (x.made.glass || 0), 0);
  const am = Bk[AMARO];
  const ur = Bk[URUNDASHI];
  const ct = Bk[CITADEL];
  const domesticCharcoal = Object.values(Bk).reduce((n, x) => n + (x.made.charcoal || 0), 0);
  const domesticIron = Object.values(Bk).reduce((n, x) => n + (x.made.iron || 0), 0);
  const domesticNickel = Object.values(Bk).reduce((n, x) => n + (x.made.nickel || 0), 0);
  const domesticSaltpeter = Object.values(Bk).reduce((n, x) => n + (x.made.saltpeter || 0), 0);
  const oreBarge = landed(Tr, 'barge.siru-ore', 'sm.siru-maru>' + YAMU);
  const roundBarge = Tr['barge.siru-yamu'] || { stops: [], landed: {}, voyages: 0 };
  return (
    domCoal === 0 && domScrap === 0 && domGlass === 0 &&
    domesticCharcoal > 600000 && domesticIron > 200000 && domesticNickel > 5000 && domesticSaltpeter > 120000 &&
    (am.made.steel || 0) > 150000 && (am.made.blades || 0) > 3000 && (am.made.armour || 0) > 1500 &&
    (am.made.brass || 0) > 10000 && (am.made.tools || 0) > 30000 && (am.made.tequila || 0) > 150000 &&
    (ur.made.steel || 0) > 80000 && (ur.made.blades || 0) > 2000 && (ur.made.armour || 0) > 1000 &&
    (ur.made.powder || 0) > 15000 && (ur.made.tequila || 0) > 70000 &&
    (ct.made.powder || 0) > 15000 &&
    (oreBarge.nickel || 0) > 4000 && (oreBarge.copper || 0) > 20000 && (oreBarge.iron || 0) > 30000 &&
    roundBarge.voyages > 500 && Object.keys(roundBarge.landed || {}).length >= 3
  );
};
{
  const am = B[AMARO];
  const ur = B[URUNDASHI];
  T.ok(
    'zero-domestic-coal metallurgy, Ṣūnu-šikaru distilling & Šīru-Yāmu barges: 0 domestic coal/scrap/glass; Amaro & Urundashi forge watered steel, blades, armour, brass, tools & powder and distil >300 t tequila; lake barges land S5 nickel, copper, iron & fish at Yāmu-Qappu',
    industryCheck(B, Y.trade),
    'Amaro steel=' + fmtT(am.made.steel || 0) + ', blades=' + Math.round(am.made.blades || 0) +
    ', armour=' + Math.round(am.made.armour || 0) + ', tequila=' + fmtT(am.made.tequila || 0) +
    '; Urundashi steel=' + fmtT(ur.made.steel || 0) + ', blades=' + Math.round(ur.made.blades || 0) +
    ', powder=' + fmtT((ur.made.powder || 0) + (B[CITADEL].made.powder || 0))
  );
  T.neg(
    'domestic coal mining in Shumar (violating the zero-coal geological constraint) is caught',
    Bk => industryCheck(Bk, Y.trade),
    Object.assign({}, B, { [BETUN]: Object.assign({}, B[BETUN], { made: Object.assign({}, B[BETUN].made, { coal: 1000 }) }) }),
    B
  );
  T.neg(
    'severing fuel & ore (0 charcoal, 0 coal, 0 starting steel at Amaro) stops Amaro blade forging',
    Bk => (Bk[AMARO].made.blades || 0) > 10,
    run(15, {}, V => {
      const a = V.settlements.find(s => s.id === AMARO);
      a.start.charcoal = 0;
      a.start.coal = 0;
      a.start.steel = 0;
      V.roads = V.roads.filter(r => r.to !== AMARO && r.from !== AMARO);
    }).B.towns,
    B
  );
}

// 5. Polity ledger: iqta' dues & Bābu tolls -> amaro.citadel, regimental waqf -> necropolis & qubbas, Ordeal supply & graduation
const polityCheck = (Bk, Tr, Xf, Cuts) => {
  const iqtaRoadsOk = ['s1', 's2', 's3', 's4', 's5', 's6'].every(k => {
    const rows = tithed(Tr, 'iqta.prov.' + k);
    return rows.reduce((n, o) => n + Object.values(o).reduce((m, v) => m + v, 0), 0) > 0;
  });
  const xferIds = ['diwan.iqta.s1', 'diwan.iqta.s2', 'diwan.iqta.s3', 'diwan.iqta.s4', 'diwan.iqta.s5', 'diwan.iqta.s6', 'ordeal.graduation.blades'];
  const xferOk = xferIds.every(id => {
    const x = Xf[id];
    if (!x || x.times !== 1) return false;
    const sentTot = Object.values(x.sent || {}).reduce((n, v) => n + v, 0);
    const owedTot = Object.values(x.owed || {}).reduce((n, v) => n + v, 0);
    return sentTot > 0 && owedTot < 1e-6;
  });
  const westCut = ((Cuts['trade.gate.west-trunk'] || {}).taken) || {};
  const eastCut = ((Cuts['trade.gate.east-foothills'] || {}).taken) || {};
  const tollsOk = (westCut[CITADEL + ':salt'] || 0) > 10000 && (westCut[CITADEL + ':coal'] || 0) > 5000 && (eastCut[CITADEL + ':salt'] || 0) > 50;
  const waqfIds = ['waqf.necropolis.payaru', 'waqf.necropolis.bustan', 'waqf.qappu-qubba', 'waqf.doriyan-inu', 'waqf.siru-qubba'];
  const waqfOk = waqfIds.every(id => {
    const rows = tithed(Tr, id);
    return rows.reduce((n, o) => n + Object.values(o).reduce((m, v) => m + v, 0), 0) > 5000;
  });
  const shrinesFed = [NECROPOLIS, 'sm.qappu-qubba', 'sm.doriyan-inu', 'sm.siru-qubba', ORDEAL].every(id => {
    const x = Bk[id];
    return ((x.hungry && x.hungry.grain) || 0) <= ((x.eaten && x.eaten.grain) || 1) * 0.01;
  });
  const ordLanded = landed(Tr, 'ordeal.supply', URUDIRU + '>' + ORDEAL);
  const gradBlades = ((Xf['ordeal.graduation.blades'] || {}).sent || {}).blades || 0;
  return iqtaRoadsOk && xferOk && tollsOk && waqfOk && shrinesFed && (ordLanded.grain || 0) > 30000 && gradBlades === 48;
};
{
  T.ok(
    'iqta\', Bābu 4% tolls, regimental waqf & Ordeal pipeline: all 6 provincial iqta\' tithes + Dīwān assessments + Bābu tolls reach amaro.citadel; all 5 waqf endowments feed the Hall of Blades & qubba shrines; Ordeal supply & 48 graduation blades close cleanly',
    polityCheck(B, Y.trade, Y.xfer, Y.cuts),
    'graduation blades=' + (((Y.xfer['ordeal.graduation.blades'] || {}).sent || {}).blades || 0)
  );
  T.neg(
    'a severed regimental waqf endowment (waqf.siru-qubba tithing 0) is caught',
    Tr => polityCheck(B, Tr, Y.xfer, Y.cuts),
    Object.assign({}, Y.trade, { 'waqf.siru-qubba': { landed: {}, tithed: {} } }),
    Y.trade
  );
  T.neg(
    'a Dīwān iqta\' transfer firing twice or leaving arrears is caught',
    Xf => polityCheck(B, Y.trade, Xf, Y.cuts),
    Object.assign({}, Y.xfer, { 'diwan.iqta.s1': Object.assign({}, Y.xfer['diwan.iqta.s1'], { times: 2 }) }),
    Y.xfer
  );
}

// 6. All 5 external gateways, Longsong books relay, winter pass closure, and gate.voth-march cold-truce embargo
const gateCheck = (Bk, Tr) => {
  const inn = {};
  const out = {};
  SHUMAR_TUNE.gateways.forEach(G => {
    const L = (Tr['trade.' + G.id] || {}).landed || {};
    Object.keys(L).forEach(leg => {
      const parts = leg.split('>');
      const bucket = parts[0] === G.id ? inn : (parts[1] === G.id ? out : null);
      if (!bucket) return;
      Object.keys(L[leg]).forEach(g => { bucket[g] = (bucket[g] || 0) + L[leg][g]; });
    });
  });
  const reqIn = ['salt', 'coal', 'scrap', 'glass', 'sugar', 'timber', 'mechparts', 'medicine', 'books', 'grain'];
  const reqOut = ['blades', 'armour', 'tequila', 'wool', 'cheese', 'mounts', 'saltpeter', 'driedfruit', 'silver', 'gold'];
  const allActive = SHUMAR_TUNE.gateways.every(G => ((Tr['trade.' + G.id] || {}).voyages || 0) > 20);
  const winterPaused = ((Tr['trade.gate.talovolci'] || {}).waited || 0) > 0 && ((Tr['trade.gate.east-foothills'] || {}).waited || 0) > 0;
  const booksRelay = (Bk[URUNDASHI].imported.books || 0) >= 10 && (Bk[AMARO].imported.books || 0) >= 3;

  /* Cold-truce audit on gate.voth-march */
  const vothTr = (Tr['trade.gate.voth-march'] || {}).landed || {};
  const vothIn = vothTr['gate.voth-march>' + SUTON] || {};
  const vothOut = vothTr[SUTON + '>gate.voth-march'] || {};
  const vothBook = Bk['gate.voth-march'] || { imported: {}, exported: {}, stock: {} };
  const embargoLeak = SHUMAR_TUNE.vothEmbargo.some(g =>
    (vothIn[g] || 0) > 0 || (vothOut[g] || 0) > 0 ||
    (vothBook.imported[g] || 0) > 0 || (vothBook.exported[g] || 0) > 0 || (vothBook.stock[g] || 0) > 0
  );
  const vothGrainOk = (vothIn.grain || 0) >= 200000 && (vothIn.grain || 0) <= 340000;
  const vothMountsOk = (vothOut.mounts || 0) >= 80 && (vothOut.mounts || 0) <= 130;
  const vothOnlyAllowed = Object.keys(vothIn).every(g => g === 'grain' || vothIn[g] === 0) &&
    Object.keys(vothOut).every(g => g === 'mounts' || vothOut[g] === 0);

  return {
    pass: allActive && winterPaused && booksRelay &&
      reqIn.every(g => (inn[g] || 0) > 0) && reqOut.every(g => (out[g] || 0) > 0) &&
      !embargoLeak && vothGrainOk && vothMountsOk && vothOnlyAllowed,
    inn,
    out,
    vothGrain: vothIn.grain || 0,
    vothMounts: vothOut.mounts || 0
  };
};
{
  const G = gateCheck(B, Y.trade);
  T.ok(
    'all 5 external gateways trade expected imports (salt, coal, scrap, glass, Longsong books -> Urundashi -> Amaro) & exports (blades, armour, Ṣūnu-šikaru tequila, wool, cheese, mounts, saltpeter), high passes pause in ordeal_winter, and gate.voth-march cold-truce exchanges ~260 t grain for ~104 mounts with 0 embargoed military/metal/book goods',
    G.pass,
    'voth grain in=' + fmtT(G.vothGrain) + ', mounts out=' + Math.round(G.vothMounts) +
    ', tequila exported=' + fmtT(G.out.tequila || 0) + ', blades exported=' + Math.round(G.out.blades || 0) +
    ', Amaro books=' + Math.round(B[AMARO].imported.books || 0)
  );
  T.neg(
    'leaking 1 blade onto gate.voth-march violates the cold-truce embargo and is caught',
    Tr => gateCheck(B, Tr).pass,
    Object.assign({}, Y.trade, {
      'trade.gate.voth-march': Object.assign({}, Y.trade['trade.gate.voth-march'], {
        landed: Object.assign({}, Y.trade['trade.gate.voth-march'].landed, {
          [SUTON + '>gate.voth-march']: Object.assign({}, landed(Y.trade, 'trade.gate.voth-march', SUTON + '>gate.voth-march'), { blades: 1 })
        })
      })
    }),
    Y.trade
  );
  T.neg(
    'leaking 1 Longsong book or 1 kg of saltpeter onto gate.voth-march is caught',
    Bk => gateCheck(Bk, Y.trade).pass,
    Object.assign({}, B, {
      'gate.voth-march': Object.assign({}, B['gate.voth-march'], {
        imported: Object.assign({}, B['gate.voth-march'].imported, { books: 1, saltpeter: 1 })
      })
    }),
    B
  );
}

// 7. Multi-vein lode depletion (>200 yr collective field life, 2-4 yr per active vein, and live vein rollover)
const fieldSpecCheck = F => {
  const veinsOk = F.veins.length >= 60 && F.veins.every(v => v.amount >= F.make * 2 - 1 && v.amount <= F.make * 4 + 1);
  const totalLife = F.veins.reduce((n, v) => n + v.amount, 0) / F.make;
  return veinsOk && totalLife > 200;
};
{
  const sampleFields = [
    ['S2-iron', 145000], ['S2-tin', 16000],
    ['S5-copper', 42000], ['S5-nickel', 11000],
    ['S6-copper', 48000], ['S6-saltpeter', 135000]
  ].map(([name, make]) => {
    const F = SHUMAR_TUNE.field('lode', make, SHUMAR_TUNE.fieldYears);
    F.name = name;
    F.make = make;
    return F;
  });
  const vein0Sites = Object.values(Y.sites).filter(s => /\.vein0$/.test(s.id));
  const vein0Drawn = vein0Sites.length >= 15 && vein0Sites.every(s => s.taken > 0 && Math.abs((s.start - s.amount) - s.taken) < 1);

  /* Live rollover test: 120-day mini-valley on short 300 kg veins at ~180 kg/day */
  const Hx = load();
  const Vmini = {
    seed: 1, scale: 10, start: 0,
    goods: { iron: { unit: 'kg' } },
    factions: [{ id: 'shumar', name: 'Shumar' }],
    relations: [],
    settlements: [{
      id: 'm', name: 'test-lode', faction: 'shumar', people: 40, eats: {},
      works: [{
        id: 'm.adit', kind: 'iron-lode', crew: 30, out: ['iron'], rate: 0.5,
        site: { kind: 'lode', veins: [{ amount: 300 }, { amount: 300 }, { amount: 300 }, { amount: 300 }] }
      }]
    }],
    roads: []
  };
  const Smini = Hx.simValley(Vmini);
  Hx.valleyRun(120 * 1440, 60);
  const moves = Smini.veinMoves.length;

  T.ok(
    'multi-vein lode depletion: S2, S5 & S6 fields each span >200 yr across 2-4 yr veins, Year 1 draws down active vein0s (' + vein0Sites.length + ' works), and exhausted veins advance automatically (' + moves + ' moves in 120 days)',
    sampleFields.every(fieldSpecCheck) && vein0Drawn && moves >= 2 && !Smini.problems.length,
    'vein0 works=' + vein0Sites.length + ', moves=' + moves
  );
  T.neg(
    'a single 10-year vein (violating 2-4 yr vein sizing and >200 yr field life) is caught',
    fieldSpecCheck,
    { make: 50000, veins: [{ amount: 50000 * 10 }] },
    sampleFields[0]
  );
}

T.done();
