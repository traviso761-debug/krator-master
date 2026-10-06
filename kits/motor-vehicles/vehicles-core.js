/* ======================================================================
   Krator Motor Vehicles: the kit core (kits/motor-vehicles/vehicles-core.js)

   A VEHICLE({...}) registry on top of the master catalog's engine-neutral core
   (kits/catalog/krator-furniture-core.js: makeFrame(), F.box/cyl/cone/dome/blob/
   ball/beam/rod/frustum, F.col over FPAL, mat(), _target). vehicle_bundle.py
   wraps that core, this file, the culture files (krator-vehicles-<culture>.js)
   and krator-vehicles-runtime.js in ONE closure exposing only `KratorVehicles`,
   so every name here (VEHICLE, VEHICLES, vehicleFrame ...) stays private.

   Why a registry of its own, not the catalog's ASSET: an ASSET is a building
   (its cultures are checked against ASSET_CULTURES, it has districts and
   building types) and is drawn as one static group. A vehicle has MOVING PARTS
   (wheels a host spins and steers, lamps it switches) and SIMULATION DATA (top
   speed, seats, cargo, fuel, wheel layout) that a host reads without drawing
   anything. So: the catalog's frame and primitives for the body, this registry
   for the entry, and the runtime for assembly (body merged per material, each
   wheel its own named child).

   The entry (data first; only build and wheel draw):
     VEHICLE({
       key, name, culture,                 culture: a key of VEHICLE_CULTURES (register with VEHICLE_CULTURE)
       tags: { class:'motor vehicle', type:[...], drive, seats, fuel, terrain:[...] },
       variants, variantNames: [...],
       w, d, h,                            overall box in metres (x across, z along, y up), aerials included
       data: { speed, accel, turnRadius, maxSteer, seats, cargo, mass, fuel, tank, range,
               wheelbase, track, clearance, cageH, drive,
               wheels: [{ name, x, z, r, w, front, steer, drive }] },     (data, not code: a sim reads it)
       variantData: [ {overrides}, ... ],  per variant, merged over data
       lamps: (built, see F.lamp below)
       build(F)                            the body, in the vehicle frame
       wheel(F, W)                         ONE wheel at the origin, axle along x, W = the wheel record + side (+1/-1)
     })
   The vehicle frame: origin at the footprint centre on the ground, +z FORWARD
   (the front), y up, +x the driver's left (three.js yaw: rotation.y > 0 turns +z
   toward +x). Wheels touch y = 0; a wheel's hub is at (W.x, W.r, W.z).
   ====================================================================== */

/* the classes and vocabularies a vehicle's tags are checked against (verify.py --assert) */
const VEHICLE_CLASSES = ['motor vehicle'];
const VEHICLE_TYPES = ['vehicle', 'transport', 'cargo', 'utility', 'patrol', 'survey'];
const VEHICLE_DRIVES = ['wheeled', 'tracked', 'half-track'];
const VEHICLE_FUELS = ['refined oil', 'crude oil', 'battery', 'wood gas', 'alcohol'];
const VEHICLE_TERRAIN = ['sand', 'salt flat', 'track', 'road', 'mud', 'rock', 'snow'];

/* a culture: its palette goes into the catalog core's FPAL (inside this closure only),
   so F.col('paint') resolves against the vehicle's own culture as furniture does */
const VEHICLE_CULTURES = {};
function VEHICLE_CULTURE(key, info) {
  VEHICLE_CULTURES[key] = { name: info.name || key, lore: info.lore || '', sign: info.sign || '' };
  FPAL[key] = Object.assign(FPAL[key] || {}, info.palette || {});
}

const VEHICLES = [], VEHICLE_BY_KEY = {};
function VEHICLE(o) {
  if (VEHICLE_BY_KEY[o.key]) { console.error('duplicate vehicle key', o.key); return; }
  if (!VEHICLE_CULTURES[o.culture]) { console.error('vehicle ' + o.key + ': unregistered culture ' + o.culture); return; }
  o.variants = o.variants || 1;
  o.variantNames = o.variantNames || [];
  o.variantData = o.variantData || [];
  o.data = o.data || {};
  VEHICLES.push(o); VEHICLE_BY_KEY[o.key] = o;
}
/* the data of one variant: the entry's data with that variant's overrides merged on top (wheels copied) */
function vehicleData(A, v) {
  const d = Object.assign({}, A.data, A.variantData[v || 0] || {});
  d.wheels = (d.wheels || []).map(function (w) { return Object.assign({}, w); });
  return d;
}

/* ---------------------------------------------------------------- the vehicle frame
   makeFrame() at the origin plus the helpers a vehicle needs that the furniture frame
   lacks: discs and rings on any axis, bent tube, a triangle (a pennant), a lamp lens
   (recorded as data), and a wheel built into the body (the spare). Everything goes,
   like every catalog primitive, into the core's _target. */
const _vUp = new THREE.Vector3(0, 1, 0), _vDir = new THREE.Vector3();
function _orient(m, ax, ay, az) {
  _vDir.set(ax, ay, az);
  if (_vDir.lengthSq() < 1e-12) _vDir.set(0, 1, 0);
  m.quaternion.setFromUnitVectors(_vUp, _vDir.normalize());
}
/* lamp families: the runtime gives each its own texel of the emissive map (krator-vehicles-runtime.js) */
const VEHICLE_LAMP_FAMILIES = { lamp: 1, lampTail: 2, lampAmber: 3, lampBlue: 4 };
function vehicleFrame(opt) {
  const F = makeFrame(0, 0, 0, opt);
  F.lamps = [];
  /* the vehicle frame always sits at the origin, unturned (the host moves the finished group), so local = world here.
     F.rod is replaced by a leaner one: a vehicle is mostly tube, and the catalog's 8-sided rods would spend half the
     triangle budget on it. Sides by radius: under 2 cm 4, under 6 cm 6, else 8; end caps only from 3.5 cm up (a thin
     tube's ends are buried in the joint it meets, and the caps would be a third of its triangles). */
  F.rod = function (ax, ay, az, bx, by, bz, r, color, family) {
    const dx = bx - ax, dy = by - ay, dz = bz - az, len = Math.max(Math.hypot(dx, dy, dz), 0.01);
    const n = r < 0.02 ? 4 : r < 0.06 ? 6 : 8;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(r, 0.004), Math.max(r, 0.004), len, n, 1, r < 0.035), mat(color, family));
    m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2); _orient(m, dx, dy, dz);
    return _add(m);
  };
  /* a small low-poly ball (a knob, a flame's body): the catalog's ball is 240 triangles */
  F.knob = function (x, y, z, r, color, family) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 5), mat(color, family));
    m.position.set(x, y, z);
    return _add(m);
  };
  /* a solid disc (a short cylinder) of radius r and thickness t, centred at (x, y, z), its axis along (ax, ay, az) */
  F.disc = function (x, y, z, ax, ay, az, r, t, color, family, segs) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, Math.max(t, 0.005), _seg(segs || 12, 5)), mat(color, family));
    m.position.set(x, y, z); _orient(m, ax, ay, az);
    return _add(m);
  };
  /* a flat one-sided circle of radius r at (x, y, z), facing (ax, ay, az): a lens, a gauge face */
  F.face = function (x, y, z, ax, ay, az, r, color, family, segs) {
    const g = new THREE.CircleGeometry(r, segs || 10);
    g.rotateX(-Math.PI / 2);                              /* the circle faces +z; now +y, then oriented */
    const m = new THREE.Mesh(g, mat(color, family));
    m.position.set(x, y, z); _orient(m, ax, ay, az);
    return _add(m);
  };
  /* a frustum on any axis: radius r0 at the start, r1 at the end, length len from (x, y, z) along the axis */
  F.taper = function (x, y, z, ax, ay, az, r0, r1, len, color, family, segs) {
    const g = new THREE.CylinderGeometry(Math.max(r1, 0.003), Math.max(r0, 0.003), len, _seg(segs || 10, 5));
    g.translate(0, len / 2, 0);
    const m = new THREE.Mesh(g, mat(color, family));
    m.position.set(x, y, z); _orient(m, ax, ay, az);
    return _add(m);
  };
  /* a ring (torus) of radius r and tube radius tube, centred at (x, y, z), its axis along (ax, ay, az) */
  F.ring = function (x, y, z, ax, ay, az, r, tube, color, family, segs) {
    const g = new THREE.TorusGeometry(r, tube, 3, _seg(segs || 10, 6));
    g.rotateX(Math.PI / 2);                               /* torus axis: z -> y, then oriented */
    const m = new THREE.Mesh(g, mat(color, family));
    m.position.set(x, y, z); _orient(m, ax, ay, az);
    return _add(m);
  };
  /* bent tube: a rod between each pair of points (the rods' end caps close the joints) */
  F.tube = function (pts, r, color, family) {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      F.rod(a[0], a[1], a[2], b[0], b[1], b[2], r, color, family);
    }
  };
  /* a flat triangle, both faces (a pennant): corners a, b, c */
  F.tri = function (a, b, c, color, family) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([].concat(a, b, c, a, c, b), 3));
    g.computeVertexNormals();
    return _add(new THREE.Mesh(g, mat(color, family)));
  };
  /* a lamp: a housing and a lens facing (dx, dy, dz) at (x, y, z), the lens centre recorded in F.lamps.
     kind: 'head' (family lamp), 'tail' (lampTail), 'bar' (lamp), 'amber' (lampAmber), 'cell' (lampBlue) */
  F.lamp = function (x, y, z, dx, dy, dz, r, kind, housing, bezel) {
    const fam = kind === 'tail' ? 'lampTail' : kind === 'amber' ? 'lampAmber' : kind === 'cell' ? 'lampBlue' : 'lamp';
    const lens = kind === 'tail' ? 'lensRed' : kind === 'amber' ? 'lensAmber' : kind === 'cell' ? 'glowBlue' : 'lensWarm';
    const n = Math.hypot(dx, dy, dz) || 1, ux = dx / n, uy = dy / n, uz = dz / n;
    if (housing != null) F.taper(x - ux * r * 1.6, y - uy * r * 1.6, z - uz * r * 1.6, ux, uy, uz, r * 0.7, r * 1.15, r * 1.6, housing, 'metal', 8);
    if (bezel != null) F.disc(x - ux * r * 0.02, y - uy * r * 0.02, z - uz * r * 0.02, ux, uy, uz, r * 1.2, r * 0.1, bezel, 'metal', 8);
    F.face(x + ux * r * 0.04, y + uy * r * 0.04, z + uz * r * 0.04, ux, uy, uz, r, F.col(lens), fam, 10);
    F.lamps.push({ x: x + ux * r * 0.1, y: y + uy * r * 0.1, z: z + uz * r * 0.1, dx: ux, dy: uy, dz: uz, kind: kind || 'head' });
  };
  /* a wheel of this vehicle built INTO the body (a spare), hub at (x, y, z), axle along (ax, ay, az) */
  F.spareWheel = function (x, y, z, ax, ay, az, W) {
    const g = new THREE.Group(), prev = _target;
    _target = g;
    try { F.asset.wheel(F, Object.assign({ side: 1, spare: true }, W)); } finally { _target = prev; }
    g.position.set(x, y, z);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(ax, ay, az).normalize());
    return _add(g);
  };
  return F;
}

/* ---------------------------------------------------------------- shared wheel builder
   A balloon sand tyre with chunky chevron lugs, a dished rim and hub, axle along x, hub at the
   origin. Culture files call it from their wheel(F, W) with their own colours and counts.
   o: { r (overall, lugs included), w (tread width), lugs (per row), lugH, rim (radius), side (+1 left / -1 right),
        tyre, rimCol, hubCol, nutCol: colours; nuts (count, default none); segs (around the tyre) }                                         */
function vehicleBalloonTyre(o) {
  const r = o.r, w = o.w, lh = o.lugs ? o.lugH : 0, rt = r - lh, hw = w / 2, side = o.side || 1;
  const segs = _seg(o.segs || 16, 8);
  /* the tyre: a lathe profile (radius, axial position), round-shouldered like a low-pressure sand tyre */
  const P = [], rb = o.rim * 1.04;
  const prof = [[rb, -hw * 0.86], [rt - w * 0.28, -hw * 1.0], [rt - w * 0.06, -hw * 0.9],
    [rt, -hw * 0.45], [rt, hw * 0.45], [rt - w * 0.06, hw * 0.9], [rt - w * 0.28, hw * 1.0], [rb, hw * 0.86]];
  for (const p of prof) P.push(new THREE.Vector2(p[0], p[1]));
  const tg = new THREE.LatheGeometry(P, segs);
  tg.rotateZ(-Math.PI / 2);                            /* lathe axis y -> x */
  _add(new THREE.Mesh(tg, mat(o.tyre, 'rubber')));
  /* chunky lugs: two staggered rows of blocks, angled into a chevron; one lug sits at the bottom, so the wheel touches y = -r */
  if (o.lugs) {
    const n = o.lugs, lw = w * 0.44, lt = (TAU * rt / n) * 0.42;
    for (let i = 0; i < n; i++) {
      const a = Math.PI + i * TAU / n;                 /* i = 0 straight down */
      for (const s of [-1, 1]) {
        const a2 = a + (s > 0 ? TAU / n / 2 : 0);
        const m = new THREE.Mesh(new THREE.BoxGeometry(lw, lh * 2, lt), mat(o.tyre, 'rubber'));
        /* radial at angle a2: Rx(a2) takes the box's y (its height) to (0, cos a2, sin a2); Ry, applied first,
           yaws the block about that radial axis, opposite ways in the two rows: the chevron */
        m.position.set(s * w * 0.24, Math.cos(a2) * rt, Math.sin(a2) * rt);
        m.rotation.order = 'XYZ'; m.rotation.x = a2; m.rotation.y = s * 0.32;
        _add(m);
      }
    }
  }
  /* the rim: an open drum, a dished face toward the outside (side), a hub cone; nuts only when asked */
  const rimW = w * 0.80;
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(o.rim, o.rim, rimW, _seg(12, 8), 1, true), mat(o.rimCol, 'metal'));
  drum.rotation.z = Math.PI / 2; _add(drum);
  /* the dish: one face, looking outward (a circle faces +z; turned to face +x or -x) */
  const face = new THREE.Mesh(new THREE.CircleGeometry(o.rim, _seg(12, 8)), mat(o.rimCol, 'metal'));
  face.rotation.y = side * Math.PI / 2; face.position.x = side * rimW * 0.12; _add(face);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(o.rim * 0.30, o.rim * 0.42, rimW * 0.5, 6), mat(o.hubCol, 'metal'));
  hub.rotation.z = -side * Math.PI / 2; hub.position.x = side * rimW * 0.34; _add(hub);
  if (o.nutCol != null) for (let i = 0; i < (o.nuts || 0); i++) {
    const a = i * TAU / o.nuts, nut = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.03), mat(o.nutCol, 'metal'));
    nut.position.set(side * (rimW * 0.12 + 0.02), Math.cos(a) * o.rim * 0.56, Math.sin(a) * o.rim * 0.56); _add(nut);
  }
}
