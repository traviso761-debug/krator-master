/* ======================== Interior set: the Eternians (kits/eternian) ========================
   The interiors of the Eternian kit's buildings that have a closed body: one item per defBuilding key (kits/eternian
   src/50-54 the dwellings, 60-63 the State and the ancestors, 64-67 the trades and the land, 71 the harbour).
   Local frame = the builders': origin at the plot centre on the ground, +z the front (the door side), metres. A body's
   `poly` is its walls' outer face, `y` its floor (the plinth's top), its levels the builder's storeys. The hexagonal
   bodies (etTrade 'hex' and the hexagonal houses) are circle(R, 6), whose corners fall where etHex's do; a hexagonal
   building's door is on its front face, at [0, R cos 30].
   Furniture culture: eternian (kits/catalog/krator-master-furniture-eternian.js: the common, poor and court tiers and
   the State's offices), chained to generic (kits/eternian/PLAN.md section 9: no cousin culture to borrow from).
   Wealth from the def's tag: poor 0.2, middle 0.5, rich 0.8, court 0.88; the State's halls 0.65.
   Not furnished (each says why in `skip`): the open and solid pieces (the ministry's pier bundle, the gate, the walls,
   the shrine, the house of the Withdrawn, the Clock, the talking head, the canal, the bridge and the street, the
   samples), the courts of ranges (the examination hall's cells, the kiln works: a later pass), and the open yards.
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect, hex = (R, cx, cz) => SH.circle(R, 6, cx, cz), oct = (R, cx, cz) => SH.circle(R, 8, cx, cz);
  const POOR = 0.2, MID = 0.5, RICH = 0.8, COURT = 0.88, CIVIC = 0.65, AP = Math.cos(Math.PI / 6);
  const SF = ['single-family dwelling'], MF = ['multi-family dwelling'];
  if (!IX.CULTURE_FAMILY.eternian) IX.CULTURE_FAMILY.eternian = ['generic'];
  const L = [];
  const add = function (it) { it.culture = it.culture || 'eternian'; L.push(it); return it; };
  const skip = (key, name, why, types) => add({ key: key, name: name, types: types || ['civic'], skip: why });
  /* an etTrade body: the rectangle w x d at (cx, cz), or the hexagon R; n storeys of sh on a plinth G; its door on the front */
  const tradeRect = (id, w, d, n, program, o) => { o = o || {}; const cx = o.cx || 0, cz = o.cz || 0, sh = o.sh || 3.2;
    return { id: id, poly: rect(w, d, cx, cz), y: o.G == null ? 0.35 : o.G, levels: Array.from({ length: n }, () => ({ h: sh })), wall: 0.3, roof: o.roof || 'gable',
      doors: [{ at: [cx + (o.shop ? w / 2 - 1.1 : (o.doorX || 0)), cz + d / 2], w: 1.15 }], program: program }; };
  const tradeHex = (id, R, n, program, o) => { o = o || {}; const cx = o.cx || 0, cz = o.cz || 0, sh = o.sh || 3.2;
    return { id: id, poly: hex(R, cx, cz), y: o.G == null ? 0.35 : o.G, levels: Array.from({ length: n }, () => ({ h: sh })), wall: 0.3, roof: 'flat',
      doors: [{ at: [cx, cz + R * AP], w: o.shop ? 2.0 : 1.15 }], program: program }; };

  /* ---------------- DWELLINGS */
  add({ key: 'et_reed_house', name: 'Reed house', wealth: POOR, types: SF, lot: [7, 7],
    bodies: [{ id: 'house', poly: rect(4.8, 4), y: 0.2, levels: [{ h: 2.3 }], wall: 0.3, roof: 'gable', doors: [{ at: [-0.8, 2], w: 0.9 }], program: ['cottage'] }],
    note: 'one room of silt brick under the reed' });
  add({ key: 'et_block_hut', name: 'Block hut', wealth: POOR, types: SF, lot: [7.2, 5.4],
    bodies: [{ id: 'hut', poly: rect(3.6, 3.2, -1, 0), y: 0.2, levels: [{ h: 2.5 }], wall: 0.3, roof: 'flat', doors: [{ at: [-1.7, 1.6], w: 0.9 }], program: ['cottage'] }],
    note: 'one room of cast block; the lean-to and its hearth are open' });
  add({ key: 'et_canal_row', name: 'Canal row', wealth: POOR, types: MF, units: 6, lot: [13, 9],
    bodies: [-3.6, 0, 3.6].map((x, i) => ({ id: 'house' + i, poly: rect(3.6, 6, x - 0.6, -0.7), y: 0.3, levels: [{ h: 3.0 }, { h: 3.0 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [x - 1.4, 2.3], w: 0.9 }], program: [['cottage'], ['cottage']] })),
    note: 'three narrow houses, a flat on each floor; the upper flats are reached by the gallery and the shared stair' });
  add({ key: 'et_canal_house', name: 'Canal house', wealth: MID, types: SF, lot: [10, 12],
    bodies: [{ id: 'house', poly: rect(9, 8, 0, 1), y: 0.4, levels: [{ h: 3.2 }, { h: 3.4 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [-2.6, 5], w: 1.15 }], program: [['living', 'kitchen'], ['bedroom', 'bedroom']] },
      { id: 'kitchen', poly: rect(4.4, 3, -2, -4.5), y: 0.4, levels: [{ h: 2.6 }], wall: 0.3, roof: 'pent', doors: [{ at: [-2, -3], w: 1.0 }], program: ['kitchen'] }],
    note: 'two storeys and the bay; the kitchen behind; the yard is open' });
  add({ key: 'et_court_house', name: 'Court house', wealth: MID, types: SF, lot: [14.4, 14.4],
    bodies: [{ id: 'hall', poly: rect(14, 4.6, 0, -4.7), y: 0.3, levels: [{ h: 3.0 }], wall: 0.3, roof: 'gable', doors: [{ at: [0, -2.4], w: 1.2 }], program: ['living', 'kitchen', 'bedroom'] },
      { id: 'westwing', poly: rect(3, 6, -5.5, 0.6), y: 0.3, levels: [{ h: 2.6 }], wall: 0.3, roof: 'pent', doors: [{ at: [-4, -0.7], w: 1.0 }], program: ['bedroom'] },
      { id: 'eastwing', poly: rect(3, 6, 5.5, 0.6), y: 0.3, levels: [{ h: 2.6 }], wall: 0.3, roof: 'pent', doors: [{ at: [4, -0.7], w: 1.0 }], program: ['study'] }],
    note: 'the hall across the back and the two wings round the court; the court and the gatehouse are open' });
  add({ key: 'et_corner_turret', name: 'Corner turret', wealth: MID, types: MF.concat(['market/shop']), units: 2, lot: [11, 11],
    bodies: [{ id: 'block', poly: rect(9, 9, -0.75, -0.75), y: 0.4, levels: [{ h: 3.2 }, { h: 3.2 }, { h: 3.2 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [0.65, 3.75], w: 1.1 }], program: [['shop', 'store'], ['living', 'kitchen', 'bedroom'], ['living', 'kitchen', 'bedroom']] }],
    note: 'the shop below, a flat on each upper floor; the turret is not planned' });
  add({ key: 'et_merchant_house', name: "Merchant's house", wealth: RICH, types: SF, lot: [12.4, 11.4],
    bodies: [{ id: 'house', poly: rect(10, 9), y: 0.5, levels: [{ h: 3.9 }, { h: 3.8 }, { h: 3.7 }], wall: 0.3, roof: 'hip',
      doors: [{ at: [0, 4.5], w: 1.5 }], program: [['study', 'store'], ['living', 'kitchen'], ['bedroom', 'bedroom']] }],
    note: 'the counting room, the hall, the bedchambers' });
  add({ key: 'et_official_villa', name: "Official's villa", wealth: RICH, types: SF, lot: [24.6, 20.6],
    bodies: [{ id: 'hall', poly: rect(14, 7, 0, -5.6), y: 0.6, levels: [{ h: 5.4 }], wall: 0.3, roof: 'hip', doors: [{ at: [0, -2.1], w: 1.6 }], program: ['hall', 'kitchen', 'bedroom'] },
      { id: 'register', poly: rect(6, 7, -8, 2.6), y: 0.4, levels: [{ h: 3.2 }], wall: 0.3, roof: 'gable', doors: [{ at: [-5, 1.0], w: 1.1 }], program: ['study'] },
      { id: 'servants', poly: rect(4.6, 5, 8.8, 6.5), y: 0.3, levels: [{ h: 2.6 }], wall: 0.3, roof: 'pent', doors: [{ at: [6.5, 5.3], w: 0.95 }], program: ['dormitory'] }],
    note: 'the hall, the register room and the servants’ quarters; the garden court and the gallery of heads are open' });
  add({ key: 'et_heir_pavilion', name: "Heir's pavilion", wealth: COURT, types: ['dwelling-single'], residence: false, lot: [15.4, 16.6],
    bodies: [{ id: 'pavilion', poly: oct(3.6), y: 1.26, levels: [{ h: 4.2 }], wall: 0.3, roof: 'flat', doors: [{ at: [0, 3.33], w: 1.6 }], program: ['antechamber'] }],
    note: 'a sitting pavilion over water, an Heir’s by day: not a household' });
  skip('et_heir_gallery', "Heirs' gallery", 'an open covered walk: tracery on one side, heads in niches on the other');
  add({ key: 'et_hex_hut', name: 'Hexagonal hut', wealth: POOR, types: SF, lot: [8, 8], bodies: [tradeHex('hut', 3, 1, ['cottage'])] });
  add({ key: 'et_hex_house', name: 'Hexagonal house', wealth: MID, types: SF, lot: [11, 11], bodies: [tradeHex('house', 4.4, 2, [['living', 'kitchen'], ['bedroom']])] });
  add({ key: 'et_hex_villa', name: 'Hexagonal villa', wealth: RICH, types: SF, lot: [24, 24], bodies: [tradeHex('house', 5, 2, [['hall', 'kitchen'], ['bedroom', 'bedroom']])],
    note: 'the house in its walled garden; the garden is open' });

  /* ---------------- THE STATE AND THE ANCESTORS */
  skip('et_ministry', 'Ministry', 'the stepped pier bundle is drawn solid: its offices are a later pass');
  add({ key: 'et_registry', name: 'Registry', wealth: CIVIC, types: ['civic'], lot: [30, 18],
    bodies: [{ id: 'hall', poly: rect(26, 10), y: 0.8, levels: [{ h: 8 }], wall: 0.3, roof: 'hip', doors: [{ at: [0, 5], w: 2.0 }], program: ['study', 'library', 'study'] }],
    note: 'the clerks’ hall and the registers; the vault is solid' });
  skip('et_examination_hall', 'Examination hall', 'a hexagon of thirty cells round a court: the cells are a later pass');
  add({ key: 'et_customs_house', name: 'Customs house', wealth: CIVIC, types: ['civic'], lot: [21, 13],
    bodies: [{ id: 'hall', poly: rect(19, 10), y: 0.4, levels: [{ h: 6.5 }], wall: 0.3, roof: 'hip', doors: [{ at: [0, 5], w: 3.0 }], program: ['hall', 'store', 'study'] }],
    note: 'the weighing hall behind the gate wall' });
  skip('et_gate', 'City gate', 'a gate and its towers: solid'); skip('et_wall', 'City wall', 'a wall'); skip('et_wall_tower', 'Wall tower', 'a solid pier tower');
  add({ key: 'et_barracks', name: 'Barracks', wealth: POOR, types: ['military'], lot: [25, 21],
    bodies: [{ id: 'back', poly: rect(24, 5, 0, -7.5), y: 0.3, levels: [{ h: 3.4 }], wall: 0.3, roof: 'flat', doors: [{ at: [-10, -5], w: 0.9 }], program: ['barracks'] },
      { id: 'east', poly: rect(5, 10, 9.5, 0), y: 0.3, levels: [{ h: 3.4 }], wall: 0.3, roof: 'flat', doors: [{ at: [7, -2], w: 0.9 }], program: ['kitchen'] },
      { id: 'west', poly: rect(5, 10, -9.5, 0), y: 0.3, levels: [{ h: 3.4 }], wall: 0.3, roof: 'flat', doors: [{ at: [-7, -2], w: 0.9 }], program: ['store'] }],
    note: 'the ranges round the drill yard; the gate range is a passage' });
  skip('et_clock', 'The Clock', 'an automaton bridging a street'); skip('et_talking_head', 'Talking head', 'a terminal in a wall'); skip('et_tube_pipe', 'Tube pipe', 'a pipe');
  add({ key: 'et_tube_station', name: 'Tube station', wealth: CIVIC, types: ['infrastructure'], lot: [10, 10], bodies: [tradeHex('kiosk', 3.6, 1, ['study'], { G: 0.4, sh: 3.4 })] });
  add({ key: 'et_relic_hall', name: 'Relic hall', wealth: CIVIC, types: ['civic'], lot: [22, 27],
    bodies: [{ id: 'hall', poly: rect(16, 14, 0, -1), y: 0.8, levels: [{ h: 10 }], wall: 0.8, roof: 'hip', doors: [{ at: [0, 6], w: 4 }], program: ['hall'] }],
    note: 'the hall between the casing and the apse' });
  add({ key: 'et_ancestor_gallery', name: 'Ancestor gallery', wealth: CIVIC, types: ['religious'], lot: [13, 30],
    bodies: [{ id: 'gallery', poly: rect(11, 24, 0, -1.5), y: 0.8, levels: [{ h: 9 }], wall: 0.3, roof: 'hip', doors: [{ at: [0, 10.5], w: 1.8 }], program: ['shrine'] }],
    note: 'the hall of heads: its rows of heads are the kit’s statuary' });
  skip('et_shrine_niche', 'Street shrine', 'a niche', ['religious']); skip('et_withdrawal_house', 'House of the Withdrawn', 'sealed: nobody goes in who comes out', ['religious']);
  add({ key: 'et_mask_house', name: 'Mask house', wealth: MID, types: ['funerary'], lot: [15, 11], bodies: [tradeRect('house', 9, 7, 1, ['workshop', 'store'], { cx: -2.5, doorX: -2.4, sh: 3.4, roof: 'flat' })] });
  add({ key: 'et_historians_house', name: "Historians' chapter house", wealth: MID, types: ['religious'], lot: [18, 13],
    bodies: [{ id: 'hall', poly: rect(12, 8, 2, 0), y: 0.5, levels: [{ h: 6 }], wall: 0.3, roof: 'gable', doors: [{ at: [2, 4], w: 1.3 }], program: ['library', 'study'] }],
    note: 'the chapter hall and its archive; the tower is solid' });

  /* ---------------- THE TRADES (the shop trades' v 1 is the hexagon: an item keyed <key>#1) */
  const shop2 = (key, name, types, w, d, R, n, program, o) => { o = o || {};
    add({ key: key, name: name, wealth: MID, types: types, lot: [w + 2, d + 3], bodies: [tradeRect('shop', w, d, n, program, o)] });
    add({ key: key + '#1', name: name + ' (variant 2: the hexagon)', wealth: MID, types: types, lot: [2 * R + 2, 2 * R + 2], bodies: [tradeHex('shop', R, n, program, o)] }); };
  shop2('et_bakehouse', 'Bakehouse', ['market/shop'], 9, 7, 4.4, 1, ['shop', 'kitchen'], { shop: true });
  shop2('et_weaver', 'Weaver', ['workshop'], 10, 7, 4.8, 1, ['workshop']);
  shop2('et_brewhouse', 'Brewhouse', ['workshop'], 10, 7, 5, 1, ['workshop', 'store']);
  shop2('et_smithy', 'Smithy', ['workshop'], 8, 7, 4.4, 1, ['smithy'], { shop: true });
  shop2('et_shophouse', 'Shophouse', ['market/shop'].concat(SF), 8, 7, 4.4, 2, [['shop'], ['living', 'kitchen', 'bedroom']], { shop: true, roof: 'flat' });
  add({ key: 'et_butcher', name: 'Butcher', wealth: MID, types: ['market/shop'], lot: [10, 9], bodies: [tradeRect('shop', 8, 6, 1, ['shop', 'store'], { shop: true, roof: 'pent' })] });
  skip('et_tannery', 'Tannery', 'an open shed over the pits; its store is a cupboard', ['workshop']);
  add({ key: 'et_tea_house', name: 'Tea house', wealth: MID, types: ['tavern'], lot: [14, 14], bodies: [tradeHex('house', 4.6, 1, ['tavern'])] });
  add({ key: 'et_inn', name: 'Caravan inn', wealth: MID, types: ['inn'], lot: [22, 20], bodies: [tradeRect('inn', 16, 7, 2, [['tavern', 'kitchen'], ['bedroom', 'bedroom', 'bedroom']], { cz: -5.5 })],
    note: 'the hall and the rooms; the stalls round the yard are open' });
  add({ key: 'et_inn#1', name: 'Caravan inn (variant 2: the hexagon)', wealth: MID, types: ['inn'], lot: [22, 20], bodies: [tradeHex('inn', 6.4, 2, [['tavern', 'kitchen'], ['bedroom', 'bedroom']])] });
  add({ key: 'et_healer', name: 'House of healing', wealth: MID, types: ['civic'], lot: [14, 14], bodies: [tradeHex('house', 6, 1, ['dormitory', 'store'])] });
  add({ key: 'et_market_hall', name: 'Market hall', wealth: MID, types: ['market/shop'], lot: [26, 26], bodies: [tradeHex('hall', 10, 2, [['shop'], ['store']], { sh: 4.5 })] });
  add({ key: 'et_granary', name: 'Granary', wealth: MID, types: ['farm'], lot: [15, 15], bodies: [tradeHex('granary', 5, 2, [['store'], ['store']], { G: 1.2, sh: 3.6 })] });
  add({ key: 'et_warehouse', name: 'Warehouse', wealth: MID, types: ['workshop'], lot: [20, 22], bodies: [tradeHex('store', 7.5, 3, [['store'], ['store'], ['store']], { sh: 3.6 })] });
  add({ key: 'et_mushroom_cellar', name: 'Mushroom cellar', wealth: POOR, types: ['farm'], lot: [11, 9], bodies: [tradeRect('cellar', 9, 7, 1, ['store'], { G: 0.1, sh: 3, roof: 'flat' })] });
  skip('et_kiln', 'Kiln works', 'a hexagonal court of sheds round its kilns: the sheds are a later pass', ['workshop']);
  add({ key: 'et_tile_works', name: 'Tile works', wealth: MID, types: ['workshop'], lot: [24, 28], bodies: [tradeHex('hall', 5.2, 1, ['workshop'], { sh: 4 })] });
  add({ key: 'et_porcelain', name: 'Porcelain works', wealth: MID, types: ['workshop'], lot: [16, 10], bodies: [tradeRect('shed', 11, 7, 1, ['workshop'], { doorX: -2, sh: 3.6 })] });
  add({ key: 'et_paper_mill', name: 'Paper mill', wealth: MID, types: ['workshop'], lot: [16, 13], bodies: [tradeRect('mill', 12, 8, 2, [['workshop'], ['store']])] });
  add({ key: 'et_printer', name: 'Printer', wealth: MID, types: ['market/shop'].concat(SF), lot: [11, 11], bodies: [tradeRect('shop', 8, 7, 2, [['shop', 'workshop'], ['living', 'kitchen', 'bedroom']], { shop: true, roof: 'flat' })] });

  /* ---------------- THE LAND AND THE HARBOUR */
  add({ key: 'et_farmstead', name: 'Farmstead', wealth: POOR, types: SF.concat(['farm']), lot: [30, 28], bodies: [tradeHex('house', 4.6, 1, ['cottage'], { cx: -3, cz: -3 })],
    note: 'the farmhouse; the byre, the threshing floor and the fields are open' });
  skip('et_paddy', 'Paddies', 'open fields', ['farm']);
  add({ key: 'et_tea_garden', name: 'Tea garden', wealth: MID, types: ['farm'], lot: [26, 22], bodies: [tradeHex('drying', 3.4, 1, ['store'], { cx: 5, cz: -3.5 })] });
  add({ key: 'et_mine', name: 'Mine', wealth: POOR, types: ['workshop'], lot: [22, 18], bodies: [tradeRect('winding', 6, 5, 1, ['workshop'], { cx: 4, cz: -2, roof: 'pent' })] });
  skip('et_quarry', 'Quarry', 'an open cut', ['workshop']);
  add({ key: 'et_stock_pens', name: 'Stock pens', wealth: POOR, types: ['farm'], lot: [22, 18], bodies: [tradeRect('dairy', 5, 4, 1, ['store'], { cz: -4.5, G: 0.2 })] });
  for (const k of ['et_lock', 'et_reservoir_wall', 'et_spillway', 'et_fish_landing', 'et_lighthouse', 'et_canal', 'et_bridge', 'et_canal_street']) skip(k, k, 'hydraulics or an open structure', ['infrastructure']);
  add({ key: 'et_canal_landing', name: 'Canal landing', wealth: POOR, types: ['infrastructure'], lot: [12, 12], bodies: [tradeRect('kiosk', 3, 2.4, 1, ['store'], { cx: 3, cz: -4, G: 1.3, roof: 'pent' })] });
  add({ key: 'et_ferry_landing', name: 'Ferry landing', wealth: POOR, types: ['infrastructure'], lot: [12, 16], bodies: [tradeRect('booth', 3, 2.6, 1, ['store'], { cx: -2.8, cz: -4.5, G: 0.2 })] });
  add({ key: 'et_quay', name: 'Quay', wealth: MID, types: ['infrastructure'], lot: [32, 14], bodies: [tradeHex('watch', 2.2, 1, ['study'], { cx: -11, cz: -4, G: 2.35 })] });
  add({ key: 'et_dock', name: 'Dockyard', wealth: MID, types: ['workshop'], lot: [30, 26], bodies: [tradeRect('shed', 8, 12, 1, ['workshop'], { cx: -8, cz: -3 })] });
  add({ key: 'et_factory_quarter', name: 'Factory quarter', wealth: MID, types: ['civic'], lot: [42, 32],
    bodies: [tradeHex('westhouse', 5, 2, [['store'], ['store']], { cx: -10, cz: 4 }), tradeHex('easthouse', 5, 2, [['store'], ['store']], { cx: 10, cz: 4 }),
      tradeRect('hall', 14, 7, 1, ['hall', 'study'], { cz: -9 })],
    note: 'the two warehouses and the hall inside the wall' });
  IX.sets.add({ set: 'eternian', title: 'The Eternians (the Eternal State)', culture: 'eternian', items: L });
})(KratorInteriors);
