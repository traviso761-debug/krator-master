// core/mask's transform layer (26-core-mask-xform.js): a painter's world-space calls under scale/translate/rotate land on
// the same pixels as the same shapes given in pixels, and what is not portable throws.
//   node core/mask/test-mask-xform.js     'all passed'
'use strict';
const K = require('./25-core-mask.js');
require('./26-core-mask-xform.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const throws = f => { try { f(); return false; } catch (e) { return true; } };

// 1. world space (-10..10, scale 2 into a 40 px grid) against the same shapes in pixels
const a = K.xform(K.canvas(40, 40)), ga = a.getContext('2d');
ga.fillStyle = '#000'; ga.fillRect(0, 0, 40, 40);
ga.save(); ga.scale(2, 2); ga.translate(10, 10);
ga.fillStyle = 'rgb(64,0,0)'; ga.beginPath(); ga.arc(0, 0, 4, 0, 2 * Math.PI); ga.fill();
ga.strokeStyle = 'rgb(32,0,0)'; ga.lineWidth = 1; ga.beginPath(); ga.moveTo(-8, -8); ga.lineTo(8, -8); ga.stroke();
ga.fillStyle = 'rgb(96,0,0)'; ga.fillRect(5, 5, 3, 2);
ga.restore();
const b = K.canvas(40, 40), gb = b.getContext('2d');
gb.fillStyle = '#000'; gb.fillRect(0, 0, 40, 40);
gb.fillStyle = 'rgb(64,0,0)'; gb.beginPath(); gb.arc(20, 20, 8, 0, 2 * Math.PI); gb.fill();
gb.strokeStyle = 'rgb(32,0,0)'; gb.lineWidth = 2; gb.beginPath(); gb.moveTo(4, 4); gb.lineTo(36, 4); gb.stroke();
gb.fillStyle = 'rgb(96,0,0)'; gb.fillRect(30, 30, 6, 4);
ok(K.hash(a) === K.hash(b), 'scale + translate: the same bytes as the shapes given in pixels (' + K.hash(a) + ')');
ok(JSON.stringify(K.ops(a)) === JSON.stringify(K.ops(b)), 'and the same ops (what kmask.gd replays)');

// 2. a rotated rect is a 4-gon: a quarter turn of a 6 x 2 rect about its centre is a 2 x 6 rect
const c = K.xform(K.canvas(20, 20)), gc = c.getContext('2d');
gc.fillStyle = '#000'; gc.fillRect(0, 0, 20, 20);
gc.save(); gc.translate(10, 10); gc.rotate(Math.PI / 2); gc.fillStyle = '#fff'; gc.fillRect(-3, -1, 6, 2); gc.restore();
const d = K.canvas(20, 20), gd = d.getContext('2d');
gd.fillStyle = '#000'; gd.fillRect(0, 0, 20, 20); gd.fillStyle = '#fff'; gd.fillRect(9, 7, 2, 6);
ok(K.hash(c) === K.hash(d), 'rotate: a quarter-turned rect paints the turned rect');

// 3. restore brings back the matrix and the styles
const e = K.xform(K.canvas(10, 10)), ge = e.getContext('2d');
ge.fillStyle = '#123456'; ge.save(); ge.scale(3, 3); ge.fillStyle = '#fff'; ge.restore();
ge.fillRect(0, 0, 1, 1);
ok(Array.from(e.data.slice(0, 3)).join() === '18,52,86' && e.data[4] === 0, 'restore: the identity matrix and the saved fillStyle');

// 4. a full ellipse is a polygon through the matrix; a circle-sized ellipse covers the disc's centre and not its corner
const f = K.xform(K.canvas(20, 20)), gf = f.getContext('2d');
gf.fillStyle = '#fff'; gf.beginPath(); gf.ellipse(10, 10, 6, 3, 0, 0, 2 * Math.PI); gf.fill();
const px = (cv, i, j) => cv.data[(j * cv.width + i) * 4];
ok(px(f, 10, 10) === 255 && px(f, 15, 10) === 255 && px(f, 10, 13) === 0 && px(f, 2, 2) === 0, 'ellipse: inside on the long axis, outside past the short one');

// 5. the negatives: what is not portable throws
const fresh = () => K.xform(K.canvas(10, 10)).getContext('2d');
ok(throws(() => { const h = fresh(); h.scale(2, 1); h.beginPath(); h.arc(1, 1, 1, 0, 7); }), 'an arc under two scales throws');
const g = fresh();
ok(throws(() => { g.setLineDash([2, 2]); g.beginPath(); g.moveTo(0, 0); g.lineTo(5, 5); g.stroke(); }), 'a dashed stroke throws');
g.setLineDash([]);
ok(!throws(() => { g.beginPath(); g.moveTo(0, 0); g.lineTo(5, 5); g.stroke(); }), 'an undashed stroke after setLineDash([]) does not');
ok(throws(() => g.clearRect(0, 0, 1, 1)), 'clearRect throws');
ok(throws(() => { g.beginPath(); g.ellipse(5, 5, 2, 1, 0, 0, 1); }), 'a partial ellipse throws');

console.log(fails ? fails + ' FAILED' : 'all passed');
if (fails) process.exit(1);
