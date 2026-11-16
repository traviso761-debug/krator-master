// ================================================================= ANCIENT TRANSIT — the materials and the geometry builder  [draw]
// Every surface comes from the library through materials.json (KMAT.packed('ancient-transit', family)); the builder writes UVs in world
// metres, so a family's repeat is 1 / its scale and the maps lie flat on decks, piers, rails and platforms with no shader hook. One bucket
// a family, one merged mesh a bucket: a highway of a hundred spans is about a dozen draw calls.
//
//   KTRANSIT.mats()                      {asphalt, concrete, pave, steel, rust, paint, white, ballast, rubble, corrugated, glass, glow, line}
//                                        (+ the furniture bundle's family names: metal -> steel, soil -> rubble)
//   KTRANSIT.rgb(hex)                    a linear [r, g, b] from an sRGB hex (the vertex colours a page with sRGB output wants)
//   KTRANSIT.skin(group)                 a KratorTransitFurniture group's meshes given the library materials by userData.family
//   KTRANSIT.frame(x, y, z, yaw, pitch, roll) -> a THREE.Matrix4 (local +z along, +x to side +1, +y up; pitch climbs)
//   KTRANSIT.builder() -> B
//     B.quad(fam, A, Bq, C, D, col, o)       a quad; its normal is (B - A) x (D - A), or o.face [x, y, z] flips it to face that way; planar UVs
//                                            in metres (o.uv: 4 [u, v]). B.tri(fam, a, b, c, col, o) the same for a triangle
//     B.box(fam, m, w, h, d, col, o)         a box of w x h x d about the matrix's origin (its base at y = 0 unless o.centred), all six faces
//     B.sweep(fam, prof, frames, col, o)     a closed profile [[lat, up], ...] listed CLOCKWISE in the (lat, up) plane (its top edge runs
//                                            toward +lat), swept along frames
//                                            (THREE.Matrix4 each, or {x, y, z, yaw, pitch, roll}); prof may be a function of the frame index;
//                                            o.caps closes the ends; u along the sweep (metres), v round the profile
//     B.strip(fam, L, R, col, o)             a ribbon between two polylines of [x, y, z] (normal up)
//     B.cyl(fam, a, b, r, col, seg, o)       a cylinder from a to b ([x, y, z]), o.caps
//     B.dome(fam, m, r, h, col, seg)         a dome of radius r and height h on the matrix's origin (a stand-in bush)
//     B.mesh(fam, mesh, m, o)                a built mesh (a furniture piece's) copied into the bucket, through matrix m, its own colours and
//                                            UVs kept (o.col overrides the colour, o.mul multiplies it)
//     B.finish(name, o) -> Group             one THREE.Mesh a family (a family of 3000 triangles or more: one a 400 m chunk, o.chunk; 0 none), KTRANSIT.mats() by family (o.mats overrides); userData.tris
(function () {
  const T = KTRANSIT;
  const lin = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  T.rgb = function (hex) { return [lin(((hex >> 16) & 255) / 255), lin(((hex >> 8) & 255) / 255), lin((hex & 255) / 255)]; };
  /* the palette (sRGB in, linear out): the metropolis kit's white and concrete, the vehicles kit's blue glass and cyan */
  T.COL = { asphalt: T.rgb(0x5a5856), asphaltOld: T.rgb(0x6a645c), concrete: T.rgb(0xa8a298), concDark: T.rgb(0x7e7a72), pave: T.rgb(0x9a948a), steel: T.rgb(0x8c9094), steelDark: T.rgb(0x55585c),
    rust: T.rgb(0x7a4630), paintGrey: T.rgb(0x9aa0a4), paintTeal: T.rgb(0x3f8f8a), paintSafety: T.rgb(0xd9a12c), paintDark: T.rgb(0x4a4e52), white: T.rgb(0xe6e4dc), bronze: T.rgb(0x8a6a3c),
    ballast: T.rgb(0x8a8278), fill: T.rgb(0x6a5a48), rubble: T.rgb(0x7a7268), glass: T.rgb(0x2c4c70), glassDark: T.rgb(0x22364a), cyan: T.rgb(0x5ee0f0), red: T.rgb(0xd83a2a), green: T.rgb(0x4ad07a), amber: T.rgb(0xe0a030),
    lineWhite: T.rgb(0xd8d4c8), lineYellow: T.rgb(0xc8a040), soot: T.rgb(0x1c1a18), corrugated: T.rgb(0x8a8886), tank: T.rgb(0x6a7076), coach: T.rgb(0xdcdad2), cable: T.rgb(0x2a2a2e),
    soil: T.rgb(0x4a3c30), soilDry: T.rgb(0x6a5a44), sand: T.rgb(0xa8967a), bush: T.rgb(0x5a7a42), bushDark: T.rgb(0x3f5a30), grass: T.rgb(0x7a8a3c), creeper: T.rgb(0x4a6a38) };
  T.FAM_ALIAS = { metal: 'steel', soil: 'rubble', '': 'paint' };
  T.mats = (function () {
    let M = null;
    const fam = (name, o) => {
      const P = KMAT.mode === 'lib' && KMAT.packed ? KMAT.packed('ancient-transit', name) : null, X = P ? KMAT.textures(P, { aniso: 8 }) : {};
      if (P && P.scale) [X.map, X.normalMap, X.roughnessMap].forEach(t => { if (t) t.repeat.set(1 / P.scale[0], 1 / P.scale[1]); });
      return new THREE.MeshStandardMaterial(Object.assign({ map: X.map || null, normalMap: X.normalMap || null, roughnessMap: X.roughnessMap || null, vertexColors: true, metalness: P ? (P.metal == null ? 0 : P.metal) : 0, roughness: 1 }, o || {}));
    };
    return function () {
      if (M) return M;
      M = { asphalt: fam('asphalt', { roughness: 0.95 }), concrete: fam('concrete'), pave: fam('pave'), steel: fam('steel', { metalness: 0.55, roughness: 0.55 }), rust: fam('rust', { metalness: 0.25, roughness: 0.9 }),
        paint: fam('paint', { metalness: 0.1, roughness: 0.7 }), white: fam('white', { metalness: 0.12, roughness: 0.55 }), ballast: fam('ballast'), rubble: fam('rubble'), corrugated: fam('corrugated', { metalness: 0.3, roughness: 0.8 }),
        glass: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide }),
        glow: new THREE.MeshBasicMaterial({ vertexColors: true }), line: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }),
        /* the stand-in plants of the overgrowth (a host plants its biome kit's species at the records instead): plain, two-sided */
        plant: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, side: THREE.DoubleSide }) };
      for (const k in M) M[k].name = 'tr.' + k;
      M.metal = M.steel; M.soil = M.rubble; M.plant.name = 'tr.plant';
      return M;
    };
  })();
  T.skin = function (g) { const M = T.mats(); g.traverse(m => { if (!m.isMesh) return; const f = m.userData.family, k = T.FAM_ALIAS[f] == null ? f : T.FAM_ALIAS[f]; if (M[k]) m.material = M[k]; }); return g; };
  const E = new THREE.Euler(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), ONE = new THREE.Vector3(1, 1, 1);
  T.frame = function (x, y, z, yaw, pitch, roll) { E.set(-(pitch == null ? 0 : pitch), yaw == null ? 0 : yaw, roll == null ? 0 : roll, 'YXZ'); return new THREE.Matrix4().compose(V.set(x, y, z), Q.setFromEuler(E), ONE); };
  const asM = f => f && f.isMatrix4 ? f : T.frame(f.x, f.y, f.z, f.yaw, f.pitch, f.roll);
  T.builder = function () {
    const B = { b: {}, tris: 0 }, K = f => { const k = T.FAM_ALIAS[f] == null ? f : T.FAM_ALIAS[f]; return B.b[k] || (B.b[k] = { p: [], n: [], u: [], c: [] }); };
    const tri = (q, a, b, c, n, col, ua, ub, uc) => { q.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); for (let i = 0; i < 3; i++) { q.n.push(n[0], n[1], n[2]); q.c.push(col[0], col[1], col[2]); } q.u.push(ua[0], ua[1], ub[0], ub[1], uc[0], uc[1]); B.tris++; };
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
    const planar = (p, n) => { const ax = Math.abs(n[0]), ay = Math.abs(n[1]), az = Math.abs(n[2]); return ay >= ax && ay >= az ? [p[0], p[2]] : ax >= az ? [p[2], p[1]] : [p[0], p[1]]; };
    B.tri = function (fam, a, b, c, col, o) {
      let n = norm(cross(sub(b, a), sub(c, a)));
      if (o && o.face && n[0] * o.face[0] + n[1] * o.face[1] + n[2] * o.face[2] < 0) { const t = b; b = c; c = t; n = [-n[0], -n[1], -n[2]]; }
      tri(K(fam), a, b, c, n, col, planar(a, n), planar(b, n), planar(c, n));
    };
    B.quad = function (fam, A, Bq, C, D, col, o) {
      const q = K(fam), uv = o && o.uv; let n = norm(cross(sub(Bq, A), sub(D, A)));
      if (o && o.face && n[0] * o.face[0] + n[1] * o.face[1] + n[2] * o.face[2] < 0) { const t = Bq; Bq = D; D = t; n = [-n[0], -n[1], -n[2]]; if (uv) { const u = uv[1]; uv[1] = uv[3]; uv[3] = u; } }
      const ua = uv ? uv[0] : planar(A, n), ub = uv ? uv[1] : planar(Bq, n), uc = uv ? uv[2] : planar(C, n), ud = uv ? uv[3] : planar(D, n);
      tri(q, A, Bq, C, n, col, ua, ub, uc); tri(q, A, C, D, n, col, ua, uc, ud);
    };
    const xf = (m, x, y, z) => { V.set(x, y, z).applyMatrix4(m); return [V.x, V.y, V.z]; };
    B.box = function (fam, m, w, h, d, col, o) {
      m = asM(m); const y0 = o && o.centred ? -h / 2 : 0, y1 = y0 + h, a = w / 2, e = d / 2, P = (x, y, z) => xf(m, x, y, z);
      B.quad(fam, P(-a, y0, e), P(a, y0, e), P(a, y1, e), P(-a, y1, e), col); B.quad(fam, P(a, y0, -e), P(-a, y0, -e), P(-a, y1, -e), P(a, y1, -e), col);
      B.quad(fam, P(a, y0, e), P(a, y0, -e), P(a, y1, -e), P(a, y1, e), col); B.quad(fam, P(-a, y0, -e), P(-a, y0, e), P(-a, y1, e), P(-a, y1, -e), col);
      B.quad(fam, P(-a, y1, e), P(a, y1, e), P(a, y1, -e), P(-a, y1, -e), col); if (!(o && o.noBottom)) B.quad(fam, P(-a, y0, -e), P(a, y0, -e), P(a, y0, e), P(-a, y0, e), col);
    };
    B.sweep = function (fam, prof, frames, col, o) {
      o = o || {}; const Ms = frames.map(asM), rings = Ms.map((m, i) => (typeof prof === 'function' ? prof(i) : prof).map(p => xf(m, p[0], p[1], 0))), nP = rings[0].length;
      let s = 0; const S = [0]; for (let i = 1; i < Ms.length; i++) { const a = xf(Ms[i - 1], 0, 0, 0), b = xf(Ms[i], 0, 0, 0); s += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); S.push(s); }
      const pr0 = typeof prof === 'function' ? prof(0) : prof, VV = [0]; for (let j = 1; j <= nP; j++) { const a = pr0[j - 1], b = pr0[j % nP]; VV.push(VV[j - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
      const u0 = o.u0 == null ? 0 : o.u0;
      for (let i = 0; i + 1 < rings.length; i++) for (let j = 0; j < nP; j++) {
        const j2 = (j + 1) % nP, A = rings[i][j], Bq = rings[i][j2], C = rings[i + 1][j2], D = rings[i + 1][j];
        if (o.open && j === nP - 1) continue;
        B.quad(fam, A, D, C, Bq, col, { uv: [[u0 + S[i], VV[j]], [u0 + S[i + 1], VV[j]], [u0 + S[i + 1], VV[j + 1]], [u0 + S[i], VV[j + 1]]] });
      }
      if (o.caps) [0, rings.length - 1].forEach((i, e) => { const r = rings[i], q = K(fam); let cx = 0, cy = 0, cz = 0; r.forEach(p => { cx += p[0]; cy += p[1]; cz += p[2]; }); const c = [cx / nP, cy / nP, cz / nP];
        for (let j = 0; j < nP; j++) { const a = r[j], b = r[(j + 1) % nP], n = norm(cross(sub(e ? b : a, c), sub(e ? a : b, c))); tri(q, c, e ? b : a, e ? a : b, n, col, planar(c, n), planar(e ? b : a, n), planar(e ? a : b, n)); } });
    };
    B.strip = function (fam, L, R, col, o) {
      let u = 0;
      for (let i = 0; i + 1 < L.length; i++) { const w0 = Math.hypot(R[i][0] - L[i][0], R[i][2] - L[i][2]), w1 = Math.hypot(R[i + 1][0] - L[i + 1][0], R[i + 1][2] - L[i + 1][2]), du = Math.hypot(L[i + 1][0] - L[i][0], L[i + 1][2] - L[i][2]);
        B.quad(fam, L[i], L[i + 1], R[i + 1], R[i], col, { uv: [[u, 0], [u + du, 0], [u + du, w1], [u, w0]], face: o && o.face ? o.face : [0, 1, 0] }); u += du; }
    };
    B.cyl = function (fam, a, b, r, col, seg, o) {
      seg = seg == null ? 10 : seg; const d = sub(b, a), l = Math.hypot(d[0], d[1], d[2]) || 1e-6, dn = [d[0] / l, d[1] / l, d[2] / l], up = Math.abs(dn[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0], x = norm(cross(up, dn)), y = cross(dn, x);
      const m0 = new THREE.Matrix4().makeBasis(new THREE.Vector3(x[0], x[1], x[2]), new THREE.Vector3(y[0], y[1], y[2]), new THREE.Vector3(dn[0], dn[1], dn[2])).setPosition(a[0], a[1], a[2]), m1 = m0.clone().setPosition(b[0], b[1], b[2]);
      const prof = []; for (let i = 0; i < seg; i++) { const t = i / seg * Math.PI * 2; prof.push([Math.cos(t) * r, -Math.sin(t) * r]); }
      B.sweep(fam, prof, [m0, m1], col, { caps: !(o && o.caps === false) });
    };
    B.dome = function (fam, m, r, h, col, seg) {
      seg = seg == null ? 7 : seg; m = asM(m); const rings = [], NR = 3;
      for (let j = 0; j <= NR; j++) { const ph = j / NR * Math.PI / 2, rr = r * Math.cos(ph), y = h * Math.sin(ph), ring = []; for (let i = 0; i < seg; i++) { const t = i / seg * Math.PI * 2; ring.push(xf(m, Math.cos(t) * rr, y, Math.sin(t) * rr)); } rings.push(ring); }
      const c = xf(m, 0, h * 0.4, 0);
      for (let j = 0; j + 1 < rings.length; j++) for (let i = 0; i < seg; i++) { const i2 = (i + 1) % seg, A = rings[j][i], Bq = rings[j][i2], Cq = rings[j + 1][i2], D = rings[j + 1][i], mid = [(A[0] + Cq[0]) / 2 - c[0], (A[1] + Cq[1]) / 2 - c[1], (A[2] + Cq[2]) / 2 - c[2]];
        if (j + 1 === NR) B.tri(fam, A, Bq, rings[NR][0], col, { face: mid }); else B.quad(fam, A, Bq, Cq, D, col, { face: mid }); }
    };
    B.mesh = function (fam, mesh, m, o) {
      const g = mesh.geometry, P = g.attributes.position, N = g.attributes.normal, C = g.attributes.color, U = g.attributes.uv, q = K(fam == null ? mesh.userData.family : fam), NM = new THREE.Matrix3().getNormalMatrix(m), idx = g.index;
      const n = idx ? idx.count : P.count, col = o && o.col, mul = o && o.mul == null ? 1 : (o ? o.mul : 1);
      for (let k = 0; k < n; k++) { const i = idx ? idx.getX(k) : k; V.fromBufferAttribute(P, i).applyMatrix4(m); q.p.push(V.x, V.y, V.z); if (N) { V.fromBufferAttribute(N, i).applyMatrix3(NM).normalize(); q.n.push(V.x, V.y, V.z); } else q.n.push(0, 1, 0);
        if (col) q.c.push(col[0], col[1], col[2]); else if (C) q.c.push(C.getX(i) * mul, C.getY(i) * mul, C.getZ(i) * mul); else q.c.push(1, 1, 1); if (U) q.u.push(U.getX(i), U.getY(i)); else q.u.push(0, 0); }
      B.tris += n / 3;
    };
    /* finish: one mesh a family, or, for a family of 3000 triangles or more, one mesh a family a CHUNK (o.chunk metres square, 400; 0: none),
       so a view culls the far stretches of a 3 km road instead of drawing it whole (the owner, 2026-11-09: triangles) */
    B.finish = function (name, o) {
      const G = new THREE.Group(), M = (o && o.mats) || T.mats(), CS = o && o.chunk != null ? o.chunk : 400; G.name = name == null ? 'transit' : name; let tris = 0;
      const parts = [];
      for (const fam in B.b) { const q0 = B.b[fam]; if (!q0.p.length) continue; const nT = q0.p.length / 9;
        if (!(CS > 0) || nT < 3000) { parts.push([fam, q0, null]); continue; }
        const by = {}; for (let t = 0; t < nT; t++) { const key = Math.floor(q0.p[t * 9] / CS) + ',' + Math.floor(q0.p[t * 9 + 2] / CS); (by[key] || (by[key] = [])).push(t); }
        for (const key in by) { const ts = by[key], q = { p: new Array(ts.length * 9), n: new Array(ts.length * 9), u: new Array(ts.length * 6), c: new Array(ts.length * 9) };
          ts.forEach((t, i) => { for (let k = 0; k < 9; k++) { q.p[i * 9 + k] = q0.p[t * 9 + k]; q.n[i * 9 + k] = q0.n[t * 9 + k]; q.c[i * 9 + k] = q0.c[t * 9 + k]; } for (let k = 0; k < 6; k++) q.u[i * 6 + k] = q0.u[t * 6 + k]; });
          parts.push([fam, q, key]); } }
      for (const part of parts) { const fam = part[0], q = part[1]; const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(q.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(q.n, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(q.u, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(q.c, 3));
        const m = new THREE.Mesh(g, M[fam] || M.paint); m.name = G.name + '.' + fam; m.userData.family = fam; m.userData.host = true; if (part[2] != null) m.userData.chunk = part[2]; G.add(m); tris += q.p.length / 9; }
      G.userData.tris = tris; return G;
    };
    return B;
  };
  T.draw = T.draw || {};
})();
