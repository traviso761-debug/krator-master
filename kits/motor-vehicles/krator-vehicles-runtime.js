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
   tracked vehicle's road wheels. group.userData = { key, name, culture, tags, kind:'vehicle', variant, seed,
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
  function matteMat() { return _matte || (_matte = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0.05 })); }
  function wheelMat() { return _wheel || (_wheel = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0.08 })); }
  function metalMat() {
    return new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.48, metalness: 0.55,
      emissive: new THREE.Color(0, 0, 0), emissiveMap: lampTex(), emissiveIntensity: 1.6 });
  }

  /* merge every mesh under g (world matrices; g at the identity) into buckets keyed by sel(family) */
  function merge(g, sel, linear) {
    const B = {};
    g.updateMatrixWorld(true);
    g.traverse(function (o) {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
      const geo = o.geometry, pos = geo.attributes.position, nor = geo.attributes.normal, idx = geo.index;
      const fam = (o.material.userData && o.material.userData.family) || '', c = o.material.color;
      const k = sel(fam), b = B[k] || (B[k] = { pos: [], nor: [], col: [], uv: [] });
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
    geo.computeBoundingSphere();
    const m = new THREE.Mesh(geo, material);
    m.name = name; m.castShadow = true; m.receiveShadow = true;
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
  API.setDetail = function (k) { _LOD = Math.max(0.25, Math.min(1, +k || 1)); return _LOD; };

  API.build = function (key, o) {
    o = o || {};
    const A = VEHICLE_BY_KEY[key];
    if (!A) { console.error('KratorVehicles: no such vehicle', key); return null; }
    const v = Math.max(0, Math.min(A.variants - 1, (o.variant | 0))), seed = o.seed || 1, linear = o.linear !== false;
    const data = vehicleData(A, v);
    const F = vehicleFrame({ seed: seed, variant: v });
    F.asset = A; F.data = data;
    /* the body */
    const body = new THREE.Group(), prev = _target;
    _target = body;
    try { A.build(F); } finally { _target = prev; }
    const B = merge(body, function (f) { return METAL_FAMILIES[f] || VEHICLE_LAMP_FAMILIES[f] ? 'metal' : 'matte'; }, linear);
    disposeTree(body);
    const g = new THREE.Group();
    g.name = 'vehicle:' + key;
    let tris = 0;
    const metal = metalMat();
    if (B.matte) { g.add(meshOf(B.matte, matteMat(), 'body:matte', false)); tris += B.matte.pos.length / 9; }
    if (B.metal) { g.add(meshOf(B.metal, metal, 'body:metal', true)); tris += B.metal.pos.length / 9; }
    /* the wheels: each one built at the origin by the entry's wheel(), merged into one mesh, hung at its hub */
    const wheels = [];
    for (const W of data.wheels) {
      const wg = new THREE.Group(), side = W.x >= 0 ? 1 : -1, hubY = W.r + (W.lift || 0);
      _target = wg;
      try { A.wheel(F, Object.assign({ side: side }, W)); } finally { _target = prev; }
      const WB = merge(wg, function () { return 'wheel'; }, linear);
      disposeTree(wg);
      const wm = meshOf(WB.wheel, wheelMat(), W.name, false);
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
      tris: Math.round(tris), lightsOn: false, w: A.w, d: A.d, h: A.h };
    Object.defineProperty(g.userData, '_metal', { value: metal, enumerable: false });   /* not cloned with userData */
    return g;
  };

  function wheelMeshes(g) {
    const out = [];
    for (const W of g.userData.wheels || []) { const m = g.getObjectByName(W.name); if (m) out.push([m, W]); }
    return out;
  }
  API.roll = function (g, metres) {
    for (const p of wheelMeshes(g)) { p[0].rotation.x = (p[0].rotation.x + metres / p[1].r) % TAU; }
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
