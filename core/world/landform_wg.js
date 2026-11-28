/* core/world/landform_wg.js: the wander sample of each wandering bench (41l-world-landforms.js: a bench record with
   outline_px and wobble_m), so the record can state it (wg_n) and a page does not sample its noise at load (23k points a
   record, about a third of a second each). The sample is 41l's own (WLAND.wgSample), run on the region's frame with no
   ground: it reads only the record's outline, id and the noise.

     node core/world/landform_wg.js <region.json> [id ...]   -> {"<id>": wg_n, ...} on stdout

   A build's tool writes the numbers into its records (settlements/hook/world/cut.py --landforms); WLAND.check samples them
   again and fails a stated value that differs. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const [file, ...ids] = process.argv.slice(2);
if (!file) { console.error('usage: node core/world/landform_wg.js <region.json> [id ...]'); process.exit(2); }
const meta = JSON.parse(fs.readFileSync(file, 'utf8'));
/* every bench re-sampled: a stated wg_n is dropped first */
meta.landforms = (meta.landforms || []).map(r => { const c = Object.assign({}, r); delete c.wg_n; return c; });
const ctx = vm.createContext({ console, Math, JSON, Object, Array, Set, Map, Number, String, Error, Float32Array, Float64Array, Uint8Array, Int32Array, Infinity, NaN });
ctx.window = ctx; ctx.globalThis = ctx;
const run = (src, name) => vm.runInContext(src, ctx, { filename: name });
run(fs.readFileSync(path.join(ROOT, 'core', 'rand', '08-core-rand.js'), 'utf8'), '08-core-rand.js');
run(fs.readFileSync(path.join(ROOT, 'core', 'terrain', '38-core-relief.js'), 'utf8'), '38-core-relief.js');
ctx.WORLD_DATA = { meta };
run('var WORLD = { init: function () {}, inside: function () { return true; } };', 'stub');
run(fs.readFileSync(path.join(ROOT, 'core', 'world', '41l-world-landforms.js'), 'utf8'), '41l-world-landforms.js');
run('WORLD.init(null);', 'init');
const W = vm.runInContext('WLAND', ctx), out = {};
for (const B of W.benches) if (B.wob > 0 && (!ids.length || ids.includes(B.id))) out[B.id] = W.wgSample(B);
process.stdout.write(JSON.stringify(out));
