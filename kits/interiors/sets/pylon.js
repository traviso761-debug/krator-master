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
   too round for rooms), the vault house and terrace (vaulted rows: a later pass), the neo villa (its glass box is
   open), the industry yards and halls, the bazaar, the guild, the watch, the shrine, the clinic, the palace (its
   blueprint, kits/pylon/palace/, is a later pass) and the Ancients.
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

  /* ---------------- NOT FURNISHED (the reasons are the list for the kit's author) */
  const SKIP = [
    ['pyl_tank_house', 'Tank house', 'a salvaged tank lying on its side: too round for rooms'],
    ['pyl_pod_stack', 'Pod stack', 'stacked capsule pods under a metre and a half high inside'],
    ['pyl_hex_cells', 'Hex cells', 'honeycomb cells too small for a room each'],
    ['pyl_vault_house', 'Vault house', 'a vaulted row: the vault interior is a later pass'],
    ['pyl_terrace', 'Terrace', 'a vaulted row: the vault interior is a later pass'],
    ['pyl_neo_villa', 'Neo villa', 'its glass box is drawn open; a later pass'],
    ['pyl_scrap_yard', 'Scrap yard', 'open yard'], ['pyl_breakers_floor', "Breakers' floor", 'open floor under a roof'],
    ['pyl_smelter', 'Smelter', 'one furnace vault, open at the front'], ['pyl_sorting_shed', 'Sorting shed', 'open shed'],
    ['pyl_scrap_exchange', 'Scrap exchange', 'open arcade of stalls'], ['pyl_bazaar_lane', 'Bazaar lane', 'open stalls'],
    ['pyl_tank_farm', 'Tank farm', 'tanks and pipes'], ['pyl_cable_crane', 'Cable crane', 'a crane'],
    ['pyl_conveyor', 'Conveyor (segment)', 'a conveyor'], ['pyl_salvagers_guild', "Salvagers' guild", 'its hall has frame doors with no cut; a later pass'],
    ['pyl_watch', 'The watch (gate fort)', 'a gate fort: solid towers'], ['pyl_cult_shrine', 'Shrine of the Ancients', 'vaulted shrine with frame doors; a later pass'],
    ['pyl_clinic', 'Clinic', 'its doors are frames with no cut; a later pass'],
    ['pyl_governor_palace', "Governor's palace", 'the palace interior follows its blueprint (kits/pylon/palace/): a later pass']];
  for (const [key, name, why] of SKIP) add({ key: key, name: name, skip: why });

  IX.sets.add({ set: 'pylon', title: 'Pylon', culture: 'pylon', items: L });
})(KratorInteriors);
