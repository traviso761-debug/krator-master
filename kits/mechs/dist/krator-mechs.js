/* kits/mechs bundle (mech_bundle.py): kits/catalog/krator-furniture-core.js, kits/catalog/krator-symbols.js, kits/motor-vehicles/vehicles-core.js, kits/mechs/mechs-core.js, kits/mechs/mechs-parts.js, kits/mechs/krator-mechs-iziz.js, kits/mechs/krator-mechs-iziz-aquilifer.js, kits/mechs/krator-mechs-iziz-castra.js, kits/mechs/krator-mechs-iziz-centurion.js, kits/mechs/krator-mechs-iziz-fabrica.js, kits/mechs/krator-mechs-iziz-forfex.js, kits/mechs/krator-mechs-iziz-fossor.js, kits/mechs/krator-mechs-iziz-hoist.js, kits/mechs/krator-mechs-iziz-rota.js, kits/mechs/krator-mechs-iziz-scorpio.js, kits/mechs/krator-mechs-iziz-talpa.js, kits/mechs/krator-mechs-iziz-testudo.js, kits/mechs/mechs-runtime.js. GENERATED; edit the kit files. */
var KratorMechs = (function () {
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


/* ---- kits/catalog/krator-symbols.js ---- */
// ---------------------------------------------------------------- CULTURE SYMBOLS (shared: core/sockets/38-symbols.js)
// The emblem of every culture as a 2D canvas drawing: (g, cx, cy, R, ink, ink2) draws inside a box of half-size R. Pure canvas, no engine:
// core/sockets/80-cultures.js draws them on banners, flags and plates; kits/catalog's furniture kit draws the same ones on tapestries,
// banners, friezes and scrolls (vendored there as kits/catalog/krator-symbols.js, build.py --vendor-check), so a dressed building and the
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
 // a half sun rising over three waves (Hykkousoi; the hexareme's sail in kits/ringsea): c1 the sun, c2 the waves
 wavesun:(g,cx,cy,R,c1,c2)=>{const y0=cy-R*.1;g.fillStyle=c1;g.beginPath();g.arc(cx,y0,R*.5,Math.PI,0);g.fill();g.strokeStyle=c1;g.lineWidth=Math.max(2,R*.07);
  for(let i=0;i<9;i++){const a=Math.PI+i/8*Math.PI;g.beginPath();g.moveTo(cx+Math.cos(a)*R*.62,y0+Math.sin(a)*R*.62);g.lineTo(cx+Math.cos(a)*R*.9,y0+Math.sin(a)*R*.9);g.stroke();}
  g.strokeStyle=c2;g.lineWidth=Math.max(2,R*.1);for(let k=0;k<3;k++){g.beginPath();for(let i=0;i<=24;i++){const x=-R+2*R*i/24,y=y0+R*.12+k*R*.24+Math.sin(x/R*SYM_TAU)*R*.07;if(i)g.lineTo(cx+x,y);else g.moveTo(cx+x,y);}g.stroke();}},
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
 // a toothed gear (post-apoc salvage and scrap)
 gear:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;g.beginPath();for(let k=0;k<32;k++){const a=k*SYM_TAU/32,r=(k%4<2)?R*.95:R*.75;g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}g.closePath();g.fill();g.fillStyle=c2;g.beginPath();g.arc(cx,cy,R*.45,0,SYM_TAU);g.fill();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.2,0,SYM_TAU);g.fill();},
});
// the symbol each culture pack draws (mkCulture's `sym`), for code that has a culture key and no pack
const SYMBOL_OF = { iziz:'sun', republic:'triskele', voth:'diamond', yuni:'hyperboloid', 'beast-rider':'claw', hykkousoi:'wavesun', xanadu:'wheel',
 'ringsea-islander':'moon', lizardmen:'serpent', eastabyss:'star', nomad:'horns', rustic:'fir', painted:'raven', reedlake:'fish', screamer:'skull', 'post-apoc':'gear', scrap:'gear' };

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

/* ---- kits/mechs/mechs-core.js ---- */
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

/* ---- kits/mechs/mechs-parts.js ---- */
/* ======================================================================
   Krator Mechs: the parts library (kits/mechs/mechs-parts.js)

   Culture-neutral parts every mech draws with: joints, pistons and hoses between
   two bones, tube cages and glass canopies, feet, a torsion ballista with its own
   bones, a seated pilot, ducted fans, tanks, wheels, a saw, an auger and cargo.
   Colours are passed in as numbers (the caller's F.col), so a culture file decides
   the livery. Every part draws into the current bone (R.on) in that bone's frame,
   except the R.link ones (piston, hose, cable), which take two bones.

   MP.basis(nx, ny, nz)      -> [u, v]: two unit vectors spanning the plane facing n
   MP.joint, MP.piston, MP.hose, MP.cable, MP.cage, MP.lamp, MP.tank, MP.wheel, MP.fan, MP.saw,
   MP.auger, MP.ballista, MP.pilot, MP.foot (stomp | claw | track | pad), MP.crate, MP.barrel, MP.bundle
   ====================================================================== */
const MP = {};

MP.basis = function (nx, ny, nz) {
  const n = new THREE.Vector3(nx, ny, nz).normalize();
  const t = Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(t, n).normalize(), v = new THREE.Vector3().crossVectors(n, u);
  return [u, v, n];
};

/* a joint drum: a cylinder of radius r and width w along axis, with hub caps of colour cap */
MP.joint = function (F, x, y, z, r, w, axis, col, cap, fam) {
  /* the drum stands 16 mm proud each side, so its ends never share a plane with a limb drawn exactly w wide */
  const W = w + 0.032;
  F.cy(x, y, z, r, r, W, col, fam || 'metal', axis, 12);
  if (cap != null) {
    const o = W / 2 + 0.013, d = axis === 'x' ? [1, 0, 0] : axis === 'y' ? [0, 1, 0] : [0, 0, 1];
    for (const s of [-1, 1]) {
      F.cy(x + d[0] * s * o, y + d[1] * s * o, z + d[2] * s * o, r * 0.62, r * 0.62, 0.024, cap, 'bronze', axis, 10);
      F.cy(x + d[0] * s * (o + 0.03), y + d[1] * s * (o + 0.03), z + d[2] * s * (o + 0.03), r * 0.22, r * 0.22, 0.04, cap, 'bronze', axis, 6);
    }
  }
};

/* a hydraulic ram between bone a (point pa) and bone b (point pb): a sleeve from a, a rod to b, eye ends.
   Weighted along its length, so it stays on the line between the two joints. */
MP.piston = function (F, R, a, pa, b, pb, r, sleeve, rod) {
  R.link(a, pa, b, pb, function (A, B) {
    const M = A.clone().lerp(B, 0.58), N = A.clone().lerp(B, 0.48);
    F.rod(A.x, A.y, A.z, M.x, M.y, M.z, r, sleeve, 'metal');
    F.rod(N.x, N.y, N.z, B.x, B.y, B.z, r * 0.55, rod, 'chrome');
    F.knob(A.x, A.y, A.z, r * 1.25, sleeve, 'metal');
    F.knob(B.x, B.y, B.z, r * 1.1, sleeve, 'metal');
    const C = A.clone().lerp(B, 0.57);
    F.rod(M.x, M.y, M.z, C.x, C.y, C.z, r * 1.25, sleeve, 'metal');
  });
};
/* a hose (or a bundle of cable) sagging a little between two bones: segments, so it bends with the joint */
MP.hose = function (F, R, a, pa, b, pb, r, col, sag, segs) {
  R.link(a, pa, b, pb, function (A, B) {
    const n = segs || 6, s = sag == null ? 0.12 : sag;
    let P = A.clone();
    for (let i = 1; i <= n; i++) {
      const t = i / n, Q = A.clone().lerp(B, t);
      Q.y -= s * Math.sin(Math.PI * t) * A.distanceTo(B);
      F.rod(P.x, P.y, P.z, Q.x, Q.y, Q.z, r, col, 'rubber');
      if (i < n) F.knob(Q.x, Q.y, Q.z, r * 1.02, col, 'rubber');
      P = Q;
    }
  });
};
/* a straight rope or string between two bones (a ballista string, a crane cable) */
MP.cable = function (F, R, a, pa, b, pb, r, col, fam) {
  R.link(a, pa, b, pb, function (A, B) { F.rod(A.x, A.y, A.z, B.x, B.y, B.z, r, col, fam || 'rope'); });
};

/* a cage of tube over part of an ellipsoid (radii a, b, c, centred at (x, y, z)): nu meridians across
   phi (round y; pi/2 looks along +z) and nv parallels across theta (down from the top) */
MP.cagePt = function (x, y, z, a, b, c, phi, th) {
  return [x - Math.cos(phi) * Math.sin(th) * a, y + Math.cos(th) * b, z + Math.sin(phi) * Math.sin(th) * c];
};
MP.cage = function (F, x, y, z, a, b, c, phi0, dphi, th0, dth, nu, nv, r, col, fam) {
  const P = function (i, j) { return MP.cagePt(x, y, z, a, b, c, phi0 + dphi * i / nu, th0 + dth * j / nv); };
  const sub = 3;
  for (let i = 0; i <= nu; i++) for (let j = 0; j < nv * sub; j++) {
    const p = MP.cagePt(x, y, z, a, b, c, phi0 + dphi * i / nu, th0 + dth * j / (nv * sub)), q = MP.cagePt(x, y, z, a, b, c, phi0 + dphi * i / nu, th0 + dth * (j + 1) / (nv * sub));
    F.rod(p[0], p[1], p[2], q[0], q[1], q[2], r, col, fam || 'metal');
  }
  for (let j = 0; j <= nv; j++) for (let i = 0; i < nu * sub; i++) {
    const p = MP.cagePt(x, y, z, a, b, c, phi0 + dphi * i / (nu * sub), th0 + dth * j / nv), q = MP.cagePt(x, y, z, a, b, c, phi0 + dphi * (i + 1) / (nu * sub), th0 + dth * j / nv);
    F.rod(p[0], p[1], p[2], q[0], q[1], q[2], r, col, fam || 'metal');
  }
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const p = P(i, j); F.knob(p[0], p[1], p[2], r * 1.6, col, fam || 'metal'); }
};

/* a lamp with a housing: lens r facing (dx, dy, dz) */
MP.lamp = function (F, x, y, z, dx, dy, dz, r, kind, housing) { F.lamp(x, y, z, dx, dy, dz, r, kind || 'head', housing, housing); };

/* a tank: a cylinder with domed ends and bands */
MP.tank = function (F, x, y, z, r, len, axis, col, band, nb, fam) {
  F.cy(x, y, z, r, r, len, col, fam || 'bronze', axis, 14);
  const d = axis === 'x' ? [1, 0, 0] : axis === 'y' ? [0, 1, 0] : [0, 0, 1];
  for (const s of [-1, 1]) {
    const cx = x + d[0] * s * len / 2, cy = y + d[1] * s * len / 2, cz = z + d[2] * s * len / 2;
    const rot = axis === 'x' ? [0, 0, -s * Math.PI / 2] : axis === 'z' ? [s * Math.PI / 2, 0, 0] : [s < 0 ? Math.PI : 0, 0, 0];
    F.sph(cx, cy, cz, r, r * 0.45, r, col, fam || 'bronze', 14, 5, 0, TAU, 0, Math.PI / 2, rot[0], rot[1], rot[2]);
  }
  for (let i = 0; i < (nb || 0); i++) {
    const t = (i + 0.5) / nb - 0.5;
    F.cy(x + d[0] * t * len * 0.9, y + d[1] * t * len * 0.9, z + d[2] * t * len * 0.9, r * 1.04, r * 1.04, 0.05, band, 'metal', axis, 14);
  }
};

/* a road wheel (tyre, rim, hub) of radius r and width w, axle along axis */
MP.wheel = function (F, x, y, z, r, w, axis, tyre, rim, hub) {
  F.cy(x, y, z, r, r, w, tyre, 'rubber', axis, 18);
  const d = axis === 'x' ? [1, 0, 0] : axis === 'y' ? [0, 1, 0] : [0, 0, 1];
  for (const s of [-1, 1]) {
    const o = w / 2 + 0.016;
    F.cy(x + d[0] * s * o, y + d[1] * s * o, z + d[2] * s * o, r * 0.66, r * 0.66, 0.02, rim, 'metal', axis, 16);
    F.cy(x + d[0] * s * (o + 0.03), y + d[1] * s * (o + 0.03), z + d[2] * s * (o + 0.03), r * 0.2, r * 0.26, 0.06, hub, 'metal', axis, 8);
  }
};

/* a ducted fan facing +z on a spin bone `name` (built here, child of parent at x, y, z): duct, struts, blades, spinner */
MP.fan = function (F, R, name, parent, x, y, z, r, depth, duct, blade, spinner, rates, rx, ry, rz) {
  R.bone(name + '_duct', parent, x, y, z, rx, ry, rz);
  R.on(name + '_duct');
  F.cy(0, 0, 0, r, r, depth, duct, 'paint', 'z', 20, 0, 0, 0, true);
  F.cy(0, 0, 0, r * 0.98, r * 0.98, depth * 0.96, F.shade(duct, -0.5), 'metal', 'z', 20, 0, 0, 0, true);
  F.tor(0, 0, depth / 2, r, 0.05, duct, 'paint', 'z', 20);
  F.tor(0, 0, -depth / 2, r, 0.05, duct, 'paint', 'z', 20);
  for (let k = 0; k < 4; k++) { const a = k * TAU / 4 + 0.4; F.rod(0, 0, -depth * 0.3, Math.cos(a) * r, Math.sin(a) * r, -depth * 0.3, 0.025, F.shade(duct, -0.4), 'metal'); }
  F.cy(0, 0, -depth * 0.2, r * 0.3, r * 0.22, depth * 0.6, F.shade(duct, -0.4), 'metal', 'z', 10);
  R.spin(name, name + '_duct', 0, 0, depth * 0.08, 'z', rates);
  R.on(name);
  for (let k = 0; k < 7; k++) {
    const a = k * TAU / 7;
    F.cb(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, 0, r * 0.62, r * 0.17, 0.02, blade, 'metal', 0.45, 0, a, 'ZXY');
  }
  F.sph(0, 0, 0.02, r * 0.24, r * 0.24, r * 0.42, spinner, 'paint', 10, 6, 0, TAU, 0, Math.PI / 2, Math.PI / 2, 0, 0);
};

/* a toothed saw disc of radius r facing x (a spin bone about x) */
MP.saw = function (F, r, t, disc, teeth, hub) {
  F.cy(0, 0, 0, r, r, t, disc, 'metal', 'x', 24);
  const n = 28;
  for (let k = 0; k < n; k++) {
    const a = k * TAU / n, a2 = a + TAU / n * 0.7, r2 = r * 1.1;
    for (const s of [-1, 1]) F.poly(s < 0
      ? [[s * t * 0.4, Math.sin(a) * r, Math.cos(a) * r], [s * t * 0.4, Math.sin(a) * r2, Math.cos(a) * r2], [s * t * 0.4, Math.sin(a2) * r, Math.cos(a2) * r]]
      : [[s * t * 0.4, Math.sin(a) * r, Math.cos(a) * r], [s * t * 0.4, Math.sin(a2) * r, Math.cos(a2) * r], [s * t * 0.4, Math.sin(a) * r2, Math.cos(a) * r2]], teeth, 'metal');
  }
  F.cy(0, 0, 0, r * 0.28, r * 0.28, t * 3, hub, 'bronze', 'x', 10);
  for (let k = 0; k < 6; k++) { const a = k * TAU / 6; F.cy(t * 1.6, Math.sin(a) * r * 0.18, Math.cos(a) * r * 0.18, 0.025, 0.025, 0.04, hub, 'bronze', 'x', 6); }
};

/* an auger along +z: a cone of length len and radius r with a helical flight (the bone spins about z) */
MP.auger = function (F, len, r, turns, core, flight) {
  F.cy(0, 0, len * 0.45, r * 0.35, 0.04, len * 0.9, core, 'metal', 'z', 10);
  F.cy(0, 0, -len * 0.04, r * 0.4, r * 0.4, len * 0.12, core, 'metal', 'z', 10);
  const n = Math.round(turns * 14);
  for (let i = 0; i < n; i++) {
    const t = i / n, a = t * turns * TAU, z = len * t * 0.88, rr = r * (1 - t * 0.85) + 0.05;
    F.cb(Math.cos(a) * rr * 0.62, Math.sin(a) * rr * 0.62, z, rr * 0.75, 0.03, len / n * 1.6, flight, 'metal', 0.5, 0, a, 'ZXY');
  }
};

/* ---------------------------------------------------------------- the ballista
   A torsion bolt-thrower on its own bones, built cocked (string drawn, bolt in the trough). Bones, all made
   here: <name> (the stock, at (x, y, z) on parent, turned rx, ry, rz), <name>_bowL / <name>_bowR (the arms, at
   the skeins; ry turns them), <name>_nut (the claw that holds the string; it slides along z), <name>_bolt (the
   loaded bolt, child of the nut; scale 0 hides it once loosed). The strings are links from the arm tips to the
   nut, so they follow both. Point <name>_muzzle at the front of the trough. o: { len, span, h, wood, iron,
   bronze, rope, skein, bolt, flight }. Returns { draw: how far the nut travels when loosed }. */
MP.ballista = function (F, R, name, parent, x, y, z, o, rx, ry, rz) {
  const L = o.len || 1.6, S = o.span || 0.9, H = o.h || 0.16, zf = L * 0.3, zn = -L * 0.32, wS = S * 0.32;
  R.bone(name, parent, x, y, z, rx, ry, rz);
  R.on(name);
  /* the stock and the trough */
  F.cb(0, 0, -L * 0.08, H * 0.9, H, L, o.wood, 'wood');
  F.cb(0, H * 0.6, -L * 0.04, H * 0.5, 0.04, L * 0.95, F.shade(o.wood, -0.25), 'wood');
  for (const s of [-1, 1]) F.cb(s * H * 0.3, H * 0.6, -L * 0.04, 0.03, 0.06, L * 0.99, o.iron, 'metal');
  /* the capitulum: a frame holding the two skeins, bronze washers top and bottom */
  F.cb(0, H * 0.3, zf, wS * 2 + 0.22, 0.08, 0.2, o.wood, 'wood');
  F.cb(0, -H * 0.5, zf, wS * 2 + 0.22, 0.08, 0.2, o.wood, 'wood');
  for (const s of [-1, 1]) {
    F.cy(s * wS, -0.1 * H, zf, 0.075, 0.075, H * 2.2, o.skein, 'rope', 'y', 10);
    for (const t of [-1, 1]) F.cy(s * wS, -0.1 * H + t * H * 1.17, zf, 0.1, 0.1, 0.05, o.bronze, 'bronze', 'y', 10);
    F.cb(s * (wS + 0.13), -0.1 * H, zf, 0.05, H * 2.2, 0.16, o.wood, 'wood');
  }
  /* the winch at the back */
  F.cy(0, 0, -L * 0.56, 0.07, 0.07, H * 2.6, o.wood, 'wood', 'x', 8);
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + 0.3;
    F.rod(s * H * 1.3, 0, -L * 0.56, s * H * 1.3, Math.sin(a) * 0.2, -L * 0.56 + Math.cos(a) * 0.2, 0.018, o.iron, 'metal');
  }
  R.point(name + '_muzzle', name, 0, H * 0.75, L * 0.42);
  /* the arms: each from its skein outward and back (cocked) */
  const tip = [S, 0, -S * 0.42];
  for (const s of [-1, 1]) {
    const bn = name + (s > 0 ? '_bowL' : '_bowR');
    R.bone(bn, name, s * wS, -0.1 * H, zf);
    R.on(bn);
    F.rod(0, 0, 0, s * tip[0] * 0.97, tip[1], tip[2] * 0.97, 0.045, o.wood, 'wood');
    F.rod(s * tip[0] * 0.45, 0, tip[2] * 0.45, s * tip[0], 0, tip[2], 0.058, o.iron, 'metal');
    F.knob(s * tip[0], tip[1], tip[2], 0.06, o.bronze, 'bronze');
  }
  /* the nut (claw and trigger), the bolt on it */
  R.bone(name + '_nut', name, 0, H * 0.62, zn);
  R.on(name + '_nut');
  F.cb(0, 0.045, -0.06, H * 0.7, 0.1, 0.22, o.bronze, 'bronze');
  F.cb(0, 0.09, -0.12, 0.05, 0.08, 0.06, o.iron, 'metal');
  R.bone(name + '_bolt', name + '_nut', 0, 0.05, 0.02);
  R.on(name + '_bolt');
  const bl = L * 0.82;
  F.rod(0, 0, 0, 0, 0, bl, 0.028, o.bolt, 'wood');
  F.cy(0, 0, bl + 0.09, 0.05, 0.004, 0.2, o.iron, 'metal', 'z', 6);
  for (let k = 0; k < 3; k++) {
    const a = k * TAU / 3;
    F.tri([0, 0, 0.05], [Math.cos(a) * 0.08, Math.sin(a) * 0.08, 0.03], [0, 0, 0.26], o.flight, 'feather');
  }
  /* the strings: arm tips to the claw */
  for (const s of [-1, 1]) MP.cable(F, R, name + (s > 0 ? '_bowL' : '_bowR'), [s * tip[0], tip[1], tip[2]], name + '_nut', [0, 0.08, 0], 0.016, o.rope);
  return { draw: zf - zn - 0.12, len: L };
};

/* ---------------------------------------------------------------- the pilot
   A seated pilot of about 1.75 m, sat at (x, y, z) (the seat's top, under the hips) facing +z, in the current
   bone; a bone <bone>_pilotHead (made here) carries the head, so the idle layer can turn it. o: { tunic, skin,
   helm, crest, harness, crestDir ('across' | 'along'), lean } */
MP.pilot = function (F, R, bone, x, y, z, o) {
  R.on(bone);
  const lean = o.lean || 0.1;
  /* thighs and shins */
  for (const s of [-1, 1]) {
    F.cb(x + s * 0.11, y + 0.08, z + 0.22, 0.15, 0.15, 0.46, o.trousers || o.tunic, 'cloth');
    F.cb(x + s * 0.11, y - 0.14, z + 0.44, 0.13, 0.44, 0.13, o.trousers || o.tunic, 'cloth');
    F.cb(x + s * 0.11, y - 0.385, z + 0.49, 0.155, 0.1, 0.28, o.harness, 'leather');
  }
  /* torso, belt, harness straps, shoulders */
  F.cb(x, y + 0.42, z - 0.02, 0.4, 0.56, 0.24, o.tunic, 'cloth', -lean, 0, 0);
  F.cb(x, y + 0.2, z, 0.43, 0.08, 0.27, o.harness, 'leather', -lean, 0, 0);
  for (const s of [-1, 1]) F.cb(x + s * 0.09, y + 0.4, z + 0.125, 0.05, 0.44, 0.02, o.harness, 'leather', -lean, 0, s * 0.18);
  F.cb(x, y + 0.66, z - 0.03, 0.5, 0.12, 0.26, o.helm, 'bronze', -lean, 0, 0);
  /* arms to the levers */
  for (const s of [-1, 1]) {
    F.rod(x + s * 0.23, y + 0.62, z - 0.02, x + s * 0.25, y + 0.36, z + 0.14, 0.055, o.tunic, 'cloth');
    F.rod(x + s * 0.25, y + 0.36, z + 0.14, x + s * 0.2, y + 0.32, z + 0.42, 0.048, o.tunic, 'cloth');
    F.knob(x + s * 0.2, y + 0.32, z + 0.45, 0.05, o.skin, 'skin');
  }
  /* the head: its own bone */
  const hb = bone + '_pilotHead';
  R.bone(hb, bone, x, y + 0.76, z - 0.04 + 0.08 * lean);
  R.on(hb);
  F.cy(0, 0.03, 0, 0.05, 0.05, 0.08, o.skin, 'skin');
  F.sph(0, 0.15, 0.01, 0.1, 0.12, 0.11, o.skin, 'skin', 10, 7);
  /* a legionary helmet: bowl, neck guard, cheek pieces, crest */
  F.sph(0, 0.17, 0, 0.12, 0.11, 0.125, o.helm, 'bronze', 12, 6, 0, TAU, 0, Math.PI * 0.55);
  F.cb(0, 0.12, -0.11, 0.24, 0.04, 0.08, o.helm, 'bronze', -0.5, 0, 0);
  for (const s of [-1, 1]) F.cb(s * 0.11, 0.09, 0.05, 0.02, 0.11, 0.08, o.helm, 'bronze');
  F.cb(0, 0.285, 0, 0.055, 0.05, 0.055, o.helm, 'bronze');
  if (o.crest != null) {
    const pts = [];
    for (let i = 0; i <= 8; i++) { const a = Math.PI * i / 8, rr = 0.15 + (i % 2) * 0.012; pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.75]); }
    F.prism(0, 0.3, 0, pts, 0.035, o.crest, 'hair', o.crestDir === 'along' ? 'x' : 'z');
  }
};

/* ---------------------------------------------------------------- feet
   Drawn on the ankle bone: the sole's underside at y = -ankleH, toes toward +z. o: { kind, w, l, ankleH, plate,
   iron, trim, toes } */
MP.foot = function (F, o) {
  const a = o.ankleH, w = o.w, l = o.l, k = o.kind || 'stomp';
  if (k === 'stomp') {
    F.chb(0, -a + 0.09, l * 0.08, w, 0.18, l, 0.06, o.iron, 'metal', 'z');
    F.chb(0, -a + 0.25, l * 0.02, w * 0.86, 0.16, l * 0.78, 0.06, o.plate, 'paint', 'z');
    F.chb(0, -a + 0.17, l * 0.5, w * 0.92, 0.2, l * 0.22, 0.05, o.plate, 'paint', 'x', -0.35, 0, 0);
    F.cb(0, -a + 0.2, -l * 0.42, w * 0.6, 0.24, l * 0.16, o.iron, 'metal');
    for (let i = 0; i < (o.toes || 3); i++) {
      const tx = (i - ((o.toes || 3) - 1) / 2) * w * 0.32;
      F.chb(tx, -a + 0.07, l * 0.6, w * 0.24, 0.14, l * 0.2, 0.04, o.iron, 'metal', 'z');
    }
    F.cy(0, -a * 0.3, 0, 0.16, 0.2, a * 0.9, o.iron, 'metal', 'y', 10);
  } else if (k === 'claw') {
    F.chb(0, -a + 0.2, 0, w * 0.5, 0.3, l * 0.4, 0.06, o.plate, 'paint', 'z');
    const toes = o.toes || 3;
    for (let i = 0; i < toes; i++) {
      const ang = (i - (toes - 1) / 2) * 0.5;
      const dx = Math.sin(ang), dz = Math.cos(ang);
      F.rod(0, -a + 0.22, 0, dx * l * 0.38, -a + 0.14, dz * l * 0.38, 0.07, o.iron, 'metal');
      F.rod(dx * l * 0.38, -a + 0.14, dz * l * 0.38, dx * l * 0.55, -a + 0.03, dz * l * 0.55, 0.055, o.iron, 'metal');
      F.cy(dx * l * 0.6, -a + 0.09, dz * l * 0.6, 0.06, 0.005, 0.18, o.trim, 'bronze', 'y', 6, Math.PI / 2 + 0.5, Math.atan2(dx, dz), 0);
      F.cb(dx * l * 0.38, -a + 0.15, dz * l * 0.38, 0.13, 0.1, 0.13, o.plate, 'paint', 0, Math.atan2(dx, dz), 0);
    }
    F.rod(0, -a + 0.2, 0, 0, -a + 0.05, -l * 0.4, 0.06, o.iron, 'metal');
    F.cy(0, -a + 0.07, -l * 0.47, 0.06, 0.005, 0.14, o.trim, 'bronze', 'y', 6, -Math.PI / 2 - 0.4, 0, 0);
    F.cy(0, -a * 0.35, 0, 0.13, 0.17, a * 0.8, o.iron, 'metal', 'y', 10);
  } else if (k === 'track') {
    F.chb(0, -a + 0.22, 0, w, 0.44, l, 0.2, o.iron, 'rubber', 'x');
    for (let i = 0; i < 9; i++) {
      const t = (i / 8 - 0.5) * l * 0.82;
      F.cb(0, -a + 0.015, t, w * 1.02, 0.04, 0.07, o.iron, 'rubber');
    }
    for (const s of [-1, 1]) {
      F.cb(s * (w / 2 + 0.04), -a + 0.24, 0, 0.06, 0.3, l * 0.86, o.plate, 'paint');
      for (let i = 0; i < 3; i++) F.cy(s * (w / 2 + 0.08), -a + 0.24, (i - 1) * l * 0.3, 0.09, 0.09, 0.05, o.trim, 'bronze', 'x', 10);
    }
    F.cy(0, -a * 0.3, 0, 0.17, 0.22, a * 0.75, o.iron, 'metal', 'y', 10);
  } else {   /* pad: a round elephant foot */
    F.cy(0, -a + 0.14, 0, w / 2, w / 2 * 1.06, 0.28, o.iron, 'metal', 'y', 16);
    F.cy(0, -a + 0.34, 0, w / 2 * 0.86, w / 2 * 0.96, 0.14, o.plate, 'paint', 'y', 16);
    for (let i = 0; i < (o.toes || 4); i++) {
      const ang = (i - ((o.toes || 4) - 1) / 2) * 0.55;
      F.cb(Math.sin(ang) * w * 0.48, -a + 0.1, Math.cos(ang) * w * 0.48, 0.16, 0.18, 0.14, o.trim, 'bronze', 0, ang, 0);
    }
    F.cy(0, -a * 0.3, 0, 0.18, 0.24, a * 0.8, o.iron, 'metal', 'y', 10);
  }
};

/* ---------------------------------------------------------------- cargo */
MP.crate = function (F, x, y, z, w, h, d, wood, band, ry) {
  F.cb(x, y + h / 2, z, w, h, d, wood, 'wood', 0, ry || 0, 0);
  F.cb(x, y + h / 2, z, w + 0.02, 0.05, d + 0.02, band, 'metal', 0, ry || 0, 0);
};
MP.barrel = function (F, x, y, z, r, h, wood, band, axis) {
  F.cy(x, y, z, r * 0.92, r * 0.92, h, wood, 'wood', axis || 'y', 10);
  F.cy(x, y, z, r, r, h * 0.5, wood, 'wood', axis || 'y', 10);
  const d = axis === 'x' ? [1, 0, 0] : axis === 'z' ? [0, 0, 1] : [0, 1, 0];
  for (const t of [-0.36, 0.36]) F.cy(x + d[0] * t * h, y + d[1] * t * h, z + d[2] * t * h, r * 0.96, r * 0.96, 0.04, band, 'metal', axis || 'y', 10);
};
/* a rolled bundle (bedroll, tarp) tied with two cords */
MP.bundle = function (F, x, y, z, r, len, cloth, cord, axis) {
  F.cy(x, y, z, r, r, len, cloth, 'cloth', axis || 'x', 10);
  const d = axis === 'z' ? [0, 0, 1] : axis === 'y' ? [0, 1, 0] : [1, 0, 0];
  for (const t of [-0.3, 0.3]) F.cy(x + d[0] * t * len, y + d[1] * t * len, z + d[2] * t * len, r * 1.04, r * 1.04, 0.04, cord, 'rope', axis || 'x', 10);
};

/* ---- kits/mechs/krator-mechs-iziz.js ---- */
/* ======================================================================
   Krator Mechs: the Iziz (kits/mechs/krator-mechs-iziz.js)

   The Izani Empire's walking machines (LORE.md 6.2 and "Ancient survivals"): Ancient
   industrial walkers dug out of the city's ruins (loaders, cranes, excavators, pile
   drivers, cargo striders) and kept going by the Forgemasters' Guild, refitted for a war
   fought mostly against people with swords. A pilot sits in the head or the chest; a
   weapon is what the machine already was (a shear, a grab, an auger, a saw) or a
   ballista bolted on. The legions dress them as they dress themselves: the sun of Iziz,
   bronze phalerae, horsehair crests, banners on a pole at the back (a vexillum, or a
   sashimono-like flag), and feathers taken from the jungle and from the Beast Riders.

   Livery: weathered steel and gunmetal, with Iziz orange (#e07a2a) on the armour, cream
   trim, a teal line, bronze and gilt fittings (core/sockets/80-cultures.js, the iziz pack).

   This file registers the culture and the dressing every Iziz mech shares (IZ below);
   one file per mech follows it (krator-mechs-iziz-<mech>.js).
   ====================================================================== */

MECH_CULTURE('iziz', {
  name: 'Iziz', sign: 'the sun (the palace emblem is the orb)', livery: 'steel and gunmetal, Iziz orange armour, cream trim, teal line, bronze',
  lore: 'Ancient industrial walkers from the ruins of Iziz, kept by the Forgemasters and fought by the legions',
  /* PALETTE (sRGB; the runtime converts to linear) */
  palette: {
    orange: 0xd06c26, orangeLt: 0xe58a3a, orangeDk: 0x9a4a1c, cream: 0xe2d2ac, creamDk: 0xc4b088,
    teal: 0x2f8f8a, tealDk: 0x226a66, red: 0x9c2d2d, crimson: 0x7e1c1c,
    steel: 0x7a776f, steelLt: 0x9c988e, steelDk: 0x4c4a45, gun: 0x363431, iron: 0x2a2826, chrome: 0xb4b0a6,
    bronze: 0xa87038, brass: 0xc29445, gold: 0xd4a640, copper: 0xb5683c, verdigris: 0x5a9a86,
    leather: 0x5b3b24, rope: 0x9a8458, skein: 0x8a7650, wood: 0x6b4c30, woodDk: 0x4a3420, canvas: 0xb9a37a, rubber: 0x262422,
    skin: 0xb98a62, tunic: 0xa33a24, trousers: 0x5a3a28,
    glass: 0x9cc6c4, glassAmber: 0xd99a50, lensWarm: 0xffd59a, lensRed: 0xd2401c, lensAmber: 0xffa040, eye: 0xffaa48,
    fGreen: 0x2e8a4c, fTeal: 0x237f86, fScarlet: 0xb53a20, fGold: 0xdba23a, fBlack: 0x1e1c1b, fWhite: 0xe6e0d0, fBlue: 0x2a5a9a,
    hazard: 0x1f1d1b
  }
});

const IZ = {};
/* the banner paints */
IZ.paint = function (F, kind, o) {
  o = o || {};
  const c = F.col;
  if (kind === 'legion') return { field: c('orange'), edge: c('teal'), band: c('cream'), ink: c('cream'), ink2: c('orange'), sym: 'numeral', numeral: o.numeral || 'III' };
  if (kind === 'orb') return { field: c('orange'), edge: c('red'), band: c('teal'), ink: c('cream'), sym: 'orb', pattern: true };
  if (kind === 'stripes') return { field: c('orange'), stripes: [c('orange'), c('cream'), c('teal'), c('cream')] };
  if (kind === 'teal') return { field: c('teal'), edge: c('orange'), band: c('cream'), ink: c('cream'), ink2: c('teal'), sym: 'sun' };
  return { field: c('orange'), edge: c('teal'), band: c('cream'), ink: c('cream'), ink2: c('orange'), sym: 'sun', pattern: 'sun' };
};

/* the sun of Iziz in gilt: a disc, a ring, a boss and sixteen rays, facing (nx, ny, nz), radius R */
IZ.sun = function (F, x, y, z, nx, ny, nz, R, disc, ray) {
  const B = MP.basis(nx, ny, nz), u = B[0], v = B[1], n = B[2];
  disc = disc == null ? F.col('gold') : disc; ray = ray == null ? disc : ray;
  F.disc(x, y, z, n.x, n.y, n.z, R * 0.62, 0.04, disc, 'gold', 14);
  F.ring(x + n.x * 0.025, y + n.y * 0.025, z + n.z * 0.025, n.x, n.y, n.z, R * 0.42, 0.025, F.col('orange'), 'paint', 14);
  F.knob(x + n.x * 0.04, y + n.y * 0.04, z + n.z * 0.04, R * 0.18, disc, 'gold');
  const o = 0.022;
  for (let k = 0; k < 16; k++) {
    const a = k * Math.PI / 8, r1 = R * 0.6, r2 = R * (k % 2 ? 0.86 : 1.0), da = 0.13;
    const P = function (r, aa) { return [x + (u.x * Math.cos(aa) + v.x * Math.sin(aa)) * r + n.x * o, y + (u.y * Math.cos(aa) + v.y * Math.sin(aa)) * r + n.y * o, z + (u.z * Math.cos(aa) + v.z * Math.sin(aa)) * r + n.z * o]; };
    F.poly([P(r1, a - da), P(r2, a), P(r1, a + da)], ray, 'gold');
  }
};
/* a phalera: a bronze disc with a raised ring and boss (a legion's decoration), facing n */
IZ.phalera = function (F, x, y, z, nx, ny, nz, r, col, boss) {
  const n = new THREE.Vector3(nx, ny, nz).normalize();
  col = col == null ? F.col('bronze') : col;
  F.disc(x, y, z, n.x, n.y, n.z, r, 0.03, col, 'bronze', 12);
  F.ring(x + n.x * 0.02, y + n.y * 0.02, z + n.z * 0.02, n.x, n.y, n.z, r * 0.7, r * 0.09, boss == null ? F.col('gold') : boss, 'gold', 12);
  F.knob(x + n.x * 0.03, y + n.y * 0.03, z + n.z * 0.03, r * 0.32, boss == null ? F.col('gold') : boss, 'gold');
};
/* a row of n phalerae running down from (x, y, z) along v (the plane's "down"), facing n */
IZ.phalerae = function (F, x, y, z, nx, ny, nz, cnt, gap, r) {
  for (let i = 0; i < cnt; i++) IZ.phalera(F, x, y - i * gap, z, nx, ny, nz, r);
};
/* a horsehair crest on a bronze ridge: length len, height h; 'across' (a centurion's) or 'along' */
IZ.crest = function (F, x, y, z, len, h, dir, col, ridge) {
  const pts = [], n = 18;
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = Math.PI * t, rr = (i % 2 ? 0.94 : 1.0);
    pts.push([(-Math.cos(a)) * len / 2 * rr, Math.sin(a) * h * rr]);
  }
  pts.push([len / 2 * 0.92, -0.02]); pts.push([-len / 2 * 0.92, -0.02]);
  F.prism(x, y, z, pts, len * 0.07 + 0.04, col == null ? F.col('crimson') : col, 'hair', dir === 'along' ? 'x' : 'z');
  F.prism(x, y - 0.02, z, [[-len * 0.47, -0.06], [len * 0.47, -0.06], [len * 0.45, 0.05], [-len * 0.45, 0.05]], len * 0.07 + 0.08,
    ridge == null ? F.col('bronze') : ridge, 'bronze', dir === 'along' ? 'x' : 'z');
};
/* a bunch of feathers on a cord, hanging from (x, y, z) of parent on a swinging bone `name`.
   o: { n, len, cols:[...], spread, cord } */
IZ.feathers = function (F, R, name, parent, x, y, z, o) {
  o = o || {};
  const n = o.n || 5, L = o.len || 0.6, cols = o.cols || ['fScarlet', 'fGold', 'fGreen', 'fTeal', 'fBlack'], sp = o.spread == null ? 0.5 : o.spread;
  R.dangle(name, parent, x, y, z, { mode: 'hang', len: L + (o.cord || 0.15), k: o.k || 9, c: o.c || 1.6, wind: o.wind == null ? 0.05 : o.wind, max: 1.1 });
  R.on(name);
  const cd = o.cord || 0.15;
  F.rod(0, 0, 0, 0, -cd, 0, 0.012, F.col('rope'), 'rope');
  F.knob(0, -cd, 0, 0.04, F.col('gold'), 'gold');
  for (let i = 0; i < n; i++) {
    const a = (i - (n - 1) / 2) / Math.max(1, (n - 1) / 2) * sp, tw = (i % 2 ? 0.35 : -0.25);
    const dx = Math.sin(a), dy = -Math.cos(a), w = 0.07 + 0.015 * (i % 3);
    const tx = Math.cos(tw), tz = Math.sin(tw);
    const P0 = [0, -cd, 0], tip = [dx * L, -cd + dy * L, tz * 0.04 * i];
    const mid = function (t, side) { return [dx * L * t + side * tx * w * Math.sin(Math.PI * t) * 1.0, -cd + dy * L * t, side * tz * w * Math.sin(Math.PI * t)]; };
    const col = F.col(cols[i % cols.length]), tipCol = F.col(cols[(i + 2) % cols.length]);
    F.tri(P0, mid(0.55, 1), mid(0.55, -1), col, 'feather');
    F.tri(mid(0.55, 1), tip, mid(0.55, -1), tipCol, 'feather');
    F.rod(P0[0], P0[1], P0[2], tip[0] * 0.9, -cd + dy * L * 0.9, tip[2] * 0.9, 0.006, F.col('fWhite'), 'feather');
  }
};
/* a vexillum: a pole from (x, y, z) of parent, h tall, a crossbar, a banner hanging (and swinging) from it,
   phalerae down the pole, a gilt finial. o: { h, w, bh, paint, finial:'sun'|'orb'|'hand', discs } */
IZ.vexillum = function (F, R, name, parent, x, y, z, o) {
  const h = o.h || 2.6, w = o.w || 0.8, bh = o.bh || 0.9;
  R.dangle(name, parent, x, y, z, { mode: 'whip', len: h, k: 26, c: 3.2, wind: 0.015, max: 0.25 });
  R.on(name);
  F.cy(0, h / 2, 0, 0.045, 0.04, h, F.col('woodDk'), 'wood', 'y', 8);
  F.cy(0, 0.05, 0, 0.07, 0.07, 0.14, F.col('bronze'), 'bronze', 'y', 8);
  /* the crossbar, tassels at its ends */
  const cy = h - 0.35;
  F.cy(0, cy, 0.06, 0.03, 0.03, w + 0.2, F.col('wood'), 'wood', 'x', 6);
  for (const s of [-1, 1]) {
    F.knob(s * (w / 2 + 0.1), cy, 0.06, 0.045, F.col('gold'), 'gold');
    F.rod(s * (w / 2 + 0.1), cy, 0.06, s * (w / 2 + 0.1), cy - 0.3, 0.06, 0.008, F.col('rope'), 'rope');
    F.cy(s * (w / 2 + 0.1), cy - 0.36, 0.06, 0.025, 0.05, 0.12, F.col('crimson'), 'hair', 'y', 6);
  }
  /* phalerae down the pole, under the crossbar */
  for (let i = 0; i < (o.discs || 3); i++) IZ.phalera(F, 0, cy - bh - 0.25 - i * 0.24, 0.06, 0, 0, 1, 0.1);
  /* the finial */
  if (o.finial === 'orb') {
    F.knob(0, h + 0.12, 0, 0.14, F.col('gold'), 'gold');
    F.ring(0, h + 0.12, 0, 0, 0, 1, 0.17, 0.02, F.col('gold'), 'gold', 14);
    F.cy(0, h + 0.36, 0, 0.02, 0.02, 0.22, F.col('gold'), 'gold', 'y', 6);
  } else if (o.finial === 'hand') {
    F.cb(0, h + 0.14, 0, 0.16, 0.2, 0.06, F.col('gold'), 'gold');
    for (let k = 0; k < 4; k++) F.cb(-0.06 + k * 0.04, h + 0.3, 0, 0.03, 0.14, 0.05, F.col('gold'), 'gold');
  } else IZ.sun(F, 0, h + 0.16, 0, 0, 0, 1, 0.24);
  /* the banner swings from the crossbar */
  R.dangle(name + '_cloth', name, 0, cy, 0.06, { mode: 'hang', len: bh, k: 12, c: 2.2, wind: 0.03, max: 0.5 });
  R.banner({ bone: name + '_cloth', kind: 'hang', x: 0, y: -0.02, z: 0, w: w, h: bh, paint: o.paint || IZ.paint(F, 'sun'), flutter: 0.03 });
};
/* a sashimono: a springy pole from (x, y, z) of parent, h tall, with a short arm at the top from which a long
   flag hangs beside the pole. o: { h, w, bh, paint, side (+1 the arm reaches +x) } */
IZ.sashimono = function (F, R, name, parent, x, y, z, o) {
  const h = o.h || 2.4, w = o.w || 0.55, bh = o.bh || 1.6, s = o.side || 1;
  R.dangle(name, parent, x, y, z, { mode: 'whip', len: h, k: 20, c: 2.6, wind: 0.02, max: 0.3 });
  R.on(name);
  F.cy(0, h / 2, 0, 0.04, 0.032, h, F.col('woodDk'), 'wood', 'y', 8);
  F.cy(0, 0.05, 0, 0.065, 0.065, 0.14, F.col('bronze'), 'bronze', 'y', 8);
  F.cy(s * w / 2, h - 0.05, 0, 0.025, 0.025, w + 0.08, F.col('wood'), 'wood', 'x', 6);
  F.knob(s * (w + 0.05), h - 0.05, 0, 0.04, F.col('gold'), 'gold');
  F.cy(0, h + 0.1, 0, 0.05, 0.005, 0.22, F.col('gold'), 'gold', 'y', 6);
  R.banner({ bone: name, kind: 'hang', x: s * w / 2, y: h - 0.08, z: 0, w: w, h: bh, paint: o.paint || IZ.paint(F, 'sun'), flutter: 0.04 });
};
/* legion numerals in raised bars (I, V, X) on a plate facing +z, centred at (x, y, z), h tall */
IZ.numeral = function (F, x, y, z, s, h, col) {
  const cw = h * 0.6, bw = h * 0.17, x0 = x - (s.length * cw) / 2 + cw / 2;
  col = col == null ? F.col('cream') : col;
  for (let i = 0; i < s.length; i++) {
    const cx = x0 + i * cw, C = s[i];
    if (C === 'I') F.cb(cx, y, z, bw, h, 0.03, col, 'paint');
    else if (C === 'V') { for (const t of [-1, 1]) F.cb(cx + t * cw * 0.16, y, z, bw, h * 1.02, 0.03, col, 'paint', 0, 0, t * 0.33); }
    else if (C === 'X') { for (const t of [-1, 1]) F.cb(cx, y, z, bw, h * 1.1, 0.03, col, 'paint', 0, 0, t * 0.55); }
  }
  F.cb(x, y + h / 2 + bw * 0.8, z, s.length * cw, bw * 0.7, 0.03, col, 'paint');
  F.cb(x, y - h / 2 - bw * 0.8, z, s.length * cw, bw * 0.7, 0.03, col, 'paint');
};
/* a scutum: a tall curved shield (radius of curve rc) w wide and h tall, its face toward +z, centred at (x, y, z);
   orange face, bronze rim, a gilt boss with the sun's rays painted round it */
IZ.scutum = function (F, x, y, z, w, h, rc) {
  const th = w / rc, segs = 8;
  const mk = function (r, col, fam, inward) {
    const g = new THREE.CylinderGeometry(r, r, h, segs, 1, true, -th / 2, th);
    g.translate(0, 0, -rc);
    if (inward) {   /* the back face: wound the other way, normals turned in */
      const ix = g.index;
      for (let i = 0; i < ix.count; i += 3) { const a = ix.getX(i + 1); ix.setX(i + 1, ix.getX(i + 2)); ix.setX(i + 2, a); }
      const nr = g.attributes.normal;
      for (let i = 0; i < nr.count; i++) nr.setXYZ(i, -nr.getX(i), -nr.getY(i), -nr.getZ(i));
    }
    return _add(new THREE.Mesh(g, mat(col, fam)));
  };
  const front = mk(rc, F.col('orange'), 'paint'); front.position.set(x, y, z);
  const back = mk(rc - 0.06, F.col('steelDk'), 'metal', true); back.position.set(x, y, z);
  /* rim: top and bottom arcs, two edges */
  for (const sy of [-1, 1]) for (let i = 0; i < segs; i++) {
    const a0 = -th / 2 + th * i / segs, a1 = a0 + th / segs;
    F.rod(x + Math.sin(a0) * rc, y + sy * h / 2, z + Math.cos(a0) * rc - rc, x + Math.sin(a1) * rc, y + sy * h / 2, z + Math.cos(a1) * rc - rc, 0.04, F.col('bronze'), 'bronze');
  }
  for (const sx of [-1, 1]) F.cb(x + Math.sin(sx * th / 2) * rc, y, z + Math.cos(th / 2) * rc - rc, 0.07, h + 0.06, 0.08, F.col('bronze'), 'bronze', 0, sx * th / 2, 0);
  /* a cream band round the face, the boss, rays */
  for (const sy of [-1, 1]) for (let i = 0; i < segs; i++) {
    const a = -th / 2 + th * (i + 0.5) / segs;
    F.cb(x + Math.sin(a) * (rc + 0.005), y + sy * (h / 2 - 0.12), z + Math.cos(a) * (rc + 0.005) - rc, w / segs * 1.02, 0.07, 0.02, F.col('cream'), 'paint', 0, a, 0);
  }
  IZ.sun(F, x, y, z + 0.02, 0, 0, 1, Math.min(w, h) * 0.28);
  F.sph(x, y, z + 0.06, 0.13, 0.13, 0.09, F.col('gold'), 'gold', 10, 6);
};
/* livery: a cream-edged orange panel with a teal line, w x h, facing +z, t thick */
IZ.panel = function (F, x, y, z, w, h, t, rx, ry, rz) {
  F.cb(x, y, z, w, h, t, F.col('orange'), 'paint', rx, ry, rz);
  return F;
};

/* ---- kits/mechs/krator-mechs-iziz-aquilifer.js ---- */
/* ======================================================================
   Iziz mech: the Aquilifer (kits/mechs/krator-mechs-iziz-aquilifer.js)

   An Ancient mine-ventilation walker: a biped carrying two great ducted fans on its
   back, long cooling vanes hanging from its shoulders, the operator in a barred cab
   in the chest. The legion made it the standard-bearer: the sun of Iziz rides on a
   pole between the fans, and on its right forearm it carries a carroballista that
   throws a barbed harpoon on a line (for whales, once, off Hook). It raises the
   weapon to its shoulder, looses, and winds the line back in.
   ====================================================================== */
MECH({
  key: 'iz_aquilifer', name: 'Aquilifer', culture: 'iziz',
  role: 'standard-bearer: harpoon ballista', origin: 'Ancient mine-ventilation walker',
  lore: 'Its fans once aired the deep mines. Now it carries the legion\'s sun between them and a harpoon ballista that was meant for whales.',
  tags: { class: 'mech', type: ['war machine', 'standard-bearer'], drive: 'biped', crew: 1, pilot: 'chest', weapon: ['harpoon', 'fist'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Standard'],
  w: 5.6, d: 4.5, h: 8.3,
  data: { height: 5.4, mass: 15, crew: 1, pilot: 'chest', reach: 260, weapon: 'carroballista throwing a 2.6 m harpoon on a line',
    engine: 'Ancient cell pack, twin ducted fans', armour: 'vent housing plate' },
  gait: { period: 1.75, duty: 0.6, stride: 1.25, lift: 0.32, bob: 0.065, sway: 0.08, roll: 0.035, twist: 0.06, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.2, 0, 0], arm_r_sh: [0.08, 0, 0] } },
  idle: { breathe: 0.03, scan: 0.1, look: 0.35 },
  attack: (function () {
    const D = 0.62 * 2.2 - 0.12;
    const aim = { b: { arm_r_sh: [-1.42, 0.12, 0.05], arm_r_el: [0.55, 0, 0], arm_r_wr: [0.87, 0, 0], torso: [0, -0.18, 0], arm_l_sh: [-0.4, 0, 0.1], body: [0.03, 0, 0] },
      s: { body: [0, -0.12, 0] } };
    const shot = JSON.parse(JSON.stringify(aim));
    shot.b.harp_bowL = [0, -0.45, 0]; shot.b.harp_bowR = [0, 0.45, 0]; shot.s.harp_nut = [0, 0, D]; shot.sc = { harp_bolt: 0.0001 };
    const kick = JSON.parse(JSON.stringify(shot));
    kick.b.arm_r_sh = [-1.25, 0.12, 0.05]; kick.b.arm_r_wr = [0.75, 0, 0]; kick.s.body = [0, -0.1, -0.15];
    const wound = JSON.parse(JSON.stringify(aim)); wound.sc = { harp_bolt: 0.0001 };
    return { kind: 'harpoon shot', dur: 3.2, keys: [[0, {}], [0.75, aim, 's'], [1.05, aim, 's'], [1.1, kick, 'i'], [1.35, shot, 'o'],
      [2.4, wound, 's'], [2.42, aim, 'l'], [3.2, {}, 's']],
      events: [{ t: 1.08, type: 'fire', kind: 'harpoon', at: 'harp_muzzle', dir: [0, 0, 1], speed: 52 }] };
  })(),

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze'), hz = c('hazard');

    R.bone('body', null, 0, 2.25, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.3, 0.5, 0.95, 0.14, gun, 'metal', 'z');
    F.chb(0, -0.02, 0.48, 0.9, 0.32, 0.06, 0.05, steel, 'paint', 'x');
    for (const s of [-1, 1]) MP.joint(F, s * 0.58, -0.1, 0, 0.31, 0.16, 'x', iron, null);

    /* ---- the chest: a barred cab */
    R.bone('torso', 'body', 0, 0.3, 0);
    R.on('torso');
    F.cy(0, 0.05, 0, 0.4, 0.4, 0.3, iron, 'metal', 'y', 12);
    F.chb(0, 1.0, -0.4, 1.8, 1.45, 0.8, 0.16, steel, 'paint', 'z');
    F.chb(0, 1.7, 0.08, 1.85, 0.16, 1.2, 0.07, dk, 'metal', 'x');
    F.chb(0, 0.33, 0.12, 1.55, 0.26, 1.15, 0.1, dk, 'metal', 'x');
    for (const s of [-1, 1]) {
      F.chb(s * 0.8, 1.0, 0.18, 0.2, 1.4, 1.1, 0.06, steel, 'paint', 'x');
      F.cb(s * 0.9, 1.0, 0.18, 0.02, 1.2, 0.85, or, 'paint');
      F.cb(s * 0.915, 1.0, 0.18, 0.02, 1.24, 0.08, cr, 'paint');
    }
    F.cb(0, 1.03, 0.025, 1.4, 1.2, 0.04, gun, 'metal');
    F.cb(0, 0.45, 0.02, 0.58, 0.1, 0.5, c('leather'), 'leather');
    MP.pilot(F, R, 'torso', 0, 0.5, 0.05, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: c('crimson') });
    R.on('torso');
    F.cb(0, 1.05, 0.66, 1.36, 1.0, 0.03, c('glass'), 'glass');
    for (let i = 0; i < 6; i++) F.cb(-0.6 + i * 0.24, 1.05, 0.7, 0.04, 1.02, 0.05, iron, 'metal');
    F.cb(0, 1.57, 0.68, 1.45, 0.08, 0.1, gun, 'metal');
    F.cb(0, 0.52, 0.66, 1.45, 0.3, 0.08, dk, 'metal');
    F.bands(0, 0.52, 0.705, 1.42, 0.28, Math.PI / 4, 0.13, [or, hz], 'paint');
    IZ.phalerae(F, 0.55, 1.45, 0.73, 0, 0, 1, 1, 0.2, 0.08);
    /* the fans, their bracket, the long vanes from the shoulders */
    F.chb(0, 1.55, -0.9, 1.7, 0.5, 0.35, 0.1, gun, 'metal', 'z');
    for (const s of [-1, 1]) {
      MP.fan(F, R, s > 0 ? 'fan_l' : 'fan_r', 'torso', s * 0.56, 1.72, -1.05, 0.44, 0.42, steel, c('steelLt'), or, { idle: 4, walk: 8, attack: 16 }, 0, Math.PI, 0);
      R.on('torso');
      F.chb(s * 1.0, 0.75, -0.75, 0.12, 1.5, 0.5, 0.05, dk, 'metal', 'y', 0, 0, s * 0.12);
      F.cb(s * 1.05, 0.75, -0.5, 0.02, 1.3, 0.08, or, 'paint', 0, 0, s * 0.12);
      for (let k = 0; k < 3; k++) F.cy(s * 1.08, 0.2 + k * 0.5, -0.82, 0.05, 0.004, 0.2, iron, 'metal', 'y', 6, Math.PI, 0, 0);
    }
    /* the head: a flat visor with two grilles */
    R.bone('head', 'torso', 0, 1.8, 0.12);
    R.on('head');
    F.cy(0, 0.0, 0, 0.22, 0.26, 0.12, iron, 'metal', 'y', 10);
    F.chb(0, 0.15, 0, 0.7, 0.24, 0.62, 0.08, steel, 'paint', 'x');
    F.cb(0, 0.16, 0.32, 0.42, 0.05, 0.02, c('eye'), 'glow');
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) F.cb(s * 0.17, 0.29, -0.1 + k * 0.07, 0.24, 0.03, 0.03, iron, 'metal');
    F.cb(0, 0.28, 0, 0.72, 0.03, 0.64, or, 'paint');
    /* the standard: the legion's sun between the fans */
    IZ.vexillum(F, R, 'vex', 'torso', 0, 1.85, -1.25, { h: 3.4, w: 0.95, bh: 1.05, finial: 'sun', paint: IZ.paint(F, 'orb'), discs: 4 });

    /* ---- arms */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.12, 1.32, -0.02, 0, 0, s * 0.12);
      R.on(A + '_sh');
      MP.joint(F, -s * 0.06, 0, 0, 0.27, 0.56, 'x', iron, br);
      F.chb(s * 0.05, 0.08, 0, 0.7, 0.5, 0.92, 0.18, steel, 'paint', 'z');
      F.cb(s * 0.05, 0.08, 0, 0.72, 0.18, 0.94, or, 'paint');
      F.cb(s * 0.05, -0.04, 0, 0.73, 0.04, 0.95, hz, 'paint');
      F.chb(0, -0.5, 0, 0.42, 0.8, 0.46, 0.08, steel, 'paint', 'y');
      R.bone(A + '_el', A + '_sh', 0, -0.95, 0, -0.55, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.21, 0.48, 'x', iron, br);
      F.chb(0, -0.44, 0.02, 0.5, 0.82, 0.52, 0.1, dk, 'paint', 'y');
      F.cb(0, -0.25, 0.02, 0.53, 0.14, 0.55, or, 'paint');
      R.bone(A + '_wr', A + '_el', 0, -0.92, 0.02, 0.55, 0, 0);
      MP.piston(F, R, A + '_sh', [0, -0.3, 0.25], A + '_el', [0, -0.3, 0.29], 0.05, dk, c('chrome'));
      MP.hose(F, R, 'torso', [s * 0.7, 1.45, -0.62], A + '_sh', [0, -0.3, -0.25], 0.045, c('rubber'), 0.16);
    }
    /* the carroballista on the right forearm, a coil of line under it */
    R.on('arm_r_wr');
    F.chb(0, -0.12, 0.05, 0.36, 0.3, 0.42, 0.06, gun, 'metal', 'x');
    MP.ballista(F, R, 'harp', 'arm_r_wr', 0, 0.08, 0.35, { len: 2.2, span: 1.1, h: 0.2, wood: c('woodDk'), iron: iron, bronze: br, rope: c('rope'),
      skein: c('skein'), bolt: c('wood'), flight: c('fWhite') });
    R.on('harp');
    F.cy(0, -0.3, -0.5, 0.16, 0.16, 0.24, c('rope'), 'rope', 'x', 12);
    F.cy(0, -0.3, -0.5, 0.06, 0.06, 0.3, iron, 'metal', 'x', 8);
    R.on('harp_bolt');
    for (const s of [-1, 1]) F.rod(0, 0, 1.75, s * 0.14, 0, 1.55, 0.022, iron, 'metal');
    /* the gauntlet and a quiver of spare harpoons on the left */
    R.on('arm_l_wr');
    F.chb(0, -0.2, 0.04, 0.5, 0.42, 0.55, 0.1, dk, 'metal', 'x');
    for (let k = 0; k < 4; k++) F.cb(-0.18 + k * 0.12, -0.42, 0.22, 0.1, 0.12, 0.12, gun, 'metal', 0.3, 0, 0);
    R.on('arm_l_el');
    F.cy(0.3, -0.45, -0.1, 0.13, 0.13, 0.74, c('leather'), 'leather', 'y', 8);
    for (let k = 0; k < 3; k++) F.rod(0.27 + k * 0.03, 0.0, -0.1 + (k - 1) * 0.05, 0.27 + k * 0.03, -1.0, -0.1 + (k - 1) * 0.05, 0.02, c('wood'), 'wood');

    /* ---- legs */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.64, -0.12, 0], L1: 1.0, L2: 1.0, knee: 1, ankleH: 0.44, rest: [s * 0.74, 0.05], phase: s > 0 ? 0 : 0.5 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.25, 0.56, 'x', iron, br);
      F.chb(0, -0.5, 0, 0.48, 0.88, 0.54, 0.1, steel, 'paint', 'y');
      F.cb(s * 0.26, -0.5, 0, 0.05, 0.6, 0.36, or, 'paint');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.22, 0.5, 'x', iron, br);
      F.chb(0, -0.5, 0, 0.54, 0.92, 0.58, 0.12, dk, 'paint', 'y');
      F.chb(0, -0.4, 0.3, 0.42, 0.62, 0.06, 0.03, steel, 'paint', 'x');
      F.cb(0, -0.4, 0.335, 0.08, 0.6, 0.02, or, 'paint');
      MP.piston(F, R, Lg + '_hip', [0, -0.25, -0.3], Lg + '_knee', [0, -0.35, -0.32], 0.055, dk, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'stomp', w: 0.7, l: 1.05, ankleH: 0.44, plate: steel, iron: gun, trim: br, toes: 3 });
      F.cb(0, -0.44 + 0.27, 0.52, 0.62, 0.1, 0.02, gun, 'metal', -0.35, 0, 0);
      F.bands(0, -0.44 + 0.275, 0.535, 0.6, 0.09, Math.PI / 4, 0.07, [or, hz], 'paint', -0.35, 0, 0);
    }
  }
});

/* ---- kits/mechs/krator-mechs-iziz-castra.js ---- */
/* ======================================================================
   Iziz mech: the Castra (kits/mechs/krator-mechs-iziz-castra.js)

   An Ancient cargo strider: a boxy hull high on four long legs (the fore knees bend
   back, the hind knees forward, so it folds like an elephant), the operator in a
   windowed cab at its front that turns like a head. The legions use it as a walking
   camp on the desert roads: a deck at the back under a striped Iziz awning, crates
   and water jars, a rope ladder, aerials with pennants, and a ballista on a turntable
   on the roof that shoots over the cab. It settles on its legs to shoot.
   Variant 1, the Supply Train, carries the legion's stores instead of a ballista: crates,
   sacks and amphorae under a net, panniers, javelins and waterskins; a legionary stands
   on the roof with a shofar, a ram's horn, and sounds it between the strider's steps.
   ====================================================================== */
/* the horn's centre line: from the mouthpiece (the origin) forward, sweeping up to the bell, twisting a little */
function castraHornPt(t) { const a = 1.7 * t; return [0.05 * Math.sin(Math.PI * t), 0.34 * (1 - Math.cos(a)), 0.34 * Math.sin(a) + 0.04 * t]; }
MECH({
  key: 'iz_castra', name: 'Castra', culture: 'iziz',
  role: 'walking camp: deck ballista', origin: 'Ancient cargo strider',
  lore: 'A cargo strider of the desert roads, now a camp on legs: a striped awning over the deck, water and stores, and a ballista on a turntable that shoots over the cab.',
  tags: { class: 'mech', type: ['war machine', 'transport', 'siege'], drive: 'quadruped', crew: 3, pilot: 'cab', weapon: ['ballista'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 2, variantNames: ['Road Camp', 'Supply Train'],
  w: 3.6, d: 5.8, h: 7.8,
  data: { height: 6.2, mass: 26, crew: 3, pilot: 'cab', reach: 360, weapon: 'deck ballista on a turntable (1.4 m bolts)', cargo: 3000,
    engine: 'Ancient cell pack, hydraulic', armour: 'cargo hull' },
  variantData: [{}, { mass: 24, cargo: 6000, reach: 0, weapon: 'none: a shofar (signal horn) sounded from the roof', stores: 'grain, oil, water, javelins' }],
  gait: { period: 2.6, duty: 0.75, stride: 1.6, lift: 0.38, bob: 0.05, sway: 0.06, roll: 0.02, twist: 0.02, lean: 0,
    offsets: [0.25, 0.75, 0, 0.5] },
  idle: { breathe: 0.03, scan: 0, look: 0.4 },
  anim: {
    idle: function (P, t, w, st) {
      if (st.variant !== 1) { P.b.turret = [0, 0.35 * Math.sin(t * 0.17) * w, 0]; return; }
      /* the hornblower sounds a call every nine seconds: raises the shofar, leans back, holds it, lowers it */
      const u = (t % 9) / 9, up = Math.min(1, Math.max(0, (u - 0.55) / 0.06)) * Math.min(1, Math.max(0, (0.9 - u) / 0.06));
      const e = up * up * (3 - 2 * up);
      P.b.blower_horn = [-1.15 * e * w, 0, 0]; P.b.blower_up = [-0.16 * e * w, 0.1 * Math.sin(t * 0.4) * (1 - e) * w, 0];
      P.b.blower_up_head = [(-0.25 * e + 0.08 * (1 - e)) * w, 0.4 * Math.sin(t * 0.31) * (1 - e) * w, 0];
    }
  },
  variantAttack: [null, {
    kind: 'horn call and stamp', dur: 3.2,
    keys: [
      [0, {}],
      [0.55, { b: { blower_horn: [-1.15, 0, 0], blower_up: [-0.12, 0, 0], blower_up_head: [-0.2, 0, 0] } }, 's'],
      [1.5, { b: { blower_horn: [-1.15, 0, 0], blower_up: [-0.2, 0, 0], blower_up_head: [-0.3, 0, 0], body: [-0.07, 0, 0] }, s: { body: [0, 0.14, -0.05] } }, 's'],
      [1.95, { b: { blower_horn: [-1.0, 0, 0], blower_up: [-0.1, 0, 0], body: [0.05, 0, 0] }, s: { body: [0, -0.24, 0.12] } }, 'i'],
      [2.3, { b: { blower_horn: [-0.5, 0, 0], body: [0.02, 0, 0] }, s: { body: [0, -0.12, 0.06] } }, 'o'],
      [3.2, {}, 's']
    ],
    events: [{ t: 0.6, type: 'call', at: 'horn_bell', dir: [0, 1, 0] }, { t: 1.97, type: 'impact', at: 'stamp', r: 2.5 }]
  }],
  attack: (function () {
    const D = 0.62 * 1.7 - 0.12;
    const aim = { b: { turret: [0, 0, 0], bal: [-0.07, 0, 0], body: [-0.03, 0, 0] }, s: { body: [0, -0.22, 0] } };
    const shot = JSON.parse(JSON.stringify(aim));
    shot.b.bal_bowL = [0, -0.4, 0]; shot.b.bal_bowR = [0, 0.4, 0]; shot.s.bal_nut = [0, 0, D]; shot.sc = { bal_bolt: 0.0001 };
    const kick = JSON.parse(JSON.stringify(shot)); kick.b.bal = [-0.12, 0, 0]; kick.s.body = [0, -0.2, -0.1];
    const wound = JSON.parse(JSON.stringify(aim)); wound.sc = { bal_bolt: 0.0001 };
    return { kind: 'deck ballista', dur: 3.4, keys: [[0, {}], [0.7, aim, 's'], [0.98, aim, 's'], [1.03, kick, 'i'], [1.3, shot, 'o'],
      [2.6, wound, 's'], [2.62, aim, 'l'], [3.4, {}, 's']],
      events: [{ t: 1.0, type: 'fire', kind: 'bolt', at: 'bal_muzzle', dir: [0, 0, 1], speed: 60 }] };
  })(),

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');
    const wood = c('wood'), woodDk = c('woodDk');

    /* ---- the hull */
    R.bone('body', null, 0, 3.55, 0);
    R.on('body');
    F.chb(0, 0.32, 0.15, 2.4, 1.35, 3.0, 0.22, steel, 'paint', 'z');
    F.chb(0, -0.48, 0.0, 1.9, 0.42, 3.2, 0.14, gun, 'metal', 'z');
    for (const s of [-1, 1]) {
      F.cb(s * 1.21, 0.62, 0.3, 0.03, 0.42, 2.5, or, 'paint');
      F.cb(s * 1.225, 0.38, 0.3, 0.02, 0.06, 2.5, cr, 'paint');
      F.cb(s * 1.225, 0.31, 0.3, 0.02, 0.04, 2.5, c('teal'), 'paint');
      IZ.sun(F, s * 1.24, 0.62, 0.9, s, 0, 0, 0.26);
      for (let k = 0; k < 3; k++) IZ.phalera(F, s * 1.23, 0.62, -0.2 - k * 0.32, s, 0, 0, 0.09);
      F.chb(s * 1.21, 0.05, -0.75, 0.06, 0.5, 0.55, 0.04, dk, 'metal', 'x');
      for (let k = 0; k < 4; k++) F.cb(s * 1.25, -0.05 + k * 0.08, -0.75, 0.02, 0.03, 0.4, iron, 'metal');
      MP.barrel(F, s * 1.3, -0.15, 0.55, 0.2, 0.5, wood, iron, 'y');
    }
    /* the deck at the back: planks, rails, the awning on four poles (it stops short of the roof, where the
       turntable or the hornblower stands, so nothing on the roof reaches under it) */
    F.cb(0, 1.06, -0.9, 2.6, 0.1, 2.2, wood, 'wood');
    for (let k = 0; k < 9; k++) F.cb(0, 1.115, -1.9 + k * 0.25, 2.54, 0.015, 0.02, woodDk, 'wood');
    for (const s of [-1, 1]) {
      F.cb(s * 1.28, 1.45, -0.9, 0.05, 0.05, 2.2, woodDk, 'wood');
      for (let k = 0; k < 5; k++) F.cb(s * 1.28, 1.29, -1.95 + k * 0.52, 0.065, 0.36, 0.065, woodDk, 'wood');
    }
    for (const sx of [-1, 1]) for (const z of [-1.95, -0.25]) F.cb(sx * 1.22, 1.75, z, 0.06, 1.3, 0.06, woodDk, 'wood');
    const NS = 8;
    for (let k = 0; k < NS; k++) {
      const x = -1.3 + (k + 0.5) * 2.6 / NS;
      F.cb(x, 2.42, -1.1, 2.6 / NS, 0.03, 1.9, k % 2 ? cr : or, 'cloth', -0.1, 0, 0);
      F.cb(x, 2.27, -0.17, 2.6 / NS, 0.25, 0.02, k % 2 ? or : cr, 'cloth', 0.05, 0, 0);
    }
    const v = F.variant;
    if (v === 0) {
      MP.crate(F, 0.85, 1.125, -1.55, 0.6, 0.45, 0.5, wood, iron, 0.2);
      MP.crate(F, 0.85, 1.56, -1.55, 0.45, 0.35, 0.4, wood, iron, -0.1);
      MP.barrel(F, -0.85, 1.42, -1.6, 0.22, 0.6, wood, iron, 'y');
      MP.barrel(F, -0.4, 1.42, -1.7, 0.2, 0.55, woodDk, iron, 'y');
      MP.bundle(F, 0.0, 1.27, -1.8, 0.15, 1.2, c('canvas'), c('rope'), 'x');
      for (let k = 0; k < 3; k++) { F.sph(0.95 - k * 0.3, 1.27, -0.45, 0.13, 0.17, 0.13, c('canvas'), 'cloth', 8, 6); F.cy(0.95 - k * 0.3, 1.45, -0.45, 0.05, 0.06, 0.08, c('canvas'), 'cloth', 'y', 6); }
      /* the turntable on the roof, its ballista shooting over the cab */
      R.bone('turret', 'body', 0, 0.99, 0.85);
      R.on('turret');
      F.cy(0, 0.06, 0, 0.42, 0.45, 0.12, iron, 'metal', 'y', 16);
      F.cy(0, 0.5, 0, 0.14, 0.18, 0.8, gun, 'metal', 'y', 10);
      F.cb(0, 0.85, -0.1, 0.5, 0.08, 0.5, iron, 'metal');
      MP.ballista(F, R, 'bal', 'turret', 0, 1.05, 0.1, { len: 1.7, span: 0.95, h: 0.17, wood: woodDk, iron: iron, bronze: br, rope: c('rope'),
        skein: c('skein'), bolt: wood, flight: c('fScarlet') });
    } else {
      castraStores(F, R, v);
      castraHornblower(F, R);
    }
    /* ---- the cab: the head */
    R.bone('head', 'body', 0, 0.45, 1.75);
    R.on('head');
    F.cy(0, -0.2, -0.2, 0.35, 0.4, 0.2, iron, 'metal', 'y', 12);
    F.chb(0, 0.3, 0.25, 1.65, 1.5, 1.15, 0.22, steel, 'paint', 'z');
    F.chb(0, 1.1, 0.22, 1.7, 0.12, 1.2, 0.06, or, 'paint', 'x');
    F.cb(0, 0.62, 0.84, 1.3, 0.62, 0.03, c('glass'), 'glass', -0.12, 0, 0);
    for (const x of [-0.45, 0, 0.45]) F.cb(x, 0.62, 0.86, 0.05, 0.64, 0.05, iron, 'metal', -0.12, 0, 0);
    for (const s of [-1, 1]) F.cb(s * 0.83, 0.62, 0.35, 0.03, 0.5, 0.6, c('glass'), 'glass');
    F.cb(0, 0.98, 0.9, 1.6, 0.08, 0.2, dk, 'metal', 0.25, 0, 0);
    F.cb(0, -0.25, 0.85, 1.4, 0.2, 0.06, dk, 'metal');
    for (const s of [-1, 1]) MP.lamp(F, s * 0.55, -0.25, 0.9, 0, -0.05, 1, 0.09, 'head', gun);
    F.cb(0, -0.4, 0.36, 1.4, 0.06, 0.8, gun, 'metal');
    MP.pilot(F, R, 'head', 0, 0.0, 0.3, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: null });
    R.on('head');
    IZ.crest(F, 0, 1.16, -0.1, 1.0, 0.28, 'along');
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'ant_l' : 'ant_r';
      R.dangle(A, 'head', s * 0.7, 1.16, -0.1, { mode: 'whip', len: 1.8, k: 30, c: 2.2, wind: 0.02, max: 0.45 });
      R.on(A);
      F.rod(0, 0, 0, 0, 1.8, 0, 0.013, iron, 'metal');
      F.knob(0, 1.8, 0, 0.03, c('lensRed'), 'lampTail');
      R.banner({ bone: A, kind: 'pennant', x: 0, y: 1.7, z: 0, w: 0.9, h: 0.26, paint: s > 0 ? IZ.paint(F, 'stripes') : IZ.paint(F, 'teal') });
    }
    /* ---- the rope ladder, the standard */
    R.dangle('ladder', 'body', 1.33, 1.05, -0.45, { mode: 'hang', len: 2.3, k: 7, c: 1.2, wind: 0.02, max: 0.7 });
    R.on('ladder');
    for (const z of [-0.22, 0.22]) F.rod(0, 0, z, 0, -2.3, z, 0.015, c('rope'), 'rope');
    for (let k = 1; k <= 7; k++) F.cy(0, -k * 0.31, 0, 0.022, 0.022, 0.46, woodDk, 'wood', 'z', 5);
    IZ.vexillum(F, R, 'vex', 'body', -1.15, 1.12, -1.95, { h: 2.6, w: 0.75, bh: 0.85, finial: 'orb', paint: IZ.paint(F, 'legion', { numeral: 'VI' }), discs: 2 });
    IZ.feathers(F, R, 'fth_c', 'head', 0.85, 0.95, 0.75, { n: 5, len: 0.5 });

    /* ---- four long legs: the fore knees bend back, the hind forward */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2];
      R.leg(n, { parent: 'body', hip: [sx * 1.1, -0.5, sz * 1.25], L1: 1.65, L2: 1.6, knee: sz > 0 ? -1 : 1, ankleH: 0.45,
        rest: [sx * 1.2, sz * 1.35], toe: 0.15 });
      R.on(n + '_hip');
      MP.joint(F, sx * 0.05, 0, 0, 0.42, 0.42, 'x', gun, br);
      F.cy(sx * 0.3, 0, 0, 0.3, 0.3, 0.06, or, 'paint', 'x', 16);
      F.chb(0, -0.82, 0, 0.5, 1.35, 0.58, 0.12, steel, 'paint', 'y');
      F.chb(sx * 0.27, -0.75, 0, 0.05, 1.0, 0.4, 0.03, or, 'paint', 'y');
      F.cb(sx * 0.3, -0.75, 0, 0.02, 1.04, 0.06, cr, 'paint');
      R.on(n + '_knee');
      MP.joint(F, 0, 0, 0, 0.32, 0.5, 'x', gun, br);
      F.cy(0, -0.78, 0, 0.17, 0.13, 1.35, dk, 'metal', 'y', 12);
      F.chb(0, -0.35, 0, 0.42, 0.55, 0.46, 0.08, steel, 'paint', 'y');
      for (const s2 of [-1, 1]) MP.piston(F, R, n + '_knee', [s2 * 0.2, -0.3, 0], n + '_ankle', [s2 * 0.18, 0.35, 0], 0.045, dk, c('chrome'));
      MP.piston(F, R, n + '_hip', [0, -0.4, -sz * 0.32], n + '_knee', [0, -0.45, -sz * 0.24], 0.07, dk, c('chrome'));
      MP.hose(F, R, 'body', [sx * 0.9, -0.55, sz * 0.8], n + '_hip', [0, -0.5, -0.25], 0.055, c('rubber'), 0.15);
      R.on(n + '_ankle');
      MP.foot(F, { kind: 'pad', w: 0.85, l: 0.85, ankleH: 0.45, plate: steel, iron: gun, trim: br, toes: 4 });
    }
  }
});

/* ---- the Supply Train's stores: crates under a net, sacks, amphorae, javelins, panniers, waterskins */
function castraStores(F, R, v) {
  const c = F.col, wood = c('wood'), woodDk = c('woodDk'), iron = c('iron'), rope = c('rope'), canvas = c('canvas');
  const terra = 0xa85a32, wicker = 0x9a7a4a, y0 = 1.125;   /* on the plank lines, not flush with the deck */
  /* crates two high on the left, a net over them */
  MP.crate(F, -0.75, y0, -1.6, 0.6, 0.45, 0.5, wood, iron, 0.05);
  MP.crate(F, -0.75, y0, -1.0, 0.55, 0.5, 0.5, woodDk, iron, -0.06);
  MP.crate(F, -0.15, y0, -1.65, 0.5, 0.4, 0.45, wood, iron, 0.12);
  MP.crate(F, -0.75, y0 + 0.47, -1.55, 0.5, 0.38, 0.45, woodDk, iron, -0.1);
  MP.crate(F, -0.7, y0 + 0.52, -1.0, 0.45, 0.35, 0.42, wood, iron, 0.08);
  for (let k = 0; k < 5; k++) {
    const z = -1.85 + k * 0.25;
    F.rod(-1.1, y0 + 0.05, z, -0.4, y0 + 0.95, z + 0.45, 0.012, rope, 'rope');
    F.rod(-0.4, y0 + 0.05, z, -1.1, y0 + 0.95, z + 0.45, 0.012, rope, 'rope');
  }
  /* sacks on the right, two layers, each tied at the neck */
  for (let i = 0; i < 7; i++) {
    const row = i < 4, x = row ? 0.5 + (i % 2) * 0.42 : 0.7 + (i % 2) * 0.3, z = row ? -1.75 + Math.floor(i / 2) * 0.5 : -1.55 + (i - 4) * 0.35;
    const y = row ? y0 + 0.16 : y0 + 0.44, tilt = (F.rnd() - 0.5) * 0.4;
    F.sph(x, y, z, 0.2, 0.16, 0.26, [canvas, 0xa08a62, 0xc2ad84][i % 3], 'cloth', 10, 6, 0, TAU, 0, Math.PI, 0, tilt, 0);
    F.cy(x + Math.sin(tilt) * 0.27, y + 0.02, z + Math.cos(tilt) * 0.27, 0.04, 0.06, 0.1, canvas, 'cloth', 'z', 6, 0, tilt, 0);
  }
  /* amphorae in a rack at the front of the deck */
  F.cb(0.0, y0 + 0.3, -0.42, 2.0, 0.06, 0.06, woodDk, 'wood');
  for (let k = 0; k < 5; k++) {
    const x = -0.8 + k * 0.4;
    F.sph(x, y0 + 0.3, -0.42, 0.13, 0.26, 0.13, terra, 'cloth', 10, 7);
    F.cy(x, y0 + 0.6, -0.42, 0.055, 0.045, 0.14, terra, 'cloth', 'y', 8);
    F.cy(x, y0 + 0.69, -0.42, 0.065, 0.065, 0.04, F.shade(terra, -0.2), 'cloth', 'y', 8);
    for (const s of [-1, 1]) F.tor(x + s * 0.07, y0 + 0.56, -0.42, 0.05, 0.012, terra, 'cloth', 'z', 6, Math.PI);
    F.cy(x, y0 + 0.04, -0.42, 0.04, 0.012, 0.1, terra, 'cloth', 'y', 6);
  }
  /* a bundle of javelins along the right rail */
  for (let k = 0; k < 10; k++) {
    const dx = (k % 4) * 0.035, dy = Math.floor(k / 4) * 0.035;
    F.rod(1.12 + dx, y0 + 0.1 + dy, -1.95, 1.12 + dx, y0 + 0.16 + dy, -0.2, 0.012, wood, 'wood');
    F.cy(1.12 + dx, y0 + 0.16 + dy, -0.12, 0.016, 0.003, 0.16, iron, 'metal', 'z', 4);
  }
  for (const z of [-1.5, -0.7]) F.cy(1.17, y0 + 0.15, z, 0.1, 0.1, 0.04, rope, 'rope', 'z', 8);
  /* panniers down the hull sides, slung from the rail */
  for (const s of [-1, 1]) for (const z of [-1.35, -0.55]) {
    F.cy(s * 1.38, 0.55, z, 0.24, 0.2, 0.62, wicker, 'wood', 'y', 10);
    F.cy(s * 1.38, 0.87, z, 0.25, 0.25, 0.04, F.shade(wicker, -0.3), 'wood', 'y', 10);
    F.sph(s * 1.38, 0.88, z, 0.22, 0.1, 0.22, canvas, 'cloth', 8, 4, 0, TAU, 0, Math.PI / 2);
    for (const dz of [-0.12, 0.12]) F.rod(s * 1.36, 0.85, z + dz, s * 1.29, 1.45, z + dz, 0.012, rope, 'rope');
  }
  /* waterskins swinging from the back poles */
  for (const s of [-1, 1]) {
    const n = s > 0 ? 'skin_l' : 'skin_r';
    R.dangle(n, 'body', s * 1.28, 2.05, -1.95, { mode: 'hang', len: 0.55, k: 9, c: 1.4, wind: 0.02, max: 0.9 });
    R.on(n);
    F.rod(0, 0, 0, 0, -0.2, 0, 0.01, rope, 'rope');
    F.sph(0, -0.42, 0, 0.13, 0.22, 0.1, c('leather'), 'leather', 10, 7);
    F.cy(0, -0.2, 0, 0.03, 0.04, 0.06, c('leather'), 'leather', 'y', 6);
    R.on('body');
  }
}

/* ---- the hornblower on the roof: a legionary in a crimson cape with a shofar. Bones: blower (his feet), blower_up
   (from the waist), blower_up_head, blower_horn (shoulders, arms and horn: built raised to the lips, rested lowered) */
function castraHornblower(F, R) {
  const c = F.col, br = c('bronze'), tunic = c('tunic'), skin = c('skin'), leather = c('leather');
  R.bone('blower', 'body', 0, 0.99, 0.75);
  R.on('blower');
  F.cy(0, 0.04, 0, 0.42, 0.45, 0.08, c('iron'), 'metal', 'y', 14);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; F.rod(Math.cos(a) * 0.5, 0.08, Math.sin(a) * 0.5, Math.cos(a) * 0.5, 0.95, Math.sin(a) * 0.5, 0.02, br, 'bronze'); }
  F.tor(0, 0.95, 0, 0.5, 0.025, br, 'bronze', 'y', 16);
  for (const s of [-1, 1]) {
    F.cb(s * 0.1, 0.47, 0, 0.14, 0.76, 0.15, c('trousers'), 'cloth');
    F.cb(s * 0.1, 0.07, 0.04, 0.16, 0.13, 0.27, leather, 'leather');
  }
  F.cy(0, 0.82, 0, 0.27, 0.21, 0.3, tunic, 'cloth', 'y', 10);
  R.bone('blower_up', 'blower', 0, 0.95, 0);
  R.on('blower_up');
  F.cb(0, 0.26, 0, 0.4, 0.5, 0.24, tunic, 'cloth');
  for (let k = 0; k < 4; k++) F.cb(0, 0.12 + k * 0.1, 0.0, 0.43, 0.075, 0.27, k % 2 ? c('steel') : c('steelLt'), 'metal');
  F.cb(0, 0.03, 0, 0.44, 0.06, 0.28, leather, 'leather');
  F.cb(0, 0.5, 0, 0.52, 0.1, 0.27, c('steel'), 'metal');
  R.banner({ bone: 'blower_up', kind: 'hang', x: 0, y: 0.5, z: -0.15, w: 0.5, h: 0.82, paint: { field: c('crimson') }, flutter: 0.05 });
  R.bone('blower_up_head', 'blower_up', 0, 0.56, 0.0);
  R.on('blower_up_head');
  F.cy(0, 0.04, 0, 0.05, 0.05, 0.08, skin, 'skin', 'y', 8);
  F.sph(0, 0.16, 0.01, 0.1, 0.12, 0.11, skin, 'skin', 10, 7);
  F.sph(0, 0.18, 0, 0.12, 0.11, 0.125, br, 'bronze', 12, 6, 0, TAU, 0, Math.PI * 0.55);
  F.cb(0, 0.13, -0.11, 0.24, 0.04, 0.08, br, 'bronze', -0.5, 0, 0);
  for (const s of [-1, 1]) F.cb(s * 0.11, 0.1, 0.05, 0.02, 0.11, 0.08, br, 'bronze');
  IZ.crest(F, 0, 0.3, 0, 0.34, 0.13, 'across');
  /* the horn and the arms that hold it, drawn at the lips */
  R.bone('blower_horn', 'blower_up', 0, 0.45, 0.0, 1.15, 0, 0);
  R.on('blower_horn');
  const M = [0, 0.27, 0.12], N = 12, P = [];
  for (let i = 0; i <= N; i++) { const p = castraHornPt(i / N); P.push([M[0] + p[0], M[1] + p[1], M[2] + p[2]]); }
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N, r = 0.016 + 0.05 * Math.pow(t, 1.7), col = t < 0.22 ? 0x5a4630 : t < 0.3 ? 0x9a8462 : 0xd8c49a;
    F.rod(P[i][0], P[i][1], P[i][2], P[i + 1][0], P[i + 1][1], P[i + 1][2], r, col, 'bone');
    if (i) F.knob(P[i][0], P[i][1], P[i][2], r * 1.01, col, 'bone');
  }
  const e = P[N], d = [e[0] - P[N - 1][0], e[1] - P[N - 1][1], e[2] - P[N - 1][2]];
  F.taper(e[0], e[1], e[2], d[0], d[1], d[2], 0.066, 0.1, 0.07, 0xcbb489, 'bone', 12);
  R.point('horn_bell', 'blower_horn', e[0] + d[0], e[1] + d[1], e[2] + d[2]);
  const hands = [[0.07, 0.25, 0.22], [-0.02, P[5][1] - 0.04, P[5][2]]];
  for (const s of [-1, 1]) {
    const h = hands[s > 0 ? 0 : 1], sh = [s * 0.21, 0, 0], el = [s * 0.27, -0.06, 0.16];
    F.rod(sh[0], sh[1], sh[2], el[0], el[1], el[2], 0.055, tunic, 'cloth');
    F.rod(el[0], el[1], el[2], h[0], h[1], h[2], 0.048, skin, 'skin');
    F.knob(h[0], h[1], h[2], 0.05, skin, 'skin');
  }
  R.point('stamp', 'body', 0, -3.55, 1.8);
}

/* ---- kits/mechs/krator-mechs-iziz-centurion.js ---- */
/* ======================================================================
   Iziz mech: the Centurion (kits/mechs/krator-mechs-iziz-centurion.js)

   An Ancient cargo loader, the commonest walker in the ruins: a stocky biped with the
   operator in the chest behind a barred glass front, big hands for lifting containers.
   The legions give it what a legionary carries: a scutum cut from a hatch door on the
   left forearm and a "cleaver", a length of girder ground to an edge, in the right hand.
   It fights in the line, shield up, and chops. A horsehair crest across its head housing,
   a legion's flag on a springy pole at its back, phalerae on its chest straps.
   ====================================================================== */
MECH({
  key: 'iz_centurion', name: 'Centurion', culture: 'iziz',
  role: 'line walker: shield and cleaver', origin: 'Ancient cargo loader',
  lore: 'The legions\' backbone. Its scutum was a cargo hatch, its cleaver a girder; the operator sits in the chest and sees the fight through bars.',
  tags: { class: 'mech', type: ['war machine', 'line'], drive: 'biped', crew: 1, pilot: 'chest', weapon: ['cleaver', 'shield'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['III Legion'],
  w: 4.4, d: 5.9, h: 7.1,
  data: { height: 5.5, mass: 14, crew: 1, pilot: 'chest', reach: 3.4, weapon: 'girder cleaver and hatch scutum',
    engine: 'Ancient cell pack, hydraulic', armour: 'salvaged hatch plate' },
  gait: { period: 1.9, duty: 0.62, stride: 1.25, lift: 0.32, bob: 0.07, sway: 0.09, roll: 0.035, twist: 0.07, lean: 0.04,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.1, 0, 0], arm_r_sh: [0.18, 0, 0] } },
  idle: { breathe: 0.03, scan: 0.12, look: 0.4 },
  attack: {
    kind: 'overhead chop', dur: 2.6,
    keys: [
      [0, {}],
      [0.75, { b: { torso: [-0.05, -0.35, 0], arm_r_sh: [-2.5, 0, -0.35], arm_r_el: [-0.6, 0, 0], arm_r_wr: [-0.5, 0, 0],
        arm_l_sh: [-0.7, 0.2, 0.1], arm_l_el: [-0.3, 0, 0], body: [-0.08, -0.12, 0] }, s: { body: [0, -0.12, -0.12] } }, 's'],
      [1.05, { b: { torso: [0.12, 0.3, 0], arm_r_sh: [-0.95, 0, -0.1], arm_r_el: [-0.15, 0, 0], arm_r_wr: [1.4, 0, 0],
        arm_l_sh: [-0.5, 0.3, 0.15], body: [0.2, 0.05, 0] }, s: { body: [0, -0.28, 0.3] } }, 'i'],
      [1.3, { b: { torso: [0.1, 0.26, 0], arm_r_sh: [-0.9, 0, -0.1], arm_r_el: [-0.18, 0, 0], arm_r_wr: [1.35, 0, 0],
        arm_l_sh: [-0.5, 0.3, 0.15], body: [0.18, 0.05, 0] }, s: { body: [0, -0.26, 0.28] } }, 'o'],
      [2.6, {}, 's']
    ],
    events: [{ t: 1.06, type: 'impact', at: 'blade_tip', r: 1.4 }]
  },

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream');

    /* ---- pelvis */
    R.bone('body', null, 0, 2.3, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.35, 0.55, 1.0, 0.14, dk, 'metal', 'z');
    F.chb(0, 0.04, 0.5, 0.9, 0.36, 0.08, 0.06, or, 'paint', 'z');
    IZ.phalera(F, 0, 0.04, 0.56, 0, 0, 1, 0.12);
    for (const s of [-1, 1]) MP.joint(F, s * 0.56, -0.12, 0, 0.31, 0.16, 'x', iron, null);
    /* pteruges: hanging plates round the front and sides */
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 0.24;
      F.cb(x, -0.42, 0.56, 0.21, 0.5, 0.04, i % 2 ? c('leather') : steel, i % 2 ? 'leather' : 'paint', 0.1, 0, 0);
      F.cb(x, -0.65, 0.58, 0.21, 0.05, 0.05, c('bronze'), 'bronze', 0.1, 0, 0);
    }
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) F.cb(s * 0.72, -0.4, -0.15 + i * 0.3, 0.04, 0.48, 0.26, i ? steel : c('leather'), i ? 'paint' : 'leather', 0, 0, s * 0.12);

    /* ---- torso: the cab in the chest */
    R.bone('torso', 'body', 0, 0.3, 0);
    R.on('torso');
    F.cy(0, 0.05, 0, 0.42, 0.42, 0.32, iron, 'metal', 'y', 12);
    F.chb(0, 1.0, -0.45, 1.9, 1.45, 0.6, 0.18, steel, 'paint', 'z');
    F.chb(0, 1.7, 0.02, 1.95, 0.22, 1.45, 0.1, gun, 'paint', 'x');
    F.cb(0, 1.6, 0.74, 1.6, 0.06, 0.04, cr, 'paint');
    F.chb(0, 0.32, 0.1, 1.6, 0.26, 1.2, 0.1, dk, 'metal', 'x');
    for (const s of [-1, 1]) {
      F.chb(s * 0.88, 1.0, 0.12, 0.3, 1.42, 1.25, 0.12, steel, 'paint', 'x');
      F.cb(s * 1.035, 1.0, 0.0, 0.02, 1.2, 0.62, or, 'paint');
      F.cb(s * 1.045, 1.0, 0.33, 0.02, 1.24, 0.06, cr, 'paint');
      F.cb(s * 1.045, 1.0, -0.33, 0.02, 1.24, 0.04, c('teal'), 'paint');
      IZ.phalerae(F, s * 0.88, 1.42, 0.76, 0, 0, 1, 3, 0.25, 0.09);
      F.cb(s * 0.88, 1.05, 0.745, 0.12, 0.95, 0.02, c('leather'), 'leather');
    }
    /* the cab: dark well, seat, levers, the pilot, glass and bars */
    F.cb(0, 1.0, -0.12, 1.5, 1.25, 0.04, gun, 'metal');
    F.cb(0, 0.42, 0.0, 0.6, 0.1, 0.55, c('leather'), 'leather');
    F.cb(0, 0.82, -0.26, 0.58, 0.75, 0.1, c('leather'), 'leather');
    for (const s of [-1, 1]) {
      F.rod(s * 0.2, 0.55, 0.42, s * 0.2, 0.8, 0.52, 0.02, iron, 'metal');
     
    }
    MP.pilot(F, R, 'torso', 0, 0.47, 0.0, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: c('bronze'), harness: c('leather'), crest: null });
    R.on('torso');
    F.cb(0, 1.06, 0.7, 1.46, 1.06, 0.03, c('glass'), 'glass', -0.1, 0, 0);
    for (const x of [-0.37, 0, 0.37]) F.cb(x, 1.06, 0.73, 0.05, 1.08, 0.06, iron, 'metal', -0.1, 0, 0);
    F.cb(0, 1.08, 0.735, 1.46, 0.05, 0.06, iron, 'metal', -0.1, 0, 0);
    F.chb(0, 0.52, 0.68, 1.44, 0.32, 0.14, 0.05, or, 'paint', 'x');
    IZ.numeral(F, 0, 0.52, 0.76, 'III', 0.17);
    /* the pack at the back: cell housing, vents, two exhaust stacks */
    F.chb(0, 1.0, -0.92, 1.4, 1.2, 0.5, 0.15, gun, 'metal', 'z');
    for (let i = 0; i < 5; i++) F.cb(0, 0.65 + i * 0.17, -1.18, 1.0, 0.05, 0.04, iron, 'metal');
    for (const s of [-1, 1]) {
      F.cy(s * 0.5, 1.9, -1.0, 0.11, 0.1, 0.9, c('copper'), 'copper', 'y', 10);
      F.cy(s * 0.5, 2.36, -1.0, 0.13, 0.13, 0.06, iron, 'metal', 'y', 10);
    }

    /* ---- the head housing: visor slit, a crest across */
    R.bone('head', 'torso', 0, 1.82, 0.12);
    R.on('head');
    F.chb(0, 0.17, 0, 0.78, 0.36, 0.72, 0.14, steel, 'paint', 'x');
    F.cb(0, 0.34, 0.0, 0.8, 0.04, 0.74, or, 'paint');
    F.cb(0, 0.2, 0.37, 0.52, 0.06, 0.02, c('eye'), 'glow');
    F.cb(0, 0.28, 0.36, 0.7, 0.06, 0.06, c('bronze'), 'bronze');
    F.cy(0, 0.0, 0, 0.2, 0.25, 0.12, iron, 'metal', 'y', 10);
    IZ.crest(F, 0, 0.37, 0.0, 1.2, 0.46, 'across');

    /* ---- arms */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.2, 1.3, -0.02, 0, 0, s * 0.12);
      R.on(A + '_sh');
      MP.joint(F, -s * 0.05, 0, 0, 0.27, 0.5, 'x', iron, c('bronze'));
      F.chb(s * 0.04, 0.12, 0, 0.78, 0.56, 0.98, 0.2, or, 'paint', 'z');
      F.cb(s * 0.04, -0.17, 0, 0.8, 0.06, 1.0, cr, 'paint');
      F.cb(s * 0.04, 0.42, 0, 0.6, 0.06, 0.8, c('bronze'), 'bronze');
      if (s > 0) IZ.sun(F, s * 0.44, 0.12, 0, 1, 0, 0, 0.24);
      else IZ.phalera(F, s * 0.44, 0.12, 0, -1, 0, 0, 0.16);
      F.chb(0, -0.52, 0, 0.42, 0.82, 0.46, 0.08, steel, 'paint', 'y');
      F.cb(s * 0.235, -0.48, 0, 0.05, 0.56, 0.34, or, 'paint');
      R.bone(A + '_el', A + '_sh', 0, -0.98, 0, -0.55, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.21, 0.6, 'x', iron, c('bronze'));
      F.chb(0, -0.46, 0.02, 0.52, 0.86, 0.54, 0.1, steel, 'paint', 'y');
      F.cb(0, -0.28, 0.02, 0.55, 0.22, 0.57, or, 'paint');
      F.cb(0, -0.15, 0.02, 0.56, 0.05, 0.58, cr, 'paint');
      F.cb(0, -0.82, 0.02, 0.46, 0.12, 0.48, dk, 'metal');
      R.bone(A + '_wr', A + '_el', 0, -0.95, 0, 0.55, 0, 0);
      R.on(A + '_wr');
      F.chb(0, -0.12, 0.02, 0.38, 0.32, 0.42, 0.06, dk, 'metal', 'x');
      for (let k = 0; k < 3; k++) F.cb(-0.12 + k * 0.12, -0.3, 0.14, 0.1, 0.16, 0.12, gun, 'metal', 0.4, 0, 0);
      F.cb(s * 0.17, -0.26, 0.06, 0.08, 0.16, 0.12, gun, 'metal', 0, 0, s * 0.4);
      MP.hose(F, R, 'torso', [s * 0.72, 1.45, -0.65], A + '_sh', [0, -0.25, -0.24], 0.045, c('rubber'), 0.15);
      MP.piston(F, R, A + '_sh', [0, -0.35, 0.24], A + '_el', [0, -0.3, 0.28], 0.05, dk, c('chrome'));
    }
    /* the cleaver in the right hand: a girder ground to an edge */
    R.on('arm_r_wr');
    F.cy(0, -0.2, 0.0, 0.065, 0.065, 0.62, c('leather'), 'leather', 'z', 8);
    F.knob(0, -0.2, -0.33, 0.09, c('bronze'), 'bronze');
    F.cb(0, -0.2, 0.32, 0.12, 0.42, 0.08, c('bronze'), 'bronze');
    const bl = [[0.36, 0.1], [2.15, 0.1], [2.42, -0.2], [2.28, -0.62], [0.36, -0.52]];
    F.prism(0, -0.2, 0, bl, 0.09, steel, 'metal', 'x', 0.18, 0, 0);
    F.prism(0, -0.2, 0, [[0.34, 0.125], [2.17, 0.125], [2.2, 0.03], [0.34, 0.03]], 0.14, c('bronze'), 'bronze', 'x', 0.18, 0, 0);
    F.prism(0, -0.2, 0, [[0.36, -0.46], [2.3, -0.56], [2.28, -0.63], [0.36, -0.53]], 0.05, c('chrome'), 'chrome', 'x', 0.18, 0, 0);
    for (let i = 0; i < 4; i++) {
      const zz = 0.75 + i * 0.4;
      F.disc(0, -0.2 + Math.cos(0.18) * -0.2 - Math.sin(0.18) * zz, Math.cos(0.18) * zz + Math.sin(0.18) * -0.2, 1, 0, 0, 0.09, 0.1, iron, 'metal', 10);
    }
    R.point('blade_tip', 'arm_r_wr', 0, -0.2 - Math.sin(0.18) * 2.4 - 0.3, Math.cos(0.18) * 2.4);
    /* the scutum on the left forearm */
    R.on('arm_l_wr');
    F.cb(0.0, 0.25, 0.25, 0.12, 0.5, 0.3, dk, 'metal');
    IZ.scutum(F, 0.05, 0.32, 0.48, 1.08, 1.6, 1.4);

    /* ---- legs */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.62, -0.14, 0], L1: 1.05, L2: 1.0, knee: 1, ankleH: 0.44, rest: [s * 0.74, 0.05], phase: s > 0 ? 0 : 0.5 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.25, 0.44, 'x', iron, c('bronze'));
      F.chb(0, -0.52, 0, 0.5, 0.9, 0.56, 0.1, steel, 'paint', 'y');
      F.chb(0, -0.42, 0.3, 0.46, 0.62, 0.08, 0.04, or, 'paint', 'x');
      F.cb(s * 0.27, -0.5, 0, 0.05, 0.6, 0.4, c('teal'), 'paint');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.23, 0.64, 'x', iron, c('bronze'));
      F.chb(0, 0.04, 0.27, 0.42, 0.36, 0.14, 0.06, c('bronze'), 'bronze', 'x');
      F.chb(0, -0.5, 0.0, 0.58, 0.96, 0.62, 0.12, dk, 'paint', 'y');
      F.chb(0, -0.42, 0.29, 0.46, 0.78, 0.1, 0.05, or, 'paint', 'x');
      F.cb(0, -0.42, 0.345, 0.1, 0.74, 0.03, cr, 'paint');
      F.cb(0, -0.92, 0, 0.5, 0.14, 0.52, dk, 'metal');
      MP.piston(F, R, Lg + '_hip', [0, -0.25, -0.3], Lg + '_knee', [0, -0.4, -0.33], 0.06, dk, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'stomp', w: 0.72, l: 1.08, ankleH: 0.44, plate: steel, iron: gun, trim: c('bronze'), toes: 3 });
    }

    /* ---- dressing: the legion's flag at the back, feathers at the pauldrons */
    IZ.sashimono(F, R, 'sashi', 'torso', 0.62, 1.45, -1.22, { h: 2.7, w: 0.62, bh: 1.75, paint: IZ.paint(F, 'legion', { numeral: 'III' }), side: -1 });
    R.on('torso');
    F.cb(0.6, 1.4, -1.2, 0.16, 0.3, 0.16, iron, 'metal');
    IZ.feathers(F, R, 'fth_l', 'arm_l_sh', 0.42, -0.18, 0.42, { n: 5, len: 0.55 });
    IZ.feathers(F, R, 'fth_r', 'arm_r_sh', -0.42, -0.18, 0.42, { n: 5, len: 0.55, cols: ['fGold', 'fScarlet', 'fBlack', 'fWhite'] });
  }
});

/* ---- kits/mechs/krator-mechs-iziz-fabrica.js ---- */
/* ======================================================================
   Iziz mech: the Forge-Warden (kits/mechs/krator-mechs-iziz-fabrica.js)

   An Ancient riveting walker from a shipyard: a round-chested biped with copper
   boilers across its shoulders, the operator sat in the chest behind a cage of bronze
   bars, a pneumatic riveting gun for a left arm and a hammer fist for a right. The
   Forgemasters keep these for themselves: it heats rivets in the gun's coil and drives
   them, glowing, into whatever stands in front of it. Cream pads painted with the sun,
   orange bands, a whip aerial, feathers at the boilers.
   ====================================================================== */
MECH({
  key: 'iz_fabrica', name: 'Forge-Warden', culture: 'iziz',
  role: 'Forgemasters\' walker: rivet gun and hammer', origin: 'Ancient shipyard riveting walker',
  lore: 'The Forgemasters keep these for their own halls. It heats rivets in the gun\'s coil and drives them glowing into a shield wall; the operator sits behind bronze bars.',
  tags: { class: 'mech', type: ['war machine', 'industrial'], drive: 'biped', crew: 1, pilot: 'chest', weapon: ['rivet gun', 'fist'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Hall Warden'],
  w: 3.7, d: 2.8, h: 6.4,
  data: { height: 5.2, mass: 16, crew: 1, pilot: 'chest', reach: 30, weapon: 'pneumatic rivet gun (heated slugs) and hammer fist',
    engine: 'twin boilers and Ancient cell', armour: 'riveted ship plate' },
  gait: { period: 1.8, duty: 0.62, stride: 1.15, lift: 0.3, bob: 0.065, sway: 0.09, roll: 0.04, twist: 0.06, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.08, 0, 0], arm_r_sh: [0.2, 0, 0] } },
  idle: { breathe: 0.03, scan: 0.14, look: 0.3 },
  attack: (function () {
    const aim = { b: { arm_l_sh: [-0.62, 0, 0.1], arm_l_el: [-0.4, 0, 0], torso: [0, -0.25, 0], arm_r_sh: [-0.3, 0, -0.1], arm_r_el: [-0.6, 0, 0], body: [0.04, 0, 0] },
      s: { body: [0, -0.16, 0] } };
    const kick = { b: { arm_l_sh: [-0.66, 0, 0.1], arm_l_el: [-0.6, 0, 0], torso: [-0.03, -0.2, 0], arm_r_sh: [-0.3, 0, -0.1], arm_r_el: [-0.6, 0, 0], body: [0.0, 0, 0] },
      s: { body: [0, -0.14, -0.08] } };
    const keys = [[0, {}], [0.55, aim, 's']];
    for (const t of [0.85, 1.15, 1.45]) keys.push([t - 0.01, aim, 's'], [t + 0.04, kick, 'o'], [t + 0.18, aim, 's']);
    keys.push([2.6, {}, 's']);
    return { kind: 'rivet volley', dur: 2.6, keys: keys,
      events: [0.85, 1.15, 1.45].map(function (t) { return { t: t, type: 'fire', kind: 'rivet', at: 'muzzle', dir: [0, -1, 0], speed: 42 }; }) };
  })(),

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze'), cu = c('copper');

    /* ---- hips */
    R.bone('body', null, 0, 2.05, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.3, 0.52, 0.95, 0.14, gun, 'metal', 'z');
    F.chb(0, 0.02, 0.48, 0.8, 0.34, 0.08, 0.05, or, 'paint', 'x');
    IZ.phalera(F, 0, 0.02, 0.53, 0, 0, 1, 0.11);
    for (const s of [-1, 1]) MP.joint(F, s * 0.56, -0.1, 0, 0.31, 0.16, 'x', iron, null);

    /* ---- the round chest with its caged window */
    R.bone('torso', 'body', 0, 0.3, 0);
    R.on('torso');
    F.cy(0, 0.05, 0, 0.4, 0.4, 0.3, iron, 'metal', 'y', 12);
    const W0 = Math.PI / 2 - 0.72, WD = 1.44, T0 = 0.62, TD = 1.1, cy = 1.05;
    F.sph(0, cy, 0, 1.0, 0.95, 0.85, steel, 'paint', 18, 12, W0 + WD, TAU - WD, 0, Math.PI);
    F.sph(0, cy, 0, 1.0, 0.95, 0.85, steel, 'paint', 6, 3, W0, WD, 0, T0);
    F.sph(0, cy, 0, 1.0, 0.95, 0.85, steel, 'paint', 6, 4, W0, WD, T0 + TD, Math.PI - T0 - TD);
    F.sphIn(0, cy, 0, 0.97, 0.92, 0.82, gun, 'metal', 10, 8, W0 - 0.3, WD + 0.6, T0 - 0.2, TD + 0.4);
    MP.cage(F, 0, cy, 0, 1.02, 0.97, 0.87, W0, WD, T0, TD, 4, 3, 0.032, br, 'bronze');
    /* livery: an orange bib under the window, cream bands round the chest */
    F.sph(0, cy, 0, 1.015, 0.965, 0.865, or, 'paint', 8, 3, W0 - 0.15, WD + 0.3, T0 + TD + 0.06, 0.42);
    F.tor(0, cy - 0.62, 0, 0.78, 0.04, cr, 'paint', 'y', 20);
    F.cy(0, 0.3, 0.05, 0.72, 0.62, 0.3, dk, 'metal', 'y', 14);
    MP.pilot(F, R, 'torso', 0, 0.62, 0.05, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: c('crimson') });
    R.on('torso');
    F.cb(0, 0.57, 0.02, 0.55, 0.1, 0.5, c('leather'), 'leather');
    for (const s of [-1, 1]) { F.rod(s * 0.2, 0.7, 0.42, s * 0.2, 0.95, 0.5, 0.02, iron, 'metal'); }
    /* the boilers on the shoulders, pipes into the chest, a whip aerial */
    for (const s of [-1, 1]) {
      MP.tank(F, s * 0.98, 1.78, -0.3, 0.32, 1.0, 'x', cu, iron, 3, 'copper');
      F.cy(s * 1.52, 1.78, -0.3, 0.1, 0.1, 0.1, br, 'bronze', 'x', 10);
      F.tube([[s * 0.7, 1.5, -0.3], [s * 0.55, 1.35, -0.05], [s * 0.42, 1.55, 0.25]], 0.045, cu, 'copper');
      F.cb(s * 0.98, 1.43, -0.3, 0.7, 0.1, 0.3, iron, 'metal');
      IZ.feathers(F, R, s > 0 ? 'fth_l' : 'fth_r', 'torso', s * 1.55, 1.62, -0.3, { n: 5, len: 0.5, cols: s > 0 ? ['fScarlet', 'fGold', 'fBlack'] : ['fTeal', 'fGreen', 'fWhite'] });
      R.on('torso');
    }
    R.dangle('aerial', 'torso', -0.5, 1.9, -0.62, { mode: 'whip', len: 2.0, k: 26, c: 2, wind: 0.02, max: 0.45 });
    R.on('aerial');
    F.cy(0, 0.1, 0, 0.06, 0.06, 0.2, iron, 'metal', 'y', 8);
    for (let k = 0; k < 6; k++) F.tor(0, 0.24 + k * 0.035, 0, 0.045, 0.01, br, 'bronze', 'y', 8);
    F.rod(0, 0.2, 0, 0, 2.0, 0, 0.013, iron, 'metal');
    F.knob(0, 2.0, 0, 0.035, c('lensRed'), 'lampTail');
    R.banner({ bone: 'aerial', kind: 'pennant', x: 0, y: 1.9, z: 0, w: 0.8, h: 0.24, paint: IZ.paint(F, 'stripes') });
    /* the head: a small turret over the cage, an amber eye, a crest */
    R.bone('head', 'torso', 0, 1.95, 0.12);
    R.on('head');
    F.cy(0, 0.0, 0, 0.22, 0.26, 0.14, iron, 'metal', 'y', 10);
    F.chb(0, 0.17, 0, 0.56, 0.26, 0.5, 0.1, steel, 'paint', 'x');
    F.cb(0, 0.3, 0, 0.58, 0.04, 0.52, or, 'paint');
    MP.lamp(F, 0, 0.17, 0.27, 0, 0, 1, 0.07, 'amber', gun);
    IZ.crest(F, 0, 0.33, -0.02, 0.8, 0.3, 'across');

    /* ---- arms */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.12, 1.2, 0.05, 0, 0, s * 0.12);
      R.on(A + '_sh');
      MP.joint(F, -s * 0.08, 0, 0, 0.27, 0.42, 'x', iron, br);
      F.chb(s * 0.06, 0.05, 0, 0.66, 0.5, 0.86, 0.2, cr, 'paint', 'z');
      F.cb(s * 0.06, -0.22, 0, 0.68, 0.06, 0.88, or, 'paint');
      IZ.sun(F, s * 0.4, 0.06, 0, s, 0, 0, 0.18, c('red'), c('red'));
      F.chb(0, -0.5, 0, 0.42, 0.75, 0.46, 0.08, steel, 'paint', 'y');
      R.bone(A + '_el', A + '_sh', 0, -0.92, 0, -0.55, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.22, 0.5, 'x', iron, br);
      MP.piston(F, R, A + '_sh', [0, -0.3, 0.25], A + '_el', [0, -0.3, 0.3], 0.05, dk, c('chrome'));
      MP.hose(F, R, 'torso', [s * 0.75, 1.5, -0.5], A + '_sh', [0, -0.3, -0.24], 0.045, c('rubber'), 0.18);
    }
    /* the rivet gun (left): body, copper bands, the heating coil, feed drum, a crowned muzzle */
    R.on('arm_l_el');
    F.cy(0, -0.45, 0.08, 0.36, 0.36, 0.9, gun, 'metal', 'y', 14);
    for (const y of [-0.15, -0.55]) F.cy(0, y, 0.08, 0.385, 0.385, 0.08, cu, 'copper', 'y', 14);
    F.cy(0, -0.36, 0.08, 0.38, 0.38, 0.16, or, 'paint', 'y', 14);
    F.cy(0, -1.02, 0.08, 0.17, 0.17, 0.42, iron, 'metal', 'y', 12);
    for (let k = 0; k < 5; k++) F.tor(0, -0.88 - k * 0.06, 0.08, 0.2, 0.025, c('lensAmber'), 'lampAmber', 'y', 12);
    F.cy(0, -1.26, 0.08, 0.24, 0.24, 0.1, br, 'bronze', 'y', 12);
    for (let k = 0; k < 6; k++) {
      const a = k * TAU / 6;
      F.cy(Math.cos(a) * 0.22, -1.34, 0.08 + Math.sin(a) * 0.22, 0.045, 0.004, 0.22, br, 'bronze', 'y', 5, Math.sin(a) * -0.6, 0, Math.cos(a) * 0.6);
    }
    F.cy(0.0, -0.4, 0.52, 0.2, 0.2, 0.36, dk, 'metal', 'x', 12);
    F.cy(0.0, -0.4, 0.52, 0.21, 0.21, 0.06, cu, 'copper', 'x', 12);
    R.point('muzzle', 'arm_l_el', 0, -1.42, 0.08);
    /* the hammer fist (right) */
    R.on('arm_r_el');
    F.chb(0, -0.45, 0.02, 0.5, 0.82, 0.52, 0.1, steel, 'paint', 'y');
    F.cb(0, -0.3, 0.02, 0.53, 0.2, 0.55, or, 'paint');
    R.bone('arm_r_wr', 'arm_r_el', 0, -0.92, 0.02, 0.45, 0, 0);
    R.on('arm_r_wr');
    F.chb(0, -0.28, 0.06, 0.6, 0.52, 0.62, 0.12, dk, 'metal', 'x');
    for (let k = 0; k < 4; k++) F.cy(-0.21 + k * 0.14, -0.5, 0.3, 0.075, 0.075, 0.12, br, 'bronze', 'x', 8);
    F.chb(0.33, -0.25, 0.18, 0.12, 0.3, 0.2, 0.04, gun, 'metal', 'y');

    /* ---- legs */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.62, -0.12, 0], L1: 0.95, L2: 0.92, knee: 1, ankleH: 0.42, rest: [s * 0.72, 0.05], phase: s > 0 ? 0 : 0.5 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.24, 0.44, 'x', iron, br);
      F.chb(0, -0.47, 0, 0.5, 0.84, 0.56, 0.1, steel, 'paint', 'y');
      F.cb(s * 0.27, -0.45, 0, 0.05, 0.55, 0.36, or, 'paint');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.22, 0.5, 'x', iron, br);
      F.chb(0, 0.02, 0.28, 0.5, 0.42, 0.16, 0.08, cr, 'paint', 'x');
      F.chb(0, -0.48, 0, 0.56, 0.86, 0.6, 0.12, dk, 'paint', 'y');
      F.chb(0, -0.45, 0.3, 0.42, 0.62, 0.06, 0.03, or, 'paint', 'x');
      MP.piston(F, R, Lg + '_hip', [0, -0.25, -0.3], Lg + '_knee', [0, -0.35, -0.33], 0.055, dk, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'stomp', w: 0.7, l: 1.0, ankleH: 0.42, plate: steel, iron: gun, trim: br, toes: 3 });
    }
  }
});

/* ---- kits/mechs/krator-mechs-iziz-forfex.js ---- */
/* ======================================================================
   Iziz mech: the Forfex (kits/mechs/krator-mechs-iziz-forfex.js)

   An Ancient scrap-shear walker from the breakers' yards: a hunched hull on two
   reverse-jointed legs, the operator in a glass nose, and under the chin a pair of
   hydraulic jaws made to cut hull plate. The legions run it in at a lope ahead of the
   line; it takes a gate, a palisade or a man in one bite. Antennas and two thin flags
   at its back, a crest along its spine, feathers hanging off the jaw housing.
   ====================================================================== */
MECH({
  key: 'iz_forfex', name: 'Forfex', culture: 'iziz',
  role: 'shock walker: shears', origin: 'Ancient scrap-shear walker',
  lore: 'Built to cut hull plate in the breakers\' yards. It lopes ahead of the line and bites through gates; the operator rides in the glass nose.',
  tags: { class: 'mech', type: ['war machine', 'scout'], drive: 'digitigrade', crew: 1, pilot: 'head', weapon: ['shears'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Breaker'],
  w: 2.6, d: 5.8, h: 5.6,
  data: { height: 4.4, mass: 11, crew: 1, pilot: 'head', reach: 2.4, weapon: 'hydraulic scrap shears',
    engine: 'Ancient cell pack, hydraulic', armour: 'salvaged hull plate' },
  gait: { period: 1.55, duty: 0.58, stride: 1.35, lift: 0.42, bob: 0.06, sway: 0.07, roll: 0.03, twist: 0.05, lean: 0.02, offsets: [0, 0.5] },
  idle: { breathe: 0.035, scan: 0, look: 0 },
  anim: {
    idle: function (P, t, w) {
      const o = Math.max(0, Math.sin(t * 0.9) * Math.sin(t * 0.37)) * 0.14 * w;
      P.b.jaw_l = [0, o, 0]; P.b.jaw_r = [0, -o, 0];
      P.b.body = P.b.body || [0, 0, 0]; P.b.body[1] += 0.08 * Math.sin(t * 0.21) * w;
    }
  },
  attack: {
    kind: 'lunge and bite', dur: 2.2,
    keys: [
      [0, {}],
      [0.55, { b: { body: [-0.16, 0, 0], shear: [-0.35, 0, 0], jaw_l: [0, 0.5, 0], jaw_r: [0, -0.5, 0] }, s: { body: [0, 0.04, -0.28] } }, 's'],
      [0.85, { b: { body: [0.24, 0, 0], shear: [0.2, 0, 0], jaw_l: [0, 0.55, 0], jaw_r: [0, -0.55, 0] }, s: { body: [0, -0.3, 0.5] } }, 'i'],
      [0.98, { b: { body: [0.26, 0, 0], shear: [0.25, 0, 0], jaw_l: [0, -0.07, 0], jaw_r: [0, 0.07, 0] }, s: { body: [0, -0.32, 0.52] } }, 'i'],
      [1.35, { b: { body: [0.12, 0.12, 0], shear: [0.05, 0.1, 0], jaw_l: [0, -0.07, 0], jaw_r: [0, 0.07, 0] }, s: { body: [0, -0.18, 0.3] } }, 'o'],
      [2.2, {}, 's']
    ],
    events: [{ t: 0.98, type: 'impact', at: 'jaw_tip', r: 1.0 }]
  },

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream');

    /* ---- the hull, its glass nose, the operator */
    R.bone('body', null, 0, 2.55, 0);
    R.on('body');
    F.chb(0, 0.25, 0.0, 1.6, 1.15, 2.3, 0.32, steel, 'paint', 'z');
    F.chb(0, 0.02, 1.2, 1.22, 0.78, 0.55, 0.22, dk, 'metal', 'z', 0.3, 0, 0);
    F.chb(0, -0.32, 0.1, 1.2, 0.3, 1.8, 0.1, gun, 'metal', 'z');
    for (const s of [-1, 1]) {
      F.chb(s * 0.82, 0.32, 0.05, 0.08, 0.78, 1.75, 0.04, or, 'paint', 'x');
      F.cb(s * 0.86, -0.1, 0.05, 0.03, 0.07, 1.72, cr, 'paint');
      F.cb(s * 0.86, -0.17, 0.05, 0.03, 0.04, 1.74, c('teal'), 'paint');
      IZ.sun(F, s * 0.88, 0.36, 0.25, s, 0, 0, 0.27);
      IZ.phalera(F, s * 0.87, 0.36, -0.55, s, 0, 0, 0.12);
      MP.lamp(F, s * 0.42, 0.18, 1.5, s * 0.25, 0, 1, 0.07, 'amber', gun);
    }
    MP.lamp(F, 0, 0.32, 1.45, 0, -0.1, 1, 0.13, 'head', gun);
    F.sph(0, 0.78, 0.5, 0.64, 0.86, 0.8, c('glass'), 'glass', 16, 10, 0, TAU, 0, Math.PI / 2);
    MP.cage(F, 0, 0.78, 0.5, 0.65, 0.87, 0.81, 0, TAU, 0, Math.PI / 2, 6, 2, 0.022, iron);
    F.tor(0, 0.79, 0.5, 0.66, 0.05, gun, 'metal', 'y', 18);
    F.cb(0, 0.66, 0.45, 0.6, 0.06, 0.6, gun, 'metal');
    for (const s of [-1, 1]) F.rod(s * 0.18, 0.7, 0.75, s * 0.18, 0.95, 0.9, 0.02, iron, 'metal');
    MP.pilot(F, R, 'body', 0, 0.48, 0.38, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: c('bronze'), harness: c('leather'),
      crest: c('crimson'), crestDir: 'along', lean: 0.15 });
    R.on('body');
    /* the back: cell housing, exhausts, crest along the spine */
    F.chb(0, 0.35, -1.25, 1.25, 0.95, 0.65, 0.22, gun, 'metal', 'z');
    for (let i = 0; i < 4; i++) F.cb(0, 0.1 + i * 0.16, -1.58, 0.9, 0.05, 0.04, iron, 'metal');
    for (const s of [-1, 1]) {
      F.rod(s * 0.42, 0.7, -1.3, s * 0.48, 1.15, -1.55, 0.08, c('copper'), 'copper');
      F.cy(s * 0.48, 1.18, -1.56, 0.1, 0.1, 0.08, iron, 'metal', 'y', 8);
    }
    IZ.crest(F, 0, 0.86, -0.45, 1.1, 0.38, 'along');
    /* ---- the jaws under the chin */
    R.bone('shear', 'body', 0, -0.38, 1.12, 0.15, 0, 0);
    R.on('shear');
    F.chb(0, 0, 0.0, 0.62, 0.46, 0.72, 0.12, gun, 'metal', 'z');
    F.chb(0, 0.12, 0.05, 0.66, 0.12, 0.6, 0.04, or, 'paint', 'z');
    MP.joint(F, 0, 0, 0.3, 0.12, 0.66, 'y', iron, c('bronze'));
    R.point('jaw_tip', 'shear', 0, -0.05, 1.7);
    for (const s of [-1, 1]) {
      const J = s > 0 ? 'jaw_l' : 'jaw_r';
      R.bone(J, 'shear', s * 0.15, 0, 0.3);
      R.on(J);
      const out = [[0.0, -0.12], [0.17, 0.2], [0.18, 0.85], [0.07, 1.32], [-0.1, 1.45], [-0.06, 1.12], [-0.03, 0.6], [-0.05, 0.12]];
      F.prism(0, 0, 0, out.map(function (p) { return [s * p[0], p[1]]; }), 0.14, steel, 'metal', 'y');
      F.prism(0, 0.085, 0, [[0.02, 0.1], [0.15, 0.25], [0.15, 0.8], [0.04, 0.9]].map(function (p) { return [s * p[0], p[1]]; }), 0.03, or, 'paint', 'y');
      for (let k = 0; k < 4; k++) F.cy(s * -0.09, 0, 0.35 + k * 0.22, s > 0 ? 0.003 : 0.035, s > 0 ? 0.035 : 0.003, 0.12, c('chrome'), 'chrome', 'x', 5);
      MP.piston(F, R, 'shear', [s * 0.25, 0.0, -0.25], J, [s * 0.16, 0, 0.35], 0.045, dk, c('chrome'));
    }
    for (const s of [-1, 1]) MP.piston(F, R, 'body', [s * 0.3, -0.3, 0.55], 'shear', [s * 0.22, 0.12, -0.12], 0.06, dk, c('chrome'));
    IZ.feathers(F, R, 'fth_l', 'shear', 0.33, -0.1, 0.2, { n: 4, len: 0.45, cols: ['fScarlet', 'fGold', 'fBlack'] });
    IZ.feathers(F, R, 'fth_r', 'shear', -0.33, -0.1, 0.2, { n: 4, len: 0.45, cols: ['fGreen', 'fTeal', 'fGold'] });

    /* ---- legs: reverse-jointed, claw feet */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.74, -0.22, -0.42], L1: 1.25, L2: 1.35, knee: -1, ankleH: 0.36, rest: [s * 0.84, -0.12], phase: s > 0 ? 0 : 0.5, toe: 0.35 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.32, 0.5, 'x', iron, c('bronze'));
      F.chb(0, -0.55, 0, 0.5, 1.0, 0.64, 0.12, steel, 'paint', 'y');
      F.chb(s * 0.27, -0.5, 0.02, 0.06, 0.8, 0.5, 0.03, or, 'paint', 'y');
      F.cb(s * 0.305, -0.5, 0.02, 0.02, 0.84, 0.06, cr, 'paint');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.22, 0.48, 'x', iron, c('bronze'));
      F.chb(0, -0.66, 0, 0.36, 1.2, 0.42, 0.09, dk, 'paint', 'y');
      F.chb(0, -0.45, 0.22, 0.3, 0.7, 0.06, 0.03, or, 'paint', 'x');
      MP.piston(F, R, Lg + '_hip', [0, -0.3, 0.32], Lg + '_knee', [0, -0.3, 0.26], 0.06, dk, c('chrome'));
      MP.piston(F, R, Lg + '_knee', [0, -0.15, -0.24], Lg + '_ankle', [0, 0.2, -0.2], 0.045, dk, c('chrome'));
      MP.hose(F, R, 'body', [s * 0.6, -0.2, -0.75], Lg + '_knee', [s * 0.18, -0.2, -0.2], 0.04, c('rubber'), 0.2);
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'claw', w: 0.7, l: 1.05, ankleH: 0.36, plate: dk, iron: gun, trim: c('bronze'), toes: 3 });
    }

    /* ---- antennas and flags at the back */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'ant_l' : 'ant_r';
      R.dangle(A, 'body', s * 0.55, 0.82, -1.45, { mode: 'whip', len: 1.7, k: 30, c: 2.2, wind: 0.02, max: 0.45 });
      R.on(A);
      F.cy(0, 0.05, 0, 0.05, 0.05, 0.1, iron, 'metal', 'y', 8);
      F.rod(0, 0, 0, 0, 1.7, 0, 0.014, iron, 'metal');
      F.knob(0, 1.7, 0, 0.03, c('lensRed'), 'lampTail');
      if (s > 0) R.banner({ bone: A, kind: 'pennant', x: 0, y: 1.55, z: 0, w: 0.7, h: 0.26, paint: IZ.paint(F, 'stripes') });
    }
    IZ.sashimono(F, R, 'sashi_l', 'body', 0.32, 0.86, -1.0, { h: 1.8, w: 0.38, bh: 1.05, side: 1, paint: IZ.paint(F, 'teal') });
    IZ.sashimono(F, R, 'sashi_r', 'body', -0.32, 0.86, -1.0, { h: 1.8, w: 0.38, bh: 1.05, side: -1, paint: IZ.paint(F, 'sun') });
  }
});

/* ---- kits/mechs/krator-mechs-iziz-fossor.js ---- */
/* ======================================================================
   Iziz mech: the Fossor (kits/mechs/krator-mechs-iziz-fossor.js)

   An Ancient excavating walker: a broad biped on tracked shoes, the operator in an
   amber-glazed cab in the chest, floodlamps and a beacon on its head, an auger for a
   right arm and a digging grab for a left. The legions use it to mine walls and to
   dig the camp's ditch at night; in a fight it bores through a shield wall and grabs
   what is left. Hazard bands in orange and black, a legion flag at its back.
   ====================================================================== */
MECH({
  key: 'iz_fossor', name: 'Fossor', culture: 'iziz',
  role: 'sapper: auger and grab', origin: 'Ancient excavating walker',
  lore: 'It dug foundations for the Ancients. The legions use it to mine walls and dig the camp ditch by floodlight; in the line it bores into the shields and grabs.',
  tags: { class: 'mech', type: ['war machine', 'siege', 'industrial'], drive: 'biped', crew: 1, pilot: 'chest', weapon: ['auger', 'claw'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Sapper'],
  w: 3.6, d: 2.7, h: 6.8,
  data: { height: 5.3, mass: 18, crew: 1, pilot: 'chest', reach: 3.0, weapon: 'rock auger and digging grab',
    engine: 'Ancient cell pack, hydraulic', armour: 'excavator plate' },
  gait: { period: 2.0, duty: 0.64, stride: 1.1, lift: 0.26, bob: 0.06, sway: 0.1, roll: 0.04, twist: 0.05, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.12, 0, 0], arm_r_sh: [0.12, 0, 0] } },
  idle: { breathe: 0.03, scan: 0.1, look: 0.45 },
  anim: {
    idle: function (P, t, w) {
      const o = (0.5 + 0.5 * Math.sin(t * 0.6)) * 0.2 * w;
      P.b.claw_a = [-o, 0, 0]; P.b.claw_b = [o, 0, 0];
    }
  },
  attack: {
    kind: 'auger thrust', dur: 2.9,
    keys: [
      [0, {}],
      [0.6, { b: { torso: [-0.04, -0.32, 0], arm_r_sh: [-0.75, 0, -0.05], arm_r_el: [-0.75, 0, 0], arm_l_sh: [-0.6, 0, 0.15], claw_a: [-0.55, 0, 0], claw_b: [0.55, 0, 0], body: [-0.05, 0, 0] },
        s: { body: [0, -0.06, -0.15] } }, 's'],
      [1.0, { b: { torso: [0.08, 0.25, 0], arm_r_sh: [-1.12, 0, 0.05], arm_r_el: [0.02, 0, 0], arm_l_sh: [-0.85, 0, 0.1], claw_a: [-0.55, 0, 0], claw_b: [0.55, 0, 0], body: [0.15, 0, 0] },
        s: { body: [0, -0.18, 0.38] } }, 'i'],
      [1.2, { b: { torso: [0.08, 0.28, 0], arm_r_sh: [-1.1, 0, 0.05], arm_r_el: [0.0, 0, 0], arm_l_sh: [-0.85, 0, 0.1], claw_a: [0.2, 0, 0], claw_b: [-0.2, 0, 0], body: [0.16, 0, 0] },
        s: { body: [0, -0.2, 0.42] } }, 'o'],
      [1.4, { b: { torso: [0.1, 0.22, 0], arm_r_sh: [-1.16, 0, 0.05], arm_r_el: [0.06, 0, 0], arm_l_sh: [-0.8, 0, 0.1], claw_a: [0.2, 0, 0], claw_b: [-0.2, 0, 0], body: [0.17, 0, 0] },
        s: { body: [0, -0.2, 0.46] } }, 's'],
      [1.75, { b: { torso: [0.08, 0.25, 0], arm_r_sh: [-1.1, 0, 0.05], arm_r_el: [0.0, 0, 0], arm_l_sh: [-0.8, 0, 0.1], claw_a: [0.2, 0, 0], claw_b: [-0.2, 0, 0], body: [0.15, 0, 0] },
        s: { body: [0, -0.18, 0.4] } }, 's'],
      [2.9, {}, 's']
    ],
    events: [{ t: 1.02, type: 'impact', at: 'drill_tip', r: 0.9 }, { t: 1.42, type: 'impact', at: 'drill_tip', r: 1.2 }]
  },

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze'), hz = c('hazard');

    R.bone('body', null, 0, 2.2, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.4, 0.55, 1.0, 0.14, gun, 'metal', 'z');
    F.cb(0, 0, 0.51, 1.2, 0.3, 0.04, dk, 'metal');
    F.bands(0, 0, 0.535, 1.18, 0.28, Math.PI / 4, 0.13, [or, hz], 'paint');
    for (const s of [-1, 1]) MP.joint(F, s * 0.57, -0.1, 0, 0.32, 0.16, 'x', iron, null);

    /* ---- the chest: an amber-glazed cab in a steel frame */
    R.bone('torso', 'body', 0, 0.3, 0);
    R.on('torso');
    F.cy(0, 0.05, 0, 0.42, 0.42, 0.3, iron, 'metal', 'y', 12);
    F.chb(0, 1.0, -0.42, 2.0, 1.55, 0.7, 0.16, steel, 'paint', 'z');
    F.chb(0, 0.32, 0.12, 1.75, 0.28, 1.25, 0.1, dk, 'metal', 'x');
    F.chb(0, 1.72, 0.1, 1.95, 0.18, 1.35, 0.08, or, 'paint', 'x');
    F.cb(0, 1.62, 0.79, 1.9, 0.05, 0.04, hz, 'paint');
    for (const s of [-1, 1]) {
      F.chb(s * 0.9, 1.0, 0.18, 0.2, 1.42, 1.15, 0.06, steel, 'paint', 'x');
      F.cb(s * 1.0, 1.0, 0.18, 0.02, 1.25, 0.9, dk, 'metal');
      F.bands(s * 1.019, 0.55, 0.18, 0.88, 0.3, Math.PI / 4, 0.12, [or, hz], 'paint', 0, s * Math.PI / 2, 0);
      F.cb(s * 0.62, 1.04, 0.73, 0.08, 1.1, 0.08, iron, 'metal', -0.12, 0, 0);
    }
    /* glazing: front tilted back, the sides */
    F.cb(0, 1.04, 0.72, 1.18, 1.08, 0.03, c('glassAmber'), 'glass', -0.12, 0, 0);
    for (const s of [-1, 1]) F.cb(s * 0.78, 1.15, 0.45, 0.03, 0.7, 0.55, c('glassAmber'), 'glass');
    F.cb(0, 1.02, -0.06, 1.5, 1.2, 0.04, gun, 'metal');
    F.cb(0, 0.46, 0.05, 0.6, 0.1, 0.55, c('leather'), 'leather');
    F.cb(0, 0.82, -0.2, 0.58, 0.7, 0.1, c('leather'), 'leather');
    MP.pilot(F, R, 'torso', 0, 0.5, 0.05, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: c('crimson') });
    R.on('torso');
    for (const s of [-1, 1]) { F.rod(s * 0.22, 0.6, 0.45, s * 0.22, 0.86, 0.55, 0.02, iron, 'metal'); }
    F.cb(0, 0.42, 0.66, 1.5, 0.36, 0.06, dk, 'metal');
    F.bands(0, 0.42, 0.695, 1.48, 0.34, -Math.PI / 4, 0.15, [or, hz], 'paint');
    /* the pack: radiator, an exhaust, the legion flag */
    F.chb(0, 1.0, -0.95, 1.45, 1.2, 0.45, 0.12, gun, 'metal', 'z');
    for (let i = 0; i < 8; i++) F.cb(-0.6 + i * 0.17, 1.0, -1.19, 0.05, 1.0, 0.04, iron, 'metal');
    F.cy(-0.55, 1.95, -0.95, 0.11, 0.1, 0.9, c('copper'), 'copper', 'y', 10);
    F.cy(-0.55, 2.42, -0.95, 0.14, 0.14, 0.06, iron, 'metal', 'y', 10);
    IZ.sashimono(F, R, 'sashi', 'torso', 0.55, 1.62, -1.2, { h: 2.4, w: 0.55, bh: 1.5, side: -1, paint: IZ.paint(F, 'legion', { numeral: 'XII' }) });
    R.on('torso');
    F.cb(0.55, 1.6, -1.19, 0.15, 0.25, 0.15, iron, 'metal');

    /* ---- the head: floodlamps on arms, a beacon */
    R.bone('head', 'torso', 0, 1.82, 0.15);
    R.on('head');
    F.cy(0, 0.02, 0, 0.26, 0.3, 0.12, iron, 'metal', 'y', 10);
    F.chb(0, 0.2, 0, 0.82, 0.3, 0.7, 0.1, steel, 'paint', 'x');
    for (const s of [-1, 1]) {
      F.cb(s * 0.17, 0.2, 0.36, 0.22, 0.18, 0.02, c('glass'), 'glass');
      F.cb(s * 0.17, 0.2, 0.355, 0.24, 0.2, 0.01, iron, 'metal');
      F.rod(s * 0.38, 0.28, 0.0, s * 0.62, 0.48, 0.05, 0.04, iron, 'metal');
      F.chb(s * 0.62, 0.52, 0.05, 0.3, 0.2, 0.22, 0.04, gun, 'metal', 'z');
      MP.lamp(F, s * 0.62, 0.52, 0.17, 0, -0.08, 1, 0.07, 'head', null);
      MP.lamp(F, s * 0.62 - 0.08, 0.52, 0.17, 0, -0.08, 1, 0.06, 'head', null);
    }
    F.prism(0, 0.45, 0, [[-0.3, 0], [0.3, 0], [0.12, 0.3], [-0.12, 0.3]], 0.4, or, 'paint', 'z');
    for (const s of [-1, 1]) F.knob(s * 0.1, 0.52, 0.2, 0.05, c('lensAmber'), 'lampAmber');
    F.knob(0, 0.6, 0.18, 0.05, c('lensAmber'), 'lampAmber');
    F.cy(0, 0.8, 0, 0.06, 0.08, 0.12, c('lensRed'), 'lampTail', 'y', 8);

    /* ---- arms */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.18, 1.3, -0.05, 0, 0, s * 0.12);
      R.on(A + '_sh');
      MP.joint(F, -s * 0.06, 0, 0, 0.28, 0.5, 'x', iron, br);
      F.chb(s * 0.05, 0.1, 0, 0.72, 0.5, 0.95, 0.18, or, 'paint', 'z');
      F.cb(s * 0.05, -0.17, 0, 0.74, 0.06, 0.97, hz, 'paint');
      F.cb(s * 0.05, 0.37, 0, 0.55, 0.05, 0.75, steel, 'paint');
      F.chb(0, -0.5, 0, 0.44, 0.8, 0.48, 0.08, steel, 'paint', 'y');
      R.bone(A + '_el', A + '_sh', 0, -0.95, 0, -0.55, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.22, 0.5, 'x', iron, br);
      F.chb(0, -0.42, 0.02, 0.52, 0.78, 0.54, 0.1, steel, 'paint', 'y');
      F.cb(0, -0.42, 0.29, 0.4, 0.6, 0.03, dk, 'metal');
      F.bands(0, -0.42, 0.31, 0.38, 0.58, Math.PI / 4, 0.1, [or, hz], 'paint');
      MP.piston(F, R, A + '_sh', [0, -0.3, 0.26], A + '_el', [0, -0.3, 0.3], 0.05, dk, c('chrome'));
      MP.hose(F, R, 'torso', [s * 0.7, 1.5, -0.7], A + '_sh', [0, -0.3, -0.25], 0.05, c('rubber'), 0.15);
    }
    /* the auger (right): motor, then the spinning bit along the forearm */
    R.on('arm_r_el');
    F.cy(0, -0.88, 0.02, 0.32, 0.32, 0.3, gun, 'metal', 'y', 14);
    F.cy(0, -0.88, 0.02, 0.34, 0.34, 0.06, or, 'paint', 'y', 14);
    R.spin('auger', 'arm_r_el', 0, -1.02, 0.02, 'z', { idle: 0, walk: 0, attack: 22 }, Math.PI / 2, 0, 0);
    R.on('auger');
    MP.auger(F, 1.5, 0.36, 3.2, iron, c('steelLt'));
    R.point('drill_tip', 'auger', 0, 0, 1.45);
    /* the grab (left): two jaws on a wrist */
    R.on('arm_l_el');
    R.bone('arm_l_wr', 'arm_l_el', 0, -0.86, 0.02, 0.2, 0, 0);
    R.on('arm_l_wr');
    F.chb(0, -0.1, 0, 0.5, 0.3, 0.55, 0.08, dk, 'metal', 'x');
    MP.joint(F, 0, -0.2, 0, 0.1, 0.56, 'x', iron, null);
    for (const k of [['claw_a', 1], ['claw_b', -1]]) {
      R.bone(k[0], 'arm_l_wr', 0, -0.2, k[1] * 0.12);
      R.on(k[0]);
      const sg = k[1];
      F.prism(0, 0, 0, [[0, 0.05], [sg * 0.12, 0.02], [sg * 0.22, -0.35], [sg * 0.12, -0.75], [0, -0.85], [sg * 0.04, -0.4]], 0.4, or, 'paint', 'x');
      for (let t = 0; t < 3; t++) F.cy((t - 1) * 0.13, -0.86, sg * 0.0, 0.04, 0.004, 0.14, c('chrome'), 'chrome', 'y', 5, Math.PI, 0, 0);
    }

    /* ---- legs on tracked shoes */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.66, -0.12, 0], L1: 0.98, L2: 0.95, knee: 1, ankleH: 0.5, rest: [s * 0.76, 0.05], phase: s > 0 ? 0 : 0.5, toe: 0.12 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.25, 0.44, 'x', iron, br);
      F.chb(0, -0.48, 0, 0.5, 0.86, 0.56, 0.1, steel, 'paint', 'y');
      F.cb(s * 0.27, -0.48, 0, 0.05, 0.6, 0.38, or, 'paint');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.23, 0.64, 'x', iron, br);
      F.chb(0, -0.46, 0, 0.58, 0.88, 0.62, 0.12, dk, 'paint', 'y');
      F.cb(0, -0.46, 0.315, 0.5, 0.74, 0.02, gun, 'metal');
      F.bands(0, -0.46, 0.33, 0.48, 0.72, Math.PI / 4, 0.12, [or, hz], 'paint');
      MP.piston(F, R, Lg + '_hip', [0, -0.25, -0.3], Lg + '_knee', [0, -0.35, -0.33], 0.055, dk, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'track', w: 0.62, l: 1.3, ankleH: 0.5, plate: or, iron: c('rubber'), trim: br });
    }
  }
});

/* ---- kits/mechs/krator-mechs-iziz-hoist.js ---- */
/* ======================================================================
   Iziz mech: the Hoist (kits/mechs/krator-mechs-iziz-hoist.js)

   An Ancient walking crane from the railway cuttings: a cargo hull on four splayed,
   high-kneed legs, the operator in a cab wrapped in a cage of tube at its front, two
   round lamps for eyes, a slewing crane on its back with a four-tined grapple on a
   cable. A rigger rides on top among the packs. In a fight it swings the grapple up
   and brings it down on a wall or a knot of men, and the tines close on what is left.
   ====================================================================== */
MECH({
  key: 'iz_hoist', name: 'Hoist', culture: 'iziz',
  role: 'siege crane: grapple', origin: 'Ancient walking crane',
  lore: 'It laid rails in the cuttings. Now it brings its grapple down on walls and shields; a rigger rides on top among the packs and calls the swing.',
  tags: { class: 'mech', type: ['war machine', 'siege', 'utility'], drive: 'quadruped', crew: 2, pilot: 'cab', weapon: ['grapple'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Rail Crane'],
  w: 5.2, d: 7.2, h: 7.0,
  data: { height: 4.6, mass: 21, crew: 2, pilot: 'cab', reach: 5.5, weapon: 'slewing crane with a four-tined grapple', lift: 4000,
    engine: 'Ancient cell pack, hydraulic', armour: 'cargo hull and tube cage' },
  gait: { period: 2.3, duty: 0.74, stride: 1.3, lift: 0.42, bob: 0.04, sway: 0.05, roll: 0.02, twist: 0.03, lean: 0,
    offsets: [0.25, 0.75, 0, 0.5] },
  idle: { breathe: 0.03, scan: 0, look: 0.3 },
  anim: {
    idle: function (P, t, w) { P.b.crane = [0, 0.18 * Math.sin(t * 0.15) * w, 0]; P.b.boom = [0.04 * Math.sin(t * 0.33) * w, 0, 0]; }
  },
  attack: (function () {
    const open = { tine0: [-0.65, 0, 0], tine1: [-0.65, 0, 0], tine2: [-0.65, 0, 0], tine3: [-0.65, 0, 0] };
    const shut = { tine0: [0.3, 0, 0], tine1: [0.3, 0, 0], tine2: [0.3, 0, 0], tine3: [0.3, 0, 0] };
    const k = function (boom, tines, extra) { return { b: Object.assign({ boom: [boom, 0, 0], crane: [0, 0, 0] }, tines, extra || {}), s: { body: [0, -0.08, 0] } }; };
    return { kind: 'grapple smash', dur: 3.4, keys: [[0, {}], [0.85, k(-0.4, open, { body: [-0.04, 0, 0] }), 's'], [1.3, k(0.95, open, { body: [0.06, 0, 0] }), 'i'],
      [1.5, k(0.9, shut, { body: [0.05, 0, 0] }), 'o'], [2.3, k(0.0, shut), 's'], [3.4, {}, 's']],
      events: [{ t: 1.48, type: 'impact', at: 'grab_pt', r: 1.8 }] };
  })(),

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze'), tl = c('teal');

    /* ---- the hull and its packs */
    R.bone('body', null, 0, 2.85, 0);
    R.on('body');
    F.chb(0, 0.2, -0.35, 2.2, 1.3, 2.9, 0.3, steel, 'paint', 'z');
    F.chb(0, -0.5, -0.25, 1.7, 0.35, 2.6, 0.12, gun, 'metal', 'z');
    for (const s of [-1, 1]) {
      F.cb(s * 1.11, 0.42, -0.4, 0.03, 0.5, 2.3, or, 'paint');
      F.cb(s * 1.125, 0.14, -0.4, 0.02, 0.06, 2.3, cr, 'paint');
      IZ.sun(F, s * 1.14, 0.42, -0.95, s, 0, 0, 0.25);
      F.chb(s * 1.12, -0.05, 0.4, 0.06, 0.45, 0.5, 0.04, dk, 'metal', 'x');
    }
    MP.bundle(F, 0.55, 0.98, -1.4, 0.2, 0.9, c('canvas'), c('rope'), 'z');
    MP.bundle(F, -0.6, 0.95, -1.5, 0.17, 0.7, c('leather'), c('rope'), 'z');
    MP.barrel(F, 0.75, 1.05, -0.4, 0.2, 0.5, c('wood'), iron, 'y');
    MP.barrel(F, -0.75, 1.05, -0.6, 0.2, 0.5, c('woodDk'), iron, 'y');
    MP.crate(F, -0.55, 0.85, -1.05, 0.55, 0.35, 0.45, c('wood'), iron, 0.15);
    F.cy(0, 0.96, -1.85, 0.22, 0.22, 1.6, c('canvas'), 'cloth', 'x', 10);
    /* the rigger on top */
    F.cb(0, 0.9, -0.95, 0.5, 0.1, 0.45, c('leather'), 'leather');
    MP.pilot(F, R, 'body', 0, 0.95, -0.95, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: c('crimson'), lean: 0.05 });
    R.on('body');
    /* ---- the cab: a cage of tube round it, lamp eyes, the operator */
    R.bone('head', 'body', 0, 0.12, 1.2);
    R.on('head');
    F.cy(0, -0.05, -0.26, 0.4, 0.45, 0.24, iron, 'metal', 'z', 12);
    F.chb(0, 0.05, 0.35, 1.7, 1.45, 1.1, 0.3, steel, 'paint', 'z');
    F.cb(0, 0.38, 0.91, 1.15, 0.42, 0.03, c('glass'), 'glass');
    for (const s of [-1, 1]) F.cb(s * 0.86, 0.35, 0.35, 0.03, 0.4, 0.62, c('glass'), 'glass');
    F.cb(0, 0.6, 0.93, 1.3, 0.06, 0.06, gun, 'metal');
    F.cb(0, 0.1, 0.93, 1.3, 0.06, 0.06, gun, 'metal');
    for (const s of [-1, 1]) {
      MP.lamp(F, s * 0.5, -0.25, 0.92, 0, 0, 1, 0.15, 'amber', gun);
      MP.lamp(F, s * 0.72, 0.0, 0.9, s * 0.2, 0, 1, 0.06, 'head', gun);
    }
    IZ.sun(F, 0, -0.32, 0.94, 0, 0, 1, 0.2);
    F.cb(0, -0.54, 0.6, 1.4, 0.12, 0.6, dk, 'metal');
    F.cb(0, -0.6, 0.35, 1.2, 0.04, 0.6, gun, 'metal');
    MP.pilot(F, R, 'head', 0, -0.52, 0.32, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: null });
    R.on('head');
    MP.cage(F, 0, 0.05, 0.25, 1.08, 0.95, 0.95, Math.PI / 2 - 1.25, 2.5, 0.35, 2.2, 5, 4, 0.035, tl, 'paint');
    IZ.phalerae(F, -0.72, 0.62, 0.92, 0, 0, 1, 2, 0.2, 0.07);
    IZ.feathers(F, R, 'fth_cab', 'head', 0.95, 0.55, 0.6, { n: 5, len: 0.55 });
    /* ---- the crane: slewing base, boom, cable, grapple */
    R.bone('crane', 'body', 0, 0.85, -0.45);
    R.on('crane');
    F.cy(0, 0.05, 0, 0.62, 0.66, 0.14, iron, 'metal', 'y', 18);
    F.chb(0, 0.32, 0, 0.9, 0.42, 1.1, 0.12, dk, 'metal', 'z');
    F.cb(0, 0.32, 0, 0.92, 0.1, 1.12, or, 'paint');
    R.bone('boom', 'crane', 0, 0.45, 0.2, -0.62, 0, 0);
    R.on('boom');
    MP.joint(F, 0, 0, 0, 0.18, 0.7, 'x', iron, br);
    const BL = 4.3;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) F.cb(sx * 0.2, sy * 0.17, BL / 2, 0.07, 0.07, BL, steel, 'metal');
    for (let i = 0; i < 9; i++) {
      const z0 = i * BL / 9, z1 = (i + 1) * BL / 9;
      for (const sx of [-1, 1]) F.rod(sx * 0.2, -0.17, z0, sx * 0.2, 0.17, z1, 0.018, dk, 'metal');
      for (const sy of [-1, 1]) F.rod(-0.2, sy * 0.17, z0, 0.2, sy * 0.17, z1, 0.018, dk, 'metal');
    }
    F.cb(0, 0.0, 0.5, 0.46, 0.4, 0.9, or, 'paint');
    F.cb(0, 0.0, 2.7, 0.44, 0.1, 0.6, or, 'paint');
    F.cy(0, 0.0, BL, 0.2, 0.2, 0.3, iron, 'metal', 'x', 14);
    F.cy(0, 0.0, BL, 0.21, 0.21, 0.1, br, 'bronze', 'x', 14);
    MP.piston(F, R, 'crane', [0, 0.25, 0.48], 'boom', [0, -0.2, 1.4], 0.085, dk, c('chrome'));
    IZ.feathers(F, R, 'fth_boom', 'boom', 0.25, -0.2, BL - 0.25, { n: 6, len: 0.6, cols: ['fScarlet', 'fGold', 'fTeal', 'fBlack'] });
    R.dangle('hook', 'boom', 0, -0.05, BL, { mode: 'hang', len: 1.9, k: 5, c: 0.9, wind: 0.01, max: 1.5 });
    R.on('hook');
    F.rod(0, 0, 0, 0, -1.45, 0, 0.022, c('rope'), 'rope');
    R.bone('grab', 'hook', 0, -1.5, 0);
    R.on('grab');
    F.chb(0, 0, 0, 0.42, 0.3, 0.42, 0.08, gun, 'metal', 'y');
    F.cy(0, 0.2, 0, 0.08, 0.08, 0.14, br, 'bronze', 'y', 8);
    F.cb(0, 0, 0, 0.44, 0.08, 0.44, or, 'paint');
    R.point('grab_pt', 'grab', 0, -0.7, 0);
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2 + Math.PI / 4, T = 'tine' + k;
      R.bone(T, 'grab', Math.sin(a) * 0.18, -0.12, Math.cos(a) * 0.18, 0, a, 0);
      R.on(T);
      F.rod(0, 0, 0, 0, -0.35, 0.12, 0.045, iron, 'metal');
      F.rod(0, -0.35, 0.12, 0, -0.68, -0.05, 0.04, iron, 'metal');
      F.cy(0, -0.74, -0.1, 0.04, 0.004, 0.14, br, 'bronze', 'y', 5, Math.PI + 0.5, 0, 0);
      MP.joint(F, 0, 0, 0, 0.05, 0.12, 'x', iron, null);
    }

    /* ---- four splayed legs, knees high */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2];
      R.leg(n, { parent: 'body', hip: [sx * 1.0, -0.42, sz * 1.15 - 0.2], L1: 1.4, L2: 1.65, knee: 1, splay: true, ankleH: 0.32,
        rest: [sx * 2.0, sz * 1.95 - 0.2], toe: 0.1, footYaw: 0.6 });
      R.on(n + '_yaw');
      F.cy(0, 0, 0, 0.3, 0.3, 0.26, iron, 'metal', 'y', 12);
      R.on(n + '_hip');
      MP.joint(F, 0, 0, 0, 0.28, 0.44, 'x', gun, br);
      F.chb(0, -0.68, 0, 0.44, 1.15, 0.5, 0.1, steel, 'paint', 'y');
      F.chb(0, -0.68, 0.26, 0.36, 0.95, 0.05, 0.03, or, 'paint', 'x');
      F.cb(0, -0.68, 0.29, 0.06, 0.95, 0.02, cr, 'paint');
      R.on(n + '_knee');
      MP.joint(F, 0, 0, 0, 0.24, 0.46, 'x', gun, br);
      F.cy(0, -0.8, 0, 0.18, 0.13, 1.45, dk, 'metal', 'y', 12);
      F.chb(0, -0.3, 0.05, 0.36, 0.5, 0.4, 0.06, steel, 'paint', 'y');
      MP.piston(F, R, n + '_hip', [0, -0.4, 0.3], n + '_knee', [0, -0.3, 0.22], 0.06, dk, c('chrome'));
      MP.hose(F, R, 'body', [sx * 0.8, -0.3, sz * 0.9 - 0.2], n + '_hip', [0, -0.55, -0.28], 0.08, c('rubber'), 0.18, 8);
      R.on(n + '_ankle');
      MP.foot(F, { kind: 'claw', w: 0.6, l: 0.85, ankleH: 0.32, plate: dk, iron: gun, trim: br, toes: 3 });
    }
    IZ.vexillum(F, R, 'vex', 'body', -0.85, 0.85, -1.75, { h: 2.4, w: 0.7, bh: 0.8, finial: 'sun', paint: IZ.paint(F, 'legion', { numeral: 'IV' }), discs: 2 });
  }
});

/* ---- kits/mechs/krator-mechs-iziz-rota.js ---- */
/* ======================================================================
   Iziz mech: the Rota (kits/mechs/krator-mechs-iziz-rota.js)

   An Ancient vehicle-recovery frame: a tall, heavy biped built around the shell of a
   car (its cab is the head, glass dome and headlamps and all), with road wheels for
   shoulders and knees, the operator sat in the open cradle of its chest. It was made
   to cut wrecks apart, and it still carries the salvage saw on its right arm; on the
   left it holds a wheel as a round shield. It sweeps the saw through a line of men
   at waist height. Two flags at its back, a crest along the cab roof.
   ====================================================================== */
MECH({
  key: 'iz_rota', name: 'Rota', culture: 'iziz',
  role: 'heavy walker: salvage saw and wheel shield', origin: 'Ancient vehicle-recovery frame',
  lore: 'It was built round the shell of an Ancient car to cut wrecks apart. Its head is the car\'s cab, its joints are road wheels, and it still carries the salvage saw.',
  tags: { class: 'mech', type: ['war machine', 'heavy', 'line'], drive: 'biped', crew: 1, pilot: 'chest', weapon: ['saw', 'shield'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Wrecker'],
  w: 4.9, d: 2.9, h: 7.4,
  data: { height: 6.0, mass: 17, crew: 1, pilot: 'chest', reach: 3.2, weapon: 'salvage saw (1.5 m disc) and wheel shield',
    engine: 'Ancient cell pack, electric', armour: 'car shell and recovery plate' },
  gait: { period: 1.85, duty: 0.62, stride: 1.35, lift: 0.33, bob: 0.07, sway: 0.085, roll: 0.035, twist: 0.07, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.1, 0, 0], arm_r_sh: [0.16, 0, 0] } },
  idle: { breathe: 0.03, scan: 0.12, look: 0.45 },
  attack: {
    kind: 'saw sweep', dur: 2.8,
    keys: [
      [0, {}],
      [0.65, { b: { torso: [0, -0.6, 0], arm_r_sh: [-0.9, -0.3, -0.5], arm_r_el: [0.4, 0, 0], arm_l_sh: [-0.55, 0, 0.15], body: [-0.03, -0.1, 0] },
        s: { body: [0, -0.1, -0.1] } }, 's'],
      [1.05, { b: { torso: [0.05, 0.55, 0], arm_r_sh: [-0.95, 0.2, -0.1], arm_r_el: [0.4, 0, 0], arm_l_sh: [-0.5, 0, 0.25], body: [0.1, 0.12, 0] },
        s: { body: [0, -0.28, 0.25] } }, 'i'],
      [1.35, { b: { torso: [0.05, 0.7, 0], arm_r_sh: [-0.9, 0.3, 0.0], arm_r_el: [0.35, 0, 0], arm_l_sh: [-0.5, 0, 0.25], body: [0.08, 0.15, 0] },
        s: { body: [0, -0.24, 0.22] } }, 'o'],
      [2.8, {}, 's']
    ],
    events: [{ t: 0.95, type: 'impact', at: 'saw_edge', r: 1.3 }]
  },

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), lt = c('steelLt'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');
    const tyre = c('rubber');

    R.bone('body', null, 0, 2.62, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.35, 0.55, 1.0, 0.16, gun, 'metal', 'z');
    F.chb(0, 0.0, 0.5, 1.0, 0.38, 0.08, 0.06, lt, 'paint', 'x');
    F.cb(0, -0.12, 0.55, 0.96, 0.05, 0.04, or, 'paint');
    for (const s of [-1, 1]) MP.joint(F, s * 0.66, -0.1, 0, 0.26, 0.32, 'x', iron, br);

    /* ---- the chest: an open cradle with the operator in it */
    R.bone('torso', 'body', 0, 0.3, 0);
    R.on('torso');
    F.cy(0, 0.05, 0, 0.42, 0.42, 0.32, iron, 'metal', 'y', 12);
    F.chb(0, 1.0, -0.5, 1.9, 1.6, 0.6, 0.18, lt, 'paint', 'z');
    F.chb(0, 0.3, 0.05, 1.55, 0.3, 1.2, 0.12, dk, 'metal', 'x');
    for (const s of [-1, 1]) {
      F.chb(s * 0.85, 1.0, 0.1, 0.24, 1.5, 1.15, 0.1, lt, 'paint', 'x');
      F.cb(s * 0.975, 0.95, 0.1, 0.02, 1.2, 0.08, or, 'paint');
      F.cb(s * 0.975, 0.95, 0.24, 0.02, 1.2, 0.03, c('red'), 'paint');
      F.rod(s * 0.55, 0.5, 0.7, s * 0.55, 1.62, 0.66, 0.045, iron, 'metal');
      IZ.phalerae(F, s * 0.85, 1.5, 0.69, 0, 0, 1, 3, 0.22, 0.08);
      for (let k = 0; k < 3; k++) F.rod(s * (0.4 + k * 0.08), 0.5, -0.18, s * (0.42 + k * 0.08), 1.6, -0.18, 0.025, [c('crimson'), c('fGold'), tyre][k], 'rubber');
    }
    F.cb(0, 1.0, -0.17, 1.4, 1.4, 0.04, gun, 'metal');
    F.cb(0, 0.48, 0.02, 0.62, 0.1, 0.55, c('leather'), 'leather');
    F.cb(0, 0.9, -0.12, 0.6, 0.8, 0.1, c('leather'), 'leather');
    MP.pilot(F, R, 'torso', 0, 0.53, 0.05, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: c('crimson') });
    R.on('torso');
    for (const s of [-1, 1]) { F.rod(s * 0.22, 0.62, 0.45, s * 0.22, 0.9, 0.55, 0.02, iron, 'metal'); }
    F.chb(0, 0.52, 0.66, 1.4, 0.3, 0.12, 0.05, lt, 'paint', 'x');
    F.cb(0, 0.52, 0.73, 1.2, 0.08, 0.02, or, 'paint');
    F.chb(0, 1.0, -0.98, 1.4, 1.2, 0.4, 0.12, gun, 'metal', 'z');
    IZ.sashimono(F, R, 'sashi_l', 'torso', 0.55, 1.62, -1.2, { h: 2.5, w: 0.5, bh: 1.5, side: 1, paint: IZ.paint(F, 'sun') });
    IZ.sashimono(F, R, 'sashi_r', 'torso', -0.55, 1.62, -1.2, { h: 2.5, w: 0.5, bh: 1.5, side: -1, paint: IZ.paint(F, 'teal') });
    R.on('torso');
    for (const s of [-1, 1]) F.cb(s * 0.55, 1.6, -1.19, 0.15, 0.25, 0.15, iron, 'metal');

    /* ---- the head: a car's cab, glass dome, headlamps, grille */
    R.bone('head', 'torso', 0, 1.85, 0.0);
    R.on('head');
    F.cy(0, -0.02, 0, 0.3, 0.34, 0.14, iron, 'metal', 'y', 12);
    F.chb(0, 0.28, 0.05, 1.55, 0.5, 1.75, 0.22, lt, 'paint', 'z');
    F.chb(0, 0.2, 0.92, 1.45, 0.34, 0.1, 0.08, gun, 'metal', 'x');
    for (let k = 0; k < 7; k++) F.cb(-0.45 + k * 0.15, 0.2, 0.975, 0.04, 0.22, 0.02, iron, 'metal');
    for (const s of [-1, 1]) {
      F.cb(s * 0.56, 0.38, 0.95, 0.36, 0.06, 0.03, c('lensWarm'), 'lamp');
      F.cb(s * 0.56, 0.38, 0.94, 0.4, 0.1, 0.03, gun, 'metal');
      F.cb(s * 0.79, 0.28, 0.05, 0.03, 0.06, 1.7, or, 'paint');
      F.cy(s * 0.62, 0.05, 0.62, 0.22, 0.22, 0.1, tyre, 'rubber', 'x', 14);
      F.cy(s * 0.62, 0.05, -0.62, 0.22, 0.22, 0.1, tyre, 'rubber', 'x', 14);
    }
    F.sph(0, 0.52, 0.12, 0.66, 0.42, 0.78, c('glass'), 'glass', 16, 8, 0, TAU, 0, Math.PI / 2);
    F.tor(0, 0.53, 0.12, 0.67, 0.035, gun, 'metal', 'y', 18);
    IZ.crest(F, 0, 0.92, 0.0, 1.0, 0.3, 'along');
    IZ.sun(F, 0, 0.45, 0.9, 0, 0.3, 1, 0.12);

    /* ---- arms: wheels for shoulders */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.2, 1.35, -0.05, 0, 0, s * 0.12);
      R.on(A + '_sh');
      MP.wheel(F, s * 0.08, 0.02, 0, 0.5, 0.38, 'x', tyre, or, br);
      F.chb(s * 0.05, 0.42, 0, 0.6, 0.18, 0.95, 0.06, lt, 'paint', 'z');
      F.cb(s * 0.05, 0.52, 0, 0.55, 0.03, 0.8, or, 'paint');
      F.chb(0, -0.6, 0, 0.42, 0.8, 0.46, 0.08, steel, 'paint', 'y');
      F.cb(s * 0.235, -0.6, 0, 0.04, 0.55, 0.3, lt, 'paint');
      R.bone(A + '_el', A + '_sh', 0, -1.05, 0, -0.5, 0, 0);
      R.on(A + '_el');
      MP.wheel(F, 0, 0, 0, 0.24, 0.46, 'x', tyre, or, br);
      MP.piston(F, R, A + '_sh', [0, -0.35, 0.25], A + '_el', [0, -0.3, 0.28], 0.05, dk, c('chrome'));
      MP.hose(F, R, 'torso', [s * 0.75, 1.55, -0.7], A + '_sh', [0, -0.3, -0.25], 0.045, tyre, 0.15);
      IZ.feathers(F, R, s > 0 ? 'fth_l' : 'fth_r', A + '_sh', s * 0.3, -0.45, 0.25, { n: 4, len: 0.45, cols: s > 0 ? ['fScarlet', 'fGold'] : ['fGreen', 'fBlack'] });
    }
    /* the saw arm (right): a long forearm, the guard, the spinning disc */
    R.on('arm_r_el');
    F.chb(0, -0.6, 0.02, 0.42, 1.1, 0.46, 0.08, lt, 'paint', 'y');
    F.cb(0, -0.3, 0.02, 0.44, 0.1, 0.48, or, 'paint');
    /* the disc lies in the forearm's plane, under it on an arbour, so a sweep leads with the teeth */
    F.cy(0, -1.25, 0.02, 0.2, 0.2, 0.36, gun, 'metal', 'y', 12);
    F.cy(0, -1.55, -0.14, 0.09, 0.09, 0.36, iron, 'metal', 'z', 10);
    F.cy(0, -2.0, -0.14, 0.07, 0.07, 0.36, iron, 'metal', 'z', 10);
    F.cb(0, -1.78, 0.0, 0.16, 0.6, 0.1, gun, 'metal');
    F.tor(0, -2.0, -0.33, 0.83, 0.05, or, 'paint', 'z', 16, Math.PI);
    F.cb(0, -1.6, -0.33, 1.66, 0.06, 0.06, or, 'paint');
    R.spin('saw', 'arm_r_el', 0, -2.0, -0.33, 'x', { idle: 1.2, walk: 1.2, attack: 28 }, 0, Math.PI / 2, 0);
    R.on('saw');
    MP.saw(F, 0.75, 0.04, c('steelLt'), c('chrome'), br);
    R.point('saw_edge', 'arm_r_el', 0, -2.75, -0.33);
    /* the shield arm (left): a hand round a wheel */
    R.on('arm_l_el');
    F.chb(0, -0.5, 0.02, 0.48, 0.9, 0.5, 0.08, lt, 'paint', 'y');
    F.cb(0, -0.3, 0.02, 0.5, 0.1, 0.52, or, 'paint');
    R.bone('arm_l_wr', 'arm_l_el', 0, -1.0, 0.02, 0.5, 0, 0);
    R.on('arm_l_wr');
    F.chb(0, -0.15, 0.0, 0.42, 0.36, 0.45, 0.08, dk, 'metal', 'x');
    MP.wheel(F, 0.32, 0.05, 0.25, 0.82, 0.24, 'x', tyre, or, br);
    F.cy(0.53, 0.05, 0.25, 0.4, 0.4, 0.03, or, 'paint', 'x', 16);
    IZ.sun(F, 0.555, 0.05, 0.25, 1, 0, 0, 0.32);

    /* ---- legs: wheels for knees */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.68, -0.12, 0], L1: 1.2, L2: 1.12, knee: 1, ankleH: 0.46, rest: [s * 0.78, 0.05], phase: s > 0 ? 0 : 0.5 });
      R.on(Lg + '_hip');
      F.chb(0, -0.6, 0, 0.5, 1.05, 0.56, 0.1, steel, 'paint', 'y');
      F.chb(0, -0.5, 0.29, 0.42, 0.75, 0.06, 0.03, lt, 'paint', 'x');
      F.cb(0, -0.5, 0.325, 0.08, 0.7, 0.02, or, 'paint');
      R.on(Lg + '_knee');
      MP.wheel(F, 0, 0, 0.0, 0.4, 0.54, 'x', tyre, or, br);
      F.chb(0, -0.6, 0, 0.56, 1.0, 0.6, 0.12, lt, 'paint', 'y');
      F.chb(0, -0.6, 0.31, 0.44, 0.8, 0.05, 0.03, dk, 'metal', 'x');
      F.cb(s * 0.29, -0.66, 0, 0.03, 0.62, 0.35, or, 'paint');
      MP.piston(F, R, Lg + '_hip', [0, -0.3, -0.3], Lg + '_knee', [0, -0.4, -0.33], 0.055, dk, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'stomp', w: 0.8, l: 1.15, ankleH: 0.46, plate: lt, iron: gun, trim: br, toes: 3 });
    }
  }
});

/* ---- kits/mechs/krator-mechs-iziz-scorpio.js ---- */
/* ======================================================================
   Iziz mech: the Scorpio (kits/mechs/krator-mechs-iziz-scorpio.js)

   An Ancient survey crawler: a low saucer hull on four splayed spider legs, the
   operator under a glass dome, two sensor pods on its flanks. The Forgemasters took
   the sensors off the pods and bolted a torsion ballista on each, so it is a walking
   battery: it settles, aims both, and looses one bolt and then the other, then winds
   them back. Orange plates on the steel shell, a crest on its rear hump, pennants on
   its aerials, feathers at the pods.
   ====================================================================== */
MECH({
  key: 'iz_scorpio', name: 'Scorpio', culture: 'iziz',
  role: 'artillery: twin ballistae', origin: 'Ancient survey crawler',
  lore: 'A survey crawler whose sensor pods each carry a torsion ballista now. It settles, aims both, and looses one and then the other.',
  tags: { class: 'mech', type: ['war machine', 'siege'], drive: 'quadruped', crew: 1, pilot: 'head', weapon: ['twin ballista'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Battery'],
  w: 5.4, d: 4.1, h: 4.3,
  data: { height: 3.3, mass: 13, crew: 1, pilot: 'head', reach: 320, weapon: 'two torsion ballistae (1.2 m bolts)',
    engine: 'Ancient cell pack, hydraulic', armour: 'survey shell' },
  gait: { period: 1.5, duty: 0.7, stride: 0.9, lift: 0.36, bob: 0.03, sway: 0.04, roll: 0.02, twist: 0.03, lean: 0,
    offsets: [0.25, 0.75, 0, 0.5] },
  idle: { breathe: 0.03, scan: 0, look: 0 },
  anim: {
    idle: function (P, t, w) {
      P.b.pod_l = [0.04 * Math.sin(t * 0.4) * w, 0.12 * Math.sin(t * 0.23) * w, 0];
      P.b.pod_r = [0.04 * Math.sin(t * 0.4 + 2) * w, 0.12 * Math.sin(t * 0.23 + 1.5) * w, 0];
      const m = Math.max(0, Math.sin(t * 1.3)) * 0.25 * w;
      P.b.mand_l = [0, m, 0]; P.b.mand_r = [0, -m, 0];
    }
  },
  attack: (function () {
    const D = 0.62 * 1.5 - 0.12;     /* MP.ballista: how far the nut runs when loosed (len 1.5) */
    const aim = { b: { pod_l: [-0.1, -0.1, 0], pod_r: [-0.1, 0.1, 0], body: [-0.05, 0, 0] }, s: { body: [0, -0.18, 0] } };
    const loose = function (L, R) {
      const b = { pod_l: [-0.1, -0.1, 0], pod_r: [-0.1, 0.1, 0], body: [-0.05, 0, 0] }, s = { body: [0, -0.18, 0] }, sc = {};
      for (const p of [[L, 'bal_l', 'pod_l'], [R, 'bal_r', 'pod_r']]) if (p[0]) {
        b[p[1] + '_bowL'] = [0, -0.4, 0]; b[p[1] + '_bowR'] = [0, 0.4, 0]; s[p[1] + '_nut'] = [0, 0, D]; sc[p[1] + '_bolt'] = 0.0001;
      }
      return { b: b, s: s, sc: sc };
    };
    const kickL = loose(1, 0); kickL.b.pod_l = [-0.18, -0.1, 0];
    return { kind: 'twin volley', dur: 3.2, keys: [
      [0, {}], [0.5, aim, 's'], [0.74, aim, 's'], [0.8, kickL, 'i'], [0.95, loose(1, 0), 'o'],
      [1.14, loose(1, 0), 's'], [1.2, (function () { const k = loose(1, 1); k.b.pod_r = [-0.18, 0.1, 0]; return k; })(), 'i'], [1.35, loose(1, 1), 'o'],
      [1.6, loose(1, 1), 's'],
      [2.4, (function () { const k = loose(0, 0); k.sc = { bal_l_bolt: 0.0001, bal_r_bolt: 0.0001 }; return k; })(), 's'],
      [2.42, aim, 'l'], [3.2, {}, 's']],
      events: [{ t: 0.78, type: 'fire', kind: 'bolt', at: 'bal_l_muzzle', dir: [0, 0, 1], speed: 48 },
        { t: 1.18, type: 'fire', kind: 'bolt', at: 'bal_r_muzzle', dir: [0, 0, 1], speed: 48 }] };
  })(),

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');

    /* ---- the saucer hull, its dome, the operator */
    R.bone('body', null, 0, 1.95, 0);
    R.on('body');
    F.sph(0, 0.08, 0, 1.45, 0.52, 1.35, steel, 'paint', 20, 10, 0, TAU, 0, Math.PI / 2);
    F.sph(0, 0.08, 0, 1.45, 0.36, 1.35, dk, 'metal', 20, 6, 0, TAU, Math.PI / 2, Math.PI / 2);
    F.tor(0, 0.08, 0, 1.4, 0.07, gun, 'metal', 'y', 28);
    F.tor(0, 0.17, 0, 1.38, 0.025, cr, 'paint', 'y', 28);
    /* orange plates over the shell, like a beetle's markings */
    for (let k = 0; k < 6; k++) {
      const p0 = k * TAU / 6 + 0.25;
      F.sph(0, 0.08, 0, 1.475, 0.535, 1.375, or, 'paint', 4, 3, p0, 0.55, 0.62, 0.62);
    }
    F.sph(0, 0.4, 0.28, 0.66, 0.8, 0.7, c('glass'), 'glass', 16, 10, 0, TAU, 0, Math.PI / 2);
    MP.cage(F, 0, 0.4, 0.28, 0.67, 0.81, 0.71, 0, TAU, 0, Math.PI / 2, 6, 2, 0.022, iron);
    F.tor(0, 0.41, 0.28, 0.68, 0.05, gun, 'metal', 'y', 18);
    MP.pilot(F, R, 'body', 0, 0.06, 0.2, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: c('crimson'), crestDir: 'along' });
    R.on('body');
    /* the rear hump: cells, a crest, aerials with pennants */
    F.chb(0, 0.5, -0.75, 1.0, 0.45, 0.8, 0.14, gun, 'metal', 'z');
    IZ.crest(F, 0, 0.73, -0.75, 0.9, 0.32, 'along');
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'ant_l' : 'ant_r';
      R.dangle(A, 'body', s * 0.45, 0.68, -1.0, { mode: 'whip', len: 1.6, k: 30, c: 2.2, wind: 0.02, max: 0.45 });
      R.on(A);
      F.cy(0, 0.05, 0, 0.05, 0.05, 0.1, iron, 'metal', 'y', 8);
      F.rod(0, 0, 0, 0, 1.6, 0, 0.013, iron, 'metal');
      R.banner({ bone: A, kind: 'pennant', x: 0, y: 1.5, z: 0, w: 0.75, h: 0.24, paint: s > 0 ? IZ.paint(F, 'stripes') : IZ.paint(F, 'teal') });
    }
    R.on('body');
    /* the face: sun, eyes, mandibles */
    IZ.sun(F, 0, 0.1, 1.38, 0, 0.1, 1, 0.26);
    for (const s of [-1, 1]) MP.lamp(F, s * 0.5, 0.12, 1.28, s * 0.3, 0, 1, 0.08, 'amber', gun);
    for (const s of [-1, 1]) {
      const M = s > 0 ? 'mand_l' : 'mand_r';
      R.bone(M, 'body', s * 0.32, -0.15, 1.22);
      R.on(M);
      MP.joint(F, 0, 0, 0, 0.08, 0.16, 'y', iron, null);
      F.prism(0, 0, 0, [[0, 0], [s * 0.1, 0.05], [s * 0.05, 0.45], [-s * 0.08, 0.55], [-s * 0.02, 0.3]], 0.1, or, 'paint', 'y');
    }
    /* ---- the pods, a ballista on each */
    for (const s of [-1, 1]) {
      const P = s > 0 ? 'pod_l' : 'pod_r', B = s > 0 ? 'bal_l' : 'bal_r';
      R.bone(P, 'body', s * 1.32, 0.2, 0.25);
      R.on(P);
      MP.joint(F, -s * 0.05, 0, 0, 0.22, 0.4, 'x', iron, br);
      F.chb(s * 0.18, 0.1, 0.0, 0.5, 0.42, 0.9, 0.12, steel, 'paint', 'z');
      F.cb(s * 0.18, 0.32, 0.0, 0.52, 0.04, 0.92, or, 'paint');
      IZ.phalera(F, s * 0.44, 0.1, 0.1, s, 0, 0, 0.1);
      MP.ballista(F, R, B, P, s * 0.18, 0.45, 0.05, { len: 1.5, span: 0.85, h: 0.15, wood: c('wood'), iron: iron, bronze: br, rope: c('rope'),
        skein: c('skein'), bolt: c('woodDk'), flight: c('fScarlet') });
      IZ.feathers(F, R, s > 0 ? 'fth_l' : 'fth_r', P, s * 0.44, -0.05, -0.3, { n: 4, len: 0.42, cols: s > 0 ? ['fScarlet', 'fGold'] : ['fGreen', 'fTeal'] });
    }
    /* ---- four spider legs */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2];
      R.leg(n, { parent: 'body', hip: [sx * 0.95, -0.12, sz * 0.62], L1: 1.25, L2: 1.6, knee: 1, splay: true, ankleH: 0.18,
        rest: [sx * 2.05, sz * 1.6], toe: 0, footYaw: 0.7 });
      R.on(n + '_yaw');
      F.cy(0, 0, 0, 0.2, 0.2, 0.22, iron, 'metal', 'y', 10);
      R.on(n + '_hip');
      MP.joint(F, 0, 0, 0, 0.2, 0.36, 'x', iron, br);
      F.chb(0, -0.6, 0, 0.32, 1.05, 0.38, 0.08, steel, 'paint', 'y');
      F.chb(0, -0.6, 0.2, 0.26, 0.9, 0.05, 0.03, or, 'paint', 'x');
      R.on(n + '_knee');
      MP.joint(F, 0, 0, 0, 0.17, 0.32, 'x', iron, br);
      F.cy(0, -0.7, 0, 0.15, 0.09, 1.3, dk, 'metal', 'y', 10);
      F.chb(0, -0.29, 0.05, 0.26, 0.46, 0.3, 0.06, steel, 'paint', 'y');
      MP.piston(F, R, n + '_hip', [0, -0.35, 0.22], n + '_knee', [0, -0.25, 0.16], 0.045, dk, c('chrome'));
      MP.hose(F, R, 'body', [sx * 0.75, -0.2, sz * 0.4], n + '_hip', [0, -0.3, -0.2], 0.05, c('rubber'), 0.15);
      R.on(n + '_ankle');
      F.cy(0, -0.06, 0, 0.1, 0.05, 0.24, iron, 'metal', 'y', 8);
      for (let k = 0; k < 3; k++) {
        const a = (k - 1) * 0.7;
        F.rod(0, -0.12, 0, Math.sin(a) * 0.32, -0.16, Math.cos(a) * 0.32, 0.035, gun, 'metal');
        F.cy(Math.sin(a) * 0.36, -0.15, Math.cos(a) * 0.36, 0.035, 0.004, 0.1, br, 'bronze', 'y', 5, Math.PI / 2 + 0.6, a, 0);
      }
    }
  }
});

/* ---- kits/mechs/krator-mechs-iziz-talpa.js ---- */
/* ======================================================================
   Iziz mech: the Talpa (kits/mechs/krator-mechs-iziz-talpa.js)

   An Ancient tunnel borer: a long hull wrapped in corrugated coolant hoses under a
   pill-bug's segmented back, four beetle legs with three-taloned claws, two crescent
   radiator vanes standing at its tail, and in its faceted nose cowl the old cutter head,
   a drum of seven bore tubes. The Forgemasters made the tubes a polybolos: a rotary
   repeating bolt-thrower fed from the magazines strapped along its flanks. The drum
   spins up and looses a volley, each bolt from whichever barrel is on top. Its rider
   sits a saddle on its back, as a beast rider would.
   ====================================================================== */
/* the crescent vane's outline in its own (z, y) plane: an outer edge sweeping up and back to the tip, an inner edge back down */
function talpaVane() {
  const A = [0.75, 0], C1 = [0.8, 1.9], T = [-1.15, 2.45], C2 = [-0.55, 0.95], B = [-0.45, 0], n = 10, out = [];
  const bz = function (p, q, r, t) { const u = 1 - t; return [u * u * p[0] + 2 * u * t * q[0] + t * t * r[0], u * u * p[1] + 2 * u * t * q[1] + t * t * r[1]]; };
  for (let i = 0; i <= n; i++) out.push(bz(A, C1, T, i / n));
  for (let i = 1; i <= n; i++) out.push(bz(T, C2, B, i / n));
  return out;
}
MECH({
  key: 'iz_talpa', name: 'Talpa', culture: 'iziz',
  role: 'siege crawler: rotary polybolos', origin: 'Ancient tunnel borer',
  lore: 'It bored the Ancients\' tunnels. Its cutter head is a drum of seven tubes now, and the Forgemasters feed it bolts from the magazines along its flanks; it looses a volley a breath long. A rider sits its back like a beast.',
  tags: { class: 'mech', type: ['war machine', 'siege', 'heavy'], drive: 'quadruped', crew: 1, pilot: 'saddle', weapon: ['repeating ballista'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Borer'],
  w: 3.3, d: 5.7, h: 5.8,
  data: { height: 4.4, mass: 19, crew: 1, pilot: 'saddle', reach: 300, weapon: 'polybolos: a seven-tube rotary bolt-thrower fed from six flank magazines',
    engine: 'Ancient cell pack, coolant-cooled', armour: 'segmented bore shield' },
  gait: { period: 2.0, duty: 0.72, stride: 1.2, lift: 0.36, bob: 0.04, sway: 0.05, roll: 0.025, twist: 0.03, lean: 0,
    offsets: [0.25, 0.75, 0, 0.5] },
  idle: { breathe: 0.03, scan: 0, look: 0.3 },
  attack: (function () {
    const brace = { b: { head: [-0.07, 0, 0], body: [-0.04, 0, 0] }, s: { body: [0, -0.2, 0] } };
    const kick = { b: { head: [-0.1, 0, 0], body: [-0.05, 0, 0] }, s: { body: [0, -0.19, -0.06] } };
    const shots = [0.95, 1.1, 1.25, 1.4, 1.55, 1.7], keys = [[0, {}], [0.6, brace, 's']];
    for (const t of shots) keys.push([t, brace, 's'], [t + 0.04, kick, 'o']);
    keys.push([1.85, brace, 's'], [3.2, {}, 's']);
    return { kind: 'polybolos volley', dur: 3.2, keys: keys,
      events: shots.map(function (t, i) { return { t: t + 0.01, type: 'fire', kind: 'bolt', at: 'muzzle', dir: [0, 0, 1], speed: 55 }; }) };
  })(),

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');
    const hose = c('rubber');

    /* ---- the hull: a rear bulb, a corrugated middle, the segmented back */
    R.bone('body', null, 0, 2.6, 0);
    R.on('body');
    F.sph(0, 0.1, -1.55, 0.92, 0.85, 1.15, steel, 'paint', 18, 12);
    F.cy(0, 0.05, -0.25, 0.82, 0.82, 1.9, gun, 'metal', 'z', 18);
    for (let k = 0; k < 15; k++) F.tor(0, 0.05, -1.15 + k * 0.13, 0.84, 0.05, hose, 'rubber', 'z', 18);
    /* the back: arched plates over the hoses, each overlapping the one behind, a cream edge on each */
    const W = Math.PI * 1.15;
    for (let k = 0; k < 4; k++) {
      const z = -1.0 + k * 0.42, r = 0.97 + k * 0.012;
      const g = new THREE.CylinderGeometry(r, r, 0.46, 18, 1, true, Math.PI - W / 2, W);
      g.rotateX(Math.PI / 2);
      _add(new THREE.Mesh(g, mat(k % 2 ? steel : c('steelLt'), 'paint'))).position.set(0, 0.05, z);
      F.tor(0, 0.05, z + 0.23, r + 0.004, 0.03, k % 2 ? or : cr, 'paint', 'z', 18, W, 0, 0, Math.PI / 2 - W / 2);
    }
    F.cb(0, -0.72, -0.3, 1.1, 0.24, 2.6, dk, 'metal');
    /* the magazines along the flanks: bolts stacked in canisters, cone-capped */
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const x = s * (0.92 + k * 0.04), y = 0.42 - k * 0.32, z = -0.2 + k * 0.12;
      F.cy(x, y, z, 0.16, 0.16, 1.0, steel, 'paint', 'z', 12);
      F.cy(x, y, z + 0.63, 0.15, 0.02, 0.24, iron, 'metal', 'z', 12);
      F.cy(x, y, z - 0.1, 0.178, 0.178, 0.16, or, 'paint', 'z', 12);
      F.cy(x, y, z - 0.53, 0.12, 0.15, 0.06, br, 'bronze', 'z', 12);
    }
    /* the saddle and its rider */
    F.cb(0, 1.02, 0.25, 0.6, 0.12, 0.7, c('leather'), 'leather');
    F.cb(0, 1.25, -0.08, 0.56, 0.42, 0.1, c('leather'), 'leather', -0.2, 0, 0);
    for (const s of [-1, 1]) {
      F.tube([[s * 0.32, 1.02, 0.5], [s * 0.36, 1.32, 0.62], [s * 0.2, 1.42, 0.72]], 0.025, br, 'bronze');
      F.cb(s * 0.34, 0.75, 0.42, 0.04, 0.5, 0.06, c('leather'), 'leather', 0, 0, s * 0.25);
    }
    F.sph(0, 1.08, 0.82, 0.42, 0.42, 0.2, c('glass'), 'glass', 12, 6, Math.PI * 0.15, Math.PI * 0.7, 0, Math.PI / 2);
    MP.pilot(F, R, 'body', 0, 1.08, 0.2, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'),
      crest: c('crimson'), crestDir: 'along', lean: 0.18 });
    R.on('body');
    for (const s of [-1, 1]) { F.cb(s * 0.11, 0.86, 0.66, 0.16, 0.12, 0.3, c('leather'), 'leather'); }

    /* ---- the crescent vanes at the tail: radiators, the sun painted on each; stiff springs, so they quiver at each step */
    const V = talpaVane();
    for (const s of [-1, 1]) {
      const n = s > 0 ? 'vane_l' : 'vane_r';
      R.dangle(n, 'body', s * 0.32, 0.72, -1.55, { mode: 'whip', len: 2.2, k: 45, c: 4.5, wind: 0.008, max: 0.1, rz: -s * 0.32 });
      R.on(n);
      F.cy(0, 0.06, 0.15, 0.2, 0.26, 0.16, iron, 'metal', 'y', 10);
      F.prism(0, 0, 0, V, 0.04, steel, 'paint', 'x');
      for (let i = 0; i < V.length - 1; i++) {
        F.rod(0, V[i][1], V[i][0], 0, V[i + 1][1], V[i + 1][0], 0.045, or, 'paint');
      }
      for (const t of [0.25, 0.5, 0.75]) {
        const o = V[Math.round(t * 10)], q = V[20 - Math.round(t * 10)];
        F.rod(0, o[1], o[0], 0, q[1], q[0], 0.03, or, 'paint');
        F.rod(0.045, o[1], o[0], 0.045, q[1], q[0], 0.012, dk, 'metal');
      }
      IZ.sun(F, s * 0.045, 1.05, 0.0, s, 0, 0, 0.28, null, null);
      IZ.feathers(F, R, n + '_fth', n, 0, V[10][1] - 0.05, V[10][0] + 0.05, { n: 4, len: 0.5, cols: s > 0 ? ['fScarlet', 'fGold'] : ['fGreen', 'fTeal'] });
    }

    /* ---- the head: the faceted cowl, the bore drum spinning in it */
    R.bone('head', 'body', 0, 0.02, 0.65);
    R.on('head');
    F.cy(0, 0, 0.6, 0.86, 0.62, 1.2, steel, 'paint', 'z', 8);
    F.cy(0, 0, 0.6, 0.802, 0.702, 0.5, or, 'paint', 'z', 8);
    for (let k = 0; k < 8; k++) {
      const a = k * TAU / 8 + TAU / 16;
      F.rod(Math.cos(a) * 0.87, Math.sin(a) * 0.87, 0.0, Math.cos(a) * 0.64, Math.sin(a) * 0.64, 1.2, 0.025, dk, 'metal');
    }
    F.tor(0, 0, 1.2, 0.62, 0.06, br, 'bronze', 'z', 16);
    F.cy(0, 0, 1.15, 0.6, 0.6, 0.06, gun, 'metal', 'z', 16, 0, 0, 0, true);
    for (const s of [-1, 1]) {
      MP.lamp(F, s * 0.5, 0.42, 1.0, s * 0.2, 0.1, 1, 0.07, 'amber', gun);
      IZ.phalerae(F, s * 0.8, 0.2, 0.45, s, 0, 0.35, 2, 0.24, 0.09);
    }
    R.spin('drum', 'head', 0, 0, 1.18, 'z', { idle: 0.3, walk: 0.3, attack: 14 });
    R.on('drum');
    F.cy(0, 0, 0.2, 0.2, 0.2, 0.5, iron, 'metal', 'z', 10);
    for (let k = 0; k < 7; k++) {
      const a = k * TAU / 7, x = Math.cos(a) * 0.36, y = Math.sin(a) * 0.36;
      F.cy(x, y, 0.42, 0.095, 0.095, 0.9, dk, 'metal', 'z', 8);
      F.cy(x, y, 0.88, 0.115, 0.115, 0.06, br, 'bronze', 'z', 8);
      F.cy(x, y, 0.92, 0.06, 0.06, 0.03, c('iron'), 'metal', 'z', 8);
    }
    F.cy(0, 0, 0.6, 0.47, 0.47, 0.05, steel, 'metal', 'z', 14);
    F.cy(0, 0, 0.1, 0.47, 0.47, 0.05, steel, 'metal', 'z', 14);
    R.point('muzzle', 'drum', 0, 0.36, 0.98);
    IZ.feathers(F, R, 'fth_cowl', 'head', 0.7, -0.45, 0.3, { n: 5, len: 0.5 });
    /* coolant hoses from the hull into the cowl */
    for (const s of [-1, 1]) MP.hose(F, R, 'body', [s * 0.55, 0.55, -0.4], 'head', [s * 0.45, 0.45, 0.15], 0.085, hose, 0.05, 6);

    /* ---- four beetle legs, knees up and back, three-taloned claws */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2], front = sz > 0, L2T = 1.45;
      R.leg(n, { parent: 'body', hip: [sx * 0.72, -0.45, front ? 0.55 : -1.35], L1: 1.3, L2: 1.45, knee: -1, ankleH: 0.42,
        rest: [sx * 1.25, front ? 1.2 : -1.85], toe: 0.2 });
      R.on(n + '_hip');
      MP.joint(F, 0, 0, 0, 0.26, 0.4, 'x', iron, br);
      F.chb(0, -0.42, 0, 0.42, 0.72, 0.5, 0.1, steel, 'paint', 'y');
      F.chb(0, -0.98, 0, 0.38, 0.5, 0.46, 0.1, or, 'paint', 'y');
      F.cb(sx * 0.2, -0.98, 0, 0.02, 0.4, 0.3, cr, 'paint');
      R.on(n + '_knee');
      MP.joint(F, 0, 0, 0, 0.21, 0.4, 'x', iron, br);
      F.chb(0, -0.38, 0, 0.36, 0.62, 0.42, 0.08, steel, 'paint', 'y');
      F.chb(0, -1.02, 0, 0.3, 0.76, 0.36, 0.08, dk, 'paint', 'y');
      MP.joint(F, 0, -L2T, 0, 0.15, 0.3, 'x', iron, null);
      F.chb(0, -0.5, -0.24, 0.26, 0.5, 0.06, 0.03, or, 'paint', 'x');
      MP.piston(F, R, n + '_hip', [0, -0.3, -0.3], n + '_knee', [0, -0.3, -0.24], 0.055, dk, c('chrome'));
      MP.hose(F, R, 'body', [sx * 0.6, -0.5, front ? 0.25 : -1.05], n + '_hip', [0, -0.55, 0.28], 0.075, hose, 0.15, 7);
      R.on(n + '_ankle');
      F.cy(0, -0.12, 0, 0.15, 0.19, 0.3, iron, 'metal', 'y', 10);
      F.chb(0, -0.25, 0.05, 0.42, 0.22, 0.42, 0.06, steel, 'paint', 'z');
      const tal = front ? 0.62 : 0.5;
      for (let k = 0; k < 3; k++) {
        const ang = (k - 1) * 0.45, dx = Math.sin(ang), dz = Math.cos(ang);
        F.rod(dx * 0.1, -0.28, dz * 0.12, dx * tal * 0.55, -0.3, dz * tal * 0.55, 0.06, gun, 'metal');
        F.rod(dx * tal * 0.55, -0.3, dz * tal * 0.55, dx * tal, -0.37, dz * tal, 0.045, gun, 'metal');
        F.cy(dx * (tal + 0.07), -0.36, dz * (tal + 0.07), 0.05, 0.004, 0.2, c('chrome'), 'chrome', 'y', 6, Math.PI / 2 + 0.35, Math.atan2(dx, dz), 0);
      }
      F.rod(0, -0.28, -0.08, 0, -0.36, -0.36, 0.05, gun, 'metal');
      F.cy(0, -0.37, -0.43, 0.04, 0.004, 0.16, c('chrome'), 'chrome', 'y', 6, -Math.PI / 2 - 0.35, 0, 0);
    }
  }
});

/* ---- kits/mechs/krator-mechs-iziz-testudo.js ---- */
/* ======================================================================
   Iziz mech: the Testudo (kits/mechs/krator-mechs-iziz-testudo.js)

   An Ancient foundation pile driver: a squat armoured box on short thick legs, no
   head at all, the operator sealed in the chest behind a plate like a sarcophagus lid
   with a vision slit. The right arm is the driver itself, a hammer on a ram that
   punches out of its housing; the left a three-fingered grab. The legions use it to
   break walls and stand in a gap. It carries a magazine of bolts it cannot fire (the
   Forgemasters took the launcher), the legion's open hand on its standard, and a
   bronze plaque with its cohort.
   ====================================================================== */
MECH({
  key: 'iz_testudo', name: 'Testudo', culture: 'iziz',
  role: 'breaker: pile-driver fist', origin: 'Ancient foundation pile driver',
  lore: 'It drove piles for towers no one remembers. Now it breaks gates. The operator is sealed behind the plate and sees through a slit; the cohort\'s name is on the bronze.',
  tags: { class: 'mech', type: ['war machine', 'heavy', 'siege'], drive: 'biped', crew: 1, pilot: 'chest', weapon: ['pile driver', 'claw'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['IX Cohort'],
  w: 5.0, d: 2.6, h: 7.3,
  data: { height: 4.7, mass: 22, crew: 1, pilot: 'chest', reach: 2.6, weapon: 'pneumatic pile driver and grab',
    engine: 'Ancient cell pack, pneumatic', armour: 'foundation-plate' },
  gait: { period: 2.1, duty: 0.66, stride: 0.95, lift: 0.24, bob: 0.055, sway: 0.11, roll: 0.05, twist: 0.06, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.1, 0, 0], arm_r_sh: [0.12, 0, 0] } },
  idle: { breathe: 0.025, scan: 0.1, look: 0 },
  anim: {
    idle: function (P, t, w) {
      const k = Math.max(0, Math.sin(t * 0.5 + 1)) * 0.25 * w;
      P.b.claw_f0 = [k, 0, 0]; P.b.claw_f1 = [k, 0, 0]; P.b.claw_th = [-k, 0, 0];
    }
  },
  attack: {
    kind: 'pile-driver punch', dur: 2.5,
    keys: [
      [0, {}],
      [0.6, { b: { torso: [0, -0.45, 0], arm_r_sh: [-0.25, 0, -0.1], arm_r_el: [-1.25, 0, 0], arm_l_sh: [-0.7, 0, 0.1], arm_l_el: [-0.4, 0, 0], body: [-0.06, 0, 0] },
        s: { body: [0, -0.1, -0.1] } }, 's'],
      [0.86, { b: { torso: [0.08, 0.38, 0], arm_r_sh: [-1.5, 0, 0.05], arm_r_el: [0.35, 0, 0], arm_l_sh: [-0.3, 0, 0.2], body: [0.16, 0, 0] },
        s: { body: [0, -0.2, 0.32] } }, 'i'],
      [0.94, { b: { torso: [0.08, 0.38, 0], arm_r_sh: [-1.5, 0, 0.05], arm_r_el: [0.35, 0, 0], arm_l_sh: [-0.3, 0, 0.2], body: [0.16, 0, 0] },
        s: { body: [0, -0.2, 0.32], ram: [0, -0.85, 0] } }, 'i'],
      [1.3, { b: { torso: [0.06, 0.34, 0], arm_r_sh: [-1.45, 0, 0.05], arm_r_el: [0.3, 0, 0], arm_l_sh: [-0.3, 0, 0.2], body: [0.13, 0, 0] },
        s: { body: [0, -0.18, 0.28], ram: [0, -0.8, 0] } }, 'o'],
      [1.7, { b: { torso: [0.04, 0.2, 0], arm_r_sh: [-1.2, 0, 0], arm_r_el: [0.1, 0, 0], body: [0.06, 0, 0] }, s: { body: [0, -0.1, 0.15] } }, 's'],
      [2.5, {}, 's']
    ],
    events: [{ t: 0.95, type: 'impact', at: 'ram_tip', r: 1.6 }]
  },

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');

    /* ---- hips */
    R.bone('body', null, 0, 1.68, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.7, 0.62, 1.25, 0.18, gun, 'metal', 'z');
    F.chb(0, -0.1, 0.62, 1.1, 0.42, 0.1, 0.06, steel, 'paint', 'x');
    for (const s of [-1, 1]) MP.joint(F, s * 0.82, -0.08, 0, 0.34, 0.36, 'x', iron, br);

    /* ---- the sarcophagus */
    R.bone('torso', 'body', 0, 0.32, 0);
    R.on('torso');
    F.cy(0, 0.0, 0, 0.55, 0.55, 0.3, iron, 'metal', 'y', 14);
    F.chb(0, 1.12, -0.12, 2.55, 2.0, 2.05, 0.42, steel, 'paint', 'z');
    F.chb(0, 2.18, -0.12, 2.2, 0.24, 1.8, 0.2, dk, 'metal', 'x');
    F.chb(0, 0.22, 0.3, 1.9, 0.35, 1.2, 0.12, dk, 'metal', 'x');
    /* the plate over the operator: orange, a bronze frame, the sun, the slit, the cohort's plaque */
    F.chb(0, 1.12, 0.95, 1.05, 1.6, 0.2, 0.14, or, 'paint', 'x');
    for (const s of [-1, 1]) {
      F.cb(s * 0.55, 1.12, 1.0, 0.1, 1.66, 0.14, br, 'bronze');
      F.cb(0, 1.12 + s * 0.83, 1.0, 1.2, 0.1, 0.14, br, 'bronze');
    }
    F.cb(0, 1.72, 1.07, 0.66, 0.07, 0.04, c('eye'), 'glow');
    F.cb(0, 1.81, 1.07, 0.8, 0.08, 0.08, iron, 'metal');
    IZ.sun(F, 0, 1.28, 1.08, 0, 0, 1, 0.34);
    F.cb(0, 0.66, 1.08, 0.8, 0.34, 0.05, br, 'bronze');
    IZ.numeral(F, 0, 0.66, 1.12, 'IX', 0.2, c('iron'));
    /* the cables either side of the plate */
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const x = s * (0.7 + k * 0.08), col = [c('crimson'), c('fGold'), c('rubber')][k];
      F.rod(x, 0.55, 1.0, x, 1.75, 0.98, 0.04, col, 'rubber');
    }
    for (const s of [-1, 1]) {
      F.chb(s * 1.08, 1.0, 0.9, 0.35, 1.3, 0.25, 0.08, dk, 'metal', 'x');
      for (let k = 0; k < 2; k++) F.cy(s * 1.1, 0.75 + k * 0.32, 1.03, 0.09, 0.09, 0.06, iron, 'metal', 'z', 10);
      IZ.phalerae(F, s * 1.1, 1.55, 1.04, 0, 0, 1, 2, 0.24, 0.1);
    }
    /* top: exhaust stacks, the bolt magazine, vents */
    for (const s of [-1, 1]) {
      F.cy(s * 0.6, 2.55, -0.85, 0.13, 0.12, 0.8, c('copper'), 'copper', 'y', 10);
      F.cy(s * 0.6, 2.96, -0.85, 0.16, 0.16, 0.08, iron, 'metal', 'y', 10);
    }
    F.cy(0, 2.52, -0.15, 0.36, 0.36, 0.9, dk, 'metal', 'z', 12);
    for (let k = 0; k < 6; k++) {
      const a = k * TAU / 6;
      F.cy(Math.cos(a) * 0.2, 2.52 + Math.sin(a) * 0.2, 0.32, 0.075, 0.075, 0.08, br, 'bronze', 'z', 8);
      F.cy(Math.cos(a) * 0.2, 2.52 + Math.sin(a) * 0.2, 0.37, 0.04, 0.004, 0.12, iron, 'metal', 'z', 6, Math.PI / 2, 0, 0);
    }
    F.cb(0, 2.3, -0.15, 0.3, 0.2, 0.5, iron, 'metal');
    for (let i = 0; i < 5; i++) F.cb(0, 0.65 + i * 0.2, -1.17, 1.5, 0.06, 0.05, iron, 'metal');

    /* ---- arms: the driver (right), the grab (left) */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.48, 1.62, -0.05, 0, 0, s * 0.16);
      R.on(A + '_sh');
      MP.joint(F, -s * 0.15, 0, 0, 0.36, 0.5, 'x', iron, br);
      F.chb(s * 0.12, 0.18, 0, 1.05, 0.82, 1.2, 0.32, or, 'paint', 'z');
      F.cb(s * 0.12, -0.22, 0, 1.08, 0.07, 1.22, cr, 'paint');
      F.cb(s * 0.12, 0.6, 0, 0.8, 0.06, 0.9, br, 'bronze');
      if (s > 0) IZ.sun(F, s * 0.66, 0.2, 0, 1, 0, 0, 0.28);
      else IZ.phalera(F, s * 0.66, 0.2, 0, -1, 0, 0, 0.2);
      F.chb(0, -0.5, 0, 0.6, 0.8, 0.62, 0.12, steel, 'paint', 'y');
      R.bone(A + '_el', A + '_sh', 0, -0.95, 0, -0.4, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.27, 0.72, 'x', iron, br);
      MP.piston(F, R, A + '_sh', [0, -0.3, 0.33], A + '_el', [0, -0.35, 0.36], 0.06, dk, c('chrome'));
      MP.hose(F, R, 'torso', [s * 1.2, 1.9, -0.7], A + '_sh', [s * 0.1, -0.3, -0.34], 0.05, c('rubber'), 0.18);
    }
    /* the driver: housing, bands, the ram */
    R.on('arm_r_el');
    F.cy(0, -0.62, 0.04, 0.44, 0.44, 1.2, gun, 'metal', 'y', 16);
    for (const y of [-0.2, -0.62, -1.05]) F.cy(0, y, 0.04, 0.47, 0.47, 0.1, or, 'paint', 'y', 16);
    F.cy(0, -0.62, 0.04, 0.48, 0.48, 0.04, cr, 'paint', 'y', 16);
    F.cy(0, -1.24, 0.04, 0.36, 0.42, 0.1, iron, 'metal', 'y', 14);
    R.bone('ram', 'arm_r_el', 0, -1.3, 0.04);
    R.on('ram');
    F.cy(0, 0.35, 0, 0.17, 0.17, 0.9, c('chrome'), 'chrome', 'y', 12);
    F.chb(0, -0.2, 0, 0.78, 0.44, 0.78, 0.14, dk, 'metal', 'y');
    F.cy(0, -0.45, 0, 0.3, 0.36, 0.08, iron, 'metal', 'y', 12);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; F.cy(Math.cos(a) * 0.3, -0.05, Math.sin(a) * 0.3, 0.05, 0.05, 0.06, br, 'bronze', 'y', 6); }
    R.point('ram_tip', 'ram', 0, -0.5, 0);
    /* the grab */
    R.on('arm_l_el');
    F.chb(0, -0.5, 0.02, 0.64, 0.95, 0.66, 0.12, steel, 'paint', 'y');
    F.chb(0.34, -0.45, 0.02, 0.06, 0.6, 0.5, 0.03, or, 'paint', 'y');
    R.bone('arm_l_wr', 'arm_l_el', 0, -1.0, 0.02, 0.4, 0, 0);
    R.on('arm_l_wr');
    F.chb(0, -0.15, 0, 0.62, 0.36, 0.6, 0.1, dk, 'metal', 'x');
    const fingers = [['claw_f0', 0.2, 0.18], ['claw_f1', -0.2, 0.18], ['claw_th', 0, -0.24]];
    for (const fd of fingers) {
      R.bone(fd[0], 'arm_l_wr', fd[1], -0.3, fd[2], fd[2] < 0 ? -0.35 : 0.35, 0, 0);
      R.on(fd[0]);
      const sg = fd[2] < 0 ? -1 : 1;
      F.chb(0, -0.22, 0, 0.16, 0.46, 0.18, 0.04, gun, 'metal', 'y');
      F.chb(0, -0.5, sg * 0.1, 0.14, 0.3, 0.14, 0.04, gun, 'metal', 'y', sg * 0.6, 0, 0);
      F.cy(0, -0.66, sg * 0.22, 0.06, 0.005, 0.16, br, 'bronze', 'y', 6, Math.PI - sg * 0.9, 0, 0);
      MP.joint(F, 0, 0, 0, 0.08, 0.2, 'x', iron, null);
    }

    /* ---- legs: short, thick, wide */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.86, -0.1, 0], L1: 0.76, L2: 0.72, knee: 1, ankleH: 0.46, rest: [s * 0.98, 0.05], phase: s > 0 ? 0 : 0.5, toe: 0.2 });
      R.on(Lg + '_hip');
      F.chb(0, -0.38, 0, 0.66, 0.7, 0.76, 0.14, steel, 'paint', 'y');
      F.chb(s * 0.355, -0.36, 0, 0.06, 0.56, 0.6, 0.03, or, 'paint', 'y');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.27, 0.66, 'x', iron, br);
      F.chb(0, 0.0, 0.33, 0.52, 0.4, 0.18, 0.08, or, 'paint', 'x');
      F.chb(0, -0.38, 0.0, 0.7, 0.72, 0.78, 0.16, dk, 'paint', 'y');
      F.chb(0, -0.35, 0.4, 0.5, 0.56, 0.06, 0.03, steel, 'paint', 'x');
      MP.piston(F, R, Lg + '_hip', [0, -0.15, -0.38], Lg + '_knee', [0, -0.3, -0.4], 0.07, dk, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'stomp', w: 0.92, l: 1.15, ankleH: 0.46, plate: steel, iron: gun, trim: br, toes: 3 });
    }

    /* ---- dressing: the standard with the open hand, feathers at the pauldrons */
    IZ.vexillum(F, R, 'vex', 'torso', -0.75, 2.25, -1.05, { h: 2.6, w: 0.75, bh: 0.85, finial: 'hand', paint: IZ.paint(F, 'legion', { numeral: 'IX' }), discs: 3 });
    IZ.feathers(F, R, 'fth_l', 'arm_l_sh', 0.62, -0.2, 0.55, { n: 6, len: 0.6 });
    IZ.feathers(F, R, 'fth_r', 'arm_r_sh', -0.62, -0.2, 0.55, { n: 6, len: 0.6, cols: ['fBlack', 'fWhite', 'fScarlet'] });
  }
});

/* ---- kits/mechs/mechs-runtime.js ---- */
/* ======================================================================
   Krator Mechs: the runtime (kits/mechs/mechs-runtime.js)

   The API the bundle returns as the single global `KratorMechs` (KM below).
   mech_bundle.py wraps the catalog core, the culture symbols, the vehicle frame,
   mechs-core.js, mechs-parts.js, the culture files and this file in ONE closure;
   nothing else leaks. It needs only THREE (r128).

     KM.list()                          -> [{ key, name, culture, role, origin, tags, variants, variantNames, w, d, h, data }]
     KM.build(key, { variant, seed, linear })  -> THREE.Group (posed standing; null for an unknown key)
     KM.update(group, dt, { ground })   advance and pose it; returns the events of this step (fire, impact, step)
     KM.setState(group, 'idle'|'walk')  KM.attack(group) -> the clip's length; KM.state(group)
     KM.speed(group)                    the ground speed (m/s) the host moves it at while walking, so its feet do not slide
     KM.lights(group, on)               lamps and eye slits; KM.projectile(kind) -> a bolt, harpoon or rivet to fly
     KM.useTextures({ plate, metal, bronze, cloth, banner })   library detail maps (see API.md)
     KM.has, KM.get, KM.cultures, KM.palette, KM.dataOf, KM.setDetail, KM.dispose, KM.reset

   The group: its root bone ('body' and anything else without a parent), up to six SkinnedMeshes on one
   Skeleton (mesh:plate, mesh:metal, mesh:bronze, mesh:cloth, mesh:glass, mesh:glow), and one cloth mesh per
   banner, hung on its bone. The bones are the rig's (KM.get(key) to read the entry; group.userData.bones the
   names). The host moves and turns the group; the feet stay where they were planted while it does.

   Colours: the palettes are sRGB; the merged vertex colours are LINEAR unless { linear:false }.
   ====================================================================== */
const KM_API = (function () {
  const API = {};
  const V3 = THREE.Vector3, Q = THREE.Quaternion;
  const clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  const smooth = function (u) { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
  const EASE = {
    l: function (u) { return u; }, s: smooth,
    i: function (u) { return u * u * u; }, o: function (u) { return 1 - Math.pow(1 - u, 3); },
    b: function (u) { const c = 1.7; u -= 1; return 1 + u * u * ((c + 1) * u + c); }
  };
  /* smooth deterministic noise in about [-1, 1] */
  function wob(t) { return (Math.sin(t) + 0.6 * Math.sin(2.17 * t + 1.3) + 0.3 * Math.sin(4.31 * t + 0.7)) / 1.9; }

  /* ------------------------------------------------------------ materials (shared by every mech) */
  const TEX = {};
  let MATS = null;
  /* [roughness, metalness, bump]: the bump is kept low on the fine metal maps, which alias into sparkle at a distance */
  const LOOK = { plate: [0.62, 0.25, 0.4], livery: [0.58, 0.2, 0.45], metal: [0.45, 0.6, 0.25], bronze: [0.34, 0.75, 0.35], cloth: [0.92, 0.0, 0.35], hair: [0.7, 0.0, 0.3] };
  function std(b) { const L = LOOK[b]; return new THREE.MeshStandardMaterial({ vertexColors: true, roughness: L[0], metalness: L[1], skinning: true }); }
  function mats() {
    if (MATS) return MATS;
    MATS = { plate: std('plate'), livery: std('livery'), metal: std('metal'), bronze: std('bronze'), cloth: std('cloth'), hair: std('hair'),
      glass: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.06, metalness: 0.3, transparent: true, opacity: 0.38,
        depthWrite: false, skinning: true, side: THREE.DoubleSide }) };
    for (const b of DETAIL) attachDetail(b);
    return MATS;
  }
  const DETAIL = ['plate', 'livery', 'metal', 'bronze', 'cloth', 'hair'];
  /* a library set as a DETAIL map sampled by triplanar projection of the bind-pose position (no UVs; the
     pattern rides on the part), its mean brightness divided back out, and its luminance as a bump */
  function attachDetail(b) {
    const T = TEX[b], m = MATS && MATS[b];
    if (!T || !m) return;
    m.map = T.map;
    const tile = 1 / (T.scale || 1), gain = 1 / Math.max(0.05, Math.pow(T.mean || 0.5, 2.2)), bump = T.bump == null ? LOOK[b][2] : T.bump;
    const chip = T.chip;   /* livery: where the paint has chipped (dark in the map) the vertex colour gives way to bare steel */
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uDetTile = { value: tile }; sh.uniforms.uDetGain = { value: gain }; sh.uniforms.uDetBump = { value: bump * 0.01 };   /* metres of relief per unit of detail brightness */
      sh.uniforms.uChip = { value: new THREE.Vector3(chip ? chip[0] : -2, chip ? chip[1] : -1, 0) };
      sh.uniforms.uChipCol = { value: new THREE.Color(chip ? chip[2] : 0x000000).convertSRGBToLinear() };
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vDetP;\nvarying vec3 vDetN;\n')
        .replace('#include <uv_vertex>', '#include <uv_vertex>\n  vDetP = position;\n  vDetN = normal;\n');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vDetP;\nvarying vec3 vDetN;\nuniform float uDetTile;\nuniform float uDetGain;\nuniform float uDetBump;\nuniform vec3 uChip;\nuniform vec3 uChipCol;\n' +
          'vec3 kmBump(vec3 p, vec3 n, float h){ vec3 dpx = dFdx(p), dpy = dFdy(p); float dhx = dFdx(h), dhy = dFdy(h);\n' +
          '  vec3 r1 = cross(dpy, n), r2 = cross(n, dpx); float det = dot(dpx, r1); vec3 g = sign(det) * (dhx * r1 + dhy * r2);\n' +
          '  return normalize(abs(det) * n - g); }\n')
        .replace('#include <map_fragment>', [
          'float detL = 0.5; float kmPaint = 1.0;',
          '#ifdef USE_MAP',
          '  vec3 dW = pow(abs(normalize(vDetN)) + 1e-4, vec3(4.0)); dW /= (dW.x + dW.y + dW.z);',
          '  vec3 dP = vDetP * uDetTile;',
          '  vec4 texelColor = texture2D(map, dP.zy) * dW.x + texture2D(map, dP.xz) * dW.y + texture2D(map, dP.xy) * dW.z;',
          '  texelColor = mapTexelToLinear(texelColor);',
          '  detL = dot(texelColor.rgb, vec3(0.299, 0.587, 0.114)) * uDetGain;',
          '  diffuseColor.rgb *= texelColor.rgb * uDetGain;',
          '  kmPaint = smoothstep(uChip.x, uChip.y, detL);',
          '#endif'].join('\n'))
        .replace('#include <color_fragment>', '#ifdef USE_COLOR\n  diffuseColor.rgb *= mix(uChipCol, vColor, kmPaint);\n#endif')
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = clamp(roughnessFactor * mix(1.18, 0.82, clamp(detL, 0.0, 1.5) * 0.66), 0.04, 1.0);')
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n  normal = kmBump(-vViewPosition, normal, detL * uDetBump);');
    };
    m.extensions = { derivatives: true };
    m.customProgramCacheKey = function () { return 'km-detail'; };
    m.needsUpdate = true;
  }
  function loadTex(src, repeat) {
    if (!src) return null;
    const t = src.isTexture ? src : new THREE.TextureLoader().load(src);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    if (repeat) t.repeat.set(repeat[0], repeat[1]);
    return t;
  }
  /* { plate:{ src, scale, mean, bump }, metal, bronze, cloth, banner:{ src, cell } }: src a URL (or data URL) or a THREE.Texture */
  API.useTextures = function (o) {
    o = o || {};
    for (const b of DETAIL) {
      if (!o[b]) continue;
      TEX[b] = { map: loadTex(o[b].src || o[b].map), scale: o[b].scale || 1, mean: o[b].mean || 0.5, bump: o[b].bump,
        chip: o[b].chip || (b === 'livery' ? [0.42, 0.62, 0x6a6862] : null) };
      attachDetail(b);
    }
    if (o.banner) TEX.banner = { src: o.banner.src || o.banner.map, cell: o.banner.cell || 0.9 };
    if (o.sunbanner) { const z = o.sunbanner.size || o.sunbanner.scale || 2; TEX.sunbanner = { src: o.sunbanner.src || o.sunbanner.map, size: Array.isArray(z) ? z : [z, z] }; }
    return Object.keys(TEX);
  };

  /* ------------------------------------------------------------ banners: painted on a canvas, flutter on the CPU */
  function css(c) { return '#' + ('000000' + ((c >>> 0) & 0xffffff).toString(16)).slice(-6); }
  const _bannerTex = new Map();
  function bannerTexture(P, w, h) {
    const key = JSON.stringify(P) + '|' + w.toFixed(2) + 'x' + h.toFixed(2);
    if (_bannerTex.has(key)) return _bannerTex.get(key);
    let tex;
    if (P.pattern === 'sun' && TEX.sunbanner) {
      /* the sun sheet: a window from the middle of one tile (the generated sheet is not quite periodic, so no wrap) */
      tex = new THREE.TextureLoader().load(TEX.sunbanner.src);
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
      const S = TEX.sunbanner.size, rx = Math.min(0.92, w / S[0]), ry = Math.min(0.92, h / S[1]);
      tex.repeat.set(rx, ry); tex.offset.set((1 - rx) / 2, (1 - ry) / 2);
    } else if (P.pattern === true && TEX.banner) {
      tex = new THREE.TextureLoader().load(TEX.banner.src && TEX.banner.src.isTexture ? TEX.banner.src.image.src : TEX.banner.src);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
      tex.repeat.set(w / (TEX.banner.cell * 3), h / (TEX.banner.cell * 3));
    } else {
      const ppm = 160, W = Math.max(48, Math.min(512, Math.round(w * ppm))), H = Math.max(48, Math.min(768, Math.round(h * ppm)));
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d');
      g.fillStyle = css(P.field); g.fillRect(0, 0, W, H);
      const e = Math.round(Math.min(W, H) * 0.07);
      if (P.edge != null) { g.fillStyle = css(P.edge); g.fillRect(0, 0, e, H); g.fillRect(W - e, 0, e, H); }
      if (P.band != null) { g.fillStyle = css(P.band); g.fillRect(0, 0, W, e * 1.4); g.fillRect(0, H - e * 1.4, W, e * 1.4); }
      if (P.stripes) {
        const n = P.stripes.length;
        for (let i = 0; i < n * 3; i++) { g.fillStyle = css(P.stripes[i % n]); g.fillRect(0, i * H / (n * 3), W, H / (n * 3) + 1); }
      }
      const R0 = Math.min(W, H) * 0.34, cx = W / 2, cy = P.sym === 'numeral' ? H * 0.36 : H * (P.symY || 0.45);
      const ink = css(P.ink != null ? P.ink : 0xf1dba6), ink2 = css(P.ink2 != null ? P.ink2 : P.field);
      if (P.sym === 'sun' || P.sym === 'numeral') {
        /* the Iziz sun (core/sockets/38-symbols.js) inside a ring of rays */
        g.fillStyle = ink;
        for (let k = 0; k < 16; k++) {
          const a = k * Math.PI / 8, r1 = R0 * 0.98, r2 = R0 * (k % 2 ? 1.18 : 1.32);
          g.beginPath(); g.moveTo(cx + Math.cos(a - 0.11) * r1, cy + Math.sin(a - 0.11) * r1);
          g.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); g.lineTo(cx + Math.cos(a + 0.11) * r1, cy + Math.sin(a + 0.11) * r1); g.fill();
        }
        SYMBOLS.sun(g, cx, cy, R0, ink, ink2);
      } else if (P.sym === 'orb') {
        /* the palace orb: a ring crossed by a long upright bar and a short cross bar (the Iziz banner device) */
        g.strokeStyle = ink; g.lineWidth = R0 * 0.22;
        g.beginPath(); g.arc(cx, cy, R0 * 0.72, 0, Math.PI * 2); g.stroke();
        g.fillStyle = ink; g.fillRect(cx - R0 * 0.1, cy - R0 * 1.12, R0 * 0.2, R0 * 2.24); g.fillRect(cx - R0 * 0.42, cy - R0 * 0.08, R0 * 0.84, R0 * 0.16);
        g.strokeStyle = css(P.line != null ? P.line : 0x9c2d2d); g.lineWidth = Math.max(1, R0 * 0.04);
        g.beginPath(); g.arc(cx, cy, R0 * 0.86, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(cx, cy, R0 * 0.58, 0, Math.PI * 2); g.stroke();
      }
      if (P.sym === 'numeral' && P.numeral) {
        /* a legion's number in bars (I, V, X), under the sun */
        g.fillStyle = ink;
        const s = P.numeral, ch = H * 0.16, cw = ch * 0.62, y0 = H * 0.66, bw = Math.max(2, ch * 0.16);
        let x = cx - (s.length * cw) / 2;
        for (const C of s) {
          if (C === 'I') g.fillRect(x + cw / 2 - bw / 2, y0, bw, ch);
          else if (C === 'V' || C === 'X') {
            g.save(); g.translate(x + cw / 2, y0 + ch / 2);
            for (const sgn of C === 'X' ? [-1, 1] : [-1, 1]) {
              g.save();
              if (C === 'X') { g.rotate(sgn * 0.55); g.fillRect(-bw / 2, -ch * 0.56, bw, ch * 1.12); }
              else { g.translate(sgn * cw * 0.18, 0); g.rotate(-sgn * 0.33); g.fillRect(-bw / 2, -ch / 2, bw, ch); }
              g.restore();
            }
            g.restore();
          }
          x += cw;
        }
        g.fillRect(cx - (s.length * cw) / 2, y0 - bw * 1.6, s.length * cw, bw); g.fillRect(cx - (s.length * cw) / 2, y0 + ch + bw * 0.6, s.length * cw, bw);
      }
      /* the weave and the wear: fine threads, a darker, dirtier foot */
      g.globalAlpha = 0.07; g.fillStyle = '#000';
      for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
      g.globalAlpha = 0.05;
      for (let x = 0; x < W; x += 3) g.fillRect(x, 0, 1, H);
      const grd = g.createLinearGradient(0, H * 0.55, 0, H);
      grd.addColorStop(0, 'rgba(40,30,20,0)'); grd.addColorStop(1, 'rgba(40,30,20,0.35)');
      g.globalAlpha = 1; g.fillStyle = grd; g.fillRect(0, 0, W, H);
      tex = new THREE.CanvasTexture(c);
      tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
    }
    _bannerTex.set(key, tex);
    return tex;
  }
  /* the cloth mesh. kind 'hang': hangs from its top edge (a crossbar), facing z. 'flag' / 'pennant': along its
     pole edge, trailing toward -z, facing x. Top-edge anchor at (x, y, z) of its bone, turned ry. */
  function clothMesh(B) {
    const nx = B.kind === 'hang' ? 6 : 8, ny = B.kind === 'hang' ? 8 : 5;
    const g = new THREE.PlaneGeometry(B.w, B.h, nx, ny);
    g.translate(B.w / 2, -B.h / 2, 0);                         /* x in [0, w], y in [-h, 0] */
    const p = g.attributes.position, uv = g.attributes.uv;
    const W = new Float32Array(p.count), S = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i);
      if (B.kind === 'hang') { x -= B.w / 2; W[i] = clamp(-y / B.h, 0, 1); S[i] = -y; p.setXYZ(i, x, y, 0); }
      else {
        const u = x / B.w;
        if (B.kind === 'pennant') y = -B.h / 2 + (y + B.h / 2) * (1 - 0.82 * u);
        W[i] = clamp(u, 0, 1); S[i] = x;
        p.setXYZ(i, 0, y, -x);
      }
    }
    g.computeVertexNormals();
    const tex = bannerTexture(B.paint, B.w, B.h);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.93, metalness: 0 }));
    m.position.set(B.x, B.y, B.z); m.rotation.y = B.ry || 0;
    m.name = 'banner:' + B.bone; m.castShadow = true; m.receiveShadow = true;
    return { mesh: m, base: Float32Array.from(p.array), W: W, S: S, def: B, seed: (B.x * 13.1 + B.y * 7.7 + B.z * 3.3) };
  }

  /* ------------------------------------------------------------ the build */
  function geomOf(b) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(b.col, 3));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(b.si, 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(b.sw, 4));
    g.computeBoundingSphere();
    g.boundingSphere.radius *= 1.3;
    return g;
  }
  API.list = function () {
    return MECHS.map(function (A) {
      return { key: A.key, name: A.name, culture: A.culture, role: A.role || '', origin: A.origin || '', lore: A.lore || '',
        tags: JSON.parse(JSON.stringify(A.tags || {})), variants: A.variants, variantNames: A.variantNames.slice(),
        w: A.w, d: A.d, h: A.h, data: mechData(A, 0) };
    });
  };
  API.has = function (key) { return !!MECH_BY_KEY[key]; };
  API.get = function (key) { return MECH_BY_KEY[key] || null; };
  API.dataOf = function (key, v) { const A = MECH_BY_KEY[key]; return A ? mechData(A, v) : null; };
  /* a variant's attack clip (variantAttack[v] or the entry's own) */
  API.clip = function (key, v) { const A = MECH_BY_KEY[key]; return A ? mechAttack(A, v) : null; };
  /* the z-fighting audit of a variant's rest pose (mechs-core.js mechAudit): [{ bone, a, b, n, meshes, at }] */
  API.audit = function (key, o) {
    o = o || {};
    const A = MECH_BY_KEY[key];
    if (!A) return null;
    const F = mechFrame({ seed: o.seed || 1, variant: o.variant | 0 });
    F.asset = A; F.data = mechData(A, o.variant | 0);
    const R = mechRig(), prev = _target;
    try { A.build(F, R); } finally { _target = prev; }
    return mechAudit(R, o);
  };
  API.cultures = function () { return Object.keys(MECH_CULTURES); };
  API.palette = function (culture) { return MECH_CULTURES[culture] ? Object.assign({}, FPAL[culture]) : null; };
  API.CLASSES = MECH_CLASSES; API.TYPES = MECH_TYPES; API.DRIVES = MECH_DRIVES; API.PILOTS = MECH_PILOTS; API.WEAPONS = MECH_WEAPONS;
  API.BUCKETS = MECH_BUCKETS;
  API.setDetail = function (k) { _LOD = Math.max(0.25, Math.min(1, +k || 1)); return _LOD; };

  API.build = function (key, o) {
    o = o || {};
    const A = MECH_BY_KEY[key];
    if (!A) { console.error('KratorMechs: no such mech', key); return null; }
    const v = Math.max(0, Math.min(A.variants - 1, o.variant | 0)), seed = o.seed || 1, linear = o.linear !== false;
    const data = mechData(A, v);
    const F = mechFrame({ seed: seed, variant: v });
    F.asset = A; F.data = data;
    const R = mechRig();
    const prev = _target;
    try { A.build(F, R); } finally { _target = prev; }
    if (!R.by.body) throw new Error('mech ' + key + ': no body bone');
    const B = mechMerge(R, linear);
    /* the bones */
    const bones = R.bones.map(function (b) {
      const bone = new THREE.Bone();
      bone.name = b.name;
      bone.position.set(b.p[0], b.p[1], b.p[2]);
      bone.quaternion.setFromEuler(new THREE.Euler(b.r[0], b.r[1], b.r[2], 'YXZ'));
      return bone;
    });
    const g = new THREE.Group();
    g.name = 'mech:' + key;
    R.bones.forEach(function (b, i) { if (b.parent) bones[R.by[b.parent].index].add(bones[i]); else g.add(bones[i]); });
    g.updateMatrixWorld(true);
    const skel = new THREE.Skeleton(bones);
    const M = mats();
    const glow = new THREE.MeshBasicMaterial({ vertexColors: true, skinning: true });
    let tris = 0;
    for (const k of MECH_BUCKETS) {
      if (!B[k] || !B[k].pos.length) continue;
      const mesh = new THREE.SkinnedMesh(geomOf(B[k]), k === 'glow' ? glow : M[k]);
      mesh.name = 'mesh:' + k; mesh.castShadow = k !== 'glass' && k !== 'glow'; mesh.receiveShadow = k !== 'glow';
      if (k === 'glass') mesh.renderOrder = 2;
      g.add(mesh); mesh.bind(skel);
      tris += B[k].pos.length / 9;
    }
    /* the banners, hung on their bones */
    const cloth = R.banners.map(function (Bn) { const c = clothMesh(Bn); bones[R.by[Bn.bone].index].add(c.mesh); tris += c.mesh.geometry.index.count / 3; return c; });
    /* the animation state */
    const by = {};
    bones.forEach(function (b) { by[b.name] = b; });
    const rest = bones.map(function (b) { return { p: b.position.clone(), q: b.quaternion.clone() }; });
    const legBone = {};
    const legs = R.legs.map(function (L) {
      for (const s of ['_yaw', '_hip', '_knee', '_ankle']) legBone[L.name + s] = 1;
      return { def: L, yaw: by[L.name + '_yaw'], hip: by[L.name + '_hip'], knee: by[L.name + '_knee'], ankle: by[L.name + '_ankle'],
        plant: new V3(), from: new V3(), to: new V3(), swing: false, u: 0, lastP: 0, pitch: 0 };
    });
    const dangle = {};
    const dang = R.dangles.map(function (D) { dangle[D.name] = 1; return { def: D, bone: by[D.name], ax: 0, az: 0, vx: 0, vz: 0, p0: null, v0: null, acc: new V3() }; });
    const spin = {};
    const spins = R.spins.map(function (S) { spin[S.name] = S; return { def: S, bone: by[S.name], ang: 0 }; });
    const st = { A: A, variant: v, attack: mechAttack(A, v), key: key, bones: bones, by: by, rest: rest, legs: legs, legBone: legBone, dang: dang, dangle: dangle,
      spins: spins, spin: spin, cloth: cloth, points: R.points, glow: glow, t: 0, mode: 'idle', resume: 'idle', walkW: 0,
      phase: 0, atk: -1, atkW: 0, vel: new V3(), last: null, gq: new Q(), reach: 0, events: [], planted: false,
      gait: A.gait, mass: data.mass || 10 };
    g.userData = { key: key, name: A.name, culture: A.culture, role: A.role || '', origin: A.origin || '',
      tags: JSON.parse(JSON.stringify(A.tags || {})), kind: 'mech', variant: v, variantName: A.variantNames[v] || '', seed: seed,
      w: A.w, d: A.d, h: A.h, tris: Math.round(tris), bones: bones.map(function (b) { return b.name; }),
      legs: R.legs.map(function (L) { return { name: L.name, L1: L.L1, L2: L.L2, knee: L.knee, splay: L.splay, ankleH: L.ankleH, rest: L.rest.slice() }; }),
      points: JSON.parse(JSON.stringify(R.points)), data: data, lightsOn: true };
    Object.defineProperty(g.userData, '_mech', { value: st, enumerable: false });
    API.lights(g, true);
    pose(g, st, 0, null);
    st.planted = false; st.last = null; st.reach = 0;     /* the first update plants the feet wherever the host has put it */
    return g;
  };

  /* ------------------------------------------------------------ the pose layers */
  function add(P, k, name, x, y, z) { const a = P[k][name] || (P[k][name] = [0, 0, 0]); a[0] += x; a[1] += y; a[2] += z; }
  function layerIdle(st, P, t, w) {
    if (w <= 0) return;
    const I = st.A.idle;
    add(P, 's', 'body', 0.018 * Math.sin(t * 0.31) * w, -I.breathe * (0.5 + 0.5 * Math.sin(t * 1.25)) * w, 0);
    add(P, 'b', 'body', 0.012 * Math.sin(t * 1.25 + 0.6) * w, 0, 0.01 * Math.sin(t * 0.31 + 1) * w);
    if (st.by.torso) add(P, 'b', 'torso', 0.02 * wob(t * 0.5 + 2) * w, I.scan * wob(t * 0.19) * w, 0);
    if (st.by.head) add(P, 'b', 'head', 0.07 * wob(t * 0.31 + 3) * w, I.look * wob(t * 0.23 + 7) * w, 0);
    for (const b of st.bones) if (/_pilotHead$/.test(b.name)) add(P, 'b', b.name, 0.12 * wob(t * 0.37 + 5) * w, 0.55 * wob(t * 0.29 + 11) * w, 0);
    if (st.A.anim.idle) st.A.anim.idle(P, t, w, st);
  }
  function stanceOf(p, duty) {     /* 1 in stance, 0 in swing, with soft edges */
    const e = 0.06;
    return smooth(p / e) * smooth((duty - p) / e) + (p > duty ? smooth((p - 1 + e) / e) * 0 : 0);
  }
  function layerWalk(st, P, ph, w) {
    if (w <= 0) return;
    const G = st.gait, n = st.legs.length;
    let bob = 0, side = 0, tw = 0;
    st.legs.forEach(function (L, i) {
      const p = (ph + (G.offsets[i] || 0)) % 1, s = L.def.hip[0] >= 0 ? 1 : -1;
      const d = p - 0.07, dd = Math.min(Math.abs(d), Math.abs(d - 1), Math.abs(d + 1));
      bob += Math.exp(-(dd * dd) / (0.11 * 0.11));
      side += s * stanceOf(p, G.duty);
      tw += s * Math.cos(TAU * p);
    });
    side /= Math.max(1, n / 2); tw /= n;
    add(P, 's', 'body', (G.sway || 0) * side * w, -(G.bob || 0) * bob * w, 0);
    add(P, 'b', 'body', (G.lean || 0) * w, -(G.twist || 0) * tw * w, -(G.roll || 0) * side * w);
    if (st.by.torso) add(P, 'b', 'torso', 0, (G.twist || 0) * 0.7 * tw * w, (G.roll || 0) * 0.5 * side * w);
    const arms = G.arms || {};
    for (const bn in arms) {
      const a = arms[bn], li = a[3] != null ? a[3] : (/_l(_|$)|L$/.test(bn) ? 0 : 1);
      const c = Math.cos(TAU * ((ph + (G.offsets[li] || 0)) % 1) - 0.4);
      add(P, 'b', bn, a[0] * c * w, a[1] * c * w, a[2] * c * w);
    }
    if (st.A.anim.walk) st.A.anim.walk(P, ph, w, st);
  }
  function layerAttack(st, P, a, w) {
    const K = st.attack.keys;
    if (w <= 0 || !K || K.length < 2) return;
    let i = 0;
    while (i < K.length - 2 && a >= K[i + 1][0]) i++;
    const k0 = K[i], k1 = K[i + 1], u = (EASE[k1[2] || 's'] || smooth)(clamp((a - k0[0]) / Math.max(1e-6, k1[0] - k0[0]), 0, 1));
    for (const ch of ['b', 's']) {
      const A0 = k0[1][ch] || {}, A1 = k1[1][ch] || {};
      const names = Object.keys(A0).concat(Object.keys(A1).filter(function (n) { return !(n in A0); }));
      for (const nm of names) {
        const x = A0[nm] || [0, 0, 0], y = A1[nm] || [0, 0, 0];
        add(P, ch, nm, (x[0] + (y[0] - x[0]) * u) * w, (x[1] + (y[1] - x[1]) * u) * w, (x[2] + (y[2] - x[2]) * u) * w);
      }
    }
    const S0 = k0[1].sc || {}, S1 = k1[1].sc || {};
    for (const nm of Object.keys(S0).concat(Object.keys(S1).filter(function (n) { return !(n in S0); }))) {
      const x = S0[nm] == null ? 1 : S0[nm], y = S1[nm] == null ? 1 : S1[nm];
      P.sc[nm] = (P.sc[nm] == null ? 1 : P.sc[nm]) * (1 + (x + (y - x) * u - 1) * w);
    }
  }

  /* ------------------------------------------------------------ legs: planting, stepping, IK */
  const _T = new V3(), _P = new V3(), _S = new V3(), _q1 = new Q(), _q2 = new Q(), _e = new THREE.Euler(), _m = new THREE.Matrix4();
  function restWorld(g, L, out) { return out.set(L.def.rest[0], L.def.ankleH, L.def.rest[1]).applyMatrix4(g.matrixWorld); }
  function groundAt(g, opt, v) { return opt && opt.ground ? opt.ground(v.x, v.z) : g.matrixWorld.elements[13]; }
  function solveLeg(st, L, T, pitch) {
    const d = L.def, yaw = L.yaw;
    _T.copy(T); yaw.parent.worldToLocal(_T);
    const dx = _T.x - yaw.position.x, dy = _T.y - yaw.position.y, dz = _T.z - yaw.position.z;
    let ya = 0, roll = 0, r, h;
    if (d.splay) { ya = Math.atan2(dx, dz); r = Math.hypot(dx, dz); h = dy; }
    else { roll = Math.atan2(dx, -dy); r = dz; h = -Math.hypot(dx, dy); }
    const L1 = d.L1, L2 = d.L2;
    let D = Math.hypot(r, h);
    st.reach = Math.max(st.reach, D / (L1 + L2));
    D = clamp(D, Math.abs(L1 - L2) + 1e-3, (L1 + L2) * 0.9995);
    const ft = Math.atan2(r, -h);
    const a = Math.acos(clamp((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D), -1, 1));
    const k = Math.acos(clamp((L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2), -1, 1));
    const s = d.knee, f1 = ft + s * a;
    yaw.quaternion.setFromEuler(_e.set(0, ya, roll, 'YZX'));
    L.hip.quaternion.setFromEuler(_e.set(-f1, 0, 0, 'XYZ'));
    L.knee.quaternion.setFromEuler(_e.set(s * (Math.PI - k), 0, 0, 'XYZ'));
    yaw.updateMatrixWorld(true);
    L.knee.matrixWorld.decompose(_P, _q1, _S);
    _q2.setFromEuler(_e.set(pitch, d.footYaw * ya, 0, 'YXZ')).premultiply(st.gq);
    L.ankle.quaternion.copy(_q1.invert().multiply(_q2));
    L.ankle.updateMatrixWorld(true);
  }
  function stepLegs(g, st, dt, opt, walking) {
    const G = st.gait, Ts = (1 - G.duty) * G.period;
    if (!st.planted) {
      for (const L of st.legs) { restWorld(g, L, L.plant); L.plant.y = groundAt(g, opt, L.plant) + L.def.ankleH; }
      st.planted = true;
    }
    let swinging = 0;
    for (const L of st.legs) if (L.swing) swinging++;
    st.legs.forEach(function (L, i) {
      const p = (st.phase + (G.offsets[i] || 0)) % 1;
      /* start a step: on the phase while walking; when standing, put back a foot that has strayed */
      if (!L.swing) {
        let go = false, late = false;
        if (walking) {
          go = L.lastP < G.duty && p >= G.duty;
          /* a foot left far behind (the host outran the gait, or turned hard) steps at once, from the start of a swing */
          if (!go) { restWorld(g, L, _T); go = late = Math.hypot(_T.x - L.plant.x, _T.z - L.plant.z) > G.stride * 1.05; }
        }
        else if (!swinging) {
          restWorld(g, L, _T);
          if (Math.hypot(_T.x - L.plant.x, _T.z - L.plant.z) > (G.settle || 0.12)) { go = true; swinging++; }
        }
        if (go) { L.swing = true; L.u = walking && !late ? clamp((p - G.duty) / (1 - G.duty), 0, 0.5) : 0; L.from.copy(L.plant); }
      }
      L.lastP = p;
      if (L.swing) {
        L.u += dt / Ts;
        restWorld(g, L, L.to);
        if (walking) L.to.addScaledVector(st.vel, Ts * Math.max(0, 1 - L.u) + G.duty * G.period / 2);
        L.to.y = groundAt(g, opt, L.to) + L.def.ankleH;
        if (L.u >= 1) {
          L.swing = false; L.plant.copy(L.to);
          st.events.push({ type: 'step', key: st.key, leg: L.def.name, pos: [L.plant.x, L.plant.y - L.def.ankleH, L.plant.z], mass: st.mass });
        }
      }
      let pitch = 0;
      if (L.swing) {
        const u = L.u, hu = smooth(Math.min(1, u / 0.85));
        _T.copy(L.from).lerp(L.to, hu);
        _T.y += (G.lift || 0.3) * Math.pow(Math.sin(Math.PI * u), u < 0.5 ? 0.7 : 1.5);
        pitch = L.def.toe * (0.6 * (1 - u) * (1 - u) - 0.5 * Math.sin(Math.PI * u) * u);
      } else {
        _T.copy(L.plant);
        if (walking) pitch = L.def.toe * 0.6 * smooth((p - G.duty * 0.72) / (G.duty * 0.28));
      }
      L.pitch += (pitch - L.pitch) * Math.min(1, dt * 20);
      solveLeg(st, L, _T, L.pitch);
    });
  }

  /* ------------------------------------------------------------ dangles, spins, cloth */
  const _a = new V3(), _gv = new V3();
  function stepDangles(st, dt) {
    for (const D of st.dang) {
      const d = D.def, b = D.bone, par = b.parent;
      _P.copy(b.position).applyMatrix4(par.matrixWorld);
      par.matrixWorld.decompose(_S, _q1, _gv);
      _q1.invert();
      const gl = _gv.set(0, -1, 0).applyQuaternion(_q1);
      if (!D.p0) {
        D.p0 = _P.clone(); D.v0 = new V3();
        /* a hanging thing starts at rest, plumb under its pivot */
        if (d.mode !== 'whip') { D.ax = clamp(Math.atan2(-gl.z, -gl.y), -d.max, d.max); D.az = clamp(Math.atan2(gl.x, -gl.y), -d.max, d.max); }
      }
      if (dt > 0) {
        const v = _a.copy(_P).sub(D.p0).divideScalar(dt);
        D.acc.lerp(v.clone().sub(D.v0).divideScalar(dt), 0.25);
        D.v0.copy(v); D.p0.copy(_P);
      }
      const al = _a.copy(D.acc).applyQuaternion(_q1);
      const n = Math.max(1, Math.ceil(dt / (1 / 60))), h = dt / n, wind = d.wind * (wob(st.t * 2.3 + d.len * 7) + 0.5 * wob(st.t * 5.1 + 3));
      for (let i = 0; i < n; i++) {
        let fx, fz;
        if (d.mode === 'whip') {
          fx = -d.k * D.ax - d.c * D.vx - al.z / d.len * 0.5 + wind * d.k;
          fz = -d.k * D.az - d.c * D.vz + al.x / d.len * 0.5 + wind * d.k * 0.6;
        } else {
          const ex = Math.atan2(-gl.z, -gl.y), ez = Math.atan2(gl.x, -gl.y);
          fx = -d.k * (D.ax - ex) - d.c * D.vx + al.z / d.len + wind * d.k;
          fz = -d.k * (D.az - ez) - d.c * D.vz - al.x / d.len + wind * d.k * 0.6;
        }
        D.vx += fx * h; D.vz += fz * h; D.ax += D.vx * h; D.az += D.vz * h;
        D.ax = clamp(D.ax, -d.max, d.max); D.az = clamp(D.az, -d.max, d.max);
      }
      b.quaternion.copy(st.rest[st.bones.indexOf(b)].q).multiply(_q2.setFromEuler(_e.set(D.ax, 0, D.az, 'XYZ')));
      b.updateMatrixWorld(true);
    }
  }
  function stepCloth(g, st) {
    const t = st.t, sp = st.vel.length();
    for (const C of st.cloth) {
      const B = C.def, m = C.mesh, p = m.geometry.attributes.position, A = (B.flutter || 0.05) + 0.035 * Math.min(sp, 2);
      /* the wind of walking, in the cloth's frame: a hanging banner billows away from where it is going */
      m.matrixWorld.decompose(_S, _q1, _gv);
      const vl = _a.copy(st.vel).applyQuaternion(_q1.invert());
      const bill = B.kind === 'hang' ? -vl.z * 0.12 : -vl.x * 0.1;
      for (let i = 0; i < p.count; i++) {
        const w = C.W[i], s = C.S[i], f = Math.pow(w, 1.3);
        const dsp = f * (A * Math.sin(t * 3.1 + C.seed - s * 4.2) + A * 0.5 * Math.sin(t * 5.3 + C.seed * 2 - s * 7.1)) + w * bill;
        if (B.kind === 'hang') p.setZ(i, C.base[i * 3 + 2] + dsp);
        else p.setX(i, C.base[i * 3] + dsp);
      }
      p.needsUpdate = true;
      m.geometry.computeVertexNormals();
    }
  }

  /* ------------------------------------------------------------ the step */
  function pose(g, st, dt, opt) {
    st.t += dt;
    g.updateMatrixWorld(true);
    g.matrixWorld.decompose(_P, st.gq, _S);
    /* a jump further than it could walk in a frame is a teleport (placed after building, moved by the host): plant afresh */
    if (st.last && _T.copy(_P).sub(st.last).length() > Math.max(1.5, 6 * mechSpeed(st.gait) * dt)) { st.planted = false; st.last = null; st.vel.set(0, 0, 0); }
    if (st.last && dt > 0) st.vel.lerp(_T.copy(_P).sub(st.last).divideScalar(dt), Math.min(1, dt * 8));
    st.last = (st.last || new V3()).copy(_P);
    const G = st.gait, walking = st.mode === 'walk' && st.atk < 0;
    st.walkW = clamp(st.walkW + (walking ? dt / 0.5 : -dt / 0.6), 0, 1);
    if (walking) st.phase = (st.phase + dt / G.period) % 1;
    /* the attack clip */
    let atkW = 0;
    if (st.atk >= 0) {
      const a0 = st.atk, AT = st.attack;
      st.atk += dt;
      for (const E of AT.events || []) if (E.t > a0 && E.t <= st.atk) fire(g, st, E);
      if (st.atk >= AT.dur) { st.atk = -1; st.mode = st.resume; }
      else atkW = smooth(Math.min(st.atk / 0.12, (AT.dur - st.atk) / 0.12, 1));
    }
    st.atkW = atkW;
    const P = { b: {}, s: {}, sc: {} };
    layerIdle(st, P, st.t, 1 - 0.75 * st.walkW);
    layerWalk(st, P, st.phase, st.walkW);
    if (st.atk >= 0) layerAttack(st, P, st.atk, 1);
    /* spins */
    for (const S of st.spins) {
      const r = S.def.rates, base = r.idle + (r.walk - r.idle) * st.walkW;
      S.ang = (S.ang + (base + ((r.attack || base) - base) * atkW) * dt) % TAU;
    }
    /* every bone but the legs' (IK) and the dangles' (springs): rest, then the pose on top */
    st.bones.forEach(function (b, i) {
      if (st.legBone[b.name] || st.dangle[b.name]) return;
      const R0 = st.rest[i], rot = P.b[b.name], sl = P.s[b.name], sc = P.sc[b.name], S = st.spin[b.name];
      b.position.copy(R0.p);
      if (sl) { b.position.x += sl[0]; b.position.y += sl[1]; b.position.z += sl[2]; }
      b.quaternion.copy(R0.q);
      if (rot) b.quaternion.multiply(_q1.setFromEuler(_e.set(rot[0], rot[1], rot[2], 'YXZ')));
      if (S) {
        const sa = st.spins.find(function (x) { return x.def === S; }).ang;
        b.quaternion.multiply(_q1.setFromEuler(_e.set(S.axis === 'x' ? sa : 0, S.axis === 'y' ? sa : 0, S.axis === 'z' ? sa : 0, 'XYZ')));
      }
      const k = sc == null ? 1 : Math.max(1e-4, sc);
      b.scale.set(k, k, k);
    });
    for (const b of st.bones) if (!b.parent.isBone) b.updateMatrixWorld(true);
    stepLegs(g, st, dt, opt, walking);
    stepDangles(st, dt);
    stepCloth(g, st);
    const ev = st.events; st.events = [];
    return ev;
  }
  function fire(g, st, E) {
    const pt = E.at && st.points[E.at], bone = pt ? st.by[pt.bone] : st.by[E.bone];
    if (!bone) return;
    bone.updateMatrixWorld(true);
    const pos = new V3().fromArray(pt ? pt.p : (E.local || [0, 0, 0])).applyMatrix4(bone.matrixWorld);
    bone.matrixWorld.decompose(_P, _q1, _S);
    const dir = new V3().fromArray(E.dir || [0, 0, 1]).applyQuaternion(_q1).normalize();
    st.events.push({ type: E.type, kind: E.kind || '', key: st.key, pos: pos.toArray(), dir: dir.toArray(), speed: E.speed || 0, r: E.r || 0 });
  }

  /* ------------------------------------------------------------ the public face */
  function S(g) { return g && g.userData && g.userData._mech; }
  API.update = function (g, dt, opt) { const st = S(g); return st ? pose(g, st, Math.max(0, Math.min(dt || 0, 0.1)), opt) : []; };
  API.setState = function (g, mode) {
    const st = S(g);
    if (!st || (mode !== 'idle' && mode !== 'walk')) return null;
    if (st.atk >= 0) { st.resume = mode; return mode; }
    if (mode === 'walk' && st.mode !== 'walk') {
      const G = st.gait;
      st.phase = ((G.duty - (G.offsets[0] || 0) - 0.002) % 1 + 1) % 1;
      /* a leg already in its swing part of the cycle steps now, rather than waiting a whole stance and trailing behind */
      st.legs.forEach(function (L, i) {
        const p = (st.phase + (G.offsets[i] || 0)) % 1;
        L.lastP = p;
        if (p >= G.duty && !L.swing) { L.swing = true; L.u = 0; L.from.copy(L.plant); }
      });
    }
    st.mode = mode;
    return mode;
  };
  API.attack = function (g) {
    const st = S(g);
    if (!st || !st.attack || st.atk >= 0) return 0;
    st.resume = st.mode; st.mode = 'idle'; st.atk = 0;
    return st.attack.dur;
  };
  API.state = function (g) {
    const st = S(g);
    return st ? { mode: st.mode, attacking: st.atk >= 0, attackT: st.atk, phase: st.phase, walkW: st.walkW,
      stepping: st.legs.some(function (L) { return L.swing; }), reach: st.reach } : null;
  };
  API.speed = function (g) { const st = S(g); return st ? mechSpeed(st.gait) : 0; };
  /* back to the first frame: standing, feet re-planted where the group now is */
  API.reset = function (g) {
    const st = S(g);
    if (!st) return;
    st.t = 0; st.mode = 'idle'; st.resume = 'idle'; st.walkW = 0; st.phase = 0; st.atk = -1; st.atkW = 0; st.vel.set(0, 0, 0);
    st.last = null; st.planted = false; st.reach = 0;
    for (const L of st.legs) { L.swing = false; L.u = 0; L.pitch = 0; L.lastP = 0; }
    for (const D of st.dang) { D.ax = D.az = D.vx = D.vz = 0; D.p0 = null; D.acc.set(0, 0, 0); }
    for (const Sp of st.spins) Sp.ang = 0;
    pose(g, st, 0, null);
  };
  /* the legs' world plants and the named points, for a host (footprints, muzzle flash) */
  API.feet = function (g) {
    const st = S(g);
    return st ? st.legs.map(function (L) { return { name: L.def.name, planted: !L.swing, pos: [L.plant.x, L.plant.y - L.def.ankleH, L.plant.z] }; }) : [];
  };
  API.point = function (g, name) {
    const st = S(g), pt = st && st.points[name];
    if (!pt) return null;
    const b = st.by[pt.bone];
    b.updateMatrixWorld(true);
    return new V3().fromArray(pt.p).applyMatrix4(b.matrixWorld).toArray();
  };
  API.lights = function (g, on) {
    const st = S(g);
    if (!st) return false;
    st.glow.color.setRGB(on ? 1 : 0.16, on ? 1 : 0.14, on ? 1 : 0.12);
    g.userData.lightsOn = !!on;
    return !!on;
  };
  /* something the mech looses, to fly: 'bolt' (a ballista bolt, 1.5 m), 'harpoon' (2.6 m, barbed, with a line),
     'rivet' (a glowing slug). A plain Group, +z forward, origin at its middle. */
  const _projMat = {};
  API.projectile = function (kind) {
    const F = mechFrame({ seed: 1 });
    F.asset = { culture: '' };
    const g0 = new THREE.Group(), prev = _target;
    _target = g0;
    try {
      if (kind === 'rivet') {
        F.cy(0, 0, 0, 0.11, 0.11, 0.3, 0xff8a2a, 'glow', 'z', 10);
        F.sph(0, 0, 0.15, 0.11, 0.11, 0.08, 0xffc070, 'glow', 10, 6);
      } else {
        const L = kind === 'harpoon' ? 2.6 : 1.5, r = kind === 'harpoon' ? 0.05 : 0.032;
        F.rod(0, 0, -L / 2, 0, 0, L / 2, r, 0x6a4e32, 'wood');
        F.cy(0, 0, L / 2 + 0.12, r * 2.2, 0.004, 0.28, 0x3a3836, 'metal', 'z', 6);
        if (kind === 'harpoon') for (const s of [-1, 1]) F.rod(0, 0, L / 2 - 0.02, s * 0.14, 0, L / 2 - 0.22, 0.02, 0x3a3836, 'metal');
        for (let k = 0; k < 3; k++) { const a = k * TAU / 3; F.tri([0, 0, -L / 2 + 0.05], [Math.cos(a) * 0.1, Math.sin(a) * 0.1, -L / 2], [0, 0, -L / 2 + 0.3], 0xd8742a, 'feather'); }
      }
    } finally { _target = prev; }
    const out = new THREE.Group();
    g0.updateMatrixWorld(true);
    g0.traverse(function (o) {
      if (!o.isMesh) return;
      const fam = o.material.userData.family || '', glow = fam === 'glow';
      const key = (glow ? 'g' : 's') + o.material.color.getHexString();
      const m = _projMat[key] || (_projMat[key] = glow ? new THREE.MeshBasicMaterial({ color: o.material.color.clone().convertSRGBToLinear() })
        : new THREE.MeshStandardMaterial({ color: o.material.color.clone().convertSRGBToLinear(), roughness: 0.7, metalness: fam === 'metal' ? 0.5 : 0 }));
      const mesh = new THREE.Mesh(o.geometry, m);
      mesh.applyMatrix4(o.matrixWorld); mesh.castShadow = true;
      out.add(mesh);
    });
    out.name = 'projectile:' + (kind || 'bolt');
    return out;
  };
  API.dispose = function (g) {
    const st = S(g);
    g.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
    if (st) { st.glow.dispose(); for (const C of st.cloth) C.mesh.material.dispose(); }
  };
  return API;
})();


return KM_API;
})();
