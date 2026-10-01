/* ======================== Adapter: the catalog's furniture RUNTIME (any build) ========================
   For a build that carries the catalog's furniture as the KratorFurniture closure
   (kits/catalog/furniture_bundle.py, krator-furniture-runtime.js) instead of loading the catalog
   page engine: a kit page, a settlement. The same four calls as adapters/catalog-adapter.js, over
   KF = KratorFurniture, building every placement into a BATCH (merged per render family) instead
   of one THREE.Group per piece:

     const KF = KratorFurniture, B = KF.batch();
     const catalog = IX.runtimeAdapter(KF, B);
     const plan = furnishRoom(R, catalog);  IX.buildRoom(plan, catalog, R);   // plan.objects: the batch records
     B.flush(scene);                                                           // once, after every room

   Lights stay data (plan.lights, and each record's lights): the batch never adds a PointLight.
   ====================================================================== */
(function (IX) {
  'use strict';
  IX.runtimeAdapter = function (KF, batch) {
    let cache = null;
    return {
      name: 'kits/catalog runtime',
      batch: batch,
      list: function () {
        if (cache) return cache;
        cache = KF.FURNS.map(function (A) {
          return { key: A.key, name: A.name, culture: A.culture, type: A.type, setting: A.setting, rooms: A.rooms.slice(),
            anchor: A.anchor || 'floor', clearance: A.clearance || {}, tier: A.tier, wealth: A.wealth ? A.wealth.slice() : undefined,
            role: IX.guessRole(A), variants: A.variants || 1 };
        });
        return cache;
      },
      dims: function (key, v) { return KF.entryDims(KF.FURN_BY_KEY[key], v); },
      anchorY: function (key, v, at) { return KF.furnAnchorY(KF.FURN_BY_KEY[key], v, at); },
      lights: function (key, v, o) {
        o = o || {};
        return KF.lightsOf(key, v, o.seed || 1, o.wealth == null ? 0.5 : o.wealth).map(function (l) {
          return { lx: IX.round(l.x), ly: IX.round(l.y), lz: IX.round(l.z), color: l.color, intensity: l.intensity, distance: l.distance };
        });
      },
      build: function (p, room) {
        return batch.place(p.key, p.x, p.y, p.z, p.ry, { variant: p.variant, seed: p.seed, wealth: room ? room.wealth : 0.5,
          building: room ? room.building : null, room: room ? room.id : null, setting: 'indoor' });
      }
    };
  };
})(KratorInteriors);
