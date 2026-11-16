// ================================================================= VIRIDIAN — the estate as records (step V4)  [G data]
// settlements/viridian/PLAN.md sections 4-6: the tea gardens as core/terrain terraces, the hedge rows on their treads, and
// the herb beds with their crops from kits/crops. Plain data and pure functions: no three.js, no DOM, no Math.random. A page
// (step V6) or Godot reads the records; tests/test-vt-estate.js checks them in node.
//
// The frame is the plan's, in metres from the house's court at px 962,1562 (813 m): x = u (up the hollow, east), z = -v
// (z south, the region frame's convention). The ground is a function g(x, z) handed in: core/world's at 1:1 on the page.
//
//   VTE.terraces()                  -> [KRELIEF.terraces record] for the Low Garden's two flanks and the High Garden
//   VTE.offAt(R, x, z, g)           -> the record's level offset at (x, z) (its wobble), or NaN outside its full weight
//   VTE.hedges(R, ground, o)        -> [{x, z, level, row}]: the clipped hedges along each tread's rows (o.box [x0,z0,x1,z1]
//                                      a clip, o.cell the contouring cell, 2 m; o.rows the rows' places on a tread, o.step 0.8 m)
//   VTE.beds()                      -> [{id, place, ground, i, crop, how, bucket}]: every bed's crop, picked on its ground
//   VTE.fits(groundId, cropId)      -> how the crop grows on that ground ('rain' needs no water; 'no' it cannot)
// Seeds (the block 34200-34399): the terraces 34351-34353, the beds 34361.
var VTE = (function () {
  'use strict';
  var KR = function () { return typeof KRELIEF !== 'undefined' ? KRELIEF : globalThis.KRELIEF; };
  var CR = function () { return typeof CROPS !== 'undefined' ? CROPS : globalThis.CROPS; };
  var RISE = 1.4;   /* a step at 16-18 %: a 7.8 m tread (PLAN.md section 6) */
  // the gardens (PLAN.md section 6's table): the Low Garden on the hollow's two flanks, earth risers; the High Garden on the
  // frost line, stone-faced (a smaller riser share); heights are the cells' (SURVEY.md) until core/world cuts the region
  var GARDENS = [
    { id: 'low-north', name: 'The Low Garden, north flank', seed: 34351, riser: 0.22, bund: 0.2, band: [650, 900],
      poly: [[-900, -1200], [900, -1200], [900, -300], [-900, -300]] },
    { id: 'low-south', name: 'The Low Garden, south flank', seed: 34352, riser: 0.22, bund: 0.2, band: [650, 900],
      poly: [[-900, 300], [900, 300], [900, 1200], [-900, 1200]] },
    { id: 'high', name: 'The High Garden', seed: 34353, riser: 0.15, bund: 0.12, band: [1040, 1200],
      poly: [[1400, -300], [2400, -300], [2400, 300], [1400, 300]] }];
  // the herb grounds on the crops kit's axes (PLAN.md section 5; SURVEY.md): the house's wet gardens, the low bed at 500 m,
  // the dry garden on the rain-shadow spur. atm is the kit's own for the Vale ('standard'); at the region's 1.44 atm (dense)
  // the wet ground's crops are the same
  var GROUNDS = {
    wet: { warmth: 'temperate', atm: 'standard', arid: 'wet' },
    low: { warmth: 'subtropic', atm: 'standard', arid: 'humid' },
    dry: { warmth: 'temperate', atm: 'standard', arid: 'subhumid' } };
  // the crops that want deep shade (the grove, the shade house, the log yard), never an open bed
  var SHADE = ['valley-ginseng', 'moon-cap', 'rainbow-bracket'];
  // the places with beds: a programme of preferred crops (taken in turn where they fit), else a seeded pick by bucket
  var PLACES = [
    { id: 'physic', ground: 'wet', beds: 8, buckets: ['reagent', 'herb', 'medicine', 'berry'], shade: false },
    { id: 'shade-house', ground: 'wet', beds: 2, prefer: ['valley-ginseng'], shade: true },
    { id: 'log-yard', ground: 'wet', beds: 6, prefer: ['moon-cap', 'rainbow-bracket'], shade: true },
    { id: 'low-bed', ground: 'low', beds: 4, prefer: ['rimdew', 'herbs', 'tobacco'], buckets: ['medicine', 'herb'], shade: false },
    { id: 'dry-garden', ground: 'dry', beds: 10, prefer: ['monks-sage', 'saffron', 'juniper', 'umbel-seed', 'bench-garlic', 'cave-madder', 'sky-poppy', 'peyote'],
      buckets: ['herb', 'spice', 'reagent', 'medicine'], shade: false }];
  var BED_SEED = 34361;

  function terraces() {
    return GARDENS.map(function (G) {
      return KR().terraces({ rise: RISE, riser: G.riser, bund: G.bund, base: 0, wobble: 0.12, fill: 0.5, field: 40, zone: { poly: G.poly },
        fade: 20, band: G.band, bandFade: 10, seed: G.seed });
    });
  }
  // the wobble at (x, z): read through the record's own public functions. A test ground at 0.4 of a step over the level below
  // g lies on a tread clear of the bund for any wobble (|off| <= 0.12 of a rise), where shape = base + off + rise*(k + fill*(1-riser))
  function offAt(R, x, z, g) {
    var K = KR(), kt = Math.floor((g - R.base) / R.rise), gt = R.base + R.rise * (kt + 0.4), a = K.at(R, x, z, gt);
    if (!a || a.part !== 'tread' || a.w < 0.999) return NaN;
    return K.shape(R, x, z, gt) - R.base - R.rise * (a.level + R.fill * (1 - R.riser));
  }
  // the hedges: the rows are contour lines of the step coordinate F = (g - base - off) / rise at k + row (a row's place across
  // its tread, 0 the outer edge), traced by marching squares on a grid of o.cell and walked at o.step
  function hedges(R, ground, o) {
    o = o || {};
    var cell = o.cell == null ? 2 : o.cell, step = o.step == null ? 0.8 : o.step, rs = R.riser;
    var rows = o.rows || [0.3, 0.56, 0.82].map(function (f) { return f * (1 - rs); });
    var P = R.zone.poly, bx = o.box || [Infinity, Infinity, -Infinity, -Infinity];
    var x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
    P.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); });
    if (o.box) { x0 = Math.max(x0, bx[0]); z0 = Math.max(z0, bx[1]); x1 = Math.min(x1, bx[2]); z1 = Math.min(z1, bx[3]); }
    var nx = Math.max(1, Math.floor((x1 - x0) / cell)), nz = Math.max(1, Math.floor((z1 - z0) / cell)), F = new Float64Array((nx + 1) * (nz + 1));
    for (var j = 0; j <= nz; j++) for (var i = 0; i <= nx; i++) {
      var x = x0 + i * cell, z = z0 + j * cell, g = ground(x, z), off = offAt(R, x, z, g);
      F[j * (nx + 1) + i] = (g - R.base - off) / R.rise;
    }
    var out = [];
    function put(ax, az, bx2, bz, level, row) {
      var L = Math.hypot(bx2 - ax, bz - az), n = Math.max(1, Math.round(L / step));
      for (var s = 0; s < n; s++) { var t = (s + 0.5) / n; out.push({ x: ax + (bx2 - ax) * t, z: az + (bz - az) * t, level: level, row: row }); }
    }
    for (var cj = 0; cj < nz; cj++) for (var ci = 0; ci < nx; ci++) {
      var a = F[cj * (nx + 1) + ci], b = F[cj * (nx + 1) + ci + 1], c = F[(cj + 1) * (nx + 1) + ci + 1], d = F[(cj + 1) * (nx + 1) + ci];
      if (!(isFinite(a) && isFinite(b) && isFinite(c) && isFinite(d))) continue;
      var lo = Math.min(a, b, c, d), hi = Math.max(a, b, c, d), X = x0 + ci * cell, Z = z0 + cj * cell;
      for (var k = Math.floor(lo); k <= Math.floor(hi); k++) for (var r = 0; r < rows.length; r++) {
        var v = k + rows[r];
        if (v <= lo || v > hi) continue;
        var C = [[X, Z, a], [X + cell, Z, b], [X + cell, Z + cell, c], [X, Z + cell, d]], pts = [];
        for (var e = 0; e < 4; e++) {
          var p = C[e], q = C[(e + 1) % 4];
          if ((p[2] < v) !== (q[2] < v)) { var t = (v - p[2]) / (q[2] - p[2]); pts.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
        }
        if (pts.length === 2) put(pts[0][0], pts[0][1], pts[1][0], pts[1][1], k, r);
        else if (pts.length === 4) { put(pts[0][0], pts[0][1], pts[1][0], pts[1][1], k, r); put(pts[2][0], pts[2][1], pts[3][0], pts[3][1], k, r); }
      }
    }
    return out;
  }
  function fits(groundId, cropId) {
    var res = CR().at(GROUNDS[groundId]), f = res.filter(function (r) { return r.crop.id === cropId; })[0];
    return f ? f.how : 'no';
  }
  function beds() {
    var C = CR(), out = [];
    PLACES.forEach(function (P, pi) {
      var res = C.at(GROUNDS[P.ground]).filter(function (r) { return r.how === 'rain' || r.how === 'wild'; })
        .filter(function (r) { return P.shade ? true : SHADE.indexOf(r.crop.id) < 0; });
      for (var i = 0; i < P.beds; i++) {
        var crop = null, bucket = null, pref = P.prefer ? P.prefer[i % P.prefer.length] : null;
        if (pref && res.some(function (r) { return r.crop.id === pref; })) { crop = pref; bucket = C.BY_ID[pref].bucket; }
        else if (P.buckets) {
          for (var t = 0; t < P.buckets.length && !crop; t++) {
            bucket = P.buckets[(i + t) % P.buckets.length];
            var pk = C.pick(res, bucket, { seed: BED_SEED, salt: pi * 100 + i, rainOnly: true });
            if (pk) crop = pk.crop.id;
          }
        }
        out.push({ id: P.id + ':' + i, place: P.id, ground: P.ground, i: i, crop: crop, how: crop ? fits(P.ground, crop) : 'no', bucket: bucket, shade: !!P.shade });
      }
    });
    return out;
  }
  return { RISE: RISE, GARDENS: GARDENS, GROUNDS: GROUNDS, SHADE: SHADE, PLACES: PLACES, terraces: terraces, offAt: offAt, hedges: hedges, beds: beds, fits: fits };
})();
