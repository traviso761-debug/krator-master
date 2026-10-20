// Runs the skyscrapers' plan (src/78s-iziz-towers-plan.js) and the other Ancient buildings' (src/78w-iziz-ancients-plan.js)
// in node with the kit's own noise (src/10-core.js, its rng + noise section) and writes towers/plans.json (the towers) and
// towers/plans-ancients.json (the rest) for blueprint.py.   node towers/plan_dump.js [scale]   (the towers' scale, default
// 0.3, the city's smax; the other buildings are planned at the scale the city places them: SCALES below)
const fs = require('fs'), path = require('path'), SRC = path.join(__dirname, '..', 'src');
const core = fs.readFileSync(path.join(SRC, '10-core.js'), 'utf8');
const noise = core.slice(core.indexOf('// ---------------------------------------------------------------- rng + noise'));
const plan = fs.readFileSync(path.join(SRC, '78s-iziz-towers-plan.js'), 'utf8');
const anc = fs.readFileSync(path.join(SRC, '78w-iziz-ancients-plan.js'), 'utf8');
const run = new Function(noise + '\n' + plan + '\n' + anc + '\nreturn {IZTOWER, IZANC, fbm};');
const { IZTOWER, IZANC, fbm } = run();
const s = +(process.argv[2] || 0.3), out = {};
for (const key of ['skyA', 'skyB', 'skyC', 'skyD', 'skyE', 'skyF'])
  for (const d of [3, 1, 2]) out[key + '_d' + d] = IZTOWER.plan(key, d, s, fbm);
fs.writeFileSync(path.join(__dirname, 'plans.json'), JSON.stringify(out));
for (const k in out) { const P = out[k]; console.log(k, P.storeys.length + ' storeys', P.storeys.reduce((a, S) => a + S.cells.length, 0) + ' cells', 'shafts ' + P.shafts.map(x => x.length).join('+'), P.storeys.map(S => S.kind[0]).join('')); }
// the other buildings at the scales the city places them (2026-10-19), a transplant's wreck cut at the middle of its range
// (a ruin's cut .4 to .75 of its height, a reclaimed one's .55 to .85, less the jag's .15)
const SCALES = { aptsA: .385, aptsC: .391, honey: .6, houseD: .7, houseE: .538, houseF: .7, fuel: .298,
  t_setback: 1.857, t_setback2: 2.6, t_pent: 1.97, t_hept: 1.97, t_wedge: 1.857, t_barrel: 2.6, t_midrise: 2.364,
  // the owner's roster (2026-10-19), at the scales their lots give them
  wave: .75, bridge: .8, fins: .83, adlab: .9, flat: .25, hotel: .47, cultural: .25, aptsC2: .45 };
// the cultural centre's first ring of halls as its kit builds them (67-cultural.js RINGS[0]: twelve, every third a campanile)
const HALLS = [...Array(12).keys()].map(k => { const a = k / 12 * 2 * Math.PI, tall = k % 3 === 1; return { x: 104 * Math.cos(a), z: 104 * Math.sin(a), r: tall ? 15 * .62 : 15, h: 30 * (tall ? 2.05 : 1), py: 11, brk: false, a }; });
const TH = { t_setback: 51, t_setback2: 51, t_pent: 26, t_hept: 22, t_wedge: 23, t_barrel: 6.5, t_midrise: 27 };
const outA = {};
for (const type of IZANC.TYPES) for (const d of [3, 1]) {
  const extra = TH[type] ? { top: TH[type] * (d === 3 ? .70 : .575) - .15 * TH[type] * .5 } : type === 'cultural' ? { halls: HALLS } : null;
  const P = IZANC.plan(type, d, SCALES[type], fbm, extra); outA[type + '_d' + d] = P;
  if (!P) { console.log(type, d, 'no plan'); continue; }
  console.log(type + '_d' + d, P.masses.map(M => M.id + ': ' + M.plan.storeys.length + ' storeys ' + M.plan.storeys.reduce((a, S) => a + S.cells.length, 0) + ' rooms ' + M.plan.storeys.map(S => S.kind[0]).join('')).join(' | '));
}
fs.writeFileSync(path.join(__dirname, 'plans-ancients.json'), JSON.stringify(outA));
