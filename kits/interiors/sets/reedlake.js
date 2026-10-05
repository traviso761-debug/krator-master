/* ======================== Interior set: Reed Lake (settlements/reedlake, RL.def keys rl_*) ========================
   The interiors of the Reed Lake kit (settlements/reedlake: DESIGN.md, API.md): one item per RL.def key, read from
   the builders (76-rl-dwell 77-rl-village 78-rl-work 79-rl-farm 80-rl-islands 81-rl-tavern). Local frame = the
   builder's: origin at the plot centre on the island top (y = 0), +z the front (the landing), metres.
   Furniture culture: reedlake (kits/catalog/krator-master-furniture-reedlake.js; IX.CULTURE_FAMILY falls back to
   islander, eastabyss, generic). Wealth: poor 0.2, middle 0.5, civic 0.65 (the defs' wealth tags).
   Variants: every builder uses o.v only to reseed its stream (props move, bodies do not): no `#n` items.
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect, circle = SH.circle;
  const R3 = function (v) { return Math.round(v * 1000) / 1000; };
  const pt = function (r) { return Math.round(Math.atan(r) * 100) / 100; };   /* the kit's pitch (rise / half-span) as radians */
  const POOR = 0.2, MID = 0.5, CIVIC = 0.65;
  const SF = ['single-family dwelling'], MF = ['multi-family dwelling'];

  /* THE MUDHIF (hnRLMudhif, 75-rl-helpers.js): a superellipse arch (n 2.4) of span S and crown H along local z, length L,
     the end walls 0.12 in from the ends, the door (no leaf: a dark opening) in the middle of the +z end, min(1.7, 0.26 S)
     wide. The room keeps to where the arch stands at least h + 0.15 high over the floor. */
  const archHalf = function (S, H, h) { return S / 2 * Math.pow(1 - Math.pow(Math.min(h / H, 1), 2.4), 1 / 2.4); };
  function mudhif(id, kind, x, z, L, S, H, h, extra) {
    const hw = Math.floor(archHalf(S, H, h + 0.15) * 20) / 20, l = L - 0.5;
    return Object.assign({ id: id, kind: kind, poly: rect(R3(2 * hw), l, x, z), y: 0, h: h,
      doors: [{ at: [x, R3(z + l / 2)], w: R3(Math.min(1.7, S * 0.26)), swing: 'none' }] }, extra || {});
  }

  /* REED'S LOCAL (81-rl-tavern.js RLTAV): the hall mudhif at (-3, -2) L 28 S 11.5 H 9.4, the built-in mat benches along
     both walls (|x + 3| 4.6..5.55, 0.42 high, z -15.65..11.6), the cook-fire slab 2.6 square at (-3, -5); the annex mudhif
     at (6.55, 4) L 12 S 6.4 H 5.4, its mat partition at z 3.5 with a 1.0 m doorway; the covered landing deck x -7..1,
     z 17.4..24.5 (posts at x -6.8 and 0.8), long bundle benches down its sides and braziers at its front corners. */
  const TAV = { XH: -3, ZH: -2, L: 28, S: 11.5, H: 9.4, XA: 6.55, ZA: 4, LA: 12, SA: 6.4, HA: 5.4, ZP: 3.5 };
  const tavHall = (function () {
    const R = mudhif('hall', 'tavern', TAV.XH, TAV.ZH, TAV.L, TAV.S, TAV.H, 3.6);
    const hw = Math.min(5.55, Math.floor(archHalf(TAV.S, TAV.H, 3.75) * 20) / 20), bx = R3((4.6 + hw) / 2), bw = R3(hw - 4.6);   /* the benches, cut at the room's edge */
    R.fixtures = [
      { id: 'bench-w', kind: 'bench', x: R3(TAV.XH - bx), z: -2.025, ry: R3(Math.PI / 2), w: 27.25, d: bw, h: 0.42, clearance: { front: 0.5 }, reach: false },
      { id: 'bench-e', kind: 'bench', x: R3(TAV.XH + bx), z: -2.025, ry: R3(-Math.PI / 2), w: 27.25, d: bw, h: 0.42, clearance: { front: 0.5 }, reach: false },
      { id: 'cook-fire', kind: 'hearth', x: TAV.XH, z: TAV.ZH - 3, ry: 0, w: 2.6, d: 2.6, h: 1.8, clearance: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 }, reach: false }];
    return R;
  })();
  const tavAnnex = (function () {
    const hw = Math.floor(archHalf(TAV.SA, TAV.HA, 2.55) * 20) / 20, w = R3(2 * hw);
    const zf = R3(TAV.ZA + TAV.LA / 2 - 0.25), zb = R3(TAV.ZA - TAV.LA / 2 + 0.25), zk = R3(TAV.ZP + 0.1), zs = R3(TAV.ZP - 0.1);
    return [
      { id: 'kitchen', kind: 'kitchen', poly: rect(w, R3(zf - zk), TAV.XA, R3((zf + zk) / 2)), y: 0, h: 2.4,
        doors: [{ at: [TAV.XA, zf], w: 1.66, swing: 'none' }, { at: [TAV.XA, zk], w: 1.0, swing: 'none' }] },
      { id: 'store', kind: 'store', poly: rect(w, R3(zs - zb), TAV.XA, R3((zs + zb) / 2)), y: 0, h: 2.4,
        doors: [{ at: [TAV.XA, zs], w: 1.0, swing: 'none' }] }];
  })();
  const tavLanding = { id: 'landing', kind: 'tavern', poly: rect(7.2, 6.6, -3, 20.95), y: 0.05, h: 3.1,
    doors: [{ at: [-3, 17.65], w: 6.8, swing: 'none' }, { at: [-3, 24.25], w: 3.0, swing: 'none' }],
    fixtures: [
      { id: 'bench-w', kind: 'bench', x: -6.25, z: 20.55, ry: R3(Math.PI / 2), w: 4.6, d: 0.5, h: 0.56, reach: false },
      { id: 'bench-e', kind: 'bench', x: 0.25, z: 20.55, ry: R3(-Math.PI / 2), w: 4.6, d: 0.5, h: 0.56, reach: false },
      { id: 'brazier-w', kind: 'brazier', x: -6.1, z: 23.3, ry: 0, w: 0.8, d: 0.8, h: 0.8, reach: false },
      { id: 'brazier-e', kind: 'brazier', x: 0.1, z: 23.3, ry: 0, w: 0.8, d: 0.8, h: 0.8, reach: false }] };

  /* THE WEAVER'S SHED (78-rl-work.js buildRLWeaver): 9 x 6 between bundle posts (a post mid-front and mid-back), the mat
     floor at 0.06, a mat back wall, open on three sides; the builder's loom, cutting bench, soaking bath, rolled mats and
     curing lattice panels are fixtures */
  const weaverShed = { id: 'shed', kind: 'workshop', poly: rect(9, 6), y: 0.06, h: 2.5,
    doors: [{ at: [-2.3, 3], w: 4.1, swing: 'none' }, { at: [2.3, 3], w: 4.1, swing: 'none' },
      { at: [-4.5, 0], w: 5.4, swing: 'none' }, { at: [4.5, 0], w: 5.4, swing: 'none' }],
    fixtures: [
      { id: 'post-front', kind: 'post', x: 0, z: 2.85, ry: 0, w: 0.3, d: 0.3, h: 2.5, reach: false },
      { id: 'loom', kind: 'loom', x: -2.4, z: -1.2, ry: 0, w: 2.9, d: 0.35, h: 2.4, clearance: { front: 0.9 }, reach: false },
      { id: 'cutting-bench', kind: 'workstation', x: 2, z: -1.6, ry: 0, w: 2.4, d: 0.8, h: 0.85, clearance: { front: 0.6 }, reach: false },
      { id: 'soaking-bath', kind: 'vessel', x: 2.6, z: 1.4, ry: 0, w: 2.6, d: 1.4, h: 0.5, reach: false },
      { id: 'rolled-mats', kind: 'stack', x: -2.2, z: 1.65, ry: 0, w: 3.0, d: 0.6, h: 0.6, reach: false },
      { id: 'lattice-panels', kind: 'stack', x: 4.25, z: -0.4, ry: 0, w: 0.5, d: 2.6, h: 1.9, reach: false }] };

  IX.sets.add({ set: 'reedlake', title: 'Reed Lake: the floating reed village', culture: 'reedlake', items: [
    /* ---------- dwellings (76-rl-dwell.js) */
    { key: 'rl_small_a', name: 'Thatch hut', culture: 'reedlake', wealth: POOR, types: SF, lot: [12, 12],
      bodies: [{ id: 'hut', poly: rect(4.4, 3.6), y: 0, levels: [{ h: 1.9 }], wall: 0.08, roof: 'gable', pitch: pt(1.35),
        doors: [{ at: [0, 1.8], w: 0.9 }], program: ['cottage'] }],
      note: 'the Uros hut: mat walls 4.4 x 3.6 and 1.9 high on the island top under a steep totora gable (ridge 4.3); the hearth, ' +
        'the drying reed and the canoe are outside' },
    { key: 'rl_small_b', name: 'Cone hut', types: SF, lot: [12, 12],
      skip: 'a tiered thatch cone (R 2.4 at the ground, 4.6 high) with a 0.8 x 1.4 crawl door: inside the thatch it is 1.5 m high ' +
        'only within r 1.3 (about 5 m2), too small for a bed, a hearth and a chest. A cone of R 3.2 or more, or a mat drum ' +
        'under the cone (as the shaman\'s house has), would hold a one-room home. The little store cone (R 1.15) is a bin' },
    { key: 'rl_small_c', name: 'Small mudhif', culture: 'reedlake', wealth: POOR, types: SF, lot: [12, 13],
      rooms: [mudhif('hall', 'cottage', 0, -0.4, 5.6, 3.6, 3.1, 2.0)],
      note: 'three columns each end, L 5.6 S 3.6 H 3.1: one room kept to where the arch is 2.15 m high, the door in the front' },
    { key: 'rl_large_a', name: 'Family mudhif', culture: 'reedlake', wealth: MID, types: MF, lot: [16, 20],
      rooms: [mudhif('hall', 'cottage', 0, -1, 10, 5.4, 4.8, 2.6)],
      note: 'L 10 S 5.4 H 4.8: the extended family round one hearth in one hall (the builder draws no screens inside); the terrace, ' +
        'the braziers and the fish rail are outside' },
    { key: 'rl_large_b', name: 'Long dwelling', culture: 'reedlake', wealth: MID, types: MF, units: 3, lot: [20, 15],
      bodies: [-4.33, 0, 4.33].map(function (x, i) {
        return { id: 'unit' + (i + 1), poly: rect(4.3, 4.6, x, 0), y: 0.5, levels: [{ h: 2.3 }], wall: 0.08, roof: 'gable', pitch: pt(1.2),
          doors: [{ at: [[-4.3, 0, 4.3][i], 2.3], w: 0.85 }], program: ['cottage'] };
      }),
      note: 'the mat hut 13 x 4.6 (walls 2.3) on the bundle deck at 0.5: one household behind each of its three doors, the box split ' +
        'at the door thirds (the mat screens between them are assumed: the builder draws one box). The veranda is open' },

    /* ---------- halls, sacred, lookout (77-rl-village.js) */
    { key: 'rl_longhouse', name: 'Great mudhif', culture: 'reedlake', wealth: CIVIC, types: ['civic'], lot: [30, 36],
      rooms: [mudhif('hall', 'hall', 0, -2, 22, 8.6, 8.2, 3.0)],
      note: 'the village guest hall, seven columns each end, L 22 S 8.6 H 8.2, planned to where the arch is 3.15 m high; the ' +
        'terrace, its braziers and the landing are outside' },
    { key: 'rl_warrior_hall', name: "Warrior's hall", culture: 'reedlake', wealth: CIVIC, types: ['military'], lot: [32, 32],
      rooms: [mudhif('hall', 'barracks', 0, -4, 15, 6.2, 5.6, 2.6)],
      note: 'the mudhif (L 15 S 6.2 H 5.6) as the warriors\' sleeping hall; the palisade, the sparring ring and the racks are open' },
    { key: 'rl_shaman', name: "Shaman's house", culture: 'reedlake', wealth: MID, types: ['religious'], lot: [22, 22],
      rooms: [{ id: 'house', kind: 'shrine', poly: circle(3.3, 12), y: 0.11, h: 2.2, doors: [{ at: [0, 3.2], w: 0.95 }] }],
      note: 'the round mat house (R 3.4, wall 2.3) on its disc (0.11) under the painted cone; the spirit poles, the herb rail and ' +
        'the fire are outside' },
    { key: 'rl_spirit_circle', name: 'Spirit circle', types: ['religious'], lot: [24, 26],
      skip: 'a ring of banded reed pillars round a hearth on a clay slab: open' },
    { key: 'rl_watchtower', name: 'Watchtower', types: ['military'], lot: [12, 12],
      skip: 'an open lookout: a railed mat platform (2.9 m square) at 6.4 m under a thatch cap, no walls, reached by bundle rungs' },

    /* ---------- work (78-rl-work.js) */
    { key: 'rl_dock', name: 'Fishing dock', types: ['infrastructure', 'industry'], lot: [16, 28],
      skip: 'an open pontoon pier with a T-head; the nets, the fish rails and the catch stand on the open island' },
    { key: 'rl_weaver', name: "Reed weaver's workshop", culture: 'reedlake', wealth: POOR, types: ['industry', 'market/shop'], lot: [20, 18],
      rooms: [weaverShed],
      note: 'an open thatch shed (9 x 6 between bundle posts, eaves 2.6) on a mat floor with a mat back wall, open on three sides; ' +
        'the builder\'s loom, cutting bench, soaking bath, rolled mats and curing lattice panels are fixtures' },
    { key: 'rl_warehouse', name: 'Warehouse', culture: 'reedlake', wealth: MID, types: ['industry', 'market/shop'], lot: [22, 22],
      bodies: [{ id: 'store', poly: rect(12, 8), y: 0.7, levels: [{ h: 3.2 }], wall: 0.1, roof: 'hip', pitch: pt(3.4 / 4), windows: false,
        doors: [{ at: [0, 4], w: 2.6 }], program: ['shop', 'store'] }],
      note: 'the mat box 12 x 8 (walls 3.2, no openings but the double doors) on the bundle deck at 0.7 under the thatch hip; the ' +
        'stock on the deck outside, the crane and the ramp are open' },
    { key: 'rl_smithy', name: 'Scrap smithy', types: ['industry'], lot: [18, 16],
      skip: 'an open forge shelter: a thatch gable on four bundle posts over a clay platform, one mat wall at the back; the hearth, ' +
        'bellows, anvil, quench tub and tool rack are the builder\'s own' },
    { key: 'rl_boat_canoe', name: 'Reed canoe', types: ['infrastructure'], lot: [9, 8], skip: 'a reed boat: open' },
    { key: 'rl_boat_great', name: 'Great reed boat', types: ['infrastructure'], lot: [12, 12],
      skip: 'a reed boat; its mat cabin is 1.6 x 2.9 and 1.2 m high, a shelter to crouch in' },
    { key: 'rl_boat_raft', name: 'Reed raft', types: ['infrastructure'], lot: [9, 8], skip: 'a reed raft: open' },

    /* ---------- farms (79-rl-farm.js) */
    { key: 'rl_farmhouse', name: 'Farmhouse', culture: 'reedlake', wealth: POOR, types: ['farm', 'single-family dwelling'], lot: [22, 18],
      bodies: [{ id: 'house', poly: rect(5.2, 4, -1, 0), y: 0, levels: [{ h: 2.0 }], wall: 0.08, roof: 'gable', pitch: pt(1.3),
        doors: [{ at: [-1, 2], w: 0.9 }], program: ['cottage'] }],
      note: 'the thatch hut 5.2 x 4 (walls 2.0) at x -1; the byre beside it is a mat-backed lean-to open at the front, the duck house ' +
        'is a metre high, the kitchen plot and the fodder are open' },
    { key: 'rl_farm', name: 'Floating gardens', types: ['farm'], lot: [34, 34],
      skip: 'garden rafts of mud on the water round a small island with an open field shelter on four posts' },
    { key: 'rl_pen', name: 'Animal pen', types: ['farm'], lot: [22, 18], skip: 'a bundle-fenced pen with an open thatch shelter along the back' },
    { key: 'rl_granary', name: 'Granary', culture: 'reedlake', wealth: POOR, types: ['farm'], lot: [14, 14],
      rooms: [{ id: 'bin', kind: 'store', poly: circle(1.9, 16), y: 1.94, h: 2.2, doors: [{ at: [0, 1.9], w: 0.8, swing: 'none' }] }],
      note: 'the round mat bin (R 2) on six stilts, its floor at 1.94, entered by the hatch up the ladder (the hatch sill is 0.76 ' +
        'above the bin floor)' },
    { key: 'rl_fishfarm', name: 'Fish weir and duck run', types: ['farm'], lot: [24, 24],
      skip: 'a fish weir and a duck run on open water; the duck house is 1.6 x 1.3 and a metre high' },

    /* ---------- islands and the village (80-rl-islands.js) */
    { key: 'rl_island_a', name: 'Reed island — small', types: ['infrastructure'], lot: [22, 22], skip: 'a bare reed island: ground for other buildings' },
    { key: 'rl_island_b', name: 'Reed island — oval', types: ['infrastructure'], lot: [34, 26], skip: 'a bare reed island: ground for other buildings' },
    { key: 'rl_island_c', name: 'Reed island — large with cove', types: ['infrastructure'], lot: [54, 40], skip: 'a bare reed island: ground for other buildings' },
    { key: 'rl_island_d', name: 'Reed island — long', types: ['infrastructure'], lot: [36, 16], skip: 'a bare reed island: ground for other buildings' },
    { key: 'rl_island_e', name: 'Reed island — ring with lagoon', types: ['infrastructure'], lot: [40, 36], skip: 'a bare reed island: ground for other buildings' },
    { key: 'rl_village', name: 'Floating village', types: ['multi-family dwelling', 'civic', 'farm'], lot: [160, 126],
      skip: 'the composite village: its buildings are the kit\'s own defs, placed by hnSub; instantiate each from its own item ' +
        'at the placement the village builder gives it' },

    /* ---------- hospitality (81-rl-tavern.js) */
    { key: 'rl_tavern', name: "Reed's Local", culture: 'reedlake', wealth: MID, types: ['tavern/inn'], lot: [26, 36],
      rooms: [tavHall].concat(tavAnnex, [tavLanding]),
      note: 'the drinking hall (mudhif L 28 S 11.5 H 9.4) planned to where the arch is 3.75 m high: about 90 guests sit on the ' +
        'built-in mat benches along both walls (fixtures, 27 m each) besides the tables; the cook-fire on its mud slab is a fixture. ' +
        'The annex mudhif (L 12 S 6.4 H 5.4) is the kitchen (the street door) and the store behind its mat partition. The covered ' +
        'landing over the water is open-sided: planned as a second drinking room, its bundle benches and braziers fixtures' }
  ] });
})(KratorInteriors);
