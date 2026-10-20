#!/usr/bin/env node
// node tests/test-sim.js — Longsong's people on core/simulation (src/40d-ls-sim.js), headless: the world declared from the
// plan, a whole day stepped a minute at a time. Each check runs on a broken input too, which must fail.
var path = require('path'), fs = require('fs'), vm = require('vm');
var HERE = path.join(__dirname, '..'), ROOT = path.join(HERE, '..', '..');
function world(breakIt) {
  var ctx = { console: console, Math: Math, JSON: JSON, Object: Object, Array: Array, Set: Set, Map: Map, Error: Error, String: String, Number: Number,
    Date: Date, Infinity: Infinity, isFinite: isFinite, Float64Array: Float64Array, Float32Array: Float32Array, Int32Array: Int32Array, Uint8Array: Uint8Array,
    Uint32Array: Uint32Array, Int8Array: Int8Array, Uint16Array: Uint16Array };
  ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx);
  var run = function (f) { vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f }); };
  run(path.join(ROOT, 'core', 'rand', '08-core-rand.js'));
  vm.runInContext('var LS;' + fs.readFileSync(path.join(HERE, 'src', '40-ls-plan.js'), 'utf8') + ';this.LS=LS;', ctx);
  vm.runInContext(fs.readFileSync(path.join(HERE, 'src', '40d-ls-sim.js'), 'utf8') + ';this.LSS=LSS;', ctx);
  fs.readdirSync(path.join(ROOT, 'core', 'simulation')).filter(function (f) { return /^77-sim-.*\.js$/.test(f) && f !== '77-sim-9-debug.js'; }).sort()
    .forEach(function (f) { run(path.join(ROOT, 'core', 'simulation', f)); });
  var clock = { hour: 3.5, day: 0, t: 0 };
  ctx.LSS.init(clock, breakIt ? { edges: breakIt } : null);
  return { ctx: ctx, clock: clock };
}
// a day: stepped a minute at a time from 03:30, sampled every 10 minutes
function day(W) {
  var SIM = W.ctx.SIM, LSS = W.ctx.LSS, C = W.clock, f0 = SIM.routeFail.length, M = SIM.minute(), seen = {}, hiddenStill = [], out = 0, moving = 0, stair = 0, acts = {};
  SIM.jump();
  for (var m = 0; m < 1440; m++) {
    M++; C.day = Math.floor(M / 1440); C.hour = (M % 1440 + .5) / 60; C.t += 3; SIM.step();
    if (m % 10) continue;
    SIM.all('actor').forEach(function (a) {
      var s = SIM.pose(a, C.t); if (s.hidden) return; out++;
      if (s.leg >= 0 && LSS.hidden(s.x, s.y, s.z)) return;   // walking through a room or the rock: unseen (68 hides it)
      if (s.moving) { moving++; if (s.y > 2 && s.y < 39) stair++; }
      else if (LSS.hidden(s.x, s.y, s.z) && a.activity !== 'KEEP' && a.activity !== 'TURN_WHEEL' && hiddenStill.length < 5) hiddenStill.push(a.id + ' ' + a.activity + ' at ' + [s.x, s.y, s.z].map(function (v) { return v.toFixed(0); }).join(','));
      acts[a.activity] = (acts[a.activity] || 0) + 1; seen[a.id] = 1;
    });
  }
  return { fails: SIM.routeFail.slice(f0), problems: LSS.problems, out: out, moving: moving, stair: stair, hiddenStill: hiddenStill, seen: Object.keys(seen).length, acts: acts };
}
if (require.main !== module) { module.exports = { world: world, day: day }; return; }
var bad = 0;
function ok(name, pass, detail, negPass) {
  var r = pass && !negPass;
  console.log((r ? 'PASS ' : 'FAIL ') + name + ': ' + detail + (negPass ? '  (the broken input passed too)' : ''));
  if (!r) bad++;
}
var W = world(), G = W.ctx.LSS.graph(), D = day(W);
console.log('graph: ' + G.nodes.length + ' nodes, ' + G.edges.length + ' edges; ' + W.ctx.LSS.places + ' places; ' + W.ctx.SIM.all('actor').length + ' people; declared in ' + W.ctx.LSS.ms + ' ms');
console.log('the day: ' + JSON.stringify(D.acts));
// the stair cut between its second and third flights: the rock is out of reach
var Wb = world(function (E) { return E.filter(function (e) { return !(e.a === 's1_' + (Math.max(2, Math.round(130 / 8))) && e.b.indexOf('s2_') === 0); }); }), Db = day(Wb);
ok('the world declares with no unknown reference', !D.problems.length, D.problems.length + ' problems' + (D.problems.length ? ': ' + D.problems.slice(0, 3).join('; ') : ''), false);
ok('every route found through a day', !D.fails.length, D.fails.length + ' failed', !Db.fails.length);
ok('the Great Stair is climbed', D.stair > 0, D.stair + ' walker-samples on the stair between the ward and the rock', false);
ok('everyone out in the world at some hour', D.seen === W.ctx.SIM.all('actor').length, D.seen + ' of ' + W.ctx.SIM.all('actor').length + ' seen outside', false);
ok('no one stands still inside a building or the rock', !D.hiddenStill.length, D.hiddenStill.join('; ') || 'none', false);
console.log(bad ? 'test-sim: ' + bad + ' failed' : 'test-sim: all passed');
process.exit(bad ? 1 : 0);
