/* ======================== Interior set: Xanadu, the lake towns' works and the governor's house (kits/xanadu/extra) ========================
   The rooms of the lake towns' opt-in pieces (settlements/xanadu-lake step L5, the trades' rooms; BUILD-PLAN A6), registered as
   the set 'xanadu-lake-works' beside 'xanadu' (kits/interiors/sets/xanadu.js, whose item format and helpers this follows) and
   'xanadu-extra' (69dz, the caravanserai). It joins kits/interiors/sets/xanadu.js when the pieces join the kit's src/ (the
   all-builds ride-along, TODO.md). Runs after the furniture and interiors bundle (69d), which makes KratorInteriors. [G data]

   Each body is planned INSET on the footprint its builder's battered block (xnWall, xnStack: 72-xa-helpers.js xnBatterK) holds at
   its top, as the kit's set does, its doors moved in onto it from where the builder draws them; kits/iziz-vernacular 69e6 then
   draws that block hollow.
     xa_governor       (88h buildXaGovernor) the house: the dressed ground storey (xnWall 20 x 12, 4.2 m) and the washed upper
                       (xnStack on it, 3.6 m), the door under the audience portico; the office wing on the court's east (xnWall
                       7 x 7, 3.4 m), its door to the court
     xa_dye_works      (88g) the dye store (xnStack 9 x 6, 3.2 + 2.8 m): the madder, the indigo and the alum
     xa_loom_house     (88g) the hall (xnWall 28 x 10, 4.2 m on its 0.4 m plinth), a door at each end; the clerestory over it
     xa_saffron_house  (88g) the sorting floor (xnWall 12 x 8, 3.2 m on 0.35 m), entered through its arcade's middle arch; the
                       drying loft over it is louvred, open to the air
     xa_apiary         (88g) the honey house (xnWall 5 x 4, 2.8 m)
     xa_net_loft       (88h) the laying-up room (xnWall 14 x 8, 3.2 m); the loft over it is open at the front
   Left solid or open, on purpose (skip): the kiln yard's wheel shed, the reeling house, the mat shed, the sulfur works' melting
   shed (open-sided sheds), the quarry's tool hut (too small to plan). */
(function (IX) {
  'use strict';
  if (!IX || !IX.sets || IX.sets.byName['xanadu-lake-works']) return;
  const rect = IX.sets.shape.rect, r3 = function (v) { return Math.round(v * 1000) / 1000; };
  const POOR = 0.2, MID = 0.5, CIVIC = 0.65;
  function batK(w, h, d) { const want = 1 - 2 * h * 0.088 / Math.min(w, d); return want > 0.94 ? 0.96 : want > 0.89 ? 0.92 : want > 0.83 ? 0.86 : 0.8; }
  /* sets/xanadu.js inset(): a body on P = [x0, x1, z0, z1], its doors moved straight in onto P's faces */
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
  /* sets/xanadu.js stack(): battered storeys at (cx, cz), base w x d, planned on the top storey's top */
  function stack(cx, cz, w, d, hs, o) { let ww = w, dd = d; hs.forEach(function (h) { const k = batK(ww, h, dd); ww *= k; dd *= k; });
    return inset([cx - ww / 2, cx + ww / 2, cz - dd / 2, cz + dd / 2], o.id || 'house', Object.assign({}, o, { hs: hs })); }
  /* sets/xanadu.js blocks(): storeys that are separate battered blocks, planned on the footprint every block holds */
  function blocks(cx, cz, B, o) { const P = [-1e9, 1e9, -1e9, 1e9];
    B.forEach(function (b) { const k = batK(b[0], b[2], b[1]); P[0] = Math.max(P[0], cx - b[0] * k / 2); P[1] = Math.min(P[1], cx + b[0] * k / 2); P[2] = Math.max(P[2], cz - b[1] * k / 2); P[3] = Math.min(P[3], cz + b[1] * k / 2); });
    return inset(P, o.id || 'house', Object.assign({}, o, { hs: B.map(function (b) { return b[2]; }) })); }
  const L = [
    { key: 'xa_governor', name: "Governor's house", culture: 'xanadu', wealth: CIVIC, types: ['civic', 'single-family dwelling'], lot: [30, 26],
      bodies: [blocks(0, -6.6, [[20, 12, 4.2], [20, 12, 3.6]], { id: 'house', doors: [{ at: [0, -0.6], w: 1.7 }],
          program: [['hall', 'living', 'kitchen', 'store'], ['study', 'bedroom', 'bedroom', 'bath']] }),
        stack(10, 4.5, 7, 7, [3.4], { id: 'office', doors: [{ at: [6.45, 4.5], w: 1.1 }], program: ['study'] })],
      note: 'the audience hall and the household below, the governor\'s rooms above; the office wing on the court; the forecourt\'s walls and gate solid' },
    { key: 'xa_dye_works', name: 'Dye works', culture: 'xanadu', wealth: POOR, types: ['industry'], lot: [26, 22],
      bodies: [stack(-7, -7, 9, 6, [3.2, 2.8], { id: 'store', doors: [{ at: [-7, -4], w: 1.3 }], program: [['store', 'workshop'], ['store']] })],
      note: 'the dye store; the vats, the coppers and the drying lines in the open yard' },
    { key: 'xa_loom_house', name: 'Loom house', culture: 'xanadu', wealth: MID, types: ['industry'], lot: [32, 16],
      bodies: [stack(0, -2, 28, 10, [4.2], { id: 'hall', y: 0.4, doors: [{ at: [-14, -2], w: 1.6 }, { at: [14, -2], w: 1.6 }], program: ['workshop', 'workshop', 'workshop', 'store'] })],
      note: 'the looms\' hall under its clerestory; two looms work in the portico outside' },
    { key: 'xa_saffron_house', name: 'Saffron house', culture: 'xanadu', wealth: MID, types: ['industry', 'farm'], lot: [14, 13],
      bodies: [stack(0, -1.5, 12, 8, [3.2], { id: 'floor', y: 0.35, doors: [{ at: [0, 2.5], w: 1.6 }], program: ['workshop', 'store'] })],
      note: 'the sorting floor behind its arcade; the drying loft over it is louvred, open' },
    { key: 'xa_apiary', name: 'Apiary', culture: 'xanadu', wealth: POOR, types: ['farm', 'industry'], lot: [18, 14],
      bodies: [stack(5, 2.4, 5, 4, [2.8], { id: 'honey', doors: [{ at: [5, 4.4], w: 1.0 }], program: ['store'] })],
      note: 'the honey house; the hive walls in the open' },
    { key: 'xa_net_loft', name: 'Net loft', culture: 'xanadu', wealth: POOR, types: ['industry'], lot: [18, 16],
      bodies: [stack(0, -3.5, 14, 8, [3.2], { id: 'room', doors: [{ at: [-3.5, 0.5], w: 1.3 }], program: ['workshop', 'store'] })],
      note: 'the laying-up room; the loft over it open at the front, the nets hung from its rail' },
    { key: 'xa_kiln_yard', name: 'Kiln yard', types: ['industry'], skip: 'the wheel shed is open-sided; the kilns and the yard in the open' },
    { key: 'xa_reeling_house', name: 'Reeling house (silk)', types: ['industry'], skip: 'a shed open along its front' },
    { key: 'xa_mat_shed', name: 'Mat shed and reed racks', types: ['industry'], skip: 'an open shed under reed thatch' },
    { key: 'xa_sulfur_works', name: 'Sulfur works', types: ['industry'], skip: 'the melting shed is open-sided' },
    { key: 'xa_quarry_yard', name: 'Quarry and masons\' yard', types: ['industry'], skip: 'a yard; its tool hut too small to plan' }];
  IX.sets.add({ set: 'xanadu-lake-works', title: 'Xanadu: the lake towns\' works and the governor\'s house (kits/xanadu/extra)', culture: 'xanadu', items: L });
})(typeof KratorInteriors !== 'undefined' ? KratorInteriors : null);
