// node settlements/isle-demo/tests/test-isle-hamlets.js [days] — the hamlets in the sim (core/hamlet H5, src/47h) without a
// browser. Plans and declares both towns (src/40-49), lays out the four resource villages with core/hamlet's
// KHAMLET.village on STAND-IN ground (the open world's survey points, every place dry: the real layout needs the open
// world's fields and the isles' zones, openworld/isle-demo 48; its verify.py checks the villages there), declares them
// (ISLE.simHamlets), runs `days` with Kautoa watched and checks ISLE.hamletChecks: four villages, each its town's, at the
// abstract level; staffed; making their goods; every load landed or on the road and booked imported in the town; each
// village fed by its town. Each check with a negative. Then the towns' week checks still hold with the villages in.
// Build first (python3 build.py).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8').startsWith('version https://git-lfs')) { console.log('FAIL  dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
ISLE.initWorld();
const days = +(process.argv[2] || 5);
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
ISLE.simDeclare(plans);
/* the four villages of openworld/isle-demo 48 (ISLE_HAMLETS.SPECS), laid out at their survey points on stand-in ground */
const SPECS = [
  { id: 'hamlet-salt', name: 'Salt village', focus: 'salt', parent: 'Kautoa', near: [-14776, -107820] },
  { id: 'hamlet-mine', name: 'Iron mine', focus: 'mine', parent: 'Valapo', near: [-18000, 66000] },
  { id: 'hamlet-lumber', name: 'Lumber village', focus: 'lumber', parent: 'Kautoa', near: [74697, -42993] },
  { id: 'hamlet-ranch', name: 'Ranch', focus: 'ranch', parent: 'Kautoa', near: [20093, -117084] }];
const dims = k => ISLE_DIMS[k] ? { w: ISLE_DIMS[k].w, d: ISLE_DIMS[k].d, h: ISLE_DIMS[k].h } : /^br_bldg/.test(k) ? { w: 16, d: 14, h: 10 } : null;
const STANDIN = { 'hamlet-salt': { id: 'hamlet-salt:field', kind: 'salt', grade: 'high' }, 'hamlet-mine': { id: 'hamlet-mine:node', kind: 'iron', grade: 'medium' }, 'hamlet-lumber': { id: 'hamlet-lumber:stand', kind: 'stand' }, 'hamlet-ranch': { id: 'hamlet-ranch:field', kind: 'pasture', grade: 'high' } };
const villages = SPECS.map(sp => ({ spec: sp, resource: STANDIN[sp.id], village: KHAMLET.village({ id: sp.id, world: 4242, culture: 'islander_east', focus: sp.focus,
  site: { x: sp.near[0], z: sp.near[1] }, link: { x: sp.near[0] + 300, z: sp.near[1] }, resource: { x: sp.near[0] - 200, z: sp.near[1] }, dims, ground: { ok: () => true } }) }));
villages.forEach(V => ok('the ' + V.spec.name.toLowerCase() + ' laid out', !V.village.error && V.village.records.length > 10, V.village.error || V.village.census.pop + ' people, ' + V.village.records.length + ' buildings'));
const t0 = Date.now(), H = ISLE.simHamlets(villages);
ok('declared with no errors', !H.errors.length, H.errors.join('; ') || H.villages.map(X => X.id + ': ' + X.people + ' people, ' + X.km + ' km to ' + X.parent + ' (' + Math.round(X.minutes / 60) + ' h on the road)').join('; '));
ISLE.simWatch('Kautoa');
const a = ISLE.simHamletBooks(); ISLE.simRun(days * 1440); const b = ISLE.simHamletBooks();
console.log('--- ' + days + ' days with Kautoa watched, the villages abstract: ' + (Date.now() - t0) + ' ms');
ISLE.hamletChecks(a, b).forEach(c => ok(c.name, c.ok, c.detail));
const cp = x => JSON.parse(JSON.stringify(x));
const caught = (what, rs, re) => { const r = rs.filter(c => re.test(c.name))[0]; ok('negative: ' + what + ' is caught', r && !r.ok, r && r.detail); };
{ const B = cp(b); B.villages['hamlet-salt'].goods.salt.made = a.villages['hamlet-salt'].goods.salt.made; caught('a salt village that made no salt', ISLE.hamletChecks(a, B), /makes its goods/); }
{ const B = cp(b); B.villages['hamlet-mine'].landed.ore = (B.villages['hamlet-mine'].landed.ore || 0) - 20; caught('20 ore lost on the road', ISLE.hamletChecks(a, B), /landed in its town/); }
{ const B = cp(b); B.villages['hamlet-ranch'].meals.none += 5; caught('five meals without food at the ranch', ISLE.hamletChecks(a, B), /fed by its town/); }
{ const B = cp(b); B.ledger.towns['hamlet-mine'].ore.total += 30; caught('30 ore from nowhere in the mine\'s books', ISLE.hamletChecks(a, B), /the ledger/); }
{ const B = cp(b); B.villages['hamlet-mine'].site.id = 'somewhere-else'; caught('a mine on another record', ISLE.hamletChecks(a, B), /its record from the map/); }
{ const B = cp(b); B.villages['hamlet-salt'].site.taken += 40; caught('a pan that gave more than was made', ISLE.hamletChecks(a, B), /its record from the map/); }
{ const B = cp(b); B.ledger.towns.kautoa.salt.total += 90000; caught('a town heaped with salt past the ceiling', ISLE.hamletChecks(a, B), /ceiling/); }
{ const B = cp(b); B.ledger.towns.kautoa.irontools.total += 500; caught('Kautoa forging iron tools past its ceiling', ISLE.hamletChecks(a, B), /ceiling/); }
{ const B = cp(b); B.villages['hamlet-lumber'].workers = 3; caught('a lumber village with three workers', ISLE.hamletChecks(a, B), /staffed/); }
/* the towns' goods from the villages put to use */
const KA = SIM.econ('kautoa'), VA = SIM.econ('valapo');
ok('Kautoa tans the ranch\'s hides and builds with the lumber village\'s timber; Valapo smelts the mine\'s ore with the charcoal the lakatoi brings',
  (KA.used.hides || 0) > 0 && (KA.used.timber || 0) > 0 && (VA.used.ore || 0) > 0 && (VA.imported.charcoal || 0) > 0 && (VA.made.iron || 0) > 0,
  'Kautoa hides used ' + (KA.used.hides || 0) + ', timber used ' + (KA.used.timber || 0) + '; Valapo ore used ' + (VA.used.ore || 0) + ', charcoal landed ' + (VA.imported.charcoal || 0) + ', iron made ' + (VA.made.iron || 0));
{ const IR = SIM.econ('kautoa'); ok('the chain runs to its end: Valapo smelts, the lakatoi carries the iron, Kautoa\'s smithies work it into tools', (VA.made.iron || 0) > 0 && (IR.imported.iron || 0) > 0 && (IR.used.iron || 0) > 0,
    'iron made ' + (VA.made.iron || 0) + ', landed in Kautoa ' + (IR.imported.iron || 0) + ', worked ' + (IR.used.iron || 0) + ', iron tools made there ' + (IR.made.irontools || 0));
  /* the iron tools (PLAN.md 9b): their own good and item; a stone tool's errand buys one when its seller has it */
  const by = t => ((SIM.ITEMS.statsBy || {})[t] || {}).bought || {}, KB = by('kautoa'), VB = by('valapo');
  ok('the iron tools are their own line: made in Kautoa, bought there in place of stone, carried to Valapo', (IR.made.irontools || 0) > 0 && (KB['iron tool'] || 0) > 0 && (VA.imported.irontools || 0) > 0,
    'Kautoa made ' + (IR.made.irontools || 0) + ', its people bought ' + (KB['iron tool'] || 0) + ' iron and ' + (KB['stone tool'] || 0) + ' stone; Valapo landed ' + (VA.imported.irontools || 0) + ', bought ' + (VB['iron tool'] || 0) + ' iron and ' + (VB['stone tool'] || 0) + ' stone; short of iron tools: Kautoa ' + (IR.short.irontools || 0) + ', Valapo ' + (VA.short.irontools || 0)); }
/* depletion: the mine's node all but emptied: it stops, says why, Valapo's smithies run out and say what they miss */
{ const EM = SIM.econ('hamlet-mine'), St = EM.resSites['hamlet-mine:node'], m0 = EM.made.ore || 0; St.amount = 40; ISLE.simRun(4 * 1440);
  const gone = (EM.made.ore || 0) - m0, R = SIM.sitesReport('hamlet-mine')[0], BL = EM.blocked['depleted: hamlet-mine:node'] || 0;
  ok('a mine emptied stops, and says why', gone === 40 && R.amount === 0 && BL > 0, gone + ' more ore, ' + R.amount + ' left, blocked ' + BL + ' times');
  const why = Object.values(SIM.blockedReport('valapo')).filter(w => w.reason === 'missing' && w.goods.indexOf('ore') >= 0).length, v0 = SIM.stockOf('ore', 'valapo');
  console.log('--- after the mine: Valapo holds ' + v0 + ' ore, ' + why + ' smithies say they miss it'); }
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
