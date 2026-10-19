#!/usr/bin/env node
// Longsong's people as core/charactermodels records (KCHAR.stranger): one per LS.PEOPLE record, drawn from its own seed,
// so the same person always looks the same, here and in Godot (GODOT-PLAN.md: the record goes beside the citizen).
// The Order from the `historians` people, each in its standing's set (TIER: the novices' shirt and skirt, the monks' and
// wardens' saffron robe, the masters' and keepers' elder's robe and hat, the operatives' field coat); the lay servants
// in Xanadu's townsfolk dress, the pilgrims as the people's shares fall, a few of them wealthy and turbaned
// (core/charactermodels/data/peoples.json; the clothes are tools/make_garments.py's `order_` and `xan_`).
//   node tools/kchar_people.js        writes people-kchar.json beside build.py (commit it; build.py inlines a summary)
var path = require('path'), fs = require('fs'), vm = require('vm');
var HERE = path.join(__dirname, '..'), ROOT = path.join(HERE, '..', '..'), CM = path.join(ROOT, 'core', 'charactermodels');
require(path.join(ROOT, 'core', 'rand', '08-core-rand.js')); global.KRAND = globalThis.KRAND;
var KCHAR = require(path.join(CM, 'src', '10-rig.js'));
var ctx = { Math: Math, JSON: JSON, Object: Object, Array: Array, Set: Set, Map: Map, Error: Error, String: String, Number: Number, KRAND: KRAND };
vm.createContext(ctx);
vm.runInContext('var LS;' + fs.readFileSync(path.join(HERE, 'src', '40-ls-plan.js'), 'utf8') + ';this.LS=LS;', ctx);
var J = function (f) { return JSON.parse(fs.readFileSync(path.join(CM, 'data', f), 'utf8')); };
var peoples = J('peoples.json').peoples, byId = {};
peoples.forEach(function (p) { byId[p.id] = p; });
var kits = { mpfb_male: J('mpfb_male/kit.json'), mpfb_female: J('mpfb_female/kit.json') };
var ORDER = { monk: 1, novice: 1, operative: 1, master: 1, keeper: 1, warden: 1 };
var TIER = { monk: 'monk', warden: 'monk', novice: 'novice', operative: 'agent', master: 'elder', keeper: 'elder', servant: 'town' };
var out = {};
ctx.LS.PEOPLE.forEach(function (P) {
  var people = byId[ORDER[P.role] ? 'historians' : 'xanadu'];
  var body = KRAND.unit(KRAND.hash(P.seed, 11)) < 0.5 ? 'mpfb_male' : 'mpfb_female';
  // a role with a standing draws in that tier alone (the people's other draws are unchanged)
  if (TIER[P.role]) people = Object.assign({}, people, { tiers: [[TIER[P.role], 1]] });
  var r = KCHAR.stranger(P.seed, kits[body], people);
  r.seed = P.seed;
  out[P.id] = r;
});
var ids = Object.keys(out).sort();
var lines = ['{', '"about":' + JSON.stringify('Longsong\'s people as core/charactermodels records (tools/kchar_people.js): KCHAR.stranger(seed, kit, people) for each LS.PEOPLE record. Do not edit; rerun the tool.') + ',', '"people":{'];
ids.forEach(function (id, i) { lines.push(JSON.stringify(id) + ':' + JSON.stringify(out[id]) + (i < ids.length - 1 ? ',' : '')); });
lines.push('}', '}');
fs.writeFileSync(path.join(HERE, 'people-kchar.json'), lines.join('\n') + '\n');
console.log('wrote people-kchar.json: ' + ids.length + ' people (' + ids.filter(function (i) { return out[i].people === 'historians'; }).length + ' of the Order)');
