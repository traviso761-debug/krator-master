// ================================================================= HOST — terrain, fields, KSTRATA, KGROUND, KFAR & KHORIZON [draw]
// Shared across all 3 Shroudhills stations (cove, canopy, cloaktor): binds BIO.init({tags:'shroudhills'}), builds KSTRATA
// (pale crystalline/granite tors & ironstone/coal ravine beds), 5-layer library KGROUND, 14 km KFAR vista & KHORIZON.
const SR = STAGE.R;
const _tm = { x: NaN, z: NaN, h: 0 };
function terrainH(x, z){
 if (x === _tm.x && z === _tm.z) return _tm.h;
 const h = STAGE.ground(x, z);
 _tm.x = x; _tm.z = z; _tm.h = h;
 return h;
}

const SEA = STAGE.sea || null;
const STREAM = STAGE.stream || null;
const TARN = STAGE.tarn || null;

const streamDistAt = STREAM ? function(x, z){
 let m = 1e9;
 const P = STREAM.pts;
 for (let i = 0; i < P.length - 1; i++) {
  const a = P[i], b = P[i + 1], dx = b[0] - a[0], dz = b[1] - a[1];
  const L2 = dx * dx + dz * dz || 1;
  const t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / L2, 0, 1);
  m = Math.min(m, Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z));
 }
 return m;
} : function(){ return 1e9; };

const tarnAt = TARN ? function(x, z){
 return Math.hypot((x - TARN.x) / TARN.rx, (z - TARN.z) / TARN.rz) < 1.04;
} : function(){ return false; };

// Ground-level water height for BIO.mask (keeps trees/ferns off cove water, ravine stream & summit tarn)
function waterH(x, z){
 if (SEA && STAGE.coastD && STAGE.coastD(x, z) < 3.5) return SEA.level;
 if (TARN && tarnAt(x, z)) return TARN.level;
 if (STREAM && streamDistAt(x, z) < STREAM.w * 1.25) return terrainH(x, z) + STREAM.depth;
 return -1e9;
}

const F = STAGE.fields;
const flowField = STREAM ? function(x, z){ return smooth(STREAM.w + 26, STREAM.w + 2, streamDistAt(x, z)); } : function(){ return 0; };
const FIELD = {
 elevASL: F.elevASL,
 coast: F.coast,
 ravine: F.ravine,
 granite: F.granite,
 tor: F.tor,
 cobble: F.cobble,
 path: F.path,
 ironstone: F.ironstone,
 moss: F.moss,
 flow: flowField,
 wet: function(x, z){ return clamp(0.88 + 0.12 * flowField(x, z), 0, 1); }
};

const OBSTACLES = [];
const waterMask = function(x, z){
 const w = waterH(x, z);
 if (w < -1e8) return 1;
 const d = terrainH(x, z) - w;
 return d < 0.2 ? 0 : d < 0.85 ? (d - 0.2) / 0.65 : 1;
};

BIO.init({
 tags: 'shroudhills',
 THREE: THREE,
 scene: scene,
 terrainH: terrainH,
 waterH: waterH,
 mask: waterMask,
 obstacles: OBSTACLES,
 ticks: tick,
 seed: STAGE.seed,
 origin: STAGE.spine,
 center: [0, 0],
 fields: FIELD,
 register: REGISTER,
 err: reportErr,
 eye: function(){ return [camera.position.x, camera.position.y, camera.position.z]; },
 lod: { hero: 250, mid: 650, far: 2400, floor: [240, 560] }
});
BIO.setSun(SUN_POS);
BIO.host.shroudhills = {
 wind: STAGE.wind || [0.7071, 0.7071],
 station: STAGE.key,
 coastD: STAGE.coastD || null
};
_mark('binding');

// ---- KSTRATA geological recipes (PLAN.md section 1: 65% Sedimentary ironstone/coal + 35% Crystalline/Granite tors)
const GQ = new URLSearchParams(location.search);
if (typeof KSTRATA !== 'undefined' && KSTRATA.add) {
 KSTRATA.add({
  name: 'shroudhills-ironcoal',
  main: 'ironstone',
  kinds: {
   ironstone: { p: 0.56, th: [1.2, 5.5], col: [0x6e442c, 0x7c4e32, 0x5c3824], hard: 0.65, xbed: 0, varnish: 0.1 },
   siltstone: { p: 0.24, th: [0.8, 3.2], col: [0x4c4a44, 0x58544c, 0x3e3c38], hard: 0.5, xbed: 0, varnish: 0 },
   coal: { p: 0.20, th: [0.35, 1.4], col: [0x1c1d20, 0x24262a, 0x16171a], hard: 0.42, xbed: 0, varnish: 0.2, between: true }
  },
  fx: {}
 });
 KSTRATA.add({
  name: 'shroudhills-granite',
  main: 'granite',
  kinds: {
   granite: { p: 0.68, th: [3.5, 14.0], col: [0xc6c4bc, 0xd2d0c8, 0xb4b2aa], hard: 0.92, xbed: 0, varnish: 0.05 },
   gneiss: { p: 0.22, th: [1.5, 6.0], col: [0x989a96, 0xa8aaa4, 0x888a86], hard: 0.85, xbed: 0, varnish: 0 },
   quartz: { p: 0.10, th: [0.12, 0.55], col: [0xe8e8e2, 0xf0efe8], hard: 0.95, xbed: 0, varnish: 0, between: true }
  },
  fx: {}
 });
}

const STRATA = (GQ.get('strata') === '0' || typeof KSTRATA === 'undefined') ? null : KSTRATA.create({
 seed: STAGE.seed + 300,
 range: [-60, 420],
 formations: STAGE.strataMode === 'granite' ? [
  { recipe: 'shroudhills-ironcoal', base: -60, top: 95 },
  { recipe: 'shroudhills-granite', base: 95, top: 420 }
 ] : STAGE.strataMode === 'ravine' ? [
  { recipe: 'shroudhills-ironcoal', base: -60, top: 140 },
  { recipe: 'shroudhills-granite', base: 140, top: 420 }
 ] : [
  { recipe: 'shroudhills-ironcoal', base: -60, top: 48 },
  { recipe: 'shroudhills-granite', base: 48, top: 420 }
 ],
 dip: [0.55, 0.45, 0.03],
 warp: [5, 1.8]
});
const STRATA_SH = STRATA ? KSTRATA.shade(STRATA, { dust: 0x6c665c }) : null;

// ---- Packed 5-layer library ground textures (ground.floor, ground.ironstone, ground.moss, ground.granite, ground.cobble)
const LAYER_KEYS = ['ground.floor', 'ground.ironstone', 'ground.moss', 'ground.granite', 'ground.cobble'];
const LIBG = (function(){
 if (typeof KMAT === 'undefined' || KMAT.mode !== 'lib') return {};
 const out = {};
 LAYER_KEYS.forEach(function(k){
  const P = KMAT.packed('shroudhills', k);
  if (P) out[k] = Object.assign({ scale: P.scale[0] }, KMAT.textures(P, { aniso: 8 }));
 });
 return out;
})();

const fallbackGroundTex = function(col, seed){
 return BIO.canvasTex(128, 128, function(g, w, h){
  const id = g.createImageData(w, h), d = id.data, c = new THREE.Color(col);
  for (let y = 0; y < h; y++) {
   for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const v = clamp(0.84 + 0.32 * (fbm(x / 6, y / 6, seed, 2) - 0.5), 0.2, 1.25);
    d[i] = clamp(c.r * 255 * v, 0, 255);
    d[i + 1] = clamp(c.g * 255 * v, 0, 255);
    d[i + 2] = clamp(c.b * 255 * v, 0, 255);
    d[i + 3] = 255;
   }
  }
  g.putImageData(id, 0, 0);
 });
};

const BASE_FLOOR_MAP = LIBG['ground.floor'] ? LIBG['ground.floor'].map : fallbackGroundTex(0x48422e, 11);
BASE_FLOOR_MAP.wrapS = BASE_FLOOR_MAP.wrapT = THREE.RepeatWrapping;

const USE_KG = typeof KGROUND !== 'undefined' && GQ.get('kground') !== '0';
const KG_LAYERS = USE_KG ? [
 ['moss', '1.0'],
 ['granite', 'vGW.z'],
 ['cobble', 'vGW.w']
].map(function(L){
 return KGROUND.layer('shroudhills', 'ground.' + L[0], { w: L[1], amt: 1.0, gain: 1.0, name: L[0] });
}) : [];
const KG_ON = KG_LAYERS.length === 3 && KG_LAYERS.every(Boolean);

const GROUND_MAT = new THREE.MeshLambertMaterial({ vertexColors: true, color: 0xffffff, map: BASE_FLOOR_MAP });
GROUND_MAT.onBeforeCompile = function(sh){
 if (STRATA_SH) STRATA_SH.inject(sh);
 sh.vertexShader = sh.vertexShader
  .replace('#include <common>', '#include <common>\nattribute vec4 aGW;varying vec4 vGW;varying vec3 vGWP;varying vec3 vGWN;')
  .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvGW=aGW;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);');
 sh.fragmentShader = sh.fragmentShader
  .replace('#include <common>', '#include <common>\nvarying vec4 vGW;varying vec3 vGWP;varying vec3 vGWN;\n' + BIO.DITHER)
  .replace('#include <map_fragment>', (KG_ON ? 'diffuseColor.rgb=vec3(0.20);\n/*KGROUND*/\n' : '#include <map_fragment>\n') +
   (STRATA_SH ? '{float gSt=smoothstep(0.38,0.68,1.0-clamp(vGWN.y,0.0,1.0));diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSt*0.86);}\n' : '') +
   'diffuseColor.rgb*=kmacro(vGWP.xz);');
};
GROUND_MAT.customProgramCacheKey = function(){ return 'shroudhills-ground-' + STAGE.key + '-' + (KG_ON ? 'kg' : 'base'); };
if (KG_ON) KGROUND.hook(GROUND_MAT, { key: 'shroudhills-ground-' + STAGE.key, at: '/*KGROUND*/', layers: KG_LAYERS });
window._kground = KG_ON ? KG_LAYERS.map(function(L){ return L.name; }) : null;

const GROUND = (function(){
 const S = SR * 2.15, N = 320;
 const g = new THREE.PlaneGeometry(S, S, N, N);
 g.rotateX(-Math.PI / 2);
 const p = g.attributes.position, uv = g.attributes.uv, n = p.count;
 const gw = new Float32Array(n * 4), col = new Float32Array(n * 3);
 const c = new THREE.Color(), SHADE_RAV = new THREE.Color(0x6e7868), TOR_PALE = new THREE.Color(0xdedcd4), PATH_COL = new THREE.Color(0xc8c4ba);

 for (let i = 0; i < n; i++) {
  const x = p.getX(i), z = p.getZ(i), y = terrainH(x, z);
  p.setY(i, y);
  uv.setXY(i, x * 0.42, z * 0.42);
  const iron = F.ironstone(x, z);
  const moss = F.moss(x, z);
  const gran = F.granite(x, z);
  const path = F.path(x, z);
  const cob = clamp(Math.max(F.cobble(x, z), path * 0.82), 0, 1);

  gw[i * 4] = iron * (1 - gran * 0.8) * (1 - cob * 0.7);
  gw[i * 4 + 1] = moss * (1 - gran * 0.75) * (1 - cob * 0.85);
  gw[i * 4 + 2] = gran;
  gw[i * 4 + 3] = cob;

  c.setRGB(1, 1, 1)
   .lerp(SHADE_RAV, F.ravine(x, z) * 0.28)
   .lerp(TOR_PALE, F.tor(x, z) * 0.22)
   .lerp(PATH_COL, path * 0.25);
  if (SEA && y < SEA.level) c.multiplyScalar(0.72);
  c.convertSRGBToLinear();
  col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
 }
 g.setAttribute('aGW', new THREE.BufferAttribute(gw, 4));
 g.setAttribute('color', new THREE.BufferAttribute(col, 3));
 g.computeVertexNormals();
 const m = new THREE.Mesh(g, GROUND_MAT);
 m.name = 'ground';
 m.userData.probeSkip = true;
 m.userData.host = true;
 m.userData.inspectLabel = STAGE.name + ' - ground';
 scene.add(m);
 return m;
})();
_mark('ground');

// ---- 14 km KFAR far-country lattice (textured with packed library map so 0 lit meshes in scene are untextured!)
const FAR_MAP = LIBG['ground.granite'] ? LIBG['ground.granite'].map : BASE_FLOOR_MAP;
FAR_MAP.wrapS = FAR_MAP.wrapT = THREE.RepeatWrapping;

const FARC = (function(){
 const FOREST = new THREE.Color(0x36522e), TOR = new THREE.Color(0xaab0aa), SNOW = new THREE.Color(0xd8e0e4), SEA_BED = new THREE.Color(0x385452);
 const c = new THREE.Color();
 return function(x, z, y){
  const n = fbm(x * 0.0009, z * 0.0009, 521, 2) - 0.5;
  const asl = STAGE.elevOffset + y;
  c.copy(FOREST)
   .lerp(TOR, smooth(1150, 1850, asl))
   .lerp(SNOW, smooth(2550, 3400, asl));
  if (SEA && y < 0) c.lerp(SEA_BED, smooth(0, -8, y));
  // Boost slightly to compensate for FAR_MAP mean reflectance (~0.70) so far ridges match near ground color seamlessly
  c.multiplyScalar((1 + n * 0.16) * 1.36);
  c.r = clamp(c.r, 0, 1); c.g = clamp(c.g, 0, 1); c.b = clamp(c.b, 0, 1);
  c.convertSRGBToLinear();
  return [c.r, c.g, c.b];
 };
})();

const farH = function(x, z){
 return terrainH(x, z) + (STAGE.farLift ? STAGE.farLift(x, z) : 0);
};

const FAR = (function(){
 const S0 = SR * 1.06, ROUT = 14000, cs = 40;
 const G = KFAR.grid({
  lines: KFAR.lines({ cell: cs, inner: S0 + cs, out: ROUT, grow: 1.038 }),
  dense: true,
  h: function(x, z){
   if (Math.abs(x) < S0 && Math.abs(z) < S0) {
    let lo = terrainH(x, z);
    for (let a = -1; a <= 1; a++) {
     for (let b = -1; b <= 1; b++) {
      lo = Math.min(lo, terrainH(x + a * cs * 0.5, z + b * cs * 0.5));
     }
    }
    return lo - 2.5;
   }
   return farH(x, z);
  },
  skip: function(x0, z0, x1, z1){ return x0 > -S0 + 80 && x1 < S0 - 80 && z0 > -S0 + 80 && z1 < S0 - 80; },
  color: function(x, z, y){ return FARC(x, z, y); }
 });
 const geo = KFAR.geometry(G);
 const gp = geo.attributes.position, guv = new Float32Array(gp.count * 2);
 for (let i = 0; i < gp.count; i++) {
  guv[i * 2] = gp.getX(i) * 0.008;
  guv[i * 2 + 1] = gp.getZ(i) * 0.008;
 }
 geo.setAttribute('uv', new THREE.BufferAttribute(guv, 2));
 const mat = new THREE.MeshLambertMaterial({ vertexColors: true, map: FAR_MAP });
 mat.userData.farField = true;
 mat.customProgramCacheKey = function(){ return 'shroudhills-far'; };
 const m = new THREE.Mesh(geo, mat);
 m.userData.probeSkip = true;
 m.userData.host = true;
 m.userData.farField = true;
 m.frustumCulled = false;
 m.userData.inspectLabel = 'Shroudhills 14 km panorama (canopy ridges, granite Cloak-Tors and mist_divide spine)';
 scene.add(m);
 window._far = { kfar: true, tris: G.count.tris, outM: ROUT };
 return m;
})();

const GROUND_HZ = (function(){
 if (typeof KHORIZON === 'undefined' || GQ.get('hz') === '0') return null;
 const t0 = performance.now(), S = SR * 1.06;
 const H = KHORIZON.bake({
  box: [-S, -S, S, S],
  n: 144,
  h: terrainH,
  far: { h: farH, box: [-14000, -14000, 14000, 14000], n: 128 }
 });
 window._horizon = { ms: Math.round(performance.now() - t0), n: H.n };
 KHORIZON.shade(GROUND_MAT, H);
 return H;
})();
_mark('far');
