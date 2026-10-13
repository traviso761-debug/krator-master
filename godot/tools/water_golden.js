// core/water's CPU twins at fixed (x, z, t), for krator/water.gd (KWater). Three open surfaces cover what a surface can
// be: the Ring Sea's four trochoids with half the shared wave field and a bed (its level the sea's, null in the record),
// a calm pond (three ripples, no field, no bed), and a bay with the whole field and its chop displaced. The surfaces go
// through core/export's water adapter (09-core-export-adapters.js), so the test reads the very record a page exports.
// godot/tests/water/water_test.gd checks KWater against them.   node godot/tools/water_golden.js
// (writes godot/tests/water/golden.json; rerun after changing core/water, core/atmos's waves or the water adapter)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const FR = ['core/atmos/89-atmos-0-core.js', 'core/atmos/89-atmos-0p-presets.js', 'core/atmos/89-atmos-a-waves.js', 'core/water/20-core-water.js',
  'core/export/07-core-export.js', 'core/export/09-core-export-adapters.js'];
global.window = global;
eval(FR.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n') + ';global.ATMOS=ATMOS;global.WATER=WATER;global.EXPORT=EXPORT;');
const A = ATMOS, W = WATER;

const SEA = W.open({ name: 'sea', swell: 'ringsea', field: .5, bounds: [-400, -300, 400, 300],
  bed: (x, z) => -14 + 0.032 * x + 3.5 * Math.sin(z / 37), bedCell: 8 });
const POND = W.open({ name: 'pond', level: 2.5, swell: [[.06, 20, 35, 0, .03], [.035, 12, -50, 1.3, .03], [.015, 6, 80, 2.2, .02]], field: 0,
  bounds: [500, 500, 700, 700] });
const BAY = W.open({ name: 'bay', level: -1, swell: [[.2, 30, 10, 0, .2]], field: 1, chop: .5, bounds: [-1000, -1000, -600, -600] });
const sec = EXPORT.world({ sections: ['water'] }).water;

let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
const T = [0, 3.7, 421.3, 1234.5, 98765.4321];
const out = { source: 'core/water/20-core-water.js through core/export/09-core-export-adapters.js (' + FR.join(', ') + ')', waves: A.PRESETS.waves,
  section: sec, samples: [] };
for (const S of [SEA, POND, BAY]) {
  const id = 'water:' + S.id, b = S.bounds;
  for (let i = 0; i < 24; i++) {
    const x = b[0] + (b[2] - b[0]) * rnd(), z = b[1] + (b[3] - b[1]) * rnd(), t = T[i % T.length], sp = [0, .7, 3.1][i % 3];
    const p3 = S.rest(x, z, t, 3);
    out.samples.push({ id, x, z, t, sp,
      h: S.heightAt(x, z, t),                                  // 5 Newton steps (the CPU twin)
      h3: S.surfaceAt(p3[0], p3[1], t, 0)[1],                  // 3 (the shader's wtr_height)
      surface: S.surfaceAt(x, z, t, sp),                       // the vertex at rest point (x, z) for spacing sp
      normal: S.normalAt(x, z, t, 60, .05),
      nj: W.troNJ(S, x, z, t, .05),
      foam: W.foamAt(S, x, z, t, .05),
      depth: S.bed ? S.depthAt(x, z, t) : null });
  }
}
const f = path.join(ROOT, 'godot', 'tests', 'water', 'golden.json');
fs.mkdirSync(path.dirname(f), { recursive: true });
fs.writeFileSync(f, JSON.stringify(out));
console.log('wrote ' + path.relative(ROOT, f) + ': ' + sec.surfaces.length + ' surfaces, ' + out.samples.length + ' samples, ' + sec.probes.length + ' probes');
