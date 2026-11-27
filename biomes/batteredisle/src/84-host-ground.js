// ================================================================= HOST — KSTRATA, <=3-layer KGROUND, KSTACKS, KCARVE, KCAVERN, KDRAWN, KFAR & KHORIZON [draw]
BATTER.setupKit();
if (typeof BIO !== 'undefined' && typeof BIO.tagReg === 'function') BIO.tagReg();

const GQ = new URLSearchParams(location.search);

/* 1. The worn-cone columns (PLAN.md section 8.1: worn-scoria-palagonite, olivine-plug-basalt, upturned-coal-collar): core's KSTRATA recipes
   battered-scoria-palagonite, battered-plug-basalt and battered-coal-collar (core/terrain/35-core-strata.js) */
const STRATA = (GQ.get('strata') === '0' || typeof KSTRATA === 'undefined') ? null : KSTRATA.create({
 seed: STAGE.seed + 411,
 range: [-70, 320],
 formations: STAGE.key === 'plug' ? [
  { recipe: 'battered-scoria-palagonite', base: -70, top: 82 },
  { recipe: 'battered-plug-basalt',       base: 82,  top: 320 }
 ] : STAGE.key === 'strait' ? [
  { recipe: 'battered-coal-collar',       base: -70, top: 52 },
  { recipe: 'battered-scoria-palagonite', base: 52,  top: 320 }
 ] : [
  { recipe: 'battered-coal-collar',       base: -70, top: 14 },
  { recipe: 'battered-scoria-palagonite', base: 14,  top: 320 }
 ],
 dip: STAGE.key === 'strait' ? [0.64, 0.28, 0.18] : (STAGE.key === 'plug' ? [0.85, 0.15, 0.42] : [0.24, 0.18, 0.06]),
 warp: [4.2, 1.5]
});
const STRATA_SH = STRATA ? KSTRATA.shade(STRATA, { dust: 0x62564a }) : null;

/* 2. Packed library ground maps (<= 3 layers total: base ground.scoria + 2 zero-weight-guarded KGROUND layers -> <= 12 samplers!) */
const LIBG = (function(){
 if (typeof KMAT === 'undefined' || KMAT.mode !== 'lib') return {};
 const out = {};
 ['ground.base', 'ground.scoria', 'ground.palagonite', 'ground.shingle'].forEach(function(k){
  const P = KMAT.packed('batteredisle', k);
  if (P) out[k] = Object.assign({ scale: P.scale[0] }, KMAT.textures(P, { aniso: 8 }));
 });
 return out;
})();

const fallbackGroundTex = function(hexCol, seed){
 return BIO.canvasTex(128, 128, function(g, w, h){
  const im = g.createImageData(w, h), d = im.data, c = new THREE.Color(hexCol);
  for (let y = 0; y < h; y++) {
   for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const v = clamp(0.84 + 0.32 * (fbm(x / 6, y / 6, seed, 2) - 0.5), 0.2, 1.25);
    d[i]     = clamp(c.r * 255 * v, 0, 255);
    d[i + 1] = clamp(c.g * 255 * v, 0, 255);
    d[i + 2] = clamp(c.b * 255 * v, 0, 255);
    d[i + 3] = 255;
   }
  }
  g.putImageData(im, 0, 0);
 });
};

const BASE_FLOOR_MAP = LIBG['ground.scoria'] ? LIBG['ground.scoria'].map : fallbackGroundTex(0x52342c, 19);
BASE_FLOOR_MAP.wrapS = BASE_FLOOR_MAP.wrapT = THREE.RepeatWrapping;

const USE_KG = typeof KGROUND !== 'undefined' && GQ.get('kground') !== '0';
const KG_LAYERS = USE_KG ? [
 ['palagonite', 'vGW.y'],
 ['shingle',    'vGW.z']
].map(function(L){
 return KGROUND.layer('batteredisle', 'ground.' + L[0], { w: L[1], amt: 1.0, gain: 1.0, name: L[0] });
}).filter(Boolean) : [];
const KG_ON = KG_LAYERS.length > 0;

const GROUND_MAT = new THREE.MeshLambertMaterial({ vertexColors: true, color: 0xffffff, map: BASE_FLOOR_MAP });
GROUND_MAT.onBeforeCompile = function(sh){
 if (STRATA_SH) STRATA_SH.inject(sh);
 sh.vertexShader = sh.vertexShader
  .replace('#include <common>', '#include <common>\nattribute vec4 aGW;varying vec4 vGW;varying vec3 vGWP;varying vec3 vGWN;')
  .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvGW=aGW;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);');
 sh.fragmentShader = sh.fragmentShader
  .replace('#include <common>', '#include <common>\nvarying vec4 vGW;varying vec3 vGWP;varying vec3 vGWN;\n' + BIO.DITHER)
  .replace('#include <map_fragment>', '#include <map_fragment>\n' + (KG_ON ? '/*KGROUND*/\n' : '') +
   (STRATA_SH ? '{float gSt=smoothstep(0.32,0.64,1.0-clamp(vGWN.y,0.0,1.0));diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSt*0.88);}\n' : '') +
   'diffuseColor.rgb*=kmacro(vGWP.xz);');
};
GROUND_MAT.customProgramCacheKey = function(){ return 'batteredisle-ground-' + STAGE.key + '-' + (KG_ON ? 'kg2' : 'base'); };
if (KG_ON) KGROUND.hook(GROUND_MAT, { key: 'batteredisle-ground-' + STAGE.key, at: '/*KGROUND*/', layers: KG_LAYERS });
window._kground = KG_ON ? ['scoria'].concat(KG_LAYERS.map(function(L){ return L.name; })) : ['scoria'];

/* 3. Drawn ground mesh + KDRAWN.grid registration (survey item 28) */
const GROUND = (function(){
 const S = SR * 2.12, N = 256;
 const g = new THREE.PlaneGeometry(S, S, N, N);
 g.rotateX(-Math.PI / 2);
 const p = g.attributes.position, uv = g.attributes.uv, n = p.count;
 const gw = new Float32Array(n * 4), col = new Float32Array(n * 3), gridH = new Float32Array(n);
 const c = new THREE.Color();
 const C_SCORIA = new THREE.Color(0x8e5648);
 const C_PALAG  = new THREE.Color(0xc2a872);
 const C_BASALT = new THREE.Color(0x52565e);
 const C_COAL   = new THREE.Color(0x2e3036);
 const C_GARN   = new THREE.Color(0x66967a);
 const C_FOREST = new THREE.Color(0x56704c);

 for (let i = 0; i < n; i++) {
  const x = p.getX(i), z = p.getZ(i);
  let y = terrainH(x, z);
  if (STAGE.cavern && STAGE.cavern.holeAt && STAGE.cavern.holeAt(x, z)) {
   y -= 6.5;
  }
  p.setY(i, y);
  gridH[i] = y;
  uv.setXY(i, x * 0.38, z * 0.38);

  const fScoria = STAGE.fields.scoria(x, z);
  const fPalag  = STAGE.fields.palagonite(x, z);
  const fShing  = STAGE.fields.shingle(x, z);
  const fDike   = STAGE.fields.dike(x, z);
  const fCoal   = STAGE.fields.coal(x, z);
  const fGarn   = STAGE.fields.garnierite(x, z);
  const asl     = STAGE.elevOffset + y;
  const fCanopy = smooth(STAGE.trimElevM, STAGE.trimElevM + 18, asl) * (1 - smooth(780, 845, asl));

  gw[i * 4]     = fScoria;
  gw[i * 4 + 1] = clamp(fPalag * (1 - fShing * 0.7), 0, 1);
  gw[i * 4 + 2] = fShing;
  gw[i * 4 + 3] = fDike;

  /* S6 Chromatic Land-Shape Colouring: warm oxidized scoria noses, tan palagonite benches, dark dike basalt, coal & garnierite */
  c.copy(C_SCORIA)
   .lerp(C_PALAG,  fPalag * 0.52)
   .lerp(C_FOREST, fCanopy * 0.45)
   .lerp(C_BASALT, fDike * 0.65)
   .lerp(C_COAL,   fCoal * 0.72)
   .lerp(C_GARN,   fGarn * 0.36);
  if (SEA && y < SEA.level) c.multiplyScalar(0.72);
  c.convertSRGBToLinear();
  col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
 }

 g.setAttribute('aGW', new THREE.BufferAttribute(gw, 4));
 g.setAttribute('color', new THREE.BufferAttribute(col, 3));
 g.computeVertexNormals();
 const m = new THREE.Mesh(g, GROUND_MAT);
 m.name = 'ground';
 m.userData.ground = true;
 m.userData.probeSkip = true;
 m.userData.host = true;
 m.userData.inspectLabel = STAGE.name + ' - worn cinder-cone ground';
 scene.add(m);
 m.updateMatrixWorld(true);

 if (typeof KDRAWN !== 'undefined') {
  KDRAWN.clear();
  KDRAWN.add(KDRAWN.grid({ x0: -S * 0.5, z0: -S * 0.5, dx: S / N, dz: S / N, nx: N, nz: N, h: gridH }));
 }
 return m;
})();

/* 4. Mesh KSTACKS radial-dike sea-stacks (Station 2) & exhumed columnar volcanic plug (Station 4) + KDRAWN.add */
const STACK_MESHES = [];
if (STAGE.stacks && STAGE.stacks.length && typeof KSTACKS !== 'undefined') {
 for (let i = 0; i < STAGE.stacks.length; i++) {
  const S = STAGE.stacks[i];
  const d = KSTACKS.mesh(S, { step: 4.5 });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(d.pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(d.uv, 2));
  const nv = d.pos.length / 3;
  const col = new Float32Array(nv * 3);
  for (let k = 0; k < nv; k++) {
   const ao = 0.52 + 0.48 * (d.occ ? d.occ[k] : 1.0);
   col[k * 3] = ao * 0.88; col[k * 3 + 1] = ao * 0.90; col[k * 3 + 2] = ao * 0.94;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(nv > 65535 ? new THREE.Uint32BufferAttribute(d.idx, 1) : new THREE.Uint16BufferAttribute(d.idx, 1));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, BATTER.MAT.rockBasalt);
  m.name = 'stack:' + S.id;
  m.userData.host = true;
  m.userData.rock = true;
  m.userData.inspectLabel = STAGE.key === 'plug' ? 'Exhumed +868.8 m Columnar Olivine-Basalt Volcanic Neck' : 'Exhumed Radial Feeder-Dike Sea-Stack (' + S.id + ')';
  scene.add(m);
  m.updateMatrixWorld(true);
  STACK_MESHES.push(m);
  if (typeof KDRAWN !== 'undefined') KDRAWN.add(KDRAWN.fromObject(m));
  REGISTER({ name: m.userData.inspectLabel, key: S.id, kind: 'feature', x: S.x, y: S.y0, z: S.z, r: S.R == null ? 24 : S.R, h: (S.top == null ? 40 : S.top) - S.y0 });
 }
}

/* 5. Mesh KCARVE yellow-tan palagonite sea-arches (Stations 1 & 3) + KDRAWN.add */
const ARCH_MESHES = [];
if (typeof KCARVE !== 'undefined' && KCARVE.patches && KCARVE.patches.length) {
 const meshes = KCARVE.mesh(BATTER.MAT.rockPalagonite, { THREE: THREE, sun: [0.45, 0.78, -0.42], gridNormals: true });
 for (let i = 0; i < meshes.length; i++) {
  const m = meshes[i];
  const pos = m.geometry.attributes.position, nv = pos.count;
  const uv = new Float32Array(nv * 2), col = new Float32Array(nv * 3);
  const occ = m.geometry.attributes.aOcc;
  for (let k = 0; k < nv; k++) {
   const px = pos.getX(k), py = pos.getY(k), pz = pos.getZ(k);
   uv[k * 2] = (px + pz) * 0.28;
   uv[k * 2 + 1] = py * 0.28;
   const ao = 0.48 + 0.52 * (occ ? occ.getX(k) : 0.85);
   col[k * 3] = ao * 1.02; col[k * 3 + 1] = ao * 0.96; col[k * 3 + 2] = ao * 0.84;
  }
  m.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  m.geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
  m.name = 'palagonite-arch-' + i;
  m.userData.host = true;
  m.userData.rock = true;
  m.userData.inspectLabel = 'Yellow-Tan Palagonite Hydrovolcanic Sea-Arch';
  scene.add(m);
  m.updateMatrixWorld(true);
  ARCH_MESHES.push(m);
  if (typeof KDRAWN !== 'undefined') KDRAWN.add(KDRAWN.fromObject(m));
 }
}

/* 6. Mesh KCAVERN Palagonite Boat-Vault (Station 1) & Blowhole Sea-Caves (Station 2) with KCAVERN.cutLayer + KDRAWN.add */
let CAVERN_DRAW = null;
if (STAGE.cavern && typeof KCAVERN !== 'undefined' && KCAVERN.drawRock) {
 const cavMat = (STAGE.key === 'cove' ? BATTER.MAT.rockPalagonite : BATTER.MAT.rockBasalt).clone();
 cavMat.map = (STAGE.key === 'cove' ? BATTER.MAT.rockPalagonite : BATTER.MAT.rockBasalt).map;
 cavMat.normalMap = (STAGE.key === 'cove' ? BATTER.MAT.rockPalagonite : BATTER.MAT.rockBasalt).normalMap;
 cavMat.roughnessMap = (STAGE.key === 'cove' ? BATTER.MAT.rockPalagonite : BATTER.MAT.rockBasalt).roughnessMap;
 if (KCAVERN.cutLayer && typeof KHOOK !== 'undefined') {
  KCAVERN.cutLayer(cavMat, { attr: 'aKCut' });
 }
 CAVERN_DRAW = KCAVERN.drawRock(STAGE.cavern, {
  THREE: THREE,
  material: cavMat,
  tile: 64,
  attrs: ['aKCut'],
  weight: KCAVERN.cutWeight ? KCAVERN.cutWeight(STAGE.cavern) : null,
  label: STAGE.key === 'cove' ? 'Palagonite Sea-Cave Smuggler Vault' : 'Wave-Compressed Blowhole Sea-Cave & Chimney'
 });
 /* Generate triplanar-approximated world UVs so lit cavern rock has crisp library texture detail */
 CAVERN_DRAW.group.traverse(function(m){
  if (!m.isMesh) return;
  const pos = m.geometry.attributes.position, nrm = m.geometry.attributes.normal, nv = pos.count;
  const uv = new Float32Array(nv * 2);
  for (let k = 0; k < nv; k++) {
   const px = pos.getX(k), py = pos.getY(k), pz = pos.getZ(k);
   const ny = Math.abs(nrm.getY(k));
   uv[k * 2]     = ny > 0.65 ? px * 0.32 : (px + pz) * 0.28;
   uv[k * 2 + 1] = ny > 0.65 ? pz * 0.32 : py * 0.32;
  }
  m.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
 });
 scene.add(CAVERN_DRAW.group);
 CAVERN_DRAW.group.updateMatrixWorld(true);
 if (typeof KDRAWN !== 'undefined') {
  CAVERN_DRAW.group.traverse(function(m){
   if (m.isMesh) KDRAWN.add(KDRAWN.fromObject(m));
  });
 }
}
_mark('ground');

/* 7. 18 km KFAR Far-Country Vista (including the 17.0 km Shroudhills mainland mist silhouette on Station 3 strait!) */
const FAR_MAP = LIBG['ground.palagonite'] ? LIBG['ground.palagonite'].map : BASE_FLOOR_MAP;
FAR_MAP.wrapS = FAR_MAP.wrapT = THREE.RepeatWrapping;

function farH(x, z){
 const r = Math.hypot(x, z);
 if (r < SR * 1.05) return terrainH(x, z);
 /* On Station 3 (strait, 494,250), the mist-draped granite tors of Shroudhills rise 17 km east across the tidal sound! */
 if (STAGE.key === 'strait' && x > 13200) {
  const u = (x - 13200) / 5200;
  const torWave = 0.55 + 0.45 * Math.sin(z * 0.00055) * Math.cos(x * 0.00042);
  return -18.0 + 1280.0 * clamp(u, 0, 1) * (0.52 + 0.48 * torWave);
 }
 if (STAGE.key === 'plug') {
  /* Worn cone flanks sloping down from +868.8 m summit toward distant sea horizon */
  const drop = 560.0 * smooth(SR, 11000, r);
  return 68.0 - drop + 28.0 * Math.sin(x * 0.0006 + z * 0.0005);
 }
 /* Island cone spine rising inland + open sea dropping off seaward */
 const inland = STAGE.key === 'rampart' ? smooth(-600, 7500, x) :
                (STAGE.key === 'strait' ? smooth(400, -8500, x) : smooth(400, -7500, z));
 const seaDrop = STAGE.key === 'rampart' ? smooth(0, -4500, x) :
                 (STAGE.key === 'strait' ? smooth(100, 4500, x) : smooth(100, 4500, z));
 return -34.0 * seaDrop + (380.0 + 220.0 * Math.cos(z * 0.0004)) * inland;
}

const FAR = (function(){
 const S0 = SR * 1.05, ROUT = 18500, cs = 44;
 const C_WOOD = new THREE.Color(0x425e3c), C_SCOR = new THREE.Color(0x74463a), C_SHROUD = new THREE.Color(0x6c8286), C_SEA = new THREE.Color(0x28464c);
 const c = new THREE.Color();
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
  color: function(x, z, y){
   if (STAGE.key === 'strait' && x > 12800) {
    c.copy(C_SHROUD).multiplyScalar(1.22);
   } else {
    c.copy(C_WOOD).lerp(C_SCOR, smooth(220, 680, STAGE.elevOffset + y));
    if (SEA && y < 0) c.lerp(C_SEA, smooth(0, -14, y));
    c.multiplyScalar(1.26);
   }
   c.r = clamp(c.r, 0, 1); c.g = clamp(c.g, 0, 1); c.b = clamp(c.b, 0, 1);
   c.convertSRGBToLinear();
   return [c.r, c.g, c.b];
  }
 });
 const geo = KFAR.geometry(G);
 const gp = geo.attributes.position, guv = new Float32Array(gp.count * 2);
 for (let i = 0; i < gp.count; i++) {
  guv[i * 2]     = gp.getX(i) * 0.008;
  guv[i * 2 + 1] = gp.getZ(i) * 0.008;
 }
 geo.setAttribute('uv', new THREE.BufferAttribute(guv, 2));
 const mat = new THREE.MeshLambertMaterial({ vertexColors: true, map: FAR_MAP });
 mat.userData.farField = true;
 mat.customProgramCacheKey = function(){ return 'batteredisle-far-' + STAGE.key; };
 const m = new THREE.Mesh(geo, mat);
 m.name = 'farfield';
 m.userData.probeSkip = true;
 m.userData.host = true;
 m.userData.farField = true;
 m.frustumCulled = false;
 m.userData.inspectLabel = STAGE.key === 'strait'
  ? 'Battered Isle 18.5 km vista (17 km mist silhouette of Shroudhills across the leeward strait)'
  : 'Battered Isle 18.5 km worn cinder-cone & central volcanic plug silhouette';
 scene.add(m);
 window._far = { kfar: true, tris: G.count.tris, outM: ROUT, shroudhillsSilhouette: STAGE.key === 'strait' };
 return m;
})();

/* 8. S1 KHORIZON horizon-angle sky visibility & raking-sun self-shadowing */
const GROUND_HZ = (function(){
 if (typeof KHORIZON === 'undefined' || GQ.get('hz') === '0') return null;
 const t0 = performance.now(), S = SR * 1.05;
 const H = KHORIZON.bake({
  box: [-S, -S, S, S],
  n: 128,
  h: terrainH,
  far: { h: farH, box: [-18000, -18000, 18000, 18000], n: 112 }
 });
 window._horizon = { ms: Math.round(performance.now() - t0), n: H.n };
 KHORIZON.shade(GROUND_MAT, H);
 return H;
})();
_mark('far');
