// ================================================================= METROPOLIS — a design with plans, ruined  [draw]
// MP.ruinDesign(G, F, state): the design's own hero (54) cut to a ruin state of its record (MP.ruin, 40), the way the Spindle's and the Ledger's
// builders cut theirs: every triangle and pier above the torn line goes (MP.tearAt: the cut, less up to a few storeys by noise, round the tower);
// gutted, the glass and the doors go and the stone is stained; a skeleton keeps its piers and bare floor slabs above its skin line to the cut;
// the floor slabs stand inside under the tear (a ruin is looked into from above); a stump's core stands over its cut; the rubble (MP.debris,
// the record's debris plan) lies at its foot. G is changed in place and returned.
MP.ruinDesign = function (G, F, state) {
  const R = MP.ruin(F, state); if (R.state === 'intact') return G;
  const glassy = n => /glass/.test(n), stain = state === 'intact' ? 1 : (F.ruins[state] && F.ruins[state].stain != null ? F.ruins[state].stain : 0.72);
  const limit = (x, z) => (state === 'gutted' ? Infinity : MP.tearAtXZ(F, R, x, z));
  const skin = R.frame ? R.skin : Infinity, top = R.frame ? R.frame[1] : Infinity, v = new THREE.Vector3(), m = new THREE.Matrix4();
  const drop = [];
  /* every test in the hero's own frame: the Ancients kit's meshes sit in groups of their own, moved and scaled (55) */
  G.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(G.matrixWorld).invert(), Mw = new THREE.Matrix4(), mm = new THREE.Matrix4(), va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3();
  G.traverse(o => {
    if (!o.isMesh || !o.geometry) return;
    if (o.name === 'a door leaf') { drop.push(o); return; }
    const n = o.material && o.material.name || '';
    if (glassy(n) && state !== 'intact') { drop.push(o); return; }
    Mw.multiplyMatrices(inv, o.matrixWorld);
    if (o.isInstancedMesh) {
      /* the piers: cut at the tear; a skeleton's stand to the frame's top */
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      const gh = o.geometry.boundingBox.max.y;
      /* the ones standing kept at the front and the count cut to them (hidden at zero scale they were still drawn: the Organ's 36 k of
         panels in every state) */
      const col = new THREE.Color(); let w = 0;
      for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); mm.multiplyMatrices(Mw, m); v.setFromMatrixPosition(mm); const yTop = v.y + Math.max(Math.abs(mm.elements[5]) / 2, Math.abs(mm.elements[5] * gh)), lim = R.frame ? top : limit(v.x, v.z); if (yTop > lim) continue;
        if (w !== i) { o.setMatrixAt(w, m); if (o.instanceColor) { o.getColorAt(i, col); o.setColorAt(w, col); } } w++; }
      o.count = w; o.instanceMatrix.needsUpdate = true; if (o.instanceColor) o.instanceColor.needsUpdate = true; return;
    }
    /* the merged surfaces: keep a triangle under the torn line (a skeleton's skin under its skin line); the stone stained. A mesh with no index
       (the kit's) is cut as one, its kept triangles given one */
    const g = o.geometry, P = g.attributes.position, I = g.index, nI = I ? I.count : P.count, at = q => (I ? I.getX(q) : q);
    const keep = [];
    for (let t = 0; t + 2 < nI; t += 3) {
      const a = at(t), b = at(t + 1), c = at(t + 2); va.fromBufferAttribute(P, a).applyMatrix4(Mw); vb.fromBufferAttribute(P, b).applyMatrix4(Mw); vc.fromBufferAttribute(P, c).applyMatrix4(Mw);
      const y = Math.max(va.y, vb.y, vc.y), cx = (va.x + vb.x + vc.x) / 3, cz = (va.z + vb.z + vc.z) / 3;
      if (y <= Math.min(limit(cx, cz), skin) + 0.05) keep.push(a, b, c);
    }
    /* compacted: only the kept triangles' vertices (the valley, 2026-11-09: the index was cut but every vertex stayed, so a stump's bounding box
       and the impostor's card framed from it still stood at the whole tower's height; an Organ stump read 240 m against its record's 47). A
       mesh with nothing left goes */
    if (!keep.length) { drop.push(o); return; }
    const g2 = MP.compact(g, keep), C = g2.attributes.color; if (C && stain < 1) { for (let i = 0; i < C.count; i++) C.setXYZ(i, C.getX(i) * stain, C.getY(i) * stain, C.getZ(i) * stain); C.needsUpdate = true; }
    o.geometry = g2;
  });
  drop.forEach(o => o.parent && o.parent.remove(o));
  /* inside: a floor slab at every storey under the tear (a skeleton's to its frame's top): the storey's own plan outline (the Swell's clover, the
     Terrace's ring round its court, an atrium's ring), its triangles kept where the tear stands over them */
  const B = MP.builder(false), rc = F.core.r, hi = R.frame ? top : R.cut, sp = [], sn = [], si = [];
  /* a floor tears in patches (noise over the plan), not along rays from the axis as the facade's line does */
  const seed = MP.idHash(F.id + '.' + state + '.slabs') & 0xffff, slabLimit = (x, z) => state === 'gutted' ? Infinity : R.cut - R.torn * Math.min(1, Math.max(0, (KRAND.vnoise(x / 7, z / 7, 3.1, seed) + 0.5 * KRAND.vnoise(x / 2.7, z / 2.7, 5.3, seed)) / 1.5 - 0.2) / 0.6);
  /* the slab's cells from the outline's samples O ({t, r} about cx, cz; closed round, or an arc's open run) out from the hole (holeAt(t)) */
  const radial = (L, O, holeAt, ox, oz, closed) => {
    const N = O.length;
    for (let i = 0; i < (closed ? N : N - 1); i++) {
      const a = O[i], b = O[(i + 1) % N], ta = a.t, tb = i + 1 < N ? b.t : b.t + Math.PI * 2, ha = holeAt(ta), hb = holeAt(tb), nr = Math.max(1, Math.ceil((Math.max(a.r - ha, b.r - hb)) / 8));
      if (a.r - 0.2 <= ha || b.r - 0.2 <= hb) continue;
      const at = (f, t, h, r) => [ox + (h + (r - 0.2 - h) * f) * Math.cos(t), oz + (h + (r - 0.2 - h) * f) * Math.sin(t)];
      /* the cells the tear leaves, a run of them along the strip drawn as one quad (they lie on the same two lines: the same floor, fewer
         triangles; the Wedge's crown was 28 k triangles of slabs) */
      const quad = (j0, j1) => { const f0 = j0 / nr, f1 = j1 / nr, p = [at(f0, ta, ha, a.r), at(f0, tb, hb, b.r), at(f1, tb, hb, b.r), at(f1, ta, ha, a.r)];
        [[L.y, 1], [L.y - 0.3, -1]].forEach(fc => { const b0 = sp.length / 3, ord = fc[1] > 0 ? [0, 1, 2, 3] : [0, 3, 2, 1]; ord.forEach(v => { sp.push(p[v][0], fc[0], p[v][1]); sn.push(0, fc[1], 0); }); si.push(b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 3); }); };
      let run = -1;
      for (let j = 0; j < nr; j++) {
        const fm = (j + 0.5) / nr, pa = at(fm, ta, ha, a.r), pb = at(fm, tb, hb, b.r), cx = (pa[0] + pb[0]) / 2, cz = (pa[1] + pb[1]) / 2;
        const kept = R.frame || L.y <= Math.min(slabLimit(cx, cz), skin) + 0.3;
        if (kept && run < 0) run = j; else if (!kept && run >= 0) { quad(run, j); run = -1; }
      }
      if (run >= 0) quad(run, nr);
    }
  };
  /* an Ancients building's slabs are its hero's own plates (59, in pieces), cut with the rest */
  if (!F.anc) F.levels.forEach(L => {
    if (L.k === 0 || L.y > hi - 0.5) return;
    /* a strip (the Pods' bridge) keeps its floor wherever its tube stands, gutted too: its rings round it, not hung in the air */
    const st0 = MP.storey(F, L.k);
    (st0.parts || []).forEach(p => {
      if (!p.strip) return; const q = p.outline, cx = (q[0][0] + q[2][0]) / 2, cz = (q[0][1] + q[2][1]) / 2; if (!R.frame && L.y > Math.min(slabLimit(cx, cz), skin) + 0.3) return;
      [[L.y, 1], [L.y - 0.3, -1]].forEach(fc => { const b0 = sp.length / 3, ord = fc[1] > 0 ? [0, 1, 2, 3] : [0, 3, 2, 1]; ord.forEach(v => { sp.push(q[v][0], fc[0], q[v][1]); sn.push(0, fc[1], 0); }); si.push(b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 3); });
    });
    if (state === 'gutted') return;
    /* the outline is star-shaped from the axis (a ring, a clover, an atrium's ring): a radial mesh, 8 m steps from the hole (or the axis) out to
       it, so the tear cuts small cells, not a fan's long triangles */
    const st = st0, hole0 = st.hole || (F.core.atrium ? rc : 0), Hr = st.holeRect, O0 = st.outline.map(p => ({ t: Math.atan2(p[1], p[0]), r: Math.hypot(p[0], p[1]) })).sort((a, b) => a.t - b.t);
    /* a rect outline is four corners: sample its edges so the mesh follows them; a rect court's reach is its edge's at each angle */
    /* an outline of many points (the Swell's clover, 128) taken at 48 at most: its slab's cells about 6 m round, as the ruin budgets want */
    const O = O0.length >= 16 ? (O0.length > 48 ? O0.filter((q, i) => i % Math.ceil(O0.length / 48) === 0) : O0) : (() => { const o = []; for (let i = 0; i < 48; i++) { const t = -Math.PI + 2 * Math.PI * i / 48; let best = 0; for (let j = 0; j < st.outline.length; j++) { const a = st.outline[j], b = st.outline[(j + 1) % st.outline.length], dx = Math.cos(t), dz = Math.sin(t), ex = b[0] - a[0], ez = b[1] - a[1], den = dx * ez - dz * ex; if (Math.abs(den) < 1e-9) continue; const u = (a[0] * ez - a[1] * ex) / den, v = (a[0] * dz - a[1] * dx) / den; if (u > 0 && v >= 0 && v <= 1) best = Math.max(best, u); } o.push({ t, r: best }); } return o; })(), N = O.length;
    const holeAt = t => { if (!Hr) return hole0; const R2 = st.rect, lt = t + R2.yaw, cx2 = Math.abs(Math.cos(lt)), sz2 = Math.abs(Math.sin(lt)); return Math.min(cx2 > 1e-6 ? Hr.hw / cx2 : 1e9, sz2 > 1e-6 ? Hr.hd / sz2 : 1e9); };
    /* a storey of parts (41: the Organ's pipes, the Pods' pods, the Long Curve's arc): each part radial from its own centre, an arc open at
       its ends (a strip is drawn above) */
    if (st.parts) st.parts.forEach(p => {
      if (p.strip || p.noSlab) return; const open = p.a0 != null, n = open ? Math.max(2, Math.ceil((p.a1 - p.a0) * p.rOut / 6)) : Math.max(12, Math.min(48, Math.ceil(2 * Math.PI * p.rOut / 6))), O2 = []; /* a part's cells about 6 m round its rim (a pipe of r 10 m had 48, as a 50 m drum) */
      for (let i = 0; i < (open ? n + 1 : n); i++) O2.push({ t: open ? p.a0 + (p.a1 - p.a0) * i / n : -Math.PI + 2 * Math.PI * i / n, r: p.rOut });
      radial(L, O2, () => p.rIn, p.cx, p.cz, !open);
    });
    else radial(L, O, holeAt, 0, 0, true);
  });
  if (sp.length) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(sn, 3)); g.setIndex(si);
    const uv = new Float32Array(sp.length / 3 * 2); for (let i = 0; i < sp.length / 3; i++) { uv[i * 2] = sp[i * 3] / 4; uv[i * 2 + 1] = sp[i * 3 + 2] / 4; } g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    const col = new Float32Array(sp.length).fill(stain < 1 ? stain : 1); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.Mesh(g, MP.mats().concrete); m.name = F.id + '.ruin.slabs'; G.add(m); }
  /* the core, its walls to the cut (a stump's to its own height over the cut) */
  if (state !== 'gutted' && F.core.kind === 'round' && !F.core.atrium && !F.core.bays) { const cy = Math.max(R.core || 0, Math.min(hi, F.height.roof)); B.lathe('concrete', [[rc, 0], [rc, cy]], 24, { uv: 4 }); B.lathe('concrete', [[rc - 0.3, cy], [rc - 0.3, 0]], 24, { uv: 4 }); B.lathe('concrete', [[rc, cy], [rc - 0.3, cy]], 24, { uv: 2 }); }
  const H = B.finish(F, 'ruin'); H.children.slice().forEach(c => { c.name = F.id + '.ruin.' + c.name; G.add(c); });   /* slice: G.add takes a child out of H */
  const D = MP.debris(F, state); if (D) { D.name = 'debris'; G.add(D); }
  G.name = F.id + '.' + state; G.userData.ruin = R; G.userData.tris = MP.countTris(G, m => m.name !== 'debris' && !(m.parent && m.parent.name === 'debris'));
  return G;
};
/* a geometry of the triangles `idx` names (an index array into g), with only the vertices they use: every attribute copied through, a new index */
MP.compact = function (g, idx) {
  const map = new Map(), order = []; idx.forEach(i => { if (!map.has(i)) { map.set(i, order.length); order.push(i); } });
  const out = new THREE.BufferGeometry();
  for (const name in g.attributes) { const A = g.attributes[name], sz = A.itemSize, arr = new A.array.constructor(order.length * sz); for (let j = 0; j < order.length; j++) for (let c = 0; c < sz; c++) arr[j * sz + c] = A.array[order[j] * sz + c]; out.setAttribute(name, new THREE.BufferAttribute(arr, sz, A.normalized)); }
  const I = new Array(idx.length); for (let i = 0; i < idx.length; i++) I[i] = map.get(idx[i]);
  out.setIndex(order.length > 65535 ? new THREE.Uint32BufferAttribute(I, 1) : new THREE.Uint16BufferAttribute(I, 1)); out.userData = Object.assign({}, g.userData); return out;
};
/* the triangles drawn in a group: each mesh's index (or its vertices) once, an instanced mesh's times its live instances (a zeroed matrix is a cut
   piece); keep(m) false leaves a mesh out */
MP.countTris = function (G, keep) {
  let n = 0; const M = new THREE.Matrix4();
  G.traverse(m => { if (!m.isMesh || !m.geometry || (keep && !keep(m))) return; const g = m.geometry, t = g.index ? g.index.count / 3 : g.attributes.position.count / 3;
    if (!m.isInstancedMesh) { n += t; return; } let live = 0; for (let i = 0; i < m.count; i++) { m.getMatrixAt(i, M); if (M.elements[0] !== 0 || M.elements[5] !== 0 || M.elements[10] !== 0) live++; } n += t * live; });
  return Math.round(n);
};
