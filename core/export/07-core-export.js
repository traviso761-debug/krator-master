// ================================================================= CORE — export: the krator-world container
// GODOT-PLAN.md Phase 4 ("one exporter"), ROADMAP.md stage 2d. One plain-data object per build or per tile, which each
// module fills with its own part: the biome core its items, buckets, materials, textures, terrain and stage
// (core/biome/42-core-export.js, 43-core-export-host.js), core/tags its registry, core/atmos its atmosphere, the
// material records their table, core/water its surfaces (09-core-export-adapters.js reads the last four until those
// modules register themselves). core/export/README.md is the contract; godot/krator/world_import.gd reads it.
// [G data]: no THREE, no DOM. It runs in node (core/export/test-export.js).
//
//   EXPORT.register(section, fn, {by})  -> unregister(). fn(ctx) returns the section's part (null: nothing). A section
//        name outside EXPORT.SECTIONS throws. One contributor per (section, by): registering again replaces it.
//        ctx = {box, opt, build, out (the container so far: sections fill in EXPORT.SECTIONS order), inBox(x, z),
//               memo(key, f) (f() once per world() call: a module that fills several sections computes them once)}
//   EXPORT.world({box?, sections?, build?, ...})  -> the container (below). box: [x0, z0, x1, z1], a tile; sections: the
//        names to fill (an unknown name throws); the rest of opt reaches every contributor as ctx.opt.
//        A contributor that throws is reported in `errors` and its part skipped; the other sections still fill.
//   EXPORT.check(world, {uid})  -> {ok, problems, joins}: every reference resolves (an item's or bucket's material, a
//        material's maps, an item's set and a bucket's volumes in the registry, the side tables' lengths); uid(cls, key,
//        [x,y,z]) recomputes every instance's uid from its matrix (KTAGS.uid in a page)
//   EXPORT.glb(world)  -> {json, glb (Uint8Array), stats}: the meshes as binary glTF 2.0 (an item a node with
//        EXT_mesh_gpu_instancing, a bucket a node with its mesh), the rest as JSON naming each node (`glb`)
//   EXPORT.terrain(box, {h, water?, field?, step?, probes?})  -> the terrain section: the build's KFIELD (core/terrain)
//        cropped to the box on its own lattice where it has one, h sampled on a grid over the box, and probes (h at 16 x 16
//        points off the lattice) a port compares its own sampling against
//   EXPORT.compact(arrays, index)  -> the vertices an index uses, renumbered (a tile's cut leaves the rest unused)
//   EXPORT.pack(typed) / EXPORT.unpack({type, n, b64})   typed arrays as base64 of their little-endian bytes
//
// The container:
//   { format: 'krator-world', version: 1, build, convention, box,
//     sections: {name: {status: 'ok' | 'empty' | 'none' | 'stub' | 'error' | 'skipped', by: [contributors], errors?}},
//     errors: [{section, by, error}],
//     items: [], buckets: [], materials: [], textures: [],      (lists: concatenated over contributors, unique ids)
//     registry, terrain, stage, atmos, water, fixtures, interiors, furniture, sim, city,   (one contributor each, or null)
//     stats }
var EXPORT = (function(root){
'use strict';
const FORMAT = 'krator-world', VERSION = 1;
const SECTIONS = ['items', 'buckets', 'materials', 'textures', 'registry', 'terrain', 'stage', 'atmos', 'water',
                  'fixtures', 'interiors', 'furniture', 'sim', 'city'];
const LIST = { items: 1, buckets: 1, materials: 1, textures: 1 };
// sections no module fills yet: their contract is written (README.md, "Stubs") so the first contributor has a shape to meet
const STUB = { fixtures: 1, interiors: 1, furniture: 1, sim: 1, city: 1 };
const CONTRACTS = {
 items: 'instanced meshes: {id, name, kit, label, material, lod, count, dynamic, geometry, matrices, colours, extras, record, recordClass, recordKey, records, recordIndex}',
 buckets: 'merged meshes: {id, name, kit, label, material, lod, triangles, geometry (compacted to the tile), records, recordIds, pieces}',
 materials: 'one vocabulary (core/materials/record KMAT fields: family, colour, map, roughness, metal, specular, emissive, doubleSided, alphaTest, scale, tint, hook, lib) plus the source module\'s own (a biome material\'s kind, key, options, sway); hook names the Godot library shader(s), joined by + (godot/README.md, "The shader library"); a ground\'s layers (EXPORT.groundLayers: hook world-uv, role ground, layers {terms [{maps [{map, scale, offset}], gain, amount, weight}]}, weights {x0, z0, step, nx, nz, names, values})',
 textures: '{id, from: "png" | "library" | "none", png?, lib?, pack?, family?, slot?, wrap, repeat, offset, flipY, size?}: a library map by reference (the build\'s pack, tex/pack.json), never as pixels',
 registry: 'core/tags: {format: "krator-tags", build, records} cropped to the tile: every record an item or bucket names, every record placed in the box, and their parents',
 terrain: '{format: "krator-terrain", source: "field" | "sampled", field (krator-field, core/terrain), grid {x0, z0, step, nx, nz, heights, water}, probes}',
 stage: 'KSTAGE.capture (core/biome/44-core-stage.js): the page\'s light, fog, tonemapping, sky panorama and ground look',
 atmos: 'ATMOS.export() (core/atmos, krator-atmos): presets, clock, wind, lamps, glows, props; colours sRGB',
 water: 'WATER.export() (core/water, krator-water): {format, version, period, presets, field: "atmos" | "none", surfaces: [{id, kind, name, bounds, ...}], probes}; an open surface carries level, base, swell (the preset name or list), waves [{A, lambda, k, dir, H, phase, cycles, turns [tx, tz, tc]}], field (the share of the shared wave field, 0 without core/atmos), fieldShare, chop, kChop, tilt, lod, px, damp, amp, bed {x0, z0, cell, nx, nz, level, bytes (Uint8Array RGBA, PRESETS.bed\'s encoding)} or null, look; probes [x, z, t, h, surface id] from WATER\'s own twin',
 fixtures: 'STUB. Doors, windows, lights, signs as core/tags records with a placement each (Yuni\'s KRATOR_EXPORT.fixtures shape): {format: "krator-fixtures", records: [{id, uid, class: "fixture", kind, parent, at, ry, size, tags, host: {wall, side, sill}}]}',
 interiors: 'STUB. The room graph (kits/interiors ROOM()): {format: "krator-interiors", buildings: [{id (the building record), storeys: [{y, rooms: [{id, kind, poly, h, doors: [ids]}]}], links: [{a, b, kind: "door" | "stair" | "ladder", at}], walls: [{a, b, h, col: true}]}]}',
 furniture: 'STUB. GODOT-PLAN.md Phase 4\'s per-look scheme: {format: "krator-furniture", pieces: [{id: "<piece>/<variant>/<look>", entry {tags, anchor, size, role, job, family per material}, lights, mesh (a glb node)}], placements: [{record (a core/tags furniture id), piece, at, ry}]}. A placement\'s seed is reduced to one of K looks (about 4) per variant, so placements share a mesh: one MultiMesh per piece and look',
 sim: 'STUB. core/simulation\'s export (krator-sim: places, actors, schedules, routes, the clock); Verge and Dhelv write theirs through their verify (godot/data/verge, dhelv) until they register here',
 city: 'STUB, owned by the Voth branch (core/city, settlements/voth): core/city registers here when that branch pauses. Expected: {format: "krator-city", plan (streets, blocks, lots as plain records keyed by stable ids), edits (krator-edits/1 deltas by id)}; buildings and their doors join the registry by id'
};
const CONVENTION = {
 units: 'm', up: '+Y', x: 'east', z: 'south', handed: 'right (as glTF and Godot)',
 matrix: '4x4 column-major (three, glTF): elements 12, 13, 14 are the translation; Godot: basis = columns 0..2, origin = column 3',
 instances: 'world.glb: EXT_mesh_gpu_instancing TRANSLATION (the matrix translation, float32 bit for bit), ROTATION (unit quaternion x, y, z, w), SCALE, and _COLOR, _AN, _AC2, _AP0, _AP1 (the per-instance extras); the JSON form: matrices, 16 floats an instance',
 winding: 'front faces counter-clockwise seen from outside (three, glTF); Godot\'s are clockwise: a reader of the JSON form reverses each triangle (a glTF importer already does)',
 uv: 'as three holds them; a texture samples at uv * repeat + offset, and flipY true puts the image\'s top row at v = 1 (Godot samples 1 - v), false at v = 0',
 colours: { instances: 'linear', vertices: 'linear', materials: 'linear (three\'s working values written as hex: do not convert)',
  textures: 'sRGB images', stage: 'linear (as hex)', atmos: 'sRGB' },
 typed: '{type, n, b64}: the array\'s bytes, little-endian, base64; Float32Array, Uint16Array, Uint32Array',
 ids: 'core/tags: a record id is <prefix>_<5 digits> (or the build\'s own); an instance of an item set is <set id>#<index>; a uid is KTAGS.uid(class, key, at): KRAND.hash(0, fnv1a(class), fnv1a(key), floor(x*10+.5), floor(y*10+.5), floor(z*10+.5)) as 8 hex digits',
 box: '[x0, z0, x1, z1]: an instance belongs to a tile when x0 <= x < x1 and z0 <= z < z1 (its origin); a bucket piece by its foot (the xz of its lowest vertex)'
};
const reg = {}; SECTIONS.forEach(s => { reg[s] = []; });
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

function register(section, fn, opt){
 if(!has(reg, section)) throw new Error('EXPORT.register: unknown section \'' + section + '\' (known: ' + SECTIONS.join(', ') + ')');
 if(typeof fn !== 'function') throw new Error('EXPORT.register(' + section + '): fn must be a function');
 const by = opt && opt.by != null ? String(opt.by) : 'anon', L = reg[section], c = { by, fn };
 const i = L.findIndex(x => x.by === by);
 if(i >= 0) L[i] = c; else L.push(c);
 return () => { const k = L.indexOf(c); if(k >= 0) L.splice(k, 1); };
}
function contributors(section){
 if(section == null){ const o = {}; SECTIONS.forEach(s => { o[s] = reg[s].map(c => c.by); }); return o; }
 if(!has(reg, section)) throw new Error('EXPORT.contributors: unknown section \'' + section + '\'');
 return reg[section].map(c => c.by);
}
function normBox(b){
 if(!Array.isArray(b) || b.length !== 4 || !b.every(v => typeof v === 'number' && isFinite(v)) || !(b[0] < b[2] && b[1] < b[3]))
  throw new Error('EXPORT.world: box is [x0, z0, x1, z1] with x0 < x1 and z0 < z1');
 return b.slice();
}

function world(opt){
 opt = opt || {};
 const box = opt.box == null ? null : normBox(opt.box);
 let want = SECTIONS;
 if(opt.sections != null){
  if(!Array.isArray(opt.sections)) throw new Error('EXPORT.world: sections is a list of names');
  const bad = opt.sections.filter(s => !has(reg, s));
  if(bad.length) throw new Error('EXPORT.world: unknown section(s) ' + bad.join(', ') + ' (known: ' + SECTIONS.join(', ') + ')');
  want = SECTIONS.filter(s => opt.sections.indexOf(s) >= 0);
 }
 const TG = typeof KTAGS !== 'undefined' && KTAGS ? KTAGS.page : null;
 const build = opt.build != null ? opt.build : TG && TG.build != null ? TG.build : null;
 const out = { format: FORMAT, version: VERSION, build, convention: CONVENTION, box, sections: {}, errors: [] };
 SECTIONS.forEach(s => { out[s] = LIST[s] ? [] : null; });
 const memo = new Map();
 const ctx = { box, opt, build, out, sections: want.slice(),
  inBox: (x, z) => !box || (x >= box[0] && z >= box[1] && x < box[2] && z < box[3]),
  memo(key, f){ if(!memo.has(key)) memo.set(key, f()); return memo.get(key); } };
 const fail = (s, by, e) => out.errors.push({ section: s, by, error: String(e && e.message || e) });
 for(const s of SECTIONS){
  if(want.indexOf(s) < 0){ out.sections[s] = { status: 'skipped', by: [] }; continue; }
  const L = reg[s].slice(), st = { status: 'ok', by: [] };
  let nerr = 0;
  for(const c of L){
   let v;
   try{ v = c.fn(ctx); }catch(e){ fail(s, c.by, e); nerr++; continue; }
   if(v == null) continue;
   if(LIST[s]){
    if(!Array.isArray(v)){ fail(s, c.by, 'returned ' + typeof v + ', not a list'); nerr++; continue; }
    const seen = new Set(out[s].map(r => r.id));
    let took = 0;
    for(const r of v){
     if(!r || r.id == null){ fail(s, c.by, 'a record without an id'); nerr++; continue; }
     if(seen.has(r.id)){ fail(s, c.by, 'duplicate id ' + r.id + ' (kept the first)'); nerr++; continue; }
     seen.add(r.id); out[s].push(r); took++;
    }
    if(took) st.by.push(c.by);
   } else {
    if(out[s] != null){ fail(s, c.by, 'a second contributor for a single section (kept ' + st.by[0] + ')'); nerr++; continue; }
    out[s] = v; st.by.push(c.by);
   }
  }
  if(nerr) st.errors = nerr;
  const got = LIST[s] ? out[s].length > 0 : out[s] != null;
  st.status = !L.length ? (STUB[s] ? 'stub' : 'none') : got ? 'ok' : nerr ? 'error' : 'empty';
  out.sections[s] = st;
 }
 out.stats = stats(out);
 return out;
}

function stats(w){
 const s = { items: w.items.length, instances: 0, buckets: w.buckets.length, triangles: 0, materials: w.materials.length,
  textures: w.textures.length, records: w.registry && w.registry.records ? w.registry.records.length : 0, errors: w.errors.length };
 w.items.forEach(r => { s.instances += r.count | 0; });
 w.buckets.forEach(r => { s.triangles += r.triangles | 0; });
 return s;
}

// ---------------------------------------------------------------- typed arrays as {type, n, b64}
const LE = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
const TYPES = { Float32Array, Uint16Array, Uint32Array, Int32Array, Uint8Array };
function bytesOf(a){
 const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
 if(LE || a.BYTES_PER_ELEMENT === 1) return u;
 const o = new Uint8Array(u.length), w = a.BYTES_PER_ELEMENT;
 for(let i = 0; i < u.length; i += w) for(let k = 0; k < w; k++) o[i + k] = u[i + w - 1 - k];
 return o;
}
function b64(u){
 if(typeof Buffer !== 'undefined') return Buffer.from(u.buffer, u.byteOffset, u.byteLength).toString('base64');
 let s = ''; const K = 0x8000;
 for(let i = 0; i < u.length; i += K) s += String.fromCharCode.apply(null, u.subarray(i, i + K));
 return btoa(s);
}
function unb64(s){
 if(typeof Buffer !== 'undefined'){ const b = Buffer.from(s, 'base64'), u = new Uint8Array(b.length); u.set(b); return u; }
 const t = atob(s), u = new Uint8Array(t.length);
 for(let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i);
 return u;
}
const pack = a => ({ type: a.constructor.name, n: a.length, b64: b64(bytesOf(a)) });
function unpack(t){
 if(t == null) return null;
 if(ArrayBuffer.isView(t)) return t;
 const T = TYPES[t.type];
 if(!T) throw new Error('EXPORT.unpack: unknown type ' + t.type);
 const u = unb64(t.b64), w = T.BYTES_PER_ELEMENT;
 if(!LE && w > 1) for(let i = 0; i < u.length; i += w) for(let k = 0; k < w >> 1; k++){ const c = u[i + k]; u[i + k] = u[i + w - 1 - k]; u[i + w - 1 - k] = c; }
 const a = new T(u.buffer, 0, u.length / w);
 if(t.n != null && a.length !== t.n) throw new Error('EXPORT.unpack: ' + t.type + ' holds ' + a.length + ', the record says ' + t.n);
 return a;
}

// ---------------------------------------------------------------- the terrain section from a build's ground
// box: the tile (null: the field whole, or nothing); b: {h(x, z), water(x, z)?, field (a KFIELD)?, step (2 m)?, probes (16)?}
function terrain(box, b){
 const F = b.field && typeof b.field.export === 'function' ? b.field : null;
 const t = { format: 'krator-terrain', version: 1, source: F ? 'field' : 'sampled', box: box, field: null, grid: null, probes: null };
 if(!box){ if(!F) return null; t.field = F.export(); return t; }
 const h = b.h, st = b.step == null || !(+b.step > 0) ? 2 : +b.step;
 if(typeof h !== 'function') throw new Error('EXPORT.terrain: h(x, z) is the ground height');
 const nx = Math.floor((box[2] - box[0]) / st) + 1, nz = Math.floor((box[3] - box[1]) / st) + 1;
 const H = new Float32Array(nx * nz), W = typeof b.water === 'function' ? new Float32Array(nx * nz) : null;
 for(let j = 0; j < nz; j++) for(let i = 0; i < nx; i++){ const x = box[0] + i * st, z = box[1] + j * st;
  H[j * nx + i] = h(x, z); if(W) W[j * nx + i] = b.water(x, z); }
 t.grid = { x0: box[0], z0: box[1], step: st, nx, nz, heights: pack(H), water: W ? pack(W) : null,
  note: 'h(x, z) sampled at x0 + i*step, z0 + j*step (row j, column i): the ground the page reads, on the export\'s own grid' };
 if(F) t.field = F.export({ box });
 const N = b.probes == null ? 16 : b.probes | 0, pts = [];
 for(let j = 0; j < N; j++) for(let i = 0; i < N; i++){
  const x = box[0] + (i + 0.37) / N * (box[2] - box[0]), z = box[1] + (j + 0.71) / N * (box[3] - box[1]);
  pts.push([x, z, h(x, z)]); }
 t.probes = { rule: 'x0 + (i + 0.37)/N * width, z0 + (j + 0.71)/N * depth, N = ' + N + ': off the lattice, so a port\'s interpolation is tested too',
  points: pts };
 return t;
}

// ---------------------------------------------------------------- compaction (ROADMAP.md finding 10)
// arrays: {name: [TypedArray, itemSize]} over the same vertices; index: the tile's triangles. Returns the vertices the
// index uses, in first-use order, and the index renumbered (Uint16 when they fit under 65535, the glTF reserved value)
function compact(arrays, index){
 const names = Object.keys(arrays);
 if(!names.length) throw new Error('EXPORT.compact: no arrays');
 const nv = arrays[names[0]][0].length / arrays[names[0]][1];
 const map = new Int32Array(nv).fill(-1), order = [];
 for(let i = 0; i < index.length; i++){ const v = index[i]; if(v >= nv) throw new Error('EXPORT.compact: index ' + v + ' past ' + nv + ' vertices'); if(map[v] < 0){ map[v] = order.length; order.push(v); } }
 const n = order.length, I = n < 65535 ? new Uint16Array(index.length) : new Uint32Array(index.length);
 for(let i = 0; i < index.length; i++) I[i] = map[index[i]];
 const out = {};
 for(const k of names){
  const [a, s] = arrays[k], b = new a.constructor(n * s);
  for(let j = 0; j < n; j++){ const o = order[j] * s; for(let q = 0; q < s; q++) b[j * s + q] = a[o + q]; }
  out[k] = b;
 }
 return { arrays: out, index: I, vertices: n, dropped: nv - n };
}

// ---------------------------------------------------------------- check: every reference resolves
function check(w, opt){
 opt = opt || {};
 const P = [], J = { items: 0, instances: 0, itemsWithSet: 0, setsResolved: 0, uidsChecked: 0, uidsDiffer: 0,
  buckets: 0, bucketRecords: 0, bucketRecordsResolved: 0, materialRefs: 0, textureRefs: 0 };
 const bad = m => { if(P.length < 200) P.push(m); };
 if(!w || w.format !== FORMAT) bad('not a ' + FORMAT + ' object');
 if(!w || !w.convention || w.convention.matrix == null) bad('no convention');
 if(!w) return { ok: false, problems: P, joins: J };
 const ids = (L, what) => { const m = new Map(); (L || []).forEach(r => { if(m.has(r.id)) bad('duplicate ' + what + ' id ' + r.id); m.set(r.id, r); }); return m; };
 const mats = ids(w.materials, 'material'), texs = ids(w.textures, 'texture'), items = ids(w.items, 'item'), bks = ids(w.buckets, 'bucket');
 const R = w.registry && w.registry.records ? ids(w.registry.records, 'registry') : null;
 for(const m of w.materials || []) for(const k of ['map', 'normalMap', 'roughnessMap']){
  if(m[k] == null) continue; J.textureRefs++;
  if(!texs.has(m[k])) bad('material ' + m.id + ' names texture ' + m[k] + ', which the export does not hold');
 }
 for(const m of w.materials || []) if(m.layers){   // a ground's layers (EXPORT.groundLayers): each map a texture, each weight a channel
  const names = m.weights && m.weights.names || [];
  (m.layers.terms || []).forEach((t, i) => { (t.maps || []).forEach(q => { J.textureRefs++;
    if(!texs.has(q.map)) bad('material ' + m.id + ' layer ' + i + ' names texture ' + q.map + ', which the export does not hold'); });
   if(t.weight != null && names.indexOf(t.weight) < 0) bad('material ' + m.id + ' layer ' + i + ' is weighted by ' + t.weight + ', which its weights do not hold'); });
  if(m.weights){ const v = unpack(m.weights.values);
   if(!v || v.length !== m.weights.nx * m.weights.nz * names.length) bad('material ' + m.id + ': its weights hold ' + (v ? v.length : 0) + ' values for ' + m.weights.nx + ' x ' + m.weights.nz + ' x ' + names.length); }
 }
 for(const t of w.textures || []){
  if(t.from === 'library' && !(t.lib && t.pack && t.family)) bad('library texture ' + t.id + ' without lib, pack and family');
  if(t.from === 'png' && !t.png) bad('texture ' + t.id + ' says png and holds none');
 }
 for(const it of w.items || []){
  J.items++; J.instances += it.count | 0;
  if(!mats.has(it.material)) bad('item ' + it.id + ' names material ' + it.material + ', which the export does not hold'); else J.materialRefs++;
  if(it.record == null) continue;
  J.itemsWithSet++;
  if(!Array.isArray(it.records) || it.records.length !== it.count) bad('item ' + it.id + ': ' + (it.records ? it.records.length : 0) + ' uids for ' + it.count + ' instances');
  const ix = it.recordIndex ? unpack(it.recordIndex) : null;
  if(!ix || ix.length !== it.count) bad('item ' + it.id + ': recordIndex does not match its count');
  if(R){
   const s = R.get(it.record);
   if(!s) bad('item ' + it.id + ' names set ' + it.record + ', which the registry does not hold');
   else { J.setsResolved++;
    if(s['class'] !== it.recordClass || s.key !== it.recordKey) bad('item ' + it.id + ': class or key differ from its set ' + it.record);
    if(!s.set) bad('item ' + it.id + ': its record ' + it.record + ' is not an item set'); }
  }
  if(opt.uid && it.matrices && it.records){
   const M = unpack(it.matrices);
   for(let j = 0; j < it.count; j++){
    J.uidsChecked++;
    if(opt.uid(it.recordClass, it.recordKey, [M[j * 16 + 12], M[j * 16 + 13], M[j * 16 + 14]]) !== it.records[j]){ J.uidsDiffer++; if(J.uidsDiffer < 4) bad('item ' + it.id + ' instance ' + j + ': uid differs'); }
   }
  }
 }
 for(const b of w.buckets || []){
  J.buckets++;
  if(!mats.has(b.material)) bad('bucket ' + b.id + ' names material ' + b.material + ', which the export does not hold'); else J.materialRefs++;
  if(!b.recordIds) continue;
  if(!Array.isArray(b.records) || b.records.length !== b.recordIds.length) bad('bucket ' + b.id + ': records and recordIds differ in length');
  b.recordIds.forEach((id, i) => { J.bucketRecords++;
   if(!R) return;
   const r = R.get(id);
   if(!r) bad('bucket ' + b.id + ' names record ' + id + ', which the registry does not hold');
   else if(r.uid !== b.records[i]) bad('bucket ' + b.id + ': record ' + id + ' has uid ' + r.uid + ', the bucket says ' + b.records[i]);
   else J.bucketRecordsResolved++; });
 }
 if(w.registry && !R) bad('registry without records');
 if(R) for(const r of R.values()) if(r.parent != null && !R.has(r.parent)) bad('registry record ' + r.id + ': its parent ' + r.parent + ' is not in the registry');
 if(w.terrain){ const t = w.terrain;
  if(t.field && t.field.format !== 'krator-field') bad('terrain.field is not a krator-field');
  if(!t.field && !t.grid) bad('terrain with neither a field nor a grid'); }
 if(w.water){ const sids = ids(w.water.surfaces, 'water surface');
  if(w.water.format !== 'krator-water') bad('water is not a krator-water section');
  for(const S of w.water.surfaces || []){
   if(S.kind === 'open' && (!Array.isArray(S.waves) || S.waves.some(q => !Array.isArray(q.turns) || q.turns.length !== 3))) bad('water ' + S.id + ': an open surface without its waves in turns');
   if(S.bed){ const b = unpack(S.bed.bytes); if(!b || b.length !== S.bed.nx * S.bed.nz * 4) bad('water ' + S.id + ': its bed holds ' + (b ? b.length : 0) + ' bytes for ' + S.bed.nx + ' x ' + S.bed.nz + ' texels'); }
   if(S.kind === 'shore' && !sids.has(S.of)) bad('water ' + S.id + ': the shore of ' + S.of + ', which the section does not hold');
  }
  for(const p of w.water.probes || []) if(!sids.has(p[4])) bad('a water probe names surface ' + p[4] + ', which the section does not hold');
 }
 return { ok: !P.length, problems: P, joins: J };
}

// ---------------------------------------------------------------- glb: the meshes as binary glTF
// a column-major matrix as translation, rotation (a unit quaternion) and scale. Returns the largest difference between
// the matrix and the recomposed one, so a sheared matrix (which TRS cannot hold) shows in the stats
function trs(m, o, T, R, S, i){
 const ax = m[o], ay = m[o + 1], az = m[o + 2], bx = m[o + 4], by = m[o + 5], bz = m[o + 6], cx = m[o + 8], cy = m[o + 9], cz = m[o + 10];
 let sx = Math.hypot(ax, ay, az); const sy = Math.hypot(bx, by, bz), sz = Math.hypot(cx, cy, cz);
 const det = ax * (by * cz - bz * cy) - bx * (ay * cz - az * cy) + cx * (ay * bz - az * by);
 if(det < 0) sx = -sx;
 const ix = sx ? 1 / sx : 0, iy = sy ? 1 / sy : 0, iz = sz ? 1 / sz : 0;
 const m11 = ax * ix, m21 = ay * ix, m31 = az * ix, m12 = bx * iy, m22 = by * iy, m32 = bz * iy, m13 = cx * iz, m23 = cy * iz, m33 = cz * iz;
 const tr = m11 + m22 + m33; let x, y, z, w;   // three's Quaternion.setFromRotationMatrix
 if(tr > 0){ const s = 0.5 / Math.sqrt(tr + 1); w = 0.25 / s; x = (m32 - m23) * s; y = (m13 - m31) * s; z = (m21 - m12) * s; }
 else if(m11 > m22 && m11 > m33){ const s = 2 * Math.sqrt(1 + m11 - m22 - m33); w = (m32 - m23) / s; x = 0.25 * s; y = (m12 + m21) / s; z = (m13 + m31) / s; }
 else if(m22 > m33){ const s = 2 * Math.sqrt(1 + m22 - m11 - m33); w = (m13 - m31) / s; x = (m12 + m21) / s; y = 0.25 * s; z = (m23 + m32) / s; }
 else { const s = 2 * Math.sqrt(1 + m33 - m11 - m22); w = (m21 - m12) / s; x = (m13 + m31) / s; y = (m23 + m32) / s; z = 0.25 * s; }
 const l = Math.hypot(x, y, z, w) || 1; x /= l; y /= l; z /= l; w /= l;
 T[i * 3] = m[o + 12]; T[i * 3 + 1] = m[o + 13]; T[i * 3 + 2] = m[o + 14];
 R[i * 4] = x; R[i * 4 + 1] = y; R[i * 4 + 2] = z; R[i * 4 + 3] = w;
 S[i * 3] = sx; S[i * 3 + 1] = sy; S[i * 3 + 2] = sz;
 // recompose: the rotation's columns scaled, against the matrix
 const xx = x * x, yy = y * y, zz = z * z, xy = x * y, xz = x * z, yz = y * z, wx = w * x, wy = w * y, wz = w * z;
 const r = [1 - 2 * (yy + zz), 2 * (xy + wz), 2 * (xz - wy), 2 * (xy - wz), 1 - 2 * (xx + zz), 2 * (yz + wx), 2 * (xz + wy), 2 * (yz - wx), 1 - 2 * (xx + yy)];
 const sc = [sx, sx, sx, sy, sy, sy, sz, sz, sz], mm = [ax, ay, az, bx, by, bz, cx, cy, cz];
 let e = 0; for(let k = 0; k < 9; k++) e = Math.max(e, Math.abs(r[k] * sc[k] - mm[k]));
 return e;
}
const linHex = h => { const n = parseInt(String(h || '#ffffff').slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
function glb(w){
 const J = { asset: { version: '2.0', generator: 'krator core/export ' + VERSION }, scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [],
  materials: [], accessors: [], bufferViews: [], buffers: [{ byteLength: 0 }] };
 const chunks = []; let off = 0, trsErr = 0, instanced = 0;
 const view = a => { const u = bytesOf(a); J.bufferViews.push({ buffer: 0, byteOffset: off, byteLength: u.length }); chunks.push(u); off += u.length;
  const pad = (4 - off % 4) % 4; if(pad){ chunks.push(new Uint8Array(pad)); off += pad; } return J.bufferViews.length - 1; };
 const COMP = { Float32Array: 5126, Uint16Array: 5123, Uint32Array: 5125 }, TYPE = { 1: 'SCALAR', 2: 'VEC2', 3: 'VEC3', 4: 'VEC4' };
 const acc = (a, size, mm) => { const r = { bufferView: view(a), componentType: COMP[a.constructor.name], count: a.length / size, type: TYPE[size] };
  if(mm){ const mn = new Array(size).fill(Infinity), mx = new Array(size).fill(-Infinity);
   for(let i = 0; i < a.length; i++){ const k = i % size; if(a[i] < mn[k]) mn[k] = a[i]; if(a[i] > mx[k]) mx[k] = a[i]; }
   r.min = mn; r.max = mx; }
  J.accessors.push(r); return J.accessors.length - 1; };
 const matIx = new Map();
 (w.materials || []).forEach(m => { matIx.set(m.id, J.materials.length);
  const c = linHex(m.colour);   // linear already (convention.colours.materials): glTF's baseColorFactor is linear too
  const g = { name: String(m.id), pbrMetallicRoughness: { baseColorFactor: [c[0], c[1], c[2], 1], metallicFactor: m.metal == null ? 0 : m.metal,
   roughnessFactor: m.roughness == null ? 1 : m.roughness }, doubleSided: !!m.doubleSided, extras: { krator_material: m.id } };
  if(m.alphaTest > 0){ g.alphaMode = 'MASK'; g.alphaCutoff = m.alphaTest; }
  J.materials.push(g); });
 const mesh = (g, matId, name) => {
  const P = unpack(g.position), nv = P.length / 3, at = { POSITION: acc(P, 3, true) };
  if(g.normal) at.NORMAL = acc(unpack(g.normal), 3);
  if(g.uv) at.TEXCOORD_0 = acc(unpack(g.uv), 2);
  if(g.color){ const C = unpack(g.color); at.COLOR_0 = acc(C, C.length / nv === 4 ? 4 : 3); }
  const p = { attributes: at, mode: 4 };
  if(g.index){ let I = unpack(g.index); if(I.constructor === Uint16Array && nv >= 65535) I = Uint32Array.from(I); p.indices = acc(I, 1); }
  if(matIx.has(matId)) p.material = matIx.get(matId);
  J.meshes.push({ name, primitives: [p] }); return J.meshes.length - 1; };
 const strip = (r, k, kind, node) => { const o = {}; for(const key in r) if(['geometry', 'matrices', 'colours', 'extras'].indexOf(key) < 0) o[key] = r[key];
  o.glb = node; return o; };
 const items = (w.items || []).map((it, k) => {
  const n = it.count, M = unpack(it.matrices), T = new Float32Array(n * 3), R = new Float32Array(n * 4), S = new Float32Array(n * 3);
  for(let i = 0; i < n; i++) trsErr = Math.max(trsErr, trs(M, i * 16, T, R, S, i));
  const ext = { TRANSLATION: acc(T, 3), ROTATION: acc(R, 4), SCALE: acc(S, 3) }, names = ['TRANSLATION', 'ROTATION', 'SCALE'];
  if(it.colours){ ext._COLOR = acc(unpack(it.colours), 3); names.push('_COLOR'); }
  for(const key in (it.extras || {})){ const x = it.extras[key], a = '_' + key.toUpperCase(); ext[a] = acc(unpack(x.data), x.size); names.push(a); }
  const name = 'item_' + k;
  J.nodes.push({ name, mesh: mesh(it.geometry, it.material, name), extensions: { EXT_mesh_gpu_instancing: { attributes: ext } },
   extras: { krator_item: it.id, krator: it.record == null ? null : it.record } });
  J.scenes[0].nodes.push(J.nodes.length - 1); instanced += n;
  return strip(it, k, 'item', { node: name, instances: n, attributes: names });
 });
 const buckets = (w.buckets || []).map((b, k) => {
  const name = 'bucket_' + k;
  J.nodes.push({ name, mesh: mesh(b.geometry, b.material, name), extras: { krator_bucket: b.id } });
  J.scenes[0].nodes.push(J.nodes.length - 1);
  return strip(b, k, 'bucket', { node: name });
 });
 if(items.length) J.extensionsUsed = ['EXT_mesh_gpu_instancing'];
 J.buffers[0].byteLength = off;
 const enc = s => { if(typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s); const b = Buffer.from(s, 'utf8'), u = new Uint8Array(b.length); u.set(b); return u; };
 let js = enc(JSON.stringify(J)); const jp = (4 - js.length % 4) % 4;
 if(jp){ const t = new Uint8Array(js.length + jp); t.set(js); t.fill(0x20, js.length); js = t; }
 const total = 12 + 8 + js.length + 8 + off, out = new Uint8Array(total), dv = new DataView(out.buffer);
 dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, total, true);
 dv.setUint32(12, js.length, true); dv.setUint32(16, 0x4E4F534A, true); out.set(js, 20);
 let p = 20 + js.length; dv.setUint32(p, off, true); dv.setUint32(p + 4, 0x004E4942, true); p += 8;
 for(const c of chunks){ out.set(c, p); p += c.length; }
 const json = {}; for(const k in w) json[k] = w[k];
 json.items = items; json.buckets = buckets;
 json.glb = { file: 'world.glb', nodes: J.nodes.length, bytes: total, note: 'items are nodes item_<k> and buckets bucket_<k>, k their index in this file\'s lists' };
 return { json, glb: out, stats: { bytes: total, nodes: J.nodes.length, meshes: J.meshes.length, instances: instanced, trsMaxError: trsErr } };
}

const api = { FORMAT, VERSION, SECTIONS, CONTRACTS, CONVENTION, register, contributors, world, check, glb, compact, pack, unpack, terrain };
// modules that load before this file queue their contributors: (root.EXPORT_QUEUE = root.EXPORT_QUEUE || []).push([section, fn, opt])
const Q = root.EXPORT_QUEUE;
if(Array.isArray(Q)) Q.splice(0).forEach(a => register(a[0], a[1], a[2]));
return api;
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this);
if(typeof window !== 'undefined') window.EXPORT = EXPORT;
