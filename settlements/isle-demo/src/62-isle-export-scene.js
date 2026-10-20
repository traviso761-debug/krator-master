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
     ISLE.exportFixtures(ctx) the fixtures section: every building and landmark in the box with the Islanders kit's own
                             doors, windows and lamps (kits/islanders records them while it builds: 36-def.js door() and
                             windowAt(), the lit points; ISK.proto hands them over in the piece's frame), turned onto its
                             lot; a building of another kit gets one door at its front face (local +z, the street side). The
                             door nearest the walking graph's entry node carries it (`entry`, the town's frame)
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
ISLE.exportFixtures = function (ctx) {
  var T = KTAGS.page; if (!T || !ISLE.cur) return null;
  var town = ISLE.cur.town, TS = ISLE.TUNE.sim.towns[town], S = ISLE.SIM, X = TS && S && S.towns[TS.id], F = X && X.frame, entry = {}, lot = {};
  if (F) SIM.all('place').forEach(function (P) { if (P.settlement === TS.id && P.tags && P.tags.tag && P.door) entry[P.tags.tag] = { x: +(P.door.x - F.x).toFixed(2), y: +(P.door.y - F.sea).toFixed(2), z: +(P.door.z - F.z).toFixed(2), node: P.door.node || null }; });
  ISLE.cur.R.lots.forEach(function (L) { if (L.tag) lot[L.tag] = L; });
  var side = function (yaw) { var a = Math.atan2(Math.sin(yaw), Math.cos(yaw)); return Math.abs(a) < Math.PI / 4 ? '+z' : Math.abs(a) > 3 * Math.PI / 4 ? '-z' : a > 0 ? '+x' : '-x'; };
  var recs = [], n = { door: 0, window: 0, lamp: 0, front: 0 };
  T.records.forEach(function (r) {
    if ((r['class'] !== 'building' && r['class'] !== 'landmark') || r.removed || !r.at || !r.size || !ctx.inBox(r.at[0], r.at[2])) return;
    var c = Math.cos(r.ry || 0), s = Math.sin(r.ry || 0), L = lot[r.id], P = L && L.kit ? DRAW.proto(L.kit, L.key, L.v) : null, fx = P && P.fixtures;
    var world = function (q) { return [+(r.at[0] + q.x * c + q.z * s).toFixed(3), +(r.at[1] + (q.y || 0)).toFixed(3), +(r.at[2] - q.x * s + q.z * c).toFixed(3)]; };   /* the piece's frame turned by ry */
    var add = function (kind, i, q, o) { var at = world(q), key = kind + ':' + r.key;
      recs.push(Object.assign({ id: r.id + '/' + kind + i, uid: KTAGS.uid('fixture', key, at), 'class': 'fixture', kind: kind, key: key, parent: r.id, at: at, ry: +((r.ry || 0) + (q.yaw || 0)).toFixed(4) }, o)); n[kind]++; };
    var E = entry[r.id] || null, doors = fx && fx.doors.length ? fx.doors : null, best = -1, bd = Infinity;
    if (doors && E) doors.forEach(function (q, i) { var w = world(q), d = Math.hypot(w[0] - E.x, w[2] - E.z); if (d < bd) { bd = d; best = i; } });
    if (doors) doors.forEach(function (q, i) { add('door', i, q, { size: [q.w, q.h || 1.85, 0.1], tags: { source: 'kit', part: q.part }, host: { wall: side(q.yaw), side: side(q.yaw), sill: 0 }, entry: i === best ? E : null }); });
    else { add('door', 0, { x: 0, y: 0, z: r.size[1] / 2, yaw: 0 }, { size: [1.0, 1.9, 0.2], tags: { source: 'front' }, host: { wall: 'front', side: '+z', sill: 0 }, entry: E }); n.front++; }
    if (fx) fx.windows.forEach(function (q, i) { add('window', i, q, { size: [q.w, q.h, 0.1], tags: { source: 'kit', part: q.part }, host: { wall: side(q.yaw), side: side(q.yaw), sill: q.sill } }); });
    if (fx) fx.lamps.forEach(function (q, i) { add('lamp', i, q, { size: [0.3, 0.3, 0.3], tags: { source: 'kit', colour: q.colour, big: q.big }, host: null }); });
  });
  return { format: 'krator-fixtures', version: 1, build: T.build, records: recs, counts: n,
    note: "the isle demo's doors, windows and lamps: the Islanders kit's own (every door() and window its walls cut, every lit point: lamps, hearths, fires; big = a fire), in each piece's frame turned onto its lot (ry: the way out); a building of another kit (the Vernacular, the Beast Riders) has one door at its front face (source 'front'); entry: the walking graph's node the sim's people enter by, on the door nearest it (the town's frame)" };
};
(function () {
  if (typeof EXPORT === 'undefined' || !EXPORT.sceneReader) return;
  var B = function (ctx) { return ctx.memo('isle-scene', function () { return ISLE.exportScene(ctx); }); }, by = { by: 'isle' };
  EXPORT.register('items', function (ctx) { return B(ctx).items; }, by);
  EXPORT.register('buckets', function (ctx) { return B(ctx).buckets; }, by);
  EXPORT.register('materials', function (ctx) { return B(ctx).materials; }, by);
  EXPORT.register('textures', function (ctx) { return B(ctx).textures; }, by);
  EXPORT.register('fixtures', function (ctx) { return ISLE.exportFixtures(ctx); }, by);
  EXPORT.register('stage', function (ctx) {
    if (typeof KSTAGE === 'undefined' || !ctx.box || !ISLE.cur) return null; var b = ctx.box, cx = (b[0] + b[2]) / 2, cz = (b[1] + b[3]) / 2, G = ISLE.cur.G;
    return KSTAGE.capture({ at: [cx, G.h(cx, cz) + 40, cz], sky: ctx.opt.sky == null ? 1024 : ctx.opt.sky, skyNear: Math.min(b[2] - b[0], b[3] - b[1]) / 2,
      box: b, step: ctx.opt.ground == null ? 4 : ctx.opt.ground, ground: function (x, z) { return G.h(x, z); } }); }, by);
  EXPORT.register('interiors', function () { return null; }, by);   /* the city page draws the kit's buildings as shells */
  EXPORT.register('furniture', function () { return null; }, by);   /* and furnishes none of them */
})();
