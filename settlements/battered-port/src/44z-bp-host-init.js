// ================================================================= BATTERED PORT — renderer, scene, lights, terrainH & BIO.init [web]
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
  } catch (e) {}
  return _ce.apply(console, arguments);
 };
}

const PQ = new URLSearchParams(location.search);
const BP_STATE = {
 mode: 'Normal Port',
 seaOffsetM: 0.0,
 waveAmp: 1.0
};

const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio == null ? 1 : window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.4, 26000);
window.addEventListener('resize', function(){
 camera.aspect = window.innerWidth / window.innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize(window.innerWidth, window.innerHeight);
});

const HEMI_LIGHT = new THREE.HemisphereLight(0xd8e6ee, 0x433b33, 0.78);
scene.add(HEMI_LIGHT);
const SUN_POS = new THREE.Vector3(520, 860, -580);
const SUN_LIGHT = new THREE.DirectionalLight(0xfff1dc, 1.38);
SUN_LIGHT.position.copy(SUN_POS);
scene.add(SUN_LIGHT);
const FILL_LIGHT = new THREE.DirectionalLight(0xc8dce8, 0.22);
FILL_LIGHT.position.set(-540, 360, 560);
scene.add(FILL_LIGHT);

const TICKS = [];
function bpTick(fn){ TICKS.push(fn); }

if (typeof KWALK !== 'undefined' && KWALK.clear) KWALK.clear();

const BP_SR = 1120;
function terrainH(x, z){
 return BP_SITE.bareGround(x, z);
}
function groundNormal(x, z){
 const e = 1.5;
 const gx = (terrainH(x + e, z) - terrainH(x - e, z)) / (2 * e);
 const gz = (terrainH(x, z + e) - terrainH(x, z - e)) / (2 * e);
 const inv = 1 / Math.hypot(gx, 1, gz);
 return [-gx * inv, inv, -gz * inv];
}

/* Vertical-stack native biome configuration before BATTER species & BIO.kin load */
BIO.INDEX_ITEMS = PQ.get('index') !== '0';
BIO.LOD.merge = PQ.get('lodmerge') !== '0';
BIO.LOD.minTris = 1500;
BIO.LOD.fade = (BIO.LOD.merge && PQ.get('lodfade') !== '0') ? 0.15 : 0;
BIO.LOD.cull = BIO.LOD.fade > 0 && PQ.get('lodcull') !== '0';

const BP_SPRING_DIST = function(x, z){
 let best = 1e9;
 for (let i = 0; i < BP_SITE.SPRINGS.length; i++) {
  const pts = BP_SITE.SPRINGS[i].pts;
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

BIO.init({
 THREE: THREE,
 scene: scene,
 terrainH: terrainH,
 waterH: function(x, z){ return terrainH(x, z) < 0.35 ? BP_STATE.seaOffsetM : -1e9; },
 mask: function(x, z){ return terrainH(x, z) < 0.25 ? 0 : BP_SITE.townBandMask(x, z); },
 ticks: function(fn){ bpTick(function(nowMs, dt){ fn(dt == null ? 0.016 : dt, nowMs * 0.001); }); },
 origin: [0, 0],
 center: [0, 0],
 lod: { hero: 240, mid: 620, far: 2200, floor: [220, 520] },
 eye: function(){ return [camera.position.x, camera.position.y, camera.position.z]; },
 seed: BP_SITE.SEED,
 tags: 'battered-port',
 err: reportErr,
 fields: {
  elevASL: function(x, z){ return Math.max(0, Math.min(1, terrainH(x, z) / 900)); },
  dike: function(x, z){ return BP_SITE.dikeLiftAt(x, z).rib01; },
  scoria: function(x, z){ return terrainH(x, z) > 45 ? 0.78 : 0.25; },
  palagonite: function(x, z){ const y = terrainH(x, z); return (y > -2 && y < 65) ? 0.72 : 0.1; },
  shingle: function(x, z){ const y = terrainH(x, z); return (y >= -1 && y <= 6) ? 0.8 : 0.0; },
  coal: function(){ return 0.0; },
  garnierite: function(x, z){ return BP_SITE.dikeLiftAt(x, z).rib01 * 0.55; },
  spring: function(x, z){ return Math.max(0, 1 - BP_SPRING_DIST(x, z) / 22.0); },
  wet: function(x, z){ return Math.min(1, 0.64 + 0.36 * Math.max(0, 1 - BP_SPRING_DIST(x, z) / 26.0)); },
  rock: function(x, z){ return BP_SITE.dikeLiftAt(x, z).rib01; },
  slope: function(x, z){
   const e = 2.0;
   return Math.hypot((terrainH(x + e, z) - terrainH(x - e, z)) / (2 * e), (terrainH(x, z + e) - terrainH(x, z - e)) / (2 * e));
  }
 }
});
BIO.setSun(SUN_POS);
BIO.host.batteredisle = {
 station: 'cove',
 seaLevel: 0.0,
 elevOffset: 0.0,
 exposedWNW: false,
 lithology: 'ultramafic',
 springDistAt: BP_SPRING_DIST,
 dikeInfoAt: function(x, z){
  const r = BP_SITE.dikeLiftAt(x, z).rib01;
  return { distM: r > 0.25 ? 4.0 : 40.0, rib01: r };
 },
 streamDistAt: BP_SPRING_DIST
};

