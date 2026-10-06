/* kits/motor-vehicles bundle (vehicle_bundle.py): kits/catalog/krator-furniture-core.js, kits/motor-vehicles/vehicles-core.js, kits/motor-vehicles/krator-vehicles-eastabyss.js, kits/motor-vehicles/krator-vehicles-geomancer.js, kits/motor-vehicles/krator-vehicles-iziz.js, kits/motor-vehicles/krator-vehicles-post-apoc.js, kits/motor-vehicles/krator-vehicles-republic.js, kits/motor-vehicles/krator-vehicles-runtime.js. GENERATED; edit the kit files. */
var KratorVehicles = (function () {
/* ---- kits/catalog/krator-furniture-core.js ---- */
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
function mat(color, family) {
  const key = color + '|' + (family || '');
  if (_matCache.has(key)) return _matCache.get(key);
  let roughness = 0.85, metalness = 0.0, transparent = false, opacity = 1;
  const fam = MAT_FAMILY_LOOK[family];
  if (fam) { roughness = fam[0]; metalness = fam[1]; }
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
  'generic', 'scrap', 'lizardmen', 'eastabyss', 'xanadu', 'screamer', 'islander', 'republican', 'rustic', 'painted', 'reedlake', 'post-apoc', 'hykkousoi'];
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
  if (info && info.palette) FPAL[key] = Object.assign(FPAL[key] || {}, info.palette);
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


/* ---- kits/motor-vehicles/vehicles-core.js ---- */
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
/* the draw-call and triangle budget verify.py holds a vehicle to: two body meshes plus one per wheel, and
   6 000 triangles unless the entry declares more (budget: { tris }): a big crawler is one per world, not a fleet */
function vehicleBudget(A) {
  return { meshes: 2 + ((A.data && A.data.wheels) || []).length, tris: (A.budget && A.budget.tris) || 6000 };
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
     sides, flat caps where asked (caps: 'top', 'bottom', 'both'). A rover's bowl, a cupola, a fuel tank on its side. */
  F.tub = function (secs, segs, color, family, caps) {
    const S = _seg(segs || 20, 8), pos = [], idx = [];
    const pt = function (s, i) {
      const th = i * TAU / S, c = Math.cos(th), sn = Math.sin(th), e = 2 / (s.n || 2);
      return [s.a * Math.sign(c) * Math.pow(Math.abs(c), e), s.y, (s.z || 0) + s.b * Math.sign(sn) * Math.pow(Math.abs(sn), e)];
    };
    for (const s of secs) for (let i = 0; i < S; i++) pos.push.apply(pos, pt(s, i));
    for (let j = 0; j + 1 < secs.length; j++) for (let i = 0; i < S; i++) {
      const a = j * S + i, b = j * S + (i + 1) % S, c = a + S, d = b + S;
      idx.push(a, c, b, b, c, d);
    }
    const capAt = function (s, up) {
      const base = pos.length / 3;
      for (let i = 0; i < S; i++) pos.push.apply(pos, pt(s, i));
      pos.push(0, s.y, s.z || 0);
      const c = base + S;
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
     The lowest run sits on y = 0 when the lowest wheels' bottoms are at y = t. Static: the road wheels turn, the
     belt does not (KNOWN_ISSUES.md). */
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
    const at = function (s) {
      s = ((s % tot) + tot) % tot;
      let k = 0; while (k + 1 < seg.length && L[k + 1] <= s) k++;
      const q = seg[k], f = q[2] > 0 ? (s - L[k]) / q[2] : 0;
      return [q[0][0] + (q[1][0] - q[0][0]) * f, q[0][1] + (q[1][1] - q[0][1]) * f];
    };
    for (let i = 0; i < n; i++) {
      const s = i * step, a = at(s - step * 0.38), b = at(s + step * 0.38);
      F.beam(x, a[1], a[0], x, b[1], b[0], w, t, color, family);
    }
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

/* ---- kits/motor-vehicles/krator-vehicles-eastabyss.js ---- */
/* ======================================================================
   Krator Motor Vehicles: the abyssal people (kits/motor-vehicles/krator-vehicles-eastabyss.js)

   The abyssal people (LORE.md 6.9) live on the salt marshes and deltas of the eastern Abyss beside the
   Geomancers' oil works: scavengers and recyclers, proud of it, "with pride and colour, not as squalor".
   Shade first (sails, umbrellas); bright paint and pastel lime-wash; tin-mirror cladding marks wealth and
   sanctity; gilded tips for the sacred and noble. Nothing electric. Catalog culture `eastabyss`; sign: the
   star. Colours: red lacquer, teal and gold for the sacred, pastels for the rest.

   One vehicle: ab_caravan_truck, a salvaged Ancient expedition truck that a caravan family runs on the
   Geomancers' crude: a high glazed cab over four big sand tyres, snorkels up its cheeks, a box body
   draped in dripping pastel tarps, packs and lockers slung along its flanks, an observation cupola under a
   tent canopy, a yellow parasol, tin-mirror shades on a mast (what the Ancients' sun panels became), two
   salvaged dishes kept for their shine, oil lanterns for lamps.
   Variants: 0 Caravan (sand, pastel tarps), 1 Headman's (teal paint, red-lacquer and gold tarps, tin-
   mirror cladding on the cab, gilded horns on the canopy). Frame: vehicles-core.js (+z forward).
   ====================================================================== */

VEHICLE_CULTURE('eastabyss', {
  name: 'Abyssal people', sign: 'star',
  lore: 'salt-marsh scavengers and recyclers of the eastern Abyss; shade first, pride and colour; nothing electric',
  /* PALETTE (sRGB; the runtime converts to linear) */
  palette: {
    sandPaint: 0xc8ae84, sandPaintDark: 0x9c845e, tealPaint: 0x3f8a86, tealPaintDark: 0x2c625f,
    frame: 0x2e2c2a, glass: 0x3a5462, steel: 0x5e5a54, rubber: 0x2a2724, hubTeal: 0x4f8f8a,
    hose: 0xc07a3a, hoseDark: 0x8e5426, tin: 0xd6d8d4, gold: 0xc99a3a, lacquer: 0x9c2a1e,
    pastelTeal: 0x7fbfb0, pastelMint: 0xa8d4b8, pastelPink: 0xe0909a, pastelRose: 0xd06a78, pastelPeach: 0xe8b088,
    pastelYellow: 0xe8cc68, saffron: 0xe0a028, canopyRed: 0xb8443a, canopyOrange: 0xd88a3a,
    canvas: 0xb49a6c, canvasDark: 0x8a7450, leather: 0x6a4a2c, crate: 0x7a5a3a,
    lensWarm: 0xffd9a0, lensRed: 0xa8180e, lensAmber: 0xe09020, jerryRed: 0x9a3020, jerryYellow: 0xc8a02a
  }
});

VEHICLE({
  key: 'ab_caravan_truck', name: 'Abyssal caravan truck', culture: 'eastabyss',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport', 'cargo'], drive: 'wheeled', seats: 3, fuel: 'crude oil',
    terrain: ['sand', 'salt flat', 'mud', 'track'], setting: 'outdoor' },
  variants: 2, variantNames: ['Caravan', "Headman's"],
  /* overall box: 3.2 wide, 7.5 long; the cab roof is 3.05, the mast's shades 4.85 */
  w: 3.2, d: 7.5, h: 4.9,
  budget: { tris: 7200 },
  /* data, not code (units: m, m/s, m/s^2, kg, L, km, rad) */
  data: {
    speed: 14, accel: 1.0, turnRadius: 8, maxSteer: 0.5, seats: 3, berths: 4, cargo: 2500, mass: 7800,
    fuel: 'crude oil', tank: 240, range: 500, drive: 'all four', wheelbase: 4.2, track: 2.44,
    clearance: 0.55, cabH: 3.05, engine: 'Ancient-salvage diesel, run on the Geomancers’ crude', lamps: 'oil lanterns',
    wheels: [
      { name: 'wheel_fl', x: 1.22, z: 2.15, r: 0.78, w: 0.62, front: true, steer: true, drive: true },
      { name: 'wheel_fr', x: -1.22, z: 2.15, r: 0.78, w: 0.62, front: true, steer: true, drive: true },
      { name: 'wheel_rl', x: 1.22, z: -2.05, r: 0.78, w: 0.62, front: false, steer: false, drive: true },
      { name: 'wheel_rr', x: -1.22, z: -2.05, r: 0.78, w: 0.62, front: false, steer: false, drive: true }
    ]
  },
  variantData: [
    {},
    { seats: 3, berths: 2, cargo: 1600, mass: 8200, rank: 'the Headman’s household' }
  ],

  wheel: function (F, W) {
    vehicleBalloonTyre({ r: W.r, w: W.w, lugs: 14, lugH: 0.034, rim: 0.36, side: W.side, segs: 18,
      tyre: F.col('rubber'), rimCol: F.col(['steel', 'gold'][F.variant]), hubCol: F.col('hubTeal'), nutCol: F.col('frame'), nuts: 6 });
    F.disc(W.side * W.w * 0.3, 0, 0, 1, 0, 0, 0.2, 0.06, F.col('hubTeal'), 'metal', 12);
  },

  build: function (F) {
    const v = F.variant, c = F.col, head = v === 1;
    const paint = c(['sandPaint', 'tealPaint'][v]), paintDark = c(['sandPaintDark', 'tealPaintDark'][v]);
    const frame = c('frame'), glass = c('glass'), steel = c('steel');

    /* ---- chassis: rails, the engine between the front wheels (narrow: clear of them at full lock), axle housings */
    for (const s of [-1, 1]) F.box(s * 0.5, 0.74, 0, 0.16, 0.24, 6.4, 0, frame, 'metal');
    F.box(0, 0.7, 2.15, 0.9, 0.9, 1.2, 0, steel, 'metal');
    for (const z of [2.15, -2.05]) F.rod(-0.92, 0.78, z, 0.92, 0.78, z, 0.09, frame, 'metal');
    F.box(0, 0.78, 0.2, 1.3, 0.82, 2.6, 0, paintDark);                                              /* the tank and battery boxes */

    /* ---- the front: grille box, bumper, lanterns, the snorkels up the cheeks */
    F.box(0, 0.62, 3.32, 1.9, 1.0, 0.6, 0, paintDark);
    F.box(0, 0.5, 3.66, 2.3, 0.28, 0.16, 0, frame, 'metal');                                        /* bumper */
    F.box(-0.42, 0.86, 3.63, 0.8, 0.62, 0.04, 0, frame, 'metal');                                   /* the radiator grille */
    for (let i = 0; i < 7; i++) F.box(-0.76 + i * 0.113, 0.86, 3.655, 0.04, 0.6, 0.03, 0, c('hubTeal'), 'metal');
    for (const s of [-1, 1]) {
      F.lamp(s * 0.72, 1.2, 3.64, 0, 0, 1, 0.09, 'head', frame, c('gold'));
      F.lamp(s * 1.1, 1.75, -3.47, 0, 0, -1, 0.06, 'tail', null, frame);
      /* the snorkel: corrugated hose from under the bumper up the cab's cheek */
      const pts = [[s * 0.98, 0.7, 3.5], [s * 1.12, 1.05, 3.55], [s * 1.2, 1.7, 3.45], [s * 1.2, 2.5, 3.3], [s * 1.16, 2.95, 3.0]];
      F.tube(pts, 0.075, c('hose'));
      for (let i = 1; i < pts.length - 1; i++) F.ring(pts[i][0], pts[i][1], pts[i][2], pts[i + 1][0] - pts[i - 1][0], pts[i + 1][1] - pts[i - 1][1], pts[i + 1][2] - pts[i - 1][2], 0.082, 0.014, c('hoseDark'), '', 8);
      F.taper(s * 1.16, 2.95, 3.0, 0, 0.3, -1, 0.075, 0.1, 0.16, c('hoseDark'), '', 8);
    }

    /* ---- the cab: a glazed box over the front wheels */
    F.slab([[1.25, 1.6, 1.12], [3.5, 1.6, 1.12], [3.62, 2.0, 1.12], [3.5, 2.85, 1.08], [3.22, 3.05, 1.04], [1.25, 3.05, 1.08]], paint, '');
    const pane = function (P) { F.tri(P[0], P[1], P[2], glass, 'metal'); F.tri(P[0], P[2], P[3], glass, 'metal'); };
    const fz = function (y) { return 3.62 - (y - 2.0) / 0.85 * 0.12 + 0.012; };
    pane([[-1.0, 2.08, fz(2.08)], [-1.0, 2.8, fz(2.8)], [1.0, 2.8, fz(2.8)], [1.0, 2.08, fz(2.08)]]);
    F.box(0, 2.06, fz(2.4) + 0.01, 0.06, 0.76, 0.03, 0, frame, 'metal');                            /* the screen's pillar */
    for (const s of [-1, 1]) {
      const x = s * 1.128;
      pane([[x, 2.05, 1.95], [x, 2.85, 1.95], [x, 2.85, 3.38], [x, 2.05, 3.44]]);
      pane([[x, 2.15, 1.38], [x, 2.85, 1.38], [x, 2.85, 1.78], [x, 2.15, 1.78]]);
      for (const z of [1.86, 3.48]) F.rod(x, 1.62, z, x, 3.03, z, 0.05, frame, 'metal');            /* door pillars */
      F.rod(x, 1.95, 1.3, x, 1.95, 3.5, 0.03, frame, 'metal');
      /* the star on the door: an eight-pointed star of two squares, red lacquer on a gold disc */
      const sx = s * 1.135, sy = 1.78, sz = 2.6;
      F.disc(sx, sy, sz, 1, 0, 0, 0.15, 0.015, c('gold'), 'metal', 12);
      for (const rot of [0, Math.PI / 4]) {
        const q = [];
        for (let i = 0; i < 4; i++) { const a = rot + i * Math.PI / 2; q.push([sx + s * 0.01, sy + Math.sin(a) * 0.13, sz + Math.cos(a) * 0.13]); }
        F.tri(q[0], q[1], q[2], c('lacquer')); F.tri(q[0], q[2], q[3], c('lacquer'));
      }
      if (head) {
        /* tin-mirror cladding on the cab's lower flank: the Headman's wealth */
        for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) F.box(s * 1.13, 1.64 + j * 0.13, 1.42 + i * 0.36, 0.015, 0.11, 0.3, 0, c('tin'), 'metal');
      }
    }
    /* a roof rack on the cab, bags on it */
    for (const s of [-1, 1]) F.rod(s * 0.9, 3.12, 1.35, s * 0.9, 3.12, 3.1, 0.022, frame, 'metal');
    for (const z of [1.4, 2.2, 3.0]) F.rod(-0.9, 3.12, z, 0.9, 3.12, z, 0.02, frame, 'metal');
    F.box(-0.35, 3.12, 2.2, 0.8, 0.3, 1.2, 0, c('canvas'));
    F.blob(0.45, 3.3, 2.5, 0.32, 0.36, 0, c('canvasDark'));

    /* ---- the box body behind the cab, its lockers and slung packs */
    F.box(0, 1.6, -1.1, 2.4, 1.42, 4.7, 0, paint);
    F.box(0, 3.02, -1.1, 2.44, 0.05, 4.74, 0, paintDark);
    F.box(-0.35, 1.66, -3.47, 0.9, 1.25, 0.04, 0, paintDark);                                       /* the rear door */
    F.rod(-0.75, 2.3, -3.51, -0.75, 2.3, -3.49, 0.02, frame, 'metal');
    for (const x of [0.45, 1.0]) F.rod(x, 0.9, -3.52, x, 3.05, -3.52, 0.022, frame, 'metal');          /* the roof ladder */
    for (let i = 0; i < 7; i++) F.rod(0.45, 1.0 + i * 0.3, -3.52, 1.0, 1.0 + i * 0.3, -3.52, 0.016, frame, 'metal');
    for (const s of [-1, 1]) {
      /* lockers between the wheels, and packs strapped to the body under the tarp */
      F.box(s * 1.02, 0.86, 0.1, 0.36, 0.7, 1.9, 0, paintDark);
      F.box(s * 1.205, 1.0, 0.1, 0.02, 0.4, 0.8, 0, steel, 'metal');
      F.box(s * 1.22, 1.18, 0.1, 0.02, 0.04, 0.2, 0, frame, 'metal');
      const packs = [[-0.5, 0.62], [0.25, 0.5], [-1.25, 0.5]];
      for (const p of packs) {
        F.box(s * 1.3, 1.66, p[0], 0.2, 0.52, p[1], 0, c(F.pick(['canvas', 'canvasDark', 'canvas'])));
        F.box(s * 1.41, 1.66, p[0] - p[1] * 0.25, 0.02, 0.52, 0.04, 0, c('leather'));
        F.box(s * 1.41, 1.66, p[0] + p[1] * 0.25, 0.02, 0.52, 0.04, 0, c('leather'));
      }
      /* jerry cans on the rear corner */
      F.box(s * 1.32, 1.66, -2.95, 0.18, 0.48, 0.34, 0, c(F.pick(['jerryRed', 'jerryYellow'])));
    }

    /* ---- the tarps: dripping stripes over the body's shoulders, colour bands along its length */
    const bands = head ? ['lacquer', 'gold', 'lacquer', 'saffron', 'lacquer'] : ['pastelTeal', 'pastelMint', 'pastelPink', 'pastelPeach', 'pastelYellow'];
    for (const s of [-1, 1]) {
      const n = 22, z0 = 1.15, z1 = -3.3, sw = (z0 - z1) / n;
      for (let i = 0; i < n; i++) {
        const z = z0 - (i + 0.5) * sw, b = Math.min(bands.length - 1, Math.floor(i / n * bands.length));
        const col = c(bands[b]);
        const yb = 2.12 + 0.18 * Math.sin(i * 1.7) - F.rr(0, 0.22) - (i % 3 === 1 ? 0.12 : 0);   /* the drip line */
        const bx = s * (1.235 + 0.02 * Math.sin(i * 0.9));
        F.box(bx, yb, z, 0.025, 3.07 - yb, sw * 1.04, 0, col);
        F.box(s * 0.98, 3.05, z, 0.5, 0.025, sw * 1.04, 0, col);
      }
    }

    /* ---- the observation cupola, its tent canopy, the parasol, the mast with tin-mirror shades, two dishes */
    F.box(0, 3.05, -0.2, 1.7, 0.55, 1.9, 0, paintDark);
    for (const s of [-1, 1]) {
      pane([[s * 0.858, 3.15, 0.55], [s * 0.858, 3.5, 0.55], [s * 0.858, 3.5, -0.95], [s * 0.858, 3.15, -0.95]]);
    }
    pane([[-0.7, 3.15, 0.758], [-0.7, 3.5, 0.758], [0.7, 3.5, 0.758], [0.7, 3.15, 0.758]]);
    for (const s of [-1, 1]) for (const z of [0.9, -1.3]) F.rod(s * 1.1, 3.05, z, s * 1.1, 3.62, z, 0.03, frame, 'metal');
    const canopy = c(head ? 'lacquer' : 'canopyOrange');
    F.pyrRoof(0, 3.6, -0.2, 2.5, 0.62, 2.6, 0, canopy);
    /* the drape off the canopy's eaves, hanging in swags */
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
      const za = 1.1 - i * 0.433, zb = za - 0.433;
      F.tri([s * 1.25, 3.6, za], [s * 1.25, 3.6, zb], [s * 1.27, 3.28 - (i % 2) * 0.1, (za + zb) / 2], c(head ? 'gold' : 'canopyRed'));
    }
    if (head) for (const s of [-1, 1]) {
      /* gilded horns at the canopy's ends: swoop-and-horn, for the noble */
      F.tube([[0, 4.18, -0.2], [0, 4.38, s * 0.22 - 0.2], [0, 4.6, s * 0.3 - 0.2]], 0.035, c('gold'), 'metal');
    }
    /* the mast and its shades */
    F.rod(0, 4.0, -0.2, 0, 4.75, -0.2, 0.035, frame, 'metal');
    F.rod(-0.85, 4.72, -0.2, 0.85, 4.72, -0.2, 0.025, frame, 'metal');
    for (const s of [-1, 1]) {
      F.beam(s * 0.08, 4.7, -0.2, s * 0.9, 4.86, -0.2, 0.025, 0.62, c('tin'), 'metal');
      F.rod(s * 1.15, 3.05, -2.9, s * 1.15, 3.6, -2.9, 0.025, frame, 'metal');
      F.taper(s * 1.15, 3.62, -2.9, s * 0.5, 0.6, -0.3, 0.03, 0.24, 0.12, c('tin'), 'metal', 12);   /* a salvaged dish */
    }
    /* the parasol: a pole, a yellow cone, a fringe */
    const px = 0.0, pz = -2.55;
    F.rod(px, 3.05, pz, px, 4.12, pz, 0.025, frame, 'metal');
    F.cone(px, 3.88, pz, 0.62, 0.28, 0, c(head ? 'gold' : 'pastelYellow'));
    for (let i = 0; i < 12; i++) {
      const a = i * TAU / 12, b = a + TAU / 12;
      F.tri([px + Math.cos(a) * 0.62, 3.88, pz + Math.sin(a) * 0.62], [px + Math.cos(b) * 0.62, 3.88, pz + Math.sin(b) * 0.62],
        [px + Math.cos((a + b) / 2) * 0.6, 3.78, pz + Math.sin((a + b) / 2) * 0.6], c(head ? 'lacquer' : 'saffron'));
    }
    F.lamp(px, 3.62, pz, 0, -0.3, 1, 0.05, 'amber', c('gold'), null);                                   /* a lantern under it */
  }
});

/* ---- kits/motor-vehicles/krator-vehicles-geomancer.js ---- */
/* ======================================================================
   Krator Motor Vehicles: the Geomancers (kits/motor-vehicles/krator-vehicles-geomancer.js)

   The Geomancers: the oil-drilling guild of the Eastern Abyss (LORE.md 6.9; their town is
   Locus, settlements/locus/LOCUS-KIT-NOTES.md). They have electricity, batteries and
   salvaged Ancient engines; brown uniforms, canvas packs, brass. Their sign (the Locus
   fuel-station pole sign) is a brass flame on a brown disc with a brass rim; there is no
   Geomancer entry in core/sockets/38-symbols.js, so the sign here is modelled, not painted.

   One vehicle: geo_dune_buggy, the guild's sand buggy, built in the refinery workshops: a welded
   tube roll cage, a low tub of salvaged plate, a big exposed Ancient-salvage flat-four at the rear
   with exhaust stacks and a radiator, four balloon sand tyres, long-travel arms, a jerry can rack,
   the spare on the hood, a roof rack, a whip aerial with a pennant, headlamps and a lamp bar.
   Variants: 0 Scout (earth brown, two seats, rolled tarp), 1 Crew (oil black, a second seat row
   under a longer cage), 2 Drill rig (sand and brown, a folded auger mast on the rack, a cargo bed of
   drill pipe). Frame: kits/motor-vehicles/vehicles-core.js (+z forward, wheels on y = 0).
   ====================================================================== */

VEHICLE_CULTURE('geomancer', {
  name: 'Geomancers', sign: 'brass flame on a brown disc',
  lore: 'oil-drilling guild of the Eastern Abyss (Locus, Yuni); electricity, salvaged Ancient engines',
  /* PALETTE (sRGB; the runtime converts to linear) */
  palette: {
    paintBrown: 0x6a4a2c, paintBrownDark: 0x4e3620, paintBlack: 0x24211d, paintSand: 0xb49a6c,
    oilBlack: 0x1d1b19, tube: 0x2b2825,
    brass: 0xb08432, brassLight: 0xc29a44, brassDark: 0x8a6626,
    steel: 0x565250, steelDark: 0x3e3a36, alloy: 0xc9c4b6, alloyDark: 0x8f8b80,
    rubber: 0x1f1d1b, hose: 0x2a2724,
    canvas: 0xa8936c, canvasDark: 0x7d6a4c, canvasOlive: 0x6c6a48, leather: 0x5a3a22, seat: 0x4b3a2a,
    lensWarm: 0xfff1c8, lensRed: 0xa8180e, lensAmber: 0xe09020, glowBlue: 0x5ab8ff,
    jerryRed: 0x8a2a1c, jerryOlive: 0x5a5a32, jerryBlack: 0x2a2a26,
    wood: 0x7a5a3a, rope: 0x9a8458, pennantBrass: 0xc9963a, pennantBrown: 0x7a5434, core: 0x8a7458
  }
});

VEHICLE({
  key: 'geo_dune_buggy', name: 'Geomancer dune buggy', culture: 'geomancer',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport'], drive: 'wheeled', seats: 2, fuel: 'refined oil',
    terrain: ['sand', 'salt flat', 'track'], setting: 'outdoor', guild: 'Geomancers' },
  variants: 3, variantNames: ['Scout', 'Crew', 'Drill rig'],
  /* overall box: 2.1 wide, 3.6 long; the cage top is 1.8 (data.cageH), the whip aerial reaches 3.05 */
  w: 2.1, d: 3.6, h: 3.05,
  /* data, not code: what a simulation reads (units: m, m/s, m/s^2, kg, L, km, rad) */
  data: {
    speed: 22, accel: 2.8, turnRadius: 5.2, maxSteer: 0.45, seats: 2, cargo: 150, mass: 880,
    fuel: 'refined oil', tank: 55, range: 260, drive: 'rear', wheelbase: 2.44, track: 1.68,
    clearance: 0.3, cageH: 1.8, engine: 'Ancient-salvage flat-four, air-cooled',
    wheels: [
      { name: 'wheel_fl', x: 0.84, z: 1.22, r: 0.425, w: 0.36, front: true, steer: true, drive: false },
      { name: 'wheel_fr', x: -0.84, z: 1.22, r: 0.425, w: 0.36, front: true, steer: true, drive: false },
      { name: 'wheel_rl', x: 0.84, z: -1.22, r: 0.425, w: 0.36, front: false, steer: false, drive: true },
      { name: 'wheel_rr', x: -0.84, z: -1.22, r: 0.425, w: 0.36, front: false, steer: false, drive: true }
    ]
  },
  variantData: [
    {},
    { seats: 4, cargo: 60, mass: 960, accel: 2.5 },
    { seats: 2, cargo: 320, mass: 1120, speed: 17, accel: 2.0, rig: 'auger mast, 2.2 m, folds onto the roof rack' }
  ],

  /* ONE wheel at the origin, axle along x (W.side: +1 the +x side, -1 the -x side) */
  wheel: function (F, W) {
    const v = F.variant;
    vehicleBalloonTyre({ r: W.r, w: W.w, lugs: W.spare ? 5 : 8, lugH: 0.026, rim: 0.215, side: W.side, segs: W.spare ? 10 : 13,
      tyre: F.col('rubber'), rimCol: F.col(['brass', 'oilBlack', 'paintBrown'][v]), hubCol: F.col('oilBlack'),
      nutCol: F.col(v === 0 ? 'oilBlack' : 'brass'), nuts: W.spare ? 0 : 3 });
  },

  build: function (F) {
    const v = F.variant, c = F.col;
    const paint = c(['paintBrown', 'paintBlack', 'paintSand'][v]);
    const trim = c(['paintBrownDark', 'brass', 'paintBrown'][v]);
    const cage = c(['tube', 'paintBrownDark', 'tube'][v]);
    const T = 0.032;                                   /* cage tube radius */
    const crew = v === 1, rig = v === 2;

    /* ---- chassis: floor pan, tub sides, bulkhead, nose, hood, skid plate */
    F.box(0, 0.38, 0.02, 1.20, 0.06, 1.96, 0, paint);
    for (const s of [-1, 1]) {
      F.box(s * 0.62, 0.40, 0.02, 0.05, 0.42, 1.94, 0, paint);
      F.box(s * 0.62, 0.80, 0.02, 0.07, 0.04, 1.94, 0, trim, 'metal');          /* the tub's capping rail */
      if (crew) F.box(s * 0.648, 0.56, 0.02, 0.01, 0.06, 1.90, 0, c('brass'), 'metal');   /* the Crew's brass stripe */
    }
    F.box(0, 0.40, -0.94, 1.24, 0.42, 0.05, 0, paint);                          /* rear bulkhead */
    F.box(0, 0.40, 0.97, 1.24, 0.46, 0.05, 0, paint);                           /* front bulkhead */
    F.box(0, 0.36, 1.30, 1.00, 0.26, 0.64, 0, paint);                           /* nose box */
    F.beam(0, 0.86, 0.98, 0, 0.62, 1.66, 1.04, 0.04, rig ? c('paintBrown') : paint);   /* hood */
    for (const s of [-1, 1]) {
      F.box(s * 0.50, 0.60, 1.12, 0.04, 0.21, 0.28, 0, trim);
      F.box(s * 0.50, 0.60, 1.40, 0.04, 0.12, 0.28, 0, trim);
    }
    F.box(0, 0.30, 1.18, 0.86, 0.06, 0.56, 0, c('steelDark'), 'metal');         /* skid plate */
    /* bumpers and the tow bar */
    F.rod(-0.72, 0.40, 1.72, 0.72, 0.40, 1.72, 0.04, c('oilBlack'), 'metal');
    for (const s of [-1, 1]) F.rod(s * 0.40, 0.40, 1.58, s * 0.40, 0.40, 1.72, 0.03, c('oilBlack'), 'metal');
    F.rod(-0.66, 0.52, -1.74, 0.66, 0.52, -1.74, 0.035, c('oilBlack'), 'metal');
    F.box(0, 0.44, -1.72, 0.10, 0.10, 0.10, 0, c('steelDark'), 'metal');        /* tow hitch */
    for (const s of [-1, 1]) F.rod(s * 0.58, 0.44, -0.90, s * 0.58, 0.52, -1.74, 0.035, c('oilBlack'), 'metal');   /* rear rails */

    /* ---- the Geomancers' sign: a brass flame on a brown disc, brass rim (both flanks and the nose) */
    const sign = function (x, y, z, ax, az) {
      F.disc(x, y, z, ax, 0, az, 0.12, 0.012, c('paintBrownDark'), '', 10);
      F.ring(x + ax * 0.006, y, z + az * 0.006, ax, 0, az, 0.12, 0.012, c('brassLight'), 'metal', 9);
      F.taper(x + ax * 0.012, y - 0.07, z + az * 0.012, 0, 1, 0, 0.022, 0.042, 0.05, c('brassLight'), 'metal', 6);   /* the flame: a bowl */
      F.taper(x + ax * 0.012, y - 0.02, z + az * 0.012, 0, 1, 0, 0.042, 0.004, 0.10, c('brassLight'), 'metal', 6);   /* and its tongue */
    };
    sign(0.645, 0.60, 0.42, 1, 0); sign(-0.645, 0.60, 0.42, -1, 0); sign(0, 0.50, 1.625, 0, 1);

    /* ---- headlamps on the nose face, the spare on the hood */
    for (const s of [-1, 1]) F.lamp(s * 0.34, 0.52, 1.68, 0, 0, 1, 0.075, 'head', c('oilBlack'), c('brass'));
    const hoodA = Math.atan2(0.24, 0.68);             /* the hood falls 0.24 over 0.68 */
    const sn = Math.sin(hoodA), cs = Math.cos(hoodA), sw = 0.36;
    /* the spare lies on the hood: hub over hood point z = 1.27, half a tyre width up the hood's normal (0, cs, sn) */
    const hz = 1.27, hy = 0.86 - (hz - 0.98) * 0.24 / 0.68 + 0.025;
    F.spareWheel(0, hy + cs * sw / 2, hz + sn * sw / 2, 0, cs, sn, { r: 0.425, w: sw, side: 1 });
    F.rod(0, hy, hz, 0, hy + cs * (sw + 0.06), hz + sn * (sw + 0.06), 0.02, c('brass'), 'metal');   /* clamp stud */

    /* ---- front suspension: A-arms, uprights, long coilovers to the cage */
    for (const s of [-1, 1]) {
      F.rod(s * 0.50, 0.40, 1.02, s * 0.64, 0.38, 1.22, 0.022, c('oilBlack'), 'metal');
      F.rod(s * 0.50, 0.40, 1.42, s * 0.64, 0.38, 1.22, 0.022, c('oilBlack'), 'metal');
      F.rod(s * 0.50, 0.62, 1.10, s * 0.63, 0.56, 1.22, 0.02, c('oilBlack'), 'metal');
      F.rod(s * 0.50, 0.62, 1.34, s * 0.63, 0.56, 1.22, 0.02, c('oilBlack'), 'metal');
      F.box(s * 0.63, 0.32, 1.22, 0.04, 0.28, 0.08, 0, c('steelDark'), 'metal');   /* upright */
      F.rod(s * 0.60, 0.46, 1.20, s * 0.58, 1.02, 1.00, 0.045, c('brass'), 'metal');   /* coilover (spring) */
      F.rod(s * 0.60, 0.46, 1.20, s * 0.59, 0.80, 1.09, 0.03, c('steel'), 'metal');    /* damper body */
      F.rod(s * 0.58, 1.02, 1.00, s * 0.60, 1.02, 0.84, 0.025, cage, 'metal');          /* shock tower gusset to the pillar */
    }
    /* ---- rear suspension: trailing arms, half-shafts, coilovers */
    for (const s of [-1, 1]) {
      F.beam(s * 0.60, 0.48, -0.46, s * 0.64, 0.42, -1.22, 0.06, 0.08, c('oilBlack'), 'metal');
      F.rod(s * 0.20, 0.42, -1.22, s * 0.64, 0.425, -1.22, 0.03, c('steelDark'), 'metal');
      F.rod(s * 0.63, 0.46, -1.12, s * 0.56, 1.10, -0.96, 0.045, c('brass'), 'metal');
    }
    F.box(0, 0.30, -1.22, 0.44, 0.24, 0.32, 0, c('steelDark'), 'metal');         /* transaxle */

    /* ---- the engine: an Ancient-salvage flat-four, tarnished white metal, exposed at the rear */
    F.box(0, 0.46, -1.50, 0.50, 0.36, 0.40, 0, c('alloy'), 'metal');            /* block */
    for (const s of [-1, 1]) {
      for (const z of [-1.41, -1.59]) F.rod(s * 0.24, 0.62, z, s * 0.46, 0.62, z, 0.08, c('alloyDark'), 'metal');   /* cylinders */
      for (const x of [0.32, 0.38, 0.44]) F.box(s * x, 0.50, -1.50, 0.016, 0.24, 0.40, 0, c('alloyDark'), 'metal');   /* fins */
      F.box(s * 0.52, 0.50, -1.50, 0.06, 0.24, 0.38, 0, c('steelDark'), 'metal');  /* heads */
      /* headers to the stacks */
      F.rod(s * 0.52, 0.56, -1.60, s * 0.42, 0.60, -1.73, 0.04, c('steelDark'), 'metal');
      F.rod(s * 0.42, 0.58, -1.73, s * 0.42, 1.52, -1.73, 0.045, c('oilBlack'), 'metal');   /* exhaust stack */
      F.taper(s * 0.42, 1.52, -1.73, 0, 1, 0, 0.045, 0.062, 0.07, c('brass'), 'metal', 8);  /* flared tip */
    }
    F.disc(0, 0.87, -1.56, 0, 1, 0, 0.13, 0.10, c('brass'), 'metal', 10);           /* air cleaner */
    F.disc(0, 0.935, -1.56, 0, 1, 0, 0.06, 0.03, c('brassDark'), 'metal', 8);
    F.lamp(0.12, 0.83, -1.36, 0, 1, 0, 0.035, 'cell', null, c('alloyDark'));      /* the Ancient cell's blue window */
    /* the radiator, upright behind the seats, with a fan shroud and hoses */
    F.box(0, 0.84, -0.99, 0.74, 0.54, 0.07, 0, c('brass'), 'metal');
    F.box(0, 0.88, -0.99, 0.64, 0.44, 0.09, 0, c('steelDark'), 'metal');
    F.disc(0, 1.10, -1.06, 0, 0, 1, 0.19, 0.06, c('oilBlack'), 'metal', 12);
    F.rod(-0.32, 1.42, -0.99, 0.32, 1.42, -0.99, 0.045, c('brass'), 'metal');   /* header tank */
    F.rod(0.24, 0.88, -1.02, 0.20, 0.78, -1.30, 0.03, c('hose'));
    F.rod(-0.24, 0.88, -1.02, -0.20, 0.78, -1.30, 0.03, c('hose'));

    /* ---- the cockpit: seats, dash and gauges, steering (driver on the +x side), gear lever */
    const seatCol = c(['seat', 'leather', 'canvasOlive'][v]);
    for (const s of [-1, 1]) {
      F.box(s * 0.32, 0.44, 0.36, 0.46, 0.14, 0.50, 0, seatCol);
      F.beam(s * 0.32, 0.56, 0.10, s * 0.32, 1.16, -0.02, 0.46, 0.10, seatCol);
      F.box(s * 0.32, 0.40, 0.36, 0.40, 0.04, 0.44, 0, c('oilBlack'), 'metal');
    }
    F.box(0, 0.70, 0.90, 1.12, 0.14, 0.10, 0, c('oilBlack'));
    for (const x of [0.20, 0.42]) {
      F.disc(x, 0.78, 0.848, 0, 0, -1, 0.048, 0.01, c('brass'), 'metal', 8);
      F.face(x, 0.78, 0.842, 0, 0, -1, 0.038, c('lensWarm'), '', 8);
    }
    F.rod(0.32, 0.62, 0.92, 0.32, 0.92, 0.70, 0.022, c('oilBlack'), 'metal');
    const sx = 0, sy = 0.30, sz = -0.22;               /* the column's direction */
    F.ring(0.32, 0.93, 0.69, sx, sy, sz, 0.17, 0.016, c('oilBlack'), 'metal', 12);
    F.rod(0.15, 0.93, 0.69, 0.49, 0.93, 0.69, 0.012, c('brass'), 'metal');
    F.rod(0.02, 0.44, 0.58, 0.04, 0.74, 0.52, 0.014, c('steel'), 'metal');
    F.knob(0.04, 0.75, 0.52, 0.03, c('brass'), 'metal');

    /* ---- behind the seats: the fuel tank; the Crew's bench on it, the Rig's cargo bed, the Scout's tray */
    F.rod(-0.46, 0.60, -0.68, 0.46, 0.60, -0.68, 0.14, c('oilBlack'), 'metal');
    F.disc(0.30, 0.755, -0.68, 0, 1, 0, 0.04, 0.05, c('brass'), 'metal', 8);
    if (crew) {
      F.box(0, 0.74, -0.58, 1.12, 0.12, 0.42, 0, seatCol);
      F.beam(0, 0.84, -0.78, 0, 1.30, -0.86, 1.12, 0.08, seatCol);
    } else if (rig) {
      F.box(0, 0.74, -0.56, 1.14, 0.04, 0.70, 0, c('steelDark'), 'metal');
      for (const s of [-1, 1]) F.box(s * 0.56, 0.78, -0.56, 0.03, 0.10, 0.70, 0, c('steelDark'), 'metal');
      /* drill pipe, stacked across the bed, and a crate of drill cores */
      for (let i = 0; i < 5; i++) {
        const row = i < 3 ? 0 : 1, k = row ? i - 3 : i, z0 = -0.38 - k * 0.11 - row * 0.055;
        F.rod(-0.50, 0.82 + row * 0.085, z0, 0.50, 0.82 + row * 0.085, z0, 0.042, c('steel'), 'metal');
      }
      F.box(0.20, 0.78, -0.78, 0.40, 0.18, 0.22, 0, c('wood'));
      F.box(-0.30, 0.78, -0.80, 0.30, 0.10, 0.20, 0, c('core'));
    } else {
      F.box(0, 0.74, -0.58, 1.10, 0.03, 0.54, 0, c('steelDark'), 'metal');
      F.box(-0.18, 0.77, -0.60, 0.44, 0.26, 0.34, 0, c('wood'));                 /* a crate */
      F.ring(0.26, 0.80, -0.60, 0, 1, 0, 0.13, 0.035, c('rope'), '', 12);       /* a coil of rope */
      if (F.chance(0.6)) F.box(0.26, 0.77, -0.82, 0.30, 0.16, 0.14, 0, c('canvasDark'));   /* a canvas pack */
    }

    /* ---- the roll cage: main hoop behind the seats, front hoop, top bars, harness bar, rear braces */
    for (const s of [-1, 1]) {
      F.tube([[s * 0.62, 0.82, -0.12], [s * 0.58, 1.62, -0.16], [s * 0.48, 1.76, -0.18]], T, cage, 'metal');
      F.tube([[s * 0.62, 0.84, 0.95], [s * 0.54, 1.62, 0.48], [s * 0.46, 1.74, 0.40]], T, cage, 'metal');
      F.rod(s * 0.46, 1.74, 0.40, s * 0.48, 1.76, -0.18, T, cage, 'metal');
      F.rod(s * 0.64, 0.84, 0.95, s * 0.64, 0.84, -0.12, T, cage, 'metal');             /* door bar */
    }
    F.rod(-0.48, 1.76, -0.18, 0.48, 1.76, -0.18, T, cage, 'metal');
    F.rod(-0.46, 1.74, 0.40, 0.46, 1.74, 0.40, T, cage, 'metal');
    F.rod(-0.60, 1.10, -0.13, 0.60, 1.10, -0.13, T, cage, 'metal');
    if (crew) {
      for (const s of [-1, 1]) {
        F.tube([[s * 0.60, 0.84, -0.93], [s * 0.54, 1.62, -0.96], [s * 0.46, 1.72, -0.98]], T, cage, 'metal');
        F.rod(s * 0.48, 1.76, -0.18, s * 0.46, 1.72, -0.98, T, cage, 'metal');
        F.rod(s * 0.46, 1.72, -0.98, s * 0.58, 0.52, -1.70, T, cage, 'metal');
      }
      F.rod(-0.46, 1.72, -0.98, 0.46, 1.72, -0.98, T, cage, 'metal');
    } else {
      for (const s of [-1, 1]) F.rod(s * 0.48, 1.76, -0.18, s * 0.58, 0.52, -1.70, T, cage, 'metal');
    }
    /* the lamp bar along the front hoop's top */
    F.rod(-0.42, 1.80, 0.40, 0.42, 1.80, 0.40, 0.022, c('oilBlack'), 'metal');
    for (const x of [-0.33, -0.11, 0.11, 0.33]) F.lamp(x, 1.80, 0.44, 0, 0, 1, 0.055, 'bar', c('oilBlack'), null);
    /* tail lamps on the rear bumper's ends */
    for (const s of [-1, 1]) F.lamp(s * 0.60, 0.62, -1.765, 0, 0, -1, 0.04, 'tail', null, c('oilBlack'));

    /* ---- the roof rack, and on it a rolled tarp (Scout, Crew) or the folded auger mast (Drill rig) */
    const rz1 = crew ? -0.96 : -0.18;
    for (const s of [-1, 1]) {
      F.rod(s * 0.44, 1.82, 0.36, s * 0.44, 1.82, rz1, 0.018, c('oilBlack'), 'metal');
      F.rod(s * 0.44, 1.76, 0.36, s * 0.44, 1.82, 0.36, 0.015, c('oilBlack'), 'metal');
      F.rod(s * 0.44, 1.76, rz1, s * 0.44, 1.82, rz1, 0.015, c('oilBlack'), 'metal');
    }
    for (let z = 0.36; z >= rz1 - 0.01; z -= crew ? 0.264 : 0.18) F.rod(-0.44, 1.82, z, 0.44, 1.82, z, 0.014, c('oilBlack'), 'metal');
    if (!rig) {
      const tarp = c(F.pick(['canvas', 'canvasOlive', 'canvasDark']));
      const tz = crew ? -0.30 : 0.10;
      F.rod(-0.40, 1.96, tz, 0.40, 1.96, tz, 0.12, tarp);
      for (const x of [-0.24, 0.24]) F.ring(x, 1.96, tz, 1, 0, 0, 0.123, 0.01, c('leather'), '', 12);
      if (crew) F.box(0.10, 1.83, 0.18, 0.50, 0.14, 0.28, 0, c('canvasDark'));         /* packs */
    } else {
      /* the auger mast, folded back along the rack: a three-rail truss, the auger stem and bit, the gear head at its
         foot on a rear A-frame, and the brass ram that raises it */
      const z0 = 0.62, z1 = -1.58;
      for (const s of [-1, 1]) F.rod(s * 0.13, 1.88, z0, s * 0.13, 1.88, z1, 0.022, c('oilBlack'), 'metal');
      F.rod(0, 2.06, z0, 0, 2.06, z1, 0.022, c('oilBlack'), 'metal');
      for (let z = z0; z >= z1 - 0.01; z -= 0.55) {
        F.rod(-0.13, 1.88, z, 0.13, 1.88, z, 0.014, c('oilBlack'), 'metal');
        for (const s of [-1, 1]) F.rod(s * 0.13, 1.88, z, 0, 2.06, z, 0.014, c('oilBlack'), 'metal');
      }
      F.rod(0, 1.95, z0 - 0.05, 0, 1.95, z1 + 0.30, 0.03, c('steel'), 'metal');          /* stem */
      for (let z = z0 - 0.15; z > z0 - 0.6; z -= 0.14) F.disc(0, 1.95, z, 0, 0.25, 1, 0.075, 0.012, c('steel'), 'metal', 8);   /* flights */
      F.taper(0, 1.95, z0 - 0.05, 0, 0, 1, 0.06, 0.006, 0.22, c('brassDark'), 'metal', 8);  /* bit */
      F.box(0, 1.80, -1.48, 0.32, 0.26, 0.26, 0, c('brass'), 'metal');                    /* gear head */
      for (const s of [-1, 1]) F.rod(s * 0.50, 0.52, -1.70, s * 0.10, 1.80, -1.50, 0.026, c('oilBlack'), 'metal');   /* A-frame */
      F.rod(0.18, 0.82, -1.66, 0.14, 1.86, -1.06, 0.035, c('brass'), 'metal');              /* ram */
    }

    /* ---- the jerry can rack on the step between the wheels (which slots are full is the seed's) */
    const can = function (x, z, col) {
      F.box(x, 0.45, z, 0.15, 0.44, 0.32, 0, col);
      F.box(x, 0.89, z + 0.05, 0.05, 0.04, 0.18, 0, col);                         /* handle */
      F.disc(x, 0.91, z - 0.11, 0, 1, 0, 0.025, 0.04, c('brass'), 'metal', 6);       /* cap */
      F.beam(x + Math.sign(x) * 0.077, 0.50, z - 0.12, x + Math.sign(x) * 0.077, 0.84, z + 0.12, 0.01, 0.03, col);   /* the X stamp */
      F.beam(x + Math.sign(x) * 0.077, 0.50, z + 0.12, x + Math.sign(x) * 0.077, 0.84, z - 0.12, 0.01, 0.03, col);
    };
    const canCols = ['jerryRed', 'jerryOlive', 'jerryBlack'];
    for (const s of [-1, 1]) {
      F.box(s * 0.80, 0.41, -0.36, 0.28, 0.04, 0.80, 0, c('steelDark'), 'metal');     /* step */
      F.rod(s * 0.93, 0.45, 0.04, s * 0.93, 0.80, 0.04, 0.016, c('oilBlack'), 'metal');
      F.rod(s * 0.93, 0.45, -0.76, s * 0.93, 0.80, -0.76, 0.016, c('oilBlack'), 'metal');
      F.rod(s * 0.93, 0.80, 0.04, s * 0.93, 0.80, -0.76, 0.016, c('oilBlack'), 'metal');
      F.rod(s * 0.93, 0.62, 0.04, s * 0.93, 0.62, -0.76, 0.012, c('leather'));       /* strap */
      const n = s > 0 ? 2 : (crew ? 1 : (F.chance(0.5) ? 2 : 1));
      for (let i = 0; i < n; i++) can(s * 0.80, -0.20 - i * 0.36, c(F.pick(canCols)));
    }

    /* ---- the whip aerial on the rear brace (-x side), with the guild pennant */
    const ax = -0.53, ay = 1.20, az = -0.92;
    F.taper(ax, ay - 0.06, az, 0, 1, 0, 0.03, 0.015, 0.12, c('brass'), 'metal', 8);   /* base spring */
    F.rod(ax, ay, az, ax, 2.40, az - 0.03, 0.008, c('oilBlack'), 'metal');
    F.rod(ax, 2.40, az - 0.03, ax, 3.02, az - 0.12, 0.006, c('oilBlack'), 'metal');
    const pen = c(v === 1 ? 'pennantBrass' : 'pennantBrown');
    F.tri([ax, 2.98, az - 0.11], [ax, 2.80, az - 0.085], [ax, 2.90, az - 0.52], pen);
  }
});

/* ---- kits/motor-vehicles/krator-vehicles-iziz.js ---- */
/* ======================================================================
   Krator Motor Vehicles: the Empire of Iziz (kits/motor-vehicles/krator-vehicles-iziz.js)

   The Empire of Iziz (LORE.md 6.2): the hyperjungle empire whose Forgemasters keep the last Ancient
   machines running (the walking mechs). Colours: orange, teal, cream; striped awnings. Sign: the sun
   (the palace's: an orb).

   One vehicle: iz_six_wheeler, an Ancient armoured six-wheeler recovered from the ruins and kept in the
   Forgemaster's Hall beside the mechs: a faceted hull over six balloon tyres (one steered axle in front,
   a tandem behind), a glasshouse cab of teal panes, running-gear housings between the wheels, a roll bar
   over the open rear bay. The Empire paints it its own orange and puts the sun on its flanks.
   Variants: 0 Lancer (orange, a four-tube rocket rack on the roof: the Empire's rockets, made at
   Roketstad when it was the Empire's munitions hub), 1 Courier (cream with an orange stripe, a striped
   awning over the bay, the palace orb on a mast, crates aboard). Frame: vehicles-core.js (+z forward).
   ====================================================================== */

VEHICLE_CULTURE('iziz', {
  name: 'Empire of Iziz', sign: 'sun',
  lore: 'hyperjungle empire; the Forgemasters keep Ancient machines running',
  /* PALETTE (sRGB; the runtime converts to linear). Vehicle keys only: the catalog's own iziz keys are
     not in this bundle (vehicle_bundle.py carries only the catalog core) */
  palette: {
    ochreOrange: 0xc0622c, ochreOrangeDark: 0x8e4420, creamPaint: 0xdccdaa, creamDark: 0xb4a482,
    tealGlass: 0x2f7f92, tealPaint: 0x2e7a72, gunmetal: 0x55534f, gunmetalDark: 0x34322f, underbody: 0x2a2826,
    tyre: 0x262422, rocket: 0xd0a440, rocketTip: 0xa8281c, gold: 0xc9a040, stripeCream: 0xe6d8b4,
    lensWarm: 0xfff1c8, lensRed: 0xa8180e, lensAmber: 0xe09020, crate: 0x7a5a3a, canvas: 0xa8936c
  }
});

VEHICLE({
  key: 'iz_six_wheeler', name: 'Izani armoured six-wheeler', culture: 'iziz',
  tags: { class: 'motor vehicle', type: ['vehicle', 'patrol', 'transport'], drive: 'wheeled', seats: 4, fuel: 'refined oil',
    terrain: ['road', 'track', 'sand', 'rock'], setting: 'outdoor', guild: 'Forgemasters' },
  variants: 2, variantNames: ['Lancer', 'Courier'],
  /* overall box: 2.8 wide, 6.7 long, 3.6 to the rockets' tips (the cab roof is 2.6) */
  w: 2.8, d: 6.7, h: 3.6,
  /* data, not code (units: m, m/s, m/s^2, kg, L, km, rad) */
  data: {
    speed: 20, accel: 1.6, turnRadius: 7.5, maxSteer: 0.5, seats: 4, cargo: 600, mass: 11200,
    fuel: 'refined oil', tank: 300, range: 600, drive: 'all six', wheelbase: 4.3, track: 2.24,
    clearance: 0.5, roofH: 2.6, engine: 'Ancient turbine, rebuilt by the Forgemasters', armament: 'four-tube rocket rack',
    wheels: [
      { name: 'wheel_fl', x: 1.12, z: 2.1, r: 0.62, w: 0.46, front: true, steer: true, drive: true },
      { name: 'wheel_fr', x: -1.12, z: 2.1, r: 0.62, w: 0.46, front: true, steer: true, drive: true },
      { name: 'wheel_l2', x: 1.12, z: -0.85, r: 0.62, w: 0.46, front: false, steer: false, drive: true },
      { name: 'wheel_r2', x: -1.12, z: -0.85, r: 0.62, w: 0.46, front: false, steer: false, drive: true },
      { name: 'wheel_rl', x: 1.12, z: -2.2, r: 0.62, w: 0.46, front: false, steer: false, drive: true },
      { name: 'wheel_rr', x: -1.12, z: -2.2, r: 0.62, w: 0.46, front: false, steer: false, drive: true }
    ]
  },
  variantData: [
    {},
    { seats: 6, cargo: 1400, mass: 10400, armament: 'none', speed: 22 }
  ],

  wheel: function (F, W) {
    const v = F.variant;
    vehicleBalloonTyre({ r: W.r, w: W.w, lugs: 11, lugH: 0.032, rim: 0.36, side: W.side, segs: 16,
      tyre: F.col('tyre'), rimCol: F.col(['ochreOrange', 'creamPaint'][v]), hubCol: F.col('gunmetalDark'),
      nutCol: F.col('gunmetal'), nuts: 6 });
    F.disc(W.side * W.w * 0.37, 0, 0, 1, 0, 0, 0.13, 0.05, F.col(['ochreOrangeDark', 'ochreOrange'][v]), 'metal', 8);   /* hub cap */
  },

  build: function (F) {
    const v = F.variant, c = F.col, lancer = v === 0;
    const paint = c(['ochreOrange', 'creamPaint'][v]), dark = c(['ochreOrangeDark', 'creamDark'][v]);
    const gm = c('gunmetal'), gmd = c('gunmetalDark'), glass = c('tealGlass');

    /* ---- the underbody: a narrow keel between the wheels (clear of the front wheels at full lock) */
    F.slab([[-3.0, 0.6, 0.52], [2.75, 0.6, 0.52], [3.2, 1.0, 0.52], [3.2, 1.3, 0.52], [-3.2, 1.3, 0.52], [-3.2, 0.9, 0.52]], c('underbody'), 'metal');
    /* ---- the hull in three bands, each with planar flanks: a belt flaring out over the wheels (1.18 -> 1.34),
       the upper hull leaning in (1.34 -> 1.22) with the hood rising to the windscreen, and the glasshouse cab */
    F.slab([[-3.25, 1.27, 1.18], [3.16, 1.27, 1.18], [3.33, 1.62, 1.34], [-3.3, 1.62, 1.34]], dark, '');
    F.slab([[-3.3, 1.62, 1.34], [3.33, 1.62, 1.34], [3.24, 1.84, 1.3], [1.85, 2.02, 1.22], [-3.2, 2.0, 1.22]], paint, '');
    const cabX = function (y) { return 1.08 - (y - 2.0) / 0.6 * 0.22; };
    const fzc = function (y) { return 1.85 - (y - 2.0) / 0.6 * 0.8; };
    F.slab([[1.85, 2.0, 1.08], [1.05, 2.6, 0.86], [-1.05, 2.6, 0.86], [-1.3, 2.0, 1.08]], paint, '');
    F.box(0, 2.6, 0.0, 1.6, 0.05, 2.0, 0, dark);                                                    /* roof plate */
    /* glazing: panes a hair proud of the cab's faces (double-sided triangles) */
    const pane = function (P) { F.tri(P[0], P[1], P[2], glass, 'metal'); F.tri(P[0], P[2], P[3], glass, 'metal'); };
    for (const s of [-1, 1]) {
      for (const zz of [[1.45, 0.45], [0.3, -0.85]]) {
        const y0 = 2.08, y1 = 2.5, z1 = zz[1];
        const zb0 = Math.min(zz[0], fzc(y0) - 0.08), zb1 = Math.min(zz[0], fzc(y1) - 0.08);
        pane([[s * (cabX(y0) + 0.012), y0, zb0], [s * (cabX(y1) + 0.012), y1, zb1], [s * (cabX(y1) + 0.012), y1, z1], [s * (cabX(y0) + 0.012), y0, z1]]);
      }
      const y0 = 2.08, y1 = 2.54;
      pane([[s * 0.06, y0, fzc(y0) + 0.012], [s * 0.06, y1, fzc(y1) + 0.012], [s * (cabX(y1) - 0.06), y1, fzc(y1) + 0.012], [s * (cabX(y0) - 0.07), y0, fzc(y0) + 0.012]]);
    }
    /* the front: hood vents, a grille under the nose, headlamps, tow eyes */
    for (let i = 0; i < 5; i++) { const z = 2.3 + i * 0.15; F.box(0, 1.84 + (3.24 - z) / 1.39 * 0.18 + 0.005, z, 0.9, 0.03, 0.06, 0, gmd, 'metal'); }
    F.box(0, 0.98, 3.2, 1.0, 0.3, 0.04, 0, gmd, 'metal');
    for (let i = 0; i < 6; i++) F.box(-0.4 + i * 0.16, 0.98, 3.22, 0.04, 0.3, 0.03, 0, gm, 'metal');
    for (const s of [-1, 1]) {
      F.lamp(s * 0.98, 1.45, 3.26, 0, -0.45, 1, 0.08, 'head', gmd, gm);
      F.lamp(s * 1.05, 1.45, -3.29, 0, 0, -1, 0.065, 'tail', null, gmd);
      F.box(s * 0.42, 0.8, 3.16, 0.16, 0.16, 0.2, 0, gmd, 'metal');                                  /* tow eyes */
    }
    /* ---- running-gear housings between the front and middle wheels; flank vents, an access panel, a step */
    for (const s of [-1, 1]) {
      F.box(s * 0.9, 0.5, 0.62, 0.4, 0.78, 0.84, 0, gm, 'metal');
      F.disc(s * 1.11, 0.9, 0.62, 1, 0, 0, 0.15, 0.03, gmd, 'metal', 10);
      F.disc(s * 1.12, 0.9, 0.62, 1, 0, 0, 0.05, 0.03, c('rocketTip'), 'metal', 8);
      for (let i = 0; i < 4; i++) F.box(s * 1.31, 1.82, -1.45 - i * 0.14, 0.03, 0.22, 0.06, 0, gmd, 'metal');
      F.box(s * 1.32, 1.72, 1.0, 0.03, 0.2, 0.7, 0, dark);
      F.box(s * 1.2, 1.3, 0.62, 0.16, 0.04, 0.6, 0, gmd, 'metal');
    }
    if (!lancer) for (const s of [-1, 1]) F.box(s * 1.268, 1.9, -0.1, 0.02, 0.07, 6.2, 0, c('ochreOrange'));   /* the Courier's stripe */
    /* the sun on both flanks: a gold disc with eight rays on the upper hull, behind the front wheel */
    for (const s of [-1, 1]) {
      const y = 1.8, z = 0.25, xr = function (yy) { return s * (1.34 - (yy - 1.62) / 0.38 * 0.12 + 0.016); };
      F.disc(xr(y), y, z, s, 0.12 / 0.38, 0, 0.12, 0.02, c('gold'), 'metal', 12);
      for (let i = 0; i < 8; i++) {
        const a = i * TAU / 8, ca = Math.cos(a), sa = Math.sin(a), w0 = 0.035;
        const p0 = [y + sa * 0.14, z + ca * 0.14], p1 = [y + sa * 0.24, z + ca * 0.24];
        F.tri([xr(p0[0] - ca * w0), p0[0] - ca * w0, p0[1] + sa * w0], [xr(p0[0] + ca * w0), p0[0] + ca * w0, p0[1] - sa * w0], [xr(p1[0]), p1[0], p1[1]], c('gold'), 'metal');
      }
    }

    /* ---- the rear bay: a deck, side rails, a roll bar over it */
    F.box(0, 2.0, -2.25, 2.3, 0.03, 1.9, 0, gmd, 'metal');
    for (const s of [-1, 1]) {
      F.rod(s * 1.12, 2.02, -1.33, s * 1.12, 2.36, -1.33, 0.035, gmd, 'metal');
      F.tube([[s * 1.12, 2.02, -3.12], [s * 1.04, 2.68, -3.02], [s * 0.92, 2.72, -2.97]], 0.045, gmd, 'metal');
      F.rod(s * 1.12, 2.36, -1.33, s * 1.12, 2.36, -3.07, 0.03, gmd, 'metal');
    }
    F.rod(-0.92, 2.72, -2.97, 0.92, 2.72, -2.97, 0.045, gmd, 'metal');
    F.lamp(0, 2.66, 0.92, 0, 0.2, 1, 0.07, 'amber', gmd, null);                                       /* the roof beacon */
    F.rod(-0.75, 2.62, -0.95, -0.75, 3.2, -1.0, 0.012, gmd, 'metal');                                /* whip */

    if (lancer) {
      /* the rocket rack: a turntable on the roof, a cradle, four tubes raised 22 degrees, red tips */
      F.disc(0, 2.66, -0.45, 0, 1, 0, 0.42, 0.08, gmd, 'metal', 14);
      F.box(0, 2.7, -0.45, 0.5, 0.18, 0.6, 0, dark);
      const el = 22 * Math.PI / 180, dy = Math.sin(el), dz = Math.cos(el);
      for (const s of [-1, 1]) F.box(s * 0.3, 2.72, -0.45, 0.06, 0.26, 0.5, 0, gm, 'metal');
      for (const tx of [-0.13, 0.13]) for (const ty of [0, 0.14]) {
        const x = tx, y = 2.9 + ty, z = -0.95, L = 1.15;
        F.rod(x, y, z, x, y + dy * L, z + dz * L, 0.058, c('rocket'), 'metal');
        F.taper(x, y + dy * L, z + dz * L, 0, dy, dz, 0.058, 0.01, 0.16, c('rocketTip'), 'metal', 8);
      }
      F.rod(-0.24, 2.92, -0.62, 0.24, 2.92, -0.62, 0.03, gm, 'metal');
      /* reload crates in the bay */
      for (const s of [-1, 1]) F.box(s * 0.5, 2.02, -2.45, 0.5, 0.3, 1.2, 0, c('ochreOrangeDark'));
    } else {
      /* the Courier: a striped awning on four posts over the bay, the palace orb on a mast, crates */
      for (const sx of [-1, 1]) for (const z of [-1.45, -3.05]) F.rod(sx * 1.0, 2.36, z, sx * 1.0, 2.95, z, 0.022, gmd, 'metal');
      const stripes = 7;
      for (let i = 0; i < stripes; i++) {
        const x0 = -1.06 + i * 2.12 / stripes, x1 = x0 + 2.12 / stripes, sag = function (x) { return 2.99 - 0.05 * (1 - Math.pow(x / 1.06, 2)); };
        const col = c(i % 2 ? 'stripeCream' : 'ochreOrange');
        F.tri([x0, sag(x0), -1.4], [x1, sag(x1), -1.4], [x1, sag(x1), -3.1], col);
        F.tri([x0, sag(x0), -1.4], [x1, sag(x1), -3.1], [x0, sag(x0), -3.1], col);
        F.tri([x0, sag(x0), -3.1], [x1, sag(x1), -3.1], [(x0 + x1) / 2, 2.84, -3.15], col);              /* the scalloped valance */
      }
      F.rod(0.75, 2.62, -0.2, 0.75, 3.2, -0.2, 0.02, c('gold'), 'metal');
      F.knob(0.75, 3.25, -0.2, 0.08, c('gold'), 'metal');
      F.box(-0.45, 2.02, -2.05, 0.7, 0.42, 0.5, 0, c('crate'));
      F.box(0.4, 2.02, -2.55, 0.6, 0.34, 0.6, 0, c('crate'));
      if (F.chance(0.6)) F.blob(0.35, 2.48, -1.9, 0.35, 0.4, 0, c('canvas'));
    }
  }
});

/* ---- kits/motor-vehicles/krator-vehicles-post-apoc.js ---- */
/* ======================================================================
   Krator Motor Vehicles: the Post-Apoc settlers (kits/motor-vehicles/krator-vehicles-post-apoc.js)

   The Post-Apoc settlers (LORE.md 6.17): a culture-neutral salvage society that fleshes out reclaimed
   arcologies and wreck towns. Sign: the gear. Colours: faded rust red, teal, mustard, olive.

   One vehicle: pa_crawler_hab, a moving house on four track bogies: an armoured cab with a wedge nose
   and a railed roof deck lined with jerry cans, a rust-plated hab behind it, two shipping containers
   stacked on top (one cantilevered on struts), a glass dome, a dish and a forest of TV aerials, a big
   exhaust run along its flank, a balcony and a ladder at the back. It goes where a wheel cannot (mud,
   rock, snow) at a walking pace, and turns on the spot (skid steer: no wheel steers, maxSteer 0).
   Variants: 0 Hab (rust and olive), 1 Trader (faded teal panels, mustard trim, a striped awning over the
   balcony, crates on the deck). Frame: vehicles-core.js (+z forward). The road wheels are the moving
   wheels (lift: they ride the belt, 8 cm above the ground); the belts, sprockets and idlers are static.
   ====================================================================== */

VEHICLE_CULTURE('post-apoc', {
  name: 'Post-Apoc settlers', sign: 'gear',
  lore: 'culture-neutral salvage society of the reclaimed arcologies and wreck towns',
  /* PALETTE (sRGB; the runtime converts to linear) */
  palette: {
    rust: 0x8a4a2a, rustDark: 0x5e3220, rustLight: 0xa8643a, rustBrown: 0x6e4630,
    olive: 0x5c5a3a, oliveDark: 0x3e3d28, khaki: 0x7a6e4a, fadedTeal: 0x4e8078, fadedTealDark: 0x3a5e58,
    mustard: 0xc0982e, fadedRed: 0x9a3a2c, steel: 0x5a5650, steelDark: 0x34322e, trackIron: 0x2c2a27,
    rubber: 0x232120, glass: 0x34404a, domeGlass: 0x6a8a94, jerryRed: 0xa8301e, jerryYellow: 0xc8a82a,
    canvas: 0x9a8a62, crate: 0x7a5a3a, cream: 0xd6c8a4,
    lensWarm: 0xfff1c8, lensRed: 0xa8180e, lensAmber: 0xe09020
  }
});

/* the four bogies: centre z, and which side; three road wheels each (offsets -0.8, 0, +0.8), lift = belt */
const PA_BOGIES = [{ k: 'lf', x: 1.7, z: 3.2, front: true }, { k: 'rf', x: -1.7, z: 3.2, front: true },
  { k: 'lr', x: 1.7, z: -3.1, front: false }, { k: 'rr', x: -1.7, z: -3.1, front: false }];
const PA_BELT = 0.08;

VEHICLE({
  key: 'pa_crawler_hab', name: 'Post-Apoc crawler hab', culture: 'post-apoc',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport', 'cargo'], drive: 'tracked', seats: 4, fuel: 'crude oil',
    terrain: ['sand', 'salt flat', 'mud', 'rock', 'snow'], setting: 'outdoor' },
  variants: 2, variantNames: ['Hab', 'Trader'],
  /* overall box: 4.6 wide, 11.6 long; the roofs are 5.9, the tallest aerial 8.45 */
  w: 4.6, d: 11.6, h: 8.5,
  budget: { tris: 15500 },
  /* data, not code (units: m, m/s, m/s^2, kg, L, km, rad) */
  data: {
    speed: 6, accel: 0.4, turnRadius: 0, maxSteer: 0, steering: 'skid (tracks), turns on the spot', seats: 4, berths: 8,
    cargo: 6000, mass: 34000, fuel: 'crude oil', tank: 1800, range: 900, drive: 'tracked, four bogies',
    wheelbase: 6.3, track: 3.4, clearance: 0.55, belt: PA_BELT, engine: 'twin salvaged diesels under the hab floor',
    wheels: [].concat.apply([], PA_BOGIES.map(function (B) {
      return [-0.8, 0, 0.8].map(function (o, i) {
        return { name: 'wheel_' + B.k + (i + 1), x: B.x, z: B.z + o, r: 0.36, w: 0.62, lift: PA_BELT, front: B.front, steer: false, drive: true };
      });
    }))
  },
  variantData: [
    {},
    { cargo: 9000, berths: 4, mass: 35500, trade: 'scrap, fuel, water' }
  ],

  /* ONE road wheel at the origin, axle along x: a pair of rubber-tyred steel discs (the track's guide teeth
     run between them), a hub cap and lightening holes outward */
  wheel: function (F, W) {
    const r = W.r, w = W.w, c = F.col, s = W.side;
    for (const x of [-w * 0.27, w * 0.27]) {
      F.disc(x, 0, 0, 1, 0, 0, r, w * 0.36, c('rubber'), '', 16);
      F.disc(x, 0, 0, 1, 0, 0, r * 0.8, w * 0.4, c('steel'), 'metal', 12);
    }
    F.disc(s * w * 0.45, 0, 0, 1, 0, 0, 0.11, 0.07, c('steelDark'), 'metal', 8);
    for (let i = 0; i < 5; i++) {
      const a = i * TAU / 5;
      F.disc(s * (w * 0.47 + 0.002), Math.cos(a) * 0.19, Math.sin(a) * 0.19, 1, 0, 0, 0.045, 0.01, c('steelDark'), 'metal', 6);
    }
  },

  build: function (F) {
    const v = F.variant, c = F.col, trader = v === 1;
    const paint = c(['rust', 'fadedTeal'][v]), paintDark = c(['rustDark', 'fadedTealDark'][v]);
    const trim = c(['olive', 'mustard'][v]);
    const steel = c('steel'), steelDark = c('steelDark'), iron = c('trackIron');

    /* ---- the running gear: per bogie a belt round three road wheels, a raised sprocket and idler, a beam, a fender */
    for (const B of PA_BOGIES) {
      const circ = [[B.z - 0.8, PA_BELT + 0.36, 0.36], [B.z, PA_BELT + 0.36, 0.36], [B.z + 0.8, PA_BELT + 0.36, 0.36],
        [B.z + 1.45, 0.7, 0.34], [B.z - 1.45, 0.7, 0.34]];
      F.track(B.x, 0.8, PA_BELT, circ, 0.2, iron, 'metal');
      for (const e of [1.45, -1.45]) {
        F.disc(B.x, 0.7, B.z + e, 1, 0, 0, 0.3, 0.5, steel, 'metal', 12);
        F.ring(B.x, 0.7, B.z + e, 1, 0, 0, 0.3, 0.04, steelDark, 'metal', 14);
        F.disc(B.x + Math.sign(B.x) * 0.26, 0.7, B.z + e, 1, 0, 0, 0.1, 0.04, steelDark, 'metal', 8);
      }
      const ix = B.x - Math.sign(B.x) * 0.48;
      F.box(ix, 0.5, B.z, 0.12, 0.3, 3.1, 0, steelDark, 'metal');                                       /* the bogie beam */
      F.box(ix, 0.8, B.z, 0.16, 0.4, 0.4, 0, steelDark, 'metal');                                       /* its pivot */
      F.box(B.x, 1.18, B.z, 0.98, 0.05, 3.3, 0, trim, 'metal');                                          /* fender */
      for (const e of [1, -1]) F.beam(B.x, 1.2, B.z + e * 1.64, B.x, 0.98, B.z + e * 1.98, 0.98, 0.05, trim, 'metal');
    }
    /* the deck and the belly between the bogies: tanks, a sump */
    F.box(0, 1.14, -0.15, 3.9, 0.42, 10.7, 0, c('oliveDark'), 'metal');
    F.box(0, 0.55, 0.05, 2.4, 0.6, 2.3, 0, steelDark, 'metal');
    F.rod(-1.1, 0.78, 0.05, 1.1, 0.78, 0.05, 0.3, c('olive'), 'metal');

    /* ---- the cab: a box with a sloped windscreen, and an armoured wedge nose below it */
    F.slab([[2.6, 1.55, 1.6], [5.15, 1.55, 1.6], [5.15, 2.35, 1.6], [4.6, 3.35, 1.6], [2.6, 3.35, 1.6]], c(['khaki', 'fadedTeal'][v]), '');
    F.slab([[5.05, 0.95, 1.45], [5.5, 0.95, 1.45], [5.8, 1.45, 1.4], [5.72, 2.05, 1.35], [5.05, 2.45, 1.45]], c(['olive', 'khaki'][v]), 'metal');
    const pane = function (P) { F.tri(P[0], P[1], P[2], c('glass'), 'metal'); F.tri(P[0], P[2], P[3], c('glass'), 'metal'); };
    const wz = function (y) { return 5.15 - (y - 2.35) * 0.55 + 0.012; };
    for (const xr of [[-1.45, -0.55], [-0.45, 0.45], [0.55, 1.45]]) {
      pane([[xr[0], 2.5, wz(2.5)], [xr[0] + 0.05, 3.22, wz(3.22)], [xr[1] - 0.05, 3.22, wz(3.22)], [xr[1], 2.5, wz(2.5)]]);
    }
    for (const s of [-1, 1]) {
      const x = s * 1.612;
      pane([[x, 2.45, 3.3], [x, 3.18, 3.3], [x, 3.18, 4.42], [x, 2.45, 4.82]]);
      F.box(x, 1.7, 3.0, 0.03, 0.6, 1.0, 0, steelDark, 'metal');                                      /* a grille plate */
      for (let i = 0; i < 6; i++) F.box(s * 1.63, 1.75 + i * 0.09, 3.0, 0.02, 0.025, 0.96, 0, iron, 'metal');
      F.lamp(s * 1.05, 1.62, 5.785, 0, 0, 1, 0.1, 'head', steelDark, steel);
    }
    F.box(0, 1.8, 5.77, 0.7, 0.24, 0.03, 0, c('fadedRed'));                                            /* a red placard */
    F.box(0, 1.84, 5.785, 0.5, 0.16, 0.02, 0, c('cream'));
    F.box(0, 0.85, 5.72, 3.7, 0.22, 0.14, 0, steelDark, 'metal');                                        /* the bumper */
    for (const s of [-1, 1]) F.rod(s * 1.88, 0.96, 5.72, s * 1.88, 0.96, 5.2, 0.05, steelDark, 'metal');
    /* the roof deck over the cab: a railing and a row of red jerry cans */
    const rail = function (pts, h) {
      for (const p of pts) F.rod(p[0], p[1], p[2], p[0], p[1] + h, p[2], 0.022, steel, 'metal');
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        F.rod(a[0], a[1] + h, a[2], b[0], b[1] + h, b[2], 0.025, steel, 'metal');
        F.rod(a[0], a[1] + h * 0.5, a[2], b[0], b[1] + h * 0.5, b[2], 0.018, steel, 'metal');
      }
    };
    rail([[-1.55, 3.35, 2.62], [-1.55, 3.35, 4.55], [1.55, 3.35, 4.55], [1.55, 3.35, 2.62]], 0.85);
    const can = function (x, y, z, col, ry) { F.box(x, y, z, 0.17, 0.46, 0.34, ry || 0, col); F.box(x, y + 0.46, z + 0.06, 0.06, 0.04, 0.16, ry || 0, col); };
    for (let i = 0; i < 7; i++) can(-1.2 + i * 0.4, 3.36, 4.28, c(F.chance(0.85) ? 'jerryRed' : 'jerryYellow'), Math.PI / 2);
    for (const x of [-0.6, 0, 0.6]) F.lamp(x, 4.25, 4.58, 0, 0, 1, 0.06, 'bar', steelDark, null);

    /* ---- the hab: a rust-plated box behind the cab; plates of other rust, corrugation, grille windows */
    F.box(0, 1.55, -1.4, 3.7, 2.15, 8.0, 0, paint);
    F.box(0, 3.68, -1.4, 3.76, 0.06, 8.06, 0, trim, 'metal');
    const plates = ['rust', 'rustDark', 'rustLight', 'rustBrown'];
    for (const s of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const z = -5.0 + i * 1.6 + F.rr(-0.1, 0.1), y = F.rr(1.8, 2.8);
        F.box(s * 1.86, y, z, 0.02, F.rr(0.4, 0.8), F.rr(0.7, 1.3), 0, trader ? c(F.pick(['fadedTeal', 'fadedTealDark', 'rustLight'])) : c(F.pick(plates)));
      }
      for (let z = -5.25; z < 2.5; z += 0.32) F.box(s * 1.865, 1.6, z, 0.025, 2.05, 0.05, 0, paintDark);
      for (const z of [-3.6, -1.3, 1.1]) {
        F.box(s * 1.88, 2.45, z, 0.04, 0.62, 0.9, 0, c('glass'), 'metal');
        for (let i = 0; i < 4; i++) F.box(s * 1.9, 2.45, z - 0.33 + i * 0.22, 0.03, 0.62, 0.035, 0, iron, 'metal');
        F.box(s * 1.89, 3.08, z, 0.05, 0.05, 1.0, 0, trim, 'metal');
      }
    }
    /* the gear on both flanks */
    for (const s of [-1, 1]) {
      const gx = s * 1.9, gy = 3.08, gz = 0.05, mustard = c('mustard');
      F.disc(gx, gy, gz, 1, 0, 0, 0.26, 0.03, mustard, '', 14);
      F.disc(gx + s * 0.012, gy, gz, 1, 0, 0, 0.09, 0.03, paintDark, '', 10);
      for (let i = 0; i < 10; i++) {
        const a = i * TAU / 10, m = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.09), mat(mustard, ''));
        m.position.set(gx, gy + Math.cos(a) * 0.29, gz + Math.sin(a) * 0.29); m.rotation.x = a; _add(m);
      }
    }
    /* the rear: a door, the balcony on the right with its rail, the ladder down past the track, tail lamps */
    F.box(-0.6, 1.62, -5.42, 1.0, 1.95, 0.04, 0, paintDark);
    F.box(0.95, 2.2, -4.35, 0.8, 0.06, 2.0, 0, steelDark, 'metal');
    F.box(1.85 + 0.2, 2.2, -4.35, 0.4, 0.06, 2.0, 0, steelDark, 'metal');
    rail([[1.86, 2.26, -3.35], [2.25, 2.26, -3.35], [2.25, 2.26, -5.36], [1.4, 2.26, -5.36]], 0.85);
    for (const x of [1.45, 1.95]) F.rod(x, 2.2, -5.4, x, 0.03, -5.74, 0.03, steel, 'metal');
    for (let i = 1; i < 8; i++) { const t = i / 8; F.rod(1.45, 2.2 - t * 2.17, -5.4 - t * 0.34, 1.95, 2.2 - t * 2.17, -5.4 - t * 0.34, 0.018, steel, 'metal'); }
    for (const s of [-1, 1]) F.lamp(s * 1.2, 1.5, -5.42, 0, 0, -1, 0.07, 'tail', null, steelDark);
    for (let i = 0; i < 3; i++) can(2.0, 2.26, -4.9 + i * 0.4, c(F.pick(['jerryYellow', 'jerryRed', 'jerryYellow'])), 0);
    /* the exhaust: a big pipe with a U-bend along the left flank, collars, a stack */
    const ex = [[-1.86, 1.62, 2.3], [-2.08, 1.95, 2.0], [-2.08, 1.95, 0.4], [-2.08, 2.55, 0.1], [-2.08, 2.55, -1.6], [-2.08, 1.95, -1.9], [-2.08, 1.95, -3.2], [-2.0, 3.0, -3.5], [-2.0, 4.6, -3.5]];
    F.tube(ex, 0.1, steelDark, 'metal');
    for (let i = 1; i < ex.length - 1; i++) F.ring(ex[i][0], ex[i][1], ex[i][2], ex[i + 1][0] - ex[i - 1][0], ex[i + 1][1] - ex[i - 1][1], ex[i + 1][2] - ex[i - 1][2], 0.11, 0.025, c('rustLight'), 'metal', 10);
    F.taper(-2.0, 4.6, -3.5, 0, 1, 0, 0.1, 0.14, 0.18, c('rustDark'), 'metal', 10);
    for (const z of [0.9, -2.5]) F.box(-1.95, 1.9, z, 0.2, 0.08, 0.08, 0, steel, 'metal');            /* pipe brackets */

    /* ---- the upper level: container A (forward, under the dome), container B (aft, cantilevered right on struts) */
    const container = function (x0, x1, z0, z1, y0, h, col, dark) {
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
      F.box(cx, y0, cz, w, h, d, 0, col);
      for (let z = z0 + 0.2; z < z1 - 0.1; z += 0.28) for (const x of [x0 - 0.012, x1 + 0.012]) F.box(x, y0 + 0.08, z, 0.025, h - 0.16, 0.06, 0, dark);
      for (const x of [x0, x1]) for (const z of [z0, z1]) F.box(x, y0, z, 0.1, h, 0.1, 0, dark, 'metal');   /* corner posts */
    };
    const colA = c(trader ? 'fadedTeal' : 'rustBrown'), colB = c(trader ? 'mustard' : 'rust');
    container(-1.5, 1.3, -1.2, 2.4, 3.71, 2.2, colA, c(trader ? 'fadedTealDark' : 'rustDark'));
    container(-1.3, 2.25, -5.0, -1.45, 3.71, 2.0, colB, c(trader ? 'khaki' : 'rustDark'));
    for (const z of [-4.6, -1.9]) F.rod(1.86, 2.4, z, 2.2, 3.7, z, 0.05, steelDark, 'metal');           /* the cantilever struts */
    /* their windows */
    for (const z of [0.0, 1.5]) { F.box(1.315, 4.5, z, 0.04, 0.55, 0.8, 0, c('glass'), 'metal'); F.box(1.33, 5.07, z, 0.05, 0.05, 0.9, 0, trim, 'metal'); }
    F.box(-1.515, 4.5, 0.6, 0.04, 0.55, 1.2, 0, c('glass'), 'metal');
    for (const z of [-4.1, -2.5]) {
      F.box(2.265, 4.3, z, 0.04, 0.6, 0.7, 0, c('glass'), 'metal');
      for (let i = 0; i < 3; i++) F.box(2.285, 4.3, z - 0.24 + i * 0.24, 0.03, 0.6, 0.035, 0, iron, 'metal');
    }
    F.box(-0.1, 4.4, 2.415, 0.9, 0.7, 0.03, 0, c('glass'), 'metal');
    /* the dome on container A: glass, a base ring, ribs */
    const dx = -0.15, dzz = 1.3, dy = 5.91;
    F.cyl(dx, dy, dzz, 0.92, 0.12, 0, steelDark, 'metal');
    F.dome(dx, dy + 0.12, dzz, 0.86, 0.72, 0, c('domeGlass'), 'metal');
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8, pts = [];
      for (let k = 0; k <= 4; k++) { const t = k / 4 * Math.PI / 2; pts.push([dx + Math.cos(a) * Math.cos(t) * 0.875, dy + 0.12 + Math.sin(t) * 0.735, dzz + Math.sin(a) * Math.cos(t) * 0.875]); }
      F.tube(pts, 0.018, steelDark, 'metal');
    }
    F.knob(dx, dy + 0.87, dzz, 0.07, steelDark, 'metal');
    /* rails round container B's roof, a beacon */
    rail([[-1.25, 5.71, -1.5], [-1.25, 5.71, -4.95], [2.2, 5.71, -4.95], [2.2, 5.71, -1.5]], 0.7);
    F.lamp(1.8, 5.95, -1.7, 0, 0.3, 1, 0.07, 'amber', steelDark, null);
    F.cyl(1.8, 5.71, -1.8, 0.08, 0.2, 0, steelDark, 'metal');

    /* ---- the dish on container A's aft roof, and the TV aerials */
    F.rod(0.7, 5.91, -0.6, 0.7, 6.75, -0.6, 0.05, steel, 'metal');
    F.box(0.7, 6.7, -0.6, 0.18, 0.14, 0.18, 0, steelDark, 'metal');
    F.taper(0.7, 6.82, -0.56, 0.25, 0.55, 0.8, 0.05, 0.66, 0.26, c('cream'), 'metal', 14);
    F.rod(0.7, 6.82, -0.56, 0.86, 7.15, -0.07, 0.015, steelDark, 'metal');                               /* the feed */
    const aerial = function (x, y0, z, top, ry) {
      F.rod(x, y0, z, x, top, z, 0.025, steel, 'metal');
      for (let i = 0; i < 4; i++) {
        const y = top - 0.12 - i * 0.32, L = 0.55 - i * 0.07, a = ry + (i % 2) * Math.PI / 2;
        F.rod(x - Math.cos(a) * L, y, z - Math.sin(a) * L, x + Math.cos(a) * L, y, z + Math.sin(a) * L, 0.012, steel, 'metal');
      }
      F.rod(x, top - 0.2, z, x - 0.45, top - 0.75, z + 0.1, 0.01, steel, 'metal');                     /* a stay wire */
    };
    aerial(-1.2, 5.91, 0.0, 8.42, 0.3);
    aerial(1.9, 5.71, -3.4, 7.9, 0.8);
    aerial(-0.9, 5.71, -4.6, 7.3, 0.1);

    /* ---- the Trader's awning over the balcony and its crates on the deck; the Hab's spare drums */
    if (trader) {
      for (let i = 0; i < 6; i++) {
        const z0 = -3.3 - i * 0.345, z1 = z0 - 0.345, col = c(i % 2 ? 'mustard' : 'fadedRed');
        F.tri([1.86, 3.5, z0], [2.28, 3.15, z0], [2.28, 3.15, z1], col); F.tri([1.86, 3.5, z0], [2.28, 3.15, z1], [1.86, 3.5, z1], col);
      }
      for (let i = 0; i < 3; i++) F.box(-0.9 + i * 0.9, 3.36, 3.25, 0.6, 0.5, 0.6, F.rr(-0.2, 0.2), c('crate'));
      F.blob(0.5, 5.95, -3.3, 0.55, 0.5, 0, c('canvas'));
    } else {
      for (const z of [-2.4, -3.1]) F.cyl(-0.5, 5.71, z, 0.28, 0.85, 0, c(F.pick(['fadedRed', 'olive', 'rustDark'])), 'metal');
    }
  }
});

/* ---- kits/motor-vehicles/krator-vehicles-republic.js ---- */
/* ======================================================================
   Krator Motor Vehicles: the Iron Republic (kits/motor-vehicles/krator-vehicles-republic.js)

   The Iron Republic (LORE.md 6.3): the highland forge state whose capital Roketstad was once an
   Ancient spaceport. Its Salvagers strip the Ancient ruins; its Rocketeers keep the rockets. Colours:
   deep red, ochre, cream. Sign: a triskelion of three arms, each fist holding a sword at 90 degrees.

   One vehicle: rep_crawler, the Salvagers' crawler. An Ancient planetary rover dug out of the spaceport
   aprons (a cream bowl of a hull on eight wire-mesh wheels, each with its own hub motor) that the Republic
   keeps rolling across the salt flats as a moving salvage camp: a solar lid that opens like a clam to
   charge the Ancient cell, an instrument head with two camera eyes, a lamp spire and a tiered mast, the
   Republic's red band and triskelion painted where the Ancients' marks were scraped off.
   Variants: 0 Survey (cream, the lid open to the sun), 1 Hauler (ochre, the lid shut and loaded with
   crates and drums). Frame: kits/motor-vehicles/vehicles-core.js (+z forward, wheels on y = 0).
   ====================================================================== */

VEHICLE_CULTURE('republic', {
  name: 'Iron Republic', sign: 'triskelion of three sword-arms, red',
  lore: 'highland forge state; capital Roketstad, once an Ancient spaceport; Salvagers strip the ruins',
  /* PALETTE (sRGB; the runtime converts to linear) */
  palette: {
    hullCream: 0xd8ccae, hullCreamDark: 0xb3a587, hullOchre: 0xc29a58, hullOchreDark: 0x9a7740,
    deck: 0xc4b896, red: 0xa3261c, redDark: 0x7a1a14,
    steel: 0x6a665e, steelDark: 0x3e3b37, iron: 0x2a2826, wire: 0x8a867c, brass: 0xb08a3a, copper: 0xa0623a,
    panel: 0x1a2232, panelGrid: 0x7c7a70, glass: 0x26343e,
    lensWarm: 0xfff1c8, lensRed: 0xa8180e, lensAmber: 0xe09020, glowBlue: 0x8fd8ff,
    canvas: 0x8f7d5a, crate: 0x7a5a3a, drum: 0x5e3a28, drumRed: 0x8a2a1c, rope: 0x9a8458
  }
});

VEHICLE({
  key: 'rep_crawler', name: 'Republic salvage crawler', culture: 'republic',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport', 'survey'], drive: 'wheeled', seats: 6, fuel: 'battery',
    terrain: ['sand', 'salt flat', 'rock'], setting: 'outdoor', guild: 'Salvagers' },
  variants: 2, variantNames: ['Survey', 'Hauler'],
  /* overall box: 6.0 wide, 11.4 long; the lid's raised edge reaches 8.4, the lamp spire 9.2 */
  w: 6.0, d: 11.4, h: 9.2,
  budget: { tris: 15500 },                          /* eight wire-mesh wheels; one crawler to a world */
  /* data, not code (units: m, m/s, m/s^2, kg, L, km, rad, kWh) */
  data: {
    speed: 4.5, accel: 0.3, turnRadius: 12, maxSteer: 0.3, seats: 6, cargo: 4000, mass: 38000,
    fuel: 'battery', tank: 0, battery: 900, solar: true, range: 400, drive: 'all, a hub motor in every wheel',
    wheelbase: 7.8, track: 5.0, clearance: 1.0, steering: 'front and rear axles, opposite',
    engine: 'Ancient hub motors, eight; a salvaged cell charged by the solar lid',
    wheels: [
      { name: 'wheel_fl', x: 2.5, z: 3.9, r: 1.2, w: 0.66, front: true, steer: true, drive: true },
      { name: 'wheel_fr', x: -2.5, z: 3.9, r: 1.2, w: 0.66, front: true, steer: true, drive: true },
      { name: 'wheel_l2', x: 2.5, z: 1.3, r: 1.2, w: 0.66, front: false, steer: false, drive: true },
      { name: 'wheel_r2', x: -2.5, z: 1.3, r: 1.2, w: 0.66, front: false, steer: false, drive: true },
      { name: 'wheel_l3', x: 2.5, z: -1.3, r: 1.2, w: 0.66, front: false, steer: false, drive: true },
      { name: 'wheel_r3', x: -2.5, z: -1.3, r: 1.2, w: 0.66, front: false, steer: false, drive: true },
      { name: 'wheel_rl', x: 2.5, z: -3.9, r: 1.2, w: 0.66, front: false, steer: true, steerRatio: -1, drive: true },
      { name: 'wheel_rr', x: -2.5, z: -3.9, r: 1.2, w: 0.66, front: false, steer: true, steerRatio: -1, drive: true }
    ]
  },
  variantData: [
    {},
    { cargo: 9000, mass: 41000, speed: 3.5, lid: 'shut, loaded' }
  ],

  /* ONE wire-mesh wheel at the origin, axle along x: two rim hoops, a diagonal wire lattice, cleats across
     the tread (one at the bottom, so the wheel touches y = -r), spokes to a hub motor */
  wheel: function (F, W) {
    const r = W.r, w = W.w, hw = w / 2, s = W.side, c = F.col;
    const N = 18, rm = r - 0.075, wire = c('wire'), steel = c('steel');
    for (const x of [-hw * 0.94, hw * 0.94]) F.ring(x, 0, 0, 1, 0, 0, rm, 0.035, steel, 'metal', N);
    for (let i = 0; i < N; i++) {
      const a0 = Math.PI + i * TAU / N, a1 = a0 + TAU / N;
      /* the lattice: two diagonals per bay */
      F.rod(-hw * 0.94, Math.cos(a0) * rm, Math.sin(a0) * rm, hw * 0.94, Math.cos(a1) * rm, Math.sin(a1) * rm, 0.012, wire, 'metal');
      F.rod(hw * 0.94, Math.cos(a0) * rm, Math.sin(a0) * rm, -hw * 0.94, Math.cos(a1) * rm, Math.sin(a1) * rm, 0.012, wire, 'metal');
      /* a cleat across the tread: radial height 0.075, its outer face at r */
      const m = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.075, 0.07), mat(steel, 'metal'));
      m.position.set(0, Math.cos(a0) * (r - 0.0375), Math.sin(a0) * (r - 0.0375)); m.rotation.x = a0;
      _add(m);
    }
    /* spokes, both faces, from the hub to the hoops */
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8 + 0.2;
      for (const x of [-1, 1]) F.rod(x * hw * 0.32, Math.cos(a) * 0.26, Math.sin(a) * 0.26, x * hw * 0.92, Math.cos(a) * rm, Math.sin(a) * rm, 0.02, steel, 'metal');
    }
    F.disc(0, 0, 0, 1, 0, 0, 0.3, w * 0.62, c('steelDark'), 'metal', 12);              /* the hub motor */
    F.disc(s * w * 0.33, 0, 0, 1, 0, 0, 0.16, 0.05, c('brass'), 'metal', 8);              /* its cap, outward */
  },

  build: function (F) {
    const v = F.variant, c = F.col, open = v === 0;
    const hull = c(['hullCream', 'hullOchre'][v]), hullDark = c(['hullCreamDark', 'hullOchreDark'][v]);
    const steel = c('steel'), steelDark = c('steelDark'), iron = c('iron'), red = c('red');

    /* ---- the running gear: two frame rails, cross members, a hub-motor drum and a swing arm at every wheel */
    for (const s of [-1, 1]) {
      F.box(s * 1.55, 0.98, 0, 0.32, 0.46, 9.2, 0, steelDark, 'metal');
      F.box(s * 1.62, 2.12, 0, 0.12, 0.12, 9.6, 0, iron, 'metal');                         /* the skirt rail */
      for (const z of [3.9, 1.3, -1.3, -3.9]) {
        F.disc(s * 1.86, 1.2, z, 1, 0, 0, 0.3, 0.5, steelDark, 'metal', 10);                /* drive drum */
        F.rod(s * 1.62, 2.08, z + 0.55, s * 1.95, 1.2, z, 0.07, steel, 'metal');             /* swing arm */
        F.rod(s * 1.62, 2.08, z - 0.55, s * 1.95, 1.2, z, 0.05, steel, 'metal');
        F.rod(s * 1.62, 2.1, z, s * 1.62, 1.44, z, 0.09, c('brass'), 'metal');               /* the spring leg */
      }
    }
    for (const z of [-4.4, -2.6, 0, 2.6, 4.4]) F.box(0, 1.05, z, 3.1, 0.26, 0.26, 0, iron, 'metal');
    /* the equipment bay under the bowl: tanks, boxes, a run of pipe */
    F.box(0, 1.44, 0, 2.9, 0.86, 7.4, 0, steelDark, 'metal');
    for (const s of [-1, 1]) {
      F.rod(s * 1.48, 1.9, -3.4, s * 1.48, 1.9, 3.4, 0.08, c('copper'), 'metal');
      F.rod(s * 1.5, 1.62, -3.0, s * 1.5, 1.62, 2.8, 0.05, iron, 'metal');
      for (const z of [-2.6, 0, 2.6]) F.box(s * 1.42, 1.5, z, 0.2, 0.5, 0.7, 0, steel, 'metal');
    }

    /* ---- the bowl: a superellipse tub flaring from 3.8 x 7.8 at its foot to 5.7 x 9.9 at the rim */
    const sup = function (a, b, n, th) {
      const ct = Math.cos(th), st = Math.sin(th), e = 2 / n;
      return [a * Math.sign(ct) * Math.pow(Math.abs(ct), e), b * Math.sign(st) * Math.pow(Math.abs(st), e)];
    };
    const wallA = function (y) { return 2.3 + (y - 2.5) / 2.1 * 0.55; }, wallB = function (y) { return 4.3 + (y - 2.5) / 2.1 * 0.65; };
    const NB = 3;
    F.tub([{ y: 2.28, a: 1.9, b: 3.9, n: NB }, { y: 2.5, a: 2.3, b: 4.3, n: NB }, { y: 4.6, a: 2.85, b: 4.95, n: NB }], 28, hull, '', 'bottom');
    F.tub([{ y: 4.56, a: 2.9, b: 5.0, n: NB }, { y: 4.8, a: 2.92, b: 5.02, n: NB }, { y: 4.84, a: 2.8, b: 4.9, n: NB }], 28, hullDark, 'metal');   /* the rim lip */
    F.tub([{ y: 4.82, a: 2.82, b: 4.92, n: NB }, { y: 4.98, a: 2.6, b: 4.72, n: NB }, { y: 5.05, a: 2.2, b: 4.3, n: NB }], 24, c('deck'), '', 'top');  /* the deck */
    /* the Republic's red band below the rim */
    F.tub([{ y: 4.18, a: wallA(4.18) + 0.018, b: wallB(4.18) + 0.018, n: NB }, { y: 4.36, a: wallA(4.36) + 0.018, b: wallB(4.36) + 0.018, n: NB }], 28, red, '');
    /* panel seams up the wall */
    for (let i = 0; i < 26; i++) {
      const th = (i + 0.5) * TAU / 26, p0 = sup(wallA(2.6) + 0.02, wallB(2.6) + 0.02, NB, th), p1 = sup(wallA(4.5) + 0.02, wallB(4.5) + 0.02, NB, th);
      F.beam(p0[0], 2.6, p0[1], p1[0], 4.5, p1[1], 0.035, 0.035, hullDark);
    }

    /* ---- the triskelion on both flanks: three bent arms, each fist holding a sword at 90 degrees, on the
       sloping wall (a local frame: u along the wall to the viewer's right, v up the wall, n out of it) */
    const tris = function (s) {
      const y0 = 3.42, z0 = -1.25, x0 = s * (wallA(y0) * Math.pow(1 - Math.pow(Math.abs(z0) / wallB(y0), NB), 1 / NB) + 0.03);
      const k = 0.55 / 2.1, nl = Math.hypot(1, k);
      const n = [s / nl, -k / nl, 0], vv = [s * k / nl, 1 / nl, 0], u = [0, 0, -s];
      const P = function (a, b) { return [x0 + u[0] * a + vv[0] * b + n[0] * 0.02, y0 + u[1] * a + vv[1] * b + n[1] * 0.02, z0 + u[2] * a + vv[2] * b + n[2] * 0.02]; };
      const quad = function (a, b, cc, d) { F.tri(P(a[0], a[1]), P(b[0], b[1]), P(cc[0], cc[1]), red); F.tri(P(a[0], a[1]), P(cc[0], cc[1]), P(d[0], d[1]), red); };
      const bar = function (a, b, wd) {     /* a straight band from a to b, wd wide */
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), ox = -dy / l * wd / 2, oy = dx / l * wd / 2;
        quad([a[0] + ox, a[1] + oy], [b[0] + ox, b[1] + oy], [b[0] - ox, b[1] - oy], [a[0] - ox, a[1] - oy]);
      };
      const R = 0.62;
      for (let i = 0; i < 3; i++) {
        const t = i * TAU / 3 + 0.3, ct = Math.cos(t), st = Math.sin(t), cq = Math.cos(t + Math.PI / 2), sq = Math.sin(t + Math.PI / 2);
        const e = [ct * R * 0.55, st * R * 0.55], f = [e[0] + cq * R * 0.4, e[1] + sq * R * 0.4];
        bar([ct * R * 0.08, st * R * 0.08], e, R * 0.16);                       /* upper arm */
        bar(e, f, R * 0.14);                                                     /* forearm */
        bar([f[0] - cq * 0.04, f[1] - sq * 0.04], [f[0] + cq * 0.08, f[1] + sq * 0.08], R * 0.22);    /* fist */
        bar([f[0] - ct * R * 0.12, f[1] - st * R * 0.12], [f[0] + ct * R * 0.5, f[1] + st * R * 0.5], R * 0.05);   /* the sword, at 90 */
        bar([f[0] - ct * 0.02 + cq * 0.1, f[1] - st * 0.02 + sq * 0.1], [f[0] - ct * 0.02 - cq * 0.1, f[1] - st * 0.02 - sq * 0.1], R * 0.05);   /* its guard */
      }
      F.ring(x0, y0, z0, n[0], n[1], n[2], R * 1.05, 0.025, red, '', 20);
    };
    tris(1); tris(-1);
    /* a red star on the nose, as the Ancients' mark was (the one thing left of it) */
    const star = function (x, y, z, R) {
      for (let i = 0; i < 5; i++) {
        const a = Math.PI / 2 + i * TAU / 5, b = a + TAU / 10, b2 = a - TAU / 10;
        F.tri([x + Math.cos(a) * R, y + Math.sin(a) * R, z], [x + Math.cos(b) * R * 0.4, y + Math.sin(b) * R * 0.4, z], [x, y, z], red);
        F.tri([x + Math.cos(a) * R, y + Math.sin(a) * R, z], [x, y, z], [x + Math.cos(b2) * R * 0.4, y + Math.sin(b2) * R * 0.4, z], red);
      }
    };

    /* ---- the instrument head on the nose: a block with two camera eyes (the headlamps), a tower under it */
    F.box(0, 3.3, 4.95, 1.9, 1.1, 0.9, 0, hull);
    F.box(0, 4.4, 4.95, 2.0, 0.08, 1.0, 0, hullDark, 'metal');
    for (const s of [-1, 1]) {
      F.lamp(s * 0.48, 3.92, 5.42, 0, 0, 1, 0.2, 'head', steelDark, steel);
      F.disc(s * 0.48, 3.92, 5.36, 0, 0, 1, 0.3, 0.1, hullDark, 'metal', 14);
    }
    star(0, 3.55, 5.405, 0.17);
    F.box(0, 2.3, 5.0, 1.0, 1.0, 0.7, 0, hullDark);
    F.disc(0, 2.8, 5.38, 0, 0, 1, 0.26, 0.1, steel, 'metal', 12);
    F.rod(-1.4, 1.5, 5.36, 1.4, 1.5, 5.36, 0.09, iron, 'metal');                                    /* bumper bar */
    for (const s of [-1, 1]) F.rod(s * 0.9, 1.5, 5.36, s * 1.0, 1.2, 4.55, 0.06, iron, 'metal');
    /* the instrument boom out to the front left, with its sensor heads and a slack cable */
    F.rod(0.9, 3.7, 5.2, 2.85, 3.5, 5.62, 0.045, steel, 'metal');
    F.box(2.55, 3.38, 5.48, 0.22, 0.22, 0.3, 0, hullDark, 'metal');
    F.rod(2.2, 3.55, 5.5, 2.25, 2.95, 5.6, 0.02, iron, 'metal');
    F.knob(2.25, 2.92, 5.6, 0.06, c('brass'), 'metal');
    F.tube([[0.95, 3.4, 5.4], [1.6, 3.1, 5.55], [2.4, 3.3, 5.6]], 0.015, iron, 'metal');

    /* ---- the lamp spire on the front left: stacked drums and tapers, rings, a blue lamp at the tip */
    const sx = 0.62, sz = 4.85;
    F.cyl(sx, 4.48, sz, 0.26, 0.5, 0, hullDark);
    F.box(sx, 4.98, sz, 0.5, 0.42, 0.5, 0, hull);
    F.box(sx, 5.1, sz + 0.25, 0.3, 0.12, 0.02, 0, c('glass'), 'metal');                                 /* its little window */
    F.taper(sx, 5.4, sz, 0, 1, 0, 0.2, 0.13, 1.2, steel, 'metal', 10);
    for (const y of [5.6, 6.0, 6.4]) F.ring(sx, y, sz, 0, 1, 0, 0.19 - (y - 5.4) * 0.06, 0.03, c('brass'), 'metal', 10);
    F.box(sx, 6.6, sz, 0.34, 0.36, 0.34, 0, hullDark, 'metal');
    F.taper(sx, 6.96, sz, 0, 1, 0, 0.11, 0.035, 1.9, steel, 'metal', 8);
    for (const y of [7.3, 7.7, 8.1, 8.5]) F.disc(sx, y, sz, 0, 1, 0, 0.12 - (y - 7.0) * 0.04, 0.04, c('brass'), 'metal', 8);
    F.knob(sx, 8.98, sz, 0.09, c('glowBlue'), 'lampBlue');
    F.lamp(sx, 8.98, sz + 0.09, 0, 0, 1, 0.05, 'cell', null, null);
    for (const s of [-1, 1]) F.rod(sx, 7.6, sz, sx + s * 0.45, 7.75, sz, 0.012, iron, 'metal');           /* whiskers */

    /* ---- the dome and its tiered mast on the forward deck */
    const dz = 3.3;
    F.dome(-0.4, 5.02, dz, 0.85, 0.5, 0, hullDark);
    F.cyl(-0.4, 5.45, dz, 0.34, 0.4, 0, hull);
    for (let i = 0; i < 5; i++) F.frustum(-0.4, 5.85 + i * 0.32, dz, 0.3 - i * 0.045, 0.22 - i * 0.04, 0.3, 0, i % 2 ? hullDark : hull, '', 10);
    F.taper(-0.4, 7.45, dz, 0, 1, 0, 0.06, 0.012, 0.8, c('brass'), 'metal', 6);
    F.lamp(-0.4, 6.0, dz + 0.31, 0, 0, 1, 0.07, 'amber', steelDark, null);

    /* ---- side ports, rear aerials, a ladder, tail lamps */
    for (const s of [-1, 1]) {
      const y = 3.9, z = 3.0, x = s * (wallA(y) * Math.pow(1 - Math.pow(z / wallB(y), NB), 1 / NB));
      F.disc(x + s * 0.06, y, z, s, -0.26, 0, 0.24, 0.24, hullDark, 'metal', 12);
      F.face(x + s * 0.185, y - 0.033, z, s, -0.26, 0, 0.15, c('glass'), 'metal', 10);
      F.rod(s * 2.0, 4.2, -4.3, s * 2.95, 3.4, -5.0, 0.03, steel, 'metal');                         /* rear aerials */
      F.rod(s * 2.0, 4.5, 4.0, s * 2.9, 4.95, 4.8, 0.02, iron, 'metal');
      F.lamp(s * 1.1, 1.95, -3.72, 0, 0, -1, 0.09, 'tail', null, steelDark);
    }
    /* the crew ladder up the left flank to the rim */
    for (const z of [-0.15, 0.35]) F.rod(2.32, 2.3, z, 2.98, 4.8, z, 0.025, iron, 'metal');
    for (let i = 1; i < 8; i++) { const t = i / 8; F.rod(2.32 + t * 0.66, 2.3 + t * 2.5, -0.15, 2.32 + t * 0.66, 2.3 + t * 2.5, 0.35, 0.018, iron, 'metal'); }
    /* railing posts round the rim */
    for (let i = 0; i < 20; i++) {
      const th = i * TAU / 20, p = sup(2.78, 4.88, NB, th);
      if (Math.abs(p[1]) > 4.4 && p[1] > 0) continue;                                         /* clear of the spire and the head */
      F.rod(p[0], 4.84, p[1], p[0], 5.4, p[1], 0.02, iron, 'metal');
    }
    for (let i = 0; i < 40; i++) {
      const p = sup(2.78, 4.88, NB, i * TAU / 40), q = sup(2.78, 4.88, NB, (i + 1) * TAU / 40);
      if (p[1] > 4.0 || q[1] > 4.0) continue;
      F.rod(p[0], 5.4, p[1], q[0], 5.4, q[1], 0.018, iron, 'metal');
    }

    /* ---- the solar lid: an elliptical clam, cream rim, dark cells with a grid; the Survey has it open
       25 degrees to the sun on two struts and a rear hinge, the Hauler shut on the deck under its load */
    const ang = open ? 25 * Math.PI / 180 : 0, A = 2.7, B = 3.6;
    const vd = [0, Math.sin(ang), -Math.cos(ang)], nn = [0, Math.cos(ang), Math.sin(ang)];
    const ctr = open ? [0, 5.3 + B * vd[1], 0.9 + B * vd[2]] : [0, 5.18, -1.3];
    const L = function (u, s, h) { return [ctr[0] + u, ctr[1] + vd[1] * s + nn[1] * h, ctr[2] + vd[2] * s + nn[2] * h]; };
    const ell = function (rA, rB, t, h, col, fam) {
      const p = L(0, 0, h), m = F.disc(p[0], p[1], p[2], nn[0], nn[1], nn[2], 1, t, col, fam, 32);
      m.scale.set(rA, 1, rB);
    };
    ell(A, B, 0.14, 0, hull, '');
    ell(A - 0.14, B - 0.14, 0.04, 0.075, c('panel'), 'metal');
    ell(A * 0.9, B * 0.9, 0.06, -0.09, hullDark, 'metal');                                       /* the underside's stiffener */
    for (let k = -3; k <= 3; k++) {
      const u = k * 0.66, hs = (B - 0.16) * Math.sqrt(Math.max(0, 1 - Math.pow(u / (A - 0.16), 2)));
      const a = L(u, -hs, 0.1), b = L(u, hs, 0.1);
      F.rod(a[0], a[1], a[2], b[0], b[1], b[2], 0.014, c('panelGrid'), 'metal');
    }
    for (let k = -4; k <= 4; k++) {
      const s = k * 0.8, hu = (A - 0.16) * Math.sqrt(Math.max(0, 1 - Math.pow(s / (B - 0.16), 2)));
      const a = L(-hu, s, 0.1), b = L(hu, s, 0.1);
      F.rod(a[0], a[1], a[2], b[0], b[1], b[2], 0.014, c('panelGrid'), 'metal');
    }
    if (open) {
      /* an A-frame from the rear rim, a saddle under the front edge, and two rams from the deck */
      for (const s of [-1, 1]) {
        const p = L(s * 0.35, 2.8, -0.1);
        F.rod(s * 1.5, 4.84, -4.6, p[0], p[1], p[2], 0.08, steelDark, 'metal');
      }
      const q = L(0, 2.8, -0.1);
      F.rod(-0.5, q[1], q[2], 0.5, q[1], q[2], 0.09, steelDark, 'metal');
      F.box(0, 5.02, 0.95, 1.2, 0.2, 0.3, 0, steelDark, 'metal');
      for (const s of [-1, 1]) {
        const p = L(s * 1.2, 0.8, -0.1);
        F.rod(s * 1.0, 5.0, -2.2, p[0], p[1], p[2], 0.07, steel, 'metal');
        F.rod(s * 1.0, 5.0, -2.2, s * 1.0, 5.4, -2.25, 0.11, c('brass'), 'metal');               /* the ram's cylinder */
      }
    } else {
      /* the load on the shut lid: crates, drums, a lashed canvas, the ropes over them */
      const top = 5.31;
      for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
        const z = -3.5 + i * 1.0, x = s * 0.9;
        if (F.chance(0.8)) F.box(x, top, z, 0.9, 0.62, 0.8, F.rr(-0.1, 0.1), c('crate'));
        else F.cyl(x, top, z, 0.32, 0.86, 0, c(F.pick(['drum', 'drumRed'])), 'metal');
      }
      for (const z of [-0.3, 0.4]) for (const x of [-0.4, 0.4]) F.cyl(x, top, z, 0.3, 0.86, 0, c(F.pick(['drum', 'drumRed'])), 'metal');
      F.blob(0, top + 0.3, 1.25, 0.9, 0.8, 0, c('canvas'));
      for (const z of [-3.5, -2.5, -1.5, -0.6]) F.tube([[-1.6, top, z], [-1.3, top + 0.7, z], [1.3, top + 0.7, z], [1.6, top, z]], 0.015, c('rope'));
    }
  }
});

/* ---- kits/motor-vehicles/krator-vehicles-runtime.js ---- */
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


return KV_API;
})();
