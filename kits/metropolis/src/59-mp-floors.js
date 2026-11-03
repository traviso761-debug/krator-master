// ================================================================= METROPOLIS — storeys and a core for the buildings without plans  [draw]
// The owner, 2026-11-03: the fourteen designs and the Ancients kit's buildings get a rational inside before their room plans: a floor
// plate at every storey and a stair and lift core, so the cut-away and a walker meet a building, not a hollow shell. Rooms come later,
// building by building. MP.floors(G, o) reads the hero's own drawn geometry, so it fits any shape:
//  - a 1 m grid over the plan. A cell is inside a storey at height y when a flood from outside the grid cannot reach it through the
//    walls cut at y + 1.0 and y + 2.2 (two cuts, so a window's opening at one height does not let the flood in) and something of the
//    building covers it above (the highest surface over the cell is over y): an open court or a terrace is not inside.
//  - the plate is the inside cells a cell off the walls, in rectangles (runs of a row, joined down the rows); its top at y, its
//    underside (the ceiling of the storey below) 0.25 m lower.
//  - the core: a 6 x 6 m stair and lift shaft where every storey's inside overlaps, nearest the plan's middle (4 x 4 if 6 does not fit,
//    none if 4 does not), concrete, with a door on its south face on every storey it serves.
// o: sh (storey height), y0 (the first plate, default sh), top (no plate within a storey of it: default the roof), floors (false: none),
// maxY (no plate above it), cell (1), roofAccess (a head-house over the core on the roof), roof (a building the kit left open-topped, as the Watch's drum: under this height an enclosed cell
// counts as covered, and a roof plate is drawn at it), tile (a ruin's: the plates in pieces of 8 m at most, so a tear cuts them). Returns a Group named
// 'floors', or null; userData { storeys, cells, core, tris, grid } (grid: the cells, for the plans on it, 46d: x0, z0, cell, W, D, the ground storey's
// inside cells and each level's, the core).
MP.floors = function (G, o) {
  if (o.floors === false) return null;
  const cell = o.cell == null ? 1 : o.cell, sh = o.sh, y0 = o.y0 == null ? sh : o.y0, roof = o.roof == null ? null : o.roof, top = Math.min(roof == null ? o.top : roof, o.maxY == null ? 1e9 : o.maxY);
  const tris = [], v = new THREE.Vector3();
  G.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(G.matrixWorld).invert();
  G.traverse(m => {
    if (!m.isMesh || m.isInstancedMesh || !m.geometry || m.name === 'floors') return;
    const P = m.geometry.attributes.position, I = m.geometry.index, M = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld), n = I ? I.count : P.count;
    for (let t = 0; t < n; t += 3) for (let j = 0; j < 3; j++) { v.fromBufferAttribute(P, I ? I.getX(t + j) : t + j).applyMatrix4(M); tris.push(v.x, v.y, v.z); }
  });
  /* the kit's instanced pieces (the Ancients' roof plates, wall panels, slabs): each by its box, the box's top covering its plan and the
     box standing as wall where a cut crosses it. A box over 30 m2 in plan (a slanted strut's box, a ring's) is left out: it would cover
     or wall far more than the piece does */
  const boxes = [], mI = new THREE.Matrix4();
  G.traverse(m => {
    if (!m.isInstancedMesh || !m.geometry) return;
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    const M = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld);
    for (let i = 0; i < m.count; i++) { m.getMatrixAt(i, mI); if (mI.determinant() === 0) continue; const b = m.geometry.boundingBox.clone().applyMatrix4(mI).applyMatrix4(M); if ((b.max.x - b.min.x) * (b.max.z - b.min.z) <= 30) boxes.push(b); }
  });
  if (!tris.length) return null;
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (let i = 0; i < tris.length; i += 3) { x0 = Math.min(x0, tris[i]); x1 = Math.max(x1, tris[i]); z0 = Math.min(z0, tris[i + 2]); z1 = Math.max(z1, tris[i + 2]); }
  x0 -= 2 * cell; z0 -= 2 * cell;
  const W = Math.ceil((x1 - x0) / cell) + 3, D = Math.ceil((z1 - z0) / cell) + 3, N = W * D, cx = i => x0 + (i + 0.5) * cell, cz = j => z0 + (j + 0.5) * cell;
  /* the highest surface over each cell (the covering test): every triangle's plan, sampled at the cells' middles */
  const colMax = new Float32Array(N).fill(-1e9);
  for (let t = 0; t < tris.length; t += 9) {
    const ax = tris[t], ay = tris[t + 1], az = tris[t + 2], bx = tris[t + 3], by = tris[t + 4], bz = tris[t + 5], qx = tris[t + 6], qy = tris[t + 7], qz = tris[t + 8];
    const den = (bz - qz) * (ax - qx) + (qx - bx) * (az - qz); if (Math.abs(den) < 1e-6) continue;
    const i0 = Math.max(0, Math.floor((Math.min(ax, bx, qx) - x0) / cell - 0.5)), i1 = Math.min(W - 1, Math.ceil((Math.max(ax, bx, qx) - x0) / cell - 0.5));
    const j0 = Math.max(0, Math.floor((Math.min(az, bz, qz) - z0) / cell - 0.5)), j1 = Math.min(D - 1, Math.ceil((Math.max(az, bz, qz) - z0) / cell - 0.5));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const px = cx(i), pz = cz(j), l1 = ((bz - qz) * (px - qx) + (qx - bx) * (pz - qz)) / den, l2 = ((qz - az) * (px - qx) + (ax - qx) * (pz - qz)) / den, l3 = 1 - l1 - l2;
      if (l1 < -1e-4 || l2 < -1e-4 || l3 < -1e-4) continue;
      const y = l1 * ay + l2 * by + l3 * qy, k = j * W + i; if (y > colMax[k]) colMax[k] = y;
    }
  }
  boxes.forEach(b => {
    const i0 = Math.max(0, Math.floor((b.min.x - x0) / cell)), i1 = Math.min(W - 1, Math.floor((b.max.x - x0) / cell)), j0 = Math.max(0, Math.floor((b.min.z - z0) / cell)), j1 = Math.min(D - 1, Math.floor((b.max.z - z0) / cell));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const k = j * W + i; if (b.max.y > colMax[k]) colMax[k] = b.max.y; }
  });
  /* the walls cut at a height, drawn into the grid */
  function cut(h, g) {
    boxes.forEach(b => {
      if (b.min.y > h || b.max.y < h) return;
      const i0 = Math.max(0, Math.floor((b.min.x - x0) / cell)), i1 = Math.min(W - 1, Math.floor((b.max.x - x0) / cell)), j0 = Math.max(0, Math.floor((b.min.z - z0) / cell)), j1 = Math.min(D - 1, Math.floor((b.max.z - z0) / cell));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) g[j * W + i] = 1;
    });
    for (let t = 0; t < tris.length; t += 9) {
      const p = []; for (let e = 0; e < 3; e++) {
        const a = t + e * 3, b = t + ((e + 1) % 3) * 3, ya = tris[a + 1], yb = tris[b + 1];
        if ((ya - h) * (yb - h) < 0) { const f = (h - ya) / (yb - ya); p.push([tris[a] + (tris[b] - tris[a]) * f, tris[a + 2] + (tris[b + 2] - tris[a + 2]) * f]); }
      }
      if (p.length < 2) continue;
      const L = Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1]), s = Math.max(1, Math.ceil(L / (cell * 0.4)));
      for (let q = 0; q <= s; q++) { const x = p[0][0] + (p[1][0] - p[0][0]) * q / s, z = p[0][1] + (p[1][1] - p[0][1]) * q / s, i = Math.floor((x - x0) / cell), j = Math.floor((z - z0) / cell); if (i >= 0 && j >= 0 && i < W && j < D) g[j * W + i] = 1; }
    }
  }
  function inside(y, h1, h2) {
    const wall = new Uint8Array(N); cut(h1 == null ? y + 1.0 : h1, wall); cut(h2 == null ? y + 2.2 : h2, wall);
    const out = new Uint8Array(N), st = [];
    for (let i = 0; i < W; i++) { st.push(i, (D - 1) * W + i); } for (let j = 0; j < D; j++) { st.push(j * W, j * W + W - 1); }
    while (st.length) { const k = st.pop(); if (out[k] || wall[k]) continue; out[k] = 1; const i = k % W, j = (k - i) / W; if (i > 0) st.push(k - 1); if (i < W - 1) st.push(k + 1); if (j > 0) st.push(k - W); if (j < D - 1) st.push(k + W); }
    const g = new Uint8Array(N);
    for (let k = 0; k < N; k++) if (!out[k] && !wall[k] && (colMax[k] > y + 0.5 || (roof != null && y < roof))) g[k] = 1;
    /* a cell off the walls: drop every inside cell next to one that is not */
    const e = new Uint8Array(N);
    for (let j = 1; j < D - 1; j++) for (let i = 1; i < W - 1; i++) { const k = j * W + i; if (g[k] && g[k - 1] && g[k + 1] && g[k - W] && g[k + W]) e[k] = 1; }
    return e;
  }
  const levels = [];
  for (let y = y0; y <= top - sh + 0.01; y += sh) { const g = inside(y); let c = 0; for (let k = 0; k < N; k++) c += g[k]; if (c >= 20) levels.push({ y, g, c }); }
  /* an open-topped building's roof: the cells enclosed just under it, a plate drawn there like the others (below, with the levels) */
  if (roof != null) { const g = inside(roof - 0.3, roof - 1.2, roof - 0.4); let c = 0; for (let k = 0; k < N; k++) c += g[k]; if (c >= 20) levels.push({ y: roof, g, c, roof: true }); }
  if (!levels.length) return null;
  const B = MP.builder(false), S = { storeys: levels.length, cells: 0, core: null };
  /* the core: the cells inside every storey, a square of n x n of them nearest the plan's middle */
  const all = new Uint8Array(N).fill(1); levels.forEach(L => { if (!L.roof) for (let k = 0; k < N; k++) all[k] &= L.g[k]; });
  let mx = 0, mz = 0, mc = 0; for (let k = 0; k < N; k++) if (levels[0].g[k]) { mx += k % W; mz += Math.floor(k / W); mc++; } mx /= mc; mz /= mc;
  for (const n of [6, 4]) {
    let best = null, bd = 1e9;
    for (let j = 0; j + n <= D; j++) for (let i = 0; i + n <= W; i++) {
      let okk = true; for (let b = 0; b < n && okk; b++) for (let a = 0; a < n; a++) if (!all[(j + b) * W + i + a]) { okk = false; break; }
      if (!okk) continue; const d = Math.hypot(i + n / 2 - mx, j + n / 2 - mz); if (d < bd) { bd = d; best = [i, j]; }
    }
    if (best) { S.core = { x0: x0 + best[0] * cell, z0: z0 + best[1] * cell, n: n * cell }; break; }
  }
  /* the plates, in rectangles: runs of a row joined with the same run on the rows after */
  levels.forEach(L => {
    const g = L.g, used = new Uint8Array(N), C = S.core;
    for (let j = 0; j < D; j++) for (let i = 0; i < W; i++) {
      const k = j * W + i; if (!g[k] || used[k]) continue;
      let i2 = i; while (i2 + 1 < W && g[j * W + i2 + 1] && !used[j * W + i2 + 1]) i2++;
      let j2 = j; for (;;) { const r = j2 + 1; if (r >= D) break; let full = true; for (let a = i; a <= i2; a++) if (!g[r * W + a] || used[r * W + a]) { full = false; break; } if (!full) break; j2 = r; }
      for (let b = j; b <= j2; b++) for (let a = i; a <= i2; a++) used[b * W + a] = 1;
      const AX = x0 + i * cell, BX = x0 + (i2 + 1) * cell, AZ = z0 + j * cell, BZ = z0 + (j2 + 1) * cell, y = L.y, nx = o.tile ? Math.ceil((BX - AX) / 8) : 1, nz = o.tile ? Math.ceil((BZ - AZ) / 8) : 1;
      for (let p = 0; p < nx; p++) for (let r = 0; r < nz; r++) {
        const ax = AX + (BX - AX) * p / nx, bx = AX + (BX - AX) * (p + 1) / nx, az = AZ + (BZ - AZ) * r / nz, bz = AZ + (BZ - AZ) * (r + 1) / nz;
        B.quad('concrete', [ax, y, bz], [bx, y, bz], [bx, y, az], [ax, y, az], [0, 1, 0], { uv: 4 });
        B.quad('white', [ax, y - 0.25, az], [bx, y - 0.25, az], [bx, y - 0.25, bz], [ax, y - 0.25, bz], [0, -1, 0], { uv: 4 });
      }
      S.cells += (i2 - i + 1) * (j2 - j + 1);
    }
  });
  /* the core's walls, storey by storey from the ground to the top plate's storey, a door 1.2 by 2.2 m in its south face on each */
  if (S.core) {
    const C = S.core, t = 0.25, a = C.x0, b = C.x0 + C.n, c = C.z0, d = C.z0 + C.n, lv = levels.filter(L => !L.roof), yTop = Math.min(lv.length ? lv[lv.length - 1].y + sh : sh, roof == null ? 1e9 : roof), dx = (a + b) / 2;
    const ys = [0].concat(lv.map(L => L.y)), col = { col: [0.62, 0.62, 0.6], uv: 2 };
    ys.forEach((y, q) => {
      const y1 = q + 1 < ys.length ? ys[q + 1] - 0.25 : yTop;
      B.box('concrete', a, a + t, y, y1, c, d, col); B.box('concrete', b - t, b, y, y1, c, d, col); B.box('concrete', a, b, y, y1, c, c + t, col);
      B.box('concrete', a, dx - 0.6, y, y1, d - t, d, col); B.box('concrete', dx + 0.6, b, y, y1, d - t, d, col); B.box('concrete', dx - 0.6, dx + 0.6, y + 2.2, y1, d - t, d, col);
    });
    C.top = yTop;
    /* a roof people use (o.roofAccess): the core rises 3 m over the roof as a head-house, its door to the south, a slab on top */
    if (o.roofAccess) { const y = yTop, y1 = y + 3; B.box('concrete', a, a + t, y, y1, c, d, col); B.box('concrete', b - t, b, y, y1, c, d, col); B.box('concrete', a, b, y, y1, c, c + t, col);
      B.box('concrete', a, dx - 0.6, y, y1, d - t, d, col); B.box('concrete', dx + 0.6, b, y, y1, d - t, d, col); B.box('concrete', dx - 0.6, dx + 0.6, y + 2.2, y1, d - t, d, col); B.box('concrete', a - 0.3, b + 0.3, y1, y1 + 0.3, c - 0.3, d + 0.3, col); }
  }
  const F = new THREE.Group(); const H = B.finish({ id: 'floors' }, 'floors'); H.children.forEach(m => F.add(m)); F.name = 'floors';
  let nt = 0; F.traverse(m => { if (m.isMesh) nt += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3; });
  S.tris = Math.round(nt); S.levels = levels.map(L => +L.y.toFixed(2));
  /* the grid kept for the plans (46d): a level whose cells match the one under it shares its array */
  if (o.grid) { const gl = []; levels.forEach((L, q) => { const p = gl[q - 1]; gl.push({ y: L.y, roof: !!L.roof, g: p && p.g.length === L.g.length && p.g.every((v, n) => v === L.g[n]) ? p.g : L.g }); }); S.grid = { x0, z0, cell, W, D, ground: inside(0), levels: gl, core: S.core }; }
  F.userData = S;
  return F;
};
