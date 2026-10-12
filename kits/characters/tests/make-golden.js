// node kits/characters/tests/make-golden.js : writes tests/golden-mpfb.json, what KCHAR (src/10-rig.js) gives for the
// MakeHuman bodies on a fixed set of records: morph weights, morphed joints, strangers per people, parts and hidden
// skin. godot/tests/character/kchar_test.gd checks kchar.gd against it. Rerun after changing 10-rig.js or data/, then
// python3 godot/tools/sync_core.py.
var path = require('path'), fs = require('fs');
var HERE = path.join(__dirname, '..');
require(path.join(HERE, '..', '..', 'core', 'rand', '08-core-rand.js')); global.KRAND = globalThis.KRAND;
var KCHAR = require(path.join(HERE, 'src', '10-rig.js'));
var J = function(f){ return JSON.parse(fs.readFileSync(path.join(HERE, 'data', f))); };
var peoples = J('peoples.json').peoples;
var golden = { bodies:{} };
['mpfb_male', 'mpfb_female'].forEach(function(body){
  var skel = J(body + '/skeleton.json'), kit = J(body + '/kit.json'), M = kit.morph;
  var all = {}; M.morphs.forEach(function(s, i){ all[s.id] = ((i * 37) % 21 - 10) / 10; });
  var recs = [
    KCHAR.blank(kit),
    { morph:{ age:-0.5, height:1 } },
    { morph:{ weight:0.7, muscle:-0.4, 'nose-scale-horiz-decr-incr':1 }, ancestry:{ african:0.6, asian:0.3, caucasian:0.1 } },
    { morph:all, ancestry:{ african:0, asian:1, caucasian:0 } }
  ];
  var g = golden.bodies[body] = { morphs:[], strangers:[], parts:[] };
  recs.forEach(function(r){
    var w = KCHAR.morphWeights(r, kit), mj = KCHAR.morphJoints(skel, kit, w);
    g.morphs.push({ record:r, w:Array.prototype.slice.call(w), t:mj.t, d:mj.d, cr:KCHAR.colliders(skel, w).map(function(c){ return c.r; }) });
  });
  peoples.forEach(function(P, k){
    [1, 7919].forEach(function(seed){ g.strangers.push({ people:P.id, seed:seed + k, record:KCHAR.stranger(seed + k, kit, P) }); });
  });
  g.strangers.push({ people:null, seed:42, record:KCHAR.stranger(42, kit, null) });
  g.strangers.slice(0, 6).forEach(function(s){
    var hid = KCHAR.hidden(s.record, kit).base, n = 0;
    for(var i=0;i<hid.length;i++) n += hid[i];
    g.parts.push({ record:s.record, parts:KCHAR.parts(s.record, kit).map(function(p){ return p.key + ':' + p.role + ':' + p.slot; }), hidden:n });
  });
});
fs.writeFileSync(path.join(__dirname, 'golden-mpfb.json'), JSON.stringify(golden));
console.log('golden-mpfb.json: %s', Object.keys(golden.bodies).map(function(b){
  var g = golden.bodies[b]; return b + ' ' + g.morphs.length + ' morphs, ' + g.strangers.length + ' strangers, ' + g.parts.length + ' part lists';
}).join('; '));
