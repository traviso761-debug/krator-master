// node kits/characters/tests/test-rig.js : KCHAR (src/10-rig.js) against data/*.json. Exit 1 on a failure.
var path = require('path'), fs = require('fs');
var HERE = path.join(__dirname, '..');
require(path.join(HERE, '..', '..', 'core', 'rand', '08-core-rand.js')); global.KRAND = globalThis.KRAND;
var KCHAR = require(path.join(HERE, 'src', '10-rig.js'));
var skel = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'male', 'skeleton.json')));
var sliders = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'sliders.json')));
var kit = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'male', 'kit.json')));
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
var faceNames = kit.face_joints;
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
var h0 = kit.heads[0], pf = KCHAR.pose(skel, sliders, {}, h0.face), wf = KCHAR.fk(skel, pf.t);
faceNames.forEach(function(n){
  ok(h0.face[n].every(function(x, a){ return near(x, wf.P[ix[n]][a], 1e-5); }), 'face rest: ' + n);
});

// parts: a blank record is the base body and its head; hair only on a bald head; armour adds its slot
var blank = KCHAR.blank(kit), bp = KCHAR.parts(blank, kit);
ok(bp.length === kit.regions.length + 1 && bp.filter(function(p){ return p.role === 'head'; }).length === 1, 'blank: base regions and a head ' + bp.length);
var hairy = kit.heads.filter(function(h){ return h.style === 'hair'; })[0], bald = kit.heads.filter(function(h){ return h.style === 'base'; })[0];
var withHair = KCHAR.blank(kit); withHair.hair = kit.hair.filter(function(h){ return h.head === bald.id && h.kind === 'hair'; })[0].id;
ok(KCHAR.parts(withHair, kit).some(function(p){ return p.role === 'hair'; }), 'hair on the base head');
withHair.head = hairy.id;
ok(!KCHAR.parts(withHair, kit).some(function(p){ return p.role === 'hair'; }), 'no hair on a head that has its own');
var dressed = KCHAR.blank(kit); dressed.armour = { torso:kit.armour[0].id, legs:kit.armour[1].id, feet:null };
var dp = KCHAR.parts(dressed, kit);
ok(dp.filter(function(p){ return p.role === 'armour'; }).length === 2, 'two armour slots worn');

// hidden: nothing without armour; a torso piece hides some torso skin and no feet
var none = KCHAR.hidden(blank, kit);
ok(Object.keys(none).every(function(r){ return Array.prototype.every.call(none[r], function(x){ return x === 0; }); }), 'no armour, nothing hidden');
var hid = KCHAR.hidden(dressed, kit), sum = function(a){ var n = 0; for(var i=0;i<a.length;i++) n += a[i]; return n; };
ok(sum(hid.torso) > 0.3 * kit.base_tris.torso, 'torso armour hides torso skin: ' + sum(hid.torso) + ' of ' + kit.base_tris.torso);
var top = KCHAR.blank(kit); top.armour = { torso:kit.armour[0].id };
ok(sum(KCHAR.hidden(top, kit).feet) === 0, 'torso armour hides no foot');

// random is deterministic and only names what the kit has
var r1 = KCHAR.random(7, sliders, kit);
ok(JSON.stringify(r1) === JSON.stringify(KCHAR.random(7, sliders, kit)), 'random: same seed, same record');
ok(kit.heads.some(function(h){ return h.id === r1.head; }), 'random: a real head');

// ---- a MakeHuman body (data/mpfb_male): morph weights, morphed joints, strangers by people ----
var mskel = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'mpfb_male', 'skeleton.json')));
var mkit = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'mpfb_male', 'kit.json')));
var peoples = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'peoples.json'))).peoples;
var M = mkit.morph, mb = KCHAR.blank(mkit);
var w0 = KCHAR.morphWeights(mb, mkit);
ok(Array.prototype.every.call(w0, function(x){ return x === 0; }), 'morph: a blank record weighs nothing');
var age = M.morphs.filter(function(s){ return s.id === 'age'; })[0];
var wa = KCHAR.morphWeights({ morph:{ age:-0.5 } }, mkit);
ok(near(wa[age.minus], 0.5) && wa[age.plus] === 0, 'morph: age -0.5 weighs its minus end by 0.5');
var ht = M.morphs.filter(function(s){ return s.id === 'height'; })[0];
ok(near(KCHAR.morphWeights({ morph:{ height:1 } }, mkit)[ht.plus], ht.reach || 1), 'morph: height +1 weighs by its reach');
var wb = KCHAR.morphWeights({ ancestry:{ african:M.ancestry.base[0], asian:M.ancestry.base[1], caucasian:M.ancestry.base[2] } }, mkit);
ok(Array.prototype.every.call(wb, function(x){ return near(x, 0, 1e-6); }), 'morph: the base ancestry weighs nothing');
var mj0 = KCHAR.morphJoints(mskel, mkit, w0);
ok(mj0.t.every(function(t, i){ return t.every(function(x, a){ return near(x, mskel.joints[i].t[a], 1e-9); }); }), 'morph: no weights, bind offsets');
// a morphed joint's world rest is its bind world rest plus its delta
var wt = KCHAR.morphWeights({ morph:{ height:1, weight:-1 }, ancestry:{ african:1, asian:0, caucasian:0 } }, mkit);
var mj = KCHAR.morphJoints(mskel, mkit, wt), fb = KCHAR.fk(mskel, mskel.joints.map(function(j){ return j.t; })), fm = KCHAR.fk(mskel, mj.t);
ok(mskel.joints.every(function(j, i){ return [0, 1, 2].every(function(a){ return near(fm.P[i][a], fb.P[i][a] + mj.d[i][a], 1e-6); }); }), 'morph: world rest = bind + delta');
ok(mj.d.some(function(d){ return Math.abs(d[1]) > 0.02; }), 'morph: height +1 moves joints');
// strangers: deterministic, within their people's ranges
var P0 = peoples[0], s1 = KCHAR.stranger(9, mkit, P0);
ok(JSON.stringify(s1) === JSON.stringify(KCHAR.stranger(9, mkit, P0)), 'stranger: same seed, same record');
ok(s1.people === P0.id && /^#[0-9a-f]{6}$/.test(s1.skin) && /^#[0-9a-f]{6}$/.test(s1.hair_color), 'stranger: people, skin and hair colour');
peoples.forEach(function(P){
  for(var k=1;k<=10;k++){
    var r = KCHAR.stranger(k * 13, mkit, P);
    ['african', 'asian', 'caucasian'].forEach(function(a){ ok(r.ancestry[a] >= P.ancestry[a][0] - 0.006 && r.ancestry[a] <= P.ancestry[a][1] + 0.006, P.id + ' ' + a + ' ' + r.ancestry[a]); });
    Object.keys(P.morph || {}).forEach(function(m){ var v = r.morph[m] || 0; ok(v >= P.morph[m][0] - 0.006 && v <= P.morph[m][1] + 0.006, P.id + ' ' + m + ' ' + v); });
    ok(!r.hair || mkit.items.some(function(it){ return it.id === r.hair && it.slot === 'hair'; }), P.id + ': a real hair');
  }
});

console.log(fails ? fails + ' failed' : 'test-rig: all passed');
process.exit(fails ? 1 : 0);
