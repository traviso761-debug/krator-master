// node core/biome/test-lod.js: the runtime LOD's draw-call options (20-core-kit.js, "runtime LOD": BIO.LOD.merge, minTris,
// BIO.chunk, BIO.LOD.fade), per-instance labels (BIO.put extra.label, BIO.instLabel), BIO.lathe's rep as a function (B4),
// BIO.dynamic's kit (B7) and BIO.animMat's zero rates (35-core-anim.js, B6); each check with a negative.
// The same kit is built with the options off and on: off must bake exactly today's meshes, on must show the same instances
// from every camera in fewer meshes.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };

function page(opt) {
  opt = opt || {};
  const ctx = { console, Math, THREE }; ctx.globalThis = ctx; vm.createContext(ctx);
  for (const f of (opt.tags ? ['core/rand/08-core-rand.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js'] : []).concat(['core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/30-core-foliage.js', 'core/biome/35-core-anim.js']))
    vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : ''), ctx, { filename: f });
  const BIO = ctx.BIO, errs = [];
  BIO.init({ THREE, scene: new THREE.Scene(), seed: 3, err: m => errs.push(m), tags: opt.tags ? 'test' : undefined });
  Object.assign(BIO.LOD, opt.LOD || {});
  return { BIO, errs };
}
// a kit: a leaf item and a bark bucket in two ranges (800 near, 1200 mid) and a stand-in (minRange 1200) over a 6 km square,
// the trees on a 150 m grid (keyed by their foot), plus small floor tufts on their own pass
function build(P, opt) {
  opt = opt || {};
  const { BIO } = P, leaf = new THREE.MeshLambertMaterial(), bark = new THREE.MeshLambertMaterial();
  BIO.def('leaf', new THREE.PlaneGeometry(2, 2), leaf, { label: 'Leaves' });
  BIO.def('far', new THREE.IcosahedronGeometry(3, 0), leaf, { label: 'Far crowns' });
  BIO.def('tuft', new THREE.PlaneGeometry(.5, .5), leaf, { label: 'Grass' });
  BIO.bucket('bark', bark);
  let n = 0;
  for (let x = -3000; x < 3000; x += 150) for (let z = -3000; z < 3000; z += 150) {
    const near = (n++ % 3) === 0, r = near ? 800 : 1200;
    BIO.owner = [x, z]; BIO.range = r; BIO.minRange = 0;
    for (let k = 0; k < 3; k++) BIO.put('leaf', [x + k, 10 + k, z], null, 1, 0x88aa66, opt.label && k === 1 ? { label: 'Blossom' } : null);
    BIO.tube('bark', [{ x, y: 0, z, r: .5 }, { x, y: 10, z, r: .3 }], 0x664422, { seg: 6 });
    BIO.range = 1e9; BIO.minRange = r; BIO.put('far', [x, 10, z], null, 1, 0x557744);
  }
  BIO.owner = null; BIO.range = 400; BIO.minRange = 0; BIO.chunk = opt.chunk == null ? null : opt.chunk;
  for (let x = 0; x < 2400; x += 40) for (let z = 0; z < 2400; z += 40) BIO.put('tuft', [x, 0, z], null, 1, 0x99bb55);
  BIO.range = null; BIO.chunk = null;
  return BIO.bake();
}
// what the LOD shows from a camera: the positions of every instance drawn (a prefix of a merged mesh) and every bark triangle
function shown(BIO, cam) {
  BIO.lodTick(cam); const inst = [], tri = [];
  for (const m of BIO.baked) {
    if (!m.visible) continue;
    if (m.isInstancedMesh) { const n = m.userData._lodN != null ? m.userData._lodN : m.count, A = m.instanceMatrix.array;
      for (let i = 0; i < n; i++) inst.push(m.name + ':' + A[i * 16 + 12].toFixed(1) + ',' + A[i * 16 + 13].toFixed(1) + ',' + A[i * 16 + 14].toFixed(1)); }
    else { const g = m.geometry, I = g.index.array, P = g.attributes.position.array, n = Math.min(I.length, g.drawRange.count);
      for (let t = 0; t < n; t += 3) { let s = ''; for (let q = 0; q < 3; q++) s += P[I[t + q] * 3].toFixed(2) + ',' + P[I[t + q] * 3 + 1].toFixed(2) + ',' + P[I[t + q] * 3 + 2].toFixed(2) + ';'; tri.push(s); } }
  }
  return { inst: inst.sort().join('|'), tri: tri.sort().join('|'), ni: inst.length, nt: tri.length, meshes: BIO.lodShown.meshes, tris: BIO.lodShown.tris };
}
const cams = [[0, 50, 0, 1, 0, 0], [900, 300, 400, -1, -.2, 0], [-2500, 800, 2500, 1, -.3, -1], [100, 40, -1500, 0, 0, 1], [3000, 2000, 3000, -1, -1, -1]].map(c => {
  const cam = new THREE.PerspectiveCamera(70, 1.6, .5, 20000); cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[0] + c[3], c[1] + c[4], c[2] + c[5]);
  cam.updateMatrixWorld(); return cam; });

// ---------------------------------------------------------------- off: today's keys and meshes
const A = page(), bA = build(A);
const keyOf = A.BIO._lodKey;
A.BIO.range = 800; A.BIO.minRange = 0; A.BIO.owner = [1300, -10];
ok(keyOf(0, 0) === '1,-1|800|0', 'a key is as before with no BIO.chunk: ' + keyOf(0, 0));
A.BIO.chunk = 400; ok(keyOf(0, 0) === '3,-1|800|0|400', 'BIO.chunk puts its size in the key: ' + keyOf(0, 0));
A.BIO.chunk = null; A.BIO.range = null; A.BIO.owner = null; ok(keyOf(0, 0) === null, 'no range, no key (the negative)');
ok(A.BIO.lodMeshes.every(e => !e.ranges && !('ranges' in e.mesh.userData.lod)), 'merge off: one range a mesh, userData.lod as before');
ok(A.BIO.lodMeshes.every(e => e.mesh.onBeforeRender === THREE.Object3D.prototype.onBeforeRender), 'merge off: no render hooks on the meshes');

// ---------------------------------------------------------------- merge on: the same instances, fewer meshes
const B = page({ LOD: { merge: true } }), bB = build(B);
ok(bB.calls < bA.calls, 'merge: fewer meshes (' + bA.calls + ' -> ' + bB.calls + ')');
ok(bB.inst === bA.inst, 'merge: the same instances (' + bA.inst + ')');
let same = true, fewer = true, someTwo = false;
cams.forEach((c, i) => { const a = shown(A.BIO, c), b = shown(B.BIO, c);
  if (a.inst !== b.inst || a.tri !== b.tri || a.tris !== b.tris) { same = false; console.log('  cam ' + i + ': ' + a.ni + '/' + b.ni + ' inst, ' + a.nt + '/' + b.nt + ' tris, ' + a.tris + '/' + b.tris); }
  if (b.meshes > a.meshes) fewer = false; if (b.meshes < a.meshes) someTwo = true; });
ok(same, 'merge: every camera draws the same instances and bark triangles, and lodShown counts the same triangles');
ok(fewer && someTwo, 'merge: no camera draws more meshes, some fewer');
const two = B.BIO.lodMeshes.filter(e => e.ranges && e.ranges.length > 1);
ok(two.length > 0 && two.every(e => e.ranges[0] > e.ranges[1] && e.mesh.userData.lod.ranges.length === 2), 'merge: a two-range mesh holds its ranges longest first (' + two.length + ' meshes)');
{ const e = two.find(x => x.mesh.isInstancedMesh), m = e.mesh, n = m.count; m.userData._lodN = 2;
  let seen = -1; const b0 = THREE.Object3D.prototype.onBeforeRender; m.onBeforeRender(); seen = m.count; m.onAfterRender();
  ok(seen === 2 && m.count === n, 'merge: an instanced mesh draws its prefix while it renders and keeps its whole count otherwise (' + seen + ' of ' + n + ')'); }
// core/tags-free: the rows of a merged mesh are its instances reordered, not lost
{ let tot = 0; for (const m of B.BIO.baked) if (m.isInstancedMesh && m.name === 'biome:leaf') tot += m.count;
  ok(tot === 40 * 40 * 3, 'merge: every leaf instance is in a mesh (' + tot + ')'); }

// ---------------------------------------------------------------- minTris: small chunk meshes coarsen
const Cm = page({ LOD: { merge: true, minTris: 5000 } }), bC = build(Cm);
const tuftsB = B.BIO.lodMeshes.filter(e => e.mesh.name === 'biome:tuft').length, tuftsC = Cm.BIO.lodMeshes.filter(e => e.mesh.name === 'biome:tuft').length;
ok(tuftsC < tuftsB, 'minTris: the tufts take fewer chunk meshes (' + tuftsB + ' -> ' + tuftsC + ')');
ok(bC.inst === bA.inst, 'minTris: the same instances');
{ let more = true; cams.forEach(c => { const b = shown(B.BIO, c).inst.split('|').filter(x => /tuft/.test(x)), s = new Set(shown(Cm.BIO, c).inst.split('|')); if (b.some(x => x && !s.has(x))) more = false; });
  ok(more, 'minTris: every tuft merge shows is still shown (a coarse box only reaches further)'); }
ok(Cm.BIO.lodMeshes.filter(e => e.minRange > 0).every(e => e.x1 - e.x0 === 1200), 'minTris: stand-ins keep their chunk (the negative: they would switch on late)');

// ---------------------------------------------------------------- BIO.chunk: a pass's own chunk
const D = page(), bD = build(D, { chunk: 300 });
const tufts = D.BIO.lodMeshes.filter(e => e.mesh.name === 'biome:tuft');
ok(tufts.length > 0 && tufts.every(e => e.x1 - e.x0 === 300), 'BIO.chunk 300: the tufts are chunked on 300 m (' + tufts.length + ' meshes)');
ok(A.BIO.lodMeshes.filter(e => e.mesh.name === 'biome:tuft').every(e => e.x1 - e.x0 === 1200), 'no BIO.chunk: the page chunk, 1200 m (the negative)');

// ---------------------------------------------------------------- the fade
const E = page({ LOD: { merge: true, fade: .15 } }); build(E);
const faded = E.BIO.lodMeshes.filter(e => e.fade);
ok(faded.length === E.BIO.lodMeshes.length, 'fade: every chunk mesh takes the fade (' + faded.length + ')');
ok(faded.every(e => e.mesh.geometry.attributes.aLodB && e.mesh.material.userData._lodFade), 'fade: each carries its box and ranges, its material wrapped');
{ const e = faded.find(x => x.ranges.length === 2 && x.mesh.isInstancedMesh), a = e.mesh.geometry.attributes.aLodB.data.array;
  ok(a[7] === -e.ranges[0] && a[8] === e.ends[0] && a[9] === e.ranges[1], 'fade: aLodB.w is minus the first range, aLodC the first end and the second range');
  ok(e.mesh.geometry.attributes.aLodA.isInterleavedBufferAttribute && !e.mesh.geometry.attributes.aLodA.isInstancedBufferAttribute, 'fade: the attributes are an interleaved buffer (the export skips them)'); }
{ const cam = new THREE.PerspectiveCamera(70, 1.6, .5, 20000), m = E.BIO.lodMeshes.find(e => e.minRange > 0 && e.fade);
  const d = m.minRange * .92, cx = (m.x0 + m.x1) / 2; cam.position.set(m.x0 - d, (m.y0 + m.y1) / 2, (m.z0 + m.z1) / 2); cam.lookAt(cx, (m.y0 + m.y1) / 2, (m.z0 + m.z1) / 2); cam.updateMatrixWorld();
  E.BIO.lodTick(cam); const vE = m.mesh.visible; B.BIO.lodTick(cam);
  const mB = B.BIO.lodMeshes.find(e => e.mesh.name === m.mesh.name && e.x0 === m.x0 && e.z0 === m.z0 && e.minRange === m.minRange);
  ok(vE && mB && !mB.mesh.visible, 'fade: a stand-in shows from the start of its band (' + Math.round(d) + ' m of ' + m.minRange + '), without the fade it does not'); }
{ const mat = new THREE.MeshLambertMaterial(); let hooked = 0; mat.onBeforeCompile = () => { hooked++; };
  const key0 = mat.customProgramCacheKey(); E.BIO.lodFade(mat);
  const sh = { uniforms: {}, vertexShader: THREE.ShaderLib.lambert.vertexShader, fragmentShader: THREE.ShaderLib.lambert.fragmentShader };
  mat.onBeforeCompile(sh);
  ok(hooked === 1 && /aLodB/.test(sh.vertexShader) && /discard/.test(sh.fragmentShader) && sh.uniforms.uLodF === E.BIO._lodU.f, 'lodFade: the page hook runs first, then the dither is injected');
  ok(mat.customProgramCacheKey() === key0 + '|lodfade', 'lodFade: the program key is the old one and a mark');
  const bad = { uniforms: {}, vertexShader: 'no main here', fragmentShader: 'nor here' }; mat.onBeforeCompile(bad);
  ok(bad.vertexShader === 'no main here' && !bad.uniforms.uLodF, 'lodFade: a shader with no main is left alone (the negative)');
  ok(E.BIO.lodFade(new THREE.RawShaderMaterial()) === false, 'lodFade: a raw shader is not wrapped (the negative)'); }
ok(!A.BIO.baked.some(m => m.geometry.attributes.aLodA), 'no fade: no mesh carries the fade attributes (the negative)');

// ---------------------------------------------------------------- per-instance labels (B5)
const L = page({ LOD: { merge: true } }); build(L, { label: true });
const lm = L.BIO.baked.find(m => m.name === 'biome:leaf' && m.userData.instLabels);
ok(lm && lm.userData.instLabels.names.join() === 'Leaves,Blossom', 'labels: the item keeps its label table: ' + (lm && lm.userData.instLabels.names.join()));
{ const A2 = lm.instanceMatrix.array; let right = true;
  for (let i = 0; i < lm.count; i++) { const want = Math.abs(A2[i * 16 + 13] - 11) < .01 ? 'Blossom' : 'Leaves'; if (L.BIO.instLabel(lm, i) !== want) right = false; }
  ok(right, 'labels: every row reads its own label after the merge sort (the middle leaf of each tree is the blossom)'); }
ok(L.BIO.instLabel(lm, null) === 'Leaves' && L.BIO.instLabel(lm, 1e9) === 'Leaves', 'labels: no row, or a row out of range, reads the item label (the negative)');
ok(!A.BIO.baked.some(m => m.userData.instLabels), 'labels: a kit that gives none bakes no table (the negative)');

// ---------------------------------------------------------------- core/tags on a merged page: each row names its own record
{ const P = page({ LOD: { merge: true }, tags: true }); build(P); let right = 0, wrong = 0, sorted = 0;
  for (const m of P.BIO.baked) { if (!m.isInstancedMesh || !m.krator) continue; const RS = P.BIO.recordsOf(m), T = P.BIO.tagReg(), set = T.get(RS.set), A = m.instanceMatrix.array;
    if (m.krator.idx) sorted++;
    for (let j = 0; j < m.count; j++) { const p = T.table(RS.set).pos(RS.index(j)); if (Math.abs(p[0] - A[j * 16 + 12]) + Math.abs(p[2] - A[j * 16 + 14]) < 1e-3) right++; else wrong++; } }
  ok(right > 0 && wrong === 0 && sorted > 0, 'tags: on a merged page every row maps to its own instance in the item set (' + right + ' rows, ' + sorted + ' meshes reordered)'); }

// ---------------------------------------------------------------- B4: the lathe's rep
function lathe(rep) { const P = page(), { BIO } = P; BIO.bucket('b', new THREE.MeshLambertMaterial());
  const rings = [{ x: 0, y: 0, z: 0, yy: 0, r: 2 }, { x: 0, y: 1, z: 0, yy: 1, r: 1.4 }, { x: 0, y: 2, z: 0, yy: 2, r: .6 }];
  BIO.lathe('b', rings, 8, rep, 1, R => R.r); return Array.from(BIO.buckets.b.uv.data()); }
{ const n = lathe(3), f = lathe(() => 3);
  ok(n.join() === f.join(), 'lathe: a function giving the number draws the same uvs');
  const g = lathe(R => R.r * 2.2), u = new Set(g.filter((v, i) => i % 2 === 0).map(v => Math.round(v * 1000) / 1000));
  ok([4, 3, 1].every(k => u.has(k)) && !u.has(4.4), 'lathe: rep(ring) rounds to whole repeats per ring (4, 3, 1), so each wrap is seamless');
  ok(n.join() !== g.join(), 'lathe: a varying rep moves the uvs (the negative)'); }

// ---------------------------------------------------------------- B7: BIO.dynamic names its kit
{ const P = page(), { BIO } = P; BIO.kit('fauna'); const im = BIO.dynamic('bird', new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), 4); BIO.kit('');
  const im2 = BIO.dynamic('fish', new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), 4);
  ok(im.userData.kit === 'fauna' && im2.userData.kit === '', 'dynamic: the mesh names the kit current when made ("fauna", then "")'); }

// ---------------------------------------------------------------- B6: animMat's zero rate
{ const P = page(), { BIO } = P;
  const src = o => { const m = BIO.animMat('k' + Math.random(), { mode: 'walk', flap: o }), sh = { uniforms: {}, vertexShader: THREE.ShaderLib.lambert.vertexShader, fragmentShader: THREE.ShaderLib.lambert.fragmentShader }; m.onBeforeCompile(sh); return sh.vertexShader; };
  ok(/uWindT\*0\.00 /.test(src({ rate: 0 })), 'animMat: flap rate 0 is a still wing (0.00)');
  ok(/uWindT\*6\.00 /.test(src({})), 'animMat: no rate is 6 (the negative)');
  ok(src({ rate: 0 }) === src({ rate: 1e-9 }), 'animMat: rate 0 draws what sedesert\'s 1e-9 did');
  ok(/_w \* _f \* 0\.000/.test(src({ amp: 0 })) && /_w \* _f \* 0\.350/.test(src({})), 'animMat: amp 0 is 0, no amp .35'); }

// ---------------------------------------------------------------- BIO.INDEX_ITEMS: welded item geometry (2026-10-26)
{ const P = page(), B = P.BIO, m = new THREE.MeshLambertMaterial();
  B.def('plain', new THREE.PlaneGeometry(1, 1, 2, 1), m, { label: 'p' });
  B.INDEX_ITEMS = true; B.def('welded', new THREE.PlaneGeometry(1, 1, 2, 1), m, { label: 'w' }); B.INDEX_ITEMS = false;
  const a = B.defs.plain, b = B.defs.welded, ga = a.geo, gb = b.geo;
  ok(!ga.index && ga.attributes.position.count === 12, 'INDEX_ITEMS off: the item is triangle soup as before (12 vertices for 4 triangles)');
  ok(gb.index && gb.attributes.position.count === 6 && gb.index.count === 12 && b.tris === 4, 'INDEX_ITEMS on: 6 welded vertices, 12 indices, still 4 triangles');
  let same = true; for (let i = 0; i < 12; i++) for (let c = 0; c < 3; c++) if (ga.attributes.position.array[i * 3 + c] !== gb.attributes.position.array[gb.index.array[i] * 3 + c]) same = false;
  ok(same, 'the welded item draws the same triangles in the same order');
  B.def('opt', new THREE.PlaneGeometry(1, 1), m, { label: 'o', indexed: false }); ok(!B.defs.opt.geo.index, 'opt.indexed false keeps the soup');
  const g3 = new THREE.PlaneGeometry(1, 1).toNonIndexed(), col = new Float32Array(18); for (let i = 0; i < 6; i++) col[i * 3] = i;   /* every vertex its own colour: nothing welds */
  g3.setAttribute('color', new THREE.BufferAttribute(col, 3)); B.def('distinct', g3, m, { label: 'd', indexed: true });
  ok(!B.defs.distinct.geo.index, 'negative: vertices that differ in any attribute are not welded'); }

// ---------------------------------------------------------------- BIO.LOD.cull: per-instance ranges for loose items (2026-10-26)
{ const P = page({ LOD: { merge: true, fade: .15, cull: true } }), B = P.BIO; build(P);
  const tuft = B.lodMeshes.filter(e => e.mesh.name === 'biome:tuft'), leaf = B.lodMeshes.filter(e => e.mesh.name === 'biome:leaf');
  const z = e => e.mesh.geometry.attributes.aLodB && e.mesh.geometry.attributes.aLodB.getZ(0);
  ok(tuft.length && tuft.every(e => e.loose && z(e) === -1), 'cull: the floor tufts (no tree owns them) are loose, their minRange slot -1');
  ok(leaf.length && leaf.every(e => !e.loose && z(e) === 0), '  negative: the leaves a tree owns (BIO.owner set) are not: they switch with their tree');
  const Q = page({ LOD: { merge: true, fade: .15 } }), C = Q.BIO; build(Q);
  ok(C.lodMeshes.filter(e => e.mesh.name === 'biome:tuft').every(e => !e.loose && e.mesh.geometry.attributes.aLodB.getZ(0) === 0), 'cull off (the default): nothing is loose');
  const g = B.LODFADE_GLSL.vertexMain; ok(/instanceMatrix \* vec4\(0\.0, 0\.0, 0\.0, 1\.0\)/.test(g) && /_lcull = 1\.0/.test(g), 'the fade chunk measures a loose instance by its own origin and marks it culled past its range'); }

console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
