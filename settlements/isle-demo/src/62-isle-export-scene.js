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
                             cat: the catalog's Beast Rider buildings)
     ISLE.exportDoors(ctx)   the fixtures section: a door for every building and landmark in the box, at its front face
                             (local +z: where its lot meets its street; 77 of the ceremonial centre's 89 enter from that side),
                             at the ground, its `entry` the walking graph's node the sim's people come in by (the town's frame).
                             The kit's own door offsets, windows and lamps are drawn inside its pieces and not recorded on
                             the city page (KNOWN_ISSUES.md)
   And the stage (core/biome 44-core-stage.js KSTAGE: the lights, fog, sky panorama and the ground's look over the box);
   interiors and furniture answered empty (the city page draws the kit's buildings as shells, unfurnished). */
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
ISLE.exportDoors = function (ctx) {
  var T = KTAGS.page; if (!T) return null;
  var town = ISLE.cur && ISLE.cur.town, TS = town && ISLE.TUNE.sim.towns[town], S = ISLE.SIM, X = TS && S && S.towns[TS.id], F = X && X.frame, entry = {};
  if (F) SIM.all('place').forEach(function (P) { if (P.settlement === TS.id && P.tags && P.tags.tag && P.door) entry[P.tags.tag] = { x: +(P.door.x - F.x).toFixed(2), y: +(P.door.y - F.sea).toFixed(2), z: +(P.door.z - F.z).toFixed(2), node: P.door.node || null }; });
  var recs = [];
  T.records.forEach(function (r) {
    if ((r['class'] !== 'building' && r['class'] !== 'landmark') || r.removed || !r.at || !r.size || !ctx.inBox(r.at[0], r.at[2])) return;
    var hd = r.size[1] / 2, c = Math.cos(r.ry || 0), s = Math.sin(r.ry || 0), at = [+(r.at[0] + hd * s).toFixed(3), r.at[1], +(r.at[2] + hd * c).toFixed(3)];   /* local (0, 0, d/2) turned by ry */
    var key = 'door:' + r.key;
    recs.push({ id: r.id + '/door', uid: KTAGS.uid ? KTAGS.uid('fixture', key, at) : null, 'class': 'fixture', kind: 'door', key: key, parent: r.id, at: at, ry: r.ry || 0,
      size: [1.0, 1.9, 0.2], tags: {}, host: { wall: 'front', side: '+z', sill: 0 }, entry: entry[r.id] || null });
  });
  return { format: 'krator-fixtures', version: 1, build: T.build, records: recs,
    note: "the isle demo's doors: one a building, at its front face (local +z, the street side) at the ground; entry: the walking graph's node the sim's people enter by (the town's frame). Windows and lamps are drawn inside the kit's pieces and not recorded on the city page" };
};
(function () {
  if (typeof EXPORT === 'undefined' || !EXPORT.sceneReader) return;
  var B = function (ctx) { return ctx.memo('isle-scene', function () { return ISLE.exportScene(ctx); }); }, by = { by: 'isle' };
  EXPORT.register('items', function (ctx) { return B(ctx).items; }, by);
  EXPORT.register('buckets', function (ctx) { return B(ctx).buckets; }, by);
  EXPORT.register('materials', function (ctx) { return B(ctx).materials; }, by);
  EXPORT.register('textures', function (ctx) { return B(ctx).textures; }, by);
  EXPORT.register('fixtures', function (ctx) { return ISLE.exportDoors(ctx); }, by);
  EXPORT.register('stage', function (ctx) {
    if (typeof KSTAGE === 'undefined' || !ctx.box || !ISLE.cur) return null; var b = ctx.box, cx = (b[0] + b[2]) / 2, cz = (b[1] + b[3]) / 2, G = ISLE.cur.G;
    return KSTAGE.capture({ at: [cx, G.h(cx, cz) + 40, cz], sky: ctx.opt.sky == null ? 1024 : ctx.opt.sky, skyNear: Math.min(b[2] - b[0], b[3] - b[1]) / 2,
      box: b, step: ctx.opt.ground == null ? 4 : ctx.opt.ground, ground: function (x, z) { return G.h(x, z); } }); }, by);
  EXPORT.register('interiors', function () { return null; }, by);   /* the city page draws the kit's buildings as shells */
  EXPORT.register('furniture', function () { return null; }, by);   /* and furnishes none of them */
})();
