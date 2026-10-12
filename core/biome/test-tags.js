// node core/biome/test-tags.js: the biome core on core/tags (20-core-kit.js, "core/tags: what a kit places, as
// records"; 42-core-export.js, the export's ids), each check with a negative. One small kit is built twice, with
// BIO.init({tags}) and without, from the same calls: the meshes must be identical, and with tags every instance a
// mesh draws must name its item set's record and carry the uid KTAGS.uid(class, key, its matrix position).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };

// one page: core/rand, core/tags, the biome core's head, kit and export, and a kit 'k' built by the same calls
// late: core/tags loads after BIO.init (a kit's build.py lists it among the 50s), and the host registers a volume first
function page(tags, late) {
  const ctx = { console, Math, THREE, btoa: s => Buffer.from(s, 'binary').toString('base64') };
  ctx.globalThis = ctx; vm.createContext(ctx);
  const TAGS = ['core/rand/08-core-rand.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js'];
  const load = f => vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : ''), ctx, { filename: f });
  for (const f of (late ? [] : TAGS).concat(['core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/42-core-export.js'])) load(f);
  const BIO = ctx.BIO, errs = [];
  const REG = [];
  BIO.init({ THREE, scene: new THREE.Scene(), seed: 3, err: m => errs.push(m), register: o => { REG.push(o); BIO.record(o); },
    tags: tags ? 'test' : undefined });
  if (late) {   // a volume, and an item put and never put again, both before core/tags is there
    BIO.register({ name: 'The map', x: 0, z: 0, r: 5000, h: 500 });
    BIO.def('early', new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
    BIO.put('early', [1, 2, 3], null, 1, 0xffffff); BIO.put('early', [4, 5, 6], null, 1, 0xffffff);
    TAGS.forEach(load);
  }
  const solid = new THREE.MeshBasicMaterial(), anim = new THREE.MeshBasicMaterial();
  anim.userData.bio = { kind: 'anim', key: 'k|dart' };
  BIO.kit('k');
  BIO.def('clump', new THREE.PlaneGeometry(2, 1), solid, { label: 'Clump foliage' });
  BIO.def('boulder', new THREE.IcosahedronGeometry(1, 0), solid, { label: 'Boulders' });
  BIO.def('dart', new THREE.BoxGeometry(0.2, 0.1, 0.4), anim, { attrs: ['aP0', 'aP1'], label: 'Darts' });
  BIO.bucket('bark', solid);
  const PLANT = { name: 'Clump plant', tags: { climate: 'temperate', aridity: 'semiarid..humid', abyssal: false, riparian: 'both',
    harvest: { wood: 'none', edible: ['leaves'], medicinal: false } } };
  const api = {
    TAGS: { climate: 'temperate', aridity: 'humid', abyssal: false, riparian: 'both', koppen: ['Cfb'] },
    SPECIES: [{ key: 'oak', name: 'Oak', tags: { climate: 'temperate', aridity: 'humid', abyssal: false, riparian: 'no',
      harvest: { wood: 'timber', edible: [], medicinal: false } } }],
    PLANTS: { clumpy: PLANT },
    plantOfItem: item => item === 'clump' ? PLANT : null,
    build() {
      const { rng, reseed } = BIO.fn; reseed(11);
      // a tree: a registered volume and its bole in the bucket; a log far from it in no volume
      BIO.register({ name: 'Oak', key: 'oak', kind: 'tree', x: 10, y: 2, z: -20, r: 6, h: 18 });
      BIO.register({ name: 'A cave', cls: 'carve', x: -500, y: 0, z: 500, r: 4, h: 6 });   // a host's own class: not core/tags'
      BIO.tube('bark', [{ x: 10, y: 1.5, z: -20, r: .8 }, { x: 10.3, y: 9, z: -20.2, r: .5 }, { x: 10.1, y: 16, z: -19.8, r: .3 }], 0x886644, { seg: 6 });
      BIO.tube('bark', [{ x: 200, y: 0, z: 200, r: .5 }, { x: 206, y: 0.4, z: 201, r: .5 }], 0x664422, { seg: 5 });
      for (let i = 0; i < 300; i++) {
        BIO.range = i % 3 === 0 ? 900 : null;   // two LOD groups: the meshes' rows are not the set's order
        const x = (rng() - .5) * 2400, z = (rng() - .5) * 2400;
        BIO.put('clump', [x, 1 + rng() * 9, z], BIO.fn.qEuler(0, rng() * 6.28, 0), [1 + rng(), 1, 1 + rng()], 0x44aa44);
        if (i % 4 === 0) BIO.put('boulder', [x + 3, 0, z + 1], null, 0.5 + rng(), 0x777777);
      }
      BIO.range = null;
      BIO.cur = 'k/fauna';
      for (let i = 0; i < 20; i++) BIO.put('dart', [i * 7.31, 30, -i * 3.17], null, 1, 0xffffff, { aP0: [i, 0, 0, 1], aP1: [0, 0, 1, 1] });
      BIO.cur = null;
    },
    more() { BIO.put('clump', [1.25, 2.5, -3.75], null, 1, 0x00ff00); BIO.put('clump', [-7.5, 1, 9.05], null, 2, 0x00ff00); }
  };
  BIO.kitEnd(api);
  api.build();
  const b1 = BIO.bake();
  api.more();
  BIO.bake();
  const dyn = BIO.dynamic('deer', new THREE.BoxGeometry(1, 1, 2), solid, 4, { label: 'Deer' });
  const M = new THREE.Matrix4();
  for (let i = 0; i < 4; i++) { M.makeTranslation(i * 3.5, 0, 50 + i); dyn.setMatrixAt(i, M); }
  return { ctx, BIO, K: ctx.KTAGS, T: tags ? ctx.KTAGS.page : null, errs, REG, b1 };
}

const A = page(true), B = page(false), L = page(true, true);
const { BIO, K, T } = A;
ok(!A.errs.length && !B.errs.length, 'both builds run clean' + (A.errs.length || B.errs.length ? ': ' + A.errs.concat(B.errs).join('; ') : ''));

// ---- nothing drawn moved: the same meshes, rows, colours and geometry with tags and without ----
const sig = P => P.BIO.baked.map(m => [m.name, m.isInstancedMesh ? m.count : 0,
  Buffer.from(m.isInstancedMesh ? m.instanceMatrix.array.buffer : m.geometry.attributes.position.array.buffer).toString('base64'),
  m.instanceColor ? Buffer.from(m.instanceColor.array.buffer).toString('base64') : '',
  Object.keys(m.geometry.attributes).sort().join()].join('|'));
const sa = sig(A), sb = sig(B);
ok(sa.length === sb.length && sa.every((s, i) => s === sb[i]), 'every mesh identical with tags and without (' + sa.length + ' meshes)');
ok(sig({ BIO: { baked: A.BIO.baked.slice(1) } }).join() !== sb.join(), 'negative: the signature tells two mesh lists apart');
ok(B.ctx.KTAGS.page === undefined && B.BIO.baked.every(m => !m.krator && m.userData.krator === undefined), 'without tags: no registry, nothing on any mesh');
ok(A.BIO.baked.filter(m => m.isInstancedMesh).length > 3, 'the LOD key split items over several meshes (' + A.BIO.baked.length + ' meshes)');

// ---- the records ----
const sets = T.sets(), by = {}; sets.forEach(s => by[s.key] = s);
ok(sets.length === 4 && by.clump && by.boulder && by.dart && by.deer, 'one item set per item put, and one per dynamic mesh: ' + sets.map(s => s.id + ' ' + s.key).join(', '));
ok(by.clump['class'] === 'flora' && by.boulder['class'] === 'feature' && by.boulder.kind === 'rock' && by.dart['class'] === 'life' && by.deer['class'] === 'life',
  'classes: a plant flora, a stone a feature (rock), an animal (anim material, aP0) and a dynamic mesh life');
ok(by.clump.kind === 'clumpy' && by.clump.name === 'Clump plant' && by.clump.tags.biome === 'k' && by.clump.tags.harvest.edible[0] === 'leaves' &&
  by.clump.tags.aridity === 'semiarid..humid' && by.clump.tags.koppen[0] === 'Cfb', 'the plant\'s kind, name and tags: biome, the kit\'s TAGS, its own harvest');
ok(T.count(by.clump) === 302 && T.count(by.boulder) === 75 && T.count(by.dart) === 20 && T.count(by.deer) === 4, 'counts: every put, both bakes');
const audit = T.audit();
ok(audit.unknown === 0, 'zero unknown vocabulary' + (audit.unknown ? ': ' + JSON.stringify(audit.unknownKeys) + JSON.stringify(audit.unknownValues) : ''));
ok(audit.sets === 4 && audit.instances === 401 && audit.instancesByClass.flora === 302, 'the audit counts sets and instances: ' + JSON.stringify(audit.instancesByClass));
const vol = T.query({ 'class': 'flora', kind: 'oak' });
ok(vol.length === 1 && vol[0].r === 6 && vol[0].h === 18 && vol[0].tags.harvest.wood === 'timber' && A.REG.length === 2,
  'a registered volume is one record (BIO.register and the host\'s REGISTER both saw it: recorded once)');

const Lt = L.ctx.KTAGS.page;
const early = Lt && Lt.query({ key: 'early' })[0];
ok(!!early && early.set && Lt.count(early) === 2 && Lt.instance(early, 1).uid === L.ctx.KTAGS.uid('flora', 'early', [4, 5, 6]),
  'an item put only before core/tags loaded gets its set at bake, with both instances');
ok(!L.errs.length && Lt && Lt.sets().length === 5 && Lt.count(Lt.query({ key: 'clump' })[0]) === T.count(T.sets()[0]) && Lt.query({ key: 'The map' }).length === 1 &&
  Lt.query({ key: 'The map' })[0]['class'] === 'feature' && Lt.get('feat_00000').name === 'The map',
  'core/tags loaded after BIO.init: the volume registered before it waits and is recorded first; the sets are whole');
ok(L.REG.length === 3 && Lt.records.length === T.records.length + 2, 'the late page holds the early page\'s records, the map and the early item, nothing else');

const cave = T.query({ key: 'A cave' })[0];
ok(!!cave && cave['class'] === 'feature' && cave.kind === 'carve' && !A.errs.length, 'a host\'s own class that core/tags does not know (carve) is a feature of that kind, not an error');

// ---- every row of every mesh names its set and carries the uid of its own position ----
let rows = 0, bad = 0, seen = {};
for (const m of BIO.baked) {
  if (!m.isInstancedMesh) continue;
  const R = BIO.recordsOf(m), A16 = m.instanceMatrix.array, set = T.get(R.set);
  for (let j = 0; j < m.count; j++) {
    const at = [A16[j * 16 + 12], A16[j * 16 + 13], A16[j * 16 + 14]], want = K.uid(set['class'], set.key, at), i = R.index(j);
    const inst = T.instance(set, i);
    rows++;
    if (K.hex(R.uid32(j)) !== want || inst.uid !== want || inst.at.join() !== at.join() || inst.id !== set.id + '#' + i) bad++;
    (seen[set.id] = seen[set.id] || []).push(i);
  }
}
ok(rows === 401 && bad === 0, 'every instance row: uid = KTAGS.uid(class, key, its matrix position), T.instance agrees on id, uid and at (' + rows + ' rows, ' + bad + ' bad)');
ok(Object.keys(seen).every(id => { const s = seen[id].slice().sort((a, b) => a - b); return s.every((v, k) => v === k) && s.length === T.count(id); }),
  'each set\'s rows across its meshes are its instances 0..n-1, each once');
const c0 = BIO.baked.find(m => m.name === 'biome:clump' && m.krator.idx);
ok(!!c0 && Array.from(c0.krator.idx).some((v, k, a) => k > 0 && v !== a[k - 1] + 1), 'negative: in a LOD group\'s mesh the rows are not the set\'s order (the index table is needed)');
const last = T.instance(by.clump, 301);
ok(Math.abs(last.at[0] + 7.5) < 1e-6 && Math.abs(last.at[2] - 9.05) < 1e-5 && T.get(by.clump.id + '#301').uid === last.uid,
  'a second bake continues the set: instance 301 is the last clump put, and T.get finds it by its id');
ok(T.instance(by.clump, 302) === null && T.get(by.clump.id + '#999') === null, 'an index past the set is no instance');
ok(Math.abs(T.instance(by.clump, 301).size[2] - 2) < 1e-6 && Math.abs(T.instance(by.clump, 301).size[0] - 4) < 1e-6, 'size: the unit geometry\'s box, scaled (2 x 1 plane at scale 2: 4 wide, 2 tall)');
// a negative: a moved instance no longer matches its uid
const m0 = BIO.baked.find(m => m.name === 'biome:boulder'), R0 = BIO.recordsOf(m0), u0 = K.hex(R0.uid32(0));
m0.instanceMatrix.array[12] += 0.2;
ok(K.hex(R0.uid32(0)) !== u0 && T.uidOf(T.get(R0.set), R0.index(0)) !== u0, 'negative: moving an instance 20 cm changes its uid');
m0.instanceMatrix.array[12] -= 0.2;
const dm = BIO.baked.find(m => m.name === 'biome:deer'), RD = BIO.recordsOf(dm);
ok(RD && T.instance(RD.set, 2).at[0] === 7 && T.instance(RD.set, 2).uid === K.uid('life', 'deer', [7, 0, 52]), 'a dynamic mesh\'s instance is where its matrix is now');

// ---- the export: per item, the set and a uid per instance aligned with the matrices; per bucket, what it merges ----
const ex = BIO.export({ textures: false });
const un = (t, C) => { const b = Buffer.from(t.b64, 'base64'); return new C(b.buffer, b.byteOffset, t.n); };
let erows = 0, ebad = 0;
for (const it of ex.items) {
  const M2 = un(it.matrices, Float32Array), ix = un(it.recordIndex, Uint32Array), set = T.get(it.record);
  if (it.records.length !== it.count || ix.length !== it.count) ebad++;
  for (let j = 0; j < it.count; j++) {
    erows++;
    if (it.records[j] !== K.uid(set['class'], set.key, [M2[j * 16 + 12], M2[j * 16 + 13], M2[j * 16 + 14]]) || T.instance(set, ix[j]).uid !== it.records[j]) ebad++;
  }
}
ok(ex.items.length === BIO.baked.filter(m => m.isInstancedMesh).length && erows === 401 && ebad === 0,
  'export: every item names its set (record), and records[j] is the uid of matrix j, recordIndex[j] its instance (' + erows + ' rows)');
const bk = ex.buckets.find(b => b.name === 'bark');
ok(bk && bk.records.length === 1 && bk.records[0] === vol[0].uid && bk.recordIds[0] === vol[0].id && bk.pieces.n === 2 && bk.pieces.unowned === 1,
  'export: the bucket lists the tree whose bole it merges, and counts the log in no volume as unowned' + (bk ? ' ' + JSON.stringify({ r: bk.records, p: bk.pieces }) : ''));
ok(ex.stats.records.instances === 401 && ex.tags.build === 'test', 'export stats: ' + JSON.stringify(ex.stats.records));
const tile = BIO.export({ textures: false, box: [-600, -600, 0, 0], ground: false });
let tbad = 0, trows = 0;
for (const it of tile.items) { const M2 = un(it.matrices, Float32Array), set = T.get(it.record); for (let j = 0; j < it.count; j++) { trows++;
  if (it.records[j] !== K.uid(set['class'], set.key, [M2[j * 16 + 12], M2[j * 16 + 13], M2[j * 16 + 14]])) tbad++; } }
ok(trows > 0 && trows < erows && tbad === 0, 'a tile keeps its records aligned with the instances it keeps (' + trows + ' rows)');
const exB = B.BIO.export({ textures: false });
ok(exB.items.every(it => it.records === undefined && it.record === undefined) && exB.buckets.every(b => b.records === undefined) && !exB.tags,
  'without tags the export is as before (no record fields)');
const noRec = BIO.export({ textures: false, records: false });
ok(noRec.items.every(it => it.records === undefined) && noRec.buckets.every(b => b.records === undefined), 'opt.records: false leaves the ids out');

console.log(fails ? fails + ' failed' : 'all passed');
process.exit(fails ? 1 : 0);
