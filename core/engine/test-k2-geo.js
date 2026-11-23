// node core/engine/test-k2-geo.js: K2's engine half (GRAPHICS-TERRAIN-PROPOSAL.md 12d): the plot-base grounding baked into
// the vertex colours by box(), cyl() and a vertical beam() standing on their plot, and boxBevel(), the chamfered box.
// Runs 30-geo.js on the pinned three.js r128 with the few globals it reads from 10-core.js and 27-mat.js stubbed.
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../tools/ktest.js')(__filename);
const THREE = require(path.join(__dirname, '..', '..', 'kits', 'ancients', 'three.min.js'));
const ctx = { THREE, Math, console, Float32Array, Uint16Array, Uint32Array, isFinite };
vm.createContext(ctx);
vm.runInContext('const clamp=(v,lo,hi)=>v<lo?lo:v>hi?hi:v,lerp=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2,PI=Math.PI;' +
  'const ERRS=[];function reportErr(m){ERRS.push(m);}const SV_CLOTH={},SV_CUT={tentCloth:1};' +
  'const MAT={},TILE={};function hc(h){return new THREE.Color(h);}function terrainH(){return 0;}', ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '30-geo.js'), 'utf8'), ctx, { filename: '30-geo.js' });
const run = s => vm.runInContext(s, ctx);
run('MAT.wall=new THREE.MeshStandardMaterial();MAT.glass=new THREE.MeshStandardMaterial();MAT.glow=new THREE.MeshBasicMaterial();MAT.tentCloth=new THREE.MeshStandardMaterial();');

/* draw into a fresh bucket set and read one key back: [{y, c}] per vertex, and the triangle count */
function draw(src, mk, plotY){
  run('GB={};GTARGET=GB;resetCM();PLOT_Y=' + (plotY === undefined ? 0 : plotY) + ';' + src + ';PLOT_Y=null;');
  const b = run('GB')[mk || 'wall']; if(!b) return { v: [], tris: 0, b: null };
  const v = []; for(let i = 0; i < b.p.length / 3; i++) v.push({ x: b.p[i * 3], y: b.p[i * 3 + 1], z: b.p[i * 3 + 2], c: b.c[i * 3] });
  return { v, tris: b.i.length / 3, b };
}
const darkAbove = (R, y) => R.v.filter(q => q.y > y + 1e-6 && q.c < 1 - 1e-9).length;
const footC = R => Math.min.apply(null, R.v.map(q => q.c));

/* 1. a 3 m wall on its plot */
const wall = draw('box("wall",0,0,0,4,3,.3,0xffffff)');
T.ok('a grounded wall is drawn in two (24 triangles: the band and the rest)', wall.tris === 24, 'tris ' + wall.tris);
T.ok('its foot is BASE_AO.lo (0.72)', Math.abs(footC(wall) - 0.72) < 1e-6, 'foot ' + footC(wall));
T.ok('the band\'s top and everything above it keep the full colour', wall.v.filter(q => q.y >= 0.3 - 1e-6).every(q => q.c === 1));
/* the colour the rasteriser interpolates at height y: along every vertical triangle edge that spans it, the darkest */
function shadeAt(R, y){ const P = R.b.p, C = R.b.c, I = R.b.i; let lo = 1;
  for(let t = 0; t < I.length; t += 3) for(const [u, w] of [[I[t], I[t + 1]], [I[t + 1], I[t + 2]], [I[t + 2], I[t]]]){
    const ya = P[u * 3 + 1], yb = P[w * 3 + 1]; if(Math.abs(P[u * 3] - P[w * 3]) > 1e-6 || Math.abs(P[u * 3 + 2] - P[w * 3 + 2]) > 1e-6) continue;
    if((ya - y) * (yb - y) > 0 || ya === yb) continue; const f = (y - ya) / (yb - ya); lo = Math.min(lo, C[u * 3] + (C[w * 3] - C[u * 3]) * f); }
  return lo; }
T.neg('the ramp ends at the band, not up the wall (a 3 m band is the unsplit look: mid-wall shaded)',
  R => shadeAt(R, 1.5) === 1 && Math.abs(shadeAt(R, 0.15) - 0.86) < 1e-6, (() => { run('BASE_AO={lo:.72,band:3}'); const r = draw('box("wall",0,0,0,4,3,.3,0xffffff)'); run('BASE_AO={lo:.72,band:.30}'); return r; })(), wall);
T.neg('off a plot (no place()) and with BASE_AO off nothing darkens',
  R => R.v.every(q => q.c === 1),
  draw('box("wall",0,0,0,4,3,.3,0xffffff)'),
  (() => { run('BASE_AO=null'); const r = draw('box("wall",0,0,0,4,3,.3,0xffffff)'); run('BASE_AO={lo:.72,band:.30}'); return r; })());
T.ok('off a plot: one box, as before', draw('box("wall",0,0,0,4,3,.3,0xffffff)', 'wall', 'null').tris === 12);
T.ok('a floor slab stays as it was (flat: lower than 0.6 of its narrowest side)', draw('box("wall",0,0,0,5,.1,5,0xffffff)').v.every(q => q.c === 1));
T.ok('a box on a shelf (its foot 1 m up) stays as it was', draw('box("wall",0,1,0,.4,.6,.4,0xffffff)').v.every(q => q.c === 1));
T.ok('glass, a basic (glow) material and the cut-away cloth stay as they were',
  ['glass', 'glow', 'tentCloth'].every(k => draw('box("' + k + '",0,0,0,1,2,.1,0xffffff)', k).v.every(q => q.c === 1)));
T.ok('a tilted box stays as it was', draw('box("wall",0,0,0,.3,2,.3,0xffffff,0,.3,0)').v.every(q => q.c === 1));
const low = draw('box("wall",0,0,0,.4,.25,.25,0xffffff)');
T.ok('a low plinth (under 1.5 bands) is one box ramped to its top', low.tris === 12 && Math.abs(footC(low) - 0.72) < 1e-6 && low.v.filter(q => q.y > .2).every(q => Math.abs(q.c - (0.72 + 0.28 * 0.25 / 0.3)) < 1e-6));
const placed = draw('W(10,2,-4,.7,()=>box("wall",0,0,0,2,3,.3,0xffffff))', 'wall', 2);
T.ok('in a placed frame (a plot 2 m up, turned) the foot is found and ramped', placed.tris === 24 && Math.abs(footC(placed) - 0.72) < 1e-6 && darkAbove(placed, 2.3) === 0);
T.ok('the vertex colour multiplies the tint (a 0x808080 wall)', (() => { const r = draw('box("wall",0,0,0,4,3,.3,0x808080)'), top = Math.max.apply(null, r.v.map(q => q.c));
  return Math.abs(footC(r) - top * 0.72) < 1e-6; })());

/* 2. posts: a cylinder and a vertical beam */
const post = draw('cyl("wall",0,0,0,.15,2.5,0xffffff,8)');
T.ok('a grounded cylinder is split at the band and ramped', Math.abs(footC(post) - 0.72) < 1e-6 && darkAbove(post, 0.3) === 0 && post.tris > draw('cyl("wall",0,0,0,.15,2.5,0xffffff,8)', 'wall', 'null').tris);
T.ok('a wrapped cylinder (its own UVs) is left whole', draw('cyl("wall",0,0,0,.15,2.5,0xffffff,8,undefined,true)').v.every(q => q.c === 1));
const bm = draw('beam("wall",[1,0,1],[1,3,1],.2,0xffffff)');
T.ok('a vertical beam on the plot is split and ramped', bm.tris === 24 && Math.abs(footC(bm) - 0.72) < 1e-6 && darkAbove(bm, 0.3) === 0);
T.ok('a sloping beam stays as it was', draw('beam("wall",[0,0,0],[2,3,0],.2,0xffffff)').v.every(q => q.c === 1));

/* 3. boxBevel */
const bv = draw('boxBevel("wall",0,1,0,1.2,.8,.6,.06,0xffffff)', 'wall', 'null');
T.ok('boxBevel draws 44 triangles', bv.tris === 44, 'tris ' + bv.tris);
const ext = k => [Math.min.apply(null, bv.v.map(q => q[k])), Math.max.apply(null, bv.v.map(q => q[k]))];
T.ok('it is base-anchored and exactly w x h x d', [ext('x'), ext('y'), ext('z')].every((e, i) => Math.abs(e[0] - [-.6, 1, -.3][i]) < 1e-6 && Math.abs(e[1] - [.6, 1.8, .3][i]) < 1e-6));
/* closed and outward: every edge (by position) in exactly two triangles, the signed volume positive and below the box's */
function solid(R){ const P = R.b.p, I = R.b.i, key = i => [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]].map(v => v.toFixed(5)).join(','), E = {};
  let vol = 0;
  for(let t = 0; t < I.length; t += 3){ const a = I[t], b = I[t + 1], c = I[t + 2];
    for(const [u, w] of [[a, b], [b, c], [c, a]]){ const k = [key(u), key(w)].sort().join('|'); E[k] = (E[k] || 0) + 1; }
    const A = [P[a * 3], P[a * 3 + 1], P[a * 3 + 2]], B = [P[b * 3], P[b * 3 + 1], P[b * 3 + 2]], C = [P[c * 3], P[c * 3 + 1], P[c * 3 + 2]];
    vol += (A[0] * (B[1] * C[2] - B[2] * C[1]) - A[1] * (B[0] * C[2] - B[2] * C[0]) + A[2] * (B[0] * C[1] - B[1] * C[0])) / 6; }
  return { closed: Object.values(E).every(n => n === 2), vol }; }
const S = solid(bv), box0 = 1.2 * .8 * .6;
T.ok('it is closed (every edge in two triangles)', S.closed);
T.neg('its triangles face out: positive volume just under the box\'s (a flipped one would be negative)',
  R => { const s = solid(R); return s.vol > box0 * 0.9 && s.vol < box0; },
  (() => { const r = draw('boxBevel("wall",0,1,0,1.2,.8,.6,.06,0xffffff)', 'wall', 'null'); const I = r.b.i; for(let t = 0; t < I.length; t += 3){ const k = I[t + 1]; I[t + 1] = I[t + 2]; I[t + 2] = k; } return r; })(), bv);
T.ok('a bevel larger than the piece is clamped (0.45 of the smallest side), still closed', (() => { const r = draw('boxBevel("wall",0,0,0,.2,.2,.2,1,0xffffff)', 'wall', 'null'); return r.tris === 44 && solid(r).closed; })());
T.ok('a bevel of 0 is a plain box', draw('boxBevel("wall",0,0,0,1,1,1,0,0xffffff)', 'wall', 'null').tris === 12);
T.ok('a low grounded bevelled plinth ramps to its top', (() => { const r = draw('boxBevel("wall",0,0,0,1,.3,1,.05,0xffffff)'); return Math.abs(footC(r) - 0.72) < 1e-6; })());
T.ok('no error was reported', run('ERRS').length === 0, run('ERRS').join('; '));
T.done();
