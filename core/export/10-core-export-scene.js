// ================================================================= CORE — export: a three.js scene's meshes as items and buckets
// Lifted from Iziz's contributor (settlements/iziz/targets/city/94-city-export.js, M5) on 2026-10-20 for the isle demo
// (P8): the part of it that reads any page's scene, so a second city exports through the same code (core/export/README.md,
// "Exporting a page's scene"). [web]: it reads THREE, the scene and canvases at export time; it draws and changes nothing.
//
//   EXPORT.sceneReader(o) -> {collect(), assemble(ctx, more?), geo(g)}
//     collect()          the material and texture tables, filled as meshes ask: {MK, KITOF, mats, texs, matOf(m, src), dropped, drop(k)}
//     assemble(ctx, more) the box's meshes: {items, buckets, materials, textures, dropped}. items: every InstancedMesh with
//                        an instance whose origin lies in the box (the unit geometry once, the box's instance matrices and
//                        colours); a kit item (o.kitOf) names its core/tags item set (o.itemSet) and a uid per instance;
//                        `owners` per instance (o.ownerOf, else the volume o.owner(x, y, z) finds). buckets: the plain meshes,
//                        one per material, the triangles whose centroid lies in the box, in world space, with the records their
//                        centroids stand in. more(ctx, C, own, out): the page's own items, after the scene's, before the buckets
//     geo(g)             a BufferGeometry as packed arrays (an interleaved attribute is read out)
//   o: name ('iziz': the ids' prefix and the home pack), source (material records' `source`), scene (default the page's),
//      matKeys() -> Map(material -> its key), kitOf(mesh) -> a kit item's name or null, library(m, key) -> {fam, L, pack} or
//      null (default: the KMAT pack entry whose lib the material bound, the home pack first), kmat(key) -> a KMAT id or null,
//      hooks(m, src) -> more hook names (glass), itemKit(kit) -> an item's `kit`, itemMat(kit) -> the material an item's
//      key comes from, itemSet(kit) -> its core/tags item set, tags (a core/tags registry), owner(x, y, z) -> a record id,
//      ownerOf(mesh, i, x, y, z) -> a record id (before owner), skipInstanced(mesh) / skipMesh(mesh) -> a reason or null
(function(root){
'use strict';
const E = root.EXPORT;
if (!E) return;
const hex = c => '#' + c.getHexString();
const lodCopy = o => { for (let p = o; p; p = p.parent) if (p.userData && p.userData.lodCopy) return true; return false; };
function geo(g){
 const P = a => E.pack(a);
 const out = {}, A = (a, n) => { if (!a) return null; if (a.isInterleavedBufferAttribute || !(a.array instanceof Float32Array)) {
   const f = new Float32Array(a.count * n); for (let i = 0; i < a.count; i++) for (let k = 0; k < n; k++) f[i * n + k] = a.getComponent ? a.getComponent(i, k) : a.array[i * a.itemSize + k];
   return f; } return a.array.slice(0, a.count * n); };
 out.position = P(A(g.attributes.position, 3));
 if (g.attributes.normal) out.normal = P(A(g.attributes.normal, 3));
 if (g.attributes.uv) out.uv = P(A(g.attributes.uv, 2));
 if (g.index) { const I = g.index.array; out.index = P(I instanceof Uint16Array || I instanceof Uint32Array ? I.slice() : Uint32Array.from(I)); }
 return out;
}
E.sceneReader = function(o){
 const NAME = o.name, SRC = o.source || o.name, P = a => E.pack(a), sceneOf = () => o.scene || (typeof scene !== 'undefined' ? scene : root.scene);   /* a page's `scene` is often a top-level let, not on window */
 const libraryOf = o.library || ((m) => {
  if (!m.userData || !m.userData.lib || typeof KMAT === 'undefined') return null;
  const names = [NAME].concat(Object.keys(KMAT.packs).filter(n => n !== NAME).sort());
  for (const pack of names) { const L = KMAT.packs[pack] || {}; for (const f in L) if (L[f].lib === m.userData.lib) return { fam: f, L: L[f], pack }; }
  return null; });
 function collect(){
  sceneOf().updateMatrixWorld(true);
  const MK = o.matKeys ? o.matKeys() : new Map(), KITOF = new Map();
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
   const key = (lib ? 'lib:' + lib.pack + ':' + lib.fam + ':' + slot : 'tex:' + t.uuid) + tag;
   if (texBy.has(key)) return texBy.get(key).id;
   const r = { id: 'tex:' + NAME + ':' + (lib ? (lib.pack === NAME ? '' : lib.pack + ':') + lib.fam + ':' + slot : 'png' + texs.length) + tag, wrap: ['repeat', 'repeat'], repeat: rep, offset: off, flipY: t.flipY !== false };
   if (lib) { r.from = 'library'; r.lib = lib.L.lib; r.pack = lib.pack; r.family = lib.fam; r.slot = slot; }
   else { const p = png(t); if (p) { r.from = 'png'; r.png = p.png; r.size = p.size; r.name = t.name || null; } else { r.from = 'none'; r.error = 'no drawable image'; } }
   texs.push(r); texBy.set(key, r); return r.id;
  };
  const matOf = (m, src) => {
   if (Array.isArray(m)) { drop('multi-material'); m = m[0]; }
   const key = MK.get(m) || (src && MK.get(src)) || null;
   const s = [m.type, key, m.color ? m.color.getHex() : '', m.map ? m.map.uuid : '', m.roughness, m.metalness, m.emissive ? m.emissive.getHex() : '',
    m.emissiveIntensity, m.transparent, m.opacity, m.alphaTest, m.side, m.userData && m.userData.uvK, m.userData && m.userData.lib, !!m.vertexColors,
    m.userData && m.userData.courtTri ? JSON.stringify(m.userData.courtTri) : ''].join('|');
   if (sig.has(s)) return sig.get(s);
   const lib = libraryOf(m, key), K = m.userData && m.userData.uvK || 0, shader = m.isShaderMaterial || m.isRawShaderMaterial;
   const tri = m.userData && m.userData.courtTri || null;   // a court finish (Iziz's 95i COURT_TRI): the set projected triplanar, no UVs
   const hook = []; if (K) hook.push('world-uv'); if (lib && lib.L.breakup && !tri) hook.push('breakup'); if (tri) hook.push('triplanar');
   if (o.hooks) hook.push(...o.hooks(m, src));
   let name = key || (m.name || m.type) + '~' + mats.length;
   if (matBy.has(name)) name += '~' + mats.length;
   const r = { id: NAME + ':' + name, name, family: lib ? lib.fam : key || m.type, source: SRC, kind: shader ? 'shader' : m.isMeshBasicMaterial ? 'basic' : 'standard',
    kmat: key && o.kmat ? o.kmat(key) : null,
    colour: m.color ? hex(m.color) : '#ffffff', roughness: m.roughness == null ? 1 : m.roughness, metal: m.metalness || 0,
    specular: lib && lib.L.specular != null ? lib.L.specular : .5,
    emissive: m.emissive && m.emissiveIntensity > 0 && m.emissive.getHex() ? hex(m.emissive) : null, emissiveIntensity: m.emissiveIntensity == null ? 0 : m.emissiveIntensity,
    doubleSided: m.side === THREE.DoubleSide, transparent: !!m.transparent, opacity: m.opacity == null ? 1 : m.opacity, alphaTest: m.alphaTest || 0,
    vertexColours: !!m.vertexColors, tint: !(tri && !tri.detail), unlit: !!m.isMeshBasicMaterial, hook: hook.length ? hook.join('+') : null,
    triplanar: tri ? { tile: tri.tile, detail: tri.detail, gain: tri.gain, note: 'the map projected from three sides in the mesh\'s own frame, one tile per `tile` metres; detail: multiplied into the vertex colour times gain, else the map is the surface (95i COURT_TRI)' } : null,
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
 function assemble(ctx, more){
  const C = collect(), own = o.owner || (() => null), T = o.tags, out = { items: [], buckets: [] };
  const box = ctx.box, inBox = ctx.inBox, M = new THREE.Matrix4(), W = new THREE.Matrix4(), v = new THREE.Vector3();
  const meshes = []; sceneOf().traverse(m => { if (m.isMesh && m.geometry && m.geometry.attributes.position) meshes.push(m); });
  let k = 0;
  for (const m of meshes) {
   if (lodCopy(m)) { C.drop('core/lod copy'); continue; }
   if (m.isSkinnedMesh) { C.drop('skinned'); continue; }
   const m0 = Array.isArray(m.material) ? m.material[0] : m.material;
   if (!m0 || m0.isShaderMaterial || m0.isRawShaderMaterial || m0.blending === THREE.AdditiveBlending) { C.drop(m0 && m0.blending === THREE.AdditiveBlending ? 'additive' : 'shader material'); continue; }
   if (!m.isInstancedMesh) continue;
   const why = o.skipInstanced ? o.skipInstanced(m) : null; if (why) { C.drop(why); continue; }
   const kit = o.kitOf ? o.kitOf(m) : null, ident = m.matrixWorld.equals(new THREE.Matrix4()), A = m.instanceMatrix.array, keep = [];
   for (let i = 0; i < m.count; i++) {
    const x = ident ? A[i * 16 + 12] : (m.getMatrixAt(i, M), v.setFromMatrixPosition(W.multiplyMatrices(m.matrixWorld, M)).x);
    const z = ident ? A[i * 16 + 14] : v.z;
    if (inBox(x, z)) keep.push(i);
   }
   if (!keep.length) continue;
   const n = keep.length, mats = new Float32Array(n * 16), col = m.instanceColor ? new Float32Array(n * 3) : null;
   keep.forEach((i, j) => { if (ident) for (let q = 0; q < 16; q++) mats[j * 16 + q] = A[i * 16 + q];
    else { m.getMatrixAt(i, M); W.multiplyMatrices(m.matrixWorld, M); for (let q = 0; q < 16; q++) mats[j * 16 + q] = W.elements[q]; }
    if (col) for (let q = 0; q < 3; q++) col[j * 3 + q] = m.instanceColor.array[i * 3 + q]; });
   const name = kit || (m.name || 'instanced') + '~' + k;
   const it = { id: NAME + '/' + name, name, kit: o.itemKit ? o.itemKit(kit) : kit ? NAME : null, label: kit || m.name || null,
    material: C.matOf(m.material, kit && o.itemMat ? o.itemMat(kit) : null), lod: null, count: n, dynamic: false, visible: m.visible !== false,
    geometry: geo(m.geometry), matrices: P(mats), colours: col ? P(col) : null, extras: {} };
   const sid = kit && o.itemSet ? o.itemSet(kit) : null;
   if (sid && T && T.isSet(sid)) { const S = T.get(sid);
    it.record = sid; it.recordClass = S['class']; it.recordKey = S.key;
    it.records = keep.map(i => T.uidOf(S, i)); it.recordIndex = P(Uint32Array.from(keep)); }
   it.owners = keep.map((i, j) => { const x = mats[j * 16 + 12], y = mats[j * 16 + 13], z = mats[j * 16 + 14];
    const id = o.ownerOf ? o.ownerOf(m, i, x, y, z) : null; return id != null ? id : own(x, y, z); });
   out.items.push(it); k++;
  }
  if (more) more(ctx, C, own, out);
  // buckets: plain meshes, one per material, triangles by centroid
  const groups = new Map(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), nm = new THREE.Matrix3(), nv = new THREE.Vector3();
  for (const m of meshes) {
   if (m.isInstancedMesh || lodCopy(m) || m.isSkinnedMesh) continue;
   const why = o.skipMesh ? o.skipMesh(m) : null; if (why) { C.drop(why); continue; }
   const m0 = Array.isArray(m.material) ? m.material[0] : m.material;
   if (!m0 || m0.isShaderMaterial || m0.isRawShaderMaterial || m0.blending === THREE.AdditiveBlending) continue;
   const g = m.geometry, Pp = g.attributes.position, I = g.index;
   if (!g.boundingBox) g.computeBoundingBox();
   const bb = g.boundingBox.clone().applyMatrix4(m.matrixWorld);
   if (box && (bb.max.x < box[0] || bb.min.x >= box[2] || bb.max.z < box[1] || bb.min.z >= box[3])) continue;
   const W0 = m.matrixWorld; nm.getNormalMatrix(W0);
   const tris = I ? I.count / 3 : Pp.count / 3, vi = t => I ? I.getX(t) : t, kept = [];
   for (let t = 0; t < tris; t++) { a.fromBufferAttribute(Pp, vi(t * 3)).applyMatrix4(W0); b.fromBufferAttribute(Pp, vi(t * 3 + 1)).applyMatrix4(W0); c.fromBufferAttribute(Pp, vi(t * 3 + 2)).applyMatrix4(W0);
    if (inBox((a.x + b.x + c.x) / 3, (a.z + b.z + c.z) / 3)) kept.push(t, (a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3); }
   if (!kept.length) continue;
   const mid = C.matOf(m.material, null);
   const G = groups.get(mid) || (groups.set(mid, { pos: [], nor: [], uv: [], col: [], idx: [], hasUv: false, hasCol: false, meshes: 0, owners: new Map(), names: new Set() }).get(mid));
   G.meshes++; G.names.add((m.name || '').replace(/[0-9]+/g, '#') || m.parent && m.parent.name || '?');
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
  const pre = new RegExp('^' + NAME + ':');
  for (const [mid, G] of groups) {
   const nvx = G.pos.length / 3, ids = Array.from(G.owners.keys()).sort();
   const gg = { position: P(new Float32Array(G.pos)), normal: P(new Float32Array(G.nor)), index: P(nvx < 65535 ? Uint16Array.from(G.idx) : Uint32Array.from(G.idx)) };
   if (G.hasUv) gg.uv = P(new Float32Array(G.uv)); if (G.hasCol) gg.color = P(new Float32Array(G.col));
   out.buckets.push({ id: NAME + '/bucket:' + mid.replace(pre, ''), name: mid.replace(pre, ''), kit: NAME, label: Array.from(G.names).slice(0, 8).join(', '),
    material: mid, lod: null, triangles: G.idx.length / 3, geometry: gg, recordIds: ids, records: ids.map(id => T.get(id).uid),
    pieces: { meshes: G.meshes, rule: 'a triangle by its centroid (x0 <= x < x1, z0 <= z < z1); recordIds the volumes the centroids stand in', byRecord: Object.fromEntries(G.owners) } });
  }
  out.materials = C.mats; out.textures = C.texs; out.dropped = C.dropped;
  return out;
 }
 return { collect, assemble, geo };
};
E.sceneGeo = geo;
})(typeof window !== 'undefined' ? window : globalThis);
