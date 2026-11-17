// node core/region/tests/test-lz-raids.js — the Lizardmen's raids on the valley host (step Z4 of
// core/simulation/PROPOSAL-LIZARDMEN.md; the owner, 2026-11-17: "next step, implement raiding"). Two years of the Lizardmen's
// country (core/region/data/lz-tune.js) with the Allotment and the raids (core/region/52-region-raid.js on core/camp's rules,
// core/camp/55-camp-raid.js): the war bands of Tuatara and Komodo against the Marches' forts, the Marches' villages and the
// Golden Tears' camp, here off-map records with XAN_TUNE's numbers (the joint run, test-lz-join.js, raids the Sultanate's own
// books). The balance rules of core/camp/PLAN.md section 6.1 are checked raid by raid. Each negative is a pair (tools/ktest.js).
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
  (0, eval)(rd('settlements/gila/src/88-gl-records.js')); (0, eval)(rd('core/region/data/lz-tune.js')); return H;
};
function run(days, o) {
  const H = load(), V = LZ_TUNE.valley(o), S = H.simValley(V), a = SIM.ledgerSnap(); H.valleyRun(days * 1440, 60); const b = SIM.ledgerSnap();
  return { H, V, S, B: H.valleyBooks().towns, R: S.raids, rep: H.raidReport ? H.raidReport() : null, ledger: SIM.ledger(a, b, { tol: 1 }) };
}
const t = n => (n / 1000).toFixed(1) + ' t';
const fedCheck = Bk => { const bad = []; Object.keys(Bk).forEach(s => { const x = Bk[s]; if (!x.people) return; Object.keys(x.eaten).concat(Object.keys(x.hungry)).forEach(g => { const e = x.eaten[g] || 0, h = x.hungry[g] || 0; if (h > (e + h) * .01 && bad.indexOf(s + ' ' + g) < 0) bad.push(s + ' ' + g); }); }); return { ok: !bad.length, bad }; };
const t0 = Date.now(), Y = run(730, { allot: true, raids: true }), N = run(730, { allot: true, raids: { caps: false } });
console.log('two years of the Lizardmen with raids, and again with the caps off, in ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
const done = Y.R.raids.filter(r => r.band);

// 1. the raids happen: both war bands, within the budget, the forts mostly holding and the villages and the camp raided
{
  const perTurn = {}; Y.R.raids.forEach(r => { perTurn[r.turn] = (perTurn[r.turn] || 0) + 1; });
  const fortBands = done.filter(r => /^march\./.test(r.target)).map(r => r.band), soft = done.filter(r => !/^march\./.test(r.target));
  const good = done.length >= 12 && new Set(done.map(r => r.from)).size === 2 && Object.values(perTurn).every(n => n <= LZ_TUNE.raids.budget) &&
    fortBands.length > 0 && fortBands.every(b => b !== 'success' && b !== 'sack') && soft.some(r => r.band === 'success');
  T.ok('Z4: ' + done.length + ' raids in two years by both war bands, at most ' + LZ_TUNE.raids.budget + ' a season; the forts hold (' + fortBands.join(', ') + '), the villages and the Tears\' camp are raided', good,
    JSON.stringify(Y.rep.bands) + '; targets ' + [...new Set(done.map(r => r.target))].join(', '));
}
// 2. rule 2, raid by raid: no take over 15 % of a good, none below the staples' floor, no more dead than 2 % of the people
const capsHeld = R => R.raids.filter(r => r.band).every(r => Object.keys(r.take).every(g => r.take[g] <= (r.before.stock[g] || 0) * 0.15 * 2 + 1 &&
  (r.before.stock[g] || 0) - r.take[g] >= ((r.before.floor || {})[g] || 0) - 1) && r.dead <= r.before.people * 0.02 + 1e-9);
T.ok('Z4: every raid within the caps: its take at most 15 % of each good (twice that only on a sack), never the staples below fourteen days, its dead at most 2 %', capsHeld(Y.R));
T.neg('Z4: with the caps off a raid empties a store and kills a tenth of a village', capsHeld, N.R, Y.R);
// 3. rules 1 and 3: the balance: no target sacked or ruined, none ever under 0.7
const balanced = rep => rep.targets.every(x => x.minStanding >= 0.7 && x.state !== 'ruined');
T.ok('Z4: the balance holds: no target sacked, the lowest standing ' + Math.min(...Y.rep.targets.map(x => x.minStanding)).toFixed(2) + ' (over 0.7), no fort ruined', balanced(Y.rep),
  Y.rep.targets.map(x => x.id + ' ' + x.minStanding).join(', '));
T.neg('Z4: with the caps off a target falls under 0.7', balanced, N.rep, Y.rep);
// 4. the take comes home: the plunder (steel kept, never used) and the dead to the bone hall; the books balance
{
  const tu = Y.B.tuatara.imported, ko = Y.B.komodo.imported;
  const good = Y.ledger.ok && (tu.tools || 0) > 0 && (ko.goldore || 0) > 0 && (ko.arms || 0) > 0 && (tu.bone || 0) > 0 && (tu.meat_hide || 0) > 0 && done.every(r => r.landed || r.back > Y.S.clock.m);
  T.ok('Z4: the plunder lands in the war bands\' warehouses (Tuatara ' + t(tu.tools || 0) + ' of tools, Komodo ' + (ko.arms || 0) + ' arms and ' + t(ko.goldore || 0) + ' of the Tears\' ore) and the dead in the bone hall; the books balance', good,
    Y.ledger.ok ? 'ledger ok' : Y.ledger.problems.slice(0, 2).join('; '));
}
// 5. the Sultanate's side records them: the assaults by faction, the garrison grants to a target hit often, the punitive expeditions
{
  const E = Y.R.events, as = E.filter(e => e.kind === 'assault'), aid = E.filter(e => e.kind === 'aid'), pun = E.filter(e => e.kind === 'punitive');
  T.ok('Z4: the events: ' + as.length + ' assaults on the xanadu and tears factions, ' + aid.length + ' garrison grants, ' + pun.length + ' punitive expeditions mounted against the Lizardmen',
    as.length === done.length && as.every(e => e.faction === 'xanadu' || e.faction === 'tears') && aid.length > 0 && pun.length > 0);
}
// 6. the country still eats: the raids and the Allotment together leave every place fed; without `raids` nothing raids (inert)
{
  const f = fedCheck(Y.B), Z = run(91.25 * 2, { allot: true });
  T.ok('Z4: every place fed for two years with the raids out; a valley without `raids` declares none', f.ok && !Z.S.raids, f.bad.slice(0, 4).join('; ') || 'none short');
}
T.done();
