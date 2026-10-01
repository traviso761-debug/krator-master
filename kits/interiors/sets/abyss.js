/* ======================== Interior set: Eastern Abyssal (settlements/locus, kit `abyss`) ========================
   The interiors of the Eastern Abyssal building kit (ABYSS-KIT-NOTES.md): one item per the 31 NEW ASSET keys
   on the abyss sheet (65-abyss-30..90-*.js; the two tag demos abyss_helpers_demo and abyss_wall_run are
   skipped as demos), plus `<key>#n` items where a variant's rooms differ a lot from variant 0. The ten keys
   the abyss sheet shares with the Locus sheet (stilt_poor, stilt_mid, tent_pavilion, sunshade_poles,
   farm_saltrice, infra_fishing_dock, ind_pumpjack, ind_oil_tank, prop_pipe_rack, prop_drum_stack) are in
   sets/locus.js ONLY, not repeated here.
   Local frame = the builder's F: origin at the footprint centre on the ground, +z the front, metres.
   Every asset is culture abyssal-desert -> furniture culture eastabyss. Wealth = the middle of the ASSET's band.
   Vessel rooms read ABYSS.vessel (65-abyss-00-core.js): a container is 6.1 / 12.2 x 2.44 x 2.6 (inner
   5.9 / 12.03 x 2.28, clear 2.4, its floor 0.1 above the vessel's base), its side door at `doorAt` along the
   long axis on the +v side, its cargo doors (lock bars) on the `doorEnd` end; a tank/silo door at angle a is
   at (x + cos a * R, z + sin a * R). A drum or tank lying down has no floor unless the builder decks it.
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const R3 = function (v) { return Math.round(v * 1000) / 1000; };
  const PI = Math.PI, TAU = PI * 2;

  /* a 12.2 m container's room (inner 12.03 x 2.28) lying along x (yaw 0) or along z (yaw +-PI/2) */
  const C12 = 12.03, C6 = 5.9, CW = 2.28;

  /* ---- the inn, variant 0: three wings of three containers round the court (65-abyss-50-civic.js) */
  const innRooms = (function () {
    const out = [], H = 1.0, L = 2.7;
    const kinds = [['kitchen', 'store', 'cottage'], ['cottage', 'cottage', 'cottage'], ['cottage', 'cottage', 'cottage']];
    for (let l = 0; l < 3; l++) {
      const y = R3(H + l * L + 0.1), sh = l === 2 ? 1.4 : 0, zl = R3(-1.2 + sh), zr = R3(-1.2 - sh);
      out.push({ id: 'west-' + l, kind: kinds[l][0], level: l, poly: rect(CW, C12, -8.6, zl), y: y, h: 2.4, doors: [{ at: [-7.46, zl], w: 0.9 }] });
      out.push({ id: 'east-' + l, kind: kinds[l][1], level: l, poly: rect(CW, C12, 8.6, zr), y: y, h: 2.4, doors: [{ at: [7.46, zr], w: 0.9 }] });
      out.push({ id: 'back-' + l, kind: kinds[l][2], level: l, poly: rect(C12, CW, 0, -8.6), y: y, h: 2.4, doors: [{ at: [0, -7.46], w: 0.9 }] });
    }
    out.push({ id: 'court', kind: 'tavern', poly: rect(10, 10, 0.6, -1.5), y: 1.0, h: 2.6,
      doors: [{ at: [0.6, 3.5], w: 6, swing: 'none' }, { at: [5.6, -1.5], w: 4, swing: 'none' }, { at: [-4.4, -3.5], w: 4, swing: 'none' }] });
    return out;
  })();

  /* ---- the inn, variant 1: three pastel wings (4.2 deep, three storeys of 2.7 on the 1.0 deck), three doors per wing per
     storey (65-abyss-50-civic.js): one room behind each door, inside 0.25 walls and 0.15 partitions. West wing x -11.3..-7.1
     and east wing x 7.1..11.3 (z -8..6), back wing z -10.4..-6.2 (x -7.1..7.1); doors on the court faces */
  const inn1Rooms = (function () {
    const out = [], H = 1.0, L = 2.7;
    const zs = [[-7.75, -3.408], [-3.258, 1.258], [1.408, 5.75]], xs = [[-6.85, -2.442], [-2.292, 2.292], [2.442, 6.85]];
    const doorW = [-5.8, -1.8, 2.2], doorE = [-4.2, -0.2, 3.8], doorB = [-3.2, 0.8, 4.8];
    const ground = { west: ['store', 'kitchen', 'store'], back: ['cottage', 'store', 'cottage'], east: ['store', 'cottage', 'store'] };
    for (let l = 0; l < 3; l++) {
      const y = R3(H + l * L), k = function (w, i) { return l ? 'cottage' : ground[w][i]; };
      for (let i = 0; i < 3; i++) {
        const z0 = zs[i][0], z1 = zs[i][1], zc = R3((z0 + z1) / 2), zl = R3(z1 - z0), x0 = xs[i][0], x1 = xs[i][1], xc = R3((x0 + x1) / 2), xl = R3(x1 - x0);
        out.push({ id: 'west-' + l + '-' + i, kind: k('west', i), level: l, poly: rect(3.7, zl, -9.2, zc), y: y, h: 2.5, doors: [{ at: [-7.35, doorW[i]], w: 0.9 }] });
        out.push({ id: 'east-' + l + '-' + i, kind: k('east', i), level: l, poly: rect(3.7, zl, 9.2, zc), y: y, h: 2.5, doors: [{ at: [7.35, doorE[i]], w: 0.9 }] });
        out.push({ id: 'back-' + l + '-' + i, kind: k('back', i), level: l, poly: rect(xl, 3.7, xc, -8.3), y: y, h: 2.5, doors: [{ at: [doorB[i], -6.45], w: 0.9 }] });
      }
    }
    out.push({ id: 'court', kind: 'tavern', poly: rect(9.5, 7.6, 0.55, -2.2), y: 1.0, h: 2.6,
      doors: [{ at: [0.55, 1.6], w: 6, swing: 'none' }, { at: [5.3, -2.2], w: 4, swing: 'none' }, { at: [-4.2, -2.2], w: 4, swing: 'none' }] });
    return out;
  })();

  /* ---- the caravanserai: the gate range (front, yaw PI) and the back cell range (yaw 0); S = 25, cells at 25 - 1.9 */
  const caravanRooms = (function () {
    const out = [], S = 25, zb = -S + 1.9, zf = S - 1.9;
    for (let i = 0; i < 6; i++) {                                     /* the back range: x -20..20, cabins at i = 1, 4 */
      const x = R3(-S + 5 + (2 * S - 10) * (i + 0.5) / 6);
      if (i % 3 === 1) out.push({ id: 'cell-' + i, kind: 'dormitory', poly: rect(5.8, 2.4, x, zb), y: 0.1, h: 2.6, doors: [{ at: [x, R3(zb + 1.2)], w: 1.0 }] });
      else out.push({ id: 'cell-' + i, kind: 'dormitory', poly: rect(C6, CW, x, zb), y: 0.2, h: 2.4, doors: [{ at: [R3(x - 1.2), R3(zb + 1.14)], w: 0.9 }] });
    }
    [[-S + 5, -7], [7, S - 5]].forEach(function (span, si) {        /* the gate range: two units either side of the gate */
      for (let i = 0; i < 2; i++) {
        const x = R3(span[0] + (span[1] - span[0]) * (i + 0.5) / 2), id = 'gate-' + si + '-' + i;
        if (i === 1) out.push({ id: id, kind: 'dormitory', poly: rect(5.8, 2.4, x, zf), y: 0.1, h: 2.6, doors: [{ at: [x, R3(zf - 1.2)], w: 1.0 }] });
        else out.push({ id: id, kind: 'store', poly: rect(C6, CW, x, zf), y: 0.2, h: 2.4, doors: [{ at: [R3(x + 1.2), R3(zf - 1.14)], w: 0.9 }] });
      }
    });
    return out;
  })();

  /* ---- the library: the open floor in front of the terraced crescents (the crescents fill angles PI*1.08..1.92 at r > 4.5) */
  const libC = [0, -4], libRo = 10.5, libRi = 4.4;
  const libPoly = (function () {
    const out = [], a0 = -0.08 * PI, a1 = 1.08 * PI, n = 24, m = 10;
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([R3(libC[0] + libRo * Math.cos(a)), R3(libC[1] + libRo * Math.sin(a))]); }
    for (let j = 0; j <= m; j++) { const a = a1 + (a0 + TAU - a1) * j / m; out.push([R3(libC[0] + libRi * Math.cos(a)), R3(libC[1] + libRi * Math.sin(a))]); }
    return out;
  })();

  /* ---- the school: six round classrooms (rc 3.3, wall top 3.2 on a 0.7 m rubble ring) on R 12.5, doors facing the court */
  const schoolRooms = (function () {
    const out = [], n = 6, RR = 12.5, ri = 3.15;
    for (let i = 0; i < n; i++) {
      const a = PI / 2 + PI / n + i * TAU / n, x = Math.cos(a) * RR, z = Math.sin(a) * RR;
      out.push({ id: 'class-' + i, kind: 'school', poly: SH.circle(ri, 8, R3(x), R3(z)), y: 0.7, h: 2.5,
        doors: [{ at: [R3(x - Math.cos(a) * ri), R3(z - Math.sin(a) * ri)], w: 1.1 }] });
    }
    return out;
  })();

  /* ---- the barracks: two long halls (8 x 30 on a 1.2 m plinth, centres x +-19), seven bays of 4 m with a door each onto the yard */
  const barracksRooms = (function () {
    const out = [];
    [-1, 1].forEach(function (s) {
      const cx = s * 19, xi = s * 15.3;
      for (let k = -3; k <= 3; k++) {
        const z = -2 + k * 4;
        out.push({ id: (s < 0 ? 'west-' : 'east-') + (k + 3), kind: k === 0 ? 'kitchen' : 'dormitory', poly: rect(7.4, 3.8, cx, z), y: 1.2, h: 2.4,
          doors: [{ at: [xi, z - 1.0], w: 1.0 }] });
      }
    });
    return out;
  })();

  /* ---- the granary: the three silos with doors (r 3.2, 3.6, 3.0; door at PI/2 = +z) on the deck at H 1.6 */
  const granaryRooms = [[-8, -4.5, 3.2], [-1, -5, 3.6], [6.6, -4.5, 3.0]].map(function (s, i) {
    const r = s[2] - 0.1;
    return { id: 'silo-' + i, kind: 'store', poly: SH.circle(r, 18, s[0], s[1]), y: 1.75, h: 3.0, doors: [{ at: [s[0], R3(s[1] + r)], w: 0.95 }] };
  });

  IX.sets.add({ set: 'abyss', title: 'Eastern Abyssal', culture: 'eastabyss', items: [
    /* ---------- Housing (65-abyss-30-housing.js) */
    { key: 'abyss_house_poor', name: 'Salvage shack', culture: 'eastabyss', wealth: 0.15, types: ['single-family dwelling'], lot: [10, 10],
      skip: 'variant 0 (drum house): the home is a horizontal salvaged drum (r 1.35, 5.4 long) on the pile deck, entered at its end; ' +
        'nothing decks its inside, so it has no flat floor (a 1.8 m chord at the door sill). The container shack and the lean-to are ' +
        'abyss_house_poor#1 and #2' },
    { key: 'abyss_house_poor#1', name: 'Salvage shack (variant 1: container shack)', culture: 'eastabyss', wealth: 0.15, types: ['single-family dwelling'], lot: [10, 10],
      rooms: [{ id: 'container', kind: 'cottage', poly: rect(C6, CW, 0, -1.9), y: 1.3, h: 2.4, doors: [{ at: [-1.2, -0.76], w: 0.9 }] }],
      note: 'one 6.1 m container on the pile deck at H 1.2, its side door at x -1.2 onto the porch under the corrugated roof' },
    { key: 'abyss_house_poor#2', name: 'Salvage shack (variant 2: reed-and-sheet lean-to)', culture: 'eastabyss', wealth: 0.15, types: ['single-family dwelling'], lot: [10, 10],
      bodies: [{ id: 'lean-to', poly: rect(6.8, 3.9, 0, -1.55), y: 0.9, levels: [{ h: 2.3 }], wall: 0.12, roof: 'flat',
        doors: [{ at: [-0.1, 0.4], w: 0.9 }], program: ['cottage'] }],
      note: 'reed-mat walls 6.8 x 3.9 under corrugated sheets on the deck at H 0.9; the porch canopy in front is open' },
    { key: 'abyss_house_mid', name: 'Abyssal family house', culture: 'eastabyss', wealth: 0.5, types: ['single-family dwelling'], lot: [14, 14],
      rooms: [
        { id: 'ground', kind: 'living', poly: rect(C12, CW, -0.4, -3.4), y: 0.9, h: 2.4, doors: [{ at: [-0.4, -2.26], w: 0.9 }] },
        { id: 'upper', kind: 'bedroom', level: 1, poly: rect(C6, CW, 2.3, -3.2), y: 3.6, h: 2.4, doors: [{ at: [0.5, -2.06], w: 0.9 }] }],
      note: 'variant 0 (stacked containers): the 12.2 m box on the deck (H 0.8) and the 6.1 m box above it (door onto the balcony ' +
        'deck the outside flight climbs to). The second upper box (turned 0.08) and the top box across them have no door the builder ' +
        'cuts: not planned. Variant 1 (silo house) is #1, variant 2 (painted townhouse) #2' },
    { key: 'abyss_house_mid#1', name: 'Abyssal family house (variant 1: silo house)', culture: 'eastabyss', wealth: 0.5, types: ['single-family dwelling'], lot: [14, 14],
      rooms: [{ id: 'silo', kind: 'bedroom', poly: SH.circle(2.6, 8, -3.2, -2.2), y: 1.15, h: 3.0, doors: [{ at: [-2.02, 0.117], w: 0.95 }] }],
      bodies: [{ id: 'cabin', poly: rect(5.4, 4.6, 3.4, -2.6), y: 1.0, levels: [{ h: 2.7 }], wall: 0.1, roof: 'flat',
        doors: [{ at: [2.2, -0.3], w: 1.0 }], program: ['living'] }],
      note: 'the domed silo (r 2.7, door at angle 0.35 PI) and the plank cabin (5.4 x 4.6) on the deck at H 1.0, the tarp porch ' +
        'between them open. The silo\'s upper portholes (4.4 m) suggest a loft: no floor or stair is drawn, so one storey is planned' },
    { key: 'abyss_house_mid#2', name: 'Abyssal family house (variant 2: painted townhouse)', culture: 'eastabyss', wealth: 0.5, types: ['single-family dwelling'], lot: [14, 14],
      bodies: [{ id: 'townhouse', poly: rect(9, 8, 0, -1), y: 0.9, levels: [{ h: 2.8 }, { h: 2.8 }, { h: 2.8 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [0, 3], w: 1.2 }], program: [['living', 'kitchen'], ['bedroom', 'bedroom'], ['bedroom', 'study']] }],
      note: 'three storeys of 3.1 m on the 0.9 m rubble plinth, the door mid-front; the iron balconies and the roof terrace under the ' +
        'sail are open' },
    { key: 'abyss_house_rich', name: 'Abyssal great house', culture: 'eastabyss', wealth: 0.85, types: ['single-family dwelling'], lot: [24, 24],
      skip: 'variant 0 (cone shell over terraces): the house is three stepped plank discs (r 6.8, 4.8, 2.9; 0.9 m risers, 1.7 m ' +
        'under each lip) inside a cone shell open in a 7.5 m arch: open terraces, no enclosed floor wider than a 2 m ring; the two ' +
        'tin-mirror side cones have no door. The sail compound and the tower house are abyss_house_rich#1 and #2' },
    { key: 'abyss_house_rich#1', name: 'Abyssal great house (variant 1: sail-roofed compound)', culture: 'eastabyss', wealth: 0.85,
      types: ['single-family dwelling'], lot: [24, 24],
      bodies: [
        { id: 'west-pavilion', poly: rect(5.3, 3.9, -6, -3), y: 1.8, levels: [{ h: 2.8 }], wall: 0.25, roof: 'flat',
          doors: [{ at: [-6, -1.05], w: 1.2 }], program: ['living'] },
        { id: 'east-pavilion', poly: rect(5.8, 4.4, 5.5, -3.5), y: 1.8, levels: [{ h: 2.8 }], wall: 0.25, roof: 'flat',
          doors: [{ at: [5.5, -1.3], w: 1.2 }], program: ['bedroom'] }],
      note: 'the two walled pavilions under their sails on the compound deck (H 1.8), one room each (5.3 x 3.9 and 5.8 x 4.4: too small to cut in two); the third sail shades the open court, the ' +
        'compound wall and the private dock are open' },
    { key: 'abyss_house_rich#2', name: 'Abyssal great house (variant 2: tin-mirror tower house)', culture: 'eastabyss', wealth: 0.85,
      types: ['single-family dwelling'], lot: [24, 24],
      rooms: [{ id: 'tower', kind: 'hall', poly: SH.circle(4.2, 20, -3, -4), y: 3.7, h: 3.0, doors: [{ at: [-3, 0.2], w: 1.3 }] }],
      bodies: [{ id: 'annex', poly: rect(8, 10, 6.5, -3), y: 0, levels: [{ h: 3.6 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [6.5, 2], w: 1.2 }], program: ['living', 'kitchen', 'bedroom'] }],
      note: 'the tower\'s ground storey on its 3.4 m rubble base (r 4.6 at the door, the front stair up to it) and the pastel annex ' +
        '(8 x 10). The tower\'s windows rise to 14 m but no floor or stair is drawn inside it: its upper storeys are not planned' },

    /* ---------- Shops (65-abyss-40-shops.js) */
    { key: 'abyss_shop_weapons', name: 'Weaponsmith', culture: 'eastabyss', wealth: 0.45, types: ['market/shop', 'industry'], lot: [13, 12],
      rooms: [
        { id: 'shop', kind: 'shop', poly: rect(7.7, 5.45, -1.2, -2.125), y: 0.9, h: 2.9, doors: [{ at: [-1.2, 0.6], w: 6.0, swing: 'none' }] },
        { id: 'forge', kind: 'smithy', poly: rect(3.2, 3.6, 4.7, 3.4), y: 0, h: 2.6,
          doors: [{ at: [4.7, 5.2], w: 1.8, swing: 'none' }] }],
      note: 'variant 0: the plank forge-shop, three walls open to the front on the deck (H 0.9), and the forge on the ground under its ' +
        'own corrugated lean-to (open on all sides). Variant 1 (container smithy) is abyss_shop_weapons#1' },
    { key: 'abyss_shop_weapons#1', name: 'Weaponsmith (variant 2: container smithy under a sail)', culture: 'eastabyss', wealth: 0.45, types: ['market/shop', 'industry'], lot: [13, 12],
      rooms: [{ id: 'forge', kind: 'smithy', poly: rect(3.6, 3.0, 3.7, 2.6), y: 0.15, h: 3.0,
        doors: [{ at: [3.7, 4.1], w: 3.0, swing: 'none' }, { at: [1.9, 2.6], w: 2.4, swing: 'none' }] }],
      note: 'the forge under the orange sail on four poles (x 1.8..5.6, z 1.0..4.2) on the salt floor (0.15): an open smithy. The ' +
        '6.1 m container behind (x -4.55..1.55, z -4.82..-2.38) is drawn CLOSED: its side is "hinged up as an awning" but the box ' +
        'under the awning is solid and no door is cut, so it is not planned (GEOMETRY.md); its counter and spear rack stand in front ' +
        'of it as street furniture' },
    { key: 'abyss_shop_armor', name: 'Armourer', culture: 'eastabyss', wealth: 0.55, types: ['market/shop', 'industry'], lot: [12, 12],
      rooms: [{ id: 'shop', kind: 'shop', poly: rect(8.7, 5.25, 0, -2.525), y: 0.8, h: 3.3, doors: [{ at: [0, 0.1], w: 6.0, swing: 'none' }] }],
      note: 'variant 0: the pastel stall (9 x 5.4, three walls, open front) on the rubble plinth, the shield wall at its back; one ' +
        'room, no store behind. Variant 1 (a closed tin-clad shed on a deck) is abyss_shop_armor#1' },
    { key: 'abyss_shop_armor#1', name: 'Armourer (variant 2: tin-clad shed)', culture: 'eastabyss', wealth: 0.55, types: ['market/shop', 'industry'], lot: [12, 12],
      rooms: [{ id: 'shed', kind: 'shop', poly: rect(7.8, 4.8, 0, -2.4), y: 1.0, h: 2.9, doors: [{ at: [0, 0.0], w: 3.4, swing: 'none' }] }],
      note: 'the corrugated shed 8 x 5 x 3.0 (x -4..4, z -4.9..0.1) on the deck at H 1.0, entered through the 3.4 m opening in its ' +
        'front; the armour stands and the shield wall stand outside it on the deck' },
    { key: 'abyss_shop_general', name: 'General goods', culture: 'eastabyss', wealth: 0.4, types: ['market/shop'], lot: [13, 12],
      rooms: [
        { id: 'shop', kind: 'shop', poly: rect(8.615, CW, -1.7075, -3.8), y: 0.8, h: 2.4, doors: [{ at: [1.8, -2.66], w: 0.9 }],
          windows: [{ at: [-1.0, -2.66], w: 3.0, sill: 0.9, h: 1.2 }] },
        { id: 'store', kind: 'store', poly: rect(3.415, CW, 4.3075, -3.8), y: 0.8, h: 2.4, doors: [{ at: [6.015, -3.8], w: 2.0 }] }],
      note: 'variant 0: the 12.2 m container on the deck (H 0.7): the shop behind the side door and the serving hatch, the store at ' +
        'the cargo-door end. Variant 1 (a two-storey cabin) is abyss_shop_general#1' },
    { key: 'abyss_shop_general#1', name: 'General goods (variant 2: two-storey cabin under umbrellas)', culture: 'eastabyss', wealth: 0.4, types: ['market/shop'], lot: [13, 12],
      bodies: [{ id: 'cabin', poly: rect(8, 6, -1, -3), y: 0, levels: [{ h: 3.0 }, { h: 3.0 }], wall: 0.25, roof: 'flat',
        doors: [{ at: [-1, 0], w: 5.2, swing: 'none' }], program: [['shop'], ['store']] }],
      note: 'the pastel cabin 8 x 6 (x -5..3, z -6..0), two storeys of 3.0 on the ground, its 5.2 m shop front open in the middle of ' +
        'the front; the shop below and a store above (the upper windows and the balcony; no stair is drawn: the planner fits one). ' +
        'The counter and the umbrella stand in front of the shop front' },
    { key: 'abyss_shop_food', name: 'Cookshop and fish stall', culture: 'eastabyss', wealth: 0.4, types: ['market/shop', 'tavern/inn'], lot: [13, 12],
      rooms: [
        { id: 'kitchen', kind: 'kitchen', poly: rect(10.6, 3.8, 0, -2.8), y: 0.12, h: 3.0,
          doors: [{ at: [0, -4.7], w: 6, swing: 'none' }, { at: [-5.3, -2.8], w: 3, swing: 'none' }] },
        { id: 'stall', kind: 'shop', poly: rect(10.6, 4.6, 0, 1.4), y: 0.12, h: 3.0,
          doors: [{ at: [0, 3.7], w: 6, swing: 'none' }, { at: [5.3, 1.4], w: 3, swing: 'none' }] }],
      note: 'variant 0 is open: a salt floor under a swooping sail on four poles; read as two open rooms, the oven and smoking rack ' +
        'at the back (kitchen) and the counter in front. Variant 1 (drum kitchen) is abyss_shop_food#1 (skipped)' },
    { key: 'abyss_shop_food#1', name: 'Cookshop and fish stall (variant 2: drum kitchen with tables)', types: ['market/shop', 'tavern/inn'], lot: [13, 12],
      skip: 'the kitchen is a horizontal drum (r 1.5, 6 long) on the deck with nothing decking its inside and no door: no flat ' +
        'floor; the dining deck in front of it is open air (no roof), seated with the builder\'s own tables, counter and smoking rack' },
    { key: 'abyss_shop_alchemy', name: 'Alchemist', culture: 'eastabyss', wealth: 0.6, types: ['market/shop'], lot: [12, 12],
      rooms: [{ id: 'tank', kind: 'shop', poly: SH.circle(2.9, 8, -1, -1.8), y: 1.05, h: 3.0, doors: [{ at: [-1, 0.88], w: 0.95 }] }],
      note: 'the upright tank house (r 3.0, 5 m) on the deck at H 0.9, door on the front; one room (its ring balcony is outside). ' +
        'Variant 1 (a second tank on a gantry) is abyss_shop_alchemy#1' },
    { key: 'abyss_shop_alchemy#1', name: 'Alchemist (variant 2: twin tanks on a gantry)', like: 'abyss_shop_alchemy',
      note: 'the same tank house as variant 0 (r 3.0 on the deck at H 0.9, door on the front, no balcony or ladder); the second, ' +
        'narrow tank (r 1.6) on the gantry has no door: not planned' },
    { key: 'abyss_shop_salvage', name: 'Salvage dealer and tinker', culture: 'eastabyss', wealth: 0.4, types: ['market/shop', 'industry'], lot: [16, 14],
      rooms: [
        { id: 'office', kind: 'shop', poly: rect(CW, C6, 3.4, -0.2), y: 0.2, h: 2.4, doors: [{ at: [4.54, 1.2], w: 0.9 }] }],
      note: 'variant 0: the 6.1 m container office turned along z in the scrap yard, one shop room behind the side door (the cargo doors ' +
        'kept shut: the 2.28 m box fits its counter only with the end wall free; split in two, neither half fits its counter or bench); the tinker works in the open fenced yard, not planned. Variant 1 (an upright tank office) is abyss_shop_salvage#1' },
    { key: 'abyss_shop_salvage#1', name: 'Salvage dealer and tinker (variant 2: tank office and a hoist derrick)', culture: 'eastabyss', wealth: 0.4,
      types: ['market/shop', 'industry'], lot: [16, 14],
      rooms: [{ id: 'tank', kind: 'store', poly: SH.circle(2.2, 12, 4.0, -1.0), y: 0.23, h: 3.0, doors: [{ at: [4.0, 1.125], w: 0.95 }] }],
      note: 'the upright tank (r 2.3, 3.6 high, x 4.0 z -1.0) on the yard, its door on the front: the dealer\'s store (a counter ' +
        'does not fit inside r 2.2 with the door\'s path; the builder\'s counter stands outside in front of it). The derrick and ' +
        'the yard are open' },
    { key: 'abyss_shop_salt', name: 'Salt and fish merchant', culture: 'eastabyss', wealth: 0.4, types: ['market/shop'], lot: [14, 12],
      rooms: [{ id: 'stall', kind: 'shop', poly: rect(11.6, 9.0, 0, -0.3), y: 0.1, h: 3.0,
        doors: [{ at: [0, 4.2], w: 6, swing: 'none' }, { at: [-5.8, -0.3], w: 4, swing: 'none' }, { at: [5.8, -0.3], w: 4, swing: 'none' }] }],
      note: 'variant 0 is open: salt cones on a salt floor under a five-pole sail, read as one open shop. Variant 1 (a reed salt-shed on a deck) is ' +
        'abyss_shop_salt#1' },
    { key: 'abyss_shop_salt#1', name: 'Salt and fish merchant (variant 2: reed salt-shed on a deck)', culture: 'eastabyss', wealth: 0.4, types: ['market/shop'], lot: [14, 12],
      rooms: [{ id: 'shed', kind: 'shop', poly: rect(9.7, 4.6, 0, -2.6), y: 1.1, h: 2.9, doors: [{ at: [0, -0.3], w: 8, swing: 'none' }] }],
      note: 'the reed-mat shed (back wall at z -5.0, side walls at x +-5.0 to z -0.2) under its thatch pyramid at 3.0, on the deck ' +
        'at H 1.1, open along its whole front; the counter, the baskets and the smoking racks stand on the deck in front' },
    { key: 'abyss_shop_sailmaker', name: 'Sail, canvas and rope maker', culture: 'eastabyss', wealth: 0.5, types: ['market/shop', 'industry'], lot: [16, 12],
      rooms: [
        { id: 'loft', kind: 'workshop', poly: rect(13.6, 4.3, 0, -2.45), y: 0.1, h: 3.5,
          doors: [{ at: [-6.8, -2.45], w: 3, swing: 'none' }, { at: [6.8, -2.45], w: 3, swing: 'none' }] },
        { id: 'counter', kind: 'shop', poly: rect(13.6, 4.1, 0, 2.35), y: 0.1, h: 3.5,
          doors: [{ at: [0, 4.4], w: 6, swing: 'none' }, { at: [-6.8, 2.35], w: 3, swing: 'none' }] }],
      note: 'variant 0 is open: a salt floor under a swooping sail on four corner poles and a centre mast (at the origin, between ' +
        'the two rooms); the stitching frame stands at the back. Variant 1 (a plank loft on a deck) is abyss_shop_sailmaker#1' },
    { key: 'abyss_shop_sailmaker#1', name: 'Sail, canvas and rope maker (variant 2: canvas loft with drying lines)', culture: 'eastabyss', wealth: 0.5,
      types: ['market/shop', 'industry'], lot: [16, 12],
      bodies: [{ id: 'loft', poly: rect(8, 4.4, -2.5, -3.2), y: 0.8, levels: [{ h: 2.9 }, { h: 2.9 }], wall: 0.12, roof: 'flat',
        doors: [{ at: [-2.5, -1.0], w: 3.6, swing: 'none' }], program: [['shop'], ['workshop']] }],
      note: 'the plank loft 8 x 4.4 x 5.8 (x -6.5..1.5, z -5.4..-1.0) on the deck at H 0.8: the shop behind the 3.6 m front, the ' +
        'canvas loft above (its front door is a hoist door: the planner fits an inside stair). The drying lines and the bolts on ' +
        'the deck are outside' },

    /* ---------- Hospitality and civic (65-abyss-50-civic.js) */
    { key: 'abyss_inn', name: 'Courtyard inn', culture: 'eastabyss', wealth: 0.5, types: ['tavern/inn', 'multi-family dwelling'], lot: [24, 23],
      units: 7, rooms: innRooms,
      note: 'variant 0: nine 12.2 m containers in three wings (three storeys of 2.7 m, the top side boxes shifted 1.4 m), each door ' +
        'onto the court or a gallery. Ground: the kitchen (west), the store (east) and the innkeeper\'s room (back); the six upper ' +
        'boxes are lodging rooms, each a one-room cottage (bed, brazier, provisions, chest) so the lodgers count as units: 7 units. ' +
        'The court under the sail is the open tavern. Variant 1 (galleried pastel wings) is abyss_inn#1' },
    { key: 'abyss_inn#1', name: 'Courtyard inn (variant 2: galleried pastel wings)', culture: 'eastabyss', wealth: 0.5, types: ['tavern/inn', 'multi-family dwelling'],
      lot: [24, 23], units: 21, rooms: inn1Rooms,
      note: 'three plastered wings 4.2 deep (west and east 14 long, back 14.2), three storeys of 2.7 on the 1.0 deck, three doors per ' +
        'wing per storey (onto the court, then the galleries): one room behind each door. Ground: the kitchen and two stores (west), ' +
        'two stores and the innkeeper\'s and the staff\'s cottages; the eighteen upper rooms are lodging rooms, each a one-room ' +
        'cottage like variant 0\'s: 21 units. The court under the sail (its well kept clear) is the open tavern' },
    { key: 'abyss_tavern', name: 'Sail-platform tavern', culture: 'eastabyss', wealth: 0.5, types: ['tavern/inn'], lot: [22, 20],
      rooms: [{ id: 'deck', kind: 'tavern', poly: rect(18.8, 13.8, 0, -1.0), y: 2.0, h: 3.0, doors: [{ at: [0, 5.9], w: 4.6, swing: 'none' }] }],
      note: 'variant 0: one open deck (H 2.0) under twin sails, railed except the front stair gap; the kitchen is a horizontal drum ' +
        '(no floor) and is not planned. Variant 1 (a raised back deck) is abyss_tavern#1' },
    { key: 'abyss_tavern#1', name: 'Sail-platform tavern (variant 2: two decks under a great peaked sail)', culture: 'eastabyss', wealth: 0.5, types: ['tavern/inn'], lot: [22, 20],
      rooms: [
        { id: 'deck', kind: 'tavern', poly: rect(18.8, 9.4, 0, 1.2), y: 2.0, h: 3.0, doors: [{ at: [0, 5.9], w: 4.6, swing: 'none' }],
          fixtures: [{ id: 'mast', kind: 'post', x: 0, z: -1.0, ry: 0, w: 0.5, d: 0.5, h: 3.0, reach: false },
            { id: 'flight', kind: 'stair', x: 6.4, z: -1.67, ry: 0, w: 1.4, d: 2.6, h: 2.2, clearance: { front: 1.0 } }] },
        { id: 'upper', kind: 'tavern', poly: rect(19.2, 4.6, 0, -6.0), y: 4.2, h: 2.8, doors: [{ at: [6.4, -3.7], w: 1.4, swing: 'none' }],
          fixtures: [{ id: 'kitchen-drum', kind: 'machine', x: 5.5, z: -6.6, ry: 0, w: 4.2, d: 2.2, h: 0.3, reach: false }] }],
      note: 'the main deck (H 2.0) in front of the raised back deck, and the raised deck (H 4.2, x -10..10, z -8.5..-3.5) under the ' +
        'great sail, reached by the flight at x 6.4; the central mast stands in the main deck. The space under the raised deck is ' +
        'about 1.9 m clear between its piles (2.7 m apart): not planned; the bar and the jar shelf stand there as the builder ' +
        'places them, and the kitchen drum (r 1.0) rises 0.15 m through the raised deck (a fixture there)' },
    { key: 'abyss_caravanserai', name: 'Caravanserai', culture: 'eastabyss', wealth: 0.6, types: ['tavern/inn', 'market/shop'], lot: [56, 58],
      rooms: caravanRooms,
      note: 'the gate range (two containers as stores, two plank cabins as dormitories, either side of the gate) and the back cell ' +
        'range (six cells: containers and cabins) as dormitories, doors onto the court. The side ranges repeat the back range; the ' +
        'gate towers are solid, the corner silos have no door' },
    { key: 'abyss_library', name: 'Library under the great cone', culture: 'eastabyss', wealth: 0.8, types: ['civic'], lot: [42, 40],
      rooms: [
        { id: 'hall', kind: 'library', poly: libPoly, y: 1.25, h: 3.0, doors: [{ at: [0, 6.5], w: 8, swing: 'none' }] },
        { id: 'scroll-store', kind: 'store', poly: SH.circle(2.2, 16, -16, -12), y: 0, h: 2.4, doors: [{ at: [-16, -9.8], w: 1.6, swing: 'none' }] },
        { id: 'reading-lantern', kind: 'study', poly: SH.circle(2.3, 16, 16, -12), y: 0, h: 2.4, doors: [{ at: [16, -9.7], w: 1.6, swing: 'none' }] }],
      note: 'the floor of the great cone in front of the four terraced reading crescents (they fill the back, r > 4.5), kept inside ' +
        'r 10.5 so 3 m of headroom clears the leaning shell; entered through the 11 m arch. The crescents themselves (1.4 m risers) ' +
        'are not planned. The two lesser cones (arches 2 m wide) are a scroll store and a study, each kept inside its shell to 2.4 m' },
    { key: 'abyss_school', name: 'School of the six cones', culture: 'eastabyss', wealth: 0.6, types: ['civic'], lot: [36, 36],
      rooms: schoolRooms,
      note: 'six round classrooms (r 3.3 walls to 3.2 m on a 0.7 m rubble ring, thatch cones above), doors facing the court; the court ' +
        'under the six-cornered sail is open' },
    { key: 'abyss_amphitheater', name: 'Amphitheatre', types: ['civic'], lot: [76, 76],
      skip: 'an open bowl: rubble tiers round an orchestra and a stage deck under a sail, nothing enclosed' },

    /* ---------- Temple (65-abyss-60-temple.js) */
    { key: 'abyss_temple', name: 'Temple of the Altar', types: ['religious', 'civic'], lot: [76, 78],
      skip: 'an open precinct round the altar: the ambulatory is an open colonnade under swoop roofs, the gate pylons are solid ' +
        'lacquered blocks, the corner towers are rubble drums under cones with no door' },

    /* ---------- Palace and plaza (65-abyss-70-palace.js) */
    { key: 'abyss_palace', name: 'The Headman\'s palace', culture: 'eastabyss', wealth: 0.95, types: ['civic', 'single-family dwelling'], lot: [92, 72],
      bodies: [
        { id: 'great-hall', poly: rect(40, 22, 0, -6), y: 3.8, levels: [{ h: 3.4 }, { h: 3.0 }], wall: 0.5, roof: 'gable', pitch: 0.9,
          doors: [{ at: [0, 5], w: 3.2 }], program: [['hall', 'living', 'kitchen'], ['bedroom', 'bedroom', 'study']] },
        { id: 'womens-court', poly: rect(14, 8, -26, -19), y: 2.4, levels: [{ h: 3.8 }], wall: 0.3, roof: 'flat',
          doors: [{ at: [-26, -15], w: 1.0 }], program: ['living', 'bedroom'] },
        { id: 'stores', poly: rect(14, 8, 26, -19), y: 2.4, levels: [{ h: 3.8 }], wall: 0.3, roof: 'flat',
          doors: [{ at: [26, -15], w: 1.0 }], program: ['store', 'kitchen'] }],
      note: 'the great hall (40 x 22, walls 7 m under the swoop-and-horn roof, on its 1.4 m lacquered plinth above the 2.4 m deck) ' +
        'planned as two storeys: the audience hall, living room and kitchen below, the Headman\'s rooms above. The two pastel ' +
        'pavilions behind it (women\'s court and stores) show only lattice screens on their fronts: a door is assumed at the middle ' +
        'screen. The corner towers (cones on 5.6 m rubble drums, the front pair arched 6 m up with no stair), the loggias under ' +
        'sails and the dock are not planned' },
    { key: 'abyss_palace_plaza', name: 'The Headman\'s plaza', types: ['civic', 'market/shop'], lot: [92, 62],
      skip: 'an open plaza: mosaic paving, lantern strings, umbrella bays and benches' },

    /* ---------- Military (65-abyss-80-military.js) */
    { key: 'abyss_fortress', name: 'Citadel on the rubble mound', culture: 'eastabyss', wealth: 0.8, types: ['military', 'civic'], lot: [72, 72],
      bodies: [{ id: 'keep', poly: rect(20, 11, 0, -8), y: 4.0, levels: [{ h: 5.2 }], wall: 0.4, roof: 'gable', pitch: 0.7,
        doors: [{ at: [0, -2.5], w: 2.2 }], program: ['hall', 'barracks', 'store'] }],
      note: 'the keep (20 x 11, 6 m walls under a swoop roof) on the 4 m rubble mound. The circuit is built from the wall pieces ' +
        '(their towers\' rooms are abyss_wall_tower / abyss_wall_corner); the two silo stores have no door, the signal mast is a lattice' },
    { key: 'abyss_barracks', name: 'Barracks', culture: 'eastabyss', wealth: 0.6, types: ['military', 'multi-family dwelling'], lot: [52, 46],
      units: 2, rooms: barracksRooms,
      note: 'the two long halls (8 x 30 on a 1.2 m plinth) read as seven 4 m bays each, one per yard door: six dormitories and a mess ' +
        'kitchen in the middle bay; units = 2 (each hall a garrison mess). The armoury containers and the watch silo are not planned' },
    { key: 'abyss_wall_seg', name: 'Wall segment (12 m)', types: ['military', 'infrastructure'], lot: [12, 6],
      skip: 'a solid rubble-and-plate wall with an open walkway on its inner side: nothing enclosed' },
    { key: 'abyss_wall_tower', name: 'Wall tower (on a joint)', culture: 'eastabyss', wealth: 0.7, types: ['military', 'infrastructure'], lot: [8, 8],
      rooms: [{ id: 'guard', kind: 'barracks', poly: SH.circle(3.25, 16), y: 6.4, h: 2.8, doors: [{ at: [3.25, 0], w: 1.0 }, { at: [-3.25, 0], w: 1.0 }] }],
      note: 'the guard room at walkway height (6.4 m) inside the silo shell (r 3.4), doors onto the walkway either side; the floor is ' +
        'not drawn. The slits at 9.8 m suggest a second storey: no stair, not planned' },
    { key: 'abyss_wall_gate', name: 'Wall gate (2 segments)', types: ['military', 'infrastructure'], lot: [24, 10],
      skip: 'a 6 m cart gate under a swoop roof between two solid pylons, the walkway carried over it: nothing enclosed' },
    { key: 'abyss_wall_corner', name: 'Wall corner tower', culture: 'eastabyss', wealth: 0.7, types: ['military', 'infrastructure'], lot: [10, 10],
      rooms: [{ id: 'guard', kind: 'barracks', poly: SH.circle(4.05, 20), y: 6.4, h: 2.8, doors: [{ at: [-4.05, 0], w: 1.0 }, { at: [0, -4.05], w: 1.0 }] }],
      note: 'the guard room at walkway height (6.4 m) inside the silo shell (r 4.2), doors on -x and -z onto the two runs; the floor ' +
        'is not drawn' },
    { key: 'abyss_wall_run', name: 'Wall run (demo of the joins)', types: ['infrastructure'], lot: [74, 22],
      skip: 'a tag demo: segment, tower, segment, gate, segment, corner, segment built from the wall pieces (their rooms are on those items)' },

    /* ---------- Farming and storage (65-abyss-90-farm.js) */
    { key: 'abyss_farmhouse', name: 'Marsh farmhouse', culture: 'eastabyss', wealth: 0.35, types: ['farm', 'single-family dwelling'], lot: [24, 22],
      bodies: [{ id: 'house', poly: rect(7, 4.4, -6, -6), y: 1.6, levels: [{ h: 2.5 }], wall: 0.12, roof: 'hip', pitch: 0.75,
        doors: [{ at: [-7.4, -3.8], w: 0.95 }], program: ['living', 'bedroom'] }],
      note: 'variant 0: the plank stilt house (7 x 4.4) on its deck at H 1.6, a living room (the hearth is its kitchen) and a bedroom: 4.4 m deep, it does not cut into three; the door left of centre under the porch canopy; the ' +
        'pen, the threshing deck and the drying racks are open. Variant 1 (drum-and-reed) is abyss_farmhouse#1 (skipped)' },
    { key: 'abyss_farmhouse#1', name: 'Marsh farmhouse (variant 2: drum-and-reed farm)', types: ['farm', 'single-family dwelling'], lot: [24, 22],
      skip: 'the home is a horizontal drum (r 1.4, 6 long) on the deck at H 1.6, entered by a door in its +x end 0.4 m above the ' +
        'bottom; nothing decks its inside, so it has no flat floor (a 2.0 m chord at the door sill). The strip between it and the ' +
        'reed wall is a 2 m covered porch' },
    { key: 'abyss_granary', name: 'Silo granary', culture: 'eastabyss', wealth: 0.5, types: ['farm', 'infrastructure'], lot: [28, 24],
      rooms: granaryRooms,
      note: 'the three back silos with doors (r 3.2, 3.6, 3.0) on the deck at H 1.6, one store each to 3 m; the two front silos have ' +
        'no door and the small plank shed has none drawn' },
    { key: 'abyss_windmill', name: 'Windpump and water tank', types: ['farm', 'infrastructure'], lot: [16, 14],
      skip: 'machinery: a lattice windpump tower and a water tank on a timber stand' },
    { key: 'abyss_warehouse', name: 'Salt-marsh warehouse', culture: 'eastabyss', wealth: 0.5, types: ['industry', 'market/shop'], lot: [36, 22],
      bodies: [{ id: 'shed', poly: rect(32, 13, 0, -0.5), y: 1.2, levels: [{ h: 5.5 }], wall: 0.1, roof: 'gable', pitch: 0.35,
        doors: [{ at: [0.2, 6], w: 4.4 }], program: ['store', 'store', 'store'] }],
      note: 'variant 0: the corrugated shed (32 x 13) on piles at H 1.2, entered by the one slid-open door. Variant 1 (containers under a ' +
        'shared sail) is abyss_warehouse#1' },
    { key: 'abyss_warehouse#1', name: 'Salt-marsh warehouse (variant 2: containers under a shared sail)', culture: 'eastabyss', wealth: 0.5,
      types: ['industry', 'market/shop'], lot: [36, 22],
      rooms: [-12.2, -6.1, 0, 6.1, 12.2].map(function (x, i) {
        return { id: 'container-' + i, kind: 'store', poly: rect(CW, C6, x, -5.5), y: 0.2, h: 2.4, doors: [{ at: [x, R3(-5.5 + C6 / 2)], w: 1.0 }] };
      }),
      note: 'the five ground containers (6.1 m, turned along z, x -12.2..12.2) on the yard, each entered by its cargo doors on the ' +
        'front end; one store each. The three containers stacked on them have no door; the sails and the yard are open' },

    /* ---------- Tag demo */
    { key: 'abyss_helpers_demo', name: 'ABYSS helper demo', types: ['prop'], lot: [64, 36],
      skip: 'a tag demo: every ABYSS helper once, not a building' }
  ] });
})(KratorInteriors);
