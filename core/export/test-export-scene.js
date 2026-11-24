// node core/export/test-export-scene.js: the scene reader (10-core-export-scene.js) on a small three.js scene built here.
// What GODOT-LOOK-PLAN.md section 13 asks of it: a material says which side it draws (front, back or double), a mirrored
// mesh's triangles are turned over when its matrix is baked into a bucket, and a bucket or an item whose mesh is a
// closed solid says so. Each check has a negative.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
const ctx = { console, Math, THREE, Buffer, btoa: s => Buffer.from(s, 'binary').toString('base64'), atob: s => Buffer.from(s, 'base64').toString('binary') };
ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['core/export/07-core-export.js', 'core/export/10-core-export-scene.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8') + (f.endsWith('07-core-export.js') ? '\nthis.EXPORT=EXPORT;' : ''), ctx, { filename: f });
const E = ctx.EXPORT;

const scene = new THREE.Scene();
const mat = side => new THREE.MeshStandardMaterial({ side, color: side === THREE.BackSide ? 0x112233 : side === THREE.DoubleSide ? 0x445566 : 0x778899 });
const front = mat(THREE.FrontSide), back = mat(THREE.BackSide), both = mat(THREE.DoubleSide), mirrorM = new THREE.MeshStandardMaterial({ color: 0xaa0000 });
const add = (g, m, f) => { const o = new THREE.Mesh(g, m); if (f) f(o); scene.add(o); o.updateMatrixWorld(true); return o; };
add(new THREE.BoxGeometry(2, 2, 2), front, o => o.position.set(0, 1, 0));                     // a closed box
add(new THREE.PlaneGeometry(2, 2), both, o => o.position.set(10, 1, 0));                      // an open sheet
add(new THREE.BoxGeometry(2, 2, 2), back, o => o.position.set(20, 1, 0));                     // a shell seen from inside
add(new THREE.BoxGeometry(1, 2, 3), mirrorM, o => { o.position.set(30, 1, 0); o.scale.set(-1, 1, 1); });   // mirrored
const inst = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), front, 2);
inst.setMatrixAt(0, new THREE.Matrix4().makeTranslation(0, 5, 0)); inst.setMatrixAt(1, new THREE.Matrix4().makeTranslation(3, 5, 0));
scene.add(inst); inst.updateMatrixWorld(true);
const card = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), both, 1); card.setMatrixAt(0, new THREE.Matrix4().makeTranslation(6, 5, 0)); scene.add(card);

const box = [-100, -100, 100, 100];
const out = E.sceneReader({ name: 't', scene }).assemble({ box, inBox: (x, z) => x >= box[0] && x < box[2] && z >= box[1] && z < box[3] });
const matOf = id => out.materials.find(m => m.id === id);
const bucketOf = m => out.buckets.find(b => matOf(b.material).colour === '#' + m.color.getHexString());

// 1. a material's side
T.ok('a material says which side it draws', matOf(bucketOf(front).material).side === 'front' && matOf(bucketOf(back).material).side === 'back' && matOf(bucketOf(both).material).side === 'double',
  out.materials.map(m => m.side).join(','));
T.ok('doubleSided is kept as it was, for the readers that take it', matOf(bucketOf(both).material).doubleSided === true && matOf(bucketOf(back).material).doubleSided === false);
T.neg('a back-side shell is not told apart by doubleSided alone', r => r.side !== 'front', { side: matOf(bucketOf(front).material).side }, { side: matOf(bucketOf(back).material).side });

// 2. a mirrored mesh's triangles face outward after the bake
const outward = b => { const P = E.unpack(b.geometry.position), I = E.unpack(b.geometry.index); let c = [0, 0, 0]; const n = P.length / 3;
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) c[k] += P[i * 3 + k] / n;
  let good = 0, bad = 0;
  for (let t = 0; t < I.length; t += 3) { const a = I[t] * 3, bb = I[t + 1] * 3, cc = I[t + 2] * 3;
    const u = [P[bb] - P[a], P[bb + 1] - P[a + 1], P[bb + 2] - P[a + 2]], v = [P[cc] - P[a], P[cc + 1] - P[a + 1], P[cc + 2] - P[a + 2]];
    const nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2], nz = u[0] * v[1] - u[1] * v[0];
    (nx * (P[a] - c[0]) + ny * (P[a + 1] - c[1]) + nz * (P[a + 2] - c[2]) > 0 ? good++ : bad++); }
  return { good, bad }; };
const mb = bucketOf(mirrorM), plain = bucketOf(front), wo = outward(mb), po = outward(plain);
T.ok('a mirrored box bakes with every triangle wound outward, as an unmirrored one does', wo.bad === 0 && wo.good === 12 && po.bad === 0 && po.good === 12 && mb.mirrored === 12 && plain.mirrored === 0,
  JSON.stringify([wo, po, mb.mirrored]));
const unflipped = JSON.parse(JSON.stringify(mb)); { const I = E.unpack(mb.geometry.index); for (let t = 0; t < I.length; t += 3) { const x = I[t + 1]; I[t + 1] = I[t + 2]; I[t + 2] = x; } unflipped.geometry.index = E.pack(I); }
T.neg('the bake without the turn would face inward', b => outward(b).bad === 0, unflipped, mb);
const nrm = E.unpack(mb.geometry.normal), pos = E.unpack(mb.geometry.position);
let nOut = true; for (let i = 0; i < pos.length; i += 3) if (nrm[i] * (pos[i] - 30) + nrm[i + 1] * (pos[i + 1] - 1) + nrm[i + 2] * pos[i + 2] <= 0) nOut = false;
T.ok('and its normals point outward too', nOut);

// 3. closed
T.ok('a box is a closed solid, a sheet is not', plain.closed === true && bucketOf(both).closed === false && bucketOf(back).closed === true && mb.closed === true);
const sph = out.items.find(i => i.count === 2), crd = out.items.find(i => i.count === 1);
T.ok('an item says so of its own mesh: a sphere closed, a card open', sph.closed === true && crd.closed === false);
const cube = new THREE.BoxGeometry(1, 1, 1), holed = Array.from(cube.index.array).slice(3);   // one triangle gone
T.neg('a solid with a triangle missing is not closed', I => E.sceneClosed(cube.attributes.position.array, I), holed, Array.from(cube.index.array));
const inside = Array.from(cube.index.array); { const x = inside[1]; inside[1] = inside[2]; inside[2] = x; }   // one triangle turned over
T.neg('nor one with a triangle wound the other way', I => E.sceneClosed(cube.attributes.position.array, I), inside, Array.from(cube.index.array));
T.ok('two boxes in one bucket are still closed (each edge has its pair)', (() => { const a = new THREE.BoxGeometry(1, 1, 1), b = new THREE.BoxGeometry(1, 1, 1); b.translate(5, 0, 0);
  const P = Float32Array.from([...a.attributes.position.array, ...b.attributes.position.array]), n = a.attributes.position.count;
  return E.sceneClosed(P, [...a.index.array, ...Array.from(b.index.array).map(i => i + n)]); })());
T.done();
