// node settlements/isle-demo/tests/test-isle-hamlets.js [days] — the hamlets in the sim (core/hamlet H5, src/47h) without a
// browser. Plans and declares both towns (src/40-49), lays out the six resource villages with core/hamlet's
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
ISLE.simDeclare(plans);
/* the six villages of openworld/isle-demo 48 (ISLE_HAMLETS.SPECS), laid out at their survey points on stand-in ground */
const SPECS = [
  { id: 'hamlet-salt', name: 'Salt village', focus: 'salt', parent: 'Kautoa', near: [-14776, -107820] },
  { id: 'hamlet-mine', name: 'Iron mine', focus: 'mine', parent: 'Valapo', near: [-18000, 66000] },
  { id: 'hamlet-lumber', name: 'Lumber village', focus: 'lumber', parent: 'Kautoa', near: [74697, -42993] },
  { id: 'hamlet-ranch', name: 'Ranch', focus: 'ranch', parent: 'Kautoa', near: [20093, -117084] },
  { id: 'hamlet-quarry', name: 'Quarry', focus: 'quarry', parent: 'Valapo', near: [-12500, 61500] },   /* 2026-11-04: Valapo's stone */
  { id: 'hamlet-lumber-v', name: 'Valapo lumber village', focus: 'lumber', parent: 'Valapo', near: [-4000, 56900] }];   /* and its timber, a felling crew of its own */
const dims = k => ISLE_DIMS[k] ? { w: ISLE_DIMS[k].w, d: ISLE_DIMS[k].d, h: ISLE_DIMS[k].h } : /^br_bldg/.test(k) ? { w: 16, d: 14, h: 10 } : null;
const STANDIN = { 'hamlet-salt': { id: 'hamlet-salt:field', kind: 'salt', grade: 'high' }, 'hamlet-mine': { id: 'hamlet-mine:node', kind: 'iron', grade: 'medium' }, 'hamlet-lumber': { id: 'hamlet-lumber:stand', kind: 'stand', forest: () => 0.85 }, 'hamlet-ranch': { id: 'hamlet-ranch:field', kind: 'pasture', grade: 'high' } , 'hamlet-quarry': { id: 'hamlet-quarry:face', kind: 'stone', grade: 'medium' }, 'hamlet-lumber-v': { id: 'hamlet-lumber-v:stand', kind: 'stand', forest: () => 0.85 }};
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
{ const B = cp(b); B.villages['hamlet-mine'].site.amount = 50000; caught('an iron node that would give out in months', ISLE.hamletChecks(a, B), /lasts at least/); }
{ const B = cp(b); B.villages['hamlet-salt'].site.start = 40000; caught('a salt pan sized as before (40,000 lots, 300 back a night)', ISLE.hamletChecks(a, B), /lasts at least/); }
{ const B = cp(b); B.villages['hamlet-lumber'].site.camp.x += 500; caught('a felling camp not where its log puts it', ISLE.hamletChecks(a, B), /felling crew/); }
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
