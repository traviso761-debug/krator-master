// ================================================================= HOST — renderer, scene, lights & vertical-stack BIO flags [web]
const { TAU, clamp, lerp, mix, smooth, reseed, rng, rr, ri, pick, fbm, qEuler, qFacing, qUp } = BIO.fn;

const ERRS = document.getElementById('errs');
function reportErr(m){
 ERRS.style.display = 'block';
 ERRS.textContent += m + '\n';
}
window.onerror = function(m, s, l, c, e){
 reportErr((e && e.stack) || (m + ' @' + l + ':' + c));
};
window.addEventListener('unhandledrejection', function(e){
 reportErr('promise: ' + ((e.reason && e.reason.stack) || e.reason));
});
{
 const _ce = console.error;
 console.error = function(){
  try {
   const m = String(arguments[0] || '');
   if (/shader error|WebGLProgram/.test(m)) {
    reportErr('shader: ' + (m.match(/ERROR:[^\n]*/)||[m.slice(0, 220)])[0]);
   }
  } catch (e) {}
  return _ce.apply(console, arguments);
 };
}

const PQ = new URLSearchParams(location.search);
{
 BIO.INDEX_ITEMS = PQ.get('index') !== '0';
 BIO.LOD.merge = PQ.get('lodmerge') !== '0';
 BIO.LOD.minTris = 1500;
 BIO.LOD.fade = (BIO.LOD.merge && PQ.get('lodfade') !== '0') ? 0.15 : 0;
 BIO.LOD.cull = BIO.LOD.fade > 0 && PQ.get('lodcull') !== '0';
}

const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio == null ? 1 : window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.4, 24000);
window.addEventListener('resize', function(){
 camera.aspect = window.innerWidth / window.innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize(window.innerWidth, window.innerHeight);
});

const HEMI_LIGHT = new THREE.HemisphereLight(0xd8e6ee, 0x443c34, 0.78);
scene.add(HEMI_LIGHT);
const SUN_POS = new THREE.Vector3(460, 820, -540);
const SUN_LIGHT = new THREE.DirectionalLight(0xfff1dc, 1.38);
SUN_LIGHT.position.copy(SUN_POS);
scene.add(SUN_LIGHT);
const FILL_LIGHT = new THREE.DirectionalLight(0xc8dce8, 0.22);
FILL_LIGHT.position.set(-560, 340, 580);
scene.add(FILL_LIGHT);

const TICKS = [];
function tick(fn){ TICKS.push(fn); }

const REG = [];
window._registered = 0;
function REGISTER(o){
 REG.push(o);
 window._registered = REG.length;
 BIO.record(o);
 if (typeof KTAGS !== 'undefined' && KTAGS.page && o.tagId) {
  try {
   KTAGS.page.add({
    id: o.tagId,
    name: o.name,
    class: o.tagClass || 'feature',
    at: [o.x, o.y == null ? 0 : o.y, o.z],
    r: o.r,
    h: o.h,
    tags: o.tags || {}
   });
  } catch (e) {}
 }
}
