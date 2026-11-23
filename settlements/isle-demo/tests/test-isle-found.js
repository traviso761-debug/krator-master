// node settlements/isle-demo/tests/test-isle-found.js [days] — a farming camp founded by a town's waiting refugees and its
// conversion to a hamlet with its highway as a project (PLAN.md section 11 step 5; src/47f) without a browser. Plans and
// declares both towns with one farming hamlet and one lumber village each on stand-in ground (as tests/test-isle-hamlets.js lays them), gives the
// sim stand-in page hooks (ISLE.hooks: a farm site 6 km south-west of the town, core/hamlet's village and farmland on flat
// dry ground, a straight road to the town's frame), runs `days` (default 45: the first ship lands on day 3, its households
// wait 7 days at the test's fast pace, the camp farms 20 days, then the road is building and refugees have moved in) and checks
// ISLE.foundChecks, each with a negative; then
// the hamlets' and the refugees' checks still hold. Build first (python3 build.py).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8').startsWith('version https://git-lfs')) { console.log('FAIL  dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
const cp = x => JSON.parse(JSON.stringify(x));
const caught = (what, rs, re) => { const r = rs.filter(c => re.test(c.name))[0]; ok('negative: ' + what + ' is caught', r && !r.ok, r && r.detail); };
ISLE.initWorld();
const days = +(process.argv[2] || 45), T = ISLE.TUNE.sim, F = T.found;
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
const frame = town => plans[ISLE.TOWNS.indexOf(town)].G.frame, people = {}; plans.forEach((p, i) => { people[ISLE.TOWNS[i]] = ISLE.census(p.R).citizens; });
const farmAt = (town, dx, dz) => [frame(town).x + dx, frame(town).z + dz];
/* one farming hamlet a town, the whole of its land estimate, 6.5 km east (the founded camp goes south-west) */
const SPECS = [
  { id: 'hamlet-farm-k', name: 'Kautoa farming hamlet', focus: 'farming', parent: 'Kautoa', crops: 'staples', share: 1, near: farmAt('Kautoa', 6500, 0) },
  { id: 'hamlet-farm-v', name: 'Valapo farming hamlet', focus: 'farming', parent: 'Valapo', crops: 'staples', share: 1, near: farmAt('Valapo', 6000, 0) },
  /* and a lumber village each: the roads' timber (a town with no timber in its economy builds nothing, as in the world) */
  { id: 'hamlet-lumber', name: 'Lumber village', focus: 'lumber', parent: 'Kautoa', near: [74697, -42993] },
  { id: 'hamlet-lumber-v', name: 'Valapo lumber village', focus: 'lumber', parent: 'Valapo', near: [-4000, 56900] }];
['10-camp-cultures.js', '40-camp-work.js'].forEach(f => vm.runInThisContext(fs.readFileSync(path.join(HERE, '..', '..', 'core', 'camp', f), 'utf8'), { filename: f }));   /* the felling crew's work camp */
/* the fast pace for the test (15: the real pace is a month's wait and a season's camp) */
T.found.waitDays = 7; T.found.days = 20;
ISLE.simDeclare(plans, null, { hamlets: SPECS });
const dims = k => ISLE_DIMS[k] ? { w: ISLE_DIMS[k].w, d: ISLE_DIMS[k].d, h: ISLE_DIMS[k].h } : /^br_bldg/.test(k) ? { w: 16, d: 14, h: 10 } : null;
const layFarming = (sp, site, hands) => { const res = { x: site.x - 350, z: site.z };
  const village = KHAMLET.village({ id: sp.id, world: sp.world || 4242, culture: 'islander_east', focus: 'farming', site: { x: site.x, z: site.z }, link: { x: site.x + 300, z: site.z },
    resource: { x: res.x, z: res.z, workers: hands }, dims, ground: { ok: () => true }, worksOut: ['ie-farm'], vacant: T.hamlets.grow.vacant });
  return { village, resource: village.error ? null : ISLE.farmlandOf(sp, village, { centre: res, ground: {} }) }; };
const villages = SPECS.map(sp => sp.focus === 'farming' ? Object.assign({ spec: sp }, layFarming(sp, { x: sp.near[0], z: sp.near[1] }, Math.ceil(KHAMLET.farmNeed(people[sp.parent]).hands * sp.share)))
  : { spec: sp, village: KHAMLET.village({ id: sp.id, world: 4242, culture: 'islander_east', focus: 'lumber', site: { x: sp.near[0], z: sp.near[1] }, link: { x: sp.near[0] + 300, z: sp.near[1] }, resource: { x: sp.near[0] - 200, z: sp.near[1] }, dims, ground: { ok: () => true }, vacant: T.hamlets.grow.vacant }),
    resource: { id: sp.id + ':stand', kind: 'stand', forest: () => 0.85 } });
const NAMES = KHAMLET.dealNames('islander', 4242, SPECS.map(sp => sp.id)); villages.forEach(V => { V.name = NAMES[V.spec.id].name; });
const H = ISLE.simHamlets(villages);
ok('the two farming hamlets and the two lumber villages declared with no errors', !H.errors.length && H.villages.length === 4, H.errors.join('; ') || H.villages.map(X => X.id + ' ' + X.name + ': ' + X.people + ' people').join('; '));
/* THE PAGE'S STAND-IN HOOKS: the open world's survey, layout and routing (openworld/isle-demo 48, 48r) stood in for */
const roadsBuilt = [];
ISLE.hooks.farmSite = (townName, n) => { const F0 = frame(townName); return { x: F0.x - 6000 - 500 * n, z: F0.z + 6000, y: 0, ground: {}, avoid: null }; };
ISLE.hooks.layVillage = (spec) => layFarming(spec, spec.site, spec.hands);
ISLE.hooks.routeRoad = (village, spec) => { const lane = (village.lanes || []).filter(l => l.main)[0], a = lane ? lane.pts[1] : [village.site.x, village.site.z], F0 = frame(spec.parent);
  const L = Math.hypot(F0.x - a[0], F0.z - a[1]); return { pts: [[a[0], a[1], 0], [F0.x, F0.z, 0]], length_m: Math.round(L), townKm: Math.round(L / 10) / 100, from: spec.id, to: spec.parent }; };
ISLE.hooks.roadBuilt = (rec, X) => { roadsBuilt.push({ hamlet: X.id, km: rec && rec.length_m }); };
ok('the founding declared after the refugees (ISLE.simFound: its state and hourly step)', ISLE.SIM.found && SIM.stepHooks.indexOf(ISLE.foundStep) >= 0, JSON.stringify(F));
ISLE.simWatch('Kautoa');
const a = ISLE.foundBooks(), t0 = Date.now(); ISLE.simRun(days * 1440 + 1); const b = ISLE.foundBooks();
console.log('ran ' + days + ' days in ' + Math.round((Date.now() - t0) / 1000) + ' s; log: ' + JSON.stringify(b.log.slice(0, 6)));
const checks = ISLE.foundChecks(a, b); checks.forEach(c => ok(c.name, c.ok, c.detail));
/* a camp a town; each converted with its road a project, or still within its days (a town that houses its refugees fast founds late) */
ok('a camp founded in each town, each converted with its road a project or still within its ' + F.days + ' days (' + days + ' days)', b.camps.length === 2 && b.camps.every(C => C.converted || b.minute < C.founded + (F.days + 1) * 1440) && b.roads.length === b.camps.filter(C => C.converted).length && b.roads.length >= 1,
  b.camps.map(C => C.id + (C.converted ? ' -> ' + C.village : ' a camp since day ' + Math.round(C.founded / 1440))).join('; ') + '; roads: ' + b.roads.map(R => R.village + ' ' + R.state + ' ' + Math.round(R.done) + '/' + R.hours + ' h').join('; '));
/* the founded hamlet in the hamlets' books, named from the Sikau list, its people the founders and the settlers after them */
const HB = ISLE.simHamletBooks ? ISLE.simHamletBooks() : null;
if (HB) { const founded = Object.keys(HB.villages).filter(id => /\.hamlet\d+$/.test(id));
  const madeOf = V => Object.keys(V.goods || {}).filter(g => V.goods[g].made > 0).map(g => g + ' ' + Math.round(V.goods[g].made));
  ok('the founded hamlets are in the hamlets\' books, named, each making its staple', founded.length === b.camps.filter(C => C.converted).length && founded.length >= 1 && founded.every(id => { const V = HB.villages[id]; return V.name && madeOf(V).length > 0; }),
    founded.map(id => { const V = HB.villages[id]; return id + ' ' + V.name + ': ' + madeOf(V).join(', '); }).join('; ')); }
/* THE NEGATIVES */
{ const B = cp(b); B.camps.forEach(C => { C.here = C.people - 1; C.inVillage = C.people - 1; }); caught('a camper nobody can find', ISLE.foundChecks(a, B), /founded a farming camp/); }
{ const B = cp(b); B.camps.forEach(C => { C.meals.none = 12; }); caught('a camp going without food', ISLE.foundChecks(a, B), /fed at its ration/); }
{ const B = cp(b); B.camps.forEach(C => { C.converted = null; }); caught('a camp past its days still a camp', ISLE.foundChecks(a, B), /converted to a hamlet/); }
{ const B = cp(b); B.roads.forEach(R => { R.done = 0; R.state = 'building'; }); caught('a road project no hand has touched', ISLE.foundChecks(a, B), /highway is a project/); }
{ const B = cp(b); B.villages.forEach(V => { V.moved = 0; V.movedAtWork = 0; }); caught('a founded hamlet nobody moved to', ISLE.foundChecks(a, B), /draws the towns/); }
{ const B = cp(b); B.villages.forEach(V => { V.people += 7; }); caught('seven settlers dealt from nowhere', ISLE.foundChecks(a, B), /draws the towns/); }
/* the refugees' own checks still hold with the camps founded from them, and the hamlets' */
if (ISLE.refugeeChecks) { const rb = ISLE.refugeeBooks(); ISLE.refugeeChecks(rb, rb).forEach(c => ok('(refugees) ' + c.name, c.ok, c.detail)); }
console.log(bad ? 'FAILED ' + bad : 'ALL PASS');
process.exit(bad ? 1 : 0);
