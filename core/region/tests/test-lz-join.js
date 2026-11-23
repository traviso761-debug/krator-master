// node core/region/tests/test-lz-join.js — the Xanadu Sultanate and the Lizardmen in one valley run (step Z5 of
// core/simulation/PROPOSAL-LIZARDMEN.md; core/region/data/lz-join.js LZ_JOIN). The only links are the raids, and this is the
// one run where they touch the Sultanate's ledger: the take leaves its forts', villages' and the Golden Tears' camp's own
// warehouses. Three raiding seasons (215 days, a few minutes: the Sultanate is 380,000 people) and the Sultan's first punitive
// expedition from Strongwall, and two short negatives.
// test-xan-economy.js, test-east-rift.js and test-catch.js do not load the Lizardmen and are unchanged by them.
const fs = require('fs'), path = require('path');
const T = require('../../../tools/ktest.js')(__filename);
global.window = global;
const ROOT = path.join(__dirname, '..', '..', '..'), rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const load = () => {
  (0, eval)(rd('core/clock/20-core-clock.js'));
  fs.readdirSync(path.join(ROOT, 'core', 'simulation')).filter(f => /^77-sim-.*\.js$/.test(f)).sort().forEach(f => (0, eval)(rd('core/simulation/' + f)));
  (0, eval)(rd('core/camp/55-camp-raid.js'));
  (0, eval)(rd('core/region/00-region-core.js')); const H = { TUNE: { sim: {} } }; KREGION.use(H);
  ['50-region-valley.js', '51-region-allot.js', '52-region-raid.js'].forEach(f => (0, eval)(rd('core/region/' + f)));
  (0, eval)(rd('core/region/data/xan-tune.js')); (0, eval)(rd('settlements/gila/src/88-gl-records.js')); (0, eval)(rd('core/region/data/lz-tune.js'));
  (0, eval)(rd('core/region/data/lz-join.js')); return H;
};
const PX = JSON.parse(rd('openworld/xanadu-oidong-highrift/plan/sites.json'));
function run(days, o, edit) {
  const H = load(), V = LZ_JOIN.valley(PX, o || {}); if (edit) edit(V); const S = H.simValley(V), a = SIM.ledgerSnap(); H.valleyRun(days * 1440, 60); const b = SIM.ledgerSnap();
  return { H, V, S, B: H.valleyBooks().towns, R: S.raiding, ledger: SIM.ledger(a, b, { tol: 1 }) };
}
const t = n => (n / 1000).toFixed(1) + ' t';
const fed = (Bk, ids) => { const bad = []; ids.forEach(s => { const x = Bk[s]; if (!x || !x.people) return; ['grain', 'meat_hide', 'fish', 'produce', 'salt'].forEach(g => { const e = x.eaten[g] || 0, h = x.hungry[g] || 0; if (h > (e + h) * .01) bad.push(s + ' ' + g); }); }); return { ok: !bad.length, bad }; };
const t0 = Date.now(), Y = run(215, {}), LZ = new Set(LZ_TUNE.places.map(p => p.key));
console.log('215 days of the Sultanate and the Lizardmen in one run in ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s: ' + Y.S.order.length + ' settlements, ' + Math.round(Y.V.settlements.reduce((n, s) => n + s.people, 0)) + ' people');
const done = Y.R.raids.filter(r => r.band), targets = LZ_TUNE.raids.targets.map(x => x.id);

// 1. declared: the Sultanate's settlements and the Lizardmen's seventeen (Skink + eight warrens, 2026-11-17), the Lizardmen hostile to every faction, no problems
{
  const lz = Y.V.settlements.filter(s => LZ.has(s.id)), hostile = Y.V.factions.filter(f => f.id !== 'lizardmen').every(f => Y.V.relations.some(r => r.a === 'lizardmen' && r.b === f.id && r.stance === 'hostile'));
  T.ok('Z5: one valley: the Sultanate\'s ' + (Y.S.order.length - lz.length) + ' settlements and the Lizardmen\'s ' + lz.length + ', hostile to all, no road between them; no problems',
    lz.length === 17 && hostile && !Y.V.roads.some(r => LZ.has(r.from) || LZ.has(r.to)) && !Y.S.problems.length, (Y.S.problems.slice(0, 3).join('; ') || 'none'));
}
// 2. the books balance, both peoples
T.ok('Z5: the books balance, every settlement of both', Y.ledger.ok, Y.ledger.ok ? 'all goods' : Y.ledger.problems.slice(0, 3).join('; '));
// 3. the raids touch the Sultanate's ledger: what each raid took left its target's own warehouses, booked exported
const inBooks = R => { const d = R.R ? R.R.raids.filter(r => r.band && Object.keys(r.take).length) : []; return d.length > 0 &&
  d.every(r => Object.keys(r.take).every(g => (R.B[r.target].exported[g] || 0) >= r.take[g])); };
{
  const took = {}; done.forEach(r => Object.keys(r.take).forEach(g => { took[g] = (took[g] || 0) + r.take[g]; }));
  T.ok('Z5: ' + done.length + ' raids on the Sultanate\'s own settlements (' + [...new Set(done.map(r => r.target))].join(', ') + '); what they took (' + Object.keys(took).map(g => g + ' ' + took[g]).join(', ') + ') left the targets\' own warehouses',
    done.length >= 3 && inBooks(Y));
  const N = run(20, { raids: false });
  T.neg('Z5: the same valley without the raids takes nothing from the Sultanate', inBooks, N, Y);
}
// 4. the Sultanate's side: the forts hold and keep their state; the assaults, grants and expeditions are its events
{
  const forts = done.filter(r => /^march\./.test(r.target)), E = Y.R.events;
  T.ok('Z5: the Marches\' forts hold (' + (forts.map(r => r.band).join(', ') || 'not raided yet') + ') and stay kept; ' + E.filter(e => e.kind === 'assault').length + ' assaults recorded on the Sultanate\'s side',
    forts.every(r => r.band === 'repulsed' || r.band === 'skirmish') && ['march.w', 'march.s', 'march.e'].every(id => Y.V.settlements.find(s => s.id === id).state === 'kept') &&
    E.filter(e => e.kind === 'assault').every(e => e.faction === 'xanadu' || e.faction === 'tears'));
}
// 5. the raided places stay fed: the caps leave their staples (14 days); with the caps off the villages are stripped
{
  const f = fed(Y.B, targets);
  T.ok('Z5: every raided place stays fed (the forts, the Marches\' villages, the Tears\' camp)', f.ok, f.bad.join('; ') || 'none short');
  const C = run(30, { raids: true }, V => { V.raids.caps = false; });
  T.neg('Z5: with the caps off a raided place goes hungry', B => fed(B, targets).ok, C.B, Y.B);
}
// 6. the Lizardmen fed in the joint run, the Allotment at work beside the Sultanate
{
  const f = fed(Y.B, [...LZ]);
  T.ok('Z5: every Lizardman place fed in the joint run; the Allotment issued ' + Y.S.allot.loads.length + ' loads', f.ok && Y.S.allot.loads.length > 0, f.bad.join('; ') || 'none short');
}
// 7. the Sultan's punitive expedition, in its own books: it musters at Strongwall (its provisions used there), marches on the
//    raiding town, and what it takes back lands at Strongwall; the town loses it from its own warehouses
{
  const X = (Y.R.expeditions || []).filter(E => E.from === 'sxan7r1sln' && E.landed), E = X[0] || {};
  const landedOK = !!E.id && Object.keys(E.take).length > 0 && Object.keys(E.take).every(g => (Y.B.sxan7r1sln.imported[g] || 0) >= E.take[g] && (Y.B[E.target].exported[g] || 0) >= E.take[g]);
  T.ok('Z5: the Sultan\'s punitive expedition from Strongwall on ' + (E.target || '?') + ' (' + (E.band || 'none') + '): what it took back (' + JSON.stringify(E.take || {}) + ') left the town\'s warehouses and landed at Strongwall', landedOK,
    (Y.R.expeditions || []).map(x => x.id + ' ' + x.faction + ' ' + x.band + ' landed ' + x.landed).join('; ') || 'no expedition');
}
console.log('in ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
T.done();
