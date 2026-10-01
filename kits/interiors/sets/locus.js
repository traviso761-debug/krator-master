/* ======================== Interior set: Locus (settlements/locus, kit `locus`) ========================
   The interiors of the Locus building kit (LOCUS-KIT-NOTES.md): one item per ASSET key on the Locus sheet
   (64-locus-*.js), plus `<key>#n` items where a variant's rooms differ a lot from variant 0. The ten keys the
   Locus and the Eastern Abyssal sheets share (stilt_poor, stilt_mid, tent_pavilion, sunshade_poles,
   farm_saltrice, infra_fishing_dock, ind_pumpjack, ind_oil_tank, prop_pipe_rack, prop_drum_stack) live HERE
   only; sets/abyss.js holds the 31 abyss-only keys.
   Local frame = the builder's F: origin at the footprint centre on the ground, +z the front, metres.
   Furniture cultures: abyssal-desert assets -> eastabyss; geomancer and yuni assets -> yuni-common
   (the Chapterhouse: yuni-court). Wealth = the middle of the ASSET's wealth band.
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const R3 = function (v) { return Math.round(v * 1000) / 1000; };

  /* the Chapterhouse drum: centre (0,-3), ring wall R 12.0 x 0.9 thick, the door gap 0.21 rad either side of +z */
  const CH_C = [0, -3], CH_RIN = 11.0;

  IX.sets.add({ set: 'locus', title: 'Locus: the Geomancers\' oil town', culture: 'eastabyss', items: [
    /* ---------- Abyssal-desert dwellings (64-locus-dwellings.js) */
    { key: 'stilt_poor', name: 'Marsh stilt house', culture: 'eastabyss', wealth: 0.18, types: ['single-family dwelling'], lot: [11, 10],
      bodies: [{ id: 'hut', poly: rect(5.4, 4.2, 0, -1.9), y: 2.1, levels: [{ h: 2.4 }], wall: 0.12, roof: 'hip', pitch: 0.8,
        doors: [{ at: [-1.2, 0.2], w: 0.95 }], program: ['cottage'] }],
      note: 'variant 0: one reed-mat room 5.4 x 4.2 on the back of a pile deck at H 2.1 (+-0.15), door at x -1.2 on the front; ' +
        'the porch under the canvas canopy and the stair are open deck. Variant 1 is the same room 5.6 wide under a canvas gable ' +
        '(H 2.4); variant 2 (two rooms, flat roof and sail) is stilt_poor#2' },
    { key: 'stilt_poor#2', name: 'Marsh stilt house (variant 2: two rooms, flat roof and sail)', culture: 'eastabyss', wealth: 0.18,
      types: ['single-family dwelling'], lot: [11, 10],
      bodies: [{ id: 'hut', poly: rect(6.6, 4.2, 0, -1.9), y: 2.0, levels: [{ h: 2.5 }], wall: 0.2, roof: 'flat',
        doors: [{ at: [-1.2, 0.2], w: 0.95 }], program: ['living', 'bedroom'] }],
      note: 'the washed-mud box 6.6 x 4.2 on the deck at H 2.0, cut in two; the roof terrace under the sail is open' },
    { key: 'stilt_mid', name: 'Pastel stilt house', culture: 'eastabyss', wealth: 0.53, types: ['single-family dwelling'], lot: [16, 16],
      bodies: [{ id: 'house', poly: rect(8.6, 6.6, 0, -2.0), y: 2.8, levels: [{ h: 3.1 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [0, 1.3], w: 1.1 }], program: ['living', 'kitchen', 'bedroom'] }],
      note: 'variant 0: the lime-washed body 8.6 x 6.6 on a pile deck at H 2.8 (+0.2/-0.1), the door in the middle of the front ' +
        'behind the loggia arcade; the loggia, the side verandah and the roof terrace under the sail (and its wind-catcher) are open. ' +
        'Variant 1 (two storeys under a sail) is stilt_mid#1; variant 2 adds a 3.3 x 4.6 wing on the right (body shifted to x -1.6), ' +
        'not planned separately' },
    { key: 'stilt_mid#1', name: 'Pastel stilt house (variant 1: two storeys under a sail)', culture: 'eastabyss', wealth: 0.53,
      types: ['single-family dwelling'], lot: [16, 16],
      bodies: [{ id: 'house', poly: rect(8.6, 6.6, 0, -2.0), y: 2.8, levels: [{ h: 3.1 }, { h: 2.8, poly: rect(8.0, 6.0, 0, -2.0) }], wall: 0.3,
        roof: 'flat', doors: [{ at: [0, 1.3], w: 1.1 }], program: [['living', 'kitchen'], ['bedroom', 'bedroom']] }],
      note: 'the upper storey is the 8.0 x 6.0 box set 0.3 m in on every side; the loggia balcony in front of it is open' },

    /* ---------- Abyssal-desert canvas */
    { key: 'tent_pavilion', name: 'Great pavilion tent', culture: 'eastabyss', wealth: 0.4, types: ['prop', 'tavern/inn'], lot: [18, 14],
      rooms: [{ id: 'tent', kind: 'hall', poly: rect(13.6, 9.6), y: 0.02, h: 2.4,
        doors: [{ at: [0, 4.8], w: 6, swing: 'none' }, { at: [6.8, 3.7], w: 1.6, swing: 'none' }] }],
      note: 'variant 0: the striped ridge tent, 14 x 10 between the eave poles (eaves 2.5, ridge 5.6), back wall hung, the front ' +
        'wall rolled up (one wide opening) and the right end open for 2.2 m at the front. The two ridge poles at x +-3.6 stand in the ' +
        'hall. Variant 1 hangs the left 4.5 m of the front; variant 2 is a round bell tent r 6.0 with a 1.6 m door on +z' },
    { key: 'sunshade_poles', name: 'Four-pole sun shade', types: ['prop'], lot: [9, 9],
      skip: 'open shade: four (or five) poles and a canvas, no walls' },

    /* ---------- Salt-rice farm (64-locus-farm.js) */
    { key: 'farm_saltrice', name: 'Salt-rice farm', culture: 'eastabyss', wealth: 0.3, types: ['farm', 'single-family dwelling'], lot: [48, 38],
      bodies: [{ id: 'house', poly: rect(5.6, 4.2, 16, 5.7), y: 2.4, levels: [{ h: 2.4 }], wall: 0.2, roof: 'gable', pitch: 0.75,
        doors: [{ at: [14.8, 7.8], w: 0.95 }], program: ['cottage'] }],
      note: 'the farmstead is stilt_poor variant 1 built at (16, 7.6): its one room 5.6 x 4.2 on the deck at H 2.4. The paddies, the ' +
        'threshing floor and the shadoof are open ground; the granary on piles is a 2.6 m reed bin (no room). Variant 1 mirrors the ' +
        'plan (house at x -16)' },

    /* ---------- Petroleum (64-locus-petroleum.js) */
    { key: 'ind_pumpjack', name: 'Pumpjack', types: ['industry', 'infrastructure'], lot: [8, 15],
      skip: 'machinery on a plinth: a walking beam, cranks and a motor housing, nothing enclosed' },
    { key: 'ind_oil_tank', name: 'Oil storage tank', types: ['industry', 'infrastructure'], lot: [24, 27],
      skip: 'a riveted oil tank in a mud bund: a closed vessel full of crude, no room' },
    { key: 'prop_pipe_rack', name: 'Pipe rack segment', types: ['infrastructure', 'prop'], lot: [12, 3],
      skip: 'a prop: pipes on mud piers' },
    { key: 'ind_refinery', name: 'Geomancers\' still-house (refinery)', culture: 'yuni-common', wealth: 0.6, types: ['industry', 'civic'], lot: [66, 50],
      bodies: [
        { id: 'still-house', poly: rect(24, 14, -14, -8), y: 0, levels: [{ h: 6.0 }], wall: 0.5, roof: 'flat',
          doors: [{ at: [-14, -1], w: 2.4 }], program: ['workshop', 'store'] },
        { id: 'fitters', poly: rect(8, 9, -26.5, 3), y: 0, levels: [{ h: 3.4 }], wall: 0.5, roof: 'flat',
          doors: [{ at: [-22.5, 3], w: 2.6 }], program: ['workshop'] },
        { id: 'control', poly: rect(6.4, 4.6, 11, 13), y: 0, levels: [{ h: 3.2 }], wall: 0.1, roof: 'flat',
          doors: [{ at: [13.4, 15.3], w: 0.9 }], program: ['workshop'] }],
      note: 'three of the yard\'s buildings: the still-house (battered mud block 24 x 14 x 9, one tall storey, entered from the loading ' +
        'dock behind the front arcade; the stills are not drawn inside, so it is planned as a workshop and a store), the fitters\' ' +
        'workshop (8 x 9, open on its +x side, one wide door) and the white-metal control shed (door at x 13.4). The gatehouse tower ' +
        '(5.2 m square battered to a point), the heater house (a fired heater) and the columns are not rooms' },
    { key: 'prop_drum_stack', name: 'Drum stack', types: ['industry', 'prop'], lot: [5, 4],
      skip: 'a prop: drums on a pallet or a crate' },

    /* ---------- Power and fuel (64-locus-power.js) */
    { key: 'ind_generator_house', name: 'Geomancers\' generator house', culture: 'yuni-common', wealth: 0.65, types: ['industry', 'infrastructure'], lot: [32, 22],
      rooms: [{ id: 'engine-hall', kind: 'workshop', poly: rect(18.4, 10.4, -2, -1.5), y: 0.6, h: 7.5,
        doors: [{ at: [-2, 3.7], w: 5.6, swing: 'none' }],
        fixtures: [{ id: 'engine', kind: 'machine', x: -2.5, z: -2.2, ry: 0, w: 12.4, d: 3.6, h: 3.4, clearance: { front: 0.9, back: 0.9 } }] }],
      note: 'the engine hall inside its 0.8 m walls (x -11.2..7.2, z -6.7..3.7) on the 0.6 m plinth, entered through the great ' +
        'parabolic arch (6 m); the Ancient engine on its 12.4 x 3.6 bed is a fixture. The dynamo annex is an open arcade, the radiator ' +
        'bank and the day-tank stand outside: none planned' },
    { key: 'trade_fuel_station', name: 'Fuel station', culture: 'yuni-common', wealth: 0.55, types: ['market/shop', 'infrastructure'], lot: [24, 18],
      bodies: [{ id: 'kiosk', poly: rect(6, 5, -5.5, -5.8), y: 0, levels: [{ h: 3.2 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [-7.3, -3.3], w: 1.0 }], program: ['shop'] }],
      note: 'the attendant\'s kiosk under the blue dome (6 x 5, door at x -7.3, counter window beside it); the pump canopy is open' },

    /* ---------- Chapterhouse (64-locus-chapterhouse.js) */
    { key: 'civic_geomancer_chapterhouse', name: 'Geomancers\' Chapterhouse', culture: 'yuni-court', wealth: 0.8, types: ['civic', 'religious'], lot: [48, 42],
      rooms: [{ id: 'drum-hall', kind: 'hall', poly: SH.circle(CH_RIN, 28, CH_C[0], CH_C[1]), y: 0.08, h: 7.0,
        doors: [{ at: [CH_C[0], R3(CH_C[1] + CH_RIN)], w: 4.2, swing: 'none' }],
        fixtures: [{ id: 'relief-map', kind: 'table', x: CH_C[0], z: CH_C[1], ry: 0, w: 6.2, d: 6.2, h: 1.5, clearance: { front: 1.0, back: 1.0, left: 1.0, right: 1.0 } }] }],
      bodies: [
        { id: 'west-wing', poly: rect(10, 20, -17.5, -6), y: 0, levels: [{ h: 4.8 }], wall: 0.5, roof: 'flat',
          doors: [{ at: [-17.5, 4], w: 1.3 }], program: ['library', 'study'] },
        { id: 'east-wing', poly: rect(10, 20, 17.5, -6), y: 0, levels: [{ h: 4.8 }], wall: 0.5, roof: 'flat',
          doors: [{ at: [17.5, 4], w: 1.3 }], program: ['study', 'library'] }],
      note: 'the drum hall inside the 0.9 m ring wall (R 12, inner 11.1) to the drum top (7.5; the corbelled dome rises 17 m above), ' +
        'entered through the 4.6 m door gap behind the porch; the rock relief-map table (r 3) at the centre is a fixture. The two ' +
        'assay wings (battered 10 x 20 x 6.5 blocks, doors in their fronts) are a library and a study each; the link passages, the ' +
        'porch towers and the survey minaret are not planned' },

    /* ---------- Town (64-locus-infra.js) */
    { key: 'locus_warehouse', name: 'Salt-and-oil warehouse', culture: 'yuni-common', wealth: 0.55, types: ['industry', 'market/shop'], lot: [42, 22],
      bodies: [{ id: 'hall', poly: rect(38, 13, 0, -3), y: 1.1, levels: [{ h: 6.0 }], wall: 0.5, roof: 'flat',
        doors: [{ at: [-13.5, 3.5], w: 3.2 }, { at: [-4.5, 3.5], w: 3.2 }, { at: [4.5, 3.5], w: 3.2 }, { at: [13.5, 3.5], w: 3.2 }],
        program: ['store', 'store'] }],
      note: 'the long banco hall 38 x 13, its floor level with the 1.1 m loading plinth its four parabolic doors open onto; planned ' +
        'as two stores' },
    { key: 'infra_fishing_dock', name: 'Fishing dock', types: ['infrastructure'], lot: [12, 34],
      skip: 'an open jetty on piles; the net shed at its root is two reed walls under a canvas, open on two sides' }
  ] });
})(KratorInteriors);
