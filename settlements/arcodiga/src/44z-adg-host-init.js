// ================================================================= ARCODIGA — renderer, scene, lights, terrainH, KCOAST & BIO.init [web]
const ERRS = document.getElementById('errs');
function reportErr(m){
 if (ERRS) {
  ERRS.style.display = 'block';
  ERRS.textContent += m + '\n';
 }
}
window.addEventListener('error', function(e){
 reportErr((e.error && e.error.stack) || (e.message + ' @' + e.filename + ':' + e.lineno));
});
window.addEventListener('unhandledrejection', function(e){
 reportErr('promise: ' + ((e.reason && e.reason.stack) || e.reason));
});
{
 const _ce = console.error;
 console.error = function(){
  try {
   const m = String(arguments[0] || '');
   if (/shader error|WebGLProgram/.test(m)) {
    reportErr('shader: ' + (m.match(/ERROR:[^\n]*/) || [m.slice(0, 220)])[0]);
   }
  } catch (_e) {}
  return _ce.apply(console, arguments);
 };
}

const PQ = new URLSearchParams(location.search);
const SKEY = 'shore';
const ADG_STATE = {
 mode: 'Normal Charter',
 seaOffsetM: 0.0,
 drawdownM: 0.0,
 chimeAlarm: false
};

const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio == null ? 1 : window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 32000);
window.addEventListener('resize', function(){
 camera.aspect = window.innerWidth / window.innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize(window.innerWidth, window.innerHeight);
});

const HEMI_LIGHT = new THREE.HemisphereLight(0xd8e8ec, 0x424a42, 0.80);
scene.add(HEMI_LIGHT);
const SUN_POS = new THREE.Vector3(560, 920, -640);
const SUN_LIGHT = new THREE.DirectionalLight(0xfff3e0, 1.36);
SUN_LIGHT.position.copy(SUN_POS);
scene.add(SUN_LIGHT);
const FILL_LIGHT = new THREE.DirectionalLight(0xc8dde8, 0.22);
FILL_LIGHT.position.set(-580, 380, 560);
scene.add(FILL_LIGHT);

const TICKS = [];
function adgTick(fn){ TICKS.push(fn); }

if (typeof KWALK !== 'undefined' && KWALK.clear) KWALK.clear();

const ADG_SR = ADG_SITE.HALF_SIZE;
function terrainH(x, z){
 return ADG_SITE.bareGround(x, z);
}
function groundNormal(x, z){
 const e = 2.0;
 const gx = (terrainH(x + e, z) - terrainH(x - e, z)) / (2 * e);
 const gz = (terrainH(x, z + e) - terrainH(x, z - e)) / (2 * e);
 const inv = 1 / Math.hypot(gx, 1, gz);
 return [-gx * inv, inv, -gz * inv];
}

/* Natural coastline classification via core/coast (KCOAST) over the 5.2 x 5.2 km Kopa-North site */
let ADG_COAST = null;
if (typeof KCOAST !== 'undefined' && KCOAST.build) {
 try {
  const cNx = 64, cNz = 64, cCell = (ADG_SR * 2) / cNx;
  const cData = new Uint8Array(cNx * cNz);
  for (let j = 0; j < cNz; j++) {
   const cz = -ADG_SR + (j + 0.5) * cCell;
   for (let i = 0; i < cNx; i++) {
    const cx = -ADG_SR + (i + 0.5) * cCell;
    cData[j * cNx + i] = ADG_SITE.macroGround(cx, cz) < 0.0 ? 255 : 0;
   }
  }
  ADG_COAST = KCOAST.build({
   id: 'kopa_north_coast',
   level: 0.0,
   seed: ADG_SITE.SEED,
   salt: 608,
   sourceCell: 2000,
   frame: { ox: ADG_SITE.WORLD_OX, oz: ADG_SITE.WORLD_OZ },
   mask: { x0: -ADG_SR, z0: -ADG_SR, cell: cCell, cellZ: cCell, nx: cNx, nz: cNz, data: cData },
   sample: {
    bare: ADG_SITE.macroGround,
    rock: function(){ return 0.86; },
    wet: function(){ return 0.78; },
    temp: function(){ return 24.0; },
    keep: function(x, z){ return 1.0 - ADG_SITE.townBandMask(x, z); }
   }
  });
 } catch (_e) {}
}

const ADG_STREAM_DIST = function(x, z){
 let best = 1e9;
 for (let i = 0; i < ADG_SITE.STREAMS.length; i++) {
  const pts = ADG_SITE.STREAMS[i].pts;
  for (let j = 0; j < pts.length - 1; j++) {
   const a = pts[j], b = pts[j + 1];
   const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz;
   const t = l2 > 1e-6 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2)) : 0;
   const d = Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z);
   if (d < best) best = d;
  }
 }
 return best;
};

BIO.INDEX_ITEMS = PQ.get('index') !== '0';
BIO.LOD.merge = PQ.get('lodmerge') !== '0';
BIO.LOD.minTris = 1500;
BIO.LOD.fade = (BIO.LOD.merge && PQ.get('lodfade') !== '0') ? 0.15 : 0;
BIO.LOD.cull = BIO.LOD.fade > 0 && PQ.get('lodcull') !== '0';

BIO.init({
 THREE: THREE,
 scene: scene,
 terrainH: terrainH,
 waterH: function(x, z){ return terrainH(x, z) < 0.35 ? ADG_STATE.seaOffsetM : -1e9; },
 mask: function(x, z){ return terrainH(x, z) < 0.35 ? 0 : ADG_SITE.townBandMask(x, z); },
 ticks: function(fn){ adgTick(function(nowMs, dt){ fn(dt == null ? 0.016 : dt, nowMs * 0.001); }); },
 origin: [0, 0],
 center: [0, 0],
 lod: { hero: 2200, mid: 2800, far: 3600, floor: [420, 1100] },
 eye: function(){ return [camera.position.x, camera.position.y, camera.position.z]; },
 seed: ADG_SITE.SEED,
 tags: 'arcodiga',
 err: reportErr,
 fields: {
  elevASL: function(x, z){ return Math.max(0, Math.min(1, terrainH(x, z) / 950)); },
  wet: function(x, z){ return Math.min(1, 0.72 + 0.28 * Math.max(0, 1 - ADG_STREAM_DIST(x, z) / 36.0)); },
  rock: function(x, z){ return terrainH(x, z) < 65.0 ? 0.92 : 0.45; },
  coast: function(x, z){
   if (!ADG_COAST || !KCOAST.fields) return terrainH(x, z) < 18.0 ? 0.8 : 0.0;
   const out = {};
   KCOAST.fields(ADG_COAST, x, z, out);
   return out.coast == null ? 0.0 : out.coast;
  },
  slope: function(x, z){
   const e = 2.5;
   return Math.hypot((terrainH(x + e, z) - terrainH(x - e, z)) / (2 * e), (terrainH(x, z + e) - terrainH(x, z - e)) / (2 * e));
  }
 }
});
BIO.setSun(SUN_POS);
BIO.host.crook = {
 station: 'shore',
 seaLevel: 0.0,
 drawdownAt: function(){ return ADG_STATE.drawdownM; },
 streamDistAt: ADG_STREAM_DIST
};
