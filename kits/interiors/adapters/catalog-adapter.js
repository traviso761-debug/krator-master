/* ======================== Adapter: kits/catalog ========================
   The ONLY file in kits/interiors that knows the master catalog. It maps the catalog's
   registry and engine (kits/catalog/krator-asset-engine.js + krator-master-furniture.js,
   loaded first) onto the four calls the placer needs (45-placer.js header):

     list()                    FURNS -> descriptors { key, name, culture, type, setting, rooms, anchor, clearance, variants,
                               tier, wealth: [lo, hi], role }   (tier and wealth: the catalog's wealth bands, 45-placer.js;
                               role: the catalog's, else guessed from the key: IX.guessRole)
     dims(key, v)              entryDims(A, v)
     anchorY(key, v, at)       furnAnchorY(A, v, at)
     build(placement, room)    buildFurn(key, x, z, ry, { variant, seed, y, wealth }) -> THREE.Group in the engine's scene
     lights(key, v, { seed, wealth })   the PointLights the piece's build adds (F.lamp), in its own
                               frame: found by building it once at the origin (cached per key,
                               variant, seed and wealth), so the plan carries them as DATA

   LIGHT BUDGET. three.js r128 compiles every light into every lit material, so a room of lamps
   (or a city of rooms) must not add one real light per lamp. By default build() STRIPS every
   PointLight a piece adds (the plan's `lights` keep where they were) and the host lights rooms
   its own way (the demo: a small fixed pool, 70-demo.js). IX.catalogAdapter({ lights: 'keep' })
   keeps the catalog's real lights.

   A Yuni-lineage build writes the same four over its own FURN_BY_KEY / buildFurn (its pieces
   are in the same frame); an Ancients-lineage build over its kit's furniture registry. See
   API.md "Writing an adapter".

   Catalog quirks handled here rather than in the catalog (kits/catalog/KNOWN_ISSUES.md), each
   applied only while the catalog still has the quirk, so a catalog fix needs no change here:
     voth_lantern_fixture   while it is floor-anchored with more than one variant, variant 1 (a
                            wall bracket) is not offered; once the catalog moves the bracket to a
                            wall-anchored key of its own, that key is offered like any other piece
   ====================================================================== */
(function (IX) {
  'use strict';
  const QUIRKS = [
    { key: 'voth_lantern_fixture', when: function (A) { return (A.anchor || 'floor') === 'floor' && (A.variants || 1) > 1; }, variants: 1 }
  ];
  function variantsOf(A) {
    let n = A.variants || 1;
    for (const q of QUIRKS) if (q.key === A.key && q.when(A)) n = Math.min(n, q.variants);
    return n;
  }
  /* a piece's role (its own, else guessed: IX.guessRole, 30-programs.js) is what the FOOD and ITEM slots read */
  const roleOf = IX.guessRole;
  IX.catalogRoleOf = roleOf;
  function stripLights(g) {
    const out = [];
    g.traverse(function (o) { if (o.isPointLight) out.push(o); });
    out.forEach(function (l) { if (l.parent) l.parent.remove(l); });
    return out;
  }
  IX.catalogAdapter = function (opt) {
    opt = opt || {};
    const keep = opt.lights === 'keep';
    let cache = null;
    const lightCache = {}, hasLights = {}, tops = {};
    function probe(key, v, seed, wealth) {      /* build once at the origin, read its lights, throw it away */
      const g = buildFurn(key, 0, 0, 0, { variant: v, seed: seed, y: 0, wealth: wealth });
      if (!g) return [];
      const L = stripLights(g).map(function (l) {
        return { lx: IX.round(l.position.x), ly: IX.round(l.position.y), lz: IX.round(l.position.z),
          color: l.color.getHex(), intensity: l.intensity, distance: l.distance };
      });
      scene.remove(g);
      const i = INSTANCES.indexOf(g); if (i >= 0) INSTANCES.splice(i, 1);
      g.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
      return L;
    }
    return {
      name: 'kits/catalog',
      list: function () {
        if (cache) return cache;
        cache = FURNS.map(function (A) {
          return { key: A.key, name: A.name, culture: A.culture, type: A.type, setting: A.setting, rooms: A.rooms.slice(),
            anchor: A.anchor || 'floor', clearance: A.clearance || {},
            tier: A.tier, wealth: A.wealth ? A.wealth.slice() : undefined, role: roleOf(A),
            variants: variantsOf(A), surface: A.surface !== false, stretch: !!A.stretch };
        });
        return cache;
      },
      dims: function (key, v) { return entryDims(FURN_BY_KEY[key], v); },
      /* a host's surface height (IX.measureTop, runtime-adapter.js; built once at the origin, thrown away), or null */
      top: function (key, v) {
        const k = key + '|' + (v | 0);if (k in tops) return tops[k];
        if (!IX.measureTop) return tops[k] = entryDims(FURN_BY_KEY[key], v).h;
        const g = buildFurn(key, 0, 0, 0, { variant: v | 0, seed: 1, y: 0, wealth: 0.5 });if (!g) return tops[k] = null;
        stripLights(g);const t = IX.measureTop(g, entryDims(FURN_BY_KEY[key], v));
        scene.remove(g);const i = INSTANCES.indexOf(g); if (i >= 0) INSTANCES.splice(i, 1);g.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
        return tops[k] = t;
      },
      anchorY: function (key, v, at) { return furnAnchorY(FURN_BY_KEY[key], v, at); },
      lights: function (key, v, o) {
        o = o || {};
        const w = o.wealth == null ? 0.5 : o.wealth;
        const hk = key + '|' + v;
        if (!(hk in hasLights)) hasLights[hk] = probe(key, v, 1, w).length > 0;
        if (!hasLights[hk]) return [];
        const ck = hk + '|' + (o.seed || 1) + '|' + w;
        if (!lightCache[ck]) lightCache[ck] = probe(key, v, o.seed || 1, w);
        return lightCache[ck];
      },
      build: function (p, room) {
        const g = buildFurn(p.key, p.x, p.z, p.ry, { variant: p.variant, seed: p.seed, y: p.y, wealth: room ? room.wealth : 0.5, span: p.span || 0 });
        if (g) {
          g.userData.interior = { room: room ? room.id : null, placement: p.id, need: p.need, role: p.role };
          if (!keep) g.userData.interior.strippedLights = stripLights(g).length;
        }
        return g;
      },
      keepsLights: keep,
      measure: function (g) { return measureInstance(g); }
    };
  };
})(KratorInteriors);
