// ================================================================= CORE FURNISH — the placement pass ([G data])
// One furniture glue in place of the six copies the builds carried (GODOT-PLAN.md Phase 2 item 4; README.md here).
// A build's FURNISH(...) keeps its name and its own frame rule; it hands the world transform to R.place(), which
// writes the placement RECORD, counts missing keys, applies the catalog's recentring table, assigns a deterministic
// id, and hands the record to the build's draw adapter. No THREE, no DOM: the records are what crosses to Godot.
//
//   const R = KFURN.create(cfg)
//   R.place(key, x, y, z, ry, o, loc, ctx)   -> the record, or null (a key the catalog lacks: counted in R.missing)
//        x y z ry  the world transform (three.js rotation.y: the piece's front, +z, turns to (sin ry, cos ry))
//        o         the builder's options: { v, seed, setting, ... } (the adapter's own keys pass through)
//        loc       [lx, ly, lz, lry] in the builder's frame, or null (a piece placed in world space)
//        ctx       { building, list, wealth, part, room, dry }: list receives the record (the building's own list;
//                  listOf() instead makes it only when a record lands, for a build whose owners start without one);
//                  dry places nothing anywhere else (a throwaway build: Post-Apoc's frontOf)
//   R.frm(f, lx, lz, lry)                    -> [x, z, ry] in a FRM frame {x, z, fx, fz} (55-arch): +z its front,
//                                               +x its right (-fz, fx); lry 0 faces the front
//   R.interior(item, x, z, ry, adapter, opt) -> the interiors kit's rooms planned and furnished at a placement,
//                                               summarised as data ({ item, rooms, pieces, residence }); pushed on R.buildings
//   R.summary()                              -> counts for a probe: placed, byKey, missing, interiors, interiorPieces
//   KFURN.SRGB_LIN                           -> Float32Array(256): an sRGB byte to linear (the catalog's colours are sRGB)
//
// cfg: {
//   catalog:   { has(key), entry(key), dims(entry, variant) }   (KFURN.catalogOf(KratorFurniture) makes it)
//   interiors: KratorInteriors (for R.interior), optional
//   on, interiorsOn: the page's switches (?furniture=0, ?interiors=: 53-core-furnish-host.js reads them)
//   seed(o, ctx, R, x, y, z, loc) -> the seed when o.seed is not given. Each build keeps the rule its pieces were
//              placed with, so moving onto this module moves nothing (README.md, "Seeds")
//   shift:     { key: [dx, dz] | function(variant) -> [dx, dz] | null }: pieces the catalog recentred on their
//              footprint; the placement undoes it (Mav's Refuge's BRF_SHIFT)
//   finish(rec): rounds or wraps the record's numbers the way the build always has (Girder: 3 decimals)
//   onRecord(rec, ctx, o, entry, dims) -> false to place nothing more (deferred to the interiors); collision,
//              inspector entries and the like go here
//   draw(rec, ctx, o, entry): the draw adapter (52-core-furnish-draw.js helps), called while R.on and not dry
//   idPrefix:  'furn' (ids: furn_00001 in placement order)
//   tags:      a core/tags registry (KTAGS.create): every placed record onRecord keeps is registered there too, as
//              class furniture, before it is drawn (GODOT-PLAN.md rule 4; core/tags/README.md). The furniture record is not changed }
//
// A record: { id, key, variant, seed, lx, ly, lz, lry, x, y, z, ry, building, part?, room, setting, job }.
// job is the catalog's (FURN_JOBS, through the entry's job or its trade role); room is ctx.room or o.room or null.
var KFURN = (function(){
'use strict';
 const K = {};
 K.SRGB_LIN = (function(){ const t = new Float32Array(256);
   for(let i=0;i<256;i++){ const v = i/255; t[i] = v <= 0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); } return t; })();
 K.catalogOf = function(KF){ return {
   has: function(key){ return KF.has(key); },
   entry: function(key){ return KF.FURN_BY_KEY[key]; },
   dims: function(A, v){ return KF.entryDims(A, v); } }; };
 function pad(n){ const s = String(n); return s.length >= 5 ? s : '00000'.slice(s.length) + s; }
 // a placed record into core/tags: its id unchanged, the catalog entry's type as kind, its culture, tier and job, the
 // setting and room, and the placement's 0..1 wealth (core/tags maps it to poor, middle, rich). parent is the building
 // as the build names it (a key or an id): a build that registers its buildings in core/tags passes their ids.
 K.tag = function(T, rec, A, dm, ctx){
   const t = { setting: rec.setting };
   if(A && A.culture) t.culture = A.culture;
   if(A && A.tier) t.tier = A.tier;
   if(rec.job) t.job = rec.job;
   if(rec.room) t.room = String(rec.room);
   if(typeof ctx.wealth === 'number') t.wealth = ctx.wealth;
   if(rec.variant) t.variant = rec.variant;
   return T.add({ id: rec.id, 'class': 'furniture', kind: (A && A.type) || null, key: rec.key, name: (A && A.name) || null,
     parent: rec.building == null ? null : String(rec.building), at: [rec.x, rec.y, rec.z], ry: rec.ry,
     size: dm ? [dm.w, dm.d, dm.h] : undefined, tags: t, frag: 'core/furnish' });
 };
 K.create = function(cfg){
   const C = cfg.catalog, R = { on: cfg.on !== false, interiors: !!cfg.interiorsOn, placed: [], missing: {}, buildings: [],
     lights: 0, group: null, batch: null, adapter: null, cfg: cfg };
   const prefix = cfg.idPrefix || 'furn';
   R.place = function(key, x, y, z, ry, o, loc, ctx){
     o = o || {}; ctx = ctx || {};
     if(!C.has(key)){ if(!ctx.dry) R.missing[key] = (R.missing[key]||0) + 1; return null; }
     const v = o.v|0;
     if(cfg.shift && cfg.shift[key]){
       let sh = cfg.shift[key]; if(typeof sh === 'function') sh = sh(v);
       if(sh){ const c = Math.cos(ry), s = Math.sin(ry); x -= sh[0]*c + sh[1]*s; z -= -sh[0]*s + sh[1]*c; }
     }
     const A = C.entry(key);
     const rec = { key: key, variant: v, seed: o.seed || cfg.seed(o, ctx, R, x, y, z, loc),
       lx: loc ? loc[0] : null, ly: loc ? loc[1] : null, lz: loc ? loc[2] : null, lry: loc ? loc[3] : null,
       x: x, y: y, z: z, ry: ry, building: ctx.building == null ? null : ctx.building };
     if(ctx.part != null) rec.part = ctx.part;
     rec.setting = o.setting || 'outdoor';
     if(cfg.finish) cfg.finish(rec);
     const L = ctx.list || (ctx.listOf && ctx.listOf()); if(L) L.push(rec);
     if(!ctx.dry){ R.placed.push(rec); rec.id = prefix + '_' + pad(R.placed.length); }
     rec.room = ctx.room || o.room || null;
     rec.job = (A && A.job) || null;
     const dm = A ? C.dims(A, v) : null;
     if(cfg.onRecord && cfg.onRecord(rec, ctx, o, A, dm) === false) return rec;   // deferred: not registered, not drawn
     if(cfg.tags && rec.id) K.tag(cfg.tags, rec, A, dm, ctx);
     if(ctx.dry || !R.on || !cfg.draw) return rec;
     cfg.draw(rec, ctx, o, A);
     return rec;
   };
   R.frm = function(f, lx, lz, lry){
     return [f.x - f.fz*lx + f.fx*lz, f.z + f.fx*lx + f.fz*lz, Math.atan2(f.fx, f.fz) + (lry||0)];
   };
   R.interior = function(item, x, z, ry, adapter, opt){
     const r = cfg.interiors.sets.furnish(item, x, z, ry||0, adapter, opt);
     const sum = { item: item.key, rooms: r.inst.rooms.length,
       pieces: Object.keys(r.plans).reduce(function(a, k){ return a + r.plans[k].placements.length; }, 0), residence: r.residence };
     R.buildings.push({ key: item.key, x: x, z: z, ry: ry||0, baseY: (opt && opt.baseY) || 0, interior: sum });
     return { summary: sum, result: r };
   };
   R.summary = function(){
     const byKey = {}; R.placed.forEach(function(r){ byKey[r.key] = (byKey[r.key]||0) + 1; });
     return { on: R.on, placed: R.placed.length, keys: Object.keys(byKey).length, byKey: byKey, missing: R.missing,
       lights: R.lights, interiors: R.buildings.length,
       interiorPieces: R.buildings.reduce(function(a, b){ return a + b.interior.pieces; }, 0) };
   };
   return R;
 };
 if(typeof module !== 'undefined' && module.exports) module.exports = K;
 return K;
})();
