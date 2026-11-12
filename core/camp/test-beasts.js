// node core/camp/test-beasts.js: core/camp's beasts (50-camp-beasts.js, phase S4 of
// core/simulation/PROPOSAL-LONGSONG-PINNACLE.md): what a band's beasts eat and carry, on the Beast Riders' own table
// (settlements/pinnacle-rock/src/15-pr-tune.js PR_TUNE.beasts) and every ground of kits/beast-riders BR_CAMP, read in
// place. Each check has a negative that must fail.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
fs.readdirSync(__dirname).filter(f => /^\d\d-camp-.*\.js$/.test(f)).sort().forEach(f => load('core/camp/' + f));
load('kits/beast-riders/src/79-br-camp.js');
load('settlements/pinnacle-rock/src/15-pr-tune.js');
const BR_CAMP = vm.runInThisContext('BR_CAMP'), TRIBES = vm.runInThisContext('BR_CAMP_TRIBES'), T = vm.runInThisContext('PR_TUNE').beasts;
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };
const r1 = n => Math.round(n * 10) / 10;

// 1. a row for every tribe's mount, with its fauna key where the kit has one
{ const miss = TRIBES.filter(t => !T.rows[t]), wrong = TRIBES.filter(t => T.rows[t] && T.rows[t].beast !== BR_CAMP[t].beast);
  const T2 = Object.assign({}, T, { rows: Object.assign({}, T.rows) }); delete T2.rows.mammoth;
  ok('a row for every one of BR_CAMP\'s twelve mounts, the same fauna key', !miss.length && !wrong.length, TRIBES.some(t => !T2.rows[t]),
    'missing ' + (miss.join(', ') || 'none') + '; key differs ' + (wrong.join(', ') || 'none')); }
// 2. the low-gravity payoff: a raptor eats ~2.7 kg of meat a day, a third under the ~4 kg a predator its size would
{ const a = KCAMP.appetite(T, 'raptor').meat, full = KCAMP.appetite(Object.assign({}, T, { lowG: 1 }), 'raptor').meat;
  ok('the low-gravity payoff: a raptor eats ~2.7 kg of meat a day, two thirds of a full ~4 kg', Math.abs(a - 2.7) < 0.15 && Math.abs(a / full - 2 / 3) < 1e-9,
    Math.abs(full - 2.7) > 0.5, r1(a) + ' kg a day; ' + r1(full) + ' without the cut'); }
// 3. every kind's appetite is cut by the same third (one constant, not per row)
{ const kinds = Object.keys(T.rows), ratio = k => { const a = KCAMP.appetite(T, k), b = KCAMP.appetite(Object.assign({}, T, { lowG: 1 }), k), g = Object.keys(a)[0]; return a[g] / b[g]; };
  const all = kinds.every(k => Math.abs(ratio(k) - 2 / 3) < 1e-9);
  ok('every mount\'s and the herd\'s appetite is cut by the same third', all, !kinds.every(k => Math.abs(ratio(k) - 1) < 1e-9), kinds.length + ' kinds'); }
// 4. what a diet takes: the meat-eaters meat, the grazers and the crawlers fodder (fed off the ground)
{ const meat = ['raptor', 'tiger', 'spider', 'dragonfly'].every(k => KCAMP.appetite(T, k).meat > 0), fodder = ['threehorn', 'hardshell', 'mammoth', 'staghorn', 'longcrawler'].every(k => KCAMP.appetite(T, k).fodder > 0 && !KCAMP.appetite(T, k).meat);
  ok('the raptors, tigers, spiders and dragonflies eat meat; the grazers and crawlers fodder', meat && fodder, !(KCAMP.appetite(T, 'mammoth').meat > 0), ''); }
// 5. the floor's mounts: ~110 meat-eaters of ~258 eat ~107 t of meat a year (the proposal's arithmetic), and the grazers far
//    more fodder than a band's pens give
{ let m = 0, meatT = 0, fod = 0, pen = 0;
  TRIBES.forEach(t => { const G = brcGround(t, 'lower'); if (!G) return; const c = KCAMP.census({ id: 'staiytii0y:' + t + ':lower', world: 1027681, culture: 'beast-rider', program: G });
    const N = KCAMP.beastNeeds(T, { [t]: c.mounts }); if (N.meat) { m += c.mounts; meatT += N.meat * 365 / 1000; } if (N.fodder) fod += N.fodder; pen += (G.pasture ? G.pasture.ha : 0); });
  const penKgDay = pen * 10000 / 365;   /* 10 t of dry matter a hectare a year: a wet jungle pasture's best */
  ok('the floor bands\' meat-eaters eat ~100 t of meat a year after the payoff, and the grazers outeat their pens', meatT > 75 && meatT < 125 && fod > 2 * penKgDay,
    (() => { let n = 0; TRIBES.forEach(t => { const G = brcGround(t, 'lower'); if (!G) return; const c = KCAMP.census({ id: 'staiytii0y:' + t + ':lower', world: 1027681, culture: 'beast-rider', program: G }); n += (KCAMP.beastNeeds(Object.assign({}, T, { lowG: 1 }), { [t]: c.mounts }).meat || 0) * 365 / 1000; }); return n > 125; })(),
    m + ' meat-eaters, ' + Math.round(meatT) + ' t of meat a year; fodder ' + Math.round(fod) + ' kg a day against the pens\' ' + Math.round(penKgDay)); }
function brcGround(t, g) { return vm.runInThisContext('brcGround')(t, g); }
// 6. both the hunt and the kept herd: a meat-eaters' band keeps a herd sized for its share; a grazers' band keeps none
{ const c = KCAMP.census({ id: 'b', world: 1, culture: 'beast-rider', program: BR_CAMP.raptor.grounds.lower }), B = KCAMP.bandBeasts(T, 'raptor', c), P = KCAMP.meatPlan(T, { raptor: B.raptor });
  const herdMeat = B.herd * T.rows.herd.offtake, G = KCAMP.bandBeasts(T, 'threehorn', c);
  const N = KCAMP.bandBeasts(Object.assign({}, T, { meatFrom: { hunt: 1, herd: 0 } }), 'raptor', c);
  ok('a raptor band keeps a herd that gives its share of the mounts\' meat; a threehorn band none', B.herd > 0 && herdMeat >= P.herd && herdMeat < P.herd + T.rows.herd.offtake && !G.herd,
    !(N.herd > 0), B.raptor + ' raptors, ' + B.herd + ' head of herd giving ' + r1(herdMeat) + ' of ' + r1(P.need) + ' kg a day (' + r1(P.hunt) + ' from the hunt)'); }
// 7. pack: a caravan's capacity is the sum of its beasts', its pace its slowest beast's
{ const cap = KCAMP.packCap(T, { mammoth: 2, raptor: 10 }), pace = KCAMP.pace(T, { mammoth: 2, raptor: 10 });
  ok('a train carries what its beasts carry, at its slowest beast\'s pace', cap === 2 * 900 + 10 * 40 && pace === 25, KCAMP.pace(T, { raptor: 10 }) !== 25, cap + ' kg at ' + pace + ' km a day'); }
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK'); process.exit(bad ? 1 : 0);
