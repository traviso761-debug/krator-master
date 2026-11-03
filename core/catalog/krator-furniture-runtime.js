/* ======================================================================
   Krator Furniture Runtime: the catalog's furniture in any build.
   kits/catalog/furniture_bundle.py wraps, in ONE closure, krator-furniture-core.js,
   krator-furniture-kit.js, the furniture files a build asks for and this file, and
   returns this file's API as the single global `KratorFurniture` (KF below). Nothing
   else leaks: the core's TAU, shade, mat, PAL, FURN ... stay inside the closure, so they
   never meet a host's own names. It needs only THREE (r128).

   A BATCH builds pieces through the catalog's own frame (makeFrame: the same build code,
   the same palettes) and MERGES them: every mesh's triangles go, in world space with its
   colour as a vertex colour, into one bucket per render family, so a whole settlement's
   furniture is about 20 draw calls. Painted panels (F.decal: a canvas map) are kept as their
   own meshes, sharing the cached material per painted key. Lights the pieces add (F.lamp) are kept as DATA.

     const B = KF.batch();                     // or KF.batch({ indexed: true }): see INDEXED below
     const rec = B.place(key, x, y, z, ry, { variant, seed, wealth, building, room, setting });
         -> { key, variant, seed, x, y, z, ry, building, room, lights: [{ x, y, z, color, intensity, distance }], error }
     const group = B.flush(parent);            // the merged meshes (one per family) added to parent; B empties
     B.placements                              // every record placed since the batch began (kept after flush)
     KF.FURNS, KF.FURN_BY_KEY, KF.entryDims(A, v), KF.furnAnchorY(A, v, at), KF.lightsOf(key, v, seed, wealth)
     KF.has(key), KF.cultures()
   A record's x y z is the frame origin (the footprint centre on the floor), ry the heading,
   as the catalog's buildFurn takes them; anchorY (wall, ceiling, surface) is the caller's.

   INDEXED (opt-in, ROADMAP stage 1): by default a batch unrolls every source mesh into a triangle soup (one vertex
   per corner, no index: a box's 24 vertices become 36, a smooth cylinder's up to six times its own), and code that
   reads B.buckets or a flushed mesh's arrays may count on that. KF.batch({ indexed: true }) keeps each source mesh's
   vertices once and its index (offset into the bucket; a non-indexed source gets sequential indices): the same
   triangles, corners and order, 1.5 to 6 times fewer vertices. Its buckets carry `idx` (a Buf of Uint32) beside
   pos / nor / col, its flushed meshes an index (Uint16, Uint32 past 65535 vertices) and its merged painted panels
   too. A caller that copies the arrays must carry the index: Girder's gixAccum and Mav's Refuge's mixBuild do.
   ====================================================================== */
const KF_API = (function () {
  const API = {};
  API.FURNS = FURNS; API.FURN_BY_KEY = FURN_BY_KEY; API.FPAL = FPAL; API.FURN_TYPES = FURN_TYPES; API.FURN_JOBS = FURN_JOBS; API.FURN_TASKS = FURN_TASKS;
  API.entryDims = entryDims; API.furnAnchorY = furnAnchorY; API.CATALOG_MATERIALS = CATALOG_MATERIALS;
  API.has = function (key) { return !!FURN_BY_KEY[key]; };
  /* round primitives' detail for everything built after the call (1 = the catalog page's; 0.5 halves the
     segments of cylinders, cones, domes, balls and rods: a settlement's furniture is about half the triangles) */
  API.setDetail = function (k) { _LOD = Math.max(0.25, Math.min(1, +k || 1)); return _LOD; };
  API.cultures = function () { return FURN_CULTURES.slice(); };

  const _m = new THREE.Matrix4(), _n = new THREE.Matrix3(), _v = new THREE.Vector3(), _w = new THREE.Vector3();
  /* build one piece into a throw-away group: the core's mk* add to _target */
  function buildGroup(key, x, y, z, ry, o) {
    const A = FURN_BY_KEY[key];
    if (!A) return { error: 'no such furniture: ' + key };
    const g = new THREE.Group(), prev = _target;
    _target = g;
    const F = makeFrame(x, z, ry || 0, { y: y || 0, seed: o.seed || 1, variant: o.variant || 0, wealth: o.wealth == null ? 0.5 : o.wealth, span: o.span || 0 });
    F.asset = A;
    let err = null;
    try { A.build(F); } catch (e) { err = String(e && e.message || e); }
    _target = prev;
    return { g: g, error: err };
  }
  function lightsIn(g) {
    const out = [];
    g.traverse(function (o) { if (o.isPointLight) out.push({ x: o.position.x, y: o.position.y, z: o.position.z, color: o.color.getHex(), intensity: o.intensity, distance: o.distance }); });
    return out;
  }
  function disposeGroup(g) { g.traverse(function (o) { if (o.geometry) o.geometry.dispose(); }); }
  const lightCache = {};
  API.lightsOf = function (key, v, seed, wealth) {
    const k = key + '|' + (v || 0) + '|' + (seed || 1) + '|' + (wealth == null ? 0.5 : wealth);
    if (lightCache[k]) return lightCache[k];
    const r = buildGroup(key, 0, 0, 0, 0, { variant: v, seed: seed, wealth: wealth });
    const L = r.g ? lightsIn(r.g) : [];
    if (r.g) disposeGroup(r.g);
    return (lightCache[k] = L);
  };

  function Batch(opt) {
    this.opt = opt || {};
    this.indexed = !!this.opt.indexed;   /* INDEXED above; off by default: the soup every older caller reads */
    this.buckets = {};
    this.placements = [];
    this.textured = [];      /* painted panels (F.decal): their canvas map shared; flush merges those sharing a material */
    this.tris = 0;
  }
  /* a growable typed buffer: positions and normals as float32, colours as uint8 (a settlement holds millions
     of furniture triangles; plain arrays of doubles would take several times the memory) */
  function Buf(T) { this.T = T; this.a = new T(3 * 4096); this.n = 0; }
  Buf.prototype.push3 = function (x, y, z) {
    if (this.n + 3 > this.a.length) { const b = new this.T(this.a.length * 2); b.set(this.a); this.a = b; }
    this.a[this.n++] = x; this.a[this.n++] = y; this.a[this.n++] = z;
  };
  Buf.prototype.push1 = function (x) {
    if (this.n + 1 > this.a.length) { const b = new this.T(this.a.length * 2); b.set(this.a); this.a = b; }
    this.a[this.n++] = x;
  };
  Buf.prototype.view = function () { return this.a.subarray(0, this.n); };
  /* an index for n vertices: Uint16 while every index fits, else Uint32 */
  function indexAttr(idx, nv) { return new THREE.BufferAttribute(nv > 65535 ? (idx instanceof Uint32Array ? idx : new Uint32Array(idx)) : new Uint16Array(idx), 1); }
  /* one bucket per render family, and per texture family within it (mat(): userData.texFamily); an indexed batch's
     buckets also carry idx: the triangles, as indices into pos / nor / col (vertex i is pos.a[3i..3i+2]) */
  Batch.prototype.bucket = function (family, tex) {
    const k = tex ? tex + '/' + family : family;
    if (this.buckets[k]) return this.buckets[k];
    const b = this.buckets[k] = { family: family, tex: tex || null, pos: new Buf(Float32Array), nor: new Buf(Float32Array), col: new Buf(Uint8Array) };
    if (this.indexed) b.idx = new Buf(Uint32Array);
    return b;
  };
  Batch.prototype.absorb = function (g) {
    const self = this;
    g.updateMatrixWorld(true);
    g.traverse(function (o) {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
      const geo = o.geometry, pos = geo.attributes.position, nor = geo.attributes.normal, idx = geo.index;
      const mt = o.material, c = mt.color || new THREE.Color(1, 1, 1);
      if (mt.map) {
        const m = new THREE.Mesh(geo.clone(), mt);
        o.matrixWorld.decompose(m.position, m.quaternion, m.scale);
        m.name = 'furniture:decal'; m.userData.furniture = true;
        self.textured.push(m); self.tris += (idx ? idx.count : pos.count) / 3;
        return;
      }
      const b = self.bucket(mt.userData.family || '', mt.userData.texFamily);
      _m.copy(o.matrixWorld); _n.getNormalMatrix(_m);
      const n = idx ? idx.count : pos.count;
      if (self.indexed) {
        /* each vertex once (world space, the part's colour), then the triangles as indices offset by the bucket's
           vertices so far: the soup's corners in the soup's order, shared instead of copied */
        const base = b.pos.n / 3, nv = pos.count, cr = Math.round(c.r * 255), cg = Math.round(c.g * 255), cb = Math.round(c.b * 255);
        for (let j = 0; j < nv; j++) {
          _v.fromBufferAttribute(pos, j).applyMatrix4(_m);
          b.pos.push3(_v.x, _v.y, _v.z);
          if (nor) { _w.fromBufferAttribute(nor, j).applyMatrix3(_n).normalize(); b.nor.push3(_w.x, _w.y, _w.z); } else b.nor.push3(0, 1, 0);
          b.col.push3(cr, cg, cb);
        }
        if (idx) for (let i = 0; i < n; i++) b.idx.push1(base + idx.getX(i));
        else for (let i = 0; i < n; i++) b.idx.push1(base + i);
        self.tris += n / 3;
        return;
      }
      for (let i = 0; i < n; i++) {
        const j = idx ? idx.getX(i) : i;
        _v.fromBufferAttribute(pos, j).applyMatrix4(_m);
        b.pos.push3(_v.x, _v.y, _v.z);
        if (nor) { _w.fromBufferAttribute(nor, j).applyMatrix3(_n).normalize(); b.nor.push3(_w.x, _w.y, _w.z); } else b.nor.push3(0, 1, 0);
        b.col.push3(Math.round(c.r * 255), Math.round(c.g * 255), Math.round(c.b * 255));
      }
      self.tris += n / 3;
    });
  };
  Batch.prototype.place = function (key, x, y, z, ry, o) {
    o = o || {};
    const r = buildGroup(key, x, y, z, ry, o);
    const rec = { key: key, variant: o.variant || 0, seed: o.seed || 1, x: x, y: y || 0, z: z, ry: ry || 0,
      building: o.building || null, room: o.room || null, setting: o.setting || null, lights: [], error: r.error || null };
    if (r.g) { rec.lights = lightsIn(r.g); this.absorb(r.g); disposeGroup(r.g); }
    this.placements.push(rec);
    return rec;
  };
  /* one mesh per render family, its look as the catalog's mat() gives it, colours per vertex */
  Batch.prototype.flush = function (parent) {
    const grp = new THREE.Group();
    grp.name = 'catalog-furniture';
    for (const bk in this.buckets) {
      const b = this.buckets[bk], f = b.family;
      if (!b.pos.n) continue;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(b.pos.view().slice(), 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(b.nor.view().slice(), 3));
      geo.setAttribute('color', new THREE.BufferAttribute(b.col.view().slice(), 3, true));   /* uint8, normalised */
      if (b.idx) geo.setIndex(indexAttr(b.idx.view().slice(), b.pos.n / 3));
      let mt;
      if (f === 'glow') mt = new THREE.MeshBasicMaterial({ vertexColors: true });
      else {
        const look = MAT_FAMILY_LOOK[f], glass = f === 'glass';
        mt = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: look ? look[0] : glass ? 0.05 : 0.85, metalness: look ? look[1] : glass ? 0.1 : 0,
          transparent: glass, opacity: glass ? 0.55 : 1 });
      }
      mt.userData.family = f;
      if (b.tex) mt.userData.texFamily = b.tex;
      const m = new THREE.Mesh(geo, mt);
      m.name = 'furniture:' + (f || 'plain') + (b.tex ? '/' + b.tex : '');
      m.userData.furniture = true;
      grp.add(m);
    }
    /* the painted panels: merged per material (one canvas map each), so a cord of pennants is one draw, not one a flag
       (a stretched cord carries up to 23); a material used once keeps its mesh */
    const byMat = new Map();
    for (const m of this.textured) { const a = byMat.get(m.material); if (a) a.push(m); else byMat.set(m.material, [m]); }
    for (const [mt, ms] of byMat) {
      if (ms.length === 1) { grp.add(ms[0]); continue; }
      if (this.indexed) { grp.add(mergeIndexed(ms, mt)); continue; }
      let n = 0;
      for (const m of ms) { const g = m.geometry; n += g.index ? g.index.count : g.attributes.position.count; }
      const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2);
      let k = 0;
      for (const m of ms) {
        m.updateMatrix(); _n.getNormalMatrix(m.matrix);
        const g = m.geometry, pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv, idx = g.index, c = idx ? idx.count : pos.count;
        for (let i = 0; i < c; i++, k++) {
          const j = idx ? idx.getX(i) : i;
          _v.fromBufferAttribute(pos, j).applyMatrix4(m.matrix); P[k * 3] = _v.x; P[k * 3 + 1] = _v.y; P[k * 3 + 2] = _v.z;
          if (nor) { _w.fromBufferAttribute(nor, j).applyMatrix3(_n).normalize(); N[k * 3] = _w.x; N[k * 3 + 1] = _w.y; N[k * 3 + 2] = _w.z; } else N[k * 3 + 1] = 1;
          if (uv) { U[k * 2] = uv.getX(j); U[k * 2 + 1] = uv.getY(j); }
        }
        g.dispose();
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(N, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
      const mm = new THREE.Mesh(geo, mt);
      mm.name = 'furniture:decal'; mm.userData.furniture = true;
      grp.add(mm);
    }
    this.buckets = {}; this.textured = [];
    if (parent) parent.add(grp);
    return grp;
  };
  /* an indexed batch's painted panels sharing a material: each panel's vertices once, in world space, its index kept */
  function mergeIndexed(ms, mt) {
    let nv = 0, ni = 0;
    for (const m of ms) { const g = m.geometry; nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
    const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3), U = new Float32Array(nv * 2), I = new Uint32Array(ni);
    let k = 0, q = 0;
    for (const m of ms) {
      m.updateMatrix(); _n.getNormalMatrix(m.matrix);
      const g = m.geometry, pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv, idx = g.index, base = k;
      for (let j = 0; j < pos.count; j++, k++) {
        _v.fromBufferAttribute(pos, j).applyMatrix4(m.matrix); P[k * 3] = _v.x; P[k * 3 + 1] = _v.y; P[k * 3 + 2] = _v.z;
        if (nor) { _w.fromBufferAttribute(nor, j).applyMatrix3(_n).normalize(); N[k * 3] = _w.x; N[k * 3 + 1] = _w.y; N[k * 3 + 2] = _w.z; } else N[k * 3 + 1] = 1;
        if (uv) { U[k * 2] = uv.getX(j); U[k * 2 + 1] = uv.getY(j); }
      }
      if (idx) for (let i = 0; i < idx.count; i++) I[q++] = base + idx.getX(i);
      else for (let i = 0; i < pos.count; i++) I[q++] = base + i;
      g.dispose();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(N, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    geo.setIndex(indexAttr(I, nv));
    const mm = new THREE.Mesh(geo, mt);
    mm.name = 'furniture:decal'; mm.userData.furniture = true;
    return mm;
  }
  /* opt.indexed: keep the source meshes' indices (INDEXED above); default off */
  API.batch = function (opt) { return new Batch(opt); };
  return API;
})();
