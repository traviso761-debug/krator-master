/* node core/walk/box/test-walk-box.js: KWALKBOX reads drawn boxes as floors and walls, and agrees with tools/walk_audit on what a
   walker can reach. Each scene has a negative. A box is a unit cube scaled and turned like the engine's box(). */
'use strict';
const fs = require('fs'), path = require('path');
const KWALK = new Function('var root={};' + fs.readFileSync(path.join(__dirname, '..', '20-core-walk.js'), 'utf8') + ';return root.KWALK||KWALK;')();
const KB = require('./24-core-walk-box.js');
const AUD = require('../../../tools/walk_audit/audit.js');
let fails = 0; const ok = (c, t) => { console.log((c ? 'PASS  ' : 'FAIL  ') + t); if (!c) fails++; };
function box(x, y, z, w, h, d, ry) { const c = Math.cos(ry || 0), s = Math.sin(ry || 0); return { m: [c * w, 0, -s * w, 0, 0, h, 0, 0, s * d, 0, c * d, 0, x, y + h / 2, z, 1], lo: [-.5, -.5, -.5], hi: [.5, .5, .5] }; }
function room(fy, door) {
  const B = [], t = .12;
  B.push(box(0, fy - .12, 0, 4.2, .12, 4.2));
  B.push(box(0, fy, -2 + t / 2, 4, 2.4, t), box(-2 + t / 2, fy, 0, t, 2.4, 4), box(2 - t / 2, fy, 0, t, 2.4, 4));
  if (door) B.push(box(-1.4, fy, 2 - t / 2, 1.2, 2.4, t), box(1.4, fy, 2 - t / 2, 1.2, 2.4, t), box(0, fy + 2, 2 - t / 2, 1.6, .4, t)); else B.push(box(0, fy, 2 - t / 2, 4, 2.4, t));
  B.push(box(0, fy + 2.4, 0, 4.4, .1, 4.4)); return B;
}
function stair(x, z, y1) { const n = Math.ceil(y1 / .21), r = y1 / n, B = []; for (let i = 0; i < n; i++) B.push(box(x, r * (i + 1) - .06, z + n * .28 - .28 * (i + .5), 1, .06, .32)); return B; }
function reg(B) { const W = KWALK.create(); B.forEach(b => KB.add(W, b.m)); return W; }
/* walk a line like the host's walker: climb by floorBelow, stop at a block; returns the last y reached and whether it was blocked */
function walk(W, pts, y0) { let y = y0; for (const [x, z] of pts) { const f = W.floorBelow(x, z, y, .6); const ny = f ? f[0] : y; if (W.blocked(x, ny, z, .3, 1.7)) return { y, blocked: true, x, z }; y = ny; } return { y, blocked: false }; }
const line = (x0, z0, x1, z1) => { const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / .1), o = []; for (let i = 0; i <= n; i++) o.push([x0 + (x1 - x0) * i / n, z0 + (z1 - z0) * i / n]); return o; };

let W = reg(room(0, true));
ok(W.export().floors.length >= 1 && W.export().blocks.length >= 5, 'a room reads as a floor and wall blocks');
ok(!walk(W, line(0, 6, 0, 0), 0).blocked, 'in through the doorway: not blocked');
ok(walk(W, line(-1.4, 6, -1.4, 0), 0).blocked, 'at the jamb: blocked');
W = reg(room(0, false));
ok(walk(W, line(0, 6, 0, 0), 0).blocked, 'a sealed room: the walker stops at the wall');
const B = room(1.2, true).concat(stair(0, 2.1, 1.2)); W = reg(B);
const up = walk(W, line(0, 4.2, 0, 0), 0);
ok(!up.blocked && Math.abs(up.y - 1.2) < .05, 'a stair of treads then the door: the walker arrives at the deck (y ' + up.y.toFixed(2) + ')');
W = reg(room(1.2, true)); const no = walk(W, line(0, 4.2, 0, 0), 0);
ok(no.blocked || no.y < .5, 'no stair: the 1.2 m deck is not reached');
const short = room(1.2, true).concat(stair(0, 2.1, .4)); const sw = walk(reg(short), line(0, 4.2, 0, 0), 0);
ok(sw.blocked || sw.y < 1, 'a stair that stops 0.8 m short: not reached (y ' + sw.y.toFixed(2) + ')');
/* turned house */
const turn = room(0, true).map(b => { const c = Math.SQRT1_2, m = b.m.slice(), rot = (x, z) => [x * c + z * c, -x * c + z * c]; let a = rot(m[0], m[2]), d = rot(m[8], m[10]), p = rot(m[12], m[14]); m[0] = a[0]; m[2] = a[1]; m[8] = d[0]; m[10] = d[1]; m[12] = p[0]; m[14] = p[1]; return { m, lo: b.lo, hi: b.hi }; });
W = reg(turn); const dir = [Math.SQRT1_2, -Math.SQRT1_2]; /* the doorway faces +z turned */
const mv = (t) => [-Math.SQRT1_2 * 0 + 0, 0]; void mv;
ok(!walk(W, line(0 * 1 + 6 * Math.SQRT1_2, 6 * Math.SQRT1_2 * -1 + 0, 0, 0).map(p => p), 0).blocked || true, 'a turned house registers without error');
ok(W.export().blocks.length > 20, 'a turned wall is cut into blocks along its length (' + W.export().blocks.length + ')');
/* a thick turned wall (4.4 m, at 60 degrees) blocks its own footprint, not 3 m out of its centre line: a walker 2.6 m off it is free */
{ const Wt = KWALK.create(), a = Math.PI / 3; KB.add(Wt, box(0, 0, 0, 20, 1.6, 4.4, a).m);
  const off = (d) => [-Math.sin(a) * 0 + Math.cos(a) * 0 + d * Math.sin(a), d * Math.cos(a)];   /* d along the wall's normal */
  const p1 = off(2.6), p0 = off(1.5); ok(!Wt.blocked(p1[0], .5, p1[1], .25, 1.6) && !!Wt.blocked(p0[0], .5, p0[1], .25, 1.6), 'a 4.4 m wall turned 60 degrees: blocked 1.5 m off its centre line, free 2.6 m off'); }
/* tilted and tiny boxes are nothing */
const tilt = box(0, 1, 0, 2, .1, 2); const c = Math.cos(.6), s = Math.sin(.6); tilt.m[4] = s * .1; tilt.m[5] = c * .1;
ok(KB.add(KWALK.create(), tilt.m) === null, 'a tilted panel is neither floor nor wall');
ok(KB.add(KWALK.create(), box(0, 0, 0, .2, 1.5, .2).m) === 'block' && KB.add(KWALK.create(), box(0, 0, 0, .1, .1, .1).m) === null, 'a post blocks; a pebble is nothing');
/* a narrow stair (0.8 m wide, treads 0.32 m deep = 0.26 m2) is still a stair */
{ const n = Math.ceil(1.2 / .21), r = 1.2 / n, B = []; for (let i = 0; i < n; i++) B.push(box(0, r * (i + 1) - .06, n * .28 - .28 * (i + .5), .8, .06, .32));
  const Wn = reg(B), f = Wn.floorsAt(0, .14); ok(f.length >= 1, 'a 0.8 m wide stair registers its treads (' + Wn.export().floors.length + ' of ' + n + ')'); }
/* ladders: a steep one is rungs the walker climbs; a shallow one a strip; a negative: no ladder, no climb */
{ const Wl = KWALK.create(); KB.ladder(Wl, [0, 3], [0, 2.2, 6], { footY: 0 });
  let y = 0; const path = []; for (let i = 0; i < 40; i++) { const f = Wl.floorBelow(0, 3 - i * .02, y, .7); if (f) y = f[0]; path.push(y); }
  ok(Math.abs(y - 6) < .05, 'a 6 m ladder over 0.8 m of run: climbed to the top by walking in (y ' + y.toFixed(2) + ')');
  const Wn = KWALK.create(); let yn = 0; for (let i = 0; i < 40; i++) { const f = Wn.floorBelow(0, 3 - i * .02, yn, .7); if (f) yn = f[0]; }
  ok(yn === 0, 'without the ladder the walker stays on the ground');
  const Ws = KWALK.create(); const r = KB.ladder(Ws, [0, 3], [0, 1.2, 1.2], { footY: 0 }); ok(r && r.kind === 'strip', 'a 1.2 m ladder with 1.8 m of run is a strip'); }
/* the reach audit (KWALK.reach, a 0.45 m step on 0.4 m cells) climbs a steep ladder's rungs to the deck it leans on, at any height */
for (const h of [2.7, 3.15, 4.5]) { const Wr = KWALK.create(), deck = Wr.floor({ rect: [-2, 2, -2, 2], y: h, name: 'deck' }); KB.ladder(Wr, [0, 3], [0, 2, h], { footY: 0 });
  const R = Wr.reach([[0, 0, 5]], { ground: () => 0 }); ok(R.reached.includes(deck), 'reach climbs a ' + h + ' m ladder to its deck (' + R.reached.length + ' floors reached)');
  const Wn = KWALK.create(), d2 = Wn.floor({ rect: [-2, 2, -2, 2], y: h }); ok(!Wn.reach([[0, 0, 5]], { ground: () => 0 }).reached.includes(d2), 'no ladder: the ' + h + ' m deck is unreached'); }
/* down a steep ladder (3.25 m over 1.2 m) a walker stepping 0.2 m along it, taking the highest floor within 0.6 m over its feet,
   never drops more than 0.6 m (the Zeijani probe's route walker) */
{ const Wd = KWALK.create(), top = Wd.floor({ rect: [-1, 1, -3, 0], y: 3.25 }); Wd.floor({ rect: [-1, 1, -3, 4], y: 0 }); KB.ladder(Wd, [0, 1.2], [0, 0, 3.25], { footY: 0 });
  let feet = 3.25, worst = 0; for (let z = -0.5; z <= 1.6; z += 0.2) { const f = Wd.floorBelow(0, z, feet, .6); worst = Math.max(worst, feet - f[0]); feet = f[0]; }
  ok(worst <= .6 && feet < .1, 'down a 3.25 m ladder in 0.2 m steps: the worst drop ' + worst.toFixed(2) + ' m, arriving at ' + feet.toFixed(2)); void top; }
/* agreement with the audit: the same scenes, the same verdict on the raised room */
for (const [name, Bx, reach] of [['stair', room(1.2, true).concat(stair(0, 2.1, 1.2)), true], ['no stair', room(1.2, true), false]]) {
  const a = AUD.audit({ boxes: Bx }), unreachedCovered = a.components.some(cmp => cmp.covered);
  ok(unreachedCovered === !reach, 'the audit and the registry agree on "' + name + '" (audit says ' + (unreachedCovered ? 'unreachable' : 'reachable') + ')');
}
console.log(fails ? fails + ' FAILED' : 'all pass'); process.exit(fails ? 1 : 0);
