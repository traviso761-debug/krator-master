// ================================================================= HOST — renderer, light, KTAGS & BIO.init  [web]
const ERRS = document.getElementById('errs');
function reportErr(m) {
  ERRS.style.display = 'block';
  ERRS.textContent += m + '\n';
}
window.onerror = function (m, s, l, c, e) { reportErr((e && e.stack) || (m + ' @' + l + ':' + c)); };
window.addEventListener('unhandledrejection', function (e) { reportErr('promise: ' + ((e.reason && e.reason.stack) || e.reason)); });
{
  const _ce = console.error;
  console.error = function () {
    const a = Array.prototype.slice.call(arguments);
    try {
      const m = a.map(String).join(' ');
      if (/shader error|WebGLProgram/.test(m)) {
        reportErr('shader: ' + ((m.match(/ERROR:[^\n]*/g) || [m.slice(0, 200)]).slice(0, 4).join(' | ')));
      }
    } catch (e) { /* ignore */ }
    _ce.apply(console, a);
  };
}
const TICKS = [];
function tick(fn) { TICKS.push(fn); }
let TAGS = null;
const REG = [];
function REGISTER(o) { REG.push(o); BIO.record(o); }

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.04;
renderer.localClippingEnabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xbcc8cf, 0.00011);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.5, 16000);
const hemi = new THREE.HemisphereLight(0xc8d8e6, 0x56544a, 0.72);
scene.add(hemi);
const SUN_POS = [-840, 980, 720];
const sun = new THREE.DirectionalLight(0xfff0d8, 1.48);
sun.position.set(SUN_POS[0], SUN_POS[1], SUN_POS[2]);
scene.add(sun);

const terrainH = AV.groundH;
const waterH = AV.waterH;

BIO.init({
  tags: 'cascade',
  THREE: THREE,
  scene: scene,
  terrainH: terrainH,
  waterH: waterH,
  mask: function () { return 1; },
  obstacles: [],
  ticks: tick,
  seed: 19690,
  origin: [[0, 0]],
  center: [0, 0],
  fields: {},
  register: REGISTER,
  err: reportErr,
  lod: { hero: 420, mid: 1200, far: 3600, floor: [220, 520] },
  windows: {}
});
BIO.setSun(SUN_POS);
BIO.LOD.fade = 0.15;
