// node settlements/xanadu-lake/tests/test-xl-life.js — the lake towns' week and people (PLAN.md L5: targets/town/89zn-xl-days.js,
// 89zu-xl-people.js) on built towns, without the page; core/simulation run on them in node. Each check with its negative
// (tools/ktest.js):
//   - the week: every town of a round has its market day, one a week; a round's towns on different days; Phēr's rounds never
//     on a fair day; a fair day takes a loop town's launch away and no other's;
//   - the people: a town's residents are its houses x XL.HH (and the governor's eight); the crews the tune's (fishers half
//     the crew where the town fishes, the terraces two fifths, a keeper a stall); every person's role declared;
//   - the places: every home a place, every door on the walk graph and the graph one piece;
//   - the sim: declared with no problem, a day stepped (every actor with a task at noon, the dugouts' crews out on the lake
//     at dawn, the households in the square on the market day more than on another).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
global.XAN_TUNE = require(path.join(ROOT, 'core', 'region', 'data', 'xan-tune.js'));
['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js'].forEach(load);
fs.readdirSync(path.join(ROOT, 'core', 'city')).filter(f => /^\d\d-city-.*\.js$/.test(f) && !/host/.test(f)).sort().forEach(f => load('core/city/' + f));
KCITY.lib = { SL, plan: () => PLAN, KSPACE, Raster, OCC, obb, obbCorners };
vm.runInThisContext('(function(){' + ['10-crop-core.js', '20-crop-records.js', '22-crop-material.js', '40-crop-query.js']
  .map(f => fs.readFileSync(path.join(ROOT, 'kits', 'crops', 'src', f), 'utf8')).join('\n') + '\n})();', { filename: 'kits/crops (bundled)' });
global.XL_KIT_DIMS = {};
for (const d of ['src', 'extra']) for (const f of fs.readdirSync(path.join(ROOT, 'kits', 'xanadu', d)).filter(f => f.endsWith('.js'))) {
  const s = fs.readFileSync(path.join(ROOT, 'kits', 'xanadu', d, f), 'utf8'), re = /XA\.def\(\{/g; let m;
  while ((m = re.exec(s))) { const head = s.slice(m.index, m.index + 1500), k = /key:\s*'([^']+)'/.exec(head), b = /\bw:\s*([\d.]+),\s*d:\s*([\d.]+)(?:,\s*h:\s*([\d.]+))?/.exec(head);
    if (k && b) XL_KIT_DIMS[k[1]] = { w: +b[1], d: +b[2], h: b[3] == null ? 8 : +b[3] }; }
}
const TOWN = 'settlements/xanadu-lake/targets/town/';
['89zl-xl-specs.js', '89zm-xl-fit.js', '89zn-xl-days.js', '89zp-xl-site.js', '89zq-xl-plan.js', '89zu-xl-people.js'].forEach(f => load(TOWN + f));
const SIMF = ['77-sim-0-core.js', '77-sim-1-world.js', '77-sim-2-places.js', '77-sim-3-actors.js', '77-sim-4-nav.js', '77-sim-5-motion.js', '77-sim-5r-routes.js', '77-sim-6-season.js'];
const freshSim = () => SIMF.forEach(f => load('core/simulation/' + f));

// ---------------------------------------------------------------- 1. the week
const W = XL_DAYS, keys = Object.keys(XL.SPECS);
const days = k => { const s = []; for (let d = 0; d < 7; d++) if (W.at(k, d).market) s.push(d); return s; };
const inRound = keys.filter(k => W.ROUND[k]);
T.ok('every lake town on a round has one market day a week (' + inRound.length + ' of ' + keys.length + ' towns)', inRound.length === keys.length && inRound.every(k => days(k).length === 1),
  keys.filter(k => !W.ROUND[k] || days(k).length !== 1).join(', '));
const clash = R => { const seen = {}; let c = null; for (const k of Object.keys(W.ROUND)) { if (W.ROUND[k].id !== R) continue; const d = W.marketDay(k); if (seen[d]) c = seen[d] + ' and ' + k; seen[d] = k; } return c; };
const rounds = [...new Set(Object.values(W.ROUND).map(r => r.id))];
T.ok('a round\'s towns keep different market days (' + rounds.join(', ') + ')', rounds.every(r => !clash(r)), rounds.map(clash).filter(Boolean).join('; '));
const onFair = Object.keys(W.ROUND).filter(k => W.ROUND[k].hub === 'xan.pher' && W.FAIR.indexOf(W.marketDay(k)) >= 0);
T.ok('Phēr\'s rounds never call on a fair day (their boats are on the loops)', onFair.length === 0, onFair.join(', '));
T.neg('...its negative: a market day moved onto a fair day is caught', md => W.FAIR.indexOf(md) < 0, W.FAIR[0], W.marketDay('mouth'));
const loopAway = d => keys.filter(k => W.at(k, d).fairAway);
T.ok('on a fair day the loop towns\' launches are away, and no other town\'s', loopAway(W.FAIR[0]).length > 0 && loopAway(W.FAIR[0]).every(k => W.LOOP[k]) && loopAway(W.FREE[0]).length === 0,
  loopAway(W.FAIR[0]).join(', '));
T.ok('the page\'s default day is Phēr\'s (122, a fair day)', W.DAY === 122 && W.at('mouth', 122).fair);

// ---------------------------------------------------------------- 2-4. the people, the places, the sim, on three towns
const TOWNS = ['mouth', 'weaver', 'net'].filter(k => XL.SPECS[k]);
for (const key of TOWNS) {
  const Tn = xlRun(key), O = xlPeople(Tn), TU = XL.tune(key), houses = Tn.census.houses, gov = Tn.place.some(p => p.key === 'xa_governor') ? 8 : 0;
  const n = O.PEOPLE.length, want = Math.round(houses * XL.HH) + gov;
  T.ok(key + ': the residents are its houses x ' + XL.HH + (gov ? ' and the governor\'s eight' : ''), n === want, n + ' / ' + want + ' (' + houses + ' houses)');
  const crew = Math.min(400, Math.round((n - gov) * .45)), by = O.byRole, f = by.fisher || 0, fm = by.farmer || 0;
  T.ok(key + ': the crews are the tune\'s (fishers ' + (O.fishing ? 'half the crew' : 'none: it lives by its landing') + ', the terraces two fifths, a keeper a stall)',
    f === (O.fishing ? Math.round(crew * .5) : 0) && fm === Math.round(crew * .4) && (by['seller.0'] || 0) + (by['seller.1'] || 0) === Tn.place.filter(p => p.kind === 'stall').length,
    JSON.stringify(by));
  const roleIds = new Set(O.ROLES.map(r => r.id)), undeclared = O.PEOPLE.filter(p => !roleIds.has(p.role));
  T.ok(key + ': every person\'s role is declared', undeclared.length === 0, undeclared.slice(0, 3).map(p => p.id + ' ' + p.role).join(', '));
  // the places and the graph
  const places = O.places(), G = O.graph(), ids = new Set(places.map(p => p.id)), homeless = O.PEOPLE.filter(p => !ids.has(p.home));
  T.ok(key + ': every home is a place (' + places.length + ' places)', homeless.length === 0 && O.problems.length === 0, homeless.slice(0, 3).map(p => p.home).join(', ') + ' ' + O.problems.slice(0, 3).join('; '));
  const adj = new Map(); for (const e of G.edges) { (adj.get(e.a) || adj.set(e.a, []).get(e.a)).push(e.b); (adj.get(e.b) || adj.set(e.b, []).get(e.b)).push(e.a); }
  const reach = start => { const s = new Set([start]), q = [start]; while (q.length) for (const b of adj.get(q.pop()) || []) if (!s.has(b)) { s.add(b); q.push(b); } return s; };
  const sq = places.find(p => p.id === 'C:square'), R0 = reach(sq ? sq.door.node : G.nodes[0].id), lost = places.filter(p => !R0.has(p.door.node));
  T.ok(key + ': every door reaches the market square on the walk graph (' + G.nodes.length + ' nodes)', !!sq && lost.length <= places.length * .01, lost.length + ' cut off: ' + lost.slice(0, 3).map(p => p.id).join(', '));
  if (key === 'mouth') T.neg('...its negative: a door joined to nothing is caught', L => L.length <= places.length * .01, places.map(p => p.id), lost.map(p => p.id));
  // the sim, a day of it
  freshSim(); const clock = { hour: 3, day: 0, t: 0 };
  O.init(clock);
  T.ok(key + ': core/simulation takes the town with no problem', O.problems.length === 0, O.problems.slice(0, 4).join('; '));
  const at = (h, d) => { clock.day = d; clock.hour = h; clock.t = (d * 24 + h) * 3600; SIM.jump(); const A = O.PEOPLE.map(p => SIM.get('actor', p.id)), act = {}; let none = 0;
    for (const a of A) { if (!a.task) none++; act[a.activity || 'none'] = (act[a.activity || 'none'] || 0) + 1; } return { none, act }; };
  const md = W.marketDay(key), dMk = ((md - W.DAY % 7) + 7) % 7, dOff = (dMk + 1) % 7 === ((W.FAIR[0] - W.DAY % 7) + 7) % 7 ? (dMk + 2) % 7 : (dMk + 1) % 7;
  const noon = at(10, dMk), dawn = at(6, dMk), other = at(10, dOff);
  if (process.env.XL_DEBUG) console.log(key, md, dMk, dOff, SIM.minute(), SIM.weekday(), JSON.stringify(noon.act), JSON.stringify(dawn.act), JSON.stringify(other.act), JSON.stringify(O.byRole), JSON.stringify(O.goods));
  T.ok(key + ': at the market day\'s mid-morning every actor has a task', noon.none <= n * .01, noon.none + ' without; ' + JSON.stringify(noon.act));
  if (O.fishing) T.ok(key + ': at dawn the dugouts\' crews are out on the lake', (dawn.act.FISH || 0) >= f * .9, (dawn.act.FISH || 0) + ' of ' + f + ' fishers');
  T.ok(key + ': the terraces\' crew on its fields at mid-morning', (noon.act.FARM || 0) >= fm * .9, (noon.act.FARM || 0) + ' of ' + fm + ' farmers');
  const wk = by.worker || 0;
  T.ok(key + ': the works are manned (' + wk + ' hands at their works at mid-morning)', wk > 0 && (noon.act.WORK || 0) >= wk * .9, (noon.act.WORK || 0) + ' of ' + wk);
  T.ok(key + ': more in the square on its market day than on another (' + (noon.act.MARKET || 0) + ' against ' + (other.act.MARKET || 0) + ')', (noon.act.MARKET || 0) > (other.act.MARKET || 0) * 1.3);
}
T.done();
