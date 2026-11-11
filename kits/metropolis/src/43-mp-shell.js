// ================================================================= METROPOLIS — KSHELL, the baked shell: records  [G data]
// The prototype of core/shell (PLAN.md section 3; it moves to core/ after the go, with its host half, 60). A shell record holds what a
// bake and a draw need, as plain data: the cage (a low-poly envelope that holds the building, 12-60 triangles), the map's frame and its size.
//   polar  anything star-shaped about its axis: (theta, y) -> surface radius. The cage is a stack of N-sided frustums.
//   box    a slab: (perimeter, y) -> depth from the box's face. The cage is the box.
// Both add two hull maps. From above, (x, z) -> y: a point over the highest surface of its column is air, so a roof is a real surface. From below, colour only: a tower is hollow, so
// the lowest surface of a column inside it is no bound, and the side map already gives a soffit's shape. The map from below gives it its colour,
// and is cut at soffit (the height where the overhang starts): from below, a column under a lamp would otherwise see the shaft's own windows far down. One soffit a tower: the Stalk's two saucers will need two.
// The silhouette comes from the map, not the cage: the fragment traces the view ray down from the cage (60).
var KSHELL = {};
(function () {
  // the least-area piecewise-linear ceiling over E(y) with bands segments, the breaks tried on a coarse grid
  function ceiling(E, y1, bands, C) {
    var ys = [], S = []; for (var i = 0; i <= 18; i++) ys.push(y1 * i / 18);
    for (var y = 0; y <= y1 + 1e-6; y += y1 / 240) S.push([y, E(y)]);
    function fit(br) {
      var R = br.map(function (y) { var m = 0; S.forEach(function (s) { if (Math.abs(s[0] - y) <= y1 / 200) m = Math.max(m, s[1]); }); return m; });
      for (var pass = 0; pass < 6; pass++) for (var j = 0; j + 1 < br.length; j++) {
        var over = 0; S.forEach(function (s) { if (s[0] < br[j] || s[0] > br[j + 1]) return; var t = (s[0] - br[j]) / (br[j + 1] - br[j]), l = R[j] + (R[j + 1] - R[j]) * t; over = Math.max(over, s[1] - l); });
        if (over > 0) { R[j] += over; R[j + 1] += over; }
      }
      var a = 0; for (var k = 0; k + 1 < br.length; k++) a += (br[k + 1] - br[k]) * (R[k] * R[k] + R[k] * R[k + 1] + R[k + 1] * R[k + 1]) / 3;
      return { br: br, R: R, a: a };
    }
    var best = null;
    (function rec(pick, from) {
      if (pick.length === bands - 1) { var f = fit([0].concat(pick, [y1])); if (!best || f.a < best.a) best = f; return; }
      for (var i = from; i < ys.length - 1; i++) rec(pick.concat([ys[i]]), i + 1);
    })([], 1);
    return best;
  }
  // a cage's triangles: {pos: [x, y, z, ...], idx: [...]}
  function polarCage(F, tip) {
    var o = F.shell, N = o.sides, c = ceiling(function (y) { return Math.max(MP.envelope(F, y - 1.2), MP.envelope(F, y), MP.envelope(F, y + 1.2)); }, tip, o.bands), k = 1.01 / Math.cos(Math.PI / N), pos = [], idx = [];
    c.br.forEach(function (y, j) { var r = Math.max(c.R[j], 0.6) * k; for (var i = 0; i < N; i++) { var a = (i + 0.5) * 2 * Math.PI / N; pos.push(r * Math.cos(a), y, r * Math.sin(a)); } });
    for (var j = 0; j + 1 < c.br.length; j++) for (var i = 0; i < N; i++) { var a = j * N + i, b = j * N + (i + 1) % N, d = a + N, e = b + N; idx.push(a, d, b, b, d, e); }
    var top = pos.length / 3; pos.push(0, tip + 0.5, 0); for (var q = 0; q < N; q++) idx.push((c.br.length - 1) * N + q, top, (c.br.length - 1) * N + (q + 1) % N);
    return { pos: pos, idx: idx, rings: c.br.map(function (y, j) { return [y, c.R[j] * k]; }) };
  }
  function boxCage(F, H) {
    var hx = F.footprint.w / 2 + F.shell.inset, hz = F.footprint.d / 2 + F.shell.inset;
    return { hx: hx, hz: hz, pos: [-hx, 0, -hz, hx, 0, -hz, hx, 0, hz, -hx, 0, hz, -hx, H, -hz, hx, H, -hz, hx, H, hz, -hx, H, hz],
      idx: [0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 6, 2, 6, 3, 3, 6, 7, 3, 7, 0, 0, 7, 4, 4, 7, 5, 5, 7, 6] };
  }
  // the record. state names the bake; what it holds is the same in a Godot port: a cage, a map size, the frame of the map. A ruin's frame is as tall as what stands
  // of it (MP.ruin), and the five states past gutted take a coarser map (ruinTexel, 0.5 m) and none from below (they hold no lamp): fourteen records fit one atlas
  // a look's record ('crown.wild', the overgrown crown: 44b, 59e) is its state's, under the look's own id, so a wild shell packs and bakes beside the clean one
  KSHELL.record = function (F, state) {
    var base = MP.look(state).state;
    var o = F.shell, rough = MP.RUINS.indexOf(base) > 1, tx = rough ? (o.ruinTexel == null ? 0.5 : o.ruinTexel) : o.texel, H = MP.ruin(F, base).top, cage, w, h = Math.ceil(H / tx), frame;
    if (o.mode === 'polar') {
      cage = polarCage(F, H);
      var Rm = 0; for (var y = 0; y <= H; y += 1) Rm = Math.max(Rm, MP.envelope(F, y));
      Rm *= 1.02; var mid = 0, n = 0; for (y = 0; y <= F.height.roof; y += 6) { mid += MP.envelope(F, y); n++; }
      w = Math.ceil(2 * Math.PI * (mid / n) / tx); frame = { mode: 0, H: H, a: Rm, b: 0 };
    } else {
      cage = boxCage(F, H);
      w = Math.ceil(4 * (cage.hx + cage.hz) / tx); frame = { mode: 1, H: H, a: cage.hx, b: cage.hz, D: o.depth || cage.hz };
    }
    // the hull maps, seen from straight above and straight below: what the side map cannot hold (a roof, a soffit, a column with nothing in it)
    var hx = frame.a, hz = o.mode === 'polar' ? frame.a : frame.b, hull = { w: Math.ceil(2 * hx / tx), h: Math.ceil(2 * hz / tx) };
    return { id: F.id + '.' + state, family: F.id, state: base, look: state, mode: o.mode, cage: cage, tris: cage.idx.length / 3, map: { w: w, h: h }, frame: frame, hull: hull, hx: hx, hz: hz, bot: !rough, soffit: F.crown && F.crown.neck ? F.crown.neck[0] : 0 };
  };
  // the three slots of a record, as things KSHELL.pack can pack
  KSHELL.slots = function (r) { return [r, { id: r.id + '.top', map: r.hull }].concat(r.bot ? [{ id: r.id + '.bot', map: r.hull }] : []); };
  // how a shelf packs records into one square atlas: shelves by height, a gutter round each slot. [{id, x, y, w, h}], in px; throws when full
  KSHELL.pack = function (recs, size, pad) {
    pad = pad == null ? 8 : pad; var x = pad, y = pad, row = 0, out = [];
    recs.slice().sort(function (a, b) { return b.map.h - a.map.h; }).forEach(function (r) {
      if (x + r.map.w + pad > size) { x = pad; y += row + 2 * pad; row = 0; }
      if (y + r.map.h + pad > size) throw new Error('KSHELL.pack: ' + r.id + ' does not fit a ' + size + ' atlas');
      out.push({ id: r.id, x: x, y: y, w: r.map.w, h: r.map.h }); x += r.map.w + 2 * pad; row = Math.max(row, r.map.h);
    });
    return out;
  };
})();
