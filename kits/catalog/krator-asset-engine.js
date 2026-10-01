/* ======================================================================
   Krator Asset Engine
   Shared contract + geometry kit for the ASSET (building) / FURN / PLANT
   registries harvested from Voth, Iziz, Mav's Refuge, Girder, Yuni and the
   Ancients kit. Include this file (or the equivalent globals from your own
   build) before krator-master-furniture.js, krator-master-plants.js and/or
   krator-master-buildings-*.js.

   Provides: scene/camera/renderer, orbit + WASD/walk camera control, a
   geometry kit (box/cyl/cone/dome/blob/ball/beam/rod/frustum/pyrRoof), a
   procedural F.tree() helper, the three registries with per-variant
   variantDims support, buildAsset/buildFurn/buildPlant (each returning a
   selectable THREE.Group), rebuildInstance() and measureInstance(), the
   per-culture furniture palette FPAL (F.col / F.cols / key-aware F.pick and
   F.shade) and the building type vocabulary BUILDING_TYPES.

   Conventions that matter:
     - box/cyl/cone/dome sit with their BOTTOM at y; blob/ball are CENTRED at y.
     - The build frame's origin is the footprint centre on the ground, +z FRONT.
     - F.frustum's r is a HALF-WIDTH: the block spans 2*r. With sides:4 the flat
       faces are square to the frame, so the front face sits at local z = +r.
       It is square in plan and cannot make a rectangular trough — use boxes.
     - F.pyrRoof covers EXACTLY w by d at the eaves and meets at one point;
       F.hipRoof covers the same w by d but rises to a RIDGE along the longer
       side — use it for any roof that is not square.
     - A vertical-axis F.cyl cannot be tilted; use F.rod/F.beam between two
       points for anything leaning, arching or horizontal.
     - For a block placed at (cos a, sin a) * r, ry = -a points its long axis
       RADIALLY; for a tangential ring segment you want ry = -a - PI/2.
     - measureInstance() measures transformed vertices, not Box3.expandByObject,
       which takes the AABB of an AABB and overstates anything rotated off-axis.
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

/* ---------------------------------------------------------------- scene */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd8dccb);
scene.fog = new THREE.Fog(0xc9cdbb, 700, 2800);

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 5000);
camera.position.set(0, 70, 130);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById('app').appendChild(renderer.domElement);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.86;

scene.add(new THREE.HemisphereLight(0xcfd9f2, 0x3d3a2c, 0.42));
const sun = new THREE.DirectionalLight(0xffeccb, 1.55);
sun.position.set(160, 260, 90);
scene.add(sun);
/* low cool fill from the opposite side so unlit faces read as form, not flat white */
const fill = new THREE.DirectionalLight(0x8ea6cc, 0.28);
fill.position.set(-140, 90, -120);
scene.add(fill);

/* subdivided: one 8 km quad interpolates depth badly in software GL (SwiftShader), and
   hid anything within ~3 cm of the ground (labels, rugs, mats) a few metres off the origin */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(8000, 8000, 100, 100),
  new THREE.MeshLambertMaterial({ color: 0x9b9472 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const grid = new THREE.GridHelper(8000, 400, 0x333333, 0x333333);
grid.material.opacity = 0.05;
grid.material.transparent = true;
scene.add(grid);

/* ------------------------------------------------------- camera control
   Minimal self-contained orbit/pan/zoom + WASD fly/walk, no external dependency.
   Two modes share one anchor (ctl.target) and one heading (az/el):
     orbit  — camera sits ctl.dist away, orbiting the anchor
     walk   — camera sits AT the anchor looking along the heading (first person)
   WASD moves the anchor in both, so it pans the sheet in orbit and walks in walk. */
const ctl = {
  target: new THREE.Vector3(0, 6, 0), dist: 150, az: 0.9, el: 0.55,
  dragging: false, panning: false, lastX: 0, lastY: 0,
  walk: false, eyeHeight: 1.7, speed: 1,
  keys: Object.create(null)
};
function _headingVecs() {
  /* fwd = the way the camera faces, flattened to the ground; right = fwd rotated -90deg */
  const fwd = new THREE.Vector3(-Math.sin(ctl.az), 0, -Math.cos(ctl.az));
  const right = new THREE.Vector3(-Math.cos(ctl.az), 0, Math.sin(ctl.az));
  return { fwd, right };
}
function updateCamera() {
  if (ctl.walk) {
    const el = Math.max(-1.35, Math.min(1.35, ctl.el));
    camera.position.copy(ctl.target);
    const dir = new THREE.Vector3(-Math.cos(el) * Math.sin(ctl.az), -Math.sin(el), -Math.cos(el) * Math.cos(ctl.az));
    camera.lookAt(camera.position.clone().add(dir));
  } else {
    const el = Math.max(0.05, Math.min(1.45, ctl.el));
    const x = ctl.target.x + ctl.dist * Math.cos(el) * Math.sin(ctl.az);
    const y = ctl.target.y + ctl.dist * Math.sin(el);
    const z = ctl.target.z + ctl.dist * Math.cos(el) * Math.cos(ctl.az);
    camera.position.set(x, y, z);
    camera.lookAt(ctl.target);
  }
}
updateCamera();
renderer.domElement.addEventListener('mousedown', (e) => {
  if (e.button === 2) ctl.panning = true; else ctl.dragging = true;
  ctl.lastX = e.clientX; ctl.lastY = e.clientY;
});
window.addEventListener('mouseup', () => { ctl.dragging = false; ctl.panning = false; });
window.addEventListener('mousemove', (e) => {
  const dx = e.clientX - ctl.lastX, dy = e.clientY - ctl.lastY;
  ctl.lastX = e.clientX; ctl.lastY = e.clientY;
  if (ctl.dragging) {
    ctl.az -= dx * 0.006;
    ctl.el += (ctl.walk ? -dy * 0.005 : dy * 0.006);
    updateCamera();
  } else if (ctl.panning) {
    const { fwd, right } = _headingVecs();
    const k = ctl.walk ? 0.05 : ctl.dist * 0.0015;
    ctl.target.addScaledVector(right, dx * k);
    ctl.target.addScaledVector(fwd, -dy * k);
    updateCamera();
  }
});
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
renderer.domElement.addEventListener('wheel', (e) => {
  if (ctl.walk) { ctl.speed = Math.max(0.15, Math.min(8, ctl.speed * (1 - e.deltaY * 0.001))); }
  else { ctl.dist = Math.max(3, Math.min(2000, ctl.dist * (1 + e.deltaY * 0.001))); }
  updateCamera(); e.preventDefault();
}, { passive: false });
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* --------------------------------------------------------- WASD movement */
const _MOVE_KEYS = { w: 1, a: 1, s: 1, d: 1, q: 1, e: 1, ' ': 1, shift: 1, control: 1 };
function _isTyping(e) {
  const t = e.target;
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}
window.addEventListener('keydown', (e) => {
  if (_isTyping(e)) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
  ctl.keys[k] = true;
  if (_MOVE_KEYS[k]) e.preventDefault();
  if (k === 'f') { window._setWalk(!ctl.walk); }
});
window.addEventListener('keyup', (e) => { ctl.keys[e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { ctl.keys = Object.create(null); });

window._setWalk = function (on) {
  if (on === ctl.walk) return;
  const { fwd } = _headingVecs();
  if (on) {
    /* step into the scene: stand where the camera was looking, at eye height */
    ctl.target.copy(camera.position);
    ctl.target.y = ctl.eyeHeight;
    ctl.walk = true;
    ctl.el = Math.max(-0.2, Math.min(0.35, ctl.el * 0.3));
  } else {
    ctl.walk = false;
    ctl.dist = Math.max(30, ctl.dist);
    ctl.target.addScaledVector(fwd, ctl.dist * 0.35);
    ctl.target.y = 6;
    ctl.el = 0.55;
  }
  updateCamera();
  if (window._onWalkChange) window._onWalkChange(ctl.walk);
};

let _lastT = performance.now();
function _moveStep(now) {
  const dt = Math.min((now - _lastT) / 1000, 0.1);
  _lastT = now;
  const k = ctl.keys;
  let mx = 0, mz = 0, my = 0;
  if (k['w']) mz += 1;
  if (k['s']) mz -= 1;
  if (k['d']) mx += 1;
  if (k['a']) mx -= 1;
  if (k['e'] || k[' ']) my += 1;
  if (k['q']) my -= 1;
  if (!mx && !mz && !my) return;
  /* base speed: metres/sec. In orbit it scales with how far out you are, so it
     feels the same whether you're reading a whole row or one doorway. */
  let base = ctl.walk ? 9 * ctl.speed : Math.max(12, ctl.dist * 0.55);
  if (k['shift']) base *= 3.4;
  if (k['control'] || k['alt']) base *= 0.28;
  const step = base * dt;
  const { fwd, right } = _headingVecs();
  if (mz) ctl.target.addScaledVector(fwd, mz * step);
  if (mx) ctl.target.addScaledVector(right, mx * step);
  if (my) ctl.target.y += my * step;
  if (ctl.walk) ctl.target.y = Math.max(0.4, ctl.target.y);
  updateCamera();
}

window._gotoRow = function (z, width) {
  ctl.walk = false;
  ctl.target.set(width ? width / 2 - 20 : 0, 6, z);
  ctl.dist = Math.max(70, (width || 140) * 0.7);
  ctl.az = 0.75; ctl.el = 0.55;
  updateCamera();
  if (window._onWalkChange) window._onWalkChange(false);
};

/* ------------------------------------------------------------ material */
const _matCache = new Map();
function mat(color, family) {
  const key = color + '|' + (family || '');
  if (_matCache.has(key)) return _matCache.get(key);
  let roughness = 0.85, metalness = 0.0, transparent = false, opacity = 1;
  if (family === 'metal') { roughness = 0.4; metalness = 0.7; }
  else if (family === 'glass') { roughness = 0.05; metalness = 0.1; transparent = true; opacity = 0.55; }
  else if (family === 'glow') { roughness = 1; }
  const m = family === 'glow'
    ? new THREE.MeshBasicMaterial({ color, transparent, opacity })
    : new THREE.MeshStandardMaterial({ color, roughness, metalness, transparent, opacity });
  m.userData.family = family || '';
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
function _add(m) { (_target || scene).add(m); return m; }
function mkBox(x, y, z, w, h, d, ry, color, family) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(Math.max(w, 0.02), Math.max(h, 0.02), Math.max(d, 0.02)), mat(color, family));
  m.position.set(x, y + h / 2, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkCyl(x, y, z, r, h, ry, color, family) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(r, 0.01), Math.max(r, 0.01), Math.max(h, 0.02), 16), mat(color, family));
  m.position.set(x, y + h / 2, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkCone(x, y, z, r, h, ry, color, family) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(Math.max(r, 0.01), Math.max(h, 0.02), 14), mat(color, family));
  m.position.set(x, y + h / 2, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkDome(x, y, z, r, h, ry, color, family) {
  const geo = new THREE.SphereGeometry(Math.max(r, 0.02), 16, 10, 0, TAU, 0, Math.PI / 2);
  geo.scale(1, Math.max(h, 0.02) / Math.max(r, 0.02), 1);
  const m = new THREE.Mesh(geo, mat(color, family));
  m.position.set(x, y, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkBlob(x, y, z, r, h, ry, color, family) {
  const geo = new THREE.SphereGeometry(Math.max(r, 0.02), 10, 8);
  geo.scale(1, Math.max(h, 0.02) / (2 * Math.max(r, 0.02)), 1);
  const m = new THREE.Mesh(geo, mat(color, family));
  m.position.set(x, y, z); m.rotation.y = ry || 0;
  return _add(m);
}
function mkBall(x, y, z, r, color, family) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(Math.max(r, 0.02), 14, 10), mat(color, family));
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
  const m = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(r, 0.005), Math.max(r, 0.005), len, 8), mat(color, family));
  m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz).normalize());
  return _add(m);
}
/* a tapering block/tower segment: HALF-WIDTH rBottom at y, rTop at y+h, i.e. the
   block spans 2*rBottom across at its base — r reads as a radius/half-width in every
   case. sides=4 is a tapered SQUARE block with its faces square to the frame, sides=8
   a tapered octagonal mass, higher for a rounder tower drum.
   (For sides=4 the geometry is a diamond in plan, so it is over-sized by sqrt(2) and
   turned 45 deg to put the faces — not the corners — on the axes.) */
function mkFrustum(x, y, z, rBottom, rTop, h, ry, color, family, sides) {
  const n = sides || 8;
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
const FURN_CULTURES = ['ancient', 'ancients-salvage', 'yuni-court', 'yuni-common', 'yuni-poor', 'sahelian', 'order', 'nomad', 'voth', 'iziz', 'beast-rider', 'generic'];
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
     wall    — stands at floor level, back face (local z = -d/2) flush to a wall
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
  'ladder', 'board', 'stack', 'brazier', 'book', 'tool', 'food', 'drink', 'supply'];
const FURNS = [], FURN_BY_KEY = {};
function FURN(o) {
  if (FURN_BY_KEY[o.key]) { console.error('duplicate furniture key', o.key); return; }
  if (!o.culture || FURN_CULTURES.indexOf(o.culture) < 0) { console.error('furniture ' + o.key + ': bad culture ' + o.culture); return; }
  o.variants = o.variants || 1;
  if (!o.rooms) o.rooms = o.room ? [o.room] : ['hall'];
  else if (typeof o.rooms === 'string') o.rooms = [o.rooms];
  o.room = o.rooms[0];
  FURNS.push(o); FURN_BY_KEY[o.key] = o;
}
/* the y at which to build a furniture piece so it sits on its anchor:
   at = { floorY, surfaceY, ceilingY }; variant picks variantDims. */
function furnAnchorY(A, variant, at) {
  at = at || {};
  const floorY = at.floorY || 0;
  if (A.anchor === 'surface') return at.surfaceY != null ? at.surfaceY : floorY;
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
  unassigned:{ tags: [], families: [''] }
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
    whiteHot: 0xfff2c9
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
  },
  /* culture-neutral containers, food, drink and supplies (krator-master-generic.js) and the
     biome fruit (krator-master-fruit.js). Hand-picked, not clustered. Food keys are role + name:
     bread*, cheese*, meat*, fruit*, veg*, drink* */
  'generic': {
    timberPine: 0xb48a5a, timberOak: 0x8a6a4e, timberWalnut: 0x5e3f2a, timberDark: 0x3e2c20, timberBirch: 0xd2b88a,
    wickerStraw: 0xc4a064, wickerTan: 0x9c7a48, wickerDark: 0x6e5432,
    stoneClay: 0xb06a44, stoneClayDark: 0x8a4e32, stoneBuff: 0xd2bc94, stoneGrey: 0x8e8a82, stoneSlate: 0x4e5258,
    stoneCream: 0xeee6d2, stoneGlazeBlue: 0x3e6a8a, stoneGlazeGreen: 0x5a7a4a, stoneGlazeOchre: 0xc08a3a,
    glassGreen: 0x3e6e44, glassAmber: 0x9a5a1e, glassClear: 0xcfe0e0, glassBlue: 0x3a5a8a, glassViolet: 0x5a3a6e,
    iron: 0x3a3a3a, tin: 0xa8acae, brass: 0xc29a44, copper: 0xb06a3a, pewter: 0x8a8f92,
    clothLinen: 0xe2d6b8, clothHessian: 0xa8885a, clothMadder: 0xa8402e, clothIndigo: 0x2e4a7a, clothOchre: 0xc9a24a,
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
    /* biome fruit (krator-master-fruit.js): colours taken from the fruiting part each biome draws */
    fruitScaleRed: 0xc0262a, fruitScaleFlesh: 0xf0b8b0, fruitFernEgg: 0x8a6a3a, fruitFernMeal: 0xe8d8a8,
    fruitTideHusk: 0x7e3030, fruitTideJelly: 0xe8e0c8, fruitCycadRed: 0xb83a2a,
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
    fungusCoralOrange: 0xf08a3a, fungusCoralPink: 0xf090b0, fungusCoralViolet: 0x9a70c8, fungusParasol: 0xc8a882,
    fruitMadrone: 0xc82a1e, drinkCider: 0xd8a050, fruitRattlepod: 0x8a2a1c, fruitRattleBean: 0x4a2a1a,
    fruitTamarindShell: 0x4a3424, fruitTamarindPulp: 0x8a4a22, fruitFig: 0x5a3a5a, fruitFigFlesh: 0xd8586a,
    fruitCacaoRed: 0x8a2a3a, fruitCacaoGold: 0xd8a030, fruitCacaoOrange: 0xe07a28, fruitCacaoPulp: 0xf4ecdc, drinkCacao: 0x5a3020,
    fruitPitaya: 0xe0206a, fruitPitayaFlame: 0x7ab040, fruitPitayaFlesh: 0xf4f0ec,
    fruitPlantain: 0xf0d040, fruitPlantainBract: 0x6a2a8a, fruitPlantainFried: 0xd89a3a, fruitWingnut: 0x9ac060,
    fruitArbutusRed: 0xe02a20, fruitArbutusOrange: 0xf08a20, fruitWhorlOlive: 0x6a6a3a, fruitWhorlCream: 0xd8c8a0,
    fruitLotusPod: 0x8a9a5a, fruitLotusSeed: 0xe8e0c0
  }
};
/* the colour a palette key names for a culture; throws on an unknown key so a typo fails the build */
function furnCol(culture, key) {
  if (typeof key === 'number') return key;
  const p = FPAL[culture];
  if (p && p[key] != null) return p[key];
  throw new Error('no palette key "' + key + '" for culture ' + culture);
}

/* local frame: origin at footprint centre on the ground; +z is FRONT */
function makeFrame(x, z, ry, opt) {
  opt = opt || {};
  const F = { x, z, ry: ry || 0, y: opt.y || 0, seed: opt.seed || 1, variant: opt.variant || 0, wealth: opt.wealth == null ? 0.5 : opt.wealth };
  let st = (F.seed * 2654435761) >>> 0;
  F.rnd = () => { st = (Math.imul(st, 1664525) + 1013904223) >>> 0; return st / 4294967296; };
  F.rr = (a, b) => a + (b - a) * F.rnd();
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
  F.box = (lx, ly, lz, w, h, d, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkBox(x2, F.y + ly, z2, w, h, d, F.ry + (ry2 || 0), color, family); };
  F.cyl = (lx, ly, lz, r, h, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkCyl(x2, F.y + ly, z2, r, h, F.ry + (ry2 || 0), color, family); };
  F.cone = (lx, ly, lz, r, h, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkCone(x2, F.y + ly, z2, r, h, F.ry + (ry2 || 0), color, family); };
  F.dome = (lx, ly, lz, r, h, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkDome(x2, F.y + ly, z2, r, h, F.ry + (ry2 || 0), color, family); };
  F.blob = (lx, ly, lz, r, h, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkBlob(x2, F.y + ly, z2, r, h, F.ry + (ry2 || 0), color, family); };
  F.ball = (lx, ly, lz, r, color, family) => { const [x2, z2] = toWorld(lx, lz); mkBall(x2, F.y + ly, z2, r, color, family); };
  F.frustum = (lx, ly, lz, rBottom, rTop, h, ry2, color, family, sides) => { const [x2, z2] = toWorld(lx, lz); mkFrustum(x2, F.y + ly, z2, rBottom, rTop, h, F.ry + (ry2 || 0), color, family, sides); };
  F.pyrRoof = (lx, ly, lz, w, h, d, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkPyrRoof(x2, F.y + ly, z2, w, h, d, F.ry + (ry2 || 0), color, family); };
  F.hipRoof = (lx, ly, lz, w, h, d, ry2, color, family) => { const [x2, z2] = toWorld(lx, lz); mkHipRoof(x2, F.y + ly, z2, w, h, d, F.ry + (ry2 || 0), color, family); };
  /* a beam's roll must come from the LOCAL frame, then turn with the building:
     setFromUnitVectors on the world direction picks the shortest rotation,
     whose roll depends on heading, so a sloped slab (roof, canopy, tent side)
     built at ry = 0 twisted about its own axis at any other ry. Identical at ry = 0. */
  const _bUp = new THREE.Vector3(0, 1, 0), _bDir = new THREE.Vector3(), _bQy = new THREE.Quaternion(), _bAxY = new THREE.Vector3(0, 1, 0);
  F.beam = (ax, ay, az, bx, by, bz, w, d, color, family) => {
    const [ax2, az2] = toWorld(ax, az), [bx2, bz2] = toWorld(bx, bz);
    const m = mkBeam(ax2, F.y + ay, az2, bx2, F.y + by, bz2, w, d, color, family);
    if (F.ry && m) {
      _bDir.set(bx - ax, by - ay, bz - az);
      if (_bDir.lengthSq() > 1e-12) {
        m.quaternion.setFromUnitVectors(_bUp, _bDir.normalize()).premultiply(_bQy.setFromAxisAngle(_bAxY, F.ry));
      }
    }
  };
  F.rod = (ax, ay, az, bx, by, bz, r, color, family) => { const [ax2, az2] = toWorld(ax, az), [bx2, bz2] = toWorld(bx, bz); mkRod(ax2, F.y + ay, az2, bx2, F.y + by, bz2, r, color, family); };
  F.lamp = (lx, ly, lz, amp, rad) => { const [x2, z2] = toWorld(lx, lz); const l = new THREE.PointLight(0xffb066, amp || 1, rad || 10); l.position.set(x2, F.y + ly, z2); _add(l); };
  F.tree = (lx, lz, kind, h, ly) => treeHelper(F, lx, lz, kind, h, ly || 0);
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
    error: failed ? String(failed && failed.message || failed) : null
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

/* --------------------------------------------------------------- labels */
function groundLabel(text, x, z, big) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = big ? 160 : 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = big ? 'rgba(30,26,18,0.92)' : 'rgba(255,255,255,0.88)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = big ? '#f5efdd' : '#20201a';
  ctx.font = (big ? 'bold 64px' : '40px') + ' Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 512, big ? 100 : 82);
  const tex = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(big ? 34 : 15, big ? 5.3 : 1.9);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, big ? 0.08 : 0.06, z);
  scene.add(m);
  return m;
}
function scaleFigure(x, z) {
  mkCyl(x, 0, z, 0.22, 1.5, 0, 0x3a5a7a, 'cloth');
  mkBall(x, 1.68, z, 0.22, 0xe0b090, 'skin');
}

function animate(now) {
  requestAnimationFrame(animate);
  _moveStep(now || performance.now());
  if (window._inspectorTick) window._inspectorTick();
  if (window._frameHooks) for (const fh of window._frameHooks) fh(now || performance.now());
  renderer.render(scene, camera);
}
animate();
