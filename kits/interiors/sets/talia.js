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
   library's and the anatomy theatre's drums, the stoa's shops, the wall, the gate, the bridge) and the palace (its
   blueprint, kits/talia/palace/, is a later pass).
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

  /* ---------------- THE GOVERNOR'S PALACE (74t): the hall block on the blueprint's programme (kits/talia/palace) */
  add({ key: 'tal_governor_palace', name: 'Governor\'s palace', wealth: RICH, types: CIV, lot: [62, 76],
    bodies: [{ id: 'hall', poly: rect(36, 28, 0, -9), y: 1.2, levels: [{ h: 5.25 }, { h: 4.5 }], wall: 0.4, roof: 'flat',
      doors: [{ at: [0, 5], w: 2.4 }],
      program: [['antechamber', 'hall', 'study', 'study', 'hall', 'store'], ['hall', 'library', 'study', 'bedroom', 'bedroom', 'bedroom']] }],
    note: 'the hall block: the vestibule from the loggia, the audience hall, the cabinet and the secretary, the dining hall, the stores; above, the galleries, the records, the chief secretary and the residence. The seven pavilions are solid drums (a later pass: round hollow bodies); the undercroft is not drawn' });

  /* ---------------- NOT FURNISHED (the reasons are the list for the kit's author) */
  const SKIP = [
    ['tal_caravanserai', 'Caravanserai', 'its rooms open on the galleries through arches with no cut; a later pass'],
    ['tal_agora_stoa', 'Agora stoa', 'a stoa of open shop fronts (fills, not cuts) with a store behind: a later pass'],
    ['tal_uni_library', 'University library', 'a rotunda drawn as a solid drum: its well and galleries want a round hollow body'],
    ['tal_uni_anatomy', 'Anatomy theatre', 'a solid drum: the tiered theatre wants a round hollow body'],
    ['tal_theatre', 'Theatre (open air)', 'an open cavea'], ['tal_memorial_spire', 'Memorial spire', 'a monument'],
    ['tal_glasshouse', 'Glasshouse', 'a glass dome on an open drum: the garden is a later pass'],
    ['tal_east_gate', 'Gate of the Passes', 'a gate: solid towers and a passage'], ['tal_wall', 'Wall', 'a wall segment'],
    ['tal_wall_tower', 'Wall tower', 'a solid round tower'], ['tal_fountain', 'Nymphaeum', 'a fountain'],
    ['tal_sky_bridge', 'Sky bridge', 'a bridge between two buildings'],
  ];
  for (const [key, name, why] of SKIP) add({ key: key, name: name, skip: why });

  IX.sets.add({ set: 'talia', title: 'Talia', culture: 'talia', items: L });
})(KratorInteriors);
