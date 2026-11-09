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
               wheels: [{ name, x, z, r, w, front, steer, drive, lift, steerRatio }] },   (data, not code: a sim reads it)
                                           lift: hub at r + lift (road wheels on a track belt of thickness lift);
                                           steerRatio: a steered wheel turns by steer() x this (default 1, - for a rear axle)
       budget: { tris },                   optional: more than 6 000 triangles (a big vehicle; vehicleBudget())
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
  VEHICLE_CULTURES[key] = { name: info.name || key, lore: info.lore || '', sign: info.sign || '',
    palette: Object.assign({}, info.palette || {}),
    detail: Object.assign({}, info.detail || {}) };      /* palette key -> detail family (vehicles-detail.js); null: none */
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
/* the draw-call and triangle budget verify.py holds a vehicle to: two body meshes plus one per wheel (and one for
   a tracked vehicle's belts), and
   6 000 triangles unless the entry declares more (budget: { tris }): a big crawler is one per world, not a fleet */
function vehicleBudget(A) {
  const tracked = A.tags && (A.tags.drive === 'tracked' || A.tags.drive === 'half-track');   /* + the belts mesh */
  return { meshes: 2 + ((A.data && A.data.wheels) || []).length + (tracked ? 1 : 0), tris: (A.budget && A.budget.tris) || 6000 };
}
/* ---------------------------------------------------------------- ruin states (data, 2026-11-08)
   Every vehicle of every culture can be built in one of four states, KV.build(key, { state }):
     intact      as designed
     weathered   a thousand years outside: rust blooms over the paint, grime, the glass gone, the tyres flat,
                 trim sprung, dead lamps
     burnt       burnt out: soot over everything, the body sagging, the glass gone, the tyres burnt off the rims,
                 the interior open
     wreck       crushed, overturned or torn in two (one of the three, by seed), a wheel missing, panels sprung
                 and fallen, heavy rust and soot
   vehicleRuin(state, seed, key) is the RECORD of one ruin (what happened to this vehicle), a plain object a host or a
   sim can read; the runtime's ruin pass (krator-vehicles-runtime.js) draws it onto the merged body and wheels of
   ANY culture (recolour, detail slots, deformation, rigid transforms), and a culture's build(F) may read F.ruin to
   draw its own damage (skip the glass, draw a cabin as a charred frame). Its draws come from a generator of their
   own on (seed, state), so a body's own F.rnd draws are the same in every state: the intact and the ruined builds
   of one seed are the same vehicle.
     { state, rust: 0..1 (the share of the paint that is rust), soot: 0..1, grime: 0..1, glass: bool (panes kept),
       tyres: 'ok' | 'flat' | 'gone', sag: 0..1 (roof and panels caving), sprung: 0..1 (the share of small trim
       knocked askew), lamps: bool (lights() may glow), tilt: rad (a roll about z, the body settling),
       form: null | one of VEHICLE_WRECK_FORMS (the wreck's shape), missing: a wheel index (wreck; -1 none),
       cut: 0..1 (torn: where along the length; tboned: where the blow landed, as a fraction), side: +-1 (tboned,
       onside: which flank), end: +-1 (crashed: the nose or the tail), seed }                              */
const VEHICLE_STATES = ['intact', 'weathered', 'burnt', 'wreck'];
/* a wreck's shape (R.form), by seed: crushed (the upper body pressed down and sheared), overturned (on its roof),
   torn (cut across, the halves parted), crashed (the nose, or the tail, crumpled: R.end), tboned (one flank caved
   in round R.cut: R.side), exploded (blown open: holes in the upper body, panels flung, burnt out), onside (lying on
   one flank: R.side), skidded (airframes: gear torn off, nose crumpled, belly down at the end of its furrow, wreckage
   strewn behind). A street pairs them: a crashed one nose-on to a tboned one's flank is a collision */
const VEHICLE_WRECK_FORMS = ['crushed', 'overturned', 'torn', 'crashed', 'tboned', 'exploded', 'onside',
  'skidded', 'nosedived', 'broken', 'piled', 'gutted'];
/* an airframe (data.airframe: the helicopter, the jet) draws its form from this list instead; it came down, so it
   lies on the ground (its gear gone: R.gearGone), never perched on wheels or a wingtip:
     skidded     the belly on the ground at the end of the furrow it ploughed, the nose crumpled, wreckage strewn
                 behind it (the build draws the furrow and the trail)
     nosedived   pitched nose-down into the ground, the nose buried (what is under the ground is cut away), the tail
                 in the air
     broken      in two, both halves belly down, holes through the fuselage
     piled       belly down, the nose crumpled to a quarter of its length into a heap of torn panels and earth
     overturned  on its roof (the helicopter's rotor sheared off); the gear stays up in the air
     gutted      burnt to a heap: the build draws the collapsed remains, the rotor head and a bent blade standing
                 out of them                                                                             */
const VEHICLE_AIR_FORMS = ['skidded', 'nosedived', 'broken', 'piled', 'overturned', 'gutted', 'skidded', 'broken'];
function vehicleRuin(state, seed, key, airframe) {
  state = VEHICLE_STATES.indexOf(state) >= 0 ? state : 'intact';
  seed = seed == null ? 1 : seed;
  /* the vehicle's key salts the draws, so two vehicles of one seed (a sheet, a street built from one seed) do not
     share one fate */
  let salt = 0;
  for (let i = 0; key && i < key.length; i++) salt = (Math.imul(salt, 31) + key.charCodeAt(i)) | 0;
  let st = ((Math.imul(seed | 0, 2654435761) >>> 0) + VEHICLE_STATES.indexOf(state) * 40503 + (Math.imul(salt, 2246822519) >>> 0) + 7) >>> 0;
  const rnd = function () { st = (Math.imul(st, 1664525) + 1013904223) >>> 0; return st / 4294967296; };
  const R = { state: state, rust: 0, soot: 0, grime: 0, glass: true, tyres: 'ok', sag: 0, sprung: 0, lamps: true, tilt: 0,
    form: null, missing: -1, cut: 0.5, side: 1, end: 1, gearGone: false, seed: seed };
  if (state === 'intact') return R;
  R.glass = false; R.lamps = false;
  if (state === 'weathered') {
    R.rust = 0.3 + rnd() * 0.3; R.grime = 0.45 + rnd() * 0.2; R.tyres = 'flat'; R.sprung = 0.15 + rnd() * 0.1; R.tilt = (rnd() - 0.5) * 0.05;
  } else if (state === 'burnt') {
    R.rust = 0.35 + rnd() * 0.25; R.soot = 0.85 + rnd() * 0.15; R.grime = 0.3; R.tyres = 'gone'; R.sag = 0.35 + rnd() * 0.3;
    R.sprung = 0.3 + rnd() * 0.15; R.tilt = (rnd() - 0.5) * 0.07;
  } else {
    R.rust = 0.8 + rnd() * 0.2; R.soot = rnd() < 0.6 ? 0.45 + rnd() * 0.4 : 0.1 + rnd() * 0.15; R.grime = 0.4;
    R.tyres = rnd() < 0.5 ? 'gone' : 'flat'; R.sag = 0.5 + rnd() * 0.4; R.sprung = 0.55 + rnd() * 0.25;
    const forms = airframe ? VEHICLE_AIR_FORMS : VEHICLE_WRECK_FORMS.slice(0, 7);     /* the rest are the airframes' */
    R.form = forms[Math.floor(rnd() * forms.length) % forms.length];
    R.missing = Math.floor(rnd() * 64);
    R.tilt = (rnd() - 0.5) * 0.24; R.cut = 0.35 + rnd() * 0.3;
    R.side = rnd() < 0.5 ? 1 : -1; R.end = rnd() < 0.7 ? 1 : -1;
    if (R.form === 'exploded') { R.soot = 0.8 + rnd() * 0.2; R.sprung = 0.9; R.tyres = 'gone'; R.sag = 0.3; }
    if (airframe) {
      R.end = 1; R.tyres = 'gone'; R.missing = -1; R.gearGone = R.form !== 'overturned'; R.sag = 0.25; R.sprung = 0.5;
      if (R.form === 'skidded' || R.form === 'piled') R.tilt = (rnd() - 0.5) * 0.08;
      if (R.form === 'gutted') { R.soot = 0.9 + rnd() * 0.1; R.sprung = 0.9; R.sag = 0.6; }
      if (R.form === 'broken') R.soot = rnd() < 0.5 ? 0.6 + rnd() * 0.3 : 0.1 + rnd() * 0.15;
    }
  }
  return R;
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
  F.belts = [];
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
  /* a slab from a SIDE PROFILE: pts [[z, y, hx], ...] is a closed polygon in the z-y plane (any winding, may be
     concave), each vertex with its own half-width hx, extruded to x = +hx and -hx. A cab, a hull, a wedge nose:
     a narrower hx at the top gives sloped sides. Flat-shaded (each face its own normals). */
  F.slab = function (pts, color, family) {
    const n = pts.length, P = [];
    const tris = THREE.ShapeUtils.triangulateShape(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), []);
    let area = 0;
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
    const sg = area >= 0 ? 1 : -1;
    const V = function (p, s) { return [s * p[2], p[1], p[0]]; };
    /* push a triangle, flipped if its normal faces away from `want` */
    const tri = function (a, b, c, want) {
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (nx * want[0] + ny * want[1] + nz * want[2] < 0) { const t = b; b = c; c = t; }
      P.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    };
    for (const t of tris) for (const s of [1, -1]) tri(V(pts[t[0]], s), V(pts[t[1]], s), V(pts[t[2]], s), [s, 0, 0]);
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n], du = b[0] - a[0], dv = b[1] - a[1];
      const want = [0, -du * sg, dv * sg];                  /* the edge's outward normal in (x, y, z) */
      if (Math.abs(du) + Math.abs(dv) < 1e-9) continue;
      tri(V(a, 1), V(b, 1), V(b, -1), want); tri(V(a, 1), V(b, -1), V(a, -1), want);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.computeVertexNormals();
    return _add(new THREE.Mesh(g, mat(color, family)));
  };
  /* a tub: a stack of horizontal superellipse sections, bottom to top, [{ y, a, b, n, z }]: half-width a (x),
     half-length b (z), exponent n (2 an ellipse, 4+ a rounded rectangle), centre offset z (default 0); smooth-shaded
     sides, flat caps where asked (caps: 'top', 'bottom', 'both'). A rover's bowl, a cupola, a fuel tank on its side.
     inside: the faces turned inward (a cabin's liner inside a single-sided hull, so the interior has walls). */
  F.tub = function (secs, segs, color, family, caps, inside) {
    const S = _seg(segs || 20, 8), pos = [], idx = [];
    const pt = function (s, i) {
      const th = i * TAU / S, c = Math.cos(th), sn = Math.sin(th), e = 2 / (s.n || 2);
      return [s.a * Math.sign(c) * Math.pow(Math.abs(c), e), s.y, (s.z || 0) + s.b * Math.sign(sn) * Math.pow(Math.abs(sn), e)];
    };
    for (const s of secs) for (let i = 0; i < S; i++) pos.push.apply(pos, pt(s, i));
    for (let j = 0; j + 1 < secs.length; j++) for (let i = 0; i < S; i++) {
      const a = j * S + i, b = j * S + (i + 1) % S, c = a + S, d = b + S;
      if (inside) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d);
    }
    const capAt = function (s, up) {
      const base = pos.length / 3;
      for (let i = 0; i < S; i++) pos.push.apply(pos, pt(s, i));
      pos.push(0, s.y, s.z || 0);
      const c = base + S;
      if (inside) up = !up;
      for (let i = 0; i < S; i++) { const a = base + i, b = base + (i + 1) % S; if (up) idx.push(c, b, a); else idx.push(c, a, b); }
    };
    const g = new THREE.BufferGeometry();
    if (caps === 'bottom' || caps === 'both') capAt(secs[0], false);
    if (caps === 'top' || caps === 'both') capAt(secs[secs.length - 1], true);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return _add(new THREE.Mesh(g, mat(color, family)));
  };
  /* a track belt round a set of wheels: circles [[z, y, r], ...] in the side plane at x, the belt of width w and
     thickness t running round their convex hull; shoes every `pitch` metres (each a block, a small gap between).
     The lowest run sits on y = 0 when the lowest wheels' bottoms are at y = t. The belt is RECORDED, not drawn
     here (F.belts): the runtime makes every belt of a vehicle one mesh, `belts`, whose shoes roll() runs round
     the loop (vehicleBeltShoe), the bottom run backward as the vehicle goes forward. */
  F.track = function (x, w, t, circles, pitch, color, family) {
    const pts = [];
    for (const c of circles) for (let i = 0; i < 32; i++) {
      const a = i * TAU / 32, R = c[2] + t / 2;
      pts.push([c[0] + Math.cos(a) * R, c[1] + Math.sin(a) * R]);
    }
    /* convex hull (monotone chain) of the sampled circles, in (z, y) */
    pts.sort(function (p, q) { return p[0] - q[0] || p[1] - q[1]; });
    const cross = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); };
    const lo = [], hi = [];
    for (const p of pts) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
    const hull = lo.slice(0, -1).concat(hi.slice(0, -1));
    /* walk the hull at even steps: one shoe per step, laid along the local tangent */
    const seg = [], L = [];
    let tot = 0;
    for (let i = 0; i < hull.length; i++) { const a = hull[i], b = hull[(i + 1) % hull.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push([a, b, l]); L.push(tot); tot += l; }
    const n = Math.max(8, Math.round(tot / pitch)), step = tot / n;
    F.belts.push({ x: x, w: w, t: t, n: n, step: step, tot: tot, seg: seg, L: L, color: color, family: family || '' });
    return n;
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

/* a point at arc length s round a recorded belt's loop, in (z, y) */
function vehicleBeltAt(B, s) {
  s = ((s % B.tot) + B.tot) % B.tot;
  let k = 0; while (k + 1 < B.seg.length && B.L[k + 1] <= s) k++;
  const q = B.seg[k], f = q[2] > 0 ? (s - B.L[k]) / q[2] : 0;
  return [q[0][0] + (q[1][0] - q[0][0]) * f, q[0][1] + (q[1][1] - q[0][1]) * f];
}
/* one shoe at arc length s: centre (z, y) and its tilt (cos, sin) in the side plane, the chord of 0.76 of a step */
function vehicleBeltShoe(B, s) {
  const a = vehicleBeltAt(B, s - B.step * 0.38), b = vehicleBeltAt(B, s + B.step * 0.38);
  const dz = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dz, dy) || 1;
  return { z: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2, c: dy / l, s: dz / l };
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
