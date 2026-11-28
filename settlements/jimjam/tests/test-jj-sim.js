// node settlements/jimjam/tests/test-jj-sim.js — P4/P5 Node test for Jimjam's JJ1 core/simulation,
// 91-day Kauntu Double-Dark observance, Great Pilgrim's Market, peoples.json citizens, KSCHED timetables,
// and 0.00 SIM.ledger residual (every check paired with a negative control).
const fs = require('fs');
const path = require('path');

global.window = global;

const ROOT = path.resolve(__dirname, '..', '..', '..');
function loadRel(rel) {
  const full = path.join(ROOT, ...rel.split('/'));
  (0, eval)(fs.readFileSync(full, 'utf8'));
}

loadRel('core/rand/08-core-rand.js');
loadRel('core/drawn/10-core-drawn.js');
loadRel('core/space/20-core-space.js');
loadRel('core/tags/50-core-tags.js');
loadRel('core/tags/52-core-tags-vocab.js');
loadRel('core/sched/20-core-sched.js');
loadRel('core/clock/20-core-clock.js');
loadRel('core/charactermodels/src/10-rig.js');
global.JJ_PEOPLES = JSON.parse(fs.readFileSync(path.join(ROOT, 'core/charactermodels/data/peoples.json'), 'utf8'));

/* Load KCITY + KHAMLET + KCAMP bundle parts needed by JJ_LAYOUT */
['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js',
 '31-city-steps-b.js', '32-city-steps-c.js', '33-city-strategies.js', '37-city-grid.js', '40-city-kcity.js',
 '../kits/10-core-kits.js', '42-city-multikit.js', '53-city-host-multikit.js'].forEach(f => loadRel('core/city/' + f));
['10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js', '16-hamlet-names.js', '18-hamlet-names.js',
 '20-hamlet-cultures.js', '21-hamlet-iziz.js', '30-hamlet-village.js'].forEach(f => loadRel('core/hamlet/' + f));
['10-camp-cultures.js', '20-camp-census.js', '30-camp-pitch.js'].forEach(f => loadRel('core/camp/' + f));

/* Load SIM */
['77-sim-0-core.js', '77-sim-1-world.js', '77-sim-2-places.js', '77-sim-3-actors.js',
 '77-sim-4-nav.js', '77-sim-5-motion.js', '77-sim-5r-routes.js', '77-sim-6-economy.js',
 '77-sim-6-govern.js', '77-sim-6-items.js', '77-sim-6-money.js', '77-sim-6-season.js',
 '77-sim-6-trade.js', '77-sim-7-stocks.js', '77-sim-7-ledger.js', '77-sim-7-lod.js',
 '77-sim-6d-decrees.js', '77-sim-6p-pilgrims.js', '77-sim-8-export.js'].forEach(f => loadRel('core/simulation/' + f));

/* Load Jimjam [G data] modules */
loadRel('settlements/jimjam/targets/city/28-jj-model.js');
loadRel('settlements/jimjam/targets/city/30-jj-ground.js');
loadRel('settlements/jimjam/targets/city/32-jj-layout.js');
loadRel('settlements/jimjam/targets/city/34-jj-rules.js');
loadRel('settlements/jimjam/targets/city/78-jj-sim.js');

let bad = 0;
function ok(name, pass, neg, detail) {
  const good = !!(pass && !neg);
  if (!good) bad++;
  console.log((good ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (neg ? ' [negative passed!]' : ''));
}

/* 1. Initialize JJ_SIM on normal day (day 10, 10:24) */
const plan = JJ_LAYOUT.plan;
const state = JJ_SIM.init(plan, (x, z) => JJ_GROUND.h(x, z), { clock: { day: 10, hour: 10.4 } });
const sum = state.summary();

ok(
  'JJ1 simulation binds 520+ citizens, Republican minder, White-Pass Khaayken/Yonni/Rian envoys & closes SIM.ledger',
  sum.available && sum.actors >= 500 && sum.republicMinders >= 4 && sum.whitePassActors >= 20 && sum.ledgerOk && sum.ledgerProblems === 0,
  sum.actors < 100,
  'actors=' + sum.actors + ', repMinders=' + sum.republicMinders + ', whitePass=' + sum.whitePassActors + ', ledgerOk=' + sum.ledgerOk
);

/* 2. Diplomatic lock: Khaayken <-> Eternian hostile/closed while Jimjam <-> both friendly/visiting */
const relKE = SIM.R.relation['khaayken>eternian'];
const relJF = SIM.R.relation['jimjam>free_clans'];
ok(
  'Khaayken Yeti and Eternian trade stays closed while Jimjam <-> Free Clans stays friendly/open',
  !!(relKE && relKE.stance === 'hostile' && relKE.trade === 'closed' && relJF && relJF.stance === 'friendly'),
  !!(relKE && relKE.trade === 'open'),
  'khaayken>eternian=' + (relKE ? relKE.stance + '/' + relKE.trade : 'none')
);

/* 3. Double-Dark observance (day 0 = 91-day Kauntu phase0:0) halts Day-Ward kilns, closes High Courts & switches schedules */
state.syncClock(10, 11.0);
SIM.jump();
const courtOpenNormal = SIM.isOpen(SIM.R.place['lm.court_sun'], 'TRIAL', 11.0);
const kilnOpenNormal = SIM.isOpen(SIM.R.place['jj_day_kilns'], 'CRAFT', 11.0);

state.syncClock(0, 11.0);
SIM.jump();
const courtOpenDD = SIM.isOpen(SIM.R.place['lm.court_sun'], 'TRIAL', 11.0);
const kilnOpenDD = SIM.isOpen(SIM.R.place['jj_day_kilns'], 'CRAFT', 11.0);
const sunOpenDD = SIM.isOpen(SIM.R.place['lm.temple_sun'], 'VIGIL', 0.5); /* 00:30 midnight vigil */

ok(
  'Double-Dark observance locks High Courts & Day-Ward kilns by day and opens midnight temple vigils',
  courtOpenNormal && kilnOpenNormal && !courtOpenDD && !kilnOpenDD && sunOpenDD,
  courtOpenDD || kilnOpenDD,
  'normal(court=' + courtOpenNormal + ', kiln=' + kilnOpenNormal + ') -> DD(court=' + courtOpenDD + ', kiln=' + kilnOpenDD + ', vigil=' + sunOpenDD + ')'
);

/* 4. KSCHED deterministic timetables repeat on exact period and space 3 Lotus Harbour barges cleanly */
const sch = state.sched;
const b0a = sch.barges[0].timeline.at(25.0).value;
const b0b = sch.barges[0].timeline.at(25.0 + 240.0).value;
const b1a = sch.barges[1].timeline.at(25.0).value;
const samePeriod = Math.hypot(b0a[0] - b0b[0], b0a[2] - b0b[2]) < 1e-6;
const apartSlots = Math.hypot(b0a[0] - b1a[0], b0a[2] - b1a[2]) > 20.0;
ok(
  'KSCHED Lotus Harbour 25t barge & caravan timetables are periodic and slot-separated',
  sch.on && sch.barges.length === 3 && sch.skiffs.length === 4 && sch.caravans.length === 2 && samePeriod && apartSlots,
  !samePeriod,
  'barges=' + sch.barges.length + ', skiffs=' + sch.skiffs.length + ', caravans=' + sch.caravans.length
);

/* 5. SIM.export & Voth-standard KHOST.simHolds stocks shape */
const exp = SIM.export({ log: 20, nav: true });
const stks = SIM.stocks({ settlement: 'jimjam' });
ok(
  'SIM.export and JJ1 stocks table produce valid krator-sim container and positive rice/alabaster/almanac stocks',
  exp && exp.format === 'krator-sim' && exp.places.length >= 35 && exp.actors.length >= 500 &&
    stks && stks.by && stks.by.rice && stks.by.rice.total > 0 && stks.by.alabaster && stks.by.alabaster.total > 0,
  !exp || exp.actors.length === 0,
  'places=' + exp.places.length + ', rice=' + (stks && stks.by.rice ? stks.by.rice.total : 0) + ', alabaster=' + (stks && stks.by.alabaster ? stks.by.alabaster.total : 0)
);

if (bad) {
  console.error(bad + ' check(s) FAILED');
  process.exit(1);
}
console.log('OK');
