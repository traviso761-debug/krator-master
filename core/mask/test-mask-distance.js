// core/mask's distance transform (27-core-mask-distance.js): exact against a brute-force scan, each rule with a negative,
// and a fixed region's hash, which kmask.gd's KMask.distance must give in Godot (golden-distance.json).
//   node core/mask/test-mask-distance.js           'all passed'
//   node core/mask/test-mask-distance.js --write   rewrite golden-distance.json after a meant change
'use strict';
const fs = require('fs'), path = require('path');
const K = require('./25-core-mask.js');
require('./27-core-mask-distance.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const throws = f => { try { f(); return false; } catch (e) { return true; } };

// the brute force: every outside pixel against every inside pixel
function brute(w, h, inside){
  const P = [], out = new Int32Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (inside(i, j)) P.push([i, j]);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let b = Infinity; for (const p of P) { const dx = i - p[0], dy = j - p[1], q = dx * dx + dy * dy; if (q < b) b = q; }
    out[j * w + i] = P.length ? b : -1; }
  return out;
}
const same = (a, b) => a.length === b.length && a.every((v, k) => v === b[k]);

// ---- one pixel: the squared distances are i^2 + j^2
let F = K.distance({ width: 5, height: 4, data: Uint8Array.from({ length: 20 }, (_, k) => k === 0 ? 255 : 0) });
ok(F.d2[0] === 0 && F.d2[4] === 16 && F.d2[3 * 5 + 4] === 25 && F.at(4, 3) === 5, 'one inside pixel: d2 = di^2 + dj^2, at() is its root');

// ---- random masks of every shape class against the brute force (a fixed LCG: the test is repeatable)
let seed = 12345; const rnd = () => (seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 4294967296;
let allSame = true, cases = 0;
for (const [w, h, p] of [[1, 1, .5], [1, 9, .2], [9, 1, .2], [17, 13, .02], [32, 32, .005], [40, 7, .3], [23, 29, .0], [8, 8, 1]]) {
  for (let rep = 0; rep < 6; rep++) {
    const m = Uint8Array.from({ length: w * h }, () => rnd() < p ? 255 : 0);
    if (p === 0 && rep === 0) m[w * h - 1] = 255;   // one inside pixel in a corner
    const D = K.distance({ width: w, height: h, data: m }), B = brute(w, h, (i, j) => m[j * w + i] >= 128);
    cases++; if (!same(D.d2, B)) { allSame = false; console.log('  differs: ' + w + 'x' + h + ' p ' + p + ' rep ' + rep); }
  }
}
ok(allSame, 'exact against the brute force on ' + cases + ' random masks (thin, square, sparse, dense, full, one corner pixel)');

// ---- a painted polygon on a KMASK canvas reads the canvas (channel 0 by default; opt.channel, opt.threshold)
const cv = K.canvas(64, 48), g = cv.getContext('2d');
g.fillStyle = '#000'; g.fillRect(0, 0, 64, 48);
g.fillStyle = 'rgb(255,0,0)'; g.beginPath(); g.moveTo(10, 8); g.lineTo(30, 12); g.lineTo(22, 34); g.lineTo(6, 26); g.closePath(); g.fill();
g.fillStyle = 'rgb(0,200,0)'; g.beginPath(); g.arc(50, 30, 6, 0, 7); g.fill();
const inR = (i, j) => cv.data[(j * 64 + i) * 4] >= 128;
F = K.distance(cv);
ok(same(F.d2, brute(64, 48, inR)), 'a KMASK canvas: the red polygon (channel 0, >= 128) against the brute force');
const G = K.distance(cv, { channel: 1 });
ok(G.d2[(30 * 64) + 50] === 0 && G.d2[(20 * 64) + 15] > 0 && F.d2[(20 * 64) + 15] === 0, 'opt.channel picks the green disc, not the polygon');
const H = K.distance(cv, { channel: 1, threshold: 201 });
ok(H.empty && H.at(0, 0) === Infinity && H.sample(3, 3) === Infinity && H.d2[0] === -1, 'negative: a threshold nothing passes is empty (Infinity, d2 -1)');
const I = K.distance({ width: 64, height: 48 }, { inside: inR });
ok(same(I.d2, F.d2), 'opt.inside gives the same field as the bytes');

// ---- sample(): bilinear between pixel centres, clamped at the edge
const S = K.distance({ width: 3, height: 1, data: Uint8Array.from([255, 0, 0]) });
ok(S.sample(0.5, 0.5) === 0 && S.sample(1.5, 0.5) === 1 && S.sample(1, 0.5) === 0.5 && S.sample(2.5, 0.5) === 2 && S.sample(9, -4) === 2,
  'sample: 0 at the inside centre, 1 a pixel on, linear between, clamped past the edge');
ok(S.at(-1, 0) === Infinity && S.at(3, 0) === Infinity, 'negative: at() off the grid is Infinity');

// ---- negatives: what it will not read
ok(throws(() => K.distance({ width: 4, height: 4, data: new Uint8Array(15) })) && throws(() => K.distance({ width: 0, height: 4, data: [] }))
  && throws(() => K.distance({ width: 2, height: 2 })), 'negatives: a data length of neither 1 nor 4 bytes a pixel, no size, no data throw');

// ---- the golden: a city-sized region with holes, the ops kmask.gd replays and the hash its KMask.distance must give
const W = 160, Hh = 120, gc = K.canvas(W, Hh), gx = gc.getContext('2d');
gx.fillStyle = '#000'; gx.fillRect(0, 0, W, Hh);
gx.fillStyle = '#fff'; gx.beginPath(); gx.moveTo(20, 10); gx.lineTo(90, 18); gx.lineTo(70, 60); gx.lineTo(100, 100); gx.lineTo(15, 90); gx.closePath();
gx.moveTo(40, 40); gx.lineTo(40, 60); gx.lineTo(55, 60); gx.lineTo(55, 40); gx.closePath(); gx.fill();   // a hole (wound the other way)
gx.beginPath(); gx.arc(135, 30, 9.5, 0, 7); gx.fill();
gx.lineWidth = 3; gx.strokeStyle = '#fff'; gx.beginPath(); gx.moveTo(110, 110); gx.lineTo(150, 70); gx.stroke();
// each sample as [x, y, value, the value's IEEE 754 bytes in hex]: Godot's JSON reads a double to within an ulp, not exactly,
// so kmask_distance_test.gd compares the bytes (the points are dyadic, which it reads exactly)
const bits = v => Buffer.from(new Float64Array([v]).buffer).toString('hex');
const GF = K.distance(gc), samples = [[0, 0], [37.25, 51.5], [120.75, 9.125], [159.875, 119.875], [80, 64.3125]].map(p => { const v = GF.sample(p[0], p[1]); return [p[0], p[1], v, bits(v)]; });
ok(same(GF.d2, brute(W, Hh, (i, j) => gc.data[(j * W + i) * 4] >= 128)), 'the golden region against the brute force');
const golden = { width: W, height: Hh, mask_hash: K.hash(gc), hash: K.distanceHash(GF), max_d2: Math.max.apply(null, GF.d2), samples: samples, ops: K.ops(gc) };
const gp = path.join(__dirname, 'golden-distance.json');
if (process.argv.includes('--write')) { fs.writeFileSync(gp, JSON.stringify(golden, null, 1) + '\n'); console.log('wrote ' + gp); }
else {
  const old = JSON.parse(fs.readFileSync(gp, 'utf8'));
  ok(old.hash === golden.hash && old.mask_hash === golden.mask_hash && JSON.stringify(old.samples) === JSON.stringify(samples),
    'the golden region gives golden-distance.json (' + golden.hash + ')');
}
console.log(fails ? fails + ' FAILED' : 'all passed');
process.exit(fails ? 1 : 0);
