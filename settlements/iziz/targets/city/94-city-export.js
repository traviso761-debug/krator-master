// ================================================================= IZIZ CITY — its part of core/export (M5)
// GODOT-PLAN.md Phase 4 ("Cities": KRATOR_EXPORT as the city template) and core/export/README.md ("Iziz"): the city's
// meshes, materials, ground and records in the krator-world container, the second contributor after the biome core.
// `python3 tools/harness.py export settlements/iziz/dist/iziz.html --out godot/data/world-iziz --box x0,z0,x1,z1` writes
// it; godot/krator/world_import.gd reads it. Everything here runs at export time (EXPORT.world): nothing is drawn or
// changed. [G data] in what it writes; it reads the page's three.js scene, so it is host-side code that only reads.
//
//   items      every baked kit item (KIT.meshes: one InstancedMesh each) and the vendored biome's instanced sets, with
//              the instances whose origin lies in the box: the unit geometry once, the instance matrices (float32, as
//              the page holds them), the instance colours (linear). A kit item names its core/tags item set (91t:
//              class part, key 'kit:<item>'), a uid per instance recomputed from its matrix, and `owners`: per
//              instance the record of the registered volume it stands in (below), or null
//   buckets    the plain meshes (walls, lathes, escarpments, the moat: not the ground, which is the terrain and the
//              stage's look), one bucket per material: the triangles whose centroid lies in the box, in world space;
//              `recordIds`/`records` the volumes their centroids stand in
//   materials  one record per material the meshes use (three's MeshStandard and MeshBasic as they are; a kbake clone is
//              its source's): colour, roughness, metal, specular, emissive, the maps by texture id, `kmat` the
//              KMAT record it is (kmat:iziz:<MAT key>), `hook` (world-uv, breakup, glass: godot/krator/khooks.gd),
//              `worldUV: {K}` where vWorldUV tiles it (an instance: uv * the face's two scale axes * K; a plain mesh:
//              uv as it is, the map's repeat not applied), `unlit` for MeshBasic, `transparent` and `opacity`
//   textures   a library map by reference to Iziz's pack (tex/pack.json; the harness copies it), every other map a PNG
//              (the procedural canvases; an image the page decoded, at most 512 px)
//   terrain    EXPORT.terrain over the box from terrainH (no core/terrain field: the city is 4 m cells of a function)
//   stage      KSTAGE.capture: light, fog, sky panorama, the painted ground's look on the terrain grid
//   fixtures   the doors, windows and lamps 69f noted and 91t registered (children of their buildings), with their host
//   furniture  the kit slots: REG's furniture (plazas, statues, fountains, drains) as placements of their kit piece;
//              pieces carry no mesh of their own (they are drawn in items and buckets)
//   interiors  none: Iziz's buildings are shells (the contributor answers null, so the section reads 'empty')
// The registry (core/tags, cropped to the box by core/export's adapter), atmos (ATMOS.export) and the KMAT table come
// from core/export's adapters. Owner rule: the registered volume (REG: x, z, r, from y to y + h, 1 m slack) holding the
// point, the smallest when several do; REG's buildings, farms and furniture only (flora and life are not owners).
(function(){
'use strict';
const BY = { by: 'iziz' };
const reg = (s, fn) => { if (typeof EXPORT !== 'undefined') EXPORT.register(s, fn, BY); else (window.EXPORT_QUEUE = window.EXPORT_QUEUE || []).push([s, fn, BY]); };
const P = a => EXPORT.pack(a);
const hex = c => '#' + c.getHexString();
const lodCopy = o => { for (let p = o; p; p = p.parent) if (p.userData && p.userData.lodCopy) return true; return false; };

// ---- owners: REG volumes on a 40 m hash
function owners(){
 const H = new Map(), C = 40, vols = [];
 for (const r of REG) {
  if (!REG_ID.has(r) || !r.cls || r.cls === 'flora' || r.cls === 'life') continue;
  const v = { id: REG_ID.get(r), x: r.x, z: r.z, r: Math.max(r.r || 0, .5), y0: (r.y || 0) - 1, y1: (r.y || 0) + (r.h || 0) + 1 };
  vols.push(v);
  for (let i = Math.floor((v.x - v.r) / C); i <= Math.floor((v.x + v.r) / C); i++)
   for (let j = Math.floor((v.z - v.r) / C); j <= Math.floor((v.z + v.r) / C); j++) { const k = i + ',' + j; (H.get(k) || H.set(k, []).get(k)).push(v); }
 }
 return (x, y, z) => { const L = H.get(Math.floor(x / C) + ',' + Math.floor(z / C)); if (!L) return null; let best = null;
  for (const v of L) { const dx = x - v.x, dz = z - v.z; if (dx * dx + dz * dz <= v.r * v.r && y >= v.y0 && y <= v.y1 && (!best || v.r < best.r)) best = v; }
  return best ? best.id : null; };
}

// ---- materials and textures
function library(m, key){   // the KMAT pack entry a bound material took, and its family (by its MAT key or alias, else by its set)
 if (!m.userData || !m.userData.lib || typeof KMAT === 'undefined') return null;
 const P = KMAT.packs.iziz || {};
 const fam = key == null ? null : typeof IZIZ_MATX !== 'undefined' && IZIZ_MATX[key] ? IZIZ_MATX[key].fam
  : typeof IZIZ_MATALIAS !== 'undefined' && IZIZ_MATALIAS[key] ? IZIZ_MATALIAS[key] : key;
 if (fam != null && P[fam] && P[fam].lib === m.userData.lib) return { fam, L: P[fam] };
 for (const f in P) if (P[f].lib === m.userData.lib) return { fam: f, L: P[f] };
 return null;
}
function collect(ctx){
 scene.updateMatrixWorld(true);
 const MK = new Map();
 for (const k in MAT) if (MAT[k] && MAT[k].isMaterial) MK.set(MAT[k], k);
 if (typeof IZIZ_MATX !== 'undefined') for (const n in IZIZ_MATX) MK.set(IZIZ_MATX[n].m, n);
 const KITOF = new Map(); for (const n in KIT.meshes) KITOF.set(KIT.meshes[n], n);
 const mats = [], matBy = new Map(), sig = new Map(), texs = [], texBy = new Map(), dropped = {};
 const drop = k => { dropped[k] = (dropped[k] || 0) + 1; };
 const png = t => { const im = t.image; if (!im) return null;
  try { const w = im.width || im.naturalWidth, h = im.height || im.naturalHeight; if (!w || !h) return null;
   let cv = im; if (!(im instanceof HTMLCanvasElement) || w > 512 || h > 512) { const s = Math.min(1, 512 / Math.max(w, h));
    cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w * s)); cv.height = Math.max(1, Math.round(h * s));
    if (im.data) { const c0 = document.createElement('canvas'); c0.width = w; c0.height = h; c0.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(im.data.buffer, im.data.byteOffset, w * h * 4), w, h), 0, 0); cv.getContext('2d').drawImage(c0, 0, 0, cv.width, cv.height); }
    else cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); }
   return { png: cv.toDataURL('image/png'), size: [cv.width, cv.height] }; } catch (e) { return null; } };
 const texOf = (t, slot, lib, wuv) => {
  if (!t) return null;
  const rep = wuv ? [1, 1] : [t.repeat.x, t.repeat.y], off = wuv ? [0, 0] : [t.offset.x, t.offset.y];
  const tag = (rep[0] !== 1 || rep[1] !== 1 || off[0] || off[1]) ? '@' + rep.map(v => +v.toFixed(4)).join('x') + (off[0] || off[1] ? '+' + off.map(v => +v.toFixed(4)).join(',') : '') : '';
  const key = (lib ? 'lib:' + lib.fam + ':' + slot : 'tex:' + t.uuid) + tag;
  if (texBy.has(key)) return texBy.get(key).id;
  const r = { id: 'tex:iziz:' + (lib ? lib.fam + ':' + slot : 'png' + texs.length) + tag, wrap: ['repeat', 'repeat'], repeat: rep, offset: off, flipY: t.flipY !== false };
  if (lib) { r.from = 'library'; r.lib = lib.L.lib; r.pack = 'iziz'; r.family = lib.fam; r.slot = slot; }
  else { const p = png(t); if (p) { r.from = 'png'; r.png = p.png; r.size = p.size; r.name = t.name || null; } else { r.from = 'none'; r.error = 'no drawable image'; } }
  texs.push(r); texBy.set(key, r); return r.id;
 };
 const matOf = (m, src) => {
  if (Array.isArray(m)) { drop('multi-material'); m = m[0]; }
  const key = MK.get(m) || (src && MK.get(src)) || null;
  const s = [m.type, key, m.color ? m.color.getHex() : '', m.map ? m.map.uuid : '', m.roughness, m.metalness, m.emissive ? m.emissive.getHex() : '',
   m.emissiveIntensity, m.transparent, m.opacity, m.alphaTest, m.side, m.userData && m.userData.uvK, m.userData && m.userData.lib, !!m.vertexColors].join('|');
  if (sig.has(s)) return sig.get(s);
  const lib = library(m, key), K = m.userData && m.userData.uvK || 0, shader = m.isShaderMaterial || m.isRawShaderMaterial;
  const hook = []; if (K) hook.push('world-uv'); if (lib && lib.L.breakup) hook.push('breakup');
  if (typeof MAT !== 'undefined' && MAT.glass && (m === MAT.glass || (src || m).onBeforeCompile === MAT.glass.onBeforeCompile)) hook.push('glass');
  let name = key || (m.name || m.type) + '~' + mats.length;
  if (matBy.has(name)) name += '~' + mats.length;
  const r = { id: 'iziz:' + name, name, family: lib ? lib.fam : key || m.type, source: 'iziz', kind: shader ? 'shader' : m.isMeshBasicMaterial ? 'basic' : 'standard',
   kmat: key && typeof KMAT !== 'undefined' && KMAT.adapters.iziz && KMAT.adapters.iziz[key] ? 'kmat:iziz:' + key : null,
   colour: m.color ? hex(m.color) : '#ffffff', roughness: m.roughness == null ? 1 : m.roughness, metal: m.metalness || 0,
   specular: lib && lib.L.specular != null ? lib.L.specular : .5,
   emissive: m.emissive && m.emissiveIntensity > 0 && m.emissive.getHex() ? hex(m.emissive) : null, emissiveIntensity: m.emissiveIntensity == null ? 0 : m.emissiveIntensity,
   doubleSided: m.side === THREE.DoubleSide, transparent: !!m.transparent, opacity: m.opacity == null ? 1 : m.opacity, alphaTest: m.alphaTest || 0,
   vertexColours: !!m.vertexColors, tint: true, unlit: !!m.isMeshBasicMaterial, hook: hook.length ? hook.join('+') : null,
   worldUV: K ? { K, note: 'an instance: uv * (the two instance-scale axes its face spans) * K; a plain mesh: uv as it is (vWorldUV, core/materials/opt/69a-world-uv.js)' } : null,
   scale: lib ? lib.L.scale.slice() : K ? [1 / K, 1 / K] : [1, 1], lib: lib ? lib.L.lib : null, breakup: lib && lib.L.breakup ? lib.L.breakup : null,
   normalScale: m.normalScale ? m.normalScale.x : 1,
   map: shader ? null : texOf(m.map, 'map', lib, !!K), normalMap: shader ? null : texOf(m.normalMap, 'normalMap', lib, !!K),
   roughnessMap: shader ? null : texOf(m.roughnessMap, 'roughnessMap', lib, !!K) };
  if (shader) { r.note = 'a ShaderMaterial (the vendored biome\'s own): exported plain'; drop('shader material'); }
  mats.push(r); matBy.set(name, r); sig.set(s, r.id); return r.id;
 };
 return { MK, KITOF, mats, texs, matOf, dropped, drop };
}

function geo(g){   // a BufferGeometry as packed arrays (an interleaved attribute is read out)
 const out = {}, A = (a, n) => { if (!a) return null; if (a.isInterleavedBufferAttribute || !(a.array instanceof Float32Array)) {
   const f = new Float32Array(a.count * n); for (let i = 0; i < a.count; i++) for (let k = 0; k < n; k++) f[i * n + k] = a.getComponent ? a.getComponent(i, k) : a.array[i * a.itemSize + k];
   return f; } return a.array.slice(0, a.count * n); };
 out.position = P(A(g.attributes.position, 3));
 if (g.attributes.normal) out.normal = P(A(g.attributes.normal, 3));
 if (g.attributes.uv) out.uv = P(A(g.attributes.uv, 2));
 if (g.index) { const I = g.index.array; out.index = P(I instanceof Uint16Array || I instanceof Uint32Array ? I.slice() : Uint32Array.from(I)); }
 return out;
}

function assemble(ctx){
 const C = collect(ctx), own = owners(), T = KTAGS.page, out = { items: [], buckets: [] };
 const box = ctx.box, inBox = ctx.inBox, M = new THREE.Matrix4(), W = new THREE.Matrix4(), v = new THREE.Vector3();
 const meshes = []; scene.traverse(o => { if (o.isMesh && o.geometry && o.geometry.attributes.position) meshes.push(o); });
 let k = 0;
 for (const o of meshes) {
  if (lodCopy(o)) { C.drop('core/lod copy'); continue; }
  if (o.isSkinnedMesh) { C.drop('skinned'); continue; }
  const m0 = Array.isArray(o.material) ? o.material[0] : o.material;
  if (!m0 || m0.isShaderMaterial || m0.isRawShaderMaterial || m0.blending === THREE.AdditiveBlending) { C.drop(m0 && m0.blending === THREE.AdditiveBlending ? 'additive' : 'shader material'); continue; }
  if (!o.isInstancedMesh) continue;
  const kit = C.KITOF.get(o), ident = o.matrixWorld.equals(new THREE.Matrix4()), A = o.instanceMatrix.array, keep = [];
  for (let i = 0; i < o.count; i++) {
   const x = ident ? A[i * 16 + 12] : (o.getMatrixAt(i, M), v.setFromMatrixPosition(W.multiplyMatrices(o.matrixWorld, M)).x);
   const z = ident ? A[i * 16 + 14] : v.z;
   if (inBox(x, z)) keep.push(i);
  }
  if (!keep.length) continue;
  const n = keep.length, mats = new Float32Array(n * 16), col = o.instanceColor ? new Float32Array(n * 3) : null;
  keep.forEach((i, j) => { if (ident) for (let q = 0; q < 16; q++) mats[j * 16 + q] = A[i * 16 + q];
   else { o.getMatrixAt(i, M); W.multiplyMatrices(o.matrixWorld, M); for (let q = 0; q < 16; q++) mats[j * 16 + q] = W.elements[q]; }
   if (col) for (let q = 0; q < 3; q++) col[j * 3 + q] = o.instanceColor.array[i * 3 + q]; });
  const name = kit || (o.name || 'instanced') + '~' + k;
  const it = { id: 'iziz/' + name, name, kit: kit ? 'iziz' : 'hyperjungle', label: kit || o.name || null,
   material: C.matOf(o.material, kit ? KIT.defs[kit].mat : null), lod: null, count: n, dynamic: false, visible: o.visible !== false,
   geometry: geo(o.geometry), matrices: P(mats), colours: col ? P(col) : null, extras: {} };
  const sid = kit && typeof IZFIX !== 'undefined' && IZFIX.sets ? IZFIX.sets[kit] : null;
  if (sid && T.isSet(sid)) { const S = T.get(sid);
   it.record = sid; it.recordClass = S['class']; it.recordKey = S.key;
   it.records = keep.map(i => T.uidOf(S, i)); it.recordIndex = P(Uint32Array.from(keep)); }
  it.owners = keep.map((i, j) => own(mats[j * 16 + 12], mats[j * 16 + 13], mats[j * 16 + 14]));
  out.items.push(it); k++;
 }
 // buckets: plain meshes, one per material, triangles by centroid
 const groups = new Map(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), nm = new THREE.Matrix3(), nv = new THREE.Vector3();
 for (const o of meshes) {
  if (o.isInstancedMesh || lodCopy(o) || o.isSkinnedMesh) continue;
  if (o.userData && o.userData.isGround) { C.drop('the ground (terrain and stage)'); continue; }
  const m0 = Array.isArray(o.material) ? o.material[0] : o.material;
  if (!m0 || m0.isShaderMaterial || m0.isRawShaderMaterial || m0.blending === THREE.AdditiveBlending) continue;
  const g = o.geometry, Pp = g.attributes.position, I = g.index;
  if (!g.boundingBox) g.computeBoundingBox();
  const bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
  if (box && (bb.max.x < box[0] || bb.min.x >= box[2] || bb.max.z < box[1] || bb.min.z >= box[3])) continue;
  const W0 = o.matrixWorld; nm.getNormalMatrix(W0);
  const tris = I ? I.count / 3 : Pp.count / 3, vi = t => I ? I.getX(t) : t, kept = [];
  for (let t = 0; t < tris; t++) { a.fromBufferAttribute(Pp, vi(t * 3)).applyMatrix4(W0); b.fromBufferAttribute(Pp, vi(t * 3 + 1)).applyMatrix4(W0); c.fromBufferAttribute(Pp, vi(t * 3 + 2)).applyMatrix4(W0);
   if (inBox((a.x + b.x + c.x) / 3, (a.z + b.z + c.z) / 3)) kept.push(t, (a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3); }
  if (!kept.length) continue;
  const mid = C.matOf(o.material, null);
  const G = groups.get(mid) || (groups.set(mid, { pos: [], nor: [], uv: [], col: [], idx: [], hasUv: false, hasCol: false, meshes: 0, owners: new Map(), names: new Set() }).get(mid));
  G.meshes++; G.names.add((o.name || '').replace(/[0-9]+/g, '#') || o.parent && o.parent.name || '?');
  const map = new Map(), N = g.attributes.normal, U = g.attributes.uv, Cc = g.attributes.color;
  if (U) G.hasUv = true; if (Cc) G.hasCol = true;
  for (let q = 0; q < kept.length; q += 4) {
   const t = kept[q], id = own(kept[q + 1], kept[q + 2], kept[q + 3]);
   if (id) G.owners.set(id, (G.owners.get(id) || 0) + 1);
   for (let s = 0; s < 3; s++) { const iv = vi(t * 3 + s); let j = map.get(iv);
    if (j === undefined) { j = G.pos.length / 3; map.set(iv, j); a.fromBufferAttribute(Pp, iv).applyMatrix4(W0); G.pos.push(a.x, a.y, a.z);
     if (N) { nv.fromBufferAttribute(N, iv).applyMatrix3(nm).normalize(); G.nor.push(nv.x, nv.y, nv.z); } else G.nor.push(0, 1, 0);
     G.uv.push(U ? U.getX(iv) : 0, U ? U.getY(iv) : 0); G.col.push(Cc ? Cc.getX(iv) : 1, Cc ? Cc.getY(iv) : 1, Cc ? Cc.getZ(iv) : 1); }
    G.idx.push(j); } }
 }
 for (const [mid, G] of groups) {
  const nvx = G.pos.length / 3, ids = Array.from(G.owners.keys()).sort();
  const gg = { position: P(new Float32Array(G.pos)), normal: P(new Float32Array(G.nor)), index: P(nvx < 65535 ? Uint16Array.from(G.idx) : Uint32Array.from(G.idx)) };
  if (G.hasUv) gg.uv = P(new Float32Array(G.uv)); if (G.hasCol) gg.color = P(new Float32Array(G.col));
  out.buckets.push({ id: 'iziz/bucket:' + mid.replace(/^iziz:/, ''), name: mid.replace(/^iziz:/, ''), kit: 'iziz', label: Array.from(G.names).slice(0, 8).join(', '),
   material: mid, lod: null, triangles: G.idx.length / 3, geometry: gg, recordIds: ids, records: ids.map(id => T.get(id).uid),
   pieces: { meshes: G.meshes, rule: 'a triangle by its centroid (x0 <= x < x1, z0 <= z < z1); recordIds the volumes the centroids stand in', byRecord: Object.fromEntries(G.owners) } });
 }
 out.materials = C.mats; out.textures = C.texs; out.dropped = C.dropped;
 return out;
}
const B = ctx => ctx.memo('iziz', () => assemble(ctx));
reg('items', ctx => B(ctx).items);
reg('buckets', ctx => B(ctx).buckets);
reg('materials', ctx => B(ctx).materials);
reg('textures', ctx => B(ctx).textures);
reg('terrain', ctx => ctx.box ? EXPORT.terrain(ctx.box, { h: (x, z) => terrainH(x, z), step: ctx.opt.ground == null ? 2 : ctx.opt.ground }) : null);
reg('stage', ctx => { if (typeof KSTAGE === 'undefined' || !ctx.box) return null; const b = ctx.box, cx = (b[0] + b[2]) / 2, cz = (b[1] + b[3]) / 2;
 return KSTAGE.capture({ at: [cx, terrainH(cx, cz) + 40, cz], sky: ctx.opt.sky == null ? 1024 : ctx.opt.sky, skyNear: Math.min(b[2] - b[0], b[3] - b[1]) / 2,
  box: b, step: ctx.opt.ground == null ? 2 : ctx.opt.ground, ground: (x, z) => terrainH(x, z) }); });
reg('fixtures', ctx => { const T = KTAGS.page; if (!T || typeof IZFIX === 'undefined') return null;
 const recs = T.records.filter(r => r['class'] === 'fixture' && !r.removed && ctx.inBox(r.at[0], r.at[2])).map(r => Object.assign({}, r, { host: IZFIX.host[r.id] || null }));
 return { format: 'krator-fixtures', version: 1, build: T.build, note: 'Iziz\'s vernacular doors, windows and lamps (69f-iziz-fixtures.js), children of their buildings; local +z of a fixture is out (ry its yaw); at: a door\'s sill and a window\'s on the outer face, a lamp\'s bulb; host.sill above the building\'s base. The Ancients kit\'s openings are not records yet',
  records: recs, dropped: IZFIX.dropped || 0 }; });
reg('furniture', ctx => { const T = KTAGS.page; if (!T) return null;
 const place = [], pieces = new Map();
 for (const r of REG) { if (r.cls !== 'furniture' || !REG_ID.has(r) || !ctx.inBox(r.x, r.z)) continue; const rec = T.get(REG_ID.get(r));
  const pid = (r.key || 'piece') + '/0/0';
  if (!pieces.has(pid)) pieces.set(pid, { id: pid, entry: { tags: rec.tags, size: rec.size || [2 * (rec.r || 0), 2 * (rec.r || 0), rec.h || 0], role: rec['class'], key: r.key }, lights: null, mesh: null });
  place.push({ record: rec.id, piece: pid, at: rec.at, ry: rec.ry }); }
 if (!place.length) return null;
 return { format: 'krator-furniture', version: 1, note: 'Iziz\'s kit slots: the registered furniture (plazas, statues, fountains, drains) as placements of their piece; a piece\'s mesh is not its own here (mesh: null): its geometry is in items and buckets, owned by the same record',
  pieces: Array.from(pieces.values()), placements: place }; });
reg('interiors', () => null);
window.IZIZ_EXPORT = { collect: ctx => assemble(ctx || { box: null, inBox: () => true }) };
})();
