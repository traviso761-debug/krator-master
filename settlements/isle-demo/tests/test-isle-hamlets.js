// node settlements/isle-demo/tests/test-isle-hamlets.js [days] — the hamlets in the sim (core/hamlet H5, src/47h) without a
// browser. Plans and declares both towns (src/40-49) with the villages' specs (so Valapo drops its farms stand-in and both
// towns count the countryside's crops as their own), lays out the six resource villages, the six farming hamlets and the
// two plantations (PLAN.md section 11) with core/hamlet's
// KHAMLET.village on STAND-IN ground (the open world's survey points, every place dry: the real layout needs the open
// world's fields and the isles' zones, openworld/isle-demo 48; its verify.py checks the villages there), declares them
// (ISLE.simHamlets), runs `days` with Kautoa watched and checks ISLE.hamletChecks: six villages, each its town's, at the
// abstract level; staffed; making their goods; every load landed or on the road and booked imported in the town; each
// village fed by its town. Each check with a negative. Then the towns' week checks still hold with the villages in.
// Build first (python3 build.py).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8').startsWith('version https://git-lfs')) { console.log('FAIL  dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
/* core/camp: the felling crew's work camp (the open world loads it; the city page does not) */
['10-camp-cultures.js', '40-camp-work.js'].forEach(f => vm.runInThisContext(fs.readFileSync(path.join(HERE, '..', '..', 'core', 'camp', f), 'utf8'), { filename: f }));
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
ISLE.initWorld();
const days = +(process.argv[2] || 5);
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
/* the villages of openworld/isle-demo 48 (ISLE_HAMLETS.SPECS), laid out at their survey points on stand-in ground; the farming
   hamlets and plantations (PLAN.md section 11) 5 to 7 km out from each town's frame, four ways, as the world's survey would
   set them on flat dry ground; their hands from the land estimate on the towns' census (KHAMLET.farmNeed) */
const frame = town => plans[ISLE.TOWNS.indexOf(town)].G.frame, people = {}; plans.forEach((p, i) => { people[ISLE.TOWNS[i]] = ISLE.census(p.R).citizens; });
const farmAt = (town, dx, dz) => [frame(town).x + dx, frame(town).z + dz];
const SPECS = [
  { id: 'hamlet-salt', name: 'Salt village', focus: 'salt', parent: 'Kautoa', near: [-14776, -107820] },
  { id: 'hamlet-mine', name: 'Iron mine', focus: 'mine', parent: 'Valapo', near: [-18000, 66000] },
  { id: 'hamlet-lumber', name: 'Lumber village', focus: 'lumber', parent: 'Kautoa', near: [74697, -42993], landing: { x: 74697 + 450, z: -42993, ux: 1, uz: 0 }, seaKm: 41 },   /* on the coast (stand-in: the shore 450 m east, 41 km by sea to Kautoa) */
  { id: 'hamlet-ranch', name: 'Ranch', focus: 'ranch', parent: 'Kautoa', near: [20093, -117084] },
  { id: 'hamlet-ranch-k2', name: 'Kautoa south ranch', focus: 'ranch', parent: 'Kautoa', near: [26000, -72000] },   /* 2026-11-09 */
  { id: 'hamlet-ranch-v', name: 'Valapo ranch', focus: 'ranch', parent: 'Valapo', near: [2000, 41000] },
  { id: 'hamlet-quarry', name: 'Quarry', focus: 'quarry', parent: 'Valapo', near: [-12500, 61500] },   /* 2026-11-04: Valapo's stone */
  { id: 'hamlet-lumber-v', name: 'Valapo lumber village', focus: 'lumber', parent: 'Valapo', near: [-4000, 56900] },   /* and its timber, a felling crew of its own */
  { id: 'hamlet-farm-k1', name: 'Kautoa farming hamlet 1', focus: 'farming', parent: 'Kautoa', crops: 'staples', share: 1 / 4, near: farmAt('Kautoa', 6500, 0) },
  { id: 'hamlet-farm-k2', name: 'Kautoa farming hamlet 2', focus: 'farming', parent: 'Kautoa', crops: 'staples', share: 1 / 4, near: farmAt('Kautoa', -6500, 0) },
  { id: 'hamlet-farm-k3', name: 'Kautoa farming hamlet 3', focus: 'farming', parent: 'Kautoa', crops: 'staples', share: 1 / 4, near: farmAt('Kautoa', 0, 6500) },
  { id: 'hamlet-farm-k4', name: 'Kautoa farming hamlet 4', focus: 'farming', parent: 'Kautoa', crops: 'staples', share: 1 / 4, near: farmAt('Kautoa', 0, -6500) },
  { id: 'hamlet-plant-k', name: 'Kautoa plantation', focus: 'farming', parent: 'Kautoa', crops: 'cash', plantation: true, hands: 60, near: farmAt('Kautoa', 5000, 5000) },
  { id: 'hamlet-farm-v1', name: 'Valapo farming hamlet 1', focus: 'farming', parent: 'Valapo', crops: 'staples', share: 1 / 2, near: farmAt('Valapo', 6000, 0) },
  { id: 'hamlet-farm-v2', name: 'Valapo farming hamlet 2', focus: 'farming', parent: 'Valapo', crops: 'staples', share: 1 / 2, near: farmAt('Valapo', -6000, 0) },
  { id: 'hamlet-plant-v', name: 'Valapo plantation', focus: 'farming', parent: 'Valapo', crops: 'cash', plantation: true, hands: 60, near: farmAt('Valapo', 0, 6000) },
  { id: 'hamlet-plant-vw', name: 'Valapo clove plantation', focus: 'farming', parent: 'Valapo', crops: 'island', plantation: true, hands: 90, overseas: true,
    near: [-24400, 33084], landing: { x: -24400 + 400, z: 33084, ux: 1, uz: 0 }, seaKm: 32 },   /* 2026-11-09: on the forest island west (stand-in: its shore 400 m east, 32 km by sea) */
  { id: 'hamlet-clay-k', name: 'Kautoa clay pits', focus: 'clay', parent: 'Kautoa', near: farmAt('Kautoa', 8000, -2000) },   /* 2026-11-09: the potters' clay, by the mangrove flats */
  { id: 'hamlet-clay-v', name: 'Valapo clay pits', focus: 'clay', parent: 'Valapo', near: farmAt('Valapo', 7000, 5000) }];
ISLE.simDeclare(plans, null, { hamlets: SPECS });
const dims = k => ISLE_DIMS[k] ? { w: ISLE_DIMS[k].w, d: ISLE_DIMS[k].d, h: ISLE_DIMS[k].h } : /^br_bldg/.test(k) ? { w: 16, d: 14, h: 10 } : null;
const STANDIN = { 'hamlet-clay-k': { id: 'hamlet-clay-k:bank', kind: 'clay', grade: 'medium' }, 'hamlet-clay-v': { id: 'hamlet-clay-v:bank', kind: 'clay', grade: 'medium' }, 'hamlet-salt': { id: 'hamlet-salt:field', kind: 'salt', grade: 'high' }, 'hamlet-mine': { id: 'hamlet-mine:node', kind: 'iron', grade: 'medium' }, 'hamlet-lumber': { id: 'hamlet-lumber:stand', kind: 'stand', forest: () => 0.85 }, 'hamlet-ranch': { id: 'hamlet-ranch:field', kind: 'pasture', grade: 'high' }, 'hamlet-ranch-k2': { id: 'hamlet-ranch-k2:field', kind: 'pasture', grade: 'medium' }, 'hamlet-ranch-v': { id: 'hamlet-ranch-v:field', kind: 'pasture', grade: 'medium' } , 'hamlet-quarry': { id: 'hamlet-quarry:face', kind: 'stone', grade: 'medium' }, 'hamlet-lumber-v': { id: 'hamlet-lumber-v:stand', kind: 'stand', forest: () => 0.85 }};
const hands = sp => sp.plantation ? sp.hands : Math.ceil(KHAMLET.farmNeed(people[sp.parent]).hands * sp.share);
const villages = SPECS.map(sp => { const farm = sp.focus === 'farming', res = farm ? { x: sp.near[0] - 350, z: sp.near[1] } : { x: sp.near[0] - 200, z: sp.near[1] };
  const village = KHAMLET.village({ id: sp.id, world: 4242, culture: 'islander_east', focus: sp.focus, site: { x: sp.near[0], z: sp.near[1] }, link: { x: sp.near[0] + 300, z: sp.near[1] },
    resource: farm ? { x: res.x, z: res.z, workers: hands(sp) } : res, dims, ground: { ok: () => true }, worksOut: farm ? ['ie-farm'] : undefined, landing: sp.landing, vacant: ISLE.TUNE.sim.hamlets.grow.vacant });
  return { spec: sp, village, resource: farm ? (village.error ? null : ISLE.farmlandOf(sp, village, { centre: res, ground: {} })) : STANDIN[sp.id] }; });
const NAMES = KHAMLET.dealNames('islander', 4242, SPECS.map(sp => sp.id)); villages.forEach(V => { V.name = NAMES[V.spec.id].name; });
ok('every village dealt a Sikau name of its own (' + villages.slice(0, 4).map(V => V.name + ' the ' + V.spec.name.toLowerCase()).join('; ') + '...)', new Set(villages.map(V => V.name)).size === villages.length && villages.every(V => /^\S+ \S+$/.test(V.name)), '');
villages.forEach(V => ok('the ' + V.spec.name.toLowerCase() + ' laid out', !V.village.error && V.village.records.length > 10 && (!V.spec.plantation && V.spec.focus === 'farming' ? V.resource.records.length >= 9 && V.resource.tracks.length === V.resource.records.length : true),
  V.village.error || V.village.census.pop + ' people, ' + V.village.records.length + ' buildings' + (V.resource && V.resource.kind === 'farmland' ? ', ' + V.resource.inCropHa + ' ha in crop of ' + V.resource.farmedHa + ' farmed (' + V.resource.parcels.length + ' parcels), ' + V.resource.records.length + ' farmsteads on their holdings, ' + V.resource.tracks.length + ' tracks' : '')));
ok('Valapo has no farm parcel within the village and its farms stand-in is off; Kautoa keeps its farm ring (PLAN.md section 11)',
  plans[ISLE.TOWNS.indexOf('Valapo')].R.fields.length === 0 && ISLE.SIM.standinOff && ISLE.SIM.standinOff.valapo === 'farms' && !ISLE.SIM.standinOff.kautoa && ISLE.SIM.towns.kautoa.places.places.some(P => P.tags.district === 'farm ring') && !ISLE.SIM.towns.valapo.places.places.some(P => P.tags.district === 'farms'),
  JSON.stringify(ISLE.SIM.standinOff) + '; Valapo counts ' + ISLE.SIM.towns.valapo.econ.brought.join(', ') + ' as its own, by road');
const t0 = Date.now(), H = ISLE.simHamlets(villages);
ok('declared with no errors', !H.errors.length, H.errors.join('; ') || H.villages.map(X => X.id + ': ' + X.people + ' people, ' + X.km + ' km to ' + X.parent + ' (' + Math.round(X.minutes / 60) + ' h on the road)').join('; '));
ISLE.simWatch('Kautoa');
const a = ISLE.simHamletBooks(); ISLE.simRun(1440); const short1 = JSON.parse(JSON.stringify(SIM.econ('valapo').short)); ISLE.simRun((days - 1) * 1440); const b = ISLE.simHamletBooks();
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
{ const B = cp(b); B.villages['hamlet-mine'].site.amount = 50000; caught('an iron node that would give out in months', ISLE.hamletChecks(a, B), /lasts at least/); }
{ const B = cp(b); B.villages['hamlet-salt'].site.start = 40000; caught('a salt pan sized as before (40,000 lots, 300 back a night)', ISLE.hamletChecks(a, B), /lasts at least/); }
{ const B = cp(b); B.villages['hamlet-lumber'].site.camp.x += 500; caught('a felling camp not where its log puts it', ISLE.hamletChecks(a, B), /felling crew/); }
{ const B = cp(b); B.villages['hamlet-lumber'].workers = 3; caught('a lumber village with three workers', ISLE.hamletChecks(a, B), /staffed/); }
/* the town fed by road: Valapo, its fields gone to the countryside, ran short of none of its staples after the first day */
{ const E = SIM.econ('valapo'), st = ISLE.SIM.towns.valapo.econ.brought.filter(g => ISLE.TUNE.sim.items.foods.indexOf(g) >= 0).map(g => g + ' ' + ((E.short[g] || 0) - (short1[g] || 0)));
  ok('Valapo, fed by road, ran short of none of the countryside\'s staples after the first day (' + st.join(', ') + ')', st.every(x => / 0$/.test(x)), 'bread short ' + ((E.short.bread || 0) - (short1.bread || 0))); }
/* the villages grow (step 5): the plots laid, the lots on the building, a project under way with its hands and its town's timber */
{ const V0 = villages.filter(V => !V.village.error), plots = V0.map(V => V.village.records.filter(r => r.vacant).length), BR = SIM.buildReport();
  const under = ISLE.SIM.hamlets.villages.filter(X => { const T2 = BR.towns[X.id]; return T2 && T2.projects.some(Pj => Pj.state === 'building' && Pj.done > 0 || Pj.state === 'built'); });
  ok('every village laid empty plots (' + plots.join(', ') + ' for ' + V0.map(V => V.village.census.households).join(', ') + ' households) and ' + under.length + ' of ' + V0.length + ' have a house under way or built after ' + days + ' days',
    plots.every(n => n > 0) && under.length >= Math.floor(V0.length / 2), under.map(X => { const T2 = BR.towns[X.id], Pj = T2.projects[0]; return X.id + ' ' + (Pj ? Pj.state + ' ' + Math.round(Pj.done) + '/' + Pj.hours + ' h, timber got ' + (Pj.got.timber || 0) : ''); }).join('; '));
  const B = cp(b); const g0 = Object.keys(B.villages).find(k => B.villages[k].lots.length); B.villages[g0].lots = B.villages[g0].lots.concat(['nowhere']); caught('a village plot that is neither a lot nor a home', ISLE.hamletChecks(a, B), /villages grow/); }
/* the coast: the lumber village's quay and its sea leg (the owner, 2026-11-09) */
{ const X = ISLE.SIM.hamlets.villages.find(v => v.id === 'hamlet-lumber'), Q = X && SIM.R.place[X.quayAt ? X.sea.quay : ''];
  ok('the lumber village has a quay (a canoe stop of its own, a site store) and a sea leg to Kautoa\'s canoe stop', !!X.sea && !!Q && Q.kind === 'canoe stop' && SIM.R.place[X.sea.route] == null && !!SIM.TRADE.routes[X.sea.route] && SIM.TRADE.routes[X.sea.route].stops[1].place === 'kautoa.stop',
    X.sea ? X.sea.km + ' km, ' + X.sea.minutes + ' minutes a passage, ' + X.sea.vessel : 'no sea leg');
  const B = cp(b); B.villages['hamlet-lumber'].sea.landed = {}; B.villages['hamlet-lumber'].sea.atSea = {}; caught('a lumber village whose lakatoi landed nothing', ISLE.hamletChecks(a, B), /sea leg/); }
/* the countryside's negatives (PLAN.md section 11) */
{ const B = cp(b); B.villages['hamlet-farm-k1'].farm.inCropHa = 1; B.villages['hamlet-farm-k2'].farm.inCropHa = 1; caught('two farming hamlets with a hectare each in crop', ISLE.hamletChecks(a, B), /land in crop/); }
{ const B = cp(b), X = B.villages['hamlet-farm-v1']; X.landed['sweet-potato'] = a.villages['hamlet-farm-v1'].landed['sweet-potato'] || 0; X.goods['sweet-potato'].stock = 0; X.atSea['sweet-potato'] = 0; caught('a farming hamlet whose sweet potato never reached Valapo', ISLE.hamletChecks(a, B), /crop the countryside grows landed/); }
{ const B = cp(b); B.towns.valapo.made['sweet-potato'] = (B.towns.valapo.made['sweet-potato'] || 0) + 500; caught('Valapo growing 500 servings of sweet potato itself', ISLE.hamletChecks(a, B), /grows none of its hamlets/); }
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
/* Valapo's clove plantation overseas (the owner, 2026-11-09): both its routes sea legs, its cloves landed in Valapo, and it
   grows and eats its own staples */
{ const X = ISLE.SIM.hamlets.villages.find(v => v.id === 'hamlet-plant-vw'), E = SIM.econ('hamlet-plant-vw'), RO = X && SIM.tradeReport(X.sea.route), RI = X && SIM.tradeReport(X.sea.routeIn);
  const R0 = X && SIM.TRADE.routes[X.sea.route], R1 = X && SIM.TRADE.routes[X.sea.routeIn], quayEnds = R => R && R.stops.some(st => st.place === X.sea.quay) && R.stops.some(st => st.place === 'valapo.stop');
  const own = ['sweet-potato', 'taro', 'banana'].filter(g => (E.made[g] || 0) > 0), ate = own.filter(g => (E.used[g] || 0) > 0), clove = (RO && RO.landed['hamlet-plant-vw>valapo'] || {}).clove || 0, atSea = RO ? RO.carriers.reduce((n, C) => n + C.cargo.filter(c => c.good === 'clove').reduce((k, c) => k + c.n, 0), 0) : 0;
  ok('Valapo\'s clove plantation overseas: both its routes sea legs from its quay to the town\'s canoe stop (' + (X ? X.sea.km + ' km, ' + Math.round(X.sea.minutes / 60) + ' h' : '-') + '), its cloves to Valapo (' +
     Math.round(E.made.clove || 0) + ' grown, ' + clove + ' landed, ' + atSea + ' at sea), its own staples grown and eaten (' + own.map(g => g + ' ' + Math.round(E.made[g]) + ' grown, ' + Math.round(E.used[g] || 0) + ' eaten').join('; ') + ')',
    !!X && X.sea.overseas && quayEnds(R0) && quayEnds(R1) && (E.made.clove || 0) > 0 && clove + atSea > 0 && own.length >= 2 && ate.length >= 2, X ? JSON.stringify(X.sea) : 'no village'); }
/* the clay (the owner, 2026-11-09): each town's potters make their pots of the clay its clay village digs and carts in,
   two lots a pot (their recipe takes it; a town whose opening pots last the run makes none) */
{ const C = t => SIM.econ(t), dug = id => SIM.econ(id) ? (SIM.econ(id).made.clay || 0) : 0, landed = t => C(t).imported.clay || 0;
  const per = t => (C(t).made.pots || 0) === 0 || (C(t).used.clay || 0) >= 2 * (C(t).made.pots || 0) - 2;
  ok('the potters make pots of the clay pits\' clay, two lots a pot (Kautoa: ' + dug('hamlet-clay-k') + ' dug, ' + landed('kautoa') + ' landed, ' + (C('kautoa').used.clay || 0) + ' used, ' +
     (C('kautoa').made.pots || 0) + ' pots; Valapo: ' + dug('hamlet-clay-v') + ' dug, ' + landed('valapo') + ' landed, ' + (C('valapo').used.clay || 0) + ' used, ' + (C('valapo').made.pots || 0) + ' pots)',
    dug('hamlet-clay-k') > 0 && dug('hamlet-clay-v') > 0 && landed('kautoa') > 0 && landed('valapo') > 0 && per('kautoa') && per('valapo') && ['kautoa', 'valapo'].every(t => C(t).inputs.pots && C(t).inputs.pots.clay === 2),
    JSON.stringify({ k: C('kautoa').inputs && C('kautoa').inputs.pots, v: C('valapo').inputs && C('valapo').inputs.pots })); }
/* the felling crew moves camp (core/camp 40): its stand worked down to its seed trees, it strikes, marches and pitches at
   the next stand, its recipe held on the way, then felling there; the books balance across the move */
{ const c = ISLE.SIM.crews[0], W = c.W, E = SIM.econ(c.settlement), s0 = W.cur.stand, St = E.resSites[s0], P0 = SIM.R.place[c.place], x0 = P0.x, z0 = P0.z, L0 = SIM.ledgerSnap();
  St.amount = Math.floor(W.cfg.strikeAt * W.by[s0].cap) + 1; const m0 = E.made.logs || 0;
  const n0 = W.log.length; let held = null; for (let h = 0; h < 30 && W.log.length === n0; h++) ISLE.simRun(60);
  ISLE.simRun(60); held = (SIM.blockedReport(c.settlement)[c.place] || {}).reason;
  const mid = ISLE.crewSite(ISLE.SIM.hamlets.villages.find(X => X.crew)).camp, during = E.made.logs || 0; ISLE.simRun(2 * 1440);
  const s1 = W.cur.stand, St1 = E.resSites[s1], LG = SIM.ledger(L0, SIM.ledgerSnap()), P1 = SIM.R.place[c.place], mv = W.log.filter(o => o.op === 'march').pop();
  ok('the felling crew moves camp: its stand down to its seed trees, it strikes, marches ' + Math.round(Math.hypot(mv.x1 - mv.x0, mv.z1 - mv.z0)) + ' m and fells the next stand, its books balanced',
    held === 'moving camp' && s1 !== s0 && St1 && St1.taken > 0 && E.recipes[c.place].site === s1 && Math.hypot(P1.x - x0, P1.z - z0) > 100 && P1.x === W.by[s1].x && LG.ok && (E.made.logs || 0) > during,
    s0 + ' to ' + s1 + ', held "' + held + '" (' + mid.state + '), ' + St1.taken + ' logs from the new stand, ' + ((E.made.logs || 0) - m0) + ' in all; ledger ' + (LG.ok ? 'ok' : LG.problems.slice(0, 2).join('; '))); }
/* depletion: the mine's node all but emptied: it stops, says why, Valapo's smithies run out and say what they miss */
{ const EM = SIM.econ('hamlet-mine'), St = EM.resSites['hamlet-mine:node'], m0 = EM.made.ore || 0; St.amount = 40; ISLE.simRun(4 * 1440);
  const gone = (EM.made.ore || 0) - m0, R = SIM.sitesReport('hamlet-mine')[0], BL = EM.blocked['depleted: hamlet-mine:node'] || 0;
  ok('a mine emptied stops, and says why', gone === 40 && R.amount === 0 && BL > 0, gone + ' more ore, ' + R.amount + ' left, blocked ' + BL + ' times');
  const why = Object.values(SIM.blockedReport('valapo')).filter(w => w.reason === 'missing' && w.goods.indexOf('ore') >= 0).length, v0 = SIM.stockOf('ore', 'valapo');
  console.log('--- after the mine: Valapo holds ' + v0 + ' ore, ' + why + ' smithies say they miss it'); }
/* the building's timber (47b): with the lumber village the towns keep timber, and their houses' upkeep and projects draw it */
if (SIM.BUILD) { const BR = SIM.buildReport(), tw = ISLE.SIM.order.map(s2 => { const T = BR.towns[s2]; return T ? s2 + ' timber ' + (T.upkeep.taken.timber || 0) + ' drawn, ' + (T.upkeep.owed.timber || 0) + ' owed, ' + T.built + ' built' : s2 + ' -'; });
  ok('with the lumber village the houses draw their timber (' + tw.join('; ') + ')', ISLE.SIM.order.every(s2 => BR.towns[s2] && BR.towns[s2].upkeep.taken.timber > 0), tw.join('; ')); }
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
