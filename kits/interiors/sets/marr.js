/* ======================== Interior set: Marr (kits/marr) ========================
   The interiors of the Marr kit's buildings (Porta Marr, sxmeztkqg7): one item per VERN.def key
   (kits/marr/src/70m, 70n, 70o, 70p, 71m, 72m, 73m, 74m). Local frame = the builders': origin at
   the plot centre on the ground, +z the front (the door side), metres. Each body is the builder's
   vnBody (hollow when the item exists); `poly` is its outer face, `y` its base, `levels` its
   storey heights.
   Furniture culture: iziz (kits/catalog/krator-master-furniture-iziz.js), chained to generic.
   Wealth from the def's tag: poor 0.2, middle 0.5, rich 0.8, civic 0.65.
   The governor's palace (mar_governor_palace) uses the shared vassal palace blueprint (same room
   cells, partitions, doors, and seven corner/flank pavilions as talia.js and pylon.js), drawn by
   74m-mar-palace.js marpInterior from the item's `plan`.
   Open courtyards, parks, market plazas, canal quays, bridges, and solid ramparts/gates list a
   `skip` reason.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const POOR = 0.2, MID = 0.5, RICH = 0.8, CIVIC = 0.65;
  const SF = ['single-family dwelling'], MF = ['multi-family dwelling'], CIV = ['civic'];
  const L = [];
  const add = function (it) { it.culture = it.culture || 'iziz'; L.push(it); return it; };

  /* ---------------- COURTYARDS & GRID-BREAK LOTS (70m) */
  add({ key: 'mar_grid_break_lots', name: 'Grid-break expanded N/S lots & lane', wealth: MID, types: ['market/shop'].concat(MF), units: 2, lot: [20, 28],
    bodies: [
      { id: 'north', poly: rect(17.6, 4.2, 0, -3.8), y: 0.25, wall: 0.26, roof: 'hip',
        levels: [{ h: 3.3 }, { h: 3.0 }],
        doors: [{ at: [0, -1.7], w: 2.1 }],
        program: [['shop', 'living', 'kitchen'], ['bedroom', 'bedroom', 'living']] },
      { id: 'south', poly: rect(17.6, 4.2, 0, 11.4), y: 0.25, wall: 0.26, roof: 'hip',
        levels: [{ h: 3.3 }, { h: 3.0 }],
        doors: [{ at: [0, 13.5], w: 2.2 }],
        program: [['living', 'kitchen', 'store'], ['bedroom', 'bedroom', 'living']] }],
    note: 'the expanded north and south ranges flanking the cross-street (Ruga de Entre-Kortas); the square Korta de Gardon at the north is open' });

  /* ---------------- POOR & CANAL SHADES (70n) */
  add({ key: 'mar_shades_shanty', name: 'Shades canal-stilt shanty', wealth: POOR, types: SF, lot: [10, 12],
    bodies: [{ id: 'shanty', poly: rect(6.8, 5.2, -0.4, -1.2), y: 0.7, wall: 0.22, roof: 'gable',
      levels: [{ h: 2.6 }],
      doors: [{ at: [-1.2, 1.4], w: 1.0 }],
      program: ['cottage'] }],
    note: 'the timber cabin over the canal deck; the timber lean-to and catwalk are open' });

  add({ key: 'mar_shades_tenement', name: 'Rookery courtyard tenement (Korta de Ombres)', wealth: POOR, types: MF, units: 3, lot: [20, 16],
    bodies: [
      { id: 'rear', poly: rect(17.4, 5.4, 0, -3.9), y: 0.25, wall: 0.26, roof: 'hip',
        levels: [{ h: 3.0 }, { h: 2.8 }, { h: 2.6 }],
        doors: [{ at: [0, -1.2], w: 1.15 }],
        program: [['living', 'kitchen', 'bedroom'], ['dormitory', 'bedroom'], ['dormitory', 'bedroom']] },
      { id: 'west', poly: rect(4.4, 7.7, -6.5, 2.65), y: 0.25, wall: 0.24, roof: 'hip',
        levels: [{ h: 3.0 }, { h: 2.8 }, { h: 2.6 }],
        doors: [{ at: [-6.5, 6.5], w: 1.1 }],
        program: [['living', 'kitchen'], ['bedroom'], ['dormitory']] },
      { id: 'east', poly: rect(4.4, 7.7, 6.5, 2.65), y: 0.25, wall: 0.24, roof: 'hip',
        levels: [{ h: 3.0 }, { h: 2.8 }, { h: 2.6 }],
        doors: [{ at: [6.5, 6.5], w: 1.1 }],
        program: [['living', 'kitchen'], ['bedroom'], ['dormitory']] }],
    note: 'the rear range and the two side wings round the laundry court' });

  add({ key: 'mar_canal_loft', name: 'Canal net-mender\'s loft & slip', wealth: POOR, types: ['industry'].concat(SF), lot: [11, 15],
    bodies: [{ id: 'loft', poly: rect(8.8, 11.8, 0, 0), y: 0.25, wall: 0.26, roof: 'gable',
      levels: [{ h: 3.0 }, { h: 2.8 }],
      doors: [{ at: [-1.6, 5.9], w: 2.6 }, { at: [2.4, 5.9], w: 1.05 }],
      program: [['store', 'workshop'], ['living', 'bedroom', 'kitchen']] }],
    note: 'the boat-slip store and net-mending workshop on the ground floor, the family flat above' });

  add({ key: 'mar_smuggler_cellar', name: 'Smuggler\'s canal-vault house', wealth: POOR, types: ['market/shop'].concat(SF), lot: [13, 14],
    bodies: [{ id: 'house', poly: rect(11.2, 11.6, 0, 0), y: 2.6, wall: 0.26, roof: 'hip',
      levels: [{ h: 3.0 }],
      doors: [{ at: [3.2, 5.8], w: 1.15 }],
      program: ['living', 'kitchen', 'bedroom', 'store'] }],
    note: 'the dwelling on the vaulted stone canal undercroft, reached by the external side stair' });

  add({ key: 'mar_creole_cottage', name: 'Creole cottage (four-bay)', wealth: POOR, types: MF, units: 2, lot: [12, 13],
    bodies: [{ id: 'cottage', poly: rect(10.6, 10.2, 0, -0.6), y: 0.35, wall: 0.25, roof: 'gable',
      levels: [{ h: 3.1 }],
      doors: [{ at: [-1.95, 4.5], w: 1.1 }, { at: [1.95, 4.5], w: 1.1 }],
      program: ['living', 'kitchen', 'bedroom', 'bedroom'] }],
    note: 'two side-by-side cottage households under the wide front gallery' });

  add({ key: 'mar_shotgun_single', name: 'Single shotgun house', wealth: POOR, types: SF, lot: [7, 17],
    bodies: [{ id: 'house', poly: rect(5.2, 14.4, 0, -0.6), y: 0.4, wall: 0.24, roof: 'gable',
      levels: [{ h: 3.1 }],
      doors: [{ at: [-1.1, 6.6], w: 1.05 }],
      program: ['living', 'bedroom', 'kitchen'] }] });

  add({ key: 'mar_shotgun_double', name: 'Double shotgun house', wealth: POOR, types: MF, units: 2, lot: [11, 17],
    bodies: [{ id: 'house', poly: rect(9.8, 13.6, 0, -0.8), y: 0.4, wall: 0.25, roof: 'hip',
      levels: [{ h: 3.2 }],
      doors: [{ at: [-1.3, 6.0], w: 1.05 }, { at: [1.3, 6.0], w: 1.05 }],
      program: ['living', 'kitchen', 'bedroom', 'bedroom'] }] });

  add({ key: 'mar_fishers_row', name: 'Fishermen\'s terrace row (three-unit)', wealth: POOR, types: MF, units: 3, lot: [18, 12],
    bodies: [0, 1, 2].map(function (i) {
      const sx = (i - 1) * 5.6;
      return { id: 'unit' + (i + 1), poly: rect(5.6, 9.4, sx, 0), y: 0.3, wall: 0.24, roof: 'gable',
        levels: [{ h: 2.8 }, { h: 2.4 }],
        doors: [{ at: [sx - 1.1, 4.7], w: 1.0 }],
        program: [['living', 'kitchen'], ['bedroom']] };
    }) });

  /* ---------------- MIDDLE CLASS & COLONIAL QUARTER (70o) */
  add({ key: 'mar_casa_patio', name: 'Colonial courtyard house (Kasa de Korta)', wealth: MID, types: SF, lot: [19, 17],
    bodies: [{ id: 'front', poly: rect(17.6, 6.2, 0, 4.6), y: 0.28, wall: 0.28, roof: 'hip',
      levels: [{ h: 3.3 }, { h: 3.1 }],
      doors: [{ at: [0, 7.7], w: 2.2 }],
      program: [['antechamber', 'living', 'kitchen'], ['bedroom', 'bedroom', 'study']] }],
    note: 'the two-storey street range; the enclosed pleasure patio behind is open' });

  add({ key: 'mar_townhouse_iron', name: 'Iron-gallery townhouse', wealth: MID, types: ['market/shop'].concat(SF), lot: [13, 15],
    bodies: [{ id: 'house', poly: rect(11.6, 12.4, 0, -0.8), y: 0.3, wall: 0.28, roof: 'flat',
      levels: [{ h: 3.5 }, { h: 3.2 }, { h: 3.0 }],
      doors: [{ at: [-3.4, 5.4], w: 2.2 }],
      program: [['shop', 'store', 'kitchen'], ['living', 'study'], ['bedroom', 'bedroom']] }] });

  add({ key: 'mar_corner_french', name: 'Wrap-gallery corner house', wealth: MID, types: ['market/shop', 'tavern/inn'].concat(MF), units: 2, lot: [16, 16],
    bodies: [{ id: 'corner', poly: rect(13.6, 13.6, -0.8, -0.8), y: 0.3, wall: 0.28, roof: 'hip',
      levels: [{ h: 3.5 }, { h: 3.2 }, { h: 3.0 }],
      doors: [{ at: [-0.8, 6.0], w: 2.2 }, { at: [6.0, -0.8], w: 2.2 }],
      program: [['shop', 'tavern', 'kitchen'], ['living', 'bedroom', 'study'], ['bedroom', 'bedroom', 'living']] }] });

  add({ key: 'mar_corner_mirador', name: 'Mirador corner house', wealth: MID, types: SF, lot: [16, 16],
    bodies: [{ id: 'house', poly: rect(14.4, 14.4, 0, 0), y: 0.32, wall: 0.28, roof: 'flat',
      levels: [{ h: 3.8 }, { h: 3.3 }, { h: 3.1 }],
      doors: [{ at: [-2.2, 7.2], w: 2.1 }],
      program: [['antechamber', 'living', 'kitchen', 'store'], ['hall', 'study', 'living'], ['bedroom', 'bedroom', 'bedroom']] }] });

  add({ key: 'mar_bruges_canal_house', name: 'Canal-gable townhouse pair', wealth: MID, types: ['market/shop'].concat(MF), units: 2, lot: [15, 15],
    bodies: [
      { id: 'left', poly: rect(7.2, 12.4, -3.2, 0), y: 0.35, wall: 0.26, roof: 'gable',
        levels: [{ h: 3.3 }, { h: 3.1 }],
        doors: [{ at: [-4.4, 6.2], w: 1.8 }],
        program: [['shop', 'kitchen'], ['living', 'bedroom']] },
      { id: 'right', poly: rect(6.4, 12.4, 3.6, 0), y: 0.35, wall: 0.26, roof: 'gable',
        levels: [{ h: 3.1 }, { h: 2.9 }],
        doors: [{ at: [3.6, 6.2], w: 2.2 }],
        program: [['store', 'kitchen'], ['living', 'bedroom']] }] });

  add({ key: 'mar_artisan_court', name: 'Artisan workshop & vegetable patio', wealth: MID, types: ['industry', 'market/shop'].concat(SF), lot: [18, 16],
    bodies: [
      { id: 'rear', poly: rect(16.8, 6.0, 0, -4.2), y: 0.25, wall: 0.26, roof: 'hip',
        levels: [{ h: 3.3 }, { h: 2.9 }],
        doors: [{ at: [2.6, -1.2], w: 2.2 }],
        program: [['workshop', 'kitchen', 'store'], ['living', 'bedroom', 'bedroom']] },
      { id: 'west', poly: rect(5.4, 8.4, -5.6, 3.0), y: 0.25, wall: 0.26, roof: 'hip',
        levels: [{ h: 3.3 }, { h: 2.9 }],
        doors: [{ at: [-5.6, 7.2], w: 2.2 }],
        program: [['shop', 'workshop'], ['study', 'store']] }] });

  add({ key: 'mar_boarding_house', name: 'Mariners\' boarding house (Kasa de Huespedes)', wealth: MID, types: ['tavern/inn'].concat(MF), units: 3, lot: [17, 15],
    bodies: [{ id: 'house', poly: rect(15.6, 11.6, 0, -0.8), y: 0.3, wall: 0.28, roof: 'hip',
      levels: [{ h: 3.3 }, { h: 3.1 }, { h: 2.8 }],
      doors: [{ at: [0, 5.0], w: 2.0 }],
      program: [['tavern', 'kitchen', 'store'], ['dormitory', 'bedroom', 'kitchen'], ['dormitory', 'bedroom', 'bedroom']] }] });

  add({ key: 'mar_chapel_barrio', name: 'Barrio chapel (Kapiya de Bario)', wealth: MID, types: ['civic', 'religious'], lot: [14, 18],
    bodies: [{ id: 'nave', poly: rect(11.2, 15.6, 0, 0), y: 0.45, wall: 0.32, roof: 'gable',
      levels: [{ h: 6.2 }],
      doors: [{ at: [0, 7.8], w: 2.4 }],
      program: ['shrine', 'antechamber'] }] });

  add({ key: 'mar_posada', name: 'Courtyard posada & coaching inn', wealth: MID, types: ['tavern/inn'], lot: [22, 19],
    bodies: [
      { id: 'front', poly: rect(21.2, 5.2, 0, 6.2), y: 0.28, wall: 0.28, roof: 'hip',
        levels: [{ h: 3.4 }, { h: 3.2 }],
        doors: [{ at: [0, 8.8], w: 2.8 }],
        program: [['tavern', 'kitchen', 'store'], ['bedroom', 'bedroom', 'dormitory']] },
      { id: 'back', poly: rect(21.2, 5.2, 0, -6.2), y: 0.28, wall: 0.28, roof: 'hip',
        levels: [{ h: 3.4 }, { h: 3.2 }],
        doors: [{ at: [0, -3.6], w: 2.2 }],
        program: [['stable', 'store', 'workshop'], ['dormitory', 'bedroom', 'bedroom']] }] });

  /* ---------------- RICH & MERCHANT PALACIOS (70p) */
  add({ key: 'mar_garden_mansion', name: 'Garden District mansion (Kasa de Kolonas)', wealth: RICH, types: SF, lot: [26, 22],
    bodies: [
      { id: 'main', poly: rect(17.6, 11.6, -3.8, -4.6), y: 0.45, wall: 0.32, roof: 'hip',
        levels: [{ h: 4.0 }, { h: 3.7 }],
        doors: [{ at: [1.6, 1.2], w: 2.4 }],
        program: [['antechamber', 'hall', 'living', 'kitchen'], ['bedroom', 'bedroom', 'library', 'study']] },
      { id: 'west', poly: rect(8.0, 9.2, -8.6, 5.8), y: 0.45, wall: 0.3, roof: 'hip',
        levels: [{ h: 4.0 }, { h: 3.7 }],
        doors: [{ at: [-8.6, 10.4], w: 2.2 }],
        program: [['study', 'store'], ['bedroom', 'living']] }] });

  add({ key: 'mar_palacio_baroque', name: 'Grandee\'s courtyard palacio (Palasio de Markes)', wealth: RICH, types: SF, lot: [28, 25],
    bodies: [
      { id: 'front', poly: rect(27.2, 6.4, 0, 8.6), y: 0.48, wall: 0.32, roof: 'flat',
        levels: [{ h: 4.0 }, { h: 3.7 }],
        doors: [{ at: [0, 11.8], w: 2.8 }],
        program: [['antechamber', 'hall', 'study', 'store'], ['hall', 'library', 'bedroom', 'study']] },
      { id: 'back', poly: rect(27.2, 6.4, 0, -8.6), y: 0.48, wall: 0.32, roof: 'flat',
        levels: [{ h: 4.0 }, { h: 3.7 }],
        doors: [{ at: [0, -5.4], w: 2.2 }],
        program: [['living', 'kitchen', 'store'], ['bedroom', 'bedroom', 'bedroom']] }] });

  add({ key: 'mar_azulejo_villa', name: 'Azulejo & mirador villa', wealth: RICH, types: SF, lot: [24, 20],
    bodies: [
      { id: 'rear', poly: rect(21.6, 8.4, 0, -5.4), y: 0.4, wall: 0.3, roof: 'hip',
        levels: [{ h: 3.8 }, { h: 3.5 }],
        doors: [{ at: [0, -1.2], w: 2.2 }],
        program: [['hall', 'living', 'kitchen'], ['bedroom', 'bedroom', 'library']] },
      { id: 'west', poly: rect(5.2, 10.8, -8.2, 4.2), y: 0.4, wall: 0.28, roof: 'hip',
        levels: [{ h: 3.8 }, { h: 3.5 }],
        doors: [{ at: [-8.2, 9.6], w: 2.0 }],
        program: [['study'], ['bedroom']] },
      { id: 'east', poly: rect(5.2, 10.8, 8.2, 4.2), y: 0.4, wall: 0.28, roof: 'hip',
        levels: [{ h: 3.8 }, { h: 3.5 }],
        doors: [{ at: [8.2, 9.6], w: 2.0 }],
        program: [['antechamber'], ['bedroom']] }] });

  add({ key: 'mar_captains_house', name: 'Sea-captain\'s belvedere house', wealth: RICH, types: SF, lot: [18, 17],
    bodies: [{ id: 'house', poly: rect(16.8, 15.6, 0, 0), y: 0.42, wall: 0.3, roof: 'flat',
      levels: [{ h: 3.7 }, { h: 3.4 }, { h: 3.1 }],
      doors: [{ at: [0, 7.8], w: 2.3 }],
      program: [['antechamber', 'hall', 'kitchen', 'store'], ['living', 'library', 'study'], ['bedroom', 'bedroom', 'study']] }] });

  add({ key: 'mar_consulado_house', name: 'Factor\'s trading house (Kasa de Konsulado)', wealth: RICH, types: ['civic', 'market/shop'].concat(SF), lot: [20, 18],
    bodies: [{ id: 'front', poly: rect(18.8, 9.6, 0, 3.8), y: 0.4, wall: 0.3, roof: 'flat',
      levels: [{ h: 3.8 }, { h: 3.5 }],
      doors: [{ at: [0, 8.6], w: 2.5 }],
      program: [['antechamber', 'study', 'store', 'kitchen'], ['hall', 'library', 'bedroom', 'bedroom']] }] });

  add({ key: 'mar_hacienda', name: 'Suburban walled hacienda (Asienda de Kampo)', wealth: RICH, types: ['farm'].concat(SF), lot: [32, 24],
    bodies: [
      { id: 'manor', poly: rect(29.6, 8.4, 0, -6.8), y: 0.35, wall: 0.3, roof: 'hip',
        levels: [{ h: 3.6 }, { h: 3.2 }],
        doors: [{ at: [0, -2.6], w: 2.2 }],
        program: [['hall', 'living', 'kitchen', 'store'], ['bedroom', 'bedroom', 'bedroom', 'study']] },
      { id: 'chapel', poly: rect(6.4, 11.0, 11.4, 2.9), y: 0.35, wall: 0.28, roof: 'gable',
        levels: [{ h: 5.2 }],
        doors: [{ at: [11.4, 8.4], w: 2.0 }],
        program: ['shrine', 'antechamber'] },
      { id: 'press', poly: rect(6.0, 11.0, -11.6, 2.9), y: 0.35, wall: 0.26, roof: 'hip',
        levels: [{ h: 3.6 }],
        doors: [{ at: [-11.6, 8.4], w: 2.2 }],
        program: ['workshop', 'store'] }] });

  /* ---------------- TRADE, WATERFRONT & NIGHTLIFE (71m) */
  add({ key: 'mar_smuggler_warehouse', name: 'Smuggler\'s canal warehouse (Almasen de Kanala)', wealth: POOR, types: ['industry', 'market/shop'], lot: [20, 15],
    bodies: [
      { id: 'west', poly: rect(9.2, 13.2, -4.6, 0), y: 2.4, wall: 0.28, roof: 'gable',
        levels: [{ h: 3.4 }, { h: 3.0 }],
        doors: [{ at: [-4.6, 6.6], w: 2.2 }],
        program: [['store', 'store'], ['store', 'workshop']] },
      { id: 'east', poly: rect(9.2, 13.2, 4.6, 0), y: 2.4, wall: 0.28, roof: 'gable',
        levels: [{ h: 3.4 }, { h: 3.0 }],
        doors: [{ at: [4.6, 6.6], w: 2.2 }],
        program: [['store', 'store'], ['store', 'study']] }] });

  add({ key: 'mar_cantina', name: 'Harbour cantina & rum tavern (Kantina del Puerto)', wealth: POOR, types: ['tavern/inn'], lot: [16, 14],
    bodies: [{ id: 'cantina', poly: rect(13.2, 11.6, -0.8, -0.8), y: 0.3, wall: 0.26, roof: 'hip',
      levels: [{ h: 3.5 }, { h: 3.2 }],
      doors: [{ at: [-0.8, 5.0], w: 2.2 }],
      program: [['tavern', 'kitchen', 'store'], ['dormitory', 'bedroom', 'bedroom']] }] });

  add({ key: 'mar_lantern_house', name: 'Red-lantern music & pleasure house (Kasa de Faroles)', wealth: MID, types: ['tavern/inn'], lot: [17, 15],
    bodies: [{ id: 'house', poly: rect(15.6, 13.2, 0, -0.8), y: 0.35, wall: 0.28, roof: 'flat',
      levels: [{ h: 3.8 }, { h: 3.5 }, { h: 3.3 }],
      doors: [{ at: [0, 5.8], w: 2.4 }],
      program: [['tavern', 'kitchen', 'store'], ['hall', 'living', 'study'], ['bedroom', 'bedroom', 'bedroom']] }] });

  add({ key: 'mar_chandlery', name: 'Ship\'s chandlery & compass shop', wealth: MID, types: ['market/shop', 'industry'], lot: [16, 13],
    bodies: [{ id: 'shop', poly: rect(14.8, 11.8, 0, 0), y: 0.3, wall: 0.28, roof: 'hip',
      levels: [{ h: 3.6 }, { h: 3.3 }],
      doors: [{ at: [0, 5.9], w: 2.1 }],
      program: [['shop', 'workshop', 'store'], ['living', 'bedroom', 'study']] }] });

  add({ key: 'mar_rum_bodega', name: 'Rum bodega & copper distillery', wealth: MID, types: ['industry', 'market/shop'], lot: [22, 16],
    bodies: [
      { id: 'bodega', poly: rect(12.8, 12.2, -3.8, -1.2), y: 0.28, wall: 0.3, roof: 'gable',
        levels: [{ h: 5.8 }],
        doors: [{ at: [-3.8, 4.9], w: 2.5 }],
        program: ['izwork_brewery', 'store', 'store'] },
      { id: 'still', poly: rect(7.6, 8.2, 6.4, -3.2), y: 0.28, wall: 0.28, roof: 'hip',
        levels: [{ h: 4.2 }, { h: 3.2 }],
        doors: [{ at: [6.4, 0.9], w: 2.0 }],
        program: [['workshop', 'store'], ['study', 'store']] }] });

  add({ key: 'mar_mercado_hall', name: 'Covered iron & stone market hall (Merkado del Puerto)', wealth: MID, types: ['market/shop'], lot: [26, 18],
    bodies: [{ id: 'hall', poly: rect(24.0, 16.0, 0, 0), y: 0.35, wall: 0.32, roof: 'hip',
      levels: [{ h: 5.4 }],
      doors: [{ at: [0, 8.0], w: 2.8 }, { at: [0, -8.0], w: 2.8 }],
      program: ['shop', 'shop', 'shop', 'store'] }] });

  add({ key: 'mar_portal_arcade', name: 'Plaza arcade block (Portal de Komersio)', wealth: MID, types: ['market/shop'], lot: [24, 15],
    bodies: [{ id: 'arcade', poly: rect(23.2, 12.8, 0, -1.1), y: 0.35, wall: 0.3, roof: 'flat',
      levels: [{ h: 4.0 }, { h: 3.6 }],
      doors: [{ at: [-9.3, 5.3], w: 2.2 }, { at: [-1.86, 5.3], w: 2.2 }, { at: [5.58, 5.3], w: 2.2 }],
      program: [['shop', 'shop', 'shop', 'store'], ['living', 'bedroom', 'study', 'store']] }] });

  add({ key: 'mar_boatyard_slip', name: 'Canal boatyard & careening slip', wealth: MID, types: ['industry'], lot: [22, 18],
    bodies: [{ id: 'shed', poly: rect(11.2, 10.2, -4.6, -2.6), y: 1.0, wall: 0.28, roof: 'gable',
      levels: [{ h: 5.2 }],
      doors: [{ at: [-9.1, 2.5], w: 1.4 }],
      program: ['izwork_boat', 'workshop', 'store'] }] });

  /* ---------------- CIVIC, MARITIME & RELIGIOUS (72m) */
  add({ key: 'mar_navigators_guild', name: 'Navigators\' Guild & Hydrographic House (Kasa del Mar)', wealth: CIVIC, types: CIV, lot: [50, 40],
    bodies: [
      { id: 'south', poly: rect(46.0, 11.0, 0, 12.5), y: 0.65, wall: 0.36, roof: 'flat',
        levels: [{ h: 5.2 }, { h: 4.6 }],
        doors: [{ at: [0, 18.0], w: 3.4 }, { at: [0, 7.0], w: 2.6 }],
        program: [['antechamber', 'hall', 'study', 'study', 'store'], ['hall', 'library', 'study', 'study']] },
      { id: 'north', poly: rect(46.0, 11.0, 0, -12.5), y: 0.65, wall: 0.36, roof: 'flat',
        levels: [{ h: 5.2 }, { h: 4.6 }],
        doors: [{ at: [0, -7.0], w: 2.6 }],
        program: [['hall', 'library', 'study', 'store'], ['library', 'library', 'study', 'study']] }],
    note: 'the south entrance and examination wing and the north hydrographic archive wing across the Patio de los Vientos' });

  add({ key: 'mar_sea_temple', name: 'Baroque Sea-Temple (Katedral del Mar)', wealth: CIVIC, types: ['civic', 'religious'], lot: [30, 44],
    bodies: [{ id: 'nave', poly: rect(22.0, 34.0, 0, -1.0), y: 0.75, wall: 0.4, roof: 'gable',
      levels: [{ h: 10.8 }],
      doors: [{ at: [0, 16.0], w: 3.6 }],
      program: ['shrine', 'hall', 'antechamber', 'study', 'store'] }] });

  add({ key: 'mar_aduana', name: 'Royal Customs House (Real Aduana)', wealth: CIVIC, types: CIV, lot: [36, 26],
    bodies: [
      { id: 'front', poly: rect(34.0, 6.4, 0, 7.8), y: 0.5, wall: 0.34, roof: 'flat',
        levels: [{ h: 4.4 }, { h: 4.0 }],
        doors: [{ at: [0, 11.0], w: 3.2 }, { at: [0, 4.6], w: 2.4 }],
        program: [['antechamber', 'study', 'store', 'store'], ['hall', 'study', 'library', 'study']] },
      { id: 'back', poly: rect(34.0, 6.4, 0, -7.8), y: 0.5, wall: 0.34, roof: 'flat',
        levels: [{ h: 4.4 }, { h: 4.0 }],
        doors: [{ at: [0, -4.6], w: 2.4 }],
        program: [['store', 'store', 'study'], ['study', 'store', 'library']] }] });

  /* ---------------- INFRASTRUCTURE & FORTIFICATIONS (73m) */
  add({ key: 'mar_castillo_bastion', name: 'Harbour bastion fort (Kastiyo de San Felipe)', wealth: CIVIC, types: ['civic', 'military'], lot: [24, 22],
    bodies: [{ id: 'bastion', poly: rect(21.6, 19.6, 0, 0), y: 0.3, wall: 0.42, roof: 'flat',
      levels: [{ h: 3.5 }, { h: 3.15 }],
      doors: [{ at: [0, 9.8], w: 2.6 }],
      program: [['barracks', 'store', 'antechamber'], ['barracks', 'study', 'store']] }] });

  /* ---------------- THE GOVERNOR'S PALACE (74m): shared vassal palace blueprint (kits/marr/src/74m-mar-palace.js) */
  const PALACE = (function () {
    const PX = function (u, v) { return [-v, 1 - u]; };
    const BLK = [-4, 24, -18, 18], T = 0.4, PT = 0.16;
    const LV = [{ y: 1.2, h: 5.25 }, { y: 6.7, h: 4.25 }];
    const CELLS = [
      ['vest', 0, -4, 3, -5, 5, 'Vestibule (the second threshold)', 'antechamber'],
      ['guardR', 0, -4, 3, -12, -5, 'Guard room (the chancery side)', 'barracks'],
      ['guardL', 0, -4, 3, 5, 12, 'Guard room (the council side)', 'barracks'],
      ['chanP', 0, -4, -1.7, -18, -12, 'Chancery lobby', 'antechamber'],
      ['cityP', 0, -4, -1.7, 12, 18, 'Council lobby', 'antechamber'],
      ['customs', 0, -1.7, 9.5, -18, -12, 'Customs House of the Ring Sea', 'study'],
      ['clerk', 0, 9.5, 17, -18, -12, 'Chief Clerk', 'study'],
      ['clerkP', 0, 8, 17, -12, -7, 'Clerks\' passage', 'antechamber'],
      ['lcR', 0, 3, 8, -12, -7, 'Light court', null],
      ['lcL', 0, 3, 8, 7, 12, 'Light court', null],
      ['hall', 0, 3, 17, -7, 7, 'Sal de Trona (audience hall under the dome)', 'hall'],
      ['hallP', 0, 8, 17, 7, 12, 'Hall passage', 'antechamber'],
      ['magA', 0, -1.7, 9.5, 12, 18, 'Consuls\' anteroom', 'antechamber'],
      ['shrA', 0, 9.5, 17, 12, 18, 'Shrine antechamber', 'antechamber'],
      ['cab', 0, 17, 24, -2, 2, 'The Governor\'s cabinet', 'study'],
      ['pstG', 0, 17, 24, -7.6, -2, 'The private stair (the robing room)', 'store'],
      ['serv', 0, 17, 24, -18, -7.6, 'Servery and back stair', 'kitchen'],
      ['sec', 0, 17, 24, 2, 8, 'Secretary of the Person', 'study'],
      ['gardP', 0, 17, 24, 8, 12, 'Garden passage', 'antechamber'],
      ['famH', 0, 17, 24, 12, 18, 'Family hall', 'antechamber'],
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
      ['map', 1, 9.5, 17, 12, 18, 'Hydrographic map room', 'library'],
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
    const EDGE = { 'galV|hallV': 'rail', 'galSR|hallV': 'rail', 'galSL|hallV': 'rail', 'galR|galSR': 'open', 'galL|galSL': 'open',
      'pstTop|pstV': 'open', 'pstTop|wardU': 'open', 'pstV|wardU': 'rail', 'bath|pstV': 'rail', 'bath|bstV': 'open', 'bstV|dress': 'rail',
      'hall|lcR': 'glaze', 'hall|lcL': 'glaze', 'galSR|lcR2': 'glaze', 'galSL|lcL2': 'glaze' };
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
    const PAV = [
      { id: 'pavCh', u: -8, v: -18, R: 6.3, n: 12, st: [['Chancery of the Ring Sea', 'study'], ['Records of the Chancery', 'library']], arch: [[0, 0]] },
      { id: 'pavCo', u: -8, v: 18, R: 6.3, n: 12, st: [['Sal de Konsil (council hall)', 'hall'], ['The envoy\'s suite', 'bedroom']], arch: [[0, 11]] },
      { id: 'pavDi', u: 24, v: -18, R: 5, n: 10, st: [['State dining hall', 'hall'], ['The Governor\'s bedchamber', 'bedroom']], arch: [] },
      { id: 'pavFa', u: 24, v: 18, R: 5, n: 10, st: [['Family garden room', 'hall'], ['The spouse\'s suite', 'bedroom']], arch: [[0, 4]] },
      { id: 'pavGu', u: 8, v: -22, R: 3.6, n: 8, st: [['Guard pavilion (the duty guard)', 'antechamber'], null], arch: [[0, 0]] },
      { id: 'pavSh', u: 8, v: 22, R: 3.6, n: 8, st: [['Household sea-shrine', 'shrine']], arch: [[0, 2]] },
      { id: 'kitch', u: 31, v: -6, drum: 3.6, n: 8, st: [['Round kitchen', 'kitchen']], arch: [[0, 0]] }
    ];
    PAV.forEach(function (P) {
      P.c = PX(P.u, P.v); P.t = 0.35; P.rc = P.drum ? P.drum : P.R - 1.25; P.ri = P.rc - P.t;
      P.lv = P.drum ? [{ y: 1.2, h: 5.3 }] : [{ y: 1.2, h: 4.75 }, { y: 6.7, h: 3.75 }];
      P.ww = P.drum ? 1.1 : Math.min(1.45, Math.PI * 2 * P.rc / P.n * 0.48);
    });
    const yaw = function (P, k) { return (P.drum ? k : k + 0.5) / P.n * Math.PI * 2; };
    const EXT = [
      [0, 'vest', 'terrace', -4, 0, 2.4, true], [1, 'petH', 'terrace', 1.35, -18, 1.6, true],
      [0, 'chanP', 'pavCh', -4, -15, 1.2], [0, 'cityP', 'pavCo', -4, 15, 1.2], [1, 'recP', 'pavCh', -4, -15, 1.2], [1, 'envP', 'pavCo', -4, 15, 1.2],
      [0, 'serv', 'pavDi', 24, -15.5, 1.2], [0, 'famH', 'pavFa', 24, 15.5, 1.2], [1, 'dress', 'pavDi', 24, -15.5, 1.2], [1, 'spoA', 'pavFa', 24, 15.5, 1.2],
      [0, 'shrA', 'terrace', 11, 18, 1.2], [0, 'serv', 'terrace', 24, -9.3, 1.1]
    ];
    const byId = {}; CELLS.forEach(function (C) { byId[C[0]] = C; });
    const onBlk = function (s, val) { return Math.abs(val - BLK[s]) < 1e-6; };
    const inner = function (C) {
      const i = function (s, val) { return onBlk(s, val) ? T : PT / 2; };
      return [-C[5] + i(3, C[5]), -C[4] - i(2, C[4]), 1 - C[3] + i(1, C[3]), 1 - C[2] - i(0, C[2])];
    };
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
      const E = edgeOf(D[0], D[1], D[2]); if (!E) throw new Error('marr palace: no edge between ' + D[1] + ' and ' + D[2]);
      E.doors.push({ s: E.axis === 'u' ? D[4] : D[3], w: D[5] });
    });
    const rooms = [], doorsOf = {};
    const addDoor = function (id, d) { (doorsOf[id] = doorsOf[id] || []).push(d); };
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
    const BOX = [-BLK[3], -BLK[2], 1 - BLK[1], 1 - BLK[0]];
    const inBox = function (p) { return p[0] > BOX[0] + 1e-6 && p[0] < BOX[1] - 1e-6 && p[1] > BOX[2] + 1e-6 && p[1] < BOX[3] - 1e-6; };
    const cross = function (p, q) {
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
      if (C[0] === 'hall') fx.push({ id: 'dais', kind: 'dais', x: 0, z: -13.35, w: 6, d: 1.5, ry: 0, reach: false });
      if (C[0] === 'pstG') fx.push({ id: 'stair', kind: 'stair', x: 6.85, z: -19.25, w: 1.3, d: 4.5, ry: 0, reach: false });
      if (C[0] === 'serv') fx.push({ id: 'stair', kind: 'stair', x: 14.25, z: -16.7, w: 4.5, d: 1.1, ry: 0, reach: false });
      rooms.push({ id: C[0], name: C[6], kind: C[7], level: C[1], y: L.y, h: L.h, poly: [[b[0], b[2]], [b[1], b[2]], [b[1], b[3]], [b[0], b[3]]],
        doors: doorsOf[C[0]] || [], fixtures: fx });
    });
    PAV.forEach(function (P) {
      P.st.forEach(function (S, lv) {
        if (!S) return;
        const L = P.lv[lv];
        rooms.push({ id: P.id + lv, name: S[0], kind: S[1], level: lv, y: L.y, h: L.h, poly: discLessBlock(P.c[0], P.c[1], P.ri, P.drum ? 8 : 12),
          doors: doorsOf[P.id + lv] || [], wall: P.t });
      });
    });
    return { rooms: rooms, plan: { BLK: BLK, T: T, PT: PT, LV: LV, cells: CELLS, edges: edges, ext: EXT, pav: PAV } };
  })();
  add({ key: 'mar_governor_palace', name: 'Governor\'s palace (Palasio de Gobernar)', wealth: RICH, types: CIV.concat(SF), lot: [64, 76], wall: 0.2,
    rooms: PALACE.rooms, plan: PALACE.plan,
    note: 'the shared vassal palace blueprint rooms (palace_G.png and palace_U.png): the vestibule and guard rooms, the Sal de Trona under the dome, the governor\'s cabinet, secretary and private stair behind the dais, the customs and clerks on the right, the consuls\' anteroom and shrine antechamber on the left, the servery and back stair; above, the petitioners\' landing off the outside chancery stair, the galleries round the hall, the library and hydrographic map room, the residence behind, and the seven octagonal pavilions' });

  /* ---------------- NOT FURNISHED (open courtyards, parks, markets, canal infrastructure & ramparts) */
  const SKIP = [
    ['mar_patio_pleasure', 'Pleasure & fountain courtyard (Korta de Plejar)', [18, 16], RICH, SF, 'open inhabited pleasure courtyard (Korta de Plejar)'],
    ['mar_patio_vegetable', 'Vegetable & herb courtyard (Korta de Gardon)', [16, 14], MID, SF, 'open walled kitchen-garden courtyard (Korta de Gardon)'],
    ['mar_patio_working', 'Working service courtyard (Yarda de Guorka)', [16, 14], POOR, MF, 'open working service courtyard (Yarda de Guorka)'],
    ['mar_gardon_park', 'Grid-break public garden park (Gardon de Sidi)', [22, 18], MID, CIV, 'open walled public garden park on a >50% grid-break space'],
    ['mar_markita_plaza', 'Grid-break street market plaza (Markita de Ruga)', [24, 18], MID, ['market/shop'], 'open canopied street market plaza on a >50% grid-break space'],
    ['mar_canal_quay', 'Canal embankment, steps & gondola berth', [24, 10], MID, ['industry'], 'open stone canal embankment, water-stairs and moored gondola'],
    ['mar_canal_bridge', 'Humpback stone canal bridge (Ponte de Sidi)', [18, 14], MID, CIV, 'open single-arch stone humpback canal bridge (Ponte de Sidi)'],
    ['mar_tapia_wall', 'Seaward tapia & stone rampart wall', [24, 10], CIVIC, ['civic', 'military'], 'solid rammed-earth and stone seaward rampart wall'],
    ['mar_garita_watch', 'Cantilevered corner sentry turret (Garita)', [12, 12], CIVIC, ['civic', 'military'], 'solid cantilevered bartizan sentry turret and bastion corner'],
    ['mar_city_gate', 'Landward twin-tower city gate (Porta de Tera)', [26, 14], CIVIC, ['civic', 'military'], 'solid twin-bastion landward city gatehouse (Porta de Tera) with open vaulted carriageway']
  ];
  for (const [key, name, lot, wealth, types, why] of SKIP) add({ key: key, name: name, lot: lot, wealth: wealth, types: types, skip: why });

  IX.sets.add({ set: 'marr', title: 'Marr (Porta Marr)', culture: 'iziz', items: L });
})(KratorInteriors);
