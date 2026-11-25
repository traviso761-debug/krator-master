// ================================================================= FLOATING CITY — Renderer, Scene, Lights, terrainH & BIO.init [web]
const ERRS = document.getElementById('errs');
function reportErr(m) {
  if (ERRS) {
    ERRS.style.display = 'block';
    ERRS.textContent += m + '\n';
  }
}
window.addEventListener('error', function (e) {
  reportErr((e.error && e.error.stack) || (e.message + ' @' + e.filename + ':' + e.lineno));
});
window.addEventListener('unhandledrejection', function (e) {
  reportErr('promise: ' + ((e.reason && e.reason.stack) || e.reason));
});
{
  const _ce = console.error;
  console.error = function () {
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
const FC_STATE = {
  tideMode: 'slack',
  cutSubmarine: false
};
FC_TIDE.setMode('slack');

const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio == null ? 1 : window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.localClippingEnabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 28000);
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const HEMI_LIGHT = new THREE.HemisphereLight(0xdceaf2, 0x443d34, 0.78);
scene.add(HEMI_LIGHT);
const SUN_POS = new THREE.Vector3(560, 920, -620);
const SUN_LIGHT = new THREE.DirectionalLight(0xfff2dd, 1.38);
SUN_LIGHT.position.copy(SUN_POS);
scene.add(SUN_LIGHT);
const FILL_LIGHT = new THREE.DirectionalLight(0xc6dde8, 0.24);
FILL_LIGHT.position.set(-540, 380, 580);
scene.add(FILL_LIGHT);

const TICKS = [];
function fcTick(fn) { TICKS.push(fn); }

if (typeof KWALK !== 'undefined' && KWALK.clear) KWALK.clear();

function terrainH(x, z) {
  return FC_SITE.elevAt(x, z);
}

/* Ecotone & estuarine chemistry bindings read by biomes/doubledelta (read in place) */
const MIN_WOODY_Y = FC_SITE.WOODY_TRIM_Y;
const PSU_AT = function (x, z) { return FC_SITE.ecotoneAt(x, z).psu; };
const SILICA_AT = function () { return 16.8; };
const ECOTONE_AT = function (x, z) {
  const e = FC_SITE.ecotoneAt(x, z);
  const y = e.elevM;
  const outsideWeir = Math.hypot(x - FC_SITE.WEIR_CX, z - FC_SITE.WEIR_CZ) > FC_SITE.WEIR_R + 36.0;
  return {
    elevM: y,
    woodyOk: e.woodyOk && outsideWeir,
    spongeOk: outsideWeir && y >= -5.5 && y < 12.0,
    bivalveOk: outsideWeir && y >= -4.5 && y < 8.0,
    reedOk: outsideWeir && y >= -1.2 && y < 18.0,
    seapenOk: outsideWeir && y >= -8.0 && y < 2.0,
    peatOk: outsideWeir && y >= 0.2 && y < 14.0,
    scourOk: outsideWeir && y >= -2.0 && y < 16.0
  };
};

const SKEY = 'throat';
function REGISTER(o) { BIO.record(o); }

const SITE = {
  id: 'ria-sound-capital',
  biohermMounds: [
    { x: -920, z: -420, r: 110 },
    { x: 960,  z: -360, r: 110 }
  ],
  settlementReserve: { x: 260, z: -1020, r: 520 }
};

const L = {
  BLUFF: function (x, z) { return terrainH(x, z) >= FC_SITE.WOODY_TRIM_Y ? 1.0 : 0.0; },
  LAG: function (x, z) { const y = terrainH(x, z); return (y > -3 && y < 14) ? 0.45 : 0.0; },
  PEAT: function (x, z) { const y = terrainH(x, z); return (y > 0.5 && y < 12) ? 0.35 : 0.0; },
  WRACK: function (x, z) { const y = terrainH(x, z); return (y > 1.0 && y < 16) ? 0.40 : 0.0; },
  AMBER: function (x, z) { const y = terrainH(x, z); return (y > -1.5 && y < 14) ? 0.52 : 0.0; },
  BITUMEN: function () { return 0.06; },
  BLUECLAY: function (x, z) { const y = terrainH(x, z); return (y > -2 && y < 12) ? 0.35 : 0.0; },
  MIRE: function () { return 0.05; }
};

function fcFloraMask(x, z) {
  const rWeir = Math.hypot(x - FC_SITE.WEIR_CX, z - FC_SITE.WEIR_CZ);
  if (rWeir < FC_SITE.WEIR_R + 55.0) return 0;
  const y = terrainH(x, z);
  if (y < -6.5) return 0;
  /* Keep the D6 Citadel core, D5 Slipway Ghat & Waterfall Plunge-Harbour clear of wild trunks */
  if (x > 80 && x < 920 && z > -1360 && z < -680) return 0;
  return 1;
}

BIO.INDEX_ITEMS = PQ.get('index') !== '0';
BIO.LOD.merge = PQ.get('lodmerge') !== '0';
BIO.LOD.minTris = 1500;
BIO.LOD.fade = (BIO.LOD.merge && PQ.get('lodfade') !== '0') ? 0.15 : 0;
BIO.LOD.cull = BIO.LOD.fade > 0 && PQ.get('lodcull') !== '0';

BIO.init({
  THREE: THREE,
  scene: scene,
  terrainH: terrainH,
  waterH: function (x, z) {
    const r = Math.hypot(x - FC_SITE.WEIR_CX, z - FC_SITE.WEIR_CZ);
    return terrainH(x, z) < 2.5 ? FC_TIDE.tideY(r < FC_SITE.WEIR_R ? 'lagoon' : 'sound', 0) : -1e9;
  },
  mask: fcFloraMask,
  ticks: function (fn) { fcTick(function (nowMs, dt) { fn(dt == null ? 0.016 : dt, nowMs * 0.001); }); },
  origin: [0, 0],
  center: [0, -320],
  lod: { hero: 260, mid: 680, far: 2400, floor: [220, 540] },
  eye: function () { return [camera.position.x, camera.position.y, camera.position.z]; },
  seed: FC_SITE.SEED,
  tags: 'floating-city',
  err: reportErr,
  fields: {
    elevASL: function (x, z) { return Math.max(0, Math.min(1, terrainH(x, z) / 220)); },
    wet: function (x, z) { return terrainH(x, z) < 18 ? 0.85 : 0.48; },
    slope: function (x, z) {
      const e = 2.0;
      return Math.hypot((terrainH(x + e, z) - terrainH(x - e, z)) / (2 * e), (terrainH(x, z + e) - terrainH(x, z - e)) / (2 * e));
    }
  }
});
BIO.setSun(SUN_POS);
const lerp = BIO.fn.lerp;
