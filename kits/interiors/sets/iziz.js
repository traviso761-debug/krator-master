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

  /* ================================================================ dwellings (70-vern-dwellings.js) */
  add({ key: 'vern_house_poor_a', name: 'Stilt hut', wealth: POOR, types: SF, lot: [8, 10],
    bodies: [{ id: 'hut', poly: rect(5.3, 5.9), y: 1.7, levels: [{ h: 2.5 }], wall: 0.15, roof: 'gable', pitch: pt(2.7 / 2.95),
      doors: [{ at: [0, 2.95], w: 0.95 }], program: ['cottage'] }],
    note: 'one board room on stilts (floor 1.7), entered from the front platform up the ladder; the thatch loft is not planned' });
  add({ key: 'vern_house_poor_b', name: 'Corrugate shack', wealth: POOR, types: SF, lot: [10, 8],
    bodies: [{ id: 'shack', poly: rect(6, 5), y: 0.35, levels: [{ h: 2.6 }], wall: 0.12, roof: 'flat',
      doors: [{ at: [-1.4, 2.5], w: 0.95 }], program: ['cottage'] }],
    note: 'one salvage room on a rubble pad under a shed roof (planned flat); the tarp lean-to on +x is open' });
  add({ key: 'vern_house_poor_c', name: 'Panel house', wealth: POOR, types: SF, lot: [9, 10],
    bodies: [{ id: 'house', poly: rect(6.4, 6.2), y: 0.6, levels: [{ h: 2.7 }], wall: 0.15, roof: 'hip', pitch: pt(2.4 / 3.1),
      doors: [{ at: [-0.6, 3.1], w: 0.95 }], program: ['cottage'] }],
    note: 'one panel-walled room on low stilts, the veranda in front is open' });
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
    bodies: [{ id: 'house', poly: rect(11, 7.2), y: 0.5, levels: [{ h: 3.7 }], wall: 0.25, roof: 'hip', pitch: pt(2.8 / 3.6),
      doors: [{ at: [-1.8, 3.6], w: 1.1 }, { at: [2.8, 3.6], w: 1.0 }], program: ['living', 'kitchen', 'bedroom', 'bedroom'] }],
    note: 'one storey on low stilts behind the full-width veranda (open)' });
  add({ key: 'vern_house_rich_a', name: 'Stone manor', wealth: RICH, types: SF, lot: [28, 24],
    bodies: [{ id: 'manor', poly: rect(11, 9.4), y: 0.6, levels: [{ h: 5.75 }, { h: 3.4 }], wall: 0.45, roof: 'hip', pitch: pt(2.7 / 4.7),
      doors: [{ at: [0, 4.7], w: 1.7 }], program: [['hall', 'kitchen'], ['bedroom', 'bedroom', 'study']] }],
    note: 'both storeys are planned on the gallery storey\'s 11 x 9.4 (the battered ground storey is 14 x 12 at its foot, 12 x 10.3 ' +
      'at its head: the planner wants one footprint for a stair to pass); the stepped cornice is ' +
      '1.4 m of solid stone, so the ground storey is planned 5.75 high to put the gallery floor on its drawn height (6.62); the ' +
      'corner tower, the balcony and the walled court are not planned' });
  add({ key: 'vern_house_rich_b', name: 'Domed house', wealth: RICH, types: SF, lot: [26, 23],
    bodies: [{ id: 'house', poly: rect(12.4, 11.6), y: 0.5, levels: [{ h: 4.65 }, { h: 3.5 }], wall: 0.45, roof: 'flat',
      doors: [{ at: [0, 5.8], w: 1.6 }], program: [['hall', 'living', 'kitchen', 'store'], ['bedroom', 'bedroom', 'study', 'bedroom']] }],
    note: 'two ashlar storeys under a parapet and the dome (the drum is not planned), the upper one (11.8 x 11 drawn) planned on the ' +
      'ground footprint; the loggia in front and the garden are open' });

  /* ================================================================ trade and industry (71-vern-trade.js) */
  add({ key: 'vern_shops', name: 'Shop row', wealth: MID, types: ['market/shop'], lot: [18, 12],
    bodies: [-4.6, 0, 4.6].map(function (x, i) {
      return { id: 'unit' + (i + 1), poly: rect(4.6, 7.4, x, 0), y: 0.3, levels: [{ h: 3.3 }], wall: 0.2, roof: 'gable', pitch: pt(2.2 / 3.7),
        doors: [{ at: [x + 1.55, 3.7], w: 0.9 }], program: ['shop', 'store'] };
    }),
    note: 'three units under one roof, each its own body (the party walls); each sells over the counter in its shop-front opening, ' +
      'the door beside it' });
  add({ key: 'vern_tavern', name: 'Tavern', wealth: MID, types: ['tavern/inn'], lot: [22, 20],
    bodies: [{ id: 'hall', poly: rect(16, 10), y: 0.35, levels: [{ h: 4.05 }, { h: 2.6 }], wall: 0.3, roof: 'gable', pitch: pt(4.2 / 5),
      doors: [{ at: [0, 5], w: 1.5 }], program: [['tavern', 'kitchen', 'store'], ['bedroom', 'bedroom', 'bedroom', 'bedroom']] }],
    note: 'the long hall and the inn rooms in the board storey above; the cross-gabled porch is open' });
  add({ key: 'vern_workshop_a', name: "Carpenter's workshop", wealth: MID, types: ['industry'], lot: [14, 12],
    bodies: [{ id: 'store', poly: rect(8.8, 3.85, 0, -1.575), y: 0.2, levels: [{ h: 3.4 }], wall: 0.12, roof: 'flat',
      doors: [{ at: [-1.2, 0.35], w: 1.0 }], program: ['store'] }],
    rooms: [{ id: 'shed', kind: 'workshop', poly: rect(8.7, 2.9, 0, 1.85), y: 0.2, h: 3.3, doors: [{ at: [0, 3.3], w: 8.0, swing: 'none' }],
      fixtures: [{ id: 'bench-a', kind: 'bench', x: -2.2, z: 2.1, ry: 0, w: 3.2, d: 0.9, h: 0.9, reach: false },
        { id: 'bench-b', kind: 'bench', x: 2.4, z: 2.2, ry: 0, w: 2.4, d: 0.8, h: 0.9, reach: false }] }],
    note: 'the open-fronted shed (its two benches are fixtures) and the board-walled back half as a store; the builder draws no ' +
      'door into the back half: one is assumed from the shed' });
  add({ key: 'vern_workshop_b', name: "Potter's workshop", wealth: MID, types: ['industry', 'market/shop'], lot: [16, 12],
    bodies: [{ id: 'shop', poly: rect(8, 7), y: 0.3, levels: [{ h: 3.2 }], wall: 0.25, roof: 'hip', pitch: pt(2.1 / 3.5),
      doors: [{ at: [2.4, 3.5], w: 1.0 }], program: ['shop', 'workshop'] }],
    note: 'the sales front (its counter stands outside the opening) and the workroom; the kiln and its drying shelves are outside' });
  add({ key: 'vern_smithy', name: 'Scrap smithy', wealth: POOR, types: ['industry'], lot: [18, 14],
    skip: 'open forge shed on pipe posts: one back wall of plate, nothing enclosed' });
  add({ key: 'vern_market', name: 'Market canopy', wealth: MID, types: ['market/shop'], lot: [30, 22],
    skip: 'open market canopy on posts over rows of stalls: nothing enclosed' });
  add({ key: 'vern_warehouse', name: 'Warehouse', wealth: MID, types: ['industry'], lot: [30, 20],
    bodies: [{ id: 'shed', poly: rect(22, 12), y: 0.9, levels: [{ h: 5.2 }], wall: 0.25, roof: 'gable', pitch: pt(3.4 / 11),
      doors: [{ at: [-6, 6], w: 2.2 }, { at: [0, 6], w: 2.2 }, { at: [6, 6], w: 2.2 }, { at: [11, -1], w: 3.6 }], program: ['store', 'store', 'store'] },
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
    bodies: [-12.96, -6.48, 0, 6.48, 12.96].map(function (x, i) {
      return { id: 'lodging' + (i + 1), poly: rect(6.48, 3.9, x, -11.35), y: 0.4, levels: [{ h: 2.9 }], wall: 0.2, roof: 'flat',
        doors: [{ at: [[-12, -6, 0, 6, 12][i], -9.4], w: 1.1 }], program: ['dormitory'] };
    }).concat([-1, 1].map(function (s) {
      return { id: s < 0 ? 'stores-w' : 'stores-e', poly: rect(11.3, 3.9, s * 10.45, 11.35), y: 0.4, levels: [{ h: 2.9 }], wall: 0.2, roof: 'flat',
        doors: [{ at: [s * 7.6, 9.4], w: 1.7 }, { at: [s * 12.4, 9.4], w: 1.7 }], program: ['store', 'store'] };
    })),
    note: 'the lodging range on the back wall (five rooms, one per door) and the store ranges either side of the gate; the room over ' +
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

  IX.sets.add({ set: 'iziz', title: 'Iziz Vernacular', culture: 'iziz', items: L });
})(KratorInteriors);
