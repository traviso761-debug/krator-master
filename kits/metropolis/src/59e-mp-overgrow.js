// ================================================================= METROPOLIS — the overgrowth drawn on a hero  [draw]
// The owner, 2026-11-09: the ruins themselves overgrown (Midgar at the end of FF7; Girder's middle sections). The sockets (44b) say where;
// this draws what the kit draws itself at them, into the hero, so every tier reads it (the shell bakes the hero's vertex colours and
// geometry, the impostor its meshes): creeper strands as real tubes hugging the wall down from a sill or a torn edge, forking and thinning,
// with leaves; roots down the plinth at the foot; moss and soil in the vertex colours round each used socket (green-brown blotches
// spreading from a floor or a ledge, drips under a sill, a damp band at the foot); rubble soil on the open floors; and the kit's own
// stand-in plants (a bush, a small tree) where a host has no biome of its own. A biome's kits grow their species at the same sockets
// through a planter (MP.plant), so the valley puts the lowlands' trees, shrubs and ferns on them; this page plants them itself (59d).
//
//   MP.overgrow(G, F, state, o) -> G, changed in place and returned (its geometries are copied where their colours change, so a hero whose
//       buffers are shared with another, the valley's flattened stub, keeps the other clean). o.density 0..1 (the sockets with u under
//       it: default MP.WILD_DENSITY), o.seed, o.tint [r, g, b] (the biome's colour on the moss, the leaves and the soil), o.standins
//       true | false | fn(socket) (draw the kit's own plant at a socket), o.strands, o.moss, o.soil (each true unless false),
//       o.sockets (ready-made). G.userData.wild counts what it drew.
//   MP.plant(F, state, at, o) -> {asked, planted}: the planter adapter. at = {x, y, z, yaw} the hero's placement; o.plant(socket) is
//       called once per kept socket with the socket in the world frame (x, y, z, nx, ny, nz turned and moved), returning true when it
//       planted something. o.density, o.seed, o.kinds (a Set), o.sizes (a Set) narrow the sockets.
//   MP.overgrowDress(G, family, state, o): what MP.hero does for a look ending in '.wild': overgrow with the defaults, then, when the
//       lowland kits are on the page (59d) and the hero is not an impostor's, their plants on the standing sockets (trees on the tops,
//       floor plants on the floors and terraces), the stand-ins kept for the rest.
MP.WILD_DENSITY = 0.6;
MP.WILD_BUDGET = 1.6;   /* a wild hero may hold this many times its family's triangle budget (the growth is the rest) */
MP.WILD_CAP = 900;      /* the most sockets one hero grows from (MP.overgrow o.cap) */
(function () {
  const PI2 = Math.PI * 2;
  const MOSS = [0.34, 0.46, 0.19], SOIL = [0.29, 0.24, 0.16], LITTER = [0.42, 0.36, 0.22], VINE = [[0.30, 0.27, 0.17], [0.36, 0.34, 0.2], [0.26, 0.3, 0.17]], LEAF = [[0.33, 0.5, 0.2], [0.42, 0.56, 0.22], [0.28, 0.42, 0.19], [0.5, 0.52, 0.24]];
  const mul = (c, t, k) => [c[0] * t[0] * k, c[1] * t[1] * k, c[2] * t[2] * k];
  // the two materials the growth adds to the hero's buckets (50): the strands' bark and the moss, soil and leaves
  MP.wildMats = function () { const M = MP.mats(); if (!M.vine) { M.vine = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, vertexColors: true }); M.vine.name = 'mp.vine'; M.moss = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.96, metalness: 0, vertexColors: true, side: THREE.DoubleSide }); M.moss.name = 'mp.moss'; } return M; };
  // a tube along pts [{x, y, z, r}], five sides, its frame carried along so it does not twist; the normals radial
  function tube(B, name, pts, col) {
    if (pts.length < 2) return; const S = 4, rings = [], up = [0, 1, 0]; let u = null;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; let d = [b.x - a.x, b.y - a.y, b.z - a.z]; const L = Math.hypot(d[0], d[1], d[2]) || 1; d = [d[0] / L, d[1] / L, d[2] / L];
      if (!u) { const ref = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : up; u = [d[1] * ref[2] - d[2] * ref[1], d[2] * ref[0] - d[0] * ref[2], d[0] * ref[1] - d[1] * ref[0]]; }
      const k = u[0] * d[0] + u[1] * d[1] + u[2] * d[2]; u = [u[0] - d[0] * k, u[1] - d[1] * k, u[2] - d[2] * k]; const ul = Math.hypot(u[0], u[1], u[2]) || 1; u = [u[0] / ul, u[1] / ul, u[2] / ul];
      const v = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]], ring = [];
      for (let s = 0; s < S; s++) { const t = s / S * PI2, c = Math.cos(t), sn = Math.sin(t), n = [u[0] * c + v[0] * sn, u[1] * c + v[1] * sn, u[2] * c + v[2] * sn]; ring.push({ p: [pts[i].x + n[0] * pts[i].r, pts[i].y + n[1] * pts[i].r, pts[i].z + n[2] * pts[i].r], n: n }); }
      rings.push(ring);
    }
    for (let i = 0; i + 1 < rings.length; i++) for (let s = 0; s < S; s++) { const s2 = (s + 1) % S, a = rings[i][s], b = rings[i][s2], c = rings[i + 1][s2], d = rings[i + 1][s], n = [(a.n[0] + c.n[0]) / 2, (a.n[1] + c.n[1]) / 2, (a.n[2] + c.n[2]) / 2]; B.quad(name, a.p, b.p, c.p, d.p, n, { col, uv: 1 }); }
  }
  // a two-sided quad (a leaf, a frond): drawn both ways round
  function leaf(B, name, a, b, c, d, n, col) { B.quad(name, a, b, c, d, n, { col, uv: 1 }); B.quad(name, a, d, c, b, [-n[0], -n[1], -n[2]], { col: [col[0] * 0.8, col[1] * 0.8, col[2] * 0.8], uv: 1 }); }
  // a cone or frustum about a vertical axis (a bush's tier, a canopy)
  function cone(B, name, x, y, z, rb, rt, h, col, seg, rot) {
    for (let i = 0; i < seg; i++) { const A = rot + i / seg * PI2, Bq = rot + (i + 1) / seg * PI2, a = [x + Math.cos(A) * rb, y, z + Math.sin(A) * rb], b = [x + Math.cos(Bq) * rb, y, z + Math.sin(Bq) * rb], m = (A + Bq) / 2, sl = Math.hypot(rb - rt, h) || 1, n = [Math.cos(m) * h / sl, (rb - rt) / sl, Math.sin(m) * h / sl], cl = i % 2 ? col : [col[0] * 0.9, col[1] * 0.9, col[2] * 0.9];
      if (rt > 0.01) { const c = [x + Math.cos(Bq) * rt, y + h, z + Math.sin(Bq) * rt], d = [x + Math.cos(A) * rt, y + h, z + Math.sin(A) * rt]; B.quad(name, a, b, c, d, n, { col: cl, uv: 1 }); } else B.quad(name, a, b, [x, y + h, z], [x, y + h, z], n, { col: cl, uv: 1 }); }
  }
  function bush(B, x, y, z, r, h, col) { cone(B, 'green', x, y, z, r * 0.7, r, h * 0.4, col, 6, x); cone(B, 'green', x, y + h * 0.4, z, r, 0, h * 0.6, [col[0] * 1.08, col[1] * 1.08, col[2] * 1.08], 6, x + 0.5); }
  const unit = (seed, a, b, c) => KRAND.unit(KRAND.hash(seed, a | 0, b | 0, c | 0));

  MP.overgrow = function (G, F, state, o) {
    o = o || {}; const look = MP.look(state); state = look.state;
    const dens = o.density == null ? MP.WILD_DENSITY : o.density, seed = o.seed == null ? 0 : o.seed | 0, tint = o.tint || [1, 1, 1], M = MP.wildMats(), B = MP.builder(false), R = MP.ruin(F, state);
    /* the sockets under the density, the lowest units first; a hero with more than the cap (the Swell's four lobes: 2,200 at 0.55) keeps the cap's worth, so its growth stays under budget */
    const S = o.sockets || MP.sockets(F, state, seed), cap = o.cap == null ? MP.WILD_CAP : o.cap; let keep = S.filter(s => s.u < dens); if (keep.length > cap) keep = keep.slice().sort((a, b) => a.u - b.u).slice(0, cap);
    const skin = MP.skin(F), sk = KRAND.hash(MP.SEED, MP.idHash(F.id + '.' + state + '.wild'), seed), W = { sockets: keep.length, strands: 0, roots: 0, leaves: 0, soil: 0, bushes: 0, trees: 0, mossed: 0, vertices: 0 };
    const standins = o.standins == null ? true : o.standins, wants = s => typeof standins === 'function' ? !!standins(s) : !!standins;
    // ---- the strands: from a sill, a torn edge or a rim down the wall, swaying, forking once, thinning to a thread; a leaf every other step
    const strand = (s, P, len, r0, t, f, depth, salt) => {
      const pts = [], n0 = Math.max(3, Math.round(len / 1.6)), col = mul(VINE[Math.floor(unit(s.seed, salt, 1) * 3)], tint, 0.9 + 0.3 * unit(s.seed, salt, 2)), leafC = mul(LEAF[Math.floor(unit(s.seed, salt, 3) * 4)], tint, 1);
      let y = s.y + 0.05, tt = t, off = 0.1 + 0.1 * unit(s.seed, salt, 4);
      for (let k = 0; k <= n0; k++) {
        const q = MP.skinAt(F, P, tt, f, Math.max(P.y0 + 0.05, y)), rr = r0 * (1 - 0.72 * k / n0);
        pts.push({ x: q.x + q.nx * off, y: y, z: q.z + q.nz * off, r: rr });
        if (k < n0 && unit(s.seed, salt, 20 + k) < 0.85) { const side = unit(s.seed, salt, 40 + k) < 0.5 ? 1 : -1, lw = 0.55 + 0.6 * unit(s.seed, salt, 60 + k), tx = -q.nz * side, tz = q.nx * side, p0 = [q.x + q.nx * off, y, q.z + q.nz * off];
          leaf(B, 'moss', p0, [p0[0] + tx * lw, y + 0.25 * lw, p0[2] + tz * lw], [p0[0] + tx * lw * 1.1 + q.nx * 0.2, y - lw * 0.9, p0[2] + tz * lw * 1.1 + q.nz * 0.2], [p0[0] + q.nx * 0.15, y - lw * 0.7, p0[2] + q.nz * 0.15], [q.nx, 0.2, q.nz], leafC); W.leaves++; }
        if (depth === 0 && k === Math.floor(n0 * 0.4) && unit(s.seed, salt, 5) < 0.55) strand(s, P, len * 0.5, r0 * 0.6, tt, f, 1, salt + 7);
        y -= 1.6; if (y < 0.15 || y < P.y0 - 0.5) break;
        const sw = (KRAND.vnoise(y * 0.35, s.seed & 1023, salt, sk) - 0.5); tt += P.kind === 'box' ? sw * 0.03 : sw * 0.9 / Math.max(3, P.r(Math.max(P.y0, y))); off = 0.1 + 0.12 * KRAND.vnoise(y * 0.5, 3, salt, sk);
        if (P.kind === 'box') tt = Math.max(-0.98, Math.min(0.98, tt));
      }
      tube(B, 'vine', pts, col); if (depth === 0) W.strands++;
    };
    if (o.strands !== false) keep.forEach(s => {
      if (s.p >= 200) return; const P = skin[s.p]; if (!P) return;
      if (s.kind === 'ledge' || s.kind === 'edge' || s.kind === 'wall') { const ch = s.kind === 'wall' ? 0.4 : s.kind === 'edge' ? 0.85 : s.size === 'vine' ? 0.7 : 0.45; if (unit(s.seed, 1, 0) > ch) return;
        const len = (s.kind === 'edge' ? 12 + 26 * unit(s.seed, 1, 1) : 5 + 15 * unit(s.seed, 1, 1)) * (0.6 + 0.6 * dens), r0 = s.kind === 'edge' ? 0.2 + 0.18 * unit(s.seed, 1, 2) : 0.11 + 0.12 * unit(s.seed, 1, 2); strand(s, P, len, r0, s.t, s.f, 0, 11); }
      /* a top socket at a rim throws a strand over the edge */
      if (s.kind === 'top' && s.r < 2 && unit(s.seed, 1, 3) < 0.4) { const q = MP.skinAt(F, P, s.t, s.f, s.y - 0.3), s2 = Object.assign({}, s, { x: q.x, z: q.z }); strand(s2, P, 8 + 16 * unit(s.seed, 1, 4), 0.12, s.t, s.f, 0, 13); }
      /* roots at the foot: two or three down the plinth from a few metres up, spreading out onto the ground */
      if (s.kind === 'root' && unit(s.seed, 1, 5) < 0.65) { const n = 3 + Math.floor(unit(s.seed, 1, 6) * 2);
        for (let j = 0; j < n; j++) { const y0 = 2 + 6 * unit(s.seed, 2, j), q0 = MP.skinAt(F, P, s.t, s.f, y0), side = (unit(s.seed, 3, j) - 0.5) * 3.2, tx = -q0.nz, tz = q0.nx, r0 = 0.3 + 0.35 * unit(s.seed, 4, j), pts = [];
          for (let k = 0; k <= 4; k++) { const u = k / 4, y = y0 * (1 - u), q = MP.skinAt(F, P, s.t, s.f, Math.max(P.y0, y)), out = 0.12 + u * u * (1.2 + 1.8 * unit(s.seed, 5, j)); pts.push({ x: q.x + q.nx * out + tx * side * u, y: Math.max(0.02, y), z: q.z + q.nz * out + tz * side * u, r: r0 * (1 - 0.5 * u) }); }
          tube(B, 'vine', pts, mul(VINE[0], tint, 0.8 + 0.25 * unit(s.seed, 6, j))); W.roots++; } }
    });
    // ---- the soil: a lumpy mound on an open floor, a cut top or a terrace with soil in it
    if (o.soil !== false) keep.forEach(s => {
      if (!(s.kind === 'floor' || s.kind === 'top' || s.kind === 'heap' || (s.kind === 'ledge' && s.ny > 0.9 && s.r > 1)) || s.kind === 'heap') return; if (s.size === 'vine' && unit(s.seed, 7, 0) > 0.4) return;
      const rad = Math.min(s.r * 1.1, 1 + 2 * unit(s.seed, 7, 1)), h = 0.16 + 0.24 * unit(s.seed, 7, 2), n = 8, ph = unit(s.seed, 7, 3) * PI2, c0 = mul(SOIL, tint, 0.85 + 0.3 * unit(s.seed, 7, 4)), c1 = mul(unit(s.seed, 7, 5) < 0.5 ? LITTER : MOSS, tint, 1), apex = [s.x, s.y + h, s.z];
      for (let i = 0; i < n; i++) { const a = ph + i / n * PI2, b = ph + (i + 1) / n * PI2, ra = rad * (0.7 + 0.3 * KRAND.vnoise(i, s.seed & 511, 1, sk)), rb = rad * (0.7 + 0.3 * KRAND.vnoise(i + 1, s.seed & 511, 1, sk)), pa = [s.x + Math.cos(a) * ra, s.y + 0.01, s.z + Math.sin(a) * ra], pb = [s.x + Math.cos(b) * rb, s.y + 0.01, s.z + Math.sin(b) * rb], m = (a + b) / 2;
        B.quad('moss', pa, pb, apex, apex, [Math.cos(m) * h, rad * 0.8, Math.sin(m) * h], { col: i % 2 ? c0 : c1, uv: 1 }); }
      W.soil++;
    });
    // ---- the stand-ins: a bush at a shrub socket, a small tree at a tree socket, where the host has no biome of its own
    keep.forEach(s => {
      if (s.size === 'vine' || !wants(s)) return; const g = mul(LEAF[Math.floor(unit(s.seed, 8, 0) * 4)], tint, 0.9 + 0.2 * unit(s.seed, 8, 1)), ox = s.kind === 'ledge' && s.ny < 0.8 ? s.nx * 0.35 : 0, oz = s.kind === 'ledge' && s.ny < 0.8 ? s.nz * 0.35 : 0;
      if (s.size === 'shrub') { const r = Math.min(Math.max(0.4, s.r * 0.8), 0.5 + 0.9 * unit(s.seed, 8, 2)), h = r * (1.1 + 0.8 * unit(s.seed, 8, 3)); bush(B, s.x + ox, s.y, s.z + oz, r, h, g); if (unit(s.seed, 8, 4) < 0.4) bush(B, s.x + ox + (unit(s.seed, 8, 5) - 0.5) * r * 1.4, s.y, s.z + oz + (unit(s.seed, 8, 6) - 0.5) * r * 1.4, r * 0.6, h * 0.7, [g[0] * 1.1, g[1] * 1.1, g[2] * 1.1]); W.bushes++; return; }
      const th = Math.min(2.2 + 4 * unit(s.seed, 9, 0), 1.5 + s.r * 1.5), lean = [(unit(s.seed, 9, 1) - 0.5) * 1.2, (unit(s.seed, 9, 2) - 0.5) * 1.2], cr = Math.min(Math.max(0.9, s.r * 0.75), 1.1 + 2 * unit(s.seed, 9, 3)), bark = mul(VINE[1], tint, 1.1);
      tube(B, 'vine', [{ x: s.x, y: s.y - 0.05, z: s.z, r: 0.12 + th * 0.03 }, { x: s.x + lean[0] * 0.4, y: s.y + th * 0.55, z: s.z + lean[1] * 0.4, r: 0.1 + th * 0.02 }, { x: s.x + lean[0], y: s.y + th, z: s.z + lean[1], r: 0.06 }], bark);
      bush(B, s.x + lean[0], s.y + th - 0.4, s.z + lean[1], cr, cr * 1.3, g); bush(B, s.x + lean[0] + (unit(s.seed, 9, 4) - 0.5) * cr, s.y + th - 0.9, s.z + lean[1] + (unit(s.seed, 9, 5) - 0.5) * cr, cr * 0.65, cr * 0.9, [g[0] * 1.1, g[1] * 1.1, g[2] * 1.1]); W.trees++;
    });
    // ---- the moss and the soil in the vertex colours: round each wet socket (a floor, a top, an edge, a terrace, the foot), a blotch; under
    // a sill or an edge a drip; a damp band at the foot. The geometry's other buffers stay shared; only the colours are copied
    if (o.moss !== false) {
      const SP = KSPACE.create({ cell: 8 }), REACH = { floor: 4.5, top: 6, edge: 4, ledge: 2.4, root: 4, heap: 4, wall: 1.6 }, out = [];
      keep.forEach(s => { if (REACH[s.kind]) SP.insert(s, s.x, s.z, REACH[s.kind] + 1.2); });
      const mossC = mul(MOSS, tint, 1), soilC = mul(SOIL, tint, 1), K = dens * 0.9 + 0.3;
      const at = (x, y, z, c, oi) => {
        let w = 0, soil = 0; SP.query(x, z, 0, out);
        for (let i = 0; i < out.length; i++) { const s = out[i], rch = REACH[s.kind], dx = x - s.x, dz = z - s.z, dy = y - s.y, up = s.kind === 'floor' || s.kind === 'top' || s.kind === 'heap' || (s.kind === 'ledge' && s.ny > 0.9);
          const d = Math.hypot(dx, dy * (up ? 2 : 1.2), dz) / rch; if (d < 1) { const f = (1 - d) * (1 - d) * (up ? 1.4 : 1); w += f; if (up) soil += f; }
          if (!up && (s.kind === 'ledge' || s.kind === 'edge' || s.kind === 'wall') && dy < 0.3 && dy > -8) { const hz = Math.hypot(dx, dz); if (hz < 1.6) w += 0.7 * (1 + dy / 8) * (1 - hz / 1.6); } }
        if (y < 4) w += 0.5 * (1 - y / 4) * (0.5 + 0.5 * KRAND.vnoise(x * 0.4, 7, z * 0.4, sk));
        if (w <= 0.02) return; const n = KRAND.vnoise(x * 0.45, y * 0.45, z * 0.45, sk), m = Math.max(0, Math.min(1, (w * (0.45 + 0.9 * n) * K - 0.06) * 1.9)); if (m <= 0.01) return;
        const sh = Math.min(0.75, soil / (w + 1e-6)), n2 = 0.78 + 0.45 * KRAND.vnoise(x * 1.7, y * 1.7, z * 1.7, sk + 1), tr = mossC[0] * (1 - sh) + soilC[0] * sh, tg = mossC[1] * (1 - sh) + soilC[1] * sh, tb = mossC[2] * (1 - sh) + soilC[2] * sh;
        c[oi] = c[oi] * (1 - m) + tr * n2 * m; c[oi + 1] = c[oi + 1] * (1 - m) + tg * n2 * m; c[oi + 2] = c[oi + 2] * (1 - m) + tb * n2 * m; W.mossed++;
      };
      const M4 = new THREE.Matrix4(), p3 = new THREE.Vector3();
      G.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(G.matrixWorld).invert();
      G.traverse(m => {
        if (!m.isMesh || !m.geometry || m.userData.door || m.userData.noShell || !m.material) return; const nm = m.material.name || ''; if (/glass|cyan|doorGlass/.test(nm)) return;
        M4.multiplyMatrices(inv, m.matrixWorld); const id = M4.equals(new THREE.Matrix4());
        if (m.isInstancedMesh) { if (!m.instanceColor) return; const a = m.instanceMatrix.array, c = m.instanceColor.array.slice(); for (let i = 0; i < m.count; i++) { if (a[i * 16 + 5] === 0 && a[i * 16] === 0) continue; p3.set(a[i * 16 + 12], a[i * 16 + 13], a[i * 16 + 14]); if (!id) p3.applyMatrix4(M4); at(p3.x, p3.y, p3.z, c, i * 3); } m.instanceColor = new THREE.InstancedBufferAttribute(c, 3); m.instanceColor.needsUpdate = true; return; }
        const g = m.geometry, C = g.attributes.color, P = g.attributes.position; if (!C || !P) return;
        const g2 = new THREE.BufferGeometry(); for (const n in g.attributes) g2.setAttribute(n, n === 'color' ? C.clone() : g.attributes[n]); if (g.index) g2.setIndex(g.index); g2.boundingSphere = g.boundingSphere; g2.boundingBox = g.boundingBox; g2.userData = g.userData; if (g.groups && g.groups.length) g.groups.forEach(gr => g2.addGroup(gr.start, gr.count, gr.materialIndex));
        const c = g2.attributes.color.array, q = P.array, sz = C.itemSize, n = Math.min(C.count, P.count); W.vertices += n;
        for (let i = 0; i < n; i++) { if (id) at(q[i * 3], q[i * 3 + 1], q[i * 3 + 2], c, i * sz); else { p3.set(q[i * 3], q[i * 3 + 1], q[i * 3 + 2]).applyMatrix4(M4); at(p3.x, p3.y, p3.z, c, i * sz); } }
        g2.attributes.color.needsUpdate = true; m.geometry = g2;
      });
    }
    const H = B.finish(F, state + '.wild'); H.children.slice().forEach(c => { c.name = F.id + '.' + state + '.wild.' + c.material.name.replace(/^mp\./, ''); c.castShadow = c.receiveShadow = true; G.add(c); }); W.tris = H.userData.tris;
    G.userData.wild = W; return G;
  };
  // the planter adapter: a host's kits grow their species at the kept sockets, each handed over in the world frame
  MP.plant = function (F, state, at, o) {
    o = o || {}; const dens = o.density == null ? MP.WILD_DENSITY : o.density, seed = o.seed == null ? 0 : o.seed | 0, S = o.sockets || MP.sockets(F, state, seed), yaw = at.yaw == null ? 0 : at.yaw, c = Math.cos(yaw), s = Math.sin(yaw), ox = at.x == null ? 0 : at.x, oy = at.y == null ? 0 : at.y, oz = at.z == null ? 0 : at.z;
    let asked = 0, planted = 0;
    S.forEach(q => {
      if (q.u >= dens || (o.kinds && !o.kinds.has(q.kind)) || (o.sizes && !o.sizes.has(q.size))) return; asked++;
      const w = Object.assign({}, q, { x: ox + q.x * c + q.z * s, y: oy + q.y, z: oz - q.x * s + q.z * c, nx: q.nx * c + q.nz * s, nz: -q.nx * s + q.nz * c, local: q });
      if (o.plant(w)) planted++;
    });
    return { asked, planted };
  };
  // the page's own dress for a '.wild' look (MP.hero): the growth, then the lowland kits' plants (59d) where they are on the page
  MP.overgrowDress = function (G, family, state, o) {
    o = o || {}; const F = MP.FAMILY[family] || MP.DESIGNS[family]; if (!F) return G;
    const kits = !o.lite && MP.flora && MP.flora.ok() && o.plant !== false, seed = o.seed == null ? 0 : o.seed, dens = o.density == null ? MP.WILD_DENSITY : o.density;
    const planted = s => kits && (s.kind === 'top' || s.kind === 'floor' || s.kind === 'heap' || s.kind === 'root' || (s.kind === 'ledge' && s.ny > 0.9 && s.r > 1)) && s.size !== 'vine';
    MP.overgrow(G, F, state, Object.assign({ density: dens, seed, standins: s => !planted(s) }, o));
    if (kits) {
      const TREES = ['swlowlands.magnolia', 'nwlowlands.treefern', 'swlowlands.jacaranda', 'nwlowlands.banksia', 'swlowlands.pompom', 'nwlowlands.grasstree', 'swlowlands.skirtpalm', 'swlowlands.canepalm'], FLOOR = ['swlowlands:fern', 'swlowlands:azalea', 'swlowlands:iris', 'swlowlands:heliconia', 'swlowlands:giantfern', 'swlowlands:shrub', 'swlowlands:moss', 'swlowlands:grass'], list = [];
      MP.plant(F, state, { x: 0, y: 0, z: 0, yaw: 0 }, { density: dens, seed, plant: s => { if (!planted(s)) return false; const u = KRAND.unit(KRAND.hash(s.seed, 3)); if (s.size === 'tree') list.push({ ref: TREES[Math.floor(u * TREES.length)], x: s.x, y: s.y, z: s.z, scale: Math.max(0.3, Math.min(0.8, s.r / 7)), seed: s.seed }); else list.push({ ref: FLOOR[Math.floor(u * FLOOR.length)], x: s.x, y: s.y, z: s.z, scale: 1, seed: s.seed }); return true; } });
      const P = MP.flora.grow(list); P.children.slice().forEach(m => { m.userData.noShell = true; m.name = F.id + '.' + state + '.wild.flora'; G.add(m); }); G.userData.flora = P.userData.flora;
    }
    /* the hero's count is the kit's own (its growth included); the page's planting (noShell: a host plants its own) is counted apart */
    G.name = F.id + '.' + state + '.wild'; G.userData.state = state + '.wild'; const noDebris = m => m.name !== 'debris' && !(m.parent && m.parent.name === 'debris'); G.userData.tris = MP.countTris(G, m => noDebris(m) && !m.userData.noShell); G.userData.floraTris = MP.countTris(G, m => noDebris(m) && !!m.userData.noShell);
    return G;
  };
})();
