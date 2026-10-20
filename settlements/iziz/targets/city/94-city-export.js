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
//              pieces carry no mesh of their own (they are drawn in items and buckets). On a page with interiors
//              (95i: a kit's sheet, --kit) also the furnished rooms' pieces: each catalog piece once per look (its key,
//              variant and a look: the placements whose piece, built at its heading and turned back into its own frame, gives
//              the same geometry and colours share one), its
//              mesh the items named `items` (one per render family, unit geometry in the piece's frame, an instance
//              per placement), and a placement per ixf record (its room and building); those pieces are then not in
//              the buckets
//   interiors  the room graph of every furnished building in the box (95i's plans, IZIX.jobs), building-local: the
//              krator-interiors contract Yuni fills (storeys and rooms, door / stair / ladder links with the walk
//              graph's two ends, walls with col, the yard). Iziz's city has none (its buildings are shells): there the
//              contributor answers null, so the section reads 'empty'
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
 // Iziz's pack first, then any other the page binds (a kit built on Iziz's page, --kit: its own pack, KMAT.pack('<kit>'))
 const fam = key == null ? null : typeof IZIZ_MATX !== 'undefined' && IZIZ_MATX[key] ? IZIZ_MATX[key].fam
  : typeof IZIZ_MATALIAS !== 'undefined' && IZIZ_MATALIAS[key] ? IZIZ_MATALIAS[key] : key;
 const names = ['iziz'].concat(Object.keys(KMAT.packs).filter(n => n !== 'iziz').sort());
 for (const pack of names) { const P = KMAT.packs[pack] || {};
  if (fam != null && P[fam] && P[fam].lib === m.userData.lib) return { fam, L: P[fam], pack };
  for (const f in P) if (P[f].lib === m.userData.lib) return { fam: f, L: P[f], pack }; }
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
  const key = (lib ? 'lib:' + lib.pack + ':' + lib.fam + ':' + slot : 'tex:' + t.uuid) + tag;
  if (texBy.has(key)) return texBy.get(key).id;
  const r = { id: 'tex:iziz:' + (lib ? (lib.pack === 'iziz' ? '' : lib.pack + ':') + lib.fam + ':' + slot : 'png' + texs.length) + tag, wrap: ['repeat', 'repeat'], repeat: rep, offset: off, flipY: t.flipY !== false };
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
  const lib = library(m, key), K = m.userData && m.userData.uvK || 0, shader = m.isShaderMaterial || m.isRawShaderMaterial;
  const tri = m.userData && m.userData.courtTri || null;   // a court finish (95i COURT_TRI): the set projected triplanar, no UVs
  const hook = []; if (K) hook.push('world-uv'); if (lib && lib.L.breakup && !tri) hook.push('breakup'); if (tri) hook.push('triplanar');
  if (typeof MAT !== 'undefined' && MAT.glass && (m === MAT.glass || (src || m).onBeforeCompile === MAT.glass.onBeforeCompile)) hook.push('glass');
  let name = key || (m.name || m.type) + '~' + mats.length;
  if (matBy.has(name)) name += '~' + mats.length;
  const r = { id: 'iziz:' + name, name, family: lib ? lib.fam : key || m.type, source: 'iziz', kind: shader ? 'shader' : m.isMeshBasicMaterial ? 'basic' : 'standard',
   kmat: key && typeof KMAT !== 'undefined' && KMAT.adapters.iziz && KMAT.adapters.iziz[key] ? 'kmat:iziz:' + key : null,
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

// ---- interiors (95i): which furnished buildings and pieces the box takes
const ixOn = () => typeof IZIX !== 'undefined' && IZIX.on && Array.isArray(IZIX.jobs) && IZIX.jobs.length > 0;
const r4 = v => Math.round(v * 1e4) / 1e4;
// the box rule for the pieces (a placement by its origin); a building is in when a piece of it is, or its record's at
function ixSel(ctx){ return ctx.memo('iziz-ix', () => {
 const T = KTAGS.page, placed = IZIX.placed.filter(p => ctx.inBox(p.x, p.z)), want = new Set(placed.map(p => p.building)), byB = new Map();
 for (const j of IZIX.jobs) { const r = j.parent ? T.get(j.parent) : null; if (!r) continue;
  if (want.has(j.parent) || ctx.inBox(r.at[0], r.at[2])) (byB.get(j.parent) || byB.set(j.parent, []).get(j.parent)).push(j); }
 const doors = new Map();   // a building's door fixtures (69f), to name the one an exterior door link is
 for (const r of T.records) if (r['class'] === 'fixture' && r.kind === 'door' && !r.removed && byB.has(r.parent)) (doors.get(r.parent) || doors.set(r.parent, []).get(r.parent)).push(r);
 return { placed, byB, doors }; }); }
// world (x, z) and y into the frame of a building record: its base centre, turned by ry (local = R(-ry) (world - at))
function frameOf(rec){ const at = rec.at || [0, 0, 0], c = Math.cos(rec.ry || 0), s = Math.sin(rec.ry || 0);
 return { p: q => { const dx = q[0] - at[0], dz = q[1] - at[2]; return [r4(dx * c - dz * s), r4(dx * s + dz * c)]; }, y: y => r4(y - at[1]),
  p3: q => { const dx = q[0] - at[0], dz = q[2] - at[2]; return [r4(dx * c - dz * s), r4(q[1] - at[1]), r4(dx * s + dz * c)]; } }; }
const inPoly = (P, x, z) => { let i, j, c = false; for (i = 0, j = P.length - 1; i < P.length; j = i++)
 if ((P[i][1] > z) !== (P[j][1] > z) && x < (P[j][0] - P[i][0]) * (z - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
// a door's two walk ends: d metres either side of its wall (the room's wall nearest the door), `into` the side inside room R
function sides(R, at, d){ const P = R.poly; let best = 1e9, n = [0, 1];
 for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1,
   t = Math.max(0, Math.min(1, ((at[0] - a[0]) * dx + (at[1] - a[1]) * dz) / L2)), e = Math.hypot(at[0] - a[0] - dx * t, at[1] - a[1] - dz * t);
  if (e < best) { best = e; const L = Math.sqrt(L2); n = [-dz / L, dx / L]; } }
 if (!inPoly(P, at[0] + n[0] * d, at[1] + n[1] * d)) n = [-n[0], -n[1]];
 return { into: [at[0] + n[0] * d, at[1] + n[1] * d], out: o => [at[0] - n[0] * o, at[1] - n[1] * o] }; }
// one building's interior in the krator-interiors shape, from its jobs' plans (IX.sets.instantiate: planBuilding shells and
// explicit rooms, in world metres; 95i's rooms carry the windows the builder drew)
function ixBuilding(rec, jobs, fxDoors){
 const F = frameOf(rec), rooms = new Map(), lv = new Map(), links = [], linkBy = new Map(), walls = [];
 for (const j of jobs) { for (const R of j.inst.rooms) rooms.set(R.id, R);
  for (const B of j.inst.buildings) for (const L of B.levels) if (!lv.has(L.k)) lv.set(L.k, { y: L.y, h: L.h }); }
 const doorsOf = new Map(), addDoor = (rid, id) => { if (rooms.has(rid)) (doorsOf.get(rid) || doorsOf.set(rid, []).get(rid)).push(id); };
 const fixture = at => { let best = null, bd = 1.0; for (const f of fxDoors || []) { const e = Math.hypot(f.at[0] - at[0], f.at[2] - at[1]); if (e < bd) { bd = e; best = f.id; } } return best; };
 const door = (id, a, b, at, w, h) => { if (linkBy.has(id)) return; const A = rooms.get(a), Bq = rooms.get(b), y = A ? A.y : 0;
  const S = A ? sides(A, at, .45) : null, ext = !Bq;
  const from = S ? S.into : at, to = S ? (ext ? S.out(.45 + .6) : S.out(.45)) : at;
  const l = { id, kind: 'door', a: A ? a : null, b: ext ? 'outside' : b, door: ext ? 'exterior' : 'interior', fixture: ext ? fixture(at) : null, w: w == null ? null : w, h: h == null ? null : h,
   at: F.p3([at[0], y, at[1]]), from: F.p3([from[0], y, from[1]]), to: F.p3([to[0], ext ? rec.at[1] : (Bq ? Bq.y : y), to[1]]) };
  links.push(l); linkBy.set(id, l); addDoor(a, id); if (!ext) addDoor(b, id); };
 for (const j of jobs) {
  for (const B of j.inst.buildings) {
   for (const d of B.doors) door(d.id, d.rooms[0], d.rooms[1] === 'street' ? null : d.rooms[1], d.at, d.w, null);
   for (const s of B.stairs) { const f = s.foot || s.centre || [0, 0], t = s.top || f, y = v => v.length > 2 ? v : [v[0], null, v[1]];
    const fa = y(f), ta = y(t); fa[1] = fa[1] == null ? s.y0 : fa[1]; ta[1] = ta[1] == null ? s.y1 : ta[1];
    const l = { id: s.id, kind: s.kind === 'ladder' ? 'ladder' : 'stair', a: s.rooms[0] || null, b: s.rooms[1] || null, at: F.p3(fa), from: F.p3(fa), to: F.p3(ta) };
    links.push(l); linkBy.set(l.id, l); }
   B.walls.forEach((w, i) => walls.push({ id: B.id + '.wall.' + i, kind: w.kind, a: F.p(w.a), b: F.p(w.b), y: F.y(w.y), h: w.h, thick: w.thick, col: true,
    openings: (w.openings || []).map(o => ({ u: o.u, w: o.w, y0: o.y0, y1: o.y1, door: o.door || null, window: typeof o.window === 'string' ? o.window : o.window ? true : null })) }));
  }
  for (const R of j.inst.rooms) if (R.explicit) (R.doors || []).forEach((d, i) => {
   const to = d.to && d.to !== 'street' && rooms.has(d.to) ? d.to : null;
   door(d.id || (to && rooms.get(to).explicit ? [R.id, to].sort().join('~') : R.id + '.door.' + i), R.id, to, d.at, d.w, d.h); });
 }
 const byK = new Map(); for (const R of rooms.values()) { const k = R.level | 0; (byK.get(k) || byK.set(k, []).get(k)).push(R); }
 const storeys = Array.from(byK.keys()).sort((a, b) => a - b).map(k => { const L = lv.get(k) || { y: byK.get(k)[0].y, h: byK.get(k)[0].h };
  return { k, y: F.y(L.y), h: L.h, rooms: byK.get(k).map(R => ({ id: R.id, kind: R.kind, poly: R.poly.map(F.p), y: F.y(R.y), h: R.h, floor: null, doors: doorsOf.get(R.id) || [] })) }; });
 const J = jobs[0].J, c = Math.cos(J.ry || 0), s = Math.sin(J.ry || 0), hw = J.w / 2, hd = J.d / 2;
 const yard = { y: 0, poly: [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(q => F.p([J.x + q[0] * c + q[1] * s, J.z - q[0] * s + q[1] * c])) };
 return { id: rec.id, units: jobs.map(j => j.id), storeys, links, walls, yard };
}
// the furnished rooms' pieces, once per look: each placement in the box is built again alone at the origin (the batch's
// own build, its variant, seed, wealth and span), and placements whose build gives the same meshes share a look; a look's
// meshes (one per render family, the painted panels baked into theirs) become items with an instance per placement. The
// scene's merged material of a family (95i's flush) is the one the item names, so the materials are the buckets' were.
function ixFurniture(ctx, C, own){
 const KF = KratorFurniture, sel = ixSel(ctx), smat = new Map(), M = new THREE.Matrix4();
 IZIX.group.traverse(m => { if (m.isMesh && m.name !== 'furniture:decal' && !smat.has(m.name)) smat.set(m.name, m.material); });
 const looks = new Map(), pieces = new Map(), placements = [];
 // two builds are one look when their meshes match: the same names, materials and index, every value within 1e-4 (a build
 // turned back from its heading differs from the ry 0 one by float error, so a hash of the values would not match)
 const shape = parts => parts.map(q => q.name + '|' + q.mat.id + '|' + ['position', 'normal', 'color', 'uv'].map(k => q.g.attributes[k] ? q.g.attributes[k].array.length : -1).join(',') + '|' + (q.g.index ? q.g.index.count : -1)).join(';');
 const same = (A, B) => { for (let k = 0; k < A.length; k++) { const a = A[k].g, b = B[k].g;
   if (a.index && b.index) { const x = a.index.array, y = b.index.array; for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false; }
   for (const n of ['position', 'normal', 'color', 'uv']) { if (!a.attributes[n]) continue; const x = a.attributes[n].array, y = b.attributes[n].array;
    for (let i = 0; i < x.length; i++) if (Math.abs(x[i] - y[i]) > 1e-4) return false; } }
  return true; };
 for (const p of sel.placed) {
  // built at its heading (the catalog's frame adds ry to a tilted part's Euler angles, so a turned build is not the ry 0
  // build turned) and turned back into the piece's frame: the item's matrix, turned by ry, gives the page's triangles
  const bt = KF.batch({ indexed: true }); bt.place(p.key, 0, 0, 0, p.ry, { variant: p.variant, seed: p.seed, wealth: p.wealth, span: p.span, setting: 'indoor' });
  const g = bt.flush(null), parts = [], back = new THREE.Matrix4().makeRotationY(-p.ry);
  g.children.forEach(m => { if (!m.isMesh) return; KFURN.linearColours(m.geometry); m.updateMatrix();
   if (!m.matrix.equals(M.identity())) m.geometry.applyMatrix4(m.matrix);
   if (p.ry) m.geometry.applyMatrix4(back);
   parts.push({ name: m.name, g: m.geometry, mat: m.name === 'furniture:decal' ? m.material : smat.get(m.name) || m.material }); });
  if (typeof courtParts === 'function') courtParts(p).forEach(q => parts.push(q));   // its court overlays (95i): the painting, frame, glaze or carpet ride with the piece
  const kv = p.key + '/' + p.variant, h = shape(parts), L = looks.get(kv) || looks.set(kv, []).get(kv);
  let look = L.find(o => o.h === h && same(o.parts, parts));
  if (!look) { look = { h, id: kv + '/' + L.length, parts, n: [] }; L.push(look);
   const E = KF.FURN_BY_KEY[p.key] || {}, dm = E.w ? KF.entryDims(E, p.variant) : null;
   pieces.set(look.id, { id: look.id, entry: { tags: { culture: E.culture || null, tier: E.tier || null, type: E.type || null }, size: dm ? [dm.w, dm.d, dm.h] : null,
    role: E.type || null, anchor: E.anchor || 'floor', key: p.key, variant: p.variant }, lights: KF.lightsOf(p.key, p.variant, p.seed, p.wealth), mesh: null, items: [] }); }
  else parts.forEach(q => q.g.dispose());
  look.n.push(p);
  placements.push({ record: p.id, piece: look.id, at: [p.x, p.y, p.z], ry: p.ry, room: p.room, building: p.building });
 }
 const items = [];
 for (const L of looks.values()) for (const look of L) {
  const n = look.n.length, mats = new Float32Array(n * 16);
  look.n.forEach((p, j) => { M.makeRotationY(p.ry).setPosition(p.x, p.y, p.z); for (let q = 0; q < 16; q++) mats[j * 16 + q] = M.elements[q]; });
  look.parts.forEach((q, k) => { const gg = geo(q.g); if (q.g.attributes.color) gg.color = P(new Float32Array(q.g.attributes.color.array));
   const id = 'iziz/furn:' + look.id + ':' + k;
   items.push({ id, name: look.id + ':' + q.name.replace(/^furniture:/, ''), kit: 'catalog', label: look.id, material: C.matOf(q.mat, null), lod: null, count: n, dynamic: false, visible: true,
    geometry: gg, matrices: P(mats), colours: null, extras: {}, piece: look.id, placements: look.n.map(p => p.id),
    owners: look.n.map(p => own(p.x, p.y, p.z)) });
   pieces.get(look.id).items.push(id); q.g.dispose(); });
 }
 return { items, pieces: Array.from(pieces.values()), placements };
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
  if (o.userData && o.userData.courtOverlay && ixOn()) { C.drop('court overlays (exported with their pieces)'); continue; }
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
 // the furnished rooms' pieces as items (a page with interiors); their merged meshes then stay out of the buckets
 const IXF = ixOn() ? ixFurniture(ctx, C, own) : null;
 if (IXF) out.items.push(...IXF.items);
 out.ixf = IXF;
 // buckets: plain meshes, one per material, triangles by centroid
 const groups = new Map(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), nm = new THREE.Matrix3(), nv = new THREE.Vector3();
 for (const o of meshes) {
  if (o.isInstancedMesh || lodCopy(o) || o.isSkinnedMesh) continue;
  if (o.userData && o.userData.isGround) { C.drop('the ground (terrain and stage)'); continue; }
  if (IXF && o.userData && o.userData.interiors) { C.drop('the interiors\' furniture (exported as pieces)'); continue; }
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
 const X = ixOn() ? B(ctx).ixf : null;
 if (!place.length && !(X && X.placements.length)) return null;
 const sec = { format: 'krator-furniture', version: 1, note: 'Iziz\'s kit slots: the registered furniture (plazas, statues, fountains, drains) as placements of their piece; a piece\'s mesh is not its own here (mesh: null): its geometry is in items and buckets, owned by the same record',
  pieces: Array.from(pieces.values()), placements: place };
 if (X) { sec.note += '. The furnished rooms (95i): a catalog piece per look (<key>/<variant>/<look>: placements whose build gives the same meshes share one), its meshes the items it names (`items`: unit geometry in the piece\'s frame, origin at the footprint centre on the floor, +z the front; an instance per placement, in the order of the item\'s `placements`), a placement per ixf record with its room (interiors) and building';
  sec.pieces = sec.pieces.concat(X.pieces); sec.placements = sec.placements.concat(X.placements); }
 return sec; });
reg('interiors', ctx => { if (!ixOn()) return null; const T = KTAGS.page, S = ixSel(ctx), out = [];
 for (const [bid, jobs] of S.byB) out.push(ixBuilding(T.get(bid), jobs, S.doors.get(bid)));
 if (!out.length) return null;
 return { format: 'krator-interiors', version: 1, frame: 'building-local (parent under the building record: at its base centre, turned by ry)',
  note: 'The furnished buildings of a page with interiors (95i-iziz-interiors.js: the interiors kit\'s set planned in the world frame): storeys with their rooms (polygon, floor y, height, the ids of the door links that open into them), links (every planned door as a room-to-room or room-to-outside link, fixture the 69f door record an exterior door is, within 1 m; every stair and ladder between its two rooms: at the threshold or the foot, from and to the walk graph\'s ends), walls (exterior and partition, col) and the yard (the plot, where the exterior doors open). The furniture placements name their room (the furniture section)',
  buildings: out }; });
window.IZIZ_EXPORT = { collect: ctx => assemble(ctx || { box: null, inBox: () => true }) };
})();
