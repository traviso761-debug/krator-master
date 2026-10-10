// node kits/characters/tests/test-rig.js : KCHAR (src/10-rig.js) against data/*.json. Exit 1 on a failure.
var path = require('path'), fs = require('fs');
var HERE = path.join(__dirname, '..');
require(path.join(HERE, '..', '..', 'core', 'rand', '08-core-rand.js')); global.KRAND = globalThis.KRAND;
var KCHAR = require(path.join(HERE, 'src', '10-rig.js'));
var skel = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'skeleton.json')));
var sliders = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'sliders.json')));
var outfits = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'outfits.json')));
var fails = 0;
function ok(c, msg){ if(!c){ fails++; console.log('FAIL', msg); } }
function near(a, b, e){ return Math.abs(a - b) <= (e || 1e-6); }
var ix = {}; skel.joints.forEach(function(j, i){ ix[j.name] = i; });

// quaternion rotation: 90 degrees about z takes x to y
var q = [0, 0, Math.SQRT1_2, Math.SQRT1_2], w = KCHAR.fk({ joints:[{ parent:-1, t:[0,0,0], r:q }, { parent:0, t:[1,0,0], r:[0,0,0,1] }] }, [[0,0,0],[1,0,0]]);
ok(near(w.P[1][0], 0) && near(w.P[1][1], 1), 'qrot: x about z by 90 is y, got ' + w.P[1]);

// zero sliders: the bind pose
var p0 = KCHAR.pose(skel, sliders, {});
ok(p0.root === 1 && near(p0.lift, 0), 'zero: no root scale, no lift');
skel.joints.forEach(function(j, i){
  ok(p0.s[i].every(function(x){ return x === 1; }), 'zero: skin scale 1 at ' + j.name);
  ok(j.t.every(function(x, a){ return near(x, p0.t[i][a]); }), 'zero: bind offset at ' + j.name);
});

// FK of the bind skeleton puts the feet near the ground and the head at Styv's height
var b = KCHAR.fk(skel, p0.t);
ok(b.P[ix.Head][1] > 1.4 && b.P[ix.Head][1] < 1.5, 'fk: head at ' + b.P[ix.Head][1]);
ok(b.P[ix.LeftFoot][1] > 0.05 && b.P[ix.LeftFoot][1] < 0.2, 'fk: foot at ' + b.P[ix.LeftFoot][1]);

// longer legs lift the hips by what the feet dropped, so the feet stay down
var pl = KCHAR.pose(skel, sliders, { legs:1 }), wl = KCHAR.fk(skel, pl.t);
ok(pl.lift > 0.05 && pl.lift < 0.12, 'legs +1: lift ' + pl.lift);
ok(near(wl.P[ix.LeftFoot][1] + pl.lift, b.P[ix.LeftFoot][1], 0.005), 'legs +1: the foot stays on the ground');
var ps = KCHAR.pose(skel, sliders, { legs:-1 });
ok(ps.lift < 0, 'legs -1: the hips drop');

// left and right move alike
var ph = KCHAR.pose(skel, sliders, { hips:1, shoulders:1, arms:1 }), wh = KCHAR.fk(skel, ph.t);
['UpLeg', 'Arm', 'Hand'].forEach(function(n){
  var L = wh.P[ix['Left' + n]], R = wh.P[ix['Right' + n]], L0 = b.P[ix['Left' + n]], R0 = b.P[ix['Right' + n]];
  ok(near(Math.abs(L[0]) - Math.abs(L0[0]), Math.abs(R[0]) - Math.abs(R0[0]), 0.01), 'symmetry: ' + n + ' moves out alike');
  ok(Math.abs(L[0]) > Math.abs(L0[0]), 'widen: ' + n + ' moves out');
});

// face sliders touch only the face joints and Head; body sliders never touch the face joints
var faceNames = outfits.face_joints;
sliders.sliders.forEach(function(sl){
  var v = {}; v[sl.id] = 1;
  var p = KCHAR.pose(skel, sliders, v), moved = [];
  skel.joints.forEach(function(j, i){
    if(!j.t.every(function(x, a){ return near(x, p.t[i][a]); }) || !p.s[i].every(function(x){ return x === 1; })) moved.push(j.name);
  });
  if(sl.group === 'Face') ok(moved.every(function(n){ return n === 'Head' || faceNames.indexOf(n) >= 0; }), sl.id + ' moves only the face: ' + moved);
  ok(moved.length > 0 || sl.ops.some(function(o){ return o.op === 'root'; }), sl.id + ' does something');
});

// a head's face rest positions become offsets from Head that FK puts back where they were
var o = outfits.outfits[0], pf = KCHAR.pose(skel, sliders, {}, o.face), wf = KCHAR.fk(skel, pf.t);
faceNames.forEach(function(n){
  ok(o.face[n].every(function(x, a){ return near(x, wf.P[ix[n]][a], 1e-5); }), 'face rest: ' + n);
});

// band visibility: one outfit everywhere shows no bands; a mixed record shows both sides of a mixed cut
var one = KCHAR.blank(outfits, 'styv');
ok(KCHAR.visible(one, outfits).every(function(v){ return v.mesh.indexOf('~') < 0; }), 'one outfit: no bands');
var mix = KCHAR.blank(outfits, 'styv'); mix.slots.legs = 'bronze';
var vis = KCHAR.visible(mix, outfits).map(function(v){ return v.outfit + ':' + v.mesh; });
ok(vis.indexOf('styv:torso~legs') >= 0 && vis.indexOf('bronze:legs~torso') >= 0, 'mixed: both bands at the waist ' + vis);
ok(vis.indexOf('styv:head~torso') < 0, 'mixed: no band at an unmixed cut');

// random is deterministic
ok(JSON.stringify(KCHAR.random(7, sliders, outfits)) === JSON.stringify(KCHAR.random(7, sliders, outfits)), 'random: same seed, same record');

console.log(fails ? fails + ' failed' : 'test-rig: all passed');
process.exit(fails ? 1 : 0);
