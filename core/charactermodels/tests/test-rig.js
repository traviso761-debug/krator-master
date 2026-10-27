// node core/charactermodels/tests/test-rig.js : KCHAR (src/10-rig.js) against data/*.json. Exit 1 on a failure.
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
// the Hykkousoi's strangers all have rib gills (a people's mods); others none
(function(){
  var H = peoples.filter(function(p){ return p.id === 'hykkousoi'; })[0];
  ok(mkit.items.some(function(it){ return it.id === 'mod_gills'; }) ? [1, 2, 3].every(function(k){ return (KCHAR.stranger(k, mkit, H).mods || []).indexOf('mod_gills') >= 0; }) &&
     !KCHAR.stranger(1, mkit, peoples[0]).mods : true, 'mods: Hykkousoi strangers have gills');
})();
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

// crowd: the same seed gives the same crowd, stranger i does not depend on the crowd's size, both bodies appear
(function(){
  var fk = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'mpfb_female', 'kit.json')));
  var kits = { mpfb_male:mkit, mpfb_female:fk }, a = KCHAR.crowd(9, 30, kits, null), b = KCHAR.crowd(9, 12, kits, null);
  ok(JSON.stringify(a.slice(0, 12)) === JSON.stringify(b), 'crowd: a prefix of a bigger crowd is the smaller one');
  ok(a.some(function(r){ return r.body === 'mpfb_male'; }) && a.some(function(r){ return r.body === 'mpfb_female'; }), 'crowd: both bodies');
  ok(a.every(function(r){ return JSON.stringify(KCHAR.stranger(r.seed, kits[r.body], null)) === JSON.stringify(Object.assign({}, r, { seed:undefined })); }),
     'crowd: each record redraws from its seed');
})();

// ---- the arm mods on the normal-size bodies: every design on the man and the woman, four arms, no two-armed top
['mpfb_male', 'mpfb_female'].forEach(function(b){
  var f = path.join(HERE, 'data', b, 'kit.json');
  if(!fs.existsSync(f)) return;
  var k = JSON.parse(fs.readFileSync(f)), arms = k.items.filter(function(it){ return it.slot === 'mods' && it.grants && it.grants.arms === 4; });
  var top = k.items.filter(function(it){ return it.slot === 'torso' && !it.arms; })[0];
  ok(arms.length === 4 && arms.every(function(m){
    var r = KCHAR.blank(k); r.mods = [m.id]; r.armour.torso = top.id;
    return KCHAR.arms(r, k) === 4 && !KCHAR.fits(top, r, k) &&
           KCHAR.parts(r, k).some(function(p){ return p.role === 'mod'; }) && !KCHAR.parts(r, k).some(function(p){ return p.slot === 'torso'; }) &&
           (r.mods = [], KCHAR.parts(r, k).some(function(p){ return p.slot === 'torso'; }));
  }), b + ': four arm mods, each four-armed, a two-armed top left off (' + arms.map(function(m){ return m.id; }) + ')');
});

// ---- a Giant of Dalab (tools/giant.py): the lower pair's joints move with the morphs as the upper do, and the giants'
// strangers come in their two tiers, four-armed temple guards and two-armed patrols ----
if(fs.existsSync(path.join(HERE, 'data', 'mpfb_giant', 'kit.json'))) (function(){
  var gs = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'mpfb_giant', 'skeleton.json')));
  var gk = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'mpfb_giant', 'kit.json')));
  var J = {}; gs.joints.forEach(function(j, i){ J[j.name] = i; });
  ok(['Left2Shoulder', 'Left2Arm', 'Left2ForeArm', 'Left2Hand', 'Right2HandThumb3'].every(function(n){ return J[n] !== undefined; }) &&
     gs.joints[J.Left2Arm].parent === J.Left2Shoulder && gs.joints[J.Left2Shoulder].parent === J.Spine2, 'giant: the lower pair hangs from Spine2');
  ok(gk.scale > 1.5 && gk.anims === 'mpfb_male' && gs.hands.L2 && gs.hands.R2, 'giant: scale, the man\'s clips, lower grips');
  var mods = gk.items.filter(function(it){ return it.slot === 'mods' && !it.test; }).map(function(it){ return it.id; }).sort();
  ok(JSON.stringify(mods) === '["mod_arms_cyber","mod_arms_cyber_up","mod_arms_flesh","mod_arms_loader","mod_arms_loader_up","mod_arms_surgical","mod_arms_surgical_up","mod_gills"]', 'mods: ' + mods);
  var rec = KCHAR.blank(gk), shirt = { id:'x', slot:'torso' }, shirt4 = { id:'y', slot:'torso', arms:4 };
  ok(KCHAR.arms(rec, gk) === 2 && KCHAR.fits(shirt, rec, gk) && !KCHAR.fits(shirt4, rec, gk), 'mods: no mod, two arms, two-armed tops');
  rec.mods = ['mod_arms_flesh', 'mod_arms_cyber', 'mod_gills'];
  ok(KCHAR.arms(rec, gk) === 4 && !KCHAR.fits(shirt, rec, gk) && KCHAR.fits(shirt4, rec, gk) &&
     KCHAR.mods(rec, gk).map(function(m){ return m.id; }).join() === 'mod_arms_flesh,mod_gills', 'mods: one pair of arms at a time; four-armed tops');
  ok(KCHAR.parts(rec, gk).filter(function(p){ return p.role === 'mod'; }).length === 2, 'mods: drawn as parts');
  // a replacement pair hides the arm skin it stands in for, keeps two arms alone, and goes with a lower pair
  var count = function(h){ var n = 0; for(var i = 0; i < h.base.length; i++) n += h.base[i]; return n; };
  var bare = KCHAR.blank(gk), up = KCHAR.blank(gk); up.mods = ['mod_arms_cyber_up'];
  var both = KCHAR.blank(gk); both.mods = ['mod_arms_cyber_up', 'mod_arms_loader'];
  ok(count(KCHAR.hidden(up, gk)) > count(KCHAR.hidden(bare, gk)) + 2000 && KCHAR.arms(up, gk) === 2 &&
     KCHAR.arms(both, gk) === 4 && KCHAR.mods(both, gk).length === 2, 'mods: a replacement pair hides the arm skin, and wears with a lower pair');
  var w = KCHAR.morphWeights({ morph:{ height:1, muscle:1 } }, gk), mj = KCHAR.morphJoints(gs, gk, w);
  ok([0, 1, 2].every(function(a){ return near(mj.d[J.Left2Hand][a], mj.d[J.LeftHand][a], 1e-9); }), 'giant: a lower hand moves with the morphs as the upper does');
  var G = peoples.filter(function(p){ return p.id === 'giants'; })[0], arms = {};
  for(var k = 1; k <= 40; k++){ var r = KCHAR.stranger(k, gk, G); arms[r.tier + KCHAR.arms(r, gk)] = 1; }
  ok(arms.temple4 && arms.patrol2 && Object.keys(arms).length === 2, 'giant: temple guards four-armed, patrols two (' + Object.keys(arms) + ')');
  // every stranger's torso fits its arms; the four-armed giants' tops are four-armed (make_garments.py four_armed)
  var item = {}; gk.items.forEach(function(it){ item[it.id] = it; });
  ok(['giant_free_m_tunic4', 'giant_free_m_jerkin4', 'giant_free_m_chief4', 'giant_dalab_m_harness4'].every(function(id){ return item[id] && item[id].arms === 4; }) &&
     item.giant_free_m_tunic && !item.giant_free_m_tunic.arms, 'giant: four-armed tops say so');
  // a four-armed top's lower sleeves: drawn over flesh arms, left off a cybernetic pair
  var sr = KCHAR.blank(gk); sr.armour.torso = 'giant_free_m_tunic4';
  var sleeves = function(mod){ sr.mods = [mod]; return KCHAR.parts(sr, gk).some(function(p){ return /\.sleeves2$/.test(p.key); }); };
  ok(item.giant_free_m_tunic4.sleeves2 && sleeves('mod_arms_flesh') && !sleeves('mod_arms_loader') && !sleeves('mod_arms_surgical'),
     'giant: lower sleeves over flesh arms, none over cybernetic ones');
  var F = peoples.filter(function(p){ return p.id === 'free_giants'; })[0], seen = {}, fit = true;
  [G, F].forEach(function(P){
    for(var k = 1; k <= 60; k++){
      var r = KCHAR.stranger(k, gk, P), t = r.armour.torso && item[r.armour.torso];
      seen[P.id + '.' + r.tier + (t ? '.' + t.id : '')] = 1;
      if(t && !KCHAR.fits(t, r, gk)) fit = false;
    }
  });
  ok(fit && seen['giants.temple.giant_dalab_m_harness4'] && seen['free_giants.warrior.giant_free_m_jerkin4'] &&
     seen['free_giants.clan.giant_free_m_tunic'] && seen['free_giants.chief.giant_free_m_chief4'], 'giant: strangers wear tops that fit (' + Object.keys(seen).length + ' kinds)');
})();

// ---- the non-human parts (a spike: tools/nonhuman.py, kit items marked test): a tail on joints every skeleton has, an
// animal head that leaves out the human head and what is fitted to it; no people draws them
['mpfb_male', 'mpfb_female', 'mpfb_giant'].forEach(function(b){
  var f = path.join(HERE, 'data', b, 'kit.json');
  if(!fs.existsSync(f)) return;
  var k = JSON.parse(fs.readFileSync(f)), sk = JSON.parse(fs.readFileSync(path.join(HERE, 'data', b, 'skeleton.json')));
  var tl = k.items.filter(function(it){ return it.id === 'mod_tail'; })[0], hd = k.items.filter(function(it){ return it.id === 'mod_head_lizard'; })[0];
  if(!tl && !hd) return;
  var J = {}; sk.joints.forEach(function(j, i){ J[j.name] = i; });
  ok(tl && tl.tail.joints.every(function(n, i){ return J[n] !== undefined && sk.joints[J[n]].parent === (i ? J[tl.tail.joints[i - 1]] : J.Hips); }) &&
     J.Tail1 > J.face_cheek_R, b + ': the tail joints hang from the hips, after every other joint');
  var w = KCHAR.morphWeights({ morph:{ height:1 } }, k), mj = KCHAR.morphJoints(sk, k, w);
  ok(mj.d[J.Tail1][1] > 0.02 && mj.d[J.Tail8][1] > mj.d[J.Tail1][1] * 0.3, b + ': the tail moves and grows with the height');
  var r = KCHAR.blank(k); r.hair = 'short02'; r.armour.head = (k.items.filter(function(it){ return it.slot === 'head'; })[0] || {}).id || null;
  var before = KCHAR.parts(r, k).map(function(p){ return p.slot; });
  r.mods = ['mod_tail', 'mod_head_lizard'];
  var after = KCHAR.parts(r, k).map(function(p){ return p.slot; }), hp = KCHAR.hiddenParts(r, k);
  ok(KCHAR.replacesHead(r, k) && after.indexOf('hair') < 0 && after.indexOf('beard') < 0 && after.indexOf('head') < 0 &&
     after.filter(function(s){ return s === 'mods'; }).length === 2 && hp['Human.lips'] && hp['Human.low-poly'] && !hp['Human.nipple'] &&
     (before.indexOf('head') >= 0 || !r.armour.head), b +': the lizard head leaves out hair, beard, headgear, and the face parts');
  ok(hd.skin_detail && hd.skin_detail.material === 'Mod.head_lizard' && hd.skin_detail.repeat > 5 && hd.skin_detail.repeat < 15,
     b + ': the lizard head draws the body\'s skin in its scales, about the head\'s size');
  var n = 0, h = KCHAR.hidden(r, k).base; for(var i = 0; i < h.length; i++) n += h[i];
  ok(n >= hd.hides, b + ': the lizard head hides the head skin');
  ok(peoples.every(function(P){ for(var s = 1; s <= 20; s++){ var st = KCHAR.stranger(s, k, P); if((st.mods || []).some(function(m){ return m === 'mod_tail' || m === 'mod_head_lizard'; })) return false; } return true; }),
     b + ': no people draws a tail or a lizard head');
});

console.log(fails ? fails + ' failed' : 'test-rig: all passed');
process.exit(fails ? 1 : 0);
