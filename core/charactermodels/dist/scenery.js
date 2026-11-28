/* kits/catalog furniture bundle (furniture_bundle.py): krator-furniture-core.js, krator-symbols.js, krator-furniture-kit.js, krator-master-furniture-generic-goods.js, krator-master-furniture-generic.js, krator-master-furniture-rustic.js, krator-furniture-runtime.js. GENERATED; edit the catalog files. */
var KratorFurniture = (function () {
/* ---- core/catalog/krator-furniture-core.js ---- */
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
   loaded as separate <\x73cript> files after this one.
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
/* SIZE-AWARE SEGMENTS (2026-10, ROADMAP stage 1): a round part gets the segments its size needs, not the palace
   column's. _SAG is the silhouette error (the sagitta, how far a facet's middle sits inside the true circle) the
   catalog's own 16-sided cylinder has at r = 0.2 m, 3.8 mm; a part of radius r gets the fewest segments that keep
   its error under that, rounded up to an even count, never under `floor` (6 round: a spindle still reads as turned)
   and never over the default n. So a cylinder of r >= 0.15 m is unchanged, 0.05 to 0.15 m keeps 50 to 90 % of the
   default, a 4 cm leg gets 8 and a 2.5 cm spindle, a bead or a finial the floor (kits/catalog/README.md has the
   census). The count depends on the radius only, never on a cylinder's length or a dome's height: a ring round a leg
   and a dome on a post keep the count of the part they sit on, so their rims meet as before. Then setDetail scales it as it always did (_seg). What keeps its count: lathes and tubes (their
   callers give nu and seg, and flutes and lobes are drawn by them), frustums (`sides` is a shape: square, hexagon),
   pillows and bolsters (their floors are their silhouette), boxes and beams. */
const _SAG = 0.2 * (1 - Math.cos(Math.PI / 16));
function _fit(n, r, floor) {
  if (n <= floor) return n;
  const k = r > _SAG ? Math.ceil(Math.PI / Math.acos(1 - _SAG / r)) : floor;
  return Math.min(n, Math.max(floor, k + (k & 1)));
}
function _segR(n, min, r, floor) { return _seg(_fit(n, r, floor == null ? 6 : floor), min); }
/* Coaxial parts share a count. A band round a leg, a rim on a jar or a dome on a post has a radius within a few per
   cent of the part it sits on; were their counts to differ, the inner part's corners would poke through the outer
   one's flat faces. So an upright cylinder, cone or dome on the same axis as one already built in this piece, touching
   it, with a radius within cos(PI / 6) of it (the only ratios that can poke), takes that one's count (capped at its own
   default): two polygons of one count and one turn nest. Only parts in the same piece (_target) are matched. */
let _ringT = null, _rings = [];
function _ring(n, r, x, y0, y1, z, ry) {
  if (!_target) return n;
  if (_ringT !== _target) { _ringT = _target; _rings = []; }
  let k = n;
  for (const q of _rings) {
    if (Math.abs(q.x - x) > 1e-4 || Math.abs(q.z - z) > 1e-4 || q.ry !== ry || y0 > q.y1 + 1e-4 || q.y0 > y1 + 1e-4) continue;
    const a = Math.min(r, q.r) / Math.max(r, q.r, 1e-9);
    if (a > 0.866) { k = q.n; break; }
  }
  _rings.push({ x: x, z: z, y0: y0, y1: y1, r: r, n: k, ry: ry });
  return k;
}
/* a sphere's rows follow its count round, in the default's proportion (rows of n0 x m0 for n round) */
function _rows(n0, m0, n, min) { return _seg(Math.max(min, Math.round(m0 * n / n0)), min); }
function _add(m) { (_target || scene).add(m); return m; }
function mkBox(x, y, z, w, h, d, ry, color, family) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(Math.max(w, 0.02), Math.max(h, 0.02), Math.max(d, 0.02)), mat(color, family));
  m.position.set(x, y + h / 2, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkCyl(x, y, z, r, h, ry, color, family) {
  const n = Math.min(16, _ring(_fit(16, r, 6), r, x, y, y + h, z, ry || 0));
  const m = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(r, 0.01), Math.max(r, 0.01), Math.max(h, 0.02), _seg(n, 6)), mat(color, family));
  m.position.set(x, y + h / 2, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkCone(x, y, z, r, h, ry, color, family) {
  const n = Math.min(14, _ring(_fit(14, r, 6), r, x, y, y, z, ry || 0));   /* only its base meets anything */
  const m = new THREE.Mesh(new THREE.ConeGeometry(Math.max(r, 0.01), Math.max(h, 0.02), _seg(n, 6)), mat(color, family));
  m.position.set(x, y + h / 2, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkDome(x, y, z, r, h, ry, color, family) {
  const nr = Math.min(16, _ring(_fit(16, r, 6), r, x, y, y, z, ry || 0));   /* round by its radius and its rim's neighbour, rows by its radius or height */
  const geo = new THREE.SphereGeometry(Math.max(r, 0.02), _seg(nr, 6), _rows(16, 10, _fit(16, Math.max(r, h), 6), 3), 0, TAU, 0, Math.PI / 2);
  geo.scale(1, Math.max(h, 0.02) / Math.max(r, 0.02), 1);
  const m = new THREE.Mesh(geo, mat(color, family));
  m.position.set(x, y, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkBlob(x, y, z, r, h, ry, color, family) {
  const nr = _fit(10, Math.max(r, h / 2), 6);
  const geo = new THREE.SphereGeometry(Math.max(r, 0.02), _seg(nr, 6), _rows(10, 8, nr, 4));
  geo.scale(1, Math.max(h, 0.02) / (2 * Math.max(r, 0.02)), 1);
  const m = new THREE.Mesh(geo, mat(color, family));
  m.position.set(x, y, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkBall(x, y, z, r, color, family) {
  const nr = _fit(14, r, 6);
  const m = new THREE.Mesh(new THREE.SphereGeometry(Math.max(r, 0.02), _seg(nr, 6), _rows(14, 10, nr, 4)), mat(color, family));
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
  const m = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(r, 0.005), Math.max(r, 0.005), len, _segR(8, 4, r)), mat(color, family));
  m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz).normalize());
  return _add(m);
}
/* GROWN SURFACES (2026-10, ported from the Ys Hykkousoi set): an ellipsoid, a lathe and a tube. Plain meshes of indexed
   BufferGeometry like every other primitive here, so the inspector, measureInstance() and the size audit see real vertices.
   mkEll: a CENTRED ellipsoid, radii rx, ry, rz, turned ry2. mkLathe: a surface of revolution about the vertical axis at
   (x, y, z), profile [[r, h], ...] (h upward from y, outward-facing normals; o.double also draws the inside), o: { nu (around),
   nv (rows along the profile), lobes {n, amp, ph}, flute {n, amp, sharp} (r is scaled by 1 + amp cos(n th) and by
   1 + amp raised-cosine(n th)^sharp) }. mkTube: a tube along the world-space polyline pts, radius r (a number or
   fn(t, i) with t the fraction along it), o: { seg (sides), double }; parallel-transport frames, open at both ends. */
const _matDouble = new Map();
function _matDbl(color, family) {
  const k = color + '|' + (family || '');
  if (_matDouble.has(k)) return _matDouble.get(k);
  const m = mat(color, family).clone(); m.side = THREE.DoubleSide; m.userData.family = family || '';
  _matDouble.set(k, m); return m;
}
function _surfGeo(nu, nv, fn, rev) {
  const P = new Float32Array((nu + 1) * (nv + 1) * 3), I = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const p = fn(i / nu, j / nv), k = (j * (nu + 1) + i) * 3; P[k] = p[0]; P[k + 1] = p[1]; P[k + 2] = p[2]; }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1;
    if (rev) I.push(a, b, c, b, d, c); else I.push(a, c, b, b, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setIndex(I); geo.computeVertexNormals();
  const N = geo.attributes.normal;   /* the seam column is duplicated: share its normal so it does not show */
  for (let j = 0; j <= nv; j++) {
    const a = j * (nu + 1), b = a + nu;
    const x = N.getX(a) + N.getX(b), y = N.getY(a) + N.getY(b), z = N.getZ(a) + N.getZ(b), l = Math.hypot(x, y, z) || 1;
    N.setXYZ(a, x / l, y / l, z / l); N.setXYZ(b, x / l, y / l, z / l);
  }
  return geo;
}
function mkEll(x, y, z, rx, ry, rz, ry2, color, family) {
  const nr = _fit(12, Math.max(rx, ry, rz), 6);
  const geo = new THREE.SphereGeometry(0.5, _seg(nr, 6), _rows(12, 8, nr, 4));
  geo.scale(Math.max(rx, 0.01) * 2, Math.max(ry, 0.01) * 2, Math.max(rz, 0.01) * 2);
  const m = new THREE.Mesh(geo, mat(color, family));
  m.position.set(x, y, z); m.rotation.y = ry2 || 0;
  return _add(m);
}
function mkLathe(x, y, z, prof, ry, color, family, o) {
  o = o || {};
  const n = prof.length, per = Math.max(1, Math.round((o.nv || n * 2) / Math.max(1, n - 1))), rows = [];
  for (let k = 0; k < n - 1; k++) for (let s = 0; s < per; s++) { const t = s / per, a = prof[k], b = prof[k + 1]; rows.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  rows.push(prof[n - 1].slice());
  const nu = _seg(o.nu || 24, 12), nv = rows.length - 1, lb = o.lobes, fl = o.flute;
  const geo = _surfGeo(nu, nv, (u, v) => {
    const th = u * TAU, row = rows[Math.round(v * nv)]; let r = row[0];
    if (lb) r *= 1 + lb.amp * Math.cos(lb.n * th + (lb.ph || 0));
    if (fl) r *= 1 + fl.amp * Math.pow(0.5 + 0.5 * Math.cos(fl.n * th), fl.sharp || 2);
    r = Math.max(0, r);
    return [r * Math.cos(th), row[1], r * Math.sin(th)];
  }, false);
  const m = new THREE.Mesh(geo, o.double ? _matDbl(color, family) : mat(color, family));
  m.position.set(x, y, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkTube(pts, r, color, family, o) {
  o = o || {};
  const n = pts.length; if (n < 2) return null;
  const P = pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), T = [], N = [], B = [];
  for (let i = 0; i < n; i++) T.push(new THREE.Vector3().subVectors(P[Math.min(n - 1, i + 1)], P[Math.max(0, i - 1)]).normalize());
  const n0 = new THREE.Vector3(0, 1, 0); if (Math.abs(n0.dot(T[0])) > 0.9) n0.set(1, 0, 0);
  n0.sub(T[0].clone().multiplyScalar(n0.dot(T[0]))).normalize(); N.push(n0);
  for (let i = 1; i < n; i++) { const pv = N[i - 1], nn = pv.clone().sub(T[i].clone().multiplyScalar(pv.dot(T[i]))); if (nn.lengthSq() < 1e-8) nn.copy(pv); N.push(nn.normalize()); }
  for (let i = 0; i < n; i++) B.push(new THREE.Vector3().crossVectors(T[i], N[i]).normalize());
  const rf = typeof r === 'function' ? r : () => r, o0 = P[0];
  const geo = _surfGeo(_seg(o.seg || 8, 4), n - 1, (u, v) => {
    const i = Math.round(v * (n - 1)), rr = Math.max(0.004, rf(i / (n - 1), i)), ph = u * TAU, c = Math.cos(ph), s = Math.sin(ph);
    return [P[i].x - o0.x + rr * (N[i].x * c + B[i].x * s), P[i].y - o0.y + rr * (N[i].y * c + B[i].y * s), P[i].z - o0.z + rr * (N[i].z * c + B[i].z * s)];
  }, true);
  const m = new THREE.Mesh(geo, o.double ? _matDbl(color, family) : mat(color, family));
  m.position.copy(o0);
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
  'generic', 'scrap', 'lizardmen', 'eastabyss', 'xanadu', 'screamer', 'islander', 'republican', 'rustic', 'painted', 'reedlake', 'post-apoc', 'hykkousoi', 'scyvoi', 'zeijani', 'ashnomad', 'eternian',
  'khaayken', 'tungang', 'fellgang', 'talovolci', 'jimjam', 'dalab', 'pylon', 'talia'];   // the shared culture rebuild (kits/yeti/PLAN.md section 11, 2026-11-03)
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
  'weaving', 'tanning', 'pottery', 'carpentry', 'mining', 'herding', 'trading',
  'fungiculture', 'alchemy', 'dyeing', 'masonry', 'lampmaking', 'knapping', 'ropemaking',
  /* the 2026-10-19 trades audit (the Voth census yardstick): bakers, butchers, healers and apothecaries, scribes and teachers, shipwrights, quarrymen, customs
     and weigh-house clerks, the cult's priests, dairies (nomad herds). FK.ROLES.works draws most of them */
  'baking', 'butchery', 'healing', 'scribing', 'shipwrighting', 'quarrying', 'customs', 'worship', 'dairy'];
/* the activity an NPC can do AT a piece (simulation layer, 2026-10): `task: [..]` from FURN_TASKS. A trade (`job`) is
   what a worker produces; a task is what any NPC does: sleep, eat, read. A building holding a piece with a task is a
   destination for that task. Derived when an entry leaves task out: FURN_ROLE_TASK[role] first (a kit piece, [] = none),
   then FURN_TYPE_TASK[type]; set `task: []` on a piece that should have none. verify.py rejects a task not listed here. */
const FURN_TASKS = ['sleeping', 'resting', 'eating', 'drinking', 'cooking', 'socializing', 'praying', 'reading', 'writing', 'storage', 'feeding',
  'melee-training', 'ranged-training'];
const FURN_TYPE_TASK = { bed: ['sleeping'], chair: ['resting'], bench: ['resting', 'socializing'], seating: ['resting', 'socializing'],
  table: ['eating', 'socializing'], storage: ['storage'], shelf: ['storage'], desk: ['writing'], altar: ['praying'], shrine: ['praying'],
  brazier: ['socializing'], book: ['reading'], rack: ['storage'], stack: ['storage'], food: ['eating'], drink: ['drinking'] };
/* a vessel or supply is storage only when it is a container by name (a jug or bowl on a table is a good, not storage) */
const FURN_STORAGE_NAME = /\b(barrels?|casks?|kegs?|jars?|pots?|crates?|sacks?|baskets?|bins?|chests?|trunks?|hampers?|urns?|buckets?|butts?|vats?|amphorae?|pithos|pithoi|hoppers?|silos?|bales?|cupboards?|cabinets?|lockers?|larders?|wardrobes?|coffers?|boxe?s?|containers?|tubs?|gourds)\b/i;
/* feeding: where beasts eat and drink (a trough, a manger, a hay rack, a feed basket); added on top of any other task */
const FURN_FEED_NAME = /\b(troughs?|mangers?|hay ?racks?|hay hecks?|feed|fodder)\b/i;
const FURN_ROLE_TASK = { bookcase: ['storage', 'reading'], hearth: ['cooking', 'socializing'], low_table: ['eating', 'socializing'],
  throne: [], forge: [], kiln: [], bunk: ['sleeping'], rack: ['storage'], trough: ['feeding'], training_dummy: ['melee-training'], archery_butt: ['ranged-training'], hayrack: ['feeding'], armour_stand: [], vat: [] };
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
  if (typeof o.task === 'string') o.task = [o.task];
  if (!o.task) {
    o.task = (FURN_ROLE_TASK[o.role] || FURN_TYPE_TASK[o.type] || []).slice();
    if (!o.task.length && !FURN_ROLE_TASK[o.role] && /^(vessel|supply|tool)$/.test(o.type) && FURN_STORAGE_NAME.test(o.name || '') && !/archery/i.test(o.name)) o.task = ['storage'];
    if (FURN_FEED_NAME.test(o.name || '') && o.task.indexOf('feeding') < 0 && !(FURN_ROLE_TASK[o.role] && !FURN_ROLE_TASK[o.role].length)) o.task.push('feeding');
  }
  FURNS.push(o); FURN_BY_KEY[o.key] = o;
}
/* the y at which to build a furniture piece so it sits on its anchor:
   at = { floorY, surfaceY, ceilingY }; variant picks variantDims. */
/* wall pieces that hang rather than stand: wall art (a mask, a skull, antlers, a plate) centred at eye height,
   friezes and pennant strings near the top of the wall, and the cloths hung from a rod or hook (scrolls, banners,
   tapestries, wall rugs: the kit draws them from y 0, rod at the top) with their top there too, so in a room taller
   than the cloth they leave the floor; a low room keeps them down to the floor. Everything else on a wall stands on
   the floor (the painted hanging stands on its own poles). */
const FURN_WALL_HUNG = { art: 'eye', frieze: 'top', pennants: 'top', scroll: 'top', banner: 'top', tapestry: 'top', wall_rug: 'top' };
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
  terracotta: { tags: ['stone'], families: ['terracotta'] },   /* unglazed fired clay: matte (ceramic is glazed); textured as ceramic ('ceramic/terracotta') */
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
  /* the library's variants and extras (2026-10-19): candle and tallow wax, twisted rope, linen and patched canvas, red brick,
     the second and olive scale skins, the second plumage, and the shell sets: abalone, soft abalone and the pearls on a nacre
     part, conch on the shell family (a part on the shell family keeps the conch; its whites take the second nacre) */
  [/^waxBone$/, ['food', 'cloth', 'plastic', 'plaster'], 'tallow'],
  [/^wax(Honey|Red)$/, ['food', 'cloth', 'plastic', 'plaster'], 'wax'],
  [/^rope(Hemp|Jute|Flax|Coir|Twine|Tan|Pale|Rush|Vine)$/, ['rope'], 'ropeTwist'],
  [/^linen/, ['cloth'], 'linen'],
  [/^canvas(Tan|Raw|Pale|Faded)$/, ['cloth'], 'canvasB'],
  [/^brickRed$/, ['stone', 'plaster', 'ceramic', 'wood'], 'brick'],
  [/^scaleBark/, ['skin'], 'scaleB'],
  [/^scaleJade/, ['skin'], 'scaleOlive'],
  [/^scaleTurquoise$/, ['skin'], 'scaleOliveB'],
  [/^featherYellow$/, ['hide', 'plant', 'plastic'], 'featherB'],
  [/^shellAbalone$/, ['nacre'], 'abalone'],
  [/^nacreSea$/, ['nacre'], 'abaloneSoft'],
  [/^(shellPearl|nacreRose)$/, ['nacre'], 'nacreB'],
  [/^shell(White|Cream)$/, ['shell'], 'nacreC'],
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
  const F = { x, z, ry: ry || 0, y: opt.y || 0, seed: opt.seed || 1, variant: opt.variant || 0, wealth: opt.wealth == null ? 0.5 : opt.wealth, span: opt.span || 0 };   /* span: a stretching piece's length (a cord of pennants along its wall), else 0 */
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
  /* grown surfaces (mkEll, mkLathe, mkTube above): F.ell is CENTRED at ly; F.lathe stands on ly (profile heights [[r, h], ...] are added to it);
     F.tube takes the polyline in the local frame, absolute heights, and closes neither end */
  F.ell = (lx, ly, lz, rx, ry, rz, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkEll(x2, F.y + ly, z2, rx, ry, rz, F.ry + (ry2 || 0), color, ff(color, family)); };
  F.lathe = (lx, ly, lz, prof, ry2, color, family, o) => { const [x2, z2] = toWorld(lx, lz); mkLathe(x2, F.y + ly, z2, prof, F.ry + (ry2 || 0), color, ff(color, family), o); };
  F.tube = (pts, r, color, family, o) => { mkTube(pts.map(p => { const [x2, z2] = toWorld(p[0], p[2]); return [x2, F.y + p[1], z2]; }), r, color, ff(color, family), o); };
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


/* ---- core/sockets/38-symbols.js ---- */
// ---------------------------------------------------------------- CULTURE SYMBOLS (shared: core/sockets/38-symbols.js)
// The emblem of every culture as a 2D canvas drawing: (g, cx, cy, R, ink, ink2) draws inside a box of half-size R. Pure canvas, no engine:
// core/sockets/80-cultures.js draws them on banners, flags and plates; kits/catalog's furniture kit draws the same ones on tapestries,
// banners, friezes and scrolls (it reads this file in place: kits/catalog/catalog.py resolves krator-symbols.js here), so a dressed building and the
// furniture in it carry one emblem. A new culture adds one function here. SYMBOL_OF names each pack's symbol for anyone without a pack.
const SYM_TAU = Math.PI * 2, SYM_PI = Math.PI;
function drawTriskele(g,cx,cy,R,cols,lw){g.lineCap='round';g.lineWidth=lw;for(let k=0;k<3;k++){g.strokeStyle=cols[k%cols.length];g.beginPath();const a0=k*SYM_TAU/3-SYM_PI/2;
 for(let i=0;i<=24;i++){const t=i/24;const a=a0+t*2.5;const r=R*(.12+.86*t);const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
  const ae=a0+2.5;g.fillStyle=cols[k%cols.length];g.beginPath();g.arc(cx+Math.cos(ae)*R*.98,cy+Math.sin(ae)*R*.98,lw*.75,0,SYM_TAU);g.fill();}}
// ------------------------------------------------------------------ symbols: each draws in the box (cx,cy,R) with two ink colours
const SYMBOLS={
 sun:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.92,0,SYM_TAU);g.fill();g.fillStyle=c2;g.beginPath();g.arc(cx,cy,R*.54,0,SYM_TAU);g.fill();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.24,0,SYM_TAU);g.fill();
  for(let k=0;k<12;k++){const a=k*SYM_TAU/12;g.fillStyle=c1;g.beginPath();g.moveTo(cx+Math.cos(a-.11)*R*.98,cy+Math.sin(a-.11)*R*.98);g.lineTo(cx+Math.cos(a)*R*1.18,cy+Math.sin(a)*R*1.18);g.lineTo(cx+Math.cos(a+.11)*R*.98,cy+Math.sin(a+.11)*R*.98);g.fill();}},
 triskele:(g,cx,cy,R,c1,c2)=>{drawTriskele(g,cx,cy,R*.82,[c1,c2,'#c9963a'],Math.max(3,R*.27));},
 diamond:(g,cx,cy,R,c1,c2)=>{g.strokeStyle=c1;g.lineWidth=Math.max(2,R*.11);g.lineJoin='round';g.beginPath();g.moveTo(cx,cy-R);g.lineTo(cx+R*.75,cy);g.lineTo(cx,cy+R);g.lineTo(cx-R*.75,cy);g.closePath();g.stroke();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.16,0,SYM_TAU);g.fill();},
 // hyperboloid of one sheet: the cooling-tower profile with its ruling lines (Yuni)
 hyperboloid:(g,cx,cy,R,c1,c2)=>{const a=R*.4,hh=R*.92,b=hh*.55;const xw=t=>a*Math.sqrt(1+(t*hh/b)*(t*hh/b));const rx=xw(1),ry=R*.13;
  g.strokeStyle=c1;g.lineCap='round';g.lineWidth=Math.max(2,R*.05);
  for(let k=0;k<7;k++){const th=k*SYM_TAU/7;g.beginPath();g.moveTo(cx+Math.cos(th)*rx,cy-hh+Math.sin(th)*ry);g.lineTo(cx+Math.cos(th+1.05)*rx,cy+hh+Math.sin(th+1.05)*ry);g.stroke();}
  g.lineWidth=Math.max(2.5,R*.1);for(const sx of [-1,1]){g.beginPath();for(let i=0;i<=28;i++){const t=-1+2*i/28;const x=cx+sx*xw(t),y=cy+t*hh;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();}
  for(const [yy,r_x] of [[cy-hh,rx],[cy,a],[cy+hh,rx]]){g.beginPath();g.ellipse(cx,yy,r_x,ry*(r_x===a?.8:1),0,0,SYM_TAU);g.stroke();}},
 // three parallel talon slashes (Beast Riders)
 claw:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;for(let k=-1;k<=1;k++){const x0=cx+k*R*.5;g.beginPath();g.moveTo(x0-R*.2,cy-R*.95);g.quadraticCurveTo(x0+R*.62,cy-R*.15,x0+R*.08,cy+R*1.0);g.quadraticCurveTo(x0+R*.2,cy-R*.05,x0-R*.2,cy-R*.95);g.closePath();g.fill();}},
 // three wind-curls streaming over a breaking wave (Hykkousoi; the hexareme's sail in kits/ringsea): c1 the wind, c2 the wave
 windwave:(g,cx,cy,R,c1,c2)=>{g.lineCap='round';g.lineJoin='round';g.strokeStyle=c1;g.lineWidth=Math.max(2,R*.08);
  for(let k=0;k<3;k++){const y=cy-R*(.74-k*.2),x0=cx-R*(.92-k*.14),x1=cx+R*(.42-k*.22),r=R*(.085-k*.012);g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.arc(x1,y-r,r,Math.PI/2,-Math.PI*1.1,true);g.stroke();}
  const r0=R*.3,a0=-Math.PI*.75,ox=cx+R*.31,oy=cy+R*.23;g.strokeStyle=c2;g.lineWidth=Math.max(2.5,R*.11);g.beginPath();g.moveTo(cx-R*.95,cy+R*.62);
  g.quadraticCurveTo(cx-R*.3,cy+R*.6,ox+Math.cos(a0)*r0,oy+Math.sin(a0)*r0);
  for(let i=1;i<=32;i++){const t=i/32,a=a0+t*1.6*Math.PI,rr=r0*(1-.65*t);g.lineTo(ox+Math.cos(a)*rr,oy+Math.sin(a)*rr);}g.stroke();
  g.beginPath();g.moveTo(ox+r0,oy);g.quadraticCurveTo(ox+r0*1.15,oy+R*.32,cx+R*.95,cy+R*.62);g.stroke();
  g.lineWidth=Math.max(2,R*.08);g.beginPath();for(let i=0;i<=24;i++){const x=-R*.95+1.9*R*i/24,y=cy+R*.84+Math.sin(x/R*SYM_TAU)*R*.05;if(i)g.lineTo(cx+x,y);else g.moveTo(cx+x,y);}g.stroke();},
 // the eight-spoked wheel (Xanadu; the carrack's sails): c1 rim and spokes, c2 the hub
 wheel:(g,cx,cy,R,c1,c2)=>{g.strokeStyle=c1;g.lineWidth=Math.max(2,R*.12);g.beginPath();g.arc(cx,cy,R*.78,0,SYM_TAU);g.stroke();g.lineWidth=Math.max(2,R*.07);
  for(let i=0;i<8;i++){const a=i/8*SYM_TAU;g.beginPath();g.moveTo(cx+Math.cos(a)*R*.18,cy+Math.sin(a)*R*.18);g.lineTo(cx+Math.cos(a)*R*.95,cy+Math.sin(a)*R*.95);g.stroke();}
  g.fillStyle=c2;g.beginPath();g.arc(cx,cy,R*.2,0,SYM_TAU);g.fill();},
 // the white moon of the islands (the oruwa's sail): a full disc, a thin ring round it
 moon:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.62,0,SYM_TAU);g.fill();g.strokeStyle=c1;g.lineWidth=Math.max(1.5,R*.04);g.beginPath();g.arc(cx,cy,R*.86,0,SYM_TAU);g.stroke();},
};
// ---- symbols added for the furniture sets (cultures without a socket pack yet; a pack that arrives later picks its symbol from here)
Object.assign(SYMBOLS, {
 // a coiled serpent, head out (Lizardmen)
 serpent:(g,cx,cy,R,c1,c2)=>{g.strokeStyle=c1;g.lineCap='round';g.lineWidth=Math.max(2,R*.16);g.beginPath();for(let i=0;i<=60;i++){const t=i/60,a=t*SYM_TAU*1.75,r=R*(.15+.72*t);const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
  const ae=SYM_TAU*1.75,hx=cx+Math.cos(ae)*R*.87,hy=cy+Math.sin(ae)*R*.87;g.fillStyle=c1;g.beginPath();g.ellipse(hx,hy,R*.2,R*.13,ae,0,SYM_TAU);g.fill();g.fillStyle=c2;g.beginPath();g.arc(hx+Math.cos(ae+1.3)*R*.07,hy+Math.sin(ae+1.3)*R*.07,R*.035,0,SYM_TAU);g.fill();},
 // an eight-pointed star of two squares, a disc at the heart (East Abyss)
 star:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;for(const rot of [0,SYM_PI/4]){g.beginPath();for(let k=0;k<4;k++){const a=rot+k*SYM_PI/2;g.lineTo(cx+Math.cos(a)*R*.95,cy+Math.sin(a)*R*.95);}g.closePath();g.fill();}
  g.fillStyle=c2;g.beginPath();g.arc(cx,cy,R*.3,0,SYM_TAU);g.fill();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.12,0,SYM_TAU);g.fill();},
 // a pair of curling ram's horns over a disc (Eastern Nomads)
 horns:(g,cx,cy,R,c1,c2)=>{g.strokeStyle=c1;g.lineCap='round';g.lineWidth=Math.max(2,R*.17);for(const s of [-1,1]){g.beginPath();for(let i=0;i<=30;i++){const t=i/30,a=-SYM_PI/2+s*t*SYM_PI*1.15,r=R*(.9-.55*t);const x=cx+s*R*.1+Math.cos(a)*r,y=cy+R*.1+Math.sin(a)*r;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();}
  g.fillStyle=c2;g.beginPath();g.arc(cx,cy+R*.15,R*.24,0,SYM_TAU);g.fill();},
 // a fir tree on a mountain line (Rustic Highlanders)
 fir:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;for(let k=0;k<3;k++){const y=cy-R*.9+k*R*.42,w=R*(.35+k*.25);g.beginPath();g.moveTo(cx,y);g.lineTo(cx+w,y+R*.55);g.lineTo(cx-w,y+R*.55);g.closePath();g.fill();}
  g.fillRect(cx-R*.08,cy+R*.4,R*.16,R*.35);g.strokeStyle=c2;g.lineWidth=Math.max(2,R*.08);g.beginPath();g.moveTo(cx-R,cy+R*.95);g.lineTo(cx-R*.5,cy+R*.6);g.lineTo(cx-R*.25,cy+R*.85);g.moveTo(cx+R*.25,cy+R*.85);g.lineTo(cx+R*.5,cy+R*.6);g.lineTo(cx+R,cy+R*.95);g.stroke();},
 // a formline raven's head: the ovoid eye in a beaked outline (Painted Men)
 raven:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;g.beginPath();g.moveTo(cx-R*.9,cy);g.quadraticCurveTo(cx-R*.9,cy-R*.85,cx,cy-R*.8);g.quadraticCurveTo(cx+R*.7,cy-R*.75,cx+R*.98,cy-R*.1);g.lineTo(cx+R*.3,cy+R*.2);g.quadraticCurveTo(cx+R*.5,cy+R*.75,cx-R*.1,cy+R*.8);g.quadraticCurveTo(cx-R*.9,cy+R*.8,cx-R*.9,cy);g.closePath();g.fill();
  g.fillStyle=c2;g.beginPath();g.ellipse(cx-R*.25,cy-R*.1,R*.36,R*.26,0,0,SYM_TAU);g.fill();g.fillStyle=c1;g.beginPath();g.ellipse(cx-R*.25,cy-R*.1,R*.14,R*.12,0,0,SYM_TAU);g.fill();g.strokeStyle=c2;g.lineWidth=Math.max(2,R*.06);g.beginPath();g.moveTo(cx+R*.2,cy-R*.05);g.lineTo(cx+R*.85,cy-R*.1);g.stroke();},
 // a fish in a ring of reeds (Reed Lake)
 fish:(g,cx,cy,R,c1,c2)=>{g.strokeStyle=c2;g.lineWidth=Math.max(2,R*.06);for(let k=0;k<12;k++){const a=k*SYM_TAU/12;g.beginPath();g.moveTo(cx+Math.cos(a)*R*.78,cy+Math.sin(a)*R*.78);g.lineTo(cx+Math.cos(a)*R*.98,cy+Math.sin(a)*R*.98);g.stroke();}
  g.fillStyle=c1;g.beginPath();g.ellipse(cx-R*.08,cy,R*.5,R*.24,0,0,SYM_TAU);g.fill();g.beginPath();g.moveTo(cx+R*.35,cy);g.lineTo(cx+R*.68,cy-R*.3);g.lineTo(cx+R*.68,cy+R*.3);g.closePath();g.fill();g.fillStyle=c2;g.beginPath();g.arc(cx-R*.38,cy-R*.05,R*.06,0,SYM_TAU);g.fill();},
 // a skull, teeth and all (Screamers)
 skull:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;g.beginPath();g.arc(cx,cy-R*.15,R*.62,0,SYM_TAU);g.fill();g.fillRect(cx-R*.4,cy+R*.2,R*.8,R*.5);g.fillStyle=c2;for(const s of [-1,1]){g.beginPath();g.ellipse(cx+s*R*.26,cy-R*.15,R*.17,R*.2,0,0,SYM_TAU);g.fill();}
  g.beginPath();g.moveTo(cx,cy+R*.05);g.lineTo(cx-R*.1,cy+R*.28);g.lineTo(cx+R*.1,cy+R*.28);g.closePath();g.fill();for(let k=0;k<5;k++)g.fillRect(cx-R*.36+k*R*.16,cy+R*.42,R*.06,R*.26);},
 // a spiral sinking into a stepped arch: the way in (Zeijani): c1 the stepped stone and the spiral, c2 the dark of the opening
 spiralarch:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;g.beginPath();g.moveTo(cx-R*.95,cy+R*.95);
  for(const [x,y] of [[-.95,-.35],[-.72,-.35],[-.72,-.6],[-.48,-.6],[-.48,-.85],[.48,-.85],[.48,-.6],[.72,-.6],[.72,-.35],[.95,-.35],[.95,.95]])g.lineTo(cx+x*R,cy+y*R);g.closePath();g.fill();
  const ow=R*.42,oy=cy-R*.12;g.fillStyle=c2;g.beginPath();g.moveTo(cx-ow,cy+R*.95);g.lineTo(cx-ow,oy);g.arc(cx,oy,ow,SYM_PI,0);g.lineTo(cx+ow,cy+R*.95);g.closePath();g.fill();
  g.strokeStyle=c1;g.lineCap='round';g.lineWidth=Math.max(2,R*.08);g.beginPath();const sx=cx,sy=cy+R*.3;for(let i=0;i<=60;i++){const t=i/60,a=-SYM_PI/2+t*SYM_TAU*2.1,r=R*.34*(1-t*.92);const x=sx+Math.cos(a)*r,y=sy+Math.sin(a)*r;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
  g.fillStyle=c1;g.beginPath();g.arc(sx,sy,R*.05,0,SYM_TAU);g.fill();},
 // a scroll unrolled, the wheel of eight spokes written on it between lines of the record (the Order of Historians, the
 // History Monks; the owner, 2026-10-20): c1 the ink, the rollers and their knobs; c2 the paper (parchment when absent)
 scroll:(g,cx,cy,R,c1,c2)=>{const pw=R*.85,ph=R*.58,wr=R*.36;g.fillStyle=c2||'#f0e4c4';g.fillRect(cx-pw,cy-ph,pw*2,ph*2);
  g.fillStyle=c1;for(const s of [-1,1]){const x=cx+s*pw;g.fillRect(x-R*.11,cy-ph-R*.12,R*.22,ph*2+R*.24);
   g.beginPath();g.arc(x,cy-ph-R*.17,R*.075,0,SYM_TAU);g.fill();g.beginPath();g.arc(x,cy+ph+R*.17,R*.075,0,SYM_TAU);g.fill();}
  g.strokeStyle=c1;g.lineCap='round';g.lineWidth=Math.max(1.5,R*.065);g.beginPath();g.arc(cx,cy,wr,0,SYM_TAU);g.stroke();
  g.lineWidth=Math.max(1,R*.04);g.beginPath();for(let k=0;k<8;k++){const a=k*SYM_TAU/8;g.moveTo(cx+Math.cos(a)*wr*.25,cy+Math.sin(a)*wr*.25);g.lineTo(cx+Math.cos(a)*wr,cy+Math.sin(a)*wr);}g.stroke();
  g.beginPath();g.arc(cx,cy,wr*.2,0,SYM_TAU);g.fill();
  g.lineWidth=Math.max(1,R*.028);g.beginPath();for(const s of [-1,1])for(let k=0;k<4;k++){const y=cy-ph*.66+k*ph*.44;g.moveTo(cx+s*wr*1.22,y);g.lineTo(cx+s*(pw-R*.18),y);}g.stroke();},
 // the white lotus (Xanadu; the owner, 2026-10-20): petals in three rows rising from a pad, c1 the petals, c2 their outline
 lotus:(g,cx,cy,R,c1,c2)=>{const by=cy+R*.45,pet=(a,len,wid)=>{g.save();g.translate(cx,by);g.rotate(a);g.beginPath();g.moveTo(0,0);
   g.quadraticCurveTo(-wid,-len*.55,0,-len);g.quadraticCurveTo(wid,-len*.55,0,0);g.closePath();g.fill();g.stroke();g.restore();};
  g.fillStyle=c1;g.strokeStyle=c2||'#6e1a32';g.lineWidth=Math.max(1,R*.035);g.lineJoin='round';
  for(const a of [-1.15,1.15])pet(a,R*.95,R*.32);for(const a of [-.68,.68])pet(a,R*1.1,R*.34);for(const a of [-.3,.3])pet(a,R*1.2,R*.34);pet(0,R*1.3,R*.36);
  g.beginPath();g.ellipse(cx,cy+R*.52,R*.72,R*.12,0,0,SYM_TAU);g.fill();g.stroke();},
 // the God's single eye (Dalab, settlements/span and settlements/dalab; 2026-11-09): an almond, its iris and pupil, a ring of
 // short rays round it; c1 the eye's white and the rays, c2 the iris
 eye:(g,cx,cy,R,c1,c2)=>{g.strokeStyle=c1;g.lineCap='round';g.lineWidth=Math.max(1.5,R*.07);g.beginPath();
   for(let k=0;k<12;k++){const a=k*SYM_TAU/12,ca=Math.cos(a),sa=Math.sin(a),r0=Math.abs(sa)>.5?R*.62:R*.8;g.moveTo(cx+ca*r0,cy+sa*r0);g.lineTo(cx+ca*R*.97,cy+sa*R*.97);}g.stroke();
  g.fillStyle=c1;g.beginPath();g.moveTo(cx-R*.78,cy);g.quadraticCurveTo(cx,cy-R*.62,cx+R*.78,cy);g.quadraticCurveTo(cx,cy+R*.62,cx-R*.78,cy);g.closePath();g.fill();
  g.fillStyle=c2;g.beginPath();g.arc(cx,cy,R*.27,0,SYM_TAU);g.fill();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.11,0,SYM_TAU);g.fill();},
 // a toothed gear (post-apoc salvage and scrap)
 gear:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;g.beginPath();for(let k=0;k<32;k++){const a=k*SYM_TAU/32,r=(k%4<2)?R*.95:R*.75;g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}g.closePath();g.fill();g.fillStyle=c2;g.beginPath();g.arc(cx,cy,R*.45,0,SYM_TAU);g.fill();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.2,0,SYM_TAU);g.fill();},
});
// the symbol each culture pack draws (mkCulture's `sym`), for code that has a culture key and no pack
const SYMBOL_OF = { iziz:'sun', republic:'triskele', voth:'diamond', yuni:'hyperboloid', 'beast-rider':'claw', hykkousoi:'windwave', xanadu:'lotus',
 'ringsea-islander':'moon', lizardmen:'serpent', eastabyss:'star', nomad:'horns', rustic:'fir', painted:'raven', reedlake:'fish', screamer:'skull', 'post-apoc':'gear', scrap:'gear',
 zeijani:'spiralarch', order:'scroll', dalab:'eye' };

/* ---- core/catalog/krator-furniture-kit.js ---- */
/* ======================================================================
   Krator Furniture Kit (FK)
   The interiors-phase furniture sets are not 600 hand-modelled pieces: they
   are ONE parametric builder per role (bed, table, hearth, tapestry ...)
   driven by a per-culture STYLE SHEET, plus bespoke pieces where a culture
   earns them. A culture file (krator-master-furniture-<culture>.js) is a
   palette, a style sheet or two, FK.set() calls and a few FURN() overrides.

   Load order: krator-asset-engine.js, this file, then any culture file.
   Every builder draws only through the frame F (kits/furniture/SPEC.md
   "No host globals"): the kit is part of the furniture registry, not of the
   host, so a host that supplies F runs these pieces unchanged.

   THE STYLE SHEET  (every colour a palette key of the culture, FPAL[culture])
     wood, woodDark?, woodLight?   timber keys        woodFam   'wood' | 'bamboo' | 'reed' | 'mahogany' | 'lacquer' | 'rust' | 'plastic' | 'bone'
     cloth: [keys]                  soft furnishings   clothFam  'cloth' | 'hide' | 'reed'
     accent, accentFam              trim, inlay, finials: 'metal' 'gold' 'nacre' 'bone' 'bronze' 'ceramic' 'jade' 'obsidian' ...
     metal, metalFam                ironwork (lamps, hinges, rails)
     clay, clayFam                  pots and jars: 'stone' | 'ceramic'
     stone, stoneFam                hearths, plinths
     rope?                          lashings, bed strings (family 'rope')
     flame, ember                   fire keys (family 'glow')
     legs      'straight' 'turned' 'splayed' 'block' 'trestle' 'x' 'post' 'lashed' 'pedestal' 'strut' 'cabriole'
     motif     'dots' 'studs' 'chevron' 'wave' 'step' 'scale' 'skull' 'lozenge' 'spiral' 'lash' 'rivet' 'none'
     bedBase   'rope' 'plank' 'woven' 'slab'      seat     'cushion' 'plank' 'hide' 'woven'
     finial    'ball' 'knob' 'point' 'skull' 'disc' 'none'
     hearth    'mud' 'stone' 'tile' 'iron' 'drum'  fire   'tripod' 'bowl' 'ring' 'drum' 'pit' 'basket'
     lamp      'oil' 'candle' 'lantern' 'torch' 'bulb' 'glass'
     rug       'knotted' 'woven' 'hide' 'reed' 'rag' 'felt'
     screen    'lattice' 'cloth' 'carved' 'hide' 'reed' 'panel'
     store     'jars' 'sacks' 'baskets' 'crates' 'barrels' 'gourds'
     shelfFill 'books' 'scrolls' 'jars' 'bundles' 'tablets' 'parts'
     rack      'tools' 'cloaks' 'weapons' 'nets' 'spears'
     art       'mask' 'skull' 'plate' 'panel' 'mosaic' 'shield' 'antler' 'relief' 'sunplate' 'horns'
     statue    'figure' 'idol' 'totem' 'urn' 'globe' 'skullpole' 'obelisk' 'vase' 'guardian'
     tapestry  'medallion' 'stripes' 'chevrons' 'grid' 'sun' 'waves' 'diamond' 'wheel' 'claw' 'moon' 'spiral' 'figure'
     canopy    true | false (court bed: posts and hangings, or a dais with a tall head)
     sym?      a SYMBOLS key (core/sockets/38-symbols.js); default: the culture's pack's symbol (SYMBOL_OF)
     emblem?   { field, edge, band, disc?, ink, ink2? } palette keys for painted hangings: the pack's banner colours
     board     'slate' 'hide' 'bark' 'panel' 'plastic'
     lampCol?  palette key of the lamp's glass or shade; cushionsOn? extra cushions on seats

   THE TRADE ROLES (FK.ROLES.trade: forge anvil trough stall hayrack display armour_stand weapon_rack vat
   still bin larder bunk locker lathe press kiln grindstone barrel) are the shops', industries', stables'
   and tenements' pieces, registered per culture with FK.set({ roles: 'trade', tier }) (optional style
   field: rackWeapons, the rack style of the weapon rack, default 'weapons').
   THE ROLES  (FK.ROLES[tier]) list, per tier, the role, its FURN type, rooms, anchor, clearance,
   default dims, variants and which style slots it draws with (so FK.set() can declare `materials`
   truthfully). Dims may be overridden per culture (spec.dims[role]) and any role replaced by a
   bespoke build (spec.override[role] = { build, w, d, h, ... }) or skipped (spec.skip).
   ====================================================================== */
const FK = (function () {
  'use strict';
  const K = {};
  const SLOT_FAM = { wood: 'woodFam', cloth: 'clothFam', accent: 'accentFam', metal: 'metalFam', clay: 'clayFam', stone: 'stoneFam' };
  const SLOT_DEFAULT = { woodFam: 'wood', clothFam: 'cloth', accentFam: 'metal', metalFam: 'metal', clayFam: 'stone', stoneFam: 'stone' };

/* ======== Palette resolve and frame helpers ======== */
  /* ------------------------------------------------------------ palette resolve */
  K.pal = function (F, S) {
    const c = (k, alt) => F.col(k != null ? k : alt);
    const wood = c(S.wood);
    const P = {
      wood: wood,
      woodD: S.woodDark ? c(S.woodDark) : F.shade(wood, -0.22),
      woodL: S.woodLight ? c(S.woodLight) : F.shade(wood, 0.14),
      wf: S.woodFam || 'wood',
      cloth: F.cols(S.cloth), cf: S.clothFam || 'cloth',
      acc: c(S.accent, S.wood), af: S.accentFam || 'metal',
      metal: c(S.metal, S.accent != null ? S.accent : S.wood), mf: S.metalFam || 'metal',
      clay: c(S.clay, S.wood), clf: S.clayFam || 'stone',
      stone: c(S.stone, S.clay != null ? S.clay : S.wood), sf: S.stoneFam || 'stone',
      rope: S.rope ? c(S.rope) : F.shade(wood, 0.3),
      flame: S.flame ? c(S.flame) : null, ember: S.ember ? c(S.ember) : null,
      pick: () => F.pick(S.cloth)
    };
    P.clothL = F.shade(P.cloth[0], 0.35);
    return P;
  };
  /* a local offset (lx, lz) about (cx, cz) turned by ry: the engine's own frame convention */
  K.rot = function (cx, cz, lx, lz, ry) {
    const c = Math.cos(ry), s = Math.sin(ry);
    return [cx + lx * c + lz * s, cz - lx * s + lz * c];
  };

/* ======== Legs ======== */
  /* ------------------------------------------------------------ legs
     w, d: the outer footprint the legs stay inside; h: their height. o.r: leg half-width. */
  K.legs = function (F, P, S, w, d, h, o) {
    o = o || {};
    const r = o.r || Math.max(0.025, Math.min(0.05, w * 0.045)), style = o.style || S.legs || 'straight';
    const ix = w / 2 - r - 0.01, iz = d / 2 - r - 0.01;
    const c = o.color || P.woodD, f = o.fam || P.wf;
    const corners = [[-ix, -iz], [ix, -iz], [-ix, iz], [ix, iz]];
    if (style === 'turned') {
      for (const [x, z] of corners) {
        F.cyl(x, 0, z, r, h, 0, c, f);
        F.cyl(x, h * 0.3, z, r * 1.35, r * 1.2, 0, F.shade(c, -0.12), f);
        F.cyl(x, h * 0.62, z, r * 1.25, r, 0, F.shade(c, 0.08), f);
      }
    } else if (style === 'splayed') {
      for (const [x, z] of corners) F.beam(x * 0.82, h, z * 0.82, x, 0, z, r * 1.6, r * 1.6, c, f);
    } else if (style === 'block') {
      for (const x of [-ix, ix]) F.box(x, 0, 0, r * 2.2, h, d * 0.82, 0, c, f);
    } else if (style === 'trestle') {
      for (const x of [-ix, ix]) {
        F.beam(x, h, 0, x, 0, -iz * 0.9, r * 1.4, r * 1.4, c, f);
        F.beam(x, h, 0, x, 0, iz * 0.9, r * 1.4, r * 1.4, c, f);
        F.box(x, 0, 0, r * 2, r * 1.2, d * 0.9, 0, F.shade(c, -0.1), f);
      }
      F.box(0, h * 0.35, 0, w - r * 4.4, r * 1.6, r * 1.6, 0, c, f);
    } else if (style === 'x') {
      for (const x of [-ix, ix]) {
        F.beam(x, h, -iz, x, 0, iz, r * 1.3, r * 1.3, c, f);
        F.beam(x, h, iz, x, 0, -iz, r * 1.3, r * 1.3, c, f);
      }
      F.box(0, h * 0.45, 0, w - 4.4 * r, r * 1.4, r * 1.4, 0, c, f);
    } else if (style === 'post' || style === 'lashed') {
      for (const [x, z] of corners) {
        F.cyl(x, 0, z, r, h, 0, c, f);
        for (let y = h * 0.28; y < h * 0.95; y += h * 0.34) F.cyl(x, y, z, r * 1.12, r * 0.5, 0, F.shade(c, -0.15), f);
        if (style === 'lashed') F.cyl(x, Math.max(0, h - r * 3.2), z, r * 1.3, r * 1.8, 0, P.rope, 'rope');
      }
    } else if (style === 'pedestal') {
      const rb = Math.min(w, d) * 0.3;
      F.cyl(0, 0, 0, rb, r * 1.5, 0, c, f);
      F.cyl(0, 0, 0, r * 2, h, 0, c, f);
      F.cyl(0, h * 0.45, 0, r * 2.6, r * 1.2, 0, F.shade(c, -0.1), f);
    } else if (style === 'strut') {
      for (const [x, z] of corners) {
        F.box(x, 0, z, r * 1.7, h, r * 0.45, 0, c, f);
        F.box(x, 0, z, r * 0.45, h, r * 1.7, 0, c, f);
      }
    } else if (style === 'cabriole') {
      for (const [x, z] of corners) {
        F.beam(x * 0.9, h, z * 0.9, x, h * 0.45, z, r * 1.5, r * 1.5, c, f);
        F.beam(x, h * 0.45, z, x * 0.93, 0, z * 0.93, r * 1.3, r * 1.3, c, f);
        F.ball(x * 0.93, r * 0.9, z * 0.93, r * 1.1, F.shade(c, 0.1), f);
      }
    } else {
      for (const [x, z] of corners) F.box(x, 0, z, r * 2, h, r * 2, 0, c, f);
    }
    if (o.stretchers && style !== 'block' && style !== 'pedestal' && style !== 'trestle' && style !== 'x') {
      for (const s of [-1, 1]) F.box(0, h * 0.22, s * iz, w - r * 4.4, r, r, 0, c, f);
    }
    return { r: r, ix: ix, iz: iz };
  };

/* ======== Motifs, bands, finials, cushions ======== */
  /* ------------------------------------------------------------ motifs
     one unit of the culture's motif at (x, y, z), size s, on a face whose outward normal
     is +z turned by ry. Everything stays within s/2 of the point and `out` m proud of the face. */
  K.motifAt = function (F, P, S, x, y, z, s, ry, kind) {
    kind = kind || S.motif || 'none';
    const c = P.acc, f = P.af, out = 0.012;
    const at = (lx, lz) => K.rot(x, z, lx, lz, ry || 0);
    if (kind === 'none') return;
    if (kind === 'dots') {
      const p = at(0, out); F.ball(p[0], y, p[1], s * 0.3, c, f);
    } else if (kind === 'studs' || kind === 'rivet') {
      const p = at(0, out); F.box(p[0], y - s * 0.22, p[1], s * 0.44, s * 0.44, out * 2, ry, kind === 'rivet' ? P.metal : c, kind === 'rivet' ? P.mf : f);
    } else if (kind === 'chevron') {
      const a = at(-s * 0.4, out), m = at(0, out), b = at(s * 0.4, out);
      F.beam(a[0], y - s * 0.25, a[1], m[0], y + s * 0.25, m[1], s * 0.14, out * 2, c, f);
      F.beam(m[0], y + s * 0.25, m[1], b[0], y - s * 0.25, b[1], s * 0.14, out * 2, c, f);
    } else if (kind === 'wave') {
      const a = at(-s * 0.45, out), m = at(0, out), b = at(s * 0.45, out);
      F.beam(a[0], y - s * 0.15, a[1], m[0], y + s * 0.2, m[1], s * 0.12, out * 2, c, f);
      F.beam(m[0], y + s * 0.2, m[1], b[0], y - s * 0.15, b[1], s * 0.12, out * 2, c, f);
      F.ball(m[0], y + s * 0.26, m[1], s * 0.1, F.shade(c, 0.2), f);
    } else if (kind === 'step') {
      for (let i = 0; i < 3; i++) {
        const p = at(-s * 0.3 + i * s * 0.3, out);
        F.box(p[0], y - s * 0.4 + i * s * 0.22, p[1], s * 0.28, s * 0.2, out * 2, ry, i % 2 ? F.shade(c, -0.15) : c, f);
      }
    } else if (kind === 'scale') {
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const p = at(-s * 0.22 + i * s * 0.44 + (j ? s * 0.22 : 0) - (j ? s * 0.22 : 0), out);
        F.blob(p[0], y - s * 0.2 + j * s * 0.4, p[1], s * 0.2, s * 0.26, 0, j ? F.shade(c, -0.12) : c, f);
      }
    } else if (kind === 'skull') {
      const p = at(0, out + s * 0.01);
      F.ball(p[0], y + s * 0.08, p[1], s * 0.15, c, f);
      F.box(p[0], y - s * 0.2, p[1], s * 0.22, s * 0.14, s * 0.1, ry, F.shade(c, -0.1), f);
      const e1 = at(-s * 0.06, out + s * 0.14), e2 = at(s * 0.06, out + s * 0.14);
      F.ball(e1[0], y + s * 0.1, e1[1], s * 0.03, P.woodD, P.wf);
      F.ball(e2[0], y + s * 0.1, e2[1], s * 0.03, P.woodD, P.wf);
    } else if (kind === 'lozenge') {
      const p = at(0, out);
      F.box(p[0], y - s * 0.18, p[1], s * 0.36, s * 0.36, out * 2, ry, c, f);
      F.box(p[0], y - s * 0.09, p[1], s * 0.18, s * 0.18, out * 3, ry, P.woodD, P.wf);
    } else if (kind === 'spiral') {
      for (let i = 0; i < 6; i++) {
        const a = i * 1.05, rr = s * 0.08 + i * s * 0.05;
        const p = at(Math.cos(a) * rr, out);
        F.ball(p[0], y + Math.sin(a) * rr, p[1], s * 0.07, c, f);
      }
    } else if (kind === 'lash') {
      const p = at(0, 0);
      F.cyl(p[0], y - s * 0.3, p[1], s * 0.3, s * 0.6, 0, P.rope, 'rope');
    } else if (kind === 'band') {
      const p = at(0, out);
      F.box(p[0], y - s * 0.12, p[1], s, s * 0.24, out * 2, ry, c, f);
    }
  };
  /* a run of motif units along a face: centre (x, y, z), length w, unit size s, normal +z turned by ry */
  K.band = function (F, P, S, x, y, z, w, s, ry, kind) {
    kind = kind || S.motif || 'none';
    if (kind === 'none') return;
    const n = Math.max(1, Math.floor(w / (s * 1.4)));
    const step = w / n;
    for (let i = 0; i < n; i++) {
      const p = K.rot(x, z, -w / 2 + step * (i + 0.5), 0, ry || 0);
      K.motifAt(F, P, S, p[0], y, p[1], s, ry, kind);
    }
  };
  /* a disc of radius r facing +z, from z0 to z1 (the engine's F.cyl is vertical only; a rod can lie along z) */
  K.disc = function (F, x, y, z0, z1, r, c, f) { F.rod(x, y, z0, x, y, z1, r, c, f); };
  /* a finial on top of a post at (x, y, z); it rises at most 2.2 r */
  K.finial = function (F, P, S, x, y, z, r) {
    const k = S.finial || 'ball';
    if (k === 'none') return;
    if (k === 'ball') F.ball(x, y + r, z, r, P.acc, P.af);
    else if (k === 'knob') { F.cyl(x, y, z, r * 0.6, r * 0.8, 0, P.acc, P.af); F.ball(x, y + r * 1.2, z, r * 0.8, P.acc, P.af); }
    else if (k === 'point') F.cone(x, y, z, r, r * 2.2, 0, P.acc, P.af);
    else if (k === 'disc') { F.cyl(x, y, z, r * 1.3, r * 0.35, 0, P.acc, P.af); F.ball(x, y + r * 0.7, z, r * 0.5, P.acc, P.af); }
    else if (k === 'skull') { F.ball(x, y + r, z, r, P.acc, P.af); F.box(x, y, z, r * 1.2, r * 0.6, r, 0, F.shade(P.acc, -0.1), P.af); }
  };
  /* ------------------------------------------------------------ emblems
     The culture's device, drawn with the socket packs' own SYMBOLS (core/sockets/38-symbols.js,
     read in place under the name krator-symbols.js) so a tapestry matches the banner on the building. K.symbolOf
     picks the symbol: the sheet's `sym`, else the culture's pack's (SYMBOL_OF), else the culture's own. */
  K.symbolOf = function (S, culture) {
    if (S && S.sym) return S.sym;
    const info = (typeof FURN_CULTURE_INFO !== 'undefined' && FURN_CULTURE_INFO[culture]) || {};
    const table = typeof SYMBOL_OF !== 'undefined' ? SYMBOL_OF : {};
    return (info.pack && table[info.pack]) || table[culture] || null;
  };
  K.hasSym = function (sym) { return !!(sym && typeof SYMBOLS !== 'undefined' && SYMBOLS[sym]); };
  /* the emblem colours as CSS, from the sheet's `emblem` keys or its cloth and accent */
  K.emblemCols = function (F, S) {
    const e = S.emblem || {}, c = (k, alt) => F.css(F.col(k != null ? k : alt));
    const cl = S.cloth;
    return { field: c(e.field, cl[0]), edge: c(e.edge, cl[1 % cl.length]), band: c(e.band, cl[2 % cl.length]),
      disc: e.disc ? c(e.disc) : null, ink: c(e.ink, S.accent || cl[3 % cl.length]), ink2: c(e.ink2, e.ink != null ? e.ink : (S.accent || cl[3 % cl.length])) };
  };
  /* paint a banner field: edges, end bands, an optional disc and the symbol (the packs' drawBan, minus its grain) */
  K.paintBanner = function (g, W, H, E, sym, o) {
    o = o || {};
    g.fillStyle = E.field; g.fillRect(0, 0, W, H);
    const e = Math.min(W, H) * (o.edge == null ? 0.09 : o.edge);
    if (e > 0) {
      g.fillStyle = E.edge;
      if (H > W) { g.fillRect(0, 0, e, H); g.fillRect(W - e, 0, e, H); g.fillStyle = E.band; g.fillRect(0, 0, W, e * 0.8); g.fillRect(0, H - e * 0.8, W, e * 0.8); }
      else { g.fillRect(0, 0, W, e); g.fillRect(0, H - e, W, e); g.fillStyle = E.band; g.fillRect(0, 0, e * 0.8, H); g.fillRect(W - e * 0.8, 0, e * 0.8, H); }
    }
    const R = Math.min(W * 0.4, H * 0.32) * (o.scale || 1), cx = o.cx != null ? o.cx * W : W / 2, cy = o.cy != null ? o.cy * H : (H > W * 1.25 ? H * 0.38 : H * 0.5);
    if (E.disc) { g.fillStyle = E.disc; g.beginPath(); g.arc(cx, cy, R * 1.06, 0, Math.PI * 2); g.fill(); }
    if (K.hasSym(sym)) SYMBOLS[sym](g, cx, cy, R * 0.94, E.ink, E.ink2);
    else { g.fillStyle = E.ink; g.beginPath(); g.arc(cx, cy, R * 0.5, 0, Math.PI * 2); g.fill(); }
    if (o.bands && H > W * 1.25) { g.fillStyle = E.band; for (let k = 0; k < 3; k++) g.fillRect(W * 0.24, H * 0.66 + k * H * 0.06, W * 0.52, H * 0.025); }
  };
  /* a seeded number stream for painting (canvas paint runs once per key, never from the piece's own stream) */
  K.paintRng = function (seed) { let st = (seed * 2654435761) >>> 0; return () => { st = (Math.imul(st, 1664525) + 1013904223) >>> 0; return st / 4294967296; }; };

  /* a cushion (flattened ellipsoid) */
  K.cushion = function (F, P, x, y, z, w, d, t, col) {
    F.blob(x, y + t / 2, z, Math.min(w, d) / 2, t, 0, col || P.pick(), P.cf);
    if (w !== d) F.box(x, y + t * 0.15, z, w * 0.9, t * 0.7, d * 0.9, 0, col || P.cloth[0], P.cf);
  };

/* ======== Role builders: beds and seating (bed, bedFine, bench, chair, throne, divan) ======== */
  /* ================================================================ role builders
     Every builder: (F, S, o) with o = { w, d, h, variant, court } and the piece inside
     x ±w/2, z ±d/2, y 0..h. +z is the front. */
  const B = {};
  K.build = B;

  B.bed = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const head = S.bedHead !== 'none' && H > 0.75;
    const legH = Math.min(0.38, H * (head ? 0.42 : 0.62)), r = 0.045;
    const L = K.legs(F, P, S, W - 0.02, D - 0.02, legH, { r: r });
    for (const s of [-1, 1]) {
      F.box(s * (W / 2 - 0.06), legH - 0.11, 0, 0.07, 0.1, D - 0.1, 0, P.wood, P.wf);              /* tops 1 cm under the legs' */
      F.box(0, legH - 0.115, s * (D / 2 - 0.06), W - 0.1, 0.1, 0.07, 0, P.wood, P.wf);             /* and 5 mm under the side rails' */
    }
    const base = S.bedBase || 'plank';
    if (base === 'rope') {
      for (let i = 0; i < 8; i++) F.rod(-W / 2 + 0.1, legH - 0.03, -D / 2 + 0.14 + i * (D - 0.28) / 7, W / 2 - 0.1, legH - 0.03, -D / 2 + 0.14 + i * (D - 0.28) / 7, 0.011, P.rope, 'rope');
      for (let i = 0; i < 4; i++) F.rod(-W * 0.3 + i * W * 0.2, legH - 0.035, -D / 2 + 0.1, -W * 0.3 + i * W * 0.2, legH - 0.035, D / 2 - 0.1, 0.011, F.shade(P.rope, -0.1), 'rope');
    } else if (base === 'woven') {
      F.box(0, legH - 0.04, 0, W - 0.14, 0.03, D - 0.14, 0, P.rope, 'rope');
    } else if (base === 'slab') {
      F.box(0, 0, 0, W - 0.05, legH - 0.004, D - 0.05, 0, P.stone, P.sf);   /* inside the corner legs, under the mattress: no face shared */
    } else {
      for (let i = 0; i < 6; i++) F.box(0, legH - 0.05, -D / 2 + 0.2 + i * (D - 0.4) / 5, W - 0.14, 0.03, 0.12, 0, F.shade(P.wood, 0.05), P.wf);
    }
    const matt = P.pick();
    F.box(0, legH, 0.02, W - 0.16, 0.1, D - 0.16, 0, matt, P.cf);
    F.blob(0, legH + 0.15, -D / 2 + 0.3, Math.min(0.3, W * 0.28), 0.12, 0, P.clothL, P.cf);
    if (v === 1) {
      const b = P.pick();
      F.box(0, legH + 0.104, D * 0.1, W - 0.06, 0.05, D * 0.62, 0, b, P.cf);   /* a hair over the mattress, the band a hair over it: no face shared */
      for (const s of [-1, 1]) F.box(s * (W / 2 + 0.005), legH - 0.12, D * 0.1, 0.02, 0.26, D * 0.62, 0, F.shade(b, -0.1), P.cf);   /* clear of the rail's face */
      F.box(0, legH + 0.158, -D * 0.2, W - 0.05, 0.04, 0.12, 0, F.shade(b, 0.12), P.cf);
    }
    if (head) {
      F.box(0, 0, -D / 2 + 0.035, W - 0.02, H, 0.06, 0, P.wood, P.wf);
      K.band(F, P, S, 0, H - 0.14, -D / 2 + 0.065, W - 0.3, 0.1, 0);
      for (const s of [-1, 1]) K.finial(F, P, S, s * (W / 2 - 0.06), H - 0.08, -D / 2 + 0.035, 0.035);
    }
  };

  /* court bed: canopy with posts and hangings, or a dais with a tall head and a hanging behind */
  B.bedFine = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const canopy = S.canopy !== false;
    const plinthH = 0.36;
    F.box(0, 0, 0, W - 0.1, 0.08, D - 0.1, 0, P.woodD, P.wf);
    F.box(0, 0.08, 0, W - 0.06, plinthH - 0.12, D - 0.06, 0, P.wood, P.wf);
    F.box(0, plinthH - 0.04, 0, W - 0.02, 0.04, D - 0.02, 0, P.woodL, P.wf);
    for (const s of [-1, 1]) K.band(F, P, S, s * (W / 2 - 0.03), 0.2, 0, D - 0.4, 0.1, s * Math.PI / 2);
    K.band(F, P, S, 0, 0.2, D / 2 - 0.03, W - 0.4, 0.1, 0);
    F.box(0, plinthH, 0, W - 0.14, 0.14, D - 0.14, 0, P.clothL, P.cf);
    const cover = P.pick();
    F.box(0, plinthH + 0.14, D * 0.1, W - 0.12, 0.04, D * 0.68, 0, cover, P.cf);
    for (let k = 0; k < 3; k++) F.blob((k - 1) * W * 0.28, plinthH + 0.21, -D / 2 + 0.3, Math.min(0.22, W * 0.14), 0.15, F.rr(-0.2, 0.2), P.pick(), P.cf);
    const hang = P.cloth[(v + 1) % P.cloth.length];
    if (canopy) {
      const px = W / 2 - 0.06, pz = D / 2 - 0.06, postH = H - 0.1;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        F.cyl(sx * px, 0, sz * pz, 0.04, postH, 0, P.acc, P.af);
        for (const y of [0.4, 1.2]) F.cyl(sx * px, y, sz * pz, 0.055, 0.05, 0, F.shade(P.acc, -0.15), P.af);
        K.finial(F, P, S, sx * px, postH, sz * pz, 0.045);
      }
      F.box(0, H - 0.22, 0, W - 0.02, 0.08, D - 0.02, 0, P.woodD, P.wf);
      F.box(0, H - 0.14, 0, W - 0.1, 0.04, D - 0.1, 0, hang, P.cf);
      K.band(F, P, S, 0, H - 0.18, D / 2 - 0.01, W - 0.4, 0.07, 0);
      for (const s of [-1, 1]) {
        F.box(s * (W / 2 - 0.02), H - 0.46, 0, 0.02, 0.24, D - 0.06, 0, F.shade(hang, -0.1), P.cf);
        F.box(0, H - 0.46, s * (D / 2 - 0.02), W - 0.06, 0.24, 0.02, 0, F.shade(hang, -0.1), P.cf);
      }
      F.box(0, plinthH + 0.1, -D / 2 + 0.03, W - 0.2, H - 0.6 - plinthH, 0.03, 0, hang, P.cf);
      for (const sx of [-1, 1]) {
        F.box(sx * (W / 2 - 0.15), plinthH, D / 2 - 0.1, 0.14, H - 0.5 - plinthH, 0.06, 0, F.shade(hang, 0.05), P.cf);
        F.blob(sx * (W / 2 - 0.15), plinthH + 0.6, D / 2 - 0.1, 0.09, 0.12, 0, P.acc, P.af);
      }
    } else {
      F.box(0, plinthH - 0.05, -D / 2 + 0.04, W - 0.04, H - plinthH + 0.05, 0.07, 0, P.wood, P.wf);
      F.box(0, plinthH + 0.2, -D / 2 + 0.08, W - 0.3, H - plinthH - 0.5, 0.03, 0, hang, P.cf);
      K.band(F, P, S, 0, H - 0.16, -D / 2 + 0.08, W - 0.3, 0.12, 0);
      for (const s of [-1, 1]) K.finial(F, P, S, s * (W / 2 - 0.07), H - 0.06, -D / 2 + 0.04, 0.04);
      for (const s of [-1, 1]) F.cyl(s * (W / 2 - 0.08), plinthH, D / 2 - 0.08, 0.035, 0.5, 0, P.acc, P.af);
    }
  };

  B.bench = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const seat = S.seat || 'plank', pad = seat === 'cushion' ? 0.06 : seat === 'hide' ? 0.03 : seat === 'woven' ? 0.025 : 0;
    const seatH = Math.min(0.46, H) - pad, backed = v === 1 && H > 0.6;
    K.legs(F, P, S, W, D, seatH - 0.05, { stretchers: true });
    F.box(0, seatH - 0.05, 0, W, 0.05, D, 0, P.wood, P.wf);
    if (seat === 'cushion') F.box(0, seatH, 0, W - 0.08, 0.06, D - 0.06, 0, P.pick(), P.cf);
    else if (seat === 'hide') F.box(0, seatH, 0, W - 0.04, 0.03, D - 0.02, 0, P.cloth[0], P.cf);
    else if (seat === 'woven') F.box(0, seatH, 0, W - 0.06, 0.025, D - 0.06, 0, P.rope, 'rope');
    if (backed) {
      for (const s of [-1, 1]) F.box(s * (W / 2 - 0.04), seatH, -D / 2 + 0.035, 0.05, H - seatH, 0.05, 0, P.woodD, P.wf);
      F.box(0, H - 0.1, -D / 2 + 0.035, W - 0.08, 0.1, 0.03, 0, P.wood, P.wf);
      F.box(0, seatH + 0.12, -D / 2 + 0.035, W - 0.08, 0.06, 0.03, 0, P.wood, P.wf);
      K.band(F, P, S, 0, H - 0.05, -D / 2 + 0.05, W - 0.3, 0.07, 0);
    }
  };

  B.chair = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, stool = o.stool || H < 0.6;
    const seat = S.seat || 'plank', pad = seat === 'cushion' ? 0.07 : seat === 'hide' ? 0.025 : seat === 'woven' ? 0.02 : 0;
    const seatH = (stool ? Math.min(0.45, H) : 0.45) - pad;
    const L = K.legs(F, P, S, W, D, seatH - 0.04, { stretchers: !stool });
    if (stool && (S.legs === 'splayed' || S.legs === 'turned')) F.cyl(0, seatH - 0.04, 0, Math.min(W, D) / 2, 0.04, 0, P.wood, P.wf);
    else F.box(0, seatH - 0.04, 0, W, 0.04, D, 0, P.wood, P.wf);
    if (seat === 'cushion') K.cushion(F, P, 0, seatH, 0, W - 0.06, D - 0.06, 0.07);
    else if (seat === 'hide') F.box(0, seatH, 0, W - 0.03, 0.025, D - 0.03, 0, P.cloth[0], P.cf);
    else if (seat === 'woven') F.box(0, seatH, 0, W - 0.05, 0.02, D - 0.05, 0, P.rope, 'rope');
    if (!stool) {
      const bz = -D / 2 + 0.03;
      for (const s of [-1, 1]) F.box(s * (W / 2 - 0.03), seatH - 0.04, bz, 0.045, H - seatH + 0.04, 0.045, 0, P.woodD, P.wf);
      F.box(0, H - 0.09, bz, W - 0.06, 0.09, 0.03, 0, P.wood, P.wf);
      F.box(0, seatH + 0.14, bz, W - 0.06, 0.05, 0.025, 0, P.wood, P.wf);
      K.band(F, P, S, 0, H - 0.045, bz + 0.016, W - 0.2, 0.06, 0);
    }
  };

  B.throne = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const seatH = 0.5, bz = -D / 2 + 0.05;
    F.box(0, 0, 0, W, 0.06, D, 0, P.woodD, P.wf);                        /* dais step */
    const L = K.legs(F, P, S, W - 0.1, D - 0.1, seatH - 0.1, { r: 0.05 });
    F.box(0, seatH - 0.1, 0, W - 0.1, 0.07, D - 0.1, 0, P.wood, P.wf);
    K.band(F, P, S, 0, seatH - 0.065, D / 2 - 0.05, W - 0.4, 0.06, 0);
    K.cushion(F, P, 0, seatH - 0.03, 0.02, W - 0.22, D - 0.22, 0.08);
    F.box(0, seatH - 0.1, bz, W - 0.1, H - seatH + 0.1, 0.08, 0, P.wood, P.wf);   /* back */
    F.box(0, seatH + 0.1, bz + 0.045, W - 0.3, H - seatH - 0.45, 0.02, 0, P.pick(), P.cf);
    K.band(F, P, S, 0, H - 0.18, bz + 0.05, W - 0.3, 0.12, 0);
    for (const s of [-1, 1]) {
      F.box(s * (W / 2 - 0.1), seatH - 0.03, 0.02, 0.07, 0.25, D - 0.25, 0, P.woodD, P.wf);      /* arms */
      F.box(s * (W / 2 - 0.1), seatH + 0.22, 0.02, 0.1, 0.05, D - 0.2, 0, P.wood, P.wf);
      F.cyl(s * (W / 2 - 0.1), seatH - 0.03, D / 2 - 0.15, 0.035, 0.26, 0, P.acc, P.af);
      K.finial(F, P, S, s * (W / 2 - 0.1), H - 0.12, bz, 0.05);
      F.box(s * (W / 2 - 0.07), 0.06, bz, 0.06, H - 0.1, 0.1, 0, P.woodD, P.wf);
    }
    K.finial(F, P, S, 0, H - 0.14, bz, 0.06);
  };

  B.divan = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const platH = 0.34;
    K.legs(F, P, S, W, D, platH - 0.06, { r: 0.04 });
    F.box(0, platH - 0.08, 0, W, 0.08, D, 0, P.wood, P.wf);
    K.band(F, P, S, 0, platH - 0.04, D / 2 + 0.0, W - 0.3, 0.06, 0);
    F.box(0, platH, 0, W - 0.08, 0.1, D - 0.08, 0, P.pick(), P.cf);
    F.box(0, platH - 0.08, -D / 2 + 0.03, W, Math.min(0.42, H - platH), 0.06, 0, P.wood, P.wf);   /* low back */
    F.box(0, platH + 0.1, -D / 2 + 0.07, W - 0.1, Math.min(0.3, H - platH - 0.14), 0.08, 0, P.cloth[1 % P.cloth.length], P.cf);
    for (const s of [-1, 1]) {
      F.rod(s * (W / 2 - 0.16), platH + 0.22, -D * 0.05, s * (W / 2 - 0.16), platH + 0.22, D * 0.3, 0.12, P.pick(), P.cf);
      F.ball(s * (W / 2 - 0.16), platH + 0.22, D * 0.3, 0.12, P.acc, P.af);
    }
    for (let k = 0; k < 3; k++) K.cushion(F, P, (k - 1) * W * 0.26, platH + 0.1, D * 0.05, 0.4, 0.4, 0.1);
  };

/* ======== Role builders: tables, desks and storage (table, lowTable, desk, chest, cabinet, bookcase, wallShelves, store) ======== */
  B.table = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const t = Math.min(0.06, H * 0.08);
    K.legs(F, P, S, W - 0.06, D - 0.06, H - t, { stretchers: H > 0.6 });
    if (H > 0.6) F.box(0, H - t - 0.08, 0, W - 0.2, 0.08, D - 0.2, 0, P.woodD, P.wf);   /* apron */
    if (o.round) {
      F.cyl(0, H - t, 0, Math.min(W, D) / 2, t, 0, P.wood, P.wf);
      F.cyl(0, H - 0.005, 0, Math.min(W, D) / 2 - 0.02, 0.005, 0, P.woodL, P.wf);
    } else {
      F.box(0, H - t, 0, W, t, D, 0, P.wood, P.wf);
      F.box(0, H - 0.005, 0, W - 0.06, 0.005, D - 0.06, 0, P.woodL, P.wf);
      K.band(F, P, S, 0, H - t / 2, D / 2 - 0.0, W - 0.4, t * 0.9, 0);
    }
    if (v === 1) F.box(0, H, 0, W * 0.3, 0.012, D - 0.02, 0, P.pick(), P.cf);         /* runner */
    if (o.court) for (const s of [-1, 1]) F.box(s * (W / 2 - 0.04), H - t - 0.04, 0, 0.08, 0.04, D - 0.1, 0, P.acc, P.af);
  };

  B.lowTable = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const t = 0.04, legStyle = S.legs === 'turned' || S.legs === 'pedestal' ? 'pedestal' : S.legs;
    K.legs(F, P, S, W - 0.04, D - 0.04, H - t, { style: legStyle, r: 0.035 });
    if (o.round) {
      F.cyl(0, H - t, 0, Math.min(W, D) / 2, t, 0, P.wood, P.wf);
      F.cyl(0, H - 0.004, 0, Math.min(W, D) / 2 - 0.06, 0.004, 0, o.court ? P.acc : P.woodL, o.court ? P.af : P.wf);
    } else {
      F.box(0, H - t, 0, W, t, D, 0, P.wood, P.wf);
      F.box(0, H - 0.004, 0, W - 0.08, 0.004, D - 0.08, 0, o.court ? P.acc : P.woodL, o.court ? P.af : P.wf);
      if (o.court) F.box(0, H - 0.003, 0, W - 0.2, 0.004, D - 0.2, 0, P.wood, P.wf);
    }
    K.band(F, P, S, 0, H - t / 2, D / 2, W - 0.3, t * 0.9, 0);
  };

  B.desk = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const topH = Math.min(0.78, H - 0.02), t = 0.05;
    K.legs(F, P, S, W - 0.04, D - 0.04, topH - t, { stretchers: true });
    F.box(0, topH - t, 0, W, t, D, 0, P.wood, P.wf);
    F.box(0, topH - t - 0.16, 0, W - 0.12, 0.16, D - 0.14, 0, P.woodD, P.wf);          /* drawer box */
    for (let i = 0; i < 2; i++) F.box(-W / 4 + i * W / 2, topH - t - 0.13, D / 2 - 0.065, W * 0.38, 0.1, 0.012, 0, P.wood, P.wf);
    for (let i = 0; i < 2; i++) F.ball(-W / 4 + i * W / 2, topH - t - 0.08, D / 2 - 0.05, 0.016, P.acc, P.af);
    /* a low gallery at the back with pigeon-holes */
    if (H > topH + 0.12) {
      F.box(0, topH, -D / 2 + 0.1, W - 0.02, H - topH, 0.2, 0, P.woodD, P.wf);
      for (let i = 0; i < 4; i++) F.box(-W * 0.36 + i * W * 0.24, topH + 0.03, -D / 2 + 0.105, W * 0.18, H - topH - 0.06, 0.19, 0, F.shade(P.woodD, -0.3), P.wf);
      K.band(F, P, S, 0, H - 0.03, -D / 2 + 0.2, W - 0.3, 0.05, 0);
    }
    F.box(0.1, topH, 0.08, 0.3, 0.012, 0.22, 0.1, P.clothL, 'plaster');                /* a sheet */
    F.cyl(-W / 2 + 0.16, topH, -0.08, 0.035, 0.08, 0, P.clay, P.clf);                   /* ink pot */
  };

  B.chest = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const lid = Math.min(0.14, H * 0.22), foot = Math.min(0.1, H * 0.15);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * (W / 2 - 0.06), 0, sz * (D / 2 - 0.06), 0.08, foot, 0.08, 0, P.woodD, P.wf);
    F.box(0, foot, 0, W - 0.06, H - lid - foot, D - 0.06, 0, P.wood, P.wf);
    F.box(0, H - lid, 0, W, lid, D, 0, P.woodL, P.wf);
    const bands = v === 1 ? [-W * 0.3, 0, W * 0.3] : [0];
    for (const x of bands) {
      F.box(x, foot, D / 2 - 0.02, 0.05, H - lid - foot, 0.015, 0, P.metal, P.mf);
      F.box(x, H - lid, 0, 0.045, lid + 0.005, D + 0.005, 0, F.shade(P.metal, -0.08), P.mf);
    }
    F.box(0, H - lid - 0.16, D / 2 - 0.02, 0.12, 0.14, 0.015, 0, P.acc, P.af);       /* lock plate */
    F.ball(0, H - lid - 0.08, D / 2 - 0.005, 0.02, F.shade(P.acc, 0.15), P.af);
    if (v === 1) K.band(F, P, S, 0, H - lid - 0.3, D / 2 - 0.016, W - 0.5, 0.08, 0);
    for (const s of [-1, 1]) F.rod(s * (W / 2 - 0.003), H / 2, -0.08, s * (W / 2 - 0.003), H / 2, 0.08, 0.016, P.metal, P.mf);
  };

  B.cabinet = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    F.box(0, 0, 0, W, 0.1, D, 0, P.woodD, P.wf);
    F.box(0, 0.1, -0.01, W - 0.04, H - 0.26, D - 0.04, 0, P.wood, P.wf);
    F.box(0, H - 0.16, 0, W, 0.16, D, 0, P.woodD, P.wf);                                 /* cornice */
    K.band(F, P, S, 0, H - 0.08, D / 2, W - 0.3, 0.11, 0);
    const zf = D / 2 - 0.018;
    for (const s of [-1, 1]) {
      F.box(s * (W / 4 - 0.01), 0.14, zf, W / 2 - 0.08, H - 0.36, 0.012, 0, P.woodL, P.wf);    /* doors */
      F.box(s * (W / 4 - 0.01), 0.24, zf + 0.008, W / 2 - 0.22, H - 0.56, 0.008, 0, P.acc, P.af);   /* inlaid panel */
      F.box(s * (W / 4 - 0.01), 0.3, zf + 0.012, W / 2 - 0.3, H - 0.68, 0.006, 0, P.wood, P.wf);
      F.ball(s * 0.05, H / 2, zf + 0.012, 0.02, P.acc, P.af);
    }
    K.motifAt(F, P, S, -W / 4, H * 0.68, zf + 0.012, 0.12, 0);
    K.motifAt(F, P, S, W / 4, H * 0.68, zf + 0.012, 0.12, 0);
  };

  /* wall-anchored: back at z = -d/2 */
  B.bookcase = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const zb = -D / 2;
    F.box(0, 0, zb + 0.015, W, H, 0.03, 0, P.woodD, P.wf);                                  /* back board */
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.03), 0, 0, 0.06, H, D, 0, P.wood, P.wf);
    F.box(0, H - 0.08, 0, W, 0.08, D, 0, P.wood, P.wf);
    if (o.court) K.band(F, P, S, 0, H - 0.04, D / 2, W - 0.3, 0.07, 0);
    const n = Math.max(2, Math.round((H - 0.2) / 0.42)), gap = (H - 0.14) / n;
    const fill = S.shelfFill || 'books';
    for (let k = 0; k < n; k++) {
      const y = 0.06 + k * gap;
      F.box(0, y, 0, W - 0.12, 0.03, D - 0.03, 0, P.wood, P.wf);
      let x = -W / 2 + 0.1;
      const top = y + gap - 0.03;
      while (x < W / 2 - 0.14) {
        if (fill === 'books') {
          const bw = F.rr(0.03, 0.06), bh = Math.min(top - y - 0.06, F.rr(0.22, 0.32));
          F.box(x + bw / 2, y + 0.03, -D * 0.1, bw, bh, D * 0.6, 0, P.pick(), P.cf);
          x += bw + 0.004;
        } else if (fill === 'scrolls') {
          const rr = 0.035;
          for (let j = 0; j < 2; j++) F.rod(x + rr, y + 0.03 + rr + j * rr * 2, -D / 2 + 0.08, x + rr, y + 0.03 + rr + j * rr * 2, D / 2 - 0.06, rr, F.shade(P.clothL, F.rr(-0.1, 0.05)), 'plaster');
          x += rr * 2 + 0.01;
        } else if (fill === 'tablets') {
          F.box(x + 0.05, y + 0.03, -D * 0.1, 0.1, Math.min(top - y - 0.06, 0.2), 0.03, F.rr(-0.1, 0.1), P.stone, P.sf);
          x += 0.13;
        } else if (fill === 'parts') {
          F.box(x + 0.07, y + 0.03, 0, 0.12, F.rr(0.06, 0.16), F.rr(0.08, D - 0.1), F.rr(-0.2, 0.2), F.shade(P.metal, F.rr(-0.2, 0.1)), P.mf);
          x += 0.17;
        } else if (fill === 'bundles') {
          F.rod(x + 0.05, y + 0.08, -D / 2 + 0.06, x + 0.05, y + 0.08, D / 2 - 0.06, 0.05, P.pick(), P.cf);
          x += 0.12;
        } else {
          const s = Math.min(1, (top - y - 0.05) / 0.3) * F.rr(0.7, 1);
          F.frustum(x + 0.08, y + 0.03, 0, 0.055 * s, 0.09 * s, 0.1 * s, 0, P.clay, P.clf, 9);
          F.frustum(x + 0.08, y + 0.03 + 0.1 * s, 0, 0.09 * s, 0.05 * s, 0.14 * s, 0, F.shade(P.clay, 0.05), P.clf, 9);
          x += 0.2;
        }
      }
    }
  };

  B.wallShelves = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const zb = -D / 2;
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.03), 0, zb + 0.03, 0.06, H, 0.06, 0, P.woodD, P.wf);   /* uprights on the wall */
    const n = 3, gap = (H - 0.1) / n;
    const fill = S.store || 'jars';
    for (let k = 0; k < n; k++) {
      const y = 0.08 + k * gap;
      F.box(0, y, 0, W - 0.04, 0.035, D - 0.02, 0, P.wood, P.wf);
      for (const s of [-1, 1]) F.beam(s * (W / 2 - 0.08), y, zb + 0.04, s * (W / 2 - 0.08), y - 0.12, zb + 0.04, 0.03, 0.03, P.woodD, P.wf);
      for (let j = 0; j < 3; j++) {
        const x = -W * 0.3 + j * W * 0.3 + F.rr(-0.05, 0.05), top = y + gap - 0.04;
        const sc = Math.min(1, (top - y - 0.05) / 0.3) * F.rr(0.75, 1);
        if (fill === 'sacks' || fill === 'baskets') {
          F.blob(x, y + 0.035 + 0.08 * sc, 0, 0.1 * sc, 0.16 * sc, 0, fill === 'sacks' ? P.pick() : P.rope, fill === 'sacks' ? P.cf : 'rope');
        } else if (fill === 'crates') {
          F.box(x, y + 0.035, 0, 0.18 * sc, 0.14 * sc, 0.16 * sc, F.rr(-0.1, 0.1), F.shade(P.wood, F.rr(-0.1, 0.1)), P.wf);
        } else if (fill === 'gourds') {
          F.ball(x, y + 0.035 + 0.07 * sc, 0, 0.07 * sc, F.shade(P.clay, F.rr(-0.1, 0.1)), 'plant');
          F.cyl(x, y + 0.035 + 0.12 * sc, 0, 0.025 * sc, 0.06 * sc, 0, F.shade(P.clay, -0.2), 'plant');
        } else {
          F.frustum(x, y + 0.035, 0, 0.055 * sc, 0.09 * sc, 0.1 * sc, 0, P.clay, P.clf, 9);
          F.frustum(x, y + 0.035 + 0.1 * sc, 0, 0.09 * sc, 0.05 * sc, 0.13 * sc, 0, F.shade(P.clay, 0.06), P.clf, 9);
        }
      }
    }
  };

  /* floor storage: jars, sacks, baskets, crates, barrels or gourds in a group */
  B.store = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.store || 'jars';
    const spots = [[-W * 0.28, 0.02, 1], [W * 0.1, -D * 0.12, 0.85], [W * 0.32, D * 0.14, 0.7]];
    for (const [x, z, s] of spots) {
      if (kind === 'sacks') {
        F.blob(x, H * 0.45 * s, z, Math.min(W * 0.2, D / 2 - 0.02), H * 0.9 * s, F.rr(-0.4, 0.4), P.pick(), P.cf);
        F.cyl(x, H * 0.86 * s, z, 0.05, 0.03, 0, P.rope, 'rope');
      } else if (kind === 'baskets') {
        F.frustum(x, 0, z, 0.1 * s, 0.16 * s, H * 0.75 * s, 0, P.rope, 'rope', 12);
        F.cyl(x, H * 0.75 * s, z, 0.17 * s, 0.03, 0, F.shade(P.rope, -0.15), 'rope');
      } else if (kind === 'crates') {
        F.box(x, 0, z, Math.min(W * 0.3, 0.4) * s, H * 0.9 * s, Math.min(D - 0.04, 0.4) * s, F.rr(-0.15, 0.15), F.shade(P.wood, F.rr(-0.1, 0.1)), P.wf);
        F.box(x, H * 0.9 * s - 0.03, z, Math.min(W * 0.3, 0.4) * s + 0.01, 0.03, 0.04, 0, P.woodD, P.wf);
      } else if (kind === 'barrels') {
        F.frustum(x, 0, z, 0.12 * s, 0.15 * s, H * 0.4 * s, 0, P.wood, P.wf, 12);
        F.frustum(x, H * 0.4 * s, z, 0.15 * s, 0.12 * s, H * 0.4 * s, 0, P.wood, P.wf, 12);
        for (const y of [0.15, 0.62]) F.cyl(x, H * y * s, z, 0.155 * s, 0.02, 0, P.metal, P.mf);
      } else if (kind === 'gourds') {
        F.ball(x, 0.12 * s, z, 0.12 * s, F.shade(P.clay, F.rr(-0.1, 0.1)), 'plant');
        F.cyl(x, 0.2 * s, z, 0.05 * s, H * 0.5 * s, 0, F.shade(P.clay, -0.1), 'plant');
        F.ball(x, 0.2 * s + H * 0.5 * s, z, 0.07 * s, F.shade(P.clay, 0.08), 'plant');
      } else {
        F.frustum(x, 0, z, 0.09 * s, 0.15 * s, H * 0.42 * s, 0, P.clay, P.clf, 12);
        F.frustum(x, H * 0.42 * s, z, 0.15 * s, 0.08 * s, H * 0.4 * s, 0, F.shade(P.clay, 0.05), P.clf, 12);
        F.cyl(x, H * 0.82 * s, z, 0.095 * s, H * 0.08 * s, 0, F.shade(P.clay, -0.12), P.clf);
        if (o.court) F.cyl(x, H * 0.5 * s, z, 0.153 * s, 0.03, 0, P.acc, P.af);
      }
    }
  };

/* ======== Role builders: fire and light (hearth, fire, lamp, hanging, candle) ======== */
  /* wall hearth: mud, stone, tile, iron or an oil-drum stove; fire inside and a light */
  B.hearth = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.hearth || 'stone', zb = -D / 2;
    const tile = S.tile ? F.col(S.tile) : P.acc, tf = S.tile ? 'ceramic' : P.af;
    const body = kind === 'mud' ? P.stone : kind === 'tile' ? tile : kind === 'iron' || kind === 'drum' ? P.metal : P.stone;
    const bf = kind === 'tile' ? tf : kind === 'iron' || kind === 'drum' ? P.mf : P.sf;
    const benchH = Math.min(0.72, H * 0.4);
    if (kind === 'drum') {
      F.box(0, 0, zb + 0.02, W * 0.7, H * 0.72, 0.04, 0, F.shade(body, 0.12), bf);           /* heat shield on the wall */
      F.box(W * 0.36, 0, zb + 0.22, W * 0.24, 0.3, 0.4, 0.1, P.woodD, P.wf);                   /* fuel: a bin of scrap wood */
      for (let i = 0; i < 4; i++) F.rod(W * 0.3 + F.rr(-0.06, 0.06), 0.3, zb + 0.08, W * 0.4 + F.rr(-0.06, 0.06), 0.34 + F.rr(0, 0.08), zb + 0.4, 0.02, F.shade(P.woodD, F.rr(-0.1, 0.1)), P.wf);
      F.cyl(-W * 0.36, 0, zb + 0.2, 0.12, 0.26, 0, P.metal, P.mf);                             /* ash bucket */
      F.cyl(0, 0, zb + 0.32, 0.3, benchH + 0.2, 0, body, bf);
      F.cyl(0, benchH + 0.2, zb + 0.32, 0.31, 0.03, 0, F.shade(body, -0.2), bf);
      F.box(0, 0.15, zb + 0.6, 0.26, 0.26, 0.04, 0, F.shade(body, -0.35), bf);
      F.cyl(0, benchH + 0.2, zb + 0.14, 0.07, H - benchH - 0.2, 0, F.shade(body, -0.1), bf);   /* flue */
      F.ball(0, 0.28, zb + 0.5, 0.08, P.flame || P.acc, 'glow');
      F.lamp(0, 0.4, zb + 0.6, 0.6, 5);
      return;
    }
    F.box(0, 0, 0, W, benchH, D, 0, body, bf);
    F.box(0, benchH, 0.02, W - 0.04, 0.04, D - 0.06, 0, F.shade(body, 0.08), bf);
    if (kind === 'tile') for (let r = 0; r < 3; r++) for (let c = 0; c < Math.floor(W / 0.2); c++) {
      F.box(-W / 2 + 0.12 + c * 0.2, 0.08 + r * 0.2, D / 2 - 0.004, 0.17, 0.17, 0.008, 0, (r + c) % 2 ? P.clothL : F.shade(tile, 0.12), (r + c) % 2 ? tf : tf);
    }
    if (kind === 'stone') for (let i = 0; i < 7; i++) F.box(-W / 2 + 0.12 + i * (W - 0.24) / 6, F.rr(0.05, benchH - 0.3), D / 2 - 0.01, F.rr(0.12, 0.22), F.rr(0.1, 0.18), 0.02, 0, F.shade(body, F.rr(-0.18, 0.12)), bf);
    /* fire box, fire, pot */
    const fx = -W * 0.2;
    F.box(fx, 0.08, D / 2 - 0.02, Math.min(0.42, W * 0.3), 0.3, 0.05, 0, F.shade(body, -0.55), bf);
    F.box(fx, benchH + 0.04, 0.0, 0.42, 0.02, 0.42, 0, F.shade(body, -0.55), bf);
    if (P.ember) F.blob(fx, benchH + 0.07, 0, 0.17, 0.05, 0, P.ember, 'glow');
    F.ball(fx, benchH + 0.1, 0, 0.09, P.flame || P.acc, 'glow');
    F.frustum(fx, benchH + 0.06, 0, 0.14, 0.2, 0.12, 0, P.clay, P.clf, 10);
    F.frustum(fx, benchH + 0.18, 0, 0.2, 0.15, 0.12, 0, F.shade(P.clay, 0.06), P.clf, 10);
    /* hood stepping back to the flue */
    const hoodW = W * 0.8;
    F.box(0, benchH + 0.04, zb + 0.17, hoodW, 0.5, 0.34, 0, body, bf);
    F.box(0, benchH + 0.54, zb + 0.14, hoodW * 0.76, 0.3, 0.28, 0, F.shade(body, 0.04), bf);
    F.box(0, benchH + 0.84, zb + 0.1, hoodW * 0.45, H - benchH - 0.84, 0.2, 0, F.shade(body, 0.08), bf);
    F.box(0, benchH + 0.34, zb + 0.35, hoodW + 0.04, 0.05, 0.04, 0, o.court ? P.acc : F.shade(body, 0.12), o.court ? P.af : bf);   /* mantel */
    if (o.court) K.band(F, P, S, 0, benchH + 0.72, zb + 0.29, hoodW * 0.7, 0.08, 0);
    F.lamp(fx, benchH + 0.3, 0.1, 0.8, 6);
  };

  /* free-standing fire: tripod brazier, bowl on a stand, stone ring, cut drum, pit, iron basket */
  B.fire = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.fire || 'bowl', R = Math.min(W, D) / 2;
    const fy = (y) => { if (P.ember) F.blob(0, y + 0.02, 0, R * 0.55, 0.05, 0, P.ember, 'glow'); F.ball(0, y + 0.1, 0, R * 0.3, P.flame || P.acc, 'glow'); F.cone(0, y + 0.1, 0, R * 0.2, R * 0.6, 0, P.flame || P.acc, 'glow'); F.lamp(0, y + 0.3, 0, 0.9, 7); };
    if (kind === 'tripod') {
      const bh = H * 0.55;
      for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.5; F.rod(Math.cos(a) * (R - 0.02), 0, Math.sin(a) * (R - 0.02), Math.cos(a) * R * 0.5, bh, Math.sin(a) * R * 0.5, 0.015, P.metal, P.mf); }
      F.frustum(0, bh - 0.02, 0, R * 0.4, R * 0.7, H * 0.2, 0, P.metal, P.mf, 12);
      fy(bh + H * 0.15);
    } else if (kind === 'ring') {
      for (let i = 0; i < 9; i++) { const a = i * F.TAU / 9; F.box(Math.cos(a) * (R - 0.1), 0, Math.sin(a) * (R - 0.1), 0.18, F.rr(0.1, 0.16), 0.14, -a, F.shade(P.stone, F.rr(-0.15, 0.1)), P.sf); }
      F.cyl(0, 0, 0, R * 0.6, 0.03, 0, F.shade(P.stone, -0.5), P.sf);
      for (let i = 0; i < 3; i++) F.rod(-R * 0.4, 0.05 + i * 0.03, (i - 1) * 0.1, R * 0.4, 0.05 + i * 0.03, (1 - i) * 0.08, 0.025, P.woodD, P.wf);
      fy(0.08);
      /* a tripod over it */
      for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.rod(Math.cos(a) * (R - 0.03), 0, Math.sin(a) * (R - 0.03), 0, H - 0.05, 0, 0.015, P.woodD, P.wf); }
      F.rod(0, H - 0.3, 0, 0, H * 0.55, 0, 0.006, P.metal, P.mf);
      F.frustum(0, H * 0.45, 0, 0.1, 0.13, 0.1, 0, P.metal, P.mf, 10);
    } else if (kind === 'drum') {
      F.cyl(0, 0, 0, R * 0.9, H * 0.7, 0, P.metal, P.mf);
      F.cyl(0, H * 0.7 - 0.02, 0, R * 0.92, 0.03, 0, F.shade(P.metal, -0.2), P.mf);
      for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6; F.box(Math.cos(a) * R * 0.9, H * 0.25, Math.sin(a) * R * 0.9, 0.06, 0.12, 0.02, -a, F.shade(P.metal, -0.5), P.mf); }
      fy(H * 0.7);
    } else if (kind === 'pit') {
      F.cyl(0, 0, 0, R, 0.08, 0, P.stone, P.sf);
      F.cyl(0, 0.08, 0, R * 0.8, 0.02, 0, F.shade(P.stone, -0.5), P.sf);
      for (let i = 0; i < 3; i++) F.rod(-R * 0.5, 0.1 + i * 0.03, (i - 1) * 0.1, R * 0.5, 0.1 + i * 0.03, (1 - i) * 0.08, 0.03, P.woodD, P.wf);
      fy(0.14);
      for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.5; F.rod(Math.cos(a) * (R - 0.03), 0, Math.sin(a) * (R - 0.03), 0, H - 0.05, 0, 0.015, P.woodD, P.wf); }
      F.rod(0, H - 0.3, 0, 0, H * 0.55, 0, 0.006, P.rope, 'rope');
      F.frustum(0, H * 0.45, 0, 0.1, 0.13, 0.1, 0, P.clay, P.clf, 10);
    } else if (kind === 'basket') {
      F.cyl(0, 0, 0, R * 0.5, 0.04, 0, P.metal, P.mf);
      F.cyl(0, 0.04, 0, 0.03, H * 0.45, 0, P.metal, P.mf);
      const by = H * 0.49;
      for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.rod(Math.cos(a) * R * 0.5, by, Math.sin(a) * R * 0.5, Math.cos(a) * R * 0.85, by + H * 0.3, Math.sin(a) * R * 0.85, 0.012, P.metal, P.mf); }
      F.cyl(0, by, 0, R * 0.5, 0.03, 0, P.metal, P.mf);
      F.cyl(0, by + H * 0.3, 0, R * 0.86, 0.02, 0, P.metal, P.mf);
      fy(by + 0.05);
    } else {
      F.cyl(0, 0, 0, R * 0.55, 0.05, 0, P.metal, P.mf);
      F.cyl(0, 0.05, 0, 0.035, H * 0.4, 0, P.metal, P.mf);
      F.frustum(0, H * 0.42, 0, R * 0.35, R, H * 0.25, 0, P.metal, P.mf, 14);
      if (o.court) K.band(F, P, S, 0, H * 0.55, R * 0.95, R * 1.4, 0.06, 0);
      fy(H * 0.65);
    }
  };

  B.lamp = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.lamp || 'oil', R = Math.min(W, D) / 2;
    const glass = S.lampCol ? F.col(S.lampCol) : (P.flame || P.acc);
    if (kind === 'torch') {
      F.cyl(0, 0, 0, R * 0.9, 0.06, 0, P.stone, P.sf);
      F.cyl(0, 0.06, 0, 0.03, H - 0.3, 0, P.woodD, P.wf);
      F.cyl(0, H - 0.3, 0, 0.055, 0.12, 0, P.rope, 'rope');
      F.cone(0, H - 0.2, 0, 0.06, 0.2, 0, P.flame || P.acc, 'glow');
      F.lamp(0, H - 0.1, 0, 0.9, 7);
      return;
    }
    if (kind === 'bulb' || kind === 'glass') {
      F.cyl(0, 0, 0, R * 0.8, 0.04, 0, P.metal, P.mf);
      F.cyl(0, 0.04, 0, 0.025, H - 0.3, 0, P.metal, P.mf);
      F.rod(0, H - 0.3, 0, R * 0.5, H - 0.12, 0, 0.015, P.metal, P.mf);
      F.ball(R * 0.5, H - 0.12, 0, 0.07, glass, 'glow');
      if (kind === 'glass') F.cone(R * 0.5, H - 0.22, 0, R * 0.45, 0.14, 0, F.shade(glass, 0.2), 'glass');
      F.lamp(R * 0.5, H - 0.12, 0, 0.8, 7);
      return;
    }
    /* oil, candle or lantern: a stand with a tray or cage */
    F.frustum(0, 0, 0, R * 0.9, R * 0.4, 0.05, 0, P.acc, P.af, 12);
    F.cyl(0, 0.05, 0, 0.022, H - 0.32, 0, P.acc, P.af);
    for (const y of [0.3, 0.7]) if (y < H - 0.4) F.ball(0, y, 0, 0.04, F.shade(P.acc, 0.1), P.af);
    const ty = H - 0.28;
    if (kind === 'lantern') {
      F.box(0, ty, 0, R * 1.1, 0.03, R * 1.1, 0, P.metal, P.mf);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * R * 0.5, ty, sz * R * 0.5, 0.012, 0.22, 0.012, 0, P.metal, P.mf);
      F.box(0, ty + 0.03, 0, R * 0.95, 0.16, R * 0.95, 0, glass, 'glass');
      F.pyrRoof(0, ty + 0.22, 0, R * 1.1, 0.06, R * 1.1, 0, P.metal, P.mf);
      F.ball(0, ty + 0.1, 0, 0.03, P.flame || P.acc, 'glow');
    } else if (kind === 'candle') {
      F.frustum(0, ty, 0, 0.03, 0.07, 0.03, 0, P.acc, P.af, 12);
      F.cyl(0, ty + 0.03, 0, 0.022, 0.18, 0, P.clothL, 'plaster');
      F.cone(0, ty + 0.21, 0, 0.012, 0.06, 0, P.flame || P.acc, 'glow');
    } else {
      F.frustum(0, ty, 0, 0.03, 0.09, 0.05, 0, P.acc, P.af, 12);
      F.cyl(0, ty + 0.05, 0, 0.07, 0.06, 0, P.clay, P.clf);
      F.cone(0, ty + 0.11, 0, 0.018, 0.09, 0, P.flame || P.acc, 'glow');
      F.cyl(0, ty + 0.11, 0, 0.035, 0.1, 0, glass, 'glass');
    }
    F.lamp(0, H - 0.12, 0, 0.6, 6);
  };

  /* ceiling: a chain or cord from the ceiling (y = H) to a hanging lamp of the culture's kind */
  B.hanging = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, H = o.h;
    const kind = S.lamp || 'oil', R = W / 2, glass = S.lampCol ? F.col(S.lampCol) : (P.flame || P.acc);
    F.cyl(0, H - 0.03, 0, 0.07, 0.03, 0, P.metal, P.mf);                                    /* ceiling rose */
    const drop = H * 0.45;
    F.rod(0, H - 0.03, 0, 0, H - drop, 0, 0.008, kind === 'torch' ? P.rope : P.metal, kind === 'torch' ? 'rope' : P.mf);
    const y = H - drop;
    if (kind === 'lantern' || kind === 'torch') {
      F.box(0, y - 0.03, 0, R * 1.9, 0.03, R * 1.9, 0, P.metal, P.mf);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * R * 0.9, y - 0.4, sz * R * 0.9, 0.012, 0.37, 0.012, 0, P.metal, P.mf);
      F.box(0, y - 0.4, 0, R * 1.7, 0.03, R * 1.7, 0, P.metal, P.mf);
      F.box(0, y - 0.37, 0, R * 1.6, 0.3, R * 1.6, 0, glass, 'glass');
      F.ball(0, y - 0.2, 0, 0.035, P.flame || P.acc, 'glow');
    } else if (kind === 'bulb' || kind === 'glass') {
      F.cone(0, y - 0.25, 0, R * 0.98, 0.25, 0, P.metal, P.mf);
      F.ball(0, y - 0.24, 0, 0.07, glass, 'glow');
    } else if (kind === 'candle') {
      F.cyl(0, y - 0.04, 0, R, 0.04, 0, P.metal, P.mf);
      for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6; F.cyl(Math.cos(a) * R * 0.75, y, Math.sin(a) * R * 0.75, 0.014, 0.12, 0, P.clothL, 'plaster'); F.cone(Math.cos(a) * R * 0.75, y + 0.12, Math.sin(a) * R * 0.75, 0.008, 0.04, 0, P.flame || P.acc, 'glow'); }
      for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.rod(Math.cos(a) * R * 0.9, y, Math.sin(a) * R * 0.9, 0, y + 0.3, 0, 0.005, P.metal, P.mf); }
    } else {
      /* an oil bowl on three chains */
      for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.rod(0, y, 0, Math.cos(a) * R * 0.85, y - 0.3, Math.sin(a) * R * 0.85, 0.005, P.metal, P.mf); }
      F.frustum(0, y - 0.42, 0, R * 0.45, R * 0.9, 0.12, 0, P.acc, P.af, 12);
      F.cone(0, y - 0.3, 0, 0.02, 0.1, 0, P.flame || P.acc, 'glow');
      F.cyl(0, y - 0.3, 0, R * 0.5, 0.06, 0, glass, 'glass');
    }
    F.lamp(0, y - 0.2, 0, 0.7, 7);
  };

  /* surface: a candle on a dish; court: a candelabra */
  B.candle = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, H = o.h;
    if (o.court) {
      F.frustum(0, 0, 0, 0.08, 0.04, 0.03, 0, P.acc, P.af, 12);
      F.cyl(0, 0.03, 0, 0.016, H * 0.45, 0, P.acc, P.af);
      F.ball(0, H * 0.25, 0, 0.03, F.shade(P.acc, 0.12), P.af);
      const arms = [[-W / 2 + 0.03, 0], [W / 2 - 0.03, 0], [0, 0]];
      for (const [x, z] of arms) {
        if (x) F.beam(0, H * 0.45, 0, x, H * 0.55, z, 0.014, 0.014, P.acc, P.af);
        const y = x ? H * 0.55 : H * 0.48;
        F.frustum(x, y, z, 0.015, 0.035, 0.02, 0, P.acc, P.af, 10);
        F.cyl(x, y + 0.02, z, 0.013, H * 0.28, 0, P.clothL, 'plaster');
        F.cone(x, y + 0.02 + H * 0.28, z, 0.008, 0.04, 0, P.flame || P.acc, 'glow');
      }
      F.lamp(0, H, 0, 0.4, 4);
      return;
    }
    F.cyl(0, 0, 0, W / 2, 0.012, 0, P.clay, P.clf);
    F.cyl(0, 0.012, 0, 0.022, H - 0.06, 0, P.clothL, 'plaster');
    F.cone(0, H - 0.05, 0, 0.012, 0.05, 0, P.flame || P.acc, 'glow');
    F.lamp(0, H, 0, 0.3, 3);
  };

/* ======== Role builders: soft, screens, trade and work (rug, screen, counter, workbench, loom, rack, ladder, board) ======== */
  B.rug = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const kind = S.rug || 'woven';
    const field = P.cloth[v % P.cloth.length], border = P.cloth[(v + 1) % P.cloth.length], acc = o.court ? P.acc : P.clothL;
    if (kind === 'hide') {
      F.blob(0, 0.008, 0, Math.min(W, D) / 2 * 0.98, 0.016, 0, field, P.cf);
      F.box(0, 0.004, 0, W * 0.96, 0.012, D * 0.7, 0, field, P.cf);
      F.box(0, 0.004, 0, W * 0.7, 0.012, D * 0.96, 0, field, P.cf);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * W * 0.42, 0.002, sz * D * 0.4, W * 0.12, 0.012, D * 0.14, sx * sz * 0.5, F.shade(field, -0.1), P.cf);
      return;
    }
    if (kind === 'reed') {
      for (let i = 0; i < Math.floor(D / 0.1); i++) F.box(0, 0, -D / 2 + 0.05 + i * 0.1, W, 0.012, 0.09, 0, F.shade(field, i % 2 ? 0 : -0.06), 'reed');
      for (const s of [-1, 1]) F.box(0, 0.012, s * (D / 2 - 0.03), W, 0.006, 0.05, 0, border, P.cf);
      return;
    }
    if (kind === 'rag') {
      for (let i = 0; i < Math.floor(D / 0.08); i++) F.box(0, 0, -D / 2 + 0.04 + i * 0.08, W - F.rr(0, 0.08), 0.014, 0.075, 0, P.pick(), P.cf);
      return;
    }
    F.box(0, 0, 0, W, 0.012, D, 0, border, P.cf);
    if (kind === 'knotted' || kind === 'felt') {
      F.box(0, 0.012, 0, W - 0.3, 0.006, D - 0.3, 0, acc, o.court ? P.af : P.cf);
      F.box(0, 0.018, 0, W - 0.4, 0.006, D - 0.4, 0, field, P.cf);
      F.cyl(0, 0.024, 0, Math.min(W, D) * 0.22, 0.004, 0, acc, o.court ? P.af : P.cf);
      F.cyl(0, 0.026, 0, Math.min(W, D) * 0.14, 0.004, 0, F.shade(field, -0.25), P.cf);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * (W / 2 - 0.4), 0.024, sz * (D / 2 - 0.35), 0.22, 0.004, 0.22, Math.PI / 4, acc, o.court ? P.af : P.cf);
      for (const s of [-1, 1]) for (let i = 0; i < Math.floor(D / 0.14); i++) F.box(s * (W / 2 - 0.04), 0, -D / 2 + 0.07 + i * 0.14, 0.08, 0.006, 0.05, 0, P.clothL, P.cf);
    } else {
      /* woven stripes */
      const n = Math.floor((D - 0.2) / 0.18);
      for (let i = 0; i < n; i++) F.box(0, 0.012, -D / 2 + 0.1 + 0.09 + i * 0.18, W - 0.2, 0.006, 0.12, 0, i % 2 ? field : acc, P.cf);
      K.band(F, P, S, 0, 0.03, 0, W - 0.6, 0.1, 0, 'none');
    }
  };

  B.screen = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.screen || 'lattice', n = 3, pw = (W - 0.04) / n;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + 0.02 + pw * (i + 0.5), ry = (i === 1 ? 0 : (i === 0 ? 1 : -1)) * 0.3, zc = i === 1 ? D * 0.3 : -D * 0.2;
      const pw2 = pw * 0.95;
      F.box(x, 0, zc, pw2, 0.05, 0.05, ry, P.woodD, P.wf);
      F.box(x, H - 0.06, zc, pw2, 0.06, 0.05, ry, P.woodD, P.wf);
      const ends = [K.rot(x, zc, -pw2 / 2 + 0.02, 0, ry), K.rot(x, zc, pw2 / 2 - 0.02, 0, ry)];
      for (const e of ends) F.box(e[0], 0, e[1], 0.04, H, 0.05, ry, P.woodD, P.wf);
      if (kind === 'cloth' || kind === 'hide') F.box(x, 0.05, zc, pw2 - 0.06, H - 0.11, 0.015, ry, kind === 'hide' ? P.cloth[0] : P.cloth[i % P.cloth.length], P.cf);
      else if (kind === 'reed') for (let j = 0; j < Math.floor((H - 0.1) / 0.06); j++) F.box(x, 0.06 + j * 0.06, zc, pw2 - 0.06, 0.05, 0.012, ry, F.shade(P.rope, j % 2 ? -0.05 : 0.03), 'reed');
      else if (kind === 'panel' || kind === 'carved') {
        F.box(x, 0.05, zc, pw2 - 0.06, H - 0.11, 0.02, ry, P.wood, P.wf);
        for (let j = 0; j < 3; j++) {
          const p = K.rot(x, zc, 0, 0.012, ry);
          K.motifAt(F, P, S, p[0], H * 0.25 + j * H * 0.25, p[1], Math.min(0.16, pw2 * 0.5), ry);
        }
      } else {
        for (let j = 1; j < 5; j++) { const p = K.rot(x, zc, -pw2 / 2 + pw2 * j / 5, 0, ry); F.box(p[0], 0.05, p[1], 0.016, H - 0.11, 0.016, ry, P.wood, P.wf); }
        for (let j = 1; j < Math.floor(H / 0.25); j++) F.box(x, 0.05 + j * 0.25, zc, pw2 - 0.06, 0.016, 0.016, ry, P.wood, P.wf);
      }
      if (o.court) K.finial(F, P, S, ends[0][0], H - 0.06, ends[0][1], 0.025);
    }
  };

  B.counter = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    F.box(0, 0, 0.02, W - 0.04, 0.08, D - 0.12, 0, P.woodD, P.wf);
    F.box(0, 0.08, 0, W - 0.1, H - 0.15, D - 0.14, 0, P.wood, P.wf);
    for (let i = 0; i < Math.floor(W / 0.6); i++) F.box(-W / 2 + 0.35 + i * 0.6, 0.08, D / 2 - 0.08, 0.1, H - 0.15, 0.03, 0, P.woodD, P.wf);
    F.box(0, H - 0.07, 0, W, 0.07, D, 0, P.woodL, P.wf);
    F.box(0, H - 0.11, D / 2 - 0.02, W, 0.04, 0.04, 0, P.woodD, P.wf);
    F.box(0, H * 0.5, -D / 2 + 0.1, W - 0.2, 0.03, 0.14, 0, P.wood, P.wf);              /* keeper's shelf */
    if (v === 1) K.band(F, P, S, 0, H * 0.5, D / 2 - 0.05, W - 0.5, 0.12, 0);
    F.frustum(W * 0.3, H * 0.5 + 0.03, -D / 2 + 0.1, 0.045, 0.06, 0.08, 0, P.clay, P.clf, 10);   /* a jar on the keeper's shelf */
  };

  B.workbench = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const topH = Math.min(0.9, H) - 0.1;      /* the tools on it reach H */
    K.legs(F, P, S, W, D, topH - 0.08, { style: S.legs === 'turned' ? 'straight' : S.legs, stretchers: true, r: 0.045 });
    F.box(0, topH - 0.08, 0, W, 0.08, D, 0, P.wood, P.wf);
    F.box(0, 0.2, 0, W - 0.2, 0.03, D - 0.2, 0, P.woodD, P.wf);                        /* lower shelf */
    F.box(0, 0.25, -D / 2 + 0.02, W - 0.1, H - 0.25, 0.04, 0, F.shade(P.woodD, -0.1), P.wf);   /* tool board on the wall */
    for (let i = 0; i < 4; i++) F.box(-W * 0.3 + i * W * 0.2, topH + 0.02, -D / 2 + 0.05, 0.03, F.rr(0.05, Math.max(0.06, H - topH - 0.04)), 0.03, 0, P.metal, P.mf);
    F.box(W / 2 - 0.1, topH - 0.04, D / 2 - 0.05, 0.14, 0.14, 0.08, 0, P.metal, P.mf);  /* vice */
    F.rod(W / 2 - 0.1, topH + 0.03, D / 2 + 0.0, W / 2 - 0.1, topH + 0.03, D / 2 - 0.22, 0.012, P.metal, P.mf);
    F.box(-W * 0.3, topH, -0.1, 0.05, 0.03, 0.26, 0.3, P.woodD, P.wf);                 /* mallet */
    F.cyl(-W * 0.3, topH, 0.03, 0.03, 0.09, 0, P.metal, P.mf);
    F.box(0.05, topH, 0.05, 0.3, 0.05, 0.12, -0.2, F.shade(P.wood, 0.1), P.wf);         /* a worked block */
    for (let i = 0; i < 4; i++) F.box(-W * 0.35 + i * 0.12, 0.23, 0, 0.06, F.rr(0.04, 0.1), 0.2, 0, F.shade(P.metal, F.rr(-0.1, 0.1)), P.mf);
    F.cyl(W * 0.1, topH, -D * 0.3, 0.06, 0.1, 0, P.clay, P.clf);
  };

  B.loom = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    for (const s of [-1, 1]) {
      F.box(s * (W / 2 - 0.04), 0, -D / 2 + 0.05, 0.07, H, 0.07, 0, P.woodD, P.wf);
      F.beam(s * (W / 2 - 0.04), H * 0.6, -D / 2 + 0.05, s * (W / 2 - 0.04), 0, D / 2 - 0.05, 0.06, 0.06, P.woodD, P.wf);
      F.box(s * (W / 2 - 0.04), 0, 0, 0.09, 0.06, D - 0.04, 0, P.woodD, P.wf);
    }
    F.rod(-W / 2 + 0.08, H - 0.05, -D / 2 + 0.05, W / 2 - 0.08, H - 0.05, -D / 2 + 0.05, 0.03, P.wood, P.wf);
    F.rod(-W / 2 + 0.08, 0.3, -D / 2 + 0.05, W / 2 - 0.08, 0.3, -D / 2 + 0.05, 0.03, P.wood, P.wf);
    for (let i = 0; i < 14; i++) { const x = -W * 0.36 + i * W * 0.72 / 13; F.rod(x, 0.3, -D / 2 + 0.05, x, H - 0.05, -D / 2 + 0.05, 0.004, P.rope, 'rope'); }
    F.box(0, 0.3, -D / 2 + 0.05, W * 0.74, H * 0.4, 0.02, 0, P.pick(), P.cf);
    F.box(0, H * 0.5, -D / 2 + 0.03, W * 0.8, 0.04, 0.06, 0, P.wood, P.wf);              /* beater */
    K.band(F, P, S, 0, H * 0.5, -D / 2 + 0.066, W * 0.5, 0.035, 0);
    F.box(0, 0.06, D * 0.25, W * 0.6, 0.05, 0.25, 0, P.wood, P.wf);                      /* bench */
    F.box(0.1, 0.11, D * 0.25, 0.14, 0.04, 0.05, 0.4, P.woodL, P.wf);                   /* shuttle */
  };

  B.rack = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.rack || 'tools', zb = -D / 2;
    F.box(0, H - 0.12, zb + 0.03, W, 0.12, 0.06, 0, P.woodD, P.wf);
    F.box(0, 0.1, zb + 0.03, W, 0.1, 0.06, 0, P.woodD, P.wf);
    if (kind === 'weapons' || kind === 'spears') {
      for (let i = 0; i < 4; i++) {
        const x = -W * 0.36 + i * W * 0.24;
        F.cyl(x, 0.2, zb + 0.1, 0.014, H - 0.35, 0, P.wood, P.wf);
        if (kind === 'spears') F.cone(x, H - 0.15, zb + 0.1, 0.03, 0.14, 0, i % 2 ? P.acc : P.metal, i % 2 ? P.af : P.mf);
        else F.box(x, H - 0.5, zb + 0.1, 0.06, 0.35, 0.015, 0, P.metal, P.mf);
      }
      const sr = Math.min(0.26, W * 0.2);
      K.disc(F, W / 2 - sr - 0.02, 0.2 + sr, zb + 0.1, zb + 0.14, sr, P.acc, P.af);
      F.box(0, 0.2, zb + 0.14, W * 0.26, 0.03, Math.min(0.4, D - 0.16), 0, P.acc, P.af);
    } else if (kind === 'cloaks') {
      for (let i = 0; i < 3; i++) {
        const x = -W * 0.32 + i * W * 0.32;
        F.rod(x, H - 0.14, zb + 0.06, x, H - 0.1, zb + 0.16, 0.014, P.acc, P.af);
        F.box(x, 0.3 + F.rr(0, 0.1), zb + 0.12, 0.3, H - 0.75, 0.12, 0, P.pick(), P.cf);
        F.box(x, 0.2, zb + 0.14, 0.26, 0.02, 0.16, 0, P.pick(), P.cf);
      }
    } else if (kind === 'nets') {
      for (let i = 0; i < 3; i++) {
        const x = -W * 0.32 + i * W * 0.32;
        F.rod(x, H - 0.14, zb + 0.06, x, H - 0.1, zb + 0.18, 0.014, P.wood, P.wf);
        F.blob(x, H * 0.55, zb + 0.14, 0.12, H * 0.3, 0, P.rope, 'rope');
        F.blob(x, H * 0.25, zb + 0.14, 0.16, H * 0.14, 0, F.shade(P.rope, -0.1), 'rope');
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const x = -W * 0.4 + i * W * 0.2;
        F.rod(x, H - 0.14, zb + 0.06, x, H - 0.1, zb + 0.18, 0.012, P.acc, P.af);
        if (i % 2) { F.box(x, H - 0.55, zb + 0.14, 0.03, 0.45, 0.03, 0, P.wood, P.wf); F.box(x, H - 0.6, zb + 0.14, 0.14, 0.06, 0.05, 0, P.metal, P.mf); }
        else { F.box(x, H - 0.5, zb + 0.14, 0.025, 0.4, 0.025, 0, P.wood, P.wf); F.box(x, H - 0.56, zb + 0.14, 0.05, 0.12, 0.012, 0, P.metal, P.mf); }
      }
      F.box(0, 0.2, zb + 0.16, W * 0.3, 0.12, 0.2, 0, P.woodD, P.wf);
      F.box(W * 0.3, 0.2, zb + 0.16, 0.2, 0.2, 0.2, 0.2, P.clay, P.clf);
    }
  };

  /* leaning ladder: touches the wall at its top */
  B.ladder = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const zt = -D / 2 + 0.03, zb = D / 2 - 0.03;
    for (const s of [-1, 1]) F.beam(s * (W / 2 - 0.03), H - 0.03, zt, s * (W / 2 - 0.03), 0.03, zb, 0.05, 0.05, P.woodD, P.wf);
    const n = Math.floor(H / 0.3);
    for (let i = 1; i <= n; i++) { const t = i / (n + 0.5); F.rod(-W / 2 + 0.05, 0.03 + t * (H - 0.06), zb - t * (zb - zt), W / 2 - 0.05, 0.03 + t * (H - 0.06), zb - t * (zb - zt), 0.018, P.wood, P.wf); }
  };

  B.board = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.board || 'slate', zb = -D / 2;
    F.box(0, 0.4, zb + 0.03, W, H - 0.4, 0.06, 0, P.woodD, P.wf);
    const face = kind === 'slate' ? P.stone : kind === 'hide' ? P.cloth[0] : kind === 'bark' ? P.woodD : kind === 'plastic' ? P.clothL : P.woodL;
    const ff = kind === 'slate' ? P.sf : kind === 'hide' ? P.cf : kind === 'plastic' ? 'plastic' : P.wf;
    F.box(0, 0.46, zb + 0.065, W - 0.12, H - 0.52, 0.01, 0, face, ff);
    for (let i = 0; i < 5; i++) F.box(-W * 0.3 + F.rr(0, W * 0.5), 0.6 + i * (H - 0.9) / 5, zb + 0.072, F.rr(0.15, W * 0.5), 0.015, 0.004, 0, P.clothL, 'plaster');
    K.motifAt(F, P, S, W * 0.3, H - 0.25, zb + 0.072, 0.14, 0);
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.05), 0, zb + 0.05, 0.08, 0.45, 0.1, 0, P.woodD, P.wf);
    F.box(0, 0.42, zb + 0.09, W - 0.2, 0.03, 0.06, 0, P.wood, P.wf);                   /* chalk ledge */
  };

/* ======== Role builders: surface pieces (bowl, jug, books) ======== */
  B.bowl = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, H = o.h, v = o.variant || 0;
    const R = W / 2;
    F.cyl(0, 0, 0, R * 0.45, 0.015, 0, F.shade(P.clay, -0.12), P.clf);
    F.frustum(0, 0.015, 0, R * 0.5, R * 0.98, H * 0.42, 0, P.clay, P.clf, 14);
    F.cyl(0, H * 0.43, 0, R * 0.9, 0.01, 0, o.court ? P.acc : P.clothL, o.court ? P.af : P.clf);
    if (v === 0) {
      for (let i = 0; i < 5; i++) { const a = i / 5 * F.TAU + F.rr(-0.2, 0.2), r = i ? R * 0.42 : 0; F.ball(Math.cos(a) * r, H * 0.5 + (i ? 0 : R * 0.2), Math.sin(a) * r, R * 0.22, P.pick(), 'plant'); }
    } else {
      for (let i = 0; i < 3; i++) F.cyl(F.rr(-0.02, 0.02), H * 0.44 + i * 0.015, F.rr(-0.02, 0.02), R * 0.7, 0.014, 0, F.shade(P.clothL, F.rr(-0.1, 0.05)), 'plant');
    }
  };

  B.jug = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const tray = o.court;
    let y = 0;
    if (tray) { F.cyl(0, 0, 0, Math.min(W, D) / 2, 0.012, 0, P.acc, P.af); y = 0.012; }
    const jx = -W * 0.2, jh = H - y - 0.02;
    F.frustum(jx, y, 0, 0.055, 0.09, jh * 0.3, 0, P.clay, P.clf, 12);
    F.frustum(jx, y + jh * 0.3, 0, 0.09, 0.045, jh * 0.3, 0, F.shade(P.clay, 0.05), P.clf, 12);
    F.cyl(jx, y + jh * 0.6, 0, 0.04, jh * 0.32, 0, F.shade(P.clay, -0.05), P.clf);
    F.cyl(jx, y + jh * 0.92, 0, 0.05, jh * 0.08, 0, o.court ? P.acc : F.shade(P.clay, -0.12), o.court ? P.af : P.clf);
    F.beam(jx, y + jh * 0.85, -0.045, jx, y + jh * 0.42, -0.1, 0.022, 0.012, F.shade(P.clay, -0.08), P.clf);
    for (const [x, z] of [[W * 0.2, D * 0.15], [W * 0.34, -D * 0.2]]) F.frustum(x, y, z, 0.028, 0.038, jh * 0.22, 0, o.court ? P.acc : F.shade(P.clay, 0.1), o.court ? P.af : P.clf, 10);
  };

  B.books = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const fill = S.shelfFill || 'books';
    if (fill === 'scrolls' || fill === 'bundles') {
      let y = 0;
      const rr = Math.min(0.035, H / 6);
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 3 - row; i++) F.rod(-W * 0.25 + i * rr * 2.1 + row * rr, y + rr, -D / 2 + 0.02, -W * 0.25 + i * rr * 2.1 + row * rr, y + rr, D / 2 - 0.02, rr, F.shade(P.clothL, F.rr(-0.12, 0.04)), 'plaster');
        y += rr * 1.75;
      }
      F.box(W * 0.28, 0, 0, 0.09, 0.02, D * 0.8, 0.1, P.pick(), P.cf);
      F.cyl(W * 0.28, 0.02, 0, 0.012, 0.012, 0, P.acc, P.af);
    } else if (fill === 'tablets') {
      for (let i = 0; i < 3; i++) F.box(-W * 0.2 + i * 0.03, i * 0.025, 0, W * 0.5, 0.025, D * 0.7, F.rr(-0.15, 0.15), F.shade(P.stone, F.rr(-0.1, 0.1)), P.sf);
    } else {
      let y = 0;
      for (let i = 0; i < 5; i++) {
        const w = F.rr(W * 0.55, W * 0.8), d = F.rr(D * 0.55, D * 0.8), t = Math.min(0.06, H / 5.5) * F.rr(0.7, 1), r = F.rr(-0.25, 0.25);
        F.box(0, y, 0, w, t, d, r, P.pick(), P.cf);
        F.box(0, y + 0.005, 0.006, w - 0.02, t - 0.01, d - 0.005, r, P.clothL, 'plaster');
        y += t;
      }
      if (o.court) F.box(0, y, 0, W * 0.2, 0.01, D * 0.3, 0, P.acc, P.af);
    }
  };

/* ======== Role builders: tapestry, wall art, statues ======== */
  /* tapestry: a rod, a field, borders and the culture's device in the middle. Wall anchor. */
  B.tapestry = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const zb = -D / 2;
    const sym = K.symbolOf(S, o.culture);
    if (v !== 2) {
      /* painted: the emblem on the pack colours (v 0), on the sheet's second cloth (v 1), or a banded field with a row of small emblems (v 3) */
      F.rod(-W / 2, H - 0.04, zb + 0.05, W / 2, H - 0.04, zb + 0.05, 0.02, P.woodD, P.wf);
      for (const s of [-1, 1]) K.finial(F, P, S, s * (W / 2 - 0.03), H - 0.08, zb + 0.05, 0.03);
      const E = K.emblemCols(F, S);
      if (v === 1) { const t = E.field; E.field = F.css(P.cloth[1 % P.cloth.length]); E.band = t; }
      const top = H - 0.08, bot = 0.12, fh = top - bot;
      const key = 'tap:' + o.culture + ':' + (sym || 'none') + ':' + v + ':' + W.toFixed(2) + 'x' + fh.toFixed(2) + ':' + E.field + E.ink;
      F.decal(0, bot, zb + 0.03, W - 0.1, fh, 0, key, function (g, cw, ch) {
        if (v === 3) {
          const n = 7, bh = ch / n;
          for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? E.band : E.field; g.fillRect(0, i * bh, cw, bh + 1); }
          g.fillStyle = E.edge; g.fillRect(0, 0, cw, bh * 0.4); g.fillRect(0, ch - bh * 0.4, cw, bh * 0.4);
          const R = Math.min(bh * 1.3, cw / 8);
          for (let i = 0; i < 3; i++) if (K.hasSym(sym)) SYMBOLS[sym](g, cw * (0.2 + i * 0.3), ch * 0.5, R, E.ink, E.ink2);
        } else K.paintBanner(g, cw, ch, E, sym, { bands: true });
      }, P.cf);
      const fr = F.col(S.emblem && S.emblem.band ? S.emblem.band : S.cloth[2 % S.cloth.length]);
      for (let i = 0; i < Math.floor((W - 0.2) / 0.1); i++) F.box(-W / 2 + 0.15 + i * 0.1, 0.03, zb + 0.03, 0.04, 0.09, 0.01, 0, fr, P.cf);   /* fringe */
      return;
    }
    const kind = S.tapestry || 'medallion';
    const field = P.cloth[v % P.cloth.length], edge = P.cloth[(v + 1) % P.cloth.length], band = P.cloth[(v + 2) % P.cloth.length];
    const ink = P.acc, inkF = P.af;
    F.rod(-W / 2, H - 0.04, zb + 0.05, W / 2, H - 0.04, zb + 0.05, 0.02, P.woodD, P.wf);
    for (const s of [-1, 1]) K.finial(F, P, S, s * (W / 2 - 0.03), H - 0.08, zb + 0.05, 0.03);
    const top = H - 0.08, bot = 0.12, cy = (top + bot) / 2, fh = top - bot;
    F.box(0, bot, zb + 0.02, W - 0.1, fh, 0.02, 0, field, P.cf);
    F.box(0, bot, zb + 0.032, W - 0.1, 0.1, 0.004, 0, band, P.cf);
    F.box(0, top - 0.1, zb + 0.032, W - 0.1, 0.1, 0.004, 0, band, P.cf);
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.1), bot, zb + 0.032, 0.1, fh, 0.004, 0, edge, P.cf);
    const zf = zb + 0.038, R = Math.min(W - 0.4, fh - 0.4) / 2;
    if (kind === 'stripes') {
      for (let i = 0; i < Math.floor(fh / 0.24); i++) F.box(0, bot + 0.12 + i * 0.24, zf, W - 0.3, 0.1, 0.004, 0, i % 2 ? band : ink, i % 2 ? P.cf : inkF);
    } else if (kind === 'chevrons') {
      for (let i = 0; i < Math.floor(fh / 0.3); i++) K.motifAt(F, P, S, 0, bot + 0.25 + i * 0.3, zf, Math.min(W - 0.4, 0.5), 0, 'chevron');
    } else if (kind === 'grid') {
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) F.box(-R * 0.6 + i * R * 0.6, cy - R * 0.6 + j * R * 0.6 - 0.05, zf, R * 0.3, R * 0.3, 0.004, 0, (i + j) % 2 ? ink : band, (i + j) % 2 ? inkF : P.cf);
    } else if (kind === 'sun') {
      K.disc(F, 0, cy, zf, zf + 0.004, R * 0.42, ink, inkF);
      for (let i = 0; i < 12; i++) { const a = i * F.TAU / 12; F.beam(Math.cos(a) * R * 0.5, cy + Math.sin(a) * R * 0.5, zf, Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9, zf, 0.05, 0.004, ink, inkF); }
    } else if (kind === 'waves') {
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) K.motifAt(F, P, S, -R * 0.6 + j * R * 0.6, cy - R * 0.5 + i * R * 0.5, zf, R * 0.5, 0, 'wave');
    } else if (kind === 'diamond') {
      F.beam(-R, cy, zf, 0, cy + R, zf, 0.06, 0.004, ink, inkF); F.beam(0, cy + R, zf, R, cy, zf, 0.06, 0.004, ink, inkF);
      F.beam(R, cy, zf, 0, cy - R, zf, 0.06, 0.004, ink, inkF); F.beam(0, cy - R, zf, -R, cy, zf, 0.06, 0.004, ink, inkF);
      F.box(0, cy - R * 0.25, zf, R * 0.5, R * 0.5, 0.004, 0, band, P.cf);
    } else if (kind === 'wheel') {
      K.disc(F, 0, cy, zf, zf + 0.004, R * 0.95, ink, inkF);
      K.disc(F, 0, cy, zf + 0.004, zf + 0.008, R * 0.8, field, P.cf);
      for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.beam(0, cy, zf + 0.008, Math.cos(a) * R * 0.85, cy + Math.sin(a) * R * 0.85, zf + 0.008, 0.04, 0.004, ink, inkF); }
      K.disc(F, 0, cy, zf + 0.012, zf + 0.016, R * 0.18, ink, inkF);
    } else if (kind === 'claw') {
      for (let i = -1; i <= 1; i++) F.beam(i * R * 0.45 - R * 0.2, cy + R * 0.8, zf, i * R * 0.45 + R * 0.2, cy - R * 0.8, zf, 0.08, 0.004, ink, inkF);
    } else if (kind === 'moon') {
      K.disc(F, 0, cy, zf, zf + 0.004, R * 0.7, ink, inkF);
      K.disc(F, R * 0.3, cy + R * 0.1, zf + 0.004, zf + 0.008, R * 0.6, field, P.cf);
      for (let i = 0; i < 5; i++) F.ball(-R + i * R * 0.5, bot + 0.3, zf, 0.03, band, P.cf);
    } else if (kind === 'spiral') {
      for (let i = 0; i < 16; i++) { const a = i * 0.7, rr = R * 0.1 + i * R * 0.055; F.ball(Math.cos(a) * rr, cy + Math.sin(a) * rr, zf, 0.035, ink, inkF); }
    } else if (kind === 'figure') {
      K.disc(F, 0, cy + R * 0.55, zf, zf + 0.006, R * 0.18, ink, inkF);
      F.box(0, cy - R * 0.3, zf, R * 0.5, R * 0.7, 0.006, 0, ink, inkF);
      for (const s of [-1, 1]) F.beam(s * R * 0.25, cy + R * 0.3, zf, s * R * 0.7, cy + R * 0.7, zf, 0.06, 0.006, ink, inkF);
      for (const s of [-1, 1]) F.box(s * R * 0.15, cy - R * 0.95, zf, R * 0.18, R * 0.65, 0.006, 0, ink, inkF);
      for (let i = 0; i < 4; i++) F.ball(-R * 0.9 + i * R * 0.6, cy + R * 0.95, zf, 0.04, band, P.cf);
    } else {
      K.disc(F, 0, cy, zf, zf + 0.004, R * 0.9, band, P.cf);
      K.disc(F, 0, cy, zf + 0.004, zf + 0.008, R * 0.7, ink, inkF);
      K.disc(F, 0, cy, zf + 0.008, zf + 0.012, R * 0.4, field, P.cf);
      K.motifAt(F, P, S, 0, cy, zf + 0.012, R * 0.5, 0);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) K.motifAt(F, P, S, sx * (W / 2 - 0.26), cy + sy * (fh / 2 - 0.26), zf, 0.14, 0);
    }
  };

  /* a tall banner on a crossbar: the emblem at the top, bands below, a swallow-tail or fringed end */
  B.banner = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const zb = -D / 2, sym = K.symbolOf(S, o.culture), E = K.emblemCols(F, S);
    if (v === 1) { const t = E.field; E.field = E.band; E.band = t; }
    F.rod(-W / 2, H - 0.05, zb + 0.06, W / 2, H - 0.05, zb + 0.06, 0.018, P.acc, P.af);
    for (const s of [-1, 1]) K.finial(F, P, S, s * (W / 2 - 0.02), H - 0.1, zb + 0.06, 0.025);
    F.rod(0, H - 0.05, zb + 0.06, 0, H - 0.01, zb + 0.015, 0.008, P.metal, P.mf);           /* hung from a hook on the wall */
    const top = H - 0.07, bot = 0.22, fh = top - bot;
    const key = 'ban:' + o.culture + ':' + (sym || 'none') + ':' + v + ':' + W.toFixed(2) + 'x' + fh.toFixed(2) + ':' + E.field;
    F.decal(0, bot, zb + 0.035, W - 0.04, fh, 0, key, function (g, cw, ch) {
      K.paintBanner(g, cw, ch, E, sym, { bands: true, cy: 0.3, scale: 1.1 });
      g.fillStyle = E.edge; for (let k = 0; k < 2; k++) g.fillRect(0, ch * (0.62 + k * 0.14), cw, ch * 0.05);
    }, P.cf);
    const fc = F.col(S.emblem && S.emblem.field ? S.emblem.field : S.cloth[0]);
    if (v === 0) { for (const s of [-1, 1]) F.beam(s * W * 0.22, bot, zb + 0.035, s * W * 0.4, 0.02, zb + 0.035, W * 0.3, 0.012, v === 1 ? F.col(S.cloth[2 % S.cloth.length]) : fc, P.cf); }
    else for (let i = 0; i < Math.floor((W - 0.08) / 0.06); i++) F.box(-W / 2 + 0.06 + i * 0.06, bot - 0.18, zb + 0.035, 0.03, 0.18, 0.008, 0, F.col(S.cloth[2 % S.cloth.length]), P.cf);
  };

  /* a long low frieze on a rail: lozenges and a row of small emblems */
  B.frieze = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const zb = -D / 2, sym = K.symbolOf(S, o.culture), E = K.emblemCols(F, S);
    F.box(0, H - 0.05, zb + 0.03, W, 0.05, 0.06, 0, P.woodD, P.wf);
    F.box(0, 0, zb + 0.03, W, 0.04, 0.06, 0, P.woodD, P.wf);
    const fh = H - 0.09;
    const key = 'frz:' + o.culture + ':' + (sym || 'none') + ':' + v + ':' + W.toFixed(2) + 'x' + fh.toFixed(2) + ':' + E.field;
    F.decal(0, 0.04, zb + 0.035, W - 0.04, fh, 0, key, function (g, cw, ch) {
      g.fillStyle = v ? E.band : E.field; g.fillRect(0, 0, cw, ch);
      g.fillStyle = E.edge; g.fillRect(0, 0, cw, ch * 0.1); g.fillRect(0, ch * 0.9, cw, ch * 0.1);
      const n = Math.max(3, Math.round(cw / ch * 1.2)), R = ch * 0.3;
      for (let i = 0; i < n; i++) {
        const cx = cw * (i + 0.5) / n, cy = ch / 2;
        if (i % 2 === 0 && K.hasSym(sym)) SYMBOLS[sym](g, cx, cy, R, v ? E.field : E.ink, E.ink2);
        else { g.fillStyle = v ? E.field : E.band; g.beginPath(); g.moveTo(cx, cy - R); g.lineTo(cx + R * 0.7, cy); g.lineTo(cx, cy + R); g.lineTo(cx - R * 0.7, cy); g.closePath(); g.fill(); }
      }
    }, P.cf);
    if (o.court) K.band(F, P, S, 0, H - 0.025, zb + 0.06, W - 0.3, 0.04, 0);
  };

  /* a hanging scroll: rollers top and bottom, a paper or hide field of glyph columns and a seal, or a painted scene */
  B.scroll = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const zb = -D / 2, sym = K.symbolOf(S, o.culture), E = K.emblemCols(F, S);
    const hide = S.clothFam === 'hide' || S.clothFam === 'reed';
    const paper = hide ? F.css(F.col(S.cloth[3 % S.cloth.length])) : F.css(F.shade(P.clothL, 0.4)), ink = hide ? E.ink : F.css(F.shade(P.woodD, -0.5));
    const fam = hide ? P.cf : 'plaster';
    for (const y of [H - 0.04, 0.0]) { F.rod(-W / 2, y + 0.02, zb + 0.05, W / 2, y + 0.02, zb + 0.05, 0.022, P.woodD, P.wf); for (const s of [-1, 1]) F.ball(s * (W / 2 - 0.03), y + 0.02, zb + 0.05, 0.028, P.acc, P.af); }
    F.rod(-W * 0.35, H - 0.02, zb + 0.05, 0, H - 0.005, zb + 0.015, 0.006, P.rope, 'rope');
    F.rod(W * 0.35, H - 0.02, zb + 0.05, 0, H - 0.005, zb + 0.015, 0.006, P.rope, 'rope');
    const fh = H - 0.1;
    const key = 'scr:' + o.culture + ':' + (sym || 'none') + ':' + v + ':' + W.toFixed(2) + 'x' + fh.toFixed(2) + ':' + E.ink + paper;
    F.decal(0, 0.05, zb + 0.03, W - 0.06, fh, 0, key, function (g, cw, ch) {
      const r = K.paintRng(17 + v * 7 + (sym || '').length);
      g.fillStyle = paper; g.fillRect(0, 0, cw, ch);
      g.fillStyle = E.edge; g.fillRect(0, 0, cw, ch * 0.03); g.fillRect(0, ch * 0.97, cw, ch * 0.03);
      if (v === 0) {
        g.strokeStyle = ink; g.lineCap = 'round';
        const cols = Math.max(2, Math.floor(cw / 22));
        for (let c = 0; c < cols; c++) {
          const x = cw * (c + 0.5) / cols;
          let y = ch * 0.1;
          while (y < ch * 0.8) {
            const n = 1 + Math.floor(r() * 3);
            for (let k = 0; k < n; k++) { g.lineWidth = 1.2 + r() * 1.6; g.beginPath(); g.moveTo(x - 6 + r() * 4, y + k * 4); g.lineTo(x + 2 + r() * 5, y + 1 + k * 4 + r() * 3); g.stroke(); }
            y += 8 + n * 4 + r() * 6;
          }
        }
        if (K.hasSym(sym)) { g.fillStyle = E.field; g.fillRect(cw * 0.6, ch * 0.84, cw * 0.3, cw * 0.3); SYMBOLS[sym](g, cw * 0.75, ch * 0.84 + cw * 0.15, cw * 0.11, E.ink, E.ink2); }
      } else {
        if (K.hasSym(sym)) SYMBOLS[sym](g, cw / 2, ch * 0.28, cw * 0.3, E.ink, E.ink2);
        g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(cw * 0.08, ch * 0.62); g.lineTo(cw * 0.92, ch * 0.62); g.stroke();
        g.fillStyle = ink;
        for (let i = 0; i < 4; i++) { const x = cw * (0.2 + i * 0.2), y = ch * 0.62; g.beginPath(); g.arc(x, y - 22, 4, 0, Math.PI * 2); g.fill(); g.fillRect(x - 3, y - 17, 6, 14); g.fillRect(x - 5, y - 3, 3, 3); g.fillRect(x + 2, y - 3, 3, 3); }
        g.fillStyle = E.band; for (let i = 0; i < 6; i++) g.fillRect(cw * 0.1 + i * cw * 0.14, ch * 0.72, cw * 0.09, ch * 0.04);
      }
    }, fam);
  };

  /* a knotted rug hung on the wall: border, guard of lozenges, a medallion of the emblem, fringe at the foot */
  B.wallRug = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const zb = -D / 2, sym = K.symbolOf(S, o.culture), E = K.emblemCols(F, S);
    F.rod(-W / 2, H - 0.03, zb + 0.04, W / 2, H - 0.03, zb + 0.04, 0.016, P.woodD, P.wf);
    const fh = H - 0.14;
    const key = 'rug:' + o.culture + ':' + (sym || 'none') + ':' + v + ':' + W.toFixed(2) + 'x' + fh.toFixed(2) + ':' + E.field;
    F.decal(0, 0.1, zb + 0.025, W - 0.04, fh, 0, key, function (g, cw, ch) {
      const r = K.paintRng(31 + v);
      g.fillStyle = v ? E.band : E.edge; g.fillRect(0, 0, cw, ch);
      const b = Math.min(cw, ch) * 0.1;
      g.fillStyle = E.ink2; g.fillRect(b * 0.5, b * 0.5, cw - b, ch - b);
      g.fillStyle = v ? E.edge : E.field; g.fillRect(b, b, cw - 2 * b, ch - 2 * b);
      g.fillStyle = E.band;
      for (let x = b * 1.5; x < cw - b * 1.5; x += b * 1.2) for (const y of [b * 1.3, ch - b * 1.3]) { g.beginPath(); g.moveTo(x, y - b * 0.35); g.lineTo(x + b * 0.35, y); g.lineTo(x, y + b * 0.35); g.lineTo(x - b * 0.35, y); g.closePath(); g.fill(); }
      const R = Math.min(cw, ch) * 0.26;
      g.fillStyle = E.band; g.beginPath(); g.moveTo(cw / 2, ch / 2 - R * 1.3); g.lineTo(cw / 2 + R * 1.3, ch / 2); g.lineTo(cw / 2, ch / 2 + R * 1.3); g.lineTo(cw / 2 - R * 1.3, ch / 2); g.closePath(); g.fill();
      if (E.disc) { g.fillStyle = E.disc; g.beginPath(); g.arc(cw / 2, ch / 2, R * 1.05, 0, Math.PI * 2); g.fill(); }
      if (K.hasSym(sym)) SYMBOLS[sym](g, cw / 2, ch / 2, R * 0.9, E.ink, E.ink2);
      for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(0,0,0,' + (0.03 + r() * 0.06).toFixed(3) + ')'; g.fillRect(r() * cw, r() * ch, 2 + r() * 3, 1 + r() * 2); }
    }, P.cf);
    for (let i = 0; i < Math.floor((W - 0.1) / 0.05); i++) F.box(-W / 2 + 0.07 + i * 0.05, 0.0, zb + 0.025, 0.02, 0.1, 0.008, 0, P.clothL, P.cf);
  };

  /* a string of pennants along a cord: alternating fields, the emblem on every second one */
  B.pennants = function (F, S, o) {
    const P = K.pal(F, S), W = F.span || o.w, D = o.d, H = o.h, v = o.variant || 0;   /* the placer's span when it stretches the cord along its wall */
    const zb = -D / 2, sym = K.symbolOf(S, o.culture), E = K.emblemCols(F, S);
    F.rod(-W / 2, H - 0.02, zb + 0.06, W / 2, H - 0.02, zb + 0.06, 0.006, P.rope, 'rope');
    for (const s of [-1, 1]) F.rod(s * (W / 2 - 0.01), H - 0.02, zb + 0.06, s * (W / 2 - 0.01), H - 0.01, zb + 0.012, 0.006, P.metal, P.mf);
    const n = Math.max(3, Math.floor(W / 0.34)), pw = (W - 0.06) / n, ph = H - 0.05;
    const fields = [E.field, E.band, E.edge];
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + 0.03 + pw * (i + 0.5), f = fields[(i + v) % fields.length], withSym = i % 2 === 0;
      const key = 'pen:' + o.culture + ':' + (sym || 'none') + ':' + f + ':' + (withSym ? 1 : 0) + ':' + pw.toFixed(2) + 'x' + ph.toFixed(2);
      F.decal(x, H - 0.03 - ph, zb + 0.045, pw - 0.02, ph, 0, key, function (g, cw, ch) {
        g.fillStyle = f; g.beginPath(); g.moveTo(0, 0); g.lineTo(cw, 0); g.lineTo(cw / 2, ch); g.closePath(); g.fill();
        g.fillStyle = E.edge; g.fillRect(0, 0, cw, ch * 0.08);
        if (withSym && K.hasSym(sym)) SYMBOLS[sym](g, cw / 2, ch * 0.32, cw * 0.26, f === E.ink ? E.field : E.ink, E.ink2);
      }, P.cf);
    }
  };

  /* a painted hide or cloth stretched on a frame of poles: the emblem large, a procession or a hunt under it */
  B.paintedHanging = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const zb = -D / 2, sym = K.symbolOf(S, o.culture), E = K.emblemCols(F, S);
    const hideCol = F.css(F.col(S.cloth[3 % S.cloth.length]));
    for (const s of [-1, 1]) F.cyl(s * (W / 2 - 0.03), 0, zb + 0.05, 0.03, H, 0, P.woodD, P.wf);
    for (const y of [H - 0.06, 0.03]) F.rod(-W / 2 + 0.02, y + 0.03, zb + 0.05, W / 2 - 0.02, y + 0.03, zb + 0.05, 0.025, P.wood, P.wf);
    const fh = H - 0.3, fw = W - 0.24;
    for (let i = 0; i < 6; i++) { const t = (i + 0.5) / 6; F.rod(-fw / 2, 0.15 + t * fh, zb + 0.05, -W / 2 + 0.03, 0.17 + t * fh, zb + 0.05, 0.006, P.rope, 'rope'); F.rod(fw / 2, 0.15 + t * fh, zb + 0.05, W / 2 - 0.03, 0.17 + t * fh, zb + 0.05, 0.006, P.rope, 'rope'); }
    for (let i = 0; i < 5; i++) { const t = (i + 0.5) / 5; F.rod(-fw / 2 + t * fw, 0.15 + fh, zb + 0.05, -fw / 2 + t * fw + 0.02, H - 0.03, zb + 0.05, 0.006, P.rope, 'rope'); }
    const key = 'hid:' + o.culture + ':' + (sym || 'none') + ':' + v + ':' + fw.toFixed(2) + 'x' + fh.toFixed(2) + ':' + E.ink;
    F.decal(0, 0.15, zb + 0.05, fw, fh, 0, key, function (g, cw, ch) {
      const r = K.paintRng(53 + v * 3);
      g.fillStyle = hideCol; g.beginPath(); g.moveTo(cw * 0.04, ch * 0.08); g.lineTo(cw * 0.3, 0); g.lineTo(cw * 0.7, ch * 0.02); g.lineTo(cw * 0.97, ch * 0.1); g.lineTo(cw, ch * 0.6); g.lineTo(cw * 0.94, ch); g.lineTo(cw * 0.1, ch * 0.97); g.lineTo(0, ch * 0.5); g.closePath(); g.fill();
      for (let i = 0; i < 80; i++) { g.fillStyle = 'rgba(60,30,10,' + (0.03 + r() * 0.07).toFixed(3) + ')'; g.beginPath(); g.arc(r() * cw, r() * ch, 2 + r() * 6, 0, Math.PI * 2); g.fill(); }
      if (K.hasSym(sym)) SYMBOLS[sym](g, cw / 2, ch * 0.36, Math.min(cw, ch) * 0.26, E.ink, E.ink2);
      g.fillStyle = E.ink;
      const n = 5 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const x = cw * (0.12 + 0.76 * i / (n - 1)), y = ch * 0.8;
        if (v === 1 && i % 2) { g.fillRect(x - 10, y - 10, 20, 8); g.fillRect(x - 9, y - 2, 3, 7); g.fillRect(x + 6, y - 2, 3, 7); g.beginPath(); g.arc(x + 11, y - 12, 4, 0, Math.PI * 2); g.fill(); }
        else { g.beginPath(); g.arc(x, y - 16, 3.5, 0, Math.PI * 2); g.fill(); g.fillRect(x - 2.5, y - 12, 5, 9); g.fillRect(x - 4, y - 3, 2.5, 6); g.fillRect(x + 1.5, y - 3, 2.5, 6); g.fillRect(x + 3, y - 14, 1.5, 9); }
      }
      g.fillStyle = E.ink2; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cw * (0.2 + i * 0.3), ch * 0.12, 3, 0, Math.PI * 2); g.fill(); }
    }, S.clothFam === 'hide' ? 'hide' : P.cf);
  };

  /* wall art: a mask, a mounted skull, a plate, a painted panel, a mosaic, a shield, antlers, a relief ... */
  B.art = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const kind = (v === 1 && S.art2) ? S.art2 : (S.art || 'plate'), zb = -D / 2;
    const R = Math.min(W, H) / 2;
    if (kind === 'mask') {
      F.box(0, H / 2 - R * 0.9, zb + 0.01, R * 1.3, R * 1.8, 0.02, 0, P.woodD, P.wf);
      K.disc(F, 0, H / 2, zb + 0.03, zb + 0.03 + Math.min(0.1, D * 0.4), R * 0.6, P.wood, P.wf);                 /* the face */
      const zf = zb + 0.03 + Math.min(0.1, D * 0.4);
      F.ball(0, H / 2 - R * 0.1, zf, R * 0.12, P.woodD, P.wf);                                                  /* nose */
      for (const s of [-1, 1]) F.ball(s * R * 0.25, H / 2 + R * 0.2, zf, R * 0.1, P.acc, P.af);                 /* eyes */
      F.box(0, H / 2 - R * 0.5, zf - 0.01, R * 0.5, R * 0.08, 0.02, 0, P.acc, P.af);                             /* mouth */
      for (let i = 0; i < 5; i++) F.cone(-R * 0.5 + i * R * 0.25, H / 2 + R * 0.6, zb + 0.06, R * 0.08, R * 0.38, 0, i % 2 ? P.acc : P.cloth[0], i % 2 ? P.af : P.cf);
    } else if (kind === 'skull' || kind === 'horns') {
      F.box(0, H / 2 - R * 0.8, zb + 0.01, R * 1.1, R * 1.6, 0.03, 0, P.woodD, P.wf);
      const sr = Math.min(R * 0.45, D / 2 - 0.05);
      if (kind === 'skull') {
        F.ball(0, H / 2 + R * 0.1, zb + 0.04 + sr, sr, P.acc, 'bone');
        F.box(0, H / 2 - R * 0.6, zb + 0.06, sr * 1.1, sr * 0.6, sr * 0.9, 0, F.shade(P.acc, -0.08), 'bone');
        for (const s of [-1, 1]) F.ball(s * sr * 0.4, H / 2 + R * 0.15, zb + 0.04 + sr * 1.7, sr * 0.22, P.woodD, P.wf);
      }
      for (const s of [-1, 1]) {
        F.rod(s * R * 0.35, H / 2 + R * 0.45, zb + 0.1, s * R * 0.95, H / 2 + R * 0.9, zb + 0.08, 0.03, F.shade(P.acc, -0.15), 'bone');
        F.rod(s * R * 0.95, H / 2 + R * 0.9, zb + 0.08, s * R * 0.7, H / 2 + R * 0.98, zb + 0.06, 0.02, F.shade(P.acc, -0.15), 'bone');
      }
    } else if (kind === 'panel' || kind === 'relief') {
      F.box(0, H / 2 - R * 0.98, zb + 0.01, W - 0.02, R * 1.96, 0.04, 0, P.woodD, P.wf);
      F.box(0, H / 2 - R * 0.85, zb + 0.05, W - 0.16, R * 1.7, 0.01, 0, kind === 'relief' ? P.stone : P.cloth[0], kind === 'relief' ? P.sf : P.cf);
      for (let i = 0; i < 3; i++) K.motifAt(F, P, S, -R * 0.55 + i * R * 0.55, H / 2, zb + 0.06, R * 0.5, 0);
      for (let i = 0; i < 2; i++) F.box(0, H / 2 + (i ? 1 : -1) * R * 0.65, zb + 0.062, W - 0.3, 0.02, 0.004, 0, P.acc, P.af);
    } else if (kind === 'mosaic') {
      F.box(0, H / 2 - R * 0.98, zb + 0.01, W - 0.02, R * 1.96, 0.03, 0, P.stone, P.sf);
      const n = 7, cs = (Math.min(W, H) - 0.14) / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const d = Math.hypot(i - 3, j - 3);
        const c = d < 1 ? P.acc : d < 2.5 ? P.cloth[0] : P.cloth[1 % P.cloth.length];
        F.box(-cs * 3 + i * cs, H / 2 - cs * 3.5 + j * cs, zb + 0.04, cs * 0.85, cs * 0.85, 0.006, 0, d < 1 ? c : F.shade(c, F.rr(-0.08, 0.08)), d < 1 ? P.af : 'ceramic');
      }
    } else if (kind === 'shield') {
      K.disc(F, 0, H / 2, zb + 0.03, zb + 0.06, R * 0.95, P.wood, P.wf);
      K.disc(F, 0, H / 2, zb + 0.06, zb + 0.08, R * 0.8, P.cloth[0], P.cf);
      F.ball(0, H / 2, zb + 0.08, Math.min(R * 0.2, D / 2 - 0.09), P.metal, P.mf);
      K.motifAt(F, P, S, 0, H / 2 + R * 0.5, zb + 0.08, R * 0.35, 0);
      for (const s of [-1, 1]) F.rod(s * R * 0.8, H / 2 - R * 0.5, zb + 0.02, s * R * 0.1, H / 2 + R * 0.8, zb + 0.02, 0.02, P.woodD, P.wf);
    } else if (kind === 'antler') {
      F.box(0, H / 2 - R * 0.5, zb + 0.01, R, R, 0.03, 0, P.woodD, P.wf);
      for (const s of [-1, 1]) {
        F.rod(s * R * 0.15, H / 2, zb + 0.08, s * R * 0.7, H / 2 + R * 0.7, zb + 0.12, 0.025, P.acc, 'bone');
        F.rod(s * R * 0.4, H / 2 + R * 0.35, zb + 0.1, s * R * 0.95, H / 2 + R * 0.4, zb + 0.14, 0.018, P.acc, 'bone');
        F.rod(s * R * 0.7, H / 2 + R * 0.7, zb + 0.12, s * R * 0.6, H / 2 + R * 0.98, zb + 0.1, 0.015, P.acc, 'bone');
      }
    } else if (kind === 'sunplate') {
      K.disc(F, 0, H / 2, zb + 0.02, zb + 0.04, R * 0.98, P.acc, P.af);
      K.disc(F, 0, H / 2, zb + 0.04, zb + 0.06, R * 0.55, F.shade(P.acc, 0.2), P.af);
      for (let i = 0; i < 12; i++) { const a = i * F.TAU / 12; F.ball(Math.cos(a) * R * 0.78, H / 2 + Math.sin(a) * R * 0.78, zb + 0.06, R * 0.06, P.woodD, P.wf); }
      F.ball(0, H / 2, zb + 0.07, R * 0.12, P.cloth[0], P.cf);
    } else {
      K.disc(F, 0, H / 2, zb + 0.02, zb + 0.04, R * 0.98, P.clay, P.clf);
      K.disc(F, 0, H / 2, zb + 0.04, zb + 0.05, R * 0.78, P.cloth[0], P.cf);
      K.disc(F, 0, H / 2, zb + 0.05, zb + 0.06, R * 0.35, P.acc, P.af);
      for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; K.motifAt(F, P, S, Math.cos(a) * R * 0.57, H / 2 + Math.sin(a) * R * 0.57, zb + 0.06, R * 0.2, 0, S.motif === 'none' ? 'dots' : S.motif); }
    }
  };

  /* floor ornament: a figure, an idol, a totem pole, an urn, a globe, a skull pole, an obelisk, a vase, a guardian beast */
  B.statue = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.statue || 'figure', R = Math.min(W, D) / 2;
    const plinthH = Math.min(0.3, H * 0.2);
    F.box(0, 0, 0, W, plinthH, D, 0, P.stone, P.sf);
    K.band(F, P, S, 0, plinthH / 2, D / 2, W - 0.2, plinthH * 0.4, 0);
    const y0 = plinthH, bh = H - plinthH;
    if (kind === 'idol' || kind === 'guardian') {
      F.box(0, y0, 0, R * 1.4, bh * 0.45, R * 1.2, 0, P.acc, P.af);
      F.blob(0, y0 + bh * 0.62, 0, R * 0.7, bh * 0.4, 0, P.acc, P.af);
      for (const s of [-1, 1]) F.cone(s * R * 0.5, y0 + bh * 0.78, 0, R * 0.2, bh * 0.2, 0, F.shade(P.acc, -0.1), P.af);
      for (const s of [-1, 1]) F.ball(s * R * 0.3, y0 + bh * 0.68, R * 0.5, R * 0.1, P.woodD, P.wf);
      F.box(0, y0 + bh * 0.45, R * 0.4, R * 0.8, bh * 0.1, R * 0.4, 0, F.shade(P.acc, -0.2), P.af);
    } else if (kind === 'totem' || kind === 'skullpole') {
      F.cyl(0, y0, 0, R * 0.45, bh, 0, P.wood, P.wf);
      for (let i = 0; i < 3; i++) {
        const y = y0 + bh * (0.15 + i * 0.3);
        if (kind === 'skullpole') { F.ball(0, y + R * 0.4, R * 0.08, R * 0.4, P.acc, 'bone'); F.box(0, y, R * 0.2, R * 0.5, R * 0.3, R * 0.4, 0, F.shade(P.acc, -0.1), 'bone'); }
        else { F.box(0, y, 0, R * 1.6, bh * 0.22, R * 1.1, 0, i % 2 ? P.woodL : P.acc, i % 2 ? P.wf : P.af); K.motifAt(F, P, S, 0, y + bh * 0.11, R * 0.55, R * 0.8, 0); }
      }
      for (const s of [-1, 1]) F.beam(0, y0 + bh * 0.9, 0, s * (W / 2 - 0.02), y0 + bh * 0.98, 0, 0.08, 0.1, P.acc, P.af);
    } else if (kind === 'urn' || kind === 'vase') {
      F.frustum(0, y0, 0, R * 0.4, R * 0.9, bh * 0.45, 0, P.clay, P.clf, 16);
      F.frustum(0, y0 + bh * 0.45, 0, R * 0.9, R * 0.35, bh * 0.35, 0, F.shade(P.clay, 0.05), P.clf, 16);
      F.cyl(0, y0 + bh * 0.8, 0, R * 0.45, bh * 0.2, 0, F.shade(P.clay, -0.08), P.clf);
      F.cyl(0, y0 + bh * 0.42, 0, R * 0.91, bh * 0.06, 0, P.acc, P.af);
      K.band(F, P, S, 0, y0 + bh * 0.45, R * 0.88, R * 1.2, bh * 0.08, 0);
      if (kind === 'vase') for (let i = 0; i < 4; i++) { const a = i * 1.6; F.rod(0, y0 + bh * 0.9, 0, Math.cos(a) * R * 0.5, y0 + bh * 1.0, Math.sin(a) * R * 0.5, 0.01, P.rope, 'plant'); F.ball(Math.cos(a) * R * 0.5, y0 + bh * 1.0, Math.sin(a) * R * 0.5, R * 0.12, P.pick(), 'plant'); }
    } else if (kind === 'globe') {
      F.cyl(0, y0, 0, R * 0.5, bh * 0.1, 0, P.wood, P.wf);
      F.cyl(0, y0 + bh * 0.1, 0, R * 0.12, bh * 0.35, 0, P.wood, P.wf);
      F.ball(0, y0 + bh * 0.72, 0, R * 0.82, P.acc, P.af);
      F.rod(-R * 0.6, y0 + bh * 0.2, 0, R * 0.6, y0 + bh * 0.99, 0, 0.02, P.metal, P.mf);
    } else if (kind === 'obelisk') {
      F.frustum(0, y0, 0, R * 0.5, R * 0.3, bh * 0.85, 0, P.stone, P.sf, 4);
      F.cone(0, y0 + bh * 0.85, 0, R * 0.42, bh * 0.15, Math.PI / 4, P.acc, P.af);
      for (let i = 0; i < 3; i++) K.motifAt(F, P, S, 0, y0 + bh * (0.2 + i * 0.25), R * 0.48 - i * R * 0.06, R * 0.5, 0);
    } else {
      /* a standing figure, robed */
      F.frustum(0, y0, 0, R * 0.7, R * 0.4, bh * 0.55, 0, P.stone, P.sf, 10);
      F.cyl(0, y0 + bh * 0.55, 0, R * 0.42, bh * 0.22, 0, P.stone, P.sf);
      F.ball(0, y0 + bh * 0.87, 0, R * 0.26, F.shade(P.stone, 0.05), P.sf);
      F.dome(0, y0 + bh * 0.95, 0, R * 0.28, bh * 0.05, 0, P.acc, P.af);
      for (const s of [-1, 1]) F.beam(s * R * 0.35, y0 + bh * 0.72, 0, s * R * 0.2, y0 + bh * 0.45, R * 0.4, R * 0.18, R * 0.18, P.stone, P.sf);
      F.ball(0, y0 + bh * 0.47, R * 0.42, R * 0.12, P.acc, P.af);
    }
  };

/* ======== Role builders: trades and households (forge, anvil, stall, vat, still, bunk, larder ...) ======== */
  /* The interiors-sets pass (2026-10, kits/interiors/sets): what shops, industries, stables and
     tenements need and the per-tier roles lack. Registered per culture by FK.set({ roles: 'trade' })
     as <culture>_trade_<role>; every one draws only with the culture's style sheet, so a culture
     gets a forge in its own stone and iron, a vat in its own wood. */
  /* smith's forge: a masonry hearth block against the wall, coals, a hood and flue, bellows, tongs */
  B.forge = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, zb = -D / 2;
    const ember = P.ember || P.acc, flame = P.flame || P.acc;
    F.box(0, 0, 0, W, 0.75, D, 0, P.stone, P.sf);                                         /* the hearth block */
    F.box(0, 0.75, zb + 0.05, W, 0.5, 0.1, 0, F.shade(P.stone, -0.1), P.sf);              /* fire-back */
    F.box(0.05, 0.75, 0.05, W * 0.55, 0.05, D * 0.55, 0, F.shade(P.stone, -0.4), P.sf);   /* the fire bed */
    for (let i = 0; i < 6; i++) F.ball(0.05 + F.rr(-W * 0.2, W * 0.2), 0.82, 0.05 + F.rr(-D * 0.18, D * 0.18), F.rr(0.04, 0.07), i % 2 ? ember : flame, 'glow');
    F.box(0, 1.25, zb + D * 0.38, W * 0.86, 0.28, D * 0.74, 0, P.metal, P.mf);              /* the hood */
    F.box(0, 1.53, zb + D * 0.3, W * 0.56, 0.24, D * 0.56, 0, F.shade(P.metal, -0.08), P.mf);
    F.box(0, 1.77, zb + 0.2, 0.34, H - 1.77, 0.34, 0, F.shade(P.metal, -0.15), P.mf);      /* flue to the ceiling */
    F.box(-W / 2 + 0.2, 0.75, D * 0.18, 0.3, 0.1, 0.46, 0, P.woodD, P.wf);                /* bellows: boards and leather */
    F.box(-W / 2 + 0.2, 0.85, D * 0.18, 0.28, 0.1, 0.4, 0, P.pick(), P.cf);
    F.box(-W / 2 + 0.2, 0.95, D * 0.18, 0.3, 0.04, 0.46, 0, P.woodD, P.wf);
    F.rod(-W / 2 + 0.2, 1.0, D * 0.18 + 0.2, -W / 2 + 0.2, 1.25, D / 2 - 0.04, 0.02, P.woodD, P.wf);
    for (const dx of [0, 0.06]) F.rod(W / 2 - 0.12 - dx, 0.75, D / 2 - 0.08, W / 2 - 0.2 - dx, 1.24, D / 2 - 0.26, 0.012, P.metal, P.mf);   /* tongs */
    F.lamp(0.05, 0.95, 0.15, 0.8, 6);
  };
  /* anvil on its stump, a hammer on the face, a bucket of tools beside */
  B.anvil = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d;
    F.cyl(0, 0, 0, Math.min(0.22, D / 2 - 0.02), 0.5, 0, P.woodD, P.wf);
    F.box(0, 0.5, 0, 0.16, 0.14, 0.14, 0, F.shade(P.metal, -0.1), P.mf);
    F.box(0.03, 0.64, 0, 0.42, 0.1, 0.15, 0, P.metal, P.mf);
    F.box(-0.25, 0.66, 0, 0.12, 0.07, 0.09, 0, P.metal, P.mf);
    F.box(-0.33, 0.68, 0, 0.06, 0.04, 0.05, 0, P.metal, P.mf);                              /* the horn, stepped */
    F.box(0.12, 0.74, -0.02, 0.04, 0.035, 0.24, 0.3, P.woodL, P.wf);                        /* hammer */
    F.box(0.08, 0.74, 0.09, 0.09, 0.05, 0.05, 0.3, F.shade(P.metal, 0.1), P.mf);
    F.cyl(W / 2 - 0.1, 0, D / 2 - 0.1, 0.08, 0.3, 0, P.wood, P.wf);                          /* tool bucket */
    for (let i = 0; i < 3; i++) F.rod(W / 2 - 0.12 + i * 0.02, 0.2, D / 2 - 0.1, W / 2 - 0.1 + i * 0.015, 0.62, D / 2 - 0.12, 0.01, P.metal, P.mf);
  };
  /* quenching or watering trough */
  B.trough = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    F.box(0, 0, 0, W - 0.04, 0.06, D - 0.04, 0, P.woodD, P.wf);
    for (const s of [-1, 1]) {
      F.box(0, 0, s * (D / 2 - 0.035), W, H, 0.07, 0, P.wood, P.wf);
      F.box(s * (W / 2 - 0.035), 0, 0, 0.07, H, D - 0.14, 0, P.wood, P.wf);
      for (const t of [-1, 1]) F.box(s * (W / 2 - 0.045), H - 0.03, t * (D / 2 - 0.045), 0.09, 0.03, 0.09, 0, P.metal, P.mf);   /* iron corner caps */
    }
    F.box(0, 0.06, 0, W - 0.14, H - 0.16, D - 0.14, 0, F.shade(P.stone, -0.45), 'glass');  /* water */
  };
  /* a beast's stall: two boarded partitions, a back board with a manger, straw underfoot */
  B.stall = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, zb = -D / 2;
    const hay = F.shade(P.rope, 0.18);
    F.box(0, 0, zb + 0.03, W, H * 0.9, 0.06, 0, P.woodD, P.wf);                             /* back board, on the wall */
    for (const s of [-1, 1]) {
      F.box(s * (W / 2 - 0.04), 0, 0, 0.07, H * 0.82, D - 0.1, 0, P.wood, P.wf);
      F.box(s * (W / 2 - 0.04), 0, D / 2 - 0.06, 0.1, H, 0.1, 0, P.woodD, P.wf);             /* front post */
      F.box(s * (W / 2 - 0.04), 0, zb + 0.06, 0.1, H, 0.1, 0, P.woodD, P.wf);
      K.finial(F, P, S, s * (W / 2 - 0.04), H - 0.06, D / 2 - 0.06, 0.03);
    }
    F.box(0, 0.55, zb + 0.28, W - 0.2, 0.32, 0.44, 0, P.wood, P.wf);                         /* manger */
    F.blob(0, 0.92, zb + 0.28, Math.min(0.2, W * 0.15), 0.14, 0, hay, 'plant');
    F.box(0, 0, 0.05, W - 0.2, 0.03, D - 0.3, 0, hay, 'plant');                              /* straw */
    F.rod(-W / 2 + 0.1, H * 0.6, zb + 0.4, -W / 2 + 0.1, H * 0.35, zb + 0.9, 0.012, P.rope, 'rope');   /* tether */
  };
  /* hay rack over a feed trough, slatted, against the wall */
  B.hayrack = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, zb = -D / 2, hay = F.shade(P.rope, 0.18);
    F.box(0, 0, zb + 0.03, W, H, 0.06, 0, P.woodD, P.wf);
    F.box(0, 0, 0, W, 0.45, D - 0.02, 0, P.wood, P.wf);                                       /* the trough below */
    F.box(0, 0.4, 0.02, W - 0.12, 0.05, D - 0.16, 0, hay, 'plant');
    F.box(0, H - 0.08, zb + D * 0.5, W, 0.06, 0.06, 0, P.woodD, P.wf);                        /* the rack's front rail */
    const n = Math.max(4, Math.floor(W / 0.14));
    for (let i = 0; i < n; i++) { const x = -W / 2 + 0.07 + i * (W - 0.14) / (n - 1); F.rod(x, 0.62, zb + 0.08, x, H - 0.06, zb + D * 0.5, 0.012, P.wood, P.wf); }
    F.blob(0, H * 0.72, zb + 0.24, Math.min(0.18, D * 0.36), H * 0.3, 0, hay, 'plant');
  };
  /* a shop's stepped display of goods */
  B.display = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    F.box(0, 0, 0, W, H * 0.45, D, 0, P.wood, P.wf);
    F.box(0, H * 0.45, -D * 0.18, W * 0.92, H * 0.28, D * 0.62, 0, P.woodD, P.wf);
    F.box(0, H * 0.73, -D * 0.3, W * 0.84, H * 0.15, D * 0.38, 0, P.wood, P.wf);
    K.band(F, P, S, 0, H * 0.2, D / 2 + 0.005, W - 0.3, 0.1, 0);
    const tiers = [[H * 0.45, D * 0.32], [H * 0.73, D * 0.0], [H * 0.88, -D * 0.3]];
    tiers.forEach(function (t, k) {
      const n = Math.max(2, Math.floor(W / 0.3) - k);
      for (let i = 0; i < n; i++) {
        const x = -W * 0.4 + (i + 0.5) * (W * 0.8 / n), y = t[0], z = t[1] + (k === 0 ? -0.04 : 0.04);
        const room = Math.min(H - y, 0.12);
        if (v === 1) F.rod(x - 0.1, y + 0.05, z, x + 0.1, y + 0.05, z, Math.min(0.05, room / 2), P.pick(), P.cf);   /* cloth bolts */
        else if ((i + k) % 3 === 0) F.frustum(x, y, z, 0.05, 0.06, room, 0, P.clay, P.clf, 10);
        else if ((i + k) % 3 === 1) F.box(x, y, z, 0.13, room * 0.8, 0.1, F.rr(-0.2, 0.2), F.shade(P.wood, 0.15), P.wf);
        else F.blob(x, y + room * 0.4, z, 0.06, room * 0.8, 0, P.pick(), P.cf);
      }
    });
  };
  /* armour on a stand: a cuirass, pauldrons, helm and a skirt */
  B.armourStand = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const plate = v === 1 ? P.pick() : P.metal, pf = v === 1 ? P.cf : P.mf;
    F.box(0, 0, 0, W * 0.8, 0.06, D * 0.8, 0, P.woodD, P.wf);
    F.cyl(0, 0.06, 0, 0.03, H * 0.8, 0, P.wood, P.wf);
    F.box(0, H * 0.38, 0, W * 0.62, H * 0.15, D * 0.45, 0, F.shade(plate, -0.08), pf);           /* skirt */
    F.box(0, H * 0.51, 0, W * 0.7, H * 0.26, D * 0.5, 0, plate, pf);                            /* cuirass */
    F.box(0, H * 0.77, 0, W * 0.94, H * 0.045, D * 0.46, 0, F.shade(plate, 0.1), pf);           /* pauldrons */
    K.band(F, P, S, 0, H * 0.6, D * 0.25 + 0.005, W * 0.5, 0.06, 0);
    F.ball(0, H * 0.88, 0, Math.min(0.12, D * 0.3), P.metal, P.mf);                             /* helm */
    K.finial(F, P, S, 0, H * 0.94, 0, 0.025);
  };
  /* a weapon rack: the rack builder with weapons on it */
  B.weaponRack = function (F, S, o) { B.rack(F, Object.assign({}, S, { rack: S.rackWeapons || 'weapons' }), o); };
  /* melee practice post: a planted post with a crossbar, a straw-wrapped body and head, a shield on one arm, a practice sword leaning */
  B.trainingDummy = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, hay = F.shade(P.rope, 0.18);
    F.box(0, 0, 0, W * 0.9, 0.08, D * 0.8, 0, P.woodD, P.wf);                                  /* base boards */
    F.box(0, 0.08, 0, 0.12, H * 0.78, 0.12, 0, P.wood, P.wf);                                 /* the post */
    F.blob(0, H * 0.5, 0, 0.19, H * 0.34, 0, hay, 'plant');                                   /* straw-wrapped body */
    F.rod(-W * 0.4, H * 0.72, 0, W * 0.4, H * 0.72, 0, 0.035, P.wood, P.wf);                 /* crossbar arms */
    F.ball(0, H * 0.9, 0, 0.12, hay, 'plant');                                                 /* head */
    F.box(-W * 0.28, H * 0.48, D * 0.12, 0.26, 0.38, 0.04, 0, P.pick(), P.cf);                /* shield on the left arm */
    F.rod(W * 0.34, 0.08, D * 0.3, W * 0.26, H * 0.5, D * 0.12, 0.015, P.woodL, P.wf);        /* practice sword against the post */
    F.rod(W * 0.28, H * 0.6, D * 0.1, W * 0.4, H * 0.58, D * 0.1, 0.012, P.rope, 'rope');    /* strap on the crossbar */
  };
  /* ranged practice butt: a straw backstop between two posts, painted rings on its face, an arrow stuck in */
  B.archeryButt = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, hay = F.shade(P.rope, 0.18);
    F.box(0, 0, 0, W * 0.95, 0.06, D * 0.9, 0, P.woodD, P.wf);                                 /* base boards */
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.1), 0.06, -0.05, 0.1, H - 0.06, 0.1, 0, P.wood, P.wf);   /* the two posts */
    F.box(0, H - 0.08, -0.05, W - 0.1, 0.08, 0.1, 0, P.woodD, P.wf);                          /* top beam */
    F.box(0, 0.5, 0, W - 0.3, 0.9, 0.36, 0, hay, 'plant');                                     /* straw backstop */
    const rings = [[0.76, P.woodL, P.wf], [0.58, P.pick(), P.cf], [0.4, P.woodL, P.wf], [0.22, P.pick(), P.cf]];
    rings.forEach(function (r, i) { F.box(0, 0.95 - r[0] / 2, 0.18 + i * 0.008, r[0], r[0], 0.01, 0, r[1], r[2]); });   /* the target face */
    F.rod(0.1, 0.8, 0.2, 0.1, 0.78, 0.38, 0.01, P.wood, P.wf);                                  /* an arrow in the face */
  };
  /* a staved vat (brewing, dyeing, tanning) with its paddle */
  B.vat = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, R = Math.min(W, D) / 2 - 0.02;
    F.frustum(0, 0, 0, R * 0.9, R, H * 0.85, 0, P.wood, P.wf, 16);
    for (const y of [0.12, 0.45, 0.78]) F.cyl(0, H * 0.85 * y, 0, R * (0.9 + 0.1 * y) + 0.012, 0.035, 0, P.metal, P.mf);
    F.cyl(0, H * 0.8, 0, R * 0.95, 0.03, 0, F.shade(P.pick(), -0.25), 'glass');                  /* the liquor */
    F.rod(-R * 0.3, H * 0.6, 0, R * 0.55, H - 0.02, R * 0.25, 0.02, P.woodL, P.wf);              /* paddle */
  };
  /* an alchemist's still: a pot over a fire, the swan neck, a worm and a receiver, flasks on a shelf */
  B.still = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, zb = -D / 2, top = 0.82, glass = F.shade(P.clay, 0.3);
    K.legs(F, P, S, W, D - 0.02, top - 0.05, { style: 'straight', r: 0.04 });
    F.box(0, top - 0.05, 0, W, 0.05, D, 0, P.wood, P.wf);
    F.box(0, top, zb + 0.03, W, H - top, 0.05, 0, P.woodD, P.wf);                               /* back board */
    F.box(0, H - 0.38, zb + 0.13, W - 0.1, 0.03, 0.18, 0, P.wood, P.wf);                        /* flask shelf */
    for (let i = 0; i < 5; i++) F.frustum(-W * 0.38 + i * W * 0.19, H - 0.35, zb + 0.13, 0.05, 0.025, 0.2, 0, glass, 'glass', 8);
    F.box(-W * 0.25, top, 0.02, 0.32, 0.12, 0.3, 0, P.stone, P.sf);                            /* fire box */
    F.box(-W * 0.25, top + 0.02, 0.17, 0.16, 0.06, 0.01, 0, P.ember || P.acc, 'glow');
    F.frustum(-W * 0.25, top + 0.12, 0.02, 0.16, 0.12, 0.22, 0, P.acc, P.af, 14);               /* the pot */
    F.dome(-W * 0.25, top + 0.34, 0.02, 0.12, 0.1, 0, P.acc, P.af);
    F.rod(-W * 0.25, top + 0.44, 0.02, W * 0.15, top + 0.5, 0.02, 0.015, P.acc, P.af);          /* swan neck */
    F.cyl(W * 0.2, top, 0.02, 0.1, 0.42, 0, P.metal, P.mf);                                      /* the worm tub */
    F.frustum(W * 0.38, top, 0.08, 0.07, 0.04, 0.18, 0, glass, 'glass', 10);                     /* receiver */
    F.lamp(-W * 0.25, top + 0.1, 0.25, 0.4, 3);
  };
  /* lidded bins: grain, flour, feed */
  B.bin = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, n = Math.max(2, Math.round(W / 0.55)), cw = W / n;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + cw * (i + 0.5);
      F.box(x, 0, 0, cw - 0.03, H - 0.06, D, 0, F.shade(P.wood, i % 2 ? -0.06 : 0.04), P.wf);
      if (i === 0) F.blob(x, H - 0.1, 0.02, Math.min(cw, D) * 0.4, 0.12, 0, F.shade(P.rope, 0.25), 'plant');   /* an open bin, grain heaped */
      else F.box(x, H - 0.06, 0.01, cw - 0.02, 0.05, D - 0.02, 0, P.woodL, P.wf);
      F.box(x, H * 0.55, D / 2 + 0.008, 0.1, 0.03, 0.02, 0, P.metal, P.mf);   /* proud of the front (was flush: a z-fight) */
    }
  };
  /* a tall food cupboard: a screened door, crocks on top, a string of onions */
  B.larder = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, zf = D / 2 - 0.02;
    F.box(0, 0, 0, W, 0.08, D, 0, P.woodD, P.wf);
    F.box(0, 0.08, -0.01, W - 0.04, H - 0.38, D - 0.04, 0, P.wood, P.wf);
    F.box(0, H - 0.3, 0, W, 0.06, D, 0, P.woodD, P.wf);
    F.box(-W / 4, 0.16, zf, W / 2 - 0.08, H - 0.56, 0.012, 0, P.woodL, P.wf);
    F.box(W / 4, 0.16, zf, W / 2 - 0.08, H - 0.56, 0.012, 0, F.shade(P.rope, 0.1), 'rope');     /* the screened door */
    for (const s of [-1, 1]) F.ball(s * 0.05, H * 0.45, zf + 0.012, 0.02, P.acc, P.af);
    for (let i = 0; i < 3; i++) F.frustum(-W * 0.3 + i * W * 0.3, H - 0.24, 0, 0.08, 0.06, 0.22, 0, P.clay, P.clf, 10);
    for (let i = 0; i < 4; i++) F.ball(W / 2 - 0.05, H * 0.35 + i * 0.07, D / 2 - 0.08, 0.035, F.shade(P.rope, 0.3), 'plant');
  };
  /* a two-tier bunk with a ladder */
  B.bunk = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * (W / 2 - 0.04), 0, sz * (D / 2 - 0.04), 0.08, H, 0.08, 0, P.woodD, P.wf);
    for (const y of [0.32, H * 0.6]) {
      for (const s of [-1, 1]) { F.box(s * (W / 2 - 0.05), y - 0.08, 0, 0.06, 0.08, D - 0.1, 0, P.wood, P.wf); F.box(0, y - 0.08, s * (D / 2 - 0.05), W - 0.1, 0.08, 0.06, 0, P.wood, P.wf); }
      F.box(0, y - 0.04, 0, W - 0.14, 0.03, D - 0.14, 0, F.shade(P.wood, 0.05), P.wf);
      F.box(0, y, 0.02, W - 0.18, 0.1, D - 0.18, 0, P.pick(), P.cf);
      F.blob(0, y + 0.14, -D / 2 + 0.28, Math.min(0.26, W * 0.26), 0.1, 0, P.clothL, P.cf);
    }
    F.box(0, H * 0.6 + 0.02, -D / 2 + 0.04, W - 0.1, 0.25, 0.04, 0, P.wood, P.wf);              /* top guard */
    for (let i = 1; i < 5; i++) F.rod(W / 2 - 0.04, H * 0.13 * i, D / 2 - 0.04, W / 2 - 0.04, H * 0.13 * i, D / 2 - 0.3, 0.014, P.woodL, P.wf);   /* ladder rungs */
  };
  /* a tall locker: two doors, vents, a padlock */
  B.locker = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, zf = D / 2 - 0.015;
    F.box(0, 0, 0, W, H, D - 0.02, 0, P.wood, P.wf);
    for (const s of [-1, 1]) {
      F.box(s * W / 4, 0.06, zf, W / 2 - 0.05, H - 0.12, 0.012, 0, F.shade(P.wood, 0.08), P.wf);
      for (let i = 0; i < 3; i++) F.box(s * W / 4, H - 0.3 - i * 0.05, zf + 0.008, W / 2 - 0.16, 0.015, 0.008, 0, F.shade(P.wood, -0.3), P.wf);
    }
    F.box(0.04, H * 0.5, zf + 0.01, 0.04, 0.06, 0.02, 0, P.metal, P.mf);
    F.box(0, H - 0.04, 0, W, 0.04, D, 0, P.woodD, P.wf);
  };
  /* a treadle lathe: bed, headstock, tailstock, flywheel and treadle; tools on the wall board */
  B.lathe = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, zb = -D / 2, bedY = 0.85;
    for (const s of [-1, 1]) {
      F.box(s * (W / 2 - 0.08), 0, 0.05, 0.12, bedY, 0.12, 0, P.woodD, P.wf);
      F.box(s * (W / 2 - 0.08), 0, 0.05, 0.12, 0.08, D - 0.3, 0, P.woodD, P.wf);
    }
    F.box(0, bedY - 0.1, 0.05, W - 0.04, 0.1, 0.24, 0, P.wood, P.wf);                            /* the bed */
    F.box(-W / 2 + 0.25, bedY, 0.05, 0.22, 0.24, 0.2, 0, P.metal, P.mf);                       /* headstock */
    F.box(W / 2 - 0.3, bedY, 0.05, 0.16, 0.18, 0.18, 0, P.metal, P.mf);                        /* tailstock */
    F.rod(-W / 2 + 0.36, bedY + 0.14, 0.05, W / 2 - 0.38, bedY + 0.14, 0.05, 0.04, P.woodL, P.wf);  /* the work */
    F.rod(-W / 2 + 0.34, 0.4, -0.04, -W / 2 + 0.34, 0.4, 0.06, Math.min(0.3, D / 2 - 0.06), P.metal, P.mf);   /* flywheel */
    F.box(0, 0.05, D / 2 - 0.12, W * 0.5, 0.04, 0.16, 0, P.wood, P.wf);                         /* treadle */
    F.box(0, bedY, zb + 0.03, W, H - bedY, 0.05, 0, F.shade(P.woodD, -0.1), P.wf);              /* tool board */
    for (let i = 0; i < 5; i++) F.box(-W * 0.35 + i * W * 0.17, bedY + 0.15, zb + 0.07, 0.03, F.rr(0.18, 0.32), 0.03, 0, P.metal, P.mf);
  };
  /* a screw press: two uprights, a head beam, the screw, the bar, the platen and bed */
  B.press = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    F.box(0, 0, 0, W, 0.12, D, 0, P.woodD, P.wf);
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.1), 0.12, 0, 0.16, H - 0.12, 0.2, 0, P.wood, P.wf);
    F.box(0, H - 0.26, 0, W, 0.24, 0.24, 0, P.woodD, P.wf);                                     /* head */
    F.box(0, 0.12, 0, W - 0.4, 0.5, D * 0.7, 0, P.wood, P.wf);                                  /* bed */
    F.cyl(0, 0.82, 0, 0.05, H - 1.08, 0, P.metal, P.mf);                                       /* screw */
    F.box(0, 0.72, 0, W - 0.5, 0.1, D * 0.5, 0, P.metal, P.mf);                                /* platen */
    F.box(0, H * 0.62, 0, W - 0.3, 0.05, 0.05, 0.6, P.woodL, P.wf);                             /* bar */
    F.box(0, 0.62, 0.02, W - 0.5, 0.06, D * 0.5, 0, P.pick(), P.cf);                            /* what is pressed */
  };
  /* a beehive kiln: a clay drum and dome, a glowing mouth, a chimney */
  B.kiln = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, R = Math.min(W, D) / 2 - 0.02;
    F.cyl(0, 0, 0, R, H * 0.45, 0, P.clay, P.clf);
    F.dome(0, H * 0.45, 0, R, H * 0.35, 0, F.shade(P.clay, -0.08), P.clf);
    F.cyl(0, H * 0.75, 0, R * 0.22, H * 0.25, 0, F.shade(P.clay, -0.18), P.clf);                 /* chimney */
    F.box(0, 0.1, R - 0.12, R * 0.6, 0.45, 0.14, 0, F.shade(P.stone, -0.35), P.sf);             /* the mouth */
    F.box(0, 0.16, R - 0.02, R * 0.42, 0.3, 0.02, 0, P.ember || P.acc, 'glow');
    F.lamp(0, 0.4, R + 0.05, 0.7, 5);
  };
  /* a grindstone in its frame, over a trough, with a crank */
  B.grindstone = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, r = Math.min(0.32, H * 0.36, D / 2 - 0.04), cy = H - r - 0.04;
    for (const s of [-1, 1]) {
      F.box(s * 0.16, 0, 0, 0.08, cy + 0.06, 0.1, 0, P.woodD, P.wf);
      F.box(s * 0.16, 0, 0, 0.1, 0.06, D - 0.04, 0, P.woodD, P.wf);
    }
    F.box(0, 0, 0, 0.26, 0.22, D * 0.6, 0, P.wood, P.wf);                                      /* trough */
    F.rod(-0.07, cy, 0, 0.07, cy, 0, r, P.stone, P.sf);                                         /* the stone */
    F.rod(-0.2, cy, 0, W / 2 - 0.12, cy, 0, 0.02, P.metal, P.mf);                               /* axle */
    F.rod(W / 2 - 0.12, cy, 0, W / 2 - 0.12, cy - 0.2, 0.08, 0.015, P.metal, P.mf);             /* crank */
    F.rod(W / 2 - 0.12, cy - 0.2, 0.08, W / 2 - 0.02, cy - 0.2, 0.08, 0.02, P.woodL, P.wf);
  };
  /* barrels lying in a cradle against the wall, taps to the front */
  B.barrelRack = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, zb = -D / 2;
    const r = Math.min(0.28, (W - 0.12) / 4.2, (H - 0.12) / 3.9), z0 = zb + 0.05, z1 = D / 2 - 0.08;
    for (const s of [-1, 1]) F.box(0, 0, s * (D / 2 - 0.12), W, 0.12, 0.1, 0, P.woodD, P.wf);
    F.box(0, 0, zb + 0.03, W, 0.3, 0.06, 0, P.woodD, P.wf);                                       /* back rail on the wall */
    const pos = [[-r * 1.5, 0.12 + r], [r * 1.5, 0.12 + r], [0, 0.12 + r * 2.85]];
    pos.forEach(function (p) {
      F.rod(p[0], p[1], z0, p[0], p[1], z1, r, F.shade(P.wood, F.rr(-0.08, 0.08)), P.wf);
      for (const t of [0.1, 0.5, 0.9]) { const z = z0 + (z1 - z0) * t; F.rod(p[0], p[1], z - 0.02, p[0], p[1], z + 0.02, r + 0.01, P.metal, P.mf); }
      F.box(p[0], p[1] - r * 0.4, z1, 0.04, 0.05, 0.06, 0, P.acc, P.af);                        /* tap */
    });
  };
  /* a household or village altar: a stepped plinth, a cloth, an image or emblem, offerings and candles */
  B.altar = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, flame = P.flame || P.acc;
    F.box(0, 0, 0, W, 0.18, D, 0, F.shade(P.stone, -0.1), P.sf);
    F.box(0, 0.18, -0.04, W - 0.16, 0.6, D - 0.2, 0, P.stone, P.sf);
    F.box(0, 0.78, -0.04, W - 0.06, 0.06, D - 0.12, 0, P.wood, P.wf);
    const cl = P.pick();
    F.box(0, 0.5, D / 2 - 0.14, W * 0.5, 0.34, 0.02, 0, cl, P.cf);                                 /* the hanging cloth */
    K.band(F, P, S, 0, 0.6, D / 2 - 0.125, W * 0.42, 0.08, 0);
    F.box(0, 0.84, -D / 2 + 0.12, W * 0.42, H - 0.92, 0.08, 0, P.woodD, P.wf);                    /* the image board */
    K.motifAt(F, P, S, 0, 0.84 + (H - 0.92) * 0.55, -D / 2 + 0.165, Math.min(0.2, W * 0.14), 0);
    K.finial(F, P, S, 0, H - 0.08, -D / 2 + 0.12, 0.035);
    for (const s of [-1, 1]) {
      F.cyl(s * W * 0.32, 0.84, 0.02, 0.03, 0.16, 0, P.clothL, P.cf);                              /* candles */
      F.cone(s * W * 0.32, 1.0, 0.02, 0.018, 0.05, 0, flame, 'glow');
      F.frustum(s * W * 0.16, 0.84, 0.08, 0.05, 0.07, 0.08, 0, P.clay, P.clf, 10);                 /* offering bowls */
    }
    F.lamp(0, 1.05, 0.1, 0.4, 3);
  };

/* ======== Role builders: the works (FK.ROLES.works, the 2026-10-19 trades audit) ======== */
  /* Work pieces for the trades the first trade set lacks: baking, butchery, healing, scribing, shipwrighting,
     quarrying, customs and dairy. Registered per culture with FK.set({ roles: 'works', skip: [..] }) as
     <culture>_works_<role>; each carries the job of its role (R.job). Like the trade set, every one is drawn in the
     culture's own style sheet. */
  /* a baker's oven: a stone plinth, a dome, a fire mouth with embers, a flue, a peel and loaves on a shelf */
  B.breadOven = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, ember = P.ember || P.acc, flame = P.flame || P.acc;
    F.box(0, 0, 0, W, 0.7, D, 0, P.stone, P.sf);
    F.frustum(0, 0.7, -D * 0.05, W * 0.46, W * 0.34, 0.34, 0, F.shade(P.stone, 0.05), P.sf, 14);
    F.frustum(0, 1.04, -D * 0.05, W * 0.34, W * 0.12, 0.3, 0, F.shade(P.stone, 0.1), P.sf, 14);
    F.box(0, 0.78, D / 2 - 0.02, W * 0.4, 0.3, 0.06, 0, F.shade(P.stone, -0.5), P.sf);             /* the mouth */
    for (let i = 0; i < 4; i++) F.ball(F.rr(-W * 0.12, W * 0.12), 0.8, D / 2 - 0.05, F.rr(0.03, 0.05), i % 2 ? ember : flame, 'glow');
    F.box(W * 0.28, 1.34, -D * 0.2, 0.2, H - 1.34, 0.2, 0, F.shade(P.stone, -0.1), P.sf);          /* flue */
    F.rod(-W / 2 - 0.02, 0.1, D / 2 - 0.1, -W / 2 + 0.1, 1.5, D / 2 - 0.2, 0.015, P.woodL, P.wf);   /* the peel */
    F.box(-W / 2 + 0.1, 1.5, D / 2 - 0.2, 0.2, 0.02, 0.22, 0, P.woodL, P.wf);
    F.box(0, 0.7, D / 2 - 0.1, W, 0.04, 0.2, 0, P.wood, P.wf);                                    /* the loading shelf */
    for (let i = 0; i < 3; i++) F.blob(-W * 0.3 + i * 0.22, 0.74, D / 2 - 0.1, 0.08, 0.1, 0, P.clay, P.clf);
    F.lamp(0, 0.9, D / 2 - 0.1, 0.7, 5);
  };
  /* a butcher's block: a stump, a cleaver stuck in it, a saw and an apron on a post, a blood tub */
  B.butcherBlock = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    F.cyl(-W * 0.12, 0, 0, Math.min(0.34, D / 2 - 0.04), 0.82, 0, P.wood, P.wf);
    F.cyl(-W * 0.12, 0.82, 0, Math.min(0.35, D / 2 - 0.03), 0.04, 0, P.woodL, P.wf);
    F.box(-W * 0.12 + 0.1, 0.86, 0.04, 0.2, 0.12, 0.02, 0.4, P.metal, P.mf);                         /* cleaver */
    F.box(-W * 0.12 + 0.03, 0.86, 0.1, 0.03, 0.03, 0.14, 0.4, P.woodD, P.wf);
    F.box(W * 0.38, 0, -D * 0.3, 0.06, H, 0.06, 0, P.woodD, P.wf);                                   /* post */
    F.box(W * 0.38, H * 0.65, -D * 0.3 + 0.04, 0.3, 0.4, 0.02, 0, F.shade(P.cloth[0], -0.1), P.cf);  /* apron */
    F.rod(W * 0.38 - 0.1, H * 0.9, -D * 0.3 + 0.05, W * 0.38 + 0.1, H * 0.9, -D * 0.3 + 0.05, 0.015, P.metal, P.mf);
    F.frustum(W * 0.3, 0, D * 0.25, 0.17, 0.2, 0.3, 0, P.woodD, P.wf, 12);                           /* tub */
    F.cyl(W * 0.3, 0.26, D * 0.25, 0.17, 0.02, 0, F.shade(P.cloth[0], -0.3), 'glass');
  };
  /* a meat rack: posts and a beam with hooks, carcasses hung to dry or cool, a drip trough under */
  B.meatRack = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.05), 0, 0, 0.08, H, 0.08, 0, P.woodD, P.wf);
    F.box(0, H - 0.1, 0, W, 0.08, 0.08, 0, P.wood, P.wf);
    F.box(0, 0, 0, W - 0.1, 0.1, D, 0, P.woodD, P.wf);                                                 /* drip trough */
    const n = Math.max(3, Math.floor(W / 0.34)), m = F.shade(P.cloth[0], -0.2);
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + 0.2 + i * (W - 0.4) / (n - 1), h = 0.5 + (i % 3) * 0.12;
      F.rod(x, H - 0.1, 0, x, H - 0.26, 0, 0.01, P.metal, P.mf);
      if (v === 1 && i % 2) { F.rod(x, H - 0.26, 0, x, H - 0.26 - h, 0, 0.035, m, P.cf); F.ball(x, H - 0.3 - h, 0, 0.05, F.shade(m, 0.1), P.cf); }   /* fowl and hares */
      else F.blob(x, H - 0.28 - h, 0, 0.1, h, 0, i % 2 ? m : F.shade(m, 0.12), P.cf);                    /* sides of meat */
    }
  };
  /* a healer's bench: a mortar and pestle, a balance, jars on a rail, bundles of herbs hung over it */
  B.herbBench = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, zb = -D / 2;
    F.box(0, 0.8, 0, W, 0.06, D, 0, P.wood, P.wf);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * (W / 2 - 0.06), 0, sz * (D / 2 - 0.06), 0.06, 0.8, 0.06, 0, P.woodD, P.wf);
    F.box(0, 0.4, 0, W - 0.1, 0.04, D - 0.1, 0, P.woodD, P.wf);
    F.frustum(-W * 0.3, 0.86, 0, 0.09, 0.12, 0.1, 0, P.stone, P.sf, 12);                              /* mortar */
    F.rod(-W * 0.3, 0.9, 0, -W * 0.3 + 0.1, 1.08, 0.04, 0.015, P.stoneL || P.woodL, P.wf);
    F.rod(W * 0.05, 1.0, 0, W * 0.05, 0.86, 0, 0.012, P.metal, P.mf);                                 /* the balance */
    F.rod(W * 0.05 - 0.15, 1.0, 0, W * 0.05 + 0.15, 1.0, 0, 0.01, P.metal, P.mf);
    for (const s of [-1, 1]) F.frustum(W * 0.05 + s * 0.15, 0.9, 0, 0.06, 0.04, 0.02, 0, P.metal, P.mf, 10);
    F.box(0, 1.15, zb + 0.06, W, 0.05, 0.12, 0, P.wood, P.wf);                                         /* the jar rail */
    for (let i = 0; i < 5; i++) F.frustum(-W * 0.4 + i * (W * 0.8 / 4), 1.2, zb + 0.06, 0.05, 0.06, 0.12 + (i % 2) * 0.04, 0, P.clay, P.clf, 10);
    F.box(0, H - 0.08, zb + 0.06, W, 0.04, 0.04, 0, P.woodD, P.wf);
    for (let i = 0; i < 6; i++) {
      const x = -W * 0.42 + i * (W * 0.84 / 5);
      F.rod(x, H - 0.08, zb + 0.06, x, H - 0.3, zb + 0.06, 0.01, P.rope, 'rope');
      F.blob(x, H - 0.52, zb + 0.06, 0.05, 0.22, 0, i % 2 ? P.acc : F.shade(P.clay, 0.1), 'plant');       /* herb bundles */
    }
  };
  /* a sickbed: a low frame, a pallet and pillow, a folded blanket, a basin on the head board */
  B.sickbed = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * (W / 2 - 0.05), 0, sz * (D / 2 - 0.05), 0.07, 0.34, 0.07, 0, P.woodD, P.wf);
    F.box(0, 0.34, 0, W, 0.08, D, 0, P.wood, P.wf);
    F.box(0, 0.42, 0.04, W - 0.1, 0.1, D - 0.2, 0, P.cloth[0], P.cf);
    F.box(0, 0.5, -D / 2 + 0.22, W - 0.3, 0.1, 0.3, 0, F.shade(P.cloth[0], 0.3), P.cf);
    F.box(0, 0.52, D * 0.15, W - 0.12, 0.06, D * 0.4, 0, P.cloth[Math.min(1, P.cloth.length - 1)], P.cf);
    F.box(0, 0.34, -D / 2, W, H - 0.34, 0.06, 0, P.woodD, P.wf);                                       /* head board */
    F.frustum(W / 2 - 0.14, H - 0.1, -D / 2 + 0.03, 0.1, 0.06, 0.08, 0, P.clay, P.clf, 12);                 /* basin on the head board */
  };
  /* a scribe's desk: a sloped top in steps, an ink pot, quills, rolled documents, a sand tray */
  B.scribeDesk = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h - 0.1;   /* the desk top; the lamp and quill rise 0.1 above it */
    for (const sx of [-1, 1]) {
      F.box(sx * (W / 2 - 0.05), 0, D / 2 - 0.06, 0.06, H - 0.3, 0.06, 0, P.woodD, P.wf);
      F.box(sx * (W / 2 - 0.05), 0, -D / 2 + 0.06, 0.06, H, 0.06, 0, P.woodD, P.wf);
    }
    F.box(0, H - 0.3, D / 2 - 0.2, W, 0.04, 0.3, 0, P.wood, P.wf);
    F.box(0, H - 0.2, 0, W, 0.04, D * 0.4, 0, P.wood, P.wf);
    F.box(0, H - 0.1, -D / 2 + 0.16, W, 0.04, 0.3, 0, P.wood, P.wf);                                  /* the slope, in steps */
    F.box(0, 0.35, 0, W - 0.1, 0.04, D - 0.2, 0, P.woodD, P.wf);
    F.cyl(-W * 0.3, H - 0.06, -D / 2 + 0.16, 0.035, 0.07, 0, P.clay, P.clf);                             /* ink pot */
    F.rod(-W * 0.3 + 0.07, H - 0.05, -D / 2 + 0.14, -W * 0.3 + 0.2, H + 0.1, -D / 2 + 0.2, 0.006, P.woodL, P.wf);
    F.box(W * 0.1, H - 0.09, -D / 2 + 0.2, 0.34, 0.01, 0.24, 0.1, P.cloth[Math.min(2, P.cloth.length - 1)], P.cf);   /* a sheet */
    for (let i = 0; i < 3; i++) F.rod(W * 0.28 + i * 0.05, H - 0.07, -D / 2 + 0.2, W * 0.28 + i * 0.05, H - 0.07, -D / 2 + 0.38, 0.025, F.shade(P.cloth[0], 0.35), P.cf);   /* rolls */
    F.box(0, H - 0.33, D / 2 - 0.2, 0.22, 0.02, 0.18, 0, P.woodL, P.wf);
    F.lamp(-W * 0.4, H, -D / 2 + 0.12, 0.5, 3);
  };
  /* a hull on its stocks: sleepers, a keel, paired ribs, two strakes, props and a mallet */
  B.hullStocks = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, hw = D * 0.4;
    for (const x of [-W * 0.38, 0, W * 0.38]) F.box(x, 0, 0, 0.14, 0.2, D, 0, P.woodD, P.wf);          /* sleepers */
    F.box(0, 0.2, 0, W * 0.96, 0.14, 0.16, 0, P.wood, P.wf);                                           /* keel */
    F.rod(-W * 0.48, 0.3, 0, -W * 0.48 - 0.05, H * 0.8, 0, 0.05, P.woodL, P.wf);                       /* stem and sternpost */
    F.rod(W * 0.48, 0.3, 0, W * 0.48 + 0.05, H * 0.7, 0, 0.05, P.woodL, P.wf);
    const n = 6;
    for (let i = 0; i < n; i++) {
      const x = -W * 0.38 + i * (W * 0.76 / (n - 1)), k = Math.sin(Math.PI * (i + 0.6) / (n + 0.2)), up = H * (0.45 + 0.45 * k);
      for (const s of [-1, 1]) F.rod(x, 0.3, s * 0.04, x, up, s * hw * k, 0.025, P.wood, P.wf);
    }
    for (const s of [-1, 1]) {
      F.rod(-W * 0.4, H * 0.5, s * hw * 0.5, W * 0.4, H * 0.62, s * hw * 0.9, 0.03, P.woodL, P.wf);   /* strakes */
      F.rod(-W * 0.4, H * 0.7, s * hw * 0.55, W * 0.4, H * 0.82, s * hw * 0.95, 0.03, P.woodL, P.wf);
      F.rod(-W * 0.2 * s, 0, s * D / 2, -W * 0.05 * s, H * 0.55, s * hw * 0.95, 0.03, P.woodD, P.wf);   /* props */
    }
    F.box(W * 0.36, 0, D / 2 - 0.1, 0.4, 0.1, 0.1, 0.4, P.woodL, P.wf);
    F.rod(W * 0.25, 0.2, D / 2 - 0.1, W * 0.25, 0.5, D / 2 - 0.1, 0.02, P.rope, 'rope');
  };
  /* a quarry face piece: a block with a split line, wedges, a pry bar and a rolling sledge */
  B.quarryBlock = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    for (const z of [-D * 0.3, 0, D * 0.3]) F.box(0, 0, z, W * 0.8, 0.1, 0.14, 0, P.woodD, P.wf);       /* sledge runners */
    F.box(-W * 0.08, 0.1, 0, W * 0.62, H * 0.62, D * 0.7, 0, P.stone, P.sf);
    F.box(W * 0.26, 0.1 + H * 0.62, 0, W * 0.2, H * 0.14, D * 0.5, 0, F.shade(P.stone, 0.08), P.sf);  /* the cap, split off */
    F.box(-W * 0.08, 0.12 + H * 0.62, 0, W * 0.4, 0.02, 0.02, 0, F.shade(P.stone, -0.5), P.sf);        /* the split line */
    for (let i = 0; i < 4; i++) F.box(-W * 0.24 + i * W * 0.14, 0.12 + H * 0.62, 0, 0.04, 0.06, 0.04, 0, P.metal, P.mf);   /* wedges */
    F.rod(W * 0.38, 0.05, D * 0.34, W * 0.1, H * 0.9, D * 0.44, 0.02, P.metal, P.mf);                  /* pry bar */
    F.box(-W * 0.44, 0, -D * 0.4, 0.3, 0.16, 0.2, 0.3, F.shade(P.stone, -0.1), P.sf);                  /* waste */
    F.rod(W * 0.42, 0.12, -D * 0.35, W * 0.42, 0.12, -D * 0.1, 0.05, P.rope, 'rope');                   /* the haul rope, coiled */
  };
  /* the weigh-house scale: a post and beam, two pans on chains, a stack of weights and a stamp */
  B.weighScale = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    F.box(0, 0, 0, 0.5, 0.1, D, 0, P.woodD, P.wf);
    F.box(0, 0.1, 0, 0.1, H - 0.2, 0.1, 0, P.wood, P.wf);
    F.box(0, H - 0.12, 0, W * 0.8, 0.05, 0.05, 0, P.metal, P.mf);                                       /* beam */
    for (const s of [-1, 1]) {
      const x = s * W * 0.38;
      for (const dz of [-0.06, 0.06]) F.rod(x, H - 0.1, 0, x + s * 0.0, 0.6, dz * 1.4, 0.006, P.metal, P.mf);
      F.frustum(x, 0.54, 0, 0.17, 0.13, 0.06, 0, s > 0 ? P.metal : F.shade(P.metal, -0.1), P.mf, 14);
    }
    for (let i = 0; i < 4; i++) F.cyl(-W * 0.38 + i * 0.07 - 0.1, 0.6, 0, 0.03, 0.03 + i * 0.012, 0, P.metal, P.mf);    /* weights in a pan */
    F.box(W * 0.3, 0.1, D / 2 - 0.12, 0.18, 0.1, 0.12, 0, P.woodL, P.wf);
  };
  /* a tally board: a board on the wall with a ruled grid, notched sticks and strings of counters */
  B.tallyBoard = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, zb = -D / 2;
    F.box(0, 0.3, zb + D * 0.25, W, H - 0.3, D * 0.5, 0, P.wood, P.wf);
    F.box(0, 0.3, zb + D * 0.75, W, 0.05, D * 0.5, 0, P.woodD, P.wf);
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.03), 0.3, zb + D * 0.35, 0.06, H - 0.3, D * 0.7, 0, P.woodD, P.wf);
    for (let r = 0; r < 4; r++) {
      const y = H - 0.25 - r * 0.28;
      F.box(0, y, zb + D * 0.5, W - 0.16, 0.012, 0.012, 0, P.woodD, P.wf);
      F.rod(-W / 2 + 0.1, y - 0.04, zb + D * 0.5 + 0.02, W / 2 - 0.1, y - 0.04, zb + D * 0.5 + 0.02, 0.01, P.rope, 'rope');
      for (let i = 0; i < 6 + r; i++) F.cyl(-W / 2 + 0.14 + i * (W - 0.3) / (5 + r), y - 0.09, zb + D * 0.5 + 0.02, 0.025, 0.02, 0, i % 3 ? P.woodL : P.acc, i % 3 ? P.wf : P.af);
    }
  };
  /* a plunger churn: a tall staved barrel with hoops, a lid, a dasher, a pail beside */
  B.churn = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, R = Math.min(D / 2 - 0.03, 0.27), X = -(0.14 + 0.13) / 2;   /* X centres the churn and its pail */
    F.frustum(X, 0, 0, R, R * 0.7, H * 0.85, 0, P.wood, P.wf, 14);
    for (const y of [0.1, 0.4, 0.7]) F.cyl(X, H * 0.85 * y, 0, R * (1 - 0.3 * y) + 0.012, 0.03, 0, P.metal, P.mf);
    F.cyl(X, H * 0.85, 0, R * 0.7, 0.03, 0, P.woodL, P.wf);
    F.rod(X + 0.02, H * 0.6, 0, X + 0.05, H, 0.01, 0.018, P.woodL, P.wf);                                /* the dasher */
    F.box(X + 0.05, H - 0.02, 0.01, 0.12, 0.03, 0.03, 0, P.woodL, P.wf);
    F.frustum(X + R + 0.14, 0, 0.04, 0.1, 0.13, 0.26, 0, P.woodD, P.wf, 12);
  };
  /* a cheese press: a bench with cheese wheels, a lever beam and a hanging stone weight */
  B.cheesePress = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    F.box(0, 0.7, 0, W, 0.06, D, 0, P.wood, P.wf);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * (W / 2 - 0.05), 0, sz * (D / 2 - 0.05), 0.06, 0.7, 0.06, 0, P.woodD, P.wf);
    for (let i = 0; i < 3; i++) F.cyl(-W * 0.18, 0.76 + i * 0.07, 0, 0.17, 0.07, 0, i % 2 ? P.clay : F.shade(P.clay, 0.12), P.clf);
    F.box(-W * 0.18, 0.97, 0, 0.36, 0.03, 0.2, 0, P.woodL, P.wf);                                        /* follower */
    F.box(W * 0.42, 0.76, 0, 0.08, H - 0.76, 0.08, 0, P.wood, P.wf);                                     /* the upright */
    F.box(0.1, H - 0.2, 0, W * 0.84, 0.06, 0.08, 0, P.woodD, P.wf);                                      /* the lever */
    F.rod(W * 0.42, H - 0.17, 0, W * 0.42, H - 0.1, 0, 0.03, P.metal, P.mf);
    F.rod(-W * 0.4, H - 0.2, 0, -W * 0.4, 0.8, 0, 0.008, P.rope, 'rope');
    F.box(-W * 0.4, 0.68, 0, 0.2, 0.2, 0.2, 0, P.stone, P.sf);                                           /* the weight */
    F.frustum(W * 0.1, 0.76, D * 0.2, 0.1, 0.13, 0.12, 0, P.woodD, P.wf, 12);                            /* whey bucket */
  };

/* ======== Roles per tier (FK.ROLES), materials and the registrar FK.set() ======== */
  /* ================================================================ roles and the registrar */
  const SIT = ['hall', 'tavern', 'court', 'bedroom', 'study', 'antechamber'];
  /* role: { type, setting, rooms, anchor, clear, w, d, h, variants, variantNames, uses, build, opts } */
  K.ROLES = {
    poor: [
      { role: 'bed', type: 'bed', rooms: ['bedroom', 'barracks'], clear: { front: 0.6 }, w: 1.0, d: 1.95, h: 0.5, variants: 2, variantNames: ['plain', 'with blanket'], uses: ['wood', 'cloth', 'rope'], build: 'bed' },
      { role: 'bench', type: 'bench', rooms: ['hall', 'tavern', 'kitchen', 'workshop', 'yard'], setting: 'both', clear: { front: 0.6 }, w: 1.5, d: 0.36, h: 0.45, uses: ['wood', 'cloth', 'rope'], build: 'bench' },
      { role: 'stool', type: 'chair', rooms: ['hall', 'tavern', 'kitchen', 'workshop', 'bedroom', 'study'], setting: 'both', clear: { front: 0.5 }, w: 0.42, d: 0.42, h: 0.45, uses: ['wood', 'cloth', 'rope'], build: 'chair', opts: { stool: true } },
      { role: 'table', type: 'table', rooms: ['hall', 'tavern', 'kitchen'], setting: 'both', clear: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 }, w: 1.6, d: 0.8, h: 0.76, variants: 2, variantNames: ['bare', 'with a runner'], uses: ['wood', 'cloth', 'accent'], build: 'table' },
      { role: 'chest', type: 'storage', rooms: ['bedroom', 'store', 'hall'], clear: { front: 0.6 }, w: 0.95, d: 0.5, h: 0.55, variants: 2, variantNames: ['plain', 'banded'], uses: ['wood', 'metal', 'accent'], build: 'chest' },
      { role: 'wall_shelves', type: 'shelf', rooms: ['kitchen', 'store', 'workshop'], anchor: 'wall', clear: { front: 0.6 }, w: 1.1, d: 0.3, h: 1.4, uses: ['wood', 'clay', 'cloth', 'rope'], build: 'wallShelves' },
      { role: 'store', type: 'storage', surface: false, rooms: ['kitchen', 'store', 'hall', 'yard'], setting: 'both', clear: { front: 0.5 }, w: 1.0, d: 0.55, h: 0.75, uses: ['clay', 'cloth', 'rope', 'wood', 'metal', 'accent'], build: 'store' },
      { role: 'hearth', type: 'stove', rooms: ['kitchen', 'hall'], anchor: 'wall', clear: { front: 0.9 }, w: 1.3, d: 0.75, h: 1.7, uses: ['stone', 'clay', 'metal', 'accent', 'wood'], fire: true, build: 'hearth' },
      { role: 'fire', type: 'brazier', rooms: ['hall', 'tavern', 'yard', 'court'], setting: 'both', clear: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 }, w: 0.7, d: 0.7, h: 0.9, uses: ['metal', 'stone', 'wood', 'accent', 'rope'], fire: true, build: 'fire' },
      { role: 'lamp', type: 'lamp', rooms: ['hall', 'bedroom', 'tavern', 'study', 'shrine', 'antechamber'], clear: {}, w: 0.3, d: 0.3, h: 1.4, uses: ['accent', 'metal', 'clay', 'stone', 'wood', 'rope'], fire: true, glass: true, plaster: true, build: 'lamp' },
      { role: 'mat', type: 'rug', rooms: ['hall', 'bedroom', 'shrine'], clear: {}, w: 1.8, d: 1.2, h: 0.03, variants: 2, variantNames: ['first colours', 'second colours'], uses: ['cloth', 'accent'], reed: true, build: 'rug' },
      { role: 'counter', type: 'counter', rooms: ['tavern', 'market', 'store', 'hall'], setting: 'both', clear: { front: 0.9, back: 0.7 }, w: 2.0, d: 0.65, h: 1.0, variants: 2, variantNames: ['plain', 'decorated front'], uses: ['wood', 'clay', 'accent'], build: 'counter' },
      { role: 'workbench', type: 'workstation', rooms: ['workshop', 'yard'], setting: 'both', anchor: 'wall', clear: { front: 0.9 }, w: 1.5, d: 0.65, h: 0.9, uses: ['wood', 'metal', 'clay'], build: 'workbench' },
      { role: 'rack', type: 'rack', rooms: ['workshop', 'hall', 'barracks', 'store', 'antechamber'], anchor: 'wall', clear: { front: 0.6 }, w: 1.1, d: 0.3, h: 1.7, uses: ['wood', 'metal', 'accent', 'cloth', 'clay', 'rope'], build: 'rack' },
      { role: 'ladder', type: 'ladder', rooms: ['store', 'workshop', 'library', 'hall'], anchor: 'wall', clear: { front: 0.5 }, w: 0.5, d: 0.5, h: 2.2, uses: ['wood'], build: 'ladder' },
      { role: 'board', type: 'board', rooms: ['school', 'workshop', 'hall', 'study'], anchor: 'wall', clear: { front: 0.8 }, w: 1.2, d: 0.14, h: 1.5, uses: ['wood', 'stone', 'cloth', 'accent'], plaster: true, plastic: true, build: 'board' },
      { role: 'bowl', type: 'vessel', rooms: ['hall', 'kitchen', 'tavern'], anchor: 'surface', clear: {}, w: 0.32, d: 0.32, h: 0.18, variants: 2, variantNames: ['fruit', 'flatbread'], uses: ['clay', 'cloth', 'accent'], plant: true, build: 'bowl' },
      { role: 'jug', type: 'vessel', rooms: ['hall', 'kitchen', 'tavern', 'bedroom'], anchor: 'surface', clear: {}, w: 0.42, d: 0.26, h: 0.32, uses: ['clay', 'accent'], build: 'jug' }
    ],
    common: [
      { role: 'bed', type: 'bed', rooms: ['bedroom', 'barracks'], clear: { front: 0.6, left: 0.5 }, w: 1.15, d: 2.0, h: 0.95, variants: 2, variantNames: ['plain', 'with blanket'], uses: ['wood', 'cloth', 'rope', 'accent', 'stone'], build: 'bed' },
      { role: 'bench', type: 'bench', rooms: ['hall', 'tavern', 'kitchen', 'court', 'yard'], setting: 'both', clear: { front: 0.6 }, w: 1.6, d: 0.4, h: 0.9, variants: 2, variantNames: ['open', 'backed'], variantDims: [{ h: 0.48 }, { h: 0.9 }], uses: ['wood', 'cloth', 'rope', 'accent'], build: 'bench' },
      { role: 'chair', type: 'chair', rooms: ['hall', 'tavern', 'study', 'bedroom', 'library', 'school'], clear: { front: 0.5 }, w: 0.48, d: 0.48, h: 0.95, uses: ['wood', 'cloth', 'rope', 'accent'], build: 'chair' },
      { role: 'stool', type: 'chair', rooms: ['hall', 'tavern', 'kitchen', 'workshop', 'bedroom'], setting: 'both', clear: { front: 0.5 }, w: 0.42, d: 0.42, h: 0.45, uses: ['wood', 'cloth', 'rope'], build: 'chair', opts: { stool: true } },
      { role: 'table', type: 'table', rooms: ['hall', 'tavern', 'kitchen', 'library'], setting: 'both', clear: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 }, w: 1.8, d: 0.9, h: 0.78, variants: 2, variantNames: ['bare', 'with a runner'], uses: ['wood', 'cloth', 'accent'], build: 'table' },
      { role: 'low_table', type: 'table', rooms: ['hall', 'bedroom', 'court', 'antechamber'], clear: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 }, w: 1.0, d: 0.7, h: 0.42, uses: ['wood', 'accent'], build: 'lowTable' },
      { role: 'desk', type: 'desk', rooms: ['study', 'library', 'school', 'shrine'], anchor: 'wall', clear: { front: 0.8 }, w: 1.3, d: 0.65, h: 1.1, uses: ['wood', 'accent', 'clay', 'cloth'], plaster: true, build: 'desk' },
      { role: 'chest', type: 'storage', rooms: ['bedroom', 'store', 'hall'], clear: { front: 0.7 }, w: 1.1, d: 0.6, h: 0.65, variants: 2, variantNames: ['plain', 'banded'], uses: ['wood', 'metal', 'accent'], build: 'chest' },
      { role: 'bookcase', type: 'shelf', rooms: ['library', 'study', 'hall', 'store', 'shrine'], anchor: 'wall', clear: { front: 0.7 }, w: 1.4, d: 0.4, h: 2.0, uses: ['wood', 'cloth', 'clay', 'stone', 'metal', 'accent'], plaster: true, build: 'bookcase' },
      { role: 'wall_shelves', type: 'shelf', rooms: ['kitchen', 'store', 'workshop'], anchor: 'wall', clear: { front: 0.6 }, w: 1.2, d: 0.32, h: 1.5, uses: ['wood', 'clay', 'cloth', 'rope'], plant: true, build: 'wallShelves' },
      { role: 'store', type: 'storage', surface: false, rooms: ['kitchen', 'store', 'hall', 'yard'], setting: 'both', clear: { front: 0.5 }, w: 1.0, d: 0.55, h: 0.85, uses: ['clay', 'cloth', 'rope', 'wood', 'metal', 'accent'], plant: true, build: 'store' },
      { role: 'hearth', type: 'stove', rooms: ['kitchen', 'hall', 'tavern'], anchor: 'wall', clear: { front: 0.9 }, w: 1.5, d: 0.8, h: 1.9, uses: ['stone', 'clay', 'metal', 'accent', 'wood'], fire: true, build: 'hearth' },
      { role: 'fire', type: 'brazier', rooms: ['hall', 'tavern', 'yard', 'court', 'shrine'], setting: 'both', clear: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 }, w: 0.7, d: 0.7, h: 1.0, uses: ['metal', 'stone', 'wood', 'accent', 'rope'], fire: true, build: 'fire' },
      { role: 'lamp', type: 'lamp', rooms: ['hall', 'bedroom', 'tavern', 'study', 'shrine', 'antechamber', 'library'], clear: {}, w: 0.34, d: 0.34, h: 1.6, uses: ['accent', 'metal', 'clay', 'stone', 'wood', 'rope'], fire: true, glass: true, plaster: true, build: 'lamp' },
      { role: 'candle', type: 'lamp', rooms: ['hall', 'bedroom', 'study', 'shrine', 'tavern'], anchor: 'surface', clear: {}, w: 0.16, d: 0.16, h: 0.3, uses: ['clay', 'accent'], fire: true, plaster: true, build: 'candle' },
      { role: 'hanging', type: 'lamp', rooms: ['hall', 'tavern', 'kitchen', 'workshop', 'shrine', 'antechamber'], anchor: 'ceiling', clear: {}, w: 0.5, d: 0.5, h: 1.0, uses: ['metal', 'accent', 'rope'], fire: true, glass: true, plaster: true, build: 'hanging' },
      { role: 'rug', type: 'rug', rooms: ['hall', 'bedroom', 'court', 'shrine', 'study'], clear: {}, w: 2.2, d: 1.5, h: 0.03, variants: 2, variantNames: ['first colours', 'second colours'], uses: ['cloth', 'accent'], reed: true, build: 'rug' },
      { role: 'screen', type: 'screen', rooms: ['hall', 'bedroom', 'antechamber', 'court'], clear: { front: 0.4 }, w: 1.6, d: 0.5, h: 1.8, uses: ['wood', 'cloth', 'accent', 'rope'], reed: true, build: 'screen' },
      { role: 'counter', type: 'counter', rooms: ['tavern', 'market', 'store', 'hall'], setting: 'both', clear: { front: 1.0, back: 0.8 }, w: 2.3, d: 0.75, h: 1.05, variants: 2, variantNames: ['plain', 'decorated front'], uses: ['wood', 'clay', 'accent'], build: 'counter' },
      { role: 'workbench', type: 'workstation', rooms: ['workshop', 'yard'], setting: 'both', anchor: 'wall', clear: { front: 0.9 }, w: 1.6, d: 0.7, h: 0.9, uses: ['wood', 'metal', 'clay'], build: 'workbench' },
      { role: 'loom', type: 'loom', rooms: ['workshop', 'hall'], setting: 'both', anchor: 'wall', clear: { front: 1.0 }, w: 1.3, d: 0.9, h: 1.7, uses: ['wood', 'cloth', 'rope', 'accent'], build: 'loom' },
      { role: 'rack', type: 'rack', rooms: ['workshop', 'hall', 'barracks', 'store', 'antechamber'], anchor: 'wall', clear: { front: 0.6 }, w: 1.2, d: 0.35, h: 1.8, uses: ['wood', 'metal', 'accent', 'cloth', 'clay', 'rope'], build: 'rack' },
      { role: 'ladder', type: 'ladder', rooms: ['store', 'workshop', 'library', 'hall'], anchor: 'wall', clear: { front: 0.5 }, w: 0.5, d: 0.5, h: 2.3, uses: ['wood'], build: 'ladder' },
      { role: 'board', type: 'board', rooms: ['school', 'workshop', 'study', 'library'], anchor: 'wall', clear: { front: 0.8 }, w: 1.3, d: 0.14, h: 1.6, uses: ['wood', 'stone', 'cloth', 'accent'], plaster: true, plastic: true, build: 'board' },
      { role: 'art', type: 'art', rooms: ['hall', 'bedroom', 'tavern', 'shrine', 'antechamber', 'study'], anchor: 'wall', clear: {}, w: 0.7, d: 0.3, h: 0.7, variants: 2, variantNames: ['first', 'second'], uses: ['wood', 'clay', 'cloth', 'accent', 'metal', 'stone'], bone: true, ceramic: true, build: 'art' },
      { role: 'banner', type: 'banner', rooms: ['hall', 'tavern', 'shrine', 'antechamber', 'barracks', 'market'], anchor: 'wall', clear: {}, w: 0.7, d: 0.12, h: 2.0, variants: 2, variantNames: ['swallow-tail', 'fringed'], uses: ['wood', 'cloth', 'accent', 'metal'], build: 'banner' },
      { role: 'scroll', type: 'banner', rooms: ['hall', 'study', 'library', 'shrine', 'bedroom', 'school'], anchor: 'wall', clear: {}, w: 0.7, d: 0.12, h: 1.6, variants: 2, variantNames: ['glyph columns', 'painted scene'], uses: ['wood', 'cloth', 'accent', 'rope'], plaster: true, build: 'scroll' },
      { role: 'pennants', type: 'banner', rooms: ['hall', 'tavern', 'market', 'yard', 'antechamber'], setting: 'both', anchor: 'wall', clear: {}, w: 2.4, d: 0.12, h: 0.55, variants: 2, stretch: true, variantNames: ['first colours', 'second colours'], uses: ['cloth', 'metal', 'rope'], build: 'pennants' },
      { role: 'bowl', type: 'vessel', rooms: ['hall', 'kitchen', 'tavern'], anchor: 'surface', clear: {}, w: 0.34, d: 0.34, h: 0.2, variants: 2, variantNames: ['fruit', 'flatbread'], uses: ['clay', 'cloth', 'accent'], plant: true, build: 'bowl' },
      { role: 'jug', type: 'vessel', rooms: ['hall', 'kitchen', 'tavern', 'bedroom'], anchor: 'surface', clear: {}, w: 0.44, d: 0.28, h: 0.34, uses: ['clay', 'accent'], build: 'jug' },
      { role: 'books', type: 'book', rooms: ['library', 'study', 'school', 'shrine', 'hall'], anchor: 'surface', clear: {}, w: 0.42, d: 0.32, h: 0.26, uses: ['cloth', 'accent', 'stone'], plaster: true, build: 'books' }
    ],
    court: [
      { role: 'bed', type: 'bed', rooms: ['bedroom'], clear: { front: 0.8, left: 0.6, right: 0.6 }, w: 1.8, d: 2.3, h: 2.3, variants: 2, variantNames: ['first hangings', 'second hangings'], uses: ['wood', 'cloth', 'accent'], build: 'bedFine' },
      { role: 'throne', type: 'chair', rooms: ['hall', 'court', 'shrine'], clear: { front: 1.0, left: 0.4, right: 0.4 }, w: 0.95, d: 0.85, h: 1.7, uses: ['wood', 'cloth', 'accent'], build: 'throne' },
      { role: 'divan', type: 'seating', rooms: ['hall', 'court', 'bedroom', 'antechamber'], setting: 'both', clear: { front: 0.8 }, w: 2.2, d: 0.95, h: 0.85, uses: ['wood', 'cloth', 'accent'], build: 'divan' },
      { role: 'table', type: 'table', rooms: ['hall', 'court', 'library'], clear: { front: 0.7, back: 0.7, left: 0.7, right: 0.7 }, w: 2.4, d: 1.0, h: 0.8, variants: 2, variantNames: ['bare', 'with a runner'], uses: ['wood', 'cloth', 'accent'], build: 'table', opts: { court: true } },
      { role: 'low_table', type: 'table', rooms: ['hall', 'bedroom', 'court', 'antechamber'], clear: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 }, w: 1.1, d: 0.75, h: 0.45, uses: ['wood', 'accent'], build: 'lowTable', opts: { court: true } },
      { role: 'desk', type: 'desk', rooms: ['study', 'library', 'court'], anchor: 'wall', clear: { front: 0.9 }, w: 1.5, d: 0.7, h: 1.2, uses: ['wood', 'accent', 'clay', 'cloth'], plaster: true, build: 'desk', opts: { court: true } },
      { role: 'cabinet', type: 'storage', rooms: ['hall', 'bedroom', 'study', 'court', 'shrine'], anchor: 'wall', clear: { front: 0.8 }, w: 1.3, d: 0.55, h: 2.0, uses: ['wood', 'accent'], build: 'cabinet' },
      { role: 'bookcase', type: 'shelf', rooms: ['library', 'study', 'hall', 'court'], anchor: 'wall', clear: { front: 0.8 }, w: 1.6, d: 0.42, h: 2.3, uses: ['wood', 'cloth', 'clay', 'stone', 'metal', 'accent'], plaster: true, build: 'bookcase', opts: { court: true } },
      { role: 'hearth', type: 'stove', rooms: ['hall', 'court', 'bedroom', 'kitchen'], anchor: 'wall', clear: { front: 1.0 }, w: 1.8, d: 0.85, h: 2.2, uses: ['stone', 'clay', 'metal', 'accent', 'wood'], fire: true, build: 'hearth', opts: { court: true } },
      { role: 'fire', type: 'brazier', rooms: ['hall', 'court', 'shrine', 'antechamber'], setting: 'both', clear: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 }, w: 0.8, d: 0.8, h: 1.1, uses: ['metal', 'stone', 'wood', 'accent', 'rope'], fire: true, build: 'fire', opts: { court: true } },
      { role: 'lamp', type: 'lamp', rooms: ['hall', 'bedroom', 'court', 'study', 'shrine', 'antechamber', 'library'], clear: {}, w: 0.4, d: 0.4, h: 1.8, uses: ['accent', 'metal', 'clay', 'stone', 'wood', 'rope'], fire: true, glass: true, plaster: true, build: 'lamp' },
      { role: 'candelabra', type: 'lamp', rooms: ['hall', 'bedroom', 'court', 'study', 'shrine'], anchor: 'surface', clear: {}, w: 0.4, d: 0.2, h: 0.5, uses: ['accent'], fire: true, plaster: true, build: 'candle', opts: { court: true } },
      { role: 'hanging', type: 'lamp', rooms: ['hall', 'court', 'shrine', 'antechamber', 'bedroom', 'library'], anchor: 'ceiling', clear: {}, w: 0.7, d: 0.7, h: 1.2, uses: ['metal', 'accent', 'rope'], fire: true, glass: true, plaster: true, build: 'hanging' },
      { role: 'carpet', type: 'rug', rooms: ['hall', 'bedroom', 'court', 'shrine', 'study', 'antechamber'], clear: {}, w: 3.0, d: 2.1, h: 0.03, variants: 2, variantNames: ['first colours', 'second colours'], uses: ['cloth', 'accent'], reed: true, build: 'rug', opts: { court: true } },
      { role: 'screen', type: 'screen', rooms: ['hall', 'bedroom', 'antechamber', 'court'], clear: { front: 0.4 }, w: 1.8, d: 0.55, h: 2.0, uses: ['wood', 'cloth', 'accent', 'rope'], reed: true, build: 'screen', opts: { court: true } },
      { role: 'tapestry', type: 'banner', rooms: ['hall', 'court', 'bedroom', 'shrine', 'antechamber', 'library'], anchor: 'wall', clear: {}, w: 1.6, d: 0.12, h: 2.1, variants: 4, variantNames: ['emblem', 'emblem, second field', 'woven device', 'banded, emblem row'], uses: ['wood', 'cloth', 'accent'], build: 'tapestry' },
      { role: 'banner', type: 'banner', rooms: ['hall', 'court', 'shrine', 'antechamber', 'library'], anchor: 'wall', clear: {}, w: 0.8, d: 0.12, h: 2.4, variants: 2, variantNames: ['swallow-tail', 'fringed'], uses: ['wood', 'cloth', 'accent', 'metal'], build: 'banner' },
      { role: 'frieze', type: 'banner', rooms: ['hall', 'court', 'antechamber', 'library', 'shrine'], anchor: 'wall', clear: {}, w: 2.6, d: 0.1, h: 0.7, variants: 2, variantNames: ['on the field', 'on the band'], uses: ['wood', 'cloth', 'accent'], build: 'frieze' },
      { role: 'wall_rug', type: 'banner', rooms: ['hall', 'court', 'bedroom', 'antechamber'], anchor: 'wall', clear: {}, w: 2.0, d: 0.1, h: 1.6, variants: 2, variantNames: ['first colours', 'second colours'], uses: ['wood', 'cloth', 'accent'], build: 'wallRug' },
      { role: 'scroll', type: 'banner', rooms: ['hall', 'court', 'study', 'library', 'shrine', 'bedroom'], anchor: 'wall', clear: {}, w: 0.8, d: 0.12, h: 1.9, variants: 2, variantNames: ['glyph columns', 'painted scene'], uses: ['wood', 'cloth', 'accent', 'rope'], plaster: true, build: 'scroll' },
      { role: 'painted_hanging', type: 'banner', rooms: ['hall', 'court', 'shrine', 'antechamber'], anchor: 'wall', clear: {}, w: 1.8, d: 0.12, h: 2.0, variants: 2, variantNames: ['procession', 'hunt'], uses: ['wood', 'cloth', 'accent', 'rope'], hide: true, build: 'paintedHanging' },
      { role: 'art', type: 'art', rooms: ['hall', 'court', 'bedroom', 'shrine', 'antechamber', 'study'], anchor: 'wall', clear: {}, w: 0.9, d: 0.4, h: 0.9, variants: 2, variantNames: ['first', 'second'], uses: ['wood', 'clay', 'cloth', 'accent', 'metal', 'stone'], bone: true, ceramic: true, build: 'art' },
      { role: 'statue', type: 'statue', rooms: ['hall', 'court', 'shrine', 'antechamber', 'library', 'yard'], setting: 'both', clear: { front: 0.5 }, w: 0.7, d: 0.7, h: 1.7, uses: ['stone', 'accent', 'wood', 'clay', 'metal', 'cloth'], bone: true, plant: true, build: 'statue' },
      { role: 'jug', type: 'vessel', rooms: ['hall', 'court', 'bedroom'], anchor: 'surface', clear: {}, w: 0.5, d: 0.3, h: 0.36, uses: ['clay', 'accent'], build: 'jug', opts: { court: true } },
      { role: 'bowl', type: 'vessel', rooms: ['hall', 'court'], anchor: 'surface', clear: {}, w: 0.38, d: 0.38, h: 0.2, variants: 2, variantNames: ['fruit', 'flatbread'], uses: ['clay', 'cloth', 'accent'], plant: true, build: 'bowl', opts: { court: true } }
    ],
    /* trades and households (2026-10 interiors-sets pass): registered with FK.set({ roles: 'trade' }),
       keyed <culture>_trade_<role>, tier as the call gives (common, or poor for generic and scrap).
       Rooms list the interiors kinds that use them (smithy stable shop dormitory living cottage, and the
       older workshop store kitchen barracks tavern market yard roost). */
    trade: [
      { role: 'forge', type: 'stove', rooms: ['smithy', 'workshop'], anchor: 'wall', clear: { front: 1.0 }, w: 1.5, d: 1.0, h: 2.2, uses: ['stone', 'metal', 'wood', 'cloth'], fire: true, build: 'forge' },
      { role: 'anvil', type: 'workstation', rooms: ['smithy', 'workshop'], clear: { front: 0.8, back: 0.5 }, w: 0.8, d: 0.5, h: 0.85, uses: ['metal', 'wood'], build: 'anvil' },
      { role: 'trough', type: 'vessel', rooms: ['smithy', 'stable', 'workshop', 'yard', 'roost'], setting: 'both', clear: { front: 0.6 }, w: 1.2, d: 0.5, h: 0.6, uses: ['wood', 'metal', 'stone'], glass: true, build: 'trough' },
      { role: 'stall', type: 'pen', rooms: ['stable', 'yard', 'roost'], setting: 'both', anchor: 'wall', clear: { front: 1.2 }, w: 2.2, d: 2.8, h: 1.6, variants: 2, variantNames: ['beast stall', 'small stall'],
        variantDims: [{ w: 2.2, d: 2.8, h: 1.6 }, { w: 1.6, d: 2.0, h: 1.3 }], uses: ['wood', 'rope', 'accent'], plant: true, build: 'stall' },
      { role: 'hayrack', type: 'rack', rooms: ['stable', 'store', 'yard', 'roost'], setting: 'both', anchor: 'wall', clear: { front: 0.8 }, w: 1.4, d: 0.5, h: 1.6, uses: ['wood', 'rope'], plant: true, build: 'hayrack' },
      { role: 'display', type: 'stack', rooms: ['shop', 'market', 'store'], setting: 'both', clear: { front: 0.7 }, w: 1.3, d: 0.8, h: 1.1, variants: 2, variantNames: ['wares', 'cloth bolts'],
        uses: ['wood', 'clay', 'cloth', 'accent'], build: 'display' },
      { role: 'armour_stand', type: 'rack', rooms: ['shop', 'smithy', 'barracks', 'dormitory', 'hall', 'antechamber'], clear: { front: 0.6 }, w: 0.6, d: 0.5, h: 1.85, variants: 2, variantNames: ['plate', 'leather'],
        uses: ['wood', 'metal', 'cloth', 'accent'], build: 'armourStand' },
      { role: 'weapon_rack', type: 'weapon', rooms: ['shop', 'smithy', 'barracks', 'dormitory', 'hall', 'antechamber'], anchor: 'wall', clear: { front: 0.6 }, w: 1.2, d: 0.35, h: 1.8, uses: ['wood', 'metal', 'accent', 'cloth'], build: 'weaponRack' },
      { role: 'vat', type: 'storage', surface: false, rooms: ['workshop', 'store', 'tavern', 'kitchen'], clear: { front: 0.7 }, w: 1.2, d: 1.2, h: 1.3, uses: ['wood', 'metal', 'cloth'], glass: true, build: 'vat' },
      { role: 'still', type: 'workstation', rooms: ['workshop', 'shop', 'study'], anchor: 'wall', clear: { front: 0.9 }, w: 1.3, d: 0.6, h: 1.7, uses: ['wood', 'metal', 'stone', 'clay', 'accent'], fire: true, glass: true, build: 'still' },
      { role: 'bin', type: 'storage', rooms: ['store', 'kitchen', 'shop', 'stable', 'workshop'], anchor: 'wall', clear: { front: 0.6 }, w: 1.6, d: 0.6, h: 0.95, uses: ['wood', 'metal', 'rope'], plant: true, build: 'bin' },
      { role: 'larder', type: 'storage', surface: false, rooms: ['kitchen', 'store', 'hall'], anchor: 'wall', clear: { front: 0.7 }, w: 1.0, d: 0.5, h: 1.9, uses: ['wood', 'rope', 'accent', 'clay'], plant: true, build: 'larder' },
      { role: 'bunk', type: 'bed', rooms: ['dormitory', 'barracks'], clear: { front: 0.6 }, w: 1.0, d: 2.0, h: 1.75, uses: ['wood', 'cloth'], build: 'bunk' },
      { role: 'locker', type: 'storage', rooms: ['dormitory', 'barracks', 'bedroom', 'workshop'], anchor: 'wall', clear: { front: 0.6 }, w: 0.9, d: 0.5, h: 1.85, uses: ['wood', 'metal'], build: 'locker' },
      { role: 'lathe', type: 'workstation', rooms: ['workshop'], anchor: 'wall', clear: { front: 0.9 }, w: 1.7, d: 0.7, h: 1.3, uses: ['wood', 'metal'], build: 'lathe' },
      { role: 'press', type: 'workstation', rooms: ['workshop', 'shop'], clear: { front: 0.9, back: 0.4 }, w: 1.1, d: 0.9, h: 2.0, uses: ['wood', 'metal', 'cloth'], build: 'press' },
      { role: 'kiln', type: 'stove', rooms: ['workshop', 'smithy'], clear: { front: 0.9 }, w: 1.4, d: 1.4, h: 2.0, uses: ['clay', 'stone'], fire: true, build: 'kiln' },
      { role: 'grindstone', type: 'workstation', rooms: ['smithy', 'workshop', 'yard'], setting: 'both', clear: { front: 0.7 }, w: 0.9, d: 0.6, h: 1.0, uses: ['wood', 'metal', 'stone'], build: 'grindstone' },
      { role: 'altar', type: 'altar', rooms: ['shrine'], clear: { front: 1.0 }, w: 1.4, d: 0.8, h: 1.25, uses: ['stone', 'wood', 'cloth', 'accent', 'clay'], fire: true, build: 'altar' },
      { role: 'barrel', type: 'storage', surface: false, rooms: ['tavern', 'store', 'kitchen', 'shop'], anchor: 'wall', clear: { front: 0.7 }, w: 1.8, d: 0.7, h: 1.3, uses: ['wood', 'metal', 'accent'], build: 'barrelRack' }
    ],
    /* the works (2026-10-19 trades audit): the trades FK.ROLES.trade lacks, registered with
       FK.set({ roles: 'works', skip: [..] }) as <culture>_works_<role>; each role carries its job (R.job) */
    works: [
      { role: 'bread_oven', type: 'stove', job: 'baking', setting: 'both', rooms: ['kitchen', 'shop', 'workshop', 'yard'], clear: { front: 1.0 }, w: 1.4, d: 1.4, h: 2.0, uses: ['stone', 'wood', 'clay', 'metal'], fire: true, build: 'breadOven' },
      { role: 'butcher_block', type: 'workstation', job: 'butchery', setting: 'both', rooms: ['shop', 'kitchen', 'yard', 'market', 'store'], clear: { front: 0.8, back: 0.4 }, w: 1.1, d: 0.8, h: 1.2, uses: ['wood', 'metal', 'cloth'], glass: true, build: 'butcherBlock' },
      { role: 'meat_rack', type: 'rack', job: 'butchery', setting: 'both', rooms: ['shop', 'store', 'yard', 'kitchen', 'market'], clear: { front: 0.7 }, w: 1.8, d: 0.6, h: 2.0, variants: 2, variantNames: ['sides of meat', 'fowl and hares'], uses: ['wood', 'metal', 'cloth'], build: 'meatRack' },
      { role: 'herb_bench', type: 'workstation', job: 'healing', rooms: ['shop', 'workshop', 'study', 'hall', 'shrine'], anchor: 'wall', clear: { front: 0.8 }, w: 1.5, d: 0.7, h: 1.9, uses: ['wood', 'stone', 'clay', 'metal', 'accent', 'rope'], plant: true, build: 'herbBench' },
      { role: 'sickbed', type: 'bed', job: 'healing', rooms: ['bedroom', 'dormitory', 'hall', 'shrine', 'shop'], clear: { front: 0.7 }, w: 0.9, d: 2.0, h: 0.8, uses: ['wood', 'cloth', 'clay'], build: 'sickbed' },
      { role: 'scribe_desk', type: 'desk', job: 'scribing', rooms: ['study', 'library', 'hall', 'shop', 'antechamber', 'court'], clear: { front: 0.8 }, w: 1.2, d: 0.7, h: 1.3, uses: ['wood', 'cloth', 'clay'], build: 'scribeDesk' },
      { role: 'hull_stocks', type: 'workstation', job: 'shipwrighting', setting: 'outdoor', rooms: ['yard', 'dock', 'workshop'], clear: { front: 1.2, back: 1.2, left: 0.8, right: 0.8 }, w: 3.4, d: 1.5, h: 1.6, uses: ['wood', 'rope'], build: 'hullStocks' },
      { role: 'quarry_block', type: 'workstation', job: 'quarrying', setting: 'outdoor', rooms: ['yard', 'workshop', 'dock'], clear: { front: 0.8, back: 0.8, left: 0.6, right: 0.6 }, w: 1.8, d: 1.3, h: 1.2, uses: ['stone', 'wood', 'metal', 'rope'], build: 'quarryBlock' },
      { role: 'weigh_scale', type: 'workstation', job: 'customs', setting: 'both', rooms: ['dock', 'market', 'store', 'shop', 'yard'], clear: { front: 0.7 }, w: 1.05, d: 0.5, h: 1.4, uses: ['wood', 'metal'], build: 'weighScale' },
      { role: 'tally_board', type: 'board', job: 'customs', rooms: ['dock', 'market', 'store', 'shop', 'hall', 'study'], anchor: 'wall', clear: { front: 0.5 }, w: 1.3, d: 0.14, h: 1.5, uses: ['wood', 'accent', 'rope'], build: 'tallyBoard' },
      { role: 'churn', type: 'vessel', job: 'dairy', setting: 'both', rooms: ['kitchen', 'store', 'yard', 'shop'], clear: { front: 0.5 }, w: 0.85, d: 0.6, h: 1.1, uses: ['wood', 'metal'], build: 'churn' },
      { role: 'cheese_press', type: 'workstation', job: 'dairy', setting: 'both', rooms: ['kitchen', 'store', 'yard', 'shop'], clear: { front: 0.7 }, w: 1.1, d: 0.7, h: 1.3, uses: ['wood', 'stone', 'clay', 'metal', 'rope'], build: 'cheesePress' }
    ],
    /* training furniture (2026-10): a melee and a ranged practice piece for every culture, registered with
       FK.set({ roles: 'training' }) as <culture>_training_<role>; their tasks are melee-training and ranged-training */
    training: [
      { role: 'training_dummy', type: 'tool', rooms: ['yard', 'barracks', 'court'], setting: 'both', clear: { front: 1.2, back: 1.0, left: 1.0, right: 1.0 }, w: 0.9, d: 0.7, h: 1.8, uses: ['wood', 'cloth', 'rope'], plant: true, build: 'trainingDummy' },
      { role: 'archery_butt', type: 'tool', rooms: ['yard', 'barracks', 'court'], setting: 'both', clear: { front: 3.0 }, w: 1.3, d: 0.8, h: 1.6, uses: ['wood', 'cloth', 'rope'], plant: true, build: 'archeryButt' }
    ]
  };

  /* the canonical materials a role's build can touch, from the style sheet's families */
  K.materialsFor = function (S, R) {
    const fams = new Set();
    for (const slot of (R.uses || [])) {
      if (slot === 'rope') fams.add('rope');
      else fams.add(S[SLOT_FAM[slot]] || SLOT_DEFAULT[SLOT_FAM[slot]]);
    }
    if (R.fire) fams.add('glow');
    if (R.glass) fams.add('glass');
    if (R.plant) fams.add('plant');
    if (R.plaster) fams.add('plaster');
    if (R.reed) fams.add('reed');
    if (R.bone) fams.add('bone');
    if (R.ceramic) fams.add('ceramic');
    if (R.plastic) fams.add('plastic');
    if (R.hide) fams.add('hide');
    if (S.tile && (R.build === 'hearth' || R.build === 'art')) fams.add('ceramic');
    if ((R.uses || []).indexOf('wood') >= 0 && (S.woodFam === 'bamboo' || S.legs === 'lashed' || S.motif === 'lash')) fams.add('rope');
    const out = new Set();
    for (const f0 of fams) { const f = f0 && f0.indexOf('/') > 0 ? f0.slice(f0.indexOf('/') + 1) : f0; out.add(FAMILY_TO_MATERIAL[f] || 'unassigned'); }   /* 'tex/base': the base names the material */
    return [...out].sort();
  };

  /* FK.set({ culture, tier, S, names?, dims?, override?, skip?, rooms?, prefix?, roles? }):
     registers every role of the tier as FURN entries keyed <culture>_<tier>_<role>; with
     roles: 'trade' it registers FK.ROLES.trade instead (keyed <culture>_trade_<role>) at the tier given. */
  /* the job (FURN_JOBS) of each trade role: the catalog's Jobs page groups work pieces by job. Roles left out
     (bunk, locker) are a trade set's household and shrine pieces: they keep a `Jobs · trade · <culture>` row. */
  K.TRADE_JOB = { forge: 'smithing', anvil: 'smithing', grindstone: 'smithing', armour_stand: 'smithing', weapon_rack: 'smithing',
    trough: 'herding', hayrack: 'herding', stall: 'trading', display: 'trading', vat: 'weaving', still: 'brewing', barrel: 'brewing',
    bin: 'warehousing', larder: 'warehousing', lathe: 'carpentry', press: 'milling', kiln: 'pottery', altar: 'worship' };
  K.set = function (spec) {
    const culture = spec.culture, tier = spec.tier || 'common', S = spec.S;
    const prefix = spec.prefix || (culture + '_' + (spec.roles || tier) + '_');
    const names = spec.names || {}, dims = spec.dims || {}, over = spec.override || {}, skip = spec.skip || [];
    const roles = K.ROLES[spec.roles || tier];     /* spec.roles: another role list ('trade') registered at this tier */
    const made = [];
    for (const R of roles) {
      if (skip.indexOf(R.role) >= 0) continue;
      const o = over[R.role] || {};
      const d = Object.assign({ w: R.w, d: R.d, h: R.h }, dims[R.role] || {}, o.w ? { w: o.w, d: o.d, h: o.h } : {});
      const build = o.build || B[R.build];
      const opts = Object.assign({}, R.opts || {}, o.opts || {});
      const entry = {
        key: prefix + R.role, name: o.name || names[R.role] || (FURN_CULTURE_INFO[culture] ? FURN_CULTURE_INFO[culture].name : culture) + ' ' + R.role.replace(/_/g, ' '),
        culture: culture, tier: tier, type: o.type || R.type, setting: o.setting || R.setting || 'indoor',
        rooms: (o.rooms || (spec.rooms && spec.rooms[R.role]) || R.rooms).slice(), anchor: o.anchor || R.anchor || 'floor',
        clearance: Object.assign({}, o.clearance || R.clear || {}),
        materials: o.materials || K.materialsFor(S, R),
        w: d.w, d: d.d, h: d.h, variants: o.variants || R.variants || 1,
        variantNames: o.variantNames || R.variantNames,
        variantDims: o.variantDims || (R.variantDims && !o.w ? R.variantDims.map(function (vd) { return Object.assign({ w: d.w, d: d.d, h: d.h }, vd); }) : undefined),
        role: R.role, kit: true, roleSet: spec.roles || null,
        build: function (F) { const vd = entry.variantDims && entry.variantDims[F.variant] || d; build(F, S, Object.assign({ w: vd.w, d: vd.d, h: vd.h, variant: F.variant, court: tier === 'court', culture: culture }, opts)); }
      };
      if (entry.variantNames && entry.variantNames.length !== entry.variants) entry.variantNames = undefined;
      if (o.surface === false || R.surface === false) entry.surface = false;   /* no flat top: nothing is set on it (SPEC: surface) */
      if (o.stretch || R.stretch) entry.stretch = true;   /* it may run the length of its wall (the placer's span: a cord of pennants) */
      const job = o.job || R.job || (spec.roles === 'trade' ? K.TRADE_JOB[R.role] : null);
      if (job) entry.job = job;
      FURN(entry);
      made.push(entry.key);
    }
    return made;
  };
  return K;
})();

/* ---- kits/catalog/krator-master-furniture-generic-goods.js ---- */
/* ======================================================================
   Krator master catalog — generic furniture: containers, food, drink, supplies
   Culture 'generic': pieces no one culture owns. FURN({...}) entries in the
   kits/furniture/SPEC.md shape; their colours join FPAL['generic'] through the
   PALETTE block below. Every piece is tier 'common' with wealth [0, 1]: food and
   storage suit a room of any wealth, so kits/interiors never skips them as off-band.

   Sized to the catalog's furniture. A surface piece (anchor 'surface') is at
   most 0.36 m deep and 0.42 m tall unless it says otherwise, so it fits on
   yuni_common_wall_shelves (0.38 deep, 0.44 between boards), the pantry shelf
   below, any counter (0.8 deep) and any table. Three are table-only, being
   0.38-0.42 m across: generic_roast, generic_fish 'platter', generic_basket
   'flat tray'. Floor containers stand beside a 0.8 m table or a 1.05 m counter.

   KGEN holds the shared shapes (bottle, jar, bowl, mug, crate, a heap of round
   things). It takes colours, never palette keys or literals, so each piece
   still names its own colours with F.col.
   ====================================================================== */

/* PALETTE */
/* the goods' and the biome fruit's colours, added to the generic palette (krator-master-furniture-generic.js
   owns timberPine, clothLinen and iron, which these pieces use too). Role + name: bread*, cheese*, meat*,
   fruit*, veg*, drink*; the fruit keys follow the part each biome draws. */
FURN_CULTURE('generic', { palette: {
    timberOak: 0x8a6a4e, timberWalnut: 0x5e3f2a, timberDark: 0x3e2c20, timberBirch: 0xd2b88a,
    wickerStraw: 0xc4a064, wickerTan: 0x9c7a48, wickerDark: 0x6e5432,
    stoneClay: 0xb06a44, stoneClayDark: 0x8a4e32, stoneBuff: 0xd2bc94, stoneGrey: 0x8e8a82, stoneSlate: 0x4e5258,
    stoneCream: 0xeee6d2, stoneGlazeBlue: 0x3e6a8a, stoneGlazeGreen: 0x5a7a4a, stoneGlazeOchre: 0xc08a3a,
    glassGreen: 0x3e6e44, glassAmber: 0x9a5a1e, glassClear: 0xcfe0e0, glassBlue: 0x3a5a8a, glassViolet: 0x5a3a6e,
    tin: 0xa8acae, brass: 0xc29a44, copper: 0xb06a3a, pewter: 0x8a8f92,
    clothHessian: 0xa8885a, clothMadder: 0xa8402e, clothIndigo: 0x2e4a7a, clothOchre: 0xc9a24a,
    clothSage: 0x7a8a62, clothRose: 0xc87a7a,
    waxBone: 0xeadfc4, waxHoney: 0xd8a848, waxRed: 0xb02a24,
    paperCream: 0xe8dcb8, inkBlack: 0x1a1a22, coalBlack: 0x262422,
    breadCrust: 0xa8682e, breadDark: 0x6e4220, breadCrumb: 0xe8cc90, pieCrust: 0xc88a40,
    cheeseYellow: 0xe8c25a, cheesePale: 0xf0e2b0, cheeseRind: 0xc8963a, cheeseBlue: 0x8a9aa0,
    meatRed: 0x9a3a32, meatCured: 0x7a2e26, meatRoast: 0x8a4a22, meatFat: 0xf0e4cc, meatSausage: 0x8a4a32,
    fishSilver: 0xa8b0b0, fishBack: 0x4e5a62, fishSmoked: 0xb8823a,
    fruitApple: 0xb8302a, fruitAppleGreen: 0x8ab040, fruitPear: 0xc8b048, fruitOrange: 0xe08a24,
    fruitLemon: 0xe8d040, fruitGrape: 0x5a2a5a, fruitPlum: 0x4a2a5a, fruitBerry: 0xc82a2a, fruitBanana: 0xe8cc48,
    vegCarrot: 0xe07a24, vegOnion: 0xc8964a, vegGarlic: 0xeae0cc, vegCabbage: 0x8ab060, vegLeaf: 0x5a8a3a,
    vegHerb: 0x4a6a32, vegPotato: 0xa88a5a, vegPumpkin: 0xd8782a, vegMushroom: 0xc8b090, vegPepper: 0xb82a1e,
    vegBean: 0x7a3a2a, nutBrown: 0x8a5a30, grainStraw: 0xd8c080, flourWhite: 0xf0ead8,
    eggShell: 0xece2cc, eggBrown: 0xc8a070, eggYolk: 0xf0b030,
    honeyAmber: 0xd89a28, jamRuby: 0x8a1e2a, butterYellow: 0xf0d890, creamWhite: 0xf4ece0, icingPink: 0xe8a8b0,
    stewBrown: 0x7a4a24, soupGold: 0xc8902e, sauceRed: 0xa8341e,
    drinkWine: 0x5a1420, drinkAle: 0xb87a28, drinkFoam: 0xf2ead8, drinkMilk: 0xf2efe6, drinkWater: 0x7aa0b0,
    drinkTea: 0x7a4a24, drinkSpirit: 0xc8902e, drinkOil: 0xc8a840,
    saltWhite: 0xf4f2ec, spiceRed: 0xa8401e, spiceTurmeric: 0xd8a020, spiceBlack: 0x2e2620,
    soapCream: 0xe8e0c0, soapGreen: 0x9ab07a, tobaccoBrown: 0x6a4428, herbDry: 0x8a8a4a, medicineRed: 0x9a2a2a,
    /* biome fruit (krator-master-furniture-generic-fruit.js): colours taken from the fruiting part each biome draws */
    fruitScaleRed: 0xc0262a, fruitScaleFlesh: 0xf0b8b0, fruitFernEgg: 0x8a6a3a, fruitFernMeal: 0xe8d8a8,
    fruitTideHusk: 0x7e3030, fruitTideJelly: 0xe8e0c8, fruitCycadRed: 0xb83a2a,
    fruitCocoHusk: 0x6e8a3a, fruitCocoShell: 0x5a3e26, fruitCocoFlesh: 0xf4f0e4, fruitCocoWater: 0xe8eadc,
    fruitGateRind: 0xe0862a, fruitGatePulp: 0xf2ead0, fruitMahogany: 0x5a3a22, fruitMahoganySeed: 0xc89a5a,
    fruitSilkGreen: 0x7a9a4a, fruitSilkFloss: 0xf0e6d0, fruitPandanKey: 0xd87a2a, fruitPandanTip: 0x5a6a2a, fruitPandanPaste: 0xe8a040,
    fruitAril: 0xd0202a, fruitArilSeed: 0x2e3a2a, fruitRowan: 0xd83a2a, fruitRowanJelly: 0xc8502a, fruitBilberry: 0x2a3a6a,
    fruitLanternPod: 0x9a62c8, fruitLanternPodGlow: 0xc89ae8, fruitMast: 0x8a6a4a, fruitMastHusk: 0x6a5a3a, fruitAcorn: 0x9a7a3a,
    fruitBanksia: 0xe88a24, drinkNectar: 0xe8b040,
    fruitBallmelon: 0x8ab838, fruitBallmelonFlesh: 0xf0d850, fruitFrillPink: 0xff40a0, fruitFrillCore: 0xf8e0ec,
    fruitLanternPink: 0xff50a0, fruitLanternGold: 0xffc030, fruitLanternOrange: 0xff7030, fruitLanternBlue: 0x40a0ff,
    fruitLanternViolet: 0xd040e0, fruitLanternTeal: 0x30d0c0, fruitBellDate: 0x857e32,
    fruitMesquite: 0xc8b850, fruitMesquiteCake: 0xb08a4a, fruitDate: 0x8a4a22, fruitDateStrand: 0xc88a3a,
    fruitTuna: 0xe86a20, fruitTunaFlesh: 0xd8402a,
    fruitPinyonCone: 0x8a5a34, fruitPinyonNut: 0x7a4a2a, fruitPinyonKernel: 0xe8d8b0, fruitJuniper: 0x6a7a9a, fruitJuniperTwig: 0x5e7458,
    fruitJuniperDry: 0x3e3e52, fruitYuccaStalk: 0xc89a4a, fruitYuccaRoast: 0x8a5a2a, fruitYuccaBloom: 0xf0ecd8, fruitGrape: 0x3a2a4a,
    fruitGrapeLeaf: 0x5a8a3a, fruitRaisin: 0x4a2a2a, fruitStiltPod: 0x5a9a6a, fruitStiltFlesh: 0xf0e8c8, fruitStiltSeed: 0x3a2a1e,
    fruitUmbelSeed: 0xa8946a, fruitUmbelStalk: 0x8a7a4a,
    fungusCoralOrange: 0xf08a3a, fungusCoralPink: 0xf090b0, fungusCoralViolet: 0x9a70c8, fungusParasol: 0xc8a882,
    fruitMadrone: 0xc82a1e, drinkCider: 0xd8a050, fruitRattlepod: 0x8a2a1c, fruitRattleBean: 0x4a2a1a,
    fruitTamarindShell: 0x4a3424, fruitTamarindPulp: 0x8a4a22, fruitFig: 0x5a3a5a, fruitFigFlesh: 0xd8586a,
    fruitCacaoRed: 0x8a2a3a, fruitCacaoGold: 0xd8a030, fruitCacaoOrange: 0xe07a28, fruitCacaoPulp: 0xf4ecdc, drinkCacao: 0x5a3020,
    fruitPitaya: 0xe0206a, fruitPitayaFlame: 0x7ab040, fruitPitayaFlesh: 0xf4f0ec,
    fruitPlantain: 0xf0d040, fruitPlantainBract: 0x6a2a8a, fruitPlantainFried: 0xd89a3a, fruitWingnut: 0x9ac060,
    fruitArbutusRed: 0xe02a20, fruitArbutusOrange: 0xf08a20, fruitWhorlOlive: 0x6a6a3a, fruitWhorlCream: 0xd8c8a0,
    fruitLotusPod: 0x8a9a5a, fruitLotusSeed: 0xe8e0c0,
    // the north basin's orchards and Guilin's plain (2026-11-03: TODO.md, "the missing fruit")
    fruitWildApple: 0xc8502e, fruitWildAppleGreen: 0xa8b848, fruitWildPear: 0xb8a848, fruitPearRusset: 0x9a7a3a,
    fruitApricot: 0xe89a3a, fruitApricotBlush: 0xd86a2a, fruitApricotDried: 0xb8662a, fruitKernel: 0xe8dcc0,
    fruitWalnutHusk: 0x5a7a3a, fruitWalnutShell: 0x9a7a52, fruitWalnutMeat: 0xc8a06a,
    fruitPomegranate: 0xc8202a, fruitPomegranateRind: 0xb8483a, fruitPomegranateAril: 0xd82a40, fruitPomegranatePith: 0xf0dcc0,
    fruitPistachioShell: 0xe0d4b4, fruitPistachioHull: 0xc89a8a, fruitPistachioNut: 0x8aa83a,
    fruitAlmondHull: 0x8aa860, fruitAlmondShell: 0xc8a478, fruitAlmondNut: 0xa86a3a, fruitAlmondBlanched: 0xf0e4c8,
    fruitPomelo: 0xd8d058, fruitPomeloPith: 0xf4f0d8, fruitPomeloFlesh: 0xf0a8a0, fruitPomeloPeelCandied: 0xe8c858,
    fruitOsmanthus: 0xf0b030, fruitOsmanthusDried: 0xc8862a, drinkOsmanthusTea: 0xd8a848, fruitOsmanthusSyrup: 0xc87a1a,
    fruitBambooSheath: 0x8a7a4a, fruitBambooShoot: 0xe8dcb0, fruitBambooShootTip: 0xc8c070,
    fruitFireseedHusk: 0xc85a2c, fruitFireseedNut: 0x40281e, fruitFireseedMeal: 0x9a6a44,
    fruitParasolCone: 0x8a5230, fruitParasolShell: 0x5e3c28, fruitParasolKernel: 0xeee2bc,
    fruitCliffFig: 0xb4482c, fruitCliffFigRipe: 0x5a2a48, fruitCliffFigFlesh: 0xe07a6a,
    fruitAvenuePod: 0xa86a30, fruitAvenuePulp: 0xf0e6c4, fruitAvenueSeed: 0x4a3022,
    fruitTravellerCapsule: 0x6a5034, fruitTravellerAril: 0x2a6ad0,
    fruitCherry: 0xd0485a, fruitCherryStalk: 0x7a9a5a, fruitBodhiFig: 0x8a5a7a, fruitBodhiFigFlesh: 0xe8a0a8,
    fruitBellPod: 0xbfe6d0, fruitBellPodBell: 0xf0b0a0, fruitBellPodStem: 0xd0a0a8,
    fruitBayBerry: 0x3a2a3e, fruitBayBerryGreen: 0x6a7a3a, fruitBayOil: 0xb8b058, fruitSkirtDrupe: 0xb8602a, fruitSkirtStone: 0x6a4a30,
    fruitAcaciaPod: 0x6e4a2a, fruitAcaciaGum: 0xe0a850,
    fruitPuzzleCone: 0x6a7438, fruitPuzzleSeed: 0xb88a52, fruitPuzzleSeedFlesh: 0xeadcb0,
    fruitPalePod: 0xd8d0b8, fruitPalePodPulp: 0xf2eedc, fruitPalePodSeed: 0x4a3a2a,
    fruitWattlePod: 0x7a6a3a, fruitWattleSeed: 0x2e2218, fruitWattleFlour: 0xcaa870,
    fruitGinkgoFlesh: 0xd8b048, fruitGinkgoNut: 0xe8dcb8, fruitGinkgoKernel: 0xa8c060,
    fruitKauriCone: 0x5a6a34, fruitKauriSeed: 0x9a6a3a,
    fruitCereusSkin: 0xd02a58, fruitCereusFlesh: 0xf4eaf0, fruitCereusSeed: 0x2a2024,
    fruitVigilHeart: 0xe8dcb0, fruitVigilRind: 0x8a7a4a,
    fruitWormLarva: 0xd8c488, fruitWormStalk: 0x4a3a2e, drinkTowerHoney: 0xc89830,
    fruitStackFig: 0x8a3450, fruitStackFigRipe: 0x5a1e3a, fruitStackFigFlesh: 0xd8586a, fruitStackFigString: 0x9a7a52,
    fruitEmberPlum: 0xc8c040, fruitEmberPlumRipe: 0xb8a030, fruitEmberPlumMeal: 0xd8c878
} });
/* END PALETTE */

const KGEN = {
  /* a bottle standing at (x, y, z): body r x 0.6h, shoulder, neck, cork; liquid shows through glass */
  bottle(F, x, y, z, r, h, glass, cork, liquid, fam) {
    fam = fam || 'glass';
    const bh = h * 0.6;
    if (liquid != null) F.cyl(x, y + 0.005, z, r * 0.82, bh * 0.85, 0, liquid, 'food');
    F.cyl(x, y, z, r, bh, 0, glass, fam);
    F.frustum(x, y + bh, z, r, Math.max(r * 0.35, 0.02), h * 0.14, 0, glass, fam, 12);
    F.cyl(x, y + bh + h * 0.14, z, Math.max(r * 0.3, 0.012), h * 0.2, 0, glass, fam);
    F.cyl(x, y + h * 0.93, z, Math.max(r * 0.32, 0.013), h * 0.07, 0, cork, 'wood');
  },
  /* a lidded jar: body, lid a little wider, knob; contents (if given) show through glass */
  jar(F, x, y, z, r, h, body, lid, fam, fill) {
    if (fill != null) F.cyl(x, y + 0.005, z, r * 0.85, h * 0.8, 0, fill, 'food');
    F.cyl(x, y, z, r, h, 0, body, fam);
    F.cyl(x, y + h, z, r * 1.06, 0.02, 0, lid, fam === 'glass' ? 'metal' : fam);
    F.ball(x, y + h + 0.02, z, Math.min(r * 0.3, 0.02), lid, fam === 'glass' ? 'metal' : fam);
  },
  /* a jar with a cloth cap tied on */
  clothJar(F, x, y, z, r, h, glass, fill, cloth, string) {
    F.cyl(x, y + 0.005, z, r * 0.85, h * 0.85, 0, fill, 'food');
    F.cyl(x, y, z, r, h, 0, glass, 'glass');
    F.dome(x, y + h, z, r * 1.12, 0.025, 0, cloth, 'cloth');
    F.cyl(x, y + h - 0.02, z, r * 1.05, 0.02, 0, string, 'cloth');
  },
  plate(F, x, y, z, r, col) { F.cyl(x, y, z, r, 0.02, 0, col, 'stone'); },
  /* an open bowl, flared; fill is the surface of what is in it */
  bowl(F, x, y, z, r, h, col, fam, fill) {
    F.frustum(x, y, z, r * 0.6, r, h, 0, col, fam || 'stone', 16);
    F.cyl(x, y + h - 0.018, z, r * 0.9, 0.02, 0, fill != null ? fill : F.shade(col, -0.35), fill != null ? 'food' : (fam || 'stone'));
  },
  /* a mug or tankard with a handle on +x, liquid at the brim */
  mug(F, x, y, z, r, h, col, fam, liquid) {
    F.cyl(x, y, z, r, h, 0, col, fam);
    if (liquid != null) F.cyl(x, y + h - 0.018, z, r * 0.85, 0.02, 0, liquid, 'food');
    F.box(x + r + 0.008, y + h * 0.2, z, 0.02, h * 0.6, 0.02, 0, col, fam);
  },
  /* a goblet: foot, stem, bowl; wine in it */
  goblet(F, x, y, z, glass, wine) {
    F.cyl(x, y, z, 0.03, 0.02, 0, glass, 'glass');
    F.cyl(x, y + 0.02, z, 0.01, 0.05, 0, glass, 'glass');
    if (wine != null) F.cyl(x, y + 0.075, z, 0.025, 0.03, 0, wine, 'food');
    F.frustum(x, y + 0.07, z, 0.022, 0.038, 0.06, 0, glass, 'glass', 14);
  },
  /* an open slatted crate, base at y; lid: true closes it */
  crate(F, x, y, z, w, h, d, col, lid) {
    const t = 0.02, dark = F.shade(col, -0.3);
    F.box(x, y, z, w - 0.04, 0.02, d - 0.04, 0, dark, 'wood');
    for (const k of [0, 1, 2]) {
      const sy = y + 0.02 + k * (h - 0.04) / 3, sh = (h - 0.04) / 3 - 0.015;
      const c = F.shade(col, F.rr(-0.06, 0.06));
      F.box(x, sy, z + d / 2 - t / 2, w, sh, t, 0, c, 'wood');
      F.box(x, sy, z - d / 2 + t / 2, w, sh, t, 0, c, 'wood');
      F.box(x - w / 2 + t / 2, sy, z, t, sh, d - 2 * t, 0, c, 'wood');
      F.box(x + w / 2 - t / 2, sy, z, t, sh, d - 2 * t, 0, c, 'wood');
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1])
      F.box(x + sx * (w / 2 - 0.025), y, z + sz * (d / 2 - 0.025), 0.05, h - 0.02, 0.05, 0, F.shade(col, -0.12), 'wood');
    if (lid) for (let i = 0; i < 4; i++) F.box(x, y + h - 0.02, z - d / 2 + d * (i + 0.5) / 4, w, 0.02, d / 4 - 0.01, 0, F.shade(col, 0.05 - i * 0.03), 'wood');
  },
  /* a heap of round things on a disc of radius R at height y: a ring, a centre, a second ring, a top */
  heap(F, cx, y, cz, R, r, cols, fam, one) {
    one = one || ((x, yy, z, c) => F.ball(x, yy + r, z, r, c, fam));
    const ring = Math.max(3, Math.floor(F.TAU * (R - r) / (2.05 * r)));
    for (let i = 0; i < ring; i++) {
      const a = i * F.TAU / ring;
      one(cx + Math.cos(a) * (R - r), y, cz + Math.sin(a) * (R - r), F.pick(cols));
    }
    one(cx, y, cz, F.pick(cols));
    if (R > 2.5 * r) {
      const r2 = (R - r) * 0.45, n2 = Math.max(3, Math.floor(F.TAU * r2 / (2.05 * r)));
      for (let i = 0; i < n2; i++) {
        const a = i * F.TAU / n2 + 0.4;
        one(cx + Math.cos(a) * r2, y + r * 1.3, cz + Math.sin(a) * r2, F.pick(cols));
      }
      one(cx, y + r * 2.1, cz, F.pick(cols));
    }
  },
  /* a fish lying on its side along x, head to +x when dir = 1: a chain of flattened lenses and a tail fin */
  fish(F, x, y, z, len, back, belly, dir) {
    const rs = [0.5, 0.95, 1, 0.85, 0.6, 0.35], r0 = len * 0.14;
    for (let i = 0; i < rs.length; i++) {
      const px = x + dir * len * (0.38 - i * 0.12), r = r0 * rs[i];
      F.blob(px, y + r * 0.45, z, r, r * 0.9, 0, i % 2 ? back : F.shade(back, 0.08), 'food');
    }
    F.blob(x + dir * len * 0.1, y + r0 * 0.25, z + r0 * 0.25, r0 * 0.7, r0 * 0.4, 0, belly, 'food');
    const tx = x - dir * len * 0.34;
    F.beam(tx, y + 0.012, z, tx - dir * len * 0.14, y + 0.012, z, len * 0.2, 0.02, F.shade(back, -0.1), 'food');
  },
  /* a capsule lying along x: a loaf, a sausage, a salami */
  capsule(F, x0, x1, y, z, r, col) {
    F.rod(x0, y + r, z, x1, y + r, z, r, col, 'food');
    F.ball(x0, y + r, z, r, col, 'food'); F.ball(x1, y + r, z, r, col, 'food');
  },
  /* an apple-like fruit with a stalk, sitting on y */
  fruit(F, x, y, z, r, col, stalk) {
    F.ball(x, y + r, z, r, col, 'food');
    if (stalk != null) F.cyl(x, y + 2 * r - 0.005, z, 0.01, 0.02, 0, stalk, 'wood');
  }
};

/* ================= Storage containers (17 pieces) ================= */

FURN({
  key: 'generic_barrel', name: 'Barrel', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'tavern', 'yard', 'dock', 'market', 'workshop'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber', 'metal', 'food'],
  w: 0.73, d: 0.67, h: 1.04, variants: 3, variantNames: ['barrel', 'open tub', 'water butt'],
  variantDims: [{ w: 0.62, d: 0.62, h: 0.92 }, { w: 0.73, d: 0.67, h: 0.45 }, { w: 0.64, d: 0.64, h: 1.04 }],
  build: function (F) {
    const oak = F.col('timberOak'), iron = F.col('iron');
    /* a barrel bellied between rEnd and rMid over height H, hooped; returns radius at a height */
    const barrel = (rEnd, rMid, H, hoops) => {
      F.frustum(0, 0, 0, rEnd, rMid, H / 2, 0, oak, 'wood', 18);
      F.frustum(0, H / 2, 0, rMid, rEnd, H / 2, 0, F.shade(oak, 0.04), 'wood', 18);
      const rAt = (y) => rEnd + (rMid - rEnd) * (1 - Math.abs(y - H / 2) / (H / 2));
      for (const f of hoops) F.cyl(0, f * H - 0.015, 0, rAt(f * H) + 0.008, 0.03, 0, iron, 'metal');
    };
    if (F.variant === 0) {
      barrel(0.25, 0.31, 0.9, [0.1, 0.33, 0.67, 0.9]);
      F.cyl(0, 0.885, 0, 0.24, 0.02, 0, F.shade(oak, -0.15), 'wood');
      F.cyl(0.1, 0.9, 0.06, 0.02, 0.01, 0, F.col('timberDark'), 'wood');        /* the bung */
    } else if (F.variant === 1) {
      F.frustum(0, 0, 0, 0.28, 0.33, 0.45, 0, oak, 'wood', 18);
      for (const y of [0.06, 0.36]) F.cyl(0, y, 0, 0.28 + 0.05 * (y + 0.015) / 0.45 + 0.008, 0.03, 0, iron, 'metal');
      F.cyl(0, 0.435, 0, 0.31, 0.02, 0, F.col('drinkWater'), 'food');
      for (const s of [-1, 1]) F.box(s * 0.345, 0.38, 0, 0.04, 0.07, 0.08, 0, F.shade(oak, -0.1), 'wood');
    } else {
      barrel(0.27, 0.32, 0.96, [0.08, 0.32, 0.68, 0.92]);
      F.cyl(0, 0.96, 0, 0.3, 0.03, 0, F.shade(oak, -0.08), 'wood');
      F.cyl(0.08, 0.99, 0, 0.05, 0.03, 0, F.col('tin'), 'metal');               /* the dipper on the lid */
      F.rod(0.08, 1.025, 0, -0.18, 1.025, 0.05, 0.012, F.col('timberPine'), 'wood');
    }
  }
});

FURN({
  key: 'generic_keg', name: 'Keg on a Cradle', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['tavern', 'kitchen', 'store', 'hall'], anchor: 'surface', clearance: {},
  materials: ['timber', 'metal'],
  w: 0.42, d: 0.31, h: 0.31, variants: 2, variantNames: ['oak keg', 'dark keg'],
  build: function (F) {
    F.shift(-0.0275, 0);
    const wood = F.col(F.variant ? 'timberWalnut' : 'timberOak'), iron = F.col('iron');
    for (const s of [-1, 1]) {
      F.box(s * 0.12, 0, 0, 0.05, 0.06, 0.3, 0, F.col('timberDark'), 'wood');   /* the cradle chocks */
      F.box(s * 0.12, 0.06, -0.1, 0.05, 0.03, 0.06, 0, F.col('timberDark'), 'wood');
      F.box(s * 0.12, 0.06, 0.1, 0.05, 0.03, 0.06, 0, F.col('timberDark'), 'wood');
    }
    F.rod(-0.18, 0.175, 0, 0.18, 0.175, 0, 0.12, wood, 'wood');
    F.rod(-0.1, 0.175, 0, 0.1, 0.175, 0, 0.13, F.shade(wood, 0.05), 'wood');
    for (const x of [-0.15, -0.07, 0.07, 0.15]) F.rod(x - 0.012, 0.175, 0, x + 0.012, 0.175, 0, Math.abs(x) > 0.1 ? 0.125 : 0.135, iron, 'metal');
    F.rod(0.18, 0.11, 0, 0.235, 0.11, 0, 0.014, F.col('brass'), 'metal');      /* the tap */
    F.box(0.225, 0.12, 0, 0.02, 0.05, 0.02, 0, F.col('brass'), 'metal');
  }
});

FURN({
  key: 'generic_crate', name: 'Slatted Crate', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'market', 'dock', 'yard', 'workshop'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['timber', 'thatch'],
  w: 0.62, d: 0.52, h: 0.84, variants: 3, variantNames: ['lidded', 'open, straw', 'stacked pair'],
  variantDims: [{ w: 0.62, d: 0.44, h: 0.42 }, { w: 0.62, d: 0.52, h: 0.45 }, { w: 0.62, d: 0.44, h: 0.84 }],
  build: function (F) {
    const pine = F.col('timberPine');
    KGEN.crate(F, 0, 0, 0, 0.62, 0.42, 0.44, pine, F.variant !== 1);
    if (F.variant === 1) F.blob(0, 0.38, 0, 0.27, 0.13, 0, F.col('wickerStraw'), 'thatch');
    if (F.variant === 2) KGEN.crate(F, 0, 0.42, 0, 0.62, 0.42, 0.44, F.shade(pine, -0.1), true);
  }
});

FURN({
  key: 'generic_chest', name: 'Storage Chest', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'store', 'hall', 'barracks', 'study'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'metal'],
  w: 0.96, d: 0.53, h: 0.52, variants: 3, variantNames: ['plain', 'iron-bound', 'painted'],
  build: function (F) {
    const wood = F.col(F.variant === 2 ? 'stoneGlazeBlue' : F.variant === 1 ? 'timberWalnut' : 'timberOak');
    const iron = F.col('iron');
    F.box(0, 0, 0, 0.9, 0.4, 0.5, 0, wood, 'wood');
    F.box(0, 0.4, 0, 0.92, 0.06, 0.52, 0, F.shade(wood, 0.06), 'wood');
    F.box(0, 0.46, 0, 0.84, 0.05, 0.44, 0, F.shade(wood, 0.1), 'wood');
    for (const s of [-1, 1]) F.box(s * 0.465, 0.25, 0, 0.03, 0.04, 0.14, 0, iron, 'metal');   /* side handles */
    F.box(0, 0.3, 0.255, 0.08, 0.1, 0.02, 0, F.col('brass'), 'metal');                  /* the lock plate */
    if (F.variant === 1) for (const x of [-0.3, 0, 0.3]) F.box(x, 0, 0, 0.04, 0.515, 0.525, 0, iron, 'metal');
    if (F.variant === 2) {
      for (const x of [-0.25, 0.25]) F.box(x, 0.1, 0.251, 0.26, 0.2, 0.02, 0, F.col('clothOchre'), 'wood');
      F.box(0, 0.02, 0, 0.92, 0.04, 0.52, 0, F.col('timberDark'), 'wood');
    }
  }
});

FURN({
  key: 'generic_strongbox', name: 'Strongbox', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['study', 'bedroom', 'store', 'hall', 'court'], anchor: 'surface', clearance: {},
  materials: ['timber', 'metal'],
  w: 0.34, d: 0.26, h: 0.21, variants: 2, variantNames: ['iron', 'oak and brass'],
  build: function (F) {
    const body = F.col(F.variant ? 'timberOak' : 'iron'), band = F.col(F.variant ? 'brass' : 'timberDark');
    const fam = F.variant ? 'wood' : 'metal', bfam = F.variant ? 'metal' : 'wood';
    F.box(0, 0, 0, 0.32, 0.14, 0.22, 0, body, fam);
    F.box(0, 0.14, 0, 0.34, 0.05, 0.24, 0, F.shade(body, 0.08), fam);
    for (const x of [-0.1, 0.1]) F.box(x, 0, 0, 0.03, 0.195, 0.245, 0, band, bfam);
    F.box(0, 0.08, 0.12, 0.05, 0.06, 0.02, 0, F.col('brass'), 'metal');
    F.box(0, 0.19, 0, 0.1, 0.02, 0.02, 0, band, bfam);
  }
});

FURN({
  key: 'generic_basket', name: 'Basket', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['kitchen', 'store', 'market', 'bedroom', 'hall'], anchor: 'surface', clearance: {},
  materials: ['thatch', 'metal'],
  w: 0.42, d: 0.42, h: 0.32, variants: 3, variantNames: ['round with handle', 'lidded hamper', 'flat tray'],
  variantDims: [{ w: 0.35, d: 0.35, h: 0.32 }, { w: 0.42, d: 0.31, h: 0.26 }, { w: 0.42, d: 0.42, h: 0.08 }],
  build: function (F) {
    const wk = F.col('wickerStraw'), dk = F.col('wickerTan'), inside = F.col('wickerDark');
    if (F.variant === 0) {
      F.frustum(0, 0, 0, 0.12, 0.17, 0.16, 0, wk, 'thatch', 14);
      F.cyl(0, 0.145, 0, 0.175, 0.02, 0, dk, 'thatch');
      F.cyl(0, 0.152, 0, 0.155, 0.02, 0, inside, 'thatch');
      F.cyl(0, 0.06, 0, 0.142, 0.02, 0, dk, 'thatch');
      const pts = [[-0.16, 0.16], [-0.12, 0.27], [0, 0.305], [0.12, 0.27], [0.16, 0.16]];
      for (let i = 0; i < 4; i++) F.rod(pts[i][0], pts[i][1], 0, pts[i + 1][0], pts[i + 1][1], 0, 0.012, dk, 'thatch');
    } else if (F.variant === 1) {
      F.box(0, 0, 0, 0.4, 0.22, 0.28, 0, wk, 'thatch');
      for (const y of [0.05, 0.15]) F.box(0, y, 0, 0.41, 0.02, 0.29, 0, dk, 'thatch');
      F.box(0, 0.22, 0, 0.42, 0.04, 0.3, 0, F.shade(wk, 0.06), 'thatch');
      F.box(0, 0.17, 0.145, 0.04, 0.07, 0.01, 0, F.col('brass'), 'metal');
    } else {
      F.frustum(0, 0, 0, 0.19, 0.21, 0.06, 0, wk, 'thatch', 16);
      F.cyl(0, 0.045, 0, 0.19, 0.02, 0, inside, 'thatch');
      F.cyl(0, 0.05, 0, 0.21, 0.02, 0, dk, 'thatch');
      F.cyl(0, 0.052, 0, 0.185, 0.02, 0, F.shade(inside, 0.1), 'thatch');
    }
  }
});

FURN({
  key: 'generic_floor_basket', name: 'Floor Basket', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'market', 'bedroom', 'yard'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['thatch', 'food', 'rope'],
  w: 0.65, d: 0.61, h: 0.61, variants: 3, variantNames: ['tall basket', 'grain basket', 'pannier pair'],
  variantDims: [{ w: 0.56, d: 0.52, h: 0.61 }, { w: 0.61, d: 0.61, h: 0.49 }, { w: 0.65, d: 0.31, h: 0.48 }],
  build: function (F) {
    const wk = F.col('wickerTan'), band = F.col('wickerDark');
    if (F.variant === 0) {
      F.frustum(0, 0, 0, 0.2, 0.25, 0.6, 0, wk, 'thatch', 16);
      for (const y of [0.1, 0.3, 0.5]) F.cyl(0, y, 0, 0.21 + y * 0.083 + 0.005, 0.03, 0, band, 'thatch');
      F.cyl(0, 0.59, 0, 0.23, 0.02, 0, F.shade(band, -0.3), 'thatch');
      for (const s of [-1, 1]) F.box(s * 0.26, 0.48, 0, 0.04, 0.08, 0.1, 0, band, 'thatch');
    } else if (F.variant === 1) {
      F.frustum(0, 0, 0, 0.24, 0.3, 0.4, 0, F.col('wickerStraw'), 'thatch', 18);
      for (const y of [0.08, 0.3]) F.cyl(0, y, 0, 0.25 + y * 0.15 + 0.005, 0.03, 0, wk, 'thatch');
      F.dome(0, 0.39, 0, 0.29, 0.1, 0, F.col('grainStraw'), 'food');
    } else {
      for (const s of [-1, 1]) {
        F.box(s * 0.17, 0, 0, 0.3, 0.45, 0.3, 0, F.shade(wk, s * 0.05), 'thatch');
        F.box(s * 0.17, 0.44, 0, 0.26, 0.02, 0.26, 0, F.shade(band, -0.3), 'thatch');
        for (const y of [0.1, 0.3]) F.box(s * 0.17, y, 0, 0.31, 0.03, 0.31, 0, band, 'thatch');
      }
      F.beam(-0.17, 0.45, 0, 0.17, 0.45, 0, 0.06, 0.05, F.col('clothHessian'), 'rope');
    }
  }
});

FURN({
  key: 'generic_sack', name: 'Sack', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'market', 'dock', 'yard'], anchor: 'floor', clearance: {},
  materials: ['cloth', 'rope'],
  w: 0.76, d: 0.42, h: 0.63, variants: 3, variantNames: ['standing sack', 'slumped pair', 'flour sack'],
  variantDims: [{ w: 0.4, d: 0.39, h: 0.63 }, { w: 0.76, d: 0.42, h: 0.34 }, { w: 0.37, d: 0.37, h: 0.57 }],
  build: function (F) {
    const hes = F.col('clothHessian'), rope = F.col('wickerTan');
    if (F.variant === 0) {
      F.blob(0, 0.26, 0, 0.2, 0.52, 0, hes, 'cloth');
      F.cyl(0, 0.48, 0, 0.07, 0.06, 0, F.shade(hes, -0.05), 'cloth');
      F.cyl(0, 0.5, 0, 0.075, 0.025, 0, rope, 'rope');
      F.cone(0, 0.53, 0, 0.1, 0.1, 0, F.shade(hes, 0.06), 'cloth');
    } else if (F.variant === 1) {
      F.blob(-0.16, 0.17, 0, 0.22, 0.34, 0, hes, 'cloth');
      F.blob(0.18, 0.15, 0, 0.2, 0.3, 0, F.shade(hes, -0.08), 'cloth');
      F.blob(-0.16, 0.31, 0.05, 0.12, 0.06, 0, F.shade(hes, 0.08), 'cloth');
    } else {
      const lin = F.col('clothLinen');
      F.blob(0, 0.22, 0, 0.18, 0.44, 0, lin, 'cloth');
      F.cyl(0, 0.19, 0, 0.183, 0.04, 0, F.col('clothMadder'), 'cloth');
      F.cyl(0, 0.42, 0, 0.06, 0.04, 0, F.col('clothMadder'), 'rope');
      F.cone(0, 0.45, 0, 0.08, 0.12, 0, F.shade(lin, -0.04), 'cloth');
    }
  }
});

FURN({
  key: 'generic_storage_jar', name: 'Storage Jar', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'yard', 'market', 'hall'], anchor: 'floor', clearance: {},
  materials: ['stone', 'metal', 'cloth', 'timber'],
  w: 0.61, d: 0.61, h: 0.88, variants: 3, variantNames: ['amphora on a ring', 'lidded pithos', 'covered water jar'],
  variantDims: [{ w: 0.39, d: 0.4, h: 0.73 }, { w: 0.61, d: 0.61, h: 0.88 }, { w: 0.5, d: 0.5, h: 0.63 }],
  build: function (F) {
    const clay = F.col('stoneClay'), dark = F.col('stoneClayDark');
    if (F.variant === 0) {
      F.cyl(0, 0, 0, 0.11, 0.04, 0, F.col('iron'), 'metal');
      F.frustum(0, 0.03, 0, 0.07, 0.2, 0.31, 0, clay, 'stone', 14);
      F.frustum(0, 0.34, 0, 0.2, 0.075, 0.22, 0, F.shade(clay, 0.05), 'stone', 14);
      F.cyl(0, 0.56, 0, 0.07, 0.14, 0, clay, 'stone');
      F.cyl(0, 0.7, 0, 0.085, 0.03, 0, dark, 'stone');
      for (const s of [-1, 1]) {
        F.rod(s * 0.07, 0.66, 0, s * 0.165, 0.6, 0, 0.014, dark, 'stone');
        F.rod(s * 0.165, 0.6, 0, s * 0.16, 0.44, 0, 0.014, dark, 'stone');
      }
    } else if (F.variant === 1) {
      F.frustum(0, 0, 0, 0.16, 0.3, 0.45, 0, clay, 'stone', 18);
      F.frustum(0, 0.45, 0, 0.3, 0.18, 0.3, 0, F.shade(clay, 0.05), 'stone', 18);
      F.cyl(0, 0.44, 0, 0.303, 0.03, 0, dark, 'stone');
      F.cyl(0, 0.75, 0, 0.2, 0.05, 0, dark, 'stone');
      F.cyl(0, 0.8, 0, 0.21, 0.03, 0, F.col('timberOak'), 'wood');
      F.ball(0, 0.85, 0, 0.03, F.col('timberDark'), 'wood');
    } else {
      F.frustum(0, 0, 0, 0.14, 0.25, 0.35, 0, F.col('stoneBuff'), 'stone', 16);
      F.frustum(0, 0.35, 0, 0.25, 0.15, 0.2, 0, F.shade(F.col('stoneBuff'), 0.04), 'stone', 16);
      F.cyl(0, 0.55, 0, 0.15, 0.04, 0, F.col('stoneGlazeBlue'), 'stone');
      F.dome(0, 0.59, 0, 0.17, 0.04, 0, F.col('clothLinen'), 'cloth');
      F.cyl(0, 0.57, 0, 0.155, 0.02, 0, F.col('clothMadder'), 'cloth');
    }
  }
});

FURN({
  key: 'generic_crock', name: 'Crock', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['kitchen', 'store', 'tavern'], anchor: 'surface', clearance: {},
  materials: ['stone', 'glass', 'metal', 'food'],
  w: 0.3, d: 0.24, h: 0.24, variants: 3, variantNames: ['lidded crock', 'pickling jar', 'bean pot'],
  variantDims: [{ w: 0.24, d: 0.24, h: 0.24 }, { w: 0.2, d: 0.2, h: 0.23 }, { w: 0.3, d: 0.23, h: 0.23 }],
  build: function (F) {
    if (F.variant === 0) {
      const buff = F.col('stoneBuff');
      KGEN.jar(F, 0, 0, 0, 0.11, 0.2, buff, F.shade(buff, -0.08), 'stone');
      F.cyl(0, 0.13, 0, 0.112, 0.03, 0, F.col('stoneGlazeBlue'), 'stone');
    } else if (F.variant === 1) {
      KGEN.jar(F, 0, 0, 0, 0.09, 0.19, F.col('glassClear'), F.col('tin'), 'glass', F.col('vegLeaf'));
      for (let i = 0; i < 5; i++) F.ball(Math.cos(i * 1.3) * 0.04, 0.03 + i * 0.03, Math.sin(i * 1.3) * 0.04, 0.025, F.col(i % 2 ? 'vegCarrot' : 'vegCabbage'), 'food');
    } else {
      const c = F.col('stoneClayDark');
      F.blob(0, 0.09, 0, 0.12, 0.18, 0, c, 'stone');
      F.cyl(0, 0.16, 0, 0.08, 0.03, 0, F.shade(c, 0.08), 'stone');
      F.ball(0, 0.2, 0, 0.025, F.shade(c, -0.1), 'stone');
      for (const s of [-1, 1]) F.box(s * 0.13, 0.1, 0, 0.04, 0.03, 0.05, 0, c, 'stone');
    }
  }
});

FURN({
  key: 'generic_canister_set', name: 'Canister Set', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['kitchen', 'store'], anchor: 'surface', clearance: {},
  materials: ['metal', 'stone', 'cloth'],
  w: 0.45, d: 0.17, h: 0.28, variants: 2, variantNames: ['tin', 'glazed'],
  build: function (F) {
    const tin = F.variant === 0;
    const body = F.col(tin ? 'tin' : 'stoneCream'), lid = F.col(tin ? 'pewter' : 'stoneGlazeBlue'), fam = tin ? 'metal' : 'stone';
    const rs = [0.06, 0.07, 0.08], hs = [0.16, 0.2, 0.24], xs = [-0.16, -0.02, 0.14];
    for (let i = 0; i < 3; i++) {
      F.cyl(xs[i], 0, 0, rs[i], hs[i], 0, body, fam);
      F.cyl(xs[i], hs[i], 0, rs[i] + 0.004, 0.02, 0, lid, fam);
      F.ball(xs[i], hs[i] + 0.02, 0, 0.02, lid, fam);
      F.box(xs[i], hs[i] * 0.35, rs[i] - 0.006, rs[i] * 1.1, hs[i] * 0.3, 0.02, 0, F.col(tin ? 'paperCream' : 'stoneGlazeBlue'), tin ? 'cloth' : 'stone');
    }
  }
});

FURN({
  key: 'generic_spice_box', name: 'Spice Box', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['kitchen', 'store'], anchor: 'surface', clearance: {},
  materials: ['timber', 'stone', 'food'],
  w: 0.37, d: 0.2, h: 0.09, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnut');
    F.box(0, 0, 0, 0.36, 0.015, 0.2, 0, wood, 'wood');
    for (const s of [-1, 1]) { F.box(0, 0, s * 0.09, 0.36, 0.06, 0.02, 0, wood, 'wood'); F.box(s * 0.17, 0, 0, 0.02, 0.06, 0.2, 0, wood, 'wood'); }
    const sp = ['spiceRed', 'spiceTurmeric', 'spiceBlack', 'saltWhite', 'vegHerb', 'herbDry', 'nutBrown', 'spiceRed'];
    for (let i = 0; i < 8; i++) {
      const x = -0.12 + (i % 4) * 0.08, z = i < 4 ? -0.04 : 0.04;
      F.cyl(x, 0.015, z, 0.03, 0.07, 0, F.col('stoneCream'), 'stone');
      F.cyl(x, 0.07, z, 0.026, 0.02, 0, F.col(sp[i]), 'food');
    }
  }
});

FURN({
  key: 'generic_bottle_crate', name: 'Bottle Crate', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['tavern', 'store', 'kitchen', 'dock', 'market'], anchor: 'floor', clearance: {},
  materials: ['timber', 'glass', 'stone', 'food'],
  w: 0.5, d: 0.36, h: 0.36, variants: 2, variantNames: ['wine', 'stoneware ale'],
  variantDims: [{ w: 0.5, d: 0.36, h: 0.36 }, { w: 0.5, d: 0.36, h: 0.32 }],
  build: function (F) {
    KGEN.crate(F, 0, 0, 0, 0.5, 0.22, 0.36, F.col('timberPine'), false);
    for (let i = 0; i < 6; i++) {
      const x = -0.15 + (i % 3) * 0.15, z = i < 3 ? -0.08 : 0.08;
      if (F.variant === 0) KGEN.bottle(F, x, 0.02, z, 0.038, 0.34, F.col(i % 2 ? 'glassGreen' : 'glassAmber'), F.col('timberBirch'), F.col('drinkWine'));
      else KGEN.bottle(F, x, 0.02, z, 0.04, 0.3, F.col('stoneBuff'), F.col('timberBirch'), null, 'stone');
    }
  }
});

FURN({
  key: 'generic_pantry_boxes', name: 'Pantry Boxes', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['kitchen', 'store', 'bedroom'], anchor: 'surface', clearance: {},
  materials: ['timber', 'thatch', 'rope'],
  w: 0.39, d: 0.29, h: 0.31, variants: 2, variantNames: ['wooden', 'woven'],
  build: function (F) {
    const fam = F.variant ? 'thatch' : 'wood';
    const cs = F.variant ? ['wickerStraw', 'wickerTan', 'wickerStraw'] : ['timberPine', 'timberOak', 'timberBirch'];
    const dims = [[0.38, 0.12, 0.28, 0], [0.32, 0.1, 0.24, 0.02], [0.22, 0.08, 0.18, -0.04]];
    let y = 0;
    dims.forEach(([w, h, d, x], i) => {
      const c = F.col(cs[i]);
      F.box(x, y, 0, w, h - 0.02, d, 0, c, fam);
      F.box(x, y + h - 0.025, 0, w + 0.005, 0.025, d + 0.005, 0, F.shade(c, 0.08), fam);
      y += h;
    });
    F.box(-0.04, 0.2, 0, 0.02, 0.105, 0.185, 0, F.col('clothMadder'), 'rope');
  }
});

FURN({
  key: 'generic_meal_ark', name: 'Meal Ark', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['kitchen', 'store'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'metal'],
  w: 0.81, d: 0.5, h: 0.72, variants: 1,
  build: function (F) {
    const pine = F.col('timberPine'), dark = F.col('timberDark');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.37, 0, sz * 0.22, 0.06, 0.08, 0.06, 0, dark, 'wood');
    F.box(0, 0.08, 0, 0.78, 0.56, 0.48, 0, pine, 'wood');
    for (const x of [-0.26, 0, 0.26]) F.box(x, 0.1, 0.24, 0.02, 0.52, 0.02, 0, F.shade(pine, -0.12), 'wood');
    F.box(0, 0.64, 0, 0.8, 0.04, 0.5, 0, F.shade(pine, 0.06), 'wood');
    for (const x of [-0.25, 0.25]) F.box(x, 0.64, -0.24, 0.08, 0.05, 0.02, 0, F.col('iron'), 'metal');
    F.box(0, 0.68, 0.05, 0.16, 0.04, 0.1, 0, F.col('tin'), 'metal');          /* the scoop on the lid */
  }
});

FURN({
  key: 'generic_churn', name: 'Churn', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['kitchen', 'store', 'yard'], anchor: 'floor', clearance: {},
  materials: ['metal', 'timber'],
  w: 0.4, d: 0.34, h: 0.83, variants: 2, variantNames: ['milk churn', 'butter churn'],
  variantDims: [{ w: 0.4, d: 0.34, h: 0.66 }, { w: 0.31, d: 0.31, h: 0.83 }],
  build: function (F) {
    if (F.variant === 0) {
      const tin = F.col('tin');
      F.cyl(0, 0, 0, 0.16, 0.45, 0, tin, 'metal');
      F.frustum(0, 0.45, 0, 0.16, 0.08, 0.12, 0, tin, 'metal', 16);
      F.cyl(0, 0.57, 0, 0.08, 0.06, 0, tin, 'metal');
      F.cyl(0, 0.63, 0, 0.095, 0.03, 0, F.shade(tin, -0.15), 'metal');
      for (const s of [-1, 1]) F.box(s * 0.18, 0.4, 0, 0.04, 0.08, 0.03, 0, F.shade(tin, -0.2), 'metal');
      F.cyl(0, 0.05, 0, 0.165, 0.03, 0, F.shade(tin, -0.2), 'metal');
    } else {
      const oak = F.col('timberOak');
      F.frustum(0, 0, 0, 0.15, 0.11, 0.55, 0, oak, 'wood', 16);
      for (const y of [0.06, 0.45]) F.cyl(0, y, 0, 0.15 - y * 0.073 + 0.008, 0.03, 0, F.col('iron'), 'metal');
      F.cyl(0, 0.55, 0, 0.12, 0.03, 0, F.shade(oak, 0.08), 'wood');
      F.cyl(0, 0.58, 0, 0.015, 0.25, 0, F.col('timberPine'), 'wood');        /* the dasher */
      F.box(0, 0.8, 0, 0.12, 0.03, 0.03, 0, F.col('timberPine'), 'wood');
    }
  }
});

FURN({
  key: 'generic_pantry_shelf', name: 'Pantry Shelf', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'shelf', setting: 'indoor',
  rooms: ['kitchen', 'store', 'tavern'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'glass', 'stone', 'metal', 'cloth', 'thatch', 'food'],
  w: 1.21, d: 0.4, h: 1.8, variants: 2, variantNames: ['empty', 'stocked'],
  build: function (F) {
    const pine = F.col('timberPine'), dark = F.shade(pine, -0.15);
    F.box(0, 0, -0.19, 1.2, 1.8, 0.02, 0, dark, 'wood');
    for (const s of [-1, 1]) F.box(s * 0.58, 0, 0, 0.04, 1.8, 0.4, 0, pine, 'wood');
    const ys = [0.08, 0.52, 0.96, 1.4, 1.76];
    for (const y of ys) F.box(0, y, 0, 1.12, 0.04, 0.38, 0, F.shade(pine, F.rr(-0.04, 0.04)), 'wood');
    F.box(0, 0, 0.18, 1.12, 0.08, 0.02, 0, dark, 'wood');
    if (F.variant !== 1) return;
    /* the boards hold what the surface pieces hold: jars, bottles, a crock, sacks, a basket */
    let y = 0.12;
    KGEN.jar(F, -0.42, y, 0, 0.07, 0.18, F.col('stoneBuff'), F.col('stoneClayDark'), 'stone');
    KGEN.jar(F, -0.26, y, 0, 0.07, 0.22, F.col('stoneCream'), F.col('stoneGlazeBlue'), 'stone');
    F.blob(0.05, y + 0.15, 0, 0.16, 0.3, 0, F.col('clothHessian'), 'cloth');
    F.blob(0.32, y + 0.13, 0.02, 0.14, 0.26, 0, F.col('clothLinen'), 'cloth');
    y = 0.56;
    for (let i = 0; i < 5; i++) KGEN.bottle(F, -0.46 + i * 0.09, y, -0.02, 0.035, 0.3, F.col(i % 2 ? 'glassGreen' : 'glassAmber'), F.col('timberBirch'), F.col(i % 2 ? 'drinkWine' : 'drinkOil'));
    KGEN.jar(F, 0.15, y, 0, 0.09, 0.2, F.col('stoneClay'), F.col('stoneClayDark'), 'stone');
    F.frustum(0.38, y, 0, 0.11, 0.15, 0.14, 0, F.col('wickerStraw'), 'thatch', 14);
    KGEN.heap(F, 0.38, y + 0.12, 0, 0.13, 0.035, F.cols(['vegOnion', 'vegPotato']), 'food');
    y = 1.0;
    for (let i = 0; i < 4; i++) KGEN.clothJar(F, -0.42 + i * 0.12, y, 0, 0.05, 0.12, F.col('glassClear'), F.col(['honeyAmber', 'jamRuby', 'jamRuby', 'honeyAmber'][i]), F.col('clothLinen'), F.col('clothMadder'));
    F.cyl(0.18, y, 0, 0.16, 0.1, 0, F.col('cheeseRind'), 'food');
    F.cyl(0.42, y, -0.02, 0.07, 0.24, 0, F.col('tin'), 'metal');
    y = 1.44;
    for (let i = 0; i < 6; i++) KGEN.jar(F, -0.44 + i * 0.1, y, 0, 0.04, 0.14, F.col('glassClear'), F.col('pewter'), 'glass', F.col(['vegBean', 'grainStraw', 'flourWhite', 'nutBrown', 'spiceRed', 'vegBean'][i]));
    F.box(0.35, y, 0, 0.32, 0.22, 0.26, 0, F.col('wickerTan'), 'thatch');
  }
});

/* ================= Food (21 pieces) ================= */

FURN({
  key: 'generic_bread', name: 'Bread', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'tavern', 'hall', 'store', 'market'], anchor: 'surface', clearance: {},
  materials: ['food', 'timber', 'metal'],
  w: 0.56, d: 0.22, h: 0.15, variants: 4, variantNames: ['loaf', 'round boule', 'baguettes', 'sliced on a board'],
  variantDims: [{ w: 0.32, d: 0.12, h: 0.13 }, { w: 0.22, d: 0.22, h: 0.11 }, { w: 0.56, d: 0.17, h: 0.06 }, { w: 0.4, d: 0.22, h: 0.15 }],
  build: function (F) {
    const crust = F.col('breadCrust'), crumb = F.col('breadCrumb');
    if (F.variant === 0) {
      KGEN.capsule(F, -0.1, 0.1, 0, 0, 0.06, crust);
      for (const x of [-0.07, 0, 0.07]) F.box(x, 0.11, 0, 0.02, 0.02, 0.07, 0.5, F.shade(crust, 0.3), 'food');
    } else if (F.variant === 1) {
      F.dome(0, 0, 0, 0.11, 0.1, 0, crust, 'food');
      F.dome(0, 0.06, 0, 0.06, 0.045, 0, F.col('flourWhite'), 'food');
    } else if (F.variant === 2) {
      [-0.05, 0, 0.05].forEach((z, i) => KGEN.capsule(F, -0.25, 0.25, 0, z + (i - 1) * 0.005, 0.03, F.shade(crust, i * 0.06 - 0.06)));
    }
    if (F.variant === 3) {
      F.box(0, 0, 0, 0.4, 0.03, 0.22, 0, F.col('timberPine'), 'wood');
      KGEN.capsule(F, -0.12, 0.03, 0.03, -0.02, 0.06, crust);
      for (const x of [0.1, 0.13, 0.16]) F.box(x, 0.03, -0.02, 0.02, 0.1, 0.1, 0, crumb, 'food');
      F.box(0.02, 0.03, 0.08, 0.2, 0.02, 0.02, 0, F.col('pewter'), 'metal');
    }
  }
});

FURN({
  key: 'generic_bread_basket', name: 'Bread Basket', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'tavern', 'hall', 'market'], anchor: 'surface', clearance: {},
  materials: ['thatch', 'cloth', 'food'],
  w: 0.34, d: 0.34, h: 0.25, variants: 2, variantNames: ['rolls', 'flatbreads'],
  variantDims: [{ w: 0.34, d: 0.34, h: 0.25 }, { w: 0.34, d: 0.34, h: 0.2 }],
  build: function (F) {
    F.frustum(0, 0, 0, 0.13, 0.17, 0.1, 0, F.col('wickerStraw'), 'thatch', 14);
    F.cyl(0, 0.085, 0, 0.17, 0.02, 0, F.col('clothLinen'), 'cloth');
    const crust = F.col('breadCrust');
    if (F.variant === 0) KGEN.heap(F, 0, 0.1, 0, 0.15, 0.04, [crust, F.shade(crust, 0.1), F.col('breadDark')], 'food',
      (x, y, z, c) => F.blob(x, y + 0.03, z, 0.045, 0.06, 0, c, 'food'));
    else for (let i = 0; i < 6; i++) F.cyl(Math.cos(i) * 0.012, 0.1 + i * 0.016, Math.sin(i) * 0.012, 0.135, 0.02, 0, F.shade(crust, 0.15 - i * 0.03), 'food');
  }
});

FURN({
  key: 'generic_cheese', name: 'Cheese', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'tavern', 'hall', 'store', 'market'], anchor: 'surface', clearance: {},
  materials: ['food', 'timber', 'metal', 'cloth'],
  w: 0.4, d: 0.34, h: 0.14, variants: 4, variantNames: ['wheel', 'wedge on a board', 'waxed truckles', 'cheese board'],
  variantDims: [{ w: 0.34, d: 0.34, h: 0.11 }, { w: 0.31, d: 0.31, h: 0.1 }, { w: 0.26, d: 0.13, h: 0.14 }, { w: 0.4, d: 0.26, h: 0.09 }],
  build: function (F) {
    const yel = F.col('cheeseYellow'), rind = F.col('cheeseRind');
    if (F.variant === 0) {
      F.cyl(0, 0, 0, 0.17, 0.1, 0, rind, 'food');
      F.cyl(0, 0.09, 0, 0.06, 0.02, 0, F.col('paperCream'), 'cloth');
    } else if (F.variant === 1) {
      F.cyl(0, 0, 0, 0.15, 0.025, 0, F.col('timberOak'), 'wood');
      F.frustum(-0.02, 0.025, 0, 0.1, 0.1, 0.07, 0.3, yel, 'food', 3);
      F.box(0.06, 0.025, 0.07, 0.14, 0.02, 0.02, 0.4, F.col('pewter'), 'metal');
    } else if (F.variant === 2) {
      for (const [x, y] of [[-0.065, 0], [0.065, 0], [0, 0.07]]) F.cyl(x, y, 0, 0.062, 0.07, 0, F.col(y ? 'waxRed' : 'cheesePale'), 'food');
    } else {
      F.box(0, 0, 0, 0.4, 0.025, 0.26, 0, F.col('timberPine'), 'wood');
      F.frustum(-0.1, 0.025, 0, 0.08, 0.08, 0.06, 0.6, yel, 'food', 3);
      F.cyl(0.05, 0.025, -0.05, 0.05, 0.05, 0, F.col('cheeseBlue'), 'food');
      F.cyl(0.05, 0.025, 0.06, 0.045, 0.04, 0, F.col('cheesePale'), 'food');
      for (let i = 0; i < 6; i++) F.ball(0.14 + (i % 2) * 0.03, 0.045 + Math.floor(i / 2) * 0.012, -0.03 + Math.floor(i / 2) * 0.035, 0.02, F.col('fruitGrape'), 'food');
    }
  }
});

FURN({
  key: 'generic_cured_meat', name: 'Cured Meat', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'tavern', 'store', 'market'], anchor: 'surface', clearance: {},
  materials: ['food', 'timber', 'stone', 'rope'],
  w: 0.38, d: 0.31, h: 0.18, variants: 3, variantNames: ['ham on a board', 'salami pair', 'sausage coil'],
  variantDims: [{ w: 0.37, d: 0.24, h: 0.18 }, { w: 0.38, d: 0.2, h: 0.09 }, { w: 0.31, d: 0.31, h: 0.07 }],
  build: function (F) {
    const cured = F.col('meatCured');
    if (F.variant === 0) {
      F.box(0, 0, 0, 0.36, 0.03, 0.24, 0, F.col('timberOak'), 'wood');
      F.blob(-0.03, 0.105, 0, 0.12, 0.15, 0, cured, 'food');
      F.blob(-0.07, 0.14, 0.02, 0.06, 0.06, 0, F.col('meatFat'), 'food');
      F.rod(0.07, 0.1, 0, 0.15, 0.11, 0, 0.022, F.col('meatFat'), 'food');
      F.ball(0.16, 0.11, 0, 0.025, F.col('stoneCream'), 'stone');
    } else if (F.variant === 1) {
      F.box(0, 0, 0, 0.36, 0.02, 0.2, 0, F.col('timberPine'), 'wood');
      KGEN.capsule(F, -0.12, 0.1, 0.02, -0.05, 0.035, cured);
      KGEN.capsule(F, -0.1, 0.12, 0.02, 0.04, 0.03, F.shade(cured, 0.1));
      for (let i = 0; i < 3; i++) F.cyl(0.13 + i * 0.012, 0.02 + i * 0.006, 0.05 - i * 0.03, 0.033, 0.02, 0, F.col('meatRed'), 'food');
      F.cyl(-0.155, 0.04, -0.05, 0.012, 0.02, 0, F.col('wickerStraw'), 'rope');
    } else {
      KGEN.plate(F, 0, 0, 0, 0.15, F.col('stoneCream'));
      let px = 0.11, pz = 0, a = 0;
      for (let i = 1; i <= 14; i++) {
        a = i * 0.62; const r = 0.11 - i * 0.0055, nx = Math.cos(a) * r, nz = Math.sin(a) * r;
        F.rod(px, 0.045, pz, nx, 0.045, nz, 0.022, F.col('meatSausage'), 'food');
        F.ball(nx, 0.045, nz, 0.022, F.col('meatSausage'), 'food');
        px = nx; pz = nz;
      }
    }
  }
});

FURN({
  key: 'generic_roast', name: 'Roast on a Platter', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['hall', 'tavern', 'kitchen', 'court'], anchor: 'surface', clearance: {},
  materials: ['food', 'stone', 'metal'],
  w: 0.4, d: 0.4, h: 0.16, variants: 2, variantNames: ['roast fowl', 'roast joint'],
  build: function (F) {
    const roast = F.col('meatRoast'), leaf = F.col('vegLeaf');
    KGEN.plate(F, 0, 0, 0, 0.2, F.col('stoneCream'));
    F.cyl(0, 0.02, 0, 0.17, 0.02, 0, F.shade(F.col('stoneCream'), -0.06), 'stone');
    if (F.variant === 0) {
      F.blob(0, 0.09, -0.01, 0.11, 0.13, 0, roast, 'food');
      F.blob(0, 0.11, 0.04, 0.07, 0.08, 0, F.shade(roast, 0.12), 'food');
      for (const s of [-1, 1]) {
        F.rod(s * 0.07, 0.06, 0.05, s * 0.11, 0.05, 0.13, 0.026, F.shade(roast, -0.06), 'food');
        F.ball(s * 0.115, 0.05, 0.145, 0.02, F.col('meatFat'), 'food');
      }
    } else {
      F.rod(-0.09, 0.09, 0, 0.07, 0.09, 0, 0.065, roast, 'food');
      F.ball(-0.09, 0.09, 0, 0.065, F.shade(roast, -0.06), 'food');
      F.cyl(0.07, 0.04, 0, 0.06, 0.02, 0, F.col('meatRed'), 'food');
      F.rod(0.1, 0.09, 0, 0.17, 0.1, 0, 0.018, F.col('meatFat'), 'food');
      F.box(-0.02, 0.03, 0.12, 0.22, 0.02, 0.02, 0.15, F.col('pewter'), 'metal');
    }
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3; F.blob(Math.cos(a) * 0.155, 0.045, Math.sin(a) * 0.155, 0.03, 0.02, 0, leaf, 'food'); }
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.8; F.ball(Math.cos(a) * 0.14, 0.06, Math.sin(a) * 0.14, 0.02, F.col('vegPotato'), 'food'); }
  }
});

FURN({
  key: 'generic_fish', name: 'Fish', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'market', 'dock', 'tavern'], anchor: 'surface', clearance: {},
  materials: ['food', 'timber', 'stone', 'cloth'],
  w: 0.4, d: 0.38, h: 0.07, variants: 3, variantNames: ['pair on a board', 'platter with lemon', 'smoked on paper'],
  variantDims: [{ w: 0.4, d: 0.2, h: 0.07 }, { w: 0.38, d: 0.38, h: 0.07 }, { w: 0.38, d: 0.26, h: 0.06 }],
  build: function (F) {
    const back = F.col('fishBack'), belly = F.col('fishSilver');
    if (F.variant === 0) {
      F.box(0, 0, 0, 0.4, 0.025, 0.2, 0, F.col('timberPine'), 'wood');
      KGEN.fish(F, 0, 0.025, -0.045, 0.3, back, belly, 1);
      KGEN.fish(F, 0.01, 0.025, 0.05, 0.28, F.shade(back, 0.1), belly, -1);
    } else if (F.variant === 1) {
      KGEN.plate(F, 0, 0, 0, 0.19, F.col('stoneGlazeBlue'));
      KGEN.fish(F, 0, 0.02, -0.02, 0.33, back, belly, 1);
      for (const x of [-0.07, 0.07]) F.dome(x, 0.02, 0.1, 0.035, 0.03, 0, F.col('fruitLemon'), 'food');
      for (let i = 0; i < 4; i++) F.blob(-0.1 + i * 0.06, 0.03, -0.12, 0.025, 0.02, 0, F.col('vegHerb'), 'food');
    } else {
      F.box(0, 0, 0, 0.36, 0.02, 0.24, 0.05, F.col('paperCream'), 'cloth');
      for (const z of [-0.06, 0, 0.06]) KGEN.fish(F, z * 0.3, 0.02, z, 0.24, F.col('fishSmoked'), F.shade(F.col('fishSmoked'), 0.2), z > 0 ? 1 : -1);
    }
  }
});

FURN({
  key: 'generic_fruit_bowl', name: 'Fruit Bowl', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['hall', 'kitchen', 'court', 'study', 'bedroom', 'tavern'], anchor: 'surface', clearance: {},
  materials: ['stone', 'timber', 'food'],
  w: 0.31, d: 0.31, h: 0.23, variants: 4, variantNames: ['apples', 'pears and plums', 'citrus', 'grapes'],
  variantDims: [{ w: 0.31, d: 0.31, h: 0.23 }, { w: 0.31, d: 0.31, h: 0.23 }, { w: 0.31, d: 0.31, h: 0.23 }, { w: 0.31, d: 0.31, h: 0.15 }],
  build: function (F) {
    const wood = F.variant % 2 === 1;
    KGEN.bowl(F, 0, 0, 0, 0.15, 0.08, F.col(wood ? 'timberOak' : 'stoneGlazeBlue'), wood ? 'wood' : 'stone');
    const stalk = F.col('timberWalnut');
    if (F.variant === 0) KGEN.heap(F, 0, 0.065, 0, 0.13, 0.035, F.cols(['fruitApple', 'fruitAppleGreen', 'fruitApple']), 'food',
      (x, y, z, c) => KGEN.fruit(F, x, y, z, 0.035, c, stalk));
    else if (F.variant === 1) KGEN.heap(F, 0, 0.065, 0, 0.13, 0.035, F.cols(['fruitPear', 'fruitPlum']), 'food',
      (x, y, z, c) => { if (c === F.col('fruitPear')) { F.blob(x, y + 0.03, z, 0.033, 0.06, 0, c, 'food'); F.ball(x, y + 0.06, z, 0.022, c, 'food'); } else F.ball(x, y + 0.03, z, 0.03, c, 'food'); });
    else if (F.variant === 2) KGEN.heap(F, 0, 0.065, 0, 0.13, 0.038, F.cols(['fruitOrange', 'fruitLemon', 'fruitOrange']), 'food');
    else {
      F.cyl(0, 0.06, 0, 0.13, 0.02, 0, F.col('vegLeaf'), 'food');
      for (const [cx, cz, a] of [[-0.04, -0.02, 0], [0.05, 0.03, 2.4]]) {
        const rows = [4, 3, 3, 2, 1];
        rows.forEach((n, j) => { for (let k = 0; k < n; k++) {
          const u = (k - (n - 1) / 2) * 0.034, v = -0.05 + j * 0.026;
          F.ball(cx + Math.cos(a) * v - Math.sin(a) * u, 0.1 + (j < 3 ? 0.012 : 0), cz + Math.sin(a) * v + Math.cos(a) * u, 0.02, F.shade('fruitGrape', F.rr(-0.06, 0.08)), 'food');
        } });
        F.ball(cx + Math.cos(a) * 0.012, 0.13, cz + Math.sin(a) * 0.012, 0.02, F.shade('fruitGrape', 0.05), 'food');
      }
    }
  }
});

FURN({
  key: 'generic_veg_basket', name: 'Vegetable Basket', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'market', 'store', 'garden'], anchor: 'surface', clearance: {},
  materials: ['thatch', 'food'],
  w: 0.35, d: 0.35, h: 0.31, variants: 4, variantNames: ['carrots', 'onions and garlic', 'potatoes', 'greens'],
  variantDims: [{ w: 0.35, d: 0.35, h: 0.24 }, { w: 0.35, d: 0.35, h: 0.31 }, { w: 0.35, d: 0.35, h: 0.27 }, { w: 0.35, d: 0.35, h: 0.26 }],
  build: function (F) {
    F.frustum(0, 0, 0, 0.13, 0.17, 0.14, 0, F.col('wickerTan'), 'thatch', 14);
    F.cyl(0, 0.13, 0, 0.175, 0.02, 0, F.col('wickerDark'), 'thatch');
    if (F.variant === 0) {
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4, r = i ? 0.05 + (i % 3) * 0.03 : 0, x = Math.cos(a) * r, z = Math.sin(a) * r;
        F.cone(x, 0.09, z, 0.022, 0.08, 0, F.col('vegCarrot'), 'food');
        F.blob(x, 0.2, z, 0.035, 0.08, 0, F.shade('vegLeaf', F.rr(-0.1, 0.1)), 'food');
      }
    } else if (F.variant === 1) {
      KGEN.heap(F, 0, 0.13, 0, 0.16, 0.04, F.cols(['vegOnion', 'vegOnion', 'vegGarlic']), 'food',
        (x, y, z, c) => { F.ball(x, y + 0.035, z, 0.035, c, 'food'); F.cone(x, y + 0.065, z, 0.012, 0.025, 0, F.shade(c, -0.2), 'food'); });
    } else if (F.variant === 2) {
      KGEN.heap(F, 0, 0.13, 0, 0.16, 0.04, [F.col('vegPotato'), F.shade('vegPotato', -0.1), F.shade('vegPotato', 0.08)], 'food',
        (x, y, z, c) => F.blob(x, y + 0.025, z, 0.04, 0.05, F.rr(0, 3), c, 'food'));
    } else {
      for (const [x, z] of [[-0.06, -0.04], [0.06, 0.03], [-0.02, 0.07]]) {
        F.ball(x, 0.19, z, 0.07, F.col('vegCabbage'), 'food');
        F.dome(x, 0.14, z, 0.085, 0.06, 0, F.shade('vegCabbage', -0.15), 'food');
      }
    }
  }
});

FURN({
  key: 'generic_produce', name: 'Loose Produce', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'market', 'store', 'garden'], anchor: 'surface', clearance: {},
  materials: ['food', 'cloth', 'rope'],
  w: 0.44, d: 0.31, h: 0.24, variants: 4, variantNames: ['cabbages', 'pumpkin', 'onion braid', 'garlic heads'],
  variantDims: [{ w: 0.35, d: 0.18, h: 0.16 }, { w: 0.31, d: 0.31, h: 0.24 }, { w: 0.44, d: 0.13, h: 0.08 }, { w: 0.28, d: 0.23, h: 0.09 }],
  build: function (F) {
    if (F.variant === 0) {
      for (const x of [-0.085, 0.085]) {
        F.ball(x, 0.08, 0, 0.075, F.col('vegCabbage'), 'food');
        F.dome(x, 0, 0, 0.088, 0.09, 0, F.shade('vegCabbage', -0.15), 'food');
      }
    } else if (F.variant === 1) {
      const p = F.col('vegPumpkin');
      for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.blob(Math.cos(a) * 0.07, 0.1, Math.sin(a) * 0.07, 0.085, 0.2, 0, F.shade(p, i % 2 ? -0.06 : 0.04), 'food'); }
      F.blob(0, 0.1, 0, 0.12, 0.2, 0, p, 'food');
      F.cyl(0, 0.19, 0, 0.018, 0.05, 0, F.col('vegHerb'), 'food');
    } else if (F.variant === 2) {
      F.rod(-0.22, 0.04, 0, 0.22, 0.04, 0, 0.012, F.col('wickerStraw'), 'rope');
      for (let i = 0; i < 6; i++) F.ball(-0.18 + i * 0.072, 0.04, (i % 2 ? 0.025 : -0.025), 0.04, F.shade('vegOnion', F.rr(-0.08, 0.06)), 'food');
    } else {
      F.box(0, 0, 0, 0.26, 0.02, 0.2, 0.1, F.col('clothLinen'), 'cloth');
      for (const [x, z] of [[-0.07, -0.04], [0.02, -0.05], [0.08, 0.03], [-0.04, 0.05], [0.0, 0.0]]) {
        F.blob(x, 0.045, z, 0.035, 0.05, 0, F.col('vegGarlic'), 'food');
        F.cone(x, 0.065, z, 0.012, 0.015, 0, F.shade('vegGarlic', -0.2), 'food');
      }
    }
  }
});

FURN({
  key: 'generic_eggs', name: 'Eggs', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'market', 'store'], anchor: 'surface', clearance: {},
  materials: ['food', 'stone', 'timber', 'thatch'],
  w: 0.31, d: 0.26, h: 0.12, variants: 3, variantNames: ['bowl of eggs', 'egg tray', 'nest basket'],
  variantDims: [{ w: 0.24, d: 0.24, h: 0.11 }, { w: 0.31, d: 0.22, h: 0.08 }, { w: 0.26, d: 0.26, h: 0.12 }],
  build: function (F) {
    const egg = (x, y, z) => F.blob(x, y + 0.027, z, 0.022, 0.054, 0, F.pick(['eggShell', 'eggBrown', 'eggShell']), 'food');
    if (F.variant === 0) {
      KGEN.bowl(F, 0, 0, 0, 0.12, 0.07, F.col('stoneCream'), 'stone');
      egg(0, 0.055, 0); for (let i = 0; i < 6; i++) egg(Math.cos(i * 1.05) * 0.06, 0.055, Math.sin(i * 1.05) * 0.06);
    } else if (F.variant === 1) {
      const pine = F.col('timberPine');
      F.box(0, 0, 0, 0.3, 0.02, 0.22, 0, pine, 'wood');
      for (const s of [-1, 1]) { F.box(0, 0, s * 0.1, 0.3, 0.03, 0.02, 0, pine, 'wood'); F.box(s * 0.14, 0, 0, 0.02, 0.03, 0.22, 0, pine, 'wood'); }
      for (let i = 0; i < 12; i++) egg(-0.1 + (i % 4) * 0.066, 0.02, -0.06 + Math.floor(i / 4) * 0.06);
    } else {
      F.frustum(0, 0, 0, 0.1, 0.13, 0.07, 0, F.col('wickerTan'), 'thatch', 14);
      F.dome(0, 0.05, 0, 0.12, 0.03, 0, F.col('wickerStraw'), 'thatch');
      egg(0, 0.065, 0); for (let i = 0; i < 5; i++) egg(Math.cos(i * 1.26) * 0.055, 0.06, Math.sin(i * 1.26) * 0.055);
    }
  }
});

FURN({
  key: 'generic_pie', name: 'Pie', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'tavern', 'hall', 'market'], anchor: 'surface', clearance: {},
  materials: ['food', 'metal', 'stone'],
  w: 0.33, d: 0.3, h: 0.1, variants: 3, variantNames: ['whole pie', 'fruit tart', 'pasties'],
  variantDims: [{ w: 0.3, d: 0.3, h: 0.1 }, { w: 0.28, d: 0.28, h: 0.08 }, { w: 0.33, d: 0.24, h: 0.08 }],
  build: function (F) {
    const crust = F.col('pieCrust');
    if (F.variant === 0) {
      F.frustum(0, 0, 0, 0.12, 0.14, 0.04, 0, F.col('tin'), 'metal', 18);
      F.dome(0, 0.035, 0, 0.135, 0.055, 0, crust, 'food');
      for (let i = 0; i < 16; i++) { const a = i * F.TAU / 16; F.ball(Math.cos(a) * 0.13, 0.045, Math.sin(a) * 0.13, 0.02, F.shade(crust, 0.08), 'food'); }
      for (const a of [0, 2.1, 4.2]) F.box(Math.cos(a) * 0.03, 0.08, Math.sin(a) * 0.03, 0.03, 0.02, 0.02, a, F.col('breadDark'), 'food');
    } else if (F.variant === 1) {
      F.frustum(0, 0, 0, 0.125, 0.14, 0.035, 0, crust, 'food', 18);
      F.cyl(0, 0.02, 0, 0.125, 0.02, 0, F.col('jamRuby'), 'food');
      for (let i = 0; i < 12; i++) { const a = i * 2.4, r = 0.03 + (i % 4) * 0.025; F.ball(Math.cos(a) * r, 0.055, Math.sin(a) * r, 0.02, F.col('fruitBerry'), 'food'); }
    } else {
      KGEN.plate(F, 0, 0, 0, 0.12, F.col('stoneCream'));
      for (const [x, z] of [[-0.11, -0.05], [-0.04, 0.06], [0.04, -0.05], [0.11, 0.06]]) {
        F.blob(x, 0.045, z, 0.055, 0.05, 0, crust, 'food');
        F.beam(x - 0.05, 0.065, z, x + 0.05, 0.065, z, 0.02, 0.02, F.shade(crust, 0.1), 'food');
      }
    }
  }
});

FURN({
  key: 'generic_cake', name: 'Cake', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['kitchen', 'hall', 'court', 'tavern'], anchor: 'surface', clearance: {},
  materials: ['food', 'stone', 'cloth'],
  w: 0.32, d: 0.32, h: 0.3, variants: 3, variantNames: ['layer cake', 'cake on a stand', 'small cakes'],
  variantDims: [{ w: 0.32, d: 0.32, h: 0.17 }, { w: 0.31, d: 0.31, h: 0.3 }, { w: 0.31, d: 0.31, h: 0.08 }],
  build: function (F) {
    const sponge = F.col('breadCrumb'), cream = F.col('creamWhite');
    if (F.variant === 0) {
      KGEN.plate(F, 0, 0, 0, 0.16, F.col('stoneCream'));
      F.cyl(0, 0.02, 0, 0.12, 0.1, 0, sponge, 'food');
      F.cyl(0, 0.06, 0, 0.122, 0.02, 0, F.col('jamRuby'), 'food');
      F.cyl(0, 0.11, 0, 0.123, 0.02, 0, cream, 'food');
      for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.ball(Math.cos(a) * 0.09, 0.15, Math.sin(a) * 0.09, 0.02, F.col('fruitBerry'), 'food'); }
    } else if (F.variant === 1) {
      const st = F.col('stoneCream');
      F.cyl(0, 0, 0, 0.06, 0.02, 0, st, 'stone'); F.cyl(0, 0.02, 0, 0.02, 0.1, 0, st, 'stone');
      F.cyl(0, 0.12, 0, 0.15, 0.02, 0, st, 'stone');
      F.cyl(0, 0.14, 0, 0.11, 0.11, 0, F.col('icingPink'), 'food');
      F.cyl(0, 0.24, 0, 0.06, 0.04, 0, cream, 'food');
      F.ball(0, 0.28, 0, 0.02, F.col('fruitBerry'), 'food');
    } else {
      KGEN.plate(F, 0, 0, 0, 0.15, F.col('stoneCream'));
      for (let i = 0; i < 7; i++) {
        const a = i * F.TAU / 6, r = i === 6 ? 0 : 0.09, x = Math.cos(a) * r, z = Math.sin(a) * r;
        F.frustum(x, 0.02, z, 0.025, 0.032, 0.03, 0, F.col('paperCream'), 'cloth', 10);
        F.dome(x, 0.05, z, 0.032, 0.028, 0, F.pick(['creamWhite', 'icingPink', 'butterYellow']), 'food');
      }
    }
  }
});

FURN({
  key: 'generic_stew_pot', name: 'Stew Pot', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['kitchen', 'tavern', 'hall'], anchor: 'surface', clearance: {},
  materials: ['metal', 'food', 'timber'],
  w: 0.34, d: 0.29, h: 0.3, variants: 3, variantNames: ['stew with ladle', 'lidded pot', 'kettle'],
  variantDims: [{ w: 0.34, d: 0.28, h: 0.3 }, { w: 0.34, d: 0.29, h: 0.23 }, { w: 0.25, d: 0.2, h: 0.23 }],
  build: function (F) {
    if (F.variant === 2) F.shift(-0.0245, 0);
    const iron = F.col('iron');
    if (F.variant < 2) {
      for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.cyl(Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1, 0.012, 0.03, 0, iron, 'metal'); }
      F.cyl(0, 0.03, 0, 0.14, 0.14, 0, iron, 'metal');
      for (const s of [-1, 1]) F.box(s * 0.155, 0.13, 0, 0.03, 0.03, 0.06, 0, iron, 'metal');
    }
    if (F.variant === 0) {
      F.cyl(0, 0.155, 0, 0.13, 0.02, 0, F.col('stewBrown'), 'food');
      for (let i = 0; i < 5; i++) F.ball(Math.cos(i * 1.3) * 0.07, 0.175, Math.sin(i * 1.3) * 0.07, 0.02, F.col(i % 2 ? 'vegCarrot' : 'vegPotato'), 'food');
      F.rod(0.04, 0.12, 0, 0.12, 0.29, 0.06, 0.01, F.col('timberOak'), 'wood');
    } else if (F.variant === 1) {
      F.dome(0, 0.17, 0, 0.145, 0.035, 0, F.shade(iron, 0.1), 'metal');
      F.ball(0, 0.205, 0, 0.02, F.col('timberOak'), 'wood');
    } else {
      F.cyl(0, 0, 0, 0.08, 0.02, 0, iron, 'metal');
      F.blob(0, 0.08, 0, 0.1, 0.14, 0, iron, 'metal');
      F.cyl(0, 0.14, 0, 0.04, 0.02, 0, iron, 'metal'); F.ball(0, 0.165, 0, 0.02, iron, 'metal');
      F.rod(0.08, 0.06, 0, 0.14, 0.13, 0, 0.012, iron, 'metal');
      const h = [[-0.07, 0.12], [-0.05, 0.22], [0.05, 0.22], [0.07, 0.12]];
      for (let i = 0; i < 3; i++) F.rod(h[i][0], h[i][1], 0, h[i + 1][0], h[i + 1][1], 0, 0.01, F.col('brass'), 'metal');
    }
  }
});

FURN({
  key: 'generic_meal', name: 'Place Setting', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['hall', 'tavern', 'kitchen', 'court', 'barracks'], anchor: 'surface', clearance: {},
  materials: ['food', 'stone', 'metal', 'timber'],
  w: 0.43, d: 0.29, h: 0.08, variants: 4, variantNames: ['breakfast', 'dinner', 'soup and bread', 'porridge and tea'],
  variantDims: [{ w: 0.43, d: 0.29, h: 0.08 }, { w: 0.43, d: 0.29, h: 0.08 }, { w: 0.43, d: 0.24, h: 0.08 }, { w: 0.43, d: 0.24, h: 0.08 }],
  build: function (F) {
    if (F.variant >= 2) F.shift(0, -0.0275);
    const ware = F.col(F.variant % 2 ? 'stoneCream' : 'stoneBuff'), pew = F.col('pewter');
    F.box(-0.205, 0, 0.0, 0.02, 0.02, 0.18, 0, pew, 'metal');              /* fork and knife either side */
    F.box(0.085, 0, 0.06, 0.02, 0.02, 0.17, 0, pew, 'metal');
    KGEN.mug(F, 0.16, 0, -0.04, 0.035, 0.075, F.col(F.variant === 3 ? 'stoneGlazeBlue' : 'timberOak'), F.variant === 3 ? 'stone' : 'wood',
      F.col(F.variant === 3 ? 'drinkTea' : F.variant === 0 ? 'drinkMilk' : 'drinkAle'));
    if (F.variant === 0) {
      KGEN.plate(F, -0.06, 0, 0, 0.12, ware);
      for (const x of [-0.1, -0.03]) { F.cyl(x, 0.02, -0.03, 0.035, 0.02, 0, F.col('eggShell'), 'food'); F.dome(x, 0.03, -0.03, 0.02, 0.015, 0, F.col('eggYolk'), 'food'); }
      F.box(-0.04, 0.02, 0.05, 0.09, 0.02, 0.07, 0.2, F.col('breadCrumb'), 'food');
      KGEN.capsule(F, -0.13, -0.08, 0.02, 0.05, 0.015, F.col('meatSausage'));
    } else if (F.variant === 1) {
      KGEN.plate(F, -0.06, 0, 0, 0.12, ware);
      F.cyl(-0.06, 0.02, 0, 0.1, 0.02, 0, F.col('sauceRed'), 'food');
      F.box(-0.09, 0.025, 0.0, 0.08, 0.035, 0.06, 0.3, F.col('meatRoast'), 'food');
      F.dome(-0.01, 0.03, -0.03, 0.04, 0.04, 0, F.col('creamWhite'), 'food');
      for (let i = 0; i < 6; i++) F.ball(-0.04 + (i % 3) * 0.022, 0.045, 0.05 + Math.floor(i / 3) * 0.02, 0.02, F.col('vegLeaf'), 'food');
    } else {
      KGEN.bowl(F, -0.06, 0, 0, 0.09, 0.06, ware, 'stone', F.col(F.variant === 2 ? 'soupGold' : 'creamWhite'));
      if (F.variant === 3) F.cyl(-0.06, 0.044, 0, 0.03, 0.02, 0, F.col('honeyAmber'), 'food');
      F.box(-0.03, 0.05, 0.03, 0.02, 0.02, 0.14, -0.5, pew, 'metal');
      if (F.variant === 2) F.blob(0.04, 0.03, 0.08, 0.04, 0.06, 0, F.col('breadCrust'), 'food');
    }
  }
});

FURN({
  key: 'generic_preserves', name: 'Preserves', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['kitchen', 'store', 'market'], anchor: 'surface', clearance: {},
  materials: ['glass', 'food', 'cloth', 'metal', 'timber'],
  w: 0.43, d: 0.15, h: 0.21, variants: 3, variantNames: ['honey and jam', 'pickles', 'dried goods'],
  variantDims: [{ w: 0.32, d: 0.11, h: 0.13 }, { w: 0.31, d: 0.15, h: 0.21 }, { w: 0.43, d: 0.1, h: 0.17 }],
  build: function (F) {
    const glass = F.col('glassClear');
    if (F.variant === 0) {
      ['honeyAmber', 'jamRuby', 'fruitPlum'].forEach((k, i) => KGEN.clothJar(F, -0.105 + i * 0.105, 0, 0, 0.048, 0.1, glass, F.col(k), F.col(i === 1 ? 'clothMadder' : 'clothLinen'), F.col('wickerTan')));
    } else if (F.variant === 1) {
      for (const x of [-0.08, 0.08]) {
        KGEN.jar(F, x, 0, 0, 0.07, 0.17, glass, F.col('tin'), 'glass', F.shade('vegLeaf', 0.2));
        for (let i = 0; i < 4; i++) F.cyl(x + Math.cos(i * 1.6) * 0.03, 0.01, Math.sin(i * 1.6) * 0.03, 0.015, 0.14, 0, F.col('vegHerb'), 'food');
      }
    } else {
      ['vegBean', 'grainStraw', 'flourWhite', 'fruitBerry'].forEach((k, i) => KGEN.bottle(F, -0.165 + i * 0.11, 0, 0, 0.05, 0.16, glass, F.col('timberBirch'), F.col(k)));
    }
  }
});

FURN({
  key: 'generic_dairy', name: 'Butter and Milk', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['kitchen', 'store', 'hall'], anchor: 'surface', clearance: {},
  materials: ['food', 'stone', 'glass', 'timber'],
  w: 0.32, d: 0.16, h: 0.25, variants: 2, variantNames: ['butter and jug', 'milk bottles'],
  variantDims: [{ w: 0.32, d: 0.16, h: 0.19 }, { w: 0.31, d: 0.09, h: 0.25 }],
  build: function (F) {
    if (F.variant === 0) {
      const cr = F.col('stoneCream');
      KGEN.plate(F, -0.08, 0, 0, 0.08, cr);
      F.box(-0.08, 0.02, 0, 0.1, 0.05, 0.06, 0.2, F.col('butterYellow'), 'food');
      F.frustum(0.08, 0, 0, 0.06, 0.05, 0.1, 0, cr, 'stone', 14);
      F.frustum(0.08, 0.1, 0, 0.05, 0.065, 0.08, 0, cr, 'stone', 14);
      F.cyl(0.08, 0.165, 0, 0.055, 0.02, 0, F.col('drinkMilk'), 'food');
      F.cone(0.08, 0.16, 0.06, 0.02, 0.03, 0, cr, 'stone');
      F.box(0.15, 0.06, 0, 0.02, 0.1, 0.02, 0, cr, 'stone');
    } else {
      for (const x of [-0.11, 0, 0.11]) KGEN.bottle(F, x, 0, 0, 0.045, 0.24, F.col('glassClear'), F.col('paperCream'), F.col('drinkMilk'));
    }
  }
});

FURN({
  key: 'generic_snack_bowl', name: 'Bowl of Dry Goods', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'tavern', 'hall', 'market', 'store'], anchor: 'surface', clearance: {},
  materials: ['stone', 'timber', 'food'],
  w: 0.19, d: 0.19, h: 0.1, variants: 4, variantNames: ['nuts', 'grain', 'beans', 'olives'],
  build: function (F) {
    const k = ['nutBrown', 'grainStraw', 'vegBean', 'fruitPlum'][F.variant];
    const wood = F.variant % 2 === 0;
    KGEN.bowl(F, 0, 0, 0, 0.095, 0.06, F.col(wood ? 'timberOak' : 'stoneClay'), wood ? 'wood' : 'stone', F.col(k));
    F.dome(0, 0.055, 0, 0.08, 0.03, 0, F.shade(k, -0.08), 'food');
    for (let i = 0; i < 7; i++) { const a = i * 0.9, r = i ? 0.04 : 0; F.ball(Math.cos(a) * r, 0.08 - r * 0.25, Math.sin(a) * r, 0.02, F.shade(k, F.rr(-0.1, 0.1)), 'food'); }
  }
});

FURN({
  key: 'generic_pastries', name: 'Pastries', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'tavern', 'hall', 'market', 'court'], anchor: 'surface', clearance: {},
  materials: ['food', 'stone', 'glass'],
  w: 0.28, d: 0.28, h: 0.12, variants: 3, variantNames: ['buns', 'biscuits', 'sweets dish'],
  variantDims: [{ w: 0.28, d: 0.28, h: 0.11 }, { w: 0.28, d: 0.28, h: 0.12 }, { w: 0.26, d: 0.26, h: 0.12 }],
  build: function (F) {
    if (F.variant === 2) {
      F.frustum(0, 0, 0, 0.08, 0.13, 0.05, 0, F.col('glassClear'), 'glass', 16);
      KGEN.heap(F, 0, 0.03, 0, 0.11, 0.02, F.cols(['fruitBerry', 'icingPink', 'fruitLemon', 'stoneGlazeGreen', 'creamWhite']), 'food');
      return;
    }
    KGEN.plate(F, 0, 0, 0, 0.14, F.col('stoneCream'));
    const crust = F.col('breadCrust');
    if (F.variant === 0) {
      for (let i = 0; i < 6; i++) {
        const a = i * F.TAU / 5, r = i === 5 ? 0 : 0.085, x = Math.cos(a) * r, z = Math.sin(a) * r;
        F.blob(x, 0.05 + (i === 5 ? 0.02 : 0), z, 0.045, 0.06, 0, F.shade(crust, 0.1), 'food');
        F.dome(x, 0.065 + (i === 5 ? 0.02 : 0), z, 0.025, 0.02, 0, F.col('creamWhite'), 'food');
      }
    } else {
      for (const [x, z, n] of [[-0.06, -0.04, 5], [0.06, -0.03, 4], [0, 0.07, 3]])
        for (let j = 0; j < n; j++) F.cyl(x, 0.02 + j * 0.018, z, 0.038, 0.018, 0, F.shade('pieCrust', j % 2 ? 0.08 : 0), 'food');
    }
  }
});

FURN({
  key: 'generic_condiments', name: 'Cruet Tray', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['hall', 'tavern', 'kitchen', 'court'], anchor: 'surface', clearance: {},
  materials: ['metal', 'glass', 'stone', 'timber', 'food'],
  w: 0.22, d: 0.14, h: 0.18, variants: 3, variantNames: ['salt and pepper', 'oil and vinegar', 'mustard and sauce'],
  build: function (F) {
    F.box(0, 0, 0, 0.22, 0.02, 0.14, 0, F.col(F.variant === 1 ? 'pewter' : 'timberWalnut'), F.variant === 1 ? 'metal' : 'wood');
    if (F.variant === 0) {
      F.cyl(-0.05, 0.02, 0, 0.03, 0.08, 0, F.col('stoneCream'), 'stone'); F.dome(-0.05, 0.1, 0, 0.03, 0.02, 0, F.col('pewter'), 'metal');
      F.cyl(0.05, 0.02, 0, 0.028, 0.12, 0, F.col('timberOak'), 'wood'); F.ball(0.05, 0.15, 0, 0.022, F.col('timberDark'), 'wood');
      F.cyl(-0.05, 0.03, 0.04, 0.02, 0.02, 0, F.col('saltWhite'), 'food');
    } else if (F.variant === 1) {
      KGEN.bottle(F, -0.05, 0.02, 0, 0.035, 0.15, F.col('glassClear'), F.col('pewter'), F.col('drinkOil'));
      KGEN.bottle(F, 0.05, 0.02, 0, 0.035, 0.15, F.col('glassClear'), F.col('pewter'), F.col('drinkWine'));
    } else {
      KGEN.jar(F, -0.05, 0.02, 0, 0.035, 0.07, F.col('stoneGlazeOchre'), F.col('stoneCream'), 'stone');
      KGEN.bottle(F, 0.05, 0.02, 0, 0.035, 0.14, F.col('glassAmber'), F.col('waxRed'), F.col('sauceRed'));
    }
  }
});

FURN({
  key: 'generic_mushrooms', name: 'Mushrooms', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'market', 'store'], anchor: 'surface', clearance: {},
  materials: ['food', 'thatch', 'stone'],
  w: 0.28, d: 0.28, h: 0.15, variants: 2, variantNames: ['basket', 'plate'],
  variantDims: [{ w: 0.28, d: 0.28, h: 0.15 }, { w: 0.26, d: 0.26, h: 0.08 }],
  build: function (F) {
    const shroom = (x, y, z, s) => {
      F.cyl(x, y, z, 0.012 * s, 0.035 * s, 0, F.col('creamWhite'), 'food');
      F.dome(x, y + 0.03 * s, z, 0.032 * s, 0.025 * s, 0, F.shade('vegMushroom', F.rr(-0.15, 0.05)), 'food');
    };
    if (F.variant === 0) {
      F.frustum(0, 0, 0, 0.11, 0.14, 0.08, 0, F.col('wickerTan'), 'thatch', 14);
      F.cyl(0, 0.065, 0, 0.13, 0.02, 0, F.col('wickerDark'), 'thatch');
      for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 0.025 + (i % 3) * 0.03; shroom(Math.cos(a) * r, 0.085, Math.sin(a) * r, 1.1); }
    } else {
      KGEN.plate(F, 0, 0, 0, 0.13, F.col('stoneBuff'));
      for (let i = 0; i < 7; i++) { const a = i * 2.4, r = i ? 0.04 + (i % 2) * 0.04 : 0; shroom(Math.cos(a) * r, 0.02, Math.sin(a) * r, 1); }
    }
  }
});

FURN({
  key: 'generic_hanging_larder', name: 'Hanging Larder', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['kitchen', 'store', 'tavern'], anchor: 'ceiling', clearance: {},
  materials: ['timber', 'food', 'rope'],
  w: 0.93, d: 0.2, h: 0.8, variants: 1,
  build: function (F) {
    const rope = F.col('wickerTan');
    F.rod(-0.46, 0.74, 0, 0.46, 0.74, 0, 0.025, F.col('timberOak'), 'wood');
    for (const x of [-0.4, 0.4]) F.rod(x, 0.74, 0, x, 0.8, 0, 0.008, rope, 'rope');
    F.box(0, 0.78, 0, 0.9, 0.02, 0.04, 0, F.col('timberDark'), 'wood');
    /* a ham, two strings of sausage, herb bunches stems up, a garlic string */
    F.rod(-0.3, 0.74, 0, -0.3, 0.62, 0, 0.006, rope, 'rope');
    F.blob(-0.3, 0.48, 0, 0.1, 0.28, 0, F.col('meatCured'), 'food');
    for (const x of [-0.12, -0.06]) for (let i = 0; i < 5; i++) F.ball(x, 0.69 - i * 0.07, 0, 0.025, F.shade('meatSausage', i % 2 ? 0.05 : -0.05), 'food');
    for (const x of [0.06, 0.16, 0.26]) {
      F.cyl(x, 0.62, 0, 0.015, 0.12, 0, rope, 'rope');
      F.cone(x, 0.42, 0, 0.06, 0.22, 0, F.shade('herbDry', F.rr(-0.1, 0.1)), 'food');
    }
    for (let i = 0; i < 6; i++) F.ball(0.4 + (i % 2 ? 0.02 : -0.02), 0.68 - i * 0.065, 0, 0.032, F.col('vegGarlic'), 'food');
  }
});

/* ================= Drink (6 pieces) ================= */

FURN({
  key: 'generic_wine', name: 'Wine', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'drink', setting: 'indoor',
  rooms: ['tavern', 'hall', 'court', 'kitchen', 'store'], anchor: 'surface', clearance: {},
  materials: ['glass', 'food', 'timber', 'metal'],
  w: 0.4, d: 0.3, h: 0.32, variants: 4, variantNames: ['bottle and goblet', 'two bottles', 'wine rack', 'decanter set'],
  variantDims: [{ w: 0.2, d: 0.08, h: 0.32 }, { w: 0.18, d: 0.08, h: 0.32 }, { w: 0.4, d: 0.3, h: 0.24 }, { w: 0.34, d: 0.2, h: 0.28 }],
  build: function (F) {
    const cork = F.col('timberBirch'), wine = F.col('drinkWine'), clear = F.col('glassClear');
    if (F.variant === 0) {
      KGEN.bottle(F, -0.05, 0, 0, 0.04, 0.32, F.col('glassGreen'), cork, wine);
      KGEN.goblet(F, 0.06, 0, 0.0, clear, wine);
    } else if (F.variant === 1) {
      KGEN.bottle(F, -0.05, 0, 0, 0.04, 0.32, F.col('glassGreen'), cork, wine);
      KGEN.bottle(F, 0.05, 0, 0, 0.04, 0.3, F.col('glassAmber'), F.col('waxRed'), F.col('drinkSpirit'));
    } else if (F.variant === 2) {
      const wood = F.col('timberOak');
      for (const s of [-1, 1]) F.box(s * 0.19, 0, 0, 0.02, 0.24, 0.24, 0, wood, 'wood');
      for (const y of [0, 0.11, 0.22]) F.box(0, y, 0, 0.36, 0.02, 0.24, 0, F.shade(wood, 0.05), 'wood');
      for (const y of [0.02, 0.13]) for (const x of [-0.12, 0, 0.12]) {
        F.rod(x, y + 0.04, -0.13, x, y + 0.04, 0.07, 0.04, F.col(x ? 'glassGreen' : 'glassAmber'), 'glass');
        F.rod(x, y + 0.04, 0.07, x, y + 0.04, 0.15, 0.014, cork, 'wood');
      }
    } else {
      F.box(0, 0, 0, 0.34, 0.02, 0.2, 0, F.col('brass'), 'metal');
      F.cyl(-0.08, 0.02, 0, 0.055, 0.04, 0, clear, 'glass');
      F.blob(-0.08, 0.11, 0, 0.07, 0.14, 0, clear, 'glass');
      F.blob(-0.08, 0.09, 0, 0.055, 0.08, 0, F.col('drinkSpirit'), 'food');
      F.cyl(-0.08, 0.17, 0, 0.018, 0.07, 0, clear, 'glass'); F.ball(-0.08, 0.255, 0, 0.025, clear, 'glass');
      for (const [x, z] of [[0.06, -0.04], [0.11, 0.05]]) KGEN.mug(F, x, 0.02, z, 0.03, 0.07, clear, 'glass', F.col('drinkSpirit'));
    }
  }
});

FURN({
  key: 'generic_ale', name: 'Ale', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'drink', setting: 'both',
  rooms: ['tavern', 'hall', 'kitchen', 'barracks'], anchor: 'surface', clearance: {},
  materials: ['timber', 'metal', 'food', 'stone', 'glass'],
  w: 0.36, d: 0.21, h: 0.25, variants: 3, variantNames: ['tankard pair', 'pitcher and mugs', 'foaming stein'],
  variantDims: [{ w: 0.28, d: 0.19, h: 0.16 }, { w: 0.36, d: 0.21, h: 0.25 }, { w: 0.13, d: 0.09, h: 0.2 }],
  build: function (F) {
    const foam = F.col('drinkFoam'), ale = F.col('drinkAle');
    const tankard = (x, z, wood, h) => {
      KGEN.mug(F, x, 0, z, 0.05, h, wood, 'wood', ale);
      for (const y of [0.02, h - 0.04]) F.cyl(x, y, z, 0.053, 0.015, 0, F.col('iron'), 'metal');
      F.dome(x, h, z, 0.046, 0.03, 0, foam, 'food');
    };
    if (F.variant === 0) { tankard(-0.08, -0.03, F.col('timberOak'), 0.13); tankard(0.07, 0.04, F.col('timberWalnut'), 0.12); }
    else if (F.variant === 1) {
      const buff = F.col('stoneBuff');
      F.frustum(-0.08, 0, 0, 0.08, 0.06, 0.18, 0, buff, 'stone', 14);
      F.frustum(-0.08, 0.18, 0, 0.06, 0.075, 0.06, 0, F.col('stoneGlazeOchre'), 'stone', 14);
      F.cyl(-0.08, 0.225, 0, 0.065, 0.02, 0, ale, 'food');
      F.cone(-0.08, 0.215, 0.08, 0.025, 0.035, 0, buff, 'stone');
      F.box(-0.17, 0.06, 0, 0.02, 0.14, 0.03, 0, buff, 'stone');
      KGEN.mug(F, 0.08, 0, -0.06, 0.04, 0.1, buff, 'stone', ale);
      KGEN.mug(F, 0.1, 0, 0.06, 0.04, 0.1, buff, 'stone', ale);
    } else {
      F.cyl(0, 0, 0, 0.045, 0.16, 0, F.col('glassAmber'), 'glass');
      F.cyl(0, 0.005, 0, 0.04, 0.14, 0, ale, 'food');
      F.dome(0, 0.155, 0, 0.044, 0.04, 0, foam, 'food');
      F.box(0.055, 0.03, 0, 0.02, 0.1, 0.02, 0, F.col('glassAmber'), 'glass');
    }
  }
});

FURN({
  key: 'generic_spirits', name: 'Spirits', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'drink', setting: 'both',
  rooms: ['tavern', 'store', 'barracks', 'kitchen', 'study'], anchor: 'surface', clearance: {},
  materials: ['stone', 'timber', 'metal', 'food', 'glass'],
  w: 0.29, d: 0.24, h: 0.3, variants: 3, variantNames: ['stoneware jug', 'hip flask and cups', 'cordial bottles'],
  variantDims: [{ w: 0.29, d: 0.24, h: 0.3 }, { w: 0.24, d: 0.1, h: 0.18 }, { w: 0.23, d: 0.07, h: 0.25 }],
  build: function (F) {
    if (F.variant === 1) F.shift(-0.0175, -0.005);
    if (F.variant === 0) {
      const buff = F.col('stoneBuff'), dip = F.col('stoneClayDark');
      F.frustum(0, 0, 0, 0.1, 0.12, 0.13, 0, buff, 'stone', 16);
      F.frustum(0, 0.13, 0, 0.12, 0.04, 0.09, 0, dip, 'stone', 16);
      F.cyl(0, 0.22, 0, 0.035, 0.05, 0, dip, 'stone');
      F.cyl(0, 0.27, 0, 0.03, 0.03, 0, F.col('timberBirch'), 'wood');
      F.beam(0.03, 0.25, 0, 0.13, 0.17, 0, 0.025, 0.02, dip, 'stone');
      F.beam(0.13, 0.17, 0, 0.115, 0.1, 0, 0.025, 0.02, dip, 'stone');
    } else if (F.variant === 1) {
      const tin = F.col('pewter');
      F.box(-0.05, 0, 0, 0.1, 0.14, 0.035, 0, tin, 'metal');
      F.cyl(-0.05, 0.14, 0, 0.015, 0.02, 0, tin, 'metal'); F.cyl(-0.05, 0.16, 0, 0.02, 0.02, 0, F.col('brass'), 'metal');
      for (const [x, z] of [[0.05, -0.02], [0.095, 0.03]]) KGEN.mug(F, x, 0, z, 0.022, 0.045, tin, 'metal', F.col('drinkSpirit'));
    } else {
      ['glassViolet', 'glassBlue', 'glassGreen'].forEach((k, i) => KGEN.bottle(F, -0.08 + i * 0.08, 0, 0, 0.035, [0.24, 0.2, 0.17][i], F.col(k), F.col('waxRed'), F.col(['fruitPlum', 'drinkSpirit', 'vegHerb'][i])));
    }
  }
});

FURN({
  key: 'generic_tea_set', name: 'Tea Set', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'drink', setting: 'indoor',
  rooms: ['hall', 'court', 'study', 'kitchen', 'bedroom'], anchor: 'surface', clearance: {},
  materials: ['stone', 'metal', 'food', 'timber'],
  w: 0.4, d: 0.26, h: 0.4, variants: 3, variantNames: ['teapot and cups', 'coffee pot', 'samovar'],
  variantDims: [{ w: 0.4, d: 0.26, h: 0.19 }, { w: 0.31, d: 0.2, h: 0.26 }, { w: 0.28, d: 0.25, h: 0.4 }],
  build: function (F) {
    if (F.variant === 2) F.shift(0, -0.0175);
    const ware = F.col('stoneCream'), blue = F.col('stoneGlazeBlue');
    const cup = (x, z) => { F.cyl(x, 0.02, z, 0.05, 0.02, 0, ware, 'stone'); KGEN.mug(F, x, 0.04, z, 0.035, 0.045, ware, 'stone', F.col('drinkTea')); };
    if (F.variant === 0) {
      F.box(0, 0, 0, 0.4, 0.02, 0.26, 0, F.col('timberWalnut'), 'wood');
      F.blob(-0.07, 0.085, 0, 0.08, 0.13, 0, blue, 'stone');
      F.dome(-0.07, 0.14, 0, 0.04, 0.025, 0, ware, 'stone'); F.ball(-0.07, 0.17, 0, 0.02, ware, 'stone');
      F.rod(0.0, 0.07, 0, 0.06, 0.13, 0, 0.012, blue, 'stone');
      F.beam(-0.14, 0.13, 0, -0.17, 0.07, 0, 0.02, 0.02, blue, 'stone');
      cup(0.12, -0.06); cup(0.13, 0.07);
    } else if (F.variant === 1) {
      const cu = F.col('copper');
      F.frustum(-0.06, 0, 0, 0.07, 0.045, 0.2, 0, cu, 'metal', 14);
      F.dome(-0.06, 0.2, 0, 0.045, 0.03, 0, cu, 'metal'); F.ball(-0.06, 0.24, 0, 0.02, F.col('brass'), 'metal');
      F.rod(-0.02, 0.1, 0, 0.04, 0.2, 0, 0.012, cu, 'metal');
      F.box(-0.135, 0.06, 0, 0.02, 0.12, 0.02, 0, F.col('timberDark'), 'wood');
      cup(0.09, -0.04); cup(0.1, 0.05);
    } else {
      const br = F.col('brass');
      F.frustum(0, 0, 0, 0.1, 0.06, 0.04, 0, br, 'metal', 14);
      F.cyl(0, 0.04, 0, 0.03, 0.04, 0, br, 'metal');
      F.blob(0, 0.17, 0, 0.11, 0.2, 0, br, 'metal');
      F.cyl(0, 0.26, 0, 0.05, 0.04, 0, F.shade(br, -0.1), 'metal');
      for (const s of [-1, 1]) F.box(s * 0.125, 0.18, 0, 0.03, 0.05, 0.02, 0, F.col('timberDark'), 'wood');
      F.rod(0, 0.1, 0.1, 0, 0.1, 0.14, 0.012, br, 'metal');
      F.blob(0, 0.33, 0, 0.06, 0.08, 0, blue, 'stone');                        /* the teapot on top */
      F.ball(0, 0.38, 0, 0.02, ware, 'stone');
      F.rod(0.05, 0.32, 0, 0.09, 0.37, 0, 0.01, blue, 'stone');
    }
  }
});

FURN({
  key: 'generic_water', name: 'Water', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'drink', setting: 'both',
  rooms: ['bedroom', 'kitchen', 'hall', 'barracks', 'yard'], anchor: 'surface', clearance: {},
  materials: ['stone', 'food', 'glass', 'skin', 'metal', 'timber'],
  w: 0.36, d: 0.37, h: 0.26, variants: 3, variantNames: ['pitcher and basin', 'carafe and cups', 'waterskin'],
  variantDims: [{ w: 0.36, d: 0.37, h: 0.26 }, { w: 0.28, d: 0.14, h: 0.24 }, { w: 0.33, d: 0.23, h: 0.1 }],
  build: function (F) {
    const water = F.col('drinkWater');
    if (F.variant === 0) {
      const ware = F.col('stoneCream');
      F.frustum(0, 0, 0, 0.1, 0.18, 0.09, 0, ware, 'stone', 18);
      F.cyl(0, 0.075, 0, 0.165, 0.02, 0, water, 'food');
      F.frustum(0.03, 0.02, 0, 0.06, 0.05, 0.13, 0, F.col('stoneGlazeBlue'), 'stone', 14);
      F.frustum(0.03, 0.15, 0, 0.05, 0.07, 0.09, 0, F.col('stoneGlazeBlue'), 'stone', 14);
      F.cone(0.03, 0.22, 0.07, 0.025, 0.035, 0, F.col('stoneGlazeBlue'), 'stone');
      F.box(-0.05, 0.1, 0, 0.02, 0.12, 0.02, 0, F.col('stoneGlazeBlue'), 'stone');
    } else if (F.variant === 1) {
      const clear = F.col('glassClear');
      F.cyl(-0.05, 0.005, 0, 0.05, 0.13, 0, water, 'food');
      F.frustum(-0.05, 0, 0, 0.06, 0.06, 0.14, 0, clear, 'glass', 14);
      F.frustum(-0.05, 0.14, 0, 0.06, 0.025, 0.06, 0, clear, 'glass', 14);
      F.cyl(-0.05, 0.2, 0, 0.025, 0.04, 0, clear, 'glass');
      for (const [x, z] of [[0.06, -0.03], [0.09, 0.04]]) KGEN.mug(F, x, 0, z, 0.028, 0.08, clear, 'glass', water);
    } else {
      const sk = F.col('timberWalnut');
      F.blob(-0.02, 0.05, 0, 0.12, 0.1, 0, sk, 'skin');
      F.blob(0.08, 0.04, 0, 0.06, 0.07, 0, F.shade(sk, 0.06), 'skin');
      F.rod(0.1, 0.04, 0, 0.13, 0.05, 0, 0.018, F.col('pewter'), 'metal');
      F.cyl(0.14, 0.03, 0, 0.022, 0.04, 0, F.col('timberBirch'), 'wood');
    }
  }
});

/* ================= Supplies (11 pieces) ================= */

FURN({
  key: 'generic_candle_supply', name: 'Candle Stock', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['store', 'shrine', 'kitchen', 'bedroom', 'study', 'temple'], anchor: 'surface', clearance: {},
  materials: ['cloth', 'timber', 'rope'],
  w: 0.32, d: 0.14, h: 0.21, variants: 3, variantNames: ['tied bundle', 'candle box', 'tallow row'],
  variantDims: [{ w: 0.28, d: 0.1, h: 0.05 }, { w: 0.32, d: 0.14, h: 0.08 }, { w: 0.31, d: 0.08, h: 0.21 }],
  build: function (F) {
    const wax = F.col(F.variant === 2 ? 'waxHoney' : 'waxBone');
    if (F.variant === 0) {
      for (let i = 0; i < 7; i++) { const z = (i % 4 - 1.5) * 0.024, y = i < 4 ? 0.012 : 0.034, zz = i < 4 ? z : z + 0.012; F.rod(-0.14, y, zz, 0.14, y, zz, 0.012, F.shade(wax, -i * 0.01), 'cloth'); }
      for (const x of [-0.06, 0.06]) F.box(x, 0, 0, 0.015, 0.05, 0.1, 0, F.col('clothMadder'), 'rope');
    } else if (F.variant === 1) {
      const pine = F.col('timberPine');
      F.box(0, 0, 0, 0.32, 0.015, 0.14, 0, pine, 'wood');
      for (const s of [-1, 1]) { F.box(0, 0, s * 0.06, 0.32, 0.06, 0.02, 0, pine, 'wood'); F.box(s * 0.15, 0, 0, 0.02, 0.06, 0.14, 0, pine, 'wood'); }
      for (let i = 0; i < 4; i++) F.rod(-0.13, 0.05 + (i % 2) * 0.012, -0.036 + i * 0.024, 0.13, 0.05 + (i % 2) * 0.012, -0.036 + i * 0.024, 0.012, wax, 'cloth');
    } else {
      F.box(0, 0, 0, 0.3, 0.02, 0.08, 0, F.col('timberOak'), 'wood');
      [0.17, 0.14, 0.12, 0.16, 0.1].forEach((h, i) => { F.cyl(-0.12 + i * 0.06, 0.02, 0, 0.015, h, 0, F.shade(wax, -i * 0.02), 'cloth'); F.cyl(-0.12 + i * 0.06, 0.02 + h, 0, 0.01, 0.02, 0, F.col('inkBlack'), 'rope'); });
    }
  }
});

FURN({
  key: 'generic_lamp_oil', name: 'Lamp Oil and Tinder', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['store', 'kitchen', 'bedroom', 'study', 'workshop'], anchor: 'surface', clearance: {},
  materials: ['stone', 'metal', 'timber', 'food', 'cloth'],
  w: 0.31, d: 0.15, h: 0.26, variants: 3, variantNames: ['oil jar and lamp', 'oil can', 'tinderbox and spills'],
  variantDims: [{ w: 0.31, d: 0.15, h: 0.26 }, { w: 0.25, d: 0.14, h: 0.24 }, { w: 0.25, d: 0.12, h: 0.05 }],
  build: function (F) {
    if (F.variant === 1) F.shift(-0.0215, 0);
    if (F.variant === 0) {
      const clay = F.col('stoneClay');
      F.frustum(-0.07, 0, 0, 0.06, 0.075, 0.14, 0, clay, 'stone', 14);
      F.frustum(-0.07, 0.14, 0, 0.075, 0.03, 0.06, 0, clay, 'stone', 14);
      F.cyl(-0.07, 0.2, 0, 0.03, 0.04, 0, clay, 'stone');
      F.cyl(-0.07, 0.24, 0, 0.033, 0.02, 0, F.col('timberBirch'), 'wood');
      F.blob(0.07, 0.025, 0, 0.055, 0.05, 0, F.col('stoneClayDark'), 'stone');
      F.cyl(0.07, 0.035, 0, 0.025, 0.02, 0, F.col('drinkOil'), 'food');
      F.rod(0.11, 0.03, 0, 0.15, 0.035, 0, 0.012, F.col('stoneClayDark'), 'stone');
    } else if (F.variant === 1) {
      const tin = F.col('tin');
      F.cyl(-0.03, 0, 0, 0.07, 0.16, 0, tin, 'metal');
      F.dome(-0.03, 0.16, 0, 0.07, 0.03, 0, F.shade(tin, -0.1), 'metal');
      F.rod(0.02, 0.17, 0, 0.14, 0.23, 0, 0.007, tin, 'metal');
      F.rod(-0.08, 0.17, 0, -0.08, 0.22, 0, 0.008, F.col('iron'), 'metal');
      F.rod(-0.08, 0.22, 0, 0.0, 0.22, 0, 0.008, F.col('iron'), 'metal');
    } else {
      const tin = F.col('tin');
      F.box(-0.06, 0, 0, 0.1, 0.035, 0.07, 0, tin, 'metal');
      F.box(-0.06, 0.035, 0, 0.1, 0.01, 0.07, 0, F.shade(tin, 0.1), 'metal');
      F.box(-0.06, 0.03, 0.05, 0.06, 0.02, 0.02, 0, F.col('stoneGrey'), 'stone');
      for (let i = 0; i < 5; i++) F.rod(0.03, 0.006 + (i % 2) * 0.008, -0.04 + i * 0.02, 0.12, 0.006 + (i % 2) * 0.008, -0.03 + i * 0.02, 0.005, F.col('paperCream'), 'cloth');
    }
  }
});

FURN({
  key: 'generic_soap', name: 'Soap and Towels', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['bedroom', 'kitchen', 'store', 'barracks'], anchor: 'surface', clearance: {},
  materials: ['food', 'cloth', 'timber', 'stone'],
  w: 0.3, d: 0.17, h: 0.08, variants: 2, variantNames: ['soap bars', 'wash set'],
  variantDims: [{ w: 0.2, d: 0.13, h: 0.07 }, { w: 0.3, d: 0.17, h: 0.08 }],
  build: function (F) {
    const bars = ['soapCream', 'soapGreen', 'clothRose', 'soapCream'];
    if (F.variant === 0) {
      bars.forEach((k, i) => F.box(i < 2 ? -0.045 : 0.045, (i % 2) * 0.035, 0, 0.08, 0.035, 0.11, i * 0.1, F.col(k), 'food'));
    } else {
      F.box(-0.06, 0, 0, 0.18, 0.04, 0.16, 0, F.col('clothLinen'), 'cloth');
      F.box(-0.06, 0.04, 0, 0.18, 0.04, 0.16, 0, F.col('clothSage'), 'cloth');
      F.box(-0.06, 0.04, 0.075, 0.18, 0.04, 0.02, 0, F.col('clothIndigo'), 'cloth');
      F.cyl(0.1, 0, -0.03, 0.05, 0.02, 0, F.col('stoneCream'), 'stone');
      F.box(0.1, 0.02, -0.03, 0.07, 0.03, 0.05, 0, F.col('soapGreen'), 'food');
      F.box(0.1, 0, 0.06, 0.1, 0.03, 0.04, 0, F.col('timberOak'), 'wood');
      F.box(0.1, 0.03, 0.06, 0.08, 0.02, 0.03, 0, F.col('wickerStraw'), 'cloth');
    }
  }
});

FURN({
  key: 'generic_medicine', name: 'Medicines', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['study', 'bedroom', 'store', 'shrine', 'barracks'], anchor: 'surface', clearance: {},
  materials: ['glass', 'food', 'cloth', 'metal', 'stone', 'timber'],
  w: 0.34, d: 0.15, h: 0.19, variants: 3, variantNames: ['apothecary bottles', 'bandages and salve', 'mortar and pestle'],
  variantDims: [{ w: 0.34, d: 0.06, h: 0.19 }, { w: 0.32, d: 0.15, h: 0.06 }, { w: 0.28, d: 0.15, h: 0.16 }],
  build: function (F) {
    if (F.variant === 0) {
      const g = ['glassBlue', 'glassAmber', 'glassGreen', 'glassViolet', 'glassClear'], hs = [0.18, 0.12, 0.15, 0.1, 0.13];
      for (let i = 0; i < 5; i++) KGEN.bottle(F, -0.14 + i * 0.07, 0, 0, i % 2 ? 0.025 : 0.03, hs[i], F.col(g[i]), F.col(i === 2 ? 'waxRed' : 'timberBirch'),
        F.col(['medicineRed', 'honeyAmber', 'vegHerb', 'fruitPlum', 'drinkWater'][i]));
    } else if (F.variant === 1) {
      for (let i = 0; i < 3; i++) F.rod(-0.13 + i * 0.07, 0.03, -0.04, -0.13 + i * 0.07, 0.03, 0.05, 0.03, F.shade('clothLinen', -i * 0.04), 'cloth');
      for (const [x, z] of [[0.08, -0.03], [0.12, 0.04]]) { F.cyl(x, 0, z, 0.032, 0.02, 0, F.col('tin'), 'metal'); F.cyl(x, 0.02, z, 0.033, 0.01, 0, F.col('medicineRed'), 'metal'); }
    } else {
      const st = F.col('stoneGrey');
      F.frustum(-0.06, 0, 0, 0.055, 0.075, 0.07, 0, st, 'stone', 16);
      F.cyl(-0.06, 0.055, 0, 0.06, 0.02, 0, F.col('herbDry'), 'food');
      F.rod(-0.07, 0.04, 0, -0.01, 0.15, 0.03, 0.014, F.shade(st, 0.1), 'stone');
      KGEN.bowl(F, 0.08, 0, 0, 0.06, 0.04, F.col('timberOak'), 'wood', F.col('vegHerb'));
    }
  }
});

FURN({
  key: 'generic_herb_bundles', name: 'Herbs', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['kitchen', 'study', 'shrine', 'store', 'market'], anchor: 'surface', clearance: {},
  materials: ['food', 'timber', 'rope', 'glass', 'metal'],
  w: 0.37, d: 0.24, h: 0.16, variants: 2, variantNames: ['drying bundles', 'herb jars'],
  variantDims: [{ w: 0.37, d: 0.24, h: 0.05 }, { w: 0.3, d: 0.1, h: 0.16 }],
  build: function (F) {
    if (F.variant === 0) {
      F.box(0, 0, 0, 0.36, 0.02, 0.24, 0, F.col('timberPine'), 'wood');
      for (const [z, k] of [[-0.07, 'herbDry'], [0, 'vegHerb'], [0.07, 'clothSage']]) {
        for (let j = -2; j <= 2; j++) F.rod(-0.12, 0.03, z, 0.13, 0.03, z + j * 0.012, 0.006, F.shade(k, -0.2), 'food');
        for (let j = 0; j < 4; j++) F.blob(-0.02 + j * 0.045, 0.03, z, 0.028, 0.025, 0, F.shade(k, F.rr(-0.1, 0.1)), 'food');
        F.cyl(-0.1, 0.02, z, 0.012, 0.02, 0, F.col('clothMadder'), 'rope');
      }
    } else {
      ['vegHerb', 'herbDry', 'clothSage'].forEach((k, i) => KGEN.jar(F, -0.1 + i * 0.1, 0, 0, 0.045, 0.12, F.col('glassClear'), F.col('pewter'), 'glass', F.col(k)));
    }
  }
});

FURN({
  key: 'generic_tobacco', name: 'Pipe and Tobacco', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['tavern', 'study', 'hall', 'barracks'], anchor: 'surface', clearance: {},
  materials: ['timber', 'skin', 'food', 'stone'],
  w: 0.28, d: 0.13, h: 0.16, variants: 2, variantNames: ['pipe and pouch', 'tobacco jar'],
  variantDims: [{ w: 0.25, d: 0.11, h: 0.07 }, { w: 0.28, d: 0.13, h: 0.16 }],
  build: function (F) {
    if (F.variant === 1) F.shift(-0.0235, 0);
    const pipe = (x, z) => {
      F.cyl(x, 0, z, 0.018, 0.04, 0, F.col('timberWalnut'), 'wood');
      F.cyl(x, 0.035, z, 0.012, 0.01, 0, F.col('coalBlack'), 'food');
      F.rod(x + 0.015, 0.012, z, x + 0.13, 0.025, z + 0.02, 0.006, F.col('timberDark'), 'wood');
    };
    if (F.variant === 0) {
      F.blob(-0.07, 0.03, 0, 0.055, 0.06, 0, F.col('timberWalnut'), 'skin');
      F.blob(-0.07, 0.06, 0, 0.025, 0.02, 0, F.col('tobaccoBrown'), 'food');
      pipe(-0.01, -0.03);
    } else {
      const ware = F.col('stoneGlazeGreen');
      KGEN.jar(F, -0.05, 0, 0, 0.06, 0.12, ware, F.shade(ware, -0.15), 'stone');
      pipe(0.03, 0.03);
    }
  }
});

FURN({
  key: 'generic_writing_supplies', name: 'Writing Supplies', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['study', 'library', 'school', 'court', 'store'], anchor: 'surface', clearance: {},
  materials: ['cloth', 'glass', 'food', 'metal'],
  w: 0.33, d: 0.31, h: 0.21, variants: 2, variantNames: ['ink and quill', 'paper and sealing wax'],
  variantDims: [{ w: 0.12, d: 0.07, h: 0.21 }, { w: 0.33, d: 0.31, h: 0.04 }],
  build: function (F) {
    if (F.variant === 0) {
      F.cyl(-0.03, 0, 0, 0.03, 0.045, 0, F.col('glassClear'), 'glass');
      F.cyl(-0.03, 0.003, 0, 0.026, 0.035, 0, F.col('inkBlack'), 'food');
      F.rod(-0.03, 0.03, 0, 0.04, 0.19, 0.02, 0.004, F.col('paperCream'), 'cloth');
      F.beam(0.0, 0.1, 0.008, 0.045, 0.2, 0.022, 0.03, 0.02, F.col('waxBone'), 'cloth');
    } else {
      for (let i = 0; i < 4; i++) F.box(-0.06 + i * 0.004, i * 0.008, 0, 0.21, 0.008, 0.297, i * 0.02, F.shade('paperCream', -i * 0.03), 'cloth');
      F.rod(0.1, 0.008, -0.06, 0.12, 0.008, 0.06, 0.008, F.col('waxRed'), 'food');
      F.cyl(0.13, 0, 0.1, 0.02, 0.04, 0, F.col('brass'), 'metal');
    }
  }
});

FURN({
  key: 'generic_sewing', name: 'Sewing Supplies', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['bedroom', 'workshop', 'store', 'market'], anchor: 'surface', clearance: {},
  materials: ['timber', 'cloth', 'thatch', 'metal'],
  w: 0.3, d: 0.31, h: 0.25, variants: 2, variantNames: ['spools', 'yarn basket'],
  variantDims: [{ w: 0.21, d: 0.13, h: 0.06 }, { w: 0.3, d: 0.31, h: 0.25 }],
  build: function (F) {
    const yarns = ['clothMadder', 'clothIndigo', 'clothOchre', 'clothSage', 'clothRose', 'clothLinen'];
    if (F.variant === 0) {
      for (let i = 0; i < 6; i++) {
        const x = -0.08 + (i % 3) * 0.08, z = i < 3 ? -0.03 : 0.03;
        F.cyl(x, 0, z, 0.025, 0.01, 0, F.col('timberBirch'), 'wood');
        F.cyl(x, 0.01, z, 0.02, 0.035, 0, F.col(yarns[i]), 'cloth');
        F.cyl(x, 0.045, z, 0.025, 0.01, 0, F.col('timberBirch'), 'wood');
      }
      F.box(0.0, 0, 0.055, 0.08, 0.02, 0.01, 0, F.col('pewter'), 'metal');
    } else {
      F.frustum(0, 0, 0, 0.12, 0.15, 0.09, 0, F.col('wickerStraw'), 'thatch', 14);
      F.cyl(0, 0.075, 0, 0.13, 0.02, 0, F.col('wickerDark'), 'thatch');
      KGEN.heap(F, 0, 0.08, 0, 0.13, 0.04, F.cols(yarns), 'cloth');
      F.rod(-0.06, 0.1, 0.02, 0.06, 0.16, -0.02, 0.005, F.col('timberBirch'), 'wood');
    }
  }
});

FURN({
  key: 'generic_rations', name: 'Travel Rations', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'both',
  rooms: ['barracks', 'store', 'dock', 'yard', 'market'], anchor: 'surface', clearance: {},
  materials: ['cloth', 'rope', 'food', 'skin', 'metal'],
  w: 0.36, d: 0.18, h: 0.13, variants: 2, variantNames: ['ration bundle', 'hardtack and jerky'],
  variantDims: [{ w: 0.36, d: 0.18, h: 0.13 }, { w: 0.31, d: 0.15, h: 0.08 }],
  build: function (F) {
    if (F.variant === 0) {
      F.box(-0.06, 0, 0, 0.2, 0.1, 0.16, 0, F.col('clothHessian'), 'cloth');
      F.box(-0.06, 0, 0, 0.21, 0.105, 0.02, 0, F.col('wickerTan'), 'rope');
      F.box(-0.06, 0, 0, 0.02, 0.105, 0.17, 0, F.col('wickerTan'), 'rope');
      F.blob(0.11, 0.05, 0.02, 0.07, 0.1, 0, F.col('timberWalnut'), 'skin');
      F.cyl(0.11, 0.09, 0.02, 0.018, 0.04, 0, F.col('pewter'), 'metal');
    } else {
      for (let i = 0; i < 4; i++) F.box(-0.07 + (i % 2) * 0.004, i * 0.018, 0, 0.12, 0.018, 0.12, i * 0.08, F.shade('pieCrust', 0.1 - i * 0.02), 'food');
      for (let i = 0; i < 4; i++) F.box(0.09, 0, -0.05 + i * 0.033, 0.12, 0.02, 0.025, 0.05 * i, F.col('meatCured'), 'food');
    }
  }
});

FURN({
  key: 'generic_fuel', name: 'Fuel', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'both',
  rooms: ['kitchen', 'hall', 'workshop', 'store', 'yard'], anchor: 'floor', clearance: {},
  materials: ['timber', 'rope', 'metal', 'food', 'foliage'],
  w: 0.57, d: 0.39, h: 0.43, variants: 3, variantNames: ['kindling bundle', 'coal scuttle', 'peat stack'],
  variantDims: [{ w: 0.57, d: 0.2, h: 0.2 }, { w: 0.36, d: 0.31, h: 0.43 }, { w: 0.54, d: 0.39, h: 0.4 }],
  build: function (F) {
    if (F.variant) F.shift(F.variant === 1 ? -0.018 : -0.037, 0);   /* centre the footprint */
    if (F.variant === 0) {
      for (let i = 0; i < 14; i++) { const a = i * 2.4, r = (i % 4) * 0.025, z = Math.cos(a) * r, y = 0.1 + Math.sin(a) * r; F.rod(-0.28, y, z, 0.28, y + F.rr(-0.02, 0.02), z, 0.016, F.shade('timberBirch', F.rr(-0.2, 0)), 'wood'); }
      for (const x of [-0.14, 0.14]) F.box(x, 0, 0, 0.03, 0.2, 0.2, 0, F.col('wickerTan'), 'rope');
    } else if (F.variant === 1) {
      const iron = F.col('iron');
      F.frustum(0, 0, 0, 0.13, 0.15, 0.3, 0, iron, 'metal', 16);
      F.cyl(0, 0.28, 0, 0.14, 0.02, 0, F.col('coalBlack'), 'food');
      KGEN.heap(F, 0, 0.28, 0, 0.14, 0.035, [F.col('coalBlack'), F.shade('coalBlack', 0.1)], 'food');
      const h = [[-0.15, 0.3], [-0.1, 0.4], [0.1, 0.4], [0.15, 0.3]];
      for (let i = 0; i < 3; i++) F.rod(h[i][0], h[i][1], 0, h[i + 1][0], h[i + 1][1], 0, 0.01, iron, 'metal');
      F.box(0.17, 0, 0.1, 0.04, 0.32, 0.04, 0.3, F.col('timberDark'), 'wood');
    } else {
      const peat = F.col('breadDark');
      for (let j = 0; j < 4; j++) for (let i = 0; i < 3 - (j > 1 ? 1 : 0); i++)
        F.box(-0.15 + i * 0.15 + (j % 2) * 0.075, j * 0.1, 0, 0.14, 0.1, 0.38, F.rr(-0.05, 0.05), F.shade(peat, F.rr(-0.1, 0.1)), 'plant');
    }
  }
});

/* ---- kits/catalog/krator-master-furniture-generic.js ---- */
/* ======================================================================
   Generic wood set: the POOR tier any culture's poor buildings pull from.
   Plain joinery in local softwood, undyed cloth, hemp rope, terracotta, a
   fieldstone hearth. No motif, no accent beyond iron. kits/interiors falls
   back to it from every culture (IX.CULTURE_FAMILY).
   Built by FK.set() from the style sheet below; two bespoke pieces follow.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('generic', { name: 'Generic', pack: 'generic', influences: 'plain country joinery, any culture',
  materials: 'softwood, undyed linen, hemp, terracotta, fieldstone',
  palette: {
    timberPine: 0xa8865c, timberPineDark: 0x7a6040, timberPineLight: 0xc0a070, timberGrey: 0x8a8070,
    clothLinen: 0xd0c4a4, clothUndyed: 0xb8aa88, clothBrown: 0x7a5a3c, clothGreyBlue: 0x6a7684,
    ropeHemp: 0xa89868, clayTerracotta: 0xa8603c, stoneField: 0x7e7a70, stoneSoot: 0x2a2622,
    iron: 0x3e3a34, ember: 0xd9762c, flame: 0xffb04a
  } });
/* END PALETTE */
const GENERIC_STYLE = {
  wood: 'timberPine', woodDark: 'timberPineDark', woodLight: 'timberPineLight', woodFam: 'wood',
  cloth: ['clothLinen', 'clothUndyed', 'clothBrown', 'clothGreyBlue'], clothFam: 'cloth',
  accent: 'iron', accentFam: 'metal', metal: 'iron', metalFam: 'metal',
  clay: 'clayTerracotta', clayFam: 'stone', stone: 'stoneField', stoneFam: 'stone', rope: 'ropeHemp',
  flame: 'flame', ember: 'ember',
  legs: 'straight', motif: 'none', bedBase: 'rope', seat: 'plank', finial: 'none',
  hearth: 'stone', fire: 'ring', lamp: 'candle', rug: 'rag', store: 'sacks', rack: 'tools', board: 'slate'
};
FK.set({ culture: 'generic', tier: 'poor', S: GENERIC_STYLE, names: {
  bed: 'Rope-strung cot', bench: 'Plank bench', stool: 'Three-plank stool', table: 'Plank table', chest: 'Pine chest',
  wall_shelves: 'Bracket shelves', store: 'Grain sacks', hearth: 'Fieldstone hearth', fire: 'Fire ring and tripod',
  lamp: 'Candle on a stand', mat: 'Rag rug', counter: 'Plank counter', workbench: 'Workbench', rack: 'Tool rack',
  ladder: 'Ladder', board: 'Slate board', bowl: 'Wooden bowl', jug: 'Jug and cups' } });

FURN({
  key: 'generic_poor_straw_bed', name: 'Straw pallet', culture: 'generic', tier: 'poor', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'barracks', 'store'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'thatch', 'cloth'],
  w: 1.0, d: 1.9, h: 0.3, variants: 1,
  build: function (F) {
    const wood = F.col('timberPineDark');
    F.box(0, 0, 0, 1.0, 0.12, 0.08, 0, wood, 'wood'); F.box(0, 0, 0.91, 1.0, 0.12, 0.08, 0, wood, 'wood'); F.box(0, 0, -0.91, 1.0, 0.12, 0.08, 0, wood, 'wood');
    for (const s of [-1, 1]) F.box(s * 0.47, 0, 0, 0.06, 0.12, 1.9, 0, wood, 'wood');
    for (let i = 0; i < 9; i++) F.box(F.rr(-0.05, 0.05), 0.1, -0.8 + i * 0.2, 0.88, 0.06, 0.2, F.rr(-0.06, 0.06), F.shade('ropeHemp', F.rr(-0.1, 0.1)), 'thatch');
    F.box(0, 0.16, 0.1, 0.86, 0.04, 1.3, 0, F.col('clothUndyed'), 'cloth');
    F.blob(0, 0.22, -0.65, 0.26, 0.1, 0, F.col('clothLinen'), 'cloth');
  }
});
FURN({
  key: 'generic_poor_log_seat', name: 'Log round seat', culture: 'generic', tier: 'poor', type: 'chair', setting: 'both',
  rooms: ['hall', 'kitchen', 'yard', 'workshop'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber', 'bark'],
  w: 0.4, d: 0.4, h: 0.42, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.19, 0.42, 0, F.col('timberGrey'), 'bark');
    F.cyl(0, 0.42, 0, 0.17, 0.004, 0, F.col('timberPineLight'), 'wood');
    F.cyl(0, 0.42, 0, 0.09, 0.005, 0, F.col('timberPine'), 'wood');
  }
});

/* trades and households (FK.ROLES.trade, the 2026-10 interiors-sets pass): forge, anvil, stall, vat, still,
   bins, larder, bunk, locker ... in this culture's style sheet, keyed generic_trade_<role> */
FK.set({ culture: 'generic', tier: 'poor', roles: 'trade', prefix: 'generic_trade_', S: GENERIC_STYLE, names: {
  forge: 'Fieldstone forge', anvil: 'Anvil on a stump', trough: 'Plank trough', stall: 'Plank stall', hayrack: 'Hay rack and manger', display: 'Plank display steps', armour_stand: 'Armour post', weapon_rack: 'Weapon rack', vat: 'Staved vat', still: 'Pot still', bin: 'Grain bins', larder: 'Larder cupboard', bunk: 'Plank bunk', locker: 'Plank locker', lathe: 'Pole lathe', press: 'Screw press', kiln: 'Clay kiln', grindstone: 'Grindstone', barrel: 'Barrel cradle', altar: 'Household altar' } });

/* training furniture (FK.ROLES.training, 2026-10): a melee and a ranged practice piece in this culture's style sheet, keyed generic_training_<role> */
FK.set({ culture: 'generic', tier: 'poor', roles: 'training', prefix: 'generic_training_', S: GENERIC_STYLE, names: {
  training_dummy: 'Straw practice dummy', archery_butt: 'Straw archery butt' } });

/* ---- kits/catalog/krator-master-furniture-rustic.js ---- */
/* ======================================================================
   Rustic Highlander (Clansman) furniture: common and court tiers.
   Influences: Alpine, Tlingit. Carved larch on splayed legs with chevron
   bands, loden and red-check wool, horn and pewter, fieldstone hearths,
   iron fire-baskets, antler trophies; the clan hall in dark larch with
   pewter, spiral (formline) carving and totem posts. No pack yet.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('rustic', { name: 'Rustic Highlanders', pack: null, influences: 'Alpine; Tlingit',
  materials: 'larch, wool, horn, pewter, iron, fieldstone; court: dark larch, pewter, antler',
  palette: {
    timberLarch: 0xa07850, timberLarchDark: 0x6a4a30, timberLarchLight: 0xc09a6a, timberLarchBlack: 0x3a2a1c,
    clothLoden: 0x4a5a3a, clothRedCheck: 0x8a2a2a, clothWool: 0xd8d0b8, clothGreyWool: 0x8a8878, clothBlue: 0x3a4a6a,
    hideBrown: 0x6a4a30, hornGrey: 0x9a9280, boneIvory: 0xe8e0cc, pewter: 0x8a8f92, iron: 0x3a3630,
    clayBrown: 0x8a5a3a, stoneGranite: 0x7a7466, flame: 0xffb04a, ember: 0xd9762c,
    /* harvested from settlements/highlands (HPAL and the Rustic builders' literals) */
    timberPine: 0xc08850, timberAged: 0x8a7e70, timberTar: 0x4a3426, timberPost: 0x5a4636, timberTrestle: 0x7a6248,
    timberBellows: 0x5a4030, timberShaft: 0x8a6a48, paintFalu: 0x8a2e22, shingleSilver: 0x9a8a78,
    stoneRubble: 0x9a948a, stoneAshlar: 0xd8d0bc, stoneMill: 0xa8a296,
    paintRed: 0xb3322a, paintTeal: 0x2e9488, paintWhite: 0xefe7d6, paintBlack: 0x201a18, paintOchre: 0xd19a3a, paintBlue: 0x3a6aa8,
    gold: 0xd4a03a, goldDeep: 0xc89030, strawHay: 0xc8b070, water: 0x2a6a8a, hornBone: 0xd8c8a0, hornPale: 0xe8dcc0,
    clayRed: 0xb86a3a, clayDeep: 0xa85a30, clayTan: 0xc88a5a, cheeseYellow: 0xe0c060, cheeseGold: 0xd0a848,
    fishSilver: 0x9aa0a8, fishGrey: 0x8a9098, ironBlack: 0x2e2a26, steelGrey: 0x9a9aa0, clothRust: 0xa04a2a,
    sackBurlap: 0xc8b080, sackPale: 0xb8a080, awningRed: 0xc03a2a, awningTeal: 0x2e8a88, awningSaffron: 0xd8a030,
    awningGreen: 0x6a8a3a, goodsSage: 0x5a7a5a, goodsBrown: 0x8a6a3a, goodsRust: 0x9a5a3a, goodsTan: 0xc8a060,
    cordDark: 0x3a2a20, hollowDark: 0x14110f
  } });
/* END PALETTE */
const RUS_COMMON = {
  emblem: { field: 'clothLoden', edge: 'timberLarchBlack', band: 'clothWool', ink: 'clothWool', ink2: 'clothRedCheck' },
  wood: 'timberLarch', woodDark: 'timberLarchDark', woodLight: 'timberLarchLight', woodFam: 'wood',
  cloth: ['clothLoden', 'clothRedCheck', 'clothWool', 'clothGreyWool'], clothFam: 'cloth',
  accent: 'hornGrey', accentFam: 'bone', metal: 'iron', metalFam: 'metal',
  clay: 'clayBrown', clayFam: 'stone', stone: 'stoneGranite', stoneFam: 'stone', rope: 'hideBrown',
  flame: 'flame', ember: 'ember',
  legs: 'splayed', motif: 'chevron', bedBase: 'plank', seat: 'plank', finial: 'knob',
  hearth: 'stone', fire: 'basket', lamp: 'candle', rug: 'hide', screen: 'panel', store: 'barrels',
  shelfFill: 'jars', rack: 'tools', art: 'antler', art2: 'shield', statue: 'totem', tapestry: 'chevrons',
  canopy: false, board: 'slate'
};
const RUS_COURT = Object.assign({}, RUS_COMMON, {
  wood: 'timberLarchDark', woodDark: 'timberLarchBlack', woodLight: 'timberLarch',
  cloth: ['clothRedCheck', 'clothLoden', 'clothWool', 'clothBlue'],
  accent: 'pewter', accentFam: 'metal', motif: 'spiral', finial: 'knob', seat: 'cushion', statue: 'totem', screen: 'carved', rug: 'woven', tapestry: 'figure', art: 'antler', art2: 'shield'
});
FK.set({ culture: 'rustic', tier: 'common', S: RUS_COMMON, names: {
  bed: 'Larch box bed', bench: 'Larch bench', chair: 'Carved larch chair', stool: 'Splayed stool', table: 'Larch table',
  low_table: 'Low larch table', desk: 'Reckoning desk', chest: 'Iron-banded chest', bookcase: 'Larch shelves', wall_shelves: 'Crock shelves',
  store: 'Barrels', hearth: 'Fieldstone hearth', fire: 'Iron fire-basket', lamp: 'Candle stand', candle: 'Tallow candle',
  hanging: 'Candle wheel', rug: 'Sheepskin', screen: 'Panel screen', counter: 'Inn counter', workbench: 'Workbench',
  loom: 'Wool loom', rack: 'Tool rack', ladder: 'Ladder', board: 'Slate board', art: 'Antler trophy', bowl: 'Brown-ware bowl',
  jug: 'Brown-ware jug and cups', books: 'Reckoning books' } });
FK.set({ culture: 'rustic', tier: 'court', S: RUS_COURT, names: {
  bed: 'Chieftain\'s box bed', throne: 'Chieftain\'s chair', divan: 'Hall settle', table: 'Clan hall table', low_table: 'Pewter-trimmed low table',
  desk: 'Chieftain\'s desk', cabinet: 'Carved press', bookcase: 'Clan shelves', hearth: 'Great fieldstone hearth', fire: 'Great fire-basket',
  lamp: 'Pewter candle stand', candelabra: 'Pewter candelabra', hanging: 'Great candle wheel', carpet: 'Hall carpet', screen: 'Carved screen',
  tapestry: 'Clan crest hanging', art: 'Great antlers', statue: 'Clan totem', jug: 'Pewter ewer and cups', bowl: 'Pewter bowl' } });

FURN({
  key: 'rustic_common_churn_rack', name: 'Churn and crock rack', culture: 'rustic', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['kitchen', 'store', 'yard'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'metal', 'stone'],
  w: 1.1, d: 0.5, h: 1.4, variants: 1,
  build: function (F) {
    const wood = F.col('timberLarchDark'), crock = F.col('clayBrown');
    F.box(0, 0, -0.22, 1.1, 1.4, 0.06, 0, wood, 'wood');
    F.box(0, 0.7, 0, 1.1, 0.04, 0.5, 0, F.col('timberLarch'), 'wood');
    for (const s of [-1, 1]) F.beam(s * 0.5, 0.7, -0.2, s * 0.5, 0.55, -0.2, 0.04, 0.04, wood, 'wood');
    F.frustum(-0.3, 0, 0.02, 0.14, 0.12, 0.6, 0, F.col('timberLarch'), 'wood', 12);         /* the churn */
    for (const y of [0.1, 0.5]) F.cyl(-0.3, y, 0.02, 0.145, 0.025, 0, F.col('iron'), 'metal');
    F.cyl(-0.3, 0.6, 0.02, 0.015, 0.4, 0, wood, 'wood');
    F.ball(-0.3, 1.0, 0.02, 0.03, F.col('timberLarch'), 'wood');
    for (let i = 0; i < 3; i++) F.frustum(-0.3 + i * 0.32, 0.74, 0.0, 0.08, 0.11, 0.32 - i * 0.06, 0, F.shade(crock, F.rr(-0.1, 0.1)), 'stone', 10);
    F.frustum(0.3, 0, 0.05, 0.1, 0.13, 0.4, 0, crock, 'stone', 10);
  }
});

/* trades and households (FK.ROLES.trade, the 2026-10 interiors-sets pass): forge, anvil, stall, vat, still,
   bins, larder, bunk, locker ... in this culture's style sheet, keyed rustic_trade_<role> */
FK.set({ culture: 'rustic', tier: 'common', roles: 'trade', prefix: 'rustic_trade_', S: RUS_COMMON, names: {
  forge: 'Village forge', anvil: 'Anvil on a larch stump', trough: 'Larch trough', stall: 'Byre stall', hayrack: 'Hay heck', display: 'Market steps', armour_stand: 'Mail on a stand', weapon_rack: 'Axe and spear rack', vat: 'Cheese vat', still: 'Schnapps still', bin: 'Meal bins', larder: 'Pantry cupboard', bunk: "Herder's bunk", locker: 'Larch press', lathe: 'Pole lathe', press: 'Cider press', kiln: 'Lime kiln', grindstone: 'Grindstone', barrel: 'Cellar barrels', altar: 'Stave-church altar' } });

/* ======== Harvested from settlements/highlands (rustic branch) (25 pieces) ======== */
/* The Rustic Highlanders' yard, market, smithy, farm and hall pieces as the Highlands kit draws them
   (src/73-hl-carve.js, 79d-rep-scrap2.js, 80-rus-dwell.js, 81-rus-village.js; 81b reuses the same helpers).
   Kit families: vWood/vPost/hLogX -> wood, vShingleB -> plank, hRubB/vStone -> stone, vIron -> metal,
   hPaint -> wood (painted timber), vThatchB/vConeT -> thatch, hRUWater -> glass, vEmber -> glow, hGold -> gold. */
FURN({
  key: 'hl_rus_woodpile', name: 'Roofed woodpile', culture: 'rustic', tier: 'common', type: 'stack', setting: 'outdoor',
  rooms: ['yard', 'street', 'garden', 'store'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'], source: 'settlements/highlands/src/73-hl-carve.js hnWoodpile',
  w: 6.6, d: 1.6, h: 2.25, variants: 3, variantNames: ['woodshed stack', 'under the eave', 'the winter\'s wood'],
  variantDims: [{ w: 2.2, d: 1.6, h: 1.75 }, { w: 4.0, d: 1.6, h: 1.95 }, { w: 6.6, d: 1.6, h: 2.25 }],
  build: function (F) {
    const W = [1.6, 3.4, 6][F.variant] || 1.6, H = [1.3, 1.5, 1.8][F.variant] || 1.3;
    const pine = F.col('timberPine'), n = Math.round(H / 0.2), m = Math.round(W / 0.2);
    /* split logs end-on, rows 0.19 m apart, each log 0.9 m deep */
    for (let k = 0; k < n; k++) for (let i = 0; i < m; i++) {
      const x = -W / 2 + 0.1 + i * 0.2 + F.rr(-0.01, 0.01), y = 0.1 + k * 0.19;
      F.rod(x, y, -0.45 + F.rr(0, 0.03), x, y, 0.45 - F.rr(0, 0.03), 0.09, F.shade(pine, F.rr(-0.14, 0.06)), 'wood');
    }
    /* the shingle shed roof laid on the stack, falling to the front */
    F.beam(0, H + 0.1 + 0.25 + 0.04, -0.75, 0, H + 0.1 + 0.04, 0.75, W + 0.6, 0.08, F.col('shingleSilver'), 'plank');
  }
});

FURN({
  key: 'hl_rus_shield', name: 'Painted round shield', culture: 'rustic', tier: 'common', type: 'art', setting: 'both',
  rooms: ['hall', 'barracks', 'antechamber', 'court', 'tavern'], anchor: 'wall', clearance: {},
  materials: ['timber', 'gold'], source: 'settlements/highlands/src/80-rus-dwell.js hnRUShield',
  w: 0.86, d: 0.2, h: 0.86, variants: 1,
  build: function (F) {
    const r = 0.42, zb = -0.1, y = 0.43;
    const field = F.pick(['paintRed', 'paintTeal', 'paintWhite', 'paintOchre']), ring = F.pick(['paintBlack', 'paintWhite']);
    F.rod(0, y, zb, 0, y, zb + 0.05, r, field, 'wood');                                 /* the board */
    F.rod(0, y, zb + 0.05, 0, y, zb + 0.08, r * 0.55, ring, 'wood');                    /* the painted ring */
    F.ball(0, y, zb + 0.11, r * 0.18, F.col('goldDeep'), 'gold');                       /* the boss */
  }
});

FURN({
  key: 'hl_rus_stall', name: 'Shingle-roofed market stall', culture: 'rustic', tier: 'common', type: 'stall', setting: 'outdoor',
  rooms: ['market', 'street', 'plaza'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'stone', 'cloth', 'skin'], source: 'settlements/highlands/src/81-rus-village.js hnRUStall',
  w: 3.4, d: 2.5, h: 3.2, variants: 4, variantNames: ['pots', 'cloth', 'cheese', 'fish'],
  build: function (F) {
    const w = 2.8, d = 1.9, c = F.col('timberAged'), rc = F.col('shingleSilver'), kind = F.variant;
    for (const su of [-1, 1]) for (const sv of [-1, 1]) F.cyl(su * (w / 2 - 0.1), 0, sv * (d / 2 - 0.1), 0.07, 2.25, 0, c, 'wood');
    /* a little shingle gable on the posts, boarded gable ends */
    const y0 = 2.25, rise = 0.7 * d / 2, over = 0.3, ext = d / 2 + over, drop = rise * over / (d / 2), tk = 0.12;
    for (let i = 0; i < 4; i++) F.box(0, y0 + i * rise / 4, 0, w, rise / 4, d * (1 - (i + 0.5) / 4), 0, c, 'wood');
    for (const s of [-1, 1]) F.beam(0, y0 + rise + tk / 2, -s * 0.06, 0, y0 - drop + tk / 2, s * ext, w + 2 * over, tk, rc, 'plank');
    /* the counter: a plank top on a front board, toward the front */
    const tz = d / 2 - 0.4;
    F.box(0, 0.85, tz, w - 0.2, 0.08, 0.7, 0, c, 'wood');
    F.box(0, 0, tz, w - 0.3, 0.85, 0.08, 0, F.shade(c, -0.2), 'wood');
    for (let i = 0; i < Math.round(w / 0.55); i++) {
      const u = -w / 2 + 0.4 + i * 0.55, v = tz + F.rr(-0.15, 0.15);
      if (kind === 0) { const r = F.rr(0.1, 0.16); F.frustum(u, 0.93, v, r, r * 0.85, F.rr(0.2, 0.35), 0, F.pick(['clayRed', 'clayDeep', 'clayTan']), 'stone', 10); }
      else if (kind === 2) F.cyl(u, 0.93, v, 0.16, 0.12, 0, F.pick(['cheeseYellow', 'cheeseGold']), 'cloth');
      else if (kind === 3) F.box(u, 1.5, d / 2 - 0.15, 0.08, 0.4, 0.14, 0, F.pick(['fishSilver', 'fishGrey']), 'skin');
      else F.box(u, 0.93, v, 0.36, F.rr(0.08, 0.3), 0.3, F.rr(-0.2, 0.2), F.pick(['paintBlue', 'paintRed', 'paintWhite', 'paintTeal', 'paintOchre']), 'cloth');
    }
    if (kind === 3) F.rod(-w / 2 + 0.1, 1.92, d / 2 - 0.15, w / 2 - 0.1, 1.92, d / 2 - 0.15, 0.015, F.col('cordDark'), 'wood');   /* the fish line */
    F.box(0, 0, -d / 2 + 0.35, 0.7, 0.56, 0.63, 0, F.col('timberLarch'), 'wood');        /* a crate behind */
  }
});

FURN({
  key: 'hl_rus_trough', name: 'Plank water trough', culture: 'rustic', tier: 'common', type: 'vessel', setting: 'outdoor',
  rooms: ['yard', 'stable', 'street'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'glass'], source: 'settlements/highlands/src/81-rus-village.js hnRUTrough',
  w: 2.4, d: 0.6, h: 0.57, variants: 2, variantNames: ['short', 'long'],
  variantDims: [{ w: 1.6, d: 0.6, h: 0.57 }, { w: 2.4, d: 0.6, h: 0.57 }],
  build: function (F) {
    const L = F.variant === 1 ? 2.4 : 1.6, c = F.col('timberAged');
    F.box(0, 0, 0, L, 0.55, 0.6, 0, c, 'wood');
    for (const s of [-1, 1]) F.box(0, 0.5, s * 0.27, L, 0.05, 0.06, 0, F.shade(c, 0.08), 'wood');   /* the rim boards */
    F.box(0, 0.47, 0, L - 0.12, 0.1, 0.48, 0, F.col('water'), 'glass');
  }
});

FURN({
  key: 'hl_rus_log_bench', name: 'Split-log bench', culture: 'rustic', tier: 'court', type: 'bench', setting: 'both',
  rooms: ['yard', 'plaza', 'street', 'hall', 'barracks'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'], source: 'settlements/highlands/src/81-rus-village.js hnRUBench',
  w: 3.0, d: 0.34, h: 0.53, variants: 2, variantNames: ['two-seat', 'long'],
  variantDims: [{ w: 2.0, d: 0.34, h: 0.53 }, { w: 3.0, d: 0.34, h: 0.53 }],
  build: function (F) {
    const L = F.variant === 1 ? 3 : 2, c = F.shade('timberPine', -0.25);
    for (const s of [-1, 1]) F.frustum(s * (L / 2 - 0.3), 0, 0, 0.14, 0.12, 0.3, 0, F.shade(c, -0.1), 'wood', 8);   /* the stumps */
    F.rod(-L / 2, 0.38, 0, L / 2, 0.38, 0, 0.15, c, 'wood');                              /* the log */
    F.box(0, 0.49, 0, L - 0.06, 0.04, 0.24, 0, F.shade(c, 0.12), 'wood');                 /* the split face */
  }
});

FURN({
  key: 'hl_rus_cart', name: 'Farm cart', culture: 'rustic', tier: 'common', type: 'tool', setting: 'outdoor',
  rooms: ['yard', 'street', 'market', 'stable'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'cloth'], source: 'settlements/highlands/src/81-rus-village.js hnRUCart',
  w: 1.64, d: 3.74, h: 1.45, variants: 2, variantNames: ['empty', 'with sacks'],
  variantDims: [{ w: 1.64, d: 3.74, h: 1.1 }, { w: 1.64, d: 3.74, h: 1.45 }],
  build: function (F) {
    F.shift(0, -0.77);
    const c = F.col('timberAged'), dk = F.shade(c, -0.3);
    F.box(0, 0.7, 0, 1.3, 0.35, 2.2, 0, c, 'wood');                                       /* the box bed */
    for (const s of [-1, 1]) {
      F.rod(s * 0.74, 0.55, -0.2, s * 0.82, 0.55, -0.2, 0.55, dk, 'wood');                /* disc wheels */
      F.rod(s * 0.7, 0.55, -0.2, s * 0.86, 0.55, -0.2, 0.09, F.shade(dk, -0.2), 'wood');  /* hubs */
      F.beam(s * 0.45, 0.8, 1.1, s * 0.45, 0.3, 2.6, 0.08, 0.08, c, 'wood');              /* the shafts */
    }
    F.rod(-0.7, 0.55, -0.2, 0.7, 0.55, -0.2, 0.05, dk, 'wood');                           /* the axle */
    if (F.variant === 1) for (let i = 0; i < 4; i++)
      F.blob((i % 2 ? 0.3 : -0.3) + F.rr(-0.04, 0.04), 1.05 + 0.2, -0.6 + Math.floor(i / 2) * 0.9 + F.rr(-0.05, 0.05), 0.27, 0.4, F.rr(0, 3), F.pick(['sackBurlap', 'sackPale']), 'cloth');
  }
});

FURN({
  key: 'hl_rus_shutter_counter', name: 'Shutter counter', culture: 'rustic', tier: 'common', type: 'counter', setting: 'both',
  rooms: ['shop', 'market', 'street'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['timber', 'stone'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusShops (shutter counter)',
  w: 3.12, d: 1.06, h: 2.82, variants: 1,
  build: function (F) {
    F.shift(0, -0.53);                                     /* authored from the wall plane at z = 0 */
    const trim = F.pick(['paintTeal', 'paintRed', 'paintBlue']), dk = F.col('timberTar'), log = F.shade('timberPine', -0.12);
    F.box(0, 0, 0.05, 2.8, 0.9, 0.1, 0, log, 'wood');                                     /* the wall below the hatch */
    F.box(0, 0.9, 0.05, 2.8, 1.2, 0.1, 0, F.col('hollowDark'), 'wood');                   /* the open hatch */
    for (const s of [-1, 1]) F.box(s * 1.48, 0.8, 0.08, 0.16, 1.45, 0.14, 0, trim, 'wood');   /* painted jambs */
    F.beam(0, 1.823, 0.276, 0, 2.777, 0.824, 2.9, 0.06, trim, 'wood');                    /* top leaf, propped up as an awning */
    for (const s of [-1, 1]) F.beam(s * 1.3, 1.3, 0.1, s * 1.3, 2.24, 1.0, 0.04, 0.04, dk, 'wood');
    F.box(0, 0.82, 0.5, 2.9, 0.08, 0.9, 0, trim, 'wood');                                 /* bottom leaf let down as the counter */
    for (const s of [-1, 1]) F.beam(s * 1.2, 0.3, 0.05, s * 1.2, 0.8, 0.85, 0.05, 0.05, dk, 'wood');
    for (let k = 0; k < 6; k++) F.frustum(-1.1 + k * 0.45, 0.9, 0.5, 0.12, 0.1, F.rr(0.18, 0.3), 0, F.pick(['clayRed', 'clayDeep', 'clayTan', 'cheeseYellow']), 'stone', 10);
  }
});

FURN({
  key: 'hl_rus_porch_set', name: 'Inn porch table and benches', culture: 'rustic', tier: 'common', type: 'table', setting: 'both',
  rooms: ['tavern', 'yard', 'street', 'hall'], anchor: 'floor', clearance: { left: 0.4, right: 0.4 },
  materials: ['timber'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusTavern (porch benches and tables)',
  w: 1.84, d: 2.66, h: 0.77, variants: 1,
  build: function (F) {
    F.shift(0, 0.3375);
    const dk = F.shade('timberTar', 0.08);
    /* solid plank blocks, as the inn sets them out under its balcony: wall bench, table, front bench */
    F.box(0, 0, -1.45, 1.8, 0.45, 0.4, 0, dk, 'wood');
    F.box(0, 0, 0, 1.8, 0.75, 0.8, 0, dk, 'wood');
    F.box(0, 0.73, 0, 1.84, 0.04, 0.84, 0, F.shade(dk, 0.1), 'wood');
    F.box(0, 0, 0.8, 1.8, 0.45, 0.35, 0, dk, 'wood');
    for (const z of [-1.45, 0.8]) F.box(0, 0.43, z, 1.82, 0.03, z < 0 ? 0.42 : 0.37, 0, F.shade(dk, 0.1), 'wood');
  }
});

FURN({
  key: 'hl_rus_forge', name: 'Fieldstone forge with hood', culture: 'rustic', tier: 'poor', type: 'stove', setting: 'both',
  rooms: ['smithy', 'workshop'], anchor: 'floor', clearance: { front: 1.0, left: 0.4 },
  materials: ['stone', 'timber', 'emissive'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusSmithy (hearth, hood, chimney, bellows)',
  w: 2.5, d: 1.5, h: 3.38, variants: 1,
  build: function (F) {
    F.shift(0.3, 0.1);
    const rub = F.col('stoneRubble'), bel = F.col('timberBellows');
    F.box(0, 0, 0, 1.8, 0.9, 1.3, 0, rub, 'stone');                                       /* the hearth */
    F.blob(0, 0.95, 0, 0.3, 0.24, 0, F.col('ember'), 'glow');
    F.cone(0, 0.92, 0, 0.12, 0.3, 0, F.col('flame'), 'glow');
    F.lamp(0, 1.2, 0, 0.8, 6);
    F.pyrRoof(0, 1.6, -0.1, 1.9, 1.0, 1.5, 0, F.shade(rub, -0.06), 'stone');             /* the hood */
    F.box(0, 2.3, -0.2, 0.62, 0.9, 0.62, 0, rub, 'stone');                                /* chimney stack */
    F.box(0, 3.2, -0.2, 0.78, 0.14, 0.78, 0, F.col('stoneAshlar'), 'stone');
    F.box(0, 3.34, -0.2, 0.31, 0.04, 0.31, 0, F.col('hollowDark'), 'stone');
    /* the bellows on a pair of stakes */
    for (const s of [-1, 1]) F.box(-1.3, 0, 0.2 + s * 0.3, 0.08, 0.5, 0.08, 0, F.shade(bel, -0.2), 'wood');
    F.box(-1.3, 0.5, 0.2, 0.5, 0.3, 0.9, 0, bel, 'wood');
    F.hipRoof(-1.3, 0.8, 0.2, 0.5, 0.2, 0.9, 0, bel, 'wood');
  }
});

FURN({
  key: 'hl_rus_anvil', name: 'Anvil on a stump', culture: 'rustic', tier: 'poor', type: 'workstation', setting: 'both',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: { front: 0.8, back: 0.6 },
  materials: ['timber', 'metal'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusSmithy (anvil on a stump)',
  w: 0.56, d: 1.25, h: 0.93, variants: 1,
  build: function (F) {
    F.shift(0, -0.2);
    const iron = F.col('ironBlack');
    F.frustum(0, 0, 0, 0.28, 0.24, 0.55, 0, F.col('timberAged'), 'wood', 8);
    F.box(0, 0.55, 0, 0.26, 0.26, 0.6, 0, iron, 'metal');
    F.box(0, 0.81, 0, 0.34, 0.12, 0.85, 0, iron, 'metal');                                /* the face */
    F.rod(0, 0.87, 0.4, 0, 0.87, 0.62, 0.055, iron, 'metal');                             /* the horn, tapering */
    F.rod(0, 0.87, 0.62, 0, 0.87, 0.8, 0.03, iron, 'metal');
  }
});

FURN({
  key: 'hl_rus_quench_barrel', name: 'Quench barrel', culture: 'rustic', tier: 'poor', type: 'vessel', setting: 'both',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: {},
  materials: ['timber', 'metal', 'glass'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusSmithy (quench barrel)',
  w: 0.76, d: 0.76, h: 0.8, variants: 1,
  build: function (F) {
    F.frustum(0, 0, 0, 0.324, 0.36, 0.8, 0, F.col('timberAged'), 'wood', 12);
    for (const y of [0.18, 0.6]) F.cyl(0, y, 0, 0.372, 0.04, 0, F.col('ironBlack'), 'metal');
    F.cyl(0, 0.74, 0, 0.32, 0.04, 0, F.col('water'), 'glass');
  }
});

FURN({
  key: 'hl_rus_grindstone', name: 'Grindstone on a block', culture: 'rustic', tier: 'poor', type: 'workstation', setting: 'both',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['stone', 'timber', 'metal'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusSmithy (grindstone)',
  w: 0.5, d: 0.92, h: 1.16, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.5, 0.5, 0.2, 0, F.col('timberAged'), 'wood');
    F.rod(-0.06, 0.7, 0, 0.06, 0.7, 0, 0.45, F.col('stoneRubble'), 'stone');
    F.rod(-0.2, 0.7, 0, 0.2, 0.7, 0, 0.03, F.col('ironBlack'), 'metal');
  }
});

FURN({
  key: 'hl_rus_tool_board', name: 'Smith\'s tool board', culture: 'rustic', tier: 'poor', type: 'rack', setting: 'both',
  rooms: ['smithy', 'workshop'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'metal'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusSmithy (back boards and tool rack)',
  w: 2.2, d: 0.2, h: 1.82, variants: 1,
  build: function (F) {
    const wd = F.col('timberAged'), iron = F.col('ironBlack');
    F.box(0, 0, -0.05, 2.2, 1.5, 0.1, 0, wd, 'wood');                                     /* the half-height back boards */
    for (let i = 1; i < 4; i++) F.box(-1.1 + i * 0.55, 0, 0.01, 0.06, 1.5, 0.03, 0, F.shade(wd, -0.2), 'wood');
    for (let k = 0; k < 6; k++) {
      const x = -0.88 + k * 0.35, h = F.rr(0.5, 0.8);
      F.box(x, 1.0, 0.04, 0.05, h, 0.04, 0, iron, 'metal');                                /* handles, hung on the boards */
      if (k % 2 === 0) F.box(x, 1.0 + h - 0.04, 0.04, 0.16, 0.06, 0.06, 0, iron, 'metal'); /* a hammer head, a pair of jaws */
    }
  }
});

FURN({
  key: 'hl_rus_spear_rack', name: 'Spear and shield rack', culture: 'rustic', tier: 'court', type: 'weapon', setting: 'both',
  rooms: ['barracks', 'yard', 'court', 'hall'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal', 'gold'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusMuster (weapon racks)',
  w: 3.0, d: 0.84, h: 2.86, variants: 1,
  build: function (F) {
    F.shift(0, 0.04);
    const dk = F.col('timberTar');
    for (const s of [-1, 1]) F.beam(s * 1.4, 0, -0.4, s * 1.4, 1.7, 0, 0.1, 0.1, dk, 'wood');   /* A-frame ends */
    F.box(0, 1.55, 0, 3, 0.12, 0.12, 0, dk, 'wood');
    F.box(0, 0.5, 0.1, 3, 0.1, 0.1, 0, dk, 'wood');
    for (let k = 0; k < 8; k++) {
      const x = -1.2 + k * 0.34;
      F.beam(x, 0.02, 0.35, x, 2.6, -0.08, 0.04, 0.04, F.col('timberShaft'), 'wood');
      F.cone(x, 2.58, -0.09, 0.035, 0.25, 0, F.col('steelGrey'), 'metal');
    }
    /* shields hung on the back of the rack */
    for (let k = 0; k < 3; k++) {
      const x = -1 + k, y = 1.0, r = 0.4;
      F.rod(x, y, -0.13, x, y, -0.18, r, F.pick(['paintRed', 'paintTeal', 'paintWhite', 'paintOchre']), 'wood');
      F.rod(x, y, -0.18, x, y, -0.21, r * 0.55, F.col('paintBlack'), 'wood');
      F.ball(x, y, -0.23, r * 0.18, F.col('goldDeep'), 'gold');
    }
  }
});

FURN({
  key: 'hl_rus_pell', name: 'Training pell', culture: 'rustic', tier: 'court', type: 'tool', task: ['melee-training'], setting: 'outdoor',
  rooms: ['yard', 'barracks', 'court'], anchor: 'floor', clearance: { front: 1.2, left: 0.6, right: 0.6 },
  materials: ['timber', 'thatch'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusMuster (pells)',
  w: 0.9, d: 0.3, h: 1.8, variants: 1,
  build: function (F) {
    const wd = F.col('timberAged');
    F.frustum(0, 0, 0, 0.13, 0.11, 1.8, 0, wd, 'wood', 8);
    F.box(0, 1.25, 0, 0.9, 0.1, 0.1, 0, wd, 'wood');                                      /* the arms */
    F.box(0, 1.4, 0, 0.3, 0.35, 0.3, 0, F.col('strawHay'), 'thatch');                     /* the straw head */
  }
});

FURN({
  key: 'hl_rus_target_butt', name: 'Archery butt', culture: 'rustic', tier: 'court', type: 'tool', task: ['ranged-training'], setting: 'outdoor',
  rooms: ['yard', 'barracks', 'court'], anchor: 'floor', clearance: { front: 3.0 },
  materials: ['thatch', 'timber'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusMuster (target butts)',
  w: 1.6, d: 0.98, h: 1.6, variants: 1,
  build: function (F) {
    F.shift(0, -0.035);
    const straw = F.col('strawHay');
    F.box(0, 0, 0, 1.6, 0.8, 0.9, 0, straw, 'thatch');
    F.box(0, 0.8, 0, 1.6, 0.8, 0.9, 0, F.shade(straw, -0.08), 'thatch');
    F.rod(0, 1.05, 0.44, 0, 1.05, 0.47, 0.55, F.col('paintWhite'), 'wood');               /* the painted face */
    F.rod(0, 1.05, 0.47, 0, 1.05, 0.495, 0.38, F.col('paintRed'), 'wood');
    F.rod(0, 1.05, 0.495, 0, 1.05, 0.52, 0.2, F.col('paintBlack'), 'wood');
  }
});

FURN({
  key: 'hl_rus_horn_post', name: 'Horn post', culture: 'rustic', tier: 'court', type: 'monument', setting: 'outdoor',
  rooms: ['yard', 'plaza', 'court', 'barracks'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'bone', 'rope'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusMuster (horn post, hnRUHornTop)',
  w: 1.48, d: 0.76, h: 4.32, variants: 1,
  build: function (F) {
    F.shift(0.275, -0.21);
    const dk = F.col('timberTar'), bone = F.col('hornBone'), s = 0.7;
    F.frustum(0, 0, 0, 0.16, 0.14, 3.2, 0, dk, 'wood', 8);
    /* crossed horns on the post top: two curled boards each side */
    for (const sd of [-1, 1]) {
      const P = [[0, 3.1], [sd * 0.45 * s, 3.1 + 0.6 * s], [sd * 0.5 * s, 3.1 + 1.3 * s], [sd * 0.25 * s, 3.1 + 1.7 * s]], W = [0.22, 0.18, 0.13];
      for (let i = 0; i < 3; i++) F.beam(P[i][0], P[i][1], 0, P[i + 1][0], P[i + 1][1], 0, W[i] * s, 0.1, F.shade(bone, -0.05 * i), 'bone');
    }
    /* the signal horn on its peg and cord */
    F.box(0, 2.4, 0.25, 0.08, 0.08, 0.4, 0, dk, 'wood');
    F.rod(0, 2.12, 0.45, -0.35, 2.03, 0.45, 0.12, F.col('hornPale'), 'bone');
    F.rod(-0.35, 2.03, 0.45, -0.7, 1.94, 0.45, 0.08, F.shade('hornPale', -0.05), 'bone');
    F.rod(-0.7, 1.94, 0.45, -0.97, 1.87, 0.45, 0.04, F.shade('hornPale', -0.1), 'bone');
    F.rod(0, 2.44, 0.45, 0.45, 2.2, 0.45, 0.012, F.col('cordDark'), 'rope');
  }
});

FURN({
  key: 'hl_rus_carved_pillar', name: 'Carved hall pillar', culture: 'rustic', tier: 'court', type: 'monument', setting: 'outdoor',
  rooms: ['plaza', 'court', 'temple', 'street'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'stone', 'gold', 'metal', 'bone'], source: 'settlements/highlands/src/73-hl-carve.js hnPillar (the Rustic totem: hnTotem outside the tribes) + 81 hnRUHornTop',
  w: 1.35, d: 1.27, h: 9.2, variants: 2, variantNames: ['with the roundel', 'horned corner pole'],
  variantDims: [{ w: 1.27, d: 1.27, h: 8.52 }, { w: 1.35, d: 1.03, h: 9.2 }],
  build: function (F) {
    const v = F.variant, r = v ? 0.33 : 0.396, h = v ? 7.4 : 6.8, s = r * 2;
    const stone = F.col('stoneAshlar'), wood = F.shade('timberTar', 0.06);
    const bh = Math.min(0.42, h * 0.1), ch = Math.min(0.55, h * 0.13), sh = h - bh - 0.1 - ch;
    F.box(0, 0, 0, s * 1.55, bh, s * 1.55, 0, stone, 'stone');                           /* plinth and step */
    F.box(0, bh, 0, s * 1.25, 0.1, s * 1.25, 0, F.shade(stone, -0.05), 'stone');
    F.box(0, bh + 0.1, 0, s, sh, s, 0, wood, 'wood');                                     /* the square shaft */
    /* the stacked motif column, as painted bands with a carved boss on each face */
    const n = Math.max(3, Math.round(sh / 0.95)), ph = sh / n;
    for (let i = 0; i < n; i++) {
      const y = bh + 0.1 + i * ph + 0.08, c = F.pick(['paintRed', 'paintTeal', 'paintOchre']);
      F.box(0, y, 0, s + 0.02, ph - 0.16, s + 0.02, 0, c, 'wood');
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; F.ball(Math.sin(a) * (s / 2 + 0.01), y + (ph - 0.16) / 2, Math.cos(a) * (s / 2 + 0.01), s * 0.16, F.col('paintBlack'), 'wood'); }
    }
    const cy = h - ch;                                                                    /* the painted capital */
    F.box(0, cy, 0, s * 1.08, ch * 0.28, s * 1.08, 0, F.col('paintBlack'), 'wood');
    F.box(0, cy + ch * 0.28, 0, s * 1.3, ch * 0.34, s * 1.3, 0, F.pick(['paintRed', 'paintTeal']), 'wood');
    F.box(0, cy + ch * 0.62, 0, s * 1.6, ch * 0.38, s * 1.6, 0, wood, 'wood');
    if (v === 0) {                                                                        /* the free pillar's roundel */
      const R = Math.max(0.7, s * 1.6), yc = h + R * 0.35 + R / 2;
      F.box(0, h, 0, 0.04, R * 0.35, 0.04, 0, F.col('ironBlack'), 'metal');
      F.box(0, h + R * 0.35 - 0.04, 0, R * 0.36, 0.08, 0.12, 0, F.col('gold'), 'gold');
      F.rod(0, yc, -0.02, 0, yc, 0.02, R / 2, F.col('paintBlack'), 'wood');
      F.rod(0, yc, -0.03, 0, yc, 0.03, R / 2 - 0.06, F.pick(['paintRed', 'paintTeal', 'paintWhite']), 'wood');
      F.rod(0, yc, -0.04, 0, yc, 0.04, R * 0.24, F.col('paintOchre'), 'wood');
      F.rod(0, yc, -0.05, 0, yc, 0.05, R * 0.1, F.col('paintBlack'), 'wood');
    } else {                                                                              /* crossed horns on the post top */
      const sc = 1.1, y0 = h - 0.1, bone = F.col('hornBone');
      for (const sd of [-1, 1]) {
        const P = [[0, y0], [sd * 0.45 * sc, y0 + 0.6 * sc], [sd * 0.5 * sc, y0 + 1.3 * sc], [sd * 0.25 * sc, y0 + 1.7 * sc]], W = [0.22, 0.18, 0.13];
        for (let i = 0; i < 3; i++) F.beam(P[i][0], P[i][1], 0, P[i + 1][0], P[i + 1][1], 0, W[i] * sc, 0.1, F.shade(bone, -0.05 * i), 'bone');
      }
    }
  }
});

FURN({
  key: 'hl_rus_grave_board', name: 'Carved grave board', culture: 'rustic', tier: 'court', type: 'tomb', setting: 'outdoor',
  rooms: ['graveyard', 'temple'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusTemple (churchyard boards, hnForm hFormV)',
  w: 0.38, d: 0.08, h: 0.95, variants: 1,
  build: function (F) {
    const ground = F.pick(['timberLarchLight', 'paintWhite']);
    F.box(0, 0, 0, 0.36, 0.92, 0.04, 0, F.col('paintBlack'), 'wood');                     /* the board and its black line */
    F.box(0, 0.03, 0.005, 0.3, 0.86, 0.04, 0, ground, 'wood');
    F.rod(0, 0.72, 0.02, 0, 0.72, 0.035, 0.1, F.col('paintBlack'), 'wood');               /* an ovoid head */
    F.rod(0, 0.72, 0.035, 0, 0.72, 0.04, 0.045, F.col('paintTeal'), 'wood');
    for (let k = 0; k < 3; k++) {                                                         /* stacked U-forms */
      const y = 0.18 + k * 0.15, c = k % 2 ? F.col('paintBlack') : F.col('paintRed');
      F.box(0, y, 0.025, 0.18, 0.025, 0.02, 0, c, 'wood');
      for (const s of [-1, 1]) F.box(s * 0.08, y, 0.025, 0.025, 0.1, 0.02, 0, c, 'wood');
    }
    F.box(0, 0.92, 0, 0.38, 0.03, 0.06, 0, F.col('paintBlack'), 'wood');
  }
});

FURN({
  key: 'hl_rus_fountain_trough', name: 'Farmyard fountain trough', culture: 'rustic', tier: 'common', type: 'fountain', setting: 'outdoor',
  rooms: ['yard', 'street', 'garden', 'plaza'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal', 'glass'], source: 'settlements/highlands/src/80-rus-dwell.js buildHlRusRichA (fountain trough)',
  w: 3.1, d: 0.7, h: 1.3, variants: 1,
  build: function (F) {
    F.shift(0.15, 0);
    const log = F.shade('timberTar', 0.25);
    F.box(0, 0, 0, 2.8, 0.7, 0.7, 0, log, 'wood');                                        /* the hollowed log */
    F.box(0, 0.6, 0, 2.6, 0.12, 0.5, 0, F.col('water'), 'glass');
    F.cyl(-1.6, 0, 0, 0.1, 1.3, 0, log, 'wood');                                          /* the spout post */
    F.beam(-1.55, 1.1, 0, -0.9, 1.02, 0, 0.05, 0.05, F.col('iron'), 'metal');
    F.rod(-0.9, 1.0, 0, -0.86, 0.7, 0, 0.015, F.col('water'), 'glass');                   /* the running water */
  }
});

FURN({
  key: 'hl_rus_hay_rack', name: 'Hay-drying rack', culture: 'rustic', tier: 'common', type: 'rack', setting: 'outdoor',
  rooms: ['yard', 'garden'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['timber', 'thatch'], source: 'settlements/highlands/src/80-rus-dwell.js hnRUHesje',
  w: 7.6, d: 0.36, h: 2.21, variants: 2, variantNames: ['short', 'field length'],
  variantDims: [{ w: 5.1, d: 0.36, h: 2.21 }, { w: 7.6, d: 0.36, h: 2.21 }],
  build: function (F) {
    const L = F.variant === 1 ? 7.5 : 5, h = 1.9, n = Math.max(2, Math.round(L / 2.2));
    const c = F.col('timberAged'), hay = F.pick(['strawHay', 'cheeseGold', 'goodsTan']);
    for (let i = 0; i <= n; i++) F.cyl(-L / 2 + L * i / n, 0, 0, 0.05, h + 0.2, 0, c, 'wood');
    for (let k = 0; k < 3; k++) F.box(0, 0.45 + k * 0.52, 0, L - 0.2, 0.44, 0.34, 0, F.shade(hay, -0.05 * k), 'thatch');
    F.box(0, 0.45 + 1.56, 0, L - 0.5, 0.2, 0.24, 0, hay, 'thatch');
  }
});

FURN({
  key: 'hl_rus_scarecrow', name: 'Scarecrow', culture: 'rustic', tier: 'common', type: 'statue', setting: 'outdoor',
  rooms: ['garden', 'yard'], anchor: 'floor', clearance: {},
  materials: ['timber', 'cloth', 'thatch'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusFarm (scarecrow)',
  w: 1.3, d: 0.6, h: 2.35, variants: 1,
  build: function (F) {
    const wd = F.col('timberAged');
    F.cyl(0, 0, 0, 0.06, 2.1, 0, wd, 'wood');
    F.box(0, 1.6, 0, 1.3, 0.08, 0.08, 0, wd, 'wood');
    F.box(0, 1.1, 0, 0.5, 0.6, 0.3, 0, F.col('clothRust'), 'cloth');                      /* the coat */
    F.ball(0, 1.95, 0, 0.18, F.col('sackBurlap'), 'cloth');                               /* a sack head */
    F.cone(0, 2.05, 0, 0.3, 0.3, 0, F.col('strawHay'), 'thatch');                         /* straw hat */
  }
});

FURN({
  key: 'hl_rus_millstones', name: 'Spare millstones', culture: 'rustic', tier: 'common', type: 'stack', setting: 'outdoor',
  rooms: ['yard', 'workshop', 'store'], anchor: 'floor', clearance: {},
  materials: ['stone'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusMill (millstones at the door)',
  w: 0.95, d: 1.35, h: 1.1, variants: 1,
  build: function (F) {
    const st = F.col('stoneMill');
    /* two stones on edge, leaning a little, one behind the other */
    const ax = [-0.969, -0.149, 0.197];
    for (const s of [0, 1]) {
      const cx = -0.15 + s * 0.3, cz = -0.12 + s * 0.25, cy = 0.55, t = 0.125;
      F.rod(cx - ax[0] * t, cy - ax[1] * t, cz - ax[2] * t, cx + ax[0] * t, cy + ax[1] * t, cz + ax[2] * t, 0.55, F.shade(st, -0.05 * s), 'stone');
      F.rod(cx - ax[0] * (t + 0.01), cy - ax[1] * (t + 0.01), cz - ax[2] * (t + 0.01), cx + ax[0] * (t + 0.01), cy + ax[1] * (t + 0.01), cz + ax[2] * (t + 0.01), 0.08, F.col('hollowDark'), 'stone');
    }
  }
});

FURN({
  key: 'hl_rus_cloth_stall', name: 'Cloth-roofed trestle stall', culture: 'rustic', tier: 'common', type: 'stall', setting: 'outdoor',
  rooms: ['market', 'plaza', 'street'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'cloth', 'stone', 'wicker'], source: 'settlements/highlands/src/79d-rep-scrap2.js hnStall (the Highland towns\' plaza stall)',
  w: 2.7, d: 2.2, h: 2.66, variants: 1,
  build: function (F) {
    const w = 2.4, d = 1.8, post = F.col('timberPost');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.cyl(sx * (w / 2 - 0.08), 0, sz * (d / 2 - 0.08), 0.05, 2.2 + (sz < 0 ? 0.3 : 0), 0, post, 'wood');
    F.beam(0, 2.275, -1.086, 0, 2.625, 1.086, w + 0.3, 0.04, F.pick(['awningRed', 'awningTeal', 'awningSaffron', 'paintBlue', 'awningGreen']), 'cloth');
    const tz = d / 2 - 0.45;
    F.box(0, 0.75, tz, w - 0.3, 0.08, 0.7, 0, F.col('timberTrestle'), 'wood');             /* the trestle table */
    for (const s of [-1, 1]) F.box(s * (w / 2 - 0.4), 0, tz, 0.08, 0.75, 0.6, 0, post, 'wood');
    for (let k = 0; k < 5; k++) {
      const x = F.rr(-w / 2 + 0.4, w / 2 - 0.4), z = tz + F.rr(-0.2, 0.2), r = F.rr(0.12, 0.2), h = F.rr(0.16, 0.3);
      const c = F.pick(['goodsRust', 'goodsTan', 'goodsSage', 'paintRed', 'paintWhite', 'goodsBrown']), kind = Math.floor(F.rnd() * 4);
      if (kind === 0) F.frustum(x, 0.83, z, r * 0.7, r * 0.6, h, 0, c, 'stone', 10);       /* a pot */
      else if (kind === 1) F.ball(x, 0.83 + r * 0.7, z, r * 0.7, c, 'wicker');              /* a gourd */
      else if (kind === 2) F.blob(x, 0.83 + h / 2, z, r * 0.8, h, 0, c, 'cloth');          /* a sack */
      else F.frustum(x, 0.83, z, r * 0.6, r * 0.66, h, 0, c, 'wood', 10);                   /* a keg */
    }
  }
});

FURN({
  key: 'hl_rus_porch_bench', name: 'Plank porch bench', culture: 'rustic', tier: 'common', type: 'bench', setting: 'both',
  rooms: ['yard', 'street', 'tavern', 'cottage'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'], source: 'settlements/highlands/src/80-rus-dwell.js buildHlRusPoorA / MidA / RichA (porch benches)',
  w: 2.2, d: 0.4, h: 0.45, variants: 2, variantNames: ['cabin', 'farmhouse'],
  variantDims: [{ w: 1.4, d: 0.36, h: 0.42 }, { w: 2.2, d: 0.4, h: 0.45 }],
  build: function (F) {
    const L = F.variant === 1 ? 2.2 : 1.4, D = F.variant === 1 ? 0.4 : 0.36, H = F.variant === 1 ? 0.45 : 0.42;
    const c = F.variant === 1 ? F.col('timberTar') : F.col('timberAged');
    F.box(0, H - 0.06, 0, L, 0.06, D, 0, F.shade(c, 0.08), 'wood');                       /* the seat plank */
    for (const s of [-1, 1]) F.box(s * (L / 2 - 0.08), 0, 0, 0.1, H - 0.06, D - 0.04, 0, c, 'wood');   /* slab ends */
    F.box(0, H - 0.2, D / 2 - 0.04, L - 0.2, 0.14, 0.04, 0, F.shade(c, -0.1), 'wood');    /* the apron */
  }
});

/* training furniture (FK.ROLES.training, 2026-10): a melee and a ranged practice piece in this culture's style sheet, keyed rustic_training_<role> */
FK.set({ culture: 'rustic', tier: 'common', roles: 'training', prefix: 'rustic_training_', S: RUS_COMMON, names: {
  training_dummy: 'Larch practice post', archery_butt: 'Straw archery butt' } });

/* ---- core/catalog/krator-furniture-runtime.js ---- */
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


return KF_API;
})();
