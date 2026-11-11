// Discovery: every drawable in a built town page, grouped by what tags it carries. Run by discover.py.
() => {
  const sc = (typeof scene !== 'undefined') ? scene : null;
  if (!sc) return {error: 'no global scene'};
  const kitName = new Map();
  for (const K of [(typeof KIT !== 'undefined' ? KIT : null), (typeof REEDKIT !== 'undefined' && REEDKIT ? REEDKIT.KIT : null), (typeof IZV !== 'undefined' && IZV ? IZV.KIT : null)]) {
    if (K && K.meshes) for (const n in K.meshes) { const m = K.meshes[n]; (Array.isArray(m) ? m : [m]).forEach(x => x && kitName.set(x, n)); }
  }
  const rows = [];
  const box = new THREE.Box3(), v = new THREE.Vector3();
  sc.updateMatrixWorld(true);
  sc.traverse(o => {
    if (!(o.isMesh || o.isPoints || o.isLine || o.isSprite)) return;
    let vis = true; for (let p = o; p; p = p.parent) if (!p.visible) { vis = false; break; }
    const g = o.geometry, idx = g && g.index, pos = g && g.attributes && g.attributes.position;
    const tris = g ? (idx ? idx.count : (pos ? pos.count : 0)) / 3 : 0;
    const inst = o.isInstancedMesh ? o.count : 1;
    let c = null;
    if (g) { if (!g.boundingBox) g.computeBoundingBox(); if (g.boundingBox) { box.copy(g.boundingBox).applyMatrix4(o.matrixWorld); box.getCenter(v); c = [Math.round(v.x), Math.round(v.y), Math.round(v.z), Math.round(box.max.x - box.min.x), Math.round(box.max.z - box.min.z)]; } }
    const ud = {};
    for (const k in o.userData) { const x = o.userData[k]; if (typeof x === 'function') ud[k] = 'fn'; else if (typeof x === 'object' && x) ud[k] = 'obj'; else ud[k] = x; }
    const m = Array.isArray(o.material) ? o.material[0] : o.material;
    rows.push({type: o.isInstancedMesh ? 'I' : o.isMesh ? 'M' : o.isSprite ? 'S' : o.isPoints ? 'P' : 'L', name: o.name || '', kit: kitName.get(o) || '',
      parent: o.parent && o.parent !== sc ? (o.parent.name || o.parent.type) : '', vis, tris: Math.round(tris), inst, ud,
      mat: m ? m.type + (m.map ? '+map' : '') + (m.vertexColors ? '+vc' : '') + (m.onBeforeCompile && m.onBeforeCompile.toString().length > 20 ? '+obc' : '') : '', c});
  });
  return {n: rows.length, rows};
}
