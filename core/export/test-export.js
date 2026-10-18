// node core/export/test-export.js: the krator-world container (core/export/README.md), each check with a negative.
// One small biome page is built in node (core/rand, core/tags, core/terrain's field, the biome core and a kit 'k', as
// core/biome/test-tags.js builds it), then exported through core/export: the sections, the joins by id, the thin
// BIO.export, a tile's compaction and cropping, the terrain, a library texture by reference, the glb, and the failures
// that must not be fatal (a throwing contributor) or must be (an unknown section).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };

const CORE = ['core/rand/08-core-rand.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js', 'core/terrain/30-core-field.js',
  'core/materials/record/23-mat-record.js'];
const EXP = ['core/export/07-core-export.js', 'core/export/09-core-export-adapters.js'];
const BIOF = ['core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/42-core-export.js'];
// late: core/export loads after the biome core (its contributors wait in EXPORT_QUEUE)
function page(late) {
  const ctx = { console, Math, THREE, Buffer, btoa: s => Buffer.from(s, 'binary').toString('base64'), atob: s => Buffer.from(s, 'base64').toString('binary') };
  ctx.globalThis = ctx; vm.createContext(ctx);
  const load = f => vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : '') +
    (f.endsWith('07-core-export.js') ? '\nthis.EXPORT=EXPORT;' : '') + (f.endsWith('23-mat-record.js') ? '\nthis.KMAT=KMAT;' : '') +
    (f.endsWith('30-core-field.js') ? '\nthis.KFIELD=KFIELD;' : ''), ctx, { filename: f });
  CORE.forEach(load);
  (late ? BIOF.concat(EXP) : EXP.concat(BIOF)).forEach(load);
  const BIO = ctx.BIO, errs = [];
  // the ground: a slope with a bump, baked onto a field on a 4 m grid; water 1 m deep where the ground is under 0
  const g = (x, z) => 0.02 * x - 0.01 * z + 3 * Math.sin(x / 40) * Math.cos(z / 55);
  const F = ctx.KFIELD.bake(g, [-1300, -1300, 1300, 1300], 4, { water: { lake: (x, z) => g(x, z) < 0 ? 0 : NaN } });
  BIO.init({ THREE, scene: new THREE.Scene(), seed: 3, err: m => errs.push(m), register: o => BIO.record(o), tags: 'test',
    terrainH: (x, z) => F.h(x, z), waterH: (x, z) => F.waterH(x, z), field: F });
  // a library pack: one family whose map is a data URL; a material that takes it (as BIO.libSwap would) and one that does not
  const URL = 'data:image/webp;base64,UklGRgAAAABXRUJQ';
  ctx.KMAT.pack('k', { bark0: { lib: 'bark.test', scale: [4, 6], map: URL } });
  ctx.KMAT.adapter('k', { plank: { id: 'k.plank', family: 'plank', lib: 'wood.test', scale: [2, 2] } });
  const libTex = new THREE.Texture(); libTex.image = { src: URL, width: 512, height: 512 }; libTex.repeat.set(0.32, 0.32); libTex.offset.set(0.34, 0.34);
  const otherTex = new THREE.Texture(); otherTex.image = { src: 'data:image/webp;base64,b3RoZXI=', width: 8, height: 8 };
  const solid = new THREE.MeshStandardMaterial({ map: libTex }), plainM = new THREE.MeshBasicMaterial({ map: otherTex }), anim = new THREE.MeshBasicMaterial();
  anim.userData.bio = { kind: 'anim', key: 'k|dart' };
  BIO.kit('k');
  BIO.def('clump', new THREE.PlaneGeometry(2, 1), plainM, { label: 'Clump foliage' });
  BIO.def('boulder', new THREE.IcosahedronGeometry(1, 0), solid, { label: 'Boulders' });
  BIO.def('dart', new THREE.BoxGeometry(0.2, 0.1, 0.4), anim, { attrs: ['aP0', 'aP1'], label: 'Darts' });
  BIO.bucket('bark', solid);
  const api = {
    TAGS: { climate: 'temperate', aridity: 'humid', abyssal: false, riparian: 'both', koppen: ['Cfb'] },
    SPECIES: [{ key: 'oak', name: 'Oak', tags: { climate: 'temperate', aridity: 'humid', abyssal: false, riparian: 'no',
      harvest: { wood: 'timber', edible: [], medicinal: false } } }],
    build() {
      const { rng, reseed } = BIO.fn; reseed(11);
      BIO.register({ name: 'Oak', key: 'oak', kind: 'tree', x: 10, y: 2, z: -20, r: 6, h: 18 });
      BIO.register({ name: 'Far oak', key: 'oak', kind: 'tree', x: 900, y: 0, z: 900, r: 6, h: 18 });
      BIO.tube('bark', [{ x: 10, y: 1.5, z: -20, r: .8 }, { x: 10.3, y: 9, z: -20.2, r: .5 }, { x: 10.1, y: 16, z: -19.8, r: .3 }], 0x886644, { seg: 6 });
      BIO.tube('bark', [{ x: 200, y: 0, z: 200, r: .5 }, { x: 206, y: 0.4, z: 201, r: .5 }], 0x664422, { seg: 5 });
      BIO.tube('bark', [{ x: 900, y: 0, z: 900, r: .6 }, { x: 900, y: 12, z: 900, r: .4 }], 0x664422, { seg: 5 });
      for (let i = 0; i < 300; i++) {
        BIO.range = i % 3 === 0 ? 900 : null;
        const x = (rng() - .5) * 2400, z = (rng() - .5) * 2400;
        BIO.put('clump', [x, 1 + rng() * 9, z], BIO.fn.qEuler(0, rng() * 6.28, 0), [1 + rng(), 1, 1 + rng()], 0x44aa44);
        if (i % 4 === 0) BIO.put('boulder', [x + 3, 0, z + 1], null, 0.5 + rng(), 0x777777);
      }
      BIO.range = null;
      BIO.cur = 'k/fauna';
      for (let i = 0; i < 20; i++) BIO.put('dart', [i * 7.31, 30, -i * 3.17], null, 1, 0xffffff, { aP0: [i, 0, 0, 1], aP1: [0, 0, 1, 1] });
      BIO.cur = null;
    }
  };
  BIO.kitEnd(api);
  api.build();
  BIO.bake();
  return { ctx, BIO, E: ctx.EXPORT, K: ctx.KTAGS, T: ctx.KTAGS.page, F, g, errs };
}

const A = page(false), Lp = page(true);
const { E, BIO, K, T, F } = A;
ok(!A.errs.length && !Lp.errs.length, 'both pages build clean' + (A.errs.length ? ': ' + A.errs.join('; ') : ''));
ok(E.contributors('items').join() === 'biome' && Lp.E.contributors('items').join() === 'biome' && Lp.E.contributors('stage').length === 0,
  'the biome core registers its sections whether core/export loads before it or after (queued): ' + JSON.stringify(Lp.E.contributors()));

// ---- the container ----
const BOX = [-600, -600, 400, 400];
const w = E.world({ box: BOX });
ok(w.format === 'krator-world' && w.version === 1 && w.build === 'test' && w.box.join() === BOX.join(), 'format, version, build (core/tags\' page) and box');
ok(['units', 'up', 'x', 'z', 'handed', 'matrix', 'instances', 'winding', 'uv', 'colours', 'typed', 'ids', 'box'].every(k => w.convention[k] != null),
  'the convention states units, axes, handedness, the matrix layout, winding, uv, colour spaces, typed arrays, ids and the box rule');
ok(E.SECTIONS.every(s => s in w && w.sections[s]), 'every section has a key and a status');
const st = s => w.sections[s].status;
ok(['items', 'buckets', 'materials', 'textures', 'registry', 'terrain'].every(s => st(s) === 'ok') && st('stage') === 'none' && st('atmos') === 'empty',
  'sections filled: ' + E.SECTIONS.map(s => s + ' ' + st(s)).join(', '));
ok(['fixtures', 'interiors', 'furniture', 'sim', 'city'].every(s => st(s) === 'stub' && w[s] === null && E.CONTRACTS[s].indexOf('STUB') === 0),
  'the stubs (fixtures, interiors, furniture, sim, city) are null with a written contract');
ok(w.sections.materials.by.slice().sort().join() === 'biome,kmat' && w.materials.some(m => m.id === 'kmat:k:plank' && m.maps.lib === 'wood.test'),
  'materials from two modules: the biome\'s and the KMAT adapter table (by library reference)');
ok(w.errors.length === 0, 'no errors' + (w.errors.length ? ': ' + JSON.stringify(w.errors) : ''));

// ---- ids join ----
const chk = E.check(w, { uid: K.uid });
ok(chk.ok && chk.joins.setsResolved === chk.joins.itemsWithSet && chk.joins.itemsWithSet === w.items.length && chk.joins.uidsChecked === w.stats.instances &&
  chk.joins.uidsDiffer === 0 && chk.joins.bucketRecords > 0 && chk.joins.bucketRecordsResolved === chk.joins.bucketRecords,
  'every item names a set the registry holds, every uid recomputes from its matrix, every bucket record resolves: ' + JSON.stringify(chk.joins) + (chk.ok ? '' : ' ' + chk.problems.slice(0, 3).join('; ')));
const bad1 = JSON.parse(JSON.stringify(w)); bad1.items[0].records[0] = '00000000'; bad1.buckets.find(b => b.recordIds && b.recordIds.length).recordIds[0] = 'flora_99999';
bad1.items[1].material = 'mat404';
const c1 = E.check(bad1, { uid: K.uid });
ok(!c1.ok && c1.joins.uidsDiffer === 1 && c1.problems.some(p => /flora_99999/.test(p)) && c1.problems.some(p => /mat404/.test(p)),
  'negative: a wrong uid, a bucket record the registry lacks and an unknown material are each reported (' + c1.problems.length + ' problems)');
const bad2 = JSON.parse(JSON.stringify(w)); bad2.registry.records = bad2.registry.records.filter(r => r.id !== w.items[0].record);
ok(!E.check(bad2).ok, 'negative: an item whose set is cropped out of the registry is reported');

// ---- profiles: the sections a case must fill (ROADMAP.md section 11, item 1) ----
const PROF = ['registry', 'items', 'buckets', 'materials', 'textures', 'terrain=field', 'atmos?'];
const cp = E.check(w, { uid: K.uid, profile: PROF });
ok(cp.ok && cp.joins.profile.required === PROF.length && cp.joins.profile.met === PROF.length,
  'positive: a profile every named section meets passes (atmos? allows the empty atmos; terrain=field holds a krator-field): ' + JSON.stringify(cp.joins.profile));
const cs = E.check(w, { profile: PROF.concat(['sim']) });
ok(!cs.ok && cs.problems.length === 1 && /profile: sim is required and reads stub/.test(cs.problems[0]) && cs.joins.profile.met === PROF.length,
  'negative: a required section that is a stub fails the check: ' + cs.problems[0]);
const ce = E.check(w, { profile: ['atmos', 'stage'] });
ok(!ce.ok && ce.problems.some(p => /atmos is required and reads empty/.test(p)) && ce.problems.some(p => /stage is required and reads none/.test(p)),
  'negative: empty without ? and none each fail');
const sampled = JSON.parse(JSON.stringify(w)); sampled.terrain.source = 'sampled';
const cts = E.check(sampled, { profile: ['terrain=field'] });
ok(!cts.ok && /terrain must come from field, not sampled/.test(cts.problems[0]), 'negative: terrain=field refuses sampled heights: ' + cts.problems[0]);
const skipped = E.world({ box: BOX, sections: ['items', 'materials', 'textures', 'registry'] });
ok(!E.check(skipped, { profile: ['items', 'terrain'] }).ok && E.check(skipped, { profile: ['items'] }).ok, 'negative: a required section the export skipped fails; the one it filled passes');
ok(E.check(w).ok && E.check(w, {}).joins.profile == null, 'without a profile the statuses are not judged (as before)');
let r0 = false; try { E.check(w, { profile: ['items', 'citizens'] }); } catch (e) { r0 = /unknown section citizens/.test(e.message); }
ok(r0, 'refused: a profile naming an unknown section throws');

// ---- the registry, cropped to the tile ----
const R = w.registry, rid = new Set(R.records.map(r => r.id));
const far = T.query({}).find(r => r.name === 'Far oak'), near = T.query({}).find(r => r.name === 'Oak');
ok(R.format === 'krator-tags' && R.cropped && R.cropped.kept < R.cropped.from && rid.has(near.id) && !rid.has(far.id),
  'the registry is cropped: the oak in the tile is in, the far oak is out (' + R.cropped.kept + ' of ' + R.cropped.from + ')');
const whole = E.world({});
ok(whole.box === null && whole.registry.records.length === T.export().records.length && whole.terrain.source === 'field' && whole.terrain.grid === null,
  'without a box: the whole registry, the field whole and no sampled grid');

// ---- BIO.export is a thin caller: the same items and buckets as before core/export ----
const old = BIO.export({ box: BOX });
const sameItems = old.items.length === w.items.length && old.items.every((it, k) => { const v = w.items[k];
  return it.id === undefined && v.id && it.name === v.name && it.matrices.b64 === v.matrices.b64 && it.records.join() === v.records.join() && it.geometry.position.b64 === v.geometry.position.b64; });
ok(old.format === 'krator-biome' && sameItems && old.ground && old.ground.field && old.materials.every(m => m.family === undefined),
  'BIO.export: krator-biome as before (no ids, no vocabulary fields), with the world\'s items row for row');
ok(w.items.every(it => typeof it.id === 'string') && new Set(w.items.map(i => i.id)).size === w.items.length && w.items.some(i => /@/.test(i.id)),
  'world items carry unique ids, a LOD chunk\'s with its chunk: ' + w.items.slice(0, 4).map(i => i.id).join(', '));

// ---- compaction: the tile's buckets keep only their vertices ----
const un = t => E.unpack(t);
const ob = old.buckets.find(b => b.name === 'bark'), nb = w.buckets.find(b => b.name === 'bark');
const tris = (b) => { const P = un(b.geometry.position), I = un(b.geometry.index), out = []; for (let i = 0; i < I.length; i++) out.push(P[I[i] * 3], P[I[i] * 3 + 1], P[I[i] * 3 + 2]); return out.join(); };
ok(nb && ob && nb.triangles === ob.triangles && un(nb.geometry.position).length < un(ob.geometry.position).length && tris(nb) === tris(ob) &&
  nb.compacted.dropped > 0 && Math.max.apply(null, Array.from(un(nb.geometry.index))) === nb.compacted.vertices - 1,
  'a tile\'s bucket is compacted: the same triangles, ' + (nb ? nb.compacted.vertices + ' vertices kept, ' + nb.compacted.dropped + ' dropped' : ''));
const cx = E.compact({ p: [new Float32Array([0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3]), 3] }, new Uint16Array([3, 1, 3]));
ok(cx.vertices === 2 && Array.from(cx.index).join() === '0,1,0' && Array.from(cx.arrays.p).join() === '3,3,3,1,1,1', 'EXPORT.compact keeps used vertices in first-use order');
let threw = false; try { E.compact({ p: [new Float32Array(3), 3] }, new Uint16Array([5])); } catch (e) { threw = true; }
ok(threw, 'negative: an index past the vertices throws');

// ---- terrain: the field cropped, the grid and the probes equal the page's own sampling ----
const t = w.terrain, gH = un(t.grid.heights);
let gmax = 0; for (let j = 0; j < t.grid.nz; j += 7) for (let i = 0; i < t.grid.nx; i += 7) gmax = Math.max(gmax, Math.abs(gH[j * t.grid.nx + i] - Math.fround(F.h(BOX[0] + i * t.grid.step, BOX[1] + j * t.grid.step))));
const F2 = A.ctx.KFIELD.load(t.field);
let pmax = 0; t.probes.points.forEach(p => { pmax = Math.max(pmax, Math.abs(F2.h(p[0], p[1]) - p[2])); });
ok(t.source === 'field' && t.field.format === 'krator-field' && t.field.nx < F.nx && gmax === 0 && t.probes.points.length === 256 && pmax === 0,
  'terrain: the field cropped to the tile (' + t.field.nx + ' of ' + F.nx + ' columns), the grid is h at its points, the probes reread from the exported field exactly');
ok(Math.abs(F2.h(t.probes.points[5][0] + 3, t.probes.points[5][1]) - t.probes.points[5][2]) > 1e-3, 'negative: a probe read 3 m away disagrees');
ok(un(t.grid.water).some(v => v === 0) && un(t.grid.water).some(v => v < -1e8), 'the grid carries the water surface (wet and dry samples)');

// ---- textures: a library map by reference, the rest as before ----
const lt = w.textures.find(x => x.from === 'library'), nt = w.textures.find(x => x.from !== 'library');
ok(lt && lt.lib === 'bark.test' && lt.pack === 'k' && lt.family === 'bark0' && lt.slot === 'map' && !lt.png && lt.offset.join() === '0.34,0.34' &&
  w.materials.find(m => m.map === lt.id).lib === 'bark.test',
  'a library map is named by reference (pack k, family bark0) with its offset, and its material carries the library id');
ok(nt && nt.from === 'none' && /no PNG encoder/.test(nt.error), 'negative: a map that is not in the pack is not a library reference (no encoder in node: it says why)');
ok(w.materials.filter(m => m.source !== 'kmat').every(m => 'family' in m && 'roughness' in m && 'hook' in m && 'kind' in m),
  'biome materials carry the KMAT vocabulary beside their own fields');

// ---- failures: a throwing contributor is reported and skipped; unknown sections are refused ----
const off = E.register('atmos', () => { throw new Error('boom'); }, { by: 'broken' });
const w2 = E.world({ box: BOX });
ok(w2.sections.atmos.status === 'error' && w2.errors.length === 1 && w2.errors[0].section === 'atmos' && w2.errors[0].by === 'broken' &&
  /boom/.test(w2.errors[0].error) && w2.items.length === w.items.length && w2.sections.items.status === 'ok',
  'a contributor that throws is reported (' + JSON.stringify(w2.errors[0]) + ') and the other sections still fill');
off();
ok(E.world({ box: BOX, sections: ['atmos'] }).errors.length === 0, 'unregister removes it');
const off2 = E.register('items', () => [{ id: w.items[0].id }, { id: 'extra' }], { by: 'dup' });
const off3 = E.register('terrain', () => ({ format: 'krator-terrain' }), { by: 'second' });
const w3 = E.world({ box: BOX, sections: ['items', 'terrain'] });
ok(w3.errors.some(e => e.by === 'dup' && /duplicate id/.test(e.error)) && w3.items.some(i => i.id === 'extra') && w3.errors.some(e => e.by === 'second' && /second contributor/.test(e.error)) &&
  w3.terrain.source === 'field', 'a duplicate id and a second contributor to a single section are reported; the first stays');
off2(); off3();
let r1 = false, r2 = false, r3 = false;
try { E.register('weather', () => null); } catch (e) { r1 = /unknown section/.test(e.message); }
try { E.world({ sections: ['items', 'nope'] }); } catch (e) { r2 = /unknown section/.test(e.message); }
try { E.world({ box: [1, 2, 0, 3] }); } catch (e) { r3 = true; }
ok(r1 && r2 && r3, 'refused: registering an unknown section, asking for one, and a box with x1 < x0');
const w4 = E.world({ box: BOX, sections: ['terrain'] });
ok(w4.items.length === 0 && w4.sections.items.status === 'skipped' && w4.sections.terrain.status === 'ok', 'sections: only those asked for are filled');

// ---- water (core/water's surfaces, 09's adapter): cropped to the tile, the bed's bytes, the twin's own heights ----
ok(st('water') === 'empty', 'water: a page without core/water leaves the section empty (its adapter ran and found no WATER)');
vm.runInContext(read('core/water/20-core-water.js') + '\nthis.WATER=WATER;', A.ctx, { filename: '20-core-water.js' });
const WT = A.ctx.WATER;
const POND = WT.open({ name: 'pond', level: -0.5, swell: [[.03, 3.4, 25, 0, .06], [.02, 2.1, -40, 1.3, .05], [.012, 1.3, 70, 2.2, .04]], field: 0,
  bounds: [-100, -100, 100, 100], bed: A.g, bedCell: 4 });
POND.look = { colour: '#0d2c30', shallow: '#2a524d', deep: '#0d2c30', roughness: 0.08, transparent: true };
WT.open({ name: 'far sea', swell: 'ringsea', bounds: [2000, 2000, 3000, 3000] });
WT.flow({ name: 'river', pts: [[-300, 0, 1], [0, 50, .5], [300, 0, 0]], width: 12, speed: 1 });
WT.still({ name: 'trough', level: 2, bounds: [10, 10, 12, 12] });
const ww = E.world({ box: BOX }), WS = ww.water;
ok(ww.sections.water.status === 'ok' && ww.sections.water.by.join() === 'water' && WS.format === 'krator-water' && WS.period === 600 && WS.field === 'none',
  'water: the section fills from WATER.export (krator-water, period ' + (WS && WS.period) + ' s, field ' + (WS && WS.field) + ')');
const wnames = WS.surfaces.map(S => S.name);
ok(wnames.join() === 'pond,river,trough' && E.world({ sections: ['water'] }).water.surfaces.length === 4,
  'water: a tile keeps the surfaces that meet its box (' + wnames.join(', ') + '; the far sea only untiled)');
const wp = WS.surfaces[0];
ok(wp.waves.length === 3 && wp.waves.every((q, i) => q.turns[0] === POND.waves[i].tx && q.turns[2] === POND.waves[i].tc && q.cycles === POND.waves[i].n) &&
  wp.lod.join() === POND.lod.join() && wp.damp === POND.dampDepth && wp.base === -0.5 && wp.look.roughness === 0.08,
  'water: an open surface carries its waves in turns, its fades, damping, base level and look');
const bedB = un(wp.bed.bytes);
ok(bedB.length === POND.bed.data.length && bedB.every((v, i) => v === POND.bed.data[i]) && wp.bed.nx === POND.bed.nx,
  'water: the bed\'s bytes travel as they are (' + wp.bed.nx + ' x ' + wp.bed.nz + ' texels, ' + bedB.length + ' bytes)');
// the twin rebuilt from the record alone (what godot/krator/water.gd does), against WATER's own heights at the probes
function twinOf(R, dt) {
  const fr = x => x - Math.floor(x), ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const B = R.bed, P = WS.presets.bed, bytes = B ? un(B.bytes) : null;
  const dec = (r, g) => (g > .004 && g < .996) ? P.fine[0] + g * (P.fine[1] - P.fine[0]) : P.deep[0] + r * r * (P.deep[1] - P.deep[0]);
  const depth = (x, z) => { if (!B) return 1e9; const u = (x - B.x0) / (B.cell * B.nx), v = (z - B.z0) / (B.cell * B.nz); if (u < 0 || v < 0 || u > 1 || v > 1) return P.deep[1];
    const fx = u * B.nx - .5, fz = v * B.nz - .5, i0 = Math.floor(fx), j0 = Math.floor(fz), ax = fx - i0, az = fz - j0, cl = (q, n) => Math.min(n - 1, Math.max(0, q));
    const ch = (i, j, k) => bytes[(cl(j, B.nz) * B.nx + cl(i, B.nx)) * 4 + k] / 255, bl = k => (ch(i0, j0, k) * (1 - ax) + ch(i0 + 1, j0, k) * ax) * (1 - az) + (ch(i0, j0 + 1, k) * (1 - ax) + ch(i0 + 1, j0 + 1, k) * ax) * az;
    return dec(bl(0), bl(1)); };
  const damp = (x, z) => B ? ss(0, R.damp, depth(x, z)) : 1;
  const troD = (x0, z0, t) => { let dx = 0, h = 0, dz = 0, a = 1, b = 0, c = 1;
    for (const q of R.waves) { const th = 2 * Math.PI * (fr(x0 * q.turns[0]) + fr(z0 * q.turns[1]) - fr(t * q.turns[2])) + q.phase, co = Math.cos(th), si = Math.sin(th), k = q.H * q.k * si;
      h += q.A * si; dx += q.H * q.dir[0] * co; dz += q.H * q.dir[1] * co; a -= k * q.dir[0] * q.dir[0]; b -= k * q.dir[0] * q.dir[1]; c -= k * q.dir[1] * q.dir[1]; }
    return [dx, h, dz, a, b, c]; };
  return (x, z, t) => { t += dt || 0; let x0 = x, z0 = z;
    for (let i = 0; i < 5; i++) { const d = troD(x0, z0, t), m = damp(x0, z0), a = 1 + (d[3] - 1) * m, b = d[4] * m, c = 1 + (d[5] - 1) * m, det = a * c - b * b, rx = x0 + d[0] * m - x, rz = z0 + d[2] * m - z;
      x0 -= (c * rx - b * rz) / det; z0 -= (a * rz - b * rx) / det; }
    return R.level + troD(x0, z0, t)[1] * damp(x0, z0); };
}
const tw = twinOf(wp), tw1 = twinOf(wp, 1);
let wmax = 0, wneg = Infinity;
WS.probes.forEach(q => { wmax = Math.max(wmax, Math.abs(tw(q[0], q[1], q[2]) - q[3])); });
const wneg1 = Math.max(...WS.probes.map(q => Math.abs(tw1(q[0], q[1], q[2]) - q[3])));
ok(WS.probes.length === 108 && WS.probes.every(q => q[4] === wp.id) && wmax < 1e-12 && wneg1 > 1e-3 && WS.probes.some(q => Math.abs(q[3] - wp.level) > 5e-3),
  'water: the twin rebuilt from the record alone meets WATER\'s own heights at ' + WS.probes.length + ' probes (max ' + wmax.toExponential(1) + ' m); negative: one second off differs by ' + wneg1.toFixed(3) + ' m');
const wc = E.check(ww);
const wbad = JSON.parse(JSON.stringify(ww)); const tb8 = un(wbad.water.surfaces[0].bed.bytes); wbad.water.surfaces[0].bed.bytes = E.pack(tb8.subarray(0, tb8.length - 4));
wbad.water.probes[0][4] = 'water:99';
const wcb = E.check(wbad);
ok(wc.ok && !wcb.ok && wcb.problems.some(m => /its bed holds/.test(m)) && wcb.problems.some(m => /probe names surface water:99/.test(m)),
  'water: the joins pass; negative: a short bed and a probe naming no surface are reported');
// ---- a ground's layers (EXPORT.groundLayers): one record with hook world-uv, its maps as textures, its weights on a grid ----
const crackTex = new THREE.Texture(), libTex = new THREE.Texture(); crackTex.image = { width: 4, height: 4 }; libTex.image = { src: "data:image/webp;base64,UklGRgAAAABXRUJQ", width: 512, height: 512 };
E.groundLayers({ id: 'ground:k', build: 'k', terms: [
  { maps: [{ family: 'bark0', texture: libTex, scale: .165 }, { family: 'bark0', texture: libTex, scale: .021, offset: .37 }], gain: 1.12, amount: .85 },
  { maps: [{ family: 'crackX', texture: crackTex, scale: .14 }], weight: 'crack' }],
  weights: { crack: (x, z) => Math.max(0, Math.min(1, (x + z) / 400)) }, step: 4, box: [-1300, -1300, 1300, 1300], png: t => t === crackTex ? { png: 'data:image/png;base64,AAAA', size: [4, 4] } : null });
const wg = E.world({ box: BOX }), GL = wg.materials.find(m => m.id === 'ground:k');
const gtx = id => wg.textures.find(t => t.id === id);
ok(GL && GL.hook === 'world-uv' && GL.role === 'ground' && GL.layers.terms.length === 2 && GL.layers.terms[0].maps[1].offset.join() === '0.37,0.37' &&
  GL.layers.terms[0].gain === 1.12 && GL.layers.terms[1].weight === 'crack' && wg.sections.materials.by.indexOf('ground-layers') >= 0,
  'ground layers: one material record (hook world-uv, role ground) with its terms, gains and weights in order');
ok(gtx(GL.layers.terms[0].maps[0].map).from === 'library' && gtx(GL.layers.terms[0].maps[0].map).family === 'bark0' &&
  GL.layers.terms[0].maps[0].map === GL.layers.terms[0].maps[1].map && gtx(GL.layers.terms[1].maps[0].map).from === 'png',
  'ground layers: a map in the build\'s pack goes by library reference, one map shared by two terms is one texture, the rest as a PNG');
const GV = un(GL.weights.values), gi = 37, gj = 101;
ok(GL.weights.nx === (BOX[2] - BOX[0]) / 4 + 1 && GV.length === GL.weights.nx * GL.weights.nz &&
  Math.abs(GV[gj * GL.weights.nx + gi] - Math.max(0, Math.min(1, (BOX[0] + gi * 4 + BOX[1] + gj * 4) / 400))) < 1e-6,
  'ground layers: the weights sampled on a ' + GL.weights.step + ' m grid over the tile (' + GL.weights.nx + ' x ' + GL.weights.nz + '), each the build\'s own value');
const gb = JSON.parse(JSON.stringify(wg)), GB = gb.materials.find(m => m.id === 'ground:k');
GB.layers.terms[1].maps[0].map = 'tex:nowhere'; GB.layers.terms[0].weight = 'moss'; GB.weights.values = E.pack(new Float32Array(3));
const gcb = E.check(gb);
ok(E.check(wg).ok && !gcb.ok && gcb.problems.some(m => /tex:nowhere/.test(m)) && gcb.problems.some(m => /weighted by moss/.test(m)) && gcb.problems.some(m => /weights hold 3/.test(m)),
  'ground layers: the joins pass; negative: a missing map, an unknown weight and short weights are reported');
E.groundLayers(null);
ok(!E.world({ box: BOX, sections: ['materials', 'textures'] }).materials.some(m => m.id === 'ground:k'), 'ground layers: groundLayers(null) takes the record back out');

// ---- the glb: the meshes as binary glTF, the rest as JSON naming each node ----
const G = E.glb(w), u8 = G.glb, dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
const jl = dv.getUint32(12, true), J = JSON.parse(Buffer.from(u8.subarray(20, 20 + jl)).toString('utf8')), bin0 = 20 + jl + 8;
ok(dv.getUint32(0, true) === 0x46546C67 && dv.getUint32(4, true) === 2 && dv.getUint32(8, true) === u8.length && dv.getUint32(16, true) === 0x4E4F534A &&
  dv.getUint32(20 + jl + 4, true) === 0x004E4942 && jl % 4 === 0, 'a glb: magic, version 2, length, a JSON chunk and a BIN chunk, 4-byte aligned');
ok(J.nodes.length === w.items.length + w.buckets.length && J.extensionsUsed.indexOf('EXT_mesh_gpu_instancing') >= 0 &&
  G.json.items.every((it, k) => it.glb.node === 'item_' + k && it.geometry === undefined && it.matrices === undefined && it.records.length === it.count),
  'one node per item (EXT_mesh_gpu_instancing) and per bucket; the JSON keeps each item\'s records and names its node');
const accF = (ix) => { const a = J.accessors[ix], v = J.bufferViews[a.bufferView], n = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type] * a.count;
  return new Float32Array(u8.buffer.slice(u8.byteOffset + bin0 + v.byteOffset, u8.byteOffset + bin0 + v.byteOffset + n * 4)); };
let tb = 0, tn = 0;
w.items.forEach((it, k) => { const M = un(it.matrices), T3 = accF(J.nodes[k].extensions.EXT_mesh_gpu_instancing.attributes.TRANSLATION);
  for (let j = 0; j < it.count; j++) for (let q = 0; q < 3; q++) { tn++; if (T3[j * 3 + q] !== M[j * 16 + 12 + q]) tb++; } });
ok(tn === w.stats.instances * 3 && tb === 0 && G.stats.trsMaxError < 1e-5, 'TRANSLATION is the matrix translation bit for bit (' + tn + ' floats), TRS recomposes the matrices (max error ' + G.stats.trsMaxError.toExponential(1) + ')');
const dart = w.items.find(i => i.name === 'dart'), dn = J.nodes[w.items.indexOf(dart)];
ok(dn.extensions.EXT_mesh_gpu_instancing.attributes._AP0 != null && dn.extensions.EXT_mesh_gpu_instancing.attributes._COLOR != null, 'per-instance extras ride along as custom instance attributes (_AP0, _COLOR)');
const shear = JSON.parse(JSON.stringify(w)); shear.buckets = []; shear.items = [shear.items[0]];
const SM = un(shear.items[0].matrices); SM[4] += 0.5; shear.items[0].matrices = E.pack(SM);
ok(E.glb(shear).stats.trsMaxError > 0.1, 'negative: a sheared matrix shows as a TRS error (' + E.glb(shear).stats.trsMaxError.toFixed(2) + ')');
ok(E.check(G.json).ok, 'the JSON half still passes the joins (materials, sets, bucket records)');

console.log(fails ? fails + ' failed' : 'all passed');
process.exit(fails ? 1 : 0);
