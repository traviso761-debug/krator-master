/* ======================== Interior set: Highlands (settlements/highlands) ========================
   The Republican, Rustic and Tribal kits' interiors: one item per HL.def key (settlements/highlands
   src/74-88, registry keys hl_rep_* hl_rus_* hl_tri_*, and the `_reclaimed` twins 88-hl-dress.js
   makes). Local frame = the builder's: origin at the plot centre on the ground, +z the front.
   Furniture cultures: republican, rustic, painted (the Painted Men's tribal branch). Wealth from the
   def's tag: poor 0.2, middle 0.5, rich 0.8, civic 0.65; a reclaimed twin one notch lower.
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect, circle = SH.circle;
  const r3 = function (v) { return Math.round(v * 1000) / 1000; };
  /* the builder's roof rise / half-span -> the planner's pitch in radians */
  const pt = function (r) { return Math.round(Math.atan(r) * 100) / 100; };
  /* a point of a sub-frame (ry, then moved to dx, dz): the builders' frame, x' = x cos + z sin, z' = -x sin + z cos */
  function turn(p, ry, dx, dz) {
    const c = Math.cos(ry || 0), s = Math.sin(ry || 0);
    return [r3((dx || 0) + p[0] * c + p[1] * s), r3((dz || 0) - p[0] * s + p[1] * c)];
  }
  /* a w x d box centred at (cx, cz) turned by ry (hnFachBox(x, y, z, w, h, d, ry)) */
  function rrect(w, d, cx, cz, ry) { return rect(w, d).map(function (p) { return turn(p, ry, cx, cz); }); }
  const POOR = 0.2, MID = 0.5, RICH = 0.8, CIVIC = 0.65;
  const SF = ['single-family dwelling'], MF = ['multi-family dwelling'];
  const L = [];
  const add = function (it) { L.push(it); return it; };
  const byKey = function (k) { for (let i = 0; i < L.length; i++) if (L[i].key === k) return L[i]; throw new Error('highlands set: no item ' + k); };
  /* another item's bodies and rooms placed inside a compound (hnSub(key, lx, ly, lz, lry)): moved to (dx, dz), turned
     by ry; y (when given) is the new floor height of every body and room (a tribal house hung on the cliff) */
  function place(key, dx, dz, ry, pre, y) {
    const src = byKey(key), T = function (p) { return turn(p, ry, dx, dz); };
    const D = function (d) { return Object.assign({}, d, { at: T(d.at) }); };
    return {
      bodies: (src.bodies || []).map(function (b) {
        return Object.assign({}, b, { id: pre + b.id, poly: b.poly.map(T), y: y == null ? b.y : y, doors: (b.doors || []).map(D),
          levels: Array.isArray(b.levels) ? b.levels.map(function (l) { return l.poly ? Object.assign({}, l, { poly: l.poly.map(T) }) : l; }) : b.levels });
      }),
      rooms: (src.rooms || []).map(function (r) {
        return Object.assign({}, r, { id: pre + r.id, poly: r.poly.map(T), y: y == null ? r.y : y, doors: (r.doors || []).map(D) });
      })
    };
  }
  function merge(parts) {
    const out = { bodies: [], rooms: [] };
    parts.forEach(function (p) { out.bodies = out.bodies.concat(p.bodies); out.rooms = out.rooms.concat(p.rooms); });
    return out;
  }

  /* ================================================================ REPUBLICAN — dwellings (74-rep-dwell.js) */
  add({ key: 'hl_rep_house_poor_a', name: 'Log izba', culture: 'republican', wealth: POOR, types: SF, lot: [13, 14],
    bodies: [{ id: 'izba', poly: rect(6.4, 6.8), y: 0.45, levels: [{ h: 2.7 }], wall: 0.3, roof: 'gable', pitch: pt(1.25),
      doors: [{ at: [3.2, 1.3], w: 0.95 }], program: ['cottage'] }],
    note: 'one log room under a steep gable, the door on the +x side off the porch; the attic (gable window) is loft space, not planned' });
  add({ key: 'hl_rep_house_poor_b', name: 'Two-room log house', culture: 'republican', wealth: POOR, types: MF, lot: [14, 9],
    bodies: [{ id: 'house', poly: rect(8.2, 5.4), y: 0.35, levels: [{ h: 2.6 }], wall: 0.3, roof: 'gable', pitch: pt(1.1),
      doors: [{ at: [-1.2, 2.7], w: 0.95 }], program: ['living', 'bedroom'] },
      { id: 'leanto', poly: rect(2.6, 4.8, 5.5, 0), y: 0, levels: [{ h: 2.2 }], wall: 0.12, roof: 'flat',
        doors: [{ at: [5.5, 2.4], w: 0.9 }], program: ['workshop'] }],
    note: 'one household in two rooms; the lean-to workshop on the +x side is board-walled with a salvage roof: planned as its own low body' });
  add({ key: 'hl_rep_house_poor_c', name: 'Bamboo row cottages', culture: 'republican', wealth: POOR, types: MF, units: 3, lot: [18, 12],
    bodies: [-3.8, 0, 3.8].map(function (x, i) {
      return { id: 'unit' + (i + 1), poly: rect(3.75, 5, x, 0), y: 0.42, levels: [{ h: 2.6 }], wall: 0.12, roof: 'gable', pitch: pt(0.95),
        doors: [{ at: [r3(x - 3.8 * 0.22), 2.5], w: 0.85 }], program: ['cottage'] };
    }),
    note: 'three one-room cottages under one roof, each its own body (the party walls); the bamboo lean-to store at the -x end is left out' });
  add({ key: 'hl_rep_house_mid_a', name: 'Saxon townhouse', culture: 'republican', wealth: MID, types: SF, lot: [9, 13],
    bodies: [{ id: 'house', poly: rect(8, 11), y: 0.7, levels: [{ h: 3.3 }, { h: 2.9 }], wall: 0.3, roof: 'gable', pitch: pt(1.55),
      doors: [{ at: [1.6, 5.5], w: 1.6 }], program: [['living', 'kitchen', 'store'], ['bedroom', 'bedroom']] }],
    note: 'the carriage gate is the street door; the jettied upper storey (0.35 m oversail) is planned on the ground footprint; the storage attic is left out' });
  add({ key: 'hl_rep_house_mid_b', name: "Merchant's log house", culture: 'republican', wealth: MID, types: SF, lot: [15, 14],
    bodies: [{ id: 'house', poly: rect(10, 8), y: 2.6, levels: [{ h: 3 }], wall: 0.3, roof: 'gable', pitch: pt(1.0),
      doors: [{ at: [5, 0.4], w: 1 }], program: ['living', 'kitchen', 'bedroom'] }],
    note: 'the log house on its stone storey, entered from the kryltso landing on the +x end; the storerooms below (podklet) have windows but no door drawn and are left out' });
  add({ key: 'hl_rep_house_mid_c', name: 'Arcaded tenement', culture: 'republican', wealth: MID, types: MF, units: 2, lot: [19, 13],
    bodies: [{ id: 'tenement', poly: rect(14, 10), y: 0, wall: 0.35, roof: 'gable', pitch: pt(1.45),
      levels: [{ h: 3.6, poly: rect(14, 7.3, 0, -1.35) }, { h: 3.2 }, { h: 2.9 }],
      doors: [{ at: [-6.05, 2.3], w: 1 }, { at: [-2.55, 2.3], w: 1 }, { at: [0.95, 2.3], w: 1 }, { at: [4.45, 2.3], w: 1 }, { at: [-1.75, -5], w: 1 }, { at: [5.25, -5], w: 1 }],
      program: [['shop', 'shop', 'shop', 'shop'], ['living', 'kitchen', 'bedroom', 'bedroom'], ['living', 'kitchen', 'bedroom', 'bedroom']] }],
    note: 'four shops behind the arcade (the Laube, open), a flat on each upper floor (the jettied top floor planned on the footprint below); the plan stairs the flats inside, the builder serves them from the stair tower at +x (left out); the dormer attic is left out' });
  add({ key: 'hl_rep_house_rich_a', name: 'Peles villa', culture: 'republican', wealth: RICH, types: SF, lot: [22, 20],
    bodies: [{ id: 'villa', poly: rect(16, 11), y: 1.2, levels: [{ h: 3.8 }, { h: 3.2 }], wall: 0.35, roof: 'gable', pitch: pt(1.3),
      doors: [{ at: [0, 5.5], w: 1.5 }], program: [['hall', 'living', 'kitchen', 'store'], ['bedroom', 'bedroom', 'study', 'bedroom']] }],
    note: 'the oriel bay, the corner loggia tower and the porch are left out' });
  add({ key: 'hl_rep_house_rich_b', name: 'Terem mansion', culture: 'republican', wealth: RICH, types: SF, lot: [28, 24],
    bodies: [{ id: 'hall', poly: rect(10, 8, 0, -1), y: 2.2, levels: [{ h: 3.6 }], wall: 0.3, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [0, 3], w: 1.3 }], program: ['hall', 'kitchen', 'store'] },
      { id: 'chambers', poly: rect(5.5, 7.2, -7.75, -0.6), y: 2.2, levels: [{ h: 3.1 }, { h: 3 }], wall: 0.3, roof: 'gable', pitch: pt(1.55),
        doors: [{ at: [-5, 0.4], w: 0.9 }], program: [['bedroom', 'bedroom'], ['bedroom', 'study']] },
      { id: 'tower', poly: rect(4.2, 4.2, 7.1, 1.6), y: 2.2, levels: [{ h: 3 }], wall: 0.3, roof: 'hip', pitch: pt(1.5),
        doors: [{ at: [5, 1], w: 0.9 }], program: ['study'] }],
    note: 'three log volumes on the white podklet (not planned: no door): the keel-roofed hall up the kryltso, the two-storey chamber wing (trimmed 0.3 m where its block runs into the hall; a door assumed in the shared wall), the tower ground room (its upper storey and lantern left out)' });
  add({ key: 'hl_rep_house_rich_c', name: 'Patrician house', culture: 'republican', wealth: RICH, types: SF, lot: [22, 30],
    bodies: [{ id: 'house', poly: rect(16, 12), y: 0, levels: [{ h: 3.9 }, { h: 3.3 }, { h: 3.3 }], wall: 0.4, roof: 'gable', pitch: pt(1.7),
      doors: [{ at: [1.2, 6], w: 1.2 }, { at: [4.6, 6], w: 2.4 }],
      program: [['hall', 'kitchen', 'store', 'store'], ['living', 'study', 'bedroom'], ['bedroom', 'bedroom', 'bedroom']] }],
    note: 'the door and the carriage gate on the street; the eyelid-dormer roof, the corner oriel and the courtyard coach shed (no door) are left out' });

  /* ================================================================ REPUBLICAN — trade (75-rep-trade.js) */
  add({ key: 'hl_rep_tavern_a', name: 'Beer hall', culture: 'republican', wealth: MID, types: ['tavern/inn'], lot: [18, 34],
    bodies: [{ id: 'hall', poly: rect(11, 20, 0, -5), y: 0.6, levels: [{ h: 3.8 }], wall: 0.3, roof: 'gable', pitch: pt(1.35),
      doors: [{ at: [0, 5], w: 1.9 }], program: ['tavern', 'kitchen', 'store'] }],
    note: 'the long log hall; the loft behind the gable balcony is left out (no stair drawn)' });
  add({ key: 'hl_rep_tavern_b', name: 'Saxon tavern', culture: 'republican', wealth: MID, types: ['tavern/inn'], lot: [22, 14],
    bodies: [{ id: 'tavern', poly: rect(12, 9, -4, 0), y: 0.5, levels: [{ h: 3.2 }, { h: 2.9 }], wall: 0.3, roof: 'gable', pitch: pt(1.35),
      doors: [{ at: [-4, 4.5], w: 1.3 }], program: [['tavern', 'kitchen', 'store'], ['bedroom', 'bedroom', 'bedroom']] }],
    note: 'the jettied upper floor planned on the ground footprint; the beer garden is open' });
  add({ key: 'hl_rep_tavern_c', name: 'Traktir', culture: 'republican', wealth: MID, types: ['tavern/inn'], lot: [18, 24],
    bodies: [{ id: 'traktir', poly: rect(10, 10, 0, -2.5), y: 0.45, levels: [{ h: 2.9 }, { h: 3 }], wall: 0.3, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [-2.6, 2.5], w: 1.1 }], program: [['tavern', 'kitchen', 'store'], ['bedroom', 'bedroom', 'bedroom']] }],
    note: 'the tea room below, the rooms above (their gallery doors and the kryltso are outside; the plan stairs them inside)' });
  add({ key: 'hl_rep_inn', name: 'Coaching inn', culture: 'republican', wealth: RICH, types: ['tavern/inn'], lot: [28, 30],
    bodies: [{ id: 'front_e', poly: rect(10.8, 8, 7.6, 8), y: 0.4, levels: [{ h: 3.4 }, { h: 3 }, { h: 2.9 }], wall: 0.35, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [10.6, 12], w: 1.3 }], program: [['tavern', 'kitchen'], ['bedroom', 'bedroom', 'bedroom'], ['bedroom', 'bedroom', 'bedroom']] },
      { id: 'front_w', poly: rect(10.8, 8, -7.6, 8), y: 0.4, levels: [{ h: 3.4 }, { h: 3 }, { h: 2.9 }], wall: 0.35, roof: 'gable', pitch: pt(1.2),
        doors: [{ at: [-2.2, 8], w: 1 }], program: [['hall', 'store'], ['bedroom', 'bedroom', 'bedroom'], ['bedroom', 'bedroom', 'bedroom']] },
      { id: 'wing_e', poly: rect(6, 16, 10, -4), y: 0.4, levels: [{ h: 3.4 }, { h: 3 }, { h: 3 }], wall: 0.3, roof: 'gable', pitch: pt(1.2),
        doors: [{ at: [7, -4.5], w: 1 }, { at: [7, 0.5], w: 1 }], program: [['hall', 'store'], ['bedroom', 'bedroom', 'bedroom'], ['bedroom', 'bedroom', 'bedroom']] },
      { id: 'wing_w', poly: rect(6, 16, -10, -4), y: 0.4, levels: [{ h: 3.4 }, { h: 3 }, { h: 3 }], wall: 0.3, roof: 'gable', pitch: pt(1.2),
        doors: [{ at: [-7, -4.5], w: 1 }, { at: [-7, 0.5], w: 1 }], program: [['kitchen', 'store'], ['bedroom', 'bedroom', 'bedroom'], ['bedroom', 'bedroom', 'bedroom']] },
      { id: 'stable', poly: rect(14, 6, 0, -9), y: 0, levels: [{ h: 3.6 }], wall: 0.35, roof: 'gable', pitch: pt(1.1),
        doors: [{ at: [0, -6], w: 1.4 }], program: ['stable', 'stable'] }],
    note: 'the front range either side of the carriage passage (its upper storeys run over the passage: planned per side, the west side entered from the passage, a door assumed), the two galleried wings (their gallery doors upstairs are outside; the plan stairs them inside), the stable range (hay loft left out)' });
  add({ key: 'hl_rep_shops', name: 'Shop row', culture: 'republican', wealth: MID, types: ['market/shop'], lot: [17, 14],
    bodies: [-4.8, 0, 4.8].map(function (x, i) {
      return { id: 'shop' + (i + 1), poly: rect(4.76, 9, x, 0), y: 0, levels: [{ h: 3.2 }, { h: 2.8 }], wall: 0.3, roof: 'gable', pitch: pt(1.45),
        doors: [{ at: [r3(x + 1.6), 4.5], w: 0.9 }], program: [['shop'], ['cottage']] };
    }),
    note: 'three narrow fronts (4.2 m inside, the stair along one side leaves no room for a second room per floor): each a shop with its family\'s one room above; the shutter counter is the shop window; lofts left out' });
  add({ key: 'hl_rep_market_hall', name: 'Market hall', culture: 'republican', wealth: RICH, types: ['market/shop', 'civic'], lot: [24, 16],
    bodies: [{ id: 'council', poly: rect(18, 12.2), y: 4.4, levels: [{ h: 3.4 }], wall: 0.25, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [-9, -4.4], w: 1.1 }], program: ['hall', 'antechamber', 'study'] }],
    note: 'the council hall over the arcade, up the outside stair at the -x end; the market under the arches is open on four sides (stalls, not rooms)' });
  add({ key: 'hl_rep_workshop_a', name: "Wheelwright's workshop", culture: 'republican', wealth: MID, types: ['industry'], lot: [20, 18],
    bodies: [{ id: 'shop', poly: rect(12, 4, 0, -2), y: 0.25, levels: [{ h: 3.3 }], wall: 0.3, roof: 'gable', pitch: pt(0.95),
      doors: [{ at: [-2, 0], w: 1 }], program: ['workshop', 'store'] }],
    note: 'the closed back half; the front half is open on posts under the same roof (the work floor, not a room)' });
  add({ key: 'hl_rep_workshop_b', name: 'Brewery and cooperage', culture: 'republican', wealth: MID, types: ['industry'], lot: [26, 20],
    bodies: [{ id: 'brewhouse', poly: rect(12, 9, -2, 0), y: 0, levels: [{ h: 3.6 }, { h: 2.6 }], wall: 0.4, roof: 'gable', pitch: pt(1.1),
      doors: [{ at: [-3.2, 4.5], w: 2.2 }], program: [['workshop', 'store'], ['store', 'store']] },
      { id: 'kiln', poly: rect(4.4, 4.4, 6.6, -0.8), y: 0, levels: [{ h: 3.2 }], wall: 0.35, roof: 'hip', pitch: pt(2.2),
        doors: [{ at: [6.6, 1.4], w: 1 }], program: ['workshop'] }],
    note: 'the brewhouse with its log loft and the malt kiln tower (its upper kiln floor left out); the copper shed and the cooper\'s yard are open' });
  add({ key: 'hl_rep_smithy_small', name: 'Scrap smithy (small)', types: ['industry'], lot: [14, 10],
    skip: 'open forge shed on posts: only a low rubble-and-plate back wall, nothing enclosed' });
  add({ key: 'hl_rep_smithy_large', name: 'Scrap smithy (large)', culture: 'republican', wealth: MID, types: ['industry'], lot: [30, 18],
    bodies: [{ id: 'forge', poly: rect(16, 10, -3, 0), y: 0, levels: [{ h: 4.4 }], wall: 0.45, roof: 'gable', pitch: pt(0.85),
      doors: [{ at: [-7, 5], w: 3 }, { at: [1, 5], w: 3 }], program: ['smithy', 'smithy', 'store'] }],
    note: 'the forge hall: walled at the back and ends, its front open to the yard on posts (planned as a wall with two wide openings); the bellows shed (open side) and the scrap yard are left out' });
  add({ key: 'hl_rep_stables', name: 'Caravanserai', culture: 'republican', wealth: MID, types: ['infrastructure', 'tavern/inn'], lot: [31, 32],
    bodies: [{ id: 'stable', poly: rect(28.8, 5.4, 0, -9), y: 0, levels: [{ h: 2.8 }, { h: 2.6 }], wall: 0.4, roof: 'gable', pitch: pt(1.1),
      doors: [{ at: [-11, -6.3], w: 1.4 }, { at: [-2.2, -6.3], w: 1.4 }, { at: [6.6, -6.3], w: 1.4 }], program: [['stable', 'stable', 'store'], ['dormitory', 'store']] }],
    note: 'the stable and hay-loft range across the back (the loft as the drovers\' sleeping floor and hay store); the stall ranges are lean-tos open to the court, the gate tower chamber has no stair' });
  add({ key: 'hl_rep_warehouse_a', name: 'Log warehouse', culture: 'republican', wealth: MID, types: ['industry'], lot: [12, 30],
    bodies: [{ id: 'warehouse', poly: rect(10, 16), y: 1.4, levels: [{ h: 3 }, { h: 3 }], wall: 0.3, roof: 'gable', pitch: pt(1.3),
      doors: [{ at: [0, 8], w: 1.6 }], program: [['store', 'store', 'study'], ['store', 'store']] }],
    note: 'two log storeys on the stone base; the loft under the hoist gable is left out' });
  add({ key: 'hl_rep_warehouse_b', name: 'Stone-and-iron warehouse', culture: 'republican', wealth: MID, types: ['industry', 'market/shop'], lot: [22, 26],
    bodies: [{ id: 'warehouse', poly: rect(20, 12), y: 1.2, levels: [{ h: 4.8 }], wall: 0.5, roof: 'gable', pitch: pt(0.6),
      doors: [{ at: [-2.5, 6], w: 3 }, { at: [2.5, 6], w: 3 }], program: ['store', 'shop', 'store'] }],
    note: 'one tall floor at dock height behind the plate doors' });

  /* ================================================================ REPUBLICAN — civic (76-rep-civic.js, 76c-rep-capital.js) */
  add({ key: 'hl_rep_temple', name: 'Temple of the Pantheon', culture: 'republican', wealth: CIVIC, types: ['religious'], lot: [48, 48],
    bodies: [{ id: 'nave', poly: rect(32, 24), y: 1.4, levels: [{ h: 5.5 }], wall: 0.6, roof: 'hip', pitch: pt(0.6),
      doors: [{ at: [-9.5, 12], w: 1.8 }, { at: [9.5, 12], w: 1.8 }], program: ['shrine', 'antechamber', 'study', 'store'] },
      { id: 'sanctum', poly: rect(24, 17), y: 6.9, levels: [{ h: 4.6 }], wall: 0.6, roof: 'hip', pitch: pt(0.6),
        doors: [{ at: [0, 8.5], w: 2 }], program: ['shrine'] }],
    note: 'the two lower ashlar tiers: the first entered by the side doors under the gallery, the second up the grand stair; the top tier (no door) and the drum and domes are left out' });
  add({ key: 'hl_rep_town_hall', name: 'Town hall', culture: 'republican', wealth: CIVIC, types: ['civic'], lot: [32, 34],
    bodies: [{ id: 'hall', poly: rect(22, 13, -4, 0), y: 0.9, levels: [{ h: 4.2 }, { h: 3.8 }], wall: 0.4, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [-4, 6.5], w: 1.8 }], program: [['antechamber', 'hall', 'study', 'store'], ['hall', 'study', 'library']] }],
    note: 'the clocktower is an open arched base and a timber belfry hung with bells (a ladder, no floor): left out' });
  add({ key: 'hl_rep_hospital', name: 'Hospital', culture: 'republican', wealth: CIVIC, types: ['civic'], lot: [38, 34],
    bodies: [{ id: 'back', poly: rect(36, 8, 0, -12), y: 0.6, levels: [{ h: 3.6 }, { h: 3.2 }], wall: 0.35, roof: 'gable', pitch: pt(1.1),
      doors: [{ at: [0, -8], w: 1.3 }], program: [['hall', 'kitchen', 'study', 'store'], ['dormitory', 'dormitory', 'dormitory']] },
      { id: 'wing_e', poly: rect(8, 18, 14, 1), y: 0.6, levels: [{ h: 3.6 }, { h: 3.2 }], wall: 0.35, roof: 'gable', pitch: pt(1.1),
        doors: [{ at: [10, 6.3], w: 1.3 }], program: [['dormitory', 'dormitory'], ['dormitory', 'dormitory']] },
      { id: 'wing_w', poly: rect(8, 18, -14, 1), y: 0.6, levels: [{ h: 3.6 }, { h: 3.2 }], wall: 0.35, roof: 'gable', pitch: pt(1.1),
        doors: [{ at: [-10, 6.3], w: 1.3 }], program: [['dormitory', 'dormitory'], ['dormitory', 'dormitory']] },
      { id: 'chapel', poly: rect(7, 7, 0, 10.2), y: 0.6, levels: [{ h: 5 }], wall: 0.35, roof: 'hip', pitch: pt(1),
        doors: [{ at: [0, 13.7], w: 1.8 }], program: ['shrine'] }],
    note: 'the ward wings round the garden (wards as dormitories) and the chapel pavilion; the back range draws no door: one is assumed on the court' });
  add({ key: 'hl_rep_watch', name: 'City watch', culture: 'republican', wealth: CIVIC, types: ['civic', 'military'], lot: [24, 18],
    bodies: [{ id: 'watchhouse', poly: rect(13, 9, 2.5, 0), y: 0.25, levels: [{ h: 3.5 }, { h: 3.2 }], wall: 0.4, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [2.5, 4.5], w: 1.8 }], program: [['antechamber', 'study', 'store'], ['barracks', 'barracks']] },
      { id: 'tower', poly: rect(4, 4, -7, -1), y: 1.2, levels: [{ h: 3 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [-7, 1], w: 1 }], program: ['store'] }],
    note: 'the stone ground floor (cells and the duty room) and the log watch room above; the lookout tower\'s ground room only (the shaft above is climbed by ladder)' });
  add({ key: 'hl_rep_theater', name: 'Theatre', culture: 'republican', wealth: CIVIC, types: ['civic'], lot: [32, 34],
    bodies: [{ id: 'stagehouse', poly: rect(11, 8, 0, -11.5), y: 1.4, levels: [{ h: 3.6 }, { h: 3.4 }], wall: 0.4, roof: 'hip', pitch: pt(1.3),
      doors: [{ at: [0, -7.5], w: 2.4 }], program: [['workshop', 'store'], ['study', 'store']] }],
    note: 'the stage house behind the stage (scene shop and dressing rooms); the galleried sixteen-sided drum is a ring of open galleries round a yard open to the sky: an annulus, no room outline' });
  add({ key: 'hl_rep_school', name: 'Schoolhouse', culture: 'republican', wealth: CIVIC, types: ['civic'], lot: [26, 21],
    bodies: [{ id: 'school', poly: rect(16, 8, 0, -2), y: 0.7, levels: [{ h: 3.4 }], wall: 0.3, roof: 'gable', pitch: pt(1.1),
      doors: [{ at: [0, 2], w: 1.1 }], program: ['school', 'school', 'study'] }] });
  add({ key: 'hl_rep_barracks', name: 'Barracks', culture: 'republican', wealth: CIVIC, types: ['military'], lot: [42, 38],
    bodies: [{ id: 'back', poly: rect(40, 8, 0, -15), y: 0, levels: [{ h: 3.4 }, { h: 3 }], wall: 0.45, roof: 'gable', pitch: pt(1.1),
      doors: [{ at: [0, -11], w: 1.6 }], program: [['hall', 'kitchen', 'store', 'barracks'], ['barracks', 'barracks', 'barracks']] },
      { id: 'east', poly: rect(8, 25, 16, 1.5), y: 0, levels: [{ h: 3.4 }, { h: 3 }], wall: 0.45, roof: 'gable', pitch: pt(1.1),
        doors: [{ at: [12, -5.8], w: 1.4 }, { at: [12, 8.8], w: 1.4 }], program: [['barracks', 'barracks', 'store'], ['barracks', 'barracks']] },
      { id: 'west', poly: rect(8, 25, -16, 1.5), y: 0, levels: [{ h: 3.4 }, { h: 3 }], wall: 0.45, roof: 'gable', pitch: pt(1.1),
        doors: [{ at: [-12, -5.8], w: 1.4 }, { at: [-12, 8.8], w: 1.4 }], program: [['barracks', 'barracks', 'store'], ['barracks', 'barracks']] },
      { id: 'armoury', poly: rect(8, 5, 7, -4), y: 0, levels: [{ h: 3.4 }], wall: 0.45, roof: 'hip', pitch: pt(1),
        doors: [{ at: [3, -4], w: 1.6 }], program: ['store'] }],
    note: 'the three blocks round the drill yard and the armoury (its iron door on the -x face); the gatehouse guard room over the arch has no stair drawn' });
  add({ key: 'hl_rep_muster', name: 'Mustering ground', types: ['military'], lot: [52, 34],
    skip: 'open drill field inside a low wall; the tribune is an open stand on posts' });
  add({ key: 'hl_rep_arsenal', name: 'Arsenal of the Republic', culture: 'republican', wealth: CIVIC, types: ['military', 'industry'], lot: [48, 44],
    bodies: [{ id: 'front_w', poly: rect(18.5, 8, -13.75, 13), y: 0.5, levels: [{ h: 4.2 }, { h: 3.2 }], wall: 0.45, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [-4.5, 11], w: 1.2 }], program: [['barracks', 'barracks', 'store'], ['barracks', 'barracks']] },
      { id: 'front_e', poly: rect(18.5, 8, 13.75, 13), y: 0.5, levels: [{ h: 4.2 }, { h: 3.2 }], wall: 0.45, roof: 'gable', pitch: pt(1.2),
        doors: [{ at: [4.5, 11], w: 1.2 }], program: [['antechamber', 'study', 'store'], ['barracks', 'library']] },
      { id: 'side_w', poly: rect(8, 22, -19, -2), y: 0.5, levels: [{ h: 4.2 }, { h: 3 }], wall: 0.45, roof: 'gable', pitch: pt(1.2),
        doors: [{ at: [-15, -2], w: 1.6 }], program: [['workshop', 'store', 'store'], ['barracks', 'barracks']] },
      { id: 'side_e', poly: rect(8, 22, 19, -2), y: 0.5, levels: [{ h: 4.2 }, { h: 3 }], wall: 0.45, roof: 'gable', pitch: pt(1.2),
        doors: [{ at: [15, -2], w: 1.6 }], program: [['workshop', 'store', 'store'], ['barracks', 'barracks']] }],
    note: 'the front range either side of the gate tower and the two side ranges; the builder draws no doors on them: doors are assumed off the gate passage and on the court. The turf-vaulted magazine is left out' });
  add({ key: 'hl_rep_mint', name: 'Mint and Treasury', culture: 'republican', wealth: CIVIC, types: ['civic'], lot: [34, 20],
    bodies: [{ id: 'mint', poly: rect(24, 16), y: 1, levels: [{ h: 4.6 }, { h: 3.6 }], wall: 0.45, roof: 'gable', pitch: pt(1.1),
      doors: [{ at: [0, 8], w: 2 }], program: [['antechamber', 'hall', 'workshop', 'store'], ['study', 'library', 'study']] },
      { id: 'strongroom', poly: rect(6, 7, 15, -2), y: 0, levels: [{ h: 4 }], wall: 0.6, roof: 'hip', pitch: pt(0.45),
        doors: [{ at: [18, -2], w: 1.2 }], program: ['store'] }],
    note: 'the strongroom annex behind its round steel door on the +x face' });
  add({ key: 'hl_rep_guild_rocket', name: "Rocketeers' Guild", culture: 'republican', wealth: CIVIC, types: ['guild'], lot: [26, 14],
    bodies: [{ id: 'guildhall', poly: rect(14, 10, -4, 0), y: 0.8, levels: [{ h: 3.8 }, { h: 3.2 }], wall: 0.4, roof: 'gable', pitch: pt(1.3),
      doors: [{ at: [-4, 5], w: 1.8 }], program: [['hall', 'study', 'store'], ['library', 'workshop', 'study']] }],
    note: 'the test tower is an open timber frame round the rocket: left out' });

  /* ================================================================ REPUBLICAN — guilds (77-rep-guild.js, 77b-rep-guild2.js) */
  add({ key: 'hl_rep_guild_merc', name: 'Mercenary Guild', culture: 'republican', wealth: CIVIC, types: ['civic'], lot: [30, 24],
    bodies: [{ id: 'guildhall', poly: rect(18, 11, -4, -3), y: 0.3, levels: [{ h: 4 }, { h: 3.8 }], wall: 0.45, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [-4, 2.5], w: 2 }], program: [['hall', 'antechamber', 'store'], ['barracks', 'study', 'store']] }],
    note: 'the walled yard and its gate are open' });
  add({ key: 'hl_rep_guild_alch', name: "Alchemists' Guild", culture: 'republican', wealth: CIVIC, types: ['civic', 'industry'], lot: [52, 34],
    bodies: [{ id: 'laboratory', poly: rect(20, 10, -12, 3), y: 0.6, levels: [{ h: 5 }], wall: 0.4, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [-12, 8], w: 2 }], program: ['workshop', 'workshop', 'study', 'store'] }],
    note: 'the laboratory hall; the earth-bermed magazines and the blast hut are left out' });
  add({ key: 'hl_rep_guild_farm', name: "Farmers' Guild", culture: 'republican', wealth: CIVIC, types: ['civic'], lot: [34, 24],
    bodies: [{ id: 'guildhall', poly: rect(11, 16, -6, -2), y: 0.5, levels: [{ h: 3.4 }, { h: 3 }], wall: 0.35, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [-6, 6], w: 1.8 }], program: [['hall', 'study', 'store'], ['library', 'study', 'store']] },
      { id: 'granary', poly: rect(6, 6, 8, -3), y: 1.15, levels: [{ h: 3 }], wall: 0.3, roof: 'hip', pitch: pt(1.2),
        doors: [{ at: [8, 0], w: 1.2 }], program: ['store'] }],
    note: 'the granary tower on its stone legs as one store floor (its 6.6 m log shaft has no second floor drawn)' });
  add({ key: 'hl_rep_guild_smith', name: 'Guild of Smiths', culture: 'republican', wealth: CIVIC, types: ['civic', 'industry'], lot: [30, 26],
    bodies: [{ id: 'guildhall', poly: rect(18, 11, 0, -3), y: 0.6, levels: [{ h: 5.4 }], wall: 0.5, roof: 'gable', pitch: pt(1),
      doors: [{ at: [0, 2.5], w: 3.2 }], program: ['hall', 'smithy', 'study', 'store'] }],
    note: 'the buttressed hall; the open forge shed on the +x side is left out' });
  add({ key: 'hl_rep_guild_mech', name: "Mechanics' Guild", culture: 'republican', wealth: CIVIC, types: ['civic', 'industry'], lot: [40, 22],
    bodies: [{ id: 'guildhall', poly: rect(18, 10, -1, -2), y: 0.6, levels: [{ h: 4.4 }, { h: 3.4 }], wall: 0.4, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [-1, 3], w: 1.8 }], program: [['hall', 'store'], ['workshop', 'library']] },
      { id: 'annex', poly: rect(6.4, 10, -13.2, -2), y: 0, levels: [{ h: 4 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [-10, -2], w: 1.2 }], program: ['workshop', 'store'] }],
    note: 'the glazed workshop annex (no door drawn: one assumed in the wall it shares with the hall); the clocktower (open base, timber belfry) is left out' });
  add({ key: 'hl_rep_guild_astro', name: "Astronomers' Guild", culture: 'republican', wealth: CIVIC, types: ['civic'], lot: [42, 22],
    bodies: [{ id: 'guildhall', poly: rect(16, 10, -4, -1), y: 0.6, levels: [{ h: 4 }, { h: 3.2 }], wall: 0.4, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [-4, 4], w: 1.7 }], program: [['hall', 'store'], ['library', 'study']] }],
    rooms: [{ id: 'observatory', kind: 'study', poly: circle(3.85, 8, -15.6, -1), y: 0, h: 6.5, doors: [{ at: [-15.6, 2.55], w: 1.1 }] },
      { id: 'tower', kind: 'study', poly: circle(2.9, 8, 10, -1), y: 0, h: 4.2, doors: [{ at: [10, 1.68], w: 1.2 }] }],
    note: 'the octagonal observatory drum and the octagonal tower\'s ground room as explicit rooms; the tower\'s upper floors and the telescope pavilion on top are left out' });
  add({ key: 'hl_rep_guild_scav', name: "Salvagers' Guild", culture: 'republican', wealth: CIVIC, types: ['civic', 'industry'], lot: [72, 48],
    bodies: [{ id: 'guildhall', poly: rect(22, 12, -18, -2), y: 1, levels: [{ h: 3.8 }, { h: 3.2 }], wall: 0.45, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [-18, 4], w: 2.2 }], program: [['hall', 'antechamber', 'study', 'store'], ['study', 'library', 'store']] },
      { id: 'depot', poly: rect(22, 12, -18, -17.5), y: 0.3, levels: [{ h: 2.9 }], wall: 0.15, roof: 'gable', pitch: pt(0.8),
        doors: [{ at: [-7, -17.5], w: 3 }], program: ['store', 'workshop', 'store'] }],
    note: 'the principal bodies: the guildhall and the hull depot behind it (a vault of hull on plank walls, its doors on the +x end); the tank-shaft stage tower, the sorting yard, its heaps, gantry, stores and furnace are left out' });

  /* ================================================================ REPUBLICAN — grand works (78-rep-grand.js) */
  add({ key: 'hl_rep_hall_republic', name: 'Hall of the Republic', culture: 'republican', wealth: CIVIC, types: ['civic'], lot: [112, 100],
    bodies: [{ id: 'ring', poly: rect(62, 52, 0, -10), y: 2.44, levels: [{ h: 7 }], wall: 0.6, roof: 'hip', pitch: pt(0.6),
      doors: [{ at: [0, -36], w: 2.2 }, { at: [0, 16], w: 3 }], program: ['hall', 'antechamber', 'study', 'library', 'hall', 'study', 'store', 'study'] },
      { id: 'entrance', poly: rect(22, 14, 0, 23), y: 2.44, levels: [{ h: 8 }], wall: 0.6, roof: 'gable', pitch: pt(1.2),
        doors: [{ at: [0, 30], w: 6 }], program: ['antechamber', 'study', 'store'] },
      { id: 'wing_w', poly: rect(13, 22, -37.5, -9), y: 2.44, levels: [{ h: 4.2 }, { h: 3.4 }], wall: 0.45, roof: 'gable', pitch: pt(1.2),
        doors: [{ at: [-37.5, 2], w: 1.8 }], program: [['hall', 'study', 'store'], ['study', 'library', 'study']] },
      { id: 'wing_e', poly: rect(13, 22, 37.5, -9), y: 2.44, levels: [{ h: 4.2 }, { h: 3.4 }], wall: 0.45, roof: 'gable', pitch: pt(1.2),
        doors: [{ at: [37.5, 2], w: 1.8 }], program: [['hall', 'study', 'store'], ['study', 'library', 'study']] }],
    note: 'the principal bodies on the platform: the ring hall (planned as one storey round its central chamber, the door from the entrance block assumed), the portal block, the two wings; the stepped tower over the centre, the clock stage, the spire pavilions and the verandas are left out' });
  add({ key: 'hl_rep_fortress', name: 'Fortress', culture: 'republican', wealth: CIVIC, types: ['military'], lot: [86, 78],
    bodies: [{ id: 'keep', poly: rect(14, 14, -14, -14), y: 5.2, levels: [{ h: 3.2 }, { h: 3 }, { h: 3 }], wall: 0.6, roof: 'flat',
      doors: [{ at: [-10.4, -7], w: 1.4 }], program: [['hall', 'store'], ['barracks', 'barracks'], ['study', 'bedroom']] },
      { id: 'palace', poly: rect(24, 10, 15, -21), y: 1, levels: [{ h: 4 }, { h: 3.3 }], wall: 0.4, roof: 'gable', pitch: pt(1.3),
        doors: [{ at: [15, -16], w: 1.6 }], program: [['hall', 'living', 'kitchen', 'store'], ['bedroom', 'bedroom', 'study', 'bedroom']] },
      { id: 'barracks', poly: rect(9, 24, -26, 10), y: 0.6, levels: [{ h: 3 }, { h: 2.8 }], wall: 0.35, roof: 'gable', pitch: pt(1.1),
        doors: [{ at: [-21.5, 10.5], w: 1.3 }], program: [['barracks', 'barracks', 'store'], ['barracks', 'barracks', 'barracks']] }],
    note: 'the principal bodies: the keep (first-floor door up the outside stair; its lower 5 m is solid, the jettied top storey left out), the commandant\'s palace, the barracks; the four corner towers, the gatehouse, the hoarded curtain and the open stable lean-to are left out' });
  add({ key: 'hl_rep_wall', name: 'Town wall', types: ['military', 'infrastructure'], lot: [40, 8],
    skip: 'a curtain wall with a roofed wall-walk: no room' });
  add({ key: 'hl_rep_wall_tower', name: 'Wall tower', culture: 'republican', wealth: CIVIC, types: ['military', 'infrastructure'], lot: [20, 12],
    bodies: [{ id: 'tower', poly: rect(8.5, 8.5, 0, 0.6), y: 0, levels: [{ h: 3.2 }, { h: 3 }], wall: 0.5, roof: 'hip', pitch: pt(1.5),
      doors: [{ at: [0, -3.65], w: 1.4 }], program: [['antechamber', 'store'], ['barracks']] }],
    note: 'the door is on the town side (-z); two guard floors planned, the loggia stage and the spire are left out' });
  add({ key: 'hl_rep_gate', name: 'Town gate', types: ['military', 'infrastructure'], lot: [44, 22],
    skip: 'an arched passage between two solid flanking towers (no door); the gate chamber over the arch has no door or stair drawn' });
  add({ key: 'hl_rep_forgehouse', name: 'Forgehouse', culture: 'republican', wealth: CIVIC, types: ['industry'], lot: [90, 64],
    bodies: [{ id: 'forgehall', poly: rect(60, 22, -6, -9), y: 1, levels: [{ h: 5 }], wall: 0.6, roof: 'gable', pitch: pt(0.9),
      doors: [{ at: [-27, 2], w: 4 }, { at: [-13, 2], w: 4 }, { at: [1, 2], w: 4 }, { at: [15, 2], w: 4 }], program: ['smithy', 'smithy', 'workshop', 'smithy', 'store'] },
      { id: 'finishing', poly: rect(18, 38, 37, -7), y: 1, levels: [{ h: 4.2 }, { h: 3.6 }], wall: 0.5, roof: 'gable', pitch: pt(1.1),
        doors: [{ at: [37, 12], w: 4.8 }], program: [['workshop', 'smithy', 'store'], ['store', 'study']] }],
    note: 'the principal bodies: the forge hall (its clerestory storey left out) and the finishing hall; the furnaces, the water wheel, the coal and scrap yards are left out' });
  add({ key: 'hl_rep_generator', name: 'Generator house', culture: 'republican', wealth: CIVIC, types: ['infrastructure'], lot: [36, 28],
    bodies: [{ id: 'enginehall', poly: rect(12, 20, -5, -3), y: 1, levels: [{ h: 7 }], wall: 0.45, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [-5, 7], w: 3.2 }], program: ['workshop', 'store'] }],
    note: 'the engine hall; the boiler lean-to (stoked from outside, no door) and the transformer yard are left out' });

  /* ================================================================ REPUBLICAN — land (79-rep-land.js) */
  add({ key: 'hl_rep_granary', name: 'Granary', culture: 'republican', wealth: MID, types: ['farm'], lot: [18, 18],
    bodies: [{ id: 'granary', poly: rect(7, 10), y: 1.25, levels: [{ h: 3.2 }], wall: 0.3, roof: 'gable', pitch: pt(1.3),
      doors: [{ at: [0, 5], w: 1.1 }], program: ['store', 'store'] }],
    note: 'on staddle stones; the loft behind the gable door is left out' });
  add({ key: 'hl_rep_farmhouse', name: 'Farmstead', culture: 'republican', wealth: MID, types: ['farm', 'single-family dwelling'], lot: [34, 34],
    bodies: [{ id: 'house', poly: rect(8, 14, -11, 8), y: 0.6, levels: [{ h: 3.2 }], wall: 0.35, roof: 'gable', pitch: pt(1.5),
      doors: [{ at: [-7, 9.6], w: 1 }], program: ['living', 'kitchen', 'bedroom'] },
      { id: 'barn', poly: rect(30, 10, 0, -11), y: 0.5, levels: [{ h: 4.6 }], wall: 0.3, roof: 'gable', pitch: pt(1.1),
        doors: [{ at: [0, -6], w: 3.6 }], program: ['store', 'store', 'store'] },
      { id: 'byre', poly: rect(5.5, 17, 13, 2.5), y: 0.5, levels: [{ h: 3.4 }], wall: 0.35, roof: 'flat',
        doors: [{ at: [10.25, -4], w: 1.3 }, { at: [10.25, 1], w: 1.3 }, { at: [10.25, 7], w: 1.3 }], program: ['stable', 'stable', 'stable'] }],
    note: 'the house (its door on the yard side, +x), the barn and the stable-and-byre range (trimmed 3 m where its block runs into the barn); the roofed gateway is open' });
  add({ key: 'hl_rep_farm', name: 'Farm field', types: ['farm'], lot: [64, 46], skip: 'open fields; the pole hay barn is open-sided' });
  add({ key: 'hl_rep_pens', name: 'Animal pens', types: ['farm'], lot: [34, 26],
    skip: 'open paddocks and an open-fronted cattle shed; the pigsty hut is 1.7 m high (too low for a room)' });
  add({ key: 'hl_rep_windmill', name: 'Post mill', culture: 'republican', wealth: MID, types: ['farm', 'industry'], lot: [22, 22],
    bodies: [{ id: 'buck', poly: rect(4.4, 5.6), y: 5.6, levels: [{ h: 2.8 }], wall: 0.12, roof: 'gable', pitch: pt(1.15),
      doors: [{ at: [0, -2.8], w: 0.9 }], program: ['workshop'] }],
    note: 'the buck on its post, entered from the ladder at the back (-z); its upper (stone) floor is left out' });
  add({ key: 'hl_rep_watermill', name: 'Water mill', culture: 'republican', wealth: MID, types: ['farm', 'industry'], lot: [24, 26],
    bodies: [{ id: 'mill', poly: rect(8, 11), y: 1.2, levels: [{ h: 3.6 }], wall: 0.3, roof: 'gable', pitch: pt(1.3),
      doors: [{ at: [-1.2, 5.5], w: 1.2 }], program: ['workshop', 'store'] }],
    note: 'the gear-pit lean-to over the wheel is left out' });
  add({ key: 'hl_rep_mine', name: 'Mine', culture: 'republican', wealth: POOR, types: ['industry'], lot: [46, 40],
    bodies: [{ id: 'windinghouse', poly: rect(6, 5, 11, 8), y: 0, levels: [{ h: 2.9 }], wall: 0.25, roof: 'flat',
      doors: [{ at: [14, 8], w: 1 }], program: ['workshop'] }],
    note: 'the winding house only; the adit (a gallery into the rock), the headframe and the open stamp-mill lean-to are left out' });
  add({ key: 'hl_rep_quarry', name: 'Quarry', culture: 'republican', wealth: POOR, types: ['industry'], lot: [46, 36],
    bodies: [{ id: 'shed', poly: rect(6, 4, -15, 13), y: 0, levels: [{ h: 2.5 }], wall: 0.1, roof: 'flat',
      doors: [{ at: [-13.8, 15], w: 0.9 }], program: ['store'] }],
    note: 'the quarrymen\'s shed only; the benches, floor and derrick are open' });

  /* ================================================================ REPUBLICAN — salvage (79b-79f) */
  add({ key: 'hl_rep_house_tank', name: 'Tank house', culture: 'republican', wealth: POOR, types: SF, lot: [15, 10],
    bodies: [{ id: 'upper', poly: rect(8, 5.4), y: 4.5, levels: [{ h: 2.8 }], wall: 0.25, roof: 'gable', pitch: pt(1.6),
      doors: [{ at: [0, 2.7], w: 0.9 }], program: ['bedroom', 'store'] }],
    rooms: [{ id: 'tank', kind: 'living', poly: rect(8.4, 2.8), y: 1.3, h: 2.3, doors: [{ at: [0, 1.4], w: 0.9 }] }],
    note: 'the fuel tank lying on its side (4.2 m across) holds a living room on a floor laid 0.7 m above its bottom (2.8 m wide there), entered from the porch; the straddling frame storey above has no stair drawn: a door is assumed on its front' });
  add({ key: 'hl_rep_house_hulk', name: 'Hull-plate tower house', culture: 'republican', wealth: MID, types: SF, lot: [11, 12],
    bodies: [{ id: 'tower', poly: rect(6.8, 6.8), y: 3.2, levels: [{ h: 2.8 }, { h: 2.7 }], wall: 0.25, roof: 'gable', pitch: pt(1.5),
      doors: [{ at: [2.4, 3.4], w: 1 }], program: [['living', 'kitchen'], ['bedroom', 'store']] }],
    note: 'two frame storeys on the broken concrete block, up the outside stair; the jettied upper storey planned on the lower footprint' });
  add({ key: 'hl_rep_powder_works', name: 'Powder works', culture: 'republican', wealth: POOR, types: ['industry'], lot: [36, 28],
    bodies: [-11, 0, 11].map(function (x, i) {
      return { id: 'shed' + (i + 1), poly: rect(7, 14, x, -1), y: 0.3, levels: [{ h: 3.2 }], wall: 0.2, roof: 'gable', pitch: pt(1.4),
        doors: [{ at: [x, 6], w: 2.4 }], program: ['workshop', 'store'] };
    }),
    note: 'the three mixing sheds between their blast berms; the boiler house is a firebox under a tank' });
  add({ key: 'hl_rep_hull_yard', name: "Hull-breaker's yard", culture: 'republican', wealth: POOR, types: ['industry'], lot: [32, 30],
    bodies: [{ id: 'furnacehall', poly: rect(16, 9, 0, -8.5), y: 0, levels: [{ h: 3.6 }, { h: 3.2 }], wall: 0.4, roof: 'gable', pitch: pt(1.3),
      doors: [{ at: [0, -4], w: 3.2 }], program: [['smithy', 'workshop', 'store'], ['store', 'study']] },
      { id: 'office', poly: rect(4.6, 3.6, -11, -1), y: 0.3, levels: [{ h: 2.8 }], wall: 0.2, roof: 'gable', pitch: pt(1.5),
        doors: [{ at: [-11, 0.8], w: 0.9 }], program: ['study'] }],
    note: 'the furnace hall entered by its furnace mouth, and the breaker\'s office (no door drawn: one assumed on its front); the gantry and heaps are open' });
  add({ key: 'hl_rep_hull_vault', name: 'Hull-vault warehouse', culture: 'republican', wealth: POOR, types: ['industry', 'warehouse'], lot: [34, 20],
    bodies: [{ id: 'vault', poly: rect(26, 15.9), y: 0.4, levels: [{ h: 3.1 }], wall: 0.15, roof: 'gable', pitch: pt(0.9),
      doors: [{ at: [13, 0], w: 4 }], program: ['store', 'store', 'store'] }],
    note: 'plank walls under a vault of rocket hull, the doors on the +x end; planned to the eave (3.2 m), the vault above is open' });
  add({ key: 'hl_rep_kontor', name: 'Scrap Kontor', culture: 'republican', wealth: MID, types: ['market/shop'], lot: [17, 14],
    bodies: [{ id: 'counter', poly: rect(12, 2.44, 0, 1.25), y: 0, levels: [{ h: 2.45 }], wall: 0.06, roof: 'flat',
      doors: [{ at: [0, 2.47], w: 0.9 }], program: ['shop', 'store'] },
      { id: 'strongroom', poly: rect(12, 2.44, 0, -1.25), y: 0, levels: [{ h: 2.45 }], wall: 0.06, roof: 'flat',
        doors: [{ at: [-6, -1.25], w: 1.2 }], program: ['store', 'store'] },
      { id: 'upper', poly: rect(12.4, 5.4), y: 2.6, levels: [{ h: 3 }], wall: 0.25, roof: 'gable', pitch: pt(1.5),
        doors: [{ at: [6.2, -1], w: 0.9 }], program: ['study', 'store', 'bedroom'] }],
    note: 'the two containers (the shop and the strongroom behind its vault door at the -x end) and the frame storey on them, up the outside stair at +x (a door assumed at its head); the lookout is left out' });
  add({ key: 'hl_rep_cont_stack', name: 'Container stack', culture: 'republican', wealth: POOR, types: MF, units: 2, lot: [16, 9],
    bodies: [{ id: 'home1', poly: rect(12, 2.44, 0, 1.25), y: 0, levels: [{ h: 2.45 }], wall: 0.06, roof: 'flat',
      doors: [{ at: [4.8, 2.47], w: 0.9 }], program: ['living', 'bedroom'] },
      { id: 'store', poly: rect(12, 2.44, 0, -1.25), y: 0, levels: [{ h: 2.45 }], wall: 0.06, roof: 'flat',
        doors: [{ at: [4.5, -0.03], w: 0.9 }], program: ['store', 'store'] },
      { id: 'home2', poly: rect(6, 2.44, -3, 1.25), y: 2.6, levels: [{ h: 2.45 }], wall: 0.06, roof: 'flat',
        doors: [{ at: [-1, 2.47], w: 0.9 }], program: ['cottage'] }],
    note: 'the two containers with doors on the ground and the one off the walkway; the windowed containers with no door drawn (the long one on level 1, the cross one on level 2) and the frame room on top (ladder) are left out' });
  add({ key: 'hl_rep_silo_house', name: 'Silo house', culture: 'republican', wealth: POOR, types: SF, lot: [17, 12],
    bodies: [{ id: 'annex', poly: rect(3.6, 4.2, -5.4, -1), y: 3.2, levels: [{ h: 2.6 }], wall: 0.2, roof: 'gable', pitch: pt(1.7),
      doors: [{ at: [-5.4, 1.1], w: 0.8 }], program: ['bedroom'] }],
    rooms: [{ id: 'silo', kind: 'cottage', poly: circle(2.85, 16), y: 0.4, h: 2.8, doors: [{ at: [-2.795, 0.483], w: 1 }] }],
    note: 'the silo\'s ground floor as a round cottage (its upper ring of windows: an upper floor with no stair drawn, left out), the upper storey of the frame annex up its outside stair (the annex ground floor has no door drawn)' });
  add({ key: 'hl_rep_tank_row', name: 'Tank-cluster row', culture: 'republican', wealth: POOR, types: MF, units: 3, lot: [22, 8],
    rooms: [{ id: 'tank1', kind: 'cottage', poly: circle(2.5, 8, -6.5, 0), y: 0.35, h: 2.6, doors: [{ at: [-6.5, 2.31], w: 0.9 }] },
      { id: 'tank2', kind: 'cottage', poly: circle(2.1, 8, 0, 0), y: 0.35, h: 2.6, doors: [{ at: [0, 1.94], w: 0.9 }] },
      { id: 'tank3', kind: 'cottage', poly: circle(2.8, 8, 6.5, 0), y: 0.35, h: 2.6, doors: [{ at: [6.5, 2.59], w: 0.9 }] }],
    note: 'one household in the ground room of each standing tank; their upper floors (bridged rings of windows, no stair drawn) and the frame house wedged between them (no door) are left out' });
  add({ key: 'hl_rep_crawler', name: 'Crawler house', culture: 'republican', wealth: POOR, types: SF, lot: [16, 7],
    bodies: [{ id: 'container', poly: rect(6, 2.44, -2.8, -0.6), y: 2.94, levels: [{ h: 2.45 }], wall: 0.06, roof: 'flat',
      doors: [{ at: [-2.8, 0.62], w: 0.9 }], program: ['cottage'] },
      { id: 'house', poly: rect(3.6, 4.2, 2.2, 0), y: 2.94, levels: [{ h: 2.7 }], wall: 0.2, roof: 'gable', pitch: pt(1.7),
        doors: [{ at: [2.2, 2.1], w: 0.9 }], program: ['living'] }],
    note: 'the container and the frame house on the hauler\'s deck (up the ladder); the frame house draws no door: one assumed on the deck side' });
  add({ key: 'hl_rep_garage', name: 'Salvage garage', culture: 'republican', wealth: POOR, types: ['market/shop', 'industry'], lot: [19, 10],
    bodies: [{ id: 'tower', poly: rect(5, 5, -2.4, -0.5), y: 0, levels: [{ h: 3 }, { h: 2.8 }], wall: 0.3, roof: 'gable', pitch: pt(1.7),
      doors: [{ at: [-2.4, 2], w: 1 }], program: [['workshop'], ['shop']] }],
    note: 'the rubble ground floor and the frame storey (4.4 m inside: a ladder, not a stair); the carport is open' });
  add({ key: 'hl_rep_cont_shops', name: 'Container shops', culture: 'republican', wealth: POOR, types: ['market/shop'], lot: [20, 6],
    bodies: [-6.3, 0, 6.3].map(function (x, i) {
      return { id: 'shop' + (i + 1), poly: rect(6, 2.44, x, 0), y: 0, levels: [{ h: 2.45 }], wall: 0.06, roof: 'flat',
        doors: [{ at: [x, 1.22], w: 3 }], program: ['shop'] };
    }),
    note: 'three containers opened as shops (the whole +z side open over a counter: planned as a wide opening); the frame storey over the middle one has no stair' });
  add({ key: 'hl_rep_lantern_stall', name: 'Lantern stall', culture: 'republican', wealth: MID, types: ['market/shop'], lot: [11, 6],
    bodies: [{ id: 'stall', poly: rect(7, 3.3), y: 0, levels: [{ h: 2.9 }], wall: 0.12, roof: 'flat',
      doors: [{ at: [0, 1.65], w: 4 }], program: ['shop'] }],
    note: 'the deep open shopfront (walled on three sides, open on posts at the front: planned as a wide opening); the whitewashed room above has no stair drawn' });
  add({ key: 'hl_rep_radome_tower', name: 'Radome tower house', culture: 'republican', wealth: POOR, types: MF, units: 2, lot: [17, 9],
    bodies: [{ id: 'home1', poly: rect(12, 2.44, 0, 1.25), y: 0, levels: [{ h: 2.45 }], wall: 0.06, roof: 'flat',
      doors: [{ at: [-5, 2.47], w: 0.9 }], program: ['living', 'bedroom'] },
      { id: 'home2', poly: rect(6, 5, -1, 0), y: 2.6, levels: [{ h: 2.8 }], wall: 0.2, roof: 'flat',
        doors: [{ at: [2, 0], w: 0.9 }], program: ['cottage'] },
      { id: 'store', poly: rect(2.44, 6, 3.9, 0), y: 2.6, levels: [{ h: 2.45 }], wall: 0.06, roof: 'flat',
        doors: [{ at: [5.12, 0], w: 0.9 }], program: ['store'] }],
    note: 'the ground container with the door, the frame storey (a door assumed from the cross container, which opens on the zig-zag stair); the back ground container, the level-2 container and the lookout (no doors drawn) are left out' });
  add({ key: 'hl_rep_stage_tenement', name: 'Stage tenement', culture: 'republican', wealth: POOR, types: MF, units: 5, lot: [32, 9],
    bodies: [-5.5, 5.5].map(function (x, i) {
      return { id: 'top' + (i + 1), poly: rect(7, 4.2, x, 0), y: 5.65, levels: [{ h: 2.6 }], wall: 0.2, roof: 'gable', pitch: pt(1.5),
        doors: [{ at: [x, 2.1], w: 0.9 }], program: ['cottage'] };
    }),
    rooms: [[-5.2, -4.6], [1.75, 1.6], [8.2, 8.2]].map(function (u, i) {
      const x0 = [-9, -1.6, 5.1][i], x1 = [-1.6, 5.1, 11.3][i];
      return { id: 'stage' + (i + 1), kind: 'cottage', poly: rect(r3(x1 - x0 - 0.1), 3.2, r3((x0 + x1) / 2), 0), y: 1.5, h: 2.4,
        doors: [{ at: [u[1], 1.6], w: 0.9 }] };
    }),
    note: 'the rocket stage lying on its cradles (5.2 m across) holds three homes on a floor laid 0.7 m above its bottom (3.5 m wide there), one per flank door; the two frame houses riding its back are reached by the stair at the nose end (no doors drawn: assumed on their fronts)' });
  add({ key: 'hl_rep_smelter', name: 'Smelter', culture: 'republican', wealth: POOR, types: ['industry'], lot: [24, 18],
    bodies: [{ id: 'casthouse', poly: rect(7, 6, 6, -3), y: 0, levels: [{ h: 3.4 }], wall: 0.2, roof: 'gable', pitch: pt(1.5),
      doors: [{ at: [6, 0], w: 1.2 }], program: ['workshop', 'store'] }],
    note: 'the cast-house (no door drawn: one assumed on its front); the furnace block is solid rubble, the conveyor and bins are open' });
  add({ key: 'hl_rep_wreck_market', name: 'Wreck market hall', types: ['market/shop'], lot: [24, 14],
    skip: 'a hull vault on bracketed posts open at both sides over the stalls: no walls' });
  add({ key: 'hl_rep_press_works', name: 'Press works', culture: 'republican', wealth: POOR, types: ['industry'], lot: [32, 28],
    bodies: [{ id: 'shed', poly: rect(24, 14), y: 0, levels: [{ h: 4.4 }], wall: 0.1, roof: 'flat',
      doors: [{ at: [0, 7], w: 4 }], program: ['workshop', 'workshop', 'store'] },
      { id: 'office', poly: rect(4.2, 5, 14.6, -2), y: 0, levels: [{ h: 2.8 }], wall: 0.2, roof: 'gable', pitch: pt(1.5),
        doors: [{ at: [14.6, 0.5], w: 0.9 }], program: ['study'] }],
    note: 'the sawtooth shed (roof drawn flat) and the frame office (no door drawn: one assumed on its front)' });
  add({ key: 'hl_rep_gasholder', name: 'Gasholder tenement', culture: 'republican', wealth: POOR, types: MF, units: 5, lot: [26, 26],
    bodies: [0, 1, 2, 3, 4].map(function (k) {
      const a = -1.1 + k * 0.55, px = Math.sin(a) * 11.6, pz = Math.cos(a) * 11.6;
      return { id: 'ring' + (k + 1), poly: rrect(3.6, 3.2, px, pz, a), y: 0, levels: [{ h: 2.6 }], wall: 0.1, roof: 'gable', pitch: pt(1.6),
        doors: [{ at: turn([1.1, 1.6], a, px, pz), w: 0.8 }], program: ['cottage'] };
    }).concat([0, 1, 2, 3].map(function (k) {
      const a = k * Math.PI / 2 + 0.4, px = Math.sin(a) * 4.95, pz = Math.cos(a) * 4.95;
      return { id: 'crown' + (k + 1), poly: rrect(3.4, 3, px, pz, a), y: 10.5, levels: [{ h: 2.4 }], wall: 0.06, roof: 'gable', pitch: pt(1.6),
        doors: [{ at: turn([1.15, 1.5], a, px, pz), w: 0.75 }], program: ['bedroom'] };
    })),
    note: 'nine one-room frame houses, none with a door drawn (each is given one on its outer face): the five ringing the drum\'s foot are the households (one-room homes); the four on its crown (up the stair, 3.3 x 2.9 m inside) do not hold a hearth beside a bed and a chest, so they are planned as sleeping huts. The drum itself is the gasholder\'s void' });
  add(Object.assign({ key: 'hl_rep_arco_quarter', name: 'The Fallen Arcology', culture: 'republican', wealth: POOR, types: ['multi-family dwelling', 'ruin'], units: 2, lot: [118, 70],
    note: 'the houses at the cleft\'s mouth (the izba, the two-room house, the lantern stall, as their own items placed by the builder); the frame towers in the cleft (random sizes), the terrace huts and crown houses (no doors) and the wreck itself are left out' },
    merge([place('hl_rep_house_poor_a', -12, 24, 0, 'izba.'), place('hl_rep_house_poor_b', -23, 26, 0.1, 'house.'), place('hl_rep_lantern_stall', 12, 24.5, 0, 'stall.')])));
  add({ key: 'hl_rep_shipbreak', name: "Shipbreakers' yard — freighter", culture: 'republican', wealth: POOR, types: ['industry', 'salvage', 'ruin'], lot: [120, 58],
    bodies: [{ id: 'shed1', poly: rect(6, 4, 28, -15), y: 0, levels: [{ h: 2.5 }], wall: 0.06, roof: 'flat',
      doors: [{ at: [28, -13], w: 1 }], program: ['workshop'] },
      { id: 'shed2', poly: rect(4.4, 3.6, 35.5, -15), y: 0, levels: [{ h: 2.5 }], wall: 0.06, roof: 'flat',
        doors: [{ at: [35.5, -13.2], w: 1 }], program: ['store'] }],
    note: 'the camp\'s two sheds only; the hull being broken (plated fore part, stripped ribs) and the yard are left out' });
  add({ key: 'hl_rep_shipbreak_lander', name: "Shipbreakers' yard — lander", culture: 'republican', wealth: POOR, types: ['industry', 'salvage', 'ruin'], lot: [84, 48],
    bodies: [{ id: 'shed1', poly: rect(6, 4, 16, -15), y: 0, levels: [{ h: 2.5 }], wall: 0.06, roof: 'flat',
      doors: [{ at: [16, -13], w: 1 }], program: ['workshop'] },
      { id: 'shed2', poly: rect(4.4, 3.6, 23.5, -15), y: 0, levels: [{ h: 2.5 }], wall: 0.06, roof: 'flat',
        doors: [{ at: [23.5, -13.2], w: 1 }], program: ['store'] }],
    note: 'the camp\'s two sheds only; the lander nose-down in its crater and the yard are left out' });

  /* ================================================================ RUSTIC — dwellings (80-rus-dwell.js) */
  add({ key: 'hl_rus_house_poor_a', name: 'Turf-roofed log cabin', culture: 'rustic', wealth: POOR, types: SF, lot: [14, 14],
    bodies: [{ id: 'cabin', poly: rect(6, 5), y: 0.3, levels: [{ h: 2.3 }], wall: 0.3, roof: 'gable', pitch: pt(1.6),
      doors: [{ at: [0, 2.5], w: 0.9 }], program: ['cottage'] }] });
  add({ key: 'hl_rus_house_poor_b', name: 'Sod-bank shack', culture: 'rustic', wealth: POOR, types: SF, lot: [12, 10],
    bodies: [{ id: 'shack', poly: rect(5.2, 4.2), y: 0, levels: [{ h: 2.0 }], wall: 0.12, roof: 'gable', pitch: pt(0.62),
      doors: [{ at: [0.1, 2.1], w: 0.85 }], program: ['cottage'] }],
    note: 'cut into a turf bank on three sides' });
  add({ key: 'hl_rus_house_mid_a', name: 'Alpine chalet', culture: 'rustic', wealth: MID, types: SF, lot: [15, 14],
    bodies: [{ id: 'chalet', poly: rect(11, 10), y: 0.5, levels: [{ h: 2.3 }, { h: 2.8 }], wall: 0.35, roof: 'gable', pitch: pt(0.6),
      doors: [{ at: [0, 5], w: 1.1 }], program: [['living', 'kitchen', 'store'], ['bedroom', 'bedroom']] }],
    note: 'the whitewashed stone ground storey and the log storey; the attic behind the small balcony is left out' });
  add({ key: 'hl_rus_house_mid_b', name: 'Falu-red board house', culture: 'rustic', wealth: MID, types: SF, lot: [17, 15],
    bodies: [{ id: 'house', poly: rect(9.4, 6.6), y: 0.65, levels: [{ h: 2.9 }], wall: 0.15, roof: 'gable', pitch: pt(1.25),
      doors: [{ at: [0, 3.3], w: 1 }], program: ['living', 'kitchen', 'bedroom'] }],
    note: 'the carved portal stands in a 1.4 m vestibule under a cross gable: the plan puts the door in the main wall behind it' });
  add({ key: 'hl_rus_house_rich_a', name: 'Alpine farmhouse', culture: 'rustic', wealth: RICH, types: MF, units: 2, lot: [22, 30],
    bodies: [{ id: 'house', poly: rect(13, 11), y: 0.6, levels: [{ h: 2.4 }, { h: 2.8 }, { h: 2.6 }], wall: 0.35, roof: 'gable', pitch: pt(0.56),
      doors: [{ at: [0, 5.5], w: 1.3 }], program: [['living', 'kitchen', 'store'], ['living', 'bedroom', 'bedroom'], ['bedroom', 'bedroom', 'store']] },
      { id: 'barn', poly: rect(13, 10, 0, -10.5), y: 0, levels: [{ h: 3.2 }], wall: 0.15, roof: 'gable', pitch: pt(0.56),
        doors: [{ at: [6.5, -9.1], w: 2.2 }, { at: [6.5, -11.9], w: 2.2 }], program: ['stable', 'store'] }],
    note: 'two households in the stone-and-log house; the barn behind under the same roof (its hay floor over the Tenne bridge is left out)' });
  add({ key: 'hl_rus_house_rich_b', name: "Chieftain's hall-house", culture: 'rustic', wealth: RICH, types: SF, lot: [34, 18],
    bodies: [{ id: 'hall', poly: rect(18, 8), y: 0.7, levels: [{ h: 3.2 }], wall: 0.3, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [0, 4], w: 1.4 }], program: ['hall', 'kitchen', 'bedroom', 'bedroom'] },
      { id: 'tower', poly: rect(4.2, 4.2, 12.9, 0), y: 0.7, levels: [{ h: 3.2 }, { h: 2.8 }], wall: 0.3, roof: 'hip', pitch: pt(1.2),
        doors: [{ at: [12.9, 2.1], w: 0.9 }], program: [['store'], ['bedroom']] }],
    note: 'the long log hall and the two-storey store tower (3.6 m inside: a ladder, not a stair)' });

  /* ================================================================ RUSTIC — village (81-rus-village.js) */
  add({ key: 'hl_rus_temple', name: 'Stave church', culture: 'rustic', wealth: CIVIC, types: ['religious'], lot: [16, 26],
    bodies: [{ id: 'nave', poly: rect(8, 12), y: 0.5, levels: [{ h: 5.5 }], wall: 0.2, roof: 'gable', pitch: pt(1.5),
      doors: [{ at: [0, 6], w: 1.4 }], program: ['shrine'] }],
    note: 'the staved core; the open ambulatory round it, the apse and the clerestory above are left out' });
  add({ key: 'hl_rus_hall', name: 'Village hall', culture: 'rustic', wealth: CIVIC, types: ['civic'], lot: [22, 40],
    bodies: [{ id: 'hall', poly: rect(11, 24, 0, -4), y: 1.2, levels: [{ h: 3.6 }], wall: 0.2, roof: 'gable', pitch: pt(1.3),
      doors: [{ at: [0, 8], w: 1.8 }, { at: [5.5, -10], w: 1.1 }], program: ['hall', 'kitchen', 'store'] }],
    note: 'the longhall on its terrace; the arcaded porch is open' });
  add({ key: 'hl_rus_shops', name: 'Shop cottage and stalls', culture: 'rustic', wealth: MID, types: ['market/shop'], lot: [18, 16],
    bodies: [{ id: 'cottage', poly: rect(7.2, 6, 0, -4), y: 0.4, levels: [{ h: 2.7 }], wall: 0.3, roof: 'gable', pitch: pt(1.05),
      doors: [{ at: [1.9, -1], w: 0.95 }], program: ['shop', 'store'] }],
    note: 'the log shop behind its shutter counter; the stalls are open' });
  add({ key: 'hl_rus_tavern', name: 'Rustic inn', culture: 'rustic', wealth: MID, types: ['tavern/inn'], lot: [22, 20],
    bodies: [{ id: 'inn', poly: rect(14, 11), y: 0.5, levels: [{ h: 2.5 }, { h: 2.8 }, { h: 2.6 }], wall: 0.35, roof: 'gable', pitch: pt(0.6),
      doors: [{ at: [0, 5.5], w: 1.5 }], program: [['tavern', 'kitchen', 'store'], ['bedroom', 'bedroom', 'bedroom'], ['bedroom', 'bedroom']] }],
    note: 'the stable lean-to at +x is open on posts' });
  add({ key: 'hl_rus_smithy', name: 'Scrap smithy', types: ['industry'], lot: [18, 10],
    skip: 'open forge shed on posts with half-height back boards: nothing enclosed' });
  add({ key: 'hl_rus_muster', name: 'Mustering ground', types: ['military'], lot: [34, 26],
    skip: 'open drill field; the lookout is a platform on four posts' });
  add({ key: 'hl_rus_granary', name: 'Stabbur', culture: 'rustic', wealth: MID, types: ['farm'], lot: [8, 10],
    bodies: [{ id: 'stabbur', poly: rect(4, 3.6), y: 1.05, levels: [{ h: 2.1 }], wall: 0.28, roof: 'gable', pitch: pt(1),
      doors: [{ at: [0, 1.8], w: 0.9 }], program: ['store'] }],
    note: 'the log store on its posts; the oversailing board loft (1.8 m) is left out' });
  add({ key: 'hl_rus_mill', name: 'Watermill', culture: 'rustic', wealth: MID, types: ['farm', 'industry'], lot: [16, 24],
    bodies: [{ id: 'mill', poly: rect(6, 5.5), y: 1.2, levels: [{ h: 2.7 }], wall: 0.3, roof: 'gable', pitch: pt(1.1),
      doors: [{ at: [-1, 2.75], w: 1.1 }], program: ['workshop'] }] });
  add({ key: 'hl_rus_farmhouse', name: 'Einhof farmhouse', culture: 'rustic', wealth: MID, types: ['farm', 'multi-family dwelling'], units: 2, lot: [26, 22],
    bodies: [{ id: 'house', poly: rect(9, 10, -5.5, 0), y: 0.5, levels: [{ h: 2.3 }, { h: 2.6 }], wall: 0.3, roof: 'gable', pitch: pt(1),
      doors: [{ at: [-3.7, 5], w: 1.1 }], program: [['living', 'kitchen', 'store'], ['bedroom', 'bedroom', 'bedroom']] },
      { id: 'byre', poly: rect(11, 10, 4.5, 0), y: 0, levels: [{ h: 2.8 }], wall: 0.4, roof: 'gable', pitch: pt(1),
        doors: [{ at: [7.9, 5], w: 1.5 }], program: ['stable', 'store'] }],
    note: 'house and byre under one roof; the board hay loft over the byre is left out' });
  add({ key: 'hl_rus_farm', name: 'Farm fields', culture: 'rustic', wealth: MID, types: ['farm'], lot: [51, 36],
    bodies: [{ id: 'loe', poly: rect(5, 4, -21, -14), y: 0, levels: [{ h: 2.5 }], wall: 0.12, roof: 'gable', pitch: pt(0.9),
      doors: [{ at: [-21, -12], w: 1.4 }], program: ['store'] }],
    note: 'the field barn (løe) only; the fields and hay racks are open' });
  add({ key: 'hl_rus_pens', name: 'Animal pens', types: ['farm'], lot: [27, 19],
    skip: 'rail paddock, wattle fold and pig pen are open; the shelter is open-fronted and the pig hut 1.3 m high' });

  /* ================================================================ RUSTIC — salvage (81b-rus-salvage.js) */
  add({ key: 'hl_rus_tank_stue', name: 'Tank stue', culture: 'rustic', wealth: POOR, types: SF, lot: [18, 16],
    rooms: [{ id: 'tank', kind: 'cottage', poly: rect(8.2, 3), y: 1.15, h: 2.3, doors: [{ at: [1, 1.5], w: 0.9 }] }],
    note: 'the fuel tank lying on its footing (4.2 m across) holds one room on a floor laid 0.7 m above its bottom (3 m wide there), entered through the log vestibule on its flank (the vestibule itself is not planned)' });
  add({ key: 'hl_rus_cont_chalet', name: 'Container chalet', culture: 'rustic', wealth: MID, types: ['multi-family dwelling', 'farm'], units: 2, lot: [20, 16],
    bodies: [{ id: 'byre', poly: rect(12, 2.44, 0, 1.25), y: 0, levels: [{ h: 2.45 }], wall: 0.06, roof: 'flat', windows: false,
      doors: [{ at: [1.2, 2.47], w: 1.1 }], program: ['stable'] },
      { id: 'house', poly: rect(12.4, 5.4), y: 2.8, levels: [{ h: 2.6 }], wall: 0.3, roof: 'gable', pitch: pt(0.6),
        doors: [{ at: [-2, 2.7], w: 0.9 }], program: ['living', 'bedroom', 'kitchen', 'bedroom'] }],
    note: 'the front container (one byre: 12 m by 2.3 m inside is too narrow to split and keep a stall) and the log storey on the pair, off its balcony; the back container has no door drawn' });
  add({ key: 'hl_rus_hull_naust', name: 'Hull naust', culture: 'rustic', wealth: MID, types: ['industry', 'warehouse'], lot: [14, 26],
    bodies: [{ id: 'naust', poly: rect(8.9, 16), y: 0, levels: [{ h: 2.2 }], wall: 0.9, roof: 'gable', pitch: pt(0.9),
      doors: [{ at: [0, 8], w: 5 }], program: ['workshop', 'store'] }],
    note: 'two fieldstone walls under a vault of hull, the front open on the slip (planned as a wide opening, to the eave); the longboat on its rollers is not a catalog piece' });
  add({ key: 'hl_rus_silo_stabbur', name: 'Silo stabbur', culture: 'rustic', wealth: MID, types: ['farm'], lot: [16, 14],
    bodies: [{ id: 'loft', poly: rect(5.8, 5.8), y: 7.42, levels: [{ h: 2.3 }], wall: 0.3, roof: 'gable', pitch: pt(1.15),
      doors: [{ at: [-1.6, 2.9], w: 0.8 }], program: ['store'] }],
    rooms: [{ id: 'silo', kind: 'store', poly: circle(2.2, 16), y: 0.5, h: 3, doors: [{ at: [0, 2.2], w: 1 }] }],
    note: 'the silo\'s floor and the log loft on top (up the ladder)' });
  add({ key: 'hl_rus_scrap_market', name: 'Scrap-iron market', culture: 'rustic', wealth: MID, types: ['market/shop'], lot: [20, 20],
    bodies: [{ id: 'container', poly: rect(9, 2.44, 0, -5.9), y: 0, levels: [{ h: 2.45 }], wall: 0.06, roof: 'flat',
      doors: [{ at: [0, -4.68], w: 4 }], program: ['shop'] }],
    note: 'the container shopfront (its open side planned as a wide opening); the market hall is open on log posts' });

  /* ================================================================ TRIBAL — dwellings (84-tri-dwell.js) */
  add({ key: 'hl_tri_small_a', name: 'Painted hut', culture: 'painted', wealth: POOR, types: SF, lot: [9, 10],
    bodies: [{ id: 'hut', poly: rect(6, 5), y: 1.6, levels: [{ h: 2.4 }], wall: 0.12, roof: 'gable', pitch: pt(1.2),
      doors: [{ at: [0, 2.5], w: 0.9 }], program: ['cottage'] }],
    note: 'on stilts (floor 1.6 m); hung on a cliff the floor is at the placement height' });
  add({ key: 'hl_tri_small_b', name: 'Round bamboo hut', culture: 'painted', wealth: POOR, types: SF, lot: [9, 11],
    rooms: [{ id: 'hut', kind: 'cottage', poly: circle(2.7, 8), y: 0.9, h: 2.3, doors: [{ at: [0, 2.49], w: 0.9, swing: 'none' }] }],
    note: 'the mat drum (R 2.7, its 16 culms read as an octagon) on its disc, floor 0.9 m' });
  add({ key: 'hl_tri_small_c', name: 'Painted earth-lodge', culture: 'painted', wealth: POOR, types: SF, lot: [11, 11],
    bodies: [{ id: 'lodge', poly: rect(5.6, 5.2), y: 0.35, levels: [{ h: 2.15 }], wall: 0.3, roof: 'gable', pitch: pt(0.9),
      doors: [{ at: [0, 2.6], w: 0.9 }], program: ['cottage'] }] });
  add({ key: 'hl_tri_large_a', name: 'Great plank-house', culture: 'painted', wealth: MID, types: MF, units: 2, lot: [18, 20],
    bodies: [{ id: 'house', poly: rect(13, 11), y: 0.55, levels: [{ h: 3.4 }], wall: 0.2, roof: 'gable', pitch: pt(0.44),
      doors: [{ at: [0, 5.5], w: 1 }], program: ['living', 'bedroom', 'kitchen', 'bedroom'] }],
    note: 'two households round the shared hearth room; the door is the oval opening through the painted front' });
  add({ key: 'hl_tri_large_b', name: 'Long-dwelling on stilts', culture: 'painted', wealth: MID, types: MF, units: 3, lot: [23, 17],
    bodies: [-6, 0, 6].map(function (x, i) {
      return { id: 'unit' + (i + 1), poly: rect(5.95, 6.5, x, 0), y: 2.4, levels: [{ h: 2.8 }], wall: 0.12, roof: 'gable', pitch: pt(1.15),
        doors: [{ at: [x, 3.25], w: 0.9 }], program: ['cottage'] };
    }),
    note: 'one household behind each of the three doors off the veranda (the bamboo box split at the door thirds); floor 2.4 m on stilts' });

  /* ================================================================ TRIBAL — village (85-tri-village.js) */
  add({ key: 'hl_tri_longhouse', name: 'Village longhouse', culture: 'painted', wealth: CIVIC, types: ['civic'], lot: [66, 40],
    bodies: [{ id: 'hall', poly: rect(24, 17), y: 3.2, levels: [{ h: 4 }], wall: 0.3, roof: 'gable', pitch: pt(0.9),
      doors: [{ at: [0, 8.5], w: 2.4 }, { at: [12, 0], w: 1.6 }, { at: [-12, 0], w: 1.6 }], program: ['hall', 'shrine', 'kitchen', 'store'] },
      { id: 'wing_w', poly: rect(11, 9, -22.5, 0), y: 0.5, levels: [{ h: 2.4 }], wall: 0.3, roof: 'gable', pitch: pt(0.9),
        doors: [{ at: [-22.5, 4.5], w: 1.2 }], program: ['hall', 'dormitory'] },
      { id: 'wing_e', poly: rect(11, 9, 22.5, 0), y: 0.5, levels: [{ h: 2.4 }], wall: 0.3, roof: 'gable', pitch: pt(0.9),
        doors: [{ at: [22.5, 4.5], w: 1.2 }], program: ['hall', 'dormitory'] }],
    note: 'the hall on its platform (planned to the vault\'s springing; the gallery under the shell and the cupola are left out) and the two wing-halls' });
  add({ key: 'hl_tri_warrior_hall', name: "Warrior's hall", culture: 'painted', wealth: CIVIC, types: ['military'], lot: [40, 38],
    bodies: [{ id: 'hall', poly: rect(24, 10, 0, -9), y: 0.5, levels: [{ h: 3.4 }], wall: 0.3, roof: 'gable', pitch: pt(1.25),
      doors: [{ at: [0, -4], w: 1.5 }, { at: [12, -6.4], w: 0.9 }, { at: [-12, -6.4], w: 0.9 }], program: ['hall', 'barracks', 'barracks', 'store'] }],
    note: 'the palisade, the sparring ring and the racks are open' });
  add({ key: 'hl_tri_shaman', name: "Shaman's house", culture: 'painted', wealth: MID, types: ['religious'], lot: [20, 20],
    rooms: [{ id: 'lodge', kind: 'shrine', poly: circle(3.86, 8), y: 0.45, h: 2.5, doors: [{ at: [0, 3.57], w: 1 }] }],
    note: 'the octagonal log drum under the painted cone, one room' });
  add({ key: 'hl_tri_stone_circle', name: 'Stone circle', types: ['religious'], lot: [24, 30], skip: 'a ring of standing stones: open' });
  add({ key: 'hl_tri_farmhouse', name: 'Tribal farmhouse', culture: 'painted', wealth: POOR, types: ['farm', 'single-family dwelling'], lot: [24, 16],
    bodies: [{ id: 'house', poly: rect(8, 6), y: 0.4, levels: [{ h: 2.5 }], wall: 0.3, roof: 'gable', pitch: pt(1.1),
      doors: [{ at: [2.2, 3], w: 0.95 }], program: ['living', 'bedroom'] }],
    note: 'the byre beside it is a mat-walled lean-to open at the front' });
  add({ key: 'hl_tri_farm', name: 'Terraced farm', types: ['farm'], lot: [36, 26], skip: 'terraced fields and an open shelter' });
  add({ key: 'hl_tri_pen', name: 'Animal pen', types: ['farm'], lot: [16, 14], skip: 'a fenced pen with an open shelter along the back' });
  add({ key: 'hl_tri_granary', name: 'Stilted granary', culture: 'painted', wealth: POOR, types: ['farm'], lot: [12, 10],
    rooms: [{ id: 'drum', kind: 'store', poly: circle(2, 16), y: 2.06, h: 2.4, doors: [{ at: [0, 2], w: 0.8, swing: 'none' }] }],
    note: 'the mat drum on stilts, entered by the hatch up the ladder' });
  add({ key: 'hl_tri_smithy', name: 'Scrap smithy', types: ['industry'], lot: [16, 10],
    skip: 'open forge under a thatch shelter on four posts, one mat wall at the back' });

  /* the cliff settlement: twelve of the dwellings above hung on the rock face (84-tri-dwell.js buildHlTriCliffVillage), at the
     depths the builder computes from its rock (zf, reproduced with the kit's fbm: z is the house centre); on the cliff
     every floor is at the placement height (small_c on a 0.2 m sill) */
  const CLIFF = [['hl_tri_small_a', -34, 5, -1.32], ['hl_tri_large_b', -12, 4, 0.04], ['hl_tri_small_b', 7, 6, -0.55], ['hl_tri_large_a', 28, 4, 1.07],
    ['hl_tri_small_c', -24, 15, -2], ['hl_tri_small_a', -1, 15, -1.9], ['hl_tri_small_a', 5.5, 15, -1.9], ['hl_tri_small_b', 22, 16, -2.04],
    ['hl_tri_large_a', -14, 25, -0.07], ['hl_tri_small_a', 14, 27, -3.47], ['hl_tri_small_c', 30, 26, -3.76], ['hl_tri_small_b', -33, 31, -2.92]];
  add(Object.assign({ key: 'hl_tri_cliff_village', name: 'Cliff settlement', culture: 'painted', wealth: POOR, types: MF, units: 16, lot: [88, 30],
    note: 'the twelve houses the builder hangs on the rock (their own items at the placements and depths it computes); the walkways and stairs are open' },
    merge(CLIFF.map(function (h, i) { return place(h[0], h[1], h[3], 0, 'h' + (i + 1) + '.', h[2] + (h[0] === 'hl_tri_small_c' ? 0.2 : 0)); }))));

  /* ================================================================ TRIBAL — salvage (85b-tri-salvage.js) */
  add({ key: 'hl_tri_tank_round', name: 'Tank roundhouse', culture: 'painted', wealth: POOR, types: SF, lot: [11, 16],
    rooms: [{ id: 'tank', kind: 'cottage', poly: circle(2.05, 8), y: 1.5, h: 3.4, doors: [{ at: [0, 1.89], w: 0.9 }] }],
    note: 'a tank stood on end (4 m across) on the stilted deck, one round room' });
  add({ key: 'hl_tri_cont_long', name: 'Container longhouse', culture: 'painted', wealth: MID, types: MF, units: 2, lot: [18, 16],
    bodies: [-1, 1].map(function (s, i) {
      return { id: 'container' + (i + 1), poly: rect(6.05, 2.44, s * 3.05, -0.5), y: 1.8, levels: [{ h: 2.45 }], wall: 0.06, roof: 'flat',
        doors: [{ at: [s * 3, 0.72], w: 0.9 }], program: ['cottage'] };
    }),
    note: 'two containers end to end on the stilt frame, one household each; the great thatch gable over them is open-sided' });
  add({ key: 'hl_tri_hull_hall', name: 'Hull meeting house', types: ['civic'], lot: [18, 24],
    skip: 'open-sided: a hull vault on two rows of carved house-posts, only the back planked' });
  add({ key: 'hl_tri_silo_drum', name: 'Silo drum-house', culture: 'painted', wealth: POOR, types: ['single-family dwelling', 'farm'], lot: [20, 18],
    rooms: [{ id: 'drum', kind: 'cottage', poly: circle(2.9, 16), y: 0.3, h: 2.9, doors: [{ at: [0, 2.9], w: 1 }] }],
    note: 'the silo cut down to a drum, one round room; the little stilted granary (2.2 m across) is left out' });
  add({ key: 'hl_tri_scrap_forge', name: 'Scrap forge', types: ['industry', 'market/shop'], lot: [18, 16],
    skip: 'an open trading shelter under a thatch gable on posts; the container behind it has no door drawn' });

  /* ================================================================ reclaimed twins (88-hl-dress.js): the same geometry
     with salvage dressing (a corrugate lean-to on the +x side, open), wealth a notch lower */
  const NOTCH = function (w) { return w >= 0.8 ? 0.65 : w >= 0.65 ? 0.5 : w >= 0.5 ? 0.4 : 0.15; };
  ['hl_rep_house_poor_a', 'hl_rep_house_poor_b', 'hl_rep_house_poor_c', 'hl_rep_house_mid_a', 'hl_rep_house_mid_b', 'hl_rep_house_mid_c',
    'hl_rep_house_rich_a', 'hl_rep_house_rich_b', 'hl_rep_house_rich_c', 'hl_rep_tavern_a', 'hl_rep_tavern_b', 'hl_rep_tavern_c', 'hl_rep_inn',
    'hl_rep_shops', 'hl_rep_market_hall', 'hl_rep_smithy_small', 'hl_rep_smithy_large', 'hl_rep_stables', 'hl_rep_warehouse_a',
    'hl_rep_warehouse_b', 'hl_rep_wall', 'hl_rep_wall_tower', 'hl_rep_gate', 'hl_rep_granary', 'hl_rep_farmhouse', 'hl_rep_farm', 'hl_rep_pens',
    'hl_rep_windmill', 'hl_rep_watermill', 'hl_rus_house_poor_a', 'hl_rus_house_poor_b', 'hl_rus_house_mid_a', 'hl_rus_house_mid_b',
    'hl_rus_house_rich_a', 'hl_rus_house_rich_b', 'hl_rus_shops', 'hl_rus_tavern', 'hl_rus_smithy', 'hl_rus_granary', 'hl_rus_mill',
    'hl_rus_farmhouse', 'hl_rus_farm', 'hl_rus_pens', 'hl_tri_small_a', 'hl_tri_small_b', 'hl_tri_small_c', 'hl_tri_large_a', 'hl_tri_large_b',
    'hl_tri_farmhouse', 'hl_tri_farm', 'hl_tri_pen', 'hl_tri_granary', 'hl_tri_smithy'].forEach(function (k) {
    const B = byKey(k), it = { key: k + '_reclaimed', name: B.name + ' (reclaimed)', like: k };
    if (!B.skip) it.wealth = NOTCH(B.wealth);
    add(it);
  });

  IX.sets.add({ set: 'highlands', title: 'Highlands: Republican, Rustic, Tribal', culture: 'republican', items: L });
})(KratorInteriors);
