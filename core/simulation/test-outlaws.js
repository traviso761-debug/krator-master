// node core/simulation/test-outlaws.js: core/simulation's outlaws, pirates & bounties (`77-sim-6-outlaws.js`,
// BANDITS-PIRATES-BOUNTIES-SCOPE.md Rulings #90-94 & PLAN-RAIDS.md R1) — every check paired with its negative (`tools/ktest.js`).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
global.window = global;

function freshSim() {
  vm.runInThisContext(rd('core/clock/20-core-clock.js'), { filename: '20-core-clock.js' });
  fs.readdirSync(path.join(ROOT, 'core', 'simulation'))
    .filter(f => /^77-sim-.*\.js$/.test(f)).sort()
    .forEach(f => vm.runInThisContext(rd('core/simulation/' + f), { filename: f }));
}

// ---- 1. Inertness when unused & full persistent templates (BF-01..10, PF-01..06)
freshSim();
T.ok('77-sim-6-outlaws.js is strictly inert until SIM.outlaws / SIM.bounty is called',
  SIM.OUTLAWS === null && SIM.BOUNTY === null && Object.keys(SIM.OUTLAW_TEMPLATES).length === 16);
T.ok('BF-05 Salt-Thirsters, BF-06 Glass-Eaters & BF-07 Tin-Skulls carry their distinct ethos, appetites and bluff/bribe mechanics',
  SIM.OUTLAW_TEMPLATES['BF-05'].wants[0] === 'water' &&
  SIM.OUTLAW_TEMPLATES['BF-06'].fenceSell.indexOf('fireclay') >= 0 &&
  SIM.OUTLAW_TEMPLATES['BF-07'].bluffGear.indexOf('ancient') >= 0 &&
  /SERIAL NUMBER/.test(SIM.OUTLAW_TEMPLATES['BF-07'].dialogue));

// ---- 2. 5-Stage Procedural Lifecycle & Orderliness Bands
function runLifecycle(seed) {
  freshSim();
  SIM.outlaws({
    seed,
    zones: [
      { id: 'heartland', orderliness: 0.85, targetOrder: 0.85, legs: ['rd.heart'] },
      { id: 'bowl', orderliness: 0.62, targetOrder: 0.32, legs: ['rd.mantis', 'rd.verge', 'rd.solta', 'rd.talia'] }
    ],
    factions: [
      { id: 'BF-01', zone: 'heartland' },
      { id: 'BF-05', zone: 'bowl', stage: 'dormant', budCap: 80 }
    ]
  });
  SIM.bounty({ seed, warrants: [{ id: 'w.bf05.boss', target: 'BF-05.boss.0', outlawFaction: 'BF-05', polity: 'iziz', tier: 3, amount: 1000 }] });
  /* Step 12 weeks so bowl orderliness drops < 0.55 and BF-05 emerges -> active */
  for (let w = 1; w <= 12; w++) SIM.outlawsStep(w * 7 * 1440);
  const afterEmerge = JSON.parse(JSON.stringify(SIM.outlawsReport()));
  /* Deposit raided loot above budCap -> buds an extra sub-camp */
  SIM.outlawDeposit('BF-05', { water: 60, grain: 40 }, 12 * 7 * 1440);
  const subsAfterBud = SIM.OUTLAWS.factions['BF-05'].subCamps.filter(c => c.active).map(c => c.id);
  /* Prune one sub-camp -> 30..60 day safe window on its leg */
  const pr = SIM.outlawPruneSub('BF-05', subsAfterBud[0], 13 * 7 * 1440);
  /* Decapitate Named Boss via Tier 3 dead claim -> shatters HQ & scatters all sub-camps */
  const cl = SIM.bountyClaim({ id: 'w.bf05.boss', mode: 'dead', minute: 14 * 7 * 1440, claimant: 'player.hero' });
  const afterShatter = JSON.parse(JSON.stringify(SIM.outlawsReport()));
  /* Advance past 90-day succession cooldown with orderliness still < 0.50 -> vengeful Lieutenant Successor rises! */
  for (let w = 15; w <= 30; w++) SIM.outlawsStep(w * 7 * 1440);
  const afterSuccession = JSON.parse(JSON.stringify(SIM.outlawsReport()));
  return { afterEmerge, subsAfterBud, pr, cl, afterShatter, afterSuccession, boss: SIM.OUTLAWS.factions['BF-05'].boss };
}

const L1 = runLifecycle(99), L2 = runLifecycle(99);
T.ok('SIM.outlaws 5-stage lifecycle is 100% deterministic across runs',
  JSON.stringify(L1) === JSON.stringify(L2));
T.neg('orderliness >= 0.80 keeps heartland dormant (0 sub-camps), while < 0.55 emerges & buds in the Bowl',
  z => L1.afterEmerge.factions[z].stage === 'dormant' && L1.afterEmerge.factions[z].subCamps === 0,
  'BF-05', 'BF-01');
T.ok('surplus cache triggers sub-camp budding, and pruning a sub-camp grants a 30-60 day leg safe window',
  L1.subsAfterBud.length >= 2 && !!L1.pr && L1.pr.safeDays >= 30 && L1.pr.safeDays <= 60);
T.ok('turning in a Tier 3 Boss warrant shatters the HQ (0 sub-camps) at 0.55x proof-of-death payout, then spawns a vengeful successor after 90d',
  L1.cl.ok && L1.cl.mult === 0.55 && L1.cl.paidCoin === 550 &&
  L1.afterShatter.factions['BF-05'].stage === 'shattered' && L1.afterShatter.factions['BF-05'].subCamps === 0 &&
  L1.afterSuccession.factions['BF-05'].stage === 'active' && L1.boss.generation === 1 && L1.boss.grudge === 'player.hero');

// ---- 3. Ruling #94: City Fall / Foreign Conquest Shock (`onCityConquered`) & Pacification Gates
freshSim();
SIM.outlaws({
  seed: 325,
  zones: [{ id: 'hook-coast', polity: 'voth', orderliness: 0.78, targetOrder: 0.78, legs: ['rd.hook.marr'] }],
  factions: [{ id: 'BF-10', zone: 'hook-coast', stage: 'dormant' }]
});
const shock = SIM.onCityConquered({ zone: 'hook-coast', city: 'hook', fromPolity: 'voth', toPolity: 'iziz', starving: true, minute: 1440 });
T.ok('Ruling #94: onCityConquered plunges orderliness by 0.45..0.60 (floored >= 0.10), wakes dormant gangs and spawns Deserter Bands',
  shock.drop >= 0.45 && shock.orderliness >= 0.10 && shock.orderliness <= 0.35 && shock.deserters.length >= 2 &&
  SIM.OUTLAWS.factions['BF-10'].stage !== 'dormant');

/* Starving / ungarrisoned occupation stalls <= 0.34 even after 10 weeks! */
for (let w = 1; w <= 10; w++) SIM.outlawsStep(w * 7 * 1440);
const stalledOrd = SIM.OUTLAWS.zones['hook-coast'].orderliness;
/* Now station garrison, feed city, repair walls & fund bounties -> orderliness climbs +0.04/wk above 0.65! */
Object.assign(SIM.OUTLAWS.zones['hook-coast'], { starving: false, unrest: 0.15, garrison: 0.85, wallsRepaired: true, bountiesFunded: true });
for (let w = 11; w <= 26; w++) SIM.outlawsStep(w * 7 * 1440);
const pacifiedOrd = SIM.OUTLAWS.zones['hook-coast'].orderliness;
T.neg('Ruling #94: foreign occupier starving a conquered city stalls < 0.35, whereas garrison + repairs + bounties pacifies >= 0.65',
  ord => ord >= 0.65, stalledOrd, pacifiedOrd);

// ---- 4. Conserved Money (`SIM.pay`), Live Rescue Ambush, Feral/Stalker 1.0x Dead Payout, Prison Break & Tier 4 Relativity
freshSim();
SIM.money({ currencies: { tal: { name: 'Talent', talent: 1 } } });
SIM.account({ id: 'treasury:talia', kind: 'treasury', currency: 'tal', settlement: 'talia' });
SIM.account({ id: 'player:hunter', kind: 'player', currency: 'tal', settlement: 'talia' });
SIM.account({ id: 'fence:bf06', kind: 'guild', currency: 'tal', settlement: 'talia' });
SIM.mint('treasury:talia', 5000, 'endowment');
SIM.mint('fence:bf06', 1000, 'black-market-float');
const supplyBefore = SIM.moneyReport().currencies.tal.supply;

SIM.outlaws({
  seed: 77,
  zones: [{ id: 'catch', orderliness: 0.30, legs: ['rd.1', 'rd.2', 'rd.3'] }],
  factions: [
    { id: 'BF-06', zone: 'catch', initialSubs: 3 },
    { id: 'BF-07', zone: 'catch', initialSubs: 3 }
  ]
});
SIM.bounty({
  seed: 77,
  warrants: [
    { id: 'w.stalker', target: 'stalker.unit', targetKind: 'stalker', issuerSettlement: 'talia', polity: 'iziz', tier: 2, amount: 200, standing: true },
    { id: 'w.bf07.boss', target: 'BF-07.boss.0', outlawFaction: 'BF-07', issuerSettlement: 'talia', polity: 'iziz', tier: 3, amount: 1000 },
    { id: 'w.hm19', target: 'monk.operative', targetKind: 'political', issuerSettlement: 'talia', polity: 'voth', tier: 4, amount: 2000, sanctuaries: ['longsong', 'keepwell'] }
  ],
  manhunters: [{ id: 'mh.voth', name: 'Ordinator Hound-Pack', polity: 'voth', strength: 11 }]
});

/* Stalker proof-of-death pays full 1.0x (200 Talents), unlike human outlaw 0.55x */
const stClaim = SIM.bountyClaim({ id: 'w.stalker', mode: 'dead', claimantAcct: 'player:hunter', minute: 60 });
T.ok('Stalker/feral warrant pays 1.0x on proof-of-death and remains open when `standing: true`',
  stClaim.ok && stClaim.mult === 1.0 && stClaim.paidCoin === 200 && SIM.BOUNTY.warrants['w.stalker'].status === 'open');

/* Weak escort marching live Boss past 3 active sub-camps gets ambushed & freed; strong escort succeeds at 1.0x (1000 Talents) and jails Boss */
const weakEscort = SIM.bountyClaim({ id: 'w.bf07.boss', mode: 'live', escortStrength: 2, claimantAcct: 'player:hunter', minute: 120 });
const strongEscort = SIM.bountyClaim({ id: 'w.bf07.boss', mode: 'live', escortStrength: 20, claimantAcct: 'player:hunter', minute: 180 });
T.neg('live Boss march with weak escort fails sub-camp road rescue ambush, whereas strong escort delivers for 1.0x payout and jails Boss',
  res => res.ok && res.paidCoin === 1000 && !!res.jailed, weakEscort, strongEscort);

/* Prison break fails against high garrison standing (>= 0.35) and succeeds when garrison standing drops (< 0.35) */
const heldJail = SIM.bountyPrisonBreak({ target: 'BF-07.boss.0', garrisonStanding: 0.70, minute: 300 });
const brokenJail = SIM.bountyPrisonBreak({ target: 'BF-07.boss.0', garrisonStanding: 0.20, minute: 360 });
T.neg('SIM.bountyPrisonBreak is blocked by strong garrison (>= 0.35) and frees the Boss when standing drops (< 0.35)',
  res => res.ok && SIM.OUTLAWS.factions['BF-07'].stage === 'foothold', heldJail, brokenJail);

/* Tier 4 jurisdictional relativity + Manhunters */
T.neg('Tier 4 warrant makes operative hunted by Manhunters in Voth while granting hero sanctuary in Longsong',
  pol => SIM.bountyWantedAt('monk.operative', pol).sanctuary && !SIM.bountyManhunterCheck('monk.operative', pol, 400).challenged,
  'voth', 'longsong');

/* Stance & 75% fence + Letter of Marque + strict coin conservation */
const deniedFence = SIM.outlawFence({ faction: 'BF-06', seller: 'player', baseValue: 200, fenceAcct: 'fence:bf06', sellerAcct: 'player:hunter' });
SIM.outlawStance('BF-06', 'player', 'associate');
const okFence = SIM.outlawFence({ faction: 'BF-06', seller: 'player', baseValue: 200, fenceAcct: 'fence:bf06', sellerAcct: 'player:hunter', goods: { fireclay: 10 } });
T.neg('75% black-market fence refuses hostile strangers and pays 75% (150 Talents) once `associate`',
  r => r.ok && r.paid === 150 && SIM.outlawExempt('BF-06', 'player'), deniedFence, okFence);

const mq = SIM.issueMarque({ holder: 'PF-02', issuerPolity: 'iziz', targetPolity: 'voth', enemyBounty: 1200 });
const prize = SIM.adjudicatePrize(mq.id, 500, 'treasury:talia', 'player:hunter');
T.ok('Letter of Marque splits prizes 80% privateer / 20% Crown fifth and posts enemy pirate warrant in target polity',
  prize.holderGets === 400 && prize.crownFifth === 100 && SIM.bountyWantedAt('PF-02', 'voth').wanted && SIM.bountyWantedAt('PF-02', 'iziz').sanctuary);

/* Standing trophy-exchange bounty (`trophyGood`: Stalker pneumatic guns & Ancient-alloy blades at high exchange price) */
SIM.bountyPost({
  id: 'w.stalker.gun', target: 'st_harpooner', targetKind: 'stalker', trophyGood: 'stalker_guns',
  polity: 'yuni', issuerAcct: 'treasury:talia', tier: 2, amount: 420, standing: true
});
const emptyGunClaim = SIM.bountyClaim({ id: 'w.stalker.gun', mode: 'dead', count: 2, trophiesDelivered: 0, claimantAcct: 'player:hunter' });
const paidGunClaim = SIM.bountyClaim({ id: 'w.stalker.gun', mode: 'dead', count: 2, trophiesDelivered: 2, claimantAcct: 'player:hunter' });
T.neg('Stalker weapon exchange warrant refuses claims with zero salvaged guns and pays full 1.0x high exchange price (840 Talents for 2 pneumatic guns) when delivered',
  r => r.ok && r.trophyGood === 'stalker_guns' && r.trophiesExchanged === 2 && r.paidCoin === 840 && SIM.BOUNTY.warrants['w.stalker.gun'].status === 'open',
  emptyGunClaim, paidGunClaim);

const supplyAfter = SIM.moneyReport().currencies.tal.supply;
T.ok('all bounty payouts, black-market fencing and Crown fifths strictly conserve currency supply (zero mint/burn)',
  supplyBefore === supplyAfter && SIM.acct('treasury:talia').balance + SIM.acct('player:hunter').balance + SIM.acct('fence:bf06').balance === supplyBefore);
T.done();
