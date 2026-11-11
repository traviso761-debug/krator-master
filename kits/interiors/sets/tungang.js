/* ======================== Interior set: the Tungangs' holds (kits/tungang) ========================
   The rooms of a Tungang hold (kits/tungang/PLAN.md section 3.2), one item per proposed def key (`tg_*`), poor to rich,
   civic, works, care, the dead, the shrine, war. A hold is a station on a line (PLAN.md 5.1): the items are the rooms the
   kit cuts off the platform and the sidings. Furniture: the `tungang` culture (kits/catalog/krator-master-furniture-
   tungang.js: 73 pieces), its chain ending in the generic set (`tungang -> generic`).

   THE FRAME. As kits/zeijani's carved defs: origin at the foot of the def's front, +z the front (the gallery, siding or
   platform it opens on), the rock behind it at -z, metres. Every room is CARVED (`carved: true`, `finish: 'hewn' |
   'plaster'`) unless it says otherwise (the carriage house's carriage, the shaft head's hut, the platform's bay of the
   Ancients' station), and squared: rectangular rooms and doors (PLAN.md 0.1, "what not to take").
   THE OUTLINE AND THE CUT (PLAN.md 0.1, Dhelv's lesson): a room's `poly` is the outline it is FURNISHED in; the cut is
   0.25 m outside it on every side, so a rounded or rough cut never puts a piece in the rock. `voids` (written by
   `cuts()` below) are those cuts, for the kit's carved-def layer (PLAN.md section 8, question 14) to carve: the void plan
   is the one source of the rooms. Two rooms of one def stand 0.5 to 1.0 m apart (a hewn partition, the doorway through
   it); the 0.8 m of rock Dhelv keeps between voids holds between defs, which the hold's layout spaces (core/city).
   THE SCALE: a hold is cut to its people, 0.94 of a human (PLAN.md 3.1): doorways about 1.95 m, rooms 2.4 to 2.6 m clear.
   The furniture is drawn at 0.94 where a page carries core/furnish/54-core-furnish-scale.js (the sets sheet does), the
   generic pieces a room falls back on too. The outlines here are already in the hold's measure.
   THE LAMP CODE AND THE DOOR DRESS (PLAN.md 1.2, 3.1: "every door on a gallery has its lamp of the code's colour, a
   stencilled number and a click-rib"): an item's `dress` is what the def puts on its front, in the item's frame (y above
   its ground), each a catalog piece drawn where it says and a record a host can export: the door lamp (variant = the
   code), the berth plate (seed = the number), the click-ribs, the enamel sign. A door lamp carries its LIGHT as a record
   (`light: { code, color, intensity, distance, hooded? }`): a host lights the nearest few (Dhelv's pool), Godot the same.
   Rooms are lit by wax light, never by the code (Dhelv: coloured light as the main light turns every surface to mud).
   WHY THE CATALOG, NOT core/sockets: core/sockets' packs dress a culture-neutral building with a culture's marks (swap the
   pack, the same building is Iziz or Voth) and draw through the Post-Apoc engine. A Tungang door's dress is not a swap: it
   says what the room is (red a home, amber work) and whose (the berth number), so it is data the def writes per door, and
   its pieces are catalog pieces any host draws through the catalog engine and the Godot export already carries. A
   `tungang` socket pack (the banner's colours and emblem for the kit's built fronts) is still owed to core/sockets when
   the kit's built defs want awnings and banners: it would join every page that vendors 80-cultures.js.
   FIXTURES with a catalog `key` (the count wall, the count lamps, the seals of the last stop) are structure the placer
   keeps off and the sheet draws (src-sets/70-sets.js); a fixture without one (the bath's pool) is only kept off.

   ROOM KINDS this set adds (data for IX.PROGRAMS, prefixed tg_ so they never meet another set's kinds):
     tg_berth    a berth gallery: bunks racked along it, a locker for each mess, a bait locker   (dormitory, barracks, bedroom)
     tg_cut      a cut off a gallery: one person's cell, a bunk, a foot locker, a bait locker    (cottage, bedroom, dormitory)
     tg_carriage a carriage's saloon: its kept seats, a trestle, the mash bin                   (living, hall, kitchen)
     tg_platform a bay of the Ancients' station: stalls, benches, the signal post                (market, hall)
     tg_loj      the loj hall: the banner, the minute chest; its order is fixtures: count wall, lamp row, desk, lectern, benches in rows (hall, court)
     tg_signal   the signal box: the lever frame, the steward's desk and a seat                 (study)
     tg_guard    a guard cut: a rack of pick-and-hooks, seats                                   (barracks, antechamber)
     tg_gear     the doors' gear room: the winding gear                                         (tg_guard)
     tg_lift     the lift head's machine room: the lift gear kept by rite, the winch            (shrine)
     tg_beds     the dark beds: glow-cap trays, the mat's sealed bed, an amber tending lamp     (farm, store)
     tg_fixers   the Fixers' shop: bench, tool wall, press, salvage bins                        (workshop)
     tg_wax      the wax house: the vat on the vent, the moulds                                 (workshop)
     tg_kiln     the gypsum kiln and its sacks                                                   (workshop)
     tg_bait     the bait room, the communal kitchen: the range, the mash, the packing trestle  (kitchen)
     tg_brew     the brew room: the urn, a trestle, seats                                        (kitchen, tavern)
     tg_cistern  the cistern's hatch and pump                                                    (store)
     tg_fan      the fan house: an Ancient fan kept turning                                      ()
     tg_bath     the bath (the Hearth hold's): the wash trough, a bench, the peg wall; the pool is a fixture (bath)
     tg_pens     the leaper pens                                                                 (stable)
     tg_stoke    the stoke room, the infirmary: cots, the steward's stoke cabinet               (bedroom)
     tg_last     the last stop: the last lamps; the seals are fixtures                           (shrine)
     tg_cleft    a crystal cleft: the rail across it                                             (shrine)
     tg_vein     a vein working: an ore tub, a rack of picks                                     (store)
     tg_ore      the ore store: sorted bins, a tub                                               (store)
     tg_refinery the rare-earth batch room: the batch bench, shelves                            (workshop)
     tg_power    the power hall: the turn rota, the cell rack, a lever frame                    ()
     tg_shaft    a shaft's foot or head: the ice hoist, ice in coal moss                         (store)
   The households use the shared kinds (living, bedroom, kitchen, store, shrine, cottage).
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const SEATS = IX.SEAT_TYPES, ITEM = IX.ITEM_ROLES, FOOD = IX.FOOD_ROLES, SURFACE = IX.SURFACE_GROUP;
  const HOME = ['single-family dwelling'], MULTI = ['multi-family dwelling'];
  const CUT = 0.25, S = 0.94;

  /* ---------------- the room kinds */
  if (!IX.PROGRAMS.tg_berth) {
    const P = IX.PROGRAMS, A = IX.KIND_ALIAS;
    P.tg_berth = { require: [{ need: 'bunks', types: ['bed'], roles: ['bunk'], n: 3 }, { need: 'lockers', types: ['storage'], roles: ITEM, n: 2 },
                             { need: 'bait', types: ['storage', 'vessel', 'stack'], roles: FOOD, anchors: ['floor', 'wall'], n: 2 }],
      optional: [{ types: ['bed'], max: 3 }, { types: ['rack'], max: 2 }, { types: ['vessel'], max: 1 }, { types: ['lamp'], max: 2 }, { types: SEATS, max: 2 }],
      extra: 5 };
    P.tg_cut = { require: [{ need: 'bunk', types: ['bed'], n: 1 }, { need: 'locker', types: ['storage'], roles: ITEM, n: 1 },
                           { need: 'bait', types: ['storage', 'vessel', 'stack'], roles: FOOD, anchors: ['floor', 'wall'], n: 1 }],
      optional: [{ types: ['lamp'], max: 1 }, { types: ['rack'], max: 1 }, { types: ['chair'], max: 1 }, SURFACE],
      extra: 4 };
    P.tg_carriage = { require: [{ need: 'seats', types: ['seating'], n: 2 }, { need: 'table', types: ['table'], n: 1 },
                                { need: 'food', types: ['storage', 'vessel', 'stack'], roles: FOOD, n: 1 }],
      optional: [{ types: ['stove'], max: 1 }, { types: ['storage'], max: 1 }, { types: ['lamp'], max: 2 }, { types: ['banner', 'art'], max: 2 }, SURFACE],
      extra: 4 };
    P.tg_platform = { require: [{ need: 'stalls', types: ['stall'], n: 2 }, { need: 'benches', types: SEATS, n: 2 }, { need: 'signal', types: ['lamp'], n: 1 }],
      optional: [{ types: ['stall'], max: 1 }, { types: ['art'], max: 3 }, { types: ['vessel'], max: 2 }, { types: ['lamp'], max: 2 }, { types: SEATS, max: 2 }],
      extra: 9 };
    P.tg_loj = { require: [{ need: 'the banner', types: ['banner'], n: 1 }, { need: 'the minute chest', types: ['storage'], roles: ITEM, n: 1 }],
      optional: [{ types: ['banner'], max: 1 }, { types: ['chair'], max: 1 }, { types: ['art'], max: 3 }, { types: ['shrine'], max: 1 }, { types: ['board'], max: 1 }],
      extra: 7 };
    P.tg_signal = { require: [{ need: 'levers', types: ['workstation'], roles: ['levers'], n: 1 }, { need: 'desk', types: ['desk'], n: 1 }, { need: 'seat', types: ['chair'], n: 1 }],
      optional: [{ types: ['storage', 'shelf'], max: 1 }, { types: ['board', 'art'], max: 2 }, { types: ['lamp'], max: 1 }, SURFACE],
      extra: 5 };
    P.tg_guard = { require: [{ need: 'rack', types: ['rack', 'weapon'], n: 1 }, { need: 'seats', types: SEATS, n: 2 }],
      optional: [{ types: ['storage'], max: 1 }, { types: ['vessel'], max: 1 }, { types: ['board', 'art'], max: 2 }, { types: ['lamp'], max: 1 }, { types: ['table'], max: 1 }, SURFACE],
      extra: 4 };
    P.tg_gear = { require: [{ need: 'gear', types: ['workstation'], roles: ['winch'], n: 1 }],
      optional: [{ types: ['rack'], max: 1 }, { types: ['board'], max: 1 }, { types: ['lamp'], max: 1 }], extra: 5 };
    P.tg_lift = { require: [{ need: 'the lift gear', types: ['shrine'], roles: ['lift_gear'], n: 1 }, { need: 'winch', types: ['workstation'], roles: ['winch'], n: 1 }],
      optional: [{ types: ['workstation'], roles: ['levers'], max: 1 }, { types: ['art', 'board'], max: 2 }, { types: ['bench'], max: 1 }, { types: ['lamp'], max: 1 }],
      extra: 6 };
    P.tg_beds = { require: [{ need: 'trays', types: ['rack'], roles: ['spawn_rack'], n: 6 }, { need: 'the mat', types: ['vessel'], roles: ['mat_bed'], n: 2 },
                            { need: 'amber lamp', types: ['lamp'], roles: ['tending_lamp'], n: 1 }],
      optional: [{ types: ['vessel'], max: 2 }, { types: ['lamp'], max: 1 }],
      extra: 4 };
    P.tg_fixers = { require: [{ need: 'bench', types: ['workstation'], roles: ['workbench'], n: 1 }, { need: 'tool wall', types: ['rack'], n: 1 },
                              { need: 'press', types: ['workstation'], roles: ['press'], n: 1 }, { need: 'bins', types: ['stack'], roles: ['parts_bins'], n: 1 }],
      optional: [{ types: ['storage', 'shelf'], max: 2 }, { types: ['board'], max: 1 }, { types: ['chair'], max: 1 }, { types: ['lamp'], max: 1 }, SURFACE],
      extra: 6 };
    P.tg_wax = { require: [{ need: 'vat', types: ['workstation'], roles: ['vat'], n: 1 }, { need: 'moulds', types: ['workstation'], roles: ['moulds'], n: 1 }],
      optional: [{ types: ['shelf', 'storage'], max: 2 }, { types: ['workstation'], roles: ['press'], max: 1 }, { types: ['lamp'], max: 1 }, SURFACE],
      extra: 6 };
    P.tg_kiln = { require: [{ need: 'kiln', types: ['stove'], roles: ['kiln'], n: 1 }, { need: 'sacks', types: ['stack'], roles: ['plaster'], n: 1 }],
      optional: [{ types: ['stack'], roles: ['plaster'], max: 1 }, { types: ['rack'], max: 1 }, { types: ['lamp'], max: 1 }], extra: 6 };
    P.tg_bait = { require: [{ need: 'range', types: ['stove'], n: 1 }, { need: 'mash', types: ['storage', 'vessel', 'stack'], roles: FOOD, n: 1 }, { need: 'packing', types: ['table'], n: 1 }],
      optional: [{ types: ['shelf', 'storage', 'stack'], max: 2 }, { types: SEATS, max: 2 }, { types: ['vessel'], max: 1 }, SURFACE, SURFACE],
      extra: 5 };
    P.tg_brew = { require: [{ need: 'urn', types: ['vessel'], roles: ['urn'], n: 1 }, { need: 'table', types: ['table'], n: 1 }, { need: 'seats', types: SEATS, n: 2 }],
      optional: [{ types: ['shelf'], max: 1 }, { types: SEATS, max: 3 }, { types: ['art'], max: 1 }, { types: ['table'], max: 1 }, SURFACE],
      extra: 5 };
    P.tg_cistern = { require: [{ need: 'water', types: ['well'], roles: ['well'], n: 1 }],
      optional: [{ types: ['vessel'], max: 2 }, { types: ['bench'], max: 1 }, { types: ['lamp'], max: 1 }], extra: 6 };
    P.tg_fan = { require: [{ need: 'the fan', types: ['workstation'], roles: ['fan'], n: 1 }],
      optional: [{ types: ['rack'], max: 1 }, { types: ['board'], max: 1 }, { types: ['lamp'], max: 1 }, { types: ['bench'], max: 1 }], extra: 6 };
    P.tg_bath = { require: [{ need: 'wash trough', types: ['vessel'], roles: ['washbasin'], n: 1 }, { need: 'bench', types: ['bench'], n: 1 }, { need: 'pegs', types: ['rack'], n: 1 }],
      optional: [{ types: ['storage'], max: 1 }, { types: ['vessel'], max: 1 }, { types: ['lamp'], max: 1 }], extra: 6 };
    P.tg_pens = { require: [{ need: 'pens', types: ['pen'], roles: ['stall'], n: 2 }],
      optional: [{ types: ['storage', 'vessel'], max: 2 }, { types: ['lamp'], max: 1 }], extra: 8 };
    P.tg_stoke = { require: [{ need: 'cots', types: ['bed'], roles: ['cot'], n: 2 }, { need: 'the stoke', types: ['storage'], roles: ['stoke'], n: 1 }],
      optional: [{ types: ['bed'], max: 1 }, { types: ['vessel'], max: 1 }, { types: ['chair'], max: 1 }, { types: ['lamp'], max: 1 }, { types: ['shelf'], max: 1 }],
      extra: 5 };
    P.tg_last = { require: [{ need: 'last lamps', types: ['lamp'], roles: ['last_lamp'], n: 2 }],
      optional: [{ types: ['lamp'], roles: ['last_lamp'], max: 3 }, { types: ['shrine'], max: 1 }, { types: ['bench'], max: 1 }], extra: 3 };
    P.tg_cleft = { require: [{ need: 'the rail', types: ['shrine'], roles: ['cleft_rail'], n: 1 }],
      optional: [{ types: ['lamp'], max: 2 }], extra: 4 };
    P.tg_vein = { require: [{ need: 'tub', types: ['stack'], roles: ['ore'], n: 1 }, { need: 'picks', types: ['rack'], roles: ['tool_rack'], n: 1 }],
      optional: [{ types: ['lamp'], max: 1 }, { types: ['chair'], max: 1 }, { types: ['stack'], roles: ['ore'], max: 1 }], extra: 6 };
    P.tg_ore = { require: [{ need: 'bins', types: ['storage'], roles: ['ore_bins'], n: 1 }, { need: 'tubs', types: ['stack'], roles: ['ore'], n: 1 }],
      optional: [{ types: ['stack', 'shelf', 'rack'], max: 2 }, { types: ['lamp'], max: 1 }], extra: 5 };
    P.tg_refinery = { require: [{ need: 'batch bench', types: ['workstation'], roles: ['retort'], n: 1 }, { need: 'shelves', types: ['shelf'], n: 1 }],
      optional: [{ types: ['storage'], max: 2 }, { types: ['workstation'], max: 1 }, { types: ['lamp'], max: 1 }, SURFACE], extra: 5 };
    P.tg_power = { require: [{ need: 'rota', types: ['board'], n: 1 }, { need: 'cells', types: ['storage'], roles: ['cells'], n: 1 },
                             { need: 'levers', types: ['workstation'], roles: ['levers'], n: 1 }],
      optional: [{ types: ['banner', 'art'], max: 3 }, { types: ['workstation'], max: 2 }, { types: ['bench'], max: 1 }, { types: ['shrine'], max: 1 }, { types: ['lamp'], max: 1 }],
      extra: 8 };
    P.tg_shaft = { require: [{ need: 'hoist', types: ['workstation'], roles: ['winch'], n: 1 }, { need: 'ice', types: ['stack'], roles: ['cold'], n: 1 }],
      optional: [{ types: ['rack'], max: 1 }, { types: ['stack'], max: 1 }, { types: ['lamp'], max: 1 }, { types: ['bench'], max: 1 }], extra: 5 };
    A.tg_berth = ['dormitory', 'barracks', 'bedroom']; A.tg_cut = ['cottage', 'bedroom', 'dormitory']; A.tg_carriage = ['living', 'hall', 'kitchen'];
    A.tg_platform = ['market', 'hall']; A.tg_loj = ['hall', 'court']; A.tg_signal = ['study']; A.tg_guard = ['barracks', 'antechamber']; A.tg_gear = ['tg_guard'];
    A.tg_lift = ['shrine']; A.tg_beds = ['farm', 'store']; A.tg_fixers = ['workshop']; A.tg_wax = ['workshop']; A.tg_kiln = ['workshop'];
    A.tg_bait = ['kitchen']; A.tg_brew = ['kitchen', 'tavern']; A.tg_cistern = ['store']; A.tg_bath = ['bath']; A.tg_pens = ['stable'];
    A.tg_stoke = ['bedroom']; A.tg_last = ['shrine']; A.tg_cleft = ['shrine']; A.tg_vein = ['store']; A.tg_ore = ['store']; A.tg_refinery = ['workshop'];
    A.tg_shaft = ['store'];
    Object.assign(IX.KIND_WEIGHT, { tg_berth: 1.8, tg_cut: 1.0, tg_carriage: 1.6, tg_platform: 3.0, tg_loj: 2.4, tg_signal: 1.0, tg_guard: 1.0, tg_gear: 0.8,
      tg_lift: 1.4, tg_beds: 1.8, tg_fixers: 1.6, tg_wax: 1.4, tg_kiln: 1.4, tg_bait: 1.4, tg_brew: 1.4, tg_cistern: 1.2, tg_fan: 1.2, tg_bath: 1.6,
      tg_pens: 1.8, tg_stoke: 1.4, tg_last: 1.6, tg_cleft: 1.0, tg_vein: 1.4, tg_ore: 1.2, tg_refinery: 1.2, tg_power: 2.4, tg_shaft: 1.4 });
  }
  if (!IX.CULTURE_FAMILY.tungang) IX.CULTURE_FAMILY.tungang = ['generic'];

  /* ---------------- the lamp code and the door dress (PLAN.md 1.2): variant of tungang_common_door_lamp, the light it gives */
  const CODE = {
    home:    { v: 0, color: 0xd8402c, intensity: 0.35, distance: 3.0 },    /* red: a dim red keeps dark-sight */
    line:    { v: 1, color: 0x58d070, intensity: 0.5, distance: 5.0 },     /* green: the galleries, the platforms, the way */
    work:    { v: 2, color: 0xf0a030, intensity: 0.55, distance: 4.5 },    /* amber: the dark beds, the workshops */
    passage: { v: 3, color: 0x9fe8c0, intensity: 0.3, distance: 3.5 },     /* glow-cap: the common light of passages and the poor */
    danger:  { v: 4, color: 0xf4f0e0, intensity: 0.9, distance: 7.0, hooded: true }   /* white: the surface, danger; hooded at once */
  };
  /* the dress of a front door at [x, z] (the room's front edge, +z out), w wide, h high: the face is the cut, CUT m out.
     o: { code, number (the berth plate's seed), plate (0 cream on red, 1 red on cream, 2 cream on green: the siding's livery),
          ribs (0 plates, 1 grooves, null none), sign (an enamel sign variant over the door, null none), side (+1 lamp right) } */
  function dressDoor(at, w, h, o) {
    o = o || {};
    const c = CODE[o.code || 'home'], zf = at[1] + CUT, side = o.side == null ? 1 : o.side, out = [];
    const lampX = at[0] + side * (w / 2 + 0.3), plateX = at[0] - side * (w / 2 + 0.28);
    out.push({ key: 'tungang_common_door_lamp', variant: c.v, seed: 1, x: lampX, y: Math.min(h + 0.05, 1.95), z: zf + 0.12 * S, ry: 0,
      light: { code: o.code || 'home', color: c.color, intensity: c.intensity, distance: c.distance, hooded: !!c.hooded, x: lampX, y: Math.min(h + 0.05, 1.95) + 0.2, z: zf + 0.25 } });
    if (o.number != null) out.push({ key: 'tungang_poor_berth_plate', variant: o.plate == null ? 0 : o.plate, seed: o.number, x: plateX, y: 1.4, z: zf + 0.015 * S, ry: 0 });
    if (o.ribs != null) out.push({ key: 'tungang_common_click_ribs', variant: o.ribs, seed: 1, x: at[0] - side * (w / 2 + (o.number != null ? 0.95 : 0.7)), y: 0.05, z: zf + 0.05 * S, ry: 0 });
    if (o.sign != null) out.push({ key: 'tungang_common_enamel_sign', variant: o.sign, seed: 1, x: at[0], y: h + 0.12, z: zf + 0.015 * S, ry: 0 });
    return out;
  }
  /* the cuts of the carved rooms: each furnished outline grown by CUT (rectangles; a room with its own `cut` keeps it) */
  function cuts(rooms) {
    return rooms.filter(function (r) { return r.carved; }).map(function (r) {
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      r.poly.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); });
      return { kind: 'room', id: r.id, poly: r.cut || [[x0 - CUT, z0 - CUT], [x1 + CUT, z0 - CUT], [x1 + CUT, z1 + CUT], [x0 - CUT, z1 + CUT]],
        y0: r.y == null ? 0 : r.y, y1: (r.y == null ? 0 : r.y) + r.h, finish: r.finish || 'hewn' };
    });
  }
  /* a carved room: w x d centred at (cx, cz), its outline the furnished one */
  function cr(id, kind, w, d, cx, cz, h, doors, o) {
    return Object.assign({ id: id, kind: kind, carved: true, finish: 'hewn', poly: rect(w, d, cx, cz), y: 0, h: h, doors: doors }, o || {});
  }
  /* a fixture the sheet draws through the catalog: a wall piece backed onto the wall at z = zb (its front +z when ry = 0) */
  function fxKey(id, key, x, z, ry, w, d, o) { return Object.assign({ id: id, kind: 'piece', key: key, x: x, z: z, ry: ry || 0, w: w, d: d, reach: false }, o || {}); }
  /* an item with its voids written from its rooms */
  function item(o) { if (o.rooms && !o.voids) o.voids = cuts(o.rooms); return o; }

  /* ring house: the outline inside lining segments stood on end, curved long walls of Ancient concrete and plate ends */
  function ringHouse(w, d, bulge) {
    const out = [], n = 8, hw = w / 2, hd = d / 2;
    out.push([-hw, -hd], [hw, -hd]);
    for (let i = 1; i < n; i++) { const t = i / n, z = -hd + d * t; out.push([hw + bulge * Math.sin(Math.PI * t), z]); }
    out.push([hw, hd], [-hw, hd]);
    for (let i = 1; i < n; i++) { const t = i / n, z = hd - d * t; out.push([-hw - bulge * Math.sin(Math.PI * t), z]); }
    return out;
  }

  /* the loj hall: the count wall on the back wall behind the steward, the lamp row along the front wall behind the benches,
     throwing every raised hand onto it (PLAN.md 1.2, "the meeting"). The meeting's order is the hall's structure, so it is
     written here, not left to the placer: the steward's desk before the count wall (its brass STOORD plate to the benches),
     the Book's lectern beside it (the reader faces the meeting), the benches in rows facing them (the raked rows: the kit
     raises the floor under them), rows x perRow, 1.4 m apart */
  function lojHall(w, d, h, rows, perRow) {
    const hz = d / 2, bw = 2.6 * S, gap = perRow === 3 ? 1.3 : 0.6, fx = [
      fxKey('countwall', 'tungang_court_count_wall', 0, -hz + 0.05 * S, 0, 5.0 * S, 0.1 * S, { h: 3.0 * S, y: 0.12 }),
      fxKey('countlamps', 'tungang_common_count_lamps', 0, hz - 0.15 * S - 0.02, Math.PI, 4.0 * S, 0.3 * S, { h: 0.4 * S }),
      fxKey('desk', 'tungang_court_steward_desk', 0, -hz + 1.45, 0, 1.6 * S, 0.8 * S, { h: 1.0 * S }),
      fxKey('lectern', 'tungang_court_book_lectern', -2.0, -hz + 1.5, Math.PI, 0.8 * S, 0.7 * S, { h: 1.5 * S })];
    for (let r = 0; r < rows; r++) for (let k = 0; k < perRow; k++) {
      const x = (k - (perRow - 1) / 2) * (bw + gap), z = -hz + 3.1 + r * 1.4;
      fx.push(fxKey('bench' + r + '_' + k, 'tungang_court_meeting_bench', x, z, Math.PI, bw, 0.6 * S, { h: 0.95 * S, seed: r * perRow + k + 1 }));
    }
    return [cr('hall', 'tg_loj', w, d, 0, 0, h,
      [{ at: [-w / 2 + 1.0, hz], w: 1.2, swing: 'none' }, { at: [w / 2 - 1.0, hz], w: 1.2, swing: 'none' }],
      { finish: 'plaster', fixtures: fx })];
  }

  IX.TGDRESS = { CODE: CODE, dressDoor: dressDoor, cuts: cuts, CUT: CUT };

  IX.sets.add({ set: 'tungang', title: 'The Tungangs\' holds: rooms poor to rich, civic, works (kits/tungang)', culture: 'tungang', wealth: 0.4, items: [
    /* ---------------- homes: poor */
    item({ key: 'tg_berth_gallery', name: 'Berth gallery', wealth: 0.2, types: MULTI, units: 2, lot: [14, 6],
      rooms: [cr('gallery', 'tg_berth', 12.0, 2.6, 0, 0, 2.5,
        [{ at: [-6.0, 0], w: 1.2, swing: 'none' }, { at: [6.0, 0], w: 1.2, swing: 'none' }, { at: [0, 1.3], w: 1.4, swing: 'none' }])],
      dress: dressDoor([0, 1.3], 1.4, 2.0, { code: 'passage', ribs: 0, sign: 0 }),
      note: 'a side gallery racked with bunks (a berth is a person\'s whole home); two messes, each with its lockers and bait locker; open at both ends and onto the siding' }),
    item({ key: 'tg_cut', name: 'A cut off the gallery', wealth: 0.15, types: HOME, lot: [6, 6],
      rooms: [cr('cut', 'tg_cut', 2.4, 2.9, 0, 0, 2.4, [{ at: [0, 1.45], w: 0.9, swing: 'none' }])],
      dress: dressDoor([0, 1.45], 0.9, 1.95, { code: 'home', number: 14, plate: 0 }),
      note: 'one hewn cell (the cut 2.9 x 3.4, a little over PLAN.md\'s 2.5 x 3 so a bunk, a locker and the bait locker stand with a way between), a curtain door, the red lamp at the door' }),
    /* ---------------- homes: common */
    item({ key: 'tg_set', name: 'A household\'s set', wealth: 0.5, types: HOME, lot: [12, 10],
      rooms: [
        cr('hearth', 'living', 3.8, 3.2, 0, 0, 2.45, [{ at: [0, 1.6], w: 1.0, swing: 'none' },
          { id: 'sl', at: [-2.4, -0.6], w: 0.85, to: '.sleep', swing: 'none' }, { id: 'st', at: [0.9, -2.1], w: 0.8, to: '.store', swing: 'none' }], { finish: 'plaster' }),
        cr('sleep', 'bedroom', 2.8, 3.2, -4.3, -0.6, 2.4, [{ id: 'sl', at: [-2.4, -0.6], w: 0.85, to: '.hearth', swing: 'none' }]),
        cr('store', 'store', 2.2, 1.8, 0.9, -3.5, 2.3, [{ id: 'st', at: [0.9, -2.1], w: 0.8, to: '.hearth', swing: 'none' }])],
      dress: dressDoor([0, 1.6], 1.0, 1.95, { code: 'home', number: 31, plate: 0, ribs: 1 }),
      note: 'the hearth room (drum stove, trestle), the sleeping room (box beds behind curtains), a store; the doorway plastered white with the household\'s berth numbers' }),
    { key: 'tg_set_worn', name: 'A household\'s set (worn: the old end of the hold)', like: 'tg_set', wealth: 0.25,
      dress: dressDoor([0, 1.6], 1.0, 1.95, { code: 'home', number: 7, plate: 1 }) },
    item({ key: 'tg_ring_house', name: 'Ring house in the lining segments', wealth: 0.45, types: HOME, lot: [9, 7],
      rooms: [{ id: 'ring', kind: 'cottage', poly: ringHouse(4.2, 3.4, 0.55), y: 0, h: 2.6, doors: [{ at: [0, 1.7], w: 0.95 }],
        note: 'not carved: built in a wide gallery or a collapse inside two segments stood on end' }],
      voids: [],
      dress: dressDoor([0, 1.7], 0.95, 1.95, { code: 'home', number: 52, plate: 2 }),
      note: 'one room inside two lining segments stood on end: curved walls of Ancient concrete, plate ends, a door from a carriage' }),
    /* ---------------- homes: rich */
    item({ key: 'tg_carriage_house', name: 'Carriage house on a siding', wealth: 0.8, types: HOME, lot: [16, 10],
      rooms: [
        { id: 'saloon', kind: 'tg_carriage', poly: rect(7.0, 2.3, -2.6, 0), y: 0.95, h: 2.05,
          doors: [{ at: [-4.0, 1.15], w: 0.8, swing: 'none' }, { id: 'p', at: [0.95, 0], w: 0.7, to: '.sleeper' }, { id: 'k', at: [-2.6, -1.35], w: 0.75, to: '.galley', swing: 'none' }] },
        { id: 'sleeper', kind: 'bedroom', poly: rect(4.6, 2.3, 3.4, 0), y: 0.95, h: 2.05,
          doors: [{ id: 'p', at: [0.95, 0], w: 0.7, to: '.saloon', swing: 'out', leaf: false }] },
        cr('galley', 'kitchen', 3.0, 2.4, -2.6, -2.75, 2.4, [{ id: 'k', at: [-2.6, -1.35], w: 0.75, to: '.saloon', swing: 'none' }], { y: 0.95 })],
      voids: [{ kind: 'room', id: 'galley', poly: rect(3.5, 2.9, -2.6, -2.75), y0: 0.95, y1: 3.35, finish: 'hewn' }],
      dress: dressDoor([-4.0, 1.37 - CUT], 0.8, 2.6, { code: 'home', number: 3, plate: 2, ribs: 0 }),   /* the carriage's side, 0.22 m out */
      note: 'a Line carriage drawn into a siding (kits/motor-vehicles\' ancient cars, the kept state): its floor 0.95 m up, the saloon with its seats kept, the sleeping end behind the old partition; a cut room behind for the stove, reached through the carriage\'s far door. The carriage is the kit\'s; its windows plated' }),
    item({ key: 'tg_foremans_set', name: 'The foreman\'s set', wealth: 0.85, types: HOME, lot: [16, 13],
      rooms: [
        cr('living', 'living', 4.4, 3.6, 0, 0, 2.6, [{ at: [0, 1.8], w: 1.1 },
          { id: 'k', at: [-2.45, 0], w: 0.85, to: '.kitchen', swing: 'none' }, { id: 's', at: [2.45, 0.8], w: 0.8, to: '.store', swing: 'none' },
          { id: 'sh', at: [0, -2.05], w: 0.85, to: '.shrine', swing: 'none' }], { finish: 'plaster' }),
        cr('kitchen', 'kitchen', 3.2, 3.6, -4.3, 0, 2.45, [{ id: 'k', at: [-2.45, 0], w: 0.85, to: '.living', swing: 'none' }, { id: 'b1', at: [-4.3, -2.05], w: 0.85, to: '.bed1', swing: 'none' }]),
        cr('store', 'store', 2.6, 2.6, 4.0, 0.5, 2.4, [{ id: 's', at: [2.45, 0.8], w: 0.8, to: '.living', swing: 'none' }, { id: 'b2', at: [4.0, -1.05], w: 0.8, to: '.bed2', swing: 'none' }]),
        cr('shrine', 'shrine', 2.4, 2.2, 0, -3.4, 2.45, [{ id: 'sh', at: [0, -2.05], w: 0.85, to: '.living', swing: 'none' }], { finish: 'plaster' }),
        cr('bed1', 'bedroom', 3.2, 3.0, -4.3, -3.8, 2.45, [{ id: 'b1', at: [-4.3, -2.05], w: 0.85, to: '.kitchen', swing: 'none' }]),
        cr('bed2', 'bedroom', 3.4, 3.0, 4.5, -2.8, 2.45, [{ id: 'b2', at: [4.0, -1.05], w: 0.8, to: '.store', swing: 'none' }])],
      dress: dressDoor([0, 1.8], 1.1, 2.0, { code: 'home', number: 1, plate: 0, ribs: 1, sign: 0 }),
      note: 'six rooms: the living room (a floor of enamel signs when it is rich enough), its own lamp shrine (the turn lamps), the kitchen, a store, two sleeping rooms with enamel lockers' }),
    /* ---------------- civic */
    item({ key: 'tg_platform', name: 'The platform: a bay of the Ancients\' station', wealth: 0.55, types: ['market', 'infrastructure'], lot: [22, 9],
      rooms: [{ id: 'bay', kind: 'tg_platform', poly: rect(20, 6, 0, 0), y: 0, h: 4.5, finish: 'concrete',
        doors: [{ at: [-10, 0], w: 3.0, swing: 'none' }, { at: [10, 0], w: 3.0, swing: 'none' },
                { at: [-6, 3], w: 3.0, swing: 'none' }, { at: [0, 3], w: 3.0, swing: 'none' }, { at: [6, 3], w: 3.0, swing: 'none' }] }],
      voids: [],
      note: 'one 20 m bay of the Ancients\' station (the Line\'s biome draws the station, its vault and its four tracks: biomes/line); the track edge (+z) is open along its length (the three wide openings keep it clear). The hold\'s street, market and parade ground: stalls in the bays, benches, the signal post, the green lamps on the vault (the Line\'s)' }),
    item({ key: 'tg_loj_hall', name: 'The loj hall', wealth: 0.75, types: ['civic'], lot: [13, 10], rooms: lojHall(11, 8, 3.8, 3, 2),
      dress: dressDoor([-4.5, 4.0], 1.2, 2.2, { code: 'line', ribs: 0, sign: 0 }).concat(dressDoor([4.5, 4.0], 1.2, 2.2, { code: 'line', side: -1 })),
      note: 'the meeting: the count wall (a fixture) on the back wall behind the steward, ruled in squares; its lamp row (a fixture) along the front wall behind the benches; the steward\'s desk, the Book\'s lectern and the benches in rows are fixtures too, drawn flat (the rake is the kit\'s floor); the banner, the minute chest, the minutes on enamel' }),
    { key: 'tg_loj_hall_small', name: 'The loj hall (a small hold\'s)', wealth: 0.35, types: ['civic'], lot: [10, 8], rooms: lojHall(8, 6.4, 3.4, 2, 2), voids: cuts(lojHall(8, 6.4, 3.4, 2, 2)),
      dress: dressDoor([-3.0, 3.2], 1.2, 2.2, { code: 'line', ribs: 1 }) },
    { key: 'tg_loj_hall_tpresden', name: 'The loj hall (the Tpresden\'s)', wealth: 0.92, types: ['civic'], lot: [15, 11], rooms: lojHall(13, 9, 4.2, 3, 3), voids: cuts(lojHall(13, 9, 4.2, 3, 3)),
      dress: dressDoor([-5.5, 4.5], 1.2, 2.2, { code: 'line', ribs: 0, sign: 0 }).concat(dressDoor([5.5, 4.5], 1.2, 2.2, { code: 'line', side: -1, ribs: 0 })),
      note: 'the Tpresden\'s chair (a carriage seat from the Line on its dais) when the hold is the Tpresden\'s' },
    item({ key: 'tg_signal_box', name: 'The signal box', wealth: 0.65, types: ['civic'], lot: [7, 6],
      rooms: [cr('box', 'tg_signal', 4.2, 3.0, 0, 0, 2.5, [{ at: [-1.2, 1.5], w: 0.85 }], { finish: 'plaster' })],
      dress: dressDoor([-1.2, 1.5], 0.85, 1.95, { code: 'line', ribs: 1, side: -1 }),
      note: 'the steward\'s office: the old signal cabin over the platform, or a cut room called so; the lever frame kept polished, the steward\'s desk' }),
    item({ key: 'tg_doors', name: 'The doors: guard cut and gear room', wealth: 0.5, types: ['civic', 'infrastructure'], lot: [11, 7],
      rooms: [
        cr('guard', 'tg_guard', 3.4, 3.0, -2.3, 0, 2.4, [{ at: [-2.3, 1.5], w: 0.9, swing: 'none' }, { id: 'g', at: [-0.1, 0], w: 0.8, to: '.gear', swing: 'none' }]),
        cr('gear', 'tg_gear', 3.6, 3.0, 2.2, 0, 2.6, [{ id: 'g', at: [-0.1, 0], w: 0.8, to: '.guard', swing: 'none' }])],
      dress: dressDoor([-2.3, 1.5], 0.9, 1.95, { code: 'danger', ribs: 0, sign: 2 }),
      note: 'the hold\'s gate is an Ancient door kept working (the Line\'s: biomes/line, the hot doors); here the guard cut beside it and the room of its winding gear; the white lamp hooded' }),
    item({ key: 'tg_lift_head', name: 'The lift head (Loj Fower\'s)', wealth: 0.7, types: ['civic', 'infrastructure'], lot: [8, 7],
      rooms: [cr('machine', 'tg_lift', 5.0, 4.0, 0, 0, 3.2, [{ at: [0, 2.0], w: 1.1, swing: 'none' }])],
      dress: dressDoor([0, 2.0], 1.1, 2.1, { code: 'line', ribs: 0, sign: 1 }),
      note: 'the lift\'s machine room kept by rite: the gear shrine and the winch' }),
    item({ key: 'tg_watch_cut', name: 'Watch cut over a gallery', wealth: 0.35, types: ['civic'], lot: [6, 5],
      rooms: [cr('watch', 'tg_guard', 3.0, 2.6, 0, 0, 2.3, [{ at: [0, 1.3], w: 0.85, swing: 'none' }])],
      dress: dressDoor([0, 1.3], 0.85, 1.95, { code: 'danger', ribs: 0 }),
      note: 'a guard cut over a gallery: the pick-and-hooks and the spring bows' }),
    { key: 'tg_night_mouth', name: 'The night mouth', types: ['infrastructure'], skip: 'the hold\'s mouth to the surface is open: its hooded lamps and click-ribs are the Line\'s and the kit\'s dress (TGDRESS.dressDoor with code danger), nothing enclosed' },
    /* ---------------- works */
    item({ key: 'tg_dark_beds', name: 'The dark beds', wealth: 0.4, types: ['farm'], lot: [11, 7],
      rooms: [cr('beds', 'tg_beds', 9.0, 4.5, 0, 0, 2.6, [{ at: [0, 2.25], w: 1.2, swing: 'none' }], { finish: 'hewn' })],
      dress: dressDoor([0, 2.25], 1.2, 2.0, { code: 'work', ribs: 1 }),
      note: 'the fungus terraces (canon kind field in CAVE.HOLD) drawn flat: racks of plate trays, the mat in its sealed beds, amber tending lamps' }),
    item({ key: 'tg_fixers_shop', name: 'The Fixers\' shop', wealth: 0.5, types: ['industry'], lot: [8, 6],
      rooms: [cr('shop', 'tg_fixers', 6.0, 4.0, 0, 0, 2.6, [{ at: [0, 2.0], w: 1.4, swing: 'none' }])],
      dress: dressDoor([0, 2.0], 1.4, 2.1, { code: 'work', ribs: 1, sign: 0 }),
      note: 'the Fixers\' workshop in a siding: the tool wall, a bench, a press, salvage sorted in bins' }),
    item({ key: 'tg_wax_house', name: 'The wax house', wealth: 0.4, types: ['industry'], lot: [8, 6],
      rooms: [cr('wax', 'tg_wax', 5.5, 4.0, 0, 0, 2.6, [{ at: [0, 2.0], w: 1.0, swing: 'none' }])],
      dress: dressDoor([0, 2.0], 1.0, 2.0, { code: 'work' }),
      note: 'rendering hearth wax: the beads melted on the vent\'s heat, moulded into cakes, lamps and seals (the moulds\' job is lampmaking: `wax` is not in FURN_JOBS)' }),
    item({ key: 'tg_kiln', name: 'The gypsum kiln', wealth: 0.4, types: ['industry'], lot: [8, 7],
      rooms: [cr('kiln', 'tg_kiln', 5.0, 4.5, 0, 0, 2.8, [{ at: [0, 2.25], w: 1.2, swing: 'none' }])],
      dress: dressDoor([0, 2.25], 1.2, 2.1, { code: 'work' }),
      note: 'the gypsum kiln on a vent: plaster for the hold, the one hot trade' }),
    item({ key: 'tg_bait_room', name: 'The bait room', wealth: 0.45, types: ['civic'], lot: [8, 6],
      rooms: [cr('bait', 'tg_bait', 6.0, 4.0, 0, 0, 2.5, [{ at: [-1.5, 2.0], w: 1.1, swing: 'none' }], { finish: 'plaster' })],
      dress: dressDoor([-1.5, 2.0], 1.1, 2.0, { code: 'work', ribs: 1 }),
      note: 'the communal kitchen by the platform: the range, the mash, the trestle the bait tins are packed on' }),
    item({ key: 'tg_brew_room', name: 'The brew room', wealth: 0.5, types: ['tavern'], lot: [7, 6],
      rooms: [cr('brew', 'tg_brew', 5.0, 4.0, 0, 0, 2.5, [{ at: [1.2, 2.0], w: 1.1, swing: 'none' }], { finish: 'plaster' })],
      dress: dressDoor([1.2, 2.0], 1.1, 2.0, { code: 'line', ribs: 1, side: -1 }),
      note: 'the brew (steeped stalk-pith, a drop of stoke against the cold) from the urn; alecap beer by the cup at the meeting\'s end' }),
    item({ key: 'tg_cistern', name: 'The cistern', wealth: 0.4, types: ['infrastructure'], lot: [7, 6],
      rooms: [cr('cistern', 'tg_cistern', 5.0, 4.0, 0, 0, 2.6, [{ at: [0, 2.0], w: 1.0, swing: 'none' }], { finish: 'concrete' })],
      dress: dressDoor([0, 2.0], 1.0, 2.0, { code: 'passage' }),
      note: 'the station\'s cistern (Ancient) under its hatch; drip lines from the rock into plate gutters' }),
    item({ key: 'tg_fan_house', name: 'The fan house', wealth: 0.5, types: ['infrastructure'], lot: [7, 6],
      rooms: [cr('fan', 'tg_fan', 5.0, 4.0, 0, 0, 3.0, [{ at: [-1.2, 2.0], w: 1.0, swing: 'none' }])],
      dress: dressDoor([-1.2, 2.0], 1.0, 2.0, { code: 'work' }),
      note: 'an Ancient fan still turning in the draught from the night mouth to the shafts (PLAN.md 5.3)' }),
    item({ key: 'tg_bath', name: 'The bath (the Hearth hold\'s)', wealth: 0.7, types: ['civic'], lot: [9, 7],
      rooms: [cr('bath', 'tg_bath', 7.0, 5.0, 0, 0, 2.8, [{ at: [-2.5, 2.5], w: 1.0, swing: 'none' }],
        { finish: 'plaster', fixtures: [{ id: 'pool', kind: 'pool', x: 0.6, z: -0.3, ry: 0, w: 3.4, d: 2.2, h: 0.1, reach: false }] })],
      dress: dressDoor([-2.5, 2.5], 1.0, 2.0, { code: 'line', ribs: 1 }),
      note: 'where the vent\'s water is warm: a plastered pool (a fixture; core/water draws its water) and the hold\'s luxury' }),
    item({ key: 'tg_leaper_pens', name: 'The leaper pens', wealth: 0.3, types: ['farm'], lot: [10, 7],
      rooms: [cr('pens', 'tg_pens', 8.0, 4.5, 0, 0, 2.6, [{ at: [0, 2.25], w: 1.4, swing: 'none' }])],
      dress: dressDoor([0, 2.25], 1.4, 2.0, { code: 'work' }),
      note: 'the cavern leapers\' pens: pipe rails (they jump), coal moss bedding, troughs' }),
    item({ key: 'tg_vein_working', name: 'A vein working off the bore', wealth: 0.3, types: ['industry'], lot: [8, 5],
      rooms: [cr('working', 'tg_vein', 6.0, 3.0, 0, 0, 2.4, [{ at: [0, 1.5], w: 1.2, swing: 'none' }])],
      dress: dressDoor([0, 1.5], 1.2, 1.95, { code: 'work' }),
      note: 'the head of a working where a vein crosses the bore (PLAN.md 1.2.1: LN.veins); the working runs on into the rock past it' }),
    item({ key: 'tg_ore_store', name: 'The ore store', wealth: 0.4, types: ['industry'], lot: [7, 6],
      rooms: [cr('ore', 'tg_ore', 5.0, 4.0, 0, 0, 2.5, [{ at: [0, 2.0], w: 1.2, swing: 'none' }])],
      dress: dressDoor([0, 2.0], 1.2, 2.0, { code: 'work' }) }),
    item({ key: 'tg_refinery', name: 'The rare-earth batch room', wealth: 0.7, types: ['industry'], lot: [7, 6],
      rooms: [cr('batch', 'tg_refinery', 5.0, 4.0, 0, 0, 2.5, [{ at: [-1.4, 2.0], w: 0.9 }], { finish: 'plaster' })],
      dress: dressDoor([-1.4, 2.0], 0.9, 1.95, { code: 'work', sign: 3 }),
      note: 'a Fixers\' craft and secret: rare earths from the rift fill refined in small batches for the generators\' magnets' }),
    item({ key: 'tg_power_hall', name: 'The power hall (the Tungangs\' dressing of the Ancients\' plant)', wealth: 0.75, types: ['industry', 'infrastructure'], lot: [12, 8],
      rooms: [cr('hall', 'tg_power', 10.0, 6.0, 0, 0, 4.0, [{ at: [-3.5, 3.0], w: 1.4, swing: 'none' }, { at: [3.5, 3.0], w: 1.4, swing: 'none' }], { finish: 'concrete' })],
      dress: dressDoor([-3.5, 3.0], 1.4, 2.2, { code: 'line', ribs: 0, sign: 1 }),
      note: 'the plant by the hot doors is the Line\'s (biomes/line, station hotdoor: the heat exchangers, the generators); this is what the Tungangs keep in it by rite: the rota, the recharged cells, a lever frame, the banners' }),
    item({ key: 'tg_shaft_foot', name: 'A shaft\'s foot', wealth: 0.45, types: ['infrastructure'], lot: [7, 7],
      rooms: [cr('foot', 'tg_shaft', 5.0, 4.5, 0, 0, 3.0, [{ at: [0, 2.25], w: 1.2, swing: 'none' }])],
      dress: dressDoor([0, 2.25], 1.2, 2.0, { code: 'passage', ribs: 1 }),
      note: 'a ventilation shaft\'s foot in the hold: the ice hoist over the hatch, the draught doors (the kit\'s)' }),
    { key: 'tg_shaft_head', name: 'A shaft\'s head on the mountain', wealth: 0.45, types: ['infrastructure'], lot: [7, 7],
      rooms: [{ id: 'head', kind: 'tg_shaft', poly: rect(4.5, 4.0, 0, 0), y: 0, h: 2.4, doors: [{ at: [0, 2.0], w: 0.9 }] }],
      dress: dressDoor([0, 2.22 - CUT], 0.9, 1.9, { code: 'danger' }),        /* a built wall: its face 0.22 m out */
      note: 'built, not carved: a turf-capped hut that reads as a boulder, no path to it (hidden: PLAN.md 1.2.1); the winch, an ice store, the hooded lamp lit only to a signal' },
    /* ---------------- care, the dead, the shrine */
    item({ key: 'tg_stoke_room', name: 'The stoke room', wealth: 0.55, types: ['civic'], lot: [8, 6],
      rooms: [cr('stoke', 'tg_stoke', 6.0, 4.0, 0, 0, 2.5, [{ at: [-1.8, 2.0], w: 1.0 }], { finish: 'plaster' })],
      dress: dressDoor([-1.8, 2.0], 1.0, 2.0, { code: 'home', ribs: 1 }),
      note: 'the infirmary: cots behind curtains, the steward\'s stoke (fatal in excess) locked in its cabinet' }),
    item({ key: 'tg_last_stop', name: 'The last stop', wealth: 0.2, types: ['funerary'], lot: [12, 6],
      rooms: [cr('siding', 'tg_last', 10.0, 3.0, 0, 0, 2.6, [{ at: [0, 1.5], w: 1.2, swing: 'none' }],
        { fixtures: [0, 1, 2, 3, 4, 5].map(function (i) {
          return fxKey('seal' + i, 'tungang_poor_seal_plate', -4.1 + i * 1.64, -1.5 + 0.06 * S, 0, 1.0 * S, 0.12 * S, { h: 1.3 * S, y: 0.3, variant: i < 2 ? 0 : 1, seed: [118, 96, 77, 64, 41, 23][i] }); }) })],
      dress: dressDoor([0, 1.5], 1.2, 2.0, { code: 'passage' }),
      note: 'the sealed siding of the dead: each seal a niche plated over, the berth number painted on it (fixtures, seeded by the number); the lamps left at the seals burn down; the dead go off shift' }),
    item({ key: 'tg_cleft', name: 'A crystal cleft', wealth: 0.3, types: ['religious'], lot: [6, 5],
      rooms: [cr('cleft', 'tg_cleft', 4.0, 3.0, 0, 0, 3.0, [{ at: [0, 1.5], w: 1.2, swing: 'none' }], { finish: 'raw' })],
      dress: dressDoor([0, 1.5], 1.2, 2.2, { code: 'passage', ribs: 0 }),
      note: 'a crystal cleft in the Line\'s granite: a rail across its mouth, nothing taken; the crystal is the biome\'s (biomes/line)' })
  ] });
})(KratorInteriors);
