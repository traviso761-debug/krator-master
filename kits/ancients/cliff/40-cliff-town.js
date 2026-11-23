// ================================================================= KCLIFF — the cliff city's towns: each part to the builder its key names ([draw])
// Lifted from Ledge's 8lb-host-town.js (2026-11-22) when Shelf took the same form. No position is decided here (the layout's): each part
// at its footprint centre on its ground, turned by its ry:
//   dalab_*     the Dalab set, read in place (settlements/dalab): VERN.place
//   fg-*        the Fellgang set (kits/tungang, sealed as TG): TG.fg.draw, one call a quarter (o.quarters: a zone each)
//   anc:*       the Ancients' own pieces in the shell's panel (KCLIFF.LB): the lift halls, a mole, a station's mouth on the face (o.mouth)
//   tg:*        a Tungang def: a tagged stand-in until the tg set merges (claude/loj-twenny-059a5e): a winding house is a rust block and
//               the great lifts' headframes; one with no shape (inside its deck) is left undrawn (it is tagged)
//   yard, halting: fenced earth; the Travellers' barrel-top wagons in loose rows
//
//   KCLIFF.drawTown(o) -> {placed, missing, own, standin, fg, meshes, ms}
//     o: {L, scene, ground(x, z), seed(id) (the part's seed), draw(id, i, salt), prefix ('ledge': the Fellgang records' ids),
//         quarters [{zone, id, focus, seed, label, character}], mouth {part, decks: [two deck ids]} or null, mats (KCLIFF.mats())}
KCLIFF.drawTown = function (o) {
  var L = o.L, scene = o.scene, H = o.ground, dr = o.draw, box = KCLIFF.LB.box, placed = [], missing = [], own = [], standin = [];
  var C = function (p) { var b = KCLIFF.bbox(p.shape); return [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, b]; };
  var t0 = performance.now();
  // ---- the Dalab set
  L.parts.forEach(function (p) {
    if (!p.key || p.key.indexOf('dalab_') !== 0) return; var c = C(p);
    if (typeof VERN === 'undefined' || !VERN.defs[p.key]) { missing.push(p.id); return; }
    var g = VERN.place(scene, p.key, c[0], c[1], p.ry || 0, { y: p.y, v: KRAND.hash(o.seed(p.id), 7) % 3 });
    if (g) { placed.push(p.id); own.push({ id: p.id, kit: 'dalab', w: c[2][1] - c[2][0], d: c[2][3] - c[2][2], ry: p.ry || 0, def: [VERN.defs[p.key].w, VERN.defs[p.key].d] }); } else missing.push(p.id);
  });
  // ---- the Fellgang set: a quarter a draw (TG.fg.draw seats each record on the ground itself)
  var fg = {};
  (o.quarters || []).forEach(function (Q) {
    var ps = L.parts.filter(function (p) { return p.zone === Q.zone && p.key && p.key.indexOf('fg-') === 0; }); if (!ps.length) return;
    var recs = ps.map(function (p) {
      var c = C(p), q = Math.abs(Math.sin(p.ry || 0)) > .5, bw = c[2][1] - c[2][0], bd = c[2][3] - c[2][2];
      return { key: p.key, id: o.prefix + '.' + p.id, x: c[0], z: c[1], ry: p.ry || 0, w: q ? bd : bw, d: q ? bw : bd, h: p.h };
    });
    var pop = ps.reduce(function (a, p) { return a + p.people; }, 0);
    if (typeof TG === 'undefined' || !TG.fg) { ps.forEach(function (p) { missing.push(p.id); }); return; }
    var M = TG.fg.draw({ id: Q.id, focus: Q.focus, census: { pop: pop }, records: recs }, { scene: scene, ground: H, seed: Q.seed, label: Q.label, character: Q.character });
    fg[Q.zone] = M; var miss = M.missing || {};
    ps.forEach(function (p) { if (miss[p.key]) missing.push(p.id); else { placed.push(p.id); own.push({ id: p.id, kit: 'fellgang' }); } });
  });
  // ---- the Ancients' own pieces and the stand-ins (the box batch, flushed into one group)
  var AG = new THREE.Group(); AG.name = 'the Ancients\' halls'; scene.add(AG);
  L.parts.forEach(function (p) {
    if (!p.shape || !p.key) return; var c = C(p), b = c[2], sx = b[1] - b[0], sz = b[3] - b[2];
    if (p.key === 'anc:lifthall') {
      box('panel', c[0], p.y + p.h / 2, c[1], sx, p.h, sz);
      var front = b[3] > 0 && b[2] >= 0 ? b[3] : b[2], out = front === b[3] ? 1 : -1;
      [-.25, .25].forEach(function (f) { box('dead', c[0] + f * sx, p.y + Math.min(10, p.h * .6) / 2, front + out * .15, Math.min(24, sx * .3), Math.min(10, p.h * .6), .3); });
      for (var x = b[0] + 6; x < b[1] - 4; x += 6) box('win', x, p.y + p.h - 4, front + out * .15, 3.4, 2.2, .3);
      placed.push(p.id); own.push({ id: p.id, kit: 'ancient' });
    } else if (p.key === 'anc:mole') {
      var bed = Math.min(H(b[0], b[3]), H(b[1], b[3])) - .5; box('panel', c[0], (bed + p.y) / 2, c[1], sx, p.y - bed, sz);
      for (var z = b[2] + 10; z < b[3] - 4; z += 20) { box('rust', b[0] + 1, p.y + .5, z, .8, 1, .8); box('rust', b[1] - 1, p.y + .5, z, .8, 1, .8); }
      placed.push(p.id); own.push({ id: p.id, kit: 'ancient' });
    } else if (p.key === 'anc:station' && o.mouth && o.mouth.part === p.id) {
      /* its mouth on the dressed face over its concourse (the platforms are in the rock) */
      var d1 = KCLIFF.deckBox(L.stack, L.decks.filter(function (d) { return d.id === o.mouth.decks[0]; })[0]), d2 = KCLIFF.deckBox(L.stack, L.decks.filter(function (d) { return d.id === o.mouth.decks[1]; })[0]);
      var x0 = Math.max(b[0], d1.x0) + 4, x1 = Math.min(b[1], d2.x1) - 4;
      box('dead', (x0 + x1) / 2, p.y + 9, .15, x1 - x0, 18, .3); box('lampG', (x0 + x1) / 2, p.y + 19, .35, x1 - x0 - 20, .6, .3);
      placed.push(p.id); own.push({ id: p.id, kit: 'ancient' });
    } else if (p.key === 'tg:tg_lift_head') {
      /* the winding house over the great lifts: a stand-in block and the lifts' headframes */
      box('rust', c[0], p.y + p.h / 2, c[1], sx, p.h, sz);
      L.lifts.filter(function (lf) { return lf.kind === 'car'; }).forEach(function (lf) {
        [-6, 6].forEach(function (q) { box('rust', lf.x + q, p.y + p.h * 1.3, lf.z, 1.2, p.h * 2.6 + p.h * .0, 1.2); }); box('rust', lf.x, p.y + p.h * 2.6, lf.z, 14, 1.4, 2);
      });
      placed.push(p.id); standin.push(p.id); own.push({ id: p.id, kit: 'tungang-standin' });
    } else if (p.key.indexOf('anc:') === 0 || p.key.indexOf('tg:') === 0) { placed.push(p.id); if (p.key.indexOf('tg:') === 0) standin.push(p.id); }
  });
  L.parts.forEach(function (p) { if (!p.shape && p.key && p.key.indexOf('tg:') === 0) { placed.push(p.id); standin.push(p.id); } });
  // ---- the yards: fenced earth; the halting place: barrel-top wagons in loose rows
  L.parts.forEach(function (p) {
    if (p.kind !== 'yard' && p.kind !== 'halting') return; var c = C(p), b = c[2], y = p.y;
    box(p.kind === 'yard' ? 'earth' : 'grass', c[0], y + .03, c[1], b[1] - b[0], .06, b[3] - b[2]);
    if (p.kind === 'yard') {
      var post = function (x, z) { box('timber', x, y + .75, z, .25, 1.5, .25); };
      for (var x = b[0]; x <= b[1] + .01; x += 4) { post(x, b[2]); post(x, b[3]); } for (var z = b[2] + 4; z < b[3]; z += 4) { post(b[0], z); post(b[1], z); }
      [[.6], [1.2]].forEach(function (h) {
        box('timber', c[0], y + h[0], b[2], b[1] - b[0], .14, .12); box('timber', c[0], y + h[0], b[3], b[1] - b[0], .14, .12);
        box('timber', b[0], y + h[0], c[1], .12, .14, b[3] - b[2]); box('timber', b[1], y + h[0], c[1], .12, .14, b[3] - b[2]);
      });
    } else {
      var n = 0;
      for (var zz = b[2] + 8; zz < b[3] - 6; zz += 13) for (var xx = b[0] + 8; xx < b[1] - 6; xx += 11) {
        if (dr(p.id, n, 1) < .25) { n++; continue; }
        var ry = (dr(p.id, n, 2) - .5) * .8, q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry), cs = Math.cos(ry), sn = Math.sin(ry);
        box('timber', xx, y + .9, zz, 1.9, .6, 4.2, { q: q });
        for (var a = 0; a < 5; a++) {
          var t = a / 4 * Math.PI, hx = Math.cos(t) * 1.0, hy = Math.sin(t) * 1.0;
          box(n % 3 ? 'canvas' : 'canvas2', xx + hx * cs, y + 1.2 + hy, zz - hx * sn, .7, .12, 4.0,
            { q: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), t - Math.PI / 2)) });
        }
        [[-1, -1.4], [1, -1.4], [-1, 1.4], [1, 1.4]].forEach(function (w) { box('timber', xx + w[0] * cs + w[1] * sn, y + .45, zz - w[0] * sn + w[1] * cs, .15, .9, .9, { q: q }); });
        n++;
      }
    }
    placed.push(p.id); own.push({ id: p.id, kit: 'page' });
  });
  var mats = Object.assign({}, o.mats, { timber: MAT.timber || o.mats.ochre, earth: new THREE.MeshLambertMaterial({ color: 0x7a6a52 }), grass: new THREE.MeshLambertMaterial({ color: 0x5e6e3e }),
    canvas: new THREE.MeshStandardMaterial({ color: 0xd8cdb0, roughness: 1, side: THREE.DoubleSide }), canvas2: new THREE.MeshStandardMaterial({ color: 0x8a5a3a, roughness: 1, side: THREE.DoubleSide }) });
  var meshes = KCLIFF.LB.flush(AG, mats, 'the Ancients\' halls, the yards, the halting place');
  /* the Dalab set draws through the Ancients kit's instancing (kput): bake its instances into the scene once, after every place */
  if (typeof kbake === 'function') kbake(scene);
  return { placed: placed, missing: missing, own: own, standin: standin, fg: fg, meshes: meshes, ms: Math.round(performance.now() - t0) };
};
