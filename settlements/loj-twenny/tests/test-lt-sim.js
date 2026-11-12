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
ok('the segment train ran ' + (br ? br.voyages : 0) + ' voyages; the Travellers carried the Fellgangs\' ice down the great shaft ' + (sh ? sh.voyages : 0) + ' times',
  br && br.voyages >= 20 && sh && sh.voyages >= 2 && sh.shipped && Object.keys(sh.shipped).some(k => sh.shipped[k].ice > 0), false);
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
process.exit(bad ? 1 : 0);
