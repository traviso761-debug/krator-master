// ================================================================= CORE — ruins, on a page: a three.js tree into pieces; the watch list  [web]
// 20-core-ruins.js does the analysis on boxes; this reads the drawn geometry into them and keeps the page's list of ruined structures.
// tools/harness.py asserts every watched structure on every verify (the universal "ruins" assert, with KRUINS.selfTest as its negative), so a
// build gets the check by watching what it makes:
//
//   KRUINS.watch(root, o)   after the structure is drawn (and its instances baked). root: the Object3D holding it (or the scene, with o.inside);
//                           o.name; o.ground(x, z) the ground under it as drawn (default 0); o.inside(x, z) the region that is this structure
//                           (with root the scene); o.skip(mesh, defName) true for a mesh that is decoration (moss, vines, stains, rubble,
//                           trees, figures: placed on what they decorate by their own helpers); o.analyse: options for KRUINS.analyse
//   KRUINS.pieces(roots, inside, ground, skip) -> P   a plain mesh's connected parts (its triangles joined by shared corners, 1 cm) and each
//                           instance of an instanced mesh, as boxes in the world with the ground under each
//   KRUINS.report() -> [{name, ok, detail}]   every watched structure measured now
//   KRUINS.selfTest() -> {ok, detail}   the negative: a box hung 40 m clear and a slab lifted 2 m off the ground beside a standing body must
//                           both be caught
// A piece is left out when its mesh carries userData.probeSkip or userData.decor, when its kit piece's name (kits/ancients' KIT.defs) is one of
// KRUINS.DECOR, or when o.skip says so. A door leaf (userData.door) moves, and is left out too.
KRUINS.DECOR = /^(moss|vine|stain|rubble|trunk|leafCard|figB|figH|dot)$/;
KRUINS.watched = [];
KRUINS.watch = function (root, o) { o = o || {}; KRUINS.watched.push({ root: root, name: o.name || root.name || 'a ruin', ground: o.ground || function () { return 0; }, inside: o.inside || null, skip: o.skip || null, opt: o.analyse || null }); return KRUINS.watched.length; };
KRUINS.pieces = function (roots, inside, ground, skip) {
  var P = [], v = new THREE.Vector3(), M = new THREE.Matrix4(), names = new Map();
  if (typeof KIT !== 'undefined' && KIT.defs) for (var nm in KIT.defs) names.set(KIT.defs[nm].geo, nm);
  var gUnder = function (b) { return Math.min(ground((b[0] + b[3]) / 2, (b[2] + b[5]) / 2), ground(b[0], b[2]), ground(b[3], b[5]), ground(b[0], b[5]), ground(b[3], b[2])); };
  var push = function (box, src) { var b = [box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z]; if (inside && !inside((b[0] + b[3]) / 2, (b[2] + b[5]) / 2)) return; P.push({ b: b, g: gUnder(b), src: src }); };
  (Array.isArray(roots) ? roots : [roots]).forEach(function (root) {
    root.updateMatrixWorld(true);
    root.traverse(function (m) {
      if (!m.isMesh || !m.geometry || !m.geometry.attributes.position) return;
      if (m.userData && (m.userData.probeSkip || m.userData.decor || m.userData.door)) return;
      var def = names.get(m.geometry); if (def && KRUINS.DECOR.test(def)) return; if (skip && skip(m, def)) return;
      var g = m.geometry, Pp = g.attributes.position;
      if (m.isInstancedMesh) {
        if (!g.boundingBox) g.computeBoundingBox();
        for (var i = 0; i < m.count; i++) { m.getMatrixAt(i, M); if (M.elements[0] === 0 && M.elements[5] === 0 && M.elements[10] === 0) continue; push(g.boundingBox.clone().applyMatrix4(M).applyMatrix4(m.matrixWorld), (def || m.name || 'instance') + '#' + i); }
        return;
      }
      /* union-find over the triangles by their corners' positions (1 cm) */
      var I = g.index, cnt = I ? I.count : Pp.count, at = function (q) { return I ? I.getX(q) : q; }, id = new Map(), par = [], vk = [];
      var find = function (a) { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
      for (var q = 0; q < cnt; q++) { var ix = at(q), k = Math.round(Pp.getX(ix) * 100) + ',' + Math.round(Pp.getY(ix) * 100) + ',' + Math.round(Pp.getZ(ix) * 100), x = id.get(k); if (x == null) { x = par.length; par.push(x); id.set(k, x); } vk.push(x); }
      for (var t = 0; t + 2 < vk.length; t += 3) { var a = find(vk[t]); par[find(vk[t + 1])] = a; par[find(vk[t + 2])] = a; }
      var boxes = new Map();
      for (var q2 = 0; q2 < vk.length; q2++) { var r = find(vk[q2]), bx = boxes.get(r); if (!bx) { bx = new THREE.Box3(); boxes.set(r, bx); } v.fromBufferAttribute(Pp, at(q2)).applyMatrix4(m.matrixWorld); bx.expandByPoint(v); }
      boxes.forEach(function (bx) { push(bx, m.name || (m.parent && m.parent.name) || 'mesh'); });
    });
  });
  return P;
};
KRUINS.measure = function (w) { return KRUINS.analyse(KRUINS.pieces(w.root, w.inside, w.ground, w.skip), w.opt || {}); };
KRUINS.report = function () { return KRUINS.watched.map(function (w) { var v; try { v = KRUINS.verdict(KRUINS.measure(w)); } catch (e) { v = { ok: false, detail: 'measure failed: ' + (e.message || e) }; } return { name: w.name, ok: v.ok, detail: v.detail }; }); };
KRUINS.selfTest = function () {
  var B = function (x0, y0, z0, x1, y1, z1, src) { return { b: [x0, y0, z0, x1, y1, z1], g: 0, src: src }; };
  var body = [B(-10, 0, -10, 10, 60, 10, 'body'), B(-30, 0, -2, -10, 2, 2, 'wing')];
  var good = KRUINS.analyse(body.concat([B(20, -0.2, 20, 30, 1, 26, 'wreck')]));
  var hung = KRUINS.analyse(body.concat([B(40, 40, 40, 44, 44, 44, 'hung')]));
  var lifted = KRUINS.analyse(body.concat([B(20, 2, 20, 30, 3, 26, 'lifted')]));
  var buried = KRUINS.analyse(body.concat([B(20, -3, 20, 30, -1.5, 26, 'buried')]));
  var a = KRUINS.verdict(good).ok, b = !KRUINS.verdict(hung).ok, c = !KRUINS.verdict(lifted).ok, d = !KRUINS.verdict(buried).ok;
  return { ok: a && b && c && d, detail: (a ? 'a seated wreck passes' : 'a SEATED WRECK FAILS') + '; ' + (b ? 'a hung box' : 'a HUNG BOX PASSES') + ', ' + (c ? 'a slab lifted 2 m' : 'a LIFTED SLAB PASSES') + ' and ' + (d ? 'one buried 3 m' : 'a BURIED SLAB PASSES') + (b && c && d ? ' each fail as they must' : '') };
};
