/* ======================== Adapter: kits/catalog ========================
   The ONLY file in kits/interiors that knows the master catalog. It maps the catalog's
   registry and engine (kits/catalog/krator-asset-engine.js + krator-master-furniture.js,
   loaded first) onto the four calls the placer needs (45-placer.js header):

     list()                    FURNS -> descriptors { key, name, culture, type, setting, rooms, anchor, clearance, variants }
     dims(key, v)              entryDims(A, v)
     anchorY(key, v, at)       furnAnchorY(A, v, at)
     build(placement, room)    buildFurn(key, x, z, ry, { variant, seed, y, wealth }) -> THREE.Group in the engine's scene

   A Yuni-lineage build writes the same four over its own FURN_BY_KEY / buildFurn (its pieces
   are in the same frame); an Ancients-lineage build over its kit's furniture registry. See
   API.md "Writing an adapter".

   Catalog quirks handled here rather than in the catalog (kits/catalog/KNOWN_ISSUES.md):
     voth_lantern_fixture   variant 1 is a wall bracket under a floor anchor: offered as 1 variant
   ====================================================================== */
(function (IX) {
  'use strict';
  const VARIANT_LIMIT = { voth_lantern_fixture: 1 };
  IX.catalogAdapter = function (opt) {
    opt = opt || {};
    let cache = null;
    return {
      name: 'kits/catalog',
      list: function () {
        if (cache) return cache;
        cache = FURNS.map(function (A) {
          return { key: A.key, name: A.name, culture: A.culture, type: A.type, setting: A.setting, rooms: A.rooms.slice(),
            anchor: A.anchor || 'floor', clearance: A.clearance || {},
            variants: Math.min(A.variants || 1, VARIANT_LIMIT[A.key] || 99) };
        });
        return cache;
      },
      dims: function (key, v) { return entryDims(FURN_BY_KEY[key], v); },
      anchorY: function (key, v, at) { return furnAnchorY(FURN_BY_KEY[key], v, at); },
      build: function (p, room) {
        const g = buildFurn(p.key, p.x, p.z, p.ry, { variant: p.variant, seed: p.seed, y: p.y, wealth: room ? room.wealth : 0.5 });
        if (g) g.userData.interior = { room: room ? room.id : null, placement: p.id, need: p.need, role: p.role };
        return g;
      },
      measure: function (g) { return measureInstance(g); }
    };
  };
})(KratorInteriors);
