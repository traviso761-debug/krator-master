/* ======================== Interior set: Talia (kits/talia) ========================
   The interiors of the Talia kit's buildings that have a closed body: one item per VERN.def key (kits/talia src/70t,
   70u, 71t, 72t, 72u, 73t). Local frame = the builders': origin at the plot centre on the ground, +z the front (the
   door side), metres. Each body is the builder's vnBody (hollow when the item exists); `poly` is its outer face, `y`
   its base. Where a builder stacks a storey on a band, the lower level's h is chosen so the planner's next floor
   (y + h + 0.25 slab) lands on the drawn one. The rounded whitewash cubes (tanRoundBox) draw one hollow body with
   round corner piers when the item exists.
   Furniture culture: talia (kits/catalog/krator-master-furniture-talia.js: tub armchairs and ottomans in orange,
   white sofas, brass tables, plaster benches and niches, kilims, the lectern, slate, map and specimen cases, the
   easel, the modelling stand, the aedicule), chained to iziz, which furnishes the rest, then generic. Wealth from
   the def's tag: poor 0.2, middle 0.5, rich 0.8, civic 0.65.
   Talia's room kinds (PLAN.md section 6), registered here: `lecture` (the lecture room: a lectern, benches, a
   slate) and `studio` (the academy's: easels and modelling stands). The great hall is `hall`, the rotunda library
   `library`; the cloister walks are open (no furniture); the sleeping loft of the house is its upper level.
   Doors drawn as arches (tanArch: a fill, no cut) are listed for the planner but do not open the wall; the builder's
   vnDoor calls do. Not furnished (each says why in `skip`): the open, round or solid works (the theatre, the
   library's and the anatomy theatre's drums, the glasshouse, the wall, the gate, the bridge). The governor's palace is
   explicit rooms on its blueprint (kits/talia/palace/; 2026-11-09), drawn by its builder from the item's `plan`.
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const POOR = 0.2, MID = 0.5, RICH = 0.8, CIVIC = 0.65;
  const SF = ['single-family dwelling'], MF = ['multi-family dwelling'], CIV = ['civic'];
  if (!IX.CULTURE_FAMILY.talia) IX.CULTURE_FAMILY.talia = ['iziz', 'generic'];
  /* Talia's room kinds: the lecture room and the studio */
  const SEATS = IX.SEAT_TYPES, SURFACE = IX.SURFACE_GROUP;
  if (!IX.PROGRAMS.lecture) {
    IX.PROGRAMS.lecture = { require: [{ need: 'lectern', types: ['desk'], n: 1 }, { need: 'benches', types: ['bench', 'seating', 'chair'], n: 2 }],
      optional: [{ types: ['board'], max: 1 }, { types: ['bench', 'chair'], max: 4 }, { types: ['shelf', 'storage'], max: 1 }, { types: ['statue', 'lamp'], max: 1 }, SURFACE],
      extra: 4 };
    IX.KIND_ALIAS.lecture = ['school', 'hall'];
    IX.KIND_WEIGHT.lecture = 1.6;
  }
  if (!IX.PROGRAMS.studio) {
    IX.PROGRAMS.studio = { require: [{ need: 'easel', types: ['workstation'], n: 1 }],
      optional: [{ types: ['workstation'], max: 3 }, { types: ['table'], max: 1 }, { types: ['storage', 'shelf', 'rack'], max: 2 }, { types: SEATS, max: 1 }, { types: ['statue', 'art'], max: 1 }, SURFACE],
      extra: 7 };
    IX.KIND_ALIAS.studio = ['workshop'];
    IX.KIND_WEIGHT.studio = 1.6;
  }
  const L = [];
  const add = function (it) { it.culture = it.culture || 'talia'; L.push(it); return it; };
  /* a body of n storeys of height h drawn as one vnBody per storey (each storey's floor drawn): levels of h - .25 */
  const storeys = function (n, h, top) { const a = []; for (let k = 0; k < n; k++) a.push({ h: k < n - 1 ? h - 0.25 : (top == null ? h : top) }); return a; };

  /* ---------------- DWELLINGS, POOR (70t) */
  add({ key: 'tal_cube_house', name: 'Cube house', wealth: POOR, types: SF, lot: [10, 11],
    bodies: [{ id: 'house', poly: rect(6.4, 6.0, 0, -1.4), y: 0, levels: [{ h: 3.1 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [0.9, 1.6], w: 0.95 }], program: ['cottage'] },
      { id: 'upper', poly: rect(4.2, 4.4, -1.0, -2.0), y: 3.1, levels: [{ h: 2.8 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [0.2, 0.2], w: 0.9 }], program: ['bedroom'] }],
    note: 'the ground room, and the upper cube over its back-left corner entered from the roof terrace (the outside stair is open; its door is a planner door, the builder draws a window there)' });
  add({ key: 'tal_lane_row', name: 'Lane row', wealth: POOR, types: MF, units: 3, lot: [14, 9],
    bodies: [
      { id: 'house-a', poly: rect(4.2, 6, -4.2, -1), y: 0, levels: [{ h: 2.55 }, { h: 2.7 }], wall: 0.25, roof: 'flat', doors: [{ at: [-5.1, 2], w: 0.9 }], program: [['cottage'], ['bedroom']] },
      { id: 'house-b', poly: rect(4.2, 6, 0, -1), y: 0, levels: [{ h: 2.7 }], wall: 0.25, roof: 'flat', doors: [{ at: [-0.9, 2], w: 0.9 }], program: ['cottage'] },
      { id: 'house-c', poly: rect(4.2, 6, 4.2, -1), y: 0, levels: [{ h: 2.55 }, { h: 2.7 }], wall: 0.25, roof: 'flat', doors: [{ at: [3.3, 2], w: 0.9 }], program: [['cottage'], ['bedroom']] }],
    note: 'three narrow houses (o.len 3), the even ones two storeys; the rill and the lane are open' });
  {
    const B = [];
    for (let k = 0; k < 3; k++) for (const s of [-1, 1]) {
      const x = -0.65 + s * 2.9, zc = 3 - 3.8 * k, zf = zc + 2.7;
      B.push({ id: 'tier' + k + (s < 0 ? 'w' : 'e'), poly: rect(5.2, 5.4, x, zc), y: 3.2 * k, levels: [{ h: 3.0 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [s < 0 ? x - 0.8 : x + 1.0, zf], w: 0.9 }], program: ['cottage'] });
    }
    add({ key: 'tal_hill_stack', name: 'Hill stack', wealth: POOR, types: MF, units: 6, lot: [14, 14], bodies: B,
      note: 'six one-room homes in three tiers on the hill (each tier\'s roof the next one\'s terrace); the stairs are open' });
  }

  /* ---------------- DWELLINGS, MIDDLE (70t) */
  add({ key: 'tal_loggia_house', name: 'Loggia house', wealth: MID, types: SF, lot: [12, 13],
    bodies: [{ id: 'house', poly: rect(9.6, 8.8, 0, -1.2), y: 0.4, levels: storeys(3, 3.2), wall: 0.3, roof: 'flat',
      doors: [{ at: [-1.6, 3.2], w: 1.0 }], program: [['living', 'kitchen'], ['bedroom', 'bedroom'], ['bedroom', 'study']] }],
    note: 'three storeys behind the loggias (the loggias themselves are open); the top storey under the roof terrace and its kiosk' });
  add({ key: 'tal_dome_house', name: 'Dome house', wealth: MID, types: SF, lot: [14, 14],
    bodies: [{ id: 'house', poly: rect(10, 9, 0, -1.2), y: 0.45, levels: [{ h: 3.11 }, { h: 3.3 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [-1.6, 3.3], w: 1.15 }], program: [['living', 'kitchen'], ['bedroom', 'bedroom']] }],
    note: 'two storeys; the round stair tower (a solid drum) and the porch are left out' });
  add({ key: 'tal_tenement', name: 'Tenement (the orange quarter)', wealth: MID, types: MF.concat(['market/shop']), units: 4, lot: [13, 13],
    bodies: [{ id: 'block', poly: rect(11, 10.5, 0, -0.8), y: 0.3, levels: storeys(5, 3.0), wall: 0.3, roof: 'hip',
      doors: [{ at: [-2.4, 4.45], w: 1.0 }],
      program: [['shop', 'store'], ['living', 'bedroom'], ['living', 'bedroom'], ['living', 'bedroom'], ['living', 'bedroom']] }],
    note: 'a shop on the ground floor (its arch is a fill, not a cut: the shop is reached by the street door) and a flat on each of the four storeys over it; the corner turret is solid' });
  add({ key: 'tal_arcade_block', name: 'Arcade block (flats over a walk)', wealth: MID, types: MF.concat(['market/shop']), units: 2, lot: [16, 13],
    bodies: [{ id: 'block', poly: rect(13, 9.5, 0, -1.0), y: 0.1, levels: [{ h: 3.65, poly: rect(13, 7.7, 0, -1.9) }, { h: 2.85 }, { h: 2.8 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [4.2, 1.95], w: 1.1 }], program: [['shop', 'shop', 'store'], ['living', 'bedroom'], ['living', 'bedroom']] }],
    note: 'the shops set back behind the arcade walk, a flat on each of the two storeys over it' });

  /* ---------------- DWELLINGS, RICH (70u) */
  add({ key: 'tal_palazzo', name: 'Palazzo', wealth: RICH, types: SF, lot: [26, 22],
    bodies: [{ id: 'house', poly: rect(16, 12, 0, -2.6), y: 1.4, levels: [{ h: 4.45 }, { h: 3.6 }], wall: 0.35, roof: 'flat',
      doors: [{ at: [0, 3.4], w: 1.5 }], program: [['hall', 'living', 'kitchen'], ['bedroom', 'bedroom', 'study']] }],
    note: 'the piano terreno and the piano nobile over the podium; the drum and dome on the roof are solid' });
  add({ key: 'tal_jharokha_house', name: 'Jharokha house', wealth: RICH, types: MF, units: 3, lot: [18, 16],
    bodies: [{ id: 'house', poly: rect(14, 11, 0, -1.6), y: 0.6, levels: storeys(4, 3.4), wall: 0.3, roof: 'flat',
      doors: [{ at: [0, 3.9], w: 1.4 }], program: [['hall', 'store'], ['living', 'bedroom'], ['living', 'bedroom'], ['living', 'bedroom']] }],
    note: 'a hall on the ground floor and a household on each storey above; the jharokha bays are drawn on the front and not entered' });
  add({ key: 'tal_peristyle_villa', name: 'Peristyle villa', wealth: RICH, types: SF, lot: [30, 26],
    bodies: [{ id: 'house', poly: rect(18, 8, 0, -7.2), y: 0.5, levels: [{ h: 4.25 }, { h: 3.4 }], wall: 0.35, roof: 'flat',
      doors: [{ at: [0, -3.2], w: 1.5 }], program: [['hall', 'living', 'kitchen'], ['bedroom', 'bedroom', 'study']] }],
    note: 'the house at the back of the court; the peristyle, the court and the pavilion are open' });

  /* ---------------- TRADE (71t) */
  add({ key: 'tal_customs_house', name: 'Customs house', wealth: CIVIC, types: CIV.concat(['market/shop']), lot: [34, 30],
    bodies: [{ id: 'front', poly: rect(22, 10, 0, 4.5), y: 1.2, levels: [{ h: 5.25 }, { h: 4.2 }], wall: 0.35, roof: 'flat',
      doors: [{ at: [0, 9.5], w: 1.8 }], program: [['hall', 'study', 'store'], ['study', 'library', 'store']] }],
    note: 'the front block: the customs hall, the collector\'s office and the bond registers; the weighing court is open and the bonded stores are a later pass' });
  add({ key: 'tal_bourse', name: 'Bourse (the caravan exchange)', wealth: CIVIC, types: CIV.concat(['market/shop']), lot: [30, 30],
    bodies: [{ id: 'hall', poly: rect(16, 16, 0, -1.5), y: 1.0, levels: [{ h: 10 }], wall: 0.4, roof: 'flat',
      doors: [{ at: [0, 6.5], w: 2.0 }], program: ['hall', 'shop'] }],
    note: 'the trading floor under the dome (taliaint3) and a broker\'s counter; the arcade round it is open' });
  add({ key: 'tal_shop_arcade', name: 'Shop arcade (houses over)', wealth: MID, types: ['market/shop'].concat(MF), units: 2, lot: [20, 13],
    bodies: [{ id: 'row', poly: rect(18, 11, 0, -1.4), y: 0.3, levels: [{ h: 3.85, poly: rect(18, 8.8, 0, -2.5) }, { h: 2.85 }, { h: 2.8 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [-4.5, 1.9], w: 0.9 }, { at: [4.5, 1.9], w: 0.9 }], program: [['shop', 'shop', 'store'], ['living', 'kitchen', 'bedroom'], ['living', 'bedroom', 'bedroom']] }],
    note: 'the shops behind the arcade walk, a flat on each storey over them' });
  add({ key: 'tal_warehouse', name: 'Warehouse (vaulted stores)', wealth: MID, types: ['industry'], lot: [30, 22],
    bodies: [{ id: 'stores', poly: rect(26, 12, 0, -4.5), y: 0.3, levels: [{ h: 4.6 }], wall: 0.35, roof: 'flat',
      doors: [{ at: [13, 0], w: 1.0 }], program: ['store', 'store', 'store', 'study'] }],
    note: 'four vaulted stores and the clerk\'s room under the vaults; the loading court is open' });
  add({ key: 'tal_bath', name: 'Public baths', wealth: CIVIC, types: CIV, lot: [34, 30],
    bodies: [{ id: 'hall', poly: rect(14, 14, 0, -7.5), y: 0.8, levels: [{ h: 7 }], wall: 0.4, roof: 'flat',
      doors: [{ at: [0, -0.5], w: 1.8 }], program: ['antechamber', 'hall'] }],
    note: 'the domed hall and its changing room; the wings (no door of their own) and the pool court are left out' });
  add({ key: 'tal_inn', name: 'Merchants\' inn', wealth: MID, types: ['tavern/inn'], lot: [26, 24],
    bodies: [{ id: 'back', poly: rect(22, 5.5, 0, -7.25), y: 0.3, levels: [{ h: 3.35 }, { h: 3.2 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [-11, -6], w: 1.0 }], program: [['tavern', 'kitchen', 'store'], ['dormitory', 'bedroom', 'bedroom']] }],
    note: 'the back range: the tap room, its kitchen and the guest rooms over them; the other ranges open on the gallery through arches (fills, not cuts): a later pass' });
  add({ key: 'tal_press', name: 'Press (printers and bookbinders)', wealth: MID, types: ['industry', 'market/shop'], lot: [16, 14],
    bodies: [{ id: 'shop', poly: rect(12.6, 10, 0, -1.0), y: 0.3, levels: [{ h: 3.65, poly: rect(9, 10, -1.8, -1.0) }, { h: 3.1 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [-1.8, 4], w: 1.0 }], program: [['workshop', 'shop'], ['workshop', 'store']] }],
    note: 'the pressroom and the shop below, the bindery over them; the open press bay is left out' });

  /* ---------------- THE UNIVERSITY (72t) */
  add({ key: 'tal_uni_hall', name: 'University great hall', wealth: CIVIC, types: CIV, lot: [44, 24],
    bodies: [{ id: 'hall', poly: rect(39.6, 16, 0, -2.5), y: 1.2, levels: [{ h: 6.05 }, { h: 5 }], wall: 0.4, roof: 'flat',
      doors: [{ at: [0, 5.5], w: 2.0 }], program: [['hall', 'lecture', 'lecture', 'antechamber'], ['library', 'lecture', 'study', 'study']] }],
    note: 'the great hall on the axis and its lecture rooms; the door is drawn on the centre pavilion, .7 m in front of the body, so it does not cut the wall' });
  add({ key: 'tal_uni_senate', name: 'University Senate house', wealth: CIVIC, types: CIV, lot: [28, 24],
    bodies: [{ id: 'house', poly: rect(23.8, 15, 0, -3), y: 1.6, levels: [{ h: 5.05 }, { h: 4.4 }], wall: 0.35, roof: 'flat',
      doors: [{ at: [0, 4.5], w: 1.7 }], program: [['antechamber', 'hall', 'study'], ['hall', 'study', 'library']] }],
    note: 'the masters\' hall and the rector\'s rooms; the door is drawn on the centre bay\'s projection' });
  add({ key: 'tal_uni_faculty', name: 'University faculty (5 bays)', wealth: CIVIC, types: CIV, lot: [40, 20],
    bodies: [{ id: 'faculty', poly: rect(20, 14, 0, -1.5), y: 0.9, levels: [{ h: 4.85 }, { h: 4.2 }], wall: 0.35, roof: 'flat',
      doors: [{ at: [0, 5.5], w: 1.6 }], program: [['lecture', 'antechamber', 'study'], ['library', 'lecture']] }],
    note: 'two storeys of lecture rooms; the door is drawn on the centre bay\'s projection' });
  add({ key: 'tal_uni_faculty#1', name: 'University faculty (variant 2: 7 bays)', like: 'tal_uni_faculty',
    bodies: [{ id: 'faculty', poly: rect(28, 14, 0, -1.5), y: 0.9, levels: [{ h: 4.85 }, { h: 4.2 }], wall: 0.35, roof: 'flat',
      doors: [{ at: [0, 5.5], w: 1.6 }], program: [['lecture', 'antechamber', 'lecture', 'study'], ['library', 'lecture', 'study']] }] });
  add({ key: 'tal_uni_faculty#2', name: 'University faculty (variant 3: 9 bays)', like: 'tal_uni_faculty',
    bodies: [{ id: 'faculty', poly: rect(36, 14, 0, -1.5), y: 0.9, levels: [{ h: 4.85 }, { h: 4.2 }], wall: 0.35, roof: 'flat',
      doors: [{ at: [0, 5.5], w: 1.6 }], program: [['lecture', 'antechamber', 'lecture', 'study'], ['library', 'lecture', 'study']] }] });
  add({ key: 'tal_uni_hospital', name: 'Teaching hospital', wealth: CIVIC, types: CIV, lot: [38, 30],
    bodies: [{ id: 'front', poly: rect(36, 8, 0, 8), y: 0.9, levels: [{ h: 5.45, poly: rect(36, 4.4, 0, 6.2) }, { h: 4 }], wall: 0.35, roof: 'flat',
      doors: [{ at: [-7.2, 8.4], w: 1.5 }, { at: [7.2, 8.4], w: 1.5 }], program: [['hall', 'dormitory', 'dormitory', 'store'], ['dormitory', 'dormitory', 'study']] }],
    note: 'the front range: the hall behind the loggia, the wards and the physician\'s study; the side and back ranges (no street door) are a later pass' });
  add({ key: 'tal_observatory', name: 'Observatory', wealth: CIVIC, types: CIV, lot: [16, 20],
    bodies: [{ id: 'rooms', poly: rect(14, 9, 0, 3.5), y: 0.6, levels: [{ h: 3.75 }, { h: 4 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [0, 8], w: 1.5 }], program: [['study', 'store'], ['study', 'library']] }],
    note: 'the instrument rooms at the tower\'s foot; the tower is a solid drum' });
  add({ key: 'tal_uni_college', name: 'College', wealth: CIVIC, types: CIV.concat(MF), units: 1, lot: [30, 28],
    bodies: [
      { id: 'front', poly: rect(28, 5, 0, 10.5), y: 0.3, levels: [{ h: 3.85 }, { h: 3.2 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [-6, 8], w: 0.9 }], program: [['kitchen', 'store'], ['dormitory', 'dormitory']] },
      { id: 'west', poly: rect(5, 16, -11.5, 0), y: 0.3, levels: [{ h: 3.85 }, { h: 3.2 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [-9, 0], w: 0.9 }], program: [['study', 'library'], ['bedroom', 'bedroom']] },
      { id: 'east', poly: rect(5, 16, 11.5, 0), y: 0.3, levels: [{ h: 3.85 }, { h: 3.2 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [9, 0], w: 0.9 }], program: [['lecture', 'study'], ['bedroom', 'bedroom']] },
      { id: 'hall', poly: rect(28, 5, 0, -10.5), y: 0.3, levels: [{ h: 7.9 }], wall: 0.3, roof: 'hip',
        doors: [{ at: [0, -8], w: 1.2 }], program: ['hall'] }],
    note: 'the kitchen and dormitories over it on the front range, studies and the fellows\' rooms on the sides, the hall at the back; the rooms open on the gallery through arches (fills, not cuts)' });

  /* ---------------- THE ARTS (72u) */
  add({ key: 'tal_academy', name: 'Academy of painting and sculpture', wealth: CIVIC, types: CIV, lot: [28, 28],
    bodies: [
      { id: 'front', poly: rect(25.2, 9, 0, 5.5), y: 0.8, levels: [{ h: 4.65 }, { h: 4 }], wall: 0.35, roof: 'flat',
        doors: [{ at: [0, 10], w: 1.7 }], program: [['antechamber', 'hall', 'store'], ['studio', 'library']] },
      { id: 'studios', poly: rect(25.2, 14, 0, -6), y: 0.8, levels: [{ h: 6 }], wall: 0.35, roof: 'flat',
        doors: [{ at: [0, 1], w: 1.4 }], program: ['studio', 'studio', 'studio'] }],
    note: 'the front range (the hall of casts and the library) and three top-lit studios behind it, entered from it' });
  add({ key: 'tal_odeon', name: 'Odeon (music hall)', wealth: CIVIC, types: CIV, lot: [26, 34],
    bodies: [{ id: 'foyer', poly: rect(24, 12, 0, 3.5), y: 1.0, levels: [{ h: 10 }], wall: 0.35, roof: 'flat',
      doors: [{ at: [0, 9.5], w: 2.2 }], program: ['hall', 'antechamber'] }],
    note: 'the hall block (the auditorium\'s front half and the foyer); the cavea in the apse drum is solid: a later pass' });
  add({ key: 'tal_uni_gallery', name: 'Gallery', wealth: CIVIC, types: CIV, lot: [44, 26],
    bodies: [{ id: 'galleries', poly: rect(40, 16, 0, -3), y: 1.2, levels: [{ h: 8 }], wall: 0.35, roof: 'flat',
      doors: [{ at: [0, 5], w: 2.2 }], program: ['antechamber', 'hall', 'antechamber'] }],
    note: 'three top-lit galleries; the rotunda behind the portico is a solid drum' });

  /* ---------------- CIVIC (73t) */
  add({ key: 'tal_temple', name: 'Temple', wealth: CIVIC, types: ['religious', 'civic'], lot: [36, 42],
    bodies: [{ id: 'nave', poly: rect(28, 30, 0, -4), y: 3.12, levels: [{ h: 14 }], wall: 0.4, roof: 'flat',
      doors: [{ at: [0, 11], w: 4.4 }], program: ['shrine', 'antechamber', 'store'] }],
    note: 'the nave under the dome, the narthex and the sacristy; the portal is a fill on the frontispiece, not a cut' });
  add({ key: 'tal_chapel', name: 'Chapel', wealth: CIVIC, types: ['religious', 'civic'], lot: [14, 16],
    bodies: [{ id: 'chapel', poly: rect(9, 9, 0, -1.5), y: 0.8, levels: [{ h: 6 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [0, 3], w: 1.6 }], program: ['shrine'] }] });
  add({ key: 'tal_council_house', name: 'Council house', wealth: CIVIC, types: CIV, lot: [24, 36],
    bodies: [{ id: 'cella', poly: rect(18, 22, 0, -4), y: 2.4, levels: [{ h: 9 }], wall: 0.35, roof: 'gable',
      doors: [{ at: [0, 7], w: 2.6 }], program: ['hall', 'antechamber', 'study'] }],
    note: 'the council chamber, its antechamber and the clerk\'s room; the portico is open' });
  add({ key: 'tal_uni_cloister', name: 'University cloister', wealth: CIVIC, types: CIV, lot: [40, 42],
    bodies: [
      { id: 'back', poly: rect(38, 6, 0, -16), y: 0.5, levels: [{ h: 5.05 }, { h: 4.2 }], wall: 0.35, roof: 'flat',
        doors: [{ at: [0, -13], w: 1.2 }], program: [['lecture', 'lecture', 'lecture'], ['library', 'study', 'library']] },
      { id: 'west', poly: rect(6, 26, -16, 0), y: 0.5, levels: [{ h: 5.05 }, { h: 4.2 }], wall: 0.35, roof: 'flat',
        doors: [{ at: [-13, 0], w: 1.2 }], program: [['lecture', 'study'], ['study', 'study']] },
      { id: 'east', poly: rect(6, 26, 16, 0), y: 0.5, levels: [{ h: 5.05 }, { h: 4.2 }], wall: 0.35, roof: 'flat',
        doors: [{ at: [13, 0], w: 1.2 }], program: [['lecture', 'study'], ['study', 'study']] }],
    note: 'lecture rooms below and studies and libraries above round the court; the walks are open (no furniture); the rooms open on them through arches (fills, not cuts); the front range over the gate is left out' });

  /* ---------------- THE GOVERNOR'S PALACE (74t): its rooms on the blueprint (kits/talia/palace: BLUEPRINT.md, floors/G.png, U.png)
     The rooms are explicit (the planner does not cut them): the blueprint's rectangles in its own frame (u from the forecourt gate
     inward, v across, v > 0 on the left walking in), turned into the building's frame (x = -v, z = 1 - u) by PX. The item's `plan`
     carries the same cells, the edges between them (a wall, a rail, a glazed wall or open), the doors and the seven round pavilions to
     the builder (74t talpInterior), which draws the partitions, the doors (core/door leaves), the upper floor, the two stairs and the
     pavilions' hollow drums from it: the rooms and the walls are one table. The hall block is the vnBody (u -4..24, v -18..18; the
     loggia stands in front of it); a pavilion's rooms are its drum's disc less the block's corner it stands over. Where the plan
     leaves the sheets (the rear range's stairs, the steward, the undercroft) kits/talia/KNOWN_ISSUES.md says why. */
  const PALACE = (function () {
    const PX = function (u, v) { return [-v, 1 - u]; };
    const BLK = [-4, 24, -18, 18], T = 0.4, PT = 0.16;            /* the hollow body (u0, u1, v0, v1), its wall, a partition */
    const LV = [{ y: 1.2, h: 5.25 }, { y: 6.7, h: 4.25 }];          /* the storeys' floors and clear heights (slab .25, ceiling .22) */
    /* [id, level, u0, u1, v0, v1, name, kind]: kind null is a void (the hall's well, a light court, a stairwell) */
    const CELLS = [
      /* ground: ceremony on the axis, government on the right (v < 0), the city's door on the left, the household behind */
      ['vest', 0, -4, 3, -5, 5, 'Vestibule (the second threshold)', 'antechamber'],
      ['guardR', 0, -4, 3, -12, -5, 'Guard room (the chancery side)', 'barracks'],
      ['guardL', 0, -4, 3, 5, 12, 'Guard room (the council side)', 'barracks'],
      ['chanP', 0, -4, -1.7, -18, -12, 'Chancery lobby', 'antechamber'],
      ['cityP', 0, -4, -1.7, 12, 18, 'Council lobby', 'antechamber'],
      ['customs', 0, -1.7, 9.5, -18, -12, 'Customs House of the Passes', 'study'],
      ['clerk', 0, 9.5, 17, -18, -12, 'Chief Clerk', 'study'],
      ['clerkP', 0, 8, 17, -12, -7, 'Clerks\' passage', 'antechamber'],
      ['lcR', 0, 3, 8, -12, -7, 'Light court', null],
      ['lcL', 0, 3, 8, 7, 12, 'Light court', null],
      ['hall', 0, 3, 17, -7, 7, 'Audience hall (under the dome)', 'hall'],
      ['hallP', 0, 8, 17, 7, 12, 'Hall passage', 'antechamber'],
      ['magA', 0, -1.7, 9.5, 12, 18, 'Archons\' anteroom', 'antechamber'],
      ['shrA', 0, 9.5, 17, 12, 18, 'Shrine antechamber', 'antechamber'],
      ['cab', 0, 17, 24, -2, 2, 'The Governor\'s cabinet', 'study'],
      ['pstG', 0, 17, 24, -7.6, -2, 'The private stair (the robing room)', 'store'],
      ['serv', 0, 17, 24, -18, -7.6, 'Servery and back stair', 'kitchen'],
      ['sec', 0, 17, 24, 2, 8, 'Secretary of the Person', 'study'],
      ['gardP', 0, 17, 24, 8, 12, 'Garden passage', 'antechamber'],
      ['famH', 0, 17, 24, 12, 18, 'Family hall', 'antechamber'],
      /* upper: the clerks' and petitioners' side from the outside stair, the galleries round the hall, the residence behind */
      ['galV', 1, -4, 3, -5, 5, 'Gallery over the vestibule', 'antechamber'],
      ['pet', 1, -4, 3, -12, -5, 'Petitions office', 'study'],
      ['envA', 1, -4, 3, 5, 12, 'The envoy\'s antechamber', 'antechamber'],
      ['recP', 1, -4, -1.7, -18, -12, 'Records lobby', 'antechamber'],
      ['envP', 1, -4, -1.7, 12, 18, 'Envoy\'s lobby', 'antechamber'],
      ['petH', 1, -1.7, 9.5, -18, -12, 'Petitioners\' landing and hall', 'antechamber'],
      ['csec', 1, 9.5, 17, -18, -12, 'Chief Secretary\'s lodging', 'bedroom'],
      ['lcR2', 1, 3, 8, -12, -7, 'Light court', null],
      ['lcL2', 1, 3, 8, 7, 12, 'Light court', null],
      ['galSR', 1, 3, 17, -7, -5.5, 'Gallery of the hall', 'antechamber'],
      ['galSL', 1, 3, 17, 5.5, 7, 'Gallery of the hall', 'antechamber'],
      ['hallV', 1, 3, 17, -5.5, 5.5, 'Audience hall (open below)', null],
      ['galR', 1, 8, 17, -12, -7, 'Gallery passage', 'antechamber'],
      ['galL', 1, 8, 17, 7, 12, 'Gallery passage', 'antechamber'],
      ['lib', 1, -1.7, 9.5, 12, 18, 'Library of the Governor', 'library'],
      ['map', 1, 9.5, 17, 12, 18, 'Map room', 'library'],
      ['ant', 1, 17, 24, -2, 2, 'The Governor\'s antechamber', 'antechamber'],
      ['wardU', 1, 17, 24, -6.2, -2, 'The Governor\'s wardrobe', 'store'],
      ['pstTop', 1, 17, 18, -7.6, -6.2, 'Private stair head', 'antechamber'],
      ['pstV', 1, 18, 24, -7.6, -6.2, 'Private stair', null],
      ['bath', 1, 17, 24, -12, -7.6, 'The Governor\'s bath (the back stair\'s landing)', 'antechamber'],
      ['bstV', 1, 17, 18.3, -18, -12, 'Back stair', null],
      ['dress', 1, 18.3, 24, -18, -12, 'The Governor\'s dressing room', 'antechamber'],
      ['child', 1, 17, 24, 2, 12, 'Children\'s rooms and tutor', 'dormitory'],
      ['spoA', 1, 17, 24, 12, 18, 'The spouse\'s antechamber', 'antechamber']
    ];
    /* the edges that are not plain walls: a rail round a well, glass to a light court, nothing (one space) */
    const EDGE = { 'galV|hallV': 'rail', 'galSR|hallV': 'rail', 'galSL|hallV': 'rail', 'galR|galSR': 'open', 'galL|galSL': 'open',
      'pstTop|pstV': 'open', 'pstTop|wardU': 'open', 'pstV|wardU': 'rail', 'bath|pstV': 'rail', 'bath|bstV': 'open', 'bstV|dress': 'rail',
      'hall|lcR': 'glaze', 'hall|lcL': 'glaze', 'galSR|lcR2': 'glaze', 'galSL|lcL2': 'glaze' };
    /* doors between two cells: [level, a, b, u, v, w] (on their shared edge) */
    const DOORS = [
      [0, 'vest', 'guardR', -0.5, -5, 1.0], [0, 'vest', 'guardL', -0.5, 5, 1.0], [0, 'vest', 'hall', 3, 0, 2.4],
      [0, 'guardR', 'chanP', -2.85, -12, 0.9], [0, 'guardL', 'cityP', -2.85, 12, 0.9],
      [0, 'chanP', 'customs', -1.7, -15, 1.0], [0, 'cityP', 'magA', -1.7, 15, 1.0],
      [0, 'customs', 'clerk', 9.5, -15, 1.0], [0, 'clerk', 'clerkP', 13.25, -12, 0.9], [0, 'clerkP', 'serv', 17, -9.8, 1.0],
      [0, 'hall', 'cab', 17, 0, 1.6], [0, 'cab', 'sec', 20.5, 2, 0.9], [0, 'cab', 'pstG', 22.8, -2, 0.9],
      [0, 'sec', 'gardP', 20.5, 8, 0.9], [0, 'gardP', 'famH', 20.5, 12, 0.9],
      [0, 'hall', 'hallP', 12.5, 7, 1.4], [0, 'hallP', 'shrA', 13.25, 12, 1.0], [0, 'hallP', 'gardP', 17, 10, 0.9],
      [1, 'galV', 'pet', -0.5, -5, 1.0], [1, 'galV', 'envA', -0.5, 5, 1.0], [1, 'pet', 'petH', 0.65, -12, 1.0],
      [1, 'petH', 'recP', -1.7, -15, 1.0], [1, 'envA', 'envP', -2.85, 12, 0.9], [1, 'envA', 'lib', 0.65, 12, 1.0],
      [1, 'lib', 'map', 9.5, 15, 1.0], [1, 'pet', 'galSR', 3, -6.25, 0.9], [1, 'envA', 'galSL', 3, 6.25, 0.9],
      [1, 'galR', 'petH', 8.75, -12, 0.9], [1, 'galL', 'lib', 8.75, 12, 0.9],
      [1, 'galR', 'csec', 13.25, -12, 0.9], [1, 'galL', 'map', 13.25, 12, 0.9],
      [1, 'ant', 'wardU', 20.5, -2, 0.9], [1, 'ant', 'child', 20.5, 2, 0.9], [1, 'child', 'spoA', 20.5, 12, 0.9],
      [1, 'pstTop', 'bath', 17.5, -7.6, 0.8], [1, 'bath', 'dress', 21.15, -12, 0.9]
    ];
    /* the round pavilions (the builder's talpPavilion: the drum's face at R - 1.25; the kitchen a plain drum of radius `drum`),
       their storeys' rooms ([name, kind], null: solid) and the arch each opens on the terrace by ([level, k]: arch k of n) */
    const PAV = [
      { id: 'pavCh', u: -8, v: -18, R: 6.3, n: 12, st: [['Chancery and Customs of the East Road', 'study'], ['Records of the Chancery', 'library']], arch: [[0, 0]] },
      { id: 'pavCo', u: -8, v: 18, R: 6.3, n: 12, st: [['Hall of the Talei Council', 'hall'], ['The envoy\'s suite', 'bedroom']], arch: [[0, 11]] },
      { id: 'pavDi', u: 24, v: -18, R: 5, n: 10, st: [['Dining hall', 'hall'], ['The Governor\'s bedchamber', 'bedroom']], arch: [] },
      { id: 'pavFa', u: 24, v: 18, R: 5, n: 10, st: [['Family garden room', 'hall'], ['The spouse\'s suite', 'bedroom']], arch: [[0, 4]] },
      { id: 'pavGu', u: 8, v: -22, R: 3.6, n: 8, st: [['Guard pavilion (the duty guard)', 'antechamber'], null], arch: [[0, 0]] },
      { id: 'pavSh', u: 8, v: 22, R: 3.6, n: 8, st: [['Household shrine (the orb and the sun)', 'shrine']], arch: [[0, 2]] },
      { id: 'kitch', u: 31, v: -6, drum: 3.6, n: 8, st: [['Round kitchen', 'kitchen']], arch: [[0, 0]] }
    ];
    PAV.forEach(function (P) {
      P.c = PX(P.u, P.v); P.t = 0.35; P.rc = P.drum ? P.drum : P.R - 1.25; P.ri = P.rc - P.t;
      P.lv = P.drum ? [{ y: 1.2, h: 5.3 }] : [{ y: 1.2, h: 4.7 }, { y: 6.7, h: 3.7 }];
      P.ww = P.drum ? 0.8 : Math.min(1.5, Math.PI * 2 * P.rc / P.n * 0.5);
    });
    /* an arch's yaw (as the drums place theirs: the point at yaw a is (x + sin a r, z + cos a r)): the chhatri's arches stand between
       its columns, the kitchen's windows on its quarters */
    const yaw = function (P, k) { return (P.drum ? k : k + 0.5) / P.n * Math.PI * 2; };
    /* through the block's faces: [level, cell, to (a pavilion, or 'terrace'), u, v, w, drawn (the builder drew it already)] */
    const EXT = [
      [0, 'vest', 'terrace', -4, 0, 2.4, true], [1, 'petH', 'terrace', 1.35, -18, 1.6, true],
      [0, 'chanP', 'pavCh', -4, -15, 1.2], [0, 'cityP', 'pavCo', -4, 15, 1.2], [1, 'recP', 'pavCh', -4, -15, 1.2], [1, 'envP', 'pavCo', -4, 15, 1.2],
      [0, 'serv', 'pavDi', 24, -15.5, 1.2], [0, 'famH', 'pavFa', 24, 15.5, 1.2], [1, 'dress', 'pavDi', 24, -15.5, 1.2], [1, 'spoA', 'pavFa', 24, 15.5, 1.2],
      [0, 'shrA', 'terrace', 11, 18, 1.2], [0, 'serv', 'terrace', 24, -9.3, 1.1]
    ];
    const byId = {}; CELLS.forEach(function (C) { byId[C[0]] = C; });
    const onBlk = function (s, val) { return Math.abs(val - BLK[s]) < 1e-6; };
    /* a cell's inner face in the building's frame: [x0, x1, z0, z1], the wall's inset on the block's faces, the partition's elsewhere */
    const inner = function (C) {
      const i = function (s, val) { return onBlk(s, val) ? T : PT / 2; };
      return [-C[5] + i(3, C[5]), -C[4] - i(2, C[4]), 1 - C[3] + i(1, C[3]), 1 - C[2] - i(0, C[2])];
    };
    /* the edges between every two cells of a storey: {lv, a, b, axis 'u' (u const: a wall across the axis) | 'v', c, s0, s1, kind, doors} */
    const edges = [];
    for (let i = 0; i < CELLS.length; i++) for (let j = i + 1; j < CELLS.length; j++) {
      const A = CELLS[i], B = CELLS[j]; if (A[1] !== B[1]) continue;
      const kind = EDGE[A[0] + '|' + B[0]] || EDGE[B[0] + '|' + A[0]] || 'wall';
      const push = function (axis, c, s0, s1) { if (s1 - s0 > 0.01) edges.push({ lv: A[1], a: A[0], b: B[0], axis: axis, c: c, s0: s0, s1: s1, kind: kind, doors: [] }); };
      if (Math.abs(A[3] - B[2]) < 1e-6 || Math.abs(A[2] - B[3]) < 1e-6) push('u', Math.abs(A[3] - B[2]) < 1e-6 ? A[3] : A[2], Math.max(A[4], B[4]), Math.min(A[5], B[5]));
      if (Math.abs(A[5] - B[4]) < 1e-6 || Math.abs(A[4] - B[5]) < 1e-6) push('v', Math.abs(A[5] - B[4]) < 1e-6 ? A[5] : A[4], Math.max(A[2], B[2]), Math.min(A[3], B[3]));
    }
    const edgeOf = function (lv, a, b) { return edges.find(function (E) { return E.lv === lv && ((E.a === a && E.b === b) || (E.a === b && E.b === a)); }); };
    DOORS.forEach(function (D) {
      const E = edgeOf(D[0], D[1], D[2]); if (!E) throw new Error('talia palace: no edge between ' + D[1] + ' and ' + D[2]);
      E.doors.push({ s: E.axis === 'u' ? D[4] : D[3], w: D[5] });
    });
    /* the rooms: every cell that is not a void, and every pavilion storey that is not solid */
    const rooms = [], doorsOf = {};
    const addDoor = function (id, d) { (doorsOf[id] = doorsOf[id] || []).push(d); };
    /* a point on a cell's edge moved onto its room's inner face */
    const snap = function (id, axis, x, z) {
      const b = inner(byId[id]);
      if (axis === 'u') z = Math.abs(z - b[2]) < Math.abs(z - b[3]) ? b[2] : b[3]; else x = Math.abs(x - b[0]) < Math.abs(x - b[1]) ? b[0] : b[1];
      return [x, z];
    };
    edges.forEach(function (E) {
      const room = function (id) { return !!byId[id][7]; };
      const at = function (s) { return E.axis === 'u' ? PX(E.c, s) : PX(s, E.c); };
      const list = E.kind === 'open' ? [{ s: (E.s0 + E.s1) / 2, w: E.s1 - E.s0 - 0.1 }] : E.doors;
      list.forEach(function (d) {
        const p = at(d.s);
        if (room(E.a)) addDoor(E.a, { at: snap(E.a, E.axis, p[0], p[1]), w: d.w, to: room(E.b) ? '.' + E.b : 'open' });
        if (room(E.b)) addDoor(E.b, { at: snap(E.b, E.axis, p[0], p[1]), w: d.w, to: room(E.a) ? '.' + E.a : 'open' });
      });
    });
    /* a disc less the block (the corner of the block a pavilion stands over), as a polygon: the circle's points outside the block,
       the points where it crosses the block's faces and the block's corner between them */
    const BOX = [-BLK[3], -BLK[2], 1 - BLK[1], 1 - BLK[0]];
    const inBox = function (p) { return p[0] > BOX[0] + 1e-6 && p[0] < BOX[1] - 1e-6 && p[1] > BOX[2] + 1e-6 && p[1] < BOX[3] - 1e-6; };
    const cross = function (p, q) {        /* where the segment p -> q crosses the box's boundary (one end inside) */
      let t0 = 0, t1 = 1; const d = [q[0] - p[0], q[1] - p[1]];
      [[-d[0], p[0] - BOX[0]], [d[0], BOX[1] - p[0]], [-d[1], p[1] - BOX[2]], [d[1], BOX[3] - p[1]]].forEach(function (pq) {
        if (Math.abs(pq[0]) < 1e-12) return; const r = pq[1] / pq[0]; if (pq[0] < 0) t0 = Math.max(t0, r); else t1 = Math.min(t1, r); });
      const t = inBox(p) ? t1 : t0; return [p[0] + d[0] * t, p[1] + d[1] * t];
    };
    const discLessBlock = function (cx, cz, r, n) {
      const P = []; for (let k = 0; k < n; k++) { const a = (k + 0.5) / n * Math.PI * 2; P.push([cx + Math.sin(a) * r, cz + Math.cos(a) * r]); }
      const corner = [[BOX[0], BOX[2]], [BOX[0], BOX[3]], [BOX[1], BOX[2]], [BOX[1], BOX[3]]].find(function (c) { return Math.hypot(c[0] - cx, c[1] - cz) < r; });
      const out = [];
      for (let k = 0; k < n; k++) {
        const p = P[k], q = P[(k + 1) % n], pi = inBox(p), qi = inBox(q);
        if (!pi) out.push(p);
        if (pi !== qi) { const X = cross(p, q); if (!pi) { out.push(X); out.push(corner); } else out.push(X); }
      }
      return out.map(function (p) { return [Math.round(p[0] * 1000) / 1000, Math.round(p[1] * 1000) / 1000]; });
    };
    EXT.forEach(function (D) {
      const p = PX(D[3], D[4]), axis = Math.abs(D[3] - BLK[0]) < 1e-6 || Math.abs(D[3] - BLK[1]) < 1e-6 ? 'u' : 'v';
      addDoor(D[1], { at: snap(D[1], axis, p[0], p[1]), w: D[5], to: D[2] === 'terrace' ? 'terrace' : '.' + D[2] + D[0] });
      if (D[2] !== 'terrace') addDoor(D[2] + D[0], { at: p, w: D[5], to: '.' + D[1] });
    });
    PAV.forEach(function (P) {
      P.arch.forEach(function (A) { const a = yaw(P, A[1]); addDoor(P.id + A[0], { at: [P.c[0] + Math.sin(a) * P.ri, P.c[1] + Math.cos(a) * P.ri], w: P.ww, to: 'terrace' }); });
    });
    CELLS.forEach(function (C) {
      if (!C[7]) return;
      const b = inner(C), L = LV[C[1]], fx = [];
      if (C[0] === 'hall') fx.push({ id: 'dais', kind: 'dais', x: 0, z: -13.35, w: 6, d: 1.5, ry: 0, reach: false });   /* the cabinet's door behind it */
      if (C[0] === 'pstG') fx.push({ id: 'stair', kind: 'stair', x: 6.85, z: -19.73, w: 1.3, d: 5.5, ry: 0, reach: false });
      if (C[0] === 'serv') fx.push({ id: 'stair', kind: 'stair', x: 14.73, z: -16.7, w: 5.5, d: 1.1, ry: 0, reach: false });
      rooms.push({ id: C[0], name: C[6], kind: C[7], level: C[1], y: L.y, h: L.h, poly: [[b[0], b[2]], [b[1], b[2]], [b[1], b[3]], [b[0], b[3]]],
        doors: doorsOf[C[0]] || [], fixtures: fx });
    });
    PAV.forEach(function (P) {
      P.st.forEach(function (S, lv) {
        if (!S) return;
        /* no windows listed: a chhatri's arches are most of its wall (sills at .4 m), so its pieces stand before them as they would;
           the disc as a 12-gon (the kitchen an 8-gon): straight runs long enough for a bookcase or a hearth against the curve */
        const L = P.lv[lv];
        rooms.push({ id: P.id + lv, name: S[0], kind: S[1], level: lv, y: L.y, h: L.h, poly: discLessBlock(P.c[0], P.c[1], P.ri, P.drum ? 8 : 12),
          doors: doorsOf[P.id + lv] || [], wall: P.t });
      });
    });
    return { rooms: rooms, plan: { BLK: BLK, T: T, PT: PT, LV: LV, cells: CELLS, edges: edges, ext: EXT, pav: PAV } };
  })();
  add({ key: 'tal_governor_palace', name: 'Governor\'s palace', wealth: RICH, types: CIV.concat(SF), lot: [62, 76], wall: 0.2,
    rooms: PALACE.rooms, plan: PALACE.plan,
    note: 'the blueprint\'s rooms (kits/talia/palace, sheets G and U): the vestibule and its guard rooms, the audience hall under the dome, the governor\'s cabinet, secretary and private stair behind the dais, the customs and the clerks on the right, the archons\' anteroom and the shrine\'s on the left, the servery and its back stair; above, the petitioners\' landing off the outside stair, the galleries round the hall, the library and map room, the residence behind. The seven pavilions are round rooms: the chancery and the council (and over them the records and the envoy\'s suite), the dining hall and the family garden room (the governor\'s bedchamber and the spouse\'s suite over them), the guard and the shrine on the flanks, the round kitchen behind. The undercroft is not drawn; the guard pavilion\'s upper storey (the garrison commander) has no stair and stays solid' });

  /* ---------------- THE CARAVAN ROAD (71t; 2026-11-09): the caravanserai's ranges and the stoa's shops. Their court and shop
     fronts are cut through the hollow walls (tanCourtGallery's doors and windows, tanShopFront), so the rooms open on the galleries
     and the walk; the planner's street door of each range is one of the gallery's doors */
  {
    const H0 = 3.85, H1 = 2.65;   /* the caravanserai: the gallery's upper walk at y .2 + 3.8 + .3; the ceiling under the parapet */
    add({ key: 'tal_caravanserai', name: 'Caravanserai', wealth: MID, types: ['tavern/inn', 'market/shop'].concat(MF), units: 4, lot: [36, 32],
      bodies: [
        { id: 'back', poly: rect(29, 5, 0, -12.5), y: 0.2, levels: [{ h: H0 }, { h: H1 }], wall: 0.3, roof: 'flat',
          doors: [{ at: [-3.03, -10], w: 1.2 }, { at: [3.03, -10], w: 1.2 }],
          program: [['workshop', 'store', 'store'], ['dormitory', 'dormitory', 'bedroom']] },
        { id: 'east', poly: rect(5, 20, 15.5, 0), y: 0.2, levels: [{ h: H0 }, { h: H1 }], wall: 0.3, roof: 'flat',
          doors: [{ at: [13, 0], w: 1.2 }], program: [['tavern', 'kitchen'], ['bedroom', 'bedroom']] },
        { id: 'west', poly: rect(5, 20, -15.5, 0), y: 0.2, levels: [{ h: H0 }, { h: H1 }], wall: 0.3, roof: 'flat',
          doors: [{ at: [-13, 0], w: 1.2 }], program: [['shop', 'store'], ['bedroom', 'bedroom']] },
        { id: 'front-e', poly: rect(11.5, 5, 8.75, 12.5), y: 0.2, levels: [{ h: H0 }, { h: H1 }], wall: 0.3, roof: 'flat',
          doors: [{ at: [9.09, 10], w: 1.2 }], program: [['shop', 'store'], ['dormitory', 'bedroom']] },
        { id: 'front-w', poly: rect(11.5, 5, -8.75, 12.5), y: 0.2, levels: [{ h: H0 }, { h: H1 }], wall: 0.3, roof: 'flat',
          doors: [{ at: [-9.09, 10], w: 1.2 }], program: [['store', 'store'], ['dormitory', 'bedroom']] }],
      note: 'the four ranges round the court, two storeys each: the crawler mechanics\' bay and stores at the back, the tap room and its kitchen on the east, a chandler\'s shop on the west, shops and stores either side of the gate; the lodging upstairs off the upper gallery. The corner towers stand in the ranges\' ends (the builder walls them off with interiors); the gate passage is open' });
    add({ key: 'tal_agora_stoa', name: 'Agora stoa', wealth: MID, types: ['market/shop'], lot: [32, 12],
      bodies: [{ id: 'shops', poly: rect(29, 6, 0, -1.5), y: 0.5, levels: [{ h: 4.05 }, { h: 2.8 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [-13.4, -4.5], w: 1.0 }], program: [['shop', 'shop', 'shop', 'store'], ['store', 'study', 'store']] }],
      note: 'the shops behind the colonnade (their fronts cut through the wall: the walk is their street) and the stores and the market clerk over them (o.len 30; the antae close the ends)' });
  }

  /* ---------------- NOT FURNISHED (the reasons are the list for the kit's author) */
  const SKIP = [
    ['tal_uni_library', 'University library', 'a rotunda drawn as a solid drum entered through a solid portico block: its reading room, the gallery storey round the well (a ring room, no simple polygon) and a stair want the drum hollow (74t talpRing / talpDisc, as the palace pavilions) and the block opened: not done (2026-11-09: the sheet is at 2.99M of its 3M triangles)'],
    ['tal_uni_anatomy', 'Anatomy theatre', 'a solid drum: the theatre is one tall round room of steep tiers round a pit, not rooms; it wants the drum hollow and the tiers drawn as fixtures: not done (the triangle budget, as the library)'],
    ['tal_theatre', 'Theatre (open air)', 'an open cavea'], ['tal_memorial_spire', 'Memorial spire', 'a monument'],
    ['tal_glasshouse', 'Glasshouse', 'a glass dome over a planted garden: no room kind holds planting (the plants are drawn by the builder)'],
    ['tal_east_gate', 'Gate of the Passes', 'a gate: solid towers and a passage'], ['tal_wall', 'Wall', 'a wall segment'],
    ['tal_wall_tower', 'Wall tower', 'a solid round tower'], ['tal_fountain', 'Nymphaeum', 'a fountain'],
    ['tal_sky_bridge', 'Sky bridge', 'a bridge between two buildings'],
  ];
  for (const [key, name, why] of SKIP) add({ key: key, name: name, skip: why });

  IX.sets.add({ set: 'talia', title: 'Talia', culture: 'talia', items: L });
})(KratorInteriors);
