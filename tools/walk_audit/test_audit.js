/* node tools/walk_audit/test_audit.js: the geometry walk audit on small hand-made buildings, each with a negative.
   A box here is a unit cube scaled and turned like the engine's box(): m = T * Ry * S. */
'use strict';
const { audit } = require('./audit.js');
let fails = 0;
const ok = (c, t) => { console.log((c ? 'PASS  ' : 'FAIL  ') + t); if (!c) fails++; };
function box(x, y, z, w, h, d, ry) {            /* bottom-centre (x,y,z) like the engine's box(mk,x,y,z,w,h,d) */
  const c = Math.cos(ry || 0), s = Math.sin(ry || 0);
  return { m: [c * w, 0, -s * w, 0, 0, h, 0, 0, s * d, 0, c * d, 0, x, y + h / 2, z, 1], lo: [-0.5, -0.5, -0.5], hi: [0.5, 0.5, 0.5] };
}
function room(opts) {     /* a 4 x 4 room, floor top at fy on piles when fy>0, walls 2.4 high, a door gap in the front wall */
  const fy = opts.fy || 0, B = [], t = 0.12, y0 = fy;
  B.push(box(0, fy - 0.12, 0, 4.2, 0.12, 4.2));
  B.push(box(0, y0, -2 + t / 2, 4, 2.4, t)); B.push(box(-2 + t / 2, y0, 0, t, 2.4, 4)); B.push(box(2 - t / 2, y0, 0, t, 2.4, 4));
  if (opts.door !== false) { B.push(box(-1.4, y0, 2 - t / 2, 1.2, 2.4, t)); B.push(box(1.4, y0, 2 - t / 2, 1.2, 2.4, t)); B.push(box(0, y0 + 2.0, 2 - t / 2, 1.6, 0.4, t)); }
  else B.push(box(0, y0, 2 - t / 2, 4, 2.4, t));
  B.push(box(0, y0 + 2.4, 0, 4.4, 0.1, 4.4));    /* a flat ceiling slab */
  return B;
}
function stair(x, z, y0, y1, w, dir) {           /* treads climbing toward -z... a flight from (x,z) outward along +z: foot at z+run, head at z */
  const n = Math.ceil((y1 - y0) / 0.21), rise = (y1 - y0) / n, go = 0.28, B = [];
  for (let i = 0; i < n; i++) B.push(box(x, y0 + rise * (i + 1) - 0.06, z + n * go - go * (i + 0.5), w, 0.06, go + 0.04));
  return B;
}
const big = (r) => r.components.filter(c => c.area >= 2 && c.covered);

/* 1. a room on the ground with a door: its floor is reachable (nothing unreachable) */
let r = audit({ boxes: room({ door: true }) });
ok(big(r).length === 0, 'a ground room with a door gap: nothing unreachable');
/* 2. the same with the door walled up: the floor inside is a sealed, covered patch */
r = audit({ boxes: room({ door: false }) });
ok(big(r).length === 1 && big(r)[0].covered, 'a sealed room: its floor is unreachable and covered (' + JSON.stringify(big(r)[0] && [big(r)[0].area, big(r)[0].y0]) + ')');
/* 3. a room on a deck 1.2 m up, with a stair to the door: reachable */
let B = room({ fy: 1.2 }).concat(stair(0, 2.1, 0, 1.2, 1.0));
r = audit({ boxes: B });
ok(big(r).length === 0, 'a raised room with a stair to its door: reachable');
/* 4. the same without the stair: the raised floor is unreachable (a step of 1.2 m) */
r = audit({ boxes: room({ fy: 1.2 }) });
ok(big(r).length >= 1 && big(r).some(c => c.covered && c.y0 > 1), 'a raised room with no stair: the floor is unreachable');
/* 5. the stair stopping short (a missing tread band) fails too */
B = room({ fy: 1.2 }).concat(stair(0, 2.1, 0, 0.4, 1.0));
r = audit({ boxes: B });
ok(big(r).length >= 1, 'a stair that stops 0.8 m short of the sill: unreachable');
/* 6. a ladder-only upper deck: not on foot, reached with the ladder */
B = room({ fy: 2.6 });
r = audit({ boxes: B, ladders: [{ foot: [0, 3.0], top: [0, 1.8, 2.6] }] });
ok(big(r).length === 0 && r.ladderOnly.some(c => c.covered), 'a deck room reached only by a ladder: listed as ladder-only, not unreachable');
/* 7. a turned house (45 degrees) with a door still reads the same */
const turned = room({ door: true }).map(b => { const c = Math.SQRT1_2, s = Math.SQRT1_2, m = b.m.slice(); const rot = (x, z) => [x * c + z * s, -x * s + z * c];
  const a = rot(m[0], m[2]), d = rot(m[8], m[10]), p = rot(m[12], m[14]); m[0] = a[0]; m[2] = a[1]; m[8] = d[0]; m[10] = d[1]; m[12] = p[0]; m[14] = p[1]; return { m: m, lo: b.lo, hi: b.hi }; });
r = audit({ boxes: turned });
ok(big(r).length === 0, 'a house turned 45 degrees with a door gap: reachable');
/* 8. a doorway narrower than the body (0.4 m) shuts the floor in */
B = room({ door: false }); B.splice(4, 2); B.push(box(-1.0, 0, 1.94, 1.5, 2.4, 0.12)); B.push(box(1.0, 0, 1.94, 1.5, 2.4, 0.12)); B.push(box(0, 2.0, 1.94, 0.6, 0.4, 0.12)); B.push(box(0, 2.4, 0, 4.4, 0.1, 4.4));
r = audit({ boxes: B });
ok(big(r).length === 1, 'a 0.5 m doorway with a 0.28 m body: too tight, the floor is shut in');
console.log(fails ? fails + ' FAILED' : 'all pass'); process.exit(fails ? 1 : 0);
