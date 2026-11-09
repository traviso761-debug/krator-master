/* ======================== Interior set: Pylon (kits/pylon) ========================
   The interiors of the Pylon kit's buildings that have a closed body: one item per VERN.def key (kits/pylon
   src/70p-pyl-dwellings.js, 70q-pyl-poor.js, 70r-pyl-rich.js, 71p-pyl-industry.js, 72p-pyl-civic.js).
   Local frame = the builders': origin at the plot centre on the ground, +z the front (the door side), metres.
   Each body is the builder's vnBody (hollow when the item exists); `poly` is its outer face, `y` its base. Where a
   builder stacks a storey on a band, the lower level's h is chosen so the planner's next floor (y + h + 0.25 slab)
   lands on the drawn one.
   Furniture culture: pylon (kits/catalog/krator-master-furniture-pylon.js: the banquette, the hearth block, the
   platform bed, the niche planter), chained to iziz, whose sets furnish the rest outright (the owner, 2026-10-18),
   then post-apoc and scrap for the salvage trades and the poor. Wealth from the def's tag: poor 0.2, middle 0.5,
   rich 0.8, civic 0.65.
   Not furnished (each says why in `skip`): the tank house, pod stack and hex cells (salvaged shells too small or
   too round for rooms), the industry yards and halls, the bazaar, the watch and the Ancients. The vaulted rows, the neo
   villa, the guild, the shrine, the clinic and the governor's palace (its hall block's rooms on the blueprint,
   kits/pylon/palace/) came on 2026-11-09.
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const POOR = 0.2, MID = 0.5, RICH = 0.8, CIVIC = 0.65;
  const SF = ['single-family dwelling'], MF = ['multi-family dwelling'];
  if (!IX.CULTURE_FAMILY.pylon) IX.CULTURE_FAMILY.pylon = ['iziz', 'post-apoc', 'scrap', 'generic'];
  const L = [];
  const add = function (it) { it.culture = it.culture || 'pylon'; L.push(it); return it; };

  /* ---------------- DWELLINGS */
  add({ key: 'pyl_folk_house', name: 'Folk house', wealth: MID, types: SF, lot: [14, 16],
    bodies: [{ id: 'house', poly: rect(9.6, 10.4, 0, -1.4), y: 0.45,
      levels: [{ h: 3.5 }, { h: 3.2, poly: rect(9.6, 8.0, 0, -2.6) }], wall: 0.3, roof: 'flat',
      doors: [{ at: [1.1, 3.8], w: 1.15 }], program: [['living', 'kitchen'], ['bedroom', 'bedroom']] }],
    note: 'the ground storey and the upper set back behind its terrace; the porch and the terrace are open' });
  add({ key: 'pyl_folk_villa', name: 'Folk villa', wealth: MID, types: SF, lot: [15, 16],
    bodies: [{ id: 'house', poly: rect(10.4, 8.4, 0, -2.3), y: 0.5, levels: [{ h: 3.25 }, { h: 3.25 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [0, 1.9], w: 1.2 }], program: [['living', 'kitchen'], ['bedroom', 'bedroom']] },
      { id: 'pavilion', poly: rect(5.2, 4.2, 0, -3.8), y: 7.5, levels: [{ h: 2.72 }], wall: 0.25, roof: 'flat',
        doors: [{ at: [1.2, -1.7], w: 0.95 }], program: ['study'] }],
    note: 'two storeys behind the porch, the rooftop pavilion as a study; the porch and the roof terrace are open' });
  add({ key: 'pyl_block', name: 'Block (flats over shops)', wealth: MID, types: MF.concat(['market/shop']), units: 2, lot: [15, 13],
    bodies: [{ id: 'block', poly: rect(11.6, 9.4, 0, -0.8), y: 0,
      levels: [{ h: 3.35, poly: rect(11, 7.8, 0, -1.6) }, { h: 3.05 }, { h: 3.3 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [-4.9, 2.3], w: 1.0 }], program: [['shop', 'store'], ['living', 'kitchen', 'bedroom'], ['living', 'bedroom', 'bedroom']] }],
    note: 'the shop floor set back under the canopy, a flat on each of the two concrete storeys' });
  add({ key: 'pyl_ring_house', name: 'Ring house', wealth: POOR, types: SF, lot: [9, 9],
    bodies: [{ id: 'house', poly: rect(6.4, 6, 0, -1), y: 0, levels: [{ h: 3.2 }], wall: 0.25, roof: 'flat',
      doors: [{ at: [-0.8, 2.0], w: 1.1 }], program: ['cottage'] }],
    note: 'one room behind the buried hoop; the awning and the yard are open' });
  add({ key: 'pyl_hex_villa', name: 'Hex villa', wealth: RICH, types: SF, lot: [24, 22],
    bodies: [{ id: 'lower', poly: rect(11.6, 8.6, -3.4, -4.6), y: 0, levels: [{ h: 4.4 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [-3.4, -0.3], w: 1.3 }], program: ['living', 'kitchen', 'bedroom'] },
      { id: 'tall', poly: rect(7.4, 7.4, 5.2, -5.4), y: 0, levels: [{ h: 7.6 }], wall: 0.3, roof: 'flat',
        doors: [{ at: [8.9, -3.8], w: 1.1 }], program: ['hall', 'study'] }],
    note: 'the lower block, and the tall east block as one double-height hall behind its hex window (its door on the ' +
      'east side); the court and its walls are open' });
  /* the vaulted rows and the neo villa (2026-11-09) */
  add({ key: 'pyl_vault_house', name: 'Vault house', wealth: MID, types: SF, lot: [14.5, 12],
    bodies: [{ id: 'middle', poly: rect(4.6, 9.0, 0, -1.5), y: 0.7, levels: [{ h: 2.6 }], wall: 0.25, roof: 'flat',
      doors: [{ at: [0, 3.0], w: 1.5 }, { at: [-2.3, -2.6], w: 0.95 }, { at: [2.3, -2.0], w: 0.95 }], program: ['living', 'kitchen'] },
      { id: 'west', poly: rect(4.0, 7.6, -4.4, -1.4), y: 0.7, levels: [{ h: 2.6 }], wall: 0.25, roof: 'flat',
        doors: [{ at: [-2.4, -2.6], w: 0.95 }], program: ['bedroom'] },
      { id: 'east', poly: rect(3.8, 6.6, 4.4, -1.5), y: 0.7, levels: [{ h: 2.6 }], wall: 0.25, roof: 'flat',
        doors: [{ at: [2.5, -2.0], w: 0.95 }], program: ['bedroom'] }],
    note: 'three wings under their vaults (the rooms under the springing: the vaults are solid over a flat ceiling): the living ' +
      'room and kitchen in the middle wing behind the door, a bedroom in each side wing through a doorway in the shared walls' });
  add({ key: 'pyl_terrace', name: 'Terrace', wealth: MID, types: MF, units: 2, lot: [15, 12],
    bodies: [{ id: 'ground', poly: rect(12, 10.4, 0, -0.6), y: 0.4, levels: [{ h: 3.2 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [0, 4.6], w: 1.6 }], program: ['living', 'kitchen', 'bedroom'] },
      { id: 'upper', poly: rect(10.4, 7.2, -0.8, -2.2), y: 3.9, levels: [{ h: 3.26 }, { h: 3.2, poly: rect(7.6, 4.2, -2.2, -3.7) }], wall: 0.3, roof: 'flat',
        doors: [{ at: [2.667, 1.4], w: 1.6 }], program: [['living', 'kitchen'], ['bedroom']] }],
    note: 'two households: the ground storey\'s flat, and a duplex over it (the second storey, entered from the terrace the ' +
      'outside stair climbs to, and the third storey up its own stair); the roof terraces are open' });
  add({ key: 'pyl_neo_villa', name: 'Neo villa', wealth: RICH, types: SF, lot: [26, 24],
    bodies: [{ id: 'house', poly: rect(15, 8.4, 0, -5.2), y: 0, levels: [{ h: 3.76 }, { h: 3.6, poly: rect(17, 9.2, 0, -4.6) }], wall: 0.3, roof: 'flat',
      doors: [{ at: [0, -1], w: 2.2 }, { at: [7.5, -6.2], w: 0.95 }], program: [['living', 'kitchen'], ['bedroom', 'bedroom', 'study']] },
      { id: 'annexe', poly: rect(4.4, 6.4, 9.7, -6.2), y: 0, levels: [{ h: 3.2 }], wall: 0.25, roof: 'flat',
        doors: [{ at: [7.5, -6.2], w: 0.95 }], program: ['study'] }],
    note: 'the white ground storey behind the portal and the concrete upper storey cantilevered past it (planned on its own ' +
      'larger outline); the porthole annexe as a study off the ground storey; the court and the pool are open' });

  /* ---------------- INDUSTRY AND TRADE */
  add({ key: 'pyl_workshop', name: 'Workshop', wealth: MID, types: ['industry'], lot: [15, 12],
    bodies: [{ id: 'shop', poly: rect(11, 9, 0, -1.6), y: 0, levels: [{ h: 5.4 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [3.6, 2.9], w: 1.0 }], program: ['izwork_tinker', 'store'] }],
    note: 'the tinker\'s workroom and its store; the open bay under the canopy and the scrap heap are open' });
  add({ key: 'pyl_crawler_depot', name: 'Crawler depot', wealth: MID, types: ['industry'], lot: [26, 18],
    bodies: [{ id: 'depot', poly: rect(18, 13, 0, -2.4), y: 0, levels: [{ h: 8.5 }], wall: 0.35, roof: 'flat',
      doors: [{ at: [5.6, 4.1], w: 1.0 }], program: ['workshop', 'store'] }],
    note: 'the repair floor and its store behind the corrugate shutter (drawn shut); the fuel tank and the ramp are open' });
  add({ key: 'pyl_assay_office', name: 'Assay office', wealth: CIVIC, types: ['civic', 'market/shop'], lot: [14, 14],
    bodies: [{ id: 'office', poly: rect(11, 9, 0, -1.8), y: 0, levels: [{ h: 5.6 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [3.4, 2.7], w: 1.1 }], program: ['shop', 'study', 'store'] }],
    note: 'the weighing hall (a counter room), the assayer\'s study and the strong store; the weighbridge is open' });

  /* ---------------- CIVIC */
  add({ key: 'pyl_school', name: 'School', wealth: CIVIC, types: ['civic'], lot: [24, 18],
    bodies: [{ id: 'school', poly: rect(20, 9, 0, -3.5), y: 0, levels: [{ h: 3.8 }, { h: 3.85 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [0, 1.0], w: 1.6 }], program: [['school', 'school', 'hall'], ['library', 'school']] }],
    note: 'two storeys of classrooms; the court is open' });
  add({ key: 'pyl_salvagers_guild', name: 'Salvagers\' Guild', wealth: CIVIC, types: ['civic'], lot: [40, 24],
    bodies: [{ id: 'hall', poly: rect(26, 14, 0, -4.5), y: 0.35, levels: [{ h: 5.32 }, { h: 3.93 }], wall: 0.4, roof: 'flat',
      doors: [{ at: [0, 2.5], w: 2.4 }], program: [['hall', 'study', 'store'], ['library', 'study', 'study']] }],
    note: 'the guild hall behind the arcade (the masters\' hall, the clerk, the store) and the porthole storey over it (the ' +
      'records and two masters\' rooms); the tower and the vault of finds are solid' });
  add({ key: 'pyl_cult_shrine', name: 'Shrine of the Ancients', wealth: CIVIC, types: ['religious'], lot: [14, 12],
    bodies: [{ id: 'cella', poly: rect(4, 4.6, 0, -2.6), y: 0.4, levels: [{ h: 6.2 }], wall: 0.3, roof: 'flat',
      doors: [{ at: [0, -0.3], w: 1.8 }], program: ['shrine'] }],
    note: 'the cella between the pylons, one tall room; the pylons are solid' });
  add({ key: 'pyl_clinic', name: 'Clinic', wealth: CIVIC, types: ['civic'], lot: [16, 14],
    bodies: [{ id: 'hall', poly: rect(2.4, 10.4, 0, -1.6), y: 0.4, levels: [{ h: 3.2 }], wall: 0.2, roof: 'flat',
      doors: [{ at: [0, 3.6], w: 1.3 }, { at: [-1.2, -3.0], w: 1.1 }, { at: [1.2, -3.0], w: 1.1 }], program: ['antechamber'] },
      { id: 'ward', poly: rect(6, 10.4, -4.2, -1.6), y: 0.4, levels: [{ h: 2.6 }], wall: 0.25, roof: 'flat',
        doors: [{ at: [-1.2, -3.0], w: 1.1 }], program: ['dormitory'] },
      { id: 'surgery', poly: rect(6, 10.4, 4.2, -1.6), y: 0.4, levels: [{ h: 2.6 }], wall: 0.25, roof: 'flat',
        doors: [{ at: [1.2, -3.0], w: 1.1 }], program: ['study', 'store'] }],
    note: 'the waiting hall between the wings, the ward in the west wing and the healer\'s room and dispensary in the east, ' +
      'under their vaults (solid over a flat ceiling at the springing)' });

  /* ---------------- THE GOVERNOR'S PALACE (74p) on its blueprint (kits/pylon/palace; settlements/iziz/palace/vassal_blueprint.py
     pylon): the hall block's rooms, ground and upper storey, as the blueprint draws them. Blueprint frame: u along the axis from
     the gate, v across (v > 0 on the left walking in); the building's frame x = -v, z = 1 - u. The terrace is y 1.2, the ground
     storey 5.5 m, the upper 4.5 m (to 11.2). The loggia is its own body behind the arcade screen (u -8.9 to -4, the screen 0.6 m);
     the block's walls are 0.4 m; partitions 0.2 m on the blueprint's lines (the builder draws them from `plan`, the same data).
     Changed from the sheets: the guard rooms, the petitions office and the envoy's antechamber run to v 12 (the sheets' 11.7 left a
     0.3 m sliver against the chancery and the masters' rooms). Not drawn: the undercroft, the seven pavilions (solid drums: the
     chancery, the council, the dining hall, the garden room, the guard, the shrine, the kitchen) and what stands outside the block
     (the servery, the back stair, the family loggia, the steward). */
  const PAL = (function () {
    const T = 1.2, R1 = 6.7, R2 = 11.2, GH = R1 - T - 0.3, UH = R2 - R1 - 0.1, FULL = R2 - T - 0.1;
    /* [id, level, kind, name, u0, u1, v0, v1, h (null: the storey's)] */
    const C = [
      ['vestibule', 0, 'antechamber', 'Vestibule', -4, 3, -5, 5],
      ['guard-r', 0, 'barracks', 'Guard Room', -4, 3, -12, -5], ['guard-l', 0, 'barracks', 'Guard Room', -4, 3, 5, 12],
      ['hall', 0, 'hall', 'Audience Hall (under the dome)', 3, 17, -7, 7, FULL],
      ['court-r', 0, 'antechamber', 'Light Court', 3, 8, -12, -7, FULL], ['court-l', 0, 'antechamber', 'Light Court', 3, 8, 7, 12, FULL],
      ['cabinet', 0, 'study', 'The Governor\'s Cabinet', 17, 24, -3, 3], ['secretary', 0, 'study', 'Secretary of the Person', 17, 24, 3, 8],
      ['pstair', 0, 'antechamber', 'Private Stair', 17, 20, -6, -3], ['robing', 0, 'store', 'Cabinet Wardrobe', 20, 24, -6, -3],
      ['assay', 0, 'shop', 'Assay Office (the salvage tithe)', -1.7, 8.5, -18, -12], ['clerk', 0, 'study', 'Chief Clerk', 8.5, 17, -18, -12],
      ['clerks-pass', 0, 'antechamber', 'Clerks\' passage', 8, 17, -12, -7],
      ['masters', 0, 'antechamber', 'Masters\' Anteroom', -1.7, 8.5, 12, 18], ['shrine-ante', 0, 'antechamber', 'Shrine Antechamber', 8.5, 17, 12, 18],
      ['hall-pass', 0, 'antechamber', 'Hall passage', 8, 17, 7, 12], ['garden-pass', 0, 'antechamber', 'Garden Passage', 17, 24, 8, 13],
      ['dome-gallery', 1, 'antechamber', 'Gallery of the Hall', -4, 3, -5, 5], ['petitions', 1, 'study', 'Petitions Office', -4, 3, -12, -5],
      ['envoy-ante', 1, 'antechamber', 'Envoy\'s Antechamber', -4, 3, 5, 12],
      ['landing', 1, 'antechamber', 'Petitioners\' Landing and Hall', -1.7, 8.5, -18, -12], ['chief-sec', 1, 'bedroom', 'Chief Secretary\'s Lodging', 8.5, 17, -18, -12],
      ['library', 1, 'library', 'Library of the Governor', -1.7, 8.5, 12, 18], ['maps', 1, 'library', 'Map Room', 8.5, 17, 12, 18],
      ['gpass-l', 1, 'antechamber', 'Gallery passage', 8, 17, 7, 12], ['gpass-r', 1, 'antechamber', 'Gallery passage', 8, 17, -12, -7],
      ['pstair-up', 1, 'antechamber', 'Private Stair', 17, 20, -6, -3], ['gov-ante', 1, 'antechamber', 'The Governor\'s Antechamber', 17, 24, -3, 3],
      ['gov-robes', 1, 'store', 'Governor\'s Wardrobe', 20, 24, -6, -3], ['bath', 1, 'bath', 'Governor\'s Bath', 17, 24, -12, -6],
      ['children', 1, 'dormitory', 'Children\'s Rooms and Tutor', 17, 24, 3, 13]];
    /* the upper storey's open wells (the hall and the light courts rise through it): walls round them, no floor */
    const VOIDS = [[3, 17, -7, 7], [3, 8, -12, -7], [3, 8, 7, 12]];
    /* [level, u, v, w, room a, room b ('street': outside)]: a door on the line between a and b */
    const D = [
      [0, -4, 0, 2.0, 'vestibule', 'loggia'], [0, -0.5, -5, 1.0, 'vestibule', 'guard-r'], [0, -0.5, 5, 1.0, 'vestibule', 'guard-l'],
      [0, 3, 0, 2.4, 'vestibule', 'hall'], [0, 1, -12, 1.0, 'guard-r', 'assay'], [0, 1, 12, 1.0, 'guard-l', 'masters'],
      [0, 8.5, -15, 1.0, 'assay', 'clerk'], [0, 12.5, -12, 1.0, 'clerk', 'clerks-pass'], [0, 8, -9.5, 1.0, 'clerks-pass', 'court-r'],
      [0, 5.5, -7, 1.2, 'hall', 'court-r'], [0, 5.5, 7, 1.2, 'hall', 'court-l'], [0, 12.5, 7, 1.2, 'hall', 'hall-pass'],
      [0, 8, 9.5, 1.0, 'hall-pass', 'court-l'], [0, 12.5, 12, 1.0, 'hall-pass', 'shrine-ante'], [0, 8.5, 15, 1.0, 'shrine-ante', 'masters'],
      [0, 17, 10, 1.0, 'hall-pass', 'garden-pass'], [0, 17, 0, 1.4, 'hall', 'cabinet'], [0, 20.5, 3, 1.0, 'cabinet', 'secretary'],
      [0, 20.5, 8, 1.0, 'secretary', 'garden-pass'], [0, 18.5, -3, 0.9, 'cabinet', 'pstair'], [0, 20, -4.5, 0.9, 'pstair', 'robing'],
      [1, -4, 0, 1.6, 'dome-gallery', 'gallery'], [1, -0.5, -5, 1.0, 'dome-gallery', 'petitions'], [1, -0.5, 5, 1.0, 'dome-gallery', 'envoy-ante'],
      [1, 1, -12, 1.0, 'petitions', 'landing'], [1, 1.35, -18, 1.2, 'landing', 'street'], [1, 8.5, -15, 1.0, 'landing', 'chief-sec'],
      [1, 12.5, -12, 1.0, 'chief-sec', 'gpass-r'], [1, 1, 12, 1.0, 'envoy-ante', 'library'], [1, 8.5, 15, 1.0, 'library', 'maps'],
      [1, 12.5, 12, 1.0, 'maps', 'gpass-l'], [1, 17, 10, 1.0, 'gpass-l', 'children'], [1, 20.5, 3, 1.0, 'children', 'gov-ante'],
      [1, 18.5, -3, 0.9, 'gov-ante', 'pstair-up'], [1, 20, -4.5, 0.9, 'pstair-up', 'gov-robes'], [1, 22, -6, 0.9, 'gov-robes', 'bath']];
    const EXT = function (axis, c) { return axis === 'u' ? (c === -4 || c === 24) : (c === -18 || c === 18); };
    const inset = function (axis, c, s) { return c + s * (EXT(axis, c) ? 0.4 : 0.1); };
    const XZ = function (u, v) { return [+(-v).toFixed(3), +(1 - u).toFixed(3)]; };
    const rooms = [];
    const byId = {};
    C.forEach(function (c) { byId[c[0]] = c; });
    /* the loggia and the upper gallery: the body behind the screen (inner faces u -8.3 .. -4.6, v -11.1 .. 11.1) */
    byId.loggia = ['loggia', 0, 'antechamber', 'Front Loggia', -8.3, -4.6, -11.1, 11.1, GH, true];
    byId.gallery = ['gallery', 1, 'hall', 'Upper Gallery (front arcade)', -8.3, -4.6, -11.1, 11.1, UH, true];
    const doorOf = function (id) {   /* this room's doors: at its own inner face on the door's line */
      const c = byId[id], out = [];
      D.forEach(function (d) {
        if (d[4] !== id && d[5] !== id) return;
        const other = d[4] === id ? d[5] : d[4];
        let u = d[1], v = d[2];
        if (c[9]) { if (u === -4) u = -4.6; }   /* the loggia's back wall */
        else if (Math.abs(u - c[4]) < 0.01 || Math.abs(u - c[5]) < 0.01) u = inset('u', u, Math.abs(u - c[4]) < 0.01 ? 1 : -1);
        else v = inset('v', v, Math.abs(v - c[6]) < 0.01 ? 1 : -1);
        out.push({ at: XZ(u, v), w: d[3], to: other === 'street' || STAIR[other] ? 'street' : '.' + other, swing: 'none' });
      });
      if (id === 'loggia') out.push({ at: XZ(-8.3, 0), w: 3.2, to: 'street', swing: 'none' });   /* the portal */
      return out;
    };
    /* the private stair's square is the spiral's (the builder's), not a room: its doors are ways out of the rooms beside it */
    const STAIR = { pstair: 1, 'pstair-up': 1 };
    Object.keys(byId).forEach(function (id) {
      if (STAIR[id]) return;
      const c = byId[id], lv = c[1];
      const u0 = c[9] ? c[4] : inset('u', c[4], 1), u1 = c[9] ? c[5] : inset('u', c[5], -1);
      const v0 = c[9] ? c[6] : inset('v', c[6], 1), v1 = c[9] ? c[7] : inset('v', c[7], -1);
      const r = { id: id, kind: c[2], name: c[3], level: lv, y: lv ? R1 : T, h: c[8] != null ? c[8] : (lv ? UH : GH),
        poly: rect(v1 - v0, u1 - u0, -(v0 + v1) / 2, 1 - (u0 + u1) / 2), doors: doorOf(id) };
      rooms.push(r);
    });
    return { rooms: rooms, plan: { T: T, R1: R1, R2: R2, cells: C, voids: VOIDS, doors: D, stair: [17, 20, -6, -3] } };
  })();
  add({ key: 'pyl_governor_palace', name: 'Governor\'s palace', wealth: RICH, types: ['civic'], lot: [62, 76],
    rooms: PAL.rooms, plan: PAL.plan,
    note: 'the hall block on its blueprint: the loggia, the vestibule between the guard rooms, the audience hall (two storeys, ' +
      'its ceiling flat under the drum), the light courts, the cabinet and the private stair (a spiral in its 3 m square) behind the ' +
      'dais, the assay office and the clerks on the chancery side, the masters\' and shrine antechambers on the other; above, the ' +
      'galleries, the petitions office and the landing the outside stair reaches, the chief secretary, the library and the map ' +
      'room, the governor\'s antechamber, wardrobe and bath, the children\'s rooms. The pavilions are solid drums and the ' +
      'undercroft is not drawn (a later pass)' });

  /* ---------------- NOT FURNISHED (the reasons are the list for the kit's author) */
  const SKIP = [
    ['pyl_tank_house', 'Tank house', 'a salvaged tank lying on its side: too round for rooms'],
    ['pyl_pod_stack', 'Pod stack', 'stacked capsule pods under a metre and a half high inside'],
    ['pyl_hex_cells', 'Hex cells', 'honeycomb cells too small for a room each'],
    ['pyl_scrap_yard', 'Scrap yard', 'open yard'], ['pyl_breakers_floor', "Breakers' floor", 'open floor under a roof'],
    ['pyl_smelter', 'Smelter', 'one furnace vault, open at the front'], ['pyl_sorting_shed', 'Sorting shed', 'open shed'],
    ['pyl_scrap_exchange', 'Scrap exchange', 'open arcade of stalls'], ['pyl_bazaar_lane', 'Bazaar lane', 'open stalls'],
    ['pyl_tank_farm', 'Tank farm', 'tanks and pipes'], ['pyl_cable_crane', 'Cable crane', 'a crane'],
    ['pyl_conveyor', 'Conveyor (segment)', 'a conveyor'], ['pyl_watch', 'The watch (gate fort)', 'a gate fort: solid towers']];
  for (const [key, name, why] of SKIP) add({ key: key, name: name, skip: why });

  IX.sets.add({ set: 'pylon', title: 'Pylon', culture: 'pylon', items: L });
})(KratorInteriors);
