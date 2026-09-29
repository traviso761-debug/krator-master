/* ======================================================================
   Krator LOD — merge + level-of-detail for ASSET buildings
   Load after krator-asset-engine.js and before any registry. Opt-in: nothing
   changes until KratorLOD.enabled is true (the catalog turns it on).

   What it does to each building the engine builds:
     1. MERGE. The engine makes one THREE.Mesh per primitive, so a palace is
        ten thousand draw calls. Every primitive is folded, with its colour
        baked into a vertex colour, into one mesh per material family
        (matte, metal, glass, glow). A building becomes 1-4 draw calls.
     2. LOD. Three levels in a THREE.LOD, picked by camera distance relative
        to the building's own size S (its largest measured extent):
          L0  everything                                  0 .. S*NEAR
          L1  drops parts smaller than 3.5% of S           S*NEAR .. S*FAR
              (window frames, lamps, sills, trim, props)
          L2  keeps only masses larger than 14% of S,      beyond S*FAR
              all in one mesh (walls, roofs, towers, domes)
        (both thresholds are capped at the 50th / 85th percentile of part
        size so a level never empties, and switch distances use
        max(height, sqrt(w*d)) so a long causeway switches like a block)
        Nothing needs to be written per building: the levels come from part
        size. Two rules for authors follow from that —
          * don't build a big surface out of many small pieces (a wall of
            1 m bricks disappears at L2); lay the mass, then detail on top;
          * builds MAY read F.lod (always 0 here) — reserved for hand LODs.
     2b. L2 drops 'cloth'-family parts (canopies, awnings, sails): their posts
        fall under the size cut, so the cloth would float.
     3. Point lights (F.lamp) are dropped when LOD is on: a forward renderer
        pays for every light on every material, and a street of lamps makes
        the whole catalog crawl. The glow balls that mark lamps stay.

   measureInstance() is wrapped so it measures L0 only.
   ====================================================================== */
const KratorLOD = (function () {
  'use strict';
  const K = {
    enabled: false,
    force: -1,            /* -1 auto; 0/1/2 pin every building to that level */
    NEAR: 5.5, FAR: 16,
    T1: 0.035, T2: 0.14,
    stats: { buildings: 0, parts: 0, tris: [0, 0, 0] }
  };

  const MATS = {};
  function famMat(fam) {
    if (MATS[fam]) return MATS[fam];
    let m;
    if (fam === 'glow') m = new THREE.MeshBasicMaterial({ vertexColors: true });
    else if (fam === 'glass') m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.55 });
    else if (fam === 'metal') m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.7 });
    else m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 });
    return (MATS[fam] = m);
  }
  function famOf(material) {
    if (material.isMeshBasicMaterial) return 'glow';
    if (material.transparent) return 'glass';
    if (material.metalness > 0.5) return 'metal';
    return 'matte';
  }

  const _v = new THREE.Vector3(), _n = new THREE.Vector3(), _nm = new THREE.Matrix3();
  /* one part = one source mesh, pre-flattened to world-space triangles */
  function flatten(mesh) {
    mesh.updateMatrix();
    const g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
    const P = g.attributes.position, N = g.attributes.normal, C = g.attributes.color;
    const n = P.count, pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
    _nm.getNormalMatrix(mesh.matrix);
    for (let i = 0; i < n; i++) {
      _v.fromBufferAttribute(P, i).applyMatrix4(mesh.matrix);
      pos[i * 3] = _v.x; pos[i * 3 + 1] = _v.y; pos[i * 3 + 2] = _v.z;
      if (N) { _n.fromBufferAttribute(N, i).applyMatrix3(_nm).normalize(); nor[i * 3] = _n.x; nor[i * 3 + 1] = _n.y; nor[i * 3 + 2] = _n.z; }
    }
    const bb = mesh.geometry.boundingBox || (mesh.geometry.computeBoundingBox(), mesh.geometry.boundingBox);
    const s = mesh.scale;
    const ext = Math.max((bb.max.x - bb.min.x) * s.x, (bb.max.y - bb.min.y) * s.y, (bb.max.z - bb.min.z) * s.z);
    const c = mesh.material.color;
    /* a mesh that already carries vertex colours (captured ships, carts) keeps them */
    let vcol = null;
    if (C && mesh.material.vertexColors) {
      vcol = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { vcol[i * 3] = C.getX(i) * c.r; vcol[i * 3 + 1] = C.getY(i) * c.g; vcol[i * 3 + 2] = C.getZ(i) * c.b; }
    }
    if (g !== mesh.geometry) g.dispose();
    return { pos, nor, n, ext, fam: famOf(mesh.material), cloth: mesh.material.userData.family === 'cloth', r: c.r, g: c.g, b: c.b, vcol };
  }

  function merge(parts, famFilter) {
    let n = 0;
    for (const p of parts) if (!famFilter || famFilter(p)) n += p.n;
    if (!n) return null;
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
    let o = 0;
    for (const p of parts) {
      if (famFilter && !famFilter(p)) continue;
      pos.set(p.pos, o * 3); nor.set(p.nor, o * 3);
      if (p.vcol) col.set(p.vcol, o * 3);
      else for (let i = 0; i < p.n; i++) { col[(o + i) * 3] = p.r; col[(o + i) * 3 + 1] = p.g; col[(o + i) * 3 + 2] = p.b; }
      o += p.n;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeBoundingSphere(); g.computeBoundingBox();
    return g;
  }

  function levelGroup(parts, minExt, oneMesh, lvl) {
    const grp = new THREE.Group();
    grp.userData.lodLevel = lvl;
    /* L2 also drops cloth: canopies, awnings and sails are big enough to
       survive the size cut, but the thin posts holding them up are not, so
       at distance they would hang in the air */
    const keep = parts.filter((p) => p.ext >= minExt && !(lvl === 2 && p.cloth));
    const fams = oneMesh ? ['matte'] : ['matte', 'metal', 'glass', 'glow'];
    let tris = 0;
    for (const f of fams) {
      const g = merge(keep, oneMesh ? (p) => p.fam !== 'glass' || p.ext >= minExt * 2 : (p) => p.fam === f);
      if (!g) continue;
      const m = new THREE.Mesh(g, famMat(f));
      m.userData.lodLevel = lvl;
      grp.add(m);
      tris += g.attributes.position.count / 3;
    }
    K.stats.tris[lvl] += tris;
    return grp;
  }

  /* fold a freshly built instance group into merged LOD levels, in place */
  K.finalize = function (g) {
    const meshes = [], lights = [];
    g.traverse((o) => { if (o.isMesh) meshes.push(o); else if (o.isLight) lights.push(o); });
    if (!meshes.length) return g;
    const parts = meshes.map(flatten);
    let S = 0;
    const bb = new THREE.Box3();
    for (const p of parts) for (let i = 0; i < p.n; i++) bb.expandByPoint(_v.set(p.pos[i * 3], p.pos[i * 3 + 1], p.pos[i * 3 + 2]));
    const size = bb.getSize(new THREE.Vector3());
    S = Math.max(size.x, size.y, size.z, 1);
    /* thresholds: a fraction of S, but never so high that a level empties —
       a 1 km causeway or a market of a thousand stalls has no single part
       14% of its length. Capped at the part-size percentiles instead. */
    const exts = parts.map((p) => p.ext).sort((a, b) => a - b);
    const pct = (q) => exts[Math.min(exts.length - 1, Math.floor(q * exts.length))];
    const t1 = Math.min(S * K.T1, pct(0.5)), t2 = Math.min(S * K.T2, pct(0.85));
    /* switch distances from the building's presence, not its longest run:
       a long thin causeway should drop detail at the distance a block would */
    const Sd = Math.max(size.y, Math.sqrt(size.x * size.z), 1);
    for (const m of meshes) { m.parent.remove(m); m.geometry.dispose(); }
    for (const l of lights) l.parent.remove(l);

    const lod = new THREE.LOD();
    lod.userData.lodS = Sd;
    lod.addLevel(levelGroup(parts, 0, false, 0), 0);
    lod.addLevel(levelGroup(parts, t1, false, 1), Sd * K.NEAR);
    lod.addLevel(levelGroup(parts, t2, true, 2), Sd * K.FAR);
    /* THREE.LOD measures from its own position; put it at the footprint so
       distance means distance to the building, and shift the levels back */
    const c = bb.getCenter(new THREE.Vector3());
    lod.position.set(c.x, 0, c.z);
    lod.levels.forEach((L) => L.object.position.set(-c.x, 0, -c.z));
    if (K.force >= 0) { lod.autoUpdate = false; lod.levels.forEach((L, i) => { L.object.visible = i === K.force; }); }
    g.add(lod);
    g.userData.lod = lod;
    K.stats.buildings++; K.stats.parts += parts.length;
    return g;
  };

  K.setForce = function (lvl) {
    K.force = lvl;
    scene.traverse((o) => {
      if (!o.isLOD) return;
      if (lvl < 0) { o.autoUpdate = true; }
      else { o.autoUpdate = false; o.levels.forEach((L, i) => { L.object.visible = i === lvl; }); }
    });
  };

  /* remember each material's family label ('cloth', 'wood', ...): mat() caches
     by (colour, family), so a material belongs to exactly one family */
  const _mat = window.mat;
  window.mat = function (color, family) {
    const m = _mat(color, family);
    if (family && !m.userData.family) m.userData.family = family;
    return m;
  };

  /* wrap the engine's instance builder so every building (and every inspector
     rebuild) comes out merged. Furniture and plants are left alone. */
  const _orig = window._buildInstance;
  window._buildInstance = function (kind, registry, key, x, z, ry, opt) {
    const g = _orig(kind, registry, key, x, z, ry, opt);
    if (g && K.enabled && kind === 'building') K.finalize(g);
    return g;
  };
  const _origMeasure = window.measureInstance;
  window.measureInstance = function (g) {
    /* measure L0 only: detach the coarser level groups for the duration
       (the original traverses regardless of visibility) */
    const lod = g.userData && g.userData.lod;
    if (!lod) return _origMeasure(g);
    const rest = lod.levels.slice(1).map((L) => L.object);
    rest.forEach((o) => lod.remove(o));
    const r = _origMeasure(g);
    rest.forEach((o) => lod.add(o));
    return r;
  };
  return K;
})();
