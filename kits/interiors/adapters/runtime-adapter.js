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
  /* a host's surface, measured on what is drawn (a table's declared height is its tallest part, its top may be lower: the
     map table's 0.95 m over its 0.82 m top floated what stood on it): rays down on a 5 x 5 grid over the middle 80% of its
     footprint, the commonest height they meet (2 cm bins). None when under a third of them meet it (a sack, a jar, an open vat,
     a rack of bottles: no top to stand a thing on) or when it is near the floor */
  IX.measureTop = function (g, dm) {
    const rc = new THREE.Raycaster(), ms = [], c = {};let n = 0;
    g.updateMatrixWorld(true);g.traverse(function (m) { if (m.isMesh) ms.push(m); });
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
      rc.set(new THREE.Vector3(i * dm.w * 0.2, dm.h + 1, j * dm.d * 0.2), new THREE.Vector3(0, -1, 0));
      const h = rc.intersectObjects(ms, false)[0];if (!h) continue;const b = Math.round(h.point.y * 50) / 50;c[b] = (c[b] || 0) + 1;n++; }
    let mode = null, mc = 0;for (const k in c) if (c[k] > mc || (c[k] === mc && +k > mode)) { mc = c[k];mode = +k; }
    return mode === null || mc < 25 / 3 || mode < 0.15 ? null : Math.min(dm.h, mode);
  };
  IX.runtimeAdapter = function (KF, batch) {
    let cache = null;const tops = {};
    return {
      name: 'kits/catalog runtime',
      batch: batch,
      list: function () {
        if (cache) return cache;
        cache = KF.FURNS.map(function (A) {
          return { key: A.key, name: A.name, culture: A.culture, type: A.type, setting: A.setting, rooms: A.rooms.slice(),
            anchor: A.anchor || 'floor', clearance: A.clearance || {}, tier: A.tier, wealth: A.wealth ? A.wealth.slice() : undefined,
            role: IX.guessRole(A), variants: A.variants || 1, surface: A.surface !== false, stretch: !!A.stretch };
        });
        return cache;
      },
      dims: function (key, v) { return KF.entryDims(KF.FURN_BY_KEY[key], v); },
      /* a host's surface height (IX.measureTop: built alone in a batch of its own, measured, thrown away), or null */
      top: function (key, v) {
        const k = key + '|' + (v | 0);if (k in tops) return tops[k];
        const dm = KF.entryDims(KF.FURN_BY_KEY[key], v), B = KF.batch(), g = new THREE.Group();B.place(key, 0, 0, 0, 0, { variant: v | 0 });B.flush(g);
        const t = IX.measureTop(g, dm);g.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });return tops[k] = t;
      },
      anchorY: function (key, v, at) { return KF.furnAnchorY(KF.FURN_BY_KEY[key], v, at); },
      lights: function (key, v, o) {
        o = o || {};
        return KF.lightsOf(key, v, o.seed || 1, o.wealth == null ? 0.5 : o.wealth).map(function (l) {
          return { lx: IX.round(l.x), ly: IX.round(l.y), lz: IX.round(l.z), color: l.color, intensity: l.intensity, distance: l.distance };
        });
      },
      build: function (p, room) {
        return batch.place(p.key, p.x, p.y, p.z, p.ry, { variant: p.variant, seed: p.seed, wealth: room ? room.wealth : 0.5, span: p.span || 0,
          building: room ? room.building : null, room: room ? room.id : null, setting: 'indoor' });
      }
    };
  };
})(KratorInteriors);
