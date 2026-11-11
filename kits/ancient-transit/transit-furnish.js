/* ======================================================================
   Krator Ancient Transit: the furniture assembler (kits/ancient-transit/transit-furnish.js)

   KratorTransitFurniture (KTF): a piece of street furniture built in a ruin state as a few merged meshes.

     KTF.build(kind, { state, variant, seed, linear, span })  -> THREE.Group, or null for an unknown kind
        kind     a key of KTRANSIT.KINDS ('tr_lamp' ...); state one of the kind's states (KTRANSIT.ruinOf says what each does)
        span     for a piece that crosses a street (a gantry, a footbridge): its length across, pavement to pavement (F.span; the kind's own when 0)
        -> one mesh a material family (paint, metal, rust, concrete, pave, white, glass, glow, corrugated, rubble, soil), each
           vertex-coloured (LINEAR by default: every Krator page renders with outputEncoding sRGB; { linear: false } keeps sRGB),
           with planar UVs in WORLD METRES (the dominant axis of each face), so a host lays the library's maps on it with a
           plain repeat and no triplanar hook (KTRANSIT.skin). userData: { kind, state, variant, seed, tris, box, ruin, family }
     KTF.list()         every kind: { key, name, w, d, h, variants, states }
     KTF.dims(kind, v)  the declared box
     KTF.STATES, KTF.KINDS, KTF.materials (the plain materials, by family)

   THE RUIN PASS is one pass over the merged vertices, the same for every kind (the kinds' numbers in KTRANSIT.KINDS.ruin,
   drawn into KTRANSIT.ruinOf(seed, kind, state)):
     bent     the piece leans by `lean` about a hinge near its foot in the direction `leanDir`, and above `kink` of its height
              leans `kinkMore` further (a lamp standard bowed at the arm)
     fallen   the whole piece turned down onto the ground about its foot (a hair short of flat), yawed by `fallYaw`, then set
              on the ground; a lamp's cable (drawn by the piece) lies out beyond the head
     crushed  the height scaled by `crush`, the piece spread a little, sunk by `sink` of its height (a bench half buried)
     burnt    every colour darkened to soot; the glass gone; the glows dark
   and in every state but intact the metal goes to the rust family and every colour is drawn toward rust-brown by `rust`;
   intact pieces are drawn a little toward it too (a thousand years). Glass is drawn only while ruin.glass holds.
   ====================================================================== */
const KTF_API = (function () {
  const RUST = [0x7a / 255, 0x46 / 255, 0x30 / 255];
  const lin = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  function famOf(m) { const f = (m.material.userData && m.material.userData.family) || ''; return f === '' ? 'paint' : f; }
  /* the plain materials a host replaces by family (KTRANSIT.skin): vertex colours alone */
  const MAT = {};
  function matOf(fam) {
    if (MAT[fam]) return MAT[fam];
    const look = { paint: [0.65, 0.1], metal: [0.45, 0.6], rust: [0.85, 0.3], concrete: [0.92, 0], pave: [0.9, 0], white: [0.5, 0.12], corrugated: [0.7, 0.3], rubble: [0.95, 0], soil: [1, 0] }[fam];
    let m;
    if (fam === 'glass') m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide });
    else if (fam === 'glow') m = new THREE.MeshBasicMaterial({ vertexColors: true });
    else m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: look ? look[0] : 0.8, metalness: look ? look[1] : 0 });
    m.name = 'ktf.' + fam; m.userData.family = fam;
    return (MAT[fam] = m);
  }
  const KINDS = KTRANSIT.KINDS;
  /* rotate (x, y, z) about an axis through a point: Rodrigues */
  function rot(p, i, ax, ay, az, px, py, pz, ang) {
    const c = Math.cos(ang), s = Math.sin(ang), x = p[i] - px, y = p[i + 1] - py, z = p[i + 2] - pz, d = ax * x + ay * y + az * z;
    p[i] = px + x * c + (ay * z - az * y) * s + ax * d * (1 - c); p[i + 1] = py + y * c + (az * x - ax * z) * s + ay * d * (1 - c); p[i + 2] = pz + z * c + (ax * y - ay * x) * s + az * d * (1 - c);
  }
  function rotN(n, i, ax, ay, az, ang) { rot(n, i, ax, ay, az, 0, 0, 0, ang); }
  function build(kind, o) {
    o = o || {};
    const A = ASSET_BY_KEY[kind], K = KINDS[kind];
    if (!A || !K) return null;
    const state = o.state == null ? 'intact' : o.state;
    if (K.states.indexOf(state) < 0) throw new Error('KratorTransitFurniture: ' + kind + ' has no state ' + state);
    const seed = o.seed == null ? 1 : (o.seed >>> 0), v = Math.max(0, Math.min(A.variants - 1, o.variant | 0)), linear = o.linear !== false, R = KTRANSIT.ruinOf(seed, kind, state);
    const F = makeFrame(0, 0, 0, { seed: seed, variant: v, span: o.span == null ? 0 : o.span }); F.asset = A; F.ruin = R; F.state = state;
    const g = new THREE.Group(), prev = _target; _target = g;
    try { A.build(F); } finally { _target = prev; }
    /* collect: positions and normals in the piece's frame, one colour a mesh, by family */
    const B = {}, h = A.h;
    g.updateMatrixWorld(true);
    g.children.forEach(m => {
      if (!m.isMesh) return;
      let fam = famOf(m);
      if (fam === 'glass' && !R.glass) return;
      if (fam === 'glow' && state !== 'intact') fam = 'glass';
      const col = m.material.color, c = [col.r, col.g, col.b];
      if (fam === 'metal' && state !== 'intact') fam = 'rust';
      let k = state === 'intact' ? R.rust * 0.45 : 0.68;
      if (fam === 'rust' || fam === 'paint' || fam === 'metal' || fam === 'corrugated') for (let q = 0; q < 3; q++) c[q] = c[q] * (1 - k) + RUST[q] * k;
      else if (fam !== 'glass' && fam !== 'glow') for (let q = 0; q < 3; q++) c[q] = c[q] * (1 - k * 0.35) + RUST[q] * k * 0.35;   /* the grime on concrete and panel */
      if (fam !== 'glass') for (let q = 0; q < 3; q++) c[q] *= R.soot;
      if (fam === 'glass' && state !== 'intact') for (let q = 0; q < 3; q++) c[q] *= 0.6;
      const geo = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry, P = geo.attributes.position, N = geo.attributes.normal;
      const bucket = B[fam] || (B[fam] = { p: [], n: [], c: [] }), M = m.matrixWorld, NM = new THREE.Matrix3().getNormalMatrix(M), V = new THREE.Vector3();
      for (let i = 0; i < P.count; i++) {
        V.fromBufferAttribute(P, i).applyMatrix4(M); bucket.p.push(V.x, V.y, V.z);
        if (N) { V.fromBufferAttribute(N, i).applyMatrix3(NM).normalize(); bucket.n.push(V.x, V.y, V.z); } else bucket.n.push(0, 1, 0);
        bucket.c.push(linear ? lin(c[0]) : c[0], linear ? lin(c[1]) : c[1], linear ? lin(c[2]) : c[2]);
      }
      if (m.geometry !== geo) geo.dispose();
    });
    /* the ruin pass */
    const out = new THREE.Group(); out.name = kind + '.' + state;
    let tris = 0, minY = 1e9, box = { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] };
    const ax = Math.cos(R.leanDir), az = Math.sin(R.leanDir);
    for (const fam in B) {
      const p = B[fam].p, n = B[fam].n, cnt = p.length / 3;
      if (state === 'bent') {
        const y0 = Math.min(0.6, h * 0.06), yk = R.kink * h;
        for (let i = 0; i < cnt; i++) { const y = p[i * 3 + 1]; if (y > yk) { rot(p, i * 3, ax, 0, az, 0, yk, 0, R.lean * R.kinkMore); rotN(n, i * 3, ax, 0, az, R.lean * R.kinkMore); } if (y > y0) { rot(p, i * 3, ax, 0, az, 0, y0, 0, R.lean); rotN(n, i * 3, ax, 0, az, R.lean); } }
      } else if (state === 'fallen' && !R.own) {
        const ang = R.fallSide * Math.PI / 2 * 0.965, fy = R.fallYaw, fx = R.fallAxis === 'x' ? 1 : 0, fz = R.fallAxis === 'x' ? 0 : 1;
        for (let i = 0; i < cnt; i++) { rot(p, i * 3, fx, 0, fz, 0, 0.1, 0, ang); rotN(n, i * 3, fx, 0, fz, ang); rot(p, i * 3, 0, 1, 0, 0, 0, 0, fy); rotN(n, i * 3, 0, 1, 0, fy); }
      } else if (state === 'crushed' && !R.own) {
        const sp = 1 + 0.22 * (1 - R.crush), sink = R.sink * h;
        for (let i = 0; i < cnt; i++) { p[i * 3] *= sp; p[i * 3 + 2] *= sp; p[i * 3 + 1] = p[i * 3 + 1] * R.crush - sink; n[i * 3 + 1] /= R.crush; const l = Math.hypot(n[i * 3], n[i * 3 + 1], n[i * 3 + 2]) || 1; n[i * 3] /= l; n[i * 3 + 1] /= l; n[i * 3 + 2] /= l; }
      }
      for (let i = 0; i < cnt; i++) if (p[i * 3 + 1] < minY) minY = p[i * 3 + 1];
    }
    /* set a fallen piece on the ground; planar UVs in metres; the meshes */
    const drop = state === 'fallen' && !R.own ? 0.03 - minY : 0;
    for (const fam in B) {
      const p = B[fam].p, n = B[fam].n, cnt = p.length / 3, uv = new Float32Array(cnt * 2);
      if (drop) for (let i = 0; i < cnt; i++) p[i * 3 + 1] += drop;
      for (let t = 0; t + 2 < cnt; t += 3) {
        const nx = Math.abs(n[t * 3]) + Math.abs(n[t * 3 + 3]) + Math.abs(n[t * 3 + 6]), ny = Math.abs(n[t * 3 + 1]) + Math.abs(n[t * 3 + 4]) + Math.abs(n[t * 3 + 7]), nz = Math.abs(n[t * 3 + 2]) + Math.abs(n[t * 3 + 5]) + Math.abs(n[t * 3 + 8]);
        for (let q = 0; q < 3; q++) { const i = t + q; if (ny >= nx && ny >= nz) { uv[i * 2] = p[i * 3]; uv[i * 2 + 1] = p[i * 3 + 2]; } else if (nx >= nz) { uv[i * 2] = p[i * 3 + 2]; uv[i * 2 + 1] = p[i * 3 + 1]; } else { uv[i * 2] = p[i * 3]; uv[i * 2 + 1] = p[i * 3 + 1]; } }
      }
      for (let i = 0; i < cnt; i++) for (let q = 0; q < 3; q++) { if (p[i * 3 + q] < box.min[q]) box.min[q] = p[i * 3 + q]; if (p[i * 3 + q] > box.max[q]) box.max[q] = p[i * 3 + q]; }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(B[fam].c, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      const mesh = new THREE.Mesh(geo, matOf(fam)); mesh.name = kind + '.' + state + '.' + fam; mesh.userData.family = fam; out.add(mesh); tris += cnt / 3;
    }
    out.userData = { kind: kind, state: state, variant: v, seed: seed, tris: tris, box: box, ruin: R, w: A.w, d: A.d, h: A.h };
    return out;
  }
  return {
    build: build,
    list: () => KTRANSIT.KIND_KEYS.map(k => ({ key: k, name: KINDS[k].name, w: KINDS[k].w, d: KINDS[k].d, h: KINDS[k].h, variants: KINDS[k].variants, states: KINDS[k].states.slice(), where: KINDS[k].where })),
    dims: (k, v) => { const A = ASSET_BY_KEY[k]; return A ? entryDims(A, v) : null; },
    STATES: KTRANSIT.STATES, KINDS: KINDS, materials: matOf
  };
})();
