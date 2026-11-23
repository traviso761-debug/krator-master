// ================================================================= KCLIFF — the cliff city drawn from its deck records ([draw])
// The drawing half of 10-cliff-stack.js (lifted from Ledge's 8la-host-shell.js, 2026-11-22). Nothing here decides where a deck is or
// what state it is in: KCLIFF.deckBox gives its place, the build's layout its state and holder. What varies inside a deck (its
// blocks' reach, which windows are dark, the vines, the rebar) is the build's draw(id, i, salt) (core/rand by the deck's id), never a
// stream. The form is the kit's target's: a slab with its root in the rock, rooms set back from a gallery and a parapet, a plenum
// under the soffit of the layer above, ribs on the soffit's exposed strip, a mullioned window wall.
//
//   KCLIFF.LB                         the box batch: box(key, cx, cy, cz, sx, sy, sz, {q, skip, fm}) into one buffer per material key;
//                                     flush(parent, mats, label) -> meshes. UVs are world metres / 6. Each box is its own connected piece
//                                     (core/ruins reads it so)
//   KCLIFF.mats()                     the shell's materials: the kit's MAT (its pack binds MAT.white to the Ancients' panel) and the
//                                     soffit (a painted bounce light: nothing casts a shadow, and a downward face reads brown), walled
//                                     (sealed infill), cloth and ochre (awnings), lampG and lampR (the Tungangs' lamps)
//   KCLIFF.drawShell(o)               o: {S, decks, cores, draw, parent, name, mats, concourse: {deckId: 1}, dress}
//                                     -> {root, meshes, stats: {decks, blocks, stubs}, tris}
//     dress: by holder {planters, awning, step} for lived decks (default: dalab green planters and teal awnings every 24 m,
//     fellgang ochre awnings every 30 m); a `kept` deck shows green and red lamps; a dead one vines off its slab
//     cores: [{x, z, w, d, runs: [y0, y1] or null}]: a tower a layer at a time where the deck it passes is not broken
//     pancaked decks of a wing lie crushed on the deck under the lowest of them, their outer ends draped over its gallery
KCLIFF.LB = (function () {
  var B = {}, F = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], FN = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
  var v = new THREE.Vector3();
  function buf(k) { return B[k] || (B[k] = { p: [], n: [], u: [], i: [] }); }
  function box(key, cx, cy, cz, sx, sy, sz, o) {
    o = o || {}; var q = o.q || null;
    for (var f = 0; f < 6; f++) {
      var fn = FN[f]; if (o.skip && o.skip.indexOf(fn) >= 0) continue;
      var k = (o.fm && o.fm[fn]) || key, b = buf(k), n = F[f];
      var ax = f < 2 ? [[0, 0, 1], [0, 1, 0]] : f < 4 ? [[1, 0, 0], [0, 0, 1]] : [[1, 0, 0], [0, 1, 0]];
      var base = b.p.length / 3, cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      var nw = new THREE.Vector3(n[0], n[1], n[2]); if (q) nw.applyQuaternion(q);
      var dom = Math.abs(nw.x) > Math.abs(nw.y) && Math.abs(nw.x) > Math.abs(nw.z) ? 0 : Math.abs(nw.y) > Math.abs(nw.z) ? 1 : 2;
      for (var j = 0; j < 4; j++) {
        var c = cs[j];
        v.set(n[0] * sx / 2 + (ax[0][0] * c[0] * sx + ax[1][0] * c[1] * sx) / 2, n[1] * sy / 2 + (ax[0][1] * c[0] * sy + ax[1][1] * c[1] * sy) / 2,
          n[2] * sz / 2 + (ax[0][2] * c[0] * sz + ax[1][2] * c[1] * sz) / 2);
        if (q) v.applyQuaternion(q); v.x += cx; v.y += cy; v.z += cz; b.p.push(v.x, v.y, v.z); b.n.push(nw.x, nw.y, nw.z);
        b.u.push((dom === 0 ? v.z : v.x) / 6, (dom === 1 ? v.z : v.y) / 6);
      }
      /* winding: counter-clockwise seen from outside. The corners run (-1,-1) (1,-1) (1,1) (-1,1) on the face's two axes, whose cross
         product is -x, -x, -y, -y, +z, +z for the six faces: kept where that is the face's own normal (-x, -y, +z), reversed elsewhere */
      if (f === 1 || f === 3 || f === 4) b.i.push(base, base + 1, base + 2, base, base + 2, base + 3); else b.i.push(base, base + 2, base + 1, base, base + 3, base + 2);
    }
  }
  function flush(parent, mats, label) {
    var out = [];
    for (var k in B) {
      var b = B[k]; if (!b.i.length) continue; var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(b.u, 2)); g.setIndex(b.i); g.computeBoundingSphere();
      var m = new THREE.Mesh(g, mats[k] || MAT.white); m.name = label + ': ' + k; m.userData.inspectLabel = label; parent.add(m); out.push(m); delete B[k];
    }
    return out;
  }
  return { box: box, flush: flush, tris: function () { return Object.keys(B).reduce(function (a, k) { return a + B[k].i.length / 3; }, 0); } };
})();

KCLIFF.mats = function () {
  var soffit = MAT.white.clone(); soffit.color = new THREE.Color(0xd2ccc2); soffit.emissive = new THREE.Color(0x2c2924);
  var walled = MAT.white.clone(); walled.color = new THREE.Color(0xb8ae9e);
  var cloth = new THREE.MeshStandardMaterial({ color: 0x2f7f78, roughness: .95, side: THREE.DoubleSide });
  var ochre = new THREE.MeshStandardMaterial({ color: 0xa8743a, roughness: .95, side: THREE.DoubleSide });
  var lampG = new THREE.MeshBasicMaterial({ color: 0x7dff9a }), lampR = new THREE.MeshBasicMaterial({ color: 0xff5a3c });
  return { panel: MAT.white, soffit: soffit, walled: walled, win: MAT.winIntact, dead: MAT.winDead, guts: MAT.guts, rust: MAT.rust, vine: MAT.vine, green: MAT.vine,
    cloth: cloth, ochre: ochre, lampG: lampG, lampR: lampR };
};

KCLIFF.drawShell = function (o) {
  var S = o.S, decks = o.decks, dr = o.draw, box = KCLIFF.LB.box, R = new THREE.Group(); R.name = o.name || 'the shell'; o.parent.add(R);
  var ST = S.storey * S.storeys, stats = { decks: 0, blocks: 0, stubs: 0 }, CONC = o.concourse || {};
  var DRESS = o.dress || { dalab: { planters: true, awning: 'cloth', step: 24 }, fellgang: { awning: 'ochre', step: 30 } };
  var nW = S.wings.length, wIx = S.wings.map(function (x) { return x.id; });
  var deckAt = function (k, w) { return decks[k * nW + wIx.indexOf(w)]; };
  // a broken deck's stub: the slab torn at Ls metres out, its reinforcement out of the break, the torn rooms' guts on the stub
  function stub(d, b, Ls, rooms, noSlab) {
    var cx = (b.x0 + b.x1) / 2, sx = b.x1 - b.x0, y = b.floor;
    if (!noSlab) box('panel', cx, y - S.slab / 2, (Ls - .5) / 2, sx, S.slab, Ls + .5, { fm: { ny: 'soffit' } });
    if (rooms) box('guts', cx, y + rooms / 2, (Ls - 1) / 2 + .3, sx - .6, rooms, Math.max(.5, Ls - 1.3), { skip: 'nz' });
    var nb = Math.floor(sx / 2.5);
    for (var i = 0; i < nb; i++) {
      if (dr(d.id, i, 31) < .45) continue; var len = 1.5 + 3 * dr(d.id, i, 32), a = .15 + .5 * dr(d.id, i, 33);
      var q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), a);
      var off = new THREE.Vector3(0, 0, len / 2).applyQuaternion(q);
      box('rust', b.x0 + 1.2 + i * 2.5, y - 1 - 3 * dr(d.id, i, 34) + off.y, Ls - .1 + off.z, .14, .14, len, { q: q });
    }
    stats.stubs++;
  }
  decks.forEach(function (d) {
    var b = KCLIFF.deckBox(S, d), st = d.state, y = b.floor, cx = (b.x0 + b.x1) / 2, sx = b.x1 - b.x0; stats.decks++;
    // the root, in the rock: every deck keeps it, whatever fell from it; its own piece (no corner shared with the slab: core/ruins
    // joins shared corners, and a root joined to its slab would be measured against the ground under the slab's outer end)
    box('panel', cx, y - S.slab / 2 - .02, -(S.root + .3) / 2, sx - .04, S.slab - .04, S.root - .3, { skip: 'nz' });
    if (st === 'gone') { stub(d, b, 3 + 2 * dr(d.id, 0, 1), 0); return; }
    if (st === 'pancaked') { stub(d, b, 4 + 2 * dr(d.id, 0, 1), 0); return; }
    if (st === 'sheared') { stub(d, b, 9 + 6 * dr(d.id, 0, 1), ST * .5); return; }
    var below = d.k > 0 ? KCLIFF.reachOf(S, d.k - 1, KCLIFF.wing(S, d.wing)) : 0;
    var nb = Math.max(1, Math.round(sx / 45)), bw = sx / nb, lived = KCLIFF.LIVED.indexOf(st) >= 0, dress = lived ? DRESS[d.by] : null;
    for (var i = 0; i < nb; i++) {
      var x0 = b.x0 + i * bw, x1 = x0 + bw, bx = (x0 + x1) / 2, c; stats.blocks++;
      var r = b.reach * (st === 'damaged' ? .5 + .3 * dr(d.id, i, 2) : .9 + .1 * dr(d.id, i, 1)), zf = Math.max(4, r - S.gallery);
      box('panel', bx, y - S.slab / 2, (r - .5) / 2, bw, S.slab, r + .5, { fm: { ny: 'soffit' }, skip: 'nz' });
      box('panel', bx, y + .55, r - .2, bw, 1.1, .4);                                                     /* the parapet */
      if (CONC[d.id]) {                                                                                   /* a concourse: open, columns */
        for (c = x0 + 6; c < x1 - 3; c += 14) for (var zc = 8; zc < zf; zc += 16) box('panel', c, y + ST / 2, zc, 1.6, ST, 1.6);
        continue;
      }
      var rz = st === 'damaged' ? zf * (.55 + .3 * dr(d.id, i, 3)) : zf;
      box('panel', bx, y + ST / 2, (rz + .3) / 2, bw - .6, ST, rz - .3, { skip: 'nz' });                    /* the rooms */
      box('guts', bx, y + ST + S.plenum / 2, Math.max(1, rz - 4) / 2, bw - .8, S.plenum, Math.max(1, rz - 4.6), { skip: 'nz' });   /* the plenum */
      // the window wall: a strip a storey, in 12 m segments, each lit (an intact pane) or dark by the state and the deck's draw
      var lit = st === 'reclaimed' ? .82 : st === 'kept' ? .18 : st === 'squatted' ? .25 : st === 'damaged' ? .05 : .04;
      for (var s = 0; s < S.storeys; s++) {
        var ys = y + 1.6 + S.storey * s + .9;
        for (c = x0 + .5; c < x1 - .5; c += 12) {
          var w = Math.min(12, x1 - .5 - c), u = dr(d.id, i * 40 + s, Math.round(c));
          box(st === 'sealed' ? 'walled' : (u < lit ? 'win' : 'dead'), c + w / 2, ys, rz + .15, w - .3, 1.8, .3);
        }
      }
      for (c = x0 + 3; c < x1 - 1; c += 6) box('panel', c, y + ST / 2, rz + .4, .5, ST, .8);              /* mullions */
      // the soffit's ribs on the strip the layer below does not cover
      if (r > below + 3) for (c = x0 + 5; c < x1 - 2; c += 10) box('soffit', c, y - S.slab - .6, (below + r) / 2, .8, 1.2, r - below);
      // life and decay on the gallery
      if (dress) for (c = x0 + (dress.planters ? 8 : 10); c < x1 - 6; c += dress.step) {
        if (dress.planters) box('green', c, y + .6, r - 1.4, 3, 1.2, 1.2);
        box(dress.awning, c + (dress.planters ? 8 : 0), y + 3.4, rz + 2.6, dress.planters ? 6 : 5, .15, 5);
      }
      if (st === 'kept') for (c = x0 + 10; c < x1 - 6; c += 20) box(((c - x0) / 20 | 0) % 2 ? 'lampR' : 'lampG', c, y + 3, rz + .5, .6, .6, .3);
      if (!lived) for (c = x0 + 4; c < x1 - 3; c += 7) {
        var uv = dr(d.id, i * 90 + Math.round(c), 5);
        if (uv < .22) { var len = 4 + 10 * dr(d.id, Math.round(c), 6); box('vine', c, y - S.slab - len / 2 + .2, r - .25, 1.4, len, .3); }
      }
      if (st === 'damaged') stub(d, { x0: x0, x1: x1, floor: y }, r, 0, true);
    }
  });
  // THE PANCAKED WINGS: each wing's pancaked slabs crushed onto the rooms of the deck under the lowest of them, their outer ends
  // draped over its gallery
  wIx.forEach(function (wing) {
    var ks = decks.filter(function (d) { return d.state === 'pancaked' && d.wing === wing; }).map(function (d) { return d.k; }).sort(function (a, b) { return a - b; });
    if (!ks.length) return;
    var base = deckAt(ks[0] - 1, wing), bb = KCLIFF.deckBox(S, base), zf = bb.reach - S.gallery, cx = (bb.x0 + bb.x1) / 2, sx = bb.x1 - bb.x0;
    var yb = bb.floor + ST;
    ks.forEach(function (k, i) {
      var d = deckAt(k, wing), db = KCLIFF.deckBox(S, d), sh = dr(d.id, 0, 40) * 2 - 1;
      box('guts', cx, yb + .6, zf / 2 + .3, sx - 2, 1.2, zf - .6); yb += 1.2;
      box('panel', cx + sh, yb + S.slab / 2, zf / 2 + .3, sx - 1, S.slab, zf - .6, { fm: { ny: 'soffit' } });
      var Ld = db.reach - zf, a = .32 + .06 * i + .1 * dr(d.id, 0, 41), q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), a);
      var off = new THREE.Vector3(0, 0, Ld / 2).applyQuaternion(q);
      box('panel', cx + sh, yb + S.slab / 2 + off.y, zf + off.z, sx - 1, S.slab, Ld, { q: q, fm: { ny: 'soffit' } });
      yb += S.slab;
    });
  });
  // THE FACE CORES: a tower a layer at a time, where the deck it passes through is not broken (damaged ones carry it)
  (o.cores || []).forEach(function (lf) {
    for (var k = 0; k < S.n; k++) {
      var d = null;
      for (var j = 0; j < decks.length; j++) { var q = decks[j]; if (q.k !== k) continue; var bq = KCLIFF.deckBox(S, q); if (lf.x >= bq.x0 && lf.x < bq.x1) { d = q; break; } }
      if (!d || ['sheared', 'pancaked', 'gone'].indexOf(d.state) >= 0) continue;
      var y0 = KCLIFF.layerY(S, k) - S.slab, runs = lf.runs && y0 + S.pitch > lf.runs[0] && y0 < lf.runs[1];
      box('panel', lf.x, y0 + S.pitch / 2, lf.z, lf.w, S.pitch, lf.d);
      box(runs ? 'win' : 'dead', lf.x, y0 + S.pitch / 2, lf.z + lf.d / 2 + .15, 2.4, S.pitch - 2, .3);
    }
  });
  var meshes = KCLIFF.LB.flush(R, o.mats || KCLIFF.mats(), R.name);
  return { root: R, meshes: meshes, stats: stats, tris: meshes.reduce(function (a, m) { return a + m.geometry.index.count / 3; }, 0) };
};
