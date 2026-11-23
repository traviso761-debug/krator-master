// ================================================================= 88y. THE DILIHAN SHEET MATERIAL LIBRARY: pack bind on MAT
// Binds the packed PBR brick, terracotta, mortar, wood, stone, canvas and verdigris sets of kits/dilihan/materials.json
// (loaded from dist/dilihan.tex.dilihan.js by 88x-matlib-pack.js) onto MAT in place before 90-vsheet-scene.js builds the rows.
// ?mat=proc leaves the procedural canvas maps untouched.

const DLS_MATLIB = KMAT.bindMat('dilihan', MAT, { tile: KMAT.ANCIENT_TILES });
function dlsMatHook(m, L) {
  const h = [];
  if (m.userData.uvK) h.push('world-uv');
  if (m.userData.lib && L && L.breakup) h.push('breakup');
  if (MAT.glass && (m === MAT.glass || m.onBeforeCompile === MAT.glass.onBeforeCompile)) h.push('glass');
  return h.length ? h.join('+') : null;
}
(function dlsMatRecords() {
  const recs = {};
  for (const k in MAT) {
    const m = MAT[k];
    if (!m || !m.isMeshStandardMaterial) continue;
    const L = m.userData.lib ? KMAT.packed('dilihan', k) : null;
    const K = m.userData.uvK || 0;
    recs[k] = {
      id: 'dilihan.' + k,
      family: k,
      colour: '#' + m.color.getHexString(),
      scale: L ? L.scale.slice() : (K ? [1 / K, 1 / K] : [1, 1]),
      tint: L ? (L.tint === 0) : true,
      roughness: Math.min(1, m.roughness),
      metal: Math.min(1, m.metalness),
      specular: L && L.specular != null ? L.specular : 0.5,
      emissive: m.emissive && m.emissiveIntensity > 0 && m.emissive.getHex() ? '#' + m.emissive.getHexString() : null,
      doubleSided: m.side === THREE.DoubleSide,
      breakup: L && L.breakup ? L.breakup : null,
      lib: L ? L.lib : null,
      bake: !L && !!m.map,
      hook: dlsMatHook(m, L),
      note: L ? 'library set ' + L.lib + ', tint keep ' + L.tint : (m.map ? 'procedural map' : 'untextured')
    };
  }
  KMAT.adapter('dilihan', recs);
  window._materials = KMAT.table('dilihan');
})();
