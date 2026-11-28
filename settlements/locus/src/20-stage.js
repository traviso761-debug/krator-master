/* ============================== 4. STAGE ==============================
   Scene, renderer and lights (the load values: the shared sky sets the
   lights, the fog and the exposure each frame, 90s-host-sky.js). Ported from
   Voth's 20-stage.js; its baked dome went with W7 (2026-11-24).
   Interface kept for the rest of the build:
     scene camera renderer FAST sun hemiLight ambLight                     */
reseed(200001);

var FAST = !!(navigator.webdriver) || /[?&]fast/.test(location.search);

var scene = new THREE.Scene();
window.scene = scene;

var HAZE = new THREE.Color(PAL.haze);
scene.fog = new THREE.FogExp2(HAZE.getHex(), PAL.fogDensity);
/* no scene.background: the shared sky's pass is drawn first (90s-host-sky.js), and a colour background would clear it */

var camera = new THREE.PerspectiveCamera(52, innerWidth/innerHeight, 0.8, 45000);   /* far 45 km: the abyss wall's rim at 22-26 km (W7, 76f-locus-far.js); the depth's step is the near plane's */
var renderer = new THREE.WebGLRenderer({ antialias:!FAST, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio||1, FAST?1:1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
if(!FAST){ renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
document.body.appendChild(renderer.domElement);
window.renderer = renderer;

/* --- lights. Direction/colour/intensity are driven every frame from
       SKY_STATE (82-daynight.js + 80-camera.js); these are the load values. */
var SUNDIR  = new THREE.Vector3(0.45, 0.72, -0.52).normalize();
var MOONDIR = new THREE.Vector3(-0.52, 0.40, 0.75).normalize();
var sun = new THREE.DirectionalLight(PAL.sunColor, PAL.sunIntensity);
sun.position.copy(SUNDIR).multiplyScalar(1900);
if(!FAST){
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096,4096);
  var _sc = sun.shadow.camera;
  _sc.left=-900; _sc.right=900; _sc.top=900; _sc.bottom=-900; _sc.near=200; _sc.far=4200;
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.9;
}
scene.add(sun); scene.add(sun.target);
var hemiLight = new THREE.HemisphereLight(PAL.hemiSky, PAL.hemiGround, PAL.hemiIntensity);
scene.add(hemiLight);
var ambLight = new THREE.AmbientLight(PAL.ambient, PAL.ambientIntensity);
scene.add(ambLight);
/* The baked horizon dome, its eruption cycle and the sun and moon sprites went with W7 (2026-11-24; settlements/locus/PLAN-ONMAP.md):
   the shared sky draws the sky (90s-host-sky.js), the far land is the scale model's own ground (76f-locus-far.js, the site's ridges). */
