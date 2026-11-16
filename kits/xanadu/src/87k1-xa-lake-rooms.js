// ================================================================= XANADU — the lake's trades' interiors (the set `xanadu-lake`)
// Opt-in, as 87k-xa-lake-trades.js is (2026-11-16; settlements/kirstabal/PLAN.md K5): read in place by name (settlements/kirstabal
// kit.json "external"), so no other page changes. The interior set items of the 87k pieces that hold rooms, written as
// kits/interiors/sets/xanadu.js writes the kit's (sets/README.md; the same local frame: origin at the plot centre on the
// ground, +z the front), and added as a set of its own (KratorInteriors.sets.add) when the page carries the interiors core.
// It belongs in kits/interiors/sets/ (as xanadu-lake.js); it moves there with the next rebuild of the interiors sheet, which
// inlines every set (TODO.md, the ride-along list).
//   xa_serai        the four ranges, two storeys each: the gate hall through the front range (the street to the court), the
//                   common room and the kitchen beside it; the stores and the shops at the back; the stables on the sides; the
//                   travellers' dormitories and rooms above. The corner towers stay solid (each range's rooms stop short of them)
//   xa_tea_factory  the withering lofts' ground storey: the rolling and sorting floors and the store (the two lofts over it are
//                   louvred, open to the air)
//   xa_latex_house  the sealing room at the back of the court (the drying halls are open-sided sheds)
//   xa_fermentary, xa_fish_racks   open sheds and racks: nothing enclosed
// The bodies are the builders' battered blocks (xnStack, xnWall), planned INSET on the footprint every storey shares (the kit's
// xnBatterK, as sets/xanadu.js's inset() and stack(), copied here: they are that file's own), so kits/iziz-vernacular 69e6
// draws those blocks hollow. [G data]
(function (IX) {
  'use strict';
  if (!IX || !IX.sets || IX.sets.byName['xanadu-lake']) return;
  const SH = IX.sets.shape, rect = SH.rect;
  const r3 = function (v) { return Math.round(v * 1000) / 1000; };
  const POOR = 0.2, MID = 0.5;
  /* sets/xanadu.js batK: the top of a battered w x h x d block is k times its base */
  function batK(w, h, d) { const want = 1 - 2 * h * 0.088 / Math.min(w, d); return want > 0.94 ? 0.96 : want > 0.89 ? 0.92 : want > 0.83 ? 0.86 : 0.8; }
  /* a body planned on P = [x0, x1, z0, z1] (inside the builder's blocks), its doors moved in onto it (sets/xanadu.js inset) */
  function inset(P, id, o) {
    const w = r3(P[1] - P[0]), d = r3(P[3] - P[2]), cx = r3((P[0] + P[1]) / 2), cz = r3((P[2] + P[3]) / 2);
    const doors = (o.doors || []).map(function (D) {
      const x = D.at[0], z = D.at[1], ex = Math.min(Math.abs(x - P[0]), Math.abs(x - P[1])), ez = Math.min(Math.abs(z - P[2]), Math.abs(z - P[3]));
      const outX = x < P[0] || x > P[1], outZ = z < P[2] || z > P[3];
      const onX = outX && !outZ ? true : outZ && !outX ? false : ex < ez;
      const at = onX ? [x < cx ? P[0] : P[1], Math.max(P[2] + 0.6, Math.min(P[3] - 0.6, z))] : [Math.max(P[0] + 0.6, Math.min(P[1] - 0.6, x)), z < cz ? P[2] : P[3]];
      return Object.assign({}, D, { at: [r3(at[0]), r3(at[1])] });
    });
    return { id: id, poly: rect(w, d, cx, cz), y: o.y || 0, levels: o.hs.map(function (h) { return { h: h }; }), wall: o.wall == null ? 0.45 : o.wall,
      roof: o.roof || 'flat', doors: doors, program: o.program, inset: true };
  }
  /* a battered stack (xnStack / xnWall) of base w x d at (cx, cz), storeys hs: its top storey's footprint */
  function topOf(cx, cz, w, d, hs) { let ww = w, dd = d; hs.forEach(function (h) { const k = batK(ww, h, dd); ww *= k; dd *= k; });
    return [cx - ww / 2, cx + ww / 2, cz - dd / 2, cz + dd / 2]; }

  /* the caravanserai (87k buildXaSerai: W = D = 40, ranges R = 7 deep, storeys 3.4 and 3.0 on a 0.35 m plinth; the corner towers
     5 m square centred 17.6 m out, so their bases begin 15.1 m out). The front and back ranges are planned to 14.5 m either side
     of the middle (clear of the towers; 69e6's inset rule holds a body down to 5 m inside its block), the side ranges whole */
  const SH2 = [3.4, 3.0], F = topOf(0, 16.5, 40, 7, SH2), S = topOf(16.5, 0, 7, 26, SH2);
  const front = [-14.5, 14.5, F[2], F[3]], back = [-14.5, 14.5, -F[3], -F[2]], east = [S[0], S[1], S[2], S[3]], west = [-S[1], -S[0], S[2], S[3]];
  const serai = [
    inset(front, 'front', { y: 0.35, hs: SH2, doors: [{ at: [0, 20], w: 3.2 }, { at: [0, 13], w: 3.2 }, { at: [-8, 13], w: 1.2 }, { at: [8, 13], w: 1.2 }],
      program: [['hall', 'tavern', 'kitchen'], ['dormitory', 'bedroom']] }),
    inset(back, 'back', { y: 0.35, hs: SH2, doors: [{ at: [-8, -13], w: 1.6 }, { at: [0, -13], w: 1.6 }, { at: [8, -13], w: 1.6 }],
      program: [['store', 'shop', 'store'], ['dormitory', 'dormitory']] }),
    inset(west, 'west', { y: 0.35, hs: SH2, doors: [{ at: [-13, -5], w: 2.4 }, { at: [-13, 5], w: 2.4 }], program: [['stable', 'stable'], ['bedroom', 'bedroom']] }),
    inset(east, 'east', { y: 0.35, hs: SH2, doors: [{ at: [13, -5], w: 2.4 }, { at: [13, 5], w: 2.4 }], program: [['stable', 'store'], ['bedroom', 'study']] })];
  IX.sets.add({ set: 'xanadu-lake', title: "Xanadu: the lake's trades (kits/xanadu 87k)", culture: 'xanadu', items: [
    { key: 'xa_serai', name: 'Caravanserai', culture: 'xanadu', wealth: MID, types: ['tavern/inn', 'market/shop'], lot: [46, 46], bodies: serai,
      note: 'the gate hall through the front range; every range opens on the court; the corner towers stay solid' },
    { key: 'xa_tea_factory', name: 'Tea factory', culture: 'xanadu', wealth: POOR, types: ['industry'], lot: [30, 28],
      bodies: [inset(topOf(0, -2, 26, 11, [3.2]), 'floor', { y: 0.35, hs: [3.2], doors: [{ at: [-8.667, 3.5], w: 2.2 }, { at: [0, 3.5], w: 2.2 }, { at: [8.667, 3.5], w: 2.2 }],
        program: ['workshop', 'workshop', 'store'] })],
      note: 'the ground storey under the withering lofts; the lofts are louvred, open' },
    { key: 'xa_latex_house', name: 'Latex house', culture: 'xanadu', wealth: MID, types: ['industry', 'religious'], lot: [42, 38],
      bodies: [inset(topOf(0, -12.8, 12, 6.6, [3.4]), 'sealing', { y: 0.3, hs: [3.4], doors: [{ at: [0, -9.5], w: 1.3 }], program: ['workshop', 'store'] })],
      note: 'the sealing room; the drying halls are open-sided sheds round the court' },
    { key: 'xa_fermentary', name: 'Cacao fermentary', types: ['industry'], skip: 'an open shed of sweat boxes and the drying floors' },
    { key: 'xa_fish_racks', name: 'Fish racks and smokehouse', types: ['industry'], skip: 'racks in the open and a smoke hut too small to plan' }] });
})(typeof KratorInteriors === 'undefined' ? null : KratorInteriors);
