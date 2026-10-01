/* ======================== Interior set: Highlands (settlements/highlands) ========================
   The Republican, Rustic and Tribal kits' interiors: one item per HL.def key (settlements/highlands
   src/74-88, registry keys hl_rep_* hl_rus_* hl_tri_*). Local frame = the builder's: origin at the
   plot centre on the ground, +z the front. Furniture cultures: republican, rustic, painted (the
   Painted Men's tribal branch). sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  IX.sets.add({ set: 'highlands', title: 'Highlands: Republican, Rustic, Tribal', culture: 'republican', items: [
    /* ---------- Republican dwellings (74-rep-dwell.js) */
    { key: 'hl_rep_house_poor_a', name: 'Log izba', culture: 'republican', wealth: 0.25, types: ['single-family dwelling'], lot: [13, 14],
      bodies: [{ id: 'izba', poly: rect(6.4, 6.8), y: 0.45, levels: [{ h: 2.7 }], wall: 0.28, roof: 'gable', pitch: 1.25,
        doors: [{ at: [3.2, 1.3], w: 0.95 }], program: ['cottage'] }],
      note: 'one log room under a steep gable; the attic (gable window) is loft space, not planned' },
    { key: 'hl_rep_house_poor_b', name: 'Two-room log house', culture: 'republican', wealth: 0.2, types: ['multi-family dwelling'], lot: [14, 9],
      bodies: [{ id: 'house', poly: rect(8.2, 5.4), y: 0.35, levels: [{ h: 2.6 }], wall: 0.28, roof: 'gable', pitch: 1.1,
        doors: [{ at: [-1.2, 2.7], w: 0.95 }], program: ['living', 'bedroom'] },
        { id: 'leanto', poly: rect(2.6, 4.8, 5.5, 0), y: 0, levels: [{ h: 2.2 }], wall: 0.12, roof: 'flat',
          doors: [{ at: [5.5, 2.4], w: 0.9 }], program: ['workshop'] }],
      note: 'the lean-to workshop on the +x side is board-walled with a salvage roof: planned as its own low body' }
  ] });
})(KratorInteriors);
