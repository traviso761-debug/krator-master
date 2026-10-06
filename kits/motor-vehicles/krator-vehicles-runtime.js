/* ======================================================================
   Krator Motor Vehicles: the runtime (kits/motor-vehicles/krator-vehicles-runtime.js)

   The API the bundle returns as the single global `KratorVehicles` (KV below).
   vehicle_bundle.py wraps the catalog core, vehicles-core.js, the culture files
   and this file in ONE closure; nothing else leaks. It needs only THREE (r128).

     KV.list()                        -> [{ key, name, culture, tags, variants, variantNames, w, d, h, data }]
     KV.build(key, { variant, seed, linear })  -> THREE.Group, or null for an unknown key
     KV.roll(group, metres)           spins every wheel for that distance travelled (+ = forward, +z)
     KV.steer(group, radians)         turns the front pair (clamped to data.maxSteer; + turns toward +x)
     KV.lights(group, on)             headlamps, lamp bar, tail lamps (emissive) on or off
     KV.has(key), KV.get(key), KV.cultures(), KV.dataOf(key, variant), KV.setDetail(k), KV.dispose(group)

   The group (origin at the footprint centre on the ground, +z forward, wheels on y = 0):
     body:matte   painted plate, seats, canvas, tyres of the spare: one mesh, vertex colours
     body:metal   tube, brass, engine, lamp lenses: one mesh, vertex colours, its own material
                  (the lamps glow through an emissive map: lights() sets that material's emissive)
     steer_fl, steer_fr   pivots at the steered hubs (rotation.y steers); each holds wheel_fl / wheel_fr
     wheel_rl, wheel_rr   the other wheels, origin at the hub (rotation.x spins)
   Two body meshes and one per wheel: six draw calls for a four-wheeler, more for six or eight wheels or a
   tracked vehicle's road wheels; a tracked vehicle adds `belts` (every track belt, run round by roll()). group.userData = { key, name, culture, tags, kind:'vehicle', variant, seed,
   wheels:[{ name, r, x, y, z, front, steer, drive, lift?, steerRatio? }], lamps:[{ x, y, z, dx, dy, dz, kind }],
   data, tris, lightsOn }. A wheel's hub is at y = r + lift (lift: a road wheel riding a track belt); a steered
   wheel turns by steer() x steerRatio (default 1).

   Colours: the palettes are sRGB (as every Krator palette); the merged vertex colours are converted
   to LINEAR for a renderer with outputEncoding = sRGBEncoding (every Krator page). { linear:false }
   keeps the sRGB values, for a host that renders without an output encoding.
   ====================================================================== */
const KV_API = (function () {
  const API = {};
  const _m = new THREE.Matrix4(), _n = new THREE.Matrix3(), _v = new THREE.Vector3(), _w = new THREE.Vector3();
  function lin(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  const METAL_FAMILIES = { metal: 1, gold: 1, bronze: 1, rust: 1, brass: 1, steel: 1, chrome: 1 };

  /* the emissive map: texel 0 black (no glow), then one texel per lamp family (VEHICLE_LAMP_FAMILIES) */
  const LAMP_TEXELS = [[0, 0, 0], [255, 236, 196], [255, 26, 12], [255, 150, 30], [90, 190, 255]];
  const NTEX = 8;
  let _lampTex = null;
  function lampTex() {
    if (_lampTex) return _lampTex;
    const a = new Uint8Array(NTEX * 4);
    for (let i = 0; i < NTEX; i++) { const t = LAMP_TEXELS[i] || LAMP_TEXELS[0]; a.set([t[0], t[1], t[2], 255], i * 4); }
    _lampTex = new THREE.DataTexture(a, NTEX, 1, THREE.RGBAFormat);
    _lampTex.magFilter = _lampTex.minFilter = THREE.NearestFilter;
    _lampTex.generateMipmaps = false;
    _lampTex.needsUpdate = true;
    return _lampTex;
  }
  /* shared looks: the painted body and the wheels need no per-instance state */
  let _matte = null, _wheel = null;
  /* with detail maps on (vehicles-detail.js) every material takes the atlas hook; the shared ones are kept per mode */
  let _matteD = null, _wheelD = null;
  const det = function (m, on) { return on ? VEHICLE_DETAIL.hook(m) : m; };
  function matteMat(on) {
    if (on) return _matteD || (_matteD = det(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0.05 }), true));
    return _matte || (_matte = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0.05 }));
  }
  function wheelMat(on) {
    if (on) return _wheelD || (_wheelD = det(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0.08 }), true));
    return _wheel || (_wheel = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0.08 }));
  }
  function metalMat(on) {
    return det(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.48, metalness: 0.55,
      emissive: new THREE.Color(0, 0, 0), emissiveMap: lampTex(), emissiveIntensity: 1.6 }), on);
  }

  /* merge every mesh under g (world matrices; g at the identity) into buckets keyed by sel(family) */
  function merge(g, sel, linear, culture) {
    const B = {};
    g.updateMatrixWorld(true);
    g.traverse(function (o) {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
      const geo = o.geometry, pos = geo.attributes.position, nor = geo.attributes.normal, idx = geo.index;
      const fam = (o.material.userData && o.material.userData.family) || '', c = o.material.color;
      const k = sel(fam), b = B[k] || (B[k] = { pos: [], nor: [], col: [], uv: [], det: [] });
      const ds = VEHICLE_DETAIL.resolve(culture, fam, c.getHex());          /* the detail slot, -1 none */
      const cr = linear ? lin(c.r) : c.r, cg = linear ? lin(c.g) : c.g, cb = linear ? lin(c.b) : c.b;
      const tex = VEHICLE_LAMP_FAMILIES[fam] || 0, u = (tex + 0.5) / NTEX;
      _m.copy(o.matrixWorld); _n.getNormalMatrix(_m);
      const n = idx ? idx.count : pos.count;
      for (let i = 0; i < n; i++) {
        const j = idx ? idx.getX(i) : i;
        _v.fromBufferAttribute(pos, j).applyMatrix4(_m);
        b.pos.push(_v.x, _v.y, _v.z);
        if (nor) { _w.fromBufferAttribute(nor, j).applyMatrix3(_n).normalize(); b.nor.push(_w.x, _w.y, _w.z); } else b.nor.push(0, 1, 0);
        b.col.push(cr, cg, cb);
        b.uv.push(u, 0.5);
        b.det.push(ds);
      }
    });
    return B;
  }
  function meshOf(b, material, name, withUV) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(b.nor, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(b.col, 3));
    if (withUV) geo.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2));
    geo.setAttribute('aDetS', new THREE.Float32BufferAttribute(b.det, 1));     /* the detail slot per vertex */
    geo.computeBoundingSphere();
    const m = new THREE.Mesh(geo, material);
    m.name = name; m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  /* the belts of a tracked vehicle (F.track records them): one mesh, a unit box per shoe laid round each loop at
     arc offset `off`; roll() moves `off` and lays them again (a few thousand vertices: cheap per frame) */
  const SHOE = new THREE.BoxGeometry(1, 1, 1).toNonIndexed(), SHOE_P = SHOE.attributes.position.array,
    SHOE_N = SHOE.attributes.normal.array, SHOE_V = SHOE.attributes.position.count;
  function layBelts(m, Bs, off) {
    const P = m.geometry.attributes.position.array, N = m.geometry.attributes.normal.array;
    let v = 0;
    for (const B of Bs) {
      const L = B.step * 0.76;
      for (let i = 0; i < B.n; i++) {
        const sh = vehicleBeltShoe(B, i * B.step + off);
        for (let k = 0; k < SHOE_V; k++, v++) {
          const y0 = SHOE_P[k * 3 + 1] * L, z0 = SHOE_P[k * 3 + 2] * B.t, ny = SHOE_N[k * 3 + 1], nz = SHOE_N[k * 3 + 2];
          P[v * 3] = B.x + SHOE_P[k * 3] * B.w; P[v * 3 + 1] = sh.y + y0 * sh.c - z0 * sh.s; P[v * 3 + 2] = sh.z + y0 * sh.s + z0 * sh.c;
          N[v * 3] = SHOE_N[k * 3]; N[v * 3 + 1] = ny * sh.c - nz * sh.s; N[v * 3 + 2] = ny * sh.s + nz * sh.c;
        }
      }
    }
    m.geometry.attributes.position.needsUpdate = true; m.geometry.attributes.normal.needsUpdate = true;
    m.geometry.computeBoundingSphere();
  }
  function beltMesh(Bs, culture, linear, metal, matte) {
    let nv = 0;
    for (const B of Bs) nv += B.n * SHOE_V;
    const col = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), det = new Float32Array(nv);
    let v = 0;
    for (const B of Bs) {
      const c = new THREE.Color(B.color), ds = VEHICLE_DETAIL.resolve(culture, B.family, c.getHex());
      const r = linear ? lin(c.r) : c.r, gg = linear ? lin(c.g) : c.g, bb = linear ? lin(c.b) : c.b;
      for (let k = 0; k < B.n * SHOE_V; k++, v++) { col[v * 3] = r; col[v * 3 + 1] = gg; col[v * 3 + 2] = bb; uv[v * 2] = 0.5 / NTEX; uv[v * 2 + 1] = 0.5; det[v] = ds; }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(nv * 3), 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(nv * 3), 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('aDetS', new THREE.Float32BufferAttribute(det, 1));
    const m = new THREE.Mesh(geo, METAL_FAMILIES[Bs[0].family] ? metal : matte);
    m.name = 'belts'; m.castShadow = true; m.receiveShadow = true;
    layBelts(m, Bs, 0);
    return m;
  }
  function disposeTree(g) { g.traverse(function (o) { if (o.geometry) o.geometry.dispose(); }); }

  API.list = function () {
    return VEHICLES.map(function (A) {
      return { key: A.key, name: A.name, culture: A.culture, tags: JSON.parse(JSON.stringify(A.tags || {})),
        variants: A.variants, variantNames: A.variantNames.slice(), w: A.w, d: A.d, h: A.h, data: vehicleData(A, 0),
        budget: vehicleBudget(A) };
    });
  };
  API.has = function (key) { return !!VEHICLE_BY_KEY[key]; };
  API.get = function (key) { return VEHICLE_BY_KEY[key] || null; };
  API.dataOf = function (key, v) { const A = VEHICLE_BY_KEY[key]; return A ? vehicleData(A, v) : null; };
  API.cultures = function () { return Object.keys(VEHICLE_CULTURES); };
  /* a culture's palette (sRGB numbers), a copy: what the colour keys of its vehicles resolve to */
  API.palette = function (culture) { return VEHICLE_CULTURES[culture] ? Object.assign({}, FPAL[culture]) : null; };
  API.CLASSES = VEHICLE_CLASSES; API.TYPES = VEHICLE_TYPES; API.DRIVES = VEHICLE_DRIVES; API.FUELS = VEHICLE_FUELS; API.TERRAIN = VEHICLE_TERRAIN;
  /* round primitives' detail for everything built after the call (1 = full; a crowded world may halve it) */
  /* the library detail maps (vehicles-detail.js): on by default when the bundle carries them; off = vertex colours
     only (the look before 2026-10-06, and ?mat=proc on the sheet). For vehicles built after the call. */
  API.setTextures = function (on) { return VEHICLE_DETAIL.set(on); };
  API.textures = function () { return { on: VEHICLE_DETAIL.on(), pending: VEHICLE_DETAIL.pending(), slots: VEHICLE_DETAIL.info() }; };
  API.setDetail = function (k) { _LOD = Math.max(0.25, Math.min(1, +k || 1)); return _LOD; };

  API.build = function (key, o) {
    o = o || {};
    const A = VEHICLE_BY_KEY[key];
    if (!A) { console.error('KratorVehicles: no such vehicle', key); return null; }
    const v = Math.max(0, Math.min(A.variants - 1, (o.variant | 0))), seed = o.seed || 1, linear = o.linear !== false;
    const tex = VEHICLE_DETAIL.on() && o.textures !== false;
    const data = vehicleData(A, v);
    const F = vehicleFrame({ seed: seed, variant: v });
    F.asset = A; F.data = data;
    /* the body */
    const body = new THREE.Group(), prev = _target;
    _target = body;
    try { A.build(F); } finally { _target = prev; }
    const B = merge(body, function (f) { return METAL_FAMILIES[f] || VEHICLE_LAMP_FAMILIES[f] ? 'metal' : 'matte'; }, linear, A.culture);
    disposeTree(body);
    const g = new THREE.Group();
    g.name = 'vehicle:' + key;
    let tris = 0;
    const metal = metalMat(tex);
    if (B.matte) { g.add(meshOf(B.matte, matteMat(tex), 'body:matte', false)); tris += B.matte.pos.length / 9; }
    if (B.metal) { g.add(meshOf(B.metal, metal, 'body:metal', true)); tris += B.metal.pos.length / 9; }
    let belts = null;
    if (F.belts.length) {
      belts = beltMesh(F.belts, A.culture, linear, metal, matteMat(tex));
      g.add(belts); tris += belts.geometry.attributes.position.count / 3;
    }
    /* the wheels: each one built at the origin by the entry's wheel(), merged into one mesh, hung at its hub */
    const wheels = [];
    for (const W of data.wheels) {
      const wg = new THREE.Group(), side = W.x >= 0 ? 1 : -1, hubY = W.r + (W.lift || 0);
      _target = wg;
      try { A.wheel(F, Object.assign({ side: side }, W)); } finally { _target = prev; }
      const WB = merge(wg, function () { return 'wheel'; }, linear, A.culture);
      disposeTree(wg);
      const wm = meshOf(WB.wheel, wheelMat(tex), W.name, false);
      tris += WB.wheel.pos.length / 9;
      if (W.steer) {
        const pivot = new THREE.Group();
        pivot.name = 'steer_' + W.name.replace(/^wheel_/, '');
        pivot.position.set(W.x, hubY, W.z);
        pivot.add(wm); g.add(pivot);
      } else {
        wm.position.set(W.x, hubY, W.z); g.add(wm);
      }
      const rec = { name: W.name, r: W.r, x: W.x, y: hubY, z: W.z, front: !!W.front, steer: !!W.steer, drive: !!W.drive };
      if (W.lift) rec.lift = W.lift;                       /* a road wheel on a track: it rides the belt, t above the ground */
      if (W.steer && W.steerRatio != null) rec.steerRatio = W.steerRatio;
      wheels.push(rec);
    }
    g.userData = { key: key, name: A.name, culture: A.culture, tags: JSON.parse(JSON.stringify(A.tags || {})), kind: 'vehicle',
      variant: v, variantName: A.variantNames[v] || '', seed: seed, wheels: wheels, lamps: F.lamps.slice(), data: data,
      tris: Math.round(tris), lightsOn: false, w: A.w, d: A.d, h: A.h, textured: tex };
    Object.defineProperty(g.userData, '_metal', { value: metal, enumerable: false });   /* not cloned with userData */
    if (belts) Object.defineProperty(g.userData, '_belts', { value: { mesh: belts, list: F.belts, off: 0 }, enumerable: false, writable: true });
    return g;
  };

  function wheelMeshes(g) {
    const out = [];
    for (const W of g.userData.wheels || []) { const m = g.getObjectByName(W.name); if (m) out.push([m, W]); }
    return out;
  }
  API.roll = function (g, metres) {
    for (const p of wheelMeshes(g)) { p[0].rotation.x = (p[0].rotation.x + metres / p[1].r) % TAU; }
    const Bt = g.userData._belts;
    if (Bt && metres) {                       /* the bottom run stays on the ground: it runs back as the vehicle goes on */
      Bt.off = (Bt.off - metres) % (Bt.list[0].tot * 64);
      layBelts(Bt.mesh, Bt.list, Bt.off);
    }
    return g;
  };
  API.steer = function (g, rad) {
    const D = g.userData.data || {}, lim = D.maxSteer != null ? D.maxSteer : 0.6;   /* 0: skid steer (tracks), nothing turns */
    const a = Math.max(-lim, Math.min(lim, +rad || 0));
    for (const W of g.userData.wheels || []) {
      if (!W.steer) continue;
      const p = g.getObjectByName('steer_' + W.name.replace(/^wheel_/, ''));
      if (p) p.rotation.y = a * (W.steerRatio != null ? W.steerRatio : 1);   /* a second steered axle turns less, a rear one the other way */
    }
    return a;
  };
  API.lights = function (g, on) {
    const m = g.userData._metal;
    if (m) m.emissive.setRGB(on ? 1 : 0, on ? 1 : 0, on ? 1 : 0);
    g.userData.lightsOn = !!on;
    return !!on;
  };
  API.dispose = function (g) {
    disposeTree(g);
    if (g.userData._metal) g.userData._metal.dispose();
  };
  return API;
})();
