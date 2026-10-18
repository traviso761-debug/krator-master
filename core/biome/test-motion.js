// node core/biome/test-motion.js: the fauna's baked motion (42-core-export.js, BIO.motionBake / BIO.motionAt;
// biomes/GODOT.md, "Motion"), each check with a negative. A small kit moves three BIO.dynamic meshes from its tick, as
// sedesert does: an orbit (no period: a loop), a walker that declares its period, a herd that integrates dt (not a
// function of the clock). The replay must land on the page's own pose at clocks inside the loop's exact window and, for
// the walker, at any clock; the herd must be refused; the page must be where it was after the export.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };

const ctx = { console, Math, THREE, btoa: s => Buffer.from(s, 'binary').toString('base64') };
ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/30-core-foliage.js', 'core/biome/42-core-export.js'])
  vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : ''), ctx, { filename: f });
const BIO = ctx.BIO, errs = [], HOST = [];
const eyes = { pinned: [], free: [] };
BIO.init({ THREE, scene: new THREE.Scene(), seed: 3, err: m => errs.push(m), ticks: fn => HOST.push(fn), eye: () => [0, 0, 0] });
BIO._tickWind();
const geo = () => new THREE.BoxGeometry(1, .5, 2), mat = new THREE.MeshBasicMaterial();
BIO.kit('m');
const N = 6, orbit = BIO.dynamic('bird', geo(), mat, N), walk = BIO.dynamic('deer', geo(), mat, N), herd = BIO.dynamic('herd', geo(), mat, 3);
for (const m of [orbit, walk, herd]) m.userData.kit = 'm';
const per = i => 7 + i * 1.5;   // the walker's periods: its pose repeats exactly
BIO.motion(walk, { period: i => per(i) });
// the walker's gait as a moving per-instance attribute (an anim walker's aP1.x)
const gait = new THREE.InstancedBufferAttribute(new Float32Array(N * 4), 4); walk.geometry.setAttribute('aP1', gait);
const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
const hx = [0, 0, 0];
BIO.tick((dt, t) => {
  (BIO._pinT != null ? eyes.pinned : eyes.free).push(BIO.eye());
  for (let i = 0; i < N; i++) {   // an orbit and a wander, quasi-periodic (no period closes): from the clock it is given
    const a = .4 * t + i, x = 30 * Math.cos(a) + 3 * Math.sin(a * 2.3), z = 20 * Math.sin(a), y = 10 + 2 * Math.sin(t * .37 + i);
    e.set(0, -a, .3 * Math.sin(t * 1.3 + i), 'YXZ'); q.setFromEuler(e); p.set(x, y, z); m4.compose(p, q, s.set(1, 1, 1)); orbit.setMatrixAt(i, m4);
  }
  const tw = BIO.WIND.t.value;   // the walker reads the BIO clock, as sedesert's deer do
  for (let i = 0; i < N; i++) {
    const P = per(i), u = ((tw % P) + P) % P / P, a = u * Math.PI * 2;
    e.set(0, a, 0, 'YXZ'); q.setFromEuler(e); p.set(100 + 5 * Math.cos(a), 0, 5 * Math.sin(a)); m4.compose(p, q, s.set(.8, .8 + .1 * i, .8)); walk.setMatrixAt(i, m4);
    gait.setX(i, Math.sin(a * 3)); gait.setY(i, i);
  }
  for (let i = 0; i < 3; i++) { hx[i] += dt * 2 + .01; m4.makeTranslation(hx[i], 0, i); herd.setMatrixAt(i, m4); }   // integrates: not of the clock
});
// the page's frame: what core/host does (fn(dt, clock.t) for each tick)
let clock = 0;
const frame = dt => { clock += dt; HOST.forEach(f => f(dt, clock)); };
for (let k = 0; k < 30; k++) frame(1 / 30);
const pageAt = (m, i, t) => {   // the page's own pose at clock t, by its own tick
  const keep = clock; clock = t; BIO._pinT = t; BIO.WIND.t.value = t; HOST.forEach(f => f(0, t)); BIO._pinT = null; clock = keep;
  const A = m.instanceMatrix.array, o = i * 16, r = [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14].map(c => A[o + c]);
  return m === walk ? r.concat(Array.from(gait.array.subarray(i * 4, i * 4 + 4))) : r;
};

const before = Float32Array.from(orbit.instanceMatrix.array), beforeW = Float32Array.from(walk.instanceMatrix.array), wind0 = BIO.WIND.t.value;
const out = BIO.exportParts({ kit: 'm' });
const it = n => out.items.find(r => r.name === n);
ok(errs.length === 0, 'no errors: ' + errs.join('; '));
ok(BIO._pinT === null && BIO.WIND.t.value === wind0, 'the clock is handed back (wind ' + BIO.WIND.t.value + ')');
ok(before.every((v, i) => v === orbit.instanceMatrix.array[i]) && beforeW.every((v, i) => v === walk.instanceMatrix.array[i]),
  'the page is where it was after the bake (every matrix identical)');
frame(1 / 30);
ok(eyes.pinned.length > 1000 && eyes.pinned.every(v => v === null) && eyes.free.length && eyes.free.every(v => v !== null),
  'no eye while the clock is pinned (no far-away cull skips an animal), the eye again after (' + eyes.pinned.length + ' pinned ticks)');
const bird = it('bird'), deer = it('deer'), hrd = it('herd');
ok(bird && bird.motion && bird.motion.format === 'krator-motion' && bird.motion.data && bird.motion.data.type === 'Float32Array',
  'a moving item carries its track, typed arrays packed');
ok(hrd && hrd.motion && hrd.motion.error === 'state' && hrd.motion.count === 3, 'a tick that integrates dt is refused: ' + JSON.stringify(hrd && hrd.motion));
ok(deer.motion.channels.join() === 'matrix,aP1' && deer.motion.stride === 16, 'a moving per-instance attribute is a channel: ' + deer.motion.channels);
ok(bird.motion.channels.join() === 'matrix' && bird.motion.stride === 12, 'nothing else is');

// the packed record read back, as an importer reads it
const unpack = r => { const b = Buffer.from(r.b64, 'base64'), C = { Float32Array, Uint32Array }[r.type];
  return new C(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };
const track = m => Object.assign({}, m, { period: unpack(m.period), start: unpack(m.start), frames: unpack(m.frames), data: unpack(m.data) });
const TB = track(bird.motion), TD = track(deer.motion);
ok(TB.t0 === -2 && TB.hz === 10 && TB.loop === 120 && TB.fade === 2, 'the defaults: t0 -2, 10 Hz, a 120 s loop, a 2 s fade');
ok(Array.from(TB.period).every(v => v === 0) && Array.from(TD.period).every((v, j) => Math.abs(v - per(j)) < 1e-5), 'the orbit loops; the walker keeps its periods');
ok(TD.frames[0] === Math.floor(per(0) * 10) + 2 && TB.frames[0] === 1222, 'frames: one period (+2) for the walker, loop + fade (+2) for the orbit');

const dist = (a, b, n) => { let d = 0; for (let q = 0; q < (n || 12); q++) d = Math.max(d, Math.abs(a[q] - b[q])); return d; };
const at = (T, j, t) => Array.from(BIO.motionAt(T, j, t));
// on the grid the replay is the page bit for bit (float32); between frames within the lerp's error
let g = 0, b = 0, w = 0;
for (const t of [0, 3.3, 47.1, 100, 103, 117.9]) for (let j = 0; j < N; j++) {
  const d = dist(at(TB, j, t), pageAt(orbit, j, t)); if (Math.abs(t * 10 - Math.round(t * 10)) < 1e-9) g = Math.max(g, d); else b = Math.max(b, d);
}
for (const t of [0.05, 99.97]) for (let j = 0; j < N; j++) b = Math.max(b, dist(at(TB, j, t), pageAt(orbit, j, t)));
ok(g < 1e-4, 'the loop at grid clocks in its exact window matches the page: worst ' + g.toExponential(2));
ok(b < 0.05, 'and between frames (the lerp): worst ' + b.toFixed(4) + ' m');
for (const t of [0, 5.55, 99.99, 1000.37, 12345.6]) for (let j = 0; j < N; j++) w = Math.max(w, dist(at(TD, j, t), pageAt(walk, j, t), 16));
ok(w < 0.05, 'the walker matches at any clock, 1000 s and 12345 s too: worst ' + w.toFixed(4));
// outside the loop's exact window the orbit is a loop, not the page: honest, and continuous at the seam
let far = 0; for (let j = 0; j < N; j++) far = Math.max(far, dist(at(TB, j, 200), pageAt(orbit, j, 200)));
ok(far > 1, 'negative: past the loop the orbit is not the page (' + far.toFixed(1) + ' m off at 200 s)');
let seam = 0; for (let j = 0; j < N; j++) seam = Math.max(seam, dist(at(TB, j, 117.999), at(TB, j, 118.001)));
ok(seam < 0.05, 'the loop has no jump at its seam (118 s): ' + seam.toFixed(4));
let mid = 0; for (let j = 0; j < N; j++) mid = Math.max(mid, dist(at(TB, j, -1), pageAt(orbit, j, -1)));
ok(mid > 1e-3, 'negative: inside the fade the replay blends (it is not the page at -1 s): ' + mid.toFixed(3));
// a broken frame is caught by the same comparison
const bad = Object.assign({}, TD, { data: Float32Array.from(TD.data) }); bad.data[(TD.start[2] + 50) * 16 + 9] += 1;   // frame 50: clock 3 s (t0 -2, 10 Hz)
ok(dist(at(bad, 2, 3), pageAt(walk, 2, 3), 16) > .5, 'negative: a frame moved by 1 m is seen');
// opt.motion: false leaves the tracks out; overrides reach the record
ok(!BIO.exportParts({ kit: 'm', motion: false }).items.some(r => r.motion), 'opt.motion:false bakes nothing');
const o2 = BIO.exportParts({ kit: 'm', motion: { hz: 5, loop: 30, t0: 10 } }).items.find(r => r.name === 'bird').motion;
ok(o2.hz === 5 && o2.loop === 30 && o2.t0 === 8, 'overrides: hz, loop, t0 (' + [o2.hz, o2.loop, o2.t0] + ')');
// a mesh's own rate: the grid runs at the largest, a slower mesh keeps every n-th frame, and still lands on the page
BIO.motion(walk, { hz: 30 }); BIO.motion(orbit, { hz: 5 });
const o3 = BIO.exportParts({ kit: 'm' }).items, T3 = track(o3.find(r => r.name === 'bird').motion), T4 = track(o3.find(r => r.name === 'deer').motion);
let r3 = 0; for (const t of [10, 50.2, 117.6]) for (let j = 0; j < N; j++) r3 = Math.max(r3, dist(at(T3, j, t), pageAt(orbit, j, t)));
let r4 = 0; for (const t of [10.0333, 500.1]) for (let j = 0; j < N; j++) r4 = Math.max(r4, dist(at(T4, j, t), pageAt(walk, j, t), 16));
ok(T3.hz === 5 && T4.hz === 30 && T3.frames[0] === 612 && r3 < 1e-4 && r4 < 0.05, 'rates per mesh (5 and 30 Hz on a 30 Hz grid): ' + r3.toExponential(1) + ', ' + r4.toFixed(4));
console.log(fails ? fails + ' FAILED' : 'all passed');
process.exit(fails ? 1 : 0);
