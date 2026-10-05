// The Atmos autoload's golden vectors, from core/atmos itself: the evening, a light's hours (and a halo's), the
// weather's targets and eased steps, the lightning flash. godot/tests/atmos/atmos_test.gd checks krator/atmos.gd
// against them.   node godot/tools/atmos_golden.js   (writes godot/tests/atmos/golden.json)
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', '..', 'core', 'atmos');
const FRAGS = fs.readdirSync(DIR).filter(f => /^89-atmos-.*\.js$/.test(f)).sort();
global.window = global;
eval(FRAGS.map(f => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n') + ';global.ATMOS=ATMOS;');
const A = ATMOS, out = { source: 'core/atmos (' + FRAGS.join(', ') + ')', presets: { clock: A.PRESETS.clock, wind: A.PRESETS.wind } };
const H = []; for (let h = 0; h < 24; h += 0.25) H.push(h);
out.night = H.map(h => [h, A.night(h)]);
const L = [[17.6, 29.6], [17.05, 22.25], [0, 30], [-1, 30], [18.9, 30.1]];
out.lit = []; for (const l of L) for (const h of H) out.lit.push([h, l[0], l[1], A.litAt(h, l[0], l[1])]);
// a halo's hours (89-atmos-2-lights.js, the glow shader): on<0 dims by day, on=0 always
out.glowLit = []; for (const l of L) for (const h of H) out.glowLit.push([h, l[0], l[1], l[0] < 0 ? 0.25 + 0.75 * A.night(h) : (l[0] === 0 ? 1 : A.litAt(h, l[0], l[1]))]);
out.target = []; for (const m of A.MODES) for (const h of H) { const g = A.weatherTarget(m, h); out.target.push([m, h, g.rain, g.fog, g.wind]); }
// eased runs: each mode from rest, and a storm clearing, stepped at 1/60 s; the day running through auto at 0.5 s steps
out.runs = [];
const run = (name, mode, start, hour, dt, n, hourRate) => { const W = Object.assign(A.weatherState(mode), start || {}); const rec = []; let h = hour;
  for (let i = 0; i < n; i++) { A.weatherStep(W, h, dt); h = (h + dt * (hourRate || 0)) % 24; if (i % 10 === 9) rec.push([W.rain, W.fog, W.wet, W.wind]); }
  out.runs.push({ name, mode, start: start || {}, hour, dt, n, hourRate: hourRate || 0, states: rec }); };
for (const m of A.MODES) run(m + ' from rest at 14', m, null, 14, 1 / 60, 600);
run('a storm clearing', 'clear', { rain: 1, fog: 1, wet: 1, wind: 2.4 }, 14, 1 / 60, 600);
run('auto through the evening', 'auto', null, 18, 0.5, 600, 0.01);
run('auto through the dawn', 'auto', null, 3, 0.5, 900, 0.01);
out.flash = [-10, 0, 40, 79.9, 80, 100, 149.9, 150, 200, 229, 230, 400, 599, 600, 700, 5000].map(e => [e, A.flashAt(e)]);
fs.writeFileSync(path.join(__dirname, '..', 'tests', 'atmos', 'golden.json'), JSON.stringify(out));
console.log('wrote godot/tests/atmos/golden.json:', out.night.length, 'night,', out.lit.length, 'lit,', out.target.length, 'targets,', out.runs.length, 'runs');
