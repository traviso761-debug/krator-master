/* ======================== Interior set: Iziz Vernacular (settlements/iziz) ========================
   The interiors of the Iziz Vernacular building kit: one item per VERN.def key (settlements/iziz
   src/70-vern-dwellings.js, 71-vern-trade.js, 72-vern-civic.js, 73-vern-infra.js, 74-vern-guilds.js and
   74b-vern-frontier.js, the frontier set built for Verge's upper city), plus `<key>#n` where a variant's
   rooms differ a lot from variant 0 (the rest stop).
   Local frame = the builders': origin at the plot centre on the ground, +z the front (the door side), metres.
   The builders draw every body as a solid box (walls implied), so `poly` is the box's outer face and `y` the
   top of its plinth or floor. Where a builder stacks a storey on a cornice, the lower level's h is chosen so
   the planner's next floor (y + h + 0.25 slab) lands on the drawn one.
   Furniture culture: iziz (common, court; the poor tier pulls from the generic sets through the culture
   chain). Wealth from the def's tag: poor 0.2, middle 0.5, rich 0.8, civic 0.65.
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  /* the builder's roof rise / half-span -> the planner's pitch in radians */
  const pt = function (r) { return Math.round(Math.atan(r) * 100) / 100; };
  const POOR = 0.2, MID = 0.5, RICH = 0.8, CIVIC = 0.65;
  const SF = ['single-family dwelling'], MF = ['multi-family dwelling'];
  const L = [];
  const add = function (it) { L.push(it); return it; };

  /* ---------------- THE TRADES' ROOMS (2026-10-16: the trade buildings after the Voth census, settlements/iziz VERN_TRADES).
     A trade's selling room `izshop_<t>` requires its goods; its workroom `izwork_<t>` requires its workstation, by catalog
     role (the iziz_trade_* set, the iziz common set's loom, workbench, desk and bookcase, iziz_bread_oven, iziz_butcher_block;
     a poor room takes the generic and scrap sets' pieces of the same role through the culture chain). Each kind also takes
     the pieces of the older kinds in IX.KIND_ALIAS. A building item names these kinds in its programme like any other. */
  const SEATS = IX.SEAT_TYPES, FOOD = IX.FOOD_ROLES, SURFACE = IX.SURFACE_GROUP;
  const IZ_TRADES = [
    { t: 'bakery', goods: { types: ['counter', 'stack', 'storage', 'shelf'], n: 1 }, work: { types: ['stove'], roles: ['oven', 'hearth'], n: 1 }, also: ['kitchen'] },
    { t: 'butcher', goods: { types: ['counter', 'storage'], n: 1 }, work: { types: ['workstation'], roles: ['block'], n: 1 }, also: ['kitchen'] },
    { t: 'brewery', goods: { types: ['storage'], roles: ['barrel'], n: 1 }, work: { types: ['workstation', 'storage'], roles: ['still', 'vat'], n: 1 } },
    { t: 'weaver', goods: { types: ['rack', 'stack', 'shelf'], n: 1 }, work: { types: ['loom'], roles: ['loom'], n: 1 } },
    { t: 'dyer', work: { types: ['storage'], roles: ['vat'], n: 1 } },
    { t: 'tannery', work: { types: ['storage'], roles: ['vat'], n: 1 } },
    { t: 'tailor', goods: { types: ['rack', 'stack', 'shelf'], n: 1 }, work: { types: ['table', 'workstation'], roles: ['table', 'workbench'], n: 1 } },
    { t: 'scribe', goods: { types: ['shelf'], roles: ['bookcase', 'wall_shelves'], n: 1 }, work: { types: ['desk'], roles: ['desk'], n: 1 }, also: ['study', 'library'] },
    { t: 'apothecary', goods: { types: ['shelf', 'vessel'], n: 2 }, work: { types: ['workstation'], roles: ['still', 'workbench'], n: 1 } },
    { t: 'tinker', goods: { types: ['shelf', 'stack', 'rack'], n: 1 }, work: { types: ['workstation'], roles: ['workbench', 'lathe', 'grindstone'], n: 1 } },
    { t: 'glass', goods: { types: ['shelf', 'stack'], n: 1 }, work: { types: ['stove'], roles: ['kiln'], n: 1 } },
    { t: 'provisioner', goods: { types: ['storage', 'stack', 'vessel'], roles: FOOD, n: 2 } },
    { t: 'mill', work: { types: ['workstation', 'storage'], roles: ['press', 'bin', 'grindstone'], n: 1 } },
    { t: 'salvage', work: { types: ['workstation', 'stove'], roles: ['workbench', 'forge', 'anvil', 'grindstone'], n: 1 } },
    { t: 'boat', work: { types: ['workstation'], roles: ['workbench', 'lathe'], n: 1 } },
    { t: 'smith', work: { types: ['stove', 'workstation'], roles: ['forge', 'anvil'], n: 1 }, also: ['smithy'] }
  ];
  if (!IX.PROGRAMS.izwork_bakery) {
    IZ_TRADES.forEach(function (T) {
      if (T.goods) {
        IX.PROGRAMS['izshop_' + T.t] = { require: [Object.assign({ need: 'goods' }, T.goods)],
          optional: [{ types: ['counter'], max: 1 }, { types: ['shelf', 'rack', 'storage', 'stack', 'vessel'], max: 3 }, { types: SEATS, max: 1 }, { types: ['lamp'], max: 2 }, SURFACE],
          extra: 5 };
        IX.KIND_ALIAS['izshop_' + T.t] = ['shop', 'store'];
        IX.KIND_WEIGHT['izshop_' + T.t] = 1.4;
      }
      if (T.work) {
        IX.PROGRAMS['izwork_' + T.t] = { require: [Object.assign({ need: 'work' }, T.work)],
          optional: [{ types: ['workstation'], max: 1 }, { types: ['rack', 'shelf', 'storage', 'stack', 'vessel'], max: 3 }, { types: SEATS, max: 1 }, { types: ['table'], max: 1 }, { types: ['lamp'], max: 1 }, SURFACE],
          extra: 5 };
        IX.KIND_ALIAS['izwork_' + T.t] = ['workshop', 'store'].concat(T.also || []);
        IX.KIND_WEIGHT['izwork_' + T.t] = 1.6;
      }
    });
  }

  /* ================================================================ dwellings (70-vern-dwellings.js) */
  add({ key: 'vern_house_poor_a', name: 'Stilt hut', wealth: POOR, types: SF, lot: [8, 10],
    bodies: [{ id: 'hut', poly: rect(5.3, 5.9), y: 1.7, levels: [{ h: 2.5 }], wall: 0.15, roof: 'gable', pitch: pt(2.7 / 2.95),
      doors: [{ at: [0, 2.95], w: 0.95 }], program: ['cottage'] }],
    note: 'one board room on stilts (floor 1.7), entered from the front platform up the ladder; the thatch loft is not planned' });
  add({ key: 'vern_house_poor_b', name: 'Corrugate shack', wealth: POOR, types: SF, lot: [10, 8],
    bodies: [{ id: 'shack', poly: rect(5.8, 4.8), y: 0.35, levels: [{ h: 2.6 }], wall: 0.12, roof: 'flat',
      doors: [{ at: [-1.4, 2.4], w: 0.95 }], program: ['cottage'] }],
    note: 'one salvage room on a rubble pad under a shed roof (planned flat); the tarp lean-to on +x is open' });
  add({ key: 'vern_house_poor_c', name: 'Panel house', wealth: POOR, types: SF, lot: [9, 10],
    bodies: [{ id: 'house', poly: rect(6.2, 6.0), y: 0.6, levels: [{ h: 2.7 }], wall: 0.1, roof: 'hip', pitch: pt(2.4 / 3.1),
      doors: [{ at: [-0.6, 3.0], w: 0.95 }], program: ['cottage'] }],
    note: 'one panel-walled room on low stilts, the veranda in front is open; hollow, the room is the board lining inside the ' +
      'panels (6.2 x 6.0), and the panels are cut round the door and windows' });
  add({ key: 'vern_house_mid_a', name: 'Plaster townhouse', wealth: MID, types: SF, lot: [10, 13],
    bodies: [{ id: 'house', poly: rect(8.4, 8.8), y: 0.4, levels: [{ h: 3.35 }, { h: 3.0 }], wall: 0.3, roof: 'gable', pitch: pt(2.5 / 4.4),
      doors: [{ at: [-1.6, 4.4], w: 1.15 }], program: [['living', 'kitchen'], ['bedroom', 'bedroom']] }],
    note: 'two plaster storeys over a timber string course; the porch and the gable attic are not planned' });
  add({ key: 'vern_house_mid_b', name: 'Setback house', wealth: MID, types: MF, units: 2, lot: [12, 11],
    bodies: [{ id: 'lower', poly: rect(9.4, 9), y: 0.35, levels: [{ h: 3.4 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [-2.6, 4.5], w: 1.1 }, { at: [2.6, 4.5], w: 1.1 }], program: ['living', 'kitchen', 'bedroom', 'bedroom'] },
      { id: 'upper', poly: rect(6.2, 5.6, 0, -1.45), y: 4.59, levels: [{ h: 2.9 }], wall: 0.25, roof: 'hip', pitch: pt(2.0 / 2.8),
        doors: [{ at: [0, 1.35], w: 1.0 }], program: ['cottage'] }],
    note: 'two households: the ground storey (two street doors) and the set-back upper storey, entered from the roof terrace up ' +
      'the outside stair on +x, each its own body; the terrace is open' });
  add({ key: 'vern_house_mid_c', name: 'Long house', wealth: MID, types: SF, lot: [15, 14],
    bodies: [{ id: 'house', poly: rect(10.88, 7.08), y: 0.5, levels: [{ h: 3.7 }], wall: 0.25, roof: 'hip', pitch: pt(2.8 / 3.6),
      doors: [{ at: [-1.8, 3.54], w: 1.1 }, { at: [2.8, 3.54], w: 1.0 }], program: ['living', 'kitchen', 'bedroom', 'bedroom'] }],
    note: 'one storey on low stilts behind the full-width veranda (open)' });
  add({ key: 'vern_house_rich_a', name: 'Stone manor', wealth: RICH, types: SF, lot: [28, 24],
    bodies: [{ id: 'manor', poly: [[-3.7, -4.7], [5.5, -4.7], [5.5, 4.7], [-5.5, 4.7], [-5.5, -2.7], [-3.7, -2.7]], y: 1.6,
      levels: [{ h: 4.77 }, { h: 3.4 }], wall: 0.45, roof: 'hip', pitch: pt(2.7 / 4.7),
      doors: [{ at: [0, 4.7], w: 1.7 }], program: [['hall', 'kitchen'], ['bedroom', 'bedroom', 'study']] }],
    note: 'hollow, the ground storey is drawn as straight ashlar walls 0.91 thick on the cornice\'s outline (12.04 x 10.32) over a ' +
      'battered skirt 1 m high (its top the floor, 1.6), a stone perron up to the door; both storeys are planned on the gallery ' +
      'storey\'s 11 x 9.4 (the ground storey\'s inner face, give or take 6 cm), less the corner the solid tower takes; the plinth cap ' +
      'and the stepped cornice are 1.42 m of stone, so the ground storey is planned 4.77 high to put the gallery floor on its drawn ' +
      'height (6.62); the tower, the balcony (no door onto it) and the walled court are not planned. Without interiors the ground ' +
      'storey is the battered block (14 x 12 at its foot) it always was' });
  add({ key: 'vern_house_rich_b', name: 'Domed house', wealth: RICH, types: SF, lot: [26, 23],
    bodies: [{ id: 'house', poly: rect(12.4, 11.6), y: 0.5, levels: [{ h: 4.65 }, { h: 3.5, poly: rect(11.8, 11) }], wall: 0.45, roof: 'flat',
      doors: [{ at: [0, 5.8], w: 1.6 }], program: [['hall', 'living', 'kitchen', 'store'], ['bedroom', 'bedroom', 'study', 'bedroom']] }],
    note: 'two ashlar storeys under a parapet and the dome (the drum is not planned), the upper one planned on its own drawn ' +
      '11.8 x 11; the loggia in front and the garden are open' });

  /* ================================================================ trade and industry (71-vern-trade.js) */
  add({ key: 'vern_shops', name: 'Shop row', wealth: MID, types: ['market/shop'], lot: [18, 12],
    bodies: [-4.6, 0, 4.6].map(function (x, i) {
      return { id: 'unit' + (i + 1), poly: rect(4.6, 7.4, x, 0), y: 0.3, levels: [{ h: 3.3 }], wall: 0.2, roof: 'gable', pitch: pt(2.2 / 3.7),
        doors: [{ at: [x + 1.55, 3.7], w: 0.9 }], program: ['shop', 'store'] };
    }),
    note: 'three units under one roof, each its own body (the party walls); each sells over the counter in its shop-front opening, ' +
      'the door beside it' });
  add({ key: 'vern_tavern', name: 'Tavern', wealth: MID, types: ['tavern/inn'], lot: [22, 20],
    bodies: [{ id: 'hall', poly: rect(15.84, 9.84), y: 0.35, levels: [{ h: 4.05 }, { h: 2.6 }], wall: 0.3, roof: 'gable', pitch: pt(4.2 / 5),
      doors: [{ at: [0, 4.92], w: 1.5 }], program: [['tavern', 'kitchen', 'store'], ['bedroom', 'bedroom', 'bedroom', 'bedroom']] }],
    note: 'the long hall and the inn rooms in the board storey above; the cross-gabled porch is open' });
  add({ key: 'vern_workshop_a', name: "Carpenter's workshop", wealth: MID, types: ['industry'], lot: [14, 12],
    bodies: [{ id: 'store', poly: rect(8.8, 3.85, 0, -1.575), y: 0.2, levels: [{ h: 3.4 }], wall: 0.12, roof: 'flat',
      doors: [{ at: [-1.2, 0.35], w: 1.0 }], program: ['store'] }],
    rooms: [{ id: 'shed', kind: 'workshop', poly: rect(8.7, 2.9, 0, 1.85), y: 0.2, h: 3.3, doors: [{ at: [0, 3.3], w: 8.0, swing: 'none' }],
      fixtures: [{ id: 'bench-a', kind: 'bench', x: -2.2, z: 2.1, ry: 0, w: 3.2, d: 0.9, h: 0.9, reach: false },
        { id: 'bench-b', kind: 'bench', x: 2.4, z: 2.2, ry: 0, w: 2.4, d: 0.8, h: 0.9, reach: false }] }],
    note: 'the open-fronted shed (its two benches are fixtures) and the board-walled back half as the timber store, its door ' +
      'from the shed drawn only when hollow (the solid block has none)' });
  add({ key: 'vern_workshop_b', name: "Potter's workshop", wealth: MID, types: ['industry', 'market/shop'], lot: [16, 12],
    bodies: [{ id: 'shop', poly: rect(7.86, 6.86), y: 0.3, levels: [{ h: 3.2 }], wall: 0.25, roof: 'hip', pitch: pt(2.1 / 3.5),
      doors: [{ at: [2.4, 3.43], w: 1.0 }], program: ['shop', 'workshop'] }],
    note: 'the sales front (its counter stands outside the opening) and the workroom; the kiln and its drying shelves are outside' });
  add({ key: 'vern_smithy', name: 'Scrap smithy', wealth: POOR, types: ['industry'], lot: [18, 14],
    skip: 'open forge shed on pipe posts: one back wall of plate, nothing enclosed' });
  add({ key: 'vern_market', name: 'Market canopy', wealth: MID, types: ['market/shop'], lot: [30, 22],
    skip: 'open market canopy on posts over rows of stalls: nothing enclosed' });
  add({ key: 'vern_warehouse', name: 'Warehouse', wealth: MID, types: ['industry'], lot: [30, 20],
    bodies: [{ id: 'shed', poly: rect(21.8, 11.8), y: 0.9, levels: [{ h: 5.2 }], wall: 0.25, roof: 'gable', pitch: pt(3.4 / 11),
      doors: [{ at: [-6, 5.9], w: 2.2 }, { at: [0, 5.9], w: 2.2 }, { at: [6, 5.9], w: 2.2 }, { at: [10.9, -1], w: 3.6 }], program: ['store', 'store', 'store'] },
      { id: 'office', poly: rect(4.6, 4.8, -13.6, 3.5), y: 0, levels: [{ h: 3.0 }], wall: 0.15, roof: 'flat',
        doors: [{ at: [-13.6, 5.9], w: 1.0 }], program: ['study'] }],
    note: 'the shed at loading height (0.9) behind the dock, three doors on the front and the gable door on +x; the lean-to office ' +
      'on -x; the loft hatch is not planned' });

  /* ================================================================ civic (72-vern-civic.js) */
  add({ key: 'vern_school', name: 'School', wealth: CIVIC, types: ['civic'], lot: [34, 30],
    bodies: [{ id: 'hall', poly: rect(16, 8, 0, -7), y: 0.5, levels: [{ h: 4.07 }, { h: 3.6 }], wall: 0.45, roof: 'hip',
      pitch: pt(2.6 / 3.8), doors: [{ at: [0, -3], w: 1.7 }], program: [['school', 'school'], ['library', 'study']] },
      { id: 'wing-w', poly: rect(7, 13, -10.5, 1.5), y: 0.5, levels: [{ h: 3.6 }], wall: 0.4, roof: 'flat',
        doors: [{ at: [-7, -4.1], w: 1.2 }], program: ['school', 'school'] },
      { id: 'wing-e', poly: rect(7, 13, 10.5, 1.5), y: 0.5, levels: [{ h: 3.6 }], wall: 0.4, roof: 'flat',
        doors: [{ at: [7, -4.1], w: 1.2 }], program: ['school', 'school'] }],
    note: 'the two-storey hall and the two classroom wings round the yard (their shed roofs planned flat); the bell tower and the ' +
      'yard shade are not planned' });
  add({ key: 'vern_hospital', name: 'Hospital', wealth: CIVIC, types: ['civic'], lot: [38, 28],
    bodies: [{ id: 'ward', poly: rect(26, 9, 0, -2), y: 0.7, levels: [{ h: 4.8 }], wall: 0.45, roof: 'gable', pitch: pt(2.6 / 4.5),
      doors: [{ at: [-7.43, 2.5], w: 1.3 }, { at: [3.71, 2.5], w: 1.3 }, { at: [-7.43, -6.5], w: 1.3 }, { at: [3.71, -6.5], w: 1.3 }],
      program: ['dormitory', 'dormitory', 'dormitory', 'store'] },
      { id: 'pavilion', poly: rect(8, 5.7, 0, 5.35), y: 0.7, levels: [{ h: 4.87 }, { h: 3.0 }], wall: 0.45, roof: 'flat',
        doors: [{ at: [0, 8.2], w: 1.9 }, { at: [3.71, 2.5], w: 1.3 }], program: [['antechamber', 'study'], ['study', 'library']] },
      { id: 'store', poly: rect(3.2, 5, 15.6, -2), y: 0.7, levels: [{ h: 3.2 }], wall: 0.4, roof: 'hip', pitch: pt(1.2 / 2.5),
        doors: [{ at: [15.6, 0.5], w: 1.0 }], program: ['store'] }],
    note: 'the long ward (its front door at x 3.7 opens into the domed entrance pavilion, which is planned as its own body up to the ' +
      'ward face), the pavilion (the drum and dome are not planned) and the store room on +x; the verandas and the herb court are open' });
  add({ key: 'vern_barracks', name: 'Barracks and drill yard', wealth: CIVIC, types: ['civic', 'military'], lot: [48, 38],
    bodies: [{ id: 'block-w', poly: rect(8, 20, -13.5, -2), y: 0.4, levels: [{ h: 3.6 }], wall: 0.3, roof: 'gable', pitch: pt(2.4 / 4),
      doors: [{ at: [-9.5, -7], w: 1.2 }, { at: [-9.5, 3], w: 1.2 }], program: ['barracks', 'barracks', 'barracks', 'store'] },
      { id: 'block-e', poly: rect(8, 20, 13.5, -2), y: 0.4, levels: [{ h: 3.6 }], wall: 0.3, roof: 'gable', pitch: pt(2.4 / 4),
        doors: [{ at: [9.5, -7], w: 1.2 }, { at: [9.5, 3], w: 1.2 }], program: ['barracks', 'barracks', 'barracks', 'store'] },
      { id: 'armoury', poly: rect(9, 6, 0, -11.5), y: 0, levels: [{ h: 3.4 }], wall: 0.5, roof: 'hip', pitch: pt(1.4 / 3),
        doors: [{ at: [0, -8.5], w: 1.6 }], program: ['store'], windows: false }],
    note: 'the two barrack blocks (doors to the yard) and the stone armoury; the watch tower (ladder landings only), the gate towers ' +
      'and the drill yard are open' });
  add({ key: 'vern_alchemist', name: "Alchemist's compound", wealth: CIVIC, types: ['civic', 'industry'], lot: [32, 28],
    bodies: [{ id: 'house', poly: rect(11, 8, -5, -5), y: 0.4, levels: [{ h: 3.87 }, { h: 3.2 }], wall: 0.4, roof: 'hip',
      pitch: pt(2.4 / 3.85), doors: [{ at: [-3.5, -1], w: 1.4 }], program: [['workshop', 'study', 'store'], ['library', 'bedroom']] }],
    note: 'the two-storey house only. The lab tower is a solid stone drum with no door (its glass lantern is not a floor), and the ' +
      'still-house is an open shed whose stills and bench fill its open half, the back half a solid plaster block with no door' });

  /* ================================================================ infrastructure (73-vern-infra.js) */
  add({ key: 'vern_silos', name: 'Grain silos', wealth: MID, types: ['farm', 'infrastructure'], lot: [22, 16],
    skip: 'four stave grain bins on stilts filled through a hatch from a ladder, and an open loading deck: no room a person uses' });
  add({ key: 'vern_tank', name: 'Storage tank', wealth: MID, types: ['infrastructure'], lot: [24, 16],
    bodies: [{ id: 'pump-hut', poly: rect(3.2, 3.0, -8.2, 1.5), y: 0, levels: [{ h: 2.6 }], wall: 0.12, roof: 'flat',
      doors: [{ at: [-8.2, 3.0], w: 0.9 }], program: ['store'] }],
    note: 'the pump hut only; the tank is a closed vessel' });
  add({ key: 'vern_generator', name: 'Electric generator', wealth: CIVIC, types: ['infrastructure', 'civic'], lot: [24, 18],
    rooms: [{ id: 'engine-house', kind: 'workshop', poly: rect(7.4, 6.2, 0, -0.6), y: 0.4, h: 4.6, doors: [{ at: [0, 2.5], w: 7.4, swing: 'none' }],
      fixtures: [{ id: 'machine', kind: 'machine', x: -0.6, z: -1.2, ry: 0, w: 5.2, d: 3.4, h: 3.2, reach: false },
        { id: 'switchboard', kind: 'machine', x: 4.05, z: 2.4, ry: 0, w: 0.3, d: 1.0, h: 2.6, reach: false }] }],
    note: 'the engine house, open on the front: three stone walls round the machine (a fixture)' });

  /* ================================================================ guilds (74-vern-guilds.js) */
  add({ key: 'vern_farmers_guild', name: "Farmers' Guild", wealth: CIVIC, types: ['civic', 'farm'], lot: [30, 22],
    bodies: [{ id: 'hall', poly: [[-8, -9], [8, -9], [8, 2], [3.3, 2], [3.3, 4.7], [-3.3, 4.7], [-3.3, 2], [-8, 2]], y: 0.6,
      levels: [{ h: 3.97 }, { h: 3.0 }], wall: 0.3, roof: 'gable', pitch: pt(5.2 / 5.5),
      doors: [{ at: [0, 4.7], w: 2.0 }, { at: [-3.8, -9], w: 1.2 }], program: [['hall', 'store', 'study'], ['library', 'store', 'study']] },
      { id: 'granary', poly: rect(5.6, 7.2, -11.8, -3.0), y: 2.5, levels: [{ h: 3.2 }], wall: 0.12, roof: 'gable', pitch: pt(2.6 / 2.8),
        doors: [{ at: [-11.8, 0.6], w: 1.1 }], program: ['store'] }],
    note: 'the half-timber hall with its entrance bay (one L-plan body), and the grain loft on stilts reached by its ladder; the cart ' +
      'shed and the silo are not planned' });
  add({ key: 'vern_beast_hunters_guild', name: "Beast Hunters' Guild", wealth: CIVIC, types: ['civic', 'military'], lot: [28, 22],
    bodies: [{ id: 'hall', poly: rect(14, 10, -4.5, -4), y: 0.7, levels: [{ h: 4.2 }], wall: 0.3, roof: 'gable', pitch: pt(3.8 / 5),
      doors: [{ at: [-4.5, 1], w: 2.0 }, { at: [-10.5, -9], w: 1.1 }], program: ['hall', 'store', 'study'] }],
    note: 'the trophy hall; the towering porch, the beast pen and the watch platform are open' });
  add({ key: 'vern_caravanserai', name: 'Caravanserai', wealth: MID, types: ['tavern/inn', 'market/shop'], lot: [36, 30],
    bodies: [[-16.2, -9.6], [-9.6, -3.6], [-3.6, 3.6], [3.6, 9.6], [9.6, 16.2]].map(function (e, i) {
      return { id: 'lodging' + (i + 1), poly: rect(e[1] - e[0], 3.9, (e[0] + e[1]) / 2, -11.35), y: 0.4, levels: [{ h: 2.9 }], wall: 0.2, roof: 'flat',
        doors: [{ at: [[-12, -6, 0, 6, 12][i], -9.4], w: 1.1 }], program: ['dormitory'] };
    }).concat([-1, 1].map(function (s) {
      return { id: s < 0 ? 'stores-w' : 'stores-e', poly: rect(11.3, 3.9, s * 10.45, 11.35), y: 0.4, levels: [{ h: 2.9 }], wall: 0.2, roof: 'flat',
        doors: [{ at: [s * 7.6, 9.4], w: 1.7 }, { at: [s * 12.4, 9.4], w: 1.7 }], program: ['store', 'store'] };
    })),
    note: 'the lodging range on the back wall (five rooms, one per door; hollow, the builder draws the party walls between them, ' +
      'clear of the windows) and the store ranges either side of the gate; the room over ' +
      'the gate has no stair and no door (not planned); the stables and the stall arcade are open' });
  add({ key: 'vern_forgemasters_hall', name: "Forgemaster's Hall", wealth: CIVIC, types: ['civic', 'industry'], lot: [40, 32],
    rooms: [{ id: 'hall', kind: 'smithy', poly: rect(28, 18, 0, -5), y: 0.5, h: 9.5, doors: [{ at: [0, 4], w: 9, swing: 'none' }],
      fixtures: [{ id: 'gantry', kind: 'machine', x: 0, z: -3.5, ry: 0, w: 10.4, d: 8, h: 9.3, reach: false },
        { id: 'forge', kind: 'machine', x: -10.5, z: -12.4, ry: 0, w: 3.2, d: 2.4, h: 3.6, reach: false },
        { id: 'arm-bench', kind: 'bench', x: -9.5, z: -1.5, ry: 0, w: 4.6, d: 1.3, h: 1.2, reach: false },
        { id: 'tool-bench', kind: 'bench', x: 13.4, z: -11, ry: 0, w: 1.0, d: 6.0, h: 1.6, reach: false },
        { id: 'drums', kind: 'machine', x: 11.3, z: -2.3, ry: 0, w: 2.0, d: 2.9, h: 1.2, reach: false }] }],
    note: 'one hollow hall behind the 9 m opening; the mech in its gantry, the forge, the benches and the drums are fixtures' });

  /* ================================================================ the frontier (74b-vern-frontier.js, Verge's upper city) */
  add({ key: 'vern_governor_palace', name: "Governor's Palace", wealth: CIVIC, types: ['civic', 'single-family dwelling'], lot: [42, 36],
    bodies: [{ id: 'palace', poly: [[-15, -14], [15, -14], [15, 0], [5.5, 0], [5.5, 4.4], [-5.5, 4.4], [-5.5, 0], [-15, 0]], y: 1.63,
      levels: [{ h: 5.22 }, { h: 4.2 }], wall: 0.5, roof: 'hip', pitch: pt(3.4 / 6.8),
      doors: [{ at: [0, 4.4], w: 2.2 }, { at: [15, -10], w: 1.4 }],
      program: [['antechamber', 'hall', 'hall', 'study', 'kitchen', 'store', 'store'], ['hall', 'living', 'bedroom', 'bedroom', 'study', 'library', 'bedroom']] },
      { id: 'lodge', poly: rect(4, 3.6, -15.5, 12.6), y: 0, levels: [{ h: 3.0 }], wall: 0.4, roof: 'hip', pitch: pt(1.6 / 2),
        doors: [{ at: [-13.5, 12.6], w: 1.0 }], program: ['antechamber'] }],
    note: 'the main block and its front pavilion as one T-plan body on the podium: the entrance hall in the pavilion, the hall and ' +
      'offices below, the audience hall and the governor\'s household above (the drawn upper storey is 0.2 m in from the ground ' +
      'storey\'s face and the pavilion\'s upper floors sit 0.1 m higher than the block\'s: planned on one footprint and one floor). ' +
      'Not planned: the pavilion\'s third storey under the dome and the flag tower (no stair drawn above the roof). The gate lodge ' +
      'is its own body' });
  add({ key: 'vern_guard_tower', name: 'Guard tower and barracks', wealth: CIVIC, types: ['military', 'civic'], lot: [26, 20],
    bodies: [{ id: 'tower', poly: rect(9, 9, -6.5, -1), y: 0.6, levels: [{ h: 3.55 }, { h: 3.55 }, { h: 3.55 }], wall: 0.6, roof: 'flat',
      doors: [{ at: [-6.5, 3.5], w: 1.6 }], program: [['antechamber', 'store'], ['barracks'], ['study']] },
      { id: 'barracks', poly: rect(13, 7, 4.5, -1.5), y: 0.5, levels: [{ h: 3.47 }, { h: 3.0 }], wall: 0.35, roof: 'hip', pitch: pt(2.3 / 3.5),
        doors: [{ at: [1.2, 2], w: 1.2 }, { at: [7.8, 2], w: 1.2 }], program: [['barracks', 'hall', 'kitchen'], ['barracks', 'barracks']] }],
    note: 'the three-storey tower (the guard room and armoury, a barrack floor, the officers\' room; the roof platform is open and its ' +
      'stair kiosk stands over the plan\'s stair) and the two-storey barrack block beside it' });
  add({ key: 'vern_watch_house', name: 'Watch house', wealth: CIVIC, types: ['civic', 'military'], lot: [10, 9],
    bodies: [{ id: 'post', poly: rect(6.4, 5.6, 0, -0.8), y: 0.4, levels: [{ h: 3.27 }, { h: 2.8 }], wall: 0.4, roof: 'hip', pitch: pt(2.6 / 2.8),
      doors: [{ at: [-1.4, 2], w: 1.1 }], program: [['antechamber', 'store'], ['barracks']] }],
    note: 'the watch room and a lock-up below, the watchmen\'s bunks above' });
  add({ key: 'vern_toll_house', name: 'Toll house', wealth: CIVIC, types: ['civic', 'infrastructure'], lot: [14, 10],
    bodies: [{ id: 'house', poly: rect(7.5, 6.5, -0.3, 0), y: 0.4, levels: [{ h: 3.27 }, { h: 2.8 }], wall: 0.4, roof: 'hip', pitch: pt(2.2 / 3.25),
      doors: [{ at: [-2.6, 3.25], w: 1.1 }], program: [['shop', 'store'], ['living', 'bedroom']] }],
    rooms: [{ id: 'strongroom', kind: 'store', poly: rect(1.7, 3.5, -5.35, -0.6), y: 0.1, h: 2.6, doors: [{ at: [-4.5, -0.6], w: 0.9 }] }],
    note: 'the toll room behind the window and counter on the road side (+x) and the clerk\'s office below, the keeper\'s rooms above; ' +
      'the strongroom annex on -x is entered from inside (no outer door)' });
  add({ key: 'vern_palisade', name: 'Palisade (segment)', wealth: CIVIC, types: ['infrastructure', 'military'], lot: [6, 2.6],
    skip: 'one modular wall segment: nothing enclosed' });
  add({ key: 'vern_palisade_gate', name: 'Palisade gate', wealth: CIVIC, types: ['infrastructure', 'military'], lot: [14, 4],
    skip: 'an open road gate; its two log towers are 2.0 m closets (inside 1.6 m) with a ladder to the platform' });
  add({ key: 'vern_mustering_ground', name: 'Mustering ground', wealth: CIVIC, types: ['military', 'civic'], lot: [44, 32],
    skip: 'open drill yard inside a low wall; the reviewing stand is an open deck under a roof on posts' });
  add({ key: 'vern_rest_stop', name: 'Rest stop', wealth: MID, types: ['infrastructure'], lot: [18, 12],
    rooms: [{ id: 'chamber', kind: 'dormitory', poly: rect(10, 3.6, 0, -3.4), y: 0.2, h: 3.4, doors: [{ at: [0, -1.6], w: 1.1 }] }],
    note: 'variant 0: the chamber cut into the rock behind the arch (10 x 3.6, its timber screen and door in the 1 m arch passage); ' +
      'the benches, the cistern, the trough and the awning are outside. Variant 1 (on the cliff edge) is vern_rest_stop#1' });
  add({ key: 'vern_rest_stop#1', name: 'Rest stop (variant 2: built on the cliff edge)', wealth: MID, types: ['infrastructure'], lot: [18, 12],
    rooms: [{ id: 'shelter', kind: 'living', poly: rect(4.7, 4.3, -5.8, -2.3), y: 0.15, h: 2.8, doors: [{ at: [-3.45, -2.3], w: 1.0 }] }],
    note: 'the one-room stone shelter with its hearth (the chimney on the back wall), entered from the platform on its +x end; the ' +
      'platform, the trough and the shade by the parapet are open' });

  /* ================================================================ the trades round: food trades (71a-vern-food.js) */
  /* @@ag-food@@ */
  add({ key: 'vern_bakery', name: 'Bakery', wealth: MID, types: ['market/shop', 'single-family dwelling'], lot: [19, 16],
    bodies: [{ id: 'bakehouse', poly: rect(10, 8), y: 0.4, levels: [{ h: 3.35 }, { h: 2.9 }], wall: 0.3, roof: 'gable', pitch: pt(2.5 / 4),
      doors: [{ at: [-4.0, 4], w: 1.0 }, { at: [2.8, -4], w: 1.0 }], program: [['izshop_bakery', 'izwork_bakery'], ['living', 'bedroom']] }],
    note: 'the shop (street door, counter hatch) and the bakehouse below, the household above; the domed oven, its lean-to and the ' +
      'woodpile stand outside the +x wall; the gable attic is not planned' });
  add({ key: 'vern_butcher', name: "Butcher's shop and smokehouse", wealth: MID, types: ['market/shop', 'single-family dwelling'], lot: [16, 18],
    bodies: [{ id: 'shop', poly: rect(7.6, 6.4, -2.4, 1.0), y: 0.35, levels: [{ h: 3.2 }], wall: 0.25, roof: 'gable', pitch: pt(2.0 / 3.2),
      doors: [{ at: [0.35, 4.2], w: 1.0 }, { at: [-0.9, -2.2], w: 0.95 }], program: ['izshop_butcher', 'izwork_butcher'] },
      { id: 'cottage', poly: rect(7.0, 4.4, -2.4, -5.4), y: 0.35, levels: [{ h: 2.9 }], wall: 0.25, roof: 'hip', pitch: pt(1.8 / 2.2),
        doors: [{ at: [-5.9, -5.4], w: 0.95 }], program: ['cottage'] },
      { id: 'smokehouse', poly: rect(3.6, 3.6, 4.6, -1.4), y: 0.15, levels: [{ h: 4.2 }], wall: 0.15, roof: 'gable', pitch: pt(1.4 / 1.8),
        doors: [{ at: [4.0, 0.4], w: 0.95 }], program: ['store'] }],
    note: 'the meat shop sells over the counter in its wide hatch under the deep eave (the hooks and the block are outside); the ' +
      'butcher\'s cottage behind across the passage; the smokehouse is a store, its meat racks hung above 3 m, seen through the slats' });
  add({ key: 'vern_brewery', name: 'Brewery', wealth: MID, types: ['industry', 'tavern/inn'], lot: [21, 16],
    bodies: [{ id: 'brewhouse', poly: rect(15, 8, -0.8, 0), y: 0.4, levels: [{ h: 4.2 }], wall: 0.3, roof: 'gable', pitch: pt(3.0 / 4),
      doors: [{ at: [-4.55, 4], w: 1.1 }, { at: [0.45, 4], w: 1.7 }, { at: [5.45, -4], w: 1.0 }, { at: [6.7, -2.7], w: 1.2 }],
      program: ['izshop_brewery', 'izwork_brewery', 'store'] }],
    note: 'the taproom (-x, behind its veranda), the brewing floor and the store along the long hall; the tun loft and the copper ' +
      'kettle stack over the roof are solid; the barrel yard and the malt racks are outside' });
  add({ key: 'vern_provisioner', name: 'Provisioner', wealth: MID, types: ['market/shop', 'single-family dwelling'], lot: [16, 16],
    bodies: [{ id: 'store', poly: rect(10, 8.4), y: 0.5, levels: [{ h: 3.45 }, { h: 3.0 }], wall: 0.3, roof: 'gable', pitch: pt(3.0 / 5),
      doors: [{ at: [-3.6, 4.2], w: 1.0 }, { at: [2.6, 4.2], w: 1.8 }, { at: [2.6, -4.2], w: 1.0 }],
      program: [['izshop_provisioner', 'store'], ['living', 'bedroom']] }],
    note: 'the outfitter\'s shop and its store below (the cart door under the hoist), the household above; the loading door in ' +
      'the upper front is not a planned door; the veranda of goods and the loading platform are open' });

  /* ================================================================ the trades round: cloth, leather and letters (71b-vern-cloth.js) */
  /* @@ag-cloth@@ */
  add({ key: 'vern_weaver', name: "Weaver and dyer's house", wealth: MID, types: ['industry', 'market/shop', 'single-family dwelling'], lot: [15, 19],
    bodies: [{ id: 'house', poly: rect(10, 7.6, 0, 1.6), y: 0.45, levels: [{ h: 3.75 }, { h: 2.9 }], wall: 0.3, roof: 'gable', pitch: pt(2.4 / 3.8),
      stair: { w: 0.9, riser: 0.22, tread: 0.25 },
      doors: [{ at: [-3.6, 5.4], w: 1.2 }, { at: [1.1, -2.2], w: 1.0 }], program: [['izwork_weaver', 'izwork_dyer'], ['living', 'bedroom']] }],
    note: 'the loom room behind the tall shuttered openings and the dye room with the back door, the family above; the dye ' +
      'lean-to, the vats and the drying poles in the yard behind are open' });
  add({ key: 'vern_tannery', name: 'Tannery', wealth: POOR, types: ['industry'], lot: [21, 16],
    bodies: [{ id: 'store', poly: rect(5.6, 4.0, 6.6, -3.6), y: 0.35, levels: [{ h: 2.6 }], wall: 0.12, roof: 'flat',
      doors: [{ at: [5.2, -1.6], w: 0.95 }], program: ['izwork_tannery', 'store'] }],
    note: 'only the board store and office is enclosed (the tanner\'s room and a hide store); the pit shed, the hide frames, the ' +
      'scraping beam and the bark store are open' });
  add({ key: 'vern_tailor', name: 'Tailor and clothier', wealth: MID, types: ['market/shop', 'single-family dwelling'], lot: [10, 15],
    bodies: [{ id: 'shop', poly: rect(7.2, 9.6), y: 0.4, levels: [{ h: 3.45 }, { h: 3.0 }], wall: 0.25, roof: 'gable', pitch: pt(2.6 / 3.6),
      doors: [{ at: [2.6, 4.8], w: 0.95 }, { at: [-2.2, -4.8], w: 0.9 }], program: [['izshop_tailor', 'izwork_tailor'], ['living', 'bedroom']] }],
    note: 'the shop behind the display opening, the cutting room behind it (the back door to the yard), the family above; the ' +
      'display ledge and the robes are outside the wall' });
  add({ key: 'vern_scribe', name: 'Scribe and bookseller', wealth: MID, types: ['market/shop', 'single-family dwelling'], lot: [15, 13],
    bodies: [{ id: 'house', poly: rect(9.2, 8.4), y: 0.55, levels: [{ h: 3.65 }, { h: 3.0 }], wall: 0.35, roof: 'hip', pitch: pt(2.6 / 4.2),
      doors: [{ at: [-1.8, 4.2], w: 1.2 }, { at: [4.6, -1.6], w: 0.95 }], program: [['izshop_scribe', 'izwork_scribe'], ['living', 'bedroom']] }],
    note: 'the book room on the street and the scribe\'s writing room (its side door to the press shed) in the stone storey, the ' +
      'scribe\'s rooms above; the book stall, the lectern and the press shed are open' });

  /* ================================================================ the trades round: crafts and salvage (71c-vern-craft.js) */
  /* @@ag-craft@@ */
  add({ key: 'vern_apothecary', name: 'Apothecary', wealth: MID, types: ['market/shop', 'single-family dwelling'], lot: [17, 14],
    bodies: [{ id: 'house', poly: rect(9.6, 8.4), y: 0.4, levels: [{ h: 3.35 }, { h: 2.9 }], wall: 0.3, roof: 'gable', pitch: pt(2.6 / 4.2),
      doors: [{ at: [-2.7, 4.2], w: 1.1 }, { at: [2.6, -4.2], w: 1.0 }],
      program: [['izshop_apothecary', 'izwork_apothecary'], ['living', 'bedroom']] }],
    note: 'the shop and the workroom on the ground storey (street door, back door to the yard), the family above; the still\'s ' +
      'lean-to on -x and the herb rack on +x are open' });
  add({ key: 'vern_tinker', name: 'Tinker and relic-wright', wealth: POOR, types: ['market/shop', 'industry', 'single-family dwelling'], lot: [18, 14],
    bodies: [{ id: 'shop', poly: rect(8.8, 6.6), y: 0.45, levels: [{ h: 3.0 }], wall: 0.15, roof: 'gable', pitch: pt(1.9 / 3.3),
      doors: [{ at: [2.4, 3.3], w: 1.0 }], program: ['izshop_tinker', 'izwork_tinker'] },
      { id: 'back', poly: rect(3.4, 4.6, -6.1, -0.2), y: 0.45, levels: [{ h: 2.4 }], wall: 0.15, roof: 'flat',
        doors: [{ at: [-5.6, 2.1], w: 0.9 }], program: ['cottage'] }],
    note: 'the counter room and the workbench room under the gable; the family\'s board lean-to on -x has its own door; the porch is open' });
  add({ key: 'vern_glassworks', name: 'Glassworks', wealth: MID, types: ['industry', 'market/shop'], lot: [20, 14],
    bodies: [{ id: 'hall', poly: rect(11.4, 8.2, -3.3, 0), y: 0.35, levels: [{ h: 4.0 }], wall: 0.3, roof: 'gable', pitch: pt(2.4 / 4.1),
      doors: [{ at: [-6.9, 4.1], w: 1.2 }, { at: [2.4, -1.4], w: 1.3 }], program: ['izshop_glass', 'store', 'izwork_glass'] }],
    note: 'the sales room on the street door, the store, the workroom with its door to the furnace house; the furnace house ' +
      '(+x, the beehive furnace, its stack and the annealing oven) and the cullet bins are open' });
  add({ key: 'vern_salvage_yard', name: 'Salvage breaker\'s yard', wealth: POOR, types: ['industry'], lot: [30, 24],
    bodies: [{ id: 'works', poly: rect(8.4, 6.6, -8.6, -6.4), y: 0.2, levels: [{ h: 3.4 }], wall: 0.15, roof: 'gable', pitch: pt(1.8 / 3.3),
      doors: [{ at: [-7.0, -3.1], w: 1.9 }], program: ['izwork_salvage'] },
      { id: 'office', poly: rect(4.6, 3.8, -9.8, 6.6), y: 0.3, levels: [{ h: 2.7 }], wall: 0.15, roof: 'flat',
        doors: [{ at: [-7.5, 6.2], w: 0.95 }], program: ['study'] }],
    note: 'the closed workshop at the back and the office by the gate; the walled yard, the gantry, the piles and the cutting ' +
      'forge\'s lean-to are open' });

  /* ================================================================ the trades round: mines, quarry, mill, fungus (73b-vern-works.js) */
  /* @@ag-works@@ */
  add({ key: 'vern_mine', name: 'Mine head', wealth: POOR, types: ['industry'], lot: [26, 22],
    bodies: [{ id: 'hut', poly: rect(7, 5.5, 8.5, 1.5), y: 0.5, levels: [{ h: 2.6 }], wall: 0.15, roof: 'gable', pitch: pt(2.3 / 2.87),
      doors: [{ at: [6.9, 4.25], w: 0.95 }], program: ['store', 'dormitory'] }],
    note: 'the miners\' hut only (a tool store and the bunk room, on low stilts); the adit, the shaft and headframe, the open winch ' +
      'shed and the heaps are outside' });
  add({ key: 'vern_quarry', name: 'Quarry and mason\'s lodge', wealth: MID, types: ['industry'], lot: [28, 24],
    bodies: [{ id: 'lodge', poly: rect(8, 5.5, 8.5, 6), y: 0.35, levels: [{ h: 3.0 }], wall: 0.25, roof: 'gable', pitch: pt(1.9 / 2.75),
      doors: [{ at: [6.3, 8.75], w: 1.1 }], program: ['workshop', 'store'] }],
    note: 'the masons\' lodge only; the banker benches stand under its open front lean-to, the cut, the shear legs and the ramp are open' });
  add({ key: 'vern_mill', name: 'Watermill', wealth: MID, types: ['industry', 'single-family dwelling'], lot: [22, 20],
    bodies: [{ id: 'mill', poly: rect(9, 8, -2.5, 0), y: 1.2, levels: [{ h: 3.25 }, { h: 2.7 }], wall: 0.3, roof: 'gable', pitch: pt(2.6 / 4),
      doors: [{ at: [-4.7, 4], w: 1.15 }], program: [['izwork_mill', 'store'], ['living', 'bedroom']] }],
    note: 'the mill floor (the wheel turns on the +x wall) and its sack store below, the miller\'s household above; the taking-in ' +
      'door under the hoist is drawn as an unglazed opening. The grain lean-to on -x, the wheel pit and the flume are open' });
  add({ key: 'vern_fungus_shed', name: 'Fungus house', wealth: POOR, types: ['farm'], lot: [22, 14],
    bodies: [{ id: 'shed', poly: rect(13, 6, 0, -1.5), y: 0.1, levels: [{ h: 2.3 }], wall: 0.2, roof: 'gable', pitch: pt(2.4 / 3),
      doors: [{ at: [-6.5, -1.5], w: 1.0 }], program: ['workshop', 'store', 'store'], windows: false }],
    note: 'the dark growing house, windowless, banked with earth to the eaves; entered down the cutting on its -x end. Drawn at grade ' +
      '(the bank makes it read half-sunk) so the floor stays above the ground plane' });

  /* ================================================================ the trades round: farm, stock and water (73c-vern-land.js) */
  /* @@ag-land@@ */
  add({ key: 'vern_farmhouse', name: 'Farmhouse', wealth: MID, types: ['farm', 'single-family dwelling'], lot: [24, 20],
    bodies: [{ id: 'house', poly: rect(12, 8, -2.2, -2.5), y: 1.6, levels: [{ h: 3.2 }], wall: 0.25, roof: 'gable', pitch: pt(2.6 / 4),
      doors: [{ at: [-4.6, 1.5], w: 1.1 }], program: ['living', 'kitchen', 'bedroom', 'bedroom', 'store'] }],
    note: 'one plaster storey on stilts (floor 1.6) behind the full-width veranda (open, its stair on the -x end); the cart shed, ' +
      'the raised granary and the vegetable plot are open or solid' });
  add({ key: 'vern_byre', name: 'Byre and dairy', wealth: POOR, types: ['farm'], lot: [22, 16],
    bodies: [{ id: 'byre', poly: rect(10, 7, -3, 0), y: 0.25, levels: [{ h: 3.1 }], wall: 0.18, roof: 'gable', pitch: pt(2.6 / 3.5),
      doors: [{ at: [-4, 3.5], w: 2.4 }, { at: [1, -3.5], w: 1.1 }], program: ['stable'] },
      { id: 'dairy', poly: rect(4.4, 7, 4.2, 0), y: 0.25, levels: [{ h: 3.1 }], wall: 0.22, roof: 'gable', pitch: pt(2.6 / 3.5),
        doors: [{ at: [4.2, 3.5], w: 1.0 }], program: ['store'] }],
    note: 'the board byre (its stalls from the catalog) and the limewashed dairy under one thatch; the hay loft is the roof space ' +
      '(its door in the -x gable, not planned); the fold, the milk stand and the hay rick are open' });
  add({ key: 'vern_pens', name: 'Stock pens', wealth: POOR, types: ['farm'], lot: [20, 16],
    bodies: [{ id: 'hut', poly: rect(4.2, 3.8, -6.2, -4.6), y: 0.5, levels: [{ h: 2.4 }], wall: 0.12, roof: 'gable', pitch: pt(1.7 / 1.9),
      doors: [{ at: [-5.4, -2.7], w: 0.9 }], program: ['cottage'] }],
    note: 'the herder\'s one-room hut; the sty, its lean-to shelters, the duck house over the pond and the duck run are open' });
  add({ key: 'vern_boatyard', name: 'Boatwright\'s yard', wealth: MID, types: ['industry'], lot: [26, 22],
    bodies: [{ id: 'workshop', poly: rect(7.4, 6.4, 8.6, -5.4), y: 0.3, levels: [{ h: 3.25 }, { h: 2.4 }], wall: 0.25, roof: 'gable', pitch: pt(2.6 / 3.7),
      doors: [{ at: [7.1, -2.2], w: 1.8 }], program: [['izwork_boat', 'store'], ['store']] }],
    note: 'the closed workshop and its timber loft (the loft\'s front door is boarded); the boat shed over the slip, the steam box ' +
      'and the timber stacks are open' });
  add({ key: 'vern_fish_landing', name: 'Fish landing and smokehouse', wealth: POOR, types: ['industry'], lot: [18, 16],
    bodies: [{ id: 'smokehouse', poly: rect(4.2, 3.6, -4.6, -4.2), y: 0.25, levels: [{ h: 2.5 }], wall: 0.2, roof: 'gable', pitch: pt(1.9 / 1.8),
      doors: [{ at: [-4.0, -2.4], w: 0.9 }], program: ['store'] }],
    note: 'the daub smokehouse as a store (its racks are the catalog\'s); the landing stage, the net frames and the fish racks are open' });

  IX.sets.add({ set: 'iziz', title: 'Iziz Vernacular', culture: 'iziz', items: L });
})(KratorInteriors);
