/* ============================== 6f. HOST: THE STREETS' CANOPIES, LANTERNS AND HANGING BANNERS ============================== */
/* [draw] The canopies over the streets (37b-vc-canopies.js VC.CANOPIES) and the hanging banners (the cantons' spans,
   20-site-cantons.js CANT.banners; the Temple's and the Fortress's dressing, 31-vc-voth.js VC.dressBanners), drawn
   with the library's sheets (materials.json: int_canopy, the tap_* pattern sheets, lantern_paper; 56-vc-interiors-host.js
   VC.intSetMat / intSheetMat), each as a few InstancedMeshes:
   - a canopy: two cloth halves sagging to the middle, three ropes (the edges and the middle), paper lanterns hung off
     the middle rope, lit after dark (the lantern material's glow follows the clock with the street lamps');
   - a banner (owner, 2026-10-15, "make banners look more like the hanging banners in the banner pics"): a tall narrow
     cloth on a short crossbar out from the wall or the parapet, a weighted hem bar, the glyph sheet of its canton. */
VC.drawStreet = function () {
  var G = VC.intGeo(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), qx = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), X = new THREE.Vector3(1, 0, 0), pos = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color();
  var groups = {}, add = function (step, mat, m, c) { var k = step + '|' + mat.uuid, e = groups[k] || (groups[k] = { step: step, mat: mat, L: [] }); e.L.push([m.clone(), c.clone()]); };
  var panelAt = function (step, mat, cx, cy, cz, d, w, h, t, tilt, c) { q.setFromAxisAngle(Y, Math.atan2(-d[1], d[0])); if (tilt) { qx.setFromAxisAngle(X, tilt); q.multiply(qx); } pos.set(cx, cy, cz); sc.set(w, h, t); m4.compose(pos, q, sc); add(step, mat, m4, c); };
  var cloth = VC.intSetMat('hide_canopy', { rough: 0.95 }), kilim = VC.intSheetMat('awning_stall', { tile: 2.4 }),   /* the market quarter's canopies are kilims, the wealthy streets' plain cloth */ rope = VC.intSetMat('int_wall', { rough: 0.9 }), cRope = col.clone().setHex(0x6a5a44);
  var paper = VC.intSheetMat('lantern_paper', { emissive: 0xffb060 }), iron = VC.intSetMat('int_wall', { rough: 0.6, metal: 0.4 }), cIron = col.clone().setHex(0x2a2622);
  var LC = [0xf0c070, 0xd84a3a, 0x5ab8c0, 0xf0c070, 0xe0a060, 0xd84a3a];
  /* the canopies */
  var nL = 0;
  (VC.CANOPIES || []).forEach(function (c, i) {
    var dx = c.b[0] - c.a[0], dz = c.b[1] - c.a[1], L = Math.hypot(dx, dz), d = [dx / L, dz / L], mx = (c.a[0] + c.b[0]) / 2, mz = (c.a[1] + c.b[1]) / 2, sag = Math.min(0.9, L * 0.06);
    var cc = col.clone().setHex(c.col), tilt = Math.atan2(sag, L / 2), half = Math.hypot(L / 2, sag);
    /* the two halves, each from a wall down to the sagging middle; its local x along d, tilted about it */
    var mat = c.market && (i % 3) ? kilim : cloth, cm = mat === kilim ? col.clone().setHex(0xffffff) : cc;
    panelAt(c.step, mat, (c.a[0] + mx) / 2, c.y - sag / 2, (c.a[1] + mz) / 2, d, half, 0.05, c.w, 0, cm);
    panelAt(c.step, mat, (mx + c.b[0]) / 2, c.y - sag / 2, (mz + c.b[1]) / 2, d, half, 0.05, c.w, 0, cm);
    [-1, 0, 1].forEach(function (sd) { var ox = -d[1] * sd * c.w / 2, oz = d[0] * sd * c.w / 2; panelAt(c.step, rope, mx + ox, c.y - sag * 0.5 + 0.03, mz + oz, d, L + 0.6, 0.05, 0.05, 0, cRope); });
    for (var k = 0; k < c.lanterns; k++) {
      var t = (k + 0.5) / c.lanterns, lx = c.a[0] + dx * t, lz = c.a[1] + dz * t, ly = c.y - sag * Math.sin(Math.PI * t) - 0.4;
      panelAt(c.step, iron, lx, ly + 0.2, lz, d, 0.02, 0.4, 0.02, 0, cIron);
      panelAt(c.step, paper, lx, ly - 0.22, lz, d, 0.34, 0.44, 0.34, 0, col.clone().setHex(LC[(i + k) % LC.length]));
      nL++;
    }
  });
  /* the hanging banners: the spans' and the dressed cantons' */
  var nB = 0;
  ((typeof CANT !== 'undefined' && CANT.banners) || []).concat(VC.dressBanners || []).forEach(function (b) {
    var sheet = VC.intSheetMat(b.sheet || 'tap_ordinator'), cTint = col.clone().setHex(b.tint || 0xffffff), d = b.d, n = b.n || [-d[1], d[0]];
    /* the crossbar out from the wall (or along the parapet), the cloth hung from it, the hem bar */
    panelAt(b.step, iron, b.x, b.y, b.z, d, b.w + 0.5, 0.1, 0.1, 0, cIron);
    panelAt(b.step, sheet, b.x + n[0] * 0.08, b.y - b.drop / 2, b.z + n[1] * 0.08, d, b.w, b.drop, 0.06, 0, cTint);
    panelAt(b.step, iron, b.x + n[0] * 0.08, b.y - b.drop + 0.05, b.z + n[1] * 0.08, d, b.w + 0.2, 0.1, 0.12, 0, cIron);
    if (b.border) panelAt(b.step, VC.intSetMat('int_gilt', { metal: 0.85, rough: 0.3 }), b.x + n[0] * 0.1, b.y - b.drop / 2, b.z + n[1] * 0.1, d, b.w + 0.08, b.drop + 0.04, 0.04, 0, col.clone().setHex(b.border));
    nB++;
  });
  VC.streetMeshes = [];
  Object.keys(groups).forEach(function (k) {
    var e = groups[k], IM = new THREE.InstancedMesh(G.panel, e.mat, e.L.length);
    e.L.forEach(function (it, i) { IM.setMatrixAt(i, it[0]); IM.setColorAt(i, it[1]); });
    IM.castShadow = e.mat !== paper; IM.receiveShadow = true; IM.frustumCulled = false; IM.userData = { step: e.step, kind: 'street', probeSkip: true };
    scene.add(IM); VC.streetMeshes.push(IM); (VC.meshes = VC.meshes || []).push(IM);
  });
  /* the lanterns' glow follows the clock with the street lamps' (55-vc-host.js VC.applyHour: VC.lampMats) */
  paper.emissiveIntensity = 0.25;
  (VC.glowMats = VC.glowMats || []).push(paper);
  /* the catalog's painted panels take the delivered sheets (krator-furniture-core.js caches a decal's material by its key): the
     wayside shrine's mural and the market stall's hung rug */
  var swapped = 0;
  if (typeof _texCache !== 'undefined') [['voth:shrinemural', 'mural_shrine'], ['voth:stallrug:0', 'awning_stall'], ['voth:stallrug:1', 'kilim_brown']].forEach(function (e) {
    var m = _texCache.get(e[0]), D = VC.intTex(e[1]); if (m && D) { m.map = D.tex; m.needsUpdate = true; swapped++; }
  });
  VC.streetStats = { decals: swapped, canopies: (VC.CANOPIES || []).length, lanterns: nL, banners: nB, meshes: VC.streetMeshes.length };
  return VC.streetStats;
};
