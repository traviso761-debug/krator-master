// node core/shadow/test-shadow.js: the shadow box's numbers (KSHADOW.fit, basis, radiusFor), each check with a negative
const S = require('./10-core-shadow.js');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } else console.log('ok  ', m); };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dir = (() => { const v = [-0.6, 0.65, 0.45], l = Math.hypot(...v); return v.map(x => x / l); })();
{ const B = S.basis(dir); ok(Math.abs(dot(B.right, B.up)) < 1e-9 && Math.abs(dot(B.right, B.back)) < 1e-9 && Math.abs(dot(B.up, B.back)) < 1e-9, 'the basis is orthonormal');
  ok(Math.abs(B.right[1]) < 1e-9, 'its right axis is level (three lookAt with up +y)');
  const V = S.basis([0, 1, 0]); ok([V.right, V.up].every(a => a.every(Number.isFinite)) && Math.hypot(...V.right) > 0.99, 'straight overhead still has a basis'); }
{ const o = { dir, radius: 200, size: 4096, reach: 1000 }, P0 = S.fit(Object.assign({ focus: [10, 0, 20] }, o)), B = S.basis(dir);
  ok(Math.abs(P0.texel - 400 / 4096) < 1e-12, 'a texel is the box over the map');
  /* the target sits on the texel grid across the light */
  const onGrid = T => [B.right, B.up].every(ax => { const q = dot(T, ax) / P0.texel; return Math.abs(q - Math.round(q)) < 1e-6; });
  ok(onGrid(P0.target), 'the target lies on the texel grid');
  ok(!onGrid([10, 0, 20]), 'negative: the raw focus does not');
  /* an eye sliding less than a texel leaves the grid where it was; a full texel moves it by exactly one */
  const P1 = S.fit(Object.assign({ focus: [10 + P0.texel * 0.3 * B.right[0], 0, 20 + P0.texel * 0.3 * B.right[2]] }, o));
  ok(Math.hypot(...sub(P1.target, P0.target)) < 1e-9 || Math.abs(Math.abs(dot(sub(P1.target, P0.target), B.right)) - P0.texel) < 1e-9, 'a third of a texel moves the box by nothing or one texel, never part of one');
  const shift = Math.abs(dot(sub(P1.target, P0.target), B.right)) / P0.texel; ok(Math.abs(shift - Math.round(shift)) < 1e-6, 'every move is whole texels');
  ok(Math.abs(dot(sub(P0.pos, P0.target), B.back) - 1000) < 1e-9, 'the sun stands its reach back along the light');
  ok(P0.far > 1000 && P0.near > 0, 'the depth range holds the reach and what lies under the focus'); }
{ const a = S.radiusFor(1.7), b = S.radiusFor(2.1), c = S.radiusFor(400), d = S.radiusFor(5000);
  ok(a === 90 && b === a, 'a walker keeps the smallest box, unchanged step to step');
  ok(c > a && c <= 600, 'a high eye widens it'); ok(d === 600, 'and it stops at the most');
  const rs = new Set(); for (let h = 0; h < 600; h += 0.5) rs.add(S.radiusFor(h)); ok(rs.size < 12, 'the radius takes a few steps, not every height (' + rs.size + ')');
  ok(S.radiusFor(0, { min: 0.0 + 50, max: 50 }) === 50, 'min and max honoured'); }
console.log(bad ? bad + ' failed' : 'all passed'); process.exit(bad ? 1 : 0);
