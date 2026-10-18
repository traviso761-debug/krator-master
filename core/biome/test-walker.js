// node core/biome/test-walker.js: the walkers (36-core-walker.js), a pose that is a function of the clock, each check
// with a negative. A walker's pose repeats every W.P seconds (so the export's motion bake keeps one period and a port
// replays it for ever); its gait phase runs on without a jump inside the period and closes on a whole number of turns;
// it stands still at its stops; BIO.walkLoop lays out a closed loop whose vertices and legs all pass the kit's test.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };

const ctx = { console, Math, THREE };
ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['core/rand/08-core-rand.js', 'core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/36-core-walker.js'])
  vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : ''), ctx, { filename: f });
const BIO = ctx.BIO, KRAND = ctx.KRAND;
BIO.init({ THREE, scene: new THREE.Scene(), seed: 3, terrainH: (x, z) => .05 * x + 2 * Math.sin(z * .03), ticks: () => {} });
const TAU = Math.PI * 2, near = (a, b, e) => Math.abs(a - b) <= (e == null ? 1e-6 : e) * (1 + Math.abs(b));
const turns = d => { const k = d / TAU; return Math.abs(k - Math.round(k)); };

// a square loop with two stops, a follower behind
const pts = [[0, 0], [40, 0], [40, 30], [0, 30]], stops = [{ i: 1, d: 6 }, { i: 3, d: 4 }];
const W = BIO.walker(pts, stops, 1.5, 1, 17, .8);
ok(W.P > 0 && near(W.L, 140), 'a walker: loop ' + W.L.toFixed(1) + ' m, period ' + W.P.toFixed(2) + ' s');
// 1. the period: the pose at t and t + k P is the same, at clocks on and off any grid
let worst = 0, gaitT = 1;
for (let t = -300; t < 900; t += 1.37) for (const k of [1, 3, -2]) {
  const a = BIO.walkAt(W, t, 0, 1), b = BIO.walkAt(W, t + k * W.P, 0, 1);
  worst = Math.max(worst, Math.hypot(a.x - b.x, a.z - b.z), Math.abs(a.y - b.y), Math.abs(a.hd - b.hd)); gaitT = Math.min(gaitT, turns(b.ph - a.ph) < 1e-6 ? 1 : 0);
}
ok(worst < 1e-6 && gaitT === 1, 'its pose repeats every W.P (worst ' + worst.toExponential(1) + '), the gait a whole number of turns on');
const half = BIO.walkAt(W, 5 + W.P / 2, 0, 1), here = BIO.walkAt(W, 5, 0, 1);
ok(Math.hypot(half.x - here.x, half.z - here.z) > 5, 'negative: half a period on it is elsewhere');
// 2. the gait phase: continuous inside a period (no jump as the walker passes vertex 0 or enters a stop), and over the
// whole period it turns a whole number of times (so the wrap is no jump in its sine)
let jump = 0, back = 0; const dt = .02;
for (let t = 0; t < W.P - dt; t += dt) {
  const r0 = (t - W.off) , a = BIO.walkAt(W, r0, 0, 1), b = BIO.walkAt(W, r0 + dt, 0, 1);
  jump = Math.max(jump, b.ph - a.ph); back = Math.min(back, b.ph - a.ph);
}
const vmax = Math.PI * W.v / W.hs * dt * 1.01;
ok(jump <= vmax && back >= -1e-9, 'the gait runs on without a jump inside the period (largest step ' + jump.toFixed(4) + ' <= ' + vmax.toFixed(4) + ')');
const p0 = BIO.walkAt(W, -W.off, 0, 1), p1 = BIO.walkAt(W, -W.off + W.P - 1e-7, 0, 1);
ok(turns(p1.ph - p0.ph) < 1e-3 && p1.ph - p0.ph > 1, 'over a period it turns ' + ((p1.ph - p0.ph) / TAU).toFixed(3) + ' times (a whole number)');
// sedesert's walkAt took the phase from the place on the loop: entering a stop past vertex 0 it jumped by L pi / hs
const sOnly = Math.PI * BIO.walkAt(W, -W.off + W.P * .99, 0, 1).s / W.hs, dOnly = BIO.walkAt(W, -W.off + W.P * .99, 0, 1).ph;
ok(Math.abs(sOnly - dOnly) > 1, 'negative: the phase from the place alone is not the distance walked (' + sOnly.toFixed(1) + ' vs ' + dOnly.toFixed(1) + ')');
// 3. stops: at a stop it stands (vf 0, its place fixed); between stops it moves
const st = BIO.walkAt(W, -W.off + 1, 0, 1), st2 = BIO.walkAt(W, -W.off + 4, 0, 1), mv = BIO.walkAt(W, -W.off + 6 + 5, 0, 1);
ok(st.stop && st2.stop && st.x === st2.x && st.z === st2.z && st.vf === 0 && near(st.x, 40) && near(st.z, 0), 'at a stop it stands at its vertex (40, 0)');
ok(!mv.stop && mv.vf > 0, 'negative: between stops it walks (vf ' + mv.vf.toFixed(2) + ')');
// a follower: the same path, metres behind, moves and stops with its leader
const fl = BIO.walkAt(W, -W.off + 6 + 10, 5, 1), ld = BIO.walkAt(W, -W.off + 6 + 10, 0, 1);
ok(near(ld.s - fl.s, 5, 1e-9), 'a follower walks 5 m behind on the path');
// 4. the ground: y is the terrain under the path (sampled about every metre at build)
let gy = 0; for (let t = 0; t < W.P; t += .7) { const o = BIO.walkAt(W, t, 0, 1); gy = Math.max(gy, Math.abs(o.y - BIO.terrainH(o.x, o.z))); }
ok(gy < .02, 'y follows the ground under the path (worst ' + gy.toFixed(4) + ' m)');
// 5. walkLoop: a closed loop round a centre whose vertices and sampled legs all pass ok; the same seed, the same loop
const hole = (x, z) => Math.hypot(x - 10, z) > 12;   // a pond east of the centre
const L1 = BIO.walkLoop(0, 0, 40, hole, KRAND.stream(7).next), L2 = BIO.walkLoop(0, 0, 40, hole, KRAND.stream(7).next);
let allOk = !!L1; if (L1) for (let i = 0; i < L1.length; i++) { const a = L1[i], b = L1[(i + 1) % L1.length]; for (let k = 0; k <= 20; k++) { const u = k / 20; if (!hole(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)) allOk = false; } }
ok(allOk && L1.length >= 3, 'walkLoop: ' + (L1 ? L1.length : 0) + ' vertices, every vertex and leg clear of the pond');
ok(JSON.stringify(L1) === JSON.stringify(L2), 'walkLoop: the same seed lays out the same loop');
ok(BIO.walkLoop(0, 0, 40, () => false, KRAND.stream(7).next) === null, 'negative: nowhere allowed, no loop (null)');
ok(JSON.stringify(BIO.walkLoop(0, 0, 40, hole, KRAND.stream(8).next)) !== JSON.stringify(L1), 'negative: another seed, another loop');
console.log(fails ? fails + ' FAILED' : 'all passed');
process.exit(fails ? 1 : 0);
