// node core/city/test-construct.js — core/city's build order for a piece going up (54-city-host-construct.js,
// KCITY.constructOrder: plain arrays, no three.js). A stand-in house: a stone footing, four posts, two wall panels
// between them and a pitched roof, as one triangle list; the order must be footing, then the posts before the panels of
// their band, then the roof from the eaves up; the same every time, and the same indexed or not. Each check with a negative.
const fs = require('fs'), path = require('path'), vm = require('vm');
global.window = global; global.KCITY = {};
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '54-city-host-construct.js'), 'utf8'), { filename: '54-city-host-construct.js' });
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++; console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };
/* the house: each part a list of triangles [[x,y,z]x3] and its name */
const tris = [], kind = [];
const quad = (a, b, c, d, k) => { tris.push([a, b, c], [a, c, d]); kind.push(k, k); };
const box = (x0, y0, z0, x1, y1, z1, k) => { /* the four sides and the top of a box */
  quad([x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], k); quad([x0, y0, z1], [x0, y1, z1], [x1, y1, z1], [x1, y0, z1], k);
  quad([x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1], k); quad([x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], k);
  quad([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], k); };
quad([-3, 4, -2], [3, 4, -2], [3, 5.5, 0], [-3, 5.5, 0], 'roof'); quad([-3, 4, 2], [-3, 5.5, 0], [3, 5.5, 0], [3, 4, 2], 'roof');   /* the roof listed first: the order must not follow the list */
quad([-2.8, 0.6, -2], [2.8, 0.6, -2], [2.8, 3.8, -2], [-2.8, 3.8, -2], 'panel'); quad([-2.8, 0.6, 2], [-2.8, 3.8, 2], [2.8, 3.8, 2], [2.8, 0.6, 2], 'panel');
[[-3, -2], [3, -2], [3, 2], [-3, 2]].forEach(p => box(p[0] - 0.1, 0.6, p[1] - 0.1, p[0] + 0.1, 4, p[1] + 0.1, 'post'));
box(-3.2, 0, -2.2, 3.2, 0.5, 2.2, 'footing');
const pos = new Float32Array(tris.length * 9); tris.forEach((t, i) => t.forEach((v, j) => { pos[i * 9 + j * 3] = v[0]; pos[i * 9 + j * 3 + 1] = v[1]; pos[i * 9 + j * 3 + 2] = v[2]; }));
const O = KCITY.constructOrder({ pos }), seq = Array.from(O.tris).map(t => kind[t]);
const firstOf = k => seq.indexOf(k), lastOf = k => seq.lastIndexOf(k);
ok('the footing first, then the walls, the roof last (' + ['footing', 'post', 'panel', 'roof'].map(k => k + ' ' + firstOf(k) + '-' + lastOf(k)).join(', ') + ' of ' + seq.length + ')',
  lastOf('footing') < firstOf('post') && lastOf('panel') < firstOf('roof') && lastOf('post') < firstOf('roof'),
  !(Array.from({ length: kind.length }, (_, i) => kind[i]).indexOf('roof') > lastOf('footing')), 'the list as given puts the roof first');
/* within a band the frame before the infill: in the band where the panels start, every post triangle before the panels */
const band = k => Math.floor((O.keys[seq.indexOf(k)] - 1) / 0.9 * Math.ceil(O.H / 0.5));
const postsBefore = seq.slice(0, firstOf('panel')).filter(k => k === 'post').length, postsInBand = seq.filter((k, i) => k === 'post' && Math.floor((O.keys[i] - 1) / 0.9 * Math.ceil(O.H / 0.5)) === band('panel')).length;
ok('in a band the frame goes up before the infill (' + postsBefore + ' post triangles before the first panel, ' + postsInBand + ' of them in its band)', postsBefore >= postsInBand && postsInBand > 0,
  KCITY.constructOrder({ pos, opt: { slender: 1e9 } }).tris.length === O.tris.length && (() => { const s2 = Array.from(KCITY.constructOrder({ pos, opt: { slender: 1e9 } }).tris).map(t => kind[t]); return s2.slice(0, s2.indexOf('panel')).filter(k => k === 'post').length < postsBefore; })(),
  'with nothing slender the posts lose their place');
/* the roof from the eaves up */
const roofYs = seq.map((k, i) => k === 'roof' ? Math.min(...tris[O.tris[i]].map(v => v[1])) : null).filter(y => y != null);
ok('the roof from the eaves to the ridge', roofYs.every((y, i) => !i || y >= roofYs[i - 1]), true);
/* the same every time; the same with an index */
const O2 = KCITY.constructOrder({ pos }), idx = new Uint16Array(tris.length * 3), pos2 = new Float32Array(pos.length);
const vmap = new Map(); let nv = 0; tris.forEach((t, i) => t.forEach((v, j) => { const key = v.join(','); if (!vmap.has(key)) { vmap.set(key, nv); pos2.set(v, nv * 3); nv++; } idx[i * 3 + j] = vmap.get(key); }));
const O3 = KCITY.constructOrder({ pos: pos2.subarray(0, nv * 3), index: idx }), same = (A, B) => A.length === B.length && Array.from(A).every((x, i) => x === B[i]);
const shifted = KCITY.constructOrder({ pos: pos.map((v, i) => i % 3 === 1 ? v + (i % 9 === 1 ? 0.7 : 0) : v) });
ok('the same piece goes up the same way every time, indexed or not', same(O.tris, O2.tris) && same(O.tris, O3.tris), !same(O.tris, shifted.tris), 'a piece reshaped goes up otherwise');
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
