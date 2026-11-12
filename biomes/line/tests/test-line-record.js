// node biomes/line/tests/test-line-record.js: the one Rift record (stations/common/47c-line-record.js) on the transit kit's line kind, and each
// station's window of it: the tracks' states, the splays and the crossovers the seven pages read. Each check has a negative. Prints 'all passed'.
const fs = require('fs'), path = require('path'), vm = require('vm'), ROOT = path.join(__dirname, '..', '..', '..');
const ctx = { console, Math }; ctx.window = ctx; vm.createContext(ctx);
const load = p => vm.runInContext(fs.readFileSync(path.join(ROOT, p), 'utf8'), ctx, { filename: p });
load('core/rand/08-core-rand.js');
for (const f of ['40-tr-records.js', '41-tr-path.js', '43b-tr-subway.js', '43c-tr-line.js']) load('kits/ancient-transit/src/' + f);
for (const f of ['47-line-core.js', '47b-line-help.js', '47c-line-record.js']) load('biomes/line/stations/common/' + f);
const R = vm.runInContext('RIFT', ctx), LK = vm.runInContext('LK', ctx), T = vm.runInContext('KTRANSIT', ctx);
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL ' + m); } };
const WIN = { z0: -150, z1: 1050 }, st = (W, id, s) => W.cond[id].find(r => s >= r.s0 && s < r.s1).state;
ok(R.line.kind === 'line' && R.line.L === 346000 && R.line.gaps.length === 1 && R.line.gaps[0].s0 === 236170, 'one line, 346 km, one gap (G2)');
/* the bore: t1 blocked at the vein, the crossover */
{ const W = R.window(208000, Object.assign({}, WIN, { z1: 1350 })); ok(st(W, 't1', 208700) === 'blocked' && st(W, 't2', 208700) === 'kept', 'the bore: t1 blocked at the vein, t2 kept');
  ok(W.crossovers.length === 1 && W.crossovers[0].z0 === 300 && W.crossovers[0].z1 === 420 && W.crossovers[0].id === 'line.xo.208300', 'the bore\'s crossover where the page had it'); }
/* the gap: every track cut over the fall, the record's gap */
{ const W = R.window(235700, Object.assign({}, WIN, { z1: 1250 })); ok(W.gaps.length === 1 && W.gaps[0].s0 === 236170 && W.gaps[0].s1 === 236712, 'the gap: G2 from 236170 to 236712');
  ok(['t1', 't2', 't3', 't4'].every(id => st(W, id, 236400) === 'cut'), 'every track cut across the fall'); }
/* the station: the splay round the island */
{ const W = R.window(217700, WIN); ok(Math.abs(W.trackX('t2', 450) - 7.4) < 1e-9 && Math.abs(W.trackX('t3', 450) + 7.4) < 1e-9 && W.trackX('t2', 100) === 4.5, 'the station: t2 and t3 splayed to 7.4 at the island, nominal outside');
  ok(Math.abs(W.trackX('t1', 260) - (10.5 + 2.9 * LK.sm(40 / 80))) < 1e-9, 'the splay ramps as the page\'s did'); }
/* the hot door: built past the inner door */
{ const W = R.window(54500, Object.assign({}, WIN, { z1: 1050 })); ok(st(W, 't1', 55000) === 'kept' && st(W, 't1', 55100) === 'built', 'the hot door: kept to the inner door, built behind it'); }
/* the fault: the twin bores' splay, the shear's offset, the cut and the flood */
{ const W = R.window(44000, WIN); ok(Math.abs(W.trackX('t1', 300) - 15.5) < 1e-9 && Math.abs(W.trackX('t1', 700) - 18.5) < 1e-9 && Math.abs(W.trackX('t4', 700) + 15.5) < 1e-9, 'the fault: the east pair 5 m out, 3 m more past the shear');
  ok(st(W, 't2', 44620) === 'cut' && st(W, 't1', 44750) === 'flooded' && st(W, 't3', 44620) === 'kept' && W.cond.t1.find(r => r.state === 'flooded').depth === .9, 'cut at the shear, flooded 0.9 at the low point, the west kept');
  ok(W.crossovers.map(x => x.a + x.b + x.z0).join() === 't1t260,t2t3160', 'the junction\'s two crossovers'); }
/* the portal: worn through the fallen stretch */
{ const W = R.window(303500, WIN); ok(st(W, 't2', 303800) === 'worn' && st(W, 't2', 303900) === 'kept', 'the portal: worn under the sky, kept beyond'); }
/* negatives: a window off the line throws; the line with the fall's cut removed has no gap */
{ let t = false; try { R.window(345500, WIN); } catch (e) { t = true; } ok(t, 'negative: a window past the line\'s end throws');
  const L2 = T.line(Object.assign({}, R.line.opts, { cond: R.line.opts.cond.filter(c => c.state !== 'cut') })); ok(L2.gaps.length === 0, 'negative: without the fall\'s cut there is no gap'); }
console.log(bad ? bad + ' FAILED' : 'all passed'); process.exit(bad ? 1 : 0);
