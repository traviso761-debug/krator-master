/* ======================================================================
   Krator Motor Vehicles: the runtime (kits/motor-vehicles/krator-vehicles-runtime.js)

   The API the bundle returns as the single global `KratorVehicles` (KV below).
   vehicle_bundle.py wraps the catalog core, vehicles-core.js, the culture files
   and this file in ONE closure; nothing else leaks. It needs only THREE (r128).

     KV.list()                        -> [{ key, name, culture, tags, variants, variantNames, w, d, h, data }]
     KV.build(key, { variant, seed, linear, state })  -> THREE.Group, or null for an unknown key
                                      state: 'intact' (default) | 'weathered' | 'burnt' | 'wreck' (vehicles-core.js
                                      vehicleRuin: the ruin pass below draws it on any culture's vehicle)
     KV.STATES, KV.ruinOf(state, seed) the state names, and the ruin record a build in that state takes
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
   data, tris, lightsOn, state, ruin }. A wheel's hub is at y = r + lift (lift: a road wheel riding a track belt); a steered
   wheel turns by steer() x steerRatio (default 1).

   RUIN STATES (2026-11-08, for the Ancient's Valley's streets). build(key, { state: 'burnt' }) builds the same
   vehicle (same seed, same variant, the body's own draws unchanged) and then runs the ruin pass over the merged
   buckets before the meshes are made, so a ruined vehicle costs the same draw calls (fewer triangles: the glass,
   a wheel, fallen trim):
     recolour      per triangle, a value noise on the body's own position (seeded by the ruin seed; an integer
                   hash, no Math.sin) decides which triangles are rust: their detail slot becomes rustHeavy (or rust)
                   and their colour the rust's; bronze, brass and gilt turn verdigris; everything else takes grime,
                   then soot by the state's share, heavier toward the top (fire rises); lenses go dark
     glass         source meshes whose palette key names glass (/glass/i) or whose family is 'glass' are left out
     tyres         'flat': the rubber-family vertices below the hub are squashed and bulged, the hub drops with
                   them; 'gone': the rubber is left out and the wheel stands on its rim. The record's y says where
                   the hub is; r stays the design radius (roll() still turns by metres / r)
     sag           (burnt, wreck) the upper body caves: y pulled down, x pulled in, by a 0.5 m noise
     sprung        small source meshes (trim, lamps, cans, rails) are knocked askew by a small rigid turn and
                   shift; in a wreck some fall off
     form          (wreck, VEHICLE_WRECK_FORMS) 'crushed': the body above a third of its height is pressed down and
                   sheared; 'overturned': the whole vehicle rolled onto its roof, askew; 'torn': the body cut across
                   (the triangles at the cut dropped), the halves pulled apart and yawed, each wheel following its
                   half; 'crashed': the nose (or the tail) crumpled to half its length, buckling up and sideways, the
                   vehicle pitched onto it; 'tboned': one flank caved in by a quarter of the width round the blow, the
                   roof lifting over it; 'exploded': holes blown through the upper body, the rest bulging outward,
                   nearly every trim piece flung, burnt out; 'onside': lying on one flank. An airframe
                   (VEHICLE_AIR_FORMS, its gear gone) lies on the ground instead: 'skidded' (the nose crumpled, flat
                   on its belly, the build's furrow and trail behind it), 'nosedived' (pitched into the ground about
                   its nose, what is under the ground cut away, the tail in the air), 'broken' (torn in two, holed,
                   both halves belly down), 'piled' (the nose crumpled to a quarter into the build's heap), 'gutted'
                   (holed, charred; the build draws the burnt heap) and 'overturned'
     missing       (wreck) one wheel is not built (userData.ruin.missingWheel names it; it is not in userData.wheels)
     tilt          a small roll about z (the suspension gone), then the whole thing grounded: lowest point y = 0
   Normals follow: a non-rigid deformation rotates each triangle's three normals by the turn its face normal made
   (smooth stays smooth, flat stays flat); a rigid transform rotates them exactly. Ruined materials are double-sided
   (the insides show through the empty windows). Wheels keep their names and spin, but after a tilt or an overturn
   the spin axis is no longer the axle: a ruin is a prop, not a driver.

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
  /* shared looks: the painted body and the wheels need no per-instance state; kept per mode (detail maps on or
     off: vehicles-detail.js, every material takes the atlas hook) and per side (a ruined body is double-sided:
     the insides show through the empty windows) */
  const _shared = {};
  const det = function (m, on) { return on ? VEHICLE_DETAIL.hook(m) : m; };
  function sharedMat(kind, on, two) {
    const k = kind + (on ? 'D' : '') + (two ? '2' : '');
    if (_shared[k]) return _shared[k];
    const o = kind === 'wheel' ? { vertexColors: true, roughness: 0.9, metalness: 0.08 } : { vertexColors: true, roughness: 0.82, metalness: 0.05 };
    if (two) o.side = THREE.DoubleSide;
    return (_shared[k] = det(new THREE.MeshStandardMaterial(o), on));
  }
  function matteMat(on, two) { return sharedMat('matte', on, two); }
  function wheelMat(on, two) { return sharedMat('wheel', on, two); }
  function metalMat(on, two) {
    const o = { vertexColors: true, roughness: 0.48, metalness: 0.55, emissive: new THREE.Color(0, 0, 0), emissiveMap: lampTex(), emissiveIntensity: 1.6 };
    if (two) o.side = THREE.DoubleSide;
    return det(new THREE.MeshStandardMaterial(o), on);
  }

  /* merge every mesh under g (world matrices; g at the identity) into buckets keyed by sel(family). Each bucket
     also keeps, per vertex, the index of its source mesh (src) and the list of those meshes (meshes: palette key,
     family, centre, size), which the ruin pass reads; a ruin leaves out the glass and, with the tyres gone, the rubber */
  const GLASS_RE = /glass/i, TYRE_RE = /^(rubber|tyre|tire)$/i;
  function merge(g, sel, linear, culture, ruin) {
    const B = {}, box = new THREE.Box3();
    g.updateMatrixWorld(true);
    g.traverse(function (o) {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
      const geo = o.geometry, pos = geo.attributes.position, nor = geo.attributes.normal, idx = geo.index;
      const fam = (o.material.userData && o.material.userData.family) || '', c = o.material.color, hex = c.getHex();
      const key = VEHICLE_DETAIL.keyOf(culture, hex) || '';
      if (ruin) {
        if (!ruin.glass && (fam === 'glass' || GLASS_RE.test(key))) return;
        if (ruin.tyres === 'gone' && (fam === 'rubber' || TYRE_RE.test(key))) return;
      }
      const k = sel(fam), b = B[k] || (B[k] = { pos: [], nor: [], col: [], uv: [], det: [], src: [], meshes: [] });
      const ds = VEHICLE_DETAIL.resolve(culture, fam, hex);          /* the detail slot, -1 none */
      const cr = linear ? lin(c.r) : c.r, cg = linear ? lin(c.g) : c.g, cb = linear ? lin(c.b) : c.b;
      const tex = VEHICLE_LAMP_FAMILIES[fam] || 0, u = (tex + 0.5) / NTEX;
      _m.copy(o.matrixWorld); _n.getNormalMatrix(_m);
      if (!geo.boundingBox) geo.computeBoundingBox();
      box.copy(geo.boundingBox).applyMatrix4(_m);
      const si = b.meshes.length;
      b.meshes.push({ key: key, fam: fam, lamp: tex > 0, tyre: fam === 'rubber' || TYRE_RE.test(key),
        cx: (box.min.x + box.max.x) / 2, cy: (box.min.y + box.max.y) / 2, cz: (box.min.z + box.max.z) / 2,
        size: Math.max(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z) });
      const n = idx ? idx.count : pos.count;
      for (let i = 0; i < n; i++) {
        const j = idx ? idx.getX(i) : i;
        _v.fromBufferAttribute(pos, j).applyMatrix4(_m);
        b.pos.push(_v.x, _v.y, _v.z);
        if (nor) { _w.fromBufferAttribute(nor, j).applyMatrix3(_n).normalize(); b.nor.push(_w.x, _w.y, _w.z); } else b.nor.push(0, 1, 0);
        b.col.push(cr, cg, cb);
        b.uv.push(u, 0.5);
        b.det.push(ds);
        b.src.push(si);
      }
    });
    return B;
  }

  /* ---------------------------------------------------------------- the ruin pass (see the header)
     A deterministic value noise on position, from an integer hash (no Math.sin): the same vehicle at the same
     seed rusts in the same places on every machine. */
  function hash3(ix, iy, iz, s) {
    let h = (Math.imul(ix, 73856093) ^ Math.imul(iy, 19349663) ^ Math.imul(iz, 83492791) ^ Math.imul(s, 2654435761)) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function vnoise(x, y, z, s) {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z), fx = x - ix, fy = y - iy, fz = z - iz;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), sz = fz * fz * (3 - 2 * fz);
    const L = function (a, b, t) { return a + (b - a) * t; };
    return L(L(L(hash3(ix, iy, iz, s), hash3(ix + 1, iy, iz, s), sx), L(hash3(ix, iy + 1, iz, s), hash3(ix + 1, iy + 1, iz, s), sx), sy),
      L(L(hash3(ix, iy, iz + 1, s), hash3(ix + 1, iy, iz + 1, s), sx), L(hash3(ix, iy + 1, iz + 1, s), hash3(ix + 1, iy + 1, iz + 1, s), sx), sy), sz);
  }
  /* the ruin's own colours (sRGB), converted to the bucket's space */
  const RUIN_COL = { rust: 0x6e3a1e, rustLight: 0x9a5a30, rustDark: 0x4a2614, verdigris: 0x4f7a6a, soot: 0x121010, grime: 0x5a5248, lens: 0x3a3634 };
  function rc(hex, linear) {
    const r = (hex >> 16 & 255) / 255, g = (hex >> 8 & 255) / 255, b = (hex & 255) / 255;
    return linear ? [lin(r), lin(g), lin(b)] : [r, g, b];
  }
  /* slots that rust over (paint and plate) and slots that go green (the copper alloys); the rest (canvas, tarp,
     wood, rubber, solar, concrete) only take grime and soot */
  const RUSTS = { paint: 1, paintWorn: 1, paintFlake: 1, whitePaint: 1, ancientWhite: 1, bluePlate: 1, plate: 1, foil: 1, metal: 1, corrugated: 1, rust: 1, rustB: 1, rustC: 1 };
  const GREENS = { brass: 1, gilt: 1, bronze: 1, verdigris: 1 };
  const _qa = new THREE.Vector3(), _qb = new THREE.Vector3(), _qc = new THREE.Vector3(), _q0 = new THREE.Vector3(), _q1 = new THREE.Vector3(), _qq = new THREE.Quaternion();
  function flatNormal(P, i, out) {
    _qa.set(P[i], P[i + 1], P[i + 2]); _qb.set(P[i + 3], P[i + 4], P[i + 5]); _qc.set(P[i + 6], P[i + 7], P[i + 8]);
    _qb.sub(_qa); _qc.sub(_qa); out.crossVectors(_qb, _qc);
    const l = out.length();
    if (l < 1e-12) return false;
    out.multiplyScalar(1 / l);
    return true;
  }
  /* after a non-rigid deformation of b.pos (old positions in P0): turn each triangle's three normals by the turn
     its face normal made, so smooth shading stays smooth and flat stays flat */
  function fixNormals(b, P0) {
    const P = b.pos, N = b.nor;
    for (let i = 0; i < P.length; i += 9) {
      if (!flatNormal(P0, i, _q0) || !flatNormal(P, i, _q1)) continue;
      if (_q0.dot(_q1) > 0.99999) continue;
      _qq.setFromUnitVectors(_q0, _q1);
      for (let k = 0; k < 3; k++) {
        _w.set(N[i + k * 3], N[i + k * 3 + 1], N[i + k * 3 + 2]).applyQuaternion(_qq);
        N[i + k * 3] = _w.x; N[i + k * 3 + 1] = _w.y; N[i + k * 3 + 2] = _w.z;
      }
    }
  }
  /* drop the triangles whose keep(i) is false (i the first vertex index of the triangle), compacting every array */
  function dropTris(b, keep) {
    const out = { pos: [], nor: [], col: [], uv: [], det: [], src: [], meshes: b.meshes };
    for (let i = 0; i < b.pos.length / 3; i += 3) {
      if (!keep(i)) continue;
      for (let k = i; k < i + 3; k++) {
        out.pos.push(b.pos[k * 3], b.pos[k * 3 + 1], b.pos[k * 3 + 2]); out.nor.push(b.nor[k * 3], b.nor[k * 3 + 1], b.nor[k * 3 + 2]);
        out.col.push(b.col[k * 3], b.col[k * 3 + 1], b.col[k * 3 + 2]); out.uv.push(b.uv[k * 2], b.uv[k * 2 + 1]);
        out.det.push(b.det[k]); out.src.push(b.src[k]);
      }
    }
    return out;
  }
  /* the recolour and the detail-slot swap over one bucket (body or wheel); h the vehicle's height for the soot */
  function ruinColour(b, R, linear, h, wheel) {
    const P = b.pos, C = b.col, D = b.det, s = (R.seed * 7 + 3) | 0;
    const rustS = VEHICLE_DETAIL.slot('rustHeavy', 'rust'), greenS = VEHICLE_DETAIL.slot('verdigris', 'rust'), names = VEHICLE_DETAIL.names();
    /* charred surfaces: the (owed) scorched set, else `char` (the library's charred bark, a low-contrast grey detail:
       blistered black with pale cracks; a high-contrast map's gain would lift a near-black colour into a dusty grey) */
    const charS = VEHICLE_DETAIL.slot('scorched', 'char');
    const burnt = R.state === 'burnt';
    const rust = rc(RUIN_COL.rust, linear), rustL = rc(RUIN_COL.rustLight, linear), rustD = rc(RUIN_COL.rustDark, linear);
    const green = rc(RUIN_COL.verdigris, linear), soot = rc(RUIN_COL.soot, linear), grime = rc(RUIN_COL.grime, linear), lens = rc(RUIN_COL.lens, linear);
    const mix = function (i, t, k) { C[i] += (t[0] - C[i]) * k; C[i + 1] += (t[1] - C[i + 1]) * k; C[i + 2] += (t[2] - C[i + 2]) * k; };
    for (let i = 0; i < P.length / 3; i += 3) {
      const m = b.meshes[b.src[i]];
      const cx = (P[i * 3] + P[i * 3 + 3] + P[i * 3 + 6]) / 3, cy = (P[i * 3 + 1] + P[i * 3 + 4] + P[i * 3 + 7]) / 3, cz = (P[i * 3 + 2] + P[i * 3 + 5] + P[i * 3 + 8]) / 3;
      if (m.lamp) { for (let k = 0; k < 3; k++) mix((i + k) * 3, lens, 0.85); continue; }
      const n1 = vnoise(cx * 3.0, cy * 2.4, cz * 3.0, s), n2 = vnoise(cx * 8 + 11, cy * 8, cz * 8, s + 1), n = n1 * 0.6 + n2 * 0.4;
      const slot = D[i], name = slot >= 0 ? names[slot] : '', glassy = /glass|shard|lens/i.test(m.key);   /* broken glass left in a frame stays glass */
      const isRust = !glassy && (name === '' ? !m.tyre : !!RUSTS[name]), isGreen = !glassy && !!GREENS[name];
      /* the rust's edge is soft: a band of 0.14 in the noise from paint to rust; the slot swaps at its middle */
      const kr = R.rust > 0 ? Math.max(0, Math.min(1, (R.rust + 0.05 - n) / 0.14)) : 0;
      if (kr > 0 && (isRust || isGreen)) {
        const target = isGreen ? green : n2 < 0.35 ? rustD : n2 > 0.7 ? rustL : rust, ns = isGreen ? greenS : rustS;
        for (let k = 0; k < 3; k++) { mix((i + k) * 3, target, (isGreen ? 0.75 : 0.9) * kr); if (ns >= 0 && kr > 0.5) D[i + k] = ns; }
      } else if (R.grime > 0) {
        for (let k = 0; k < 3; k++) mix((i + k) * 3, grime, R.grime * 0.45 * (0.6 + 0.4 * n2));
      }
      if (R.soot > 0) {
        /* soot rises: heavier toward the top; a burnt-out body is charred black nearly all over */
        const up = wheel ? 0.4 : Math.max(0, Math.min(1, cy / Math.max(0.5, h)));
        /* a burnt-out body is charcoal: 90 to 99 % of the way to soot (a quarter of white is still a mid grey
           on screen), a little less at the sill, where the rust shows through */
        const charred = burnt || R.form === 'exploded' || R.form === 'gutted';
        const k = charred ? 0.9 + 0.06 * up + 0.03 * n2 : R.soot * (0.5 + 0.45 * up) * (0.75 + 0.25 * n2);
        for (let q = 0; q < 3; q++) mix((i + q) * 3, soot, Math.min(0.99, k));
        if (k > 0.6 && !glassy && !m.tyre) for (let q = 0; q < 3; q++) D[i + q] = charS;
      }
    }
  }
  /* small rigid turns and shifts of the small source meshes (trim), some dropped in a wreck */
  function ruinSprung(b, R, big) {
    const P = b.pos, s = (R.seed * 13 + 5) | 0, M = b.meshes, T = [];
    let dropped = false;
    for (let j = 0; j < M.length; j++) {
      const m = M[j], r = hash3(j, 17, 3, s);
      if (m.size > big || m.size < 0.01 || r > R.sprung) { T.push(null); continue; }
      const r2 = hash3(j, 29, 7, s), r3 = hash3(j, 31, 11, s), r4 = hash3(j, 37, 13, s);
      if (R.form && r2 < 0.18) { T.push('drop'); dropped = true; continue; }
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((r2 - 0.5) * 0.5 * R.sprung, (r3 - 0.5) * 0.5 * R.sprung, (r4 - 0.5) * 0.5 * R.sprung));
      T.push({ q: q, dx: (r3 - 0.5) * 0.12 * R.sprung, dy: -r4 * 0.08 * R.sprung, dz: (r2 - 0.5) * 0.12 * R.sprung, m: m });
    }
    for (let i = 0; i < P.length / 3; i++) {
      const t = T[b.src[i]];
      if (!t || t === 'drop') continue;
      _v.set(P[i * 3] - t.m.cx, P[i * 3 + 1] - t.m.cy, P[i * 3 + 2] - t.m.cz).applyQuaternion(t.q);
      P[i * 3] = _v.x + t.m.cx + t.dx; P[i * 3 + 1] = _v.y + t.m.cy + t.dy; P[i * 3 + 2] = _v.z + t.m.cz + t.dz;
      _w.set(b.nor[i * 3], b.nor[i * 3 + 1], b.nor[i * 3 + 2]).applyQuaternion(t.q);
      b.nor[i * 3] = _w.x; b.nor[i * 3 + 1] = _w.y; b.nor[i * 3 + 2] = _w.z;
    }
    return dropped ? dropTris(b, function (i) { return T[b.src[i]] !== 'drop'; }) : b;
  }
  /* the sag (roof and panels caving), the crush (the upper body pressed down and sheared), the crash (the nose or
     the tail crumpled to half its length, buckling), the t-bone (one flank caved in, the roof lifting over it) and
     the blast (the body bulging outward) */
  function ruinDeform(b, R, A) {
    const P = b.pos, h = A.h, w = A.w, d = A.d, s = (R.seed * 3 + 1) | 0, P0 = P.slice(), form = R.form;
    const y0 = form === 'crushed' ? h * 0.3 : h * 0.45, k = form === 'crushed' ? 0.22 + 0.3 * R.sag : 0.22 * R.sag;
    const shear = form === 'crushed' ? (hash3(1, 2, 3, s) - 0.5) * 0.5 : 0;
    const L = 0.3 * d, zc = R.end * (d / 2 - L), zi = -d / 2 + d * R.cut;
    for (let i = 0; i < P.length / 3; i++) {
      let x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
      if (y > y0 && k > 0) {
        const t = (y - y0) / Math.max(0.2, h - y0), n = vnoise(x * 2 + 5, 0, z * 2, s);
        y -= k * t * (0.55 + 0.45 * n) * h;
        x = x * (1 - 0.12 * R.sag * t) + shear * (P[i * 3 + 1] - y0);
        if (form === 'crushed') z += (n - 0.5) * 0.1 * t;
      }
      if (form === 'crashed' || form === 'skidded' || form === 'piled' || form === 'nosedived') {
        const f = R.end * (z - zc) / L, keep = form === 'piled' ? 0.25 : form === 'nosedived' ? 0.7 : 0.45;
        if (f > 0) {
          const n = vnoise(x * 4, y * 4, z * 4 + 3, s), n2 = vnoise(x * 3 + 9, y * 3, z * 3, s + 2);
          z = zc + (z - zc) * keep;
          x += (n - 0.5) * 0.3 * f * w * 0.5;
          y += Math.abs(n2 - 0.5) * 0.25 * f * h + 0.06 * f * f * h;
        }
      } else if (form === 'tboned') {
        const dz = (z - zi) / (0.28 * d), f = Math.max(0, 1 - dz * dz), g = Math.max(0, Math.min(1, 0.5 + 0.5 * R.side * x / (w / 2)));
        const push = f * g * 0.28 * w;
        x -= R.side * push;
        y += 0.3 * push * Math.max(0, y / h);
      } else if (form === 'exploded') {
        const t = Math.max(0, Math.min(1, y / h)), n = vnoise(x * 2 + 1, y * 2, z * 2 + 4, s + 5);
        x *= 1 + 0.15 * t + 0.05 * (n - 0.5);
        z *= 1 + 0.07 * t;
        y += (n - 0.5) * 0.12 * t * h;
      }
      P[i * 3] = x; P[i * 3 + 1] = y; P[i * 3 + 2] = z;
    }
    fixNormals(b, P0);
  }
  /* an exploded wreck: holes blown through the upper body (the triangles dropped, ragged); `thr` sets how much
     goes (0.47 an explosion, 0.56 a broken airframe's holes) */
  function ruinBlow(b, R, A, thr) {
    const P = b.pos, h = A.h, hw = A.w / 2, s = (R.seed * 17 + 4) | 0;
    return dropTris(b, function (i) {
      const cx = (P[i * 3] + P[i * 3 + 3] + P[i * 3 + 6]) / 3, cy = (P[i * 3 + 1] + P[i * 3 + 4] + P[i * 3 + 7]) / 3, cz = (P[i * 3 + 2] + P[i * 3 + 5] + P[i * 3 + 8]) / 3;
      if (cy < 0.42 * h || Math.abs(cx) > 0.92 * hw) return true;
      return vnoise(cx * 1.6 + 2, cy * 1.6, cz * 1.6, s) < thr;
    });
  }
  /* a nosedived airframe: what went under the ground is cut away (the triangles dropped) and the rest clamped to it */
  function ruinBury(b) {
    const P = b.pos;
    const out = dropTris(b, function (i) { return (P[i * 3 + 1] + P[i * 3 + 4] + P[i * 3 + 7]) / 3 >= 0; });
    const Q = out.pos;
    for (let i = 1; i < Q.length; i += 3) if (Q[i] < 0) Q[i] = 0;
    return out;
  }
  /* a torn wreck: the triangles at the cut dropped; returns the cut's z and the two halves' transforms */
  function ruinTear(b, R, A) {
    const zc = -A.d / 2 + A.d * R.cut, s = (R.seed * 5 + 9) | 0;
    const P = b.pos;
    return dropTris(b, function (i) {
      const cz = (P[i * 3 + 2] + P[i * 3 + 5] + P[i * 3 + 8]) / 3, cy = (P[i * 3 + 1] + P[i * 3 + 4] + P[i * 3 + 7]) / 3;
      const w = 0.1 + 0.25 * vnoise(P[i * 3] * 3, cy * 3, 7, s);
      return Math.abs(cz - zc) > w;
    });
  }
  /* the rigid transforms of a ruin: [{ test(z), m: Matrix4 }] (one, or two for a torn wreck), from the record */
  function ruinRigid(R, A) {
    const s = (R.seed * 11 + 2) | 0, out = [];
    const mk = function (roll, pitch, yaw, dx, dy, dz) {
      const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(pitch, yaw, roll, 'ZXY'));
      m.setPosition(dx, dy, dz);
      return m;
    };
    if (R.form === 'overturned') {
      out.push({ test: function () { return true; }, m: mk(Math.PI + (hash3(1, 1, 1, s) - 0.5) * 0.5, (hash3(2, 2, 2, s) - 0.5) * 0.2, 0, 0, A.h, 0) });
    } else if (R.form === 'onside') {
      /* rolled onto a flank about the ground line, then slid back so the body lies over its own footprint */
      out.push({ test: function () { return true; }, m: mk(R.side * (Math.PI / 2 + (hash3(1, 1, 1, s) - 0.5) * 0.3), (hash3(2, 2, 2, s) - 0.5) * 0.12, 0, R.side * A.h * 0.5, A.w / 2, 0) });
    } else if (R.form === 'crashed') {
      out.push({ test: function () { return true; }, m: mk(R.tilt * 0.5, -R.end * (0.05 + 0.05 * hash3(6, 6, 6, s)), (hash3(7, 7, 7, s) - 0.5) * 0.2, 0, 0, 0) });
    } else if (R.form === 'skidded' || R.form === 'piled' || R.form === 'gutted') {
      out.push({ test: function () { return true; }, m: mk(R.tilt, 0, 0, 0, 0, 0) });   /* flat: the furrow or heap stays on the ground */
    } else if (R.form === 'nosedived') {
      /* pitched nose-down into the ground, turned about the nose point so it ends a third of its height under
         (ruinBury cuts that away), the tail in the air */
      const p = 0.5 + 0.25 * hash3(8, 8, 8, s), roll = (hash3(9, 9, 9, s) - 0.5) * 0.3, nz = A.d / 2, ny = A.h * 0.4;
      const m = mk(roll, p, 0, 0, 0, 0);
      _v.set(0, ny, nz).applyMatrix4(m);
      m.setPosition(-_v.x, -A.h * 0.35 - _v.y, nz - _v.z);
      out.push({ test: function () { return true; }, m: m });
    } else if (R.form === 'torn' || R.form === 'broken') {
      const zc = -A.d / 2 + A.d * R.cut, gap = 0.25 + 0.5 * hash3(3, 3, 3, s), yaw = (hash3(4, 4, 4, s) - 0.5) * 0.5;
      const half = function (sign) {
        const m = mk(R.tilt * sign, 0, yaw * sign * 0.5, 0, 0, 0);
        /* turn about the cut's point, then part the halves along z */
        const T = new THREE.Matrix4().makeTranslation(0, 0, -zc), Tb = new THREE.Matrix4().makeTranslation(0, 0, zc + sign * gap / 2);
        return Tb.multiply(m).multiply(T);
      };
      out.push({ test: function (z) { return z >= zc; }, m: half(1) });
      out.push({ test: function (z) { return z < zc; }, m: half(-1) });
    } else {
      const pitch = R.form === 'crushed' ? (hash3(5, 5, 5, s) - 0.5) * 0.12 : 0;
      out.push({ test: function () { return true; }, m: mk(R.tilt, pitch, 0, 0, 0, 0) });
    }
    return out;
  }
  function rigidOf(rig, z) { for (const r of rig) if (r.test(z)) return r.m; return rig[0].m; }
  function applyRigid(b, rig) {
    const P = b.pos, N = b.nor;
    for (let i = 0; i < P.length / 3; i += 3) {
      const cz = (P[i * 3 + 2] + P[i * 3 + 5] + P[i * 3 + 8]) / 3, m = rigidOf(rig, cz);
      _n.getNormalMatrix(m);
      for (let k = i; k < i + 3; k++) {
        _v.set(P[k * 3], P[k * 3 + 1], P[k * 3 + 2]).applyMatrix4(m); P[k * 3] = _v.x; P[k * 3 + 1] = _v.y; P[k * 3 + 2] = _v.z;
        _w.set(N[k * 3], N[k * 3 + 1], N[k * 3 + 2]).applyMatrix3(_n).normalize(); N[k * 3] = _w.x; N[k * 3 + 1] = _w.y; N[k * 3 + 2] = _w.z;
      }
    }
  }
  /* a flat tyre: the rubber below the hub squashed and bulged (the wheel bucket, hub at the origin, axle x) */
  function flatTyre(b, r) {
    const P = b.pos, P0 = P.slice(), y0 = -0.35 * r;
    for (let i = 0; i < P.length / 3; i++) {
      if (!b.meshes[b.src[i]].tyre) continue;
      const y = P[i * 3 + 1];
      if (y >= y0) continue;
      const t = Math.min(1, (y0 - y) / (0.65 * r));
      P[i * 3 + 1] = y0 + (y - y0) * 0.42;
      P[i * 3] *= 1 + 0.4 * t;
    }
    fixNormals(b, P0);
  }
  function minY(P) { let m = Infinity; for (let i = 1; i < P.length; i += 3) if (P[i] < m) m = P[i]; return m; }
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
  /* the ruin states (vehicles-core.js): the names, and the record a build(key, { state, seed }) takes */
  API.STATES = VEHICLE_STATES; API.WRECK_FORMS = VEHICLE_WRECK_FORMS;
  API.ruinOf = function (state, seed, key) { const A = VEHICLE_BY_KEY[key]; return vehicleRuin(state, seed, key, !!(A && A.data && A.data.airframe)); };
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
    const state = VEHICLE_STATES.indexOf(o.state) > 0 ? o.state : 'intact', R = vehicleRuin(state, seed, key, !!data.airframe), ruined = state !== 'intact';
    const F = vehicleFrame({ seed: seed, variant: v });
    F.asset = A; F.data = data; F.state = state; F.ruin = R;
    /* the body */
    const body = new THREE.Group(), prev = _target;
    _target = body;
    try { A.build(F); } finally { _target = prev; }
    const B = merge(body, function (f) { return METAL_FAMILIES[f] || VEHICLE_LAMP_FAMILIES[f] ? 'metal' : 'matte'; }, linear, A.culture, ruined ? R : null);
    disposeTree(body);
    /* the ruin pass over the body buckets: trim sprung, the body sagging or crushed, torn across, recoloured, then
       the rigid settle (tilt, overturn, the torn halves parted) */
    let rig = null;
    if (ruined) {
      for (const k of ['matte', 'metal']) {
        if (!B[k]) continue;
        B[k] = ruinSprung(B[k], R, 1.2);
        if (R.form === 'exploded' || R.form === 'gutted') B[k] = ruinBlow(B[k], R, A, 0.47);
        else if (R.form === 'broken') B[k] = ruinBlow(B[k], R, A, 0.56);
        if (R.sag > 0 || R.form) ruinDeform(B[k], R, A);
        if (R.form === 'torn' || R.form === 'broken') B[k] = ruinTear(B[k], R, A);
        ruinColour(B[k], R, linear, A.h, false);
      }
      rig = ruinRigid(R, A);
      for (const k of ['matte', 'metal']) if (B[k]) { applyRigid(B[k], rig); if (R.form === 'nosedived') B[k] = ruinBury(B[k]); }
    }
    const g = new THREE.Group();
    g.name = 'vehicle:' + key;
    let tris = 0, low = Infinity;
    const metal = metalMat(tex, ruined);
    if (B.matte && B.matte.pos.length) { g.add(meshOf(B.matte, matteMat(tex, ruined), 'body:matte', false)); tris += B.matte.pos.length / 9; low = Math.min(low, minY(B.matte.pos)); }
    if (B.metal && B.metal.pos.length) { g.add(meshOf(B.metal, metal, 'body:metal', true)); tris += B.metal.pos.length / 9; low = Math.min(low, minY(B.metal.pos)); }
    let belts = null;
    if (F.belts.length) {
      belts = beltMesh(F.belts, A.culture, linear, metal, matteMat(tex, ruined));
      if (ruined) {                              /* the belts settle with the hull and rust; they no longer run (roll() leaves them) */
        const P = belts.geometry.attributes.position.array, N = belts.geometry.attributes.normal.array, C = belts.geometry.attributes.color.array;
        const rust = rc(RUIN_COL.rustDark, linear);
        for (let i = 0; i < P.length; i += 3) {
          _v.set(P[i], P[i + 1], P[i + 2]).applyMatrix4(rigidOf(rig, P[i + 2])); P[i] = _v.x; P[i + 1] = _v.y; P[i + 2] = _v.z;
          _n.getNormalMatrix(rigidOf(rig, P[i + 2])); _w.set(N[i], N[i + 1], N[i + 2]).applyMatrix3(_n).normalize(); N[i] = _w.x; N[i + 1] = _w.y; N[i + 2] = _w.z;
          for (let q = 0; q < 3; q++) C[i + q] += (rust[q] - C[i + q]) * 0.8;
        }
        belts.geometry.attributes.position.needsUpdate = true;
        low = Math.min(low, minY(P));
      }
      g.add(belts); tris += belts.geometry.attributes.position.count / 3;
    }
    /* the wheels: each one built at the origin by the entry's wheel(), merged into one mesh, hung at its hub */
    const wheels = [], hung = [];
    let missingWheel = null;
    for (let wi = 0; wi < data.wheels.length; wi++) {
      const W = data.wheels[wi];
      if (ruined && R.missing >= 0 && wi === R.missing % data.wheels.length) { missingWheel = W.name; continue; }
      if (ruined && R.gearGone) { missingWheel = 'all'; continue; }                     /* an airframe's gear torn off: it lies in the trail */
      const wg = new THREE.Group(), side = W.x >= 0 ? 1 : -1;
      _target = wg;
      try { A.wheel(F, Object.assign({ side: side }, W)); } finally { _target = prev; }
      const WB = merge(wg, function () { return 'wheel'; }, linear, A.culture, ruined ? R : null);
      disposeTree(wg);
      if (!WB.wheel || !WB.wheel.pos.length) { missingWheel = missingWheel || W.name; continue; }
      if (ruined) {
        if (R.tyres === 'flat') flatTyre(WB.wheel, W.r);
        ruinColour(WB.wheel, R, linear, A.h, true);
      }
      const hubY = ruined ? -minY(WB.wheel.pos) + (W.lift || 0) : W.r + (W.lift || 0);
      const wm = meshOf(WB.wheel, wheelMat(tex, ruined), W.name, false);
      tris += WB.wheel.pos.length / 9;
      const hub = new THREE.Vector3(W.x, hubY, W.z), holder = W.steer ? new THREE.Group() : wm;
      if (W.steer) { holder.name = 'steer_' + W.name.replace(/^wheel_/, ''); holder.add(wm); }
      if (ruined) {
        const m = rigidOf(rig, W.z);
        hub.applyMatrix4(m);
        holder.quaternion.setFromRotationMatrix(m);
        /* the wheel's lowest point under its turn, for the grounding */
        const P = WB.wheel.pos;
        for (let i = 0; i < P.length; i += 3) { _v.set(P[i], P[i + 1], P[i + 2]).applyQuaternion(holder.quaternion); low = Math.min(low, _v.y + hub.y); }
      }
      holder.position.copy(hub); g.add(holder);
      const rec = { name: W.name, r: W.r, x: hub.x, y: hub.y, z: hub.z, front: !!W.front, steer: !!W.steer, drive: !!W.drive };
      if (W.lift) rec.lift = W.lift;                       /* a road wheel on a track: it rides the belt, t above the ground */
      if (W.steer && W.steerRatio != null) rec.steerRatio = W.steerRatio;
      if (ruined && R.tyres !== 'ok') rec.tyre = R.tyres;
      wheels.push(rec); hung.push(holder);
    }
    /* the lamps follow the body's turn; then the whole ruin is grounded: its lowest point on y = 0 */
    let lamps = F.lamps.slice();
    if (ruined) {
      lamps = lamps.map(function (L) {
        const m = rigidOf(rig, L.z);
        _v.set(L.x, L.y, L.z).applyMatrix4(m); _n.getNormalMatrix(m); _w.set(L.dx, L.dy, L.dz).applyMatrix3(_n).normalize();
        return { x: _v.x, y: _v.y, z: _v.z, dx: _w.x, dy: _w.y, dz: _w.z, kind: L.kind };
      });
      const dy = isFinite(low) ? -low : 0;
      if (Math.abs(dy) > 1e-9) {
        for (const o2 of g.children) {
          if (o2.name === 'body:matte' || o2.name === 'body:metal' || o2.name === 'belts') {
            const P = o2.geometry.attributes.position.array;
            for (let i = 1; i < P.length; i += 3) P[i] += dy;
            o2.geometry.attributes.position.needsUpdate = true; o2.geometry.computeBoundingSphere();
          } else o2.position.y += dy;
        }
        for (const rec of wheels) rec.y += dy;
        for (const L of lamps) L.y += dy;
      }
    }
    g.userData = { key: key, name: A.name, culture: A.culture, tags: JSON.parse(JSON.stringify(A.tags || {})), kind: 'vehicle',
      variant: v, variantName: A.variantNames[v] || '', seed: seed, wheels: wheels, lamps: lamps, data: data,
      tris: Math.round(tris), lightsOn: false, w: A.w, d: A.d, h: A.h, textured: tex, state: state,
      ruin: Object.assign({}, R, { missingWheel: missingWheel }) };
    Object.defineProperty(g.userData, '_metal', { value: metal, enumerable: false });   /* not cloned with userData */
    if (belts && !ruined) Object.defineProperty(g.userData, '_belts', { value: { mesh: belts, list: F.belts, off: 0 }, enumerable: false, writable: true });
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
    if (g.userData.ruin && !g.userData.ruin.lamps) on = false;        /* a ruin's lamps are dead */
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
