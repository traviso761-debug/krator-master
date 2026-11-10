/* ======================== Interior set: Xanadu (kits/xanadu) ========================
   The Sultanate of Xanadu's interiors (2026-11-09): one item per XA.def key (kits/xanadu/src/74-87c, registry keys xa_*,
   and the `_palopo` twins 88-xa-dress.js makes, `like` their base). Local frame = the builder's: origin at the plot centre on
   the ground, +z the front. Furniture culture: xanadu (kits/catalog/krator-master-furniture-xanadu.js; its chain eastabyss,
   generic: IX.CULTURE_FAMILY), the poor tier through generic. Wealth from the def's tag: poor 0.2, middle 0.5, rich 0.8, civic
   0.65. sets/README.md says how an item is written.
   The bodies are the builders' own wall blocks, read off the kit (every xnWall / vB block 2.2 m tall or more, per def: the
   2026-11-09 probe of dist/xanadu.html). A battered block (xnWall) leans in by the kit's xnBatterK and a stepped one sets
   back, so such a body is INSET (inset(): every storey planned on the footprint they all share, the doors moved onto it); the
   kit's pages draw its hollow walls 0.35 m thick on the blocks' faces (69e6), so their lean never reaches a room, and the
   strip of floor between is the wall's foot. The kit's pages draw these bodies hollow with the interiors on (kits/iziz-vernacular 69e6: a block matching a storey
   here). HELD (the owner, 2026-11-09): the citadel's defs (the Sultan's Palace, the Pleasure Dome of the Bay, the Grand Vizier's palace,
   the palace gate; the Garden Pleasure Dome's hold is lifted: its item is below; settlements/xanadu/citadel/BLUEPRINT.md) wait on the owner's visual references.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const r3 = function (v) { return Math.round(v * 1000) / 1000; };
  const POOR = 0.2, MID = 0.5, RICH = 0.8, CIVIC = 0.65;
  const SF = ['single-family dwelling'], MF = ['multi-family dwelling'];
  const HELD = 'held: the owner will send visual references (2026-11-09)';
  /* the kit's batter (72-xa-helpers.js xnBatterK): the top of a w x h x d block is k times its base */
  function batK(w, h, d) { const want = 1 - 2 * h * 0.088 / Math.min(w, d); return want > 0.94 ? 0.96 : want > 0.89 ? 0.92 : want > 0.83 ? 0.86 : 0.8; }
  /* a body planned INSIDE the builder's blocks (inset: kits/iziz-vernacular 69e6): every storey on the one footprint they all
     share (the top of a battered stack, the last stage of a stepped one), a 0.45 m wall; the doors drawn on the blocks' outer
     faces are moved in onto it, straight in from where they stand. P: [x0, x1, z0, z1] */
  function inset(P, id, o) {
    const w = r3(P[1] - P[0]), d = r3(P[3] - P[2]), cx = r3((P[0] + P[1]) / 2), cz = r3((P[2] + P[3]) / 2);
    const doors = (o.doors || []).map(function (D) {
      const x = D.at[0], z = D.at[1], ex = Math.min(Math.abs(x - P[0]), Math.abs(x - P[1])), ez = Math.min(Math.abs(z - P[2]), Math.abs(z - P[3]));
      const outX = x < P[0] || x > P[1], outZ = z < P[2] || z > P[3];
      const onX = outX && !outZ ? true : outZ && !outX ? false : ex < ez;
      const at = onX ? [x < cx ? P[0] : P[1], Math.max(P[2] + 0.6, Math.min(P[3] - 0.6, z))] : [Math.max(P[0] + 0.6, Math.min(P[1] - 0.6, x)), z < cz ? P[2] : P[3]];
      return Object.assign({}, D, { at: [r3(at[0]), r3(at[1])] });
    });
    return Object.assign({ id: id, poly: rect(w, d, cx, cz), y: o.y || 0, levels: o.hs.map(function (h) { return { h: h }; }), wall: o.wall == null ? 0.45 : o.wall,
      roof: o.roof || 'flat', doors: doors, program: o.program, inset: true }, o.windows === false ? { windows: false } : {});
  }
  /* a stack of battered storeys (xnStack, or xnWall blocks each on the last one's top) at (cx, cz), base w x d, storeys hs:
     planned on the top storey's top. o: {id, y, wall, roof, doors, program, flat: no batter (vB blocks), windows} */
  function stack(cx, cz, w, d, hs, o) {
    let ww = w, dd = d; if (!o.flat) hs.forEach(function (h) { const k = batK(ww, h, dd); ww *= k; dd *= k; });
    if (o.flat) return Object.assign({ id: o.id || 'house', poly: rect(w, d, cx, cz), y: o.y || 0, levels: hs.map(function (h) { return { h: h }; }),
      wall: o.wall == null ? 0.4 : o.wall, roof: o.roof || 'flat', doors: o.doors || [], program: o.program }, o.windows === false ? { windows: false } : {});
    return inset([cx - ww / 2, cx + ww / 2, cz - dd / 2, cz + dd / 2], o.id || 'house', Object.assign({}, o, { hs: hs }));
  }
  /* storeys that are separate blocks, each with its own base and centre ([[w, d, h, cx?, cz?], ...]): planned on the footprint
     every block holds (each battered block's top, unless o.flat) */
  function blocks(cx, cz, B, o) {
    const P = [-1e9, 1e9, -1e9, 1e9];
    B.forEach(function (b) { const k = o.flat ? 1 : batK(b[0], b[2], b[1]), x = b[3] == null ? cx : b[3], z = b[4] == null ? cz : b[4];
      P[0] = Math.max(P[0], x - b[0] * k / 2); P[1] = Math.min(P[1], x + b[0] * k / 2); P[2] = Math.max(P[2], z - b[1] * k / 2); P[3] = Math.min(P[3], z + b[1] * k / 2); });
    return inset(P, o.id || 'house', Object.assign({}, o, { hs: B.map(function (b) { return b[2]; }) }));
  }
  const L = [];
  const add = function (it) { L.push(Object.assign({ culture: 'xanadu' }, it)); return it; };
  const skip = function (key, name, types, why) { L.push({ key: key, name: name, types: types, skip: why }); };

  /* ================================================================ housing (74-xa-dwell.js) */
  add({ key: 'xa_poor_a', name: 'Earth farmhouse block', wealth: POOR, types: SF, lot: [18, 16],
    bodies: [stack(0, 0, 8.4, 7.2, [2.7, 2.6], { y: 0.5, doors: [{ at: [-1.6, 3.6], w: 1.4 }], program: [['living', 'store'], ['bedroom']] })],
    note: 'the earth block of two battered storeys; the upper door on the +x face (to the roof stair outside) is left to the plan\'s inner stair' });
  add({ key: 'xa_poor_b', name: 'Hill tenement row', wealth: POOR, types: MF, units: 3, lot: [20, 14],
    bodies: [stack(-5, 0, 5, 6.2, [2.5, 2.5], { id: 'unit1', y: 0.4, wall: 0.3, doors: [{ at: [-6.4, 3.1], w: 0.9 }], program: [['cottage'], ['bedroom']] }),
      stack(0, 0, 5, 6.6, [2.5, 2.5, 2.5], { id: 'unit2', y: 0.4, wall: 0.3, doors: [{ at: [-1.4, 3.3], w: 0.9 }], program: [['cottage'], ['bedroom'], ['store']] }),
      stack(5.2, 0, 5.4, 6.4, [2.5, 2.5], { id: 'unit3', y: 0.4, wall: 0.3, doors: [{ at: [3.6, 3.2], w: 0.9 }], program: [['cottage'], ['bedroom']] })],
    note: 'three narrow earth houses in a row, each its own body and household' });
  add({ key: 'xa_poor_c', name: 'Timber shack', wealth: POOR, types: SF, lot: [14, 13],
    bodies: [stack(0, 0, 6.4, 5.2, [2.5], { y: 0.6, flat: true, wall: 0.15, roof: 'gable', doors: [{ at: [-1.3, 2.6], w: 0.9 }], program: ['cottage'] })] });
  add({ key: 'xa_mid_a', name: 'Town house', wealth: MID, types: SF, lot: [14, 14],
    bodies: [stack(0, 0, 9.4, 8.8, [3.2, 3, 2.9], { y: 0.6, doors: [{ at: [-1.4, 4.4], w: 1.2 }], program: [['living', 'kitchen', 'store'], ['bedroom'], ['bedroom']] })] });
  add({ key: 'xa_mid_b', name: 'Courtyard house', wealth: MID, types: SF, lot: [19, 19],
    bodies: [stack(0, -3.4, 11, 7, [3.1, 3], { doors: [{ at: [0, 0.1], w: 1.3 }], program: [['living', 'kitchen'], ['bedroom', 'bedroom']] })],
    note: 'the house block at the back of its court; the court walls and the gate are left out' });
  add({ key: 'xa_mid_c', name: 'Tenement', wealth: MID, types: MF, units: 3, lot: [19, 16],
    bodies: [blocks(0, 0, [[13, 10, 3.6], [12.48, 9.6, 3], [11.98, 9.22, 3], [11.5, 8.85, 3]], { y: 0, doors: [{ at: [-6.5, -2], w: 1.1 }],
      program: [['shop', 'store'], ['living', 'bedroom'], ['living', 'bedroom'], ['living', 'bedroom']] })],
    note: 'a shop and three flats, each storey its own stepped block; the roof hut over the stair (2.8 m square) is left out' });
  add({ key: 'xa_rich_a', name: 'Manor', wealth: RICH, types: SF, lot: [26, 30],
    bodies: [stack(0, 0, 18, 13, [3.8, 3.6, 3.4], { y: 1.3, doors: [{ at: [0, 6.5], w: 1.6 }],
      program: [['hall', 'living', 'kitchen', 'store'], ['bedroom', 'bedroom', 'study', 'bath'], ['bedroom', 'bedroom', 'library']] })],
    note: 'the door stands in its porch 1.1 m out from the face; planned on the face' });
  add({ key: 'xa_rich_b', name: 'Hillside manor', wealth: RICH, types: SF, lot: [32, 26],
    bodies: [stack(5.5, 4.5, 11, 7, [3.4, 3], { id: 'lower', doors: [{ at: [3.5, 8], w: 1.4 }], program: [['hall', 'kitchen'], ['living', 'bedroom']] }),
      stack(-2, -6, 16, 10, [3.6, 3.4, 3.2], { id: 'upper', y: 3.2, doors: [{ at: [3, -1], w: 1.2 }], program: [['living', 'study', 'bath'], ['bedroom', 'bedroom'], ['bedroom', 'library']] })],
    note: 'the lower house on the street and the great house up the slope behind it; the great house\'s door onto the lower house\'s terrace is the plan\'s (the builder draws none: the kit cuts it, 69e6 vaPlanDoors); the roof pavilion is left out' });
  add({ key: 'xa_rich_c', name: "Merchant's konak", wealth: RICH, types: SF, lot: [32, 18],
    bodies: [blocks(0, 0, [[15, 11, 3.6], [15, 11, 3.4], [14.4, 10.56, 3.2]], { doors: [{ at: [0, 5.5], w: 1.4 }],
      program: [['hall', 'kitchen'], ['living', 'bedroom', 'study'], ['bedroom', 'bedroom', 'bath']] })],
    note: 'the builder draws its entrance under the cumba without a vnDoor: the plan\'s door is cut (69e6 vaPlanDoors)' });

  /* ================================================================ trade (75-xa-trade.js) */
  add({ key: 'xa_shops', name: 'Bazaar row', wealth: MID, types: ['market/shop', 'multi-family dwelling'], units: 1, lot: [22, 16],
    bodies: [{ id: 'row', poly: rect(15.6, 8), y: 0, wall: 0.4, roof: 'flat', levels: [{ h: 3.4, poly: rect(15.04, 7.44) }, { h: 2.9, poly: rect(15, 4.9, 0, -1.3) }],
      doors: [{ at: [-5.2, 4], w: 1.6 }, { at: [0, 4], w: 1.6 }, { at: [5.2, 4], w: 1.6 }], program: [['shop', 'shop', 'shop'], ['living', 'bedroom']] }],
    note: 'three open shop fronts (their counters on the street are the builder\'s); the shopkeepers\' flat over the back half' });
  add({ key: 'xa_workshop', name: 'Workshop', wealth: POOR, types: ['industry', 'market/shop'], lot: [22, 18],
    bodies: [stack(-4, -4, 10, 7, [3, 2.6], { doors: [{ at: [-2, -0.5], w: 1.1 }], program: [['workshop', 'shop'], ['store', 'study']] })],
    note: 'the shop and its loft; the yard\'s open sheds are left out' });
  skip('xa_smithy', 'Scrap smithy', ['industry'], 'a forge house open at the front between two piers (three rubble walls under a sheet roof): no enclosed room; the forge and anvil are the yard\'s furniture');

  /* ================================================================ farms and mills (76-xa-farm.js) */
  skip('xa_farm', 'Terraced fields', ['farm'], 'open terraced fields: nothing enclosed');
  add({ key: 'xa_farmhouse', name: 'Farmstead', wealth: POOR, types: ['farm', 'single-family dwelling'], lot: [30, 26],
    bodies: [stack(-5, -4, 11, 8, [2.9, 2.7], { y: 0.6, doors: [{ at: [-3.5, 0], w: 1.5 }], program: [['living', 'kitchen', 'store'], ['bedroom', 'bedroom']] }),
      stack(7, -6, 9, 5, [2.2], { id: 'byre', flat: true, wall: 0.45, doors: [{ at: [5, -3.5], w: 1.6 }, { at: [9, -3.5], w: 1.6 }], program: ['stable'] })],
    note: 'the farmhouse and the rubble byre beside it; the roof terrace with its fodder is left out' });
  add({ key: 'xa_granary', name: 'Granary', wealth: MID, types: ['farm'], lot: [16, 16],
    bodies: [stack(0, 0, 7, 9, [4.2], { y: 1.4, doors: [{ at: [0, 4.5], w: 1.1 }], program: ['store'], windows: false })] });
  add({ key: 'xa_windmill', name: 'Windmill (asbad)', wealth: MID, types: ['farm', 'industry'], lot: [20, 20],
    bodies: [stack(0, 0, 10, 8, [4.2], { y: 0.5, doors: [{ at: [-2.4, 4], w: 1.1 }], program: ['workshop', 'store'] })],
    note: 'the mill room under the two wind towers (the towers, open to the wind, are left out)' });
  skip('xa_pens', 'Stone pen', ['farm'], 'an open stone pen');
  skip('xa_corral', 'Corral (the dzo)', ['farm'], 'an open corral');
  add({ key: 'xa_dairy', name: 'Dairy', wealth: POOR, types: ['farm', 'industry'], lot: [10, 7],
    bodies: [stack(0, 0, 8, 5.6, [3.3], { y: 0.5, doors: [{ at: [-1.6, 2.8], w: 1 }], program: ['workshop', 'store'] })] });
  add({ key: 'xa_watermill', name: 'Watermill', wealth: MID, types: ['farm', 'industry'], lot: [20, 30],
    bodies: [stack(0, 0, 7, 8, [3.2], { y: 2.4, doors: [{ at: [1.5, 4], w: 1.1 }], program: ['workshop', 'store'] })],
    note: 'the mill room over the race (its wheel and the race are the builder\'s)' });

  /* ================================================================ sacred (77-xa-sacred.js, 83-xa-turk.js) */
  add({ key: 'xa_temple', name: 'Temple', wealth: CIVIC, types: ['religious'], lot: [34, 32],
    bodies: [blocks(0, 0, [[19, 14, 4.4], [18.24, 13.44, 3.8], [12, 8.5, 3.8]], { y: 1.2, doors: [{ at: [0, 7], w: 2.2 }],
      program: [['shrine', 'antechamber'], ['library', 'study'], ['shrine']] })],
    note: 'the assembly hall, the monks\' library storey and the upper shrine under the gilt roof' });
  add({ key: 'xa_monastery', name: 'Monastery', wealth: CIVIC, types: ['religious', 'multi-family dwelling'], units: 1, lot: [50, 50],
    bodies: [blocks(0, -10, [[16, 12, 4.2], [14.72, 11.04, 3.6], [10, 7.5, 3.6]], { id: 'hall', y: 4.5, doors: [{ at: [0, -4], w: 2 }],
      program: [['shrine', 'library'], ['study', 'store'], ['shrine']] }),
      stack(-13.5, 10, 13, 7, [2.8, 2.6], { id: 'cells_w', doors: [{ at: [-7, 6.77], w: 0.8 }, { at: [-7, 9.1], w: 0.8 }, { at: [-7, 11.43], w: 0.8 }], program: [['kitchen', 'bedroom', 'bedroom'], ['dormitory']] }),
      stack(13.5, 10, 13, 7, [2.8, 2.6], { id: 'cells_e', doors: [{ at: [7, 6.77], w: 0.8 }, { at: [7, 9.1], w: 0.8 }, { at: [7, 11.43], w: 0.8 }], program: [['bedroom', 'bedroom', 'store'], ['dormitory']] })],
    note: 'the History Monks\' assembly hall on its terrace and the two ranges of cells round the court; the gate house (9 x 4) is a passage' });
  add({ key: 'xa_grand_temple', name: 'Grand Temple', wealth: CIVIC, types: ['religious', 'civic'], lot: [60, 64],
    bodies: [blocks(0, -6, [[44, 26, 5.4], [42.24, 24.96, 4.8], [40.55, 23.96, 4.4]], { y: 7.2, doors: [{ at: [0, 7], w: 2.4 }],
      program: [['shrine', 'antechamber', 'antechamber'], ['library', 'study', 'store'], ['study', 'store']] })],
    note: 'the temple on its dressed platform (the 52 x 42 x 6 m plinth is solid): the hall, the library storey and the upper rooms; the crowning shrine (24 x 15) and the corner chortens are left out. Its door is 7.2 m up: the builder\'s flights are its way in' });
  add({ key: 'xa_temple_ortakoy', name: 'Temple after Ortaköy', wealth: CIVIC, types: ['religious'], lot: [60, 44],
    bodies: [stack(0, -2, 19, 19, [15], { id: 'domehall', doors: [{ at: [0, 7.5], w: 2.6 }], program: ['shrine'] }),
      stack(-16, 3, 16, 10, [8.6], { id: 'madrasa', doors: [{ at: [-12.8, 8], w: 1.6 }], program: ['school', 'library'] })],
    note: 'the domed prayer hall, one room 15 m high; the madrasa wing beside it, one tall storey' });

  /* ================================================================ the Sultan (78-xa-palace.js, 86-xa-vizier.js, 87c-xa-erewhon.js): HELD */
  /* the citadel's own hollow buildings (2026-11-09) are other defs, planned room by room in sets/xanadu-citadel.js (xa_cit_*); these are
     the kit's older solid pieces, kept for the sheet and other worlds */
  skip('xa_palace', "Sultan's Palace", ['civic', 'military', 'single-family dwelling'], 'the kit\'s solid palace; Erewhon\'s citadel stands on xa_cit_palace (sets/xanadu-citadel.js)');
  /* the Pleasure Dome (the owner's references, 2026-11-09: settlements/xanadu/citadel/refs/pleasure-dome/STYLE.md; the hold is
     lifted for this def only). The builder draws the palace itself, hollow (kits/xanadu/src/78c-xa-dome-plan.js is the plan,
     78d draws it: walls, floors, stairs, doors and core/walk), so the item is explicit rooms only: each furnished room of the
     blueprint's sheets E3 and E4 as the inner face of its largest rectangle, its doors where the plan cuts them (no leaf: the
     builder hangs its own). The Hall of Feasts is furnished inside its arcades, under the dome. The courts, the stair halls,
     the gallery, the checkered door and the great pool are left to the builder's own few objects. Regenerate the list from
     the plan when the plan's rooms or doors change. */
  add({ key: 'xa_pleasure_dome', name: 'Garden Pleasure Dome', wealth: 0.9, types: ['civic'], lot: [106, 112],
    rooms: [
      { id: 'hall', kind: 'hall', poly: rect(19, 19, 0, -20), y: 0.3, h: 7.5, level: 0, doors: [{ at: [-9.5, -14], w: 2.4, swing: 'none' }, { at: [9.5, -17], w: 1.5, swing: 'none' }, { at: [0, -10.5], w: 2.4, swing: 'none' }, { at: [0, -10.5], w: 2.4, swing: 'none' }, { at: [0, -29.5], w: 2.4, swing: 'none' }] },   // E3.4 The Dome: Hall of Feasts
      { id: 'music', kind: 'hall', poly: rect(12.36, 6.36, -13.5, -49.5), y: 0.3, h: 7.5, level: 0, doors: [{ at: [-7.32, -50], w: 1.3, swing: 'none' }, { at: [-15, -52.68], w: 1.1, swing: 'none' }] },   // E3.5 Hall of the Musicians
      { id: 'kitchen', kind: 'kitchen', poly: rect(12.36, 6.36, 13.5, -49.5), y: 0.3, h: 7.5, level: 0, doors: [{ at: [19.68, -50], w: 1.3, swing: 'none' }, { at: [7.32, -50], w: 1.3, swing: 'none' }] },   // E3.6 Harem Kitchens and Confectionery
      { id: 'treasury', kind: 'store', poly: rect(9.36, 3.36, -15, -55), y: 0.3, h: 7.5, level: 0, doors: [{ at: [-15, -53.32], w: 1.1, swing: 'none' }] },   // E3.20 Harem Treasury and Wardrobe
      { id: 'cage', kind: 'bedroom', poly: rect(30.36, 24.36, -35.5, -40.5), y: 0.3, h: 7.5, level: 0, doors: [{ at: [-20.32, -34], w: 1.5, swing: 'none' }, { at: [-38, -28.32], w: 1.5, swing: 'none' }] },   // E3.11 Cage of the Princes
      { id: 'valide', kind: 'bedroom', poly: rect(7.36, 27.36, -24, -14), y: 0.3, h: 7.5, level: 0, doors: [{ at: [-20.32, -14], w: 2.4, swing: 'none' }, { at: [-27.68, -14], w: 2.4, swing: 'none' }] },   // E3.10 Valide's Apartments
      { id: 'consorts', kind: 'bedroom', poly: rect(30.36, 17.36, -35.5, 9), y: 0.3, h: 7.5, level: 0, doors: [{ at: [-20.32, 10], w: 1.7, swing: 'none' }, { at: [-38, 0.32], w: 1.5, swing: 'none' }, { at: [-44, 17.68], w: 2.4, swing: 'none' }] },   // E3.8 Consorts' Apartments
      { id: 'hospital', kind: 'dormitory', poly: rect(30.36, 17.36, -35.5, 41), y: 0.3, h: 7.5, level: 0, doors: [{ at: [-20.32, 41], w: 1.7, swing: 'none' }, { at: [-44, 32.32], w: 2.4, swing: 'none' }] },   // E3.7 Hospital of the Harem
      { id: 'eunuchs', kind: 'dormitory', poly: rect(9.36, 27.36, 45, -39), y: 0.3, h: 7.5, level: 0, doors: [{ at: [40.32, -40], w: 1.3, swing: 'none' }] },   // E3.16 Eunuchs' Dormitory and the Chief Eunuch
      { id: 'school', kind: 'school', poly: rect(29.36, 14.36, 35, -17.5), y: 0.3, h: 7.5, level: 0, doors: [{ at: [20.32, -17], w: 1.5, swing: 'none' }, { at: [35, -10.32], w: 1.3, swing: 'none' }, { at: [30, -24.68], w: 1.3, swing: 'none' }] },   // E3.14 Harem School
      { id: 'concubines', kind: 'dormitory', poly: rect(29.36, 12.36, 35, -3.5), y: 0.3, h: 7.5, level: 0, doors: [{ at: [20.32, -4], w: 1.5, swing: 'none' }, { at: [35, -9.68], w: 1.3, swing: 'none' }, { at: [26, 2.68], w: 2.2, swing: 'none' }] },   // E3.13 Concubines' Dormitories
      { id: 'baths', kind: 'bath', poly: rect(28, 12, 35, 22), y: 0.3, h: 7.5, level: 0, doors: [{ at: [26, 16], w: 2.2, swing: 'none' }, { at: [35, 28], w: 2.4, swing: 'none' }] },   // E3.12 Baths of the Dome: warm and hot rooms
      { id: 'box', kind: 'hall', poly: rect(12.36, 6.36, -13.5, -49.5), y: 8.3, h: 6.5, level: 1, doors: [{ at: [-10.5, -46.32], w: 2.4, swing: 'none' }] },   // E4.3 Musicians' Box
      { id: 'stores', kind: 'store', poly: rect(12.36, 6.36, 13.5, -49.5), y: 8.3, h: 6.5, level: 1, doors: [{ at: [10.5, -46.32], w: 2.4, swing: 'none' }] },   // E4.4 Confectionery Stores
      { id: 'cageU', kind: 'bedroom', poly: rect(30.36, 24.36, -35.5, -40.5), y: 8.3, h: 6.5, level: 1, doors: [{ at: [-24, -28.32], w: 1.2, swing: 'none' }] },   // E4.8 Cage: upper apartments
      { id: 'valideU', kind: 'study', poly: rect(7.36, 27.36, -24, -14), y: 8.3, h: 6.5, level: 1, doors: [{ at: [-20.32, -14], w: 1.4, swing: 'none' }, { at: [-24, -27.68], w: 1.2, swing: 'none' }, { at: [-24, -0.32], w: 1.3, swing: 'none' }] },   // E4.7 Valide's Upper Rooms
      { id: 'favourites', kind: 'bedroom', poly: rect(30.36, 17.36, -35.5, 9), y: 8.3, h: 6.5, level: 1, doors: [{ at: [-24, 0.32], w: 1.3, swing: 'none' }] },   // E4.5 Favourites' Apartments
      { id: 'eunuchsU', kind: 'dormitory', poly: rect(9.36, 27.36, 45, -39), y: 8.3, h: 6.5, level: 1, doors: [{ at: [45, -25.32], w: 1.2, swing: 'none' }] },   // E4.12 Eunuchs (upper)
      { id: 'mistress', kind: 'study', poly: rect(29.36, 14.36, 35, -17.5), y: 8.3, h: 6.5, level: 1, doors: [{ at: [20.32, -17], w: 1.4, swing: 'none' }, { at: [35, -10.32], w: 1.3, swing: 'none' }, { at: [45, -24.68], w: 1.2, swing: 'none' }] },   // E4.11 Mistress of the Harem
      { id: 'concubinesU', kind: 'dormitory', poly: rect(29.36, 12.36, 35, -3.5), y: 8.3, h: 6.5, level: 1, doors: [{ at: [35, -9.68], w: 1.3, swing: 'none' }, { at: [47.5, 2.68], w: 1.4, swing: 'none' }] },   // E4.10 Concubines' Dormitories (upper)
      { id: 'rest', kind: 'living', poly: rect(29.36, 14.36, 35, 22.5), y: 8.3, h: 6.5, level: 1, doors: [{ at: [47.5, 15.32], w: 1.4, swing: 'none' }] },   // E4.9 Baths: rest rooms
    ],
    note: 'the harem palace of Erewhon\'s citadel (BLUEPRINT.md E3, E4), drawn hollow by its own builder in the black-and-white pattern system; the rooms here are for the furniture (FURNITURE.md), which is still the court set\'s own colours' });
  skip('xa_pleasure_dome_bay', 'Pleasure Dome of the Bay', ['civic'], 'one rotunda round a pool, drawn hollow by its own builder (kits/xanadu 78d xbayBuild): its few objects are the builder\'s, no catalog furniture');
  skip('xa_vizier', "Grand Vizier's palace", ['civic', 'single-family dwelling'], 'the kit\'s solid palace; Erewhon\'s citadel stands on xa_cit_vizier (sets/xanadu-citadel.js)');
  skip('xa_palace_gate', 'Palace gate', ['military', 'civic'], HELD);
  skip('xa_barge', "Sultan's pleasure barge", ['civic'], 'a barge: an open deck pavilion on the water');

  /* ================================================================ guilds (79-xa-guild.js, 87-xa-spicer.js) */
  const guild = function (key, name, w, d, hs, door, prog, note, extra) {
    add(Object.assign({ key: key, name: name, wealth: CIVIC, types: ['civic', 'industry'], bodies: [stack(0, 0, w, d, hs, { y: 0.8, doors: [{ at: door, w: 1.8 }], program: prog })], note: note }, extra || {}));
  };
  guild('xa_guild_farm', "Farmers' Guild", 16, 11, [3.6, 3.2], [0, 5.5], [['hall', 'study', 'store'], ['library', 'study']]);
  guild('xa_guild_mine', "Miners' Guild", 15, 11, [3.8, 3.4], [0, 5.5], [['hall', 'study', 'store'], ['library', 'study']]);
  guild('xa_guild_gold', "Goldsmiths' Guild", 14, 11, [4, 3.6], [0, 5.5], [['hall', 'workshop', 'store'], ['study', 'library']],
    'the hall and the workshop of the guild\'s masters; the dressed strong tower beside it (5 x 5 x 12) is left solid');
  guild('xa_guild_alch', "Alchemists' Guild", 12, 9, [3.6, 3.2], [0, 4.5], [['hall', 'workshop'], ['study', 'library']],
    'the guild house; the laboratory shed at -12 is left out');
  guild('xa_guild_mason', "Masons' Guild", 16, 11, [3.6, 3.2], [0, 5.5], [['hall', 'workshop'], ['study', 'library']]);
  skip('xa_generator', 'Generator', ['industry', 'infrastructure'], 'the turbine hall is open at the front round the machine (three rubble walls): no enclosed room');
  add({ key: 'xa_guild_spicer', name: "Spicers' Guild", wealth: CIVIC, types: ['civic', 'industry'], lot: [54, 40],
    bodies: [blocks(-9, 0, [[20, 14, 3.3, -9, 0], [17.6, 12.8, 3.3, -9, -0.6], [15.2, 11.6, 3.3, -9, -1.2], [12.8, 10.4, 3.3, -9, -1.8]], { id: 'tower', y: 1.3, flat: true,
      doors: [{ at: [-9, 7], w: 2.2 }], program: [['hall', 'shop', 'store'], ['study', 'store'], ['library', 'study'], ['study']] })],
    note: 'the stepped guild tower (each storey set back toward the back); its top stage and the spice market\'s open hall are left out' });

  /* ================================================================ military (80-xa-military.js, 87c-xa-erewhon.js) */
  add({ key: 'xa_barracks', name: 'Barracks', wealth: CIVIC, types: ['military', 'multi-family dwelling'], units: 1, lot: [36, 34],
    bodies: [stack(0, 0, 28, 10, [3.4, 3.2], { y: 0.7, doors: [{ at: [-10.5, 5], w: 1.2 }, { at: [-3.5, 5], w: 1.2 }, { at: [3.5, 5], w: 1.2 }, { at: [10.5, 5], w: 1.2 }],
      program: [['barracks', 'hall', 'kitchen', 'barracks'], ['barracks', 'barracks', 'store', 'barracks']] })],
    note: 'the garrison range: two barrack rooms, the mess and its kitchen below, four barrack rooms and the store above' });
  skip('xa_wall', 'City wall', ['military', 'infrastructure'], 'a curtain wall; its door at the wall-walk opens onto the walk, no room');
  skip('xa_gate', 'City gate', ['military', 'infrastructure'], 'the gate passage (5.4 m) runs through the gatehouse block; the guard chambers over it have no stair drawn');
  add({ key: 'xa_fortress', name: 'Fortress', wealth: CIVIC, types: ['military', 'civic'], lot: [62, 64],
    bodies: [blocks(0, -4, [[24, 17, 5.6], [23.04, 16.32, 5]], { id: 'keep', y: 4, doors: [{ at: [0, 4.5], w: 2 }],
      program: [['hall', 'barracks', 'store'], ['study', 'barracks', 'store']] }),
      stack(-14, -4, 6, 14, [3.2], { id: 'stores', y: 4, flat: true, doors: [{ at: [-11, -8], w: 1.4 }, { at: [-11, -4], w: 1.4 }], program: ['store', 'store'] })],
    note: 'the commandant\'s keep on the fortress terrace (4 m up: the builder\'s flights are the way in) and the three stores along its west side; the gate tower, the dressed watch tower and the keep\'s top stage are left out' });
  add({ key: 'xa_watch', name: 'City watch', wealth: CIVIC, types: ['military', 'civic'], lot: [26, 20],
    bodies: [stack(0, 0, 10, 10, [3.4, 3.2], { y: 0.9, doors: [{ at: [-1.5, 5], w: 1.4 }], program: [['hall', 'study', 'store'], ['barracks', 'study']] }),
      stack(-8.2, -1, 5.4, 7, [2.8], { id: 'lockup', flat: true, doors: [{ at: [-8.2, 2.5], w: 1 }], program: ['store'] })],
    note: 'the watch house and its lock-up (planned as a store: the catalog has no cell); the dressed watch tower is left solid' });
  skip('xa_muster', 'Mustering ground', ['military', 'civic'], 'an open parade ground');
  skip('xa_prison', 'The prison', ['military', 'civic'], 'cut into the rock face (xRockB blocks): the cells are not a body the builder draws; a carved-room plan (as zeijani.js writes them) is owed');

  /* ================================================================ public (81-xa-public.js, 84-xa-grandbath.js, 85-xa-water.js, 85b-xa-garden.js) */
  skip('xa_arena', 'Arena', ['civic'], 'an open bowl; the gate block is the arena\'s passage');
  add({ key: 'xa_amphitheatre', name: 'Amphitheatre', wealth: CIVIC, types: ['civic'], lot: [58, 46],
    bodies: [stack(-12.5, 8.5, 5, 7, [4.5], { id: 'green_w', flat: true, doors: [{ at: [-12.5, 5], w: 1.2 }], program: ['antechamber'] }),
      stack(12.5, 8.5, 5, 7, [4.5], { id: 'green_e', flat: true, doors: [{ at: [12.5, 5], w: 1.2 }], program: ['store'] })],
    note: 'the players\' rooms either side of the stage (a green room and the properties); the stage wall is 3.2 m deep, a facade' });
  add({ key: 'xa_bath', name: 'Public baths', wealth: CIVIC, types: ['civic', 'infrastructure'], lot: [34, 38],
    bodies: [stack(0, 0, 24, 16, [5.6], { y: 0.8, flat: true, doors: [{ at: [0, 8], w: 2 }], program: ['antechamber', 'bath', 'bath', 'bath'] }),
      stack(-6, -11, 7, 5, [3.4], { id: 'furnace', flat: true, doors: [{ at: [-6, -8.5], w: 1.4 }], program: ['workshop'] })],
    note: 'the bath hall (a hall of entry and three bath rooms) and the stoke room behind; the domes are the roof' });
  skip('xa_garden', 'Public garden', ['civic'], 'an open garden');
  skip('xa_hillside', 'Hillside quarter', ['multi-family dwelling', 'single-family dwelling'], 'a quarter of other defs (xnSub): each house is planned by its own item');
  skip('xa_grand_bath', 'Grand Baths', ['religious', 'infrastructure'], 'pools under open arcades and iwans: no wall block encloses a room (the 6 m tiled kiosk at the garden gate is a passage)');
  ['xa_rill', 'xa_rill_bend', 'xa_rill_cross', 'xa_rill_pool', 'xa_rill_fountain', 'xa_rill_garden', 'xa_rill_step', 'xa_rill_ramp', 'xa_rill_cascade', 'xa_rill_fall',
    'xa_rill_hill', 'xa_rill_tee', 'xa_rill_jets', 'xa_rill_weir', 'xa_star_court', 'xa_plunge_pool', 'xa_lily_pond', 'xa_cactus_court', 'xa_pergola', 'xa_brick_court',
    'xa_bath_pool', 'xa_gate_fall', 'xa_parterre'].forEach(function (k) { skip(k, k, ['infrastructure'], 'a water or garden tile: open'); });
  skip('xa_kiosk', 'Garden kiosk', ['infrastructure'], 'an open garden kiosk on columns');
  skip('xa_vault_pavilion', 'Painted-vault pavilion', ['infrastructure'], 'an open pavilion under a painted vault');

  /* ================================================================ the Turkish houses (83-xa-turk.js) */
  add({ key: 'xa_house_turk_a', name: 'Konak', wealth: MID, types: SF, lot: [22, 20],
    bodies: [stack(0, 0, 13, 10, [3.6, 3.4], { y: 0.6, flat: true, doors: [{ at: [-3.6, 5], w: 1.3 }], program: [['living', 'kitchen', 'store'], ['bedroom', 'bedroom', 'study']] })],
    note: 'stone ground storey, plastered timber upper storey; the upper door onto the cumba balcony is the builder\'s' });
  add({ key: 'xa_house_turk_b', name: 'Timber corner house', wealth: RICH, types: SF, lot: [20, 18],
    bodies: [stack(0, 0, 12, 11, [3.8, 3.4, 3.2], { y: 0.5, flat: true, doors: [{ at: [3.9, 5.5], w: 1.4 }], program: [['living', 'kitchen', 'store'], ['bedroom', 'bedroom'], ['study', 'bedroom']] })] });
  add({ key: 'xa_shop_turk_a', name: 'Turkish shop row', wealth: MID, types: ['market/shop', 'multi-family dwelling'], units: 1, lot: [24, 18],
    bodies: [stack(0, 0, 15, 9, [3.6, 3.2], { flat: true, doors: [{ at: [-5.9, 4.5], w: 0.95 }, { at: [-0.9, 4.5], w: 0.95 }, { at: [4.1, 4.5], w: 0.95 }],
      program: [['shop', 'shop', 'shop'], ['living', 'kitchen', 'bedroom']] })] });
  add({ key: 'xa_shop_turk_b', name: 'Corner café', wealth: MID, types: ['market/shop', 'tavern/inn'], lot: [20, 18],
    bodies: [stack(0, 0, 10, 9, [3.4, 3.2], { flat: true, doors: [{ at: [0.4, 4.5], w: 1 }], program: [['tavern', 'kitchen'], ['living', 'bedroom']] })] });
  skip('xa_lane', 'Lane of lights', ['infrastructure', 'market/shop'], 'a street with its lights: the shops along it are other defs');

  /* ================================================================ the Andean houses (87b-xa-andean.js) */
  add({ key: 'xa_andean_poor', name: 'Palopó shop-house', wealth: POOR, types: ['single-family dwelling', 'market/shop'], lot: [16, 14],
    bodies: [stack(0, 0, 8, 7, [3, 2.8], { y: 0.5, flat: true, wall: 0.3, doors: [{ at: [2.4, 3.5], w: 1 }], program: [['shop', 'kitchen'], ['living', 'bedroom']] })] });
  add({ key: 'xa_andean_mid', name: 'Cholet', wealth: MID, types: ['multi-family dwelling', 'market/shop'], units: 3, lot: [20, 16],
    bodies: [{ id: 'cholet', poly: rect(12, 10), y: 0.4, wall: 0.35, roof: 'flat',
      levels: [{ h: 3.2 }, { h: 3.2 }, { h: 3.2 }, { h: 3.2 }], doors: [{ at: [2.8, 5], w: 1.2 }],
      program: [['shop', 'store'], ['living', 'bedroom'], ['living', 'bedroom'], ['living', 'bedroom']] }],
    note: 'the shop and three flats; the owner\'s chalet on the roof (6.5 x 5.5, its door onto the roof) is left out: no stair fits up to it from the top flat' });
  add({ key: 'xa_andean_rich', name: 'Cholet palace', wealth: RICH, types: ['multi-family dwelling', 'tavern/inn'], units: 4, lot: [26, 20],
    bodies: [{ id: 'cholet', poly: rect(16, 13), y: 0.6, wall: 0.4, roof: 'flat',
      levels: [{ h: 3.3 }, { h: 3.3 }, { h: 3.3 }, { h: 3.3 }, { h: 3.3 }, { h: 3.3 }], doors: [{ at: [0, 6.5], w: 2 }],
      program: [['tavern', 'kitchen', 'store'], ['hall', 'living', 'store'], ['living', 'kitchen', 'bedroom', 'bedroom'], ['living', 'kitchen', 'bedroom', 'bedroom'],
        ['living', 'kitchen', 'bedroom', 'bedroom'], ['living', 'kitchen', 'bedroom', 'bedroom']] }],
    note: 'one 19.8 m block (the builder draws it whole): a ballroom tavern, a salon storey and four flats; the owner\'s chalet on the roof is left out (no stair fits up to it)' });

  /* ================================================================ Erewhon's pieces (87c-xa-erewhon.js) */
  skip('xa_quay', 'Quay', ['infrastructure', 'industry'], 'a stone quay');
  skip('xa_boatshed', 'Boat shed', ['industry'], 'an open shed on posts over the slip');
  add({ key: 'xa_warehouse', name: 'Warehouse', wealth: POOR, types: ['industry', 'market/shop'], lot: [30, 20],
    bodies: [stack(0, 0, 20, 12, [6], { y: 0.4, doors: [{ at: [-6.67, 6], w: 2.8 }, { at: [0, 6], w: 2.8 }, { at: [6.67, 6], w: 2.8 }], program: ['store', 'store', 'study'], windows: false })],
    note: 'one 6 m storey: two bays of goods and the factor\'s counting room' });
  skip('xa_lighthouse', 'Lighthouse', ['infrastructure', 'civic'], 'an octagonal tower drawn as one lathe body (xOctS), not a block the auto bodies hollow; its stair would be a newel in a 2.8 m shaft');
  skip('xa_teahouse', 'Teahouse', ['tavern/inn'], 'an open garden pavilion');
  skip('xa_ice_cave', 'The Caves of Ice', ['religious', 'infrastructure'], 'a cave');
  skip('xa_bridge', 'Street bridge', ['infrastructure'], 'a bridge');

  /* ================================================================ the Palopó repaints (88-xa-dress.js): the base's rooms */
  ['xa_poor_a', 'xa_poor_b', 'xa_poor_c', 'xa_mid_a', 'xa_mid_b', 'xa_mid_c', 'xa_rich_a', 'xa_rich_b', 'xa_rich_c', 'xa_shops', 'xa_bath', 'xa_temple',
    'xa_house_turk_a', 'xa_house_turk_b', 'xa_shop_turk_a', 'xa_shop_turk_b', 'xa_andean_mid', 'xa_andean_rich'].forEach(function (k) {
    const b = L.find(function (it) { return it.key === k; });
    L.push({ key: k + '_palopo', name: b.name + ' (Palopó paint)', like: k });
  });

  IX.sets.add({ set: 'xanadu', title: 'Xanadu: the Sultanate', culture: 'xanadu', items: L });
})(KratorInteriors);
