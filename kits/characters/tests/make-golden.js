// node kits/characters/tests/make-golden.js : writes tests/golden-pose.json, what KCHAR (src/10-rig.js) gives for a
// fixed set of records. godot/tests/character/kchar_test.gd checks kchar.gd against it. Rerun after changing
// 10-rig.js or data/*.json, then python3 godot/tools/sync_core.py.
var path = require('path'), fs = require('fs');
var HERE = path.join(__dirname, '..');
require(path.join(HERE, '..', '..', 'core', 'rand', '08-core-rand.js')); global.KRAND = globalThis.KRAND;
var KCHAR = require(path.join(HERE, 'src', '10-rig.js'));
var J = function(f){ return JSON.parse(fs.readFileSync(path.join(HERE, 'data', f + '.json'))); };
var skel = J('skeleton'), sliders = J('sliders'), outfits = J('outfits');
var all = {}; sliders.sliders.forEach(function(s, i){ all[s.id] = ((i * 37) % 21 - 10) / 10; });
var cases = [{}, { legs:1 }, { legs:-1, height:0.5 }, { build:0.7, shoulders:-0.4, headsize:1 }, { hips:1, arms:-1, hands:0.5, feet:-0.5 }, all];
var golden = { poses:[], visible:[], random:[] };
outfits.outfits.forEach(function(o, k){
  cases.forEach(function(v, c){
    var p = KCHAR.pose(skel, sliders, v, o.face);
    golden.poses.push({ head:o.id, values:v, t:p.t, s:p.s, root:p.root, lift:p.lift });
  });
});
var ids = outfits.outfits.map(function(o){ return o.id; });
[[0,0,0,0,0], [0,1,2,3,4], [5,5,1,1,5], [2,2,2,0,2]].forEach(function(pick){
  var rec = { slots:{}, sliders:{}, dye:{} };
  outfits.slots.forEach(function(s, i){ rec.slots[s] = ids[pick[i]]; });
  golden.visible.push({ slots:rec.slots, meshes:KCHAR.visible(rec, outfits).map(function(v){ return v.outfit + ':' + v.mesh; }) });
});
[1, 7919, 123456].forEach(function(seed){ golden.random.push({ seed:seed, record:KCHAR.random(seed, sliders, outfits) }); });
fs.writeFileSync(path.join(__dirname, 'golden-pose.json'), JSON.stringify(golden));
console.log('golden-pose.json: %d poses, %d visible lists, %d random records', golden.poses.length, golden.visible.length, golden.random.length);
