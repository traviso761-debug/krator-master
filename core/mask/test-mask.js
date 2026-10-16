// core/mask's node test: a fixed set of strokes gives the same grid, and each rule has its check.
//   node core/mask/test-mask.js           'all passed'
//   node core/mask/test-mask.js --write   rewrite golden.json (the ops and their hash, which kmask.gd replays in Godot)
'use strict';
const fs = require('fs'), path = require('path');
const K = require('./25-core-mask.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const throws = f => { try { f(); return false; } catch (e) { return true; } };
const px = (cv, i, j) => Array.from(cv.data.slice((j * cv.width + i) * 4, (j * cv.width + i) * 4 + 4));

// ---- the rules, on small canvases ----
let cv = K.canvas(8, 8), g = cv.getContext('2d');
g.fillStyle = '#fff'; g.fillRect(0, 0, 8, 8);
ok(px(cv, 0, 0).join() === '255,255,255,255' && px(cv, 7, 7).join() === '255,255,255,255', 'fillRect covers the whole grid');
g.beginPath(); g.arc(4, 4, 1.5, 0, 7); g.fillStyle = '#000'; g.fill();
// centres at distance: (3.5,3.5) .707 in; (2.5,3.5) 1.58 out; (4.5,5.5) 1.58 out
ok(px(cv, 3, 3)[0] === 0 && px(cv, 4, 4)[0] === 0 && px(cv, 2, 3)[0] === 255 && px(cv, 4, 5)[0] === 255, 'a disc paints the pixels whose centres are within r, hard-edged');
cv = K.canvas(10, 10); g = cv.getContext('2d');
g.lineWidth = 2; g.strokeStyle = 'rgb(3,3,3)'; g.beginPath(); g.moveTo(1, 5); g.lineTo(9, 5); g.stroke();
ok(px(cv, 1, 4)[0] === 3 && px(cv, 1, 5)[0] === 3 && px(cv, 1, 3)[0] === 0 && px(cv, 1, 6)[0] === 0, 'a stroke paints centres within lineWidth / 2 of the line');
ok(px(cv, 0, 4)[0] === 3 && px(cv, 9, 4)[0] === 3 && px(cv, 9, 5)[0] === 3, 'round caps reach past the ends');
cv = K.canvas(10, 10); g = cv.getContext('2d');
g.fillStyle = '#00ff00'; g.beginPath(); g.moveTo(1, 1); g.lineTo(9, 1); g.lineTo(9, 9); g.lineTo(1, 9); g.closePath();
g.moveTo(3, 3); g.lineTo(3, 7); g.lineTo(7, 7); g.lineTo(7, 3); g.closePath(); g.fill();   // the inner square winds the other way
ok(px(cv, 1, 1).join() === '0,255,0,255' && px(cv, 4, 4)[3] === 0 && px(cv, 0, 0)[3] === 0, 'polygons: nonzero winding (a reversed inner ring is a hole)');
cv = K.canvas(10, 10); g = cv.getContext('2d');
g.lineWidth = 2; g.strokeStyle = '#fff'; g.beginPath(); g.arc(5, 5, 3, 0, 7); g.stroke();
ok(px(cv, 5, 5)[3] === 0 && px(cv, 8, 5)[0] === 255 && px(cv, 1, 5)[0] === 255, 'a stroked circle is a ring');
cv = K.canvas(4, 4); g = cv.getContext('2d');
g.fillStyle = 'rgb(100,100,100)'; g.fillRect(0, 0, 4, 4); g.fillStyle = 'rgba(200,0,0,0.5)'; g.fillRect(0, 0, 2, 2);
ok(px(cv, 0, 0).join() === '150,50,50,255' && px(cv, 3, 3).join() === '100,100,100,255', 'a translucent colour blends, rounded');
g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.beginPath(); g.moveTo(0, 3); g.lineTo(2, 3); g.lineTo(2, 1); g.stroke();
ok(px(cv, 2, 2)[0] === 50, 'a stroke paints a pixel once where its segments overlap (a blend is not doubled)');
ok(throws(() => g.arc(1, 1, 1, 0, 3)) && throws(() => (g.fillStyle = 'hsl(1,2%,3%)', g.fillRect(0, 0, 1, 1))) && throws(() => g.getImageData(0, 0, 2, 2)),
  'negatives: a partial arc, an unreadable colour and a partial read throw');
const img = g.getImageData(0, 0, 4, 4); img.data[0] = 7;
ok(cv.data[0] !== 7, 'getImageData is a copy');
const im2 = g.createImageData(4, 4); im2.data.fill(9); g.putImageData(im2, 0, 0);
ok(cv.data[5] === 9 && K.ops(cv).slice(-1)[0][0] === 'put', 'putImageData replaces the grid and is recorded');

// ---- a fixed city-like scene: the digest Godot reproduces ----
function scene(){
  const cv = K.canvas(256, 256), m = cv.getContext('2d'), S = 256 / 600, P = v => (v + 300) * S;
  m.fillStyle = '#fff'; m.fillRect(0, 0, 256, 256);
  const ring = []; for (let i = 0; i <= 24; i++) { const t = i / 24 * 6.283185307179586; ring.push([P(250 * Math.cos(t)), P(250 * Math.sin(t))]); }
  m.lineWidth = 30 * S; m.strokeStyle = '#000'; m.lineCap = 'round'; m.lineJoin = 'round';
  m.beginPath(); ring.forEach((p, i) => i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1])); m.stroke();
  const roads = [[[-280, 0], [-40, 10], [0, 0], [120, -60], [280, -30]], [[0, -280], [5, 0], [-10, 280]], [[-200, -200], [210, 190]]];
  roads.forEach((r, k) => { m.lineWidth = Math.max(1, (8 + 4 * k) * S); m.strokeStyle = 'rgb(' + (3 + k) + ',' + (3 + k) + ',' + (3 + k) + ')';
    m.beginPath(); r.forEach((p, i) => i ? m.lineTo(P(p[0]), P(p[1])) : m.moveTo(P(p[0]), P(p[1]))); m.stroke(); });
  m.beginPath(); m.arc(P(60), P(80), 40 * S, 0, 7); m.fillStyle = '#00ff00'; m.fill();
  m.beginPath(); m.arc(P(-90), P(120), 30 * S, 0, 7); m.lineWidth = 6 * S; m.strokeStyle = 'rgb(11,11,11)'; m.stroke();
  for (let b = 0; b < 40; b++) { const x = -250 + (b * 37) % 500, z = -240 + (b * 53) % 480, a = b * 0.7, hx = 6 + b % 5, hz = 4 + b % 3;
    const c = Math.cos(a), s = Math.sin(a), q = [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]].map(([u, v]) => [P(x + u * c - v * s), P(z + u * s + v * c)]);
    m.beginPath(); q.forEach((p, i) => i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1])); m.closePath(); m.fillStyle = b % 7 ? '#000' : 'rgba(10,10,10,0.5)'; m.fill(); }
  m.fillStyle = 'rgb(12,12,12)'; m.fillRect(P(200), P(200), 30 * S, 22 * S);
  return cv;
}
const A = scene(), B = scene();
ok(K.hash(A) === K.hash(B), 'the same strokes give the same grid, every time (' + K.hash(A) + ')');
const HASH = 'c068c90d';   // 2026-10-05: the first run
ok(K.hash(A) === HASH, 'the scene\'s grid hash ' + K.hash(A) + (K.hash(A) === HASH ? '' : ' (expected ' + HASH + ')'));
const ex = K.export(A);
ok(ex.format === 'krator-mask' && ex.ops.length > 40 && ex.hash === K.hash(A), 'export: format, ops, hash');

// golden.json: the ops (with the colour already parsed) and the hash kmask.gd must reach
const GOLD = path.join(__dirname, 'golden.json');
const gold = { note: 'core/mask: test-mask.js writes these (--write), kmask_test.gd replays them in Godot', width: 256, height: 256, hash: K.hash(A), ops: ex.ops };
if (process.argv.includes('--write')) fs.writeFileSync(GOLD, JSON.stringify(gold) + '\n');
ok(fs.existsSync(GOLD) && JSON.stringify(JSON.parse(fs.readFileSync(GOLD, 'utf8'))) === JSON.stringify(gold), 'golden.json matches (node core/mask/test-mask.js --write after a meant change)');

// a full-size mask in reasonable time
const t0 = Date.now(), big = K.canvas(2048, 2048), bg = big.getContext('2d');
bg.fillStyle = '#fff'; bg.fillRect(0, 0, 2048, 2048); bg.strokeStyle = '#000';
for (let r = 0; r < 300; r++) { bg.lineWidth = 6 + r % 10; bg.beginPath(); bg.moveTo((r * 97) % 2048, (r * 61) % 2048); bg.lineTo((r * 89 + 400) % 2048, (r * 53 + 300) % 2048); bg.lineTo((r * 41) % 2048, (r * 67 + 900) % 2048); bg.stroke(); }
const ms = Date.now() - t0;
ok(ms < 8000, '2048 x 2048 with 300 roads in ' + ms + ' ms');
console.log(fails ? fails + ' failed' : 'all passed');
process.exit(fails ? 1 : 0);
