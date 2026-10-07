/* ======================================================================
   Krator Furniture Core: the half of the catalog engine with no page in it
   (split out of krator-asset-engine.js, 2026-10, so any build can carry the
   catalog's furniture). It needs only THREE. It holds TAU and shade(), the
   material cache mat() and its family looks, the geometry kit mk* (mkDecal included: a painted canvas panel; all add
   to _target, else to a global `scene` when one exists), the FURN / PLANT /
   ASSET registries and their vocabularies, CATALOG_MATERIALS, the furniture
   palettes FPAL and furnCol(), the build frame makeFrame(), the instantiation
   helpers buildFurn / buildPlant / buildAsset (which add to the global
   `scene`), rebuildInstance() and measureInstance().
   A catalog page loads this file, then krator-asset-engine.js (the scene,
   camera, controls, labels and frame loop). Another build carries it inside a
   closure with the furniture files (kits/catalog/furniture_bundle.py), so its
   names never meet the host's: kits/catalog/README.md "Furniture in a kit".
   ====================================================================== */
/* ======================================================================
   Krator Master Catalog Engine
   Shared by the master furniture and master plant catalog viewers.
   Provides: scene/camera/renderer setup, a small geometry kit, the
   FURN/PLANT registry contract (same shape as Yuni's own src/53-assets.js),
   and label/layout helpers. Culture-specific FURN(...)/PLANT(...) calls are
   loaded as separate <script> files after this one.
   ====================================================================== */

const TAU = Math.PI * 2;

function shade(hex, amt) {
  let r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (amt >= 0 ? (255 - c) * amt : c * amt))));
  return (f(r) << 16) | (f(g) << 8) | f(b);
}


/* ------------------------------------------------------------ material */
const _matCache = new Map();
/* per-family [roughness, metalness]; anything not listed is matte (0.85, 0).
   The furniture kit's cultural materials (nacre, gold, lacquer, glazed ceramic, obsidian, jade)
   read as what they are only through these: CATALOG_MATERIALS below names each. */
const MAT_FAMILY_LOOK = {
  metal: [0.4, 0.7], gold: [0.22, 0.9], bronze: [0.42, 0.75], rust: [0.85, 0.35],
  nacre: [0.18, 0.35], lacquer: [0.22, 0.05], ceramic: [0.3, 0.05], obsidian: [0.12, 0.15], jade: [0.35, 0.05],
  plastic: [0.5, 0.0], bone: [0.6, 0.0]
};
/* `family` may carry a texture split, 'tex/base' (furnFamily below): the material keeps the base family's look and
   userData.family, and adds userData.texFamily for a host's detail map */
function mat(color, family) {
  const key = color + '|' + (family || '');
  if (_matCache.has(key)) return _matCache.get(key);
  let texFamily = null;
  if (family && family.indexOf('/') > 0) { texFamily = family.slice(0, family.indexOf('/')); family = family.slice(family.indexOf('/') + 1); }
  let roughness = 0.85, metalness = 0.0, transparent = false, opacity = 1;
  const fam = MAT_FAMILY_LOOK[family];
  if (fam) { roughness = fam[0]; metalness = fam[1]; }
  else if (family === 'glass') { roughness = 0.05; metalness = 0.1; transparent = true; opacity = 0.55; }
  else if (family === 'glow') { roughness = 1; }
  const m = family === 'glow'
    ? new THREE.MeshBasicMaterial({ color, transparent, opacity })
    : new THREE.MeshStandardMaterial({ color, roughness, metalness, transparent, opacity });
  m.userData.family = family || '';
  if (texFamily) m.userData.texFamily = texFamily;
  _matCache.set(key, m);
  return m;
}

/* ----------------------------------------------------------- geo kit
   All *world*-space; the frame wrapper (F.*) below resolves local -> world.
   Convention: box/cyl/cone/dome sit with their BOTTOM at y; blob/ball are
   CENTRED at y.
   Every primitive goes into _target when one is set, so buildAsset/buildFurn/
   buildPlant can collect an instance's meshes into a single selectable group.
   _target stays null for scenery (ground, labels), which lands straight in the scene. */
let _target = null;
/* level of detail for round primitives: 1 = the catalog's own (every page); a build that places thousands
   of pieces (krator-furniture-runtime.js: KF.setDetail) lowers it, so cylinders, cones, domes, balls and rods
   get fewer segments. Boxes, and frustums of 8 sides or fewer (square and hexagonal blocks), never change. */
let _LOD = 1;
function _seg(n, min) { return _LOD === 1 ? n : Math.max(min, Math.round(n * _LOD)); }
function _add(m) { (_target || scene).add(m); return m; }
function mkBox(x, y, z, w, h, d, ry, color, family) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(Math.max(w, 0.02), Math.max(h, 0.02), Math.max(d, 0.02)), mat(color, family));
  m.position.set(x, y + h / 2, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkCyl(x, y, z, r, h, ry, color, family) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(r, 0.01), Math.max(r, 0.01), Math.max(h, 0.02), _seg(16, 6)), mat(color, family));
  m.position.set(x, y + h / 2, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkCone(x, y, z, r, h, ry, color, family) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(Math.max(r, 0.01), Math.max(h, 0.02), _seg(14, 6)), mat(color, family));
  m.position.set(x, y + h / 2, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkDome(x, y, z, r, h, ry, color, family) {
  const geo = new THREE.SphereGeometry(Math.max(r, 0.02), _seg(16, 6), _seg(10, 3), 0, TAU, 0, Math.PI / 2);
  geo.scale(1, Math.max(h, 0.02) / Math.max(r, 0.02), 1);
  const m = new THREE.Mesh(geo, mat(color, family));
  m.position.set(x, y, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkBlob(x, y, z, r, h, ry, color, family) {
  const geo = new THREE.SphereGeometry(Math.max(r, 0.02), _seg(10, 6), _seg(8, 4));
  geo.scale(1, Math.max(h, 0.02) / (2 * Math.max(r, 0.02)), 1);
  const m = new THREE.Mesh(geo, mat(color, family));
  m.position.set(x, y, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkBall(x, y, z, r, color, family) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(Math.max(r, 0.02), _seg(14, 6), _seg(10, 4)), mat(color, family));
  m.position.set(x, y, z);
  return _add(m);
}
function mkBeam(ax, ay, az, bx, by, bz, w, d, color, family) {
  const dx = bx - ax, dy = by - ay, dz = bz - az;
  const len = Math.max(Math.hypot(dx, dy, dz), 0.02);
  const m = new THREE.Mesh(new THREE.BoxGeometry(Math.max(w, 0.02), len, Math.max(d, 0.02)), mat(color, family));
  m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz).normalize());
  return _add(m);
}
function mkRod(ax, ay, az, bx, by, bz, r, color, family) {
  const dx = bx - ax, dy = by - ay, dz = bz - az;
  const len = Math.max(Math.hypot(dx, dy, dz), 0.02);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(r, 0.005), Math.max(r, 0.005), len, _seg(8, 4)), mat(color, family));
  m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz).normalize());
  return _add(m);
}
/* SOFT FURNISHINGS (2026-10-05, the Scyvoi cushions). A pillow: two puffed faces meeting at a seam round the edge,
   with an optional boxed side wall between them; its corners stay sharp and its mid-edges pinch in, as a stuffed
   cloth does. CENTRED at (x, y, z), like blob and ball; w along x, h its thickness (y), d along z; turned ry, then
   tipped rx about its own x (a back cushion stood up: rx = -PI/2 + lean). o: { side 0..1 (the boxed wall's share
   of h), round (the plan's superellipse exponent, default 5), sag (how far the seam drops at the corners, a share of the wall, default 0.45), puff (the dome's exponent: 0.3 a flat-topped quilt or mattress, 0.85 a fat cushion, 1 a bed pillow; low values read as a box), pinch (mid-edge pull-in, a share of the half-width) }.
   Returns top(lx, lz): the height of the top face above the centre at a point of the unturned pillow, so a builder
   can lay appliqué on it; top.seamTop and top.seamBottom are the seams as closed loops of [x, y, z] (same frame), for piping. Its segments never drop below 8 a side whatever the detail level: a cushion
   cut to a box is the defect this exists to fix. */
function pillowTop(w, h, d, o) {
  const side = Math.min(0.95, Math.max(0, o.side || 0)), puff = o.puff == null ? 0.35 : o.puff, hs = h * side / 2, hb = h / 2 - hs;
  return function (lx, lz) {
    const s = Math.min(1, Math.abs(lx) / (w / 2)), t = Math.min(1, Math.abs(lz) / (d / 2));
    return hs + hb * Math.pow(Math.max(0, 1 - s * s), puff) * Math.pow(Math.max(0, 1 - t * t), puff);
  };
}
function mkPillow(x, y, z, w, h, d, ry, color, family, o) {
  o = o || {};
  const n = _seg(12, 8), side = Math.min(0.95, Math.max(0, o.side || 0)), pinch = o.pinch == null ? 0.05 : o.pinch, hs = h * side / 2;
  const top = pillowTop(w, h, d, o), pos = [], idx = [];
  const q = o.round == null ? 5 : o.round, sag = o.sag == null ? 0.45 : o.sag;
  const at = (i, j, sign) => {
    const s = -1 + 2 * i / n, t = -1 + 2 * j / n, as = Math.abs(s), at2 = Math.abs(t), mx = Math.max(as, at2);
    /* the plan: the square grid mapped onto a superellipse (corners rounded, o.round its exponent: 2 a circle, 8 nearly square),
       then the mid-edges pinched in; the seam sags toward the corners (o.sag), as a stuffed cover does */
    const k = mx > 0 ? mx / Math.pow(Math.pow(as, q) + Math.pow(at2, q), 1 / q) : 1;
    const px = s * k * w / 2 * (1 - pinch * (1 - t * t)), pz = t * k * d / 2 * (1 - pinch * (1 - s * s));
    const y = top(s * w / 2, t * d / 2) - hs * sag * s * s * t * t;
    return [px, sign * Math.max(0.002, y), pz];
  };
  for (const sign of [1, -1]) {
    const b = pos.length / 3;
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) pos.push(...at(i, j, sign));
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = b + j * (n + 1) + i; idx.push(a, a + n + 1, a + 1, a + 1, a + n + 1, a + n + 2); }
  }
  if (hs > 0.001) {   // the boxed wall: the boundary of the grid, once round, from the top seam to the bottom seam
    const ring = [];
    for (let i = 0; i < n; i++) ring.push([i, 0]);
    for (let j = 0; j < n; j++) ring.push([n, j]);
    for (let i = n; i > 0; i--) ring.push([i, n]);
    for (let j = n; j > 0; j--) ring.push([0, j]);
    const b = pos.length / 3;
    for (const [i, j] of ring) { pos.push(...at(i, j, 1)); pos.push(...at(i, j, -1)); }
    const m = ring.length;
    for (let k = 0; k < m; k++) { const a = b + 2 * k, c = b + 2 * ((k + 1) % m); idx.push(a, a + 1, c, c, a + 1, c + 1); }
  }
  // a pillow is star-shaped about its centre: turn every triangle to face away from it
  for (let t = 0; t < idx.length; t += 3) {
    const A = idx[t] * 3, B = idx[t + 1] * 3, C = idx[t + 2] * 3;
    const ux = pos[B] - pos[A], uy = pos[B + 1] - pos[A + 1], uz = pos[B + 2] - pos[A + 2], vx = pos[C] - pos[A], vy = pos[C + 1] - pos[A + 1], vz = pos[C + 2] - pos[A + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const cx = pos[A] + pos[B] + pos[C], cy = pos[A + 1] + pos[B + 1] + pos[C + 1], cz = pos[A + 2] + pos[B + 2] + pos[C + 2];
    if (nx * cx + ny * cy + nz * cz < 0) { const k = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = k; }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat(color, family));
  m.position.set(x, y, z); m.rotation.set(o.rx || 0, ry || 0, 0, 'YXZ');
  _add(m);
  /* the two seams as closed loops of points in the pillow's own frame (centre at 0; untilted, unturned): piping follows them */
  const loop = sign => { const L = []; for (let i = 0; i < n; i++) L.push(at(i, 0, sign)); for (let j = 0; j < n; j++) L.push(at(n, j, sign));
    for (let i = n; i > 0; i--) L.push(at(i, n, sign)); for (let j = n; j > 0; j--) L.push(at(0, j, sign)); L.push(L[0]); return L; };
  top.seamTop = loop(1); top.seamBottom = loop(-1);
  return top;
}
/* A bolster: a round cushion along x, its ends gathered in and tied. CENTRED at (x, y, z), length len, radius r,
   turned ry. o: { from, to } (0..1 along its length: a section of the same profile, for a coloured band; scale it a
   hair larger with o.grow), gather (the end radius as a share of r, default 0.45). At least 12 segments round. */
function mkBolster(x, y, z, len, r, ry, color, family, o) {
  o = o || {};
  const from = o.from == null ? 0 : o.from, to = o.to == null ? 1 : o.to, g = o.gather == null ? 0.45 : o.gather, R = r * (o.grow || 1), m = Math.max(1, Math.round(14 * (to - from))), pts = [];   // a band gets profile points for its own length only
  const rad = u => { const e = Math.abs(2 * u - 1); return R * (g + (1 - g) * Math.pow(Math.max(0, 1 - Math.pow(e, 7)), 0.35)); };
  if (from <= 0.0001) pts.push(new THREE.Vector2(0.001, -len / 2));
  for (let k = 0; k <= m; k++) { const u = from + (to - from) * k / m; pts.push(new THREE.Vector2(rad(u), -len / 2 + u * len)); }
  if (to >= 0.9999) pts.push(new THREE.Vector2(0.001, len / 2));
  const geo = new THREE.LatheGeometry(pts, _seg(16, 12));
  geo.rotateZ(-Math.PI / 2);   // the lathe's axis (y) laid along x
  const mm = new THREE.Mesh(geo, mat(color, family));
  mm.position.set(x, y, z); mm.rotation.y = ry || 0;
  return _add(mm);
}
/* a tapering block/tower segment: HALF-WIDTH rBottom at y, rTop at y+h, i.e. the
   block spans 2*rBottom across at its base — r reads as a radius/half-width in every
   case. sides=4 is a tapered SQUARE block with its faces square to the frame, sides=8
   a tapered octagonal mass, higher for a rounder tower drum.
   (For sides=4 the geometry is a diamond in plan, so it is over-sized by sqrt(2) and
   turned 45 deg to put the faces — not the corners — on the axes.) */
function mkFrustum(x, y, z, rBottom, rTop, h, ry, color, family, sides) {
  const n = (sides || 8) > 8 ? _seg(sides, 8) : (sides || 8);
  const k = (n === 4) ? Math.SQRT2 : 1;
  const geo = new THREE.CylinderGeometry(Math.max(rTop, 0.02) * k, Math.max(rBottom, 0.02) * k, Math.max(h, 0.02), n);
  const m = new THREE.Mesh(geo, mat(color, family));
  m.position.set(x, y + h / 2, z);
  m.rotation.y = (ry || 0) + (n === 4 ? Math.PI / 4 : 0);
  return _add(m);
}
/* a pyramidal / hip roof covering EXACTLY w (x) by d (z) at its eaves, peak h above y.
   The 4-sided cone is a diamond in plan, so the geometry is turned 45 deg first and
   then scaled, which makes the covered footprint exactly w by d rather than w+d over
   root two — and keeps a non-square roof square to its building. */
/* a painted panel: a plane of w by h facing +z (turned by ry), bottom-centre at (x, y, z), with a
   canvas texture painted ONCE per key by paint(ctx, W, H) and cached. Canvas pixels map 128 per metre
   (clamped 32..512), so an emblem stays round on a tall banner and a wide frieze alike. The material
   carries `family` like any other (cloth, hide, plaster ...). Deterministic as long as paint() is. */
const _texCache = new Map();
function mkDecal(x, y, z, w, h, ry, key, paint, family) {
  let m = _texCache.get(key);
  if (!m) {
    const c = document.createElement('canvas');
    c.width = Math.max(32, Math.min(512, Math.round(w * 128)));
    c.height = Math.max(32, Math.min(512, Math.round(h * 128)));
    paint(c.getContext('2d'), c.width, c.height);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    const rough = family === 'metal' || family === 'gold' ? 0.45 : 0.92;
    m = new THREE.MeshStandardMaterial({ map: t, roughness: rough, metalness: family === 'gold' ? 0.6 : 0, side: THREE.DoubleSide });
    m.userData.family = family || '';
    _texCache.set(key, m);
  }
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.position.set(x, y + h / 2, z); mesh.rotation.y = ry || 0;
  return _add(mesh);
}
/* a colour number as a CSS colour, for canvas painting */
function cssCol(c) { return '#' + ('000000' + (c >>> 0 & 0xffffff).toString(16)).slice(-6); }
function mkPyrRoof(x, y, z, w, h, d, ry, color, family) {
  const geo = new THREE.ConeGeometry(0.5, Math.max(h, 0.02), 4);
  geo.rotateY(Math.PI / 4);
  const k = Math.SQRT2; /* plan extent after the turn is 1/sqrt(2) */
  geo.scale(Math.max(w, 0.02) * k, 1, Math.max(d, 0.02) * k);
  const m = new THREE.Mesh(geo, mat(color, family));
  m.position.set(x, y + h / 2, z);
  m.rotation.y = ry || 0;
  return _add(m);
}

/* a true hip roof: covers EXACTLY w (x) by d (z) at the eaves, rises h to a
   RIDGE along the longer side (ridge length |w - d|), with triangular hipped
   ends. pyrRoof always meets at one point, which reads as a stretched pyramid
   on any long building; use this instead. w == d gives a pyramid. */
function mkHipRoof(x, y, z, w, h, d, ry, color, family) {
  w = Math.max(w, 0.02); d = Math.max(d, 0.02); h = Math.max(h, 0.02);
  const hw = w / 2, hd = d / 2, along = w >= d;
  const r = along ? (w - d) / 2 : (d - w) / 2;
  const A = [-hw, 0, -hd], B = [hw, 0, -hd], C = [hw, 0, hd], D = [-hw, 0, hd];
  const P = along ? [-r, h, 0] : [0, h, -r], Q = along ? [r, h, 0] : [0, h, r];
  const tris = along
    ? [[A, P, Q], [A, Q, B], [D, C, Q], [D, Q, P], [A, D, P], [B, Q, C], [A, B, C], [A, C, D]]
    : [[A, P, B], [B, P, Q], [B, Q, C], [D, Q, P], [D, C, Q], [A, D, P], [A, B, C], [A, C, D]];
  const pos = [];
  tris.forEach((t) => t.forEach((v) => pos.push(v[0], v[1], v[2])));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  /* wind every face outward (normal away from the roof's centre line) */
  const p = geo.attributes.position, a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
    const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
    const m = new THREE.Vector3().addVectors(a, b).add(c).divideScalar(3);
    const out = m.y < 1e-6 ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(along ? (Math.abs(m.x) > r ? m.x : 0) : m.x, 0.001, along ? m.z : (Math.abs(m.z) > r ? m.z : 0));
    if (n.dot(out) < 0) { p.setXYZ(i + 1, c.x, c.y, c.z); p.setXYZ(i + 2, b.x, b.y, b.z); }
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat(color, family));
  m.position.set(x, y, z); m.rotation.y = ry || 0;
  return _add(m);
}

/* ------------------------------------------------------------ registry */
/* furniture cultures, in sheet order. The first eleven are the harvested ones; the rest are the
   interiors-phase sets (kits/catalog/krator-master-furniture-<culture>.js), each registered by its
   own file through FURN_CULTURE() below, which adds its palette and its socket pack. 'generic' and
   'scrap' are the poor-tier sets any culture's poor buildings pull from. */
const FURN_CULTURES = ['ancient', 'ancients-salvage', 'yuni-court', 'yuni-common', 'yuni-poor', 'sahelian', 'order', 'nomad', 'voth', 'iziz', 'beast-rider',
  'generic', 'scrap', 'lizardmen', 'eastabyss', 'xanadu', 'screamer', 'islander', 'republican', 'rustic', 'painted', 'reedlake', 'post-apoc', 'hykkousoi', 'scyvoi'];
/* FURN_CULTURE_INFO[culture] = { name, pack, influences, materials }: pack is the core/sockets
   culture pack (core/sockets/80-cultures.js mkCulture key) whose banner cloth the culture's
   tapestries and hangings share, so a dressed building and its furniture match; null = none yet. */
const FURN_CULTURE_INFO = {
  'ancient': { name: 'Ancients', pack: null }, 'ancients-salvage': { name: 'Ancients salvage', pack: null },
  'yuni-court': { name: 'Yuni court', pack: 'yuni' }, 'yuni-common': { name: 'Yuni', pack: 'yuni' }, 'yuni-poor': { name: 'Yuni poor', pack: 'yuni' },
  'sahelian': { name: 'Sahelian', pack: 'yuni' }, 'order': { name: 'The Order', pack: 'yuni' }, 'nomad': { name: 'Eastern Nomads', pack: null },
  'voth': { name: 'Voth', pack: 'voth' }, 'iziz': { name: 'Iziz', pack: 'iziz' }, 'beast-rider': { name: 'Beast Riders', pack: 'beast-rider' }
};
/* wealth tiers (kits/furniture/SPEC.md): a piece's wealth band, the ROOM wealth (0-1) it suits.
   poor sets are the generic ones; common uses a culture's regional materials; court is bespoke. */
const FURN_TIERS = { poor: [0, 0.35], common: [0.3, 0.75], court: [0.7, 1] };
/* register a culture: its palette (FPAL[key]) and info, before its pieces. Idempotent on the key. */
function FURN_CULTURE(key, info) {
  if (FURN_CULTURES.indexOf(key) < 0) FURN_CULTURES.push(key);
  if (info && info.palette) { FPAL[key] = Object.assign(FPAL[key] || {}, info.palette); delete _famRev[key]; }
  FURN_CULTURE_INFO[key] = Object.assign(FURN_CULTURE_INFO[key] || {}, info || {}, { palette: undefined });
  return FURN_CULTURE_INFO[key];
}
const PLANT_CLIMATES = ['hypertropic', 'tropic', 'temperate', 'cold'];
const PLANT_ARIDITY = ['arid', 'semiarid', 'subhumid', 'humid'];
const ASSET_CULTURES = ['voth', 'beast-rider'];
/* building types (repo README): civic, market/shop, tavern/inn, industry, farm,
   single-family dwelling, multi-family dwelling, infrastructure, religious, funerary.
   Same slugs as Yuni's BUILDING_TAGS. A building carries several in types: [...];
   `family` stays as its one-word grouping (housing civic religious industrial defensive trade guild). */
const BUILDING_TYPES = ['civic', 'market', 'shop', 'tavern', 'inn', 'industry', 'farm', 'dwelling-single',
  'dwelling-multi', 'infrastructure', 'religious', 'funerary'];

/* The furniture entry (kits/furniture/SPEC.md "The entry"):
     FURN({ key, name, culture, type, setting, rooms: [...], w, d, h, variants, variantNames,
            variantDims, anchor, clearance: {front, back, left, right}, materials: [...], build(F) })
   setting: indoor | outdoor | both.  anchor: floor | wall | ceiling | surface.
   Every piece is authored in the FLOOR frame (origin = footprint centre at the
   bottom of the piece, +z front); anchor tells a placer where it mounts:
     floor   — stands on the floor at y = floorY
     wall    — stands at floor level, back face (local z = -d/2) flush to a wall; a HUNG wall piece (wall art,
               a frieze, a pennant string: furnWallHung) is lifted to its mounting height, see furnAnchorY()
     ceiling — hangs: its top (local y = h) meets the ceiling, see furnAnchorY()
     surface — stands on a table, shelf or counter top at y = surfaceY
   materials are canonical names from CATALOG_MATERIALS below.
   Back-compat: an old entry with room: 'x' is normalised to rooms: ['x'], and
   room always holds rooms[0] for code that still reads it. */
const FURN_SETTINGS = ['indoor', 'outdoor', 'both'];
const FURN_ANCHORS = ['floor', 'wall', 'ceiling', 'surface'];
const FURN_TYPES = ['table', 'chair', 'bench', 'seating', 'bed', 'storage', 'shelf', 'desk', 'lamp', 'stove',
  'altar', 'shrine', 'fountain', 'statue', 'monument', 'planter', 'rug', 'screen', 'banner', 'counter',
  'stall', 'rack', 'workstation', 'loom', 'well', 'pen', 'tomb', 'vessel', 'shelter', 'weapon', 'debris',
  'ladder', 'board', 'stack', 'brazier', 'book', 'tool', 'art', 'food', 'drink', 'supply'];
/* 'art' is wall-mounted art (a mask, a plate, a painted panel, a mounted skull): anchor wall,
   no walk-up access. Tapestries and hangings are 'banner'. */
/* the trade or occupation a work item serves (2026-10): every entry of krator-master-furniture-jobs.js
   carries `job: '<one of these>'` next to its type, and the sheet's Jobs page has a row per job. The trade
   roles FK.ROLES.trade registers (forge, anvil, vat ...) are work furniture too: they sit on the Jobs page
   by their roleSet, a row per culture, and carry no job. verify.py rejects a job not listed here. */
const FURN_JOBS = ['farming', 'fishing', 'salt', 'oil', 'smithing', 'milling', 'warehousing', 'brewing',
  'weaving', 'tanning', 'pottery', 'carpentry', 'mining', 'herding', 'trading'];
const FURNS = [], FURN_BY_KEY = {};
function FURN(o) {
  if (FURN_BY_KEY[o.key]) { console.error('duplicate furniture key', o.key); return; }
  if (!o.culture || FURN_CULTURES.indexOf(o.culture) < 0) { console.error('furniture ' + o.key + ': bad culture ' + o.culture); return; }
  o.variants = o.variants || 1;
  if (!o.rooms) o.rooms = o.room ? [o.room] : ['hall'];
  else if (typeof o.rooms === 'string') o.rooms = [o.rooms];
  o.room = o.rooms[0];
  /* tier and wealth band: given, or read off the culture name (yuni-court, yuni-poor), else common */
  if (!o.tier) o.tier = /-court$/.test(o.culture) ? 'court' : /-poor$/.test(o.culture) || o.culture === 'generic' || o.culture === 'scrap' ? 'poor' : 'common';
  if (!o.wealth) o.wealth = (FURN_TIERS[o.tier] || [0, 1]).slice();
  FURNS.push(o); FURN_BY_KEY[o.key] = o;
}
/* the y at which to build a furniture piece so it sits on its anchor:
   at = { floorY, surfaceY, ceilingY }; variant picks variantDims. */
/* wall pieces that hang rather than stand: wall art (a mask, a skull, antlers, a plate) centred at eye height,
   friezes and pennant strings near the top of the wall. Everything else on a wall stands on the floor. */
const FURN_WALL_HUNG = { art: 'eye', frieze: 'top', pennants: 'top' };
function furnWallHung(A) {
  if (!A || A.anchor !== 'wall') return null;
  if (A.role && FURN_WALL_HUNG[A.role]) return FURN_WALL_HUNG[A.role];
  return A.type === 'art' ? 'eye' : null;
}
function furnAnchorY(A, variant, at) {
  at = at || {};
  const floorY = at.floorY || 0;
  if (A.anchor === 'surface') return at.surfaceY != null ? at.surfaceY : floorY;
  const hung = furnWallHung(A);
  if (hung) {
    const h = entryDims(A, variant).h, top = at.ceilingY != null ? at.ceilingY - 0.15 : floorY + 2.6;
    const y = hung === 'eye' ? floorY + 1.6 - h / 2 : Math.min(top, floorY + 2.7) - h;
    return Math.max(floorY, Math.min(y, top - h));
  }
  if (A.anchor === 'ceiling' && at.ceilingY != null) return at.ceilingY - entryDims(A, variant).h;
  return floorY;
}

/* Canonical material names (the seed of the planned registry in core/README.md
   "Planned: a material registry"). Each catalog family string maps onto one
   canonical name; a piece's `materials` lists the canonical names it uses. */
const CATALOG_MATERIALS = {
  timber:    { tags: ['wood'], families: ['wood', 'plank'] },
  bark:      { tags: ['wood', 'organic'], families: ['bark'] },
  stone:     { tags: ['stone'], families: ['stone'] },
  plaster:   { tags: ['stone'], families: ['plaster'] },
  concrete:  { tags: ['stone'], families: ['concrete'] },
  roofTile:  { tags: ['stone'], families: ['roof', 'dome'] },
  metal:     { tags: ['metal'], families: ['metal'] },
  rustSteel: { tags: ['metal', 'weathered'], families: ['rust'] },
  glass:     { tags: ['glass'], families: ['glass'] },
  cloth:     { tags: ['fabric'], families: ['cloth'] },
  rope:      { tags: ['fabric', 'organic'], families: ['rope'] },
  thatch:    { tags: ['organic'], families: ['thatch'] },
  foliage:   { tags: ['organic'], families: ['leafy', 'plant'] },
  skin:      { tags: ['organic'], families: ['skin'] },
  emissive:  { tags: ['glow'], families: ['glow'] },
  food:      { tags: ['organic'], families: ['food'] },
  /* the interiors-phase regional materials (kits/furniture/README.md "Materials by culture") */
  bamboo:    { tags: ['wood', 'organic'], families: ['bamboo'] },
  reed:      { tags: ['organic', 'fabric'], families: ['reed'] },
  hyperMahogany: { tags: ['wood'], families: ['mahogany'] },
  nacre:     { tags: ['organic', 'glossy'], families: ['nacre'] },
  gold:      { tags: ['metal', 'precious'], families: ['gold'] },
  bronze:    { tags: ['metal'], families: ['bronze'] },
  lacquer:   { tags: ['wood', 'glossy'], families: ['lacquer'] },
  ceramic:   { tags: ['stone', 'glossy'], families: ['ceramic', 'tile'] },
  obsidian:  { tags: ['stone', 'glossy'], families: ['obsidian'] },
  jade:      { tags: ['stone'], families: ['jade'] },
  bone:      { tags: ['organic'], families: ['bone', 'antler', 'shell'] },
  hide:      { tags: ['organic', 'fabric'], families: ['hide', 'fur', 'leather'] },
  wicker:    { tags: ['organic', 'wood'], families: ['wicker'] },
  plastic:   { tags: ['weathered'], families: ['plastic'] },
  unassigned:{ tags: [], families: [''] }
};
/* How the canonical names land in the two other material systems (core/README.md "Planned: a
   material registry" step 2). Ancients-lineage builds have MAT.* (core/materials/22-materials.js,
   68-mat-v5.js); Voth/Yuni-lineage builds have FAMMAT families. A host exporting a catalog piece
   maps each name here; a name with no entry on a side falls back to that side's generic surface. */
const CORE_MATERIAL_MAP = {
  timber: { ancients: 'MAT.slab', fammat: 'wood' }, bark: { ancients: 'MAT.slab', fammat: 'trunk' },
  stone: { ancients: 'MAT.rock', fammat: 'stone' }, plaster: { ancients: 'MAT.white', fammat: 'plaster' },
  concrete: { ancients: 'MAT.rock', fammat: 'stone' }, roofTile: { ancients: 'MAT.slab', fammat: 'roof' },
  metal: { ancients: 'MAT.pipe', fammat: 'metal' }, rustSteel: { ancients: 'MAT.rust', fammat: 'metal' },
  glass: { ancients: 'MAT.glass', fammat: 'glass' }, cloth: { ancients: null, fammat: 'cloth' },
  foliage: { ancients: 'MAT.vine', fammat: 'leaf' }, emissive: { ancients: 'MAT.strip', fammat: null },
  bronze: { ancients: 'MAT.pipe', fammat: 'metal' }, gold: { ancients: 'MAT.pipe', fammat: 'metal' },
  obsidian: { ancients: 'MAT.darkGlass', fammat: 'stone' }, plastic: { ancients: 'MAT.white', fammat: null },
  ceramic: { ancients: 'MAT.slab', fammat: 'stone' }, hyperMahogany: { ancients: 'MAT.slab', fammat: 'wood' },
  bamboo: { ancients: null, fammat: 'wood' }, reed: { ancients: null, fammat: 'trunk' }
};
const FAMILY_TO_MATERIAL = {};
for (const k in CATALOG_MATERIALS) for (const f of CATALOG_MATERIALS[k].families) FAMILY_TO_MATERIAL[f] = k;
const PLANTS = [], PLANT_BY_KEY = {};
function PLANT(o) {
  if (PLANT_BY_KEY[o.key]) { console.error('duplicate plant key', o.key); return; }
  if (PLANT_CLIMATES.indexOf(o.climate) < 0) { console.error('plant ' + o.key + ': bad climate ' + o.climate); return; }
  if (PLANT_ARIDITY.indexOf(o.aridity) < 0) { console.error('plant ' + o.key + ': bad aridity ' + o.aridity); return; }
  o.variants = o.variants || 1;
  PLANTS.push(o); PLANT_BY_KEY[o.key] = o;
}
/* ASSET({key,name,culture,family,districts,wealth,w,d,h,variants,variantDims,build})
   — a building. w/d/h are the overall footprint and height in metres. When variants
   differ a lot in size (a 20 m tower and an 8 m hovel under one key), give
   variantDims: [{w,d,h}, ...] with one entry per variant and w/d/h as the largest. */
const ASSETS = [], ASSET_BY_KEY = {};
function ASSET(o) {
  if (ASSET_BY_KEY[o.key]) { console.error('duplicate asset key', o.key); return; }
  if (!o.culture || ASSET_CULTURES.indexOf(o.culture) < 0) { console.error('asset ' + o.key + ': bad culture ' + o.culture); return; }
  o.variants = o.variants || 1; o.family = o.family || 'other'; o.districts = o.districts || []; o.wealth = o.wealth || [0, 1];
  o.types = o.types || [];
  ASSETS.push(o); ASSET_BY_KEY[o.key] = o;
}
/* declared size of one variant: its own entry if given, else the entry's overall box.
   Works for ASSET, FURN and PLANT alike — any of them may carry variantDims. */
function entryDims(A, v) {
  const vd = A.variantDims && A.variantDims[v || 0];
  return { w: (vd && vd.w) || A.w, d: (vd && vd.d) || A.d, h: (vd && vd.h) || A.h };
}
const assetDims = entryDims;

/* ------------------------------------------------- furniture palette
   kits/furniture/SPEC.md "Colour": a piece names its colours, the host owns them.
   FPAL[culture] maps a named key to a colour; a piece asks for F.col('timber') and
   gets its own culture's timber. F.cols([...keys]) resolves a list, and F.pick() of
   an array of palette keys returns the picked key's colour (one draw from the seed,
   like any pick). F.shade(keyOrColour, amt) takes either. A host that wants another
   look for a culture replaces FPAL[culture] (or single keys) before building.
   Keys are role + hue + tone: timber, timberDark, ironDeep, clothRed, flameLight ...
   Tone bands by lightness: Black < Deep < Dark < (none) < Light < Pale < White.
   Generated from the harvested pieces' literals (nearest-colour clustering per
   culture, so a key may stand for a few near-identical originals); edit freely. */
const FPAL = {
  'ancient': {
    alloy: 0xe6e4dc,
    amber: 0xffb755,
    blackIron: 0x1c1c1c, blackIronLight: 0x2a2a2a,
    clothMadder: 0xb5432f, clothTurquoise: 0x4a7a9c, clothOchre: 0xc9a24a, clothBirch: 0xc9a878,
    clothBone: 0xe8dcc0,
    electric: 0x6fd0ff,
    glassBlack: 0x14161a, glassSky: 0x5a9ec9,
    ice: 0xbfe8ff,
    pewter: 0x8a8f92,
    redCopper: 0xa0522d,
    silver: 0xb4b0a2,
    steel: 0x5a5f62, steelLight: 0x6e7376,
    stoneGraphite: 0x3a3f3e, stoneGranite: 0x6e6a5e, stoneClay: 0xb56a42, stoneTaupe: 0x8a8478,
    timberOak: 0x8a6a4e,
    unlit: 0x2a2f2e,
    verdigris: 0x6fe8e0,
    whiteHot: 0xfff2c9,
    /* the arcology's fittings (Noah's Regret, 2026-10): a painted dark grey, the earth and the greens of its beds,
       ripe fruit, still water */
    paintGrey: 0x3a3c3e, soil: 0x4a3a2a, leafGreen: 0x4e7a34, leafLight: 0x6a9440, leafDark: 0x3f6a30,
    fruitRed: 0xb83224, water: 0x4a6a72, rust: 0x5a3a28,
    /* the intact buildings' interiors (2026-10): upholstery on the moulded seats and beds, the medical and server
       status lamps, a sample vial's violet */
    clothSlate: 0x5e6b78, clothDove: 0xd2d5d8, clothTeal: 0x3d7a80,
    glowGreen: 0x7dffa0, glowRed: 0xff5a48, glowViolet: 0xb48cff
  },
  'ancients-salvage': {
    blackIronDark: 0x1c1c1c, blackIron: 0x2a2a2a,
    clothTan: 0xb08a5a, clothOchre: 0xc9a24a, clothBone: 0xe8dcc0,
    fire: 0xff6a2e,
    gilt: 0xc9a227,
    pewter: 0x8a8f92,
    plasterTan: 0xb08250, plasterTanLight: 0xbc8e58, plasterTanLight2: 0xc89a62, plasterBirch: 0xd4a66e,
    redCopper: 0x8a3a2a,
    rustRusset: 0x7a3b22,
    silver: 0xb4b0a2, silverLight: 0xc0bcae,
    steel: 0x6e7376,
    stoneClay: 0xb56a42, stoneBirch: 0xc9a878, stoneGrey: 0xb0aaa0,
    timberOak: 0x8a6a4e,
    whiteHot: 0xfff2c9
  },
  'yuni-court': {
    amber: 0xffb755,
    blackIron: 0x1c1c1c,
    brass: 0xc29a44,
    clothViolet: 0x6a3a7a, clothIndigo: 0x2e5a8a, clothJade: 0x2f8a6a, clothCrimson: 0x9c3024,
    clothMadder: 0xb5432f, clothSaffron: 0xd8a030, clothIvory: 0xf0ece0,
    copper: 0xc8642a,
    ember: 0xd9762c,
    fire: 0xff8a3a,
    gilt: 0xc9a227,
    iron: 0x4a4038,
    plasterIvory: 0xf2eee2,
    stoneBlack: 0x14161a, stoneMoss: 0x3a6a3a, stoneNavy: 0x1e4e90, stoneTurquoise: 0x2c8aa0,
    stoneCobalt: 0x2a6ab0, stoneTurquoiseLight: 0x4a7a9c, stoneAzure: 0x3a86c8, stoneOchre: 0xc9a24a,
    stoneSky: 0x58a8d8, stoneBone: 0xe8dcc0,
    timberWalnut: 0x5c432c, timberTeak: 0x9a7a4e,
    whiteHot: 0xfff2c9
  },
  'yuni-common': {
    amber: 0xffb755,
    brass: 0xb08432,
    clothViolet: 0x6a3a7a, clothIndigo: 0x2e5a8a, clothJade: 0x2f8a6a, clothMustard: 0x94824a,
    clothMadder: 0xb83a2e, clothTurquoise: 0x4a7a9c, clothOrange: 0xc8642a, clothFlax: 0xa89256,
    clothSaffron: 0xd8a030, clothTan: 0xb08a5a, clothOchre: 0xc9a24a, clothStraw: 0xc8b272,
    clothIvory: 0xf2eee2,
    ember: 0xd9762c,
    gilt: 0xc9a227,
    plasterMadder: 0xb5432f, plasterTan: 0xbc8e58, plasterTanLight: 0xc89a62, plasterBirch: 0xd4a66e,
    plasterBone: 0xe8dcc0,
    produceLeaf: 0x7a9a3e,
    ropeMustard: 0x85743e, ropeFlax: 0xb8a262,
    silver: 0xb4b0a2,
    stoneBlack: 0x14161a, stoneNavy: 0x1e4e90, stoneTurquoise: 0x2c8aa0, stoneLaterite: 0xa85832,
    stoneCobalt: 0x2a6ab0, stoneClay: 0xb8633a, stoneAzure: 0x3a86c8, stoneClayLight: 0xc47044,
    stoneSky: 0x58a8d8, stoneIvory: 0xf0ece0,
    thatchFlax: 0xb8a262, thatchStraw: 0xc8b272,   /* the grain bin's lid (re-harvest 2026-10-05) */
    timberWalnut: 0x5c432c, timberChestnutDark: 0x6a4e34, timberChestnut: 0x7a5a3c, timberOak: 0x8a6a4e,
    timberTeak: 0x9a7a4e, timberPine: 0xa8865c
  },
  'yuni-poor': {
    clothIndigo: 0x2e5a8a, clothMadder: 0xb83a2e, clothOrange: 0xc8642a, clothSaffron: 0xd8a030,
    clothIvory: 0xf0ece0,
    ember: 0xd9762c,
    plasterTan: 0xb08250,
    stoneBlack: 0x14161a, stoneLaterite: 0xa85832, stoneGranite: 0x7e7a72, stoneClay: 0xb4683e,
    stoneClayLight: 0xc07448,
    thatchFlax: 0xb8a262, thatchStraw: 0xc8b272,
    timberWalnut: 0x5c432c
  },
  'sahelian': {
    clothIndigo: 0x2e5a8a, clothBone: 0xe8dcc0, clothIvory: 0xf0ece0,
    ember: 0xd9762c,
    plasterSoot: 0x1c1c1c, plasterLaterite: 0xa85c36, plasterMadder: 0xb5432f, plasterClayDark: 0xb4683e,
    plasterClay: 0xc07448,
    stoneBlack: 0x14161a, stoneTaupe: 0x8a8172,
    thatchStraw: 0xc8b272,
    timberSepia: 0x4a3624, timberOak: 0x8a6a4e, timberTeak: 0x9a7a4e
  },
  'order': {
    blackIron: 0x2a2622,
    brass: 0xb08432,
    clothGraphite: 0x3c362c, clothForest: 0x2e4a3a, clothWine: 0x5a2a2a, clothDusk: 0x3a3a5a,
    clothWalnut: 0x6a3a2a, clothMoss: 0x3a6a3a, clothTeak: 0x7a5a2a, clothRusset: 0x8a3a2a,
    clothGranite: 0x7a7466, clothMadder: 0xb5432f, clothTurquoise: 0x4a7a9c, clothBone: 0xe8dcc0,
    clothIvory: 0xe8e4d6,
    ember: 0xd9762c,
    gilt: 0xc9a227,
    stoneSoot: 0x1c1c1c, stoneOchre: 0xc9a24a, stoneGrey: 0x9a9080, stoneChalk: 0xe8e8e8,
    timberWalnut: 0x5c432c, timberOak: 0x8a6a4e, timberTeak: 0x9a7a4e, timberStraw: 0xd8c48a,
    whiteHot: 0xfff2c9
  },
  'nomad': {
    amber: 0xffb755,
    blackIron: 0x2a2622,
    clothViolet: 0x6a3a7a, clothIndigo: 0x2e5a8a, clothJade: 0x2f8a6a, clothMud: 0x8a7a54,
    clothMadder: 0xb83a2e, clothOrange: 0xc8642a, clothSaffron: 0xd8a030,
    ember: 0xd9762c,
    hideWalnut: 0x4e3222, hideChestnut: 0x6a4630, hideOak: 0x8a5c3c,
    ropeMustard: 0x85743e,
    stoneBlack: 0x14161a, stoneGranite: 0x7a7264,
    timberSepia: 0x4e3a28, timberUmber: 0x5e5236
  },
  'voth': {
    amber: 0xe89a3c, amberLight: 0xffb04a,
    blackIron: 0x2a2a2a,
    brass: 0xa88a3c,
    candle: 0xffe0a0,
    clothPlum: 0x8a2d6a, clothIndigo: 0x2d6a8a, clothTeal: 0x2f8f8a, clothJade: 0x2f8f6a,
    clothCrimson: 0x9c2d2d, clothMud: 0x8a7a5c, clothGold: 0xc9a227, clothTaupe: 0x8a8a78,
    clothKhaki: 0x9a8a6c, clothOrange: 0xe07a2a, clothPine: 0xa88868, clothGreyDark: 0x9a8a78,
    clothGrey: 0x9a9a88, clothBirch: 0xc0a878, clothSand: 0xc9b58a, clothLinenDark: 0xd8c9a0,
    clothLinen: 0xd8cdb0, clothLinenLight: 0xdad0b8, clothBone: 0xe8e0c8,
    coal: 0xb8461f,
    copper: 0xb5723a,
    ember: 0xd9762c,
    fireDark: 0xff6a2e, fire: 0xff8a3c,
    flameDark: 0xffd23c, flame: 0xffc861,
    gilt: 0xd8b34a,
    glassCharcoal: 0x1a2028, glassSlate: 0x3a5a68, glassCrimson: 0x8a2020, glassGranite: 0x6a6a52,
    glassMud: 0x7a6a4a, glassMist: 0x8fb8c4, glassChalk: 0xcfe3e8,
    ironDark: 0x3a3630, iron: 0x4a443c,
    leafMoss: 0x54632f, leafMossLight: 0x5e6b3a, leafOlive: 0x6a7a3a, leafOliveLight: 0x7a8a42,
    leaf: 0x7a9a3a, leafMustard: 0x8a7a4a, leafMadder: 0xb23a2a, leafOchreDark: 0xc9a24a,
    leafOchre: 0xd8c060,
    pewter: 0x8a8a8a,
    plasterBone: 0xe6dcc0,
    steel: 0x6b6258, steelLight: 0x7a6f5c,
    stoneSoot: 0x1a1512, stoneEbony: 0x2a2620, stoneGraphite: 0x3c362c, stoneUmber: 0x4a443a,
    stoneWine: 0x6b1f1f, stoneUmberLight: 0x6a5248, stoneMud: 0x8a7454, stoneGranite: 0x7a7466,
    stoneJade: 0x5a8a7a, stoneTaupe: 0x8a8474, stoneKhaki: 0x9a8464, stoneKhakiLight: 0x9d9278,
    stoneGrey: 0x9a9484, stoneMist: 0x6ecbe0, stoneLinen: 0xc8bfa6, stoneLinenLight: 0xd8d0be,
    timberWalnut: 0x5a4028, timberUmber: 0x5a4a38, timberUmberLight: 0x6a5c48, timberChestnut: 0x7a5a3a,
    timberTeak: 0x8a6a3a, timberMud: 0x7a6a52, timberMudLight: 0x877558, timberTeakLight: 0x9a7a4a,
    timberTaupe: 0x8b8069, timberKhaki: 0x9a8a68, timberTaupeLight: 0x8c8579, timberGrey: 0x958e80,
    timberBirch: 0xc8a878, timberSand: 0xd8cca0
  },
  'iziz': {
    amber: 0xffb04a,
    blackIron: 0x2a2018,
    bronzeDark: 0x6e5428, bronze: 0x8a6a3a, bronzeLight: 0x9a7a3c,
    candleDark: 0xffd28a, candle: 0xffe9a8,
    clothTeal: 0x2f8f8a, clothCrimson: 0x9c2d2d, clothCobalt: 0x3a6fb0, clothViolet: 0x7a4fa0,
    clothOrange: 0xe07a2a, clothGold: 0xd4af37, clothBone: 0xe8dcc4,
    electricDark: 0x5cc4ff, electric: 0x8fd4ff,
    flame: 0xffd34a,
    gilt: 0xd9b23c, giltLight: 0xe8c14a,
    glassChalk: 0xd8ecf0,
    iceDark: 0x9fdfff, ice: 0xbfe8ff,
    leaf: 0x3a8a46, leafOlive: 0x4a8a50, leafVermilion: 0xc9442a,
    stoneGranite: 0x6a6052, stoneMud: 0x8c8068, stoneKhaki: 0x9a8e74, stoneLinen: 0xc8bfa6,
    timberSepia: 0x4a3a2a, timberChestnut: 0x6a4a2a, timberFlax: 0xc2a165,
    whiteHot: 0xfff0c0
  },
  'beast-rider': {
    amber: 0xffb066,
    barkUmber: 0x5a4a38,
    brass: 0xa88a3c,
    candle: 0xffd28a,
    clothTeal: 0x2f8f8a, clothVermilion: 0xc9442a, clothSaffron: 0xd8a23a, clothTaupe: 0x9a8878,
    clothGrey: 0xa89a86, clothSand: 0xc9b58a, clothIvory: 0xe8ded0,
    glassLeaf: 0x6a8a3a,
    hideOak: 0x8a6a48,
    ice: 0x4ac8b0,
    iron: 0x3a362e,
    leafMoss: 0x3a6a2c, leafOlive: 0x4a7a32, leaf: 0x8a9a46, leafMadder: 0xb8342a,
    leafMadderLight: 0xb84a2a, leafVermilion: 0xd2542a, leafOchre: 0xc9a24a,
    pewter: 0x8a8f92,
    plasterSlate: 0x3a5a68,
    redCopper: 0x9c2d2d,
    steel: 0x5a5a5a,
    stoneCharcoal: 0x2a2f38, stoneTaupe: 0x8a8478,
    timberEbony: 0x2a2620, timberSepia: 0x4a3f30, timberWalnut: 0x6a3a2a, timberUmber: 0x6a5c48,
    timberMudDark: 0x7a6a4e, timberMud: 0x8a7558, timberStraw: 0xc9a86a
  }
};
/* the colour a palette key names for a culture; throws on an unknown key so a typo fails the build */
function furnCol(culture, key) {
  if (typeof key === 'number') return key;
  const p = FPAL[culture];
  if (p && p[key] != null) return p[key];
  throw new Error('no palette key "' + key + '" for culture ' + culture);
}

/* texture splits by palette key (core/materials/PLAN.md, "Catalog furniture audit"): a part whose key wants a library
   set of its own gets a texture family on top of the family its builder passed, so a host can map it (f_<texFamily>,
   falling back to f_<family>). The render family, the look, the batch's grouping by family and the declared
   `materials` are unchanged. [key pattern, families it applies to, texture family]. A part splits only when every key
   of the culture that has its colour matches, so a hex two keys share never splits; shaded colours do not split. */
const FAMILY_SPLITS = [
  [/^feather/, ['hide', 'plant', 'plastic'], 'feather'],
  [/^tyre/, ['plastic', 'metal'], 'rubber'],
  [/^clay/, ['stone'], 'clay'],
  [/^obsidian/, ['lacquer'], 'obsidian'],
  [/^(pewter|tin|tinMirror)$/, ['metal'], 'pewter'],
  [/^paint/, ['wood', 'plank'], 'paint'],
  [/^(ash|ashCold|earthAsh|stoneAsh|coal|coalBed|coalDeep|stoneCoal)$/, ['stone', 'plaster'], 'ash'],
  [/^paper/, ['cloth', 'wood', 'bark'], 'paper'],
  [/^tapa/, ['cloth'], 'tapa'],
  /* biome fruit (biomes/FRUIT.md; krator-master-furniture-generic-fruit.js): each fruit part by the surface it shows */
  [/^fruit(Mahogany|Mast|MastHusk|Acorn|Mesquite|PinyonNut|Rattlepod|TamarindShell|FernEgg|CacaoRed|CacaoGold|CacaoOrange|LotusPod|Wingnut|SilkGreen|AvenuePod)$/, ['food'], 'fruitShell'],
  [/^fruit(GateRind|TideHusk|StiltPod)$/, ['food'], 'fruitHusk'],
  [/^fruit(ScaleRed|CycadRed|PinyonCone)$/, ['food'], 'fruitScale'],
  [/^fruit(ScaleFlesh|GatePulp|FernMeal|BallmelonFlesh|StiltFlesh|FigFlesh|TunaFlesh|PitayaFlesh|CacaoPulp|TamarindPulp|PandanPaste|MesquiteCake|YuccaRoast|SilkFloss|WhorlCream)$/, ['food'], 'fruitFlesh'],
  [/^fruit(TideJelly|RowanJelly)$/, ['food'], 'fruitJelly'],
  [/^fruit(ArilSeed|StiltSeed|PinyonKernel|LotusSeed|UmbelSeed|MahoganySeed|RattleBean|Raisin)$/, ['food'], 'fruitSeed'],
  [/^fruit(Apple|AppleGreen|Pear|Orange|Lemon|Grape|Plum|Berry|Banana|Aril|Rowan|Bilberry|Ballmelon|BellDate|Date|Tuna|Juniper|JuniperDry|Madrone|Fig|Pitaya|Plantain|ArbutusRed|ArbutusOrange|WhorlOlive|PandanKey|Banksia)$/, ['food'], 'fruitSkin'],
  /* new fruit keys split by their name's last word (fruitCocoHusk, fruitCocoShell, fruitCocoFlesh, fruitCocoWater) */
  [/^fruit\w+(Husk|Rind)$/, ['food'], 'fruitHusk'],
  [/^fruit\w+(Shell|Nut|Capsule)$/, ['food'], 'fruitShell'],
  [/^fruit\w+(Scale|Scales|Cone)$/, ['food'], 'fruitScale'],
  [/^fruit\w+(Flesh|Pulp|Meal|Paste|Cake)$/, ['food'], 'fruitFlesh'],
  [/^fruit\w+(Jelly|Water|Juice|Syrup)$/, ['food'], 'fruitJelly'],
  [/^fruit\w+(Seed|Seeds|Kernel|Bean)$/, ['food'], 'fruitSeed'],
  [/^fungus/, ['food'], 'fungus'],
  [/^fruit/, ['food'], 'fruitSkin']          /* every other fruit part (tips, stalks, bracts, lantern pods): a skin */
];
const _famRev = {};
/* the fruit pieces shade their colours (F.shade) for ridges and studs; a shaded food colour with no palette key of its
   own takes the nearest fruit or fungus key's split, when it is within a shade's reach of it (RGB distance 64) */
function _nearFruitKeys(rev, color) {
  let best = null, bd = 64 * 64;
  const r = color >> 16 & 255, g = color >> 8 & 255, b = color & 255;
  rev.forEach((ks, c) => {
    if (!ks.every(k => /^(fruit|fungus)/.test(k))) return;
    const dr = (c >> 16 & 255) - r, dg = (c >> 8 & 255) - g, db = (c & 255) - b, d = dr * dr + dg * dg + db * db;
    if (d < bd) { bd = d; best = ks; }
  });
  return best;
}
function furnFamily(culture, color, family) {
  if (!family || typeof color !== 'number') return family;
  let rev = _famRev[culture];
  if (!rev) {
    rev = _famRev[culture] = new Map();
    const p = FPAL[culture] || {};
    for (const k in p) if (typeof p[k] === 'number') { const l = rev.get(p[k]); if (l) l.push(k); else rev.set(p[k], [k]); }
  }
  let keys = rev.get(color);
  if (!keys && family === 'food') keys = _nearFruitKeys(rev, color);
  if (!keys) return family;
  for (const [re, from, to] of FAMILY_SPLITS) if (from.indexOf(family) >= 0 && keys.every(k => re.test(k))) return to + '/' + family;
  return family;
}

/* local frame: origin at footprint centre on the ground; +z is FRONT */
function makeFrame(x, z, ry, opt) {
  opt = opt || {};
  const F = { x, z, ry: ry || 0, y: opt.y || 0, seed: opt.seed || 1, variant: opt.variant || 0, wealth: opt.wealth == null ? 0.5 : opt.wealth };
  let st = (F.seed * 2654435761) >>> 0;
  F.rnd = () => { st = (Math.imul(st, 1664525) + 1013904223) >>> 0; return st / 4294967296; };
  F.rr = (a, b) => a + (b - a) * F.rnd();
  const ff = (c, fam) => furnFamily(F.asset ? F.asset.culture : '', c, fam);
  F.col = (key) => furnCol(F.asset ? F.asset.culture : '', key);
  F.cols = (keys) => keys.map(F.col);
  F.pick = (arr) => {
    const v = arr[Math.floor(F.rnd() * arr.length) % arr.length];
    return (typeof v === 'string' && F.asset && FPAL[F.asset.culture] && FPAL[F.asset.culture][v] != null) ? F.col(v) : v;
  };
  F.chance = (p) => F.rnd() < p;
  /* engine helpers on the frame, so a piece need not reach for host globals */
  F.shade = (c, amt) => shade(typeof c === 'string' ? F.col(c) : c, amt); F.TAU = TAU;
  const toWorld = (lx, lz) => {
    const c = Math.cos(F.ry), s = Math.sin(F.ry);
    return [F.x + lx * c + lz * s, F.z - lx * s + lz * c];
  };
  /* move the frame origin to local (lx, lz). A piece authored off-centre calls
     F.shift(-cx, -cz) first, so its footprint centre lands on the origin. */
  F.shift = (lx, lz) => { const [x2, z2] = toWorld(lx, lz); F.x = x2; F.z = z2; };
  F.box = (lx, ly, lz, w, h, d, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkBox(x2, F.y + ly, z2, w, h, d, F.ry + (ry2 || 0), color, ff(color, family)); };
  F.cyl = (lx, ly, lz, r, h, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkCyl(x2, F.y + ly, z2, r, h, F.ry + (ry2 || 0), color, ff(color, family)); };
  F.cone = (lx, ly, lz, r, h, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkCone(x2, F.y + ly, z2, r, h, F.ry + (ry2 || 0), color, ff(color, family)); };
  F.dome = (lx, ly, lz, r, h, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkDome(x2, F.y + ly, z2, r, h, F.ry + (ry2 || 0), color, ff(color, family)); };
  F.blob = (lx, ly, lz, r, h, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkBlob(x2, F.y + ly, z2, r, h, F.ry + (ry2 || 0), color, ff(color, family)); };
  F.ball = (lx, ly, lz, r, color, family) => { const [x2, z2] = toWorld(lx, lz); mkBall(x2, F.y + ly, z2, r, color, ff(color, family)); };
  /* soft furnishings (mkPillow, mkBolster above): both CENTRED at ly. F.pillow returns top(lx, lz) in the pillow's own frame */
  F.pillow = (lx, ly, lz, w, h, d, ry2, color, family, o) => { const [x2, z2] = toWorld(lx, lz); return mkPillow(x2, F.y + ly, z2, w, h, d, F.ry + (ry2 || 0), color, ff(color, family), o); };
  F.bolster = (lx, ly, lz, len, r, ry2, color, family, o) => { const [x2, z2] = toWorld(lx, lz); mkBolster(x2, F.y + ly, z2, len, r, F.ry + (ry2 || 0), color, ff(color, family), o); };
  F.frustum = (lx, ly, lz, rBottom, rTop, h, ry2, color, family, sides) => { const [x2, z2] = toWorld(lx, lz); mkFrustum(x2, F.y + ly, z2, rBottom, rTop, h, F.ry + (ry2 || 0), color, ff(color, family), sides); };
  F.pyrRoof = (lx, ly, lz, w, h, d, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkPyrRoof(x2, F.y + ly, z2, w, h, d, F.ry + (ry2 || 0), color, ff(color, family)); };
  F.hipRoof = (lx, ly, lz, w, h, d, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkHipRoof(x2, F.y + ly, z2, w, h, d, F.ry + (ry2 || 0), color, ff(color, family)); };
  /* a beam's roll must come from the LOCAL frame, then turn with the building:
     setFromUnitVectors on the world direction picks the shortest rotation,
     whose roll depends on heading, so a sloped slab (roof, canopy, tent side)
     built at ry = 0 twisted about its own axis at any other ry. Identical at ry = 0. */
  const _bUp = new THREE.Vector3(0, 1, 0), _bDir = new THREE.Vector3(), _bQy = new THREE.Quaternion(), _bAxY = new THREE.Vector3(0, 1, 0);
  F.beam = (ax, ay, az, bx, by, bz, w, d, color, family) => {
    const [ax2, az2] = toWorld(ax, az), [bx2, bz2] = toWorld(bx, bz);
    const m = mkBeam(ax2, F.y + ay, az2, bx2, F.y + by, bz2, w, d, color, ff(color, family));
    if (F.ry && m) {
      _bDir.set(bx - ax, by - ay, bz - az);
      if (_bDir.lengthSq() > 1e-12) {
        m.quaternion.setFromUnitVectors(_bUp, _bDir.normalize()).premultiply(_bQy.setFromAxisAngle(_bAxY, F.ry));
      }
    }
  };
  F.rod = (ax, ay, az, bx, by, bz, r, color, family) => { const [ax2, az2] = toWorld(ax, az), [bx2, bz2] = toWorld(bx, bz); mkRod(ax2, F.y + ay, az2, bx2, F.y + by, bz2, r, color, ff(color, family)); };
  F.decal = (lx, ly, lz, w, h, ry2, key, paint, family) => { const [x2, z2] = toWorld(lx, lz); mkDecal(x2, F.y + ly, z2, w, h, F.ry + (ry2 || 0), key, paint, family); };
  F.css = cssCol;
  F.lamp = (lx, ly, lz, amp, rad) => { const [x2, z2] = toWorld(lx, lz); const l = new THREE.PointLight(0xffb066, amp || 1, rad || 10); l.position.set(x2, F.y + ly, z2); _add(l); };
  F.tree = (lx, lz, kind, h, ly) => treeHelper(F, lx, lz, kind, h, ly || 0);
  /* furniture a BUILDING places (an ASSET's build): a catalog piece at local (lx, ly, lz) turned lry, built
     into the same group with its own frame, and recorded as data (F.furniture; buildAsset copies it to the
     instance's userData.furniture). Everything a building puts in or around itself that is not its structure
     goes through here, so it is the catalog's piece, tagged, and visible to the life layer. o: { v, seed, setting } */
  F.furn = (key, lx, ly, lz, lry, o) => {
    o = o || {};
    const A = FURN_BY_KEY[key];
    if (!A) { (F.missing || (F.missing = [])).push(key); return null; }
    const [x2, z2] = toWorld(lx, lz), list = F.furniture || (F.furniture = []);
    const rec = { key: key, variant: o.v || 0, seed: o.seed || (F.seed * 31 + list.length + 1), lx: lx, ly: ly || 0, lz: lz, lry: lry || 0,
      x: x2, y: F.y + (ly || 0), z: z2, ry: F.ry + (lry || 0), setting: o.setting || 'outdoor' };
    const F2 = makeFrame(x2, z2, rec.ry, { y: rec.y, seed: rec.seed, variant: rec.variant, wealth: F.wealth });
    F2.asset = A;
    A.build(F2);
    list.push(rec);
    return rec;
  };
  return F;
}

const PAL = {
  pine: [0x1f3d24, 0x254a2a], olive: [0x6f7d42, 0x7d8a4a], palm: [0x2c8a5e, 0x3a9a68],
  cypress: [0x1e4a28, 0x2a5a34], shrub: [0x556b2f, 0x4a5e28], trunk: [0x5d5140, 0x6a5c48, 0x4e4536, 0x5a4028]
};
/* A generic tree. Builds an actual woody structure — tapered bole in stacked segments,
   primary limbs, branchlets, and foliage clustered at the limb ends — rather than a
   stick with a ball on it, and tops out at very close to h so the declared height is
   the real height. kind: pine | olive | palm | shrub | cypress (default). */
function treeHelper(F, lx, lz, kind, h, ly) {
  h = Math.max(h || 6, 0.5);
  ly = ly || 0;
  const bark = F.pick(PAL.trunk);
  /* a tapering bole in n segments, each leaning a little off the last */
  function bole(baseR, topR, top, n, lean) {
    let x = lx, z = lz, y = ly;
    const segH = top / n;
    for (let i = 0; i < n; i++) {
      const t = i / n, r = baseR + (topR - baseR) * t;
      const nx = x + F.rr(-lean, lean) * h * 0.02, nz = z + F.rr(-lean, lean) * h * 0.02;
      F.rod(x, y, z, nx, y + segH, nz, r, i % 2 ? shade(bark, 0.04) : bark, 'bark');
      x = nx; z = nz; y += segH;
    }
    return { x: x, z: z, y: y, r: topR };
  }
  /* a leafy cluster: a few overlapping blobs, jittered, so the crown has a silhouette */
  function cluster(cx, cy, cz, R, c, n) {
    for (let i = 0; i < (n || 3); i++) {
      const s = i === 0 ? 1 : F.rr(0.5, 0.82);
      F.blob(cx + F.rr(-R, R) * 0.4, cy + F.rr(-R, R) * 0.3, cz + F.rr(-R, R) * 0.4,
        R * s, R * s * F.rr(0.75, 1.0), F.rnd() * TAU, i % 2 ? c : shade(c, F.rr(-0.06, 0.1)), 'leafy');
    }
  }

  if (kind === 'pine') {
    const c = F.pick(PAL.pine);
    const clear = h * 0.40;                         /* bare trunk before the first whorl */
    const top = bole(0.18 + h * 0.020, 0.07 + h * 0.006, h * 0.94, 4, 1);
    /* whorls of limbs, longest low down, carrying needle masses */
    const whorls = 5;
    for (let wi = 0; wi < whorls; wi++) {
      const t = wi / (whorls - 1);
      const y = ly + clear + (h * 0.92 - clear) * t;
      const len = h * (0.30 - 0.20 * t);
      const n = 4 + (wi % 2);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + wi * 0.7 + F.rr(-0.2, 0.2);
        const ex = lx + Math.cos(a) * len, ez = lz + Math.sin(a) * len;
        const ey = y + len * F.rr(0.10, 0.28);
        F.rod(lx, y, lz, ex, ey, ez, 0.05 + h * 0.006, bark, 'bark');
        cluster(ex * 0.96 + lx * 0.04, ey, ez * 0.96 + lz * 0.04, len * 0.42, c, 2);
      }
    }
    F.cone(lx, ly + h * 0.86, lz, h * 0.055 + 0.2, h * 0.16, 0, shade(c, 0.1), 'leafy');
    if (F.chance(0.6)) F.cone(lx + F.rr(-0.3, 0.3), ly, lz + F.rr(-0.3, 0.3), h * 0.05, h * 0.06, 0, shade(bark, -0.1), 'bark');

  } else if (kind === 'olive') {
    const c = F.pick(PAL.olive);
    /* short gnarled bole that forks low into a vase of limbs */
    const top = bole(0.16 + h * 0.055, 0.10 + h * 0.030, h * 0.34, 3, 3);
    const n = 4 + (F.chance(0.5) ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + F.rr(-0.3, 0.3);
      const len = h * F.rr(0.30, 0.44);
      const ex = top.x + Math.cos(a) * len * 0.8, ez = top.z + Math.sin(a) * len * 0.8;
      const ey = top.y + len * F.rr(0.55, 0.95);
      F.rod(top.x, top.y, top.z, ex, ey, ez, 0.06 + h * 0.022, shade(bark, 0.05), 'bark');
      /* two branchlets off each limb, then leaf mass at the tips */
      for (let b = 0; b < 2; b++) {
        const a2 = a + F.rr(-0.8, 0.8);
        const l2 = len * F.rr(0.3, 0.5);
        const bx = ex + Math.cos(a2) * l2, bz = ez + Math.sin(a2) * l2, by = ey + l2 * F.rr(0.1, 0.6);
        F.rod(ex, ey, ez, bx, by, bz, 0.04 + h * 0.010, bark, 'bark');
        cluster(bx, by, bz, h * F.rr(0.13, 0.19), c, 3);
      }
      cluster(ex, ey, ez, h * 0.15, c, 2);
    }
    /* a couple of suckers at the base, as olives do */
    for (let s = 0; s < 2; s++) if (F.chance(0.7)) {
      const a = F.rnd() * TAU;
      F.rod(lx, ly, lz, lx + Math.cos(a) * h * 0.12, ly + h * 0.2, lz + Math.sin(a) * h * 0.12, 0.03 + h * 0.008, bark, 'bark');
    }

  } else if (kind === 'palm') {
    const c = F.pick(PAL.palm);
    /* curving segmented stipe with leaf-scar rings */
    const segs = 6, tilt = F.rr(-0.06, 0.06), top = h * 0.80;
    let x = lx, z = lz, y = ly;
    for (let i = 0; i < segs; i++) {
      const t = i / segs;
      const r = (0.17 + h * 0.012) * (1 - t * 0.35);
      const nx = x + tilt * h * 0.06 * (1 + t), nz = z + tilt * h * 0.03;
      F.rod(x, y, z, nx, y + top / segs, nz, r, i % 2 ? shade(bark, 0.06) : bark, 'bark');
      F.cyl(nx, y + top / segs - h * 0.006, nz, r * 1.18, h * 0.012, 0, shade(bark, -0.12), 'bark');
      x = nx; z = nz; y += top / segs;
    }
    /* fronds: each an arching chain that droops at the tip */
    const nf = 9;
    for (let f = 0; f < nf; f++) {
      const a = (f / nf) * TAU + F.rr(-0.15, 0.15);
      const len = h * F.rr(0.30, 0.40), lift = F.rr(0.10, 0.30) * len;
      const c1x = x + Math.cos(a) * len * 0.38, c1z = z + Math.sin(a) * len * 0.38, c1y = y + lift;
      const c2x = x + Math.cos(a) * len * 0.75, c2z = z + Math.sin(a) * len * 0.75, c2y = y + lift * 1.05;
      const tx = x + Math.cos(a) * len, tz = z + Math.sin(a) * len, ty = y + lift * 0.35;
      const fc = f % 2 ? c : shade(c, 0.08);
      F.beam(x, y, z, c1x, c1y, c1z, h * 0.035, 0.05, fc, 'leafy');
      F.beam(c1x, c1y, c1z, c2x, c2y, c2z, h * 0.055, 0.05, fc, 'leafy');
      F.beam(c2x, c2y, c2z, tx, ty, tz, h * 0.040, 0.04, shade(fc, -0.05), 'leafy');
    }
    /* spent fronds hanging under the crown, and a nut cluster */
    for (let f = 0; f < 3; f++) {
      const a = F.rnd() * TAU, len = h * 0.2;
      F.beam(x, y - h * 0.01, z, x + Math.cos(a) * len * 0.5, y - len * 0.8, z + Math.sin(a) * len * 0.5, h * 0.03, 0.04, shade(bark, 0.12), 'leafy');
    }
    F.ball(x, y - h * 0.03, z, h * 0.045, shade(c, -0.15), 'leafy');
    for (let k = 0; k < 4; k++) F.ball(x + F.rr(-0.4, 0.4) * h * 0.1, y - h * 0.05, z + F.rr(-0.4, 0.4) * h * 0.1, h * 0.022, 0xb8893c, 'leafy');

  } else if (kind === 'shrub') {
    const c = F.pick(PAL.shrub);
    /* a mound built from many stems and tufts rather than one blob */
    const n = 9 + Math.floor(F.rnd() * 5);
    for (let i = 0; i < n; i++) {
      const a = F.rnd() * TAU, rr = F.rr(0.1, 0.95) * h;
      const ex = lx + Math.cos(a) * rr, ez = lz + Math.sin(a) * rr;
      const ey = ly + F.rr(0.35, 1.0) * h * 0.95;
      F.rod(lx + F.rr(-0.1, 0.1) * h, ly, lz + F.rr(-0.1, 0.1) * h, ex, ey, ez, h * 0.035, shade(bark, 0.08), 'bark');
      F.blob(ex, ey, ez, h * F.rr(0.28, 0.45), h * F.rr(0.22, 0.36), F.rnd() * TAU, shade(c, F.rr(-0.08, 0.12)), 'leafy');
    }
    F.blob(lx, ly + h * 0.30, lz, h * 0.62, h * 0.5, 0, shade(c, -0.06), 'leafy');

  } else {
    /* cypress: dense columnar spire, built from stacked tapering tiers */
    const c = F.pick(PAL.cypress), R = h * 0.105 + 0.28;
    F.rod(lx, ly, lz, lx, ly + h * 0.22, lz, 0.12 + h * 0.008, bark, 'bark');
    const tiers = 6;
    for (let i = 0; i < tiers; i++) {
      const t = i / tiers;
      const y = ly + h * (0.08 + 0.80 * t);
      const r = R * (1.05 - 0.75 * t) * F.rr(0.92, 1.08);
      const hh = h * 0.26 * (1 - t * 0.35);
      F.cone(lx + F.rr(-0.06, 0.06) * R, y, lz + F.rr(-0.06, 0.06) * R, r, hh, F.rnd() * TAU,
        i % 2 ? c : shade(c, 0.07), 'leafy');
      /* a few sprigs breaking the outline so it isn't a smooth cone */
      if (F.chance(0.7)) {
        const a = F.rnd() * TAU;
        F.blob(lx + Math.cos(a) * r * 0.9, y + hh * 0.4, lz + Math.sin(a) * r * 0.9, r * 0.3, r * 0.4, 0, shade(c, 0.1), 'leafy');
      }
    }
    F.cone(lx, ly + h * 0.86, lz, R * 0.30, h * 0.16, 0, shade(c, 0.12), 'leafy');
  }
}

/* ---------------------------------------------------------- instantiation
   Each build goes into its own Group so the inspector can pick it, measure it,
   isolate it and rebuild it in place. Groups sit at the origin with an identity
   transform, so the world-space maths in the geo kit is unaffected. */
const INSTANCES = [];
function _buildInstance(kind, registry, key, x, z, ry, opt) {
  const A = registry[key];
  if (!A) { console.error('no such ' + kind, key); return null; }
  opt = opt || {};
  const g = new THREE.Group();
  g.name = kind + ':' + key;
  const prev = _target;
  _target = g;
  const F = makeFrame(x, z, ry, opt);
  F.asset = A;
  let failed = null;
  try { A.build(F); } catch (e) { failed = e; console.error(kind + ' build error', key, e); }
  _target = prev;
  g.userData = {
    kind: kind, key: key, asset: A, x: x, z: z, ry: ry || 0,
    opt: { variant: opt.variant || 0, seed: opt.seed || 1, wealth: opt.wealth == null ? 0.5 : opt.wealth, y: opt.y || 0 },
    error: failed ? String(failed && failed.message || failed) : null,
    furniture: F.furniture || [], missingFurniture: F.missing || []
  };
  scene.add(g);
  INSTANCES.push(g);
  return g;
}
function buildFurn(key, x, z, ry, opt) { return _buildInstance('furniture', FURN_BY_KEY, key, x, z, ry, opt); }
function buildPlant(key, x, z, ry, opt) { return _buildInstance('plant', PLANT_BY_KEY, key, x, z, ry, opt); }
function buildAsset(key, x, z, ry, opt) { return _buildInstance('building', ASSET_BY_KEY, key, x, z, ry, opt); }

/* rebuild an existing instance in place with changed options (variant/seed/wealth) */
function rebuildInstance(g, changes) {
  const u = g.userData;
  const registry = u.kind === 'building' ? ASSET_BY_KEY : (u.kind === 'plant' ? PLANT_BY_KEY : FURN_BY_KEY);
  const opt = Object.assign({}, u.opt, changes || {});
  const i = INSTANCES.indexOf(g);
  if (i >= 0) INSTANCES.splice(i, 1);
  scene.remove(g);
  g.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  return _buildInstance(u.kind, registry, u.key, u.x, u.z, u.ry, opt);
}

/* measured world-space size of an instance, and how much of it got built.
   Measures actual transformed VERTICES, not Box3.expandByObject — that takes the
   AABB of each mesh's own AABB, which inflates anything rotated off-axis by up to
   sqrt(2) and would quietly overstate every tapered tower and turned roof here. */
const _mv = new THREE.Vector3();
function measureInstance(g) {
  g.updateMatrixWorld(true);
  const box = new THREE.Box3();
  let meshes = 0, tris = 0;
  g.traverse((o) => {
    const geo = o.geometry;
    if (!geo || !geo.attributes || !geo.attributes.position) return;
    meshes++;
    const idx = geo.index, pos = geo.attributes.position;
    tris += idx ? idx.count / 3 : pos.count / 3;
    for (let i = 0; i < pos.count; i++) {
      _mv.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      box.expandByPoint(_mv);
    }
  });
  if (!meshes || box.isEmpty()) return { empty: true, meshes: 0, tris: 0, w: 0, d: 0, h: 0, box: box };
  const size = box.getSize(new THREE.Vector3());
  return { empty: false, meshes: meshes, tris: Math.round(tris), w: size.x, d: size.z, h: size.y, box: box, min: box.min.clone(), max: box.max.clone() };
}

