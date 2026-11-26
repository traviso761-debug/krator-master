// node core/water/tide/test-tide.js: KTIDE's contract on the baked record (tools/scale-model/model/data/tides.json).
// The record decodes; the tide repeats each Day; a site's range is the spread of its own levels; a site scaled to a
// range has that range; the phasor interpolation stays inside its corners; a coast point reaches the nearest wet cell
// and an inland one gets nothing; waterTide() is the dominant constituent in WATER.tide's shape; bindWater drives
// WATER.seaLevel and gives it back. Each guard has its negative.
'use strict';
const fs = require('fs'), path = require('path');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
const K = require('./23-core-water-tide.js');
const FILE = process.argv[2] || path.join(ROOT, 'tools/scale-model/model/data/tides.json');
const DATA = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const near = (a, b, e) => Math.abs(a - b) < (e == null ? 1e-9 : e);

global.window = global;
eval(fs.readFileSync(path.join(ROOT, 'core/water/20-core-water.js'), 'utf8') + ';global.WATER=WATER;');
const W = global.WATER;

const TD = K.load(DATA);
T.ok('both basins decode', TD.basins.length === 2 && TD.basins.some(b => b.id === 'nwocean') && TD.basins.some(b => b.id === 'ringsea'),
  TD.basins.map(b => b.id).join(','));
T.ok('the constituents are a Day and half a Day', near(K.OMEGA[0] * K.DAY, 2 * Math.PI) && near(K.OMEGA[1] * K.DAY, 4 * Math.PI));

/* find, in each basin, an open-water cell and a coast cell (wet, with a dry neighbour) by the record's own grids */
function cells(R) {
  const A = K.decode(R.amp1), N = R.nx * R.ny, u = i => A[2 * i] | (A[2 * i + 1] << 8);
  let open = null, coast = null;
  for (let j = 2; j < R.ny - 2 && !(open && coast); j++) for (let i = 2; i < R.nx - 2; i++) {
    const k = j * R.nx + i; if (u(k) === 65535) continue;
    const nb = [k - 1, k + 1, k - R.nx, k + R.nx].map(u), dry = nb.filter(v => v === 65535).length;
    if (!open && dry === 0 && [k - 2, k + 2, k - 2 * R.nx, k + 2 * R.nx].every(q => u(q) !== 65535)) open = [i, j];
    if (!coast && dry === 1 && i > 3) { const d = nb.findIndex(v => v === 65535); coast = [i, j, d]; }
  }
  return {open, coast, N};
}
for (const R of DATA.basins) {
  const C = cells(R), cpx = (i, j) => [R.x0 + (i + .5) * R.cell, R.y0 + (j + .5) * R.cell];
  T.ok(R.id + ': has open water and a coast', !!C.open && !!C.coast);
  const [ox, oy] = cpx(C.open[0], C.open[1]);
  const S = TD.site({px: ox, py: oy}, {springs: false});
  T.ok(R.id + ': an open-water site', !!S && S.coast === 0 && S.basin === R.id, JSON.stringify(S && {b: S.basin, c: S.coast}));
  let mx = -1e9, mn = 1e9; for (let t = 0; t < K.DAY; t += 60) { const v = S.level(t); if (v > mx) mx = v; if (v < mn) mn = v; }
  T.ok(R.id + ': the tide repeats each Day', [0, 7777, 40000].every(t => near(S.level(t), S.level(t + K.DAY), 1e-6)));
  T.ok(R.id + ': range is the spread of its levels', near(S.range, mx - mn, 2e-3 * Math.max(1, S.range)), S.range + ' vs ' + (mx - mn));
  T.ok(R.id + ': the range is plausible (0.05 to 20 m)', S.range > .05 && S.range < 20, S.range);
  T.ok(R.id + ': highs and lows alternate in a Day', S.high.length >= 1 && Math.abs(S.high.length - S.low.length) <= 1, S.high + ' / ' + S.low);
  T.ok(R.id + ': rate is the derivative', near(S.rate(5000), (S.level(5000.5) - S.level(4999.5)), 1e-6 * Math.max(1, S.range)));
  const S14 = TD.site({px: ox, py: oy}, {range: 14, springs: false});
  T.ok(R.id + ': a site scaled to 14 m has 14 m', near(S14.range, 14, 1e-3), S14.range);
  const SL = TD.site({px: ox, py: oy}, {lag: 1800, springs: false});
  T.ok(R.id + ': a lag delays the curve', near(SL.level(5000), S.level(3200), 1e-9));
  const st = S.state(S.high[0]);
  T.ok(R.id + ': high water is slack', st === 'slack', st);
  /* the interpolation stays within its corners' amplitudes (cell centres one cell apart, all wet) */
  const [ax, ay] = cpx(C.open[0] + .5, C.open[1] + .5), Smid = TD.atPx(ax, ay);
  const corners = [[0, 0], [1, 0], [0, 1], [1, 1]].map(d => TD.atPx(...cpx(C.open[0] + d[0], C.open[1] + d[1])));
  T.ok(R.id + ': interpolated amplitude within its corners', corners.every(Boolean) &&
    Smid.a[0] <= Math.max(...corners.map(c => c.a[0])) + 1e-9 && Smid.a[1] <= Math.max(...corners.map(c => c.a[1])) + 1e-9);
  /* a point two cells into the land off a coast cell takes the coast's tide (reach 3) and none with reach 1 */
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]], d = dirs[C.coast[2]];
  const [lx, ly] = cpx(C.coast[0] + 2 * d[0], C.coast[1] + 2 * d[1]);
  const L3 = TD.atPx(lx, ly, 3);
  T.ok(R.id + ': a shore point within reach gets a tide', !!L3 && L3.coast >= 1, JSON.stringify(L3 && L3.coast));
  const waterT = S.waterTide(), dom = S.a[0] >= S.a[1] ? 0 : 1;
  const one = t => S.a[dom] * Math.cos(K.OMEGA[dom] * t - S.p[dom]);
  T.ok(R.id + ': waterTide is the dominant constituent', [0, 3000, 50000].every(t =>
    near(waterT.amp * Math.sin(2 * Math.PI * t / waterT.period + waterT.phase), one(t), 1e-9)));
}
/* springs and neaps: the record's inferred constituents (the Week, the Thirteen) */
{
  const D = K.DAY, inf = TD.inferred, rsum = inf.reduce((a, c) => a + c.ratio, 0);
  T.ok('the record infers the Week and the Thirteen', inf.length === 2 && inf.every(c => c.from === 2 && c.ratio > 0 && c.omega < K.OMEGA[1]),
    inf.map(c => c.name).join(','));
  T.ok('their beats are half their months (3.5 and 6.5 days)', near(inf[0].beatD, 3.5, .02) && near(inf[1].beatD, 6.5, .02));
  const S = TD.site({px: 236, py: 242}, {range: 14});
  T.ok('a site has springs', S.springs === true && S.spring(-43200) > 1);
  T.ok('the greatest springs at the Double Dark', near(S.spring(inf[0].epoch), 1 + rsum, 1e-9), S.spring(inf[0].epoch));
  const full = S.nextSpring(inf[0].epoch + 44.5 * D);
  T.ok('and again at the Double Full, about 45.5 days on', near(full / D - inf[0].epoch / D, 45.5, 1) && S.spring(full) > 1 + rsum - .03,
    (full / D) + ' ' + S.spring(full));
  const days = []; for (let d = 0; d < 91; d++) days.push(S.day(d).range);
  const mx = Math.max(...days), mn = Math.min(...days);
  T.ok('the day\'s range swings round the mean (14 m)', mx > 14 * 1.2 && mn < 14 * .8, mn.toFixed(2) + '..' + mx.toFixed(2));
  T.ok('the Double Dark\'s day is among the greatest', S.day(-1).range >= .97 * mx, S.day(-1).range + ' vs ' + mx);
  const ns = S.nextSpring(0), nn = S.nextNeap(0);
  T.ok('next spring and neap are found, springs above neaps', ns > 0 && nn > 0 && S.spring(ns) > S.spring(nn), ns + ' ' + nn);
  T.ok('a spring is a maximum of the factor', S.spring(ns) >= S.spring(ns - 1800) && S.spring(ns) >= S.spring(ns + 1800));
  T.ok('the springs are in the level', Math.abs(S.level(5000) - TD.site({px: 236, py: 242}, {range: 14, springs: false}).level(5000)) > 1e-3);
  T.ok('a springs-off site repeats each day', (() => { const M = TD.site({px: 236, py: 242}, {range: 14, springs: false});
    return [0, 9999].every(t => near(M.level(t), M.level(t + D), 1e-9)); })());
  T.ok('a day\'s extremes are its own levels', (() => { const x = S.day(3); return x.high.every(t => S.level(t) <= x.highest + 1e-6) &&
    near(x.highest - x.lowest, x.range, 1e-9); })());
}
T.ok('world seconds from a clock', K.worldSeconds({day: 2, hour: 6}) === 54 * 3600 && K.worldSeconds({hour: 0}) === 0);
T.ok('far inland gets no tide', TD.atPx(1500, 200) === null && TD.site({px: 1500, py: 200}) === null);
T.ok('the origin maps metres to pixels', (() => { const T2 = K.load(DATA, {origin: [300, 300]}), a = T2.at(4000, -2000), b = TD.atPx(302, 299);
  return a && b && near(a.a[0], b.a[0]); })());

/* bindWater drives WATER.seaLevel from the site and gives it back */
{
  const S = TD.site({px: 300, py: 300}, {range: 3});
  const before = W.seaLevel(1234);
  W.PRESETS.sea.level = 2;
  const unbind = K.bindWater(W, S);
  T.ok('bindWater drives seaLevel', near(W.seaLevel(1234), 2 + S.level(1234)) && near(W.seaLevel(9999), 2 + S.level(9999)));
  unbind(); W.PRESETS.sea.level = 0;
  T.ok('unbind gives seaLevel back', near(W.seaLevel(1234), before));
  const clock = {day: 1, hour: 3}, un2 = K.bindWater(W, S, {time: () => K.worldSeconds(clock)});
  T.ok('bindWater on world time ignores motion time', near(W.seaLevel(1), S.level(27 * 3600)) && near(W.seaLevel(777), S.level(27 * 3600)));
  un2();
}

/* guards: each a faulty input that must throw and a fixed one that must not */
const loads = d => { try { K.load(d); return true; } catch (e) { return false; } };
const clone = o => JSON.parse(JSON.stringify(o));
const badKind = clone(DATA); badKind.kind = 'something-else';
T.neg('a record of another kind is refused', loads, badKind, DATA);
const badVer = clone(DATA); badVer.version = 2;
T.neg('a later version is refused', loads, badVer, DATA);
const badGrid = clone(DATA); badGrid.basins[1].amp1 = badGrid.basins[1].amp1.slice(0, -8);
T.neg('a grid of the wrong length is refused', loads, badGrid, DATA);
const badInf = clone(DATA); badInf.inferred = [{name: 'x', from: 3, ratio: .1, omega: 1e-4, epoch: 0}];
T.neg('an inferred constituent on no parent is refused', loads, badInf, DATA);
const binds = w => { try { K.bindWater(w, TD.site({px: 300, py: 300})); return true; } catch (e) { return false; } };
T.neg('bindWater needs a WATER', binds, {}, {seaLevel: () => 0, PRESETS: {sea: {level: 0}}});
T.done();
