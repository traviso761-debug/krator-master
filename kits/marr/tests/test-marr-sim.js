/* Node verification test for kits/marr/sim/80-marr-sim.js (Izani Provinces & Marr Regional Economy on core/simulation + core/hamlet).
   Run: node kits/marr/tests/test-marr-sim.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '../../..');
global.window = global;
const hamletFiles = fs.readdirSync(path.join(root, 'core/hamlet'))
  .filter(f => /^\d\d-hamlet-.*\.js$/.test(f))
  .sort()
  .map(f => 'core/hamlet/' + f);
const simFiles = fs.readdirSync(path.join(root, 'core/simulation'))
  .filter(f => /^\d\d-sim-.*\.js$/.test(f))
  .sort()
  .map(f => 'core/simulation/' + f);
const files = [
  'core/rand/08-core-rand.js',
  'core/space/20-core-space.js',
  'core/city/33-city-strategies.js',
  ...hamletFiles,
  ...simFiles,
  'kits/marr/sim/80-marr-sim.js'
];
for (const f of files) {
  vm.runInThisContext(fs.readFileSync(path.join(root, f), 'utf8'), {filename: f});
}

let fails = 0, checks = 0;
function check(cond, msg) {
  checks++;
  if (!cond) { console.error('FAIL:', msg); fails++; }
}

/* 1. Verify Izani Empire 10-Province table & 3 Marr Ring Sea islands */
check(Array.isArray(MARR_SIM.IZANI_PROVINCES) && MARR_SIM.IZANI_PROVINCES.length === 10, '10 Izani Empire provinces declared');
const provIds = MARR_SIM.IZANI_PROVINCES.map(p => p.id);
['marr', 'iziz', 'pylon', 'talia', 'fridon', 'seto', 'hook', 'daridel', 'shell', 'dilihan'].forEach(id => {
  check(provIds.includes(id), 'province ' + id + ' present');
});
MARR_SIM.IZANI_PROVINCES.forEach(p => {
  check(p.points && p.points.length >= 4, p.id + ': valid border polygon (>= 4 vertices)');
  check(p.capital && p.capital.name && typeof p.capital.px === 'number', p.id + ': valid capital');
  const mixSum = Object.values(p.kitMix || {}).reduce((a, b) => a + b, 0);
  check(Math.abs(mixSum - 1.0) < 1e-6, p.id + ': kitMix sums to 1.0 (got ' + mixSum + ')');
});
const marrProv = MARR_SIM.IZANI_PROVINCES.find(p => p.id === 'marr');
check(marrProv && Array.isArray(marrProv.islands) && marrProv.islands.length === 3, 'Marr Province has 3 Ring Sea islands');
check(marrProv.islands.map(i => i.scaleModelId).sort().join(',') === '19,21,22', 'Marr islands match Scale Model 5.1 IDs 19, 21, 22');

/* 2. Negative checks */
check(!KHAMLET.row('nonexistent_culture') && !!KHAMLET.village({culture: 'nonexistent_culture'}).error, 'negative: unknown culture rejected by KHAMLET.row / KHAMLET.village');

/* 3. Declare the Marr provincial economy on core/simulation */
const state = MARR_SIM.declare();
check(state.problems.length === 0, 'MARR_SIM.declare() has 0 problems (got ' + state.problems.join('; ') + ')');
check(SIM.routeFail.length === 0, '0 nav route failures (got ' + SIM.routeFail.length + ')');
check(state.settlements.marr.pop.actors > 150, 'Porta Marr populated (' + state.settlements.marr.pop.actors + ' actors)');
check(state.villages.length === 9, '9 Marr-style subordinate settlements/hamlets/work-sites declared');

/* 4. Run 7 full simulated days (7 * 1440 = 10,080 minutes) */
MARR_SIM.run(7 * 1440);
const books = MARR_SIM.books();
check(books.problems.length === 0, '0 SIM problems after 7 days (got ' + books.problems.join('; ') + ')');
check(SIM.routeFail.length === 0, '0 nav route failures after 7 days');

/* 5. Verify all 9 Marr villages produced, exported to Marr, received food, and balanced ledgers */
for (const sp of MARR_SIM.SPECS) {
  const vb = books.villages[sp.id];
  check(!!vb, sp.id + ': present in books');
  check(vb.people > 40 && vb.workers > 15, sp.id + ': staffed (' + vb.workers + '/' + vb.people + ')');
  check(vb.balanced, sp.id + ': daily stock ledger balanced');
  const totalMade = Object.values(vb.made).reduce((a, b) => a + b, 0);
  const totalShipped = Object.values(vb.shipped).reduce((a, b) => a + b, 0);
  const totalLanded = Object.values(vb.landed).reduce((a, b) => a + b, 0);
  const totalFed = Object.values(vb.fed).reduce((a, b) => a + b, 0);
  check(totalMade > 50, sp.id + ': produced focus goods (' + JSON.stringify(vb.made) + ')');
  check(totalShipped > 0 && totalLanded > 0, sp.id + ': shipped & landed goods in Porta Marr (' + JSON.stringify(vb.landed) + ')');
  check(totalFed > 0, sp.id + ': received food from Porta Marr (' + JSON.stringify(vb.fed) + ')');
}

/* 6. Verify Porta Marr urban manufacturing & Imperial/Ring Sea export buyers */
const mg = books.marr.goods;
['fish', 'bread', 'rum', 'cloth', 'cordage', 'iron', 'tools', 'pottery', 'hulls'].forEach(g => {
  check(mg[g] && mg[g].made > 0, 'Porta Marr manufactured ' + g + ' (made=' + (mg[g] && mg[g].made) + ')');
});
['rice', 'maize', 'sugar', 'cotton', 'cacao', 'salt', 'timber', 'charcoal', 'stone', 'ore', 'bullion'].forEach(g => {
  check(mg[g] && mg[g].imported > 0, 'Porta Marr imported ' + g + ' from hinterland/islands (imported=' + (mg[g] && mg[g].imported) + ')');
});
['iziz_imperial_convoy', 'tobin_coaster', 'pylon_barge', 'daridel_mule_train', 'shades_xebec'].forEach(shId => {
  const sh = books.ships[shId];
  const boughtSum = sh ? Object.values(sh.bought).reduce((a, b) => a + b, 0) : 0;
  check(sh && sh.calls > 0 && boughtSum > 0, 'Buyer ' + shId + ' called (' + (sh && sh.calls) + 'x) and bought ' + boughtSum + ' lots');
});

if (fails > 0) {
  console.error('FAILED ' + fails + '/' + checks + ' checks');
  process.exit(1);
}
console.log('OK kits/marr/tests/test-marr-sim.js (' + checks + ' checks passed, 7 simulated days)');
if (process.argv.includes('--summary')) {
  console.log(JSON.stringify(books, null, 2));
}
