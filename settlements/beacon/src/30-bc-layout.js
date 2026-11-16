/* ================================================================= THE BEACON: the Order of the Beacon's head house over the Rift, as data  [G data]
   settlements/beacon/PLAN.md and BLUEPRINT.md. The owner, 2026-11-16: the beacon fort over the Rift (march.e) "will become
   the head monastery of the Order of the Beacon"; the lamp is "a refurbished Ancient high-intensity beacon that has been
   moved there by Xanadu and connected to a generator"; its keepers are the Yellow Monastery, Qiblai's gold spoke. The
   owner's forks (2026-11-16, all four as recommended): the east shoulder (853,1540); about 300 monks with the gold
   Prismarch here and Qiblai's gold house the daughter; the Sultan's watch fort above and the monastery below (Gyantse);
   the lamp lit every night with the signal book, raised to the Station when it passes. Everything else is *proposed*.

   Frame: u runs SOUTH along the shoulder's axis (the saddle and the road on the left of a sheet, the knoll, the fort and
   the Rift on the right), v EAST (up a sheet), y up from the knoll's crown (863 m on the scale model). Metres. The
   origin is the lamp: the keep's place of the fort asset (kits/xanadu XFORT, size 'watch'), whose plan is copied below as
   a snapshot (fort x is v; fort z, +z the front toward the approach, is -u - 6.6). A box is [u0, u1, v0, v1].
   No THREE, no DOM: read by layout_dump.js (the sheets) and test-beacon.js (the rules, 31-bc-rules.js). */
const BEACON_LAYOUT = (function () {
  'use strict';
  const frame = {
    px: [853, 1540], ground: 863, uBearing: 180, vBearing: 90, kmPerPx: 2,
    note: 'the east shoulder of the tune pin (846,1540, the ravine head, 14 km west): the owner, 2026-11-16. The pin moves through the scale-model session (B0)'
  };

  /* the ground along the axis (u, y), the knoll's crown at 0: *assumed* until the region is cut at 1:1 */
  const ground = [[-560, 34], [-400, 14], [-250, -5], [-200, -9], [-130, -12], [-70, -12], [-40, -2], [-32, -1], [16, 0], [30, -6], [60, -30], [120, -66], [240, -150]];

  /* the fort asset's watch fort (XFORT.plan({size:'watch'}), 2026-11-16, uncommitted on claude/strongwall-plan-c1ee33),
     in this frame: its ward, towers (centre, side), gate */
  const fort = {
    asset: 'xa_fort', size: 'watch', beacon: 'ancient', dress: 'march', state: 'kept',
    ward: [-27.6, 14.4, -28, 28], curtH: 6, curtT: 2.4, walk: 1.6,
    towers: [
      { id: 'fort.t0', kind: 'corner', at: [-28.87, -29.27], w: 6, h: 9 }, { id: 'fort.t1', kind: 'corner', at: [-28.87, 29.27], w: 6, h: 9 },
      { id: 'fort.t2', kind: 'corner', at: [15.67, 29.27], w: 6, h: 9 }, { id: 'fort.t3', kind: 'corner', at: [15.67, -29.27], w: 6, h: 9 },
      { id: 'fort.i1', kind: 'interval', at: [-6.6, 29.8], w: 6, h: 9 }, { id: 'fort.i2', kind: 'interval', at: [16.2, 0], w: 6, h: 9 },
      { id: 'fort.i3', kind: 'interval', at: [-6.6, -29.8], w: 6, h: 9 },
      { id: 'fort.gl', kind: 'gate', at: [-29.4, -5.75], w: 6, h: 11 }, { id: 'fort.gr', kind: 'gate', at: [-29.4, 5.75], w: 6, h: 11 }],
    gateW: 4.5
  };

  /* zones: the ground the walls part; a polygon is [[u, v], ...] */
  const PRE = { u0: -240, u1: -68, v0: -60, v1: 60 };
  const zones = {
    precinct: [[PRE.u0, PRE.v0], [PRE.u1, PRE.v0], [PRE.u1, PRE.v1], [PRE.u0, PRE.v1]],
    lampward: [[PRE.u1, PRE.v0], [-28.87, -29.27], [-27.6, -28], [-27.6, 28], [-28.87, 29.27], [PRE.u1, PRE.v1]],
    fort: [[-27.6, -28], [14.4, -28], [14.4, 28], [-27.6, 28]],
    cloister: [[-98.6, -19], [-83, -19], [-83, 19], [-98.6, 19]],
    site: [[-560, -400], [240, -400], [240, 400], [-560, 400]]
  };

  /* walls: a centre line a -> b, height, thickness; whose */
  const walls = [
    { id: 'precinct.n', a: [PRE.u0, PRE.v0], b: [PRE.u0, PRE.v1], h: 6, t: 1.6, owner: 'order' },
    { id: 'precinct.e', a: [PRE.u0, PRE.v1], b: [PRE.u1, PRE.v1], h: 6, t: 1.6, owner: 'order' },
    { id: 'precinct.s', a: [PRE.u1, PRE.v1], b: [PRE.u1, PRE.v0], h: 6, t: 1.6, owner: 'order' },
    { id: 'precinct.w', a: [PRE.u1, PRE.v0], b: [PRE.u0, PRE.v0], h: 6, t: 1.6, owner: 'order' },
    { id: 'join.w', a: [PRE.u1, PRE.v0], b: [-28.87, -29.27], h: 6, t: 2, owner: 'order', join: true, note: "Gyantse's wall: the precinct's south-west corner up the knoll to the fort's north-west tower" },
    { id: 'join.e', a: [PRE.u1, PRE.v1], b: [-28.87, 29.27], h: 6, t: 2, owner: 'order', join: true },
    { id: 'fort.n', a: [-27.6, -28], b: [-27.6, 28], h: 6, t: 2.4, owner: 'sultan' },
    { id: 'fort.e', a: [-27.6, 28], b: [14.4, 28], h: 6, t: 2.4, owner: 'sultan' },
    { id: 'fort.s', a: [14.4, 28], b: [14.4, -28], h: 6, t: 2.4, owner: 'sultan' },
    { id: 'fort.w', a: [14.4, -28], b: [-27.6, -28], h: 6, t: 2.4, owner: 'sultan' }];

  /* gates: on a wall, between two zones */
  const gates = [
    { id: 'gate.road', name: 'the Gate of the Wheel (the road gate)', wall: 'precinct.n', at: [PRE.u0, 0], w: 4, from: 'site', to: 'precinct' },
    { id: 'gate.lamp', name: 'the Gate of the Lamp (the precinct to the lamp ward)', wall: 'precinct.s', at: [PRE.u1, 0], w: 3.5, from: 'precinct', to: 'lampward' },
    { id: 'gate.ward', name: 'the Ward Gate (the fort road: soldiers and the oil carts)', wall: 'join.w', at: [-48.44, -44.64], w: 4, from: 'site', to: 'lampward' },
    { id: 'gate.fort', name: "the fort's gate (the Sultan's; the gilt pavilion over it)", wall: 'fort.n', at: [-27.6, 0], w: 4.5, from: 'lampward', to: 'fort' },
    { id: 'gate.cloister', name: "the monastery's gate (its gate tower)", wall: null, at: [-83, 0], w: 2.4, from: 'precinct', to: 'cloister' }];

  /* a part: n (its number on a sheet), zone, box, level (0 ground, 1 over), storeys, decor 0-4, sheets, sleeps {group: n} */
  const P = (n, id, name, kind, zone, box, o) => Object.assign({ n, id, name, kind, zone, box, level: 0, storeys: 1, decor: 1, sheets: ['B1'], note: '' }, o || {});
  const parts = [
    /* ---- the precinct (the order's), north to south */
    P(1, 'roadgate', 'Gate of the Wheel', 'gatehouse', 'precinct', [-246, -234, -7, 7], { storeys: 2, decor: 3, note: 'the road from Erehwon arrives over the saddle; the porter and the Prismarch\'s guard of lay brothers; the great wheel turned by all who enter' }),
    P(2, 'gatecourt', 'Gate Court', 'court', 'precinct', [-232, -206, -26, 26], { decor: 1, note: 'the great cistern under it; the oil carts and the Sultan\'s men go round by the Ward Gate, not through here' }),
    P(3, 'guests', 'Guest House', 'guest_hall', 'precinct', [-232, -206, 28, 56], { storeys: 2, decor: 2, sleeps: { lay: 4 }, note: 'the Sultan\'s officers, monks of the daughter house and of the order\'s other lights, the oil factor' }),
    P(4, 'granary', 'Granary and Stores', 'store', 'precinct', [-232, -206, -56, -28], { storeys: 2, decor: 0, sleeps: { lay: 10 }, note: 'a season\'s grain; the butter, the tea, the oil for the butter lamps; lay brothers over it' }),
    P(5, 'labrang', 'The Labrang (the gold Prismarch\'s house)', 'labrang', 'precinct', [-200, -164, -18, 18], { storeys: 4, decor: 4, sheets: ['B1', 'L'], sleeps: { prismarch: 8 }, note: 'four storeys on the saddle\'s rising ground; the Window of Light on its top floor looks over the hall\'s crown to the lamp (sheet L)' }),
    P(6, 'household', 'Prismarch\'s Kitchen and Household', 'kitchen', 'precinct', [-200, -184, 20, 32], { storeys: 2, decor: 1, sleeps: { prismarch: 4 } }),
    P(7, 'novrange', 'Novices\' Range (school below, dormitory above)', 'novices', 'precinct', [-200, -136, -57, -49], { storeys: 2, decor: 1, sleeps: { novices: 60 } }),
    P(8, 'novyard', 'Novices\' Yard', 'yard', 'precinct', [-196, -140, -47, -29], { decor: 1, note: 'one door, onto the kora lane; the boys learn the grid script on the yard\'s slate wall' }),
    P(9, 'novmaster', 'Master of Novices', 'chamber', 'precinct', [-138, -130, -47, -31], { storeys: 2, decor: 2, sleeps: { chapter: 1 } }),
    P(10, 'infirmary', 'Infirmary', 'infirmary', 'precinct', [-200, -176, 38, 56], { storeys: 2, decor: 2, sleeps: { lay: 4 } }),
    P(11, 'school', 'The Lamp School (the College of Keepers)', 'lamp_school', 'precinct', [-172, -134, 34, 56], { storeys: 2, decor: 2, sleeps: { school: 36 }, note: 'the optics, the generator\'s craft, the signal book and the grid code; keepers trained for the order\'s other lights; their dormitory above' }),
    P(12, 'kora', 'Kora Garden', 'garden', 'precinct', [-162, -132, -24, 24], { decor: 2, note: 'the kora\'s north leg behind the hall: an arcade of prayer wheels, the cistern of the garden' }),
    P(13, 'monastery', 'The Yellow Monastery (the great monastery, gold dress)', 'hosted', 'precinct', [-128, -76, -26, 26], { storeys: 2, decor: 4, gold: 'crown', sheets: ['B1', 'M1', 'M2', 'MR'], host: { kit: 'kits/qiblai', key: 'qb_monastery', v: 2, centre: [-102, 0], front: 'south' }, sleeps: { chapter: 149 }, note: 'the kit\'s block whole (52 x 52 m), its gate facing south to the lamp; the gilt crown on the hall (sheets M1-MR)' }),
    P(14, 'kitchen', 'Great Kitchen', 'kitchen', 'precinct', [-128, -106, -56, -34], { storeys: 2, decor: 1, sleeps: { lay: 12 }, note: 'the tea coppers; the cooks over it' }),
    P(15, 'refectory', 'Refectory', 'refectory', 'precinct', [-104, -76, -56, -34], { decor: 2, note: 'the chapter, the school and the novices at two sittings; the reader\'s seat' }),
    P(16, 'lights', 'Hall of Lights', 'hall_of_lights', 'precinct', [-128, -104, 34, 56], { storeys: 2, decor: 3, note: 'the Register of Lights: a lamp burns here for every light the order keeps; the Book of Lights; the gallery above' }),
    P(17, 'butter', 'Butter Lamp House', 'butter_lamps', 'precinct', [-100, -78, 36, 56], { decor: 3, note: 'the gold spoke\'s thousand butter lamps on stepped racks, kept lit by the novices in turn' }),
    P(18, 'southgate', 'Gate of the Lamp', 'gatehouse', 'precinct', [-71, -65, -5, 5], { storeys: 1, decor: 3, note: 'the precinct\'s south gate, in line with the monastery\'s: the chapter walks from its door to the lamp' }),
    /* ---- the lamp ward (the order's ground between Gyantse's walls, on the knoll's north face) */
    P(20, 'stair', 'The Lamp Stair', 'stair_way', 'lampward', [-65, -40, -2.5, 2.5], { decor: 2, note: 'a processional flight up the knoll\'s north face (about 11 m), its landings with chortens' }),
    P(21, 'plaza', 'Gate Plaza', 'court', 'lampward', [-40, -32.5, -12, 12], { decor: 1, note: 'before the fort\'s gate: where the Sultan\'s men and the Lamp Watch meet' }),
    P(22, 'generator', 'Generator House', 'generator', 'lampward', [-60, -42, -24, -8], { decor: 1, note: 'two engine sets of the Geomancers\' make on Ancient engines, one running, one spare; the switchboard; the cable in a stone channel to the fort\'s gate and the plinth' }),
    P(23, 'oilpit', 'Oil Pit', 'oil_pit', 'lampward', [-62, -52, -40, -30], { decor: 0, note: 'a walled, sunken tank of 3 m3 (a year and a half of the fiftieth), filled from the oil carts at the Ward Gate' }),
    P(24, 'workshop', 'Keepers\' Workshop', 'workshop', 'lampward', [-60, -46, 8, 22], { decor: 1, note: 'the lamp\'s spares, the lens bench, the engines mended' }),
    P(25, 'chorten', 'Chorten of the Keepers', 'chorten', 'lampward', [-57, -47, 25, 35], { circ: true, decor: 3, note: 'the order\'s dead keepers of the light' }),
    /* ---- the fort (the Sultan's; the fort asset's watch plan) */
    P(30, 'plinth', 'The Lamp Plinth (in the keep\'s place)', 'plinth', 'fort', [-6, 6, -6, 6], { storeys: 4, decor: 3, gold: 'chapel', sheets: ['B1', 'P'], h: 18, note: 'the keep\'s battered footing, 18 m: the switch room, the signal room, the Lamp Watch, the Chapel of the Beacon (gilt); the lamp head on its roof (sheet P)' }),
    P(31, 'barracks', 'Barracks', 'barracks', 'fort', [-21.6, 4.4, 17.6, 25.6], { storeys: 2, decor: 1, sleeps: { garrison: 120 }, note: 'the fort asset\'s range: the Sultan\'s watch of the Marches, ten hired musketeers among them' }),
    P(32, 'stables', 'Stables', 'stable', 'fort', [-19.6, -1.6, -25.6, -18.6], { decor: 0, sleeps: { fortfolk: 30 }, note: 'the garrison\'s horses; the grooms, cooks and smith in its loft and the gate rooms' }),
    P(33, 'magazine', 'Magazine', 'magazine', 'fort', [6.5, 11.5, -25.1, -19.1], { decor: 0 }),
    P(34, 'fortgranary', 'Fort Granary', 'store', 'fort', [6.5, 11.5, -16.6, -10.6], { decor: 0 }),
    P(35, 'fortcistern', 'Fort Cistern', 'cistern', 'fort', [-10, -8, -1, 1], { decor: 0 }),
    P(36, 'pavilion', 'Gilt Pavilion over the fort\'s gate', 'pavilion', 'fort', [-29, -26, -3, 3], { level: 1, decor: 3, gold: 'pavilion', note: 'the forts\' gold (the owner, 2026-11-16): the gate pavilion and the chapel, nothing else' }),
    /* ---- outside: the shoulder (sheet T0) */
    P(40, 'yard', 'Carters\' Yard and Stables', 'caravanserai', 'site', [-310, -256, -70, -10], { decor: 0, sheets: ['T0'], note: 'the oil carts from the field (twice a year), the grain trains from Erehwon, the guests\' beasts' }),
    P(41, 'byres', 'Byres and Dairy', 'byre', 'site', [-330, -262, 30, 110], { decor: 0, sheets: ['T0'], sleeps: { lay: 12 }, note: 'the milk herd (milk is a sacrament) and the churn house; the herdsmen' }),
    P(42, 'hives', 'Hives', 'hives', 'site', [-330, -300, 160, 190], { decor: 0, sheets: ['T0'], note: 'honey, the other sacrament' }),
    P(43, 'terr.w', 'West Terraces', 'terrace', 'site', [-260, -70, -260, -80], { decor: 0, sheets: ['T0'], note: 'barley on the saddle\'s west flank' }),
    P(44, 'terr.e', 'East Terraces', 'terrace', 'site', [-250, -80, 90, 260], { decor: 0, sheets: ['T0'], note: 'barley and peas' }),
    P(45, 'terr.n', 'North Terraces', 'terrace', 'site', [-500, -340, -200, 200], { decor: 0, sheets: ['T0'], note: 'barley on the rising ground toward the rim' }),
    P(46, 'tea', 'Tea Garden', 'field', 'site', [-330, -290, -160, -90], { decor: 0, sheets: ['T0'] }),
    P(47, 'threshing', 'Threshing Floor', 'threshing', 'site', [-300, -280, 130, 150], { circ: true, decor: 0, sheets: ['T0'] }),
    P(48, 'midden', 'Midden', 'midden', 'site', [-280, -268, -110, -90], { decor: 0, sheets: ['T0'] }),
    P(49, 'tank', 'Saddle Tank', 'tank', 'site', [-338, -316, -40, -10], { decor: 0, sheets: ['T0'], note: 'the saddle\'s runoff for the herd and the terraces' })];

  /* ways (polylines) */
  const ways = [
    { id: 'road', name: 'the road from Erehwon (105 km straight, round the rim)', pts: [[-560, -330], [-420, -200], [-310, -40], [-246, 0]] },
    { id: 'fortroad', name: 'the fort road (outside the precinct\'s west wall to the Ward Gate)', pts: [[-310, -40], [-250, -72], [-120, -72], [-60, -60], [-48.44, -44.64]] },
    { id: 'kora.path', name: 'the kora (three times, eyes lowered)', pts: [[-130, 0], [-130, -30], [-72, -30], [-72, 30], [-130, 30], [-130, 0]] }];

  /* the generator's cable, from the engines to the plinth, through the fort's gate passage */
  const cable = { from: 'generator', to: 'plinth', pts: [[-50, -16], [-41, -9], [-34, -1.5], [-27.6, -1.5], [-6, -1.5]] };

  /* the lamp: on the plinth's roof, 22 m over the crown. Sights on the 2 km grid from 853,1540 (bilinear ground, a mark of
     10-30 m at the target, Earth's curve with refraction k 0.13): clear = the least gap in metres; must = the order needs it */
  const lamp = {
    at: [0, 0], h: 22, head: { d: 1.6, len: 2.2, face: 1.4, mount: 2.6 }, kw: 1.0, nightHours: 12,
    sights: [
      { id: 'g1', name: 'G1, the Brow post (Strongwall\'s line)', px: [917, 1648], km: 251, bearing: 149, clear: 32, must: true },
      { id: 'tempest', name: 'the House of the Tempest', px: [886, 1619], km: 171, bearing: 157, clear: 25, must: true },
      { id: 'tears', name: 'the Golden Tears\' camp', px: [850, 1628], km: 176, bearing: 181, clear: 28, must: true },
      { id: 'sauropolis', name: 'Sauropolis', px: [765, 1596], km: 208, bearing: 237, clear: 11, must: false },
      { id: 'tuatara', name: 'Tuatara', px: [818, 1554], km: 75, bearing: 248, clear: 37, must: true },
      { id: 'pin', name: 'the ravine (the tune pin)', px: [846, 1540], km: 14, bearing: 270, clear: 22, must: false },
      { id: 'komodo', name: 'Komodo', px: [865, 1617], km: 155, bearing: 171, clear: -555, must: false },
      { id: 'strongwall', name: 'Strongwall', px: [912, 1640], km: 232, bearing: 149, clear: -265, must: false, via: 'g1' },
      /* the stations that moved with the edit 7 re-run (the tune, 2026-11-16), taken on a composite: today's model with the
         shoulder (850-858 x 1534-1544) from the model before the re-run, as the scale-model session restores it
         (provisional until that edit is merged: step B0) */
      { id: 'march.s', name: 'the south watch fort (moved to 847,1549, at -1,319 m below the scarp)', px: [847, 1549], km: 22, bearing: 214, clear: -288, must: false, note: 'at 843,1546 (10 km off) it would see the lamp by +25 m and Tuatara by +34: the fort\'s place is the open-world session\'s' },
      { id: 'march.w', name: 'the west watch fort (moved)', px: [818, 1531], km: 72, bearing: 284, clear: -216, must: false },
      { id: 'erehwon', name: 'Erehwon (moved to the new lake\'s south shore)', px: [841, 1517], km: 52, bearing: 332, clear: -468, must: false, via: 'eye' },
      { id: 'eye', name: 'the Eye Post (the Order of the Flashing Eye, the relay to the capital)', px: [881, 1526], km: 63, bearing: 63, clear: -95, must: false, via: 'rimpost', note: 'the restored rim massif north-east of the knoll (1,111 m at 857.9,1537.5) stands in the line; a 40 m lamp still misses by 80 m' }],
    /* relays: posts that carry the lamp's signals to a station it cannot see (the fort asset's watch post, XFORT.post()) */
    relays: [
      { id: 'rimpost', name: 'the Rim Post (the order\'s relay to the Flashing Eye)', px: [856, 1532], h: 12, ground: 1578, km: 17, to: 'eye', seeLamp: 57, seeFar: 68,
        note: 'on the rim massif 17 km north-north-east of the lamp: a watch post with a mirror and a shuttered lamp, two keepers on the Lamp Watch\'s rota; not needed if the restore leaves the massif lowered (then the lamp sees the Eye by +14 m)' }]
  };

  /* the power, from the tune (core/region/data/xan-tune.js: T.oil.kgYr 400,000, licence 0.2, T.lit['march.e'] 0.02,
     T.chain.dynamo 3 kWh a kg) */
  const power = { oilKgYr: 400000 * 0.2 * 0.02, kWhPerKg: 3 };

  /* who lives here: the owner's ~300 for the order; the tune's 150 for the fort */
  const census = { prismarch: 12, chapter: 150, school: 36, novices: 60, lay: 42, garrison: 120, fortfolk: 30 };
  const orderGroups = ['prismarch', 'chapter', 'school', 'novices', 'lay'], fortGroups = ['garrison', 'fortfolk'];

  return { frame, ground, fort, zones, walls, gates, parts, ways, cable, lamp, power, census, orderGroups, fortGroups };
})();
if (typeof module !== 'undefined') module.exports = BEACON_LAYOUT;
