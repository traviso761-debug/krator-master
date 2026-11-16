/* ======================== Interior set: Xanadu, the opt-in pieces (kits/xanadu/extra) ========================
   The rooms of the kit's opt-in pieces (kits/xanadu/extra: a page takes them through its kit.json "external", as
   settlements/pher does), registered as the set 'xanadu-extra' beside the kit's own ('xanadu', kits/interiors/sets/xanadu.js,
   whose item format this follows). It joins kits/interiors/sets/xanadu.js when the pieces join the kit's src/ (the
   all-builds ride-along). Runs after the furniture and interiors bundle (69d), which makes KratorInteriors.

   xa_caravanserai (88c-xa-caravanserai.js): each of the five ranges a body of two battered storeys (xnStack 3.8 + 3.2 m on a
   0.6 m plinth), planned INSET on the top storey's footprint as the kit's set does (the batter: 72-xa-helpers.js
   xnBatterK), its door on the court face. Below, the stores and the common room with its kitchen (the stables are the
   arcade's lean-to, outside the body); above, the travellers' rooms. The gate block and the four corner towers stay solid. */
(function (IX) {
  'use strict';
  if (!IX || !IX.sets) return;
  const rect = IX.sets.shape.rect, r3 = function (v) { return Math.round(v * 1000) / 1000; };
  function batK(w, h, d) { const want = 1 - 2 * h * 0.088 / Math.min(w, d); return want > 0.94 ? 0.96 : want > 0.89 ? 0.92 : want > 0.83 ? 0.86 : 0.8; }
  /* a battered range of storeys hs at (cx, cz), base w x d: the body on its top storey's footprint, its door moved onto that
     footprint's court face (toward the court's middle, the plot's origin) */
  function range(id, cx, cz, w, d, hs, program) {
    let ww = w, dd = d; hs.forEach(function (h) { const k = batK(ww, h, dd); ww *= k; dd *= k; });
    const alongX = w > d, door = alongX ? [cx, r3(cz - Math.sign(cz) * dd / 2)] : [r3(cx - Math.sign(cx) * ww / 2), cz];
    return { id: id, poly: rect(r3(ww), r3(dd), cx, cz), y: 0.6, levels: hs.map(function (h) { return { h: h }; }), wall: 0.45, roof: 'flat',
      doors: [{ at: door, w: 1.4 }], program: program, inset: true };
  }
  const HS = [3.8, 3.2];
  const L = [{ key: 'xa_caravanserai', name: 'Caravanserai', culture: 'xanadu', wealth: 0.5, types: ['tavern/inn', 'market/shop'], lot: [54, 56],
    bodies: [range('back', 0, -20.5, 34, 7, HS, [['tavern', 'kitchen', 'store'], ['bedroom', 'bedroom', 'bedroom', 'bedroom']]),
      range('east', 20.5, 0, 7, 34, HS, [['store', 'store'], ['bedroom', 'bedroom', 'bedroom']]),
      range('west', -20.5, 0, 7, 34, HS, [['store', 'store'], ['bedroom', 'bedroom', 'bedroom']]),
      range('front_e', 11.5, 20.5, 11, 7, HS, [['store'], ['bedroom']]),
      range('front_w', -11.5, 20.5, 11, 7, HS, [['store'], ['bedroom']])],
    note: 'five ranges round the court: the common room, its kitchen and the stores below, the travellers\' rooms above; the gate block and the corner towers solid' }];
  IX.sets.add({ set: 'xanadu-extra', title: 'Xanadu: the opt-in pieces', culture: 'xanadu', items: L });
})(typeof KratorInteriors !== 'undefined' ? KratorInteriors : null);
