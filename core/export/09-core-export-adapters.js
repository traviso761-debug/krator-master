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


let ground = null, unground = null;
E.ground = function(b){
 ground = b || null;
 if(unground){ unground(); unground = null; }
 if(ground) unground = E.register('terrain', ctx => E.terrain(ctx.box, { h: ground.terrainH, water: ground.waterH, field: ground.field,
  step: ctx.opt.ground == null ? ground.step : ctx.opt.ground, probes: ground.probes }), { by: 'ground' });
 return ground;
};
})();
