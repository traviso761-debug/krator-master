// ================================================================= CORE — rubble (a heap of loose debris on the ground: a fallen building's mound)  [G data]
// Opt-in: a build lists it (first at kits/metropolis, 2026-11-03, for the ruined towers). A heap is not bedded rock (core/terrain/37-core-stacks: a butte's beds read as
// stepped plates): it is a lumpy dome at the talus angle, broken up by lumps, roughened by value noise, with loose blocks lying on it. One surface function makes the
// height, the mesh and the walk triangles agree, so a block's foot and a walker's are on the drawn heap.
//
// No THREE, no DOM: plain maths, node-tested (test-rubble.js). Every draw is integer-hashed from core/rand (KRAND), by the heap's seed and the lump's or block's index,
// never by how many draws came before it. Axes: y up, metres, x east, z south.
//
//   KRUBBLE.heap({id, x, z, y0, rx, rz, ry, h, seed, rough, lumps, blocks, size, cover})
//        rx, rz the half-lengths of the footprint (an ellipse) along and across the strike ry (radians), h the crest over the ground at y0 (0), rough (.22 of h) the
//        noise, lumps (5) the knolls on it, blocks (12) the loose pieces lying on it, size [lo, hi] (1.5, 4 m) their longest side, cover (0: none) the spacing in metres of
//        the chunks that cover the heap (a jittered grid of broken pieces, each its own size, tilt and shade, sunk a third into the heap): the heap reads as discrete
//        pieces, not a slab, and its surface is their bed (the walk's)
//        -> a record {id, kind:'heap', x, z, y0, rx, rz, ry, h, seed, rough, lumps:[{u, v, r, h}], blocks:[{x, y, z, w, h, d, ry, tx, tz, tone, chunk}]}; u, v in the heap's frame
//   KRUBBLE.heightAt(H, x, z)   the heap's surface over (x, z), metres above y0 (0 off it): the one surface function
//   KRUBBLE.at(list, x, z)      the highest heap surface (world y) over (x, z), or -Infinity
//   KRUBBLE.mesh(H, opt)        {pos, idx, uv, part, occ}: the surface as a polar grid (opt.cell, 4 m, between rings and round them; its last ring 5 cm under the ground)
//                               then each block as a box, its corners jittered (a broken piece, not a brick); part 0 the heap, 1 a block, 2 a chunk of the cover; occ 0..1, the hollows between the lumps dark; uv in metres. CCW seen from outside
//   KRUBBLE.walkTris(H, cell)   the surface as triangles [[x, z, y] x 3] on a coarser grid (cell, 4 m) for a walk registry (core/walk's poly takes them as they are)
//   KRUBBLE.export(list) / KRUBBLE.load(o)   {format:'krator-rubble', version:1, heaps:[...]} and back
(function (root) {
  'use strict';
  var KR = root.KRAND, TAU = Math.PI * 2;
  if (!KR) throw new Error('KRUBBLE needs core/rand (KRAND)');
  var u01 = function (seed, i, salt) { return KR.unit(KR.hash(seed, i, salt)); };
  function heap(o) {
    if (!o || o.id == null) throw new Error('KRUBBLE.heap: a heap needs an id');
    var seed = (o.seed == null ? KR.child(7, String(o.id)) : o.seed) >>> 0, rx = o.rx == null ? 20 : o.rx, rz = o.rz == null ? rx : o.rz;
    var H = { id: o.id, kind: 'heap', x: o.x || 0, z: o.z || 0, y0: o.y0 == null ? 0 : o.y0, rx: rx, rz: rz, ry: o.ry || 0, h: o.h == null ? Math.min(rx, rz) * 0.45 : o.h, seed: seed,
      rough: o.rough == null ? 0.22 : o.rough, lumps: [], blocks: [] };
    var nl = o.lumps == null ? 5 : o.lumps;
    for (var i = 0; i < nl; i++) {
      var a = u01(seed, i, 11) * TAU, q = Math.sqrt(u01(seed, i, 12)) * 0.7;
      H.lumps.push({ u: Math.cos(a) * q, v: Math.sin(a) * q, r: 0.18 + 0.22 * u01(seed, i, 13), h: 0.12 + 0.2 * u01(seed, i, 14) });
    }
    var nb = o.blocks == null ? 12 : o.blocks, sz = o.size || [1.5, 4];
    for (var j = 0; j < nb; j++) {
      var b = u01(seed, j, 21) * TAU, p = Math.sqrt(u01(seed, j, 22)) * 0.85, lu = Math.cos(b) * p, lv = Math.sin(b) * p, L = sz[0] + (sz[1] - sz[0]) * u01(seed, j, 23);
      var w = toWorld(H, lu * H.rx, lv * H.rz), y = H.y0 + heightAt(H, w[0], w[1]), bh = L * (0.25 + 0.35 * u01(seed, j, 24)), bd = L * (0.4 + 0.5 * u01(seed, j, 25));
      /* a block lies on the heap, sunk by a third of its height, tipped up to 35 degrees */
      H.blocks.push({ x: w[0], y: y + bh * 0.17, z: w[1], w: L, h: bh, d: bd, ry: u01(seed, j, 26) * TAU, tx: (u01(seed, j, 27) - 0.5) * 1.2, tz: (u01(seed, j, 28) - 0.5) * 1.2, tone: 0.85 + 0.2 * u01(seed, j, 29), chunk: 0 });
    }
    /* the cover: a chunk a cell of a jittered grid in the heap's frame, by hash of (cell i, cell j), most cells taken; the edge thins out */
    var sp = o.cover || 0;
    if (sp > 0) for (var ci = Math.floor(-H.rx / sp); ci <= Math.ceil(H.rx / sp); ci++) for (var cj = Math.floor(-H.rz / sp); cj <= Math.ceil(H.rz / sp); cj++) {
      var hc = KR.hash(seed, ci + 4096, cj + 4096, 31), r1 = function (k) { return KR.unit(KR.hash(hc, k)); };
      var cu = (ci + r1(1)) * sp, cv = (cj + r1(2)) * sp, qq = (cu * cu) / (H.rx * H.rx) + (cv * cv) / (H.rz * H.rz);
      if (qq > 0.95 || r1(3) > 0.9 - 0.5 * qq) continue;
      var cw = toWorld(H, cu, cv), cy = H.y0 + heightAt(H, cw[0], cw[1]), cl = sp * (0.6 + 0.75 * r1(4)), ch = cl * (0.35 + 0.35 * r1(5));
      H.blocks.push({ x: cw[0], y: cy + ch * 0.17, z: cw[1], w: cl, h: ch, d: cl * (0.55 + 0.4 * r1(6)), ry: r1(7) * TAU, tx: (r1(8) - 0.5) * 0.9, tz: (r1(9) - 0.5) * 0.9, tone: 0.78 + 0.3 * r1(10), chunk: 1 });
    }
    return H;
  }
  function toLocal(H, x, z) { var dx = x - H.x, dz = z - H.z, c = Math.cos(H.ry), s = Math.sin(H.ry); return [dx * c + dz * s, -dx * s + dz * c]; }
  function toWorld(H, u, v) { var c = Math.cos(H.ry), s = Math.sin(H.ry); return [H.x + u * c - v * s, H.z + u * s + v * c]; }
  // the surface: a dome at the talus over the ellipse, the lumps on it, value noise that dies at the edge
  function heightAt(H, x, z) {
    var l = toLocal(H, x, z), u = l[0] / H.rx, v = l[1] / H.rz, q2 = u * u + v * v;
    if (q2 >= 1) return 0;
    var e = 1 - q2, y = H.h * Math.pow(e, 0.85);
    for (var i = 0; i < H.lumps.length; i++) { var m = H.lumps[i], du = u - m.u, dv = v - m.v, d2 = (du * du + dv * dv) / (m.r * m.r); if (d2 < 4) y += H.h * m.h * Math.exp(-d2 * 1.6) * e; }
    var n = KR.vnoise(l[0] / 3.1, l[1] / 3.1, 0.5, H.seed) * 0.65 + KR.vnoise(l[0] / 1.2, l[1] / 1.2, 2.5, H.seed) * 0.35;
    return Math.max(0, y + (n - 0.5) * 2 * H.rough * H.h * Math.min(1, e * 3));
  }
  function at(list, x, z) { var best = -Infinity; for (var i = 0; i < list.length; i++) { var H = list[i], y = heightAt(H, x, z); if (y > 0) best = Math.max(best, H.y0 + y); } return best; }
  function mesh(H, opt) {
    opt = opt || {}; var cell = opt.cell == null ? 4 : opt.cell, R = Math.max(H.rx, H.rz), nr = Math.max(3, Math.ceil(R / cell)), ns = Math.max(16, Math.ceil(TAU * R / cell));
    var pos = [], idx = [], uv = [], part = [], occ = [];
    var vert = function (x, y, z, p, o) { pos.push(x, y, z); uv.push(x, z); part.push(p); occ.push(o); return pos.length / 3 - 1; };
    var shade = function (x, z, y) { var s = 0, k = 0, d = 1.5; [[d, 0], [-d, 0], [0, d], [0, -d]].forEach(function (q) { s += heightAt(H, x + q[0], z + q[1]); k++; }); return Math.max(0, Math.min(1, (s / k - y) / 1.2)); };
    var c0 = vert(H.x, H.y0 + heightAt(H, H.x, H.z), H.z, 0, 0), rings = [];
    for (var i = 1; i <= nr; i++) {
      var q = i / nr, row = [];
      for (var j = 0; j < ns; j++) { var a = j / ns * TAU, w = toWorld(H, Math.cos(a) * q * H.rx, Math.sin(a) * q * H.rz), y = i === nr ? -0.05 : heightAt(H, w[0], w[1]); row.push(vert(w[0], H.y0 + y, w[1], 0, i === nr ? 0.3 : shade(w[0], w[1], y))); }
      rings.push(row);
    }
    /* CCW seen from above; the polar angle runs from x toward z (south), which seen from above (y up) is clockwise, so each triangle is listed the other way round */
    for (var s = 0; s < ns; s++) idx.push(c0, rings[0][(s + 1) % ns], rings[0][s]);
    for (var r = 0; r + 1 < nr; r++) for (var t = 0; t < ns; t++) { var a0 = rings[r][t], a1 = rings[r][(t + 1) % ns], b0 = rings[r + 1][t], b1 = rings[r + 1][(t + 1) % ns]; idx.push(a0, a1, b0, a1, b1, b0); }
    H.blocks.forEach(function (b) {
      var cy = Math.cos(b.ry), sy = Math.sin(b.ry), cx = Math.cos(b.tx), sx = Math.sin(b.tx), cz = Math.cos(b.tz), sz = Math.sin(b.tz);
      var P = function (x, y, z) { var y1 = y * cx - z * sx, z1 = y * sx + z * cx, x2 = x * cz - y1 * sz, y2 = x * sz + y1 * cz; return [b.x + x2 * cy + z1 * sy, b.y + y2, b.z - x2 * sy + z1 * cy]; };
      /* each corner pulled in or out by up to a fifth of the side, by hash of the piece and the corner: a broken piece, not a brick */
      var hw = b.w / 2, hh = b.h / 2, hd = b.d / 2, C = [], bs = KR.hash(H.seed, Math.round(b.x * 64), Math.round(b.z * 64), 41), J = function (k, a) { return 1 + (KR.unit(KR.hash(bs, k, a)) - 0.5) * 0.4; };
      for (var k = 0; k < 8; k++) { var p = P((k & 1 ? hw : -hw) * J(k, 1), (k & 2 ? hh : -hh) * J(k, 2), (k & 4 ? hd : -hd) * J(k, 3)); C.push(vert(p[0], p[1], p[2], b.chunk ? 2 : 1, 1 - b.tone)); }
      [[0, 4, 6, 2], [1, 3, 7, 5], [0, 1, 5, 4], [2, 6, 7, 3], [0, 2, 3, 1], [4, 5, 7, 6]].forEach(function (f) { idx.push(C[f[0]], C[f[1]], C[f[2]], C[f[0]], C[f[2]], C[f[3]]); });
    });
    return { pos: new Float32Array(pos), idx: new Uint32Array(idx), uv: new Float32Array(uv), part: new Uint8Array(part), occ: new Float32Array(occ) };
  }
  function walkTris(H, cell) {
    cell = cell == null ? 4 : cell; var R = Math.max(H.rx, H.rz), nr = Math.max(2, Math.ceil(R / cell)), ns = Math.max(12, Math.ceil(TAU * R / cell)), out = [];
    var P = function (q, a) { var w = toWorld(H, Math.cos(a) * q * H.rx, Math.sin(a) * q * H.rz); return [w[0], w[1], H.y0 + heightAt(H, w[0], w[1])]; }, C = [H.x, H.z, H.y0 + heightAt(H, H.x, H.z)];
    for (var j = 0; j < ns; j++) { var a = j / ns * TAU, b = (j + 1) / ns * TAU; out.push([C, P(1 / nr, a), P(1 / nr, b)]); for (var i = 1; i < nr; i++) { var q0 = i / nr, q1 = (i + 1) / nr; out.push([P(q0, a), P(q1, a), P(q1, b)], [P(q0, a), P(q1, b), P(q0, b)]); } }
    return out;
  }
  root.KRUBBLE = { version: 1, heap: heap, heightAt: heightAt, at: at, mesh: mesh, walkTris: walkTris, toLocal: toLocal, toWorld: toWorld,
    export: function (list) { return { format: 'krator-rubble', version: 1, heaps: JSON.parse(JSON.stringify(list)) }; },
    load: function (o) { if (!o || o.format !== 'krator-rubble') throw new Error('KRUBBLE.load: not a krator-rubble export'); return o.heaps; } };
})(typeof window !== 'undefined' ? window : this);
