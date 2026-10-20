/* ======================== Interior set: Beast Rider, rock-cut (Pinnacle Rock) ========================
   The rooms behind the Beast Riders kit's ROCK-CUT pieces (kits/beast-riders/src/55-br-rockcut.js, ASSET keys
   br_bldg_rock_*): Mav's Refuge's carved-tree rooms (its gate baobabs' seven carving kinds, its levels' apartments,
   stores and workshops: settlements/mavs-refuge/src/56-levels.js, 57a-interiors.js) re-cut in sandstone for Pinnacle
   Rock's stacks and the mesa's walls (settlements/pinnacle-rock/PLAN.md). One item per key, `<key>#n` for variant n.
   Furniture culture: beast-rider (its chain ends in the generic set).

   THE FRAME is the piece's: origin at its footprint centre on the ground, +z the front. The piece's back is z = -d/2
   (d its declared depth, kits/beast-riders BR_ROCK.dims), the wall's face 0.5 m in front of it (zW = -d/2 + 0.5); the
   rock behind the face is ROCK_T (0.6 m) thick before the first room, so a room's front wall is at zW - ROCK_T and the
   room runs back into the rock (-z). A flat-wall placement: a world that wraps a piece round a stack (wallR) keeps
   these rooms straight behind its middle.

   CARVED ROOMS (as kits/interiors/sets/zeijani.js writes them): explicit rooms whose walls are rock (carved: true, ceil
   'vault' or 'flat', rise, finish 'hewn'), what is cut from the rock as FIXTURES the placer keeps off: benches cut
   from the wall (`bench`), wall niches (`niche`), bed shelves (`bedshelf`, bed: 1, which the residence rule counts),
   a hearth with its smoke shaft (`hearth`, shaft: the vent's place on the face; the shaft is a void), an altar left
   standing (`altar`), a perch ledge (`perch`), a pool (`pool`). Each room's door is on its own front wall; the
   passage through the rock to the face, or between two rooms, is a void ({kind: 'stair', joins}), as zeijani's.
   `voids` are data for the world that cuts the rock (Pinnacle Rock's KCAVERN); this sheet does not draw them.

   ROOM KINDS this set adds (data for IX.PROGRAMS; a page that never loads this file never sees them):
     brr_home     a rock-cut home's main room: its hearth and smoke shaft and its benches are cut; a table and a food store
     brr_cell     a sleeping cell: its bed shelf is cut; a chest and a food jar
     brr_roost    a flyer's roost cell: a nest or bedding and its feed; perches and tack if there is room
     brr_vault    a strongroom: chests
     brr_guard    a guard post's room: a weapon rack and a seat
     brr_cistern  a cistern's landing: a vessel to draw into; the pool is cut
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SEATS = IX.SEAT_TYPES, ITEM = IX.ITEM_ROLES, FOOD = IX.FOOD_ROLES, SURFACE = IX.SURFACE_GROUP;
  const R3 = function (v) { return Math.round(v * 1000) / 1000; };
  const EMBED = 0.5, ROCK_T = 0.6;
  /* the front wall of the first room behind a piece of declared depth d */
  const front = function (d) { return R3(-d / 2 + EMBED - ROCK_T); };
  const rrect = function (x0, x1, z0, z1) { return [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]; };
  const fx = function (id, kind, x, z, w, d, o) { return Object.assign({ id: id, kind: kind, x: x, z: z, ry: 0, w: w, d: d, reach: false }, o || {}); };
  /* a carved room: x0..x1 wide, from its front wall zf back depth metres; doors on the front wall at x (width w) */
  function room(id, kind, x0, x1, zf, depth, y, h, doors, o) {
    return Object.assign({ id: id, kind: kind, carved: true, poly: rrect(x0, x1, R3(zf - depth), zf), y: y, h: h, ceil: 'vault', rise: 0.5, finish: 'hewn',
      doors: doors.map(function (d) { return { at: [d[0], zf], w: d[1], swing: 'none' }; }) }, o || {});
  }
  /* the passage through the rock from the face to a door (or from one room's back door to the next room's front) */
  const pass = function (id, joins, x, y, z0, z1, w, h) { return { kind: 'stair', id: id, joins: joins, a: [x, y, z0], b: [x, y, z1], w: w, h: h, finish: 'hewn' }; };
  const shaft = function (id, room, x, z, y0, y1) { return { kind: 'shaft', id: id, joins: [room], c: [x, z], y0: y0, y1: y1, r0: 0.3, r1: 0.35 }; };

  if (!IX.PROGRAMS.brr_home) {
    IX.PROGRAMS.brr_home = { require: [{ need: 'table', types: ['table'], n: 1 }, { need: 'food', types: ['storage', 'vessel', 'stack'], roles: FOOD, n: 1 }],
      optional: [{ types: SEATS, max: 2 }, { types: ['storage', 'shelf', 'rack'], max: 2 }, { types: ['lamp'], max: 1 }, { types: ['rug'], max: 1 },
                 { types: ['art', 'banner'], max: 1 }, SURFACE],
      extra: 6 };
    IX.PROGRAMS.brr_cell = { require: [{ need: 'chest', types: ['storage'], roles: ITEM, n: 1 }, { need: 'food', types: ['storage', 'vessel', 'stack'], roles: FOOD, n: 1 }],
      optional: [{ types: SEATS, max: 1 }, { types: ['shelf', 'rack'], max: 1 }, { types: ['lamp'], max: 1 }, { types: ['rug'], max: 1 }, { types: ['art', 'banner'], max: 1 }, SURFACE],
      extra: 5 };
    IX.PROGRAMS.brr_roost = { require: [{ need: 'nest', types: ['bed'], n: 1 }, { need: 'feed', types: ['storage', 'vessel', 'stack'], n: 1 }],
      optional: [{ types: ['rack'], max: 2 }, { types: ['vessel', 'storage', 'stack'], max: 2 }, { types: ['lamp'], max: 1 }],
      extra: 9 };
    IX.PROGRAMS.brr_vault = { require: [{ need: 'chests', types: ['storage'], roles: ITEM, n: 2 }],
      optional: [{ types: ['storage'], roles: ITEM, max: 2 }, { types: ['rack', 'shelf'], max: 1 }, { types: ['lamp'], max: 1 }],
      extra: 3 };
    IX.PROGRAMS.brr_guard = { require: [{ need: 'rack', types: ['rack', 'weapon'], n: 1 }, { need: 'seat', types: SEATS, n: 1 }],
      optional: [{ types: ['table'], max: 1 }, { types: ['storage'], max: 1 }, { types: ['lamp', 'brazier'], max: 1 }, SURFACE],
      extra: 4 };
    IX.PROGRAMS.brr_cistern = { require: [{ need: 'water', types: ['vessel', 'storage', 'well'], n: 1 }],
      optional: [{ types: ['vessel', 'storage'], max: 2 }, { types: ['lamp'], max: 1 }],
      extra: 8 };
    IX.KIND_ALIAS.brr_home = ['living', 'hall', 'kitchen'];
    IX.KIND_ALIAS.brr_cell = ['bedroom', 'living'];
    IX.KIND_ALIAS.brr_roost = ['roost', 'stable'];
    IX.KIND_ALIAS.brr_vault = ['store'];
    IX.KIND_ALIAS.brr_guard = ['barracks', 'antechamber'];
    IX.KIND_ALIAS.brr_cistern = ['store', 'yard', 'kitchen'];
  }

  /* the depths the pieces declare (kits/beast-riders/src/55-br-rockcut.js variantDims) */
  const D = { fac: [3.0, 2.2, 2.8, 3.1, 3.1, 3.1, 2.3], room: [2.2, 2.8, 2.8, 3.0], shrine1: 2.6, cistern1: 4.3 };
  const items = [];

  /* ---------------- the room fronts (Mav's levels: lvlApt, lvlStore, lvlWork; and the flyers' roost cell) */
  (function () {
    let zf = front(D.room[0]);
    items.push({ key: 'br_bldg_rock_room_front', name: 'Rock-cut room front (variant 1: apartment)', wealth: 0.35, types: ['dwelling-single'], lot: [7.8, 2.2],
      rooms: [
        room('home', 'brr_home', -3.0, 3.0, zf, 4.2, 0.3, 2.8, [[-1.4, 1.1]], {
          windows: [{ at: [0.65, zf], w: 0.72, sill: 1.1, h: 0.9 }, { at: [2.25, zf], w: 0.72, sill: 1.1, h: 0.9 }],
          fixtures: [fx('hearth', 'hearth', 2.7, R3(zf - 2.6), 0.6, 1.1, { h: 0.9, shaft: [2.6, 4.4] }),
                     fx('bench', 'bench', -2.75, R3(zf - 2.6), 0.5, 1.8, { h: 0.45 }),
                     fx('niche', 'niche', 0.6, R3(zf - 4.05), 0.8, 0.3, { h: 1.6 })] }),
        room('sleep', 'brr_cell', -3.0, 1.0, R3(zf - 4.8), 2.8, 0.3, 2.3, [[-1.8, 0.9]], {
          fixtures: [fx('bed', 'bedshelf', -2.55, R3(zf - 6.3), 0.8, 1.9, { bed: 1, h: 0.45 }), fx('niche', 'niche', 0.75, R3(zf - 6.6), 0.3, 0.8, { h: 1.4 })] })],
      voids: [pass('door', ['home'], -1.4, 0.3, R3(zf + ROCK_T), zf, 1.1, 2.2), pass('back', ['home', 'sleep'], -1.8, 0.3, R3(zf - 4.2), R3(zf - 4.8), 0.9, 2.0),
        shaft('smoke', 'home', 2.7, R3(zf - 2.6), 1.2, 4.4)],
      note: 'the apartment behind its door: the main room (hearth on the right wall, its smoke shaft up through the rock to the vent on the face; a bench cut along the left wall), the sleeping cell behind it through 0.6 m of rock (its bed shelf cut)' });
    zf = front(D.room[1]);
    items.push({ key: 'br_bldg_rock_room_front#1', name: 'Rock-cut room front (variant 2: store)', wealth: 0.4, types: ['shop', 'store'], residence: false, lot: [7.8, 2.8],
      rooms: [
        room('store', 'store', -3.0, 3.0, zf, 4.0, 0.3, 3.2, [[-0.6, 2.5]], { ceil: 'flat', fixtures: [fx('shelf', 'bench', 0, R3(zf - 3.65), 4.0, 0.6, { h: 0.9 })] }),
        room('tally', 'study', -3.0, 0.0, R3(zf - 4.6), 2.4, 0.3, 2.4, [[-1.5, 0.9]], { ceil: 'flat' })],
      voids: [pass('door', ['store'], -0.6, 0.3, R3(zf + ROCK_T), zf, 2.5, 2.85), pass('back', ['store', 'tally'], -1.5, 0.3, R3(zf - 4.0), R3(zf - 4.6), 0.9, 2.0)],
      note: 'the store hall behind the double doors (a shelf of rock left along its back wall), the tally clerk\'s office behind it, as Mav\'s stores keep their clerk' });
    zf = front(D.room[2]);
    items.push({ key: 'br_bldg_rock_room_front#2', name: 'Rock-cut room front (variant 3: workshop)', wealth: 0.4, types: ['shop', 'dwelling-single'], lot: [7.8, 2.8],
      rooms: [
        room('work', 'workshop', -3.0, 3.0, zf, 4.5, 0.3, 3.4, [[-0.4, 3.4]], {
          fixtures: [fx('forge', 'hearth', 2.45, R3(zf - 0.7), 1.0, 0.7, { h: 1.0, shaft: [2.55, 4.0] }), fx('bench', 'bench', -0.3, R3(zf - 4.2), 2.4, 0.5, { h: 0.9 })] }),
        room('cell', 'brr_cell', -3.0, 0.5, R3(zf - 5.1), 2.8, 0.3, 2.3, [[-1.2, 0.9]], {
          fixtures: [fx('bed', 'bedshelf', -2.55, R3(zf - 6.6), 0.8, 1.9, { bed: 1, h: 0.45 })] })],
      voids: [pass('door', ['work'], -0.4, 0.3, R3(zf + ROCK_T), zf, 3.4, 2.9), pass('back', ['work', 'cell'], -1.2, 0.3, R3(zf - 4.5), R3(zf - 5.1), 0.9, 2.0),
        shaft('smoke', 'work', 2.45, R3(zf - 0.7), 1.4, 4.0)],
      note: 'live and work (Mav\'s workhome): the trade floor behind the open arch, its forge in the front corner under the smoke shaft that blackens the face, a bench cut along the back; the family\'s cell behind' });
    zf = front(D.room[3]);
    items.push({ key: 'br_bldg_rock_room_front#3', name: 'Rock-cut room front (variant 4: roost cell)', wealth: 0.35, types: ['infrastructure'], residence: false, lot: [7.8, 3.0],
      rooms: [room('roost', 'brr_roost', -3.0, 3.0, zf, 8.0, 0.3, 4.6, [[0, 4.0]], { rise: 1.0,
        fixtures: [fx('perch', 'perch', 0, R3(zf - 7.65), 5.0, 0.6, { h: 1.2 }), fx('niche', 'niche', -2.85, R3(zf - 4.0), 0.3, 1.2, { h: 1.8 })] })],
      voids: [pass('mouth', ['roost'], 0, 0.3, R3(zf + ROCK_T), zf, 4.05, 4.2)],
      note: 'a flyer\'s cell: one high vaulted room 8 m into the rock behind the tall arch (the beast lands on the lip and walks in), a perch ledge cut across the back, the keeper\'s niche; nobody lives in it' });
  })();

  /* ---------------- the gate-tree carvings re-cut (Mav's gtFacade's seven kinds) */
  (function () {
    let zf = front(D.fac[0]);
    items.push({ key: 'br_bldg_rock_facade', name: 'Rock-cut facade (variant 1: storehouse)', wealth: 0.4, types: ['industry', 'store'], residence: false, lot: [7.7, 3.0],
      rooms: [room('store', 'store', -3.6, 3.6, zf, 6.0, 0.3, 3.6, [[0, 2.8]], { rise: 0.6 })],
      voids: [pass('door', ['store'], 0, 0.3, R3(zf + ROCK_T), zf, 2.8, 3.0)],
      note: 'the carved storehouse: one vaulted hall behind the iron-banded doors, its hoist on the face above' });
    zf = front(D.fac[1]);
    items.push({ key: 'br_bldg_rock_facade#1', name: 'Rock-cut facade (variant 2: strongroom vault)', wealth: 0.5, types: ['store'], residence: false, lot: [5.3, 2.2],
      rooms: [room('vault', 'brr_vault', -1.8, 1.8, zf, 4.0, 0.3, 2.4, [[0, 1.15]], { ceil: 'flat', fixtures: [fx('shelf', 'bench', 0, R3(zf - 3.65), 3.0, 0.6, { h: 0.8 })] })],
      voids: [pass('door', ['vault'], 0, 0.3, R3(zf + ROCK_T), zf, 1.15, 1.75)],
      note: 'the strongroom behind the low banded door, a shelf of rock left along its back' });
    zf = front(D.fac[2]);
    items.push({ key: 'br_bldg_rock_facade#2', name: 'Rock-cut facade (variant 3: rock shrine)', wealth: 0.45, types: ['religious'], residence: false, lot: [6.3, 2.8],
      rooms: [room('shrine', 'shrine', -2.6, 2.6, zf, 7.0, 0.3, 4.0, [[0, 2.4]], { rise: 1.0,
        fixtures: [fx('altar', 'altar', 0, R3(zf - 6.3), 1.6, 0.8, { h: 1.0 }), fx('niche-l', 'niche', -2.45, R3(zf - 3.5), 0.3, 0.9, { h: 1.6 }), fx('niche-r', 'niche', 2.45, R3(zf - 3.5), 0.3, 0.9, { h: 1.6 })] })],
      voids: [pass('door', ['shrine'], 0, 0.3, R3(zf + ROCK_T), zf, 2.4, 3.5)],
      note: 'the trunk shrine re-cut: a vaulted room lit cool behind the open arch, an altar of the rock left standing at its back, lamp niches either side' });
    zf = front(D.fac[3]);
    const dv = -1.246;
    items.push({ key: 'br_bldg_rock_facade#3', name: 'Rock-cut facade (variant 4: dormitory)', wealth: 0.3, types: ['dwelling-multi'], lot: [8.3, 3.1],
      rooms: [
        room('dorm', 'dormitory', -3.6, 3.6, zf, 5.0, 0.3, 2.8, [[dv, 1.2]], { ceil: 'flat',
          fixtures: [fx('bed-l1', 'bedshelf', -3.15, R3(zf - 2.4), 0.8, 1.9, { bed: 1, h: 0.45 }), fx('bed-l2', 'bedshelf', -3.15, R3(zf - 4.4), 0.8, 1.9, { bed: 1, h: 0.45 }),
                     fx('bed-r1', 'bedshelf', 3.15, R3(zf - 2.4), 0.8, 1.9, { bed: 1, h: 0.45 }), fx('bed-r2', 'bedshelf', 3.15, R3(zf - 4.4), 0.8, 1.9, { bed: 1, h: 0.45 })] }),
        room('common', 'brr_home', -3.6, 1.6, R3(zf - 5.6), 3.6, 0.3, 2.6, [[-1.0, 1.0]], {
          fixtures: [fx('hearth', 'hearth', 1.25, R3(zf - 7.4), 0.6, 1.1, { h: 0.9, shaft: [2.85, 7.0] }), fx('bench', 'bench', -3.35, R3(zf - 7.4), 0.5, 1.8, { h: 0.45 })] })],
      voids: [pass('door', ['dorm'], dv, 0.3, R3(zf + ROCK_T), zf, 1.2, 2.15), pass('back', ['dorm', 'common'], -1.0, 0.3, R3(zf - 5.0), R3(zf - 5.6), 1.0, 2.0),
        shaft('smoke', 'common', 1.25, R3(zf - 7.4), 1.2, 7.0)],
      note: 'one household\'s dormitory (units 1): four bed shelves cut in the side walls of the sleeping hall, the common room with its hearth behind it; the rows of windows above on the face light storeys this item does not plan' });
    zf = front(D.fac[4]);
    items.push({ key: 'br_bldg_rock_facade#4', name: 'Rock-cut facade (variant 5: inn)', wealth: 0.45, types: ['inn', 'tavern'], residence: false, lot: [7.3, 3.1],
      rooms: [
        room('tap', 'tavern', -3.2, 3.2, zf, 6.0, 0.3, 3.0, [[0, 1.5]], {
          fixtures: [fx('hearth', 'hearth', 2.95, R3(zf - 1.6), 0.5, 1.1, { h: 0.9, shaft: [2.35, 5.6] }), fx('bench', 'bench', -2.95, R3(zf - 3.4), 0.5, 2.6, { h: 0.45 })] }),
        room('guest-l', 'brr_cell', -3.2, -0.4, R3(zf - 6.6), 2.6, 0.3, 2.3, [[-1.8, 0.9]], { fixtures: [fx('bed', 'bedshelf', -2.75, R3(zf - 8.0), 0.8, 1.9, { bed: 1, h: 0.45 })] }),
        room('guest-r', 'brr_cell', 0.4, 3.2, R3(zf - 6.6), 2.6, 0.3, 2.3, [[1.8, 0.9]], { fixtures: [fx('bed', 'bedshelf', 2.75, R3(zf - 8.0), 0.8, 1.9, { bed: 1, h: 0.45 })] })],
      voids: [pass('door', ['tap'], 0, 0.3, R3(zf + ROCK_T), zf, 1.5, 2.3), pass('back-l', ['tap', 'guest-l'], -1.8, 0.3, R3(zf - 6.0), R3(zf - 6.6), 0.9, 2.0),
        pass('back-r', ['tap', 'guest-r'], 1.8, 0.3, R3(zf - 6.0), R3(zf - 6.6), 0.9, 2.0), shaft('smoke', 'tap', 2.95, R3(zf - 1.6), 1.2, 5.6)],
      note: 'the ramp-side inn re-cut: the taproom behind the lit door (its hearth by the door, the smoke shaft up to the vent), two guest cells behind it' });
    zf = front(D.fac[5]);
    items.push({ key: 'br_bldg_rock_facade#5', name: 'Rock-cut facade (variant 6: Wing barracks)', wealth: 0.35, types: ['barracks'], residence: false, lot: [7.3, 3.1],
      rooms: [room('hall', 'barracks', -3.2, 3.2, zf, 7.0, 0.3, 3.0, [[0, 1.3]], {
        fixtures: [fx('bed-l1', 'bedshelf', -2.75, R3(zf - 2.6), 0.8, 1.9, { bed: 1, h: 0.45 }), fx('bed-l2', 'bedshelf', -2.75, R3(zf - 4.8), 0.8, 1.9, { bed: 1, h: 0.45 }),
                   fx('bed-r1', 'bedshelf', 2.75, R3(zf - 2.6), 0.8, 1.9, { bed: 1, h: 0.45 }), fx('bed-r2', 'bedshelf', 2.75, R3(zf - 4.8), 0.8, 1.9, { bed: 1, h: 0.45 })] })],
      voids: [pass('door', ['hall'], 0, 0.3, R3(zf + ROCK_T), zf, 1.3, 2.15)],
      note: 'a Wing\'s barracks: one vaulted hall, four bed shelves cut in its sides, the racks and bunks the placer brings between them' });
    zf = front(D.fac[6]);
    items.push({ key: 'br_bldg_rock_facade#6', name: 'Rock-cut facade (variant 7: guard post)', wealth: 0.3, types: ['military'], residence: false, lot: [5.1, 2.3],
      rooms: [room('guard', 'brr_guard', -1.7, 1.7, zf, 3.6, 0.3, 2.5, [[0, 2.0]], { ceil: 'flat', fixtures: [fx('bench', 'bench', 0, R3(zf - 3.3), 2.6, 0.5, { h: 0.45 })] })],
      voids: [pass('door', ['guard'], 0, 0.3, R3(zf + ROCK_T), zf, 2.0, 2.3)],
      note: 'the guard post\'s room behind its open doorway, a bench cut along the back' });
  })();

  /* ---------------- the shrine and the cistern */
  (function () {
    items.push({ key: 'br_bldg_rock_shrine', name: 'Rock-cut shrine (variant 1: wayside niche)', types: ['religious'], residence: false, lot: [3.6, 2.1],
      skip: 'a wayside niche: an idol in an arched niche over an altar block, 0.55 m deep; nothing to enter' });
    const zf = front(D.shrine1);
    items.push({ key: 'br_bldg_rock_shrine#1', name: 'Rock-cut shrine (variant 2: shrine front)', wealth: 0.55, types: ['religious'], residence: false, lot: [7.8, 2.6],
      rooms: [room('hall', 'shrine', -2.8, 2.8, zf, 8.0, 0.6, 4.2, [[0, 1.8]], { rise: 1.2,
        fixtures: [fx('altar', 'altar', 0, R3(zf - 7.2), 2.0, 0.9, { h: 1.0 }),
                   fx('bench-l', 'bench', -2.55, R3(zf - 4.0), 0.5, 3.2, { h: 0.45 }), fx('bench-r', 'bench', 2.55, R3(zf - 4.0), 0.5, 3.2, { h: 0.45 })] })],
      voids: [pass('door', ['hall'], 0, 0.6, R3(zf + ROCK_T), zf, 1.8, 3.0)],
      note: 'the shrine hall behind the lit door on its three steps: vaulted, benches cut along both sides, the altar left standing at the back' });
    items.push({ key: 'br_bldg_rock_cistern', name: 'Rock-cut cistern (variant 1: wall cistern)', types: ['infrastructure'], residence: false, lot: [6.7, 3.4],
      skip: 'the cistern\'s mouth is a low arch (1.6 m) over the water: drawn from outside with the sweep, nobody walks in' });
    const zc = front(D.cistern1);
    items.push({ key: 'br_bldg_rock_cistern#1', name: 'Rock-cut cistern (variant 2: stepped cistern)', wealth: 0.3, types: ['infrastructure'], residence: false, lot: [6.7, 4.3],
      rooms: [room('landing', 'brr_cistern', -2.2, 2.2, zc, 4.6, 0.25, 2.6, [[0, 3.5]], { rise: 0.8,
        fixtures: [fx('pool', 'pool', 0, R3(zc - 3.3), 4.0, 2.4, { h: 0.1 })] })],
      voids: [pass('mouth', ['landing'], 0, 0.25, R3(zc + ROCK_T), zc, 3.5, 2.5)],
      note: 'the chamber behind the great arch: a landing 1.9 m deep before the pool cut across its back (a fixture); the tank in front is outside' });
  })();

  /* ---------------- what has no room of its own */
  const SKIP = {
    br_bldg_rock_door: 'a door surround: the room behind it is the face\'s (a facade\'s or the world\'s), not the surround\'s',
    br_bldg_rock_window: 'a window cut in the face: it lights a room of the face it is cut in',
    br_bldg_rock_balcony: 'a ledge outside: its doors open on the rooms of the face it is cut in',
    br_bldg_rock_stair: 'a stair outside, cut in the face: its landing door opens on a room of the face',
    br_bldg_rock_cavern_door: 'the Deep Root cavern\'s door: the passage and the hall behind it are the cavern (Pinnacle Rock\'s KCAVERN), not this face',
    br_bldg_rock_tribe_niche: 'an offering niche in the passage of the tribes: dressing for a wall',
    br_bldg_rock_lamp_niche: 'a shrine\'s lamp niche in the cavern\'s wall: dressing for a wall',
    br_bldg_rock_offering_ledge: 'a ledge of offerings in the cavern\'s wall: dressing for a wall',
    br_bldg_rock_altar: 'the altar stone left standing against the cavern\'s wall: dressing for the hall'
  };
  Object.keys(SKIP).forEach(function (k) { items.push({ key: k, name: k.replace('br_bldg_rock_', 'Rock-cut ').replace(/_/g, ' '), types: [], residence: false, lot: [4, 2], skip: SKIP[k] }); });

  IX.sets.add({ set: 'beast-rider-rock', title: 'Beast Rider, rock-cut (Pinnacle Rock)', culture: 'beast-rider', wealth: 0.4, items: items });
})(KratorInteriors);
