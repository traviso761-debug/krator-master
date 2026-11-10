// node settlements/isle-demo/tests/test-isle-colony.js [days] — Nephtos, the Hykkousoi port colony of Tethys (src/47k;
// PLAN.md section 15), without a browser. Lays its placeholder radial plan on STAND-IN ground (a straight coast, the sea
// to the east of its beach, flat dry land behind: the real coast is the open world's, openworld/isle-demo 48k, whose
// verify.py checks it there), declares it with both Islander towns (ISLE.simDeclare opts.colonies) and its dependent
// villages and plantations with theirs (stand-in sites, as tests/test-isle-hamlets.js lays them), runs `days` and checks:
// the plan (about half Valapo's people, every lot dry and apart, the harbour on its spoke, the quay at the beach), the
// town on the sim (the Hykkousoi of Tethys, its books in Tethyan drachmae, every lot of a kind a place, every resident housed,
// every post filled), fed by its own countryside and sea, its plantations' crops and its mine's copper in its warehouses.
// Each check with a negative. Build first (python3 build.py).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8').startsWith('version https://git-lfs')) { console.log('FAIL  dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
['10-camp-cultures.js', '40-camp-work.js'].forEach(f => vm.runInThisContext(fs.readFileSync(path.join(HERE, '..', '..', 'core', 'camp', f), 'utf8'), { filename: f }));
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
const cp = x => JSON.parse(JSON.stringify(x));
ISLE.initWorld();
const days = +(process.argv[2] || 10);
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
/* the colony on a stand-in coast: its beach at the frame's origin, the sea east of x = 0 */
const NX = 62000, NZ = -50000, TSn = ISLE.TUNE.sim.towns.Nephtos;
const colony = ISLE.colonyPlan({ town: 'Nephtos', seed: 4242, frame: { x: NX, z: NZ, sea: 0 }, h: () => 3, land: (x, z) => x < -4, sea: [1, 0], shore: [0, 0], households: TSn.colony.households });
const CR = colony.R, CC = ISLE.colonyCensus(CR);
/* the colony's countryside: its villages beside the Islander towns' own (stand-in sites, apart, on the island's land) */
const at = (dx, dz) => [NX + dx, NZ + dz];
const SPECS = [
  { id: 'hamlet-farm-n1', name: 'Nephtos farming hamlet 1', focus: 'farming', parent: 'Nephtos', crops: 'staples', share: 1 / 2, near: at(-7000, 2000) },
  { id: 'hamlet-farm-n2', name: 'Nephtos farming hamlet 2', focus: 'farming', parent: 'Nephtos', crops: 'staples', share: 1 / 2, near: at(-7000, -6000) },
  { id: 'hamlet-plant-n', name: 'Nephtos plantations', focus: 'farming', parent: 'Nephtos', crops: 'cash', plantation: true, hands: 90, near: at(-12000, -1000) },
  { id: 'hamlet-fish-n', name: 'Nephtos fishing village', focus: 'fishing', parent: 'Nephtos', near: at(-600, 5000), landing: { x: NX - 150, z: NZ + 5000, ux: 1, uz: 0 }, seaKm: 6 },
  { id: 'hamlet-lumber-n', name: 'Nephtos lumber camp', focus: 'lumber', parent: 'Nephtos', near: at(-9000, 8000) },
  { id: 'hamlet-copper-n', name: 'Nephtos copper mine', focus: 'mine', parent: 'Nephtos', metal: 'copper', grade: 'medium', near: at(-15000, 6000) }];
/* the expeditions' shores: Nephtos's pearl ships to a reef 8 km down its coast (the node 300 m out); the Islander towns
   find none here (tests/test-isle-expeditions.js runs theirs) */
ISLE.hooks.expeditionShore = (townName, n, kind) => { if (townName !== 'Nephtos' || kind !== 'reef') return null; const sh = { x: NX - 10, z: NZ + 8000, ux: 1, uz: 0 };
  return { x: sh.x - 150, z: sh.z, shore: sh, seaKm: 9, forest: () => 0.9, h: () => 0, name: 'the test reef', node: { x: sh.x + 300, z: sh.z } }; };
ISLE.simDeclare(plans, null, { hamlets: SPECS, colonies: [colony] });
const S = ISLE.SIM, X = S.towns.nephtos;
/* the plan */
const Vp = ISLE.census(plans[ISLE.TOWNS.indexOf('Valapo')].R).citizens;
ok('the plan: a radial placeholder about half Valapo\'s size (' + CC.citizens + ' people in ' + CC.households + ' households against Valapo\'s ' + Vp + '; ' + CC.lots + ' lots, ' + CR.plan.ways.length + ' streets)',
  CC.citizens >= 0.4 * Vp && CC.citizens <= 0.6 * Vp && CR.plan.ways.length >= 8, JSON.stringify(CC.byKey));
const dryAll = L => L.every(l => l.x < -4), apart = L => L.every((a, i) => L.every((b, j) => j <= i || Math.hypot(a.x - b.x, a.z - b.z) > 0.5 * Math.min(Math.hypot(a.w, a.d), Math.hypot(b.w, b.d))));
ok('every lot on dry ground and apart from the others; the harbour\'s customs, warehouses, fish market and shipyard on the harbour spoke; the quay at the beach',
  dryAll(CR.lots) && apart(CR.lots) && ['hyk-customs', 'hyk-warehouse', 'hyk-fishdock', 'hyk-shipyard'].every(k => CR.lots.some(l => l.key === k && l.district === 'the harbour')) && CR.landings.length === 1 && Math.abs(CR.landings[0].x) < 12,
  CR.lots.filter(l => l.district === 'the harbour').map(l => l.key).join(', '));
{ const L = cp(CR.lots); L[3].x = 40; ok('negative: a lot in the sea is caught', !dryAll(L)); const L2 = cp(CR.lots); L2[5].x = L2[4].x; L2[5].z = L2[4].z; ok('negative: two lots on one spot are caught', !apart(L2)); }
/* the town on the sim */
const St = SIM.R.settlement.nephtos;
ok('Nephtos declared: the Hykkousoi of Tethys, its books in Tethyan drachmae, a town of its own (no parent)', !!St && St.faction === 'hykkousoi' && SIM.R.faction.hykkousoi && ISLE.currencyOf('nephtos') === 'drachma' && SIM.MONEY.cur.drachma && !St.parent,
  St ? St.faction + ', ' + ISLE.currencyOf('nephtos') : 'not declared');
ok('every lot of the colony\'s plan a place of a mapped kind (none unmapped)', !Object.keys(X.places.unmapped).length && X.places.places.length >= CR.lots.length,
  X.places.places.length + ' places; ' + JSON.stringify(X.places.byKind) + (Object.keys(X.places.unmapped).length ? '; UNMAPPED ' + JSON.stringify(X.places.unmapped) : ''));
ISLE.simChecks(CR).forEach(c => ok(c.name, c.ok, c.detail));
/* the colony's countryside: its villages declared with the Islander towns' */
const dims = k => ISLE_DIMS[k] ? { w: ISLE_DIMS[k].w, d: ISLE_DIMS[k].d, h: ISLE_DIMS[k].h } : /^br_bldg/.test(k) ? { w: 16, d: 14, h: 10 } : null;
const STANDIN = { 'hamlet-fish-n': { id: 'hamlet-fish-n:grounds', kind: 'fishery', grade: 'medium' }, 'hamlet-lumber-n': { id: 'hamlet-lumber-n:stand', kind: 'stand', forest: () => 0.85 },
  'hamlet-copper-n': { id: 'hamlet-copper-n:node', kind: 'copper', grade: 'medium' } };
const people = X.pop ? SIM.all('actor').filter(a => !a.driven && SIM.settlementOf(a) === 'nephtos').length : 0;
const hands = sp => sp.plantation ? sp.hands : Math.ceil(KHAMLET.farmNeed(people).hands * sp.share);
const villages = SPECS.map(sp => { const farm = sp.focus === 'farming', res = farm ? { x: sp.near[0] - 350, z: sp.near[1] } : { x: sp.near[0] - 200, z: sp.near[1] };
  const village = KHAMLET.village({ id: sp.id, world: 4242, culture: 'islander_east', focus: sp.focus, site: { x: sp.near[0], z: sp.near[1] }, link: { x: sp.near[0] + 300, z: sp.near[1] },
    resource: farm ? { x: res.x, z: res.z, workers: hands(sp) } : res, dims, ground: { ok: () => true }, worksOut: farm ? ['ie-farm'] : undefined, landing: sp.landing, vacant: ISLE.TUNE.sim.hamlets.grow.vacant });
  return { spec: sp, village, resource: farm ? (village.error ? null : ISLE.farmlandOf(sp, village, { centre: res, ground: {} })) : STANDIN[sp.id] }; });
const NAMES = KHAMLET.dealNames('islander', 4242, SPECS.map(sp => sp.id)); villages.forEach(V => { V.name = NAMES[V.spec.id].name; });
villages.forEach(V => ok('the ' + V.spec.name.toLowerCase() + ' laid out', !V.village.error, V.village.error || V.village.census.pop + ' people, ' + V.village.records.length + ' buildings'));
const H = ISLE.simHamlets(villages);
ok('the colony\'s villages declared with no errors, each a settlement of Nephtos', !H.errors.length && H.villages.every(v => v.parent === 'nephtos'), H.errors.join('; ') || H.villages.map(v => v.id + ' ' + v.people).join(', '));
/* the run */
const a = ISLE.simHamletBooks(); const t0 = Date.now(); ISLE.simRun(days * 1440); const b = ISLE.simHamletBooks();
console.log('--- ' + days + ' days: ' + (Date.now() - t0) + ' ms');
/* the hamlets' own checks, but the one for a town that gave its fields to the countryside (Valapo's on the world; Nephtos never had any) */
ISLE.hamletChecks(a, b).filter(c => !/grows none of its hamlets/.test(c.name)).forEach(c => ok(c.name, c.ok, c.detail));
const E = SIM.econ('nephtos'), BK = ISLE.simBooks('nephtos');
ok('Nephtos fed: no meal without food (' + BK.meals.meal + ' meals at home, ' + BK.meals.none + ' without)', BK.meals.meal > 0 && !BK.meals.none, JSON.stringify(BK.meals));
const cash = ['clove', 'cacao', 'indigo', 'annatto', 'tobacco'], got = g => (E.imported[g] || 0);
ok('its plantations\' crops landed in Nephtos (' + cash.map(g => g + ' ' + got(g)).join(', ') + ') and its mine\'s copper (' + got('copper') + ')', cash.every(g => got(g) > 0) && got('copper') > 0,
  JSON.stringify(E.imported));
ok('its fish its own: the fish market and the fishing village land fish', (E.made.fish || 0) > 0 && (SIM.econ('hamlet-fish-n') ? (SIM.econ('hamlet-fish-n').made.fish || 0) > 0 : false),
  'town ' + (E.made.fish || 0) + ', village ' + (SIM.econ('hamlet-fish-n') ? SIM.econ('hamlet-fish-n').made.fish || 0 : '-'));
/* the merchant family and its pearl ships (47x `pearl`, 47y) */
{ const Hn = S.houses && S.houses.nephtos, A = Hn && SIM.acct(Hn.id), C = S.exp.camps.filter(c => c.town === 'nephtos'), P = C.find(c => c.kind === 'pearl');
  ok('Nephtos\'s merchant house is the family of Tethys, its books in drachmae (' + (Hn ? Hn.name + ', capital ' + Hn.capital + ' ' + (A && A.currency) : 'none') + ')', !!Hn && /Pherekles/.test(Hn.name) && A && A.currency === 'drachma' && Hn.capital > 0);
  const EP = P && SIM.econ(P.id), made = EP ? (EP.made.pearls || 0) : 0, worked = P ? Math.max(1, (Math.min(b.minute, P.struck || b.minute) - P.lands) / 1440) : 1, np = P ? (Array.isArray(P.people) ? P.people.length : P.people) : 0, per = P ? made / (np * worked) : 0;
  ok('its house sends the pearl ships (the Ring Sea kit\'s Hykkousoi pearl ship) to the reef, only that kind; their divers bring up ' + per.toFixed(2) + ' pearls a diver a day (the Islanders\' at best 0.4), landed in Nephtos (' + (E.imported.pearls || 0) + ')',
    !!P && P.vessel === 'hykPearl' && C.every(c => c.kind === 'pearl') && per > 0.4 && (E.imported.pearls || 0) > 0, P ? JSON.stringify({ made, divers: np, days: Math.round(worked * 10) / 10 }) : 'no pearl ship: ' + JSON.stringify(S.exp.log.filter(l => l.town === 'nephtos').slice(0, 3))); }
/* the poleis' fleets (trade.buyers): Tethys's merchantmen take the colony's crops, copper and its finished hulls into its fleet; Ys's and Pontus's call too */
{ const sh = S.ships || {}, T = sh.tethys || { calls: 0, bought: {} }, sold = (S.buyersSold || {}).nephtos || {};
  ok('Tethys\'s merchantmen call at Nephtos and take its crops, copper and hulls home (' + T.calls + ' calls: ' + JSON.stringify(T.bought) + ')', T.calls > 0 && (T.bought.copper || 0) > 0 && (T.bought.ships || 0) > 0 && cash.some(g => T.bought[g] > 0));
  const ysN = (S.shipsAt || {})['hykkousoi|nephtos'] || 0, poN = (S.shipsAt || {})['pontus|nephtos'] || 0;
  ok('Ys\'s and Pontus\'s fleets call at Nephtos and at the Islander towns (Ys ' + ysN + ' at Nephtos, Pontus ' + poN + '; sold abroad from Nephtos ' + JSON.stringify(sold) + ')', ysN > 0 && poN > 0 && ((S.shipsAt || {})['hykkousoi|kautoa'] || 0) > 0 && ((S.shipsAt || {})['pontus|valapo'] || 0) > 0,
    JSON.stringify(S.shipsAt));
  ok('every hull Nephtos\'s shipyard finished is Tethys\'s, at sea with its fleet or waiting for the next call (' + (E.made.ships || 0) + ' built, ' + (T.bought.ships || 0) + ' commissioned)', (E.made.ships || 0) > 0 && (E.made.ships || 0) - (T.bought.ships || 0) <= 6 && (E.exported.ships || 0) === (T.bought.ships || 0),
    'exported ' + (E.exported.ships || 0)); }
/* the negatives of the colony's own checks */
{ const T0 = cp((S.ships || {}).tethys || { calls: 0, bought: {} }); T0.bought.ships = 0;
  ok('negative: Tethys\'s merchantmen that took no hull are caught', !(T0.calls > 0 && (T0.bought.copper || 0) > 0 && (T0.bought.ships || 0) > 0));
  const at = cp(S.shipsAt || {}); delete at['pontus|nephtos']; ok('negative: Pontus never calling at Nephtos is caught', !(((at['hykkousoi|nephtos'] || 0) > 0) && ((at['pontus|nephtos'] || 0) > 0)));
  const built = E.made.ships || 0, took = 0; ok('negative: hulls built and never Tethys\'s are caught', !(built > 0 && (E.exported.ships || 0) === took && built - took <= 6) || built > 6 || (E.exported.ships || 0) !== took);
  const C0 = S.exp.camps.filter(c => c.town === 'nephtos').map(c => Object.assign({}, c, { vessel: 'islanderLakatoi' }));
  ok('negative: a pearl ship that is a lakatoi is caught', !C0.some(c => c.kind === 'pearl' && c.vessel === 'hykPearl')); }
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
