/* ======================================================================
   Krator Mechs: the kit core (kits/mechs/mechs-core.js)

   A MECH({...}) registry, a RIG builder and the mech frame, on top of the master
   catalog's engine-neutral core (kits/catalog/krator-furniture-core.js: mat(),
   _target, F.col over FPAL) and the motor-vehicles frame (kits/motor-vehicles/
   vehicles-core.js: vehicleFrame(), F.rod/disc/face/taper/ring/tube/tri/knob/lamp).
   mech_bundle.py wraps all of it, the parts library (mechs-parts.js), the culture
   files (krator-mechs-<culture>*.js) and the runtime (mechs-runtime.js) in ONE
   closure exposing only `KratorMechs`.

   Why a registry of its own, not VEHICLE: a vehicle is a merged body and wheels
   that spin. A mech is ARTICULATED: legs a gait and an IK solver drive, arms and
   weapons keyframed clips drive, feathers and banners that swing. So the body is
   drawn bone by bone, and the runtime skins it: every mesh drawn on a bone is merged
   into a few SkinnedMeshes (one per surface bucket) with rigid weights on that bone,
   and the meshes drawn by R.link() between two bones (strings, hoses, pistons) are
   weighted along their length, so they stretch as the joint moves.

   The entry (data first; only build draws):
     MECH({
       key, name, culture,                culture: registered with MECH_CULTURE
       role, origin, lore,                what it does in the legion, what it was built as, one line of story
       tags: { class:'mech', type:[...], drive, crew, pilot, weapon:[...], setting, guild },
       variants, variantNames: [...],
       w, d, h,                           box in metres at rest (idle), banners and booms included
       data: { height, mass, crew, pilot, reach, weapon, ... },   (a sim reads it; speed comes from the gait)
       gait: { period, duty, stride, lift, bob, sway, roll, twist, lean, offsets:[...], arms:{bone:[rx,ry,rz]} },
       idle: { breathe, scan, look },     amplitudes of the idle layer (radians, metres)
       attack: { dur, kind, keys:[[t, pose, ease], ...], events:[{ t, type, at, dir, speed, kind }] },
       anim: { idle(P, t, M), walk(P, ph, M) },   optional code layers on top of the data ones
       build(F, R)                        declares the rig (R) and draws on its bones (F)
     })

   THE MECH FRAME: origin at the footprint centre on the ground, +z FORWARD, y up,
   +x the pilot's left (three.js yaw, as kits/motor-vehicles). Each bone has its own
   frame; R.on(bone) sends what F draws next into that bone's frame.

   THE RIG (R):
     R.bone(name, parent, x, y, z, rx, ry, rz)   a joint at (x, y, z) in its parent's frame, rest turn (Euler YXZ)
     R.on(name)                                  draw into that bone from now on
     R.leg(name, { parent, hip:[x,y,z], L1, L2, knee, splay, ankleH, rest:[x,z], phase, toe, footYaw })
         four bones: <name>_yaw (at the hip), <name>_hip, <name>_knee (L1 below), <name>_ankle (L2 below).
         Drawn hanging straight down (the bind pose); the runtime's IK bends them. knee +1 bends the knee
         toward +z (a man, or up and out for a splayed leg), -1 back (a bird). splay: the leg swings about
         its hip toward the foot (a crab, a spider) instead of in the body's fore-and-aft plane.
     R.dangle(name, parent, x, y, z, { mode:'hang'|'whip', len, k, c, wind, max })   a bone that swings
     R.spin(name, parent, x, y, z, axis, { idle, walk, attack })                     a bone that turns (rad/s)
     R.link(boneA, [x,y,z], boneB, [x,y,z], draw(A, B))   draw(A, B) in MECH space between the two points;
         its vertices are weighted from A to B along the line
     R.banner({ bone, kind:'hang'|'flag'|'pennant', x, y, z, ry, w, h, paint:{...} })   cloth the runtime makes
     R.point(name, bone, x, y, z)                 a named spot (a muzzle, the pilot's eye) the clips refer to
   ====================================================================== */

/* the vocabularies a mech's tags are checked against (verify.py --assert) */
const MECH_CLASSES = ['mech'];
const MECH_TYPES = ['war machine', 'industrial', 'siege', 'transport', 'utility', 'standard-bearer', 'scout', 'line', 'heavy'];
const MECH_DRIVES = ['biped', 'digitigrade', 'quadruped'];
const MECH_PILOTS = ['head', 'chest', 'cab', 'saddle'];
const MECH_WEAPONS = ['ballista', 'twin ballista', 'repeating ballista', 'harpoon', 'rivet gun', 'cleaver', 'shield', 'pile driver',
  'claw', 'shears', 'grapple', 'auger', 'saw', 'hammer', 'fist', 'bucket'];

/* a culture: its palette goes into the catalog core's FPAL (inside this closure only), so F.col('orange')
   resolves against the mech's own culture */
const MECH_CULTURES = {};
function MECH_CULTURE(key, info) {
  MECH_CULTURES[key] = { name: info.name || key, lore: info.lore || '', sign: info.sign || '', livery: info.livery || '' };
  FPAL[key] = Object.assign(FPAL[key] || {}, info.palette || {});
}

const MECHS = [], MECH_BY_KEY = {};
function MECH(o) {
  if (MECH_BY_KEY[o.key]) { console.error('duplicate mech key', o.key); return; }
  if (!MECH_CULTURES[o.culture]) { console.error('mech ' + o.key + ': unregistered culture ' + o.culture); return; }
  o.variants = o.variants || 1;
  o.variantNames = o.variantNames || [];
  o.variantData = o.variantData || [];
  o.data = o.data || {};
  o.idle = Object.assign({ breathe: 0.025, scan: 0.12, look: 0.35 }, o.idle || {});
  o.anim = o.anim || {};
  MECHS.push(o); MECH_BY_KEY[o.key] = o;
}
/* a variant's attack clip: variantAttack[v] when the entry has one, else its attack */
function mechAttack(A, v) { return (A.variantAttack && A.variantAttack[v || 0]) || A.attack || null; }
/* the gait's ground speed: the stance foot travels one stride while the body passes over it */
function mechSpeed(G) { return G ? G.stride / (G.duty * G.period) : 0; }
/* the data of one variant: the entry's data with that variant's overrides on top, plus what the gait implies */
function mechData(A, v) {
  const d = Object.assign({}, A.data, A.variantData[v || 0] || {});
  d.speed = Math.round(mechSpeed(A.gait) * 100) / 100;
  d.gait = Object.assign({}, A.gait);
  const at = mechAttack(A, v);
  d.attack = at ? { kind: at.kind, dur: at.dur } : null;
  return d;
}

/* ---------------------------------------------------------------- the rig */
const _mE = new THREE.Euler(), _mQ = new THREE.Quaternion(), _mV = new THREE.Vector3(), _mS = new THREE.Vector3(1, 1, 1);
function mechRig() {
  const R = { bones: [], by: {}, legs: [], dangles: [], spins: [], links: [], banners: [], points: {} };
  R.bone = function (name, parent, x, y, z, rx, ry, rz) {
    if (R.by[name]) throw new Error('mech rig: duplicate bone ' + name);
    const P = parent ? R.by[parent] : null;
    if (parent && !P) throw new Error('mech rig: bone ' + name + ': no parent ' + parent);
    const b = { name: name, parent: parent || null, index: R.bones.length, p: [x || 0, y || 0, z || 0], r: [rx || 0, ry || 0, rz || 0],
      M: new THREE.Matrix4(), group: new THREE.Group() };
    _mQ.setFromEuler(_mE.set(b.r[0], b.r[1], b.r[2], 'YXZ'));
    b.M.compose(_mV.set(b.p[0], b.p[1], b.p[2]), _mQ, _mS);
    if (P) b.M.premultiply(P.M);
    R.bones.push(b); R.by[name] = b;
    return name;
  };
  R.on = function (name) {
    const b = R.by[name];
    if (!b) throw new Error('mech rig: R.on: no bone ' + name);
    _target = b.group;
    return b;
  };
  /* a point of a bone's frame in mech space, at rest */
  R.world = function (name, x, y, z) { return new THREE.Vector3(x || 0, y || 0, z || 0).applyMatrix4(R.by[name].M); };
  R.leg = function (name, o) {
    R.bone(name + '_yaw', o.parent || 'body', o.hip[0], o.hip[1], o.hip[2]);
    R.bone(name + '_hip', name + '_yaw', 0, 0, 0);
    R.bone(name + '_knee', name + '_hip', 0, -o.L1, 0);
    R.bone(name + '_ankle', name + '_knee', 0, -o.L2, 0);
    const L = { name: name, L1: o.L1, L2: o.L2, knee: o.knee || 1, splay: !!o.splay, ankleH: o.ankleH || 0.3,
      rest: [o.rest[0], o.rest[1]], phase: o.phase || 0, toe: o.toe == null ? 0.28 : o.toe,
      footYaw: o.footYaw == null ? (o.splay ? 0.6 : 0) : o.footYaw, hip: o.hip.slice() };
    R.legs.push(L);
    return L;
  };
  R.dangle = function (name, parent, x, y, z, o) {
    o = o || {};
    R.bone(name, parent, x, y, z, o.rx, o.ry, o.rz);
    R.dangles.push(Object.assign({ mode: 'hang', len: 1, k: 16, c: 2.6, wind: 0.04, max: 0.9 }, o, { name: name }));
    return name;
  };
  R.spin = function (name, parent, x, y, z, axis, rates, rx, ry, rz) {
    R.bone(name, parent, x, y, z, rx, ry, rz);
    R.spins.push({ name: name, axis: axis || 'z', rates: Object.assign({ idle: 0, walk: 0, attack: 0 }, rates || {}) });
    return name;
  };
  R.link = function (a, pa, b, pb, draw) {
    const A = R.world(a, pa[0], pa[1], pa[2]), B = R.world(b, pb[0], pb[1], pb[2]);
    const g = new THREE.Group(), prev = _target;
    _target = g;
    try { draw(A, B); } finally { _target = prev; }
    R.links.push({ a: R.by[a].index, b: R.by[b].index, A: A, B: B, group: g });
  };
  R.banner = function (o) {
    if (!R.by[o.bone]) throw new Error('mech rig: banner on missing bone ' + o.bone);
    R.banners.push(Object.assign({ kind: 'hang', x: 0, y: 0, z: 0, ry: 0, w: 0.8, h: 1.2, paint: {} }, o));
  };
  R.point = function (name, bone, x, y, z) { R.points[name] = { bone: bone, p: [x || 0, y || 0, z || 0] }; };
  return R;
}

/* ---------------------------------------------------------------- the mech frame
   vehicleFrame() (rod, disc, face, taper, ring, tube, tri, knob, lamp) plus CENTRED primitives with an
   Euler turn (order YXZ), which is how a mech part is placed on its joint. All in the current bone's frame. */
const _mUp = new THREE.Vector3(0, 1, 0);
function _mPlace(m, x, y, z, rx, ry, rz, order) {
  m.position.set(x, y, z);
  if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0, order || 'YXZ');
  return _add(m);
}
/* a geometry's axis: its length runs along y as built; 'x' and 'z' turn it */
function _mAxis(g, axis) {
  if (axis === 'x') g.rotateZ(-Math.PI / 2);
  else if (axis === 'z') g.rotateX(Math.PI / 2);
  return g;
}
function _mFlat(g) { const n = g.index ? g.toNonIndexed() : g; n.computeVertexNormals(); if (n !== g) g.dispose(); return n; }
function mechFrame(opt) {
  const F = vehicleFrame(opt);
  /* centred box (order: the Euler order, default YXZ; 'ZXY' pitches a blade about its own length after turning it round z) */
  F.cb = function (x, y, z, w, h, d, color, family, rx, ry, rz, order) {
    return _mPlace(new THREE.Mesh(new THREE.BoxGeometry(Math.max(w, 0.01), Math.max(h, 0.01), Math.max(d, 0.01)), mat(color, family)), x, y, z, rx, ry, rz, order);
  };
  /* a prism: the 2D outline pts [[u, v], ...] extruded len along axis, centred at (x, y, z).
     The outline lies in (x, y) for axis 'z', (z, y) for axis 'x', (x, z) for axis 'y'. Hard edges. */
  F.prism = function (x, y, z, pts, len, color, family, axis, rx, ry, rz) {
    const s = new THREE.Shape();
    pts.forEach(function (p, i) { if (i) s.lineTo(p[0], p[1]); else s.moveTo(p[0], p[1]); });
    let g = new THREE.ExtrudeGeometry(s, { depth: Math.max(len, 0.005), bevelEnabled: false, curveSegments: 1 });
    g.translate(0, 0, -len / 2);
    if (axis === 'x') g.rotateY(-Math.PI / 2);
    else if (axis === 'y') g.rotateX(Math.PI / 2);
    g = _mFlat(g);
    return _mPlace(new THREE.Mesh(g, mat(color, family)), x, y, z, rx, ry, rz);
  };
  /* a chamfered box: w, h, d along x, y, z; its four edges along `axis` cut by c */
  F.chb = function (x, y, z, w, h, d, c, color, family, axis, rx, ry, rz) {
    axis = axis || 'z';
    const a = (axis === 'x' ? d : w) / 2, b = (axis === 'y' ? d : h) / 2, L = axis === 'x' ? w : axis === 'y' ? h : d;
    const k = Math.min(c, a * 0.9, b * 0.9);
    const pts = [[a - k, b], [-(a - k), b], [-a, b - k], [-a, -(b - k)], [-(a - k), -b], [a - k, -b], [a, -(b - k)], [a, b - k]];
    return F.prism(x, y, z, pts, L, color, family, axis, rx, ry, rz);
  };
  /* a trapezoid slab (armour that narrows): width w0 at the bottom, w1 at the top, height h, thickness t, facing z */
  F.trap = function (x, y, z, w0, w1, h, t, color, family, rx, ry, rz) {
    return F.prism(x, y, z, [[-w0 / 2, -h / 2], [w0 / 2, -h / 2], [w1 / 2, h / 2], [-w1 / 2, h / 2]], t, color, family, 'z', rx, ry, rz);
  };
  /* a centred cylinder (or a frustum, r0 at -len/2, r1 at +len/2) along axis */
  F.cy = function (x, y, z, r0, r1, len, color, family, axis, segs, rx, ry, rz, open) {
    const g = _mAxis(new THREE.CylinderGeometry(Math.max(r1, 0.004), Math.max(r0, 0.004), Math.max(len, 0.005), _seg(segs || 12, 5), 1, !!open), axis || 'y');
    return _mPlace(new THREE.Mesh(g, mat(color, family)), x, y, z, rx, ry, rz);
  };
  /* an ellipsoid, or a patch of one: radii (a, b, c); phi round y from phi0 over dphi, theta down from the pole */
  F.sph = function (x, y, z, a, b, c, color, family, ws, hs, phi0, dphi, th0, dth, rx, ry, rz) {
    const g = new THREE.SphereGeometry(1, _seg(ws || 12, 6), _seg(hs || 8, 4), phi0 || 0, dphi == null ? TAU : dphi, th0 || 0, dth == null ? Math.PI : dth);
    g.scale(a, b, c);
    return _mPlace(new THREE.Mesh(g, mat(color, family)), x, y, z, rx, ry, rz);
  };
  /* the same patch seen from inside (a cockpit's walls behind a window): wound the other way, normals turned in */
  F.sphIn = function (x, y, z, a, b, c, color, family, ws, hs, phi0, dphi, th0, dth, rx, ry, rz) {
    const m = F.sph(x, y, z, a, b, c, color, family, ws, hs, phi0, dphi, th0, dth, rx, ry, rz), g = m.geometry, ix = g.index;
    for (let i = 0; i < ix.count; i += 3) { const t = ix.getX(i + 1); ix.setX(i + 1, ix.getX(i + 2)); ix.setX(i + 2, t); }
    const nr = g.attributes.normal;
    for (let i = 0; i < nr.count; i++) nr.setXYZ(i, -nr.getX(i), -nr.getY(i), -nr.getZ(i));
    return m;
  };
  /* a torus of radius r, tube t, about axis */
  F.tor = function (x, y, z, r, t, color, family, axis, segs, arc, rx, ry, rz) {
    const g = new THREE.TorusGeometry(r, t, 4, _seg(segs || 14, 6), arc || TAU);
    if (axis === 'x') g.rotateY(Math.PI / 2); else if (axis === 'y') g.rotateX(Math.PI / 2);
    return _mPlace(new THREE.Mesh(g, mat(color, family)), x, y, z, rx, ry, rz);
  };
  /* a flat polygon (one face, wound counter-clockwise seen from where it faces) */
  F.poly = function (pts, color, family) {
    const a = [];
    for (let i = 1; i < pts.length - 1; i++) a.push.apply(a, pts[0].concat(pts[i], pts[i + 1]));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3));
    g.computeVertexNormals();
    return _add(new THREE.Mesh(g, mat(color, family)));
  };
  /* painted diagonal bands (hazard stripes, livery chevrons) on a w x h panel centred at (x, y, z) facing +z,
     turned by (rx, ry, rz): bands of `bw` at angle `ang`, colours alternating through cols */
  F.bands = function (x, y, z, w, h, ang, bw, cols, family, rx, ry, rz) {
    const g = new THREE.Group(), prev = _target;
    _target = g;
    const ca = Math.cos(ang), sa = Math.sin(ang), R0 = Math.hypot(w, h) / 2;
    const rect = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
    let k = 0;
    for (let s = -R0; s < R0; s += bw, k++) {
      /* the band s <= u*ca + v*sa < s + bw, clipped to the panel (Sutherland-Hodgman on two half-planes) */
      let P = rect;
      P = _clip(P, function (p) { return p[0] * ca + p[1] * sa - s; });
      P = _clip(P, function (p) { return s + bw - (p[0] * ca + p[1] * sa); });
      if (P.length >= 3) F.poly(P.map(function (p) { return [p[0], p[1], 0]; }), cols[k % cols.length], family);
    }
    _target = prev;
    return _mPlace(g, x, y, z, rx, ry, rz);
  };
  /* a lamp, as vehicleFrame's, with the lens well clear of the housing and bezel (theirs sit within 3 mm: z-fighting) */
  F.lamp = function (x, y, z, dx, dy, dz, r, kind, housing, bezel) {
    const fam = kind === 'tail' ? 'lampTail' : kind === 'amber' ? 'lampAmber' : kind === 'cell' ? 'lampBlue' : 'lamp';
    const lens = kind === 'tail' ? 'lensRed' : kind === 'amber' ? 'lensAmber' : kind === 'cell' ? 'glowBlue' : 'lensWarm';
    const n = Math.hypot(dx, dy, dz) || 1, ux = dx / n, uy = dy / n, uz = dz / n;
    if (housing != null) F.taper(x - ux * r * 1.7, y - uy * r * 1.7, z - uz * r * 1.7, ux, uy, uz, r * 0.7, r * 1.15, r * 1.6, housing, 'metal', 8);
    if (bezel != null) F.ring(x, y, z, ux, uy, uz, r * 1.08, r * 0.14, bezel, 'metal', 10);
    F.face(x + ux * 0.006, y + uy * 0.006, z + uz * 0.006, ux, uy, uz, r, F.col(lens), fam, 10);
    F.lamps.push({ x: x, y: y, z: z, dx: ux, dy: uy, dz: uz, kind: kind || 'head' });
  };
  return F;
}
function _clip(P, f) {
  const out = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length], fa = f(a), fb = f(b);
    if (fa >= 0) out.push(a);
    if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  }
  return out;
}

/* ---------------------------------------------------------------- the skin: bones' meshes into buckets
   Six surface buckets, each one SkinnedMesh with a shared material (the runtime's): painted plate, bare
   metal, bronze and gilt, cloth (and rope, leather, rubber, feathers, skin), glass, and glow (lamps, the
   eye slits). Families not listed are painted plate. */
const MECH_BUCKETS = ['plate', 'livery', 'metal', 'bronze', 'cloth', 'hair', 'glass', 'glow'];
const MECH_FAMILY_BUCKET = { '': 'plate', paint: 'plate', plate: 'plate',
  metal: 'metal', steel: 'metal', iron: 'metal', rust: 'metal', chrome: 'metal',
  bronze: 'bronze', gold: 'bronze', brass: 'bronze', copper: 'bronze',
  cloth: 'cloth', rope: 'cloth', leather: 'cloth', rubber: 'cloth', wood: 'cloth', feather: 'cloth', hair: 'hair', skin: 'cloth',
  hide: 'cloth', bone: 'cloth', glass: 'glass', glow: 'glow', lamp: 'glow', lampTail: 'glow', lampAmber: 'glow', lampBlue: 'glow' };
/* painted plate in a saturated colour (orange, cream, teal, red) is LIVERY: paint over steel, its own detail map
   (chipped paint) and its own bucket; greys stay bare plate */
function mechBucket(fam, c) {
  const k = MECH_FAMILY_BUCKET[fam || ''] || 'plate';
  if (k !== 'plate' || !c) return k;
  const mx = Math.max(c.r, c.g, c.b), mn = Math.min(c.r, c.g, c.b);
  return mx > 0.05 && (mx - mn) / mx > 0.2 ? 'livery' : 'plate';
}
function _lin(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function mechMerge(R, linear) {
  const B = {}, v = new THREE.Vector3(), n = new THREE.Vector3(), nm = new THREE.Matrix3(), AB = new THREE.Vector3();
  function push(o, ia, ib, L) {
    const geo = o.geometry, pos = geo.attributes.position, nor = geo.attributes.normal, idx = geo.index;
    if (!pos) return;
    const fam = (o.material.userData && o.material.userData.family) || '', c = o.material.color;
    const k = mechBucket(fam, c), b = B[k] || (B[k] = { pos: [], nor: [], col: [], si: [], sw: [] });
    const cr = linear ? _lin(c.r) : c.r, cg = linear ? _lin(c.g) : c.g, cb = linear ? _lin(c.b) : c.b;
    nm.getNormalMatrix(o.matrixWorld);
    if (L) AB.subVectors(L.B, L.A);
    const ab2 = L ? Math.max(AB.lengthSq(), 1e-9) : 1;
    const cnt = idx ? idx.count : pos.count;
    for (let i = 0; i < cnt; i++) {
      const j = idx ? idx.getX(i) : i;
      v.fromBufferAttribute(pos, j).applyMatrix4(o.matrixWorld);
      b.pos.push(v.x, v.y, v.z);
      if (nor) { n.fromBufferAttribute(nor, j).applyMatrix3(nm).normalize(); b.nor.push(n.x, n.y, n.z); } else b.nor.push(0, 1, 0);
      b.col.push(cr, cg, cb);
      if (L) {
        const f = Math.max(0, Math.min(1, (v.x - L.A.x) * AB.x / ab2 + (v.y - L.A.y) * AB.y / ab2 + (v.z - L.A.z) * AB.z / ab2));
        b.si.push(ia, ib, 0, 0); b.sw.push(1 - f, f, 0, 0);
      } else { b.si.push(ia, 0, 0, 0); b.sw.push(1, 0, 0, 0); }
    }
  }
  for (const bn of R.bones) {
    bn.group.matrixAutoUpdate = false; bn.group.matrix.copy(bn.M); bn.group.updateMatrixWorld(true);
    bn.group.traverse(function (o) { if (o.isMesh) push(o, bn.index, 0, null); });
  }
  for (const L of R.links) {
    L.group.updateMatrixWorld(true);
    L.group.traverse(function (o) { if (o.isMesh) push(o, L.a, L.b, L); });
  }
  function free(g) { g.traverse(function (o) { if (o.geometry) o.geometry.dispose(); }); }
  for (const bn of R.bones) free(bn.group);
  for (const L of R.links) free(L.group);
  return B;
}

/* ---------------------------------------------------------------- the z-fighting audit
   Every triangle of the rest pose, then pairs from DIFFERENT meshes that lie in one plane (normals within 1 degree
   and facing the same way, planes within `tol` metres) and overlap by more than `pen` metres: the depth buffer cannot
   tell them apart, so they flicker. Pairs of one colour in one bucket are left out (they render the same either way).
   Returns [{ bone, a, b, n, at }] grouped by bone and colour pair (a, b: hex colour and bucket), worst first. */
function mechAudit(R, o) {
  o = o || {};
  const tol = o.tol || 0.004, pen = o.pen || 0.004, T = [], v = new THREE.Vector3();
  function collect(g, bone, mats) {
    g.updateMatrixWorld(true);
    let id = 0;
    g.traverse(function (m) {
      if (!m.isMesh || !m.geometry.attributes.position) return;
      id++;
      const p = m.geometry.attributes.position, ix = m.geometry.index, n = ix ? ix.count : p.count, c = m.material.color;
      const fam = (m.material.userData && m.material.userData.family) || '', col = c.getHexString() + '/' + mechBucket(fam, c);
      if (mechBucket(fam, c) === 'glass') return;
      for (let i = 0; i < n; i += 3) {
        const q = [0, 1, 2].map(function (k) { return v.fromBufferAttribute(p, ix ? ix.getX(i + k) : i + k).applyMatrix4(m.matrixWorld).clone(); });
        const nn = new THREE.Vector3().subVectors(q[1], q[0]).cross(new THREE.Vector3().subVectors(q[2], q[0]));
        const ar = nn.length() / 2;
        if (ar < 2e-5) continue;
        nn.normalize();
        T.push({ q: q, n: nn, d: nn.dot(q[0]), mesh: bone + '#' + id, bone: bone, col: col });
      }
    });
  }
  for (const b of R.bones) { b.group.matrixAutoUpdate = false; b.group.matrix.copy(b.M); collect(b.group, b.name); }
  R.links.forEach(function (L, i) { collect(L.group, 'link' + i); });
  const bins = new Map(), key = function (t, dd) {
    return Math.round(t.n.x * 40) + ',' + Math.round(t.n.y * 40) + ',' + Math.round(t.n.z * 40) + ',' + (Math.round(t.d / tol) + dd);
  };
  for (const t of T) { const k = key(t, 0); (bins.get(k) || bins.set(k, []).get(k)).push(t); }
  function proj(t, u, w) { return t.q.map(function (p) { return [p.dot(u), p.dot(w)]; }); }
  function sep(A, B) {   /* separating axis between two 2D triangles, with `pen` of slack */
    for (const P of [A, B]) for (let i = 0; i < 3; i++) {
      const a = P[i], b = P[(i + 1) % 3], nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
      let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
      for (const p of A) { const s = (p[0] * nx + p[1] * ny) / l; a0 = Math.min(a0, s); a1 = Math.max(a1, s); }
      for (const p of B) { const s = (p[0] * nx + p[1] * ny) / l; b0 = Math.min(b0, s); b1 = Math.max(b1, s); }
      if (a1 - b0 < pen || b1 - a0 < pen) return true;
    }
    return false;
  }
  const out = new Map(), seen = new Set();
  for (const t of T) {
    const Bs = MP.basis(t.n.x, t.n.y, t.n.z), u = Bs[0], w = Bs[1], A = proj(t, u, w);
    for (const dd of [-1, 0, 1]) {
      const list = bins.get(key(t, dd));
      if (!list) continue;
      for (const s of list) {
        if (s === t || s.mesh === t.mesh || s.col === t.col || Math.abs(s.d - t.d) > tol || s.n.dot(t.n) < 0.9998) continue;
        const pk = t.mesh < s.mesh ? t.mesh + '|' + s.mesh : s.mesh + '|' + t.mesh;
        if (sep(A, proj(s, u, w))) continue;
        const gk = t.bone + ' ' + [t.col, s.col].sort().join(' vs ');
        const e = out.get(gk) || out.set(gk, { bone: t.bone, a: t.col, b: s.col, n: 0, at: t.q[0].toArray().map(function (x) { return Math.round(x * 100) / 100; }), pairs: new Set() }).get(gk);
        if (!seen.has(pk + gk)) { seen.add(pk + gk); e.pairs.add(pk); }
        e.n++;
      }
    }
  }
  const res = [];
  out.forEach(function (e) { res.push({ bone: e.bone, a: e.a, b: e.b, n: e.n, meshes: e.pairs.size, at: e.at }); });
  for (const b of R.bones) b.group.traverse(function (m) { if (m.geometry) m.geometry.dispose(); });
  return res.sort(function (x, y) { return y.n - x.n; });
}
