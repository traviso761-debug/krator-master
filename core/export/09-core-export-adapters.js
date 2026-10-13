// ================================================================= CORE — export: the parts of modules that do not register themselves yet
// [G data]: no THREE, no DOM. Load after 07-core-export.js. Each adapter reads a module's own export at export time and
// gives it to the container (core/export/README.md, "Who fills what"). They live here, not in their modules, because
// those modules (core/tags, core/atmos, core/materials/record) are also built into the Voth branch's pages
// (settlements/voth, settlements/streetlab), which this branch does not rebuild: when a module is next touched with that
// branch's agreement, its adapter moves into it as an EXPORT.register call and leaves this file.
//
//   registry   KTAGS.page.export() (core/tags), cropped to a tile: the records an item or bucket names, the records
//              placed in the box, and their parents (`cropped` says how many of how many)
//   atmos      ATMOS.export({stage: false}) (core/atmos): krator-atmos as it is (its own colour convention, sRGB)
//   materials  KMAT.table(build) for every build that declared an adapter (core/materials/record): records keyed
//              kmat:<build>:<name>, maps by library reference
//   terrain    EXPORT.ground({terrainH, waterH?, field?, step?}): a build with no module of its own that fills
//              terrain binds its ground here (the biome core fills it itself)
//   water      WATER.export() (core/water) and what a port needs to rebuild its twins and its shader to the bit: each open
//              surface's waves in turns, its fades (lod, px), damping depth, chop wave number and amplitude bound, the
//              bed's bytes; in a tile, the surfaces whose extent meets the box; probes: WATER's own heights at fixed
//              (x, z, t) in the box (godot/krator/water.gd checks its twin against them). A surface a build draws itself
//              may carry `look` ({colour, shallow, deep (linear hex), roughness, transparent}); one WATER.draw draws gets
//              its material's. The water's GLSL in Godot is the library's (godot/shaders/lib/water.gdshaderinc)
//   ground layers  EXPORT.groundLayers(spec): a build whose ground shader multiplies world-space maps over its painted
//              ground (the biome hosts' detail and crack layers, 45-host-stage.js) describes them once; the record joins
//              `materials` (hook 'world-uv', role 'ground', its terms and its weights sampled over the tile) and its maps
//              `textures` (a library map by reference, else a PNG). Godot draws them through the world-uv include
(function(){
'use strict';
if(typeof EXPORT === 'undefined') throw new Error('09-core-export-adapters: load core/export/07-core-export.js first');
const E = EXPORT;

E.register('registry', ctx => {
 const T = typeof KTAGS !== 'undefined' && KTAGS ? KTAGS.page : null;
 if(!T || typeof T.export !== 'function') return null;
 const e = T.export();
 if(!ctx.box) return e;
 const byId = new Map(e.records.map(r => [r.id, r])), keep = new Set();
 ctx.out.items.forEach(it => { if(it.record != null) keep.add(it.record); });
 ctx.out.buckets.forEach(b => (b.recordIds || []).forEach(id => keep.add(id)));
 e.records.forEach(r => { if(!r.set && !r.removed && r.at && ctx.inBox(r.at[0], r.at[2])) keep.add(r.id); });
 for(let grew = true; grew;){ grew = false;
  for(const id of Array.from(keep)){ const r = byId.get(id); if(r && r.parent != null && !keep.has(r.parent) && byId.has(r.parent)){ keep.add(r.parent); grew = true; } } }
 const out = {}; for(const k in e) out[k] = e[k];
 out.records = e.records.filter(r => keep.has(r.id));
 out.cropped = { from: e.records.length, kept: out.records.length,
  rule: 'the records an item or bucket of the tile names, the records whose at lies in the box (not item sets), and their parents' };
 return out;
}, { by: 'tags' });

E.register('atmos', () => {
 const A = typeof ATMOS !== 'undefined' ? ATMOS : null;   // a top-level const in its page: not a window property
 return A && typeof A.export === 'function' ? A.export({ stage: false }) : null;
}, { by: 'atmos' });

E.register('materials', () => {
 const K = typeof KMAT !== 'undefined' ? KMAT : null;
 if(!K || !K.adapters || typeof K.table !== 'function') return null;
 const out = [];
 Object.keys(K.adapters).forEach(b => K.table(b).records.forEach(r => {
  const o = {}; for(const k in r) o[k] = r[k];
  o.kmatId = r.id; o.id = 'kmat:' + b + ':' + r.name; o.build = b; o.source = 'kmat';
  out.push(o); }));
 return out.length ? out : null;
}, { by: 'kmat' });

// ---- water (core/water): the surfaces as data, cropped to a tile, with the twin's own heights as probes
const extentOf = (S, W) => {   // [x0, z0, x1, z1] a surface can wet, or null (everywhere)
 if(S.kind === 'open' || S.kind === 'still'){ if(S.bounds) return S.bounds;
  if(S.poly){ const xs = S.poly.map(p => p[0]), zs = S.poly.map(p => p[1]); return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)]; }
  return null; }
 if(S.kind === 'shore') return S.of ? extentOf(S.of, W) : null;
 if(S.kind === 'flow'){ const r = Math.max(...S.pts.map(p => p.w)) / 2;
  return [Math.min(...S.pts.map(p => p.x)) - r, Math.min(...S.pts.map(p => p.z)) - r, Math.max(...S.pts.map(p => p.x)) + r, Math.max(...S.pts.map(p => p.z)) + r]; }
 if(S.kind === 'fall'){ const L = S.lip, xs = L.map(p => p[0]), zs = L.map(p => p[1]), d = S.speed * S.tFall;
  return [Math.min(...xs) - d, Math.min(...zs) - d, Math.max(...xs) + d, Math.max(...zs) + d]; }
 return null;
};
const PROBE_T = [0, 3.7, 421.3];   // seconds on the module clock: the start, a few seconds in, and most of a wave period
E.register('water', ctx => {
 const W = typeof WATER !== 'undefined' ? WATER : null;   // a top-level const in its page
 if(!W || typeof W.export !== 'function' || !W.surfaces || !W.surfaces.length) return null;
 const A = typeof ATMOS !== 'undefined' && ATMOS && ATMOS.PRESETS && ATMOS.PRESETS.waves ? ATMOS : null;
 const X = W.export(), box = ctx.box, out = [], probes = [];
 const meets = e => !box || !e || !(e[2] < box[0] || e[3] < box[1] || e[0] >= box[2] || e[1] >= box[3]);
 const plain = o => o == null ? null : JSON.parse(JSON.stringify(o));
 X.surfaces.forEach((o, i) => {
  const S = W.surfaces[i], e = extentOf(S, W);
  if(!meets(e)) return;
  const r = { id: 'water:' + S.id }; for(const k in o) r[k] = o[k];
  r.extent = e;
  if(S.kind === 'shore') r.of = 'water:' + S.of.id;
  if(S.kind === 'open'){
   r.waves = S.waves.map(q => ({ A: q.A, lambda: q.lam, k: q.k, dir: [q.dx, q.dz], H: q.H, phase: q.ph, cycles: q.n, turns: [q.tx, q.tz, q.tc] }));
   r.base = S.base; r.field = A ? S.field : 0; r.fieldShare = S.field; r.kChop = S.kChop; r.lod = S.lod.slice(); r.px = S.px.slice();
   r.damp = S.dampDepth; r.amp = S.amp;
   r.bed = S.bed ? { x0: S.bed.x0, z0: S.bed.z0, cell: S.bed.cell, nx: S.bed.nx, nz: S.bed.nz, level: S.bed.level, bytes: E.pack(S.bed.data) } : null;
   const D = (W.drawn || []).find(d => d.S === S), M = D && D.material;
   r.look = Object.assign(M ? { colour: '#' + M.color.getHexString(), roughness: M.roughness, metal: M.metalness, envMapIntensity: M.envMapIntensity,
    transparent: !!M.transparent, drawn: 'WATER.draw' } : {}, plain(S.look) || {});
   if(!M && !S.look) r.look = null;
   // the twin's own heights: 6 x 6 points over the part of the surface in the box, at three times
   const b = [Math.max(e ? e[0] : -Infinity, box ? box[0] : -Infinity), Math.max(e ? e[1] : -Infinity, box ? box[1] : -Infinity),
    Math.min(e ? e[2] : Infinity, box ? box[2] : Infinity), Math.min(e ? e[3] : Infinity, box ? box[3] : Infinity)];
   if(b.every(isFinite)) for(const t of PROBE_T) for(let j = 0; j < 6; j++) for(let k = 0; k < 6; k++){
    const x = b[0] + (b[2] - b[0]) * (k + 0.37) / 6, z = b[1] + (b[3] - b[1]) * (j + 0.61) / 6;
    probes.push([x, z, t, S.heightAt(x, z, t), r.id]); }
  }
  out.push(r);
 });
 if(!out.length) return null;
 return { format: 'krator-water', version: 1, period: X.period, presets: X.presets, field: A ? 'atmos' : 'none',
  clock: 'the shaders read the module clock wrapped at period (atmWaveT; Godot: the global atm_wave_t); the twins take seconds and wrap them',
  note: 'open: rest point p0 moves to p0 + m * sum H D cos(th), y = level + m * (sum A sin(th) + field * waveHeight(p)), th = 2 pi (fract(p0.x tx) + fract(p0.z tz) - fract(t tc)) + phase; m = smoothstep(0, damp, depth) from the bed (1 without one); heightAt inverts it by Newton (core/water/README.md)',
  surfaces: out, probes };
}, { by: 'water' });

// ---- a ground's world-space layers (the biome hosts' detail and crack maps, multiplied over the painted ground)
// spec: {id, build (its KMAT pack), colour?, terms: [{maps: [{family, texture, scale, offset}], gain, amount, weight}],
//        weights: {name: (x, z) => 0..1}, step (m), box (the ground's extent, for an export without a tile), png(texture)}
// A term multiplies the ground's colour by mix(1, gain * the product of its maps, amount * weight); a map samples at
// world (x, z) * scale + offset, its stored bytes as they are (the page reads them in its own uniform: no sRGB decode).
let unlayers = [];
E.groundLayers = function(spec){
 unlayers.forEach(f => f()); unlayers = [];
 if(!spec) return null;
 const K = () => typeof KMAT !== 'undefined' && KMAT && KMAT.mode === 'lib' && KMAT.packed ? KMAT : null;
 const texOf = q => { const L = K() ? K().packed(spec.build, q.family) : null, t = q.texture || null;
  const base = { id: 'tex:' + spec.id + ':' + q.family, name: q.family, wrap: ['repeat', 'repeat'], repeat: [1, 1], offset: [0, 0], flipY: t ? !!t.flipY : true };
  if(L && L.map){ base.from = 'library'; base.lib = L.lib || null; base.pack = spec.build; base.family = q.family; base.slot = 'map'; base.flipY = true; return base; }
  const p = t && spec.png ? spec.png(t) : null;
  if(p && p.png){ base.from = 'png'; base.png = p.png; base.size = p.size; } else { base.from = 'none'; base.error = 'no library map and no PNG encoder'; }
  return base; };
 const texs = c => c.memo('ground-layers-tex', () => { const m = new Map();
  spec.terms.forEach(t => t.maps.forEach(q => { if(!m.has(q.family)) m.set(q.family, texOf(q)); })); return m; });
 unlayers.push(E.register('textures', c => Array.from(texs(c).values()), { by: 'ground-layers' }));
 unlayers.push(E.register('materials', c => {
  const T = texs(c), names = Object.keys(spec.weights || {}), step = spec.step || 2, b = c.box || spec.box;
  let weights = null;
  if(names.length && b){
   const st = c.box ? step : Math.max(step, (b[2] - b[0]) / 511, (b[3] - b[1]) / 511);
   const nx = Math.floor((b[2] - b[0]) / st + 1e-9) + 1, nz = Math.floor((b[3] - b[1]) / st + 1e-9) + 1, v = new Float32Array(nx * nz * names.length);
   for(let j = 0; j < nz; j++) for(let i = 0; i < nx; i++) names.forEach((n, k) => { v[(j * nx + i) * names.length + k] = spec.weights[n](b[0] + i * st, b[1] + j * st); });
   weights = { x0: b[0], z0: b[1], step: st, nx, nz, names, values: E.pack(v), sample: 'bilinear between grid points; row j is z0 + j*step, column i x0 + i*step, the names interleaved' };
  }
  const num = (v, d) => v == null ? d : v, pair = v => Array.isArray(v) ? v.slice() : [num(v, 0), num(v, 0)];
  return [{ id: spec.id, family: 'ground', kind: 'ground', role: 'ground', source: 'ground-layers', hook: 'world-uv', colour: spec.colour || null, tint: true,
   layers: { space: 'world xz', op: 'multiply',
    terms: spec.terms.map(t => ({ maps: t.maps.map(q => ({ map: T.get(q.family).id, scale: pair(num(q.scale, 1)), offset: pair(q.offset) })),
     gain: num(t.gain, 1), amount: num(t.amount, 1), weight: t.weight || null })),
    note: 'colour *= mix(1, gain * product(map(xz * scale + offset).rgb), amount * weight) per term, in order; the maps\' bytes as stored (not decoded)' },
   weights }];
 }, { by: 'ground-layers' }));
 return spec;
};

let ground = null, unground = null;
E.ground = function(b){
 ground = b || null;
 if(unground){ unground(); unground = null; }
 if(ground) unground = E.register('terrain', ctx => E.terrain(ctx.box, { h: ground.terrainH, water: ground.waterH, field: ground.field,
  step: ctx.opt.ground == null ? ground.step : ctx.opt.ground, probes: ground.probes }), { by: 'ground' });
 return ground;
};
})();
