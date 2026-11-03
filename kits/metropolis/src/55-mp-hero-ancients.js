// ================================================================= METROPOLIS — the Ancients kit's buildings as heroes  [draw]
// MP.heroAncient(A, state) -> a Group: the kit's builder (A.fn, read in place from kits/ancients/src) run once into a group of its own at the
// origin, intact, then the kit's instanced detail (windows, mullions, slabs: KIT, kput) baked into that same group. The kit keeps one
// list of instances for a whole page and bakes it once (its 90-scene.js); here every hero empties the lists first and bakes its own, so
// each hero carries only its own detail and can be cloned like any other. The group is centred on its plan (a builder that draws a second
// building beside the first, as the Library's reading hall or the Reliquary's reactor hut, is off its own origin), and its size is
// measured (`MP.ancientSize`, for the records' footprint and heights). No walk outline yet: these are the kit's shells, not storeys.
// The quality pass (the owner, 2026-11-03: floating or distorted pieces, room for a working plan):
//  - A.scale (46b) scales a building whose storeys are too low for a plan (the Honeycomb Block's 2.3 m) or that the owner wants bigger
//    (the Houses), uniformly, so its proportions hold.
//  - the kit's standing figures (figB, figH) are not baked: they are the kit's showcase people, and scaled they would be giants.
//  - a baked instance above the ground that touches nothing within half a metre is dropped (MP.ancientFloaters): the Crown Library's glass
//    finial stood 55 to 65 m up, 10 m off the crown's axis, over nothing.
MP.ANCIENT_SKIP = ['figB', 'figH'];
MP.heroAncient = function (A, state) {
  const fn = window[A.fn];
  if (typeof fn !== 'function') throw new Error('heroAncient: the Ancients kit has no ' + A.fn + ' on this page (kits/metropolis/build.py ANC_BUILDERS)');
  KIT.order.forEach(n => { KIT.items[n].length = 0; });
  KOFF = [0, 0, 0]; KXF = null;
  const holder = new THREE.Group(), G = new THREE.Group(), sc = A.scale == null ? 1 : A.scale;
  fn(holder, 0, 0, 0);
  MP.ANCIENT_SKIP.forEach(n => { if (KIT.items[n]) KIT.items[n].length = 0; });
  KOFF = [0, 0, 0]; KXF = null; kbake(holder);
  KIT.order.forEach(n => { KIT.items[n].length = 0; });
  const dropped = MP.ancientFloaters(holder, true);
  holder.scale.setScalar(sc);
  const S = MP.ancientSize(holder);
  holder.position.set(-S.cx, 0, -S.cz); G.add(holder);
  G.name = A.id + '.' + (state == null ? 'intact' : state); G.userData.walk = []; G.userData.size = S; G.userData.dropped = dropped;
  return G;
};
/* the pieces of a group: each instance by its box, each plain mesh split into its connected parts (vertices shared by triangles or by
   position) by theirs. The instances above the ground that touch no other piece within `gap` (0.5 m) float; with drop, each is scaled to
   nothing. Returns what floated: [kit item, min x, y, z, size x, y, z] */
MP.ancientFloaters = function (root, drop, gap) {
  const e = gap == null ? 0.5 : gap, boxes = [], v = new THREE.Vector3(), m = new THREE.Matrix4(), Z = new THREE.Matrix4().makeScale(0, 0, 0);
  const g2n = new Map(); KIT.order.forEach(n => g2n.set(KIT.defs[n].geo, n));
  root.updateMatrixWorld(true);
  root.traverse(o => {
    if (!o.isMesh || !o.geometry) return;
    const P = o.geometry.attributes.position, I = o.geometry.index;
    if (o.isInstancedMesh) {
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); boxes.push({ b: o.geometry.boundingBox.clone().applyMatrix4(m).applyMatrix4(o.matrixWorld), o, i }); }
      return;
    }
    const n = P.count, par = new Int32Array(n);
    for (let i = 0; i < n; i++) par[i] = i;
    const f = i => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; }, u = (a, b) => { a = f(a); b = f(b); if (a !== b) par[a] = b; };
    const key = new Map();
    for (let i = 0; i < n; i++) { const k = Math.round(P.getX(i) * 50) + ',' + Math.round(P.getY(i) * 50) + ',' + Math.round(P.getZ(i) * 50), j = key.get(k); if (j == null) key.set(k, i); else u(i, j); }
    const T = I ? I.count : n;
    for (let t = 0; t < T; t += 3) { const a = I ? I.getX(t) : t, b = I ? I.getX(t + 1) : t + 1, c = I ? I.getX(t + 2) : t + 2; u(a, b); u(b, c); }
    const comp = new Map();
    for (let i = 0; i < n; i++) { const r = f(i); let b = comp.get(r); if (!b) { b = new THREE.Box3(); comp.set(r, b); } v.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld); b.expandByPoint(v); }
    comp.forEach(b => boxes.push({ b, o: null }));
  });
  const out = [];
  boxes.forEach((B, i) => {
    if (!B.o || B.b.min.y < 0.4) return;
    const x = B.b.clone().expandByScalar(e);
    for (let j = 0; j < boxes.length; j++) if (j !== i && x.intersectsBox(boxes[j].b)) return;
    out.push([g2n.get(B.o.geometry) || '?', +B.b.min.x.toFixed(1), +B.b.min.y.toFixed(1), +B.b.min.z.toFixed(1), +(B.b.max.x - B.b.min.x).toFixed(1), +(B.b.max.y - B.b.min.y).toFixed(1), +(B.b.max.z - B.b.min.z).toFixed(1)]);
    if (drop) { B.o.setMatrixAt(B.i, Z); B.o.instanceMatrix.needsUpdate = true; }
  });
  return out;
};
/* the drawn extent: plain meshes by their geometry's box, instanced ones by each instance's box; a dropped (zero-scaled) instance is left out */
MP.ancientSize = function (root) {
  const b = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4();
  root.updateMatrixWorld(true);
  root.traverse(o => {
    if (!o.isMesh || !o.geometry) return;
    if (o.isInstancedMesh) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); if (m.determinant() === 0) continue; b.union(o.geometry.boundingBox.clone().applyMatrix4(m).applyMatrix4(o.matrixWorld)); } return; }
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    const bb = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); if (isFinite(bb.min.x)) b.union(bb);
  });
  let tris = 0;
  root.traverse(o => { if (o.isMesh && o.geometry) { const c = o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count; tris += c / 3 * (o.isInstancedMesh ? o.count : 1); } });
  return { cx: (b.min.x + b.max.x) / 2, cz: (b.min.z + b.max.z) / 2, w: b.max.x - b.min.x, d: b.max.z - b.min.z, top: b.max.y, tris: Math.round(tris) };
};
