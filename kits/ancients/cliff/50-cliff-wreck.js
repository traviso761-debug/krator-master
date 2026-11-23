// ================================================================= KCLIFF — the cliff city's wreck: the debris heaps and the prow's shards ([draw])
// Lifted from Ledge's 8lc-host-ruin.js (2026-11-22) when Shelf took the same form. The debris of what fell is core/terrain's KRUBBLE heaps
// (the layout's heap records), each seated on the ground under it (a heap with y0 null on the lowest ground round its rim, its upper side
// buried: a heap in sloping shallows, a rockfall at a cliff's foot); a heap marked `rock` is the cliff's own stone, not the Ancients'
// concrete. The prow's biggest pieces lie on its heap as slab shards, seated on their lowest points (core/ruins' rule: the centre's height is
// the surface plus |R10| sx/2 + |R11| sy/2 + |R12| sz/2, less the sink). The build watches the group (KRUINS.watch) with its other ruins.
//
//   KCLIFF.drawWreck(o) -> {heaps, group, shards}
//     o: {L, ground(x, z), seed(id), draw(id, i, salt), scene, mats, prow ('heap.prow': the heap the shards lie on, or null), shards (5)}
KCLIFF.drawWreck = function (o) {
  var L = o.L, H = o.ground, dr = o.draw, box = KCLIFF.LB.box;
  var WG = new THREE.Group(); WG.name = 'the wreck'; o.scene.add(WG);
  var heaps = L.heaps.map(function (h) {
    var y0 = h.y0;
    if (y0 == null) { y0 = Infinity; for (var a = 0; a < 24; a++) { var t = a / 24 * Math.PI * 2; y0 = Math.min(y0, H(h.x + Math.cos(t) * h.rx, h.z + Math.sin(t) * h.rz)); } y0 = Math.min(y0, H(h.x, h.z)); }
    return KRUBBLE.heap({ id: h.id, x: h.x, z: h.z, y0: y0, rx: h.rx, rz: h.rz, ry: h.ry, h: h.h, lumps: h.lumps, blocks: h.blocks, cover: h.cover, seed: o.seed(h.id) });
  });
  heaps.forEach(function (Hp, hi) {
    var rock = L.heaps[hi].rock, M = KRUBBLE.mesh(Hp), n = M.pos.length / 3, col = new Float32Array(n * 3);
    for (var k = 0; k < n; k++) {
      var part = M.part ? M.part[k] : 0, oc = M.occ ? M.occ[k] : 0, s = .55 + .45 * (1 - oc);
      var base = rock ? (part === 1 ? [.6, .52, .44] : part === 2 ? [.52, .45, .38] : [.44, .38, .32]) : (part === 1 ? [.84, .81, .76] : part === 2 ? [.74, .71, .66] : [.55, .52, .48]);
      col[k * 3] = Math.pow(base[0] * s, 2.2); col[k * 3 + 1] = Math.pow(base[1] * s, 2.2); col[k * 3 + 2] = Math.pow(base[2] * s, 2.2);
    }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(M.pos, 3)); if (M.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(M.uv, 2));
    /* KRUBBLE's index is a typed array: r128's setIndex keeps a typed array raw and the render then fails (onUploadCallback) */
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(new THREE.BufferAttribute(Uint32Array.from(M.idx), 1)); g.computeVertexNormals();
    var m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true })); m.name = 'rubble: ' + Hp.id; m.userData.inspectLabel = 'the wreck (' + Hp.id + ')'; WG.add(m);
  });
  var prowId = o.prow === undefined ? 'heap.prow' : o.prow, prow = heaps.filter(function (h) { return h.id === prowId; })[0];
  if (prow) {
    var surf = function (x, z) { return Math.max(H(x, z), KRUBBLE.at(heaps, x, z)); };
    for (var i = 0; i < (o.shards == null ? 5 : o.shards); i++) {
      var a = dr(prowId, i, 1) * Math.PI * 2, q0 = .35 * Math.sqrt(dr(prowId, i, 2)), x = prow.x + Math.cos(a) * prow.rx * q0, z = prow.z + Math.sin(a) * prow.rz * q0;
      var sx = 18 + 16 * dr(prowId, i, 3), sy = 5, sz = 10 + 12 * dr(prowId, i, 4);
      var q = new THREE.Quaternion().setFromEuler(new THREE.Euler((dr(prowId, i, 5) - .5) * .9, dr(prowId, i, 6) * Math.PI, (dr(prowId, i, 7) - .5) * .9));
      var M4 = new THREE.Matrix4().makeRotationFromQuaternion(q).elements, lift = Math.abs(M4[1]) * sx / 2 + Math.abs(M4[5]) * sy / 2 + Math.abs(M4[9]) * sz / 2;
      box('panel', x, surf(x, z) + lift - .6, z, sx, sy, sz, { q: q, fm: { ny: 'soffit' } });
    }
  }
  var shards = KCLIFF.LB.flush(WG, o.mats, 'the prow\'s shards');
  return { heaps: heaps, group: WG, shards: shards };
};
