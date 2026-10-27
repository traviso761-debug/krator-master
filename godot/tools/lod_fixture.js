// ================================================================= THE LOD FIXTURE — a merged LOD page in node, for Godot
// node godot/tools/lod_fixture.js: writes godot/data/world-lod/ (world.json, world.glb, expect.json), the case
// godot/tests/export/lod_test.gd reads. A small biome page built in node as core/export/test-export.js builds its merged
// page: BIO.LOD.merge with the fade and the cull (core/biome 20-core-kit.js), leaves a tree owns in two ranges (one of them
// labelled Blossom per instance: BIO.put's extra.label), a bark bucket in the same two ranges, loose floor tufts, and two
// hazards (core/hazard) in the registry. Exported through core/export (the split by range, the labels table, the hazards
// section) and EXPORT.glb, the same route tools/harness.py export takes.
// expect.json: for a few cameras, the rows each record shows under three's rule (BIO.lodTick's chunk box for the leaves
// and the bark, the instance's own origin for a loose item: BIO.LOD.cull), which the importer's shader twin must reproduce;
// and each leaf row's label. Deterministic: rerun it after a change to core/export, core/biome's LOD or core/hazard.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..'), OUT = path.join(ROOT, 'godot', 'data', 'world-lod');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
const c = { console, Math, THREE, Buffer, btoa: s => Buffer.from(s, 'binary').toString('base64') }; c.globalThis = c; vm.createContext(c);
['core/rand/08-core-rand.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js', 'core/biome/37-core-traps.js', 'core/hazard/20-core-hazard.js',
 'core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/30-core-foliage.js', 'core/biome/35-core-anim.js', 'core/biome/42-core-export.js',
 'core/export/07-core-export.js', 'core/export/09-core-export-adapters.js']
  .forEach(f => vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : '') + (f.endsWith('07-core-export.js') ? '\nthis.EXPORT=EXPORT;' : ''), c, { filename: f }));
const B = c.BIO, E = c.EXPORT;
B.init({ THREE, scene: new THREE.Scene(), seed: 3, err: m => { throw new Error(m); }, terrainH: () => 0, waterH: () => -1 });
Object.assign(B.LOD, { merge: true, fade: .15, cull: true });
const leafMat = new THREE.MeshLambertMaterial(); leafMat.userData.bio = vm.runInContext("({ kind: 'leaf', key: 'lod|leaf', opts: { swayA: 0 } })", c);   /* made in the page's realm: the export's plain() takes only its own objects */
const tuftMat = new THREE.MeshLambertMaterial(); tuftMat.userData.bio = vm.runInContext("({ kind: 'leaf', key: 'lod|tuft', opts: { swayA: 0 } })", c);
B.kit('lod');
B.def('leaf', new THREE.PlaneGeometry(2, 2), leafMat, { label: 'Leaves' });
B.def('tuft', new THREE.PlaneGeometry(.5, .5), tuftMat, { label: 'Grass' });
B.bucket('bark', new THREE.MeshLambertMaterial());
let n = 0;
for (let x = 0; x < 1200; x += 150) for (let z = 0; z < 1200; z += 150) {
  const r = (n++ % 3) === 0 ? 800 : 1200; B.owner = [x, z]; B.range = r;
  for (let k = 0; k < 3; k++) B.put('leaf', [x + k, 10 + k, z], null, 1, 0x88aa66, k === 1 ? { label: 'Blossom' } : null);
  B.tube('bark', [{ x, y: 0, z, r: .5 }, { x, y: 10, z, r: .3 }], 0x664422, { seg: 6 });
  B.owner = null; B.range = r === 800 ? 300 : 500; B.put('tuft', [x + 20, 0, z + 20], null, 1, 0x99bb55);
}
B.range = null; B.owner = null; B.bake();
const T = c.KTAGS.create({ build: 'lod-fixture' }); c.KTAGS.page = T;
T.add({ 'class': 'feature', kind: 'pool', name: 'Acid pool', at: [300, 0, 300], r: 4, h: 2, tags: { hazard: { kind: 'acid' } } });
T.add({ 'class': 'feature', kind: 'hollow', name: 'CO2 hollow', at: [700, 2, 500], r: 30, h: 8, tags: { hazard: { kind: 'gas' } } });
const W = E.world({ build: 'lod-fixture', sections: ['items', 'buckets', 'materials', 'textures', 'registry', 'hazards'] });
const chk = E.check(W);
if (!chk.ok) throw new Error('the fixture fails EXPORT.check: ' + chk.problems.join('; '));
// three's rule, from the records: a row of a non-loose record is drawn while the camera is within its range of the
// chunk box (x, z: the chunk; y: the rows of every record of that chunk mesh), a loose row while it is within its range
const un = E.unpack, CH = 1200;
const meshY = new Map();
for (const r of W.items.concat(W.buckets)) {
  const k = r.kit + '/' + r.name + '@' + r.lod.chunk; let y = meshY.get(k) || [Infinity, -Infinity];
  if (r.matrices) { const M = un(r.matrices); for (let j = 0; j < r.count; j++) y = [Math.min(y[0], M[j * 16 + 13]), Math.max(y[1], M[j * 16 + 13])]; }
  else { const P = un(r.geometry.position); for (let i = 1; i < P.length; i += 3) y = [Math.min(y[0], P[i]), Math.max(y[1], P[i])]; }
  meshY.set(k, y);
}
const cams = [[0, 1.7, 0], [600, 40, 600], [-700, 100, 600], [2000, 300, 2000], [1300, 30, -100]];
const shown = cams.map(cam => { const o = {};
  for (const r of W.items.concat(W.buckets)) {
    const C = r.lod.size == null ? CH : r.lod.size, ch = r.lod.chunk.split(',').map(Number), x0 = ch[0] * C, z0 = ch[1] * C, y = meshY.get(r.kit + '/' + r.name + '@' + r.lod.chunk);
    const box = Math.hypot(Math.max(x0 - cam[0], 0, cam[0] - x0 - C), Math.max(y[0] - cam[1], 0, cam[1] - y[1]), Math.max(z0 - cam[2], 0, cam[2] - z0 - C));
    if (!r.matrices) { o[r.id] = box <= r.lod.range ? 1 : 0; continue; }
    const M = un(r.matrices); let s = 0;
    for (let j = 0; j < r.count; j++) { const d = r.lod.loose ? Math.hypot(M[j * 16 + 12] - cam[0], M[j * 16 + 13] - cam[1], M[j * 16 + 14] - cam[2]) : box; if (d <= r.lod.range) s++; }
    o[r.id] = s; }
  return { cam, rows: o }; });
const labels = {};
for (const r of W.items) if (r.labels) { const L = un(r.labels.index); labels[r.id] = Array.from(L, i => r.labels.names[i]); }
const G = E.glb(W);
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'world.json'), JSON.stringify(G.json));
fs.writeFileSync(path.join(OUT, 'world.glb'), Buffer.from(G.glb));
fs.writeFileSync(path.join(OUT, 'expect.json'), JSON.stringify({ cameras: shown, labels, items: W.items.map(r => ({ id: r.id, count: r.count, lod: r.lod })),
  buckets: W.buckets.map(b => ({ id: b.id, triangles: b.triangles, lod: b.lod })), hazards: W.hazards.records.map(h => ({ id: h.id, type: h.shape.type, at: h.at })) }, null, 1));
console.log('wrote ' + path.relative(ROOT, OUT).replace(/\\/g, '/') + ': ' + W.items.length + ' items (' + W.stats.instances + ' instances), ' + W.buckets.length + ' buckets, ' +
  W.hazards.records.length + ' hazards, glb ' + G.stats.bytes + ' bytes');
