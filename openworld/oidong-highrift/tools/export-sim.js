// node openworld/oidong-highrift/tools/export-sim.js [out] [days] — the valley's replayed week for Godot (GODOT-PLAN.md
// section 8, M7: the one-world case; the owner, 2026-11-16). Declares Longsong's valley on core/simulation exactly as its
// economy test does (core/region/50-region-valley.js from settlements/longsong/src/15-ls-tune.js on this region's baked
// plan, plan/sites.json), takes the books at the start, runs `days` (7) by the hour and writes to `out` (default
// godot/data/world-oidong-highrift):
//   sim.json     the krator-sim export at the week's end (core/simulation 77-sim-8: its settlements, places, actors,
//                economies and routes) and the valley's own spec (each settlement's people and works, each road's ends,
//                its tithe and its want), with the ledger's snapshots at the start and the end (SIM.ledgerSnap)
//   golden.json  the page's answers: SIM.ledger over the week (each settlement's books by good: opening, made, imported,
//                consumed, spoiled, exported, closing and the residual; each road's loads shipped, landed and at sea),
//                which godot/tests/export/oidong_world_test.gd derives again from sim.json's snapshots and must agree with
// Deterministic: the same plan and tune write the same files.
const fs = require('fs'), path = require('path');
global.window = global;
const HERE = path.join(__dirname, '..'), ROOT = path.join(HERE, '..', '..'), rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'godot', 'data', 'world-oidong-highrift')), DAYS = +(process.argv[3] || 7);
(0, eval)(rd('core/clock/20-core-clock.js'));
fs.readdirSync(path.join(ROOT, 'core', 'simulation')).filter(f => /^77-sim-.*\.js$/.test(f)).sort().forEach(f => (0, eval)(rd('core/simulation/' + f)));
(0, eval)(rd('core/region/00-region-core.js'));
const H = { TUNE: { sim: {} } }; KREGION.use(H); (0, eval)(rd('core/region/50-region-valley.js'));
(0, eval)(rd('settlements/longsong/src/15-ls-tune.js'));
const PLAN = JSON.parse(rd('openworld/oidong-highrift/plan/sites.json'));
const V = LS_TUNE.valley(PLAN, {}), S = H.simValley(V);
if (S.problems.length) { console.log('the valley did not declare: ' + S.problems.slice(0, 5).join('; ')); process.exit(1); }
const a = SIM.ledgerSnap(), B0 = H.valleyBooks(), t0 = Date.now();
H.valleyRun(DAYS * 1440, 60);
const b = SIM.ledgerSnap(), B1 = H.valleyBooks(), L = SIM.ledger(a, b, { tol: 1 });
const doc = SIM.export({ log: 0 });
doc.valley = { region: PLAN.region, plan: PLAN.hash, scale: V.scale, days: DAYS,
  settlements: V.settlements.map(s => ({ id: s.id, name: s.name, faction: s.faction, parent: s.parent || null, people: s.people, x: s.x, z: s.z,
    works: s.works.map(w => ({ id: w.id, kind: w.kind, crew: w.crew, out: w.out || null, batch: w.batch || null, season: w.season || null })) })),
  roads: V.roads.map(r => ({ id: r.id, from: r.from, to: r.to, minutes: r.minutes, cap: r.cap, carriers: r.carriers || 1, want: r.want == null ? null : r.want,
    share: r.share || null, goods: r.goods || null })),
  transfers: (V.transfers || []).map(t => ({ id: t.id, from: t.from, to: t.to, goods: t.goods, first: t.first, every: t.every })),
  ledger: { start: a, end: b }, books: { start: B0, end: B1 } };
const golden = { format: 'krator-sim-golden', build: 'openworld/oidong-highrift', plan: PLAN.hash, week: { days: DAYS, from: a.minute, to: b.minute },
  ledger: { ok: L.ok, problems: L.problems.slice(0, 20), towns: L.towns, routes: L.routes },
  settlements: S.order.length, roads: V.roads.length,
  note: 'the page\'s answers (core/simulation SIM.ledger over the week, tol 1): godot derives each town\'s residual and each route\'s legs again from sim.json\'s valley.ledger and compares' };
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'sim.json'), JSON.stringify(doc));
fs.writeFileSync(path.join(OUT, 'golden.json'), JSON.stringify(golden));
console.log('a week of the valley in ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s: ' + S.order.length + ' settlements, ' + V.roads.length + ' roads, the books '
  + (L.ok ? 'balance' : 'DO NOT balance: ' + L.problems.slice(0, 3).join('; ')) + '; wrote ' + path.relative(ROOT, OUT).replace(/\\/g, '/')
  + ' (sim.json ' + (fs.statSync(path.join(OUT, 'sim.json')).size >> 10) + ' KB, golden.json ' + (fs.statSync(path.join(OUT, 'golden.json')).size >> 10) + ' KB)');
process.exit(L.ok ? 0 : 1);
