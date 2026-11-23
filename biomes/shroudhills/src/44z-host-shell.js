// ================================================================= HOST — page shell (every Shroudhills station) [web]
// Error panel (#errs), frame ticks, registry hook into BIO.record / KTAGS, WebGLRenderer, scene, camera and lights.
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
    reportErr('shader: ' + (m.match(/ERROR:[^\n]*/) || [m.slice(0, 200)])[0]);
   }
  } catch (e) {}
  return _ce.apply(console, arguments);
 };
}

window._t = { t0: performance.now() };
const _mark = function(k){
 window._t[k] = Math.round(performance.now() - window._t.t0);
};
const TICKS = [];
function tick(fn){ TICKS.push(fn); }
const REG = [];
function REGISTER(o){
 REG.push(o);
 BIO.record(o);
}
const { TAU, clamp, lerp, mix, smooth, fbm } = BIO.fn;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xb6c8c2, 0.00038);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.5, 18000);
const HEMI = new THREE.HemisphereLight(0xc8dad4, 0x384634, 0.68);
scene.add(HEMI);
const SUN_POS = [-950, 860, -780];
const sun = new THREE.DirectionalLight(0xfff2dc, 1.32);
sun.position.set(SUN_POS[0], SUN_POS[1], SUN_POS[2]);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xb2cac4, 0.34);
fill.position.set(780, 420, 820);
scene.add(fill);
