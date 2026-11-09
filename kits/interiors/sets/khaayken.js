/* ======================== Interior set: the Khaayken (kits/yeti) ========================
   The interiors of the Yeti kit's buildings (the Khaayken of the High Country): one item per defBuilding key (kits/yeti
   src/50-53 the dwellings, 60 the State, the faith and the dead, 61 the bath and the works, 62 the stores, 65 Leng's
   occupation). Local frame = the builders': origin at the plot centre on the ground, +z the front (the door side), metres.
   Every room is a dome's floor: a circle (12 sides; its door on the face toward the passage) of the inner face's radius
   (the hide lining of a pycrete dome, the stone of a stone one), its `y` the sunk floor (below the ground: the floor is
   dug), its `h` the dome's height over the floor at four fifths of its radius (the planner's rooms are flat-ceilinged: a
   tall piece against the wall would meet the curve sooner; KNOWN_ISSUES.md). A dome house's sleeping platform is a
   fixture with `bed: n` (the household sleeps on it under its robes: kits/zeijani's bed shelf), so the residence rule
   counts it; the platform takes the back of the floor behind the chord at zPlat. A cluster's satellite domes are rooms of
   their own, their doors on their faces toward the centre (the short passages between are not rooms). The measures are
   ytDomeDims's (kits/yeti src/50-yt-dwell.js) for the open variant (the covered one moves the dome back: the same rooms).
   Furniture culture: khaayken (kits/catalog/krator-master-furniture-khaayken.js: the robes, the soapstone lamp, larch
   chests, the loom and the qiviut comb, the drum, the tea board, the high seat), chained to generic for the goods.
   The pieces are drawn at the Khaayken's 1.15x; a world that places the generic ones takes core/furnish's opt-in scale.
   Wealth from the def's tag: poor 0.2, middle 0.5, rich 0.8; the State's halls 0.75, the works 0.45.
   Not furnished (each says why in `skip`): the tomb, the open works and yards, the stock, the fort and its tower, the
   tunnels, the street and the samples. sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const POOR = 0.2, MID = 0.5, RICH = 0.8, STATE = 0.75, WORKS = 0.45;
  const SF = ['single-family dwelling'];
  if (!IX.CULTURE_FAMILY.khaayken) IX.CULTURE_FAMILY.khaayken = ['generic'];
  /* the room kinds of a dome house (as kits/zeijani's and beast-rider-rock's): its bed is the platform (a fixture, bed: n), so
     yt_home is a cottage without a bed piece: the household's chest and its food; the lamp, the tea board and the pot round
     them. yt_sleep is a sleeping dome's: its platform, a chest */
  const FOOD = IX.FOOD_ROLES, ITEM = IX.ITEM_ROLES, SURFACE = IX.SURFACE_GROUP, SEATS = IX.SEAT_TYPES;
  if (!IX.PROGRAMS.yt_home) {
    IX.PROGRAMS.yt_home = { require: [{ need: 'chest', types: ['storage'], roles: ITEM, n: 1 }, { need: 'food', types: ['storage', 'vessel', 'stack'], roles: FOOD, anchors: ['floor', 'wall'], n: 1 }],
      optional: [{ types: ['table'], max: 1 }, { types: ['stove'], max: 1 }, { types: ['rack'], max: 1 }, { types: ['lamp'], max: 1 }, { types: ['vessel'], max: 1 },
                 { types: SEATS, max: 1 }, { types: ['art', 'banner'], max: 1 }],
      extra: 5 };   /* the food stands on the floor (anchors), where the residence rule counts it; no surface group */
    IX.PROGRAMS.yt_sleep = { require: [{ need: 'chest', types: ['storage'], roles: ITEM, n: 1 }],
      optional: [{ types: ['lamp'], max: 1 }, { types: ['storage'], max: 1 }, { types: ['art', 'banner'], max: 1 }, SURFACE],
      extra: 3 };
    IX.KIND_ALIAS.yt_home = ['cottage', 'living', 'kitchen', 'hall', 'bedroom'];
    IX.KIND_ALIAS.yt_sleep = ['bedroom'];
  }
  const L = [];
  const add = function (it) { it.culture = it.culture || 'khaayken'; L.push(it); return it; };
  const skip = (key, name, why, types) => add({ key: key, name: name, types: types || ['civic'], skip: why });
  const r3 = v => Math.round(v * 1000) / 1000, N = 12;
  /* a dome's floor: the circle R round (cx, cz) */
  const disc = (R, cx, cz) => SH.circle(R, N, cx, cz);
  /* where the ray from (cx, cz) toward (tx, tz) leaves the polygon: a door on the face toward the passage */
  const onEdge = function (poly, cx, cz, tx, tz) {
    const dx = tx - cx, dz = tz - cz, l = Math.hypot(dx, dz) || 1, ux = dx / l, uz = dz / l;
    let best = null;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], ex = b[0] - a[0], ez = b[1] - a[1], den = ux * ez - uz * ex;
      if (Math.abs(den) < 1e-9) continue;
      const t = ((a[0] - cx) * ez - (a[1] - cz) * ex) / den, s = ((a[0] - cx) * uz - (a[1] - cz) * ux) / den;
      if (t > 0 && s >= 0 && s <= 1 && (!best || t < best)) best = t;
    }
    return [r3(cx + ux * best), r3(cz + uz * best)];
  };
  /* the sleeping platform behind the chord at zPlat (the dome's frame), as a rectangle inside the circle: a fixture that sleeps n */
  const platform = function (R, cz, zPlat, yFl, yPlat, n) {
    const d = 0.62 * (R + zPlat), zc = cz + zPlat - d / 2, far = zPlat - d, w = 2 * 0.95 * Math.sqrt(R * R - far * far);
    return { id: 'platform', kind: 'platform', x: 0, z: r3(zc), ry: 0, w: r3(Math.min(w, 2 * Math.sqrt(R * R - zPlat * zPlat))), d: r3(d), h: r3(yPlat + 0.07 - yFl), reach: false, bed: n };
  };
  /* a dome room: D {R, cz, yFl, h, zPlat?, yPlat?, beds?}; its door toward (tx, tz) (default the entry, +z), w wide */
  const dome = function (id, kind, D, o) {
    o = o || {};
    const cx = D.cx || 0, poly = disc(D.R, cx, D.cz), to = o.to || [cx, D.cz + 10];
    const room = { id: id, kind: kind, poly: poly, y: D.yFl, h: D.h, doors: [{ at: onEdge(poly, cx, D.cz, to[0], to[1]), w: o.w || 1.2, swing: 'none' }] };
    if (D.beds) room.fixtures = [platform(D.R, D.cz, D.zPlat, D.yFl, D.yPlat, D.beds)];
    if (o.fixtures) room.fixtures = (room.fixtures || []).concat(o.fixtures);
    return room;
  };
  /* a cluster's satellite: a sleeping dome or a cold store at (sx, sz), its door toward the centre room */
  const SLEEP = { R: 1.782, yFl: -0.6, h: 1.55 }, STORE = { R: 1.667, yFl: -0.6, h: 1.55 };
  const sat = (id, kind, S, sx, sz, cz) => dome(id, kind, Object.assign({}, S, { cx: sx, cz: sz }), { to: [0, cz], w: 1.0 });
  /* the measures (ytDomeDims: R the inner face, cz the dome's centre, yFl the floor, h the height at 0.8 R, the platform) */
  const DOME = { R: 2.645, cz: -1.675, yFl: -0.6, h: 1.9, zPlat: 0.2, yPlat: 0.262 };
  const TRAVEL = { R: 1.955, cz: -1.075, yFl: -0.45, h: 1.45, zPlat: 0.05, yPlat: 0.412 };
  const STONE = { R: 2.76, cz: -1.775, yFl: -0.6, h: 1.85, zPlat: 0.2, yPlat: 0.262 };
  const FAM = { R: 2.645, cz: -1.675, yFl: -0.6, h: 1.9, zPlat: -0.25, yPlat: 0.262 };
  const COMP = { R: 2.76, cz: -1.775, yFl: -0.6, h: 1.85, zPlat: -0.25, yPlat: 0.262 };
  const CLAN = { R: 3.68, cz: -1.875, yFl: -0.6, h: 2.25, zPlat: -0.45, yPlat: 0.262 };
  const CHIEF = { R: 5.0, cz: -2.075, yFl: -0.7, h: 3.1, zPlat: -1.2, yPlat: 0.162 };

  /* ---------------- DWELLINGS */
  add({ key: 'yt_dome', name: "Pycrete dome (a poor family's)", wealth: POOR, types: SF, lot: [6.8, 9.8],
    rooms: [dome('room', 'yt_home', Object.assign({ beds: 2 }, DOME))],
    note: 'one sunk room under the pycrete; the platform over its back half is the bed; the cold-trap entry is a passage, not a room' });
  add({ key: 'yt_travel_dome', name: "Herder's travel dome", wealth: POOR, types: SF, lot: [5.4, 7.0],
    rooms: [dome('room', 'yt_home', Object.assign({ beds: 1 }, TRAVEL), { w: 1.0 })],
    note: 'the herding camp\'s small dome: one platform of robes' });
  add({ key: 'yt_stone_dome', name: 'Stone house (mass heater)', wealth: MID, types: SF, lot: [7.8, 10.8],
    rooms: [dome('room', 'yt_home', Object.assign({ beds: 2 }, STONE))],
    note: 'the platform is suspended over the mass heater\'s flues; its stoking chamber off the entry is not a room' });
  add({ key: 'yt_sleep_dome', name: 'Sleeping dome', wealth: MID, types: SF, lot: [6.9, 6.9],
    residence: false,
    rooms: [dome('room', 'yt_sleep', { R: SLEEP.R, cz: 0, yFl: -0.6, h: SLEEP.h, zPlat: 0.1, yPlat: -0.01, beds: 2 }, { w: 1.0 })],
    note: 'a satellite dome placed on its own (not a household: its family room is the cluster\'s): its platform (0.6 m) sleeps two' });
  add({ key: 'yt_store_dome', name: 'Cold store dome', wealth: MID, types: ['storage'], lot: [6.2, 6.2],
    rooms: [dome('room', 'store', { R: STORE.R, cz: 0, yFl: -0.6, h: STORE.h }, { w: 1.0 })],
    note: 'an unlined pycrete cold room: never heated' });
  add({ key: 'yt_family_cluster', name: 'Family cluster (common household)', wealth: MID, types: SF, lot: [17.4, 9.8],
    rooms: [dome('family', 'yt_home', Object.assign({ beds: 3 }, FAM)), sat('sleeping', 'yt_sleep', SLEEP, 6.69, 0.542, FAM.cz),
      sat('store', 'store', STORE, -6.381, 0.44, FAM.cz)],
    note: 'the family room, a sleeping dome on its right and a cold store on its left, each off the front floor through a short passage' });
  add({ key: 'yt_composite_house', name: 'Composite house (stone heart, pycrete ring)', wealth: MID, types: SF, lot: [18.3, 13.6],
    rooms: [dome('heart', 'yt_home', Object.assign({ beds: 3 }, COMP)), sat('sleeping', 'yt_sleep', SLEEP, -7.215, 0.457, COMP.cz),
      sat('store-e', 'store', STORE, 7.083, -0.339, COMP.cz), sat('store-w', 'store', STORE, -3.905, 4.307, COMP.cz)],
    note: 'the stone heart with its mass heater, and the pycrete ring: a sleeping dome and two cold stores' });
  add({ key: 'yt_clan_compound', name: 'Clan compound (the rich household)', wealth: RICH, types: SF, lot: [21.4, 15.2],
    rooms: [dome('hall', 'yt_home', Object.assign({ beds: 4 }, CLAN)), sat('sleeping-e', 'yt_sleep', SLEEP, 8.23, 0.139, CLAN.cz),
      sat('sleeping-w', 'yt_sleep', SLEEP, -8.23, 0.139, CLAN.cz), sat('store', 'store', STORE, -4.739, 4.752, CLAN.cz)],
    note: 'the stone hall (the household\'s room, its platform the clan\'s bed) and its ring: two sleeping domes and a cold store. ' +
      'The kit draws its riches itself: hangings, the bead panel, the rug, carved figures and the war loot (kits/yeti src/45-yt-inside.js)' });
  add({ key: 'yt_balagan', name: 'Larch-and-sod house (the forest-steppe balagan)', wealth: POOR, types: SF, lot: [9.9, 9.7],
    rooms: [{ id: 'room', kind: 'cottage', poly: rect(6.0, 5.0, 0, -0.863), y: -0.35, h: 2.1,
      doors: [{ at: [0, 1.637], w: 1.15 }] }],
    note: 'the battered log walls lean in: the room is taken at the walls\' height of 2.1 m, a little inside their foot; the cold porch is open' });

  /* ---------------- THE STATE, THE FAITH, THE DEAD */
  add({ key: 'yt_quunsul_hall', name: 'Quunsul hall (the council of the clans)', wealth: STATE, types: ['civic'], lot: [16.7, 18.3],
    rooms: [dome('hall', 'hall', { R: 6.2, cz: -2.075, yFl: -0.7, h: 3.4 },
      { w: 1.4, fixtures: [{ id: 'stove', kind: 'hearth', x: 0, z: -2.075, ry: 0, w: 1.6, d: 1.6, h: 1.0, reach: false }] })],
    note: 'the clans\' benches in two rings round the central stone stove are the builder\'s; the planner adds the board and the clans\' seats' });
  add({ key: 'yt_chief_hall', name: "High Chief's hall (Khaay Chiip)", wealth: STATE, types: ['civic'], lot: [26.2, 17.6],
    rooms: [dome('hall', 'hall', Object.assign({ beds: 0 }, CHIEF), { w: 1.4 }), sat('guards', 'yt_sleep', SLEEP, 9.556, 0.062, CHIEF.cz),
      sat('store', 'store', STORE, -9.239, -0.009, CHIEF.cz)],
    note: 'the hall with the high seat on its raised platform (a fixture; the seat is the builder\'s), the guards\' sleeping dome and a cold store' });
  add({ key: 'yt_song_house', name: 'Song house (the qaggiq)', wealth: MID, types: ['civic'], lot: [14.5, 16.9],
    rooms: [dome('hall', 'hall', { R: 5.6, cz: -1.775, yFl: -0.5, h: 3.0 }, { w: 1.4 })],
    note: 'the drum dancers\' floor and the benches round the wall (the builder\'s)' });
  add({ key: 'yt_shrine', name: 'Shrine (the spirit house)', wealth: MID, types: ['religious'], lot: [9.3, 10.6],
    rooms: [dome('shrine', 'shrine', { R: 2.6, cz: -1.575, yFl: -0.6, h: 1.85 }, { w: 1.2,
      fixtures: [{ id: 'altar', kind: 'altar', x: 0, z: -1.575 - 2.6 + 0.9, ry: 0, w: 1.4, d: 0.6, h: 0.75, reach: false }] })],
    note: 'the mask wall and the slab altar under the vent are the builder\'s' });
  skip('yt_clan_tomb', 'Clan tomb (corbelled mound)', 'the dead lie in stone cists round a chamber too low to stand in: no room to furnish', ['funerary']);

  /* ---------------- HEAT AND BATH, THE WORKS */
  skip('yt_bathhouse', 'Bathhouse (banya and sweat lodge)', 'the bath\'s stone stove, its benches and the cold plunge are the builder\'s; no room kind for a bath', ['bath']);
  add({ key: 'yt_smithy', name: 'Smithy', wealth: WORKS, types: ['industry'], lot: [10.5, 12.4],
    rooms: [dome('forge', 'smithy', { R: 3.2, cz: -1.775, yFl: -0.6, h: 2.0 })], note: 'the forge and anvil' });
  add({ key: 'yt_kitchen_house', name: 'Kitchen house', wealth: WORKS, types: ['industry'], lot: [10.1, 11.9],
    rooms: [dome('kitchen', 'kitchen', { R: 3.0, cz: -1.675, yFl: -0.6, h: 1.95 })], note: 'the stone stove at the back is the builder\'s; its pot is the planner\'s' });
  add({ key: 'yt_tannery', name: 'Tannery', wealth: WORKS, types: ['industry'], lot: [9.5, 10.8],
    rooms: [dome('works', 'workshop', { R: 3.0, cz: -1.575, yFl: -0.6, h: 2.0 })], note: 'the hide racks are the builder\'s' });
  add({ key: 'yt_weaving_house', name: 'Qiviut weaving house', wealth: WORKS, types: ['industry'], lot: [9.9, 11.2],
    rooms: [dome('works', 'workshop', { R: 3.2, cz: -1.575, yFl: -0.6, h: 2.05 })], note: 'the looms, the comb stand and the baskets' });
  add({ key: 'yt_carvers_house', name: "Carvers' house", wealth: WORKS, types: ['shop'], lot: [9.5, 10.8],
    rooms: [dome('works', 'workshop', { R: 3.0, cz: -1.575, yFl: -0.6, h: 2.0 })], note: 'the bench of figures (the kit\'s figure generator) is the builder\'s' });
  add({ key: 'yt_tea_house', name: 'Tea house (Ivan-chai)', wealth: WORKS, types: ['tavern'], lot: [9.9, 11.2],
    rooms: [dome('room', 'hall', { R: 3.2, cz: -1.575, yFl: -0.6, h: 2.05 })], note: 'the benches round the wall are the builder\'s; a hall (the board and the seats), not a tavern: no counter, the tea is served from the lamps' });
  skip('yt_goldroot_house', 'Goldroot drying house', 'racks under a lean-to, open to the wind', ['industry']);

  /* ---------------- STORES, THE LAND, THE STOCK, WAR */
  add({ key: 'yt_ice_cellar', name: 'Ice cellar', wealth: WORKS, types: ['storage'], lot: [8.7, 9.8],
    rooms: [dome('cellar', 'store', { R: 2.6, cz: -1.475, yFl: -1.1, h: 2.1 })], note: 'sunk a metre deeper than a house' });
  add({ key: 'yt_frostroot_house', name: 'Root store and freeze-drying house', wealth: WORKS, types: ['storage'], lot: [9.5, 10.8],
    rooms: [dome('store', 'store', { R: 3.0, cz: -1.575, yFl: -0.6, h: 1.8 })], note: 'the roots spread to freeze-dry are the builder\'s' });
  skip('yt_raised_cache', 'Raised cache (labaz)', 'a log box on posts reached by a ladder: no room to stand in', ['storage']);
  skip('yt_ice_quarry', 'Ice quarry (on the frozen lake)', 'open: saw lines and stacked blocks on the ice', ['industry']);
  skip('yt_pycrete_works', 'Pycrete works', 'open yards: bins, the moss yard, the moulds', ['industry']);
  skip('yt_muskox_byre', 'Musk-ox byre', 'a long half-buried stall run: a later pass (no stalls in the catalog for musk oxen)', ['farm']);
  skip('yt_caribou_corral', 'Caribou corral', 'an open corral', ['farm']);
  skip('yt_winter_fort', 'Winter fort (seasonal pycrete)', 'a curtain round an open court; its command dome is its own item', ['military']);
  add({ key: 'yt_fort_dome', name: "Winter fort's command dome", wealth: MID, types: ['military'], lot: [8, 8],
    rooms: [{ id: 'room', kind: 'barracks', poly: SH.circle(2.8, N, 0, 0), y: 0.06, h: 2.0, doors: [{ at: [0, r3(2.8 * Math.cos(Math.PI / N))], w: 1.0, swing: 'none' }] }],
    note: 'the fort\'s command and sleeping room' });
  skip('yt_watch_tower', 'Watch tower', 'a ladder tower: its floor is a landing', ['military']);
  skip('yt_signal_cairn', 'Signal cairn and inuksuk', 'solid stone', ['military']);

  /* ---------------- LENG'S OCCUPATION (Y6) */
  add({ key: 'yt_leng_bay_house', name: 'Bay house (a dome in an Ancient bay)', wealth: MID, types: SF, lot: [9, 10],
    rooms: [dome('room', 'yt_home', { R: 2.645, cz: -0.6, yFl: 0.45, h: 2.3, zPlat: 0.2, yPlat: 1.312, beds: 2 })],
    note: 'the dome stands on the ruin\'s floor, not dug in (the Ancient slab): its floor is the timber deck over the cold slab' });
  skip('yt_leng_plug', 'Plugged breach (pycrete wall in an Ancient gap)', 'a wall with a door: nothing enclosed', ['military']);
  skip('yt_leng_hall', 'Leng: the occupation of a hall', 'a ruin\'s hall sheltering domes and a tunnel: its bay houses are their own item', ['civic']);

  /* ---------------- THE FOREST-STEPPE (Y6) */
  add({ key: 'yt_urasa', name: 'Summer house (the urasa)', wealth: MID, types: SF, lot: [9.9, 9.9],
    rooms: [{ id: 'room', kind: 'cottage', poly: SH.circle(3.3, N, 0, 0), y: 0.02, h: 1.6, doors: [{ at: [0, r3(3.3 * Math.cos(Math.PI / N))], w: 1.1, swing: 'none' }],
      fixtures: [{ id: 'hearth', kind: 'hearth', x: 0, z: 0, ry: 0, w: 1.3, d: 1.3, h: 0.2, reach: false }] }],
    note: 'the birch-bark cone closes in fast: the room is taken at 1.6 m, where the cone stands four fifths out; the open hearth in the middle' });
  add({ key: 'yt_khoton', name: 'Byre (the khoton), its hay and its corral', wealth: WORKS, types: ['farm'], lot: [20.3, 15.3],
    rooms: [{ id: 'byre', kind: 'stable', poly: rect(8.1, 5.3, -3.2, 0), y: 0, h: 1.9, doors: [{ at: [-3.2, 2.65], w: 1.4 }] }],
    note: 'the battered walls lean in: the room is taken at the walls\' foot less their batter; the hay stack and the corral are open' });

  /* ---------------- TUNNELS, THE STREET, THE SAMPLES */
  ['yt_tunnel_sections', 'yt_tunnel_net', 'yt_winter_street', 'yt_sample_ribbed', 'yt_sample_slump'].forEach(k =>
    skip(k, k, 'a sample or a network: its houses are their own items; a tunnel is a passage, not a room', ['infrastructure']));

  IX.sets.add({ set: 'khaayken', title: 'The Khaayken (kits/yeti): domes, clusters, halls', culture: 'khaayken', items: L });
})(KratorInteriors);
