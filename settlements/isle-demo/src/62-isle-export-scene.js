/* ============================== 5e. THE DRAWN TOWN IN THE EXPORT (P8, 2026-10-20) ============================== */
/* [web] The drawn town's meshes in core/export's container (items, buckets, materials, textures), read by core/export's
   scene reader (10-core-export-scene.js, lifted from Iziz's contributor), so Godot opens the town the way it opens Iziz
   (godot/krator/world_import.gd). Before it reads, the near set is drawn over the whole box (every lot in it in full; the
   massing there then stands empty) and put back after. Each instance of a kit piece is owned by its lot's record (the
   registry's, L.tag: 60 notes them on the near meshes); the footings, compound walls, orchards and streets by the record
   whose footprint holds them. Not exported: the massing (drawn in full instead), the citizens (the sim section has
   them), the ground (the terrain section), the sea and anything hidden (the canoe stop's vessels until docked).
     ISLE.exportScene(ctx)   -> {items, buckets, materials, textures, dropped} for ctx.box
     ISLE.EXPORT_KIT         a proto's bundle prefix -> the item's kit (isk: the Islanders, izv: the Iziz Vernacular,
                             cat: the catalog's Beast Rider buildings) */
ISLE.EXPORT_KIT = { isk: 'islanders', izv: 'iziz-vernacular', cat: 'catalog' };
ISLE.exportScene = function (ctx) {
  var box = ctx.box || [-1e6, -1e6, 1e6, 1e6], cx = (box[0] + box[2]) / 2, cz = (box[1] + box[3]) / 2;
  var keep = { r: DRAW.nearR, n: DRAW.nearMax, at: DRAW.at ? DRAW.at.slice() : null };
  var T = KTAGS.page, vols = [];
  /* the footprints that own what is not a piece: the registry's records with a size, in the box (a 4 m margin) */
  T.records.forEach(function (r) {
    if (!r.at || !r.size || r.removed || r['class'] === 'flora' || r['class'] === 'life') return;
    var h = Math.max(r.size[0], r.size[1]) / 2 + 1;
    if (r.at[0] + h < box[0] - 4 || r.at[0] - h > box[2] + 4 || r.at[2] + h < box[1] - 4 || r.at[2] - h > box[3] + 4) return;
    vols.push({ id: r.id, x: r.at[0], z: r.at[2], c: Math.cos(-(r.ry || 0)), s: Math.sin(-(r.ry || 0)), hw: r.size[0] / 2 + 1, hd: r.size[1] / 2 + 1, a: r.size[0] * r.size[1] });
  });
  var owner = function (x, y, z) { var best = null;
    vols.forEach(function (v) { var dx = x - v.x, dz = z - v.z, u = dx * v.c - dz * v.s, w = dx * v.s + dz * v.c;
      if (Math.abs(u) <= v.hw && Math.abs(w) <= v.hd && (!best || v.a < best.a)) best = v; });
    return best ? best.id : null; };
  var hidden = function (m) { for (var p = m; p; p = p.parent) if (p.visible === false) return true; return false; };
  DRAW.nearR = Math.hypot(box[2] - box[0], box[3] - box[1]) / 2 + 60; DRAW.nearMax = Infinity;
  DRAW.near([cx, cz], true);
  try {
    return EXPORT.sceneReader({ name: 'isle', source: 'isle-demo', scene: scene, tags: T, owner: owner,
      kitOf: function (m) { return m.userData && m.userData.isleProto ? m.userData.isleProto + '/' + m.userData.part : null; },
      itemKit: function (kit) { return kit ? ISLE.EXPORT_KIT[kit.split(':')[0]] || 'isle' : 'isle'; },
      ownerOf: function (m, i) { var L = m.userData && m.userData.lots; return L ? L[i] || null : null; },
      skipInstanced: function (m) { return m === DRAW.massB || m === DRAW.massR ? 'massing (its lots drawn in full)' : m.name === 'citizens' ? 'citizens (the sim section)' : hidden(m) ? 'hidden' : null; },
      skipMesh: function (m) { return m.name === 'ground' ? 'the ground (the terrain section)' : m.name === 'sea' ? 'the sea' : hidden(m) ? 'hidden' : null; }
    }).assemble(ctx);
  } finally { DRAW.nearR = keep.r; DRAW.nearMax = keep.n; DRAW.near(keep.at || [cx, cz], true); }
};
(function () {
  if (typeof EXPORT === 'undefined' || !EXPORT.sceneReader) return;
  var B = function (ctx) { return ctx.memo('isle-scene', function () { return ISLE.exportScene(ctx); }); }, by = { by: 'isle' };
  EXPORT.register('items', function (ctx) { return B(ctx).items; }, by);
  EXPORT.register('buckets', function (ctx) { return B(ctx).buckets; }, by);
  EXPORT.register('materials', function (ctx) { return B(ctx).materials; }, by);
  EXPORT.register('textures', function (ctx) { return B(ctx).textures; }, by);
})();
