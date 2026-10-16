/* ======================== Interior set: Yuni town keys (the Yuni base kit: settlements/yuni, settlements/locus 56-59) ========
   Split from Verge's yuni.js when main's yuni.js (Mungo: the six middle-class houses, in detail) met it in a merge
   (2026-10-05): this set keeps the keys that set lacks; the middle-class houses are there. Lookups search every set.
   The interiors of the Yuni BASE building kit, for the keys a Yuni-built town places (Lower Verge places exactly these):
   civic_chapter_house, trade_market_hall, trade_shop_house, trade_tavern, trade_caravanserai, mid_djenne_house,
   mid_courtyard_house, mid_bluewash_townhouse, mid_round_tower_house, poor_mud_house, rich_merchant_palace.
   One item per key (read from the builders in settlements/locus/src/56-mid.js, 57-poor.js, 58-rich.js, 59-civic.js, the
   same code as settlements/yuni), plus `<key>#n` items for every variant > 0 (a variant with no item is not furnished).
   Local frame = the builder's F: origin at the footprint centre on the ground, +z the front (the door side), metres.
   Furniture cultures (the catalog's Yuni tiers, kits/catalog README "Pieces added in the 2026-10 interiors pass"):
   poor -> yuni-poor, middle and trade -> yuni-common, rich -> yuni-court; the Historians' chapter house -> order (the
   Order's own pieces: cell cots, the kitchen range, bookcases, reading tables). Yuni's own tags (51-fixtures.js
   BUILDING_TAGS) call the Djenne house `sahelian` and the caravanserai `nomad`; both fall back through yuni-common.
   Wealth = the middle of the ASSET's wealth band. The battered walls (fr8, rbody k 0.93-0.95) lean in: the plan uses the
   footprint at the base and walls 0.45-0.5 thick, so the rooms stay inside the upper storeys too.
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const R3 = function (v) { return Math.round(v * 1000) / 1000; };
  const PI = Math.PI;

  /* ---- the Historians' chapter house (59-civic.js): the two curved two-storey gallery wings round the court C = (0, 2),
     r 16.5..21.5, angles [PI+0.31, PI+1.14] (back left) and [2PI-1.14, 2PI-0.31] (back right); four arcade bays each on the
     court face (the doors are the middle two bays) */
  const CH_C = [0, 2];
  function chPol(r, a) { return [R3(CH_C[0] + r * Math.cos(a)), R3(CH_C[1] + r * Math.sin(a))]; }
  function chWing(id, a0, a1) {
    const n = 8, poly = [];
    for (let i = 0; i <= n; i++) poly.push(chPol(21.5, a0 + (a1 - a0) * i / n));
    for (let i = n; i >= 0; i--) poly.push(chPol(16.5, a0 + (a1 - a0) * i / n));
    const da = (a1 - a0) / 4;
    return { id: id, poly: poly, y: 0.06, levels: [{ h: 3.0 }, { h: 2.9 }], wall: 0.45, roof: 'flat',
      doors: [{ at: chPol(16.5, a0 + da * 1.5), w: 2.4, swing: 'none' }, { at: chPol(16.5, a0 + da * 2.5), w: 2.4, swing: 'none' }],
      program: [['library', 'study'], ['dormitory', 'dormitory']] };
  }

  /* ---- the arcaded market hall (56-mid.js): arcades W 21 x D 13.2 (0.6 thick) on a 0.3 plinth, corner piers 1.5, three inner
     piers at x -6.5, 0, 6.5; four stall counters (2.6 x 1.1) and two big pots drawn by the builder -> fixtures */
  const mhFix = [[-6.5, 0, 0.9, 0.9, 4.9], [0, 0, 0.9, 0.9, 4.9], [6.5, 0, 0.9, 0.9, 4.9],
    [-9.6, -5.7, 0.7, 0.7, 4.9], [9.6, -5.7, 0.7, 0.7, 4.9], [-9.6, 5.7, 0.7, 0.7, 4.9], [9.6, 5.7, 0.7, 0.7, 4.9],
    [-7.5, 2.5, 2.6, 1.1, 1.4], [-2.5, -2.5, 2.6, 1.1, 1.4], [3.5, 2.5, 2.6, 1.1, 1.4], [8, -2.5, 2.6, 1.1, 1.4],
    [-4.5, -3.5, 1.0, 1.0, 1.3], [5.6, 3.2, 0.9, 0.9, 1.2]].map(function (f, i) {
    return { id: 'mh-' + i, kind: i < 7 ? 'post' : 'counter', x: f[0], z: f[1], ry: 0, w: f[2], d: f[3], h: f[4], reach: false };
  });
  function marketHall(fx, bx) {
    return [{ id: 'hall', kind: 'shop', poly: rect(19.8, 12.0, 0, 0), y: 0.3, h: 4.4, fixtures: mhFix,
      doors: [{ at: [fx, 6.0], w: 2.8, swing: 'none' }, { at: [bx, -6.0], w: 2.8, swing: 'none' },
        { at: [-9.9, 0], w: 2.8, swing: 'none' }, { at: [9.9, 0], w: 2.8, swing: 'none' }] }];
  }

  /* ---- the shop-house (56-mid.js): rbody 8.2 x 6.4 at z -2.1 (front 1.1), the wide shopfront arch (3.3) at x = -m*1.35 and the
     house door at x = m*2.55; st storeys of 3.2 */
  function shopHouse(m, st) {
    return [{ id: 'house', poly: rect(8.2, 6.4, 0, -2.1), y: 0.1, levels: st === 3 ? [{ h: 2.9 }, { h: 2.9 }, { h: 2.9 }] : [{ h: 2.9 }, { h: 2.9 }],
      wall: 0.45, roof: 'flat',
      doors: [{ at: [R3(-m * 1.35), 1.1], w: 3.2, swing: 'none' }, { at: [R3(m * 2.55), 1.1], w: 1.15 }],
      program: st === 3 ? [['shop', 'store'], ['living', 'bedroom'], ['bedroom', 'store']] : [['shop', 'store'], ['living', 'bedroom']] }];
  }

  /* ---- the tavern (56-mid.js): rbody 8.4 x 6.4 at (bx = -m*2.5, -2.5), the door mid-front under the arcaded porch; the kitchen
     lean-to (3.6 x 3.0, 2.9 high) at the back of the walled yard (x = m*4.15), its doorway on the front */
  function tavern(m, st) {
    const bx = R3(-m * 2.5), kx = R3(m * 4.15);
    return {
      bodies: [{ id: 'house', poly: rect(8.4, 6.4, bx, -2.5), y: 0.1, levels: st === 3 ? [{ h: 2.9 }, { h: 2.9 }, { h: 2.9 }] : [{ h: 2.9 }, { h: 2.9 }],
        wall: 0.45, roof: 'flat', doors: [{ at: [bx, 0.7], w: 1.5 }],
        program: st === 3 ? [['tavern', 'store'], ['bedroom', 'bedroom'], ['bedroom', 'bedroom']] : [['tavern', 'store'], ['bedroom', 'bedroom']] }],
      rooms: [{ id: 'kitchen', kind: 'kitchen', poly: rect(3.2, 2.6, kx, -4.0), y: 0, h: 2.6, doors: [{ at: [kx, -2.7], w: 1.0 }] }]
    };
  }

  /* ---- the caravanserai (56-mid.js): X 47, Z 35, ranges RB 4.7 deep against the outer wall, two storeys (4.4, 8.2), galleries
     G 7.5 to the court arcades; corner towers r 3.5 at (+-42.4, +-30.4). The builder cuts room doors (dark openings) behind
     the galleries: back range ground every 2nd bay of 15 (8 doors), back range upper every 4th (4 doors), right range ground
     6 doors, front range 3 each side of the gate. The left range is the stables (no room doors). */
  const caravanRooms = (function () {
    const out = [], LB = 79, LS = 55, D = [];
    for (let k = 0; k < 8; k++) D.push(R3((2 * k - 7) * LB / 15));
    const ends = 38.6, zb = -32.45, db = 3.9;
    function cells(xs, lo, hi) { const b = [lo]; for (let i = 0; i < xs.length - 1; i++) b.push((xs[i] + xs[i + 1]) / 2); b.push(hi); return b; }
    const bg = cells(D, -ends, ends), kindsG = ['store', 'dormitory', 'store', 'kitchen', 'tavern', 'store', 'dormitory', 'store'];
    D.forEach(function (x, k) {
      const x0 = bg[k] + (k ? 0.1 : 0), x1 = bg[k + 1] - (k < 7 ? 0.1 : 0);
      out.push({ id: 'back-' + k, kind: kindsG[k], poly: rect(R3(x1 - x0), db, R3((x0 + x1) / 2), zb), y: 0.06, h: 4.0, doors: [{ at: [x, -30.5], w: 1.1 }] });
    });
    const DU = [D[0], D[2], D[4], D[6]], bu = cells(DU, -ends, ends);
    DU.forEach(function (x, k) {
      const x0 = bu[k] + (k ? 0.1 : 0), x1 = bu[k + 1] - (k < 3 ? 0.1 : 0);
      out.push({ id: 'back-up-' + k, kind: 'dormitory', level: 1, poly: rect(R3(x1 - x0), db, R3((x0 + x1) / 2), zb), y: 4.4, h: 3.5, doors: [{ at: [x, -30.5], w: 1.1 }] });
    });
    const DR = [-25, -15, -5, 5, 15, 25], br = cells(DR, -26.8, 26.8), kindsR = ['dormitory', 'dormitory', 'store', 'dormitory', 'dormitory', 'store'];
    DR.forEach(function (z, k) {
      const z0 = br[k] + (k ? 0.1 : 0), z1 = br[k + 1] - (k < 5 ? 0.1 : 0);
      out.push({ id: 'right-' + k, kind: kindsR[k], poly: rect(db, R3(z1 - z0), 44.45, R3((z0 + z1) / 2)), y: 0.06, h: 4.0, doors: [{ at: [42.5, z], w: 1.1 }] });
    });
    [-1, 1].forEach(function (s) {
      [[13, 11.0, 18.15, 'store'], [23.5, 18.35, 28.65, 'dormitory'], [34, 28.85, 38.6, 'dormitory']].forEach(function (c, k) {
        out.push({ id: (s < 0 ? 'front-w-' : 'front-e-') + k, kind: c[3], poly: rect(R3(c[2] - c[1]), db, R3(s * (c[1] + c[2]) / 2), 32.45), y: 0.06, h: 4.0,
          doors: [{ at: [R3(s * c[0]), 30.5], w: 1.1 }] });
      });
    });
    return out;
  })();

  /* ---- the Djenne-front house (56-mid.js): fr8 9.4 x 7.0 at z -0.4 battered 0.16 to the top, the door in the potige panel
     at x 0 (the wall's base face at z 3.1); H = 6.4 / 7.4 / 4.3 (two, two, one storeys) */
  function djenne(H) {
    if (H < 5) return [{ id: 'house', poly: rect(9.4, 7.0, 0, -0.4), y: 0.1, levels: [{ h: 3.6 }], wall: 0.5, roof: 'flat',
      doors: [{ at: [0, 3.1], w: 1.45 }], program: [['living', 'bedroom']] }];
    const h0 = H > 7 ? 3.2 : 2.8, h1 = H > 7 ? 3.0 : 2.6;
    return [{ id: 'house', poly: rect(9.4, 7.0, 0, -0.4), y: 0.1, wall: 0.5, roof: 'flat', slab: 0.3,
      levels: [{ h: h0 }, { h: h1 }],
      doors: [{ at: [0, 3.1], w: 1.45 }], program: [['living', 'kitchen'], ['bedroom', 'bedroom']] }];
  }

  /* ---- the courtyard house (56-mid.js): S 11, four ranges 3.5 deep round a 4 m court (floors on the 0.7 m base slab), walls 3.9;
     the corner tower (R 2.35) at (m*3.5, 3.5); the front door at x = -m*1.2; doorways from the court into the front and back
     ranges at x 0; the tower's upper room opens onto the roof (y 3.9) toward the court */
  function courtyard(m) {
    const s = m;
    return [
      { id: 'front', kind: 'living', poly: s > 0 ? [[-5.1, 2.3], [1.0, 2.3], [1.0, 5.1], [-5.1, 5.1]] : [[5.1, 2.3], [-1.0, 2.3], [-1.0, 5.1], [5.1, 5.1]],
        y: 0.7, h: 3.0, doors: [{ at: [R3(-s * 1.2), 5.1], w: 1.4 }, { at: [0, 2.3], w: 1.0 }] },
      { id: 'back', kind: 'bedroom', poly: [[-5.1, -5.1], [5.1, -5.1], [5.1, -2.3], [-2.3, -2.3], [-2.3, 1.7], [-5.1, 1.7]].map(function (p) { return [R3(s * p[0]), p[1]]; }),
        y: 0.7, h: 3.0, doors: [{ at: [0, -2.3], w: 1.0 }] },
      { id: 'side', kind: 'kitchen', poly: rect(2.8, 3.1, R3(s * 3.7), -0.45), y: 0.7, h: 3.0, doors: [{ at: [R3(s * 2.3), -0.45], w: 0.9 }] },
      { id: 'tower', kind: 'study', level: 1, poly: SH.circle(1.85, 12, R3(s * 3.5), 3.5), y: 3.9, h: 3.2, doors: [{ at: [R3(s * 3.5), 1.65], w: 0.9 }] }
    ];
  }

  /* ---- the blue-wash townhouse (56-mid.js): rbody W x 7.2 at z -0.7 (front 2.9), storeys of 3.2; v0/v2 two storeys W 8.6, door
     x -1.89; v1/v3 three storeys W 7.8, door x +1.72 */
  function bluewash(st) {
    const W = st === 3 ? 7.8 : 8.6, dx = st === 3 ? 1.716 : -1.892;
    return [{ id: 'house', poly: rect(W, 7.2, 0, -0.7), y: 0.1, wall: 0.45, roof: 'flat',
      levels: st === 3 ? [{ h: 2.9 }, { h: 2.9 }, { h: 2.9 }] : [{ h: 2.9 }, { h: 2.9 }],
      doors: [{ at: [dx, 2.9], w: 1.4 }],
      program: st === 3 ? [['living', 'kitchen'], ['bedroom', 'store'], ['bedroom', 'study']] : [['living', 'kitchen'], ['bedroom', 'bedroom']] }];
  }

  /* ---- the round-tower house (56-mid.js): the drum (R 3.7, battered 0.1) at (tx = -m*2.6, -0.5), the front door in it, its upper
     storey opening onto the wing's roof terrace (y Hw) at angle 0.18 (m = 1) / PI-0.18; the lower wing (6.6 x 6.4, Hw high) at
     x = m*2.9, z -0.9, entered only from the drum */
  function roundTower(m, Hw) {
    const tx = R3(-m * 2.6), tz = -0.5, a = m > 0 ? 0.18 : PI - 0.18, rU = 3.0;
    return [
      { id: 'drum', kind: 'living', poly: SH.circle(3.25, 16, tx, tz), y: 0.1, h: 3.0,
        doors: [{ at: [tx, 2.75], w: 1.4 }, { at: [R3(m * 0.8), tz], w: 0.9 }] },
      { id: 'drum-upper', kind: 'bedroom', level: 1, poly: SH.circle(rU, 16, tx, tz), y: Hw, h: 2.8,
        doors: [{ at: [R3(tx + Math.cos(a) * rU), R3(tz + Math.sin(a) * rU)], w: 0.95 }] },
      { id: 'wing', kind: 'kitchen', poly: m > 0 ? [[0.95, -3.75], [5.85, -3.75], [5.85, 1.95], [0.95, 1.95]] : [[-0.95, -3.75], [-5.85, -3.75], [-5.85, 1.95], [-0.95, 1.95]],
        y: 0.1, h: R3(Hw - 0.4), doors: [{ at: [R3(m * 0.8), tz], w: 0.9 }] }
    ];
  }

  /* ---- the merchant prince's palace (58-rich.js): the ground rear block 17.6 x 9.5 at z -2.75 (5.0 high) behind the open loggia,
     the upper block 18 x 14.3 at z -0.35 riding on the arcade (piano nobile 5.0-8.7, attic 8.7-11.8); the door on the rear block's
     front (z 2.0) at x = 0 / -2.2 / -0.75 by variant */
  function merchantPalace(dox) {
    const up = rect(18, 14.3, 0, -0.35);
    return [{ id: 'palace', poly: rect(17.6, 9.5, 0, -2.75), y: 0, wall: 0.5, roof: 'flat', slab: 0.3,
      levels: [{ h: 4.6 }, { h: 3.4, poly: up }, { h: 2.8, poly: up }],
      doors: [{ at: [dox, 2.0], w: 1.5 }],
      program: [['hall', 'store', 'kitchen'], ['living', 'bedroom', 'study'], ['bedroom', 'bedroom', 'store']] }];
  }

  /* ---- the flat-roofed mud house (57-poor.js mudRoom: fr8 battered 0.16, the door in the front face) */
  const mudL = [[-4.6, 3.9], [-0.6, 3.9], [-0.6, 0.5], [4.6, 0.5], [4.6, -4.1], [-4.0, -4.1], [-4.0, -0.1], [-4.6, -0.1]];

  IX.sets.add({ set: 'yuni-town', title: 'Yuni base kit: the town keys (civic, trade, poor, rich; Lower Verge)', culture: 'yuni-common', items: [
    /* ---------- Civic (59-civic.js) */
    { key: 'civic_chapter_house', name: 'Chapter house of the Historians', culture: 'order', wealth: 0.78, types: ['civic', 'religious'], lot: [56, 48],
      rooms: [
        { id: 'chapter-library', kind: 'library', poly: SH.circle(7.0, 20, 0, -15.5), y: 0.1, h: 7.0, doors: [{ at: [0, -8.5], w: 1.7 }] },
        { id: 'shrine', kind: 'shrine', poly: SH.circle(5.5, 16, -19, 2), y: 0.1, h: 5.0, doors: [{ at: [R3(-19 + 5.5 * Math.cos(-0.35)), R3(2 + 5.5 * Math.sin(-0.35))], w: 1.3 }] },
        { id: 'scriptorium', kind: 'study', poly: SH.circle(5.5, 16, 19, 2), y: 0.1, h: 5.0, doors: [{ at: [R3(19 + 5.5 * Math.cos(PI + 0.35)), R3(2 + 5.5 * Math.sin(PI + 0.35))], w: 1.3 }] }],
      bodies: [chWing('west-wing', PI + 0.31, PI + 1.14), chWing('east-wing', 2 * PI - 1.14, 2 * PI - 0.31)],
      note: 'the Order of Historians (saffron-robed scholar monks): the great drum (R 7.5, one 8.6 m hall, door on +z) is their library, ' +
        'the west drum (R 6) a shrine, the east drum a scriptorium (study), each entered from the court; the two curved two-storey gallery ' +
        'wings (r 16.5-21.5) hold a reading gallery and study below (entered through the middle two arcade bays) and the monks\' ' +
        'dormitories above (no stair is drawn: the planner fits one). The court, the rotunda and the gate are open' },

    /* ---------- Trade (56-mid.js) */
    { key: 'trade_market_hall', name: 'Arcaded market hall', culture: 'yuni-common', wealth: 0.6, types: ['market/shop'], lot: [22, 14],
      rooms: marketHall(0, 0),
      note: 'one open hall inside the arcades (19.8 x 12 on the 0.3 m plinth); the inner piers, corner piers, the four stall counters and ' +
        'two big pots the builder draws are fixtures. Variant 1 (four bays, domes) is trade_market_hall#1' },
    { key: 'trade_market_hall#1', name: 'Arcaded market hall (variant 2: flat roof and three domes)', culture: 'yuni-common', wealth: 0.6, types: ['market/shop'], lot: [22, 14],
      rooms: marketHall(2.475, -2.475), note: 'as variant 0; four arcade bays front and back (a pier on the axis), so the front and back ways in are the bays at x +-2.475' },

    /* ---------- The market's props (56-mid.js 10, 10b): open to the street; their wares are the builder's own */
    { key: 'prop_market_stall', name: 'Market stall', culture: 'yuni-common', wealth: 0.45, types: ['market/shop'], lot: [3, 3],
      skip: 'an open counter under an awning on two posts, no walls: the jars, cloth, crates and lantern on it are drawn by the builder' },
    { key: 'prop_market_tent', name: "Nomad's goat-hair tent", culture: 'nomad', wealth: 0.35, types: ['market/shop'], lot: [5, 5],
      skip: 'a low open-fronted tent (0.95 m at the eaves) over the trader\'s bales; the jar, bales and basket at its mouth are the builder\'s' },

    { key: 'trade_shop_house', name: 'Shop-house', culture: 'yuni-common', wealth: 0.55, types: ['market/shop', 'single-family dwelling'], lot: [9, 11],
      bodies: shopHouse(1, 2),
      note: 'variant 0: the shop behind the wide shopfront arch (x -1.35) and a store below, the family\'s living room and bedroom above, the ' +
        'house door at x 2.55. The roof-terrace bulkhead and the awning are open' },
    { key: 'trade_shop_house#1', name: 'Shop-house (variant 2)', culture: 'yuni-common', wealth: 0.55, types: ['market/shop', 'single-family dwelling'], lot: [9, 11],
      bodies: shopHouse(-1, 2), note: 'variant 1: variant 0 mirrored (shopfront at x 1.35, door at x -2.55)' },
    { key: 'trade_shop_house#2', name: 'Shop-house (variant 3)', like: 'trade_shop_house', note: 'variant 2: the plan of variant 0 (other goods)' },
    { key: 'trade_shop_house#3', name: 'Shop-house (variant 4: three storeys)', culture: 'yuni-common', wealth: 0.55, types: ['market/shop', 'single-family dwelling'], lot: [9, 11],
      bodies: shopHouse(-1, 3), note: 'variant 3: mirrored, three storeys: shop and store, living room and bedroom, a bedroom and a store' },

    Object.assign({ key: 'trade_tavern', name: 'Tavern with shaded yard', culture: 'yuni-common', wealth: 0.55, types: ['tavern/inn'], lot: [14, 12],
      note: 'variant 0: the house (8.4 x 6.4, two storeys) at x -2.5: the taproom and a store below, two guest rooms above; the kitchen lean-to ' +
        'at the back of the yard. The arcaded porch, its terrace and the walled yard under the olive are open' }, tavern(1, 2)),
    Object.assign({ key: 'trade_tavern#1', name: 'Tavern with shaded yard (variant 2: three storeys)', culture: 'yuni-common', wealth: 0.55, types: ['tavern/inn'], lot: [14, 12],
      note: 'variant 1: mirrored (the house at x 2.5, the yard and kitchen on the left), three storeys: four guest rooms above the taproom' }, tavern(-1, 3)),

    { key: 'trade_caravanserai', name: 'Caravanserai of the desert road', culture: 'yuni-common', wealth: 0.65, types: ['tavern/inn', 'market/shop'], lot: [96, 72],
      rooms: caravanRooms,
      note: 'one room behind each door the builder cuts: the back range\'s eight ground rooms (stores, lodgings, a kitchen and a taproom) and ' +
        'four upper dormitories (reached by the two court ramps and the upper gallery), the right range\'s six rooms, three rooms either side ' +
        'of the gate. The left range is the stables (mangers in the gallery, no room doors); the court, the galleries, the gate tower (solid) ' +
        'and the corner towers (no door) are not planned. Yuni\'s own tag is nomad; furnished as yuni-common' },

    /* ---------- Middle-class houses: in sets/yuni.js (the detailed set, as Locus and Mungo build them) */

    /* ---------- Poor (57-poor.js) */
    { key: 'poor_mud_house', name: 'Flat-roofed mud house', culture: 'yuni-poor', wealth: 0.22, types: ['single-family dwelling'], lot: [11, 9],
      bodies: [{ id: 'house', poly: rect(7.2, 5.0, 0, -0.6), y: 0, levels: [{ h: 2.4 }], wall: 0.45, roof: 'flat', doors: [{ at: [-1.2, 1.9], w: 0.95 }], program: ['cottage'] }],
      note: 'variant 0: one banco room 7.2 x 5.0 (the door at x -1.2); the roof terrace up the ladder is open' },
    { key: 'poor_mud_house#1', name: 'Flat-roofed mud house (variant 2)', culture: 'yuni-poor', wealth: 0.22, types: ['single-family dwelling'], lot: [11, 9],
      bodies: [{ id: 'house', poly: rect(8.8, 5.6, 0, -0.8), y: 0, levels: [{ h: 2.6 }], wall: 0.45, roof: 'flat', doors: [{ at: [0.8, 2.0], w: 0.95 }], program: ['cottage'] }],
      note: 'variant 1: one room 8.8 x 5.6 (the door at x 0.8); the shelter on the roof is open' },
    { key: 'poor_mud_house#2', name: 'Flat-roofed mud house (variant 3: L-shape)', culture: 'yuni-poor', wealth: 0.22, types: ['single-family dwelling'], lot: [11, 9],
      bodies: [{ id: 'house', poly: mudL, y: 0, levels: [{ h: 2.2 }], wall: 0.45, roof: 'flat', doors: [{ at: [1.9, 0.5], w: 0.95 }], program: ['living', 'bedroom'] }],
      note: 'variant 2: the main range (8.6 x 4.6) and the lower wing coming forward on the left (4 x 4, no door of its own) as one L' },
    { key: 'poor_mud_house#3', name: 'Flat-roofed mud house (variant 4: two rooms and a yard)', culture: 'yuni-poor', wealth: 0.22, types: ['single-family dwelling'], lot: [11, 9],
      bodies: [
        { id: 'room', poly: rect(4.9, 4.0, -2.5, -2.1), y: 0, levels: [{ h: 2.4 }], wall: 0.45, roof: 'flat', doors: [{ at: [-2.2, -0.1], w: 0.95 }], program: ['bedroom'] },
        { id: 'kitchen', poly: rect(4.6, 3.7, 2.2, -2.4), y: 0, levels: [{ h: 2.2 }], wall: 0.45, roof: 'flat', doors: [{ at: [2.0, -0.55], w: 0.95 }], program: ['kitchen'] }],
      note: 'variant 3: two banco rooms side by side, each with its own door onto the walled yard (fire and pots in the yard)' },

    /* ---------- Rich (58-rich.js) */
    { key: 'rich_merchant_palace', name: 'Merchant prince\'s town palace', culture: 'yuni-court', wealth: 0.85, types: ['single-family dwelling', 'market/shop'], lot: [20, 16],
      bodies: merchantPalace(0),
      note: 'variant 0: the ground rear block (17.6 x 9.5, 5 m) behind the giant arcade: the merchant\'s hall, store and kitchen; the upper ' +
        'block (18 x 14.3) over it: the piano nobile and the attic. The loggia, the roof terrace and its pavilion are open' },
    { key: 'rich_merchant_palace#1', name: 'Merchant prince\'s town palace (variant 2)', culture: 'yuni-court', wealth: 0.85, types: ['single-family dwelling', 'market/shop'], lot: [20, 16],
      bodies: merchantPalace(-2.2), note: 'variant 1: four arcade bays, the door at x -2.2' },
    { key: 'rich_merchant_palace#2', name: 'Merchant prince\'s town palace (variant 3)', culture: 'yuni-court', wealth: 0.85, types: ['single-family dwelling', 'market/shop'], lot: [20, 16],
      bodies: merchantPalace(-0.75), note: 'variant 2: two arcade bays, the door at x -0.75; the tower on the roof is not planned' }
  ] });
})(KratorInteriors);
