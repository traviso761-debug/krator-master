#!/usr/bin/env node
// Longsong's people as core/charactermodels records (KCHAR.stranger): one per LS.PEOPLE record, drawn from its own seed,
// so the same person always looks the same, here and in Godot (GODOT-PLAN.md: the record goes beside the citizen).
// Each record is the page's own (src/40e-ls-kchar.js, LSK.record: the Order in its standing's set, the town and the
// visitors in Xanadu's dress; core/charactermodels/data/peoples.json, the clothes tools/make_garments.py's `order_`, `xan_`).
//   node tools/kchar_people.js        writes people-kchar.json beside build.py (commit it; build.py inlines a summary)
var path = require('path'), fs = require('fs'), vm = require('vm');
var HERE = path.join(__dirname, '..'), ROOT = path.join(HERE, '..', '..'), CM = path.join(ROOT, 'core', 'charactermodels');
require(path.join(ROOT, 'core', 'rand', '08-core-rand.js')); global.KRAND = globalThis.KRAND;
var KCHAR = require(path.join(CM, 'src', '10-rig.js'));
var ctx = { Math: Math, JSON: JSON, Object: Object, Array: Array, Set: Set, Map: Map, Error: Error, String: String, Number: Number, KRAND: KRAND, KCHAR: KCHAR };
vm.createContext(ctx);
vm.runInContext('var LS;' + fs.readFileSync(path.join(HERE, 'src', '40-ls-plan.js'), 'utf8') + ';this.LS=LS;', ctx);
// the records by the page's own rule (src/40e-ls-kchar.js: LSK.record on the kit cut as the page's is, LSK.trimKit)
vm.runInContext(fs.readFileSync(path.join(HERE, 'src', '40e-ls-kchar.js'), 'utf8') + ';this.LSK=LSK;', ctx);
var J = function (f) { return JSON.parse(fs.readFileSync(path.join(CM, 'data', f), 'utf8')); };
var peoples = J('peoples.json').peoples.filter(function (p) { return ctx.LSK.PEOPLES.indexOf(p.id) >= 0; });
var data = { peoples: peoples, bodies: {} };
['mpfb_male', 'mpfb_female'].forEach(function (b) { data.bodies[b] = { kit: ctx.LSK.trimKit(J(b + '/kit.json'), peoples, b) }; });
var out = {};
ctx.LS.PEOPLE.forEach(function (P) { out[P.id] = ctx.LSK.record(P, data); });
var ids = Object.keys(out).sort();
var lines = ['{', '"about":' + JSON.stringify('Longsong\'s people as core/charactermodels records (tools/kchar_people.js): KCHAR.stranger(seed, kit, people) for each LS.PEOPLE record. Do not edit; rerun the tool.') + ',', '"people":{'];
ids.forEach(function (id, i) { lines.push(JSON.stringify(id) + ':' + JSON.stringify(out[id]) + (i < ids.length - 1 ? ',' : '')); });
lines.push('}', '}');
fs.writeFileSync(path.join(HERE, 'people-kchar.json'), lines.join('\n') + '\n');
console.log('wrote people-kchar.json: ' + ids.length + ' people (' + ids.filter(function (i) { return out[i].people === 'historians'; }).length + ' of the Order)');
