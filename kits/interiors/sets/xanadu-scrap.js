/* ======================== Interior set: Scrap Xanadu (kits/xanadu SCRAP) ========================
   The reclaimed-Ancient Xanadu set's interiors (2026-11-15): one item per XA.def key xa_scrap_* (kits/xanadu/src/87u-xs-build.js,
   87v-xs-poor.js; kits/xanadu/PLAN-SCRAP.md), in the builder's own frame: XAK.proto(key, v)'s origin at the plot centre on the
   ground, +x right, +z the front, metres. A host places one per record {key, v, x, z, ry, y} with
   IX.sets.instantiate(IX.sets.byName['xanadu-scrap'].byKey[key + (variant item ? '#n' : '')], x, z, ry, { baseY: y, walk: KWALK }).
   Every item carries `def` (the XA.def key) and `variants` (the v it serves) so a host maps a record to its item with
   IX.sets.byName['xanadu-scrap'].forDef(key, v) (below).
   THE DOORS are the def's own: every street door below stands where the builder's vnDoor / xnDoorway puts it, so it matches
   XAK.proto(key, v).userData.doors (the core/door records, read off the built sheet 2026-11-15; `DOORS` below holds them, and
   tests/test-xanadu-scrap.js checks every item against them). A body planned inside a battered block (xnWall) is INSET, as in
   sets/xanadu.js: its doors are moved in onto the shared footprint, straight in from the leaf (the x, or the z of a side door,
   kept). Court-side doors the kit draws no leaf for (the Lantern House's ranges, the serai's upper storey) are open doorways
   and say so in their note.
   Furniture culture: xanadu (common, rich, civic; its chain eastabyss, generic), the poor tier scrap (chained to generic).
   Wealth from the def's tag: poor 0.2, common 0.5, rich 0.8, civic 0.65.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const r3 = function (v) { return Math.round(v * 1000) / 1000; };
  const POOR = 0.2, MID = 0.5, RICH = 0.8, CIVIC = 0.65;
  const SF = ['single-family dwelling'], MF = ['multi-family dwelling'];
  const SLAB = 0.25;                                  /* planBuilding's slab: a storey's clear height is its floor-to-floor less this */
  const STEEP = { w: 0.9, riser: 0.22, tread: 0.24 };   /* a town house's stair: the kit's tall wash storeys (3.9-4.4 m) on narrow plots */

  /* the def's door records, x, y, z, yaw, w, h (XAK.proto(key, v).userData.doors; the same in every variant). A double leaf is
     two records: an item's door is the opening they fill together */
  const DOORS = {
    xa_scrap_house: [[0, 0, 3.52, 0, 1.18, 2.27]],
    xa_scrap_row: [[-6.95, 0, 4.07, 0, 1.08, 2.27], [-1.3, 0, 4.07, 0, 1.08, 2.27], [4.35, 0, 4.07, 0, 1.08, 2.27]],
    xa_scrap_court: [[-0.6, 0, 12.05, 0, 1.19, 3], [0.6, 0, 12.05, 0, 1.19, 3]],
    xa_scrap_bazaar: [[-13.7, 0, 3.07, 0, 0.98, 2.27], [-7.7, 0, 3.07, 0, 0.98, 2.27], [-1.7, 0, 3.07, 0, 0.98, 2.27], [4.3, 0, 3.07, 0, 0.98, 2.27], [10.3, 0, 3.07, 0, 0.98, 2.27]],
    xa_scrap_serai: [[12, 0, 14.93, 3.142, 1.08, 2.37], [6, 0, 14.93, 3.142, 1.08, 2.37], [0, 0, 14.93, 3.142, 1.08, 2.37], [-6, 0, 14.93, 3.142, 1.08, 2.37], [-12, 0, 14.93, 3.142, 1.08, 2.37],
      [-12, 0, -14.93, 0, 1.08, 2.37], [-6, 0, -14.93, 0, 1.08, 2.37], [0, 0, -14.93, 0, 1.08, 2.37], [6, 0, -14.93, 0, 1.08, 2.37], [12, 0, -14.93, 0, 1.08, 2.37],
      [-14.93, 0, 12, 1.571, 1.08, 2.37], [-14.93, 0, 6, 1.571, 1.08, 2.37], [-14.93, 0, 0, 1.571, 1.08, 2.37], [-14.93, 0, -6, 1.571, 1.08, 2.37], [-14.93, 0, -12, 1.571, 1.08, 2.37],
      [14.93, 0, -12, -1.571, 1.08, 2.37], [14.93, 0, -6, -1.571, 1.08, 2.37], [14.93, 0, 0, -1.571, 1.08, 2.37], [14.93, 0, 6, -1.571, 1.08, 2.37], [14.93, 0, 12, -1.571, 1.08, 2.37],
      [-1.15, 0, 23.05, 0, 2.29, 5.2], [1.15, 0, 23.05, 0, 2.29, 5.2]],
    xa_scrap_gate: [[-6.5, 0, 0.48, 3.142, 1.08, 2.27], [6.5, 0, 0.48, 3.142, 1.08, 2.27], [-1.4, 0, 4.05, 0, 2.79, 6.4], [1.4, 0, 4.05, 0, 2.79, 6.4], [-8.25, 0, -2.93, 0, 1.08, 2.27], [-2.75, 0, -2.93, 0, 1.08, 2.27], [2.75, 0, -2.93, 0, 1.08, 2.27], [8.25, 0, -2.93, 0, 1.08, 2.27]],
    xa_scrap_tower: [[0, 0, 4.57, 0, 1.27, 2.17]],
    xa_scrap_shrine: [[0, 1, 1.02, 0, 1.57, 2.77]],
    xa_scrap_pavilion: [],
    xa_scrap_bridge: [[-10, 0, 2.17, 0, 1.18, 2.37], [-7.83, 7, 0, 1.571, 1.18, 2.37], [10, 0, 2.17, 0, 1.18, 2.37], [7.83, 7, 0, -1.571, 1.18, 2.37]],
    xa_scrap_guild_salvage: [[-6.65, 0, 7.05, 0, 1.29, 3.2], [-5.35, 0, 7.05, 0, 1.29, 3.2]],
    xa_scrap_guild_hall: [[-0.6, 0.6, 7.55, 0, 1.19, 3], [0.6, 0.6, 7.55, 0, 1.19, 3]],
    xa_scrap_granary: [],
    xa_scrap_store: [[-7.6, 0, 5.55, 0, 1.19, 3], [-6.4, 0, 5.55, 0, 1.19, 3], [-0.6, 0, 5.55, 0, 1.19, 3], [0.6, 0, 5.55, 0, 1.19, 3], [6.4, 0, 5.55, 0, 1.19, 3], [7.6, 0, 5.55, 0, 1.19, 3]],
    xa_scrap_bath: [[-0.55, 0, 7.05, 0, 1.09, 2.8], [0.55, 0, 7.05, 0, 1.09, 2.8]],
    xa_scrap_tank_house: [[0, 0.4, 2.89, 0, 0.98, 2.07], [0, 6.1, 1.09, 0, 0.78, 1.77]],
    xa_scrap_silos: [[-1.76, 0, -0.87, 0.876, 0.98, 2.07], [1.09, 0, -0.8, -0.661, 0.98, 2.07], [2.99, 0, 1.97, -2.001, 0.98, 2.07], [-2.81, 0, 2.39, 2.138, 0.98, 2.07]],
    xa_scrap_hull: [[0, 0.7, 4.59, 0, 0.98, 2.07]],
    xa_scrap_glint: [[0, 0, 3.09, 0, 0.98, 2.07]],
    xa_scrap_shacks: [[-5.92, 0, 2.09, 0, 0.78, 1.92], [-2.52, 0, 2.09, 0, 0.78, 1.92], [0.88, 0, 2.09, 0, 0.78, 1.92], [4.28, 0, 2.09, 0, 0.78, 1.92]],
    xa_scrap_farm: [[-6, 0, 0.52, 0, 1.08, 2.17], [8.9, 0.9, 4.57, 0, 1.19, 2.4], [10.1, 0.9, 4.57, 0, 1.19, 2.4]]
  };

  /* the kit's batter (72-xa-helpers.js xnBatterK): the top of a w x h x d block is k times its base */
  function batK(w, h, d) { const want = 1 - 2 * h * 0.088 / Math.min(w, d); return want > 0.94 ? 0.96 : want > 0.89 ? 0.92 : want > 0.83 ? 0.86 : 0.8; }
  /* a body planned on the footprint P = [x0, x1, z0, z1] every storey shares (sets/xanadu.js inset()): the doors drawn on the
     blocks' outer faces moved in onto it, straight in from where they stand. o: {y, hs, wall, roof, doors, program, windows, flat}.
     hs are the storeys floor to floor as the builder stacks them; a level's h is its clear height, the slab (0.25) under the next */
  function inset(P, id, o) {
    const w = r3(P[1] - P[0]), d = r3(P[3] - P[2]), cx = r3((P[0] + P[1]) / 2), cz = r3((P[2] + P[3]) / 2);
    const doors = (o.doors || []).map(function (D) {
      const x = D.at[0], z = D.at[1], ex = Math.min(Math.abs(x - P[0]), Math.abs(x - P[1])), ez = Math.min(Math.abs(z - P[2]), Math.abs(z - P[3]));
      const outX = x < P[0] || x > P[1], outZ = z < P[2] || z > P[3];
      const onX = outX && !outZ ? true : outZ && !outX ? false : ex < ez;
      const at = onX ? [x < cx ? P[0] : P[1], Math.max(P[2] + 0.6, Math.min(P[3] - 0.6, z))] : [Math.max(P[0] + 0.6, Math.min(P[1] - 0.6, x)), z < cz ? P[2] : P[3]];
      return Object.assign({}, D, { at: [r3(at[0]), r3(at[1])] });
    });
    const b = { id: id, poly: rect(w, d, cx, cz), y: o.y || 0, levels: o.hs.map(function (h) { return { h: r3(h - SLAB) }; }), wall: o.wall == null ? 0.4 : o.wall,
      roof: o.roof || 'flat', doors: doors, program: o.program };
    if (!o.flat) b.inset = true;
    if (o.windows === false) b.windows = false;
    if (o.stair) b.stair = o.stair;
    return b;
  }
  /* a battered block w x d x h at (cx, cz) under a straight panel block (xnXSBlock: Wu = W*k - .2) of the same centre: the
     footprint they share is the panel block's */
  function panelP(cx, cz, w, d, h) { const k = batK(w, h, d), wu = w * k - 0.2, du = d * k - 0.2; return [cx - wu / 2, cx + wu / 2, cz - du / 2, cz + du / 2]; }
  /* a polygon of n sides round (cx, cz), radius r to its corners, one side's middle facing the bearing a (0 = +z, the front);
     door(): the middle of that side, where a door through it stands */
  function ring(r, n, cx, cz, a) {
    a = a || 0; const out = [];
    for (let i = 0; i < n; i++) { const t = a + (i - 0.5) / n * Math.PI * 2; out.push([r3(cx + r * Math.sin(t)), r3(cz + r * Math.cos(t))]); }
    return out;
  }
  function ringDoor(r, n, cx, cz, a) { const ap = r * Math.cos(Math.PI / n); return [r3(cx + ap * Math.sin(a)), r3(cz + ap * Math.cos(a))]; }
  /* one door of the item from a def record pair or single: the opening's centre and its full width */
  function leaf(key, i, j) {
    const A = DOORS[key][i], B = j == null ? null : DOORS[key][j];
    if (!B) return { at: [A[0], A[2]], w: r3(A[4]) };
    return { at: [r3((A[0] + B[0]) / 2), r3((A[2] + B[2]) / 2)], w: r3(Math.hypot(B[0] - A[0], B[2] - A[2]) + (A[4] + B[4]) / 2) };
  }

  /* ROOM KINDS this set adds (data for IX.PROGRAMS, as sets/beast-rider-rock.js adds its own): a round room too small for a
     free-standing bed (a silo under 2.3 m radius, the tank's roof room) sleeps on a BUNK built round its wall, a fixture with
     bed: 1 the residence rule counts; the placer brings what else it needs.
       xs_drum   a one-room home in a drum: hearth, chest, food (the bunk is the bed)
       xs_bunk   a sleeping room in a drum: a chest (the bunk is the bed) */
  const SEATS = IX.SEAT_TYPES, ITEM = IX.ITEM_ROLES, FOOD = IX.FOOD_ROLES, SURFACE = IX.SURFACE_GROUP;
  if (!IX.PROGRAMS.xs_drum) {
    IX.PROGRAMS.xs_drum = { require: [{ need: 'chest', types: ['storage'], roles: ITEM, n: 1 }, { need: 'food', types: ['storage', 'vessel', 'stack'], roles: FOOD, n: 1 },
                                      { need: 'hearth', types: ['stove', 'brazier'], n: 1 }],
      optional: [{ types: SEATS, max: 1 }, { types: ['shelf', 'rack'], max: 1 }, { types: ['lamp'], max: 1 }, { types: ['rug'], max: 1 }, SURFACE], extra: 5 };
    IX.PROGRAMS.xs_bunk = { require: [{ need: 'chest', types: ['storage'], roles: ITEM, n: 1 }],
      optional: [{ types: ['lamp'], max: 1 }, { types: ['rug'], max: 1 }, { types: ['shelf'], max: 1 }], extra: 4 };
    IX.KIND_ALIAS.xs_drum = ['cottage', 'living', 'bedroom'];
    IX.KIND_ALIAS.xs_bunk = ['bedroom'];
  }
  /* the bunk: 1.9 x 0.8 along the wall opposite the door at bearing a, in a ring of radius r round (cx, cz) */
  function bunk(r, cx, cz, a) { const d = r - 0.72, b = a + Math.PI;
    return { id: 'bunk', kind: 'bedshelf', x: r3(cx + d * Math.sin(b)), z: r3(cz + d * Math.cos(b)), ry: r3(a), w: 1.9, d: 0.8, h: 0.45, bed: 1, reach: false }; }

  const L = [];
  const add = function (it, vs) { L.push(Object.assign({ culture: 'xanadu', def: it.key.split('#')[0], variants: vs || [0, 1, 2] }, it)); return it; };
  const skip = function (key, name, types, why) { L.push({ key: key, def: key, variants: [0, 1, 2], name: name, types: types, skip: why }); };

  /* ================================================================ houses (87u: 1-3) */
  /* 1. Panel House: the battered whitewash storey (W 8, D 7, 3.4 m, the band to 3.9), then 2 (v0, v1) or 3 (v2) storeys of
     panels 3 m each; the glazed bay hangs off the first panel storey (furniture stays in the room) */
  const houseP = panelP(0, 0, 8, 7, 3.4);
  add({ key: 'xa_scrap_house', name: 'Panel House', wealth: MID, types: SF, lot: [11, 11],
    bodies: [inset(houseP, 'house', { hs: [3.9, 3, 3], doors: [leaf('xa_scrap_house', 0)], program: [['living', 'kitchen'], ['bedroom', 'study'], ['bedroom', 'store']], stair: STEEP })],
    note: 'the battered ground storey and the band (3.9 m), two panel storeys; the glazed bay is the first panel storey\'s window seat, the roof lantern is not entered' }, [0, 1]);
  add({ key: 'xa_scrap_house#2', name: 'Panel House (variant 3: three panel storeys)', wealth: MID, types: SF, lot: [11, 11],
    bodies: [inset(houseP, 'house', { hs: [3.9, 3, 3, 3], doors: [leaf('xa_scrap_house', 0)], program: [['living', 'kitchen'], ['bedroom', 'study'], ['bedroom', 'store'], ['bedroom']], stair: STEEP })],
    note: 'as variant 1, a third panel storey' }, [2]);

  /* 2. Panel Row: three narrow houses at x = (h - 1) * 5.65, each a wash storey 5.6 x 8 x 3.2 and a panel block 5.4 x 7.6 of
     2 + ((v + h) % 2) storeys; the door at x - 1.3 under a girder porch. v0 and v2 draw 2-3-2 storeys, v1 3-2-3 */
  function rowItem(key, name, ns, vs) {
    const bodies = [0, 1, 2].map(function (h) {
      const x = (h - 1) * 5.65, hs = [3.2]; for (let s = 0; s < ns[h]; s++) hs.push(3);
      const prog = [['living', 'kitchen'], ['bedroom', 'store'], ['bedroom']].slice(0, hs.length);
      return inset([x - 2.7, x + 2.7, -3.8, 3.8], 'house' + h, { flat: true, hs: hs, doors: [leaf('xa_scrap_row', h)], program: prog });
    });
    add({ key: key, name: name, wealth: MID, types: MF, units: 3, lot: [18.5, 12], bodies: bodies,
      note: 'three households, one per house, each up its own stair; the porches are open' }, vs);
  }
  rowItem('xa_scrap_row', 'Panel Row', [2, 3, 2], [0, 2]);
  rowItem('xa_scrap_row#1', 'Panel Row (variant 2: the middle house lower)', [3, 2, 3], [1]);

  const DRUM_R = r3(2.05 / Math.cos(Math.PI / 16)), DRUM_X = r3(-11.8 + 2.05);   /* the drum's room: its inside face at 2.05 m */
  /* 3. Lantern House: four ranges round a court (wash storeys 3.6 m and the band to 4.05, panel storeys over them: the front and
     sides 3 m, the back hall 6 m, two storeys). The gate (the double leaf at z 12) runs through the front range into the court:
     the front range's entrance room has the gate and a doorway on the court; the other ranges open off the court arcade by
     doorways (the kit draws no leaf there). The corner drum (r 2.3 at (-11.8, 10.8), 12 m) stands proud of the front range's west
     end: its ground storey is a round study entered from the front range (the range planned from x -9.75, where the drum's
     inside meets it; the doorway between is the house's own, marked inner). Its storeys over that are a stair of windows to
     the glass cap: the planner's ladder needs 3.05 m of straight wall and the drum gives 2.8, so they are not planned */
  add({ key: 'xa_scrap_court', name: 'Lantern House', wealth: RICH, types: SF, lot: [28, 27],
    bodies: [
      inset([DRUM_X, 12.85, 7.15, 11.85], 'front', { flat: true, hs: [4.05, 3], doors: [leaf('xa_scrap_court', 0, 1), { at: [0, 7.15], w: 2.0, court: true }, { at: [DRUM_X, 10.8], w: 1.0, inner: true }],
        program: [['antechamber', 'kitchen', 'store'], ['bedroom', 'bedroom']] }),
      inset([-12.85, 12.85, -11.85, -5.15], 'hall', { flat: true, hs: [4.05, 3, 3], doors: [{ at: [0, -5.15], w: 2.0, court: true }],
        program: [['hall', 'kitchen'], ['study', 'library'], ['bedroom', 'bedroom']] }),
      inset([-12.85, -7.15, -4.85, 6.85], 'west', { flat: true, hs: [4.05, 3], doors: [{ at: [-7.15, 1], w: 1.2, court: true }], program: [['living', 'store'], ['bedroom']] }),
      inset([7.15, 12.85, -4.85, 6.85], 'east', { flat: true, hs: [4.05, 3], doors: [{ at: [7.15, 1], w: 1.2, court: true }], program: [['study', 'store'], ['bedroom']] })],
    rooms: [{ id: 'drum', kind: 'study', poly: ring(DRUM_R, 16, -11.8, 10.8, Math.PI / 2), y: 0, h: 3.8,
      doors: [{ at: ringDoor(DRUM_R, 16, -11.8, 10.8, Math.PI / 2), w: 1.0, inner: true }] }],
    note: 'four ranges round the pool court and the corner drum\'s study; the court doorways of the hall and the side ranges are open (no leaf in the kit); the drum\'s upper storeys (a stair of windows to its cap) and the hall lantern are not entered' });

  /* ================================================================ trade (87u: 4-5) */
  /* 4. Girder Arcade: five shops 6 m wide in one wash block (30 x 9, z -6..3, 4.4 m) under a panel storey (29.6 x 8.6, 3 m);
     each shop's door at its bay centre - 1.7. A shop each, the panel storey over it its store and the shopkeeper's room */
  add({ key: 'xa_scrap_bazaar', name: 'Girder Arcade', wealth: MID, types: ['market/shop'], lot: [32, 16],
    bodies: [0, 1, 2, 3, 4].map(function (i) {
      const x0 = -14.8 + i * 5.92;
      return inset([x0, x0 + 5.92, -5.8, 2.8], 'shop' + i, { flat: true, hs: [4.4, 3], doors: [leaf('xa_scrap_bazaar', i)], program: [['shop'], ['store', 'bedroom']], stair: STEEP });
    }),
    note: 'five shops behind the girder arcade (the arcade itself is open street)' });

  /* 5. Terminus Serai: four ranges round the court (H 22, E 15: 7 m deep, wash 4 m + band to 4.45, a panel block 3 m
     over it, 0.15 m in), five doors on the court face of each, every 6 m. Every range is a body of two storeys, its ground the
     serai's rooms on the court and its panel storey the travellers' rooms, reached by a stair inside the range (the kit's
     gallery over the arcade is the walk outside them). The gate pylon (14 x 4 at z 21, the double gate at z 23) is a passage
     through the front range to the court, its court door the front range's middle one (z 15): the front range is two bodies,
     one each side of it */
  const SD = DOORS.xa_scrap_serai, sd = function (i) { return { at: [SD[i][0], SD[i][2]], w: SD[i][4] }; };
  const gate = leaf('xa_scrap_serai', 20, 21);
  add({ key: 'xa_scrap_serai', name: 'Terminus Serai', wealth: CIVIC, types: ['tavern/inn', 'market/shop', 'infrastructure'], lot: [46, 47],
    bodies: [
      inset([-21.85, -2.9, 15.15, 21.85], 'north-w', { flat: true, hs: [4.45, 3], doors: [sd(4), sd(3)], program: [['tavern', 'kitchen'], ['dormitory', 'bedroom']] }),
      inset([2.9, 21.85, 15.15, 21.85], 'north-e', { flat: true, hs: [4.45, 3], doors: [sd(1), sd(0)], program: [['store', 'store'], ['dormitory', 'dormitory']] }),
      inset([-21.85, 21.85, -21.85, -15.15], 'south', { flat: true, hs: [4.45, 3], doors: [5, 6, 7, 8, 9].map(sd),
        program: [['stable', 'store', 'store', 'stable'], ['dormitory', 'dormitory', 'bedroom', 'dormitory']] }),
      inset([-21.85, -15.15, -14.85, 14.85], 'west', { flat: true, hs: [4.45, 3], doors: [10, 11, 12, 13, 14].map(sd),
        program: [['tavern', 'kitchen', 'store'], ['dormitory', 'dormitory', 'bedroom']] }),
      inset([15.15, 21.85, -14.85, 14.85], 'east', { flat: true, hs: [4.45, 3], doors: [15, 16, 17, 18, 19].map(sd),
        program: [['shop', 'shop', 'store'], ['dormitory', 'dormitory', 'study']] })],
    rooms: [{ id: 'gate', kind: 'antechamber', poly: rect(5.8, 7.85, 0, 19.075), y: 0, h: 4.6,
      doors: [{ at: [gate.at[0], 23], w: gate.w, swing: 'none' }, { at: [0, 15.15], w: SD[2][4] }] }],
    note: 'the four ranges (the serai\'s rooms on the court, the travellers\' rooms over them up a stair in each range) and the gate passage; the gallery over the arcade is open' });

  /* ================================================================ garrison and civic (87u: 6-15) */
  /* 6. Garrison Gate: the barracks behind (22 x 8 at z -7, wash 3.4 + band to 3.8, a panel storey 3 m), four doors on its
     front; the two towers (battered 7 x 7 at x +-6.5, z 4, 5 m, the band to 5.4, a panel block of three 3.33 m storeys), each
     its door on the yard behind (the kit's, since 2026-11-15); the gate (the double leaf at z 4) is a passage under the walk */
  add({ key: 'xa_scrap_gate', name: 'Garrison Gate', wealth: CIVIC, types: ['military', 'civic'], lot: [38, 24],
    bodies: [inset([-10.8, 10.8, -10.8, -3.2], 'barracks', { flat: true, hs: [3.8, 3],
      doors: [4, 5, 6, 7].map(function (i) { return leaf('xa_scrap_gate', i); }),
      program: [['barracks', 'kitchen', 'store', 'barracks'], ['barracks', 'barracks', 'study']] })].concat([-1, 1].map(function (s) {
        return inset(panelP(s * 6.5, 4, 7, 7, 5), s < 0 ? 'tower-w' : 'tower-e', { hs: [5.4, 3.33, 3.33, 3.34], doors: [leaf('xa_scrap_gate', s < 0 ? 0 : 1)],
          program: [['antechamber'], ['barracks'], ['store'], ['study']] });
      })),
    note: 'the barracks and the two towers (a ladder a storey: 5.9 m square); the gate is an open passage under the walk, whose doors into the towers the kit does not draw' });

  /* 7. Glass-Crowned Tower: the battered base (9 x 9, 2.4 m, the band to 2.75) and the panel drum (r 3.6) of 18 m (v0, v2) or
     21 m (v1) over it, its lantern on top. The drum's storeys are planned on the octagon inside it */
  function towerItem(key, name, hh, vs) {
    const ns = Math.round(hh / 3), b = 9 * batK(9, 2.4, 9) / 2, sq = 2.5;   /* the base's top; the square inside the drum (r 3.6) */
    /* the base storey is planned the drum's width, from the drum's back wall out to the base's front (its door): the planner
       runs a ladder along the lower storey's own wall, so the storeys over it must share that wall */
    const levels = [{ h: r3(2.75 - SLAB) }]; for (let i = 0; i < ns; i++) levels.push({ h: r3(hh / ns - SLAB), poly: rect(2 * sq, 2 * sq) });
    const progs = [['antechamber']]; for (let i = 0; i < ns; i++) progs.push([i === ns - 1 ? 'study' : i % 2 ? 'store' : 'barracks']);
    add({ key: key, name: name, wealth: CIVIC, types: ['military', 'infrastructure'], lot: [11, 11],
      bodies: [{ id: 'tower', poly: rect(2 * sq, r3(b + sq), 0, r3((b - sq) / 2)), y: 0, levels: levels, wall: 0.4, roof: 'flat', inset: true,
        doors: [{ at: [0, r3(b)], w: DOORS.xa_scrap_tower[0][4] }], program: progs }],
      note: 'the base (planned as wide as the drum, out to its door) and ' + ns + ' storeys on the square inside the drum (5 m), a ladder each; the glass crown is the watch, not planned' }, vs);
  }
  towerItem('xa_scrap_tower', 'Glass-Crowned Tower', 18, [0, 2]);
  towerItem('xa_scrap_tower#1', 'Glass-Crowned Tower (variant 2: the taller drum)', 21, [1]);

  /* 8. Wheel Shrine: the battered cell (10 x 10, 5 m) on its 1 m platform at z -4, the band and roof to 6.6, the lantern
     and dome over it (not entered); the door on the front at z 1 */
  { const k = batK(10, 5, 10), b = 10 * k / 2;
    add({ key: 'xa_scrap_shrine', name: 'Wheel Shrine', wealth: CIVIC, types: ['religious'], lot: [18, 27],
      bodies: [inset([-b, b, -4 - b, -4 + b], 'cell', { y: 1, hs: [5.6], doors: [leaf('xa_scrap_shrine', 0)], program: ['shrine'] })],
      note: 'one cell on the platform; the prayer wheels stand outside under their roofs' }); }

  skip('xa_scrap_pavilion', 'Cistern Pavilion', ['civic', 'infrastructure'], 'open octagon of girder columns over a fountain at the head of a pool: nothing enclosed');

  /* 10. Cable Bridge: two stair towers (4.2 x 4.2 at x +-10, panel blocks 10.5 m of three 3.5 m storeys), the street door on
     the front of each, the span's door into the top storey (y 7) */
  add({ key: 'xa_scrap_bridge', name: 'Cable Bridge', wealth: CIVIC, types: ['infrastructure'], lot: [25, 8],
    bodies: [-1, 1].map(function (s) {
      return inset([s * 10 - 2.1, s * 10 + 2.1, -2.1, 2.1], s < 0 ? 'west' : 'east', { flat: true, hs: [3.5, 3.5, 3.5], wall: 0.3,
        doors: [leaf('xa_scrap_bridge', s < 0 ? 0 : 2)], program: [['antechamber'], ['store'], ['antechamber']] });
    }),
    note: 'two stair towers, a ladder a storey (4.2 m square); the span\'s door into each top storey (y 7, on the inner face) is the host\'s: the span is a walk deck between them' });

  /* 11. Salvagers' Guildhall: the hall (22 x 14 at x -6, battered 4 m, the band to 4.45, a panel block of two 3 m storeys);
     the portico and the panel yard are open */
  add({ key: 'xa_scrap_guild_salvage', name: "Salvagers' Guildhall", wealth: CIVIC, types: ['civic', 'industry'], lot: [36, 22],
    bodies: [inset(panelP(-6, 0, 22, 14, 4), 'hall', { hs: [4.45, 3, 3], doors: [leaf('xa_scrap_guild_salvage', 0, 1)],
      program: [['hall', 'workshop', 'store'], ['study', 'library'], ['store', 'dormitory']] })],
    note: 'the guild hall and its upper rooms; the portico and the panel yard under the gantry are open' });

  /* 12. Merchants' Guildhall: the battered hall (18 x 15, 3.8 m on a 0.6 m plinth, the band to 4.9), a panel block of two
     3.3 m storeys, its glazed bays the upper rooms' windows; the corner pavilions on the roof are not entered */
  add({ key: 'xa_scrap_guild_hall', name: "Merchants' Guildhall", wealth: CIVIC, types: ['civic', 'market/shop'], lot: [20, 21],
    bodies: [inset(panelP(0, 0, 18, 15, 3.8), 'hall', { y: 0.6, hs: [4.3, 3.3, 3.3], doors: [leaf('xa_scrap_guild_hall', 0, 1)],
      program: [['hall', 'store'], ['study', 'library', 'store'], ['hall', 'kitchen']] })],
    note: 'the hall, the counting rooms over it, the banquet hall under the lantern' });

  skip('xa_scrap_granary', 'Granary', ['infrastructure', 'farm'], 'grain bins: drums of panels filled from a hatch on a stilted deck, nothing to walk in');

  /* 14. Storehouse: the battered store (22 x 11, 4.2 m, the band to 4.65), three double doors at x -7, 0, 7 under their
     canopies, a panel storey of 3 m (the hoist's loft) */
  add({ key: 'xa_scrap_store', name: 'Storehouse', wealth: CIVIC, types: ['infrastructure', 'market/shop'], lot: [24, 17],
    bodies: [inset(panelP(0, 0, 22, 11, 4.2), 'store', { hs: [4.65, 3], windows: false,
      doors: [leaf('xa_scrap_store', 0, 1), leaf('xa_scrap_store', 2, 3), leaf('xa_scrap_store', 4, 5)],
      program: [['store', 'store', 'store'], ['store', 'store']] })],
    note: 'three bays of stores and the loft over them (the hoist lifts to it); no windows in the wash storey' });

  /* 15. Bathhouse: the changing hall (battered 12 x 12 at z 1, 6 m, under the eyed dome) and the hot rooms behind it (16 x 8
     at z -9, 4.4 m), one door through between them; the furnace shed is the stoker's, outside */
  { const k = batK(12, 6, 12), b = 12 * k / 2 - 0.45, front = leaf('xa_scrap_bath', 0, 1);
    add({ key: 'xa_scrap_bath', name: 'Bathhouse', wealth: CIVIC, types: ['civic'], lot: [18, 34],
      rooms: [
        { id: 'hall', kind: 'hall', poly: rect(2 * b, r3(1 + b + 4.75), 0, r3((1 + b - 4.75) / 2)), y: 0, h: 6.0,
          doors: [{ at: [front.at[0], r3(1 + b)], w: front.w }, { id: 'wash', at: [-2.4, -4.75], w: 1.4, to: '.wash', swing: 'in' }] },
        { id: 'wash', kind: 'bath', culture: 'ancients-salvage', poly: rect(7.6, 7.85, -3.8, -8.675), y: 0, h: 4.0,
          doors: [{ id: 'wash', at: [-2.4, -4.75], w: 1.4, to: '.hall', swing: 'none' }, { id: 'hot', at: [0, -8.675], w: 1.2, to: '.hot', swing: 'in' }] },
        { id: 'hot', kind: 'hall', poly: rect(7.6, 7.85, 3.8, -8.675), y: 0, h: 4.0,
          doors: [{ id: 'hot', at: [0, -8.675], w: 1.2, to: '.wash', swing: 'none' }] }],
      note: 'the changing hall, the washroom (its tubs, basins and privy the Ancients\' own moulded fittings, reclaimed: the catalog\'s ancients-salvage) and the hot room under the eyed domes; the pool before the porch is open' }); }

  /* ================================================================ the poor and the farm (87v: 16-21) */
  /* 16. Tank House: a tank stood up (r 2.8, 5.6 m on a 0.4 m slab) is the house, one tall room; the copper tank on its roof
     (r 1.6 at z -0.6, 2.3 m) the sleeping room, its door onto the gallery (y 6.1), up the kit's ladder */
  add({ key: 'xa_scrap_tank_house', name: 'Tank House', culture: 'scrap', wealth: POOR, types: SF, lot: [10, 10],
    rooms: [
      { id: 'tank', kind: 'cottage', poly: ring(2.72, 16, 0, 0, 0), y: 0.4, h: 5.5, doors: [{ at: ringDoor(2.72, 16, 0, 0, 0), w: 0.98 }] },
      { id: 'top', kind: 'xs_bunk', poly: ring(1.52, 12, 0, -0.6, 0), y: 6.1, h: 2.2, doors: [{ at: ringDoor(1.52, 12, 0, -0.6, 0), w: 0.78 }], fixtures: [bunk(1.52, 0, -0.6, 0)] }],
    note: 'the tank is one tall room (the ports at 3 m light it); the roof tank (a bunk round its wall) is reached by the kit\'s ladder to the gallery: the host\'s climb' });

  /* 17. Silo Court: four silos round a yard, each a home of one room, its door facing the yard (0, 0.6) */
  { const SI = [[-3.6, -2.4, 2.3, 7.4], [2.8, -3.0, 2.7, 9.2], [4.8, 2.8, 1.9, 6.0], [-4.4, 3.4, 1.8, 5.2]];
    add({ key: 'xa_scrap_silos', name: 'Silo Court', culture: 'scrap', wealth: POOR, types: MF, units: 4, lot: [16, 16],
      /* the tallest and widest (r 2.7, 9.2 m) holds a loft: two storeys planned on the square inside it, a face toward the yard,
         up a ladder (the narrower silos' squares are under the ladder's 3.05 m) */
      /* the square (3.7 m, its corners on the drum) drawn out at its front to the drum's wall, so the doorway meets the leaf */
      bodies: [(function () { const s = SI[1], a = Math.atan2(-s[0], 0.6 - s[1]), c = Math.cos(a), sn = Math.sin(a);
        const P = function (u, v) { return [r3(s[0] + u * c + v * sn), r3(s[1] - u * sn + v * c)]; };   /* u along the front, v out toward the yard */
        return { id: 'silo1', poly: [P(-1.85, -1.85), P(1.85, -1.85), P(1.85, 1.85), P(0.73, 2.6), P(-0.73, 2.6), P(-1.85, 1.85)].reverse(),
          y: 0, levels: [{ h: 2.75 }, { h: 2.75 }], wall: 0.2, roof: 'flat', doors: [{ at: P(0, 2.6), w: 0.98 }], program: [['living'], ['bedroom']] }; })()],
      rooms: SI.map(function (s, i) {
        const a = Math.atan2(-s[0], 0.6 - s[1]), r = s[2] - 0.08;
        const room = { id: 'silo' + i, kind: 'cottage', poly: ring(r, 16, s[0], s[1], a), y: 0, h: 3.0, doors: [{ at: ringDoor(r, 16, s[0], s[1], a), w: 0.98 }] };
        if (r < 2.3) { room.kind = 'xs_drum'; room.fixtures = [bunk(r, s[0], s[1], a)]; }     /* too small for a bed and a way round it */
        return room;
      }).filter(function (R) { return R.id !== 'silo1'; }),
      note: 'one household a silo, the three narrower sleeping on a bunk round the wall, the widest with a loft up a ladder; the narrower ones\' volume over 3 m is left unplanned (too narrow for a ladder); the deck between the tall silos is open' }); }

  /* 18. Hull House: a hull section laid down as a vault (r 3, 9 long, on a 0.7 m bed), mud ends, the door in the front one */
  add({ key: 'xa_scrap_hull', name: 'Hull House', culture: 'scrap', wealth: POOR, types: SF, lot: [10, 16],
    rooms: [{ id: 'vault', kind: 'cottage', poly: rect(4.2, 8.4, 0, 0), y: 0.7, h: 2.2, doors: [{ at: [0, 4.2], w: 0.98 }] }],
    note: 'one room under the vault, kept to where it stands 2.2 m clear (x +-2.1)' });

  /* 19. Glint House: the mud house (7 x 6, 3.2 m) under its roof; the drums on the roof under the glinting cones are not entered */
  add({ key: 'xa_scrap_glint', name: 'Glint House', culture: 'scrap', wealth: POOR, types: SF, lot: [12, 13],
    bodies: [{ id: 'house', poly: rect(7, 6), y: 0, levels: [{ h: 3.2 }], wall: 0.4, roof: 'flat', doors: [{ at: [0, 3], w: 0.98 }], program: [['living', 'bedroom']] }],
    note: 'the mud house; the two drums on its roof (under the cones) are lofts the kit draws solid' });

  /* 20. Shack Row: four one-room houses of sheets (3.3 x 4 at x -5.1 + 3.4 i, 2.6 or 3.2 m), the door at x - 0.82 */
  add({ key: 'xa_scrap_shacks', name: 'Shack Row', culture: 'scrap', wealth: POOR, types: ['multi-family dwelling', 'market/shop'], units: 4, lot: [15, 9], wall: 0.1,
    rooms: [0, 1, 2, 3].map(function (i) {
      const x = -5.1 + i * 3.4, D = DOORS.xa_scrap_shacks[i];
      return { id: 'shack' + i, kind: 'cottage', poly: rect(3.1, 3.8, x, 0), y: 0, h: i % 2 ? 3.0 : 2.45, doors: [{ at: [D[0], 1.9], w: D[4] }] };
    }),
    note: 'one household a shack; the awnings are the shop fronts, outside' });

  /* 21. Tank Farm: the house (battered 9 x 7 at (-6, -3), 3.2 m, the band to 3.65, a storey of sheets 2.6 m) and the barn (a
     hull vault r 3.2, 11 long, on a 0.9 m wall at (9.5, -1), the double door in its mud end) */
  add({ key: 'xa_scrap_farm', name: 'Tank Farm', wealth: MID, types: ['farm', 'single-family dwelling'], lot: [30, 26],
    bodies: [inset(panelP(-6, -3, 9, 7, 3.2), 'house', { hs: [3.65, 2.6], doors: [leaf('xa_scrap_farm', 0)], program: [['living', 'kitchen'], ['bedroom', 'store']] })],
    rooms: [{ id: 'barn', kind: 'stable', poly: rect(4.4, 10.6, 9.5, -1), y: 0.9, h: 2.3, windows: [],
      doors: [(function () { const d = leaf('xa_scrap_farm', 1, 2); return { at: [d.at[0], 4.3], w: d.w }; })()] }],
    note: 'the farmhouse (its upper storey of sheets) and the barn under the vault, kept to where it stands 2.3 m clear; the water tower, the pen and the threshing floor are open' });

  IX.sets.add({ set: 'xanadu-scrap', title: 'Scrap Xanadu (kits/xanadu SCRAP)', culture: 'xanadu', items: L });
  /* a record {key, v} to its item: the variant item when the def has one for v, else the def's own */
  const S = IX.sets.byName['xanadu-scrap'];
  S.doors = DOORS;
  S.forDef = function (key, v) { v = v == null ? 0 : v; return S.items.find(function (it) { return it.def === key && (it.variants || [0]).indexOf(v) >= 0; }) || S.byKey[key] || null; };
})(KratorInteriors);
