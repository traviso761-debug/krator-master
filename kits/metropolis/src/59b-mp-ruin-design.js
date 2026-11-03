// ================================================================= METROPOLIS — a design with plans, ruined  [draw]
// MP.ruinDesign(G, F, state): the design's own hero (54) cut to a ruin state of its record (MP.ruin, 40), the way the Spindle's and the Ledger's
// builders cut theirs: every triangle and pier above the torn line goes (MP.tearAt: the cut, less up to a few storeys by noise, round the tower);
// gutted, the glass and the doors go and the stone is stained; a skeleton keeps its piers and bare floor slabs above its skin line to the cut;
// the floor slabs stand inside under the tear (a ruin is looked into from above); a stump's core stands over its cut; the rubble (MP.debris,
// the record's debris plan) lies at its foot. G is changed in place and returned.
MP.ruinDesign = function (G, F, state) {
  const R = MP.ruin(F, state); if (R.state === 'intact') return G;
  const glassy = n => /glass/.test(n), stain = state === 'intact' ? 1 : (F.ruins[state] && F.ruins[state].stain != null ? F.ruins[state].stain : 0.72);
  const u = (x, z) => Math.atan2(z, x) * 24, limit = (x, z) => (state === 'gutted' ? Infinity : MP.tearAt(F, R, u(x, z)));
  const skin = R.frame ? R.skin : Infinity, top = R.frame ? R.frame[1] : Infinity, v = new THREE.Vector3(), m = new THREE.Matrix4(), Z = new THREE.Matrix4().makeScale(0, 0, 0);
  const drop = [];
  G.traverse(o => {
    if (!o.isMesh || !o.geometry) return;
    if (o.name === 'a door leaf') { drop.push(o); return; }
    const n = o.material && o.material.name || '';
    if (glassy(n) && state !== 'intact') { drop.push(o); return; }
    if (o.isInstancedMesh) {
      /* the piers: cut at the tear; a skeleton's stand to the frame's top */
      for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); v.setFromMatrixPosition(m); const yTop = v.y + Math.abs(m.elements[5]) / 2, lim = R.frame ? top : limit(v.x, v.z); if (yTop > lim) o.setMatrixAt(i, Z); }
      o.instanceMatrix.needsUpdate = true; return;
    }
    /* the merged surfaces: keep a triangle under the torn line (a skeleton's skin under its skin line); the stone stained */
    const g = o.geometry, P = g.attributes.position, I = g.index; if (!I) return;
    const keep = [];
    for (let t = 0; t < I.count; t += 3) {
      const a = I.getX(t), b = I.getX(t + 1), c = I.getX(t + 2), y = Math.max(P.getY(a), P.getY(b), P.getY(c)), cx = (P.getX(a) + P.getX(b) + P.getX(c)) / 3, cz = (P.getZ(a) + P.getZ(b) + P.getZ(c)) / 3;
      if (y <= Math.min(limit(cx, cz), skin) + 0.05) keep.push(a, b, c);
    }
    const g2 = g.clone(); g2.setIndex(keep); const C = g2.attributes.color; if (C && stain < 1) { for (let i = 0; i < C.count; i++) C.setXYZ(i, C.getX(i) * stain, C.getY(i) * stain, C.getZ(i) * stain); C.needsUpdate = true; }
    o.geometry = g2;
  });
  drop.forEach(o => o.parent && o.parent.remove(o));
  /* inside: a floor slab at every storey under the tear (a skeleton's to its frame's top), a ring from the core (or the atrium) to the skin */
  const B = MP.builder(false), rc = F.core.r, hi = R.frame ? top : R.cut;
  if (state !== 'gutted') F.levels.forEach(L => {
    if (L.k === 0 || L.y > hi - 0.5) return; const ro = F.envR(L.y + 0.1) - 0.3, ri = F.core.atrium ? rc : rc + 0.3; if (ro <= ri + 0.5) return;
    B.lathe('concrete', [[ro, L.y], [ri, L.y]], 48, { uv: 4, skip: t => L.y > Math.min(limit(Math.cos(t) * ro, Math.sin(t) * ro), skin) + 0.3 && !R.frame });
    B.lathe('white', [[ri, L.y - 0.3], [ro, L.y - 0.3]], 48, { uv: 4 });
  });
  /* the core, its walls to the cut (a stump's to its own height over the cut) */
  if (state !== 'gutted' && !F.core.atrium) { const cy = Math.max(R.core || 0, Math.min(hi, F.height.roof)); B.lathe('concrete', [[rc, 0], [rc, cy]], 24, { uv: 4 }); B.lathe('concrete', [[rc - 0.3, cy], [rc - 0.3, 0]], 24, { uv: 4 }); B.lathe('concrete', [[rc, cy], [rc - 0.3, cy]], 24, { uv: 2 }); }
  const H = B.finish(F, 'ruin'); H.children.forEach(c => { c.name = F.id + '.ruin.' + c.name; G.add(c); });
  const D = MP.debris(F, state); if (D) { D.name = 'debris'; G.add(D); }
  G.name = F.id + '.' + state; G.userData.ruin = R;
  return G;
};
