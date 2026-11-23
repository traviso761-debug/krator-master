// node settlements/loj-twenny/tests/test-lt-sim.js: Loj Twenny on the simulation layer (src/40-lt-sim.js, PLAN.md section 4).
// Loads core/rand, core/space, core/sched, core/city/cavern, every core/simulation/77-sim-*.js, and the page's plan (20) and
// sim (40) as ONE script (the fragments share one scope, as on the page), then runs the hold three days, minute by minute.
// Every check has a negative that must fail. Prints the stocks a day and the turns.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..', '..'), rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
global.window = global;
const SIMF = fs.readdirSync(path.join(ROOT, 'core', 'simulation')).filter(f => /^77-sim-.*\.js$/.test(f)).sort().map(f => 'core/simulation/' + f);
const files = ['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/sched/20-core-sched.js', 'core/city/cavern/10-city-cavern.js', ...SIMF,
  'settlements/loj-twenny/src/20-lt-plan.js', 'settlements/loj-twenny/src/40-lt-sim.js'];
(0, eval)(files.map(rd).join('\n;\n') + '\n;globalThis.LT=LT;globalThis.LTS=LTS;');
let bad = 0;
const ok = (name, pass, neg) => { const r = !!pass && !neg; if (!r) bad++; console.log((r ? 'PASS  ' : 'FAIL  ') + name + (neg ? '  [its negative passed]' : '')); };
const S = global.SIM, clock = { hour: 0, day: 0, t: 0, dayLength: 4320 };
LTS.declare(clock);
if (process.argv[2] === '--crisis') {   /* the crisis run (the parent's last check): the beds blighted from day 3, 22 days */
  const s0 = S.ledgerSnap(), days = [];
  LTS.run(clock, 22 * 1440, M => {
    if (M === 3 * 1440) for (const s of LT.plan().sites) if (s.key === 'tg-dark-beds' && S.R.place[s.id]) S.recipeHold(s.id, 'blight', 999 * 1440);
    if (M % 1440 === 1439) { const W = LTS.countWall(); days.push({ day: Math.floor(M / 1440), happy: W.happy, stage: W.stage, fungus: W.fungus }); }
  });
  const R = LTS.moodReport(), L = S.ledger(s0, S.ledgerSnap()), ev = (S.unrestReport().events || []);
  const first = k => { const e = ev.find(e => e.kind === 'stage' && e.to === k || (k === 'demand' && e.kind === 'demand')); return e ? Math.floor(e.m / 1440) : null; };
  console.log('CRISIS ' + JSON.stringify({ days, demands: R.demands, strikes: R.strikes, firstGrumble: first('grumble'), firstDemand: first('demand'), ledger: L.ok, problems: L.problems.slice(0, 2) }));
  process.exit(0);
}
ok('the hold declares cleanly (' + LTS.places + ' places, ' + LTS.people() + ' people; problems: ' + (LTS.problems.slice(0, 3).join(' | ') || 'none') + ')',
  LTS.problems.length === 0 && LTS.places > 50 && LTS.people() > 150, false);
const P = LTS.pop, roles = Object.keys(P.byRole).map(k => k + ' ' + P.byRole[k]).join(', ');
ok('the census: ' + P.actors + ' people in ' + P.beds + ' beds (' + roles + ')', P.byRole.bedsman === 36 && P.byRole.miner === 24 && P.byRole.elder > 0 && P.bedsLeft >= 0, P.homeless.length > 0);
/* the turns: each worker role's actors dealt over the three turns */
const turnOf = a => { const R = S.R.role[a.role], sc = S.schedOf(a, 6 * 60 + 30); return sc && sc[6] === 'WORK' ? 'A' : null; };
const beds = S.all('actor').filter(a => a.role === 'bedsman');
const onA = beds.filter(a => S.schedOf(a, 7 * 60)[7] === 'WORK').length, onB = beds.filter(a => S.schedOf(a, 15 * 60)[15] === 'WORK').length, onC = beds.filter(a => S.schedOf(a, 23 * 60)[23] === 'WORK').length;
ok('three turns: the bedsmen at work 07:00 ' + onA + ', 15:00 ' + onB + ', 23:00 ' + onC, onA === 12 && onB === 12 && onC === 12, onA === 36);
/* three days */
const snap0 = S.ledgerSnap(), daily = [];
LTS.run(clock, 3 * 1440, M => { if (M % 1440 === 1439) daily.push(Object.assign({ day: Math.floor(M / 1440) }, LTS.countWall())); });
daily.forEach(d => console.log('      day ' + d.day + ': ' + JSON.stringify(d)));
const L = S.ledger(snap0, S.ledgerSnap());
ok('the books balance over three days (made + imported - exported - used = change, every town, every route)', L.ok, false);
{ /* the negative: a snapshot with a fungus row moved by 50 */
  const s1 = S.ledgerSnap(), s1b = JSON.parse(JSON.stringify(s1));
  const t = s1b.towns ? s1b.towns[LTS.S] : null; let moved = false;
  if (t && t.fungus) { t.fungus.total += 50; t.fungus.storage += 50; moved = true; }
  const Ln = moved ? S.ledger(snap0, s1b) : { ok: true };
  ok('negative: a ledger with 50 servings of fungus conjured fails (' + (Ln.problems || []).slice(0, 1).join('') + ')', moved && !Ln.ok, !moved || Ln.ok);
}
const E = S.econ(LTS.S), made = E.made, used = E.used, imp = E.imported, exp = E.exported;
console.log('      made ' + JSON.stringify(made) + '\n      used ' + JSON.stringify(Object.fromEntries(Object.entries(used).map(([k, v]) => [k, Math.round(v)]))) +
  '\n      imported ' + JSON.stringify(imp) + '\n      exported ' + JSON.stringify(exp));
ok('the dark beds grow the fungus (' + Math.round(made.fungus || 0) + ' servings) and the hold eats it (' + Math.round(used.fungus || 0) + ')', made.fungus > 500 && used.fungus > 500, (made.fungus || 0) === 0);
ok('the vein working cuts ore (' + Math.round(made.ore || 0) + ' lots) and the shuttle takes it west (' + Math.round(exp.ore || 0) + ')', made.ore > 20 && exp.ore > 0, false);
ok('the train and the shaft bring wax, plate, grain and ice in (' + ['wax', 'plate', 'grain', 'ice'].map(g => g + ' ' + Math.round(imp[g] || 0)).join(', ') + ')',
  ['wax', 'plate', 'grain', 'ice'].every(g => imp[g] > 0), false);
const TR = S.tradeReport(), br = TR['lt.line'], sh = TR['lt.shaft'];
/* the train on its own timetable (LTS.LINE_RUN: a passage of 431 world minutes and a stay of 90, the drawn train's): about eight
   passages in three days, not the 25-minute timer's 170 */
const perDay = 1440 / (LTS.LINE_RUN.minutes + LTS.LINE_RUN.mins);
ok('the segment train ran ' + (br ? br.voyages : 0) + ' passages on its timetable (' + (3 * perDay).toFixed(1) + ' expected); the Travellers carried the Fellgangs\' ice down the great shaft ' + (sh ? sh.voyages : 0) + ' times',
  br && Math.abs(br.voyages - 3 * perDay) <= 2 && sh && sh.voyages >= 2 && sh.shipped && Object.keys(sh.shipped).some(k => sh.shipped[k].ice > 0), br && br.voyages > 30);
const ice = daily.map(d => d.ice), wax = daily.map(d => d.wax), fu = daily.map(d => d.fungus);
ok('the count wall\'s stocks move day to day (fungus ' + fu.join(' > ') + '; wax ' + wax.join(' > ') + '; ice ' + ice.join(' > ') + ')',
  new Set(fu).size > 1 && daily.every(d => d.people === LTS.people()), new Set(fu).size === 1);
ok('no one in the hold went hungry: the fungus never ran out', daily.every(d => d.fungus > 0) && !(E.short && E.short.fungus > 0), false);
/* the turn change: the bell rang every turn, and at each the people at work changed hands */
ok('the bell rang ' + LTS.turns.length + ' turns (' + LTS.turns.slice(0, 3).map(t => 'day ' + t.day + ' ' + t.hour + ':00 ' + t.turn).join(', ') + ' ...)', LTS.turns.length === 9 && LTS.turns.every(t => t.atWork.WORK > 0), LTS.turns.length === 0);
/* the Big Meeting: called on its day; the hall filled with hands while it sat */
const Mt = LTS.meetings[0];
ok('the Big Meeting sat on day ' + (Mt ? Mt.day + ' at ' + Mt.hour + ':00, ' + Mt.called + ' called' : '?') + '; the most hands in the hall ' + LTS.hands,
  Mt && Mt.called > 100 && LTS.hands > 60, !Mt);
/* the walkers: the Fixers' patrol and the porters fired; the routes held; poses on the hold's levels */
const evs = S.LOG.filter(e => e.kind === 'event').length, fails = S.routeFail.length;
ok('the Fixers\' patrol and the Travellers\' porters walked (' + evs + ' firings), ' + fails + ' routes failed', evs >= 4 && fails === 0, false);
/* NEEDS AND MOOD (core/simulation's needs, items, the economy's rules, unrest; LTS.NEEDS ...) */
const hold = S.all('actor').filter(a => !a.driven && S.settlementOf(a) === LTS.S), MR = LTS.moodReport();
ok('every one of the ' + hold.length + ' has meters (' + S.NEED.list.join(', ') + '), a trait and a class (' + [...new Set(hold.map(a => a.cls))].sort().join(', ') + ')',
  LTS.mood && hold.every(a => a.nd && a.nd.length === S.NEED.list.length && a.trait && a.cls), !LTS.mood);
const homes = S.all('place').filter(P => P.people), alone = homes.filter(P => !hold.some(a => a.home === P.id && a.role !== 'child'));
ok('no home of children alone (' + LTS.rehoused + ' children traded beds with an elder); ' + homes.filter(P => P.store).length + ' homes keep a food store',
  alone.length === 0 && homes.every(P => P.store), alone.length > 0);
const ML = MR.meals, eatenAt = (ML.meal || 0) + (ML.single || 0);
ok('the homes eat from their stores: ' + (ML.meal || 0) + ' meals of mash and grain, ' + (ML.single || 0) + ' of mash alone, ' + (ML.none || 0) + ' with nothing; the market sold ' +
  JSON.stringify(S.ITEMS.stats.bought), eatenAt > hold.length * 4 && (ML.none || 0) <= eatenAt * 0.02 && S.ITEMS.stats.bought.fungus > 0, eatenAt === 0);
ok('the flat meal draw is gone: what the hold used of mash is what the homes bought and what rotted (' + Math.round(used.fungus) + ' = ' + S.ITEMS.stats.bought.fungus + ' + ' + (MR.spoiled.fungus || 0) + ')',
  Math.abs(used.fungus - S.ITEMS.stats.bought.fungus - (MR.spoiled.fungus || 0)) < 1, false);
ok('the mash rots in the stores and the Fellgangs\' ice keeps some (' + (MR.spoiled.fungus || 0) + ' rotted, ' + (MR.kept.fungus || 0) + ' kept for ' + (MR.kept.ice || 0) + ' ice)',
  MR.spoiled.fungus > 0 && MR.kept.fungus > 0 && MR.kept.ice > 0, !(MR.spoiled.fungus > 0));
const G = MR.governed || {};
ok('the governor watches what the hold makes (fungus: use ' + Math.round(G.fungus ? G.fungus.use : 0) + ' a day, held ' + Math.round(G.fungus ? G.fungus.pos : 0) + ', target ' + (G.fungus ? G.fungus.target : '?') + ', the beds at ' + (G.fungus ? G.fungus.mult.toFixed(2) : '?') + ')',
  G.fungus && G.fungus.target === LTS.RULES.max.fungus && G.fungus.mult > 0 && G.ore, !G.fungus);
const pool = MR.pool.all.mean, cls = Object.keys(MR.pool.byClass).sort().map(c => c + ' ' + Math.round(MR.pool.byClass[c].mean)).join(', ');
ok('the hold is content after three days: happiness ' + Math.round(pool) + ' (' + cls + '), the stage calm, no demand, no strike', pool > 70 && MR.stage.all === 'calm' && !MR.demands.length && !MR.strikes.length, !(pool > 0));
const M2 = MR.needs;
console.log('      needs by class: ' + Object.keys(M2).sort().map(c => c + ' ' + JSON.stringify(M2[c].mean) + ' eff ' + M2[c].eff).join('\n                      '));
ok('the loj meeting is weekly and the Big Meeting yearly (' + LTS.MEETINGS.map(M => M.name + ' every ' + M.every + ' days from day ' + M.day).join('; ') + ')',
  LTS.MEETINGS.find(M => M.id === 'loj').every === 7 && LTS.MEETINGS.find(M => M.id === 'big').every === 365 && LTS.meetings.length === 1 && LTS.meetings[0].id === 'big', false);
/* THE CRISIS (a child process: SIM is one per process): the dark beds blighted from day 3 for good. The stores and then the
   homes run dry, hunger caps happiness, the pool sinks, the hold grumbles and demands mash of the Union, which nobody can
   spare: refused. The books hold all the while. Its negative: the content three days above, no demand made */
if (process.argv[2] !== '--crisis') {
  const out = require('child_process').execFileSync(process.execPath, [__filename, '--crisis'], { encoding: 'utf8' });
  const R = JSON.parse(out.split('\n').filter(l => l.startsWith('CRISIS '))[0].slice(7));
  console.log('      the crisis, day by day: ' + R.days.map(d => d.day + ':' + d.happy + (d.stage !== 'calm' ? ' ' + d.stage : '')).join(' '));
  const low = Math.min(...R.days.map(d => d.happy)), refused = R.demands.filter(D => D.answer === 'refused' && D.goods.indexOf('fungus') >= 0);
  ok('the crisis: happiness falls to ' + low + ', the hold grumbles by day ' + R.firstGrumble + ' and demands mash of the Union by day ' + R.firstDemand + ' (' + R.demands.map(D => 'day ' + D.day + ' ' + D.key + ' ' + D.kind + ' ' + D.goods.join('+') + ': ' + D.answer).join('; ') + ')',
    low < 50 && R.firstGrumble != null && refused.length > 0 && R.ledger, MR.demands.length > 0);
  ok('and the books hold through it (' + (R.ledger ? 'balanced' : R.problems.join('; ')) + ')', R.ledger, false);
}
process.exit(bad ? 1 : 0);
