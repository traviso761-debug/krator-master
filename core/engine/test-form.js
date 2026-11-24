// node core/engine/test-form.js: the export form (30-geo.js; GODOT-LOOK-PLAN.md section 13): the chamfered box on its own
// 24 vertices, a building out of true, and the height field, each behind setForm and off without it. 30-geo.js is run
// here on its own, with the few names it takes from its neighbours stood in. Each check has a negative.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
function engine() {
  const ctx = { console, Math, THREE }; ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'core/rand/08-core-rand.js'), 'utf8') + '\nthis.KRAND=KRAND;', ctx);
  vm.runInContext(`const clamp=(v,lo,hi)=>v<lo?lo:v>hi?hi:v, lerp=(lo,hi,t)=>lo+(hi-lo)*t, TAU=Math.PI*2, PI=Math.PI;
    const TILE={}, MAT={}, SV_CLOTH={}, SV_CUT={}, hc=h=>new THREE.Color(h); const errs=[]; function reportErr(m){errs.push(m);}`, ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'core/engine/30-geo.js'), 'utf8') +
    '\nthis.API={box,setForm,formMarks,smokeAt,smokes:()=>SMOKES,formRoot,formRootEnd,gboxCh,pushM,popM,TF,FORM,buckets:()=>GB,reset:()=>{GB={};GTARGET=GB;resetCM();},errs};', ctx, { filename: '30-geo.js' });
  return ctx.API;
}
const outward = (P, I, c) => { let bad = 0; for (let t = 0; t < I.length; t += 3) { const a = I[t] * 3, b = I[t + 1] * 3, d = I[t + 2] * 3;
  const u = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], v = [P[d] - P[a], P[d + 1] - P[a + 1], P[d + 2] - P[a + 2]];
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const m = [(P[a] + P[b] + P[d]) / 3 - c[0], (P[a + 1] + P[b + 1] + P[d + 1]) / 3 - c[1], (P[a + 2] + P[b + 2] + P[d + 2]) / 3 - c[2]];
  if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] <= 0) bad++; } return bad; };
const closed = (P, I) => { const E = new Map(), k = i => Math.round(P[i * 3] * 1e4) + ',' + Math.round(P[i * 3 + 1] * 1e4) + ',' + Math.round(P[i * 3 + 2] * 1e4);
  for (let t = 0; t < I.length; t += 3) for (let s = 0; s < 3; s++) { const e = k(I[t + s]) + '>' + k(I[t + (s + 1) % 3]); if (E.has(e)) return false; E.set(e, 1); }
  for (const e of E.keys()) { const [a, b] = e.split('>'); if (!E.has(b + '>' + a)) return false; } return true; };

// 1. off by default: box() is the plain box
let A = engine();
A.box('stone', 0, 0, 0, 2, 1, 3);
let b = A.buckets().stone;
T.ok('with no form set a box is 24 vertices and 12 triangles, and carries no field', b.p.length === 72 && b.i.length === 36 && !b.x && A.FORM.chamfer === null && A.FORM.jitter === 0);
const plainP = b.p.slice();

// 2. the chamfered box
A = engine(); A.setForm({ chamfer: mk => mk === 'stone' ? 0.03 : 0 });
A.box('stone', 0, 0, 0, 2, 1, 3); A.box('glass', 5, 0, 0, 2, 1, 3); A.box('stone', 10, 0, 0, 2, 0.1, 3);
b = A.buckets().stone; const first = { p: b.p.slice(0, 72), i: b.i.slice(0, 132) };
T.ok('a chamfered box is the box\'s own 24 vertices and 44 triangles', b.p.length === 144 && b.i.length === 132 + 36 && A.buckets().glass.i.length === 36, b.p.length + ' ' + b.i.length);
T.ok('every triangle faces outward and the solid is closed', outward(first.p, first.i, [0, 0.5, 0]) === 0 && closed(first.p, first.i));
let moved = 0, far = 0; for (let i = 0; i < 24; i++) { const d = Math.hypot(first.p[i * 3] - plainP[i * 3], first.p[i * 3 + 1] - plainP[i * 3 + 1], first.p[i * 3 + 2] - plainP[i * 3 + 2]);
  if (d > 1e-9) moved++; if (Math.abs(d - 0.03 * Math.SQRT2) > 1e-6) far++; }
T.ok('each vertex moved a bevel in along both edges of its face, and no further', moved === 24 && far === 0);
T.ok('on its own face\'s axis every vertex is where the plain box has it, to the bit (a slab in the ground\'s plane stays in it)', (() => { for (let i = 0; i < 24; i++) for (let k = 0; k < 3; k++) if (Math.abs(b.n[i * 3 + k]) > 0.5 && first.p[i * 3 + k] !== plainP[i * 3 + k]) return false; return true; })());
T.ok('its normals are the faces\' own (the strips shade as a rounded edge)', (() => { const n = b.n; for (let i = 0; i < 24; i++) { const a = [Math.abs(n[i * 3]), Math.abs(n[i * 3 + 1]), Math.abs(n[i * 3 + 2])].sort(); if (a[2] < 0.999 || a[1] > 1e-6) return false; } return true; })());
T.neg('the plain twelve triangles on the moved vertices would leave the edges open', I => closed(first.p, I), first.i.slice(0, 36), first.i);
T.ok('negative: a key with no bevel, and a slab thinner than four bevels, stay plain boxes', A.buckets().glass.p.length === 72 && b.i.length - 132 === 36);

// 3. out of true, and the height field
const building = (form) => { const E = engine(); if (form) E.setForm(form); E.pushM(E.TF(100, 20, -50, 0.7)); const keep = E.formRoot();
  E.box('stone', 0, 0, 0, 6, 4, 6); E.formRootEnd(keep); E.popM(); E.box('stone', 0, 0, 0, 1, 1, 1); return E.buckets().stone; };
const straight = building(null), leaning = building({ jitter: 1 }), again = building({ jitter: 1 }), fields = building({ fields: true });
let top = 0, foot = 0, loose = 0; for (let i = 0; i < 24; i++) { const d = Math.hypot(leaning.p[i * 3] - straight.p[i * 3], leaning.p[i * 3 + 2] - straight.p[i * 3 + 2]);
  if (straight.p[i * 3 + 1] > 23) top = Math.max(top, d); else foot = Math.max(foot, d); }
for (let i = 72; i < 144; i++) if (leaning.p[i] !== straight.p[i]) loose++;
T.ok('a building out of true leans at its top (' + (top * 100).toFixed(1) + ' cm on a 4 m wall) and not at its foot; what is outside a building does not move',
  top > 0.03 && top < 0.2 && foot < 1e-9 && loose === 0 && Math.abs(leaning.p[1] - straight.p[1]) < 1e-9, top + ' ' + foot);
T.ok('the same building leans the same way every time', JSON.stringify(leaning.p) === JSON.stringify(again.p));
T.neg('one that stands elsewhere leans otherwise', q => JSON.stringify(q) !== JSON.stringify(leaning.p.slice(0, 72).map((v, i) => +(v - straight.p[i]).toFixed(6))),
  leaning.p.slice(0, 72).map((v, i) => +(v - straight.p[i]).toFixed(6)),
  (() => { const E = engine(); E.setForm({ jitter: 1 }); E.pushM(E.TF(300, 20, 80, 0.7)); const k = E.formRoot(); E.box('stone', 0, 0, 0, 6, 4, 6); E.formRootEnd(k); E.popM();
    const E2 = engine(); E2.pushM(E2.TF(300, 20, 80, 0.7)); E2.box('stone', 0, 0, 0, 6, 4, 6); E2.popM(); const p2 = E2.buckets().stone.p; return E.buckets().stone.p.map((v, i) => +(v - p2[i]).toFixed(6)); })());
let hOk = fields.x && fields.x.length === 144; for (let i = 0; hOk && i < 24; i++) hOk = Math.abs(fields.x[i * 3] - (straight.p[i * 3 + 1] - 20)) < 1e-6 && fields.x[i * 3 + 1] === 1;
T.ok('with fields on a vertex carries its height above its building\'s base, and -1 outside any', hOk && fields.x[72] === -1, fields.x && fields.x.slice(0, 6).join(','));
T.ok('negative: fields alone move nothing', JSON.stringify(fields.p) === JSON.stringify(straight.p) && !straight.x);
// 4. where smoke rises and where a wall stains
const M = engine(); M.pushM(M.TF(10, 2, 5, 0)); M.smokeAt(0, 6, 1, { r: 0.4, kind: 'chimney' }); M.popM();
const marks = M.formMarks([{ key: 'house', windows: [{ wx: 1, wy: 3, wz: 2, yaw: 0.5, w: 0.8, h: 1, sill: 0.1 }] }, { key: 'shed' }], M.smokes());
T.ok('a chimney\'s smoke and a window\'s sill come out as plain records in the world\'s frame',
  marks.length === 2 && marks[0].kind === 'smoke' && marks[0].at.join() === '10,8,6' && marks[0].source === 'chimney' && marks[1].kind === 'sill' && Math.abs(marks[1].at[1] - 3.1) < 1e-9 && marks[1].key === 'house',
  JSON.stringify(marks));
T.ok('negative: nothing recorded, nothing marked', M.formMarks([], []).length === 0 && M.formMarks([{ key: 'shed' }], []).length === 0);
T.done();
