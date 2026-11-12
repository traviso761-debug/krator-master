// Pinnacle Rock's full sim in node (not a test: tests/test-pr-sim.js runs it). The town declared on core/region's host
// (the isle demo's, lifted: core/region 40-49) from the page's plan (plan/pinnacle.json, tools/export_plan.py) and its
// table (src/16-pr-sim.js PR_SIM), with needs, happiness, items, the economy and unrest as the isle's towns have them.
// The plan's farm cells are the town's parcels; its lots its places; its streets the walking graph.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..'), BUILD = path.join(__dirname, '..');
const L = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
function load() {
  L('core/rand/08-core-rand.js'); L('core/clock/20-core-clock.js'); L('core/space/20-core-space.js');
  fs.readdirSync(path.join(ROOT, 'core', 'simulation')).filter(f => /^77-sim-.*\.js$/.test(f)).sort().forEach(f => L('core/simulation/' + f));
  L('core/tags/' + fs.readdirSync(path.join(ROOT, 'core', 'tags')).find(f => /^\d.*\.js$/.test(f)));
  L('core/region/00-region-core.js');
  fs.readdirSync(path.join(ROOT, 'core', 'camp')).filter(f => /^\d\d-camp-.*\.js$/.test(f)).sort().forEach(f => L('core/camp/' + f));
  L('core/world/48t-world-travel.js'); L('kits/beast-riders/src/79-br-camp.js');
  L('settlements/pinnacle-rock/src/14-pr-legs.js'); L('settlements/pinnacle-rock/src/15-pr-tune.js'); L('settlements/pinnacle-rock/src/16-pr-sim.js');
  const PR_SIM = vm.runInThisContext('PR_SIM');
  /* the host: the page's own hooks the region parts call (the isle's 34 census, 47 canoe line): a dwelling's households
     from the table, no canoe line, no census beyond the count, the buildings' role names from their keys */
  const H = { TUNE: { sim: PR_SIM.sim }, TOWNS: ['Pinnacle Rock'] };
  global.ISLE_DIMS = {}; global.ISLE_TRADES = [];
  H.households = key => PR_SIM.households[key] || 0;
  H.simTrade = () => null;
  H.census = R => ({ town: R.town, buildings: R.lots.length, households: R.lots.reduce((n, l) => n + H.households(l.key), 0) });
  KREGION.use(H);
  ['40-region-sim', '41-region-nav', '42-region-people', '43-region-items', '44-region-economy', '45-region-sim-checks', '46-region-stocks',
    '47b-region-build', '47c-region-crime', '47m-region-money', '47u-region-unrest', '48-region-week', '49-region-govern', '50-region-valley']
    .forEach(f => L('core/region/' + f + '.js'));
  return { H, PR_SIM };
}
/* the plan as the host reads a core/city plan: R {town, plan: {ways, greens}, lots, fields}, G {frame, h} */
function plan() {
  const P = JSON.parse(fs.readFileSync(path.join(BUILD, 'plan', 'pinnacle.json'), 'utf8')), top = P.town.top;
  const R = { town: 'Pinnacle Rock', plan: { ways: P.town.ways, greens: [] },
    lots: P.town.lots.map(l => Object.assign({}, l, { lot: l.id })),
    fields: P.farms.fields.filter(c => c.area > 0).map((c, i) => ({ id: 'ring.f' + i, kind: c.kind, crop: c.crop, x: c.x, z: c.z, size: Math.sqrt(c.area) })),
    world: [], districts: [], landings: [] };
  /* the ground: the cap's height on the top (the town's lots stand there), the floor's under the ring's cells */
  const onTop = (x, z) => (x / 410) ** 2 + (z / 610) ** 2 < 1;
  const G = { frame: { x: 0, z: 0, sea: 0 }, h: (x, z) => onTop(x, z) ? top : 0 };
  return { P, R, G };
}
/* the whole: the town declared, the valley attached (the clearings, the eighteen bands at home, the markets, the targets;
   kilograms as unit servings), the bands' world (core/camp) on the sim's host, everyone abstract */
function world(o) {
  o = o || {};
  const { H } = load(), { R, G } = plan(), PR_TUNE = vm.runInThisContext('PR_TUNE'), u = o.unit == null ? 8 : o.unit;   /* servings a kilo: the isle's 4 servings a day is the year test's half-kilo of grain-equivalent */
  if (o.startDays != null) H.TUNE.sim.economy.startDays = o.startDays;
  const S = H.simDeclare([{ R, G }]), town = 'staiytii0y';
  const gran = SIM.all('place').filter(P => P.settlement === town && P.kind === 'granary').sort((a, b) => a.id < b.id ? -1 : 1)[0];
  const OW = JSON.parse(fs.readFileSync(path.join(ROOT, 'openworld', 'pinnacle', 'plan', 'sites.json'), 'utf8'));
  const V = PR_TUNE.valley(OW, { attach: { place: gran.id, unit: u } });
  const VS = H.simValley(V), host = H.valleyHost(u);
  V.bands.forEach(b => H.valleyAway(b.id, true));
  const W = PR_TUNE.world(V, host);
  SIM.level(town, 'abstract');
  return { H, S, V, VS, W, R, town, u, PR_TUNE };
}
module.exports = { load, plan, world };
