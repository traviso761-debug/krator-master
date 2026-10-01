/* ======================== Interior set: Beast Rider (Mav's Refuge, Girder) ========================
   The interiors of the Beast Rider building set: one item per ASSET key in
   kits/catalog/krator-master-buildings-beast-rider.js (br_bldg_*), plus `<key>#n` items where a
   variant's body or use differs from variant 0. Local frame = the builder's F: origin at the
   footprint centre on the ground, +z the front. Furniture culture: beast-rider.
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const R3 = function (v) { return Math.round(v * 1000) / 1000; };
  /* a regular n-gon whose EDGE MIDPOINTS sit at radius rin, at angles phase + i*TAU/n (math angle:
     x = cos a, z = sin a): the inner face of a ring of n straight wall segments centred on those angles */
  function ngon(rin, n, phase) {
    const out = [], rv = rin / Math.cos(Math.PI / n);
    for (let i = 0; i < n; i++) {
      const a = (phase || 0) + (i + 0.5) / n * Math.PI * 2;
      out.push([R3(rv * Math.cos(a)), R3(rv * Math.sin(a))]);
    }
    return out;
  }
  /* the midpoint of ngon(rin, n, phase)'s edge centred on segment i */
  function ngonMid(rin, n, phase, i) {
    const a = (phase || 0) + i / n * Math.PI * 2;
    return [R3(rin * Math.cos(a)), R3(rin * Math.sin(a))];
  }
  /* a polygon through n points on radius r at angles i*TAU/n (a post ring, read post to post) */
  function ring(r, n) {
    const out = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; out.push([R3(r * Math.cos(a)), R3(r * Math.sin(a))]); }
    return out;
  }

  /* the nature shrine: 9 posts on r 4.0 (radius 0.14), the rail left out between post 8 and post 0 */
  const shrineR = 3.82, shrineGapMid = (function () {
    const a0 = 8 / 9 * Math.PI * 2, a1 = Math.PI * 2, c = shrineR * Math.cos(Math.PI / 9), a = (a0 + a1) / 2;
    return [R3(c * Math.cos(a)), R3(c * Math.sin(a))];
  })();
  /* the council chamber: 16 wall segments on R 12.2 (0.55 thick), doorways at i % 4 === 0 */
  const ccIn = 11.9;
  /* the assembly hall: 12 wall segments on R 13.0 (0.5 thick), doorways at i % 3 === 0 */
  const ahIn = 12.72;
  /* the lower-level room front: the shell is 12 x 3 before the builder's F.shift(0, -dz[v]) */
  const rfShift = [0.38, 0.30, 0.52, 0.36];
  const rfBody = function (v, doors, program) {
    const cz = -rfShift[v];
    return { id: 'room', poly: rect(12, 3, 0, cz), y: 0.16, levels: [{ h: 4.24 }], wall: 0.2, roof: 'flat',
      doors: doors.map(function (d) { return Object.assign({}, d, { at: [d.at[0], R3(cz + 1.5 * d.side)] }); }), program: program };
  };

  IX.sets.add({ set: 'beast-rider', title: 'Beast Rider: Mav\'s Refuge and Girder', culture: 'beast-rider', items: [
    /* ---------- Mav's Refuge */
    { key: 'br_bldg_deck_lot', name: 'Platform building (deck lot)', culture: 'beast-rider', wealth: 0.45,
      types: ['dwelling-single'], lot: [17, 13],
      bodies: [{ id: 'house', poly: rect(14, 10), y: 0.22, levels: [{ h: 4.3 }], wall: 0.22, roof: 'hip', pitch: 0.55,
        doors: [{ at: [0, 5], w: 1.7 }], program: ['living', 'bedroom'] }],
      note: 'one storey of 14 x 10 m plank walls on the 0.22 m deck, front door 1.7 m at the centre; the steep hip roof is ' +
        'not planned as a loft. Variants share the body: v1 (fancy: gilt trim, porch, two-tier joglo roof), v3 (military: ' +
        'clerestory drum) and v4 (silkhouse: webbed windows) are homes like v0; v2 (tavern/inn) is item #2' },
    { key: 'br_bldg_deck_lot#2', name: 'Platform building (deck lot) (variant 3: tavern/inn)', like: 'br_bldg_deck_lot',
      bodies: [{ id: 'inn', poly: rect(14, 10), y: 0.22, levels: [{ h: 4.3 }], wall: 0.22, roof: 'hip', pitch: 0.55,
        doors: [{ at: [0, 5], w: 1.7 }], program: ['tavern', 'kitchen', 'bedroom'] }],
      note: 'variant 2: the same body with a jettied balcony rail (decorative, 2.9 m up on the front), a sign and a stone ' +
        'chimney on the back right: the taproom takes the door, the kitchen and the keeper\'s bedroom behind' },
    { key: 'br_bldg_nature_shrine', name: 'Nature shrine (open pavilion)', culture: 'beast-rider', wealth: 0.45,
      types: ['religious'], lot: [10, 10],
      rooms: [{ id: 'shrine', kind: 'shrine', poly: ring(shrineR, 9), y: 0.46, h: 2.8,
        doors: [{ at: shrineGapMid, w: 1.6, swing: 'none' }],
        fixtures: [{ id: 'offering', kind: 'altar', x: 0, z: 0, ry: 0, w: 1.3, d: 1.3, h: 1.0 }] }],
      note: 'nine posts on a 4 m ring with a low rail between them; the rail is left out between the 8th and the 1st post ' +
        '(the entry, on the +x / -z side, not the front). The centre stump altar or potted sapling is a fixture; the four ' +
        'offering bowls round the deck are decoration the plan does not keep clear of' },
    { key: 'br_bldg_council_chamber', name: 'Council Chamber', culture: 'beast-rider', wealth: 0.6,
      types: ['civic'], lot: [31, 31],
      rooms: [{ id: 'chamber', kind: 'hall', poly: ngon(ccIn, 16, 0), y: 0.4, h: 9.0,
        doors: [0, 4, 8, 12].map(function (i) { return { at: ngonMid(ccIn, 16, 0, i), w: 2.0 }; }),
        fixtures: (function () {
          const f = [];
          for (let i = 0; i < 11; i++) {
            const a = i / 11 * Math.PI * 2 + 0.15;
            f.push({ id: 'post' + i, kind: 'post', x: R3(8 * Math.cos(a)), z: R3(8 * Math.sin(a)), ry: 0, w: 0.4, d: 0.4, h: 9.0 });
          }
          return f;
        })() }],
      note: 'one round chamber inside the 16-segment wall (R 12.2, inner face ~11.9), four doorways (front, back, both ' +
        'flanks); the inner colonnade of 11 posts on r 8 are fixtures. The outer colonnade (r 14) is a veranda under the ' +
        'roof\'s lowest tier, outside the walls: not planned' },
    { key: 'br_bldg_rain_canopy', name: 'Rain canopy (market/plaza roof)', culture: 'beast-rider', wealth: 0.45,
      types: ['market', 'infrastructure'], lot: [70, 70],
      skip: 'an open roof: three rings of thatch panels on 8 perimeter posts (r 32) over a plaza, no walls and no floor; ' +
        'the market under it is the plaza\'s stalls, not a room' },
    { key: 'br_bldg_roost_gallery', name: 'Open roost/hangar gallery', culture: 'beast-rider', wealth: 0.45,
      types: ['industry', 'infrastructure'], lot: [26, 18],
      rooms: [{ id: 'roost', kind: 'stable', poly: rect(17.4, 13.4), y: 0, h: 6.2,
        doors: [{ at: [4.5, 6.7], w: 3.6, swing: 'none' }, { at: [-8.7, 0], w: 4.0, swing: 'none' }, { at: [8.7, 0], w: 4.0, swing: 'none' }],
        fixtures: [
          { id: 'ladder', kind: 'ladder', x: -1.55, z: 6.25, ry: 0, w: 1.1, d: 0.5, h: 6.6 },
          { id: 'nest-a', kind: 'nest', x: 8.4, z: -5.4, ry: 0, w: 2.0, d: 2.0, h: 1.2 },
          { id: 'nest-b', kind: 'nest', x: -8.2, z: 5.2, ry: 0, w: 1.7, d: 1.7, h: 1.0 },
          { id: 'butt', kind: 'barrel', x: 6.4, z: -5.8, ry: 0, w: 1.0, d: 1.0, h: 0.8 }] }],
      note: 'an open hangar: 2 x 5 posts on 18 x 14 m under a deep thatch roof, half-furled curtains on the front and mat ' +
        'blinds on the back, no walls. Planned as one stable floor (the beasts roost on the perch rails 6.5 m up, so the ' +
        'clear height is taken below them); open front (right of the ladder) and open ends. The ladder, the two nest ' +
        'bundles and the water butt are fixtures' },
    { key: 'br_bldg_gateway_tree_facade', name: 'Gateway-tree carved facade', culture: 'beast-rider', wealth: 0.45,
      types: ['infrastructure', 'civic'], lot: [13.8, 13.9],
      skip: 'a facade: the builder draws a SOLID trunk (an 11-sided frustum, r 6 -> 5.1, 12 m) with a carved portal block ' +
        'and a door leaf on its face; nothing is hollow. The variants name a room behind the portal (v0 storehouse, v1 ' +
        'vault, v2 shrine with a glowing interior, v3 dorm with shuttered windows): the kit would have to carve it (a room ' +
        'of r ~4.5 m at y 0.22 behind the 2.5 m portal) before an interior can be planned' },
    { key: 'br_bldg_room_front', name: 'Lower-level room front', culture: 'beast-rider', wealth: 0.45,
      types: ['shop', 'dwelling-single'], lot: [12.5, 4.3],
      bodies: [rfBody(0, [{ at: [0], side: 1, w: 1.4 }], [['shop', 'cottage']])],
      note: 'variant 0 (dwelling front): a 12 x 3 m room cut into the deck level (inner 11.6 x 2.6 m, 4.24 m clear), plank ' +
        'front with a 1.4 m door at the centre, cut across into a shop and a one-room home. The rear door (x 2.2) into the ' +
        'deeper level is left out: what lies behind is not modelled. Variants keep the shell and change the front: ' +
        'items #1 (workshop), #2 (market stall), #3 (silk/web room)' },
    { key: 'br_bldg_room_front#1', name: 'Lower-level room front (variant 2: workshop)', culture: 'beast-rider', wealth: 0.45,
      types: ['shop'], lot: [12.5, 3.9], residence: false,
      bodies: [rfBody(1, [{ at: [-1.7], side: 1, w: 2.8, swing: 'out' }], ['workshop'])],
      note: 'variant 1: wide double doors (3.0 m, x -1.7), a hoist beam and crates: a workshop, nobody lives in it' },
    { key: 'br_bldg_room_front#2', name: 'Lower-level room front (variant 3: market stall)', culture: 'beast-rider', wealth: 0.45,
      types: ['shop'], lot: [12.5, 4.6], residence: false,
      bodies: [rfBody(2, [{ at: [2.2], side: -1, w: 1.1 }], ['shop'])],
      note: 'variant 2: the whole front is a 1.4 m counter under an awning, so the way in is the rear door (x 2.2) from ' +
        'the deeper level; a stall, nobody lives in it' },
    { key: 'br_bldg_room_front#3', name: 'Lower-level room front (variant 4: silk/web room)', culture: 'beast-rider', wealth: 0.45,
      types: ['shop'], lot: [12.5, 4.3], residence: false,
      bodies: [rfBody(3, [{ at: [0], side: 1, w: 1.5 }], ['workshop'])],
      note: 'variant 3: a dark boarded front with webbed windows and a 1.5 m door: a silk workroom (the planner asks for a ' +
        'workstation or loom)' },

    /* ---------- Girder */
    { key: 'br_bldg_girder_tower', name: 'Girder tower shell (open cross-section)', culture: 'beast-rider', wealth: 0.3,
      types: ['infrastructure', 'dwelling-multi'], residence: false, lot: [26, 26],
      skip: 'an open cross-section: four girder columns and ten L-shaped concrete plates with a corner missing (5 m floor ' +
        'to floor), no walls; its households live in tower-slot shells placed on the plates (br_bldg_girder_dwelling, ' +
        'Girder SLOTS), which carry the interiors' },
    { key: 'br_bldg_girder_roost_deck', name: 'Girder roost deck (atop a tower)', culture: 'beast-rider', wealth: 0.45,
      types: ['infrastructure', 'industry'], lot: [30, 30],
      rooms: [{ id: 'keeper', kind: 'store', poly: rect(3.6, 3.6, 9.1, 9.1), y: 0.35, h: 2.0,
        doors: [{ at: [9.2, 10.9], w: 1.0 }] }],
      note: 'a deck frame (4 m wide) round an open void on a tower top: the 8 roost stalls on its edges are open lean-tos ' +
        '1.7 x 1.8 m (stall and pen in one, too small to plan) and are not rooms. The keeper\'s shelter (4.2 m box, 2.2 m ' +
        'high, front door) in the +x +z corner is planned as a feed and tack store; its back corner is trimmed clear of the ' +
        'mooring mast' },
    { key: 'br_bldg_girder_dwelling', name: 'Girder dwelling (tower-slot shell)', culture: 'beast-rider', wealth: 0.3,
      types: ['dwelling-multi'], lot: [10.7, 11.4],
      bodies: [{ id: 'home', poly: rect(9, 9), y: 0.18, levels: [{ h: 3.0 }], wall: 0.18, roof: 'flat',
        doors: [{ at: [0, 4.5], w: 1.4 }], program: ['living', 'bedroom'] }],
      note: 'variant 0 (home): one household in a 9 x 9 m plank box on its slot\'s floor plate, front door 1.4 m; the shed ' +
        'roof falls from 3.6 m at the back to 3.0 m at the front (planned at 3.0). A dwelling-multi tag for the tower, but ' +
        'one shell is one household (units 1). Variants: #1 (v1, store front), #2 (v2, workshop), #3 (v3, common ' +
        'pavilion), #4 (v4, shrine)' },
    { key: 'br_bldg_girder_dwelling#1', name: 'Girder dwelling (tower-slot shell) (variant 2: store front)', culture: 'beast-rider', wealth: 0.3,
      types: ['dwelling-multi'], lot: [10.7, 10.9],
      bodies: [{ id: 'home', poly: rect(9, 9), y: 0.18, levels: [{ h: 3.0 }], wall: 0.18, roof: 'flat',
        doors: [{ at: [0, 4.5], w: 2.0 }], program: [['shop', 'cottage']] }],
      note: 'variant 1: the same box with a 2.0 m door, a hanging sign and crates: a store front with the household behind' },
    { key: 'br_bldg_girder_dwelling#2', name: 'Girder dwelling (tower-slot shell) (variant 3: workshop)', culture: 'beast-rider', wealth: 0.3,
      types: ['industry'], lot: [11, 11.6], residence: false,
      rooms: [{ id: 'work', kind: 'workshop', poly: rect(8.64, 7.35, 0, -0.645), y: 0, h: 3.4,
        doors: [{ at: [3.85, 3.03], w: 0.8, swing: 'none' }] }],
      note: 'variant 2: three walls and an open front with a 1.8 m counter 1.3 m in from the front: the workshop is the ' +
        'room behind the counter. The builder\'s counter (8.0 m) leaves only 0.32 m at each end of the 8.64 m inner width; ' +
        'the plan takes a 0.8 m pass at its right end (the kit should shorten the counter by ~0.5 m). Nobody lives in it ' +
        '(residence off)' },
    { key: 'br_bldg_girder_dwelling#3', name: 'Girder dwelling (tower-slot shell) (variant 4: common pavilion)', culture: 'beast-rider', wealth: 0.3,
      types: ['civic'], lot: [10.6, 10.6], residence: false,
      rooms: [{ id: 'common', kind: 'hall', poly: rect(7.4, 7.4), y: 0.22, h: 3.5,
        doors: [{ at: [0, 3.7], w: 2.4, swing: 'none' }],
        fixtures: [
          { id: 'bench-l', kind: 'bench', x: -3.45, z: 0, ry: 0, w: 0.5, d: 7.4, h: 0.45 },
          { id: 'bench-r', kind: 'bench', x: 3.45, z: 0, ry: 0, w: 0.5, d: 7.4, h: 0.45 },
          { id: 'bench-b', kind: 'bench', x: 0, z: -3.45, ry: 0, w: 7.4, d: 0.5, h: 0.45 },
          { id: 'stool', kind: 'block', x: 0, z: 0, ry: 0, w: 1.0, d: 1.0, h: 0.35 }] }],
      note: 'variant 3: an open pavilion on an 8.6 m deck, four carved corner posts, rails and built-in benches round three ' +
        'sides (fixtures) under a cloth awning roof; open at the front. A common room, not a home' },
    { key: 'br_bldg_girder_dwelling#4', name: 'Girder dwelling (tower-slot shell) (variant 5: shrine)', culture: 'beast-rider', wealth: 0.3,
      types: ['religious'], lot: [9.8, 9.8], residence: false,
      rooms: [{ id: 'shrine', kind: 'shrine', poly: rect(7.0, 6.8, 0, 0.1), y: 0.58, h: 2.75,
        doors: [{ at: [0, 3.5], w: 2.2, swing: 'none' }],
        fixtures: [{ id: 'altar', kind: 'altar', x: 0, z: -3.2, ry: 0, w: 2.2, d: 0.8, h: 0.9 }] }],
      note: 'variant 4: a tajug on a stone plinth (floor 0.58 m): 1.5 m screen walls on the back and sides, open front ' +
        'between the corner posts; the built altar against the back screen is a fixture' },
    { key: 'br_bldg_girder_assembly_hall', name: 'Girder Assembly Hall', culture: 'beast-rider', wealth: 0.6,
      types: ['civic'], lot: [30, 30],
      rooms: [{ id: 'hall', kind: 'hall', poly: ngon(ahIn, 12, 0), y: 1.1, h: 7.6,
        doors: [0, 3, 6, 9].map(function (i) { return { at: ngonMid(ahIn, 12, 0, i), w: 2.0 }; }) }],
      note: 'one round hall inside the 12-segment wall (R 13, inner face ~12.7) on the two-step stone plinth (floor 1.1 m), ' +
        'four doorways (front, back, both flanks); the colonnade (r 14.5) is a veranda outside the walls, not planned' },
    { key: 'br_bldg_girder_house', name: 'Girder ground house', culture: 'beast-rider', wealth: 0.45,
      types: ['dwelling-single'], lot: [14, 12],
      rooms: [{ id: 'hut', kind: 'cottage', poly: SH.circle(3.4, 12), y: 0, h: 2.6,
        doors: [{ at: [0, R3(3.4 * Math.cos(Math.PI / 12))], w: 1.2 }] }],
      note: 'variant 0 (roundhut): the main woven-wall hut (r 3.6, 2.8 m wall) is one room; the two satellite huts (r 2.0 ' +
        'and 1.7, walls 1.5 and 1.3 m) are too low to stand in: stores, not planned; the low back opening is left out. ' +
        'Variants: #1 (joglo), #2 (longhouse)' },
    { key: 'br_bldg_girder_house#1', name: 'Girder ground house (variant 2: joglo)', culture: 'beast-rider', wealth: 0.45,
      types: ['dwelling-single'], lot: [14, 12],
      rooms: [{ id: 'pendopo', kind: 'cottage', poly: rect(8.4, 6.7), y: 0.66, h: 3.2,
        doors: [{ at: [3.75, 3.35], w: 0.9, swing: 'none' }],
        fixtures: [{ id: 'platform', kind: 'platform', x: 0, z: 2.6, ry: 0, w: 6.0, d: 1.6, h: 0.4 }] }],
      note: 'variant 1: an open pendopo on a stone plinth (floor 0.66 m), six posts on 9 x 7.2 m, screen walls on the back ' +
        'and left, a rail on the right and front; the sitting platform along the front is a fixture, so the way in is the ' +
        'gap between it and the right front post' },
    { key: 'br_bldg_girder_house#2', name: 'Girder ground house (variant 3: longhouse)', culture: 'beast-rider', wealth: 0.45,
      types: ['dwelling-single'], lot: [15.5, 13],
      bodies: [{ id: 'longhouse', poly: rect(13, 10.5), y: 0.4, levels: [{ h: 3.4 }], wall: 0.25, roof: 'hip', pitch: 0.5,
        doors: [{ at: [0, 5.25], w: 1.6 }, { at: [3.0, -5.25], w: 1.2 }], program: ['living', 'bedroom', 'store'] }],
      note: 'variant 2: a tarred-wall hall (13 x 10.5 m, 3.4 m walls) on a stone plinth, front door at the centre and a back ' +
        'door at x 3. The builder\'s five cross beams at 1.5 m lie inside its solid wall block (not visible): read as tie ' +
        'beams above head height and not kept clear' },
    { key: 'br_bldg_girder_palisade', name: 'Girder palisade + watch tower', culture: 'beast-rider', wealth: 0.45,
      types: ['infrastructure'], lot: [16, 4.5],
      skip: 'a wall: a stake palisade with a 1.5 m firing step behind it and a 1.8 m square open post tower whose only floors ' +
        'are ladder landings (4.4 m and 9 m) under a hat roof; nothing enclosed' }
  ] });
})(KratorInteriors);
