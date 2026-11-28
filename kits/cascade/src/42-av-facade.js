// ================================================================= ARCVILLAGE — exterior & light-well facade bays  [G data]
// Computes window bays, apse terrace glazing, arched waist openings, and Republican infill accents from the structural
// and interior programme records so the exterior skin agrees with the rooms behind it. No THREE, no DOM.
var AV = typeof AV !== 'undefined' ? AV : {};
(function () {
  'use strict';
  function r3(v) { return Math.round(v * 1000) / 1000; }

  // Bay styles mapped to room/zone uses
  AV.BAY_STYLE = {
    living: { wFrac: 0.68, sill: 0.85, head: 2.65, kind: 'living' },
    work: { wFrac: 0.78, sill: 0.95, head: 2.85, kind: 'ribbon' },
    rec: { wFrac: 0.82, sill: 0.45, head: 3.10, kind: 'tall' },
    civic: { wFrac: 0.74, sill: 0.55, head: 3.40, kind: 'tall' },
    plant: { wFrac: 0.50, sill: 1.40, head: 2.30, kind: 'louvre' }
  };

  // Mid-level outer octagonal face bays (y = 86.4 .. 136.8 m, 14 storeys x 3.6 m)
  AV.midFaceBays = function (P, faceIdx) {
    var D = AV.DIM, M = D.MID, state = P.state, seed = P.seed;
    var nStoreys = Math.round((M.y1 - M.y0) / M.sh), nCols = 9, bays = [];
    for (var s = 0; s < nStoreys; s++) {
      var y0 = r3(M.y0 + s * M.sh);
      /* Storeys 0..4 work/commercial, 5 plant/promenade band, 6..13 living-working & residential */
      var cat = s === 5 ? 'plant' : s < 5 ? 'work' : (s % 3 === 0 ? 'rec' : 'living');
      var st = AV.BAY_STYLE[cat];
      for (var c = 0; c < nCols; c++) {
        var u = AV.u(seed, 310 + faceIdx, s, c);
        var timberPatch = state === 'refurbished' && cat !== 'plant' && u < 0.22;
        var lit = state === 'ruined' ? false : state === 'intact' ? (u > 0.28) : (cat === 'work' || cat === 'civic' ? u > 0.24 : u > 0.42);
        var broken = state === 'ruined' && (u < 0.38 || (faceIdx === 5 && s > 8));
        bays.push({
          face: faceIdx, storey: s, col: c, f0: (c + 0.08) / nCols, f1: (c + 0.92) / nCols,
          y0: r3(y0 + st.sill), y1: r3(y0 + Math.min(M.sh - 0.35, st.head)),
          cat: cat, kind: st.kind, timberPatch: timberPatch, lit: lit, broken: broken
        });
      }
    }
    return bays;
  };

  // Cantilevered upper collar bays (y = 136.8 .. 172.8 m, 3 tiers)
  AV.collarFaceBays = function (P, tierIdx, faceIdx) {
    var T = AV.DIM.COLLAR.tiers[tierIdx], state = P.state, seed = P.seed;
    var nCols = 8, bays = [];
    var cat = tierIdx === 0 ? 'work' : tierIdx === 1 ? 'living' : 'civic';
    for (var c = 0; c < nCols; c++) {
      var u = AV.u(seed, 510 + tierIdx * 16 + faceIdx, c, 7);
      var relief = (c === 0 || c === nCols - 1);
      var broken = state === 'ruined' && ((faceIdx === 1 || faceIdx === 5) && tierIdx >= 1 || u < 0.28);
      var celadon = state === 'refurbished' && !relief && tierIdx === 2 && (c % 2 === 1);
      bays.push({
        tier: tierIdx, face: faceIdx, col: c,
        f0: (c + 0.1) / nCols, f1: (c + 0.9) / nCols,
        y0: r3(T.y0 + 1.4), y1: r3(T.y1 - 1.6),
        cat: cat, relief: relief, celadon: celadon,
        lit: state !== 'ruined' && !relief && u > 0.3,
        broken: broken
      });
    }
    return bays;
  };
})();
